<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\MaintenanceEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * MaintenanceService
 * 
 * Handles state transitions for maintenance events with proper
 * asset locking/unlocking within database transactions.
 * 
 * Lock Rule:
 *   - When starting maintenance (in_progress), asset.status -> 'maintenance'
 *   - When completing/canceling AND no other in_progress events exist, 
 *     asset.status -> 'active' (only if currently 'maintenance')
 */
class MaintenanceService
{
    // =========================================================================
    // CRUD Operations
    // =========================================================================

    /**
     * Create a new maintenance event.
     * 
     * @throws InvalidArgumentException
     */
    public function create(array $data, User $user): MaintenanceEvent
    {
        $this->validateType($data['type'] ?? null);
        $this->validatePriority($data['priority'] ?? 'normal');

        return DB::transaction(function () use ($data, $user) {
            $event = MaintenanceEvent::create([
                'code' => MaintenanceEvent::generateCode(),
                'asset_id' => $data['asset_id'],
                'type' => $data['type'],
                'status' => MaintenanceEvent::STATUS_SCHEDULED,
                'planned_at' => $data['planned_at'],
                'priority' => $data['priority'] ?? MaintenanceEvent::PRIORITY_NORMAL,
                'note' => $data['note'] ?? null,
                'estimated_duration_minutes' => $data['estimated_duration_minutes'] ?? null,
                'assigned_to' => $data['assigned_to'] ?? null,
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            return $event->fresh(['asset', 'creator']);
        });
    }

    /**
     * Update a maintenance event (only if not in final state).
     * 
     * @throws InvalidArgumentException
     */
    public function update(MaintenanceEvent $event, array $data, User $user): MaintenanceEvent
    {
        if ($event->isFinal()) {
            throw new InvalidArgumentException(
                "Cannot update a {$event->status} maintenance event."
            );
        }

        if (isset($data['type'])) {
            $this->validateType($data['type']);
        }

        if (isset($data['priority'])) {
            $this->validatePriority($data['priority']);
        }

        return DB::transaction(function () use ($event, $data, $user) {
            $updateData = array_filter([
                'type' => $data['type'] ?? null,
                'planned_at' => $data['planned_at'] ?? null,
                'priority' => $data['priority'] ?? null,
                'note' => $data['note'] ?? null,
                'estimated_duration_minutes' => $data['estimated_duration_minutes'] ?? null,
                'assigned_to' => $data['assigned_to'] ?? null,
            ], fn($v) => $v !== null);

            $updateData['updated_by'] = $user->id;

            $event->update($updateData);

            return $event->fresh(['asset', 'creator', 'updater']);
        });
    }

    // =========================================================================
    // State Transitions
    // =========================================================================

    /**
     * Start maintenance (scheduled -> in_progress).
     * Locks the asset with status='maintenance'.
     * 
     * @throws InvalidArgumentException
     */
    public function start(MaintenanceEvent $event, User $user, ?string $note = null): MaintenanceEvent
    {
        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_IN_PROGRESS)) {
            throw new InvalidArgumentException(
                "Cannot start maintenance from status '{$event->status}'. " .
                "Only scheduled events can be started."
            );
        }

        return DB::transaction(function () use ($event, $user, $note) {
            // Lock the asset row to prevent race conditions
            $asset = Asset::lockForUpdate()->find($event->asset_id);
            
            if (!$asset) {
                throw new InvalidArgumentException("Asset not found.");
            }

            // Check if asset is already retired (cannot maintain retired assets)
            if ($asset->status === Asset::STATUS_RETIRED) {
                throw new InvalidArgumentException(
                    "Cannot start maintenance on a retired asset."
                );
            }

            // Update event status
            $event->update([
                'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
                'started_at' => now(),
                'note' => $note ?: $event->note,
                'updated_by' => $user->id,
            ]);

            // Lock the asset
            $this->lockAsset($asset, $user, "Maintenance in progress: {$event->code}");

            return $event->fresh(['asset', 'creator', 'updater']);
        });
    }

    /**
     * Complete maintenance (in_progress -> completed).
     * Unlocks the asset if no other in_progress events exist.
     * 
     * @throws InvalidArgumentException
     */
    public function complete(
        MaintenanceEvent $event, 
        User $user, 
        ?string $resultNote = null,
        ?float $cost = null,
        ?int $actualDurationMinutes = null
    ): MaintenanceEvent {
        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_COMPLETED)) {
            throw new InvalidArgumentException(
                "Cannot complete maintenance from status '{$event->status}'. " .
                "Only in_progress events can be completed."
            );
        }

        return DB::transaction(function () use ($event, $user, $resultNote, $cost, $actualDurationMinutes) {
            $asset = Asset::lockForUpdate()->find($event->asset_id);

            // Calculate actual duration if not provided
            $actualDuration = $actualDurationMinutes;
            if ($actualDuration === null && $event->started_at) {
                $actualDuration = (int) $event->started_at->diffInMinutes(now());
            }

            // Update event status
            $event->update([
                'status' => MaintenanceEvent::STATUS_COMPLETED,
                'completed_at' => now(),
                'result_note' => $resultNote,
                'cost' => $cost,
                'actual_duration_minutes' => $actualDuration,
                'updated_by' => $user->id,
            ]);

            // Check if we should unlock the asset
            $this->maybeUnlockAsset($asset, $event->id);

            return $event->fresh(['asset', 'creator', 'updater']);
        });
    }

    /**
     * Cancel maintenance (scheduled/in_progress -> canceled).
     * Unlocks the asset if no other in_progress events exist.
     * 
     * @throws InvalidArgumentException
     */
    public function cancel(MaintenanceEvent $event, User $user, ?string $reason = null): MaintenanceEvent
    {
        if (!$event->canTransitionTo(MaintenanceEvent::STATUS_CANCELED)) {
            throw new InvalidArgumentException(
                "Cannot cancel maintenance from status '{$event->status}'. " .
                "Only scheduled or in_progress events can be canceled."
            );
        }

        return DB::transaction(function () use ($event, $user, $reason) {
            $wasInProgress = $event->status === MaintenanceEvent::STATUS_IN_PROGRESS;
            $asset = Asset::lockForUpdate()->find($event->asset_id);

            // Update event status
            $event->update([
                'status' => MaintenanceEvent::STATUS_CANCELED,
                'result_note' => $reason ? "Canceled: {$reason}" : 'Canceled',
                'updated_by' => $user->id,
            ]);

            // Only check unlock if was in_progress
            if ($wasInProgress) {
                $this->maybeUnlockAsset($asset, $event->id);
            }

            return $event->fresh(['asset', 'creator', 'updater']);
        });
    }

    // =========================================================================
    // Manual Off-Service Lock/Unlock
    // =========================================================================

    /**
     * Manually lock an asset (set to off_service).
     * Used for non-maintenance reasons.
     */
    public function lockAssetManually(
        Asset $asset, 
        User $user, 
        string $reason,
        ?\DateTimeInterface $until = null
    ): Asset {
        return DB::transaction(function () use ($asset, $user, $reason, $until) {
            $asset = Asset::lockForUpdate()->find($asset->id);

            if ($asset->status === Asset::STATUS_RETIRED) {
                throw new InvalidArgumentException("Cannot lock a retired asset.");
            }

            $asset->update([
                'status' => Asset::STATUS_OFF_SERVICE,
                'off_service_reason' => $reason,
                'off_service_from' => now(),
                'off_service_until' => $until,
                'off_service_set_by' => $user->id,
            ]);

            return $asset->fresh();
        });
    }

    /**
     * Manually unlock an asset (set to active).
     * Only works if asset is currently off_service and has no in_progress maintenance.
     */
    public function unlockAssetManually(Asset $asset, User $user): Asset
    {
        return DB::transaction(function () use ($asset, $user) {
            $asset = Asset::lockForUpdate()->find($asset->id);

            // Check if asset is in a lockable state
            if (!in_array($asset->status, [Asset::STATUS_OFF_SERVICE, Asset::STATUS_MAINTENANCE])) {
                throw new InvalidArgumentException(
                    "Asset is not locked. Current status: {$asset->status}"
                );
            }

            // Check for in_progress maintenance
            $hasInProgress = MaintenanceEvent::forAsset($asset->id)
                ->inProgress()
                ->exists();

            if ($hasInProgress) {
                throw new InvalidArgumentException(
                    "Cannot unlock asset while maintenance is in progress."
                );
            }

            $asset->update([
                'status' => Asset::STATUS_ACTIVE,
                'off_service_reason' => null,
                'off_service_from' => null,
                'off_service_until' => null,
                'off_service_set_by' => null,
            ]);

            return $asset->fresh();
        });
    }

    // =========================================================================
    // Private Helpers
    // =========================================================================

    /**
     * Lock an asset when maintenance starts.
     */
    private function lockAsset(Asset $asset, User $user, string $reason): void
    {
        // Only update if not already locked
        if (!$asset->isLocked()) {
            $asset->update([
                'status' => Asset::STATUS_MAINTENANCE,
                'off_service_reason' => $reason,
                'off_service_from' => now(),
                'off_service_until' => null,
                'off_service_set_by' => $user->id,
            ]);
        }
    }

    /**
     * Unlock asset if no other in_progress events exist.
     * 
     * @param int $excludeEventId Event to exclude from check (the one being completed/canceled)
     */
    private function maybeUnlockAsset(Asset $asset, int $excludeEventId): void
    {
        // Only attempt unlock if asset is in maintenance status
        if ($asset->status !== Asset::STATUS_MAINTENANCE) {
            return;
        }

        // Check for other in_progress events
        $otherInProgress = MaintenanceEvent::forAsset($asset->id)
            ->inProgress()
            ->where('id', '!=', $excludeEventId)
            ->exists();

        if (!$otherInProgress) {
            $asset->update([
                'status' => Asset::STATUS_ACTIVE,
                'off_service_reason' => null,
                'off_service_from' => null,
                'off_service_until' => null,
                'off_service_set_by' => null,
            ]);
        }
    }

    /**
     * Validate maintenance type.
     */
    private function validateType(?string $type): void
    {
        if (!$type || !in_array($type, MaintenanceEvent::TYPES)) {
            throw new InvalidArgumentException(
                "Invalid maintenance type. Allowed: " . implode(', ', MaintenanceEvent::TYPES)
            );
        }
    }

    /**
     * Validate priority.
     */
    private function validatePriority(?string $priority): void
    {
        if ($priority && !in_array($priority, MaintenanceEvent::PRIORITIES)) {
            throw new InvalidArgumentException(
                "Invalid priority. Allowed: " . implode(', ', MaintenanceEvent::PRIORITIES)
            );
        }
    }
}
