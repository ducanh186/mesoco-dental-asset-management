<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * EmployeeController
 * 
 * Handles employee management (Admin/HR only).
 * Employee Tab: General Info/HR data.
 * 
 * Authorization enforced via:
 * 1. Route middleware: role:admin,hr
 * 2. Form Request authorize() methods
 * 3. Policy checks
 */
class EmployeeController extends Controller
{
    /**
     * GET /api/employees
     * List all employees with optional filtering.
     * 
     * Query params:
     * - search: filter by employee_code or full_name
     * - status: filter by status (active/inactive)
     * - has_user: filter by whether employee has user account (true/false)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::query();

        // Search by employee_code or name
        if ($search = $request->query('search')) {
            $query->search($search);
        }

        // Filter by status
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Filter by user account existence
        if ($request->has('has_user')) {
            $hasUser = filter_var($request->query('has_user'), FILTER_VALIDATE_BOOLEAN);
            if ($hasUser) {
                $query->whereHas('user');
            } else {
                $query->withoutUserAccount();
            }
        }

        $employees = $query->orderBy('employee_code')->paginate(
            $request->query('per_page', 15)
        );

        return response()->json([
            'employees' => $employees->items(),
            'pagination' => [
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
            ],
        ]);
    }

    /**
     * POST /api/employees
     * Create a new employee.
     */
    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $employee = Employee::create($request->validated());

        return response()->json([
            'message' => 'Employee created successfully.',
            'employee' => $employee,
        ], 201);
    }

    /**
     * GET /api/employees/{employee}
     * Show a specific employee.
     */
    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'employee' => $employee->load('user:id,employee_id,role,status'),
        ]);
    }

    /**
     * PUT /api/employees/{employee}
     * Update an employee.
     */
    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $employee->update($request->validated());
        $employee->refresh();

        return response()->json([
            'message' => 'Employee updated successfully.',
            'employee' => $employee,
        ]);
    }

    /**
     * DELETE /api/employees/{employee}
     * Delete an employee.
     * Note: This will cascade delete the linked user account due to FK constraint.
     */
    public function destroy(Employee $employee): JsonResponse
    {
        // Check if employee has an active user account
        if ($employee->hasUserAccount()) {
            return response()->json([
                'message' => 'Cannot delete employee with an active user account. Delete the user account first.',
            ], 422);
        }

        $employee->delete();

        return response()->json([
            'message' => 'Employee deleted successfully.',
        ]);
    }

    /**
     * GET /api/employees/available
     * Get employees without user accounts (for dropdown in Add Employee popup).
     */
    public function available(Request $request): JsonResponse
    {
        $employees = Employee::active()
            ->withoutUserAccount()
            ->search($request->query('search'))
            ->orderBy('full_name')
            ->get(['id', 'employee_code', 'full_name', 'email']);

        return response()->json([
            'employees' => $employees,
        ]);
    }
}
