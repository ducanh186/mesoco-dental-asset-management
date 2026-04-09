<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Models\Employee;
use App\Models\Role;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * UserController
 * 
 * Handles user account management.
 * 
 * RBAC:
 * - Manager: Full access (list, create, update role, delete)
 * - Technician: List, create, view only (cannot change roles or delete)
 * 
 * Features:
 * - List users with filtering by employee_code/name/role
 * - Create user account from existing employee
 * - Update user role (Admin only)
 * - Delete user account (Admin only)
 * 
 * Authorization enforced via:
 * 1. Route middleware: role:manager (for role changes, delete)
 * 2. Route middleware: role:manager,technician (for list, create, view)
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
        $query = User::with([
            'employee:id,employee_code,full_name,email',
            'supplier:id,code,name,contact_person,email',
            'roleDefinition:id,code,name',
        ]);

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
                'role_name' => $user->roleDefinition?->name ?? User::roleLabel($user->role),
                'status' => $user->status,
                'profile_type' => $user->isSupplier() ? 'supplier' : 'employee',
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'full_name' => $user->employee->full_name,
                    'email' => $user->employee->email,
                ] : null,
                'supplier' => $user->supplier ? [
                    'id' => $user->supplier->id,
                    'code' => $user->supplier->code,
                    'name' => $user->supplier->name,
                    'contact_person' => $user->supplier->contact_person,
                    'email' => $user->supplier->email,
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
            'available_roles' => Role::query()
                ->where('is_active', true)
                ->whereIn('code', User::ROLES)
                ->orderBy('id')
                ->pluck('code'),
            'available_role_records' => Role::query()
                ->where('is_active', true)
                ->whereIn('code', User::ROLES)
                ->orderBy('id')
                ->get(['code', 'name']),
        ]);
    }

    /**
     * POST /api/users
     * Create a new user account from an existing employee.
     * 
     * RBAC:
     * - Admin: Can set any role during creation
     * - HR: Creates user with role='employee' (cannot set role)
     *       Admin must assign proper role later via PATCH /users/{id}/role
     * 
     * After creation, user can login with employee_code + default_password.
     * must_change_password is set to true.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $role = User::normalizeRole($validated['role']);

        if ($role === User::ROLE_SUPPLIER) {
            $supplier = Supplier::findOrFail($validated['supplier_id']);
            $user = User::create([
                'supplier_id' => $supplier->id,
                'employee_code' => $this->resolveSupplierEmployeeCode($supplier),
                'name' => $supplier->name,
                'email' => $this->resolveSupplierEmail($supplier),
                'role' => $role,
                'password' => Hash::make($validated['default_password']),
                'must_change_password' => true,
                'status' => 'active',
            ]);
        } else {
            $employee = Employee::findOrFail($validated['employee_id']);

            $user = User::create([
                'employee_id' => $employee->id,
                'employee_code' => $employee->employee_code,
                'name' => $employee->full_name,
                'email' => $employee->email,
                'role' => $role,
                'password' => Hash::make($validated['default_password']),
                'must_change_password' => true,
                'status' => 'active',
            ]);
        }

        $user->loadMissing(['employee:id,employee_code,full_name,email', 'supplier:id,code,name,contact_person,email', 'roleDefinition:id,code,name']);

        return response()->json([
            'message' => 'User account created successfully. User must change password on first login.',
            'user' => $this->transformUser($user),
        ], 201);
    }

    /**
     * GET /api/users/{user}
     * Show a specific user.
     */
    public function show(User $user): JsonResponse
    {
        $user->loadMissing([
            'employee:id,employee_code,full_name,email',
            'supplier:id,code,name,contact_person,email,address,note',
            'roleDefinition:id,code,name',
        ]);

        return response()->json([
            'user' => $this->transformUser($user),
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
        // Prevent managers from changing their own role
        if ($request->user()->id === $user->id && $request->role !== $user->role) {
            return response()->json([
                'message' => 'You cannot change your own role.',
            ], 422);
        }

        $newRole = User::normalizeRole($request->role);

        if ($newRole === User::ROLE_SUPPLIER && !$user->supplier_id) {
            return response()->json([
                'message' => 'This account is not linked to a supplier record.',
            ], 422);
        }

        if ($newRole !== User::ROLE_SUPPLIER && !$user->employee_id) {
            return response()->json([
                'message' => 'Supplier accounts cannot be converted into employee roles without linking an employee record.',
            ], 422);
        }

        $oldRole = $user->role;
        $user->update(['role' => $newRole]);
        $user->loadMissing(['employee:id,employee_code,full_name,email', 'supplier:id,code,name,contact_person,email', 'roleDefinition:id,code,name']);

        return response()->json([
            'message' => "User role updated from '{$oldRole}' to '{$request->role}'.",
            'user' => $this->transformUser($user),
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
            'roles' => Role::query()
                ->where('is_active', true)
                ->whereIn('code', User::ROLES)
                ->orderBy('id')
                ->pluck('code'),
            'role_records' => Role::query()
                ->where('is_active', true)
                ->whereIn('code', User::ROLES)
                ->orderBy('id')
                ->get(['code', 'name']),
        ]);
    }

    private function transformUser(User $user): array
    {
        return [
            'id' => $user->id,
            'employee_code' => $user->employee_code,
            'name' => $user->name,
            'role' => $user->role,
            'role_name' => $user->roleDefinition?->name ?? User::roleLabel($user->role),
            'status' => $user->status,
            'profile_type' => $user->isSupplier() ? 'supplier' : 'employee',
            'employee' => $user->employee ? [
                'id' => $user->employee->id,
                'employee_code' => $user->employee->employee_code,
                'full_name' => $user->employee->full_name,
                'email' => $user->employee->email,
            ] : null,
            'supplier' => $user->supplier ? [
                'id' => $user->supplier->id,
                'code' => $user->supplier->code,
                'name' => $user->supplier->name,
                'contact_person' => $user->supplier->contact_person,
                'email' => $user->supplier->email,
                'address' => $user->supplier->address,
                'note' => $user->supplier->note,
            ] : null,
        ];
    }

    private function resolveSupplierEmployeeCode(Supplier $supplier): string
    {
        $baseCode = trim((string) ($supplier->code ?: 'NCC-' . str_pad((string) $supplier->id, 3, '0', STR_PAD_LEFT)));
        $candidate = $baseCode;
        $suffix = 1;

        while (User::query()->where('employee_code', $candidate)->exists()) {
            $candidate = $baseCode . '-' . str_pad((string) $suffix, 2, '0', STR_PAD_LEFT);
            $suffix++;
        }

        return $candidate;
    }

    private function resolveSupplierEmail(Supplier $supplier): string
    {
        $baseEmail = $supplier->email ?: "supplier-{$supplier->id}@mesoco.local";
        $candidate = $baseEmail;
        $suffix = 1;

        while (User::query()->where('email', $candidate)->exists()) {
            $candidate = "supplier-{$supplier->id}-{$suffix}@mesoco.local";
            $suffix++;
        }

        return $candidate;
    }
}
