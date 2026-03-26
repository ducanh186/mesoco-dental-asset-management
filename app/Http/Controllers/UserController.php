<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * UserController
 * 
 * Handles user account management (Roles & Permission screen - Admin/HR only).
 * 
 * Features:
 * - List users with filtering by employee_code/name/role
 * - Create user account from existing employee
 * - Update user role (only role is editable)
 * - Delete user account
 * 
 * Authorization enforced via:
 * 1. Route middleware: role:admin,hr
 * 2. Form Request authorize() methods
 * 3. Policy checks
 */
class UserController extends Controller
{
    /**
     * GET /api/users
     * List all users with optional filtering.
     * 
     * Query params:
     * - search: filter by employee_code or name
     * - role: filter by role
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with('employee:id,employee_code,full_name,email');

        // Search by employee_code or name
        if ($search = $request->query('search')) {
            $query->search($search);
        }

        // Filter by role
        if ($role = $request->query('role')) {
            $query->byRole($role);
        }

        $users = $query->orderBy('employee_code')->paginate(
            $request->query('per_page', 15)
        );

        // Transform for the table columns: employee_code, name, role
        $items = collect($users->items())->map(function ($user) {
            return [
                'id' => $user->id,
                'employee_code' => $user->employee_code,
                'name' => $user->name,
                'role' => $user->role,
                'status' => $user->status,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'full_name' => $user->employee->full_name,
                    'email' => $user->employee->email,
                ] : null,
            ];
        });

        return response()->json([
            'users' => $items,
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
            'available_roles' => User::ROLES,
        ]);
    }

    /**
     * POST /api/users
     * Create a new user account from an existing employee.
     * 
     * After creation, user can login with employee_code + default_password.
     * must_change_password is set to true.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $employee = Employee::findOrFail($request->employee_id);

        $user = User::create([
            'employee_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'name' => $employee->full_name,
            'email' => $employee->email,
            'role' => $request->role,
            'password' => Hash::make($request->default_password),
            'must_change_password' => true,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'User account created successfully. User must change password on first login.',
            'user' => [
                'id' => $user->id,
                'employee_code' => $user->employee_code,
                'name' => $user->name,
                'role' => $user->role,
            ],
        ], 201);
    }

    /**
     * GET /api/users/{user}
     * Show a specific user.
     */
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'user' => [
                'id' => $user->id,
                'employee_code' => $user->employee_code,
                'name' => $user->name,
                'role' => $user->role,
                'status' => $user->status,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'full_name' => $user->employee->full_name,
                    'email' => $user->employee->email,
                ] : null,
            ],
        ]);
    }

    /**
     * PATCH /api/users/{user}/role
     * Update only the user's role.
     * 
     * employee_code and name are read-only (returns 422 if sent).
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        // Prevent admin from demoting themselves
        if ($request->user()->id === $user->id && $request->role !== $user->role) {
            return response()->json([
                'message' => 'You cannot change your own role.',
            ], 422);
        }

        $oldRole = $user->role;
        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => "User role updated from '{$oldRole}' to '{$request->role}'.",
            'user' => [
                'id' => $user->id,
                'employee_code' => $user->employee_code,
                'name' => $user->name,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * DELETE /api/users/{user}
     * Delete a user account.
     * 
     * Cannot delete yourself.
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Cannot delete yourself
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $employeeCode = $user->employee_code;
        $user->delete();

        return response()->json([
            'message' => "User account for {$employeeCode} deleted successfully.",
        ]);
    }

    /**
     * GET /api/roles
     * Get available roles for dropdowns.
     */
    public function roles(): JsonResponse
    {
        return response()->json([
            'roles' => User::ROLES,
        ]);
    }
}
