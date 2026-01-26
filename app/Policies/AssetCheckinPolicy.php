<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\AssetCheckin;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Policy for AssetCheckin actions.
 * 
 * Phase 4: Asset check-in/out authorization rules.
 */
class AssetCheckinPolicy
{
    /**
     * Determine whether the user can view any check-ins.
     * Admin/HR can view all; others can only view their own.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view (filtered in controller)
    }

    /**
     * Determine whether the user can view a specific check-in.
     */
    public function view(User $user, AssetCheckin $checkin): bool
    {
        // Admin/HR can view all
        if (in_array($user->role, ['admin', 'hr'])) {
            return true;
        }

        // Users can view their own check-ins
        return $checkin->employee_id === $user->employee_id;
    }

    /**
     * Determine whether the user can check-in an asset.
     * 
     * Rules:
     * - Asset must not be off_service
     * - User must be the current assignee OR admin/hr
     */
    public function checkIn(User $user, Asset $asset): Response
    {
        // Block off_service assets
        if ($asset->status === 'off_service') {
            return Response::deny('Cannot check in an asset that is off service.', 'ASSET_OFF_SERVICE');
        }

        // Admin/HR can check in any asset
        if (in_array($user->role, ['admin', 'hr'])) {
            return Response::allow();
        }

        // Get current assignment
        $currentAssignment = $asset->currentAssignment;

        if (!$currentAssignment) {
            return Response::deny('Asset is not currently assigned to anyone.', 'ASSET_NOT_ASSIGNED');
        }

        // User must be the current assignee
        if ($currentAssignment->employee_id !== $user->employee_id) {
            return Response::deny('You are not the current assignee of this asset.', 'NOT_ASSIGNEE');
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can check-out an asset.
     * Same rules as check-in.
     */
    public function checkOut(User $user, AssetCheckin $checkin): Response
    {
        // Check if already checked out
        if ($checkin->checked_out_at !== null) {
            return Response::deny('This check-in has already been checked out.', 'ALREADY_CHECKED_OUT');
        }

        // Admin/HR can check out any
        if (in_array($user->role, ['admin', 'hr'])) {
            return Response::allow();
        }

        // Only the person who checked in can check out
        if ($checkin->employee_id !== $user->employee_id) {
            return Response::deny('You can only check out assets you checked in.', 'NOT_OWNER');
        }

        return Response::allow();
    }
}
