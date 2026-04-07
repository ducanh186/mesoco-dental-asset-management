<?php

namespace App\Policies;

use App\Models\AssetRequest;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * AssetRequestPolicy
 * 
 * Authorization rules for AssetRequest model:
 * - Requester: can view/cancel own requests
 * - Quản lý: can approve/reject SUBMITTED requests
 * - Quản lý/Kỹ thuật viên: can view all requests for operational follow-up
 */
class AssetRequestPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any requests.
     * All authenticated users can view requests (filtered by ownership for staff).
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the request.
     * Operational roles can view any; others only their own.
     */
    public function view(User $user, AssetRequest $assetRequest): bool
    {
        if ($user->hasOperationalAccess()) {
            return true;
        }

        return $this->isRequester($user, $assetRequest);
    }

    /**
     * Determine whether the user can create requests.
     * All authenticated users with an employee record can create requests.
     */
    public function create(User $user): bool
    {
        // Must have an employee record to create requests
        return $user->employee !== null;
    }

    /**
     * Determine whether the user can update the request.
     * Only requester can update, and only when in non-final status.
     * (For MVP without DRAFT, updates are not allowed after creation)
     */
    public function update(User $user, AssetRequest $assetRequest): bool
    {
        // Cannot update if in final status
        if ($assetRequest->isFinal()) {
            return false;
        }

        // Only requester can update
        return $this->isRequester($user, $assetRequest);
    }

    /**
     * Determine whether the user can delete the request.
     * Requests cannot be deleted (soft delete via cancel instead).
     */
    public function delete(User $user, AssetRequest $assetRequest): bool
    {
        return false;
    }

    /**
     * Determine whether the user can cancel the request.
     * Only requester can cancel, and only when SUBMITTED.
     */
    public function cancel(User $user, AssetRequest $assetRequest): bool
    {
        if (!$assetRequest->canBeCancelled()) {
            return false;
        }

        return $this->isRequester($user, $assetRequest);
    }

    /**
     * Determine whether the user can review (approve/reject) the request.
     * Only quản lý can review, and only when SUBMITTED.
     */
    public function review(User $user, AssetRequest $assetRequest): bool
    {
        if (!$assetRequest->canBeReviewed()) {
            return false;
        }

        return $user->canReviewRequests();
    }

    /**
     * Determine whether the user can view the review queue.
     * Manager only.
     */
    public function viewReviewQueue(User $user): bool
    {
        return $user->canReviewRequests();
    }

    /**
     * Check if the user is the requester of this request.
     */
    private function isRequester(User $user, AssetRequest $assetRequest): bool
    {
        $employee = $user->employee;
        if (!$employee) {
            return false;
        }

        return $assetRequest->requested_by_employee_id === $employee->id;
    }
}
