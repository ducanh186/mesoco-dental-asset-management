<?php

namespace App\Policies;

use App\Models\MaintenanceEvent;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Policy for MaintenanceEvent actions.
 * 
 * Phase 7: Maintenance RBAC rules.
 * 
 * Permission Matrix:
 * - Quản lý/Kỹ thuật viên: full maintenance operations
 * - Bác sĩ/Nhân viên: view only
 */
class MaintenanceEventPolicy
{
    /**
     * Roles that have full maintenance management access.
     */
    private const FULL_ACCESS_ROLES = [User::ROLE_MANAGER, User::ROLE_TECHNICIAN];

    /**
     * Roles that can manage maintenance (create, update, transitions).
     */
    private const MANAGER_ROLES = [User::ROLE_MANAGER, User::ROLE_TECHNICIAN];

    /**
     * Determine whether the user can view any maintenance events.
     * All authenticated users can view maintenance schedule.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view a specific maintenance event.
     * All authenticated users can view.
     */
    public function view(User $user, MaintenanceEvent $event): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create maintenance events.
     * Quản lý/Kỹ thuật viên only.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGER_ROLES);
    }

    /**
     * Determine whether the user can update a maintenance event.
     * Quản lý: always
     * Kỹ thuật viên: only if they created it or are assigned to it
     */
    public function update(User $user, MaintenanceEvent $event): Response
    {
        // Cannot update final events
        if ($event->isFinal()) {
            return Response::deny('Cannot update a completed or canceled maintenance event.');
        }

        if ($user->hasRole(User::ROLE_MANAGER)) {
            return Response::allow();
        }

        // Technician can update their own or assigned events
        if ($user->isTechnician()) {
            if ($event->created_by === $user->id) {
                return Response::allow();
            }
            if ($event->assigned_to_user_id === $user->id) {
                return Response::allow();
            }
            if ($event->assigned_to === $user->name || $event->assigned_to === $user->email) {
                return Response::allow();
            }
        }

        return Response::deny('You do not have permission to update this maintenance event.');
    }

    /**
     * Determine whether the user can delete a maintenance event.
     * Operational roles only, and only if still scheduled.
     */
    public function delete(User $user, MaintenanceEvent $event): Response
    {
        if (!$user->hasAnyRole(self::FULL_ACCESS_ROLES)) {
            return Response::deny('Only manager or technician can delete maintenance events.');
        }

        if ($event->status !== MaintenanceEvent::STATUS_SCHEDULED) {
            return Response::deny('Can only delete scheduled maintenance events.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can start a maintenance event.
     * Quản lý/Kỹ thuật viên only.
     */
    public function start(User $user, MaintenanceEvent $event): Response
    {
        if (!$user->hasAnyRole(self::MANAGER_ROLES)) {
            return Response::deny('You do not have permission to start maintenance.');
        }

        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_IN_PROGRESS)) {
            return Response::deny("Cannot start maintenance from status '{$event->status}'.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can complete a maintenance event.
     * Quản lý/Kỹ thuật viên only.
     */
    public function complete(User $user, MaintenanceEvent $event): Response
    {
        if (!$user->hasAnyRole(self::MANAGER_ROLES)) {
            return Response::deny('You do not have permission to complete maintenance.');
        }

        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_COMPLETED)) {
            return Response::deny("Cannot complete maintenance from status '{$event->status}'.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can cancel a maintenance event.
     * Quản lý/Kỹ thuật viên only.
     */
    public function cancel(User $user, MaintenanceEvent $event): Response
    {
        if (!$user->hasAnyRole(self::MANAGER_ROLES)) {
            return Response::deny('You do not have permission to cancel maintenance.');
        }

        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_CANCELED)) {
            return Response::deny("Cannot cancel maintenance from status '{$event->status}'.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can manually lock/unlock assets.
     * Quản lý/Kỹ thuật viên only.
     */
    public function manageOffService(User $user): bool
    {
        return $user->hasAnyRole(self::MANAGER_ROLES);
    }
}
