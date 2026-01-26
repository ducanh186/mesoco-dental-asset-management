<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * AssetPolicy
 * 
 * RBAC rules:
 * - Admin/HR: full CRUD + assign/unassign
 * - Non-admin: can view only their assigned assets
 */
class AssetPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any assets.
     * Admin/HR can list all; others can only see their own assigned assets.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can call the endpoint,
        // but controller will filter based on role
        return true;
    }

    /**
     * Determine whether the user can view the asset.
     * Admin/HR can view any; others only if assigned to them.
     */
    public function view(User $user, Asset $asset): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        // Non-admin can view only if asset is assigned to their employee record
        $employee = $user->employee;
        if (!$employee) {
            return false;
        }

        return $asset->currentAssignment?->employee_id === $employee->id;
    }

    /**
     * Determine whether the user can create assets.
     * Admin/HR only.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the asset.
     * Admin/HR only.
     */
    public function update(User $user, Asset $asset): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the asset.
     * Admin/HR only.
     */
    public function delete(User $user, Asset $asset): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can assign/unassign the asset.
     * Admin/HR only.
     */
    public function assign(User $user, Asset $asset): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can resolve QR codes.
     * All authenticated users can resolve QR codes.
     */
    public function resolveQr(User $user): bool
    {
        return true;
    }
}
