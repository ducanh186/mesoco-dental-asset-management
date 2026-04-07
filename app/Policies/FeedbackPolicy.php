<?php

namespace App\Policies;

use App\Models\Feedback;
use App\Models\User;

/**
 * FeedbackPolicy - RBAC for Feedback module (Phase 8)
 * 
 * Rules:
 * - All authenticated users can create feedback
 * - Users can view their own feedback
 * - Quản lý/Kỹ thuật viên can view all feedback
 * - Quản lý/Kỹ thuật viên can manage (update status, respond) feedback
 * - Only quản lý can delete feedback
 */
class FeedbackPolicy
{
    /**
     * All authenticated users can view list (filtered by role in controller)
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * View single feedback
     * - Owner can view their own
     * - Quản lý/Kỹ thuật viên can view any
     */
    public function view(User $user, Feedback $feedback): bool
    {
        // Owner
        if ($feedback->user_id === $user->id) {
            return true;
        }

        // Managers
        return $user->hasAnyRole([User::ROLE_MANAGER, User::ROLE_TECHNICIAN]);
    }

    /**
     * All authenticated users can create feedback
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Update feedback (status, response)
     * - Quản lý/Kỹ thuật viên can update any
     * - Owner can update content if status is 'new'
     */
    public function update(User $user, Feedback $feedback): bool
    {
        // Managers can always update
        if ($user->hasAnyRole([User::ROLE_MANAGER, User::ROLE_TECHNICIAN])) {
            return true;
        }

        // Owner can update only if new
        return $feedback->user_id === $user->id && $feedback->status === Feedback::STATUS_NEW;
    }

    /**
     * Manage feedback (change status, respond)
     * Only managers
     */
    public function manage(User $user, Feedback $feedback): bool
    {
        return $user->hasAnyRole([User::ROLE_MANAGER, User::ROLE_TECHNICIAN]);
    }

    /**
     * Delete feedback - Manager only
     */
    public function delete(User $user, Feedback $feedback): bool
    {
        return $user->hasRole(User::ROLE_MANAGER);
    }

    /**
     * Can view all feedback (not just own)
     */
    public function viewAll(User $user): bool
    {
        return $user->hasAnyRole([User::ROLE_MANAGER, User::ROLE_TECHNICIAN]);
    }
}
