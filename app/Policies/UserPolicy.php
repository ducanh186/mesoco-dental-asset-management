<?php

namespace App\Policies;

use App\Models\User;

/**
 * UserPolicy
 * 
 * Controls access to user account management (legacy backoffice module).
 * - Quản lý: full account management
 * - Kỹ thuật viên: list/create/view accounts, cannot change roles or delete
 */
class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasOperationalAccess();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        if ($user->hasOperationalAccess()) {
            return true;
        }
        
        // Users can view their own record
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can create users.
     * Operational roles can create user accounts.
     */
    public function create(User $user): bool
    {
        return $user->hasOperationalAccess();
    }

    /**
     * Determine whether the user can update the model.
     * Only quản lý can update user roles.
     */
    public function update(User $user, User $model): bool
    {
        return $user->canManageUsers();
    }

    /**
     * Determine whether the user can delete the model.
     * Only quản lý can delete user accounts.
     */
    public function delete(User $user, User $model): bool
    {
        if (!$user->canManageUsers()) {
            return false;
        }
        
        // Cannot delete yourself
        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can update their own profile.
     */
    public function updateProfile(User $user): bool
    {
        // All authenticated users can update their own profile
        return true;
    }
}
