<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

/**
 * EmployeePolicy
 * 
 * Controls access to employee management operations (legacy backoffice module).
 * Quản lý/Kỹ thuật viên retain access for compatibility.
 */
class EmployeePolicy
{
    /**
     * Determine whether the user can view any employees.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasOperationalAccess();
    }

    /**
     * Determine whether the user can view the employee.
     * Operational roles can view any employee.
     */
    public function view(User $user, Employee $employee): bool
    {
        if ($user->hasOperationalAccess()) {
            return true;
        }
        
        // Users can view their own employee record
        return $user->employee_id === $employee->id;
    }

    /**
     * Determine whether the user can create employees.
     */
    public function create(User $user): bool
    {
        return $user->hasOperationalAccess();
    }

    /**
     * Determine whether the user can update the employee.
     */
    public function update(User $user, Employee $employee): bool
    {
        return $user->hasOperationalAccess();
    }

    /**
     * Determine whether the user can delete the employee.
     */
    public function delete(User $user, Employee $employee): bool
    {
        return $user->hasOperationalAccess();
    }
}
