<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

/**
 * EmployeePolicy
 * 
 * Controls access to employee management operations.
 * Only admin/HR roles can manage employees.
 */
class EmployeePolicy
{
    /**
     * Determine whether the user can view any employees.
     * Admin/HR can view employee list.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the employee.
     * Admin/HR can view any employee.
     * Other users can only view their own employee record.
     */
    public function view(User $user, Employee $employee): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        
        // Users can view their own employee record
        return $user->employee_id === $employee->id;
    }

    /**
     * Determine whether the user can create employees.
     * Only admin/HR can create.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the employee.
     * Admin/HR can update any employee.
     */
    public function update(User $user, Employee $employee): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the employee.
     * Only admin/HR can delete.
     */
    public function delete(User $user, Employee $employee): bool
    {
        return $user->isAdmin();
    }
}
