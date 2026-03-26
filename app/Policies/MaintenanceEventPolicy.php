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
 * - Admin: Full access (CRUD + all transitions)
 * - HR: Full access (CRUD + all transitions)
 * - Technician: Create, update, start, complete, cancel own/assigned events
 * - Doctor/Staff: View only
 */
class MaintenanceEventPolicy
{
    /**
     * Roles that have full maintenance management access.
     */
    private const ADMIN_ROLES = ['admin', 'hr'];

    /**
     * Roles that can manage maintenance (create, update, transitions).
     */
    private const MANAGER_ROLES = ['admin', 'hr', 'technician'];

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
     * Admin, HR, Technician only.
     */
    public function create(User $user): bool
    {
        return in_array($user->role, self::MANAGER_ROLES);
    }

    /**
     * Determine whether the user can update a maintenance event.
     * Admin/HR: always
     * Technician: only if they created it or are assigned to it
     */
    public function update(User $user, MaintenanceEvent $event): Response
    {
        // Cannot update final events
        if ($event->isFinal()) {
            return Response::deny('Cannot update a completed or canceled maintenance event.');
        }

        // Admin/HR can update any
        if (in_array($user->role, self::ADMIN_ROLES)) {
            return Response::allow();
        }

        // Technician can update their own or assigned events
        if ($user->role === 'technician') {
            if ($event->created_by === $user->id) {
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
     * Only Admin/HR, and only if still scheduled.
     */
    public function delete(User $user, MaintenanceEvent $event): Response
    {
        if (!in_array($user->role, self::ADMIN_ROLES)) {
            return Response::deny('Only admin or HR can delete maintenance events.');
        }

        if ($event->status !== MaintenanceEvent::STATUS_SCHEDULED) {
            return Response::deny('Can only delete scheduled maintenance events.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can start a maintenance event.
     * Admin, HR, Technician only.
     */
    public function start(User $user, MaintenanceEvent $event): Response
    {
        if (!in_array($user->role, self::MANAGER_ROLES)) {
            return Response::deny('You do not have permission to start maintenance.');
        }

        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_IN_PROGRESS)) {
            return Response::deny("Cannot start maintenance from status '{$event->status}'.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can complete a maintenance event.
     * Admin, HR, Technician only.
     */
    public function complete(User $user, MaintenanceEvent $event): Response
    {
        if (!in_array($user->role, self::MANAGER_ROLES)) {
            return Response::deny('You do not have permission to complete maintenance.');
        }

        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_COMPLETED)) {
            return Response::deny("Cannot complete maintenance from status '{$event->status}'.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can cancel a maintenance event.
     * Admin, HR, Technician only.
     */
    public function cancel(User $user, MaintenanceEvent $event): Response
    {
        if (!in_array($user->role, self::MANAGER_ROLES)) {
            return Response::deny('You do not have permission to cancel maintenance.');
        }

        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_CANCELED)) {
            return Response::deny("Cannot cancel maintenance from status '{$event->status}'.");
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can manually lock/unlock assets.
     * Admin, HR, Technician only.
     */
    public function manageOffService(User $user): bool
    {
        return in_array($user->role, self::MANAGER_ROLES);
    }
}
