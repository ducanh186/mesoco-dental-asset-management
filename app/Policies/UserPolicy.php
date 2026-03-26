<?php

namespace App\Policies;

use App\Models\User;

/**
 * UserPolicy
 * 
 * Controls access to user account management (Roles & Permission screen).
 * Only admin/HR roles can manage user accounts.
 */
class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     * Admin/HR can view user list (Roles & Permission).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        if ($user->isAdmin()) {
            return true;
        }
        
        // Users can view their own record
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can create users.
     * Only admin/HR can create user accounts.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     * Admin/HR can update any user's role.
     * Note: Only role is editable, not employee_code or name.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     * Admin/HR can delete user accounts.
     * Cannot delete self.
     */
    public function delete(User $user, User $model): bool
    {
        if (!$user->isAdmin()) {
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
