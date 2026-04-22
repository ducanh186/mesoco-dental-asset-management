<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\MaintenanceDetail;
use App\Models\MaintenanceEvent;
use App\Models\RepairLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * MaintenanceService
 *
 * Business pivot:
 * - One maintenance ticket can contain multiple detail lines.
 * - Each detail line stores the asset and quantity being maintained.
 * - Asset lock/unlock must apply to every asset referenced by the ticket.
 */
class MaintenanceService
{
    /**
     * Create a new maintenance event.
     *
     * @throws InvalidArgumentException
     */
    public function create(array $data, User $user): MaintenanceEvent
    {
        $this->validateType($data['type'] ?? null);
        $this->validatePriority($data['priority'] ?? MaintenanceEvent::PRIORITY_NORMAL);

        return DB::transaction(function () use ($data, $user) {
            $detailLines = $this->normalizeDetailLines($data);
            $assignment = $this->resolveAssignmentData($data);
            $primaryAssetId = $this->resolvePrimaryAssetId($data, $detailLines);

            $event = MaintenanceEvent::create([
                'code' => MaintenanceEvent::generateCode(),
                'asset_id' => $primaryAssetId,
                'type' => $data['type'],
                'status' => MaintenanceEvent::STATUS_SCHEDULED,
                'planned_at' => $data['planned_at'],
                'priority' => $data['priority'] ?? MaintenanceEvent::PRIORITY_NORMAL,
                'note' => $data['note'] ?? null,
                'estimated_duration_minutes' => $data['estimated_duration_minutes'] ?? null,
                'assigned_to' => $assignment['assigned_to'],
                'assigned_to_user_id' => $assignment['assigned_to_user_id'],
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ]);

            $this->syncMaintenanceDetails($event, $detailLines);

            return $event->fresh([
                'asset',
                'creator',
                'assignedUser',
                'details.asset',
                'details.technician',
                'details.supplier',
            ]);
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
            $updateData = [];

            foreach ([
                'type',
                'planned_at',
                'priority',
                'note',
                'estimated_duration_minutes',
            ] as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }

            if (array_key_exists('assigned_to', $data) || array_key_exists('assigned_to_user_id', $data)) {
                $assignment = $this->resolveAssignmentData($data);
                $updateData['assigned_to'] = $assignment['assigned_to'];
                $updateData['assigned_to_user_id'] = $assignment['assigned_to_user_id'];
            }

            $detailLines = null;
            if (array_key_exists('details', $data) || array_key_exists('asset_id', $data)) {
                $detailLines = $this->normalizeDetailLines($data);
                $updateData['asset_id'] = $this->resolvePrimaryAssetId($data, $detailLines);
            }

            $updateData['updated_by'] = $user->id;

            $event->update($updateData);

            $this->syncMaintenanceDetails($event->fresh(), $detailLines);

            return $event->fresh([
                'asset',
                'creator',
                'updater',
                'assignedUser',
                'details.asset',
                'details.technician',
                'details.supplier',
            ]);
        });
    }

    /**
     * Start maintenance (scheduled -> in_progress).
     * Locks every asset referenced by the ticket.
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
            $assetIds = $this->getAffectedAssetIds($event);
            $assets = Asset::query()
                ->whereIn('id', $assetIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($assetIds as $assetId) {
                $asset = $assets->get($assetId);

                if (!$asset) {
                    throw new InvalidArgumentException("Asset not found.");
                }

                if ($asset->status === Asset::STATUS_RETIRED) {
                    throw new InvalidArgumentException(
                        "Cannot start maintenance on a retired asset."
                    );
                }
            }

            $event->update([
                'status' => MaintenanceEvent::STATUS_IN_PROGRESS,
                'started_at' => now(),
                'note' => $note ?: $event->note,
                'updated_by' => $user->id,
            ]);

            foreach ($assetIds as $assetId) {
                $this->lockAsset(
                    $assets->get($assetId),
                    $user,
                    "Maintenance in progress: {$event->code}"
                );
            }

            $this->syncMaintenanceDetails($event->fresh());

            return $event->fresh([
                'asset',
                'creator',
                'updater',
                'assignedUser',
                'details.asset',
                'details.technician',
                'details.supplier',
            ]);
        });
    }

    /**
     * Complete maintenance (in_progress -> completed).
     * Unlocks every asset that no longer has another active maintenance ticket.
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
            $assetIds = $this->getAffectedAssetIds($event);

            Asset::query()
                ->whereIn('id', $assetIds)
                ->lockForUpdate()
                ->get();

            $actualDuration = $actualDurationMinutes;
            if ($actualDuration === null && $event->started_at) {
                $actualDuration = (int) $event->started_at->diffInMinutes(now());
            }

            $event->update([
                'status' => MaintenanceEvent::STATUS_COMPLETED,
                'completed_at' => now(),
                'result_note' => $resultNote,
                'cost' => $cost,
                'actual_duration_minutes' => $actualDuration,
                'updated_by' => $user->id,
            ]);

            $this->maybeUnlockAssets($assetIds, $event->id);
            $this->syncMaintenanceDetails($event->fresh());

            return $event->fresh([
                'asset',
                'creator',
                'updater',
                'assignedUser',
                'details.asset',
                'details.technician',
                'details.supplier',
            ]);
        });
    }

    /**
     * Cancel maintenance (scheduled/in_progress -> canceled).
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
            $assetIds = $this->getAffectedAssetIds($event);

            Asset::query()
                ->whereIn('id', $assetIds)
                ->lockForUpdate()
                ->get();

            $event->update([
                'status' => MaintenanceEvent::STATUS_CANCELED,
                'result_note' => $reason ? "Canceled: {$reason}" : 'Canceled',
                'updated_by' => $user->id,
            ]);

            if ($wasInProgress) {
                $this->maybeUnlockAssets($assetIds, $event->id);
            }

            $this->syncMaintenanceDetails($event->fresh());

            return $event->fresh([
                'asset',
                'creator',
                'updater',
                'assignedUser',
                'details.asset',
                'details.technician',
                'details.supplier',
            ]);
        });
    }

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
        return DB::transaction(function () use ($asset) {
            $asset = Asset::lockForUpdate()->find($asset->id);

            if (!in_array($asset->status, [Asset::STATUS_OFF_SERVICE, Asset::STATUS_MAINTENANCE])) {
                throw new InvalidArgumentException(
                    "Asset is not locked. Current status: {$asset->status}"
                );
            }

            $hasInProgress = $this->assetHasAnotherInProgressMaintenance($asset->id, 0);

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

    /**
     * Lock an asset when maintenance starts.
     */
    private function lockAsset(Asset $asset, User $user, string $reason): void
    {
        if ($asset->isLocked()) {
            return;
        }

        $asset->update([
            'status' => Asset::STATUS_MAINTENANCE,
            'off_service_reason' => $reason,
            'off_service_from' => now(),
            'off_service_until' => null,
            'off_service_set_by' => $user->id,
        ]);
    }

    /**
     * Unlock every asset that no longer has another active maintenance event.
     *
     * @param array<int> $assetIds
     */
    private function maybeUnlockAssets(array $assetIds, int $excludeEventId): void
    {
        foreach ($assetIds as $assetId) {
            $asset = Asset::query()->lockForUpdate()->find($assetId);

            if (!$asset || $asset->status !== Asset::STATUS_MAINTENANCE) {
                continue;
            }

            if ($this->assetHasAnotherInProgressMaintenance($assetId, $excludeEventId)) {
                continue;
            }

            $asset->update([
                'status' => Asset::STATUS_ACTIVE,
                'off_service_reason' => null,
                'off_service_from' => null,
                'off_service_until' => null,
                'off_service_set_by' => null,
            ]);
        }
    }

    private function validateType(?string $type): void
    {
        if (!$type || !in_array($type, MaintenanceEvent::TYPES)) {
            throw new InvalidArgumentException(
                "Invalid maintenance type. Allowed: " . implode(', ', MaintenanceEvent::TYPES)
            );
        }
    }

    private function validatePriority(?string $priority): void
    {
        if ($priority && !in_array($priority, MaintenanceEvent::PRIORITIES)) {
            throw new InvalidArgumentException(
                "Invalid priority. Allowed: " . implode(', ', MaintenanceEvent::PRIORITIES)
            );
        }
    }

    private function resolveAssignmentData(array $data): array
    {
        $assignedUserId = $data['assigned_to_user_id'] ?? null;
        $assignedTo = $data['assigned_to'] ?? null;

        if ($assignedUserId) {
            $assignedUser = User::query()->find($assignedUserId);

            return [
                'assigned_to' => $assignedUser?->name,
                'assigned_to_user_id' => $assignedUser?->id,
            ];
        }

        if ($assignedTo) {
            $assignedUser = User::query()
                ->where('name', $assignedTo)
                ->orWhere('email', $assignedTo)
                ->first();

            return [
                'assigned_to' => $assignedUser?->name ?? $assignedTo,
                'assigned_to_user_id' => $assignedUser?->id,
            ];
        }

        return [
            'assigned_to' => null,
            'assigned_to_user_id' => null,
        ];
    }

    /**
     * Normalize incoming maintenance detail lines.
     *
     * @return array<int, array<string, mixed>>
     */
    private function normalizeDetailLines(array $data): array
    {
        if (!empty($data['details']) && is_array($data['details'])) {
            return collect($data['details'])
                ->map(fn (array $line) => [
                    'asset_id' => (int) $line['asset_id'],
                    'qty' => max(1, (int) ($line['qty'] ?? 1)),
                    'technician_user_id' => $line['technician_user_id'] ?? ($data['assigned_to_user_id'] ?? null),
                    'supplier_id' => $line['supplier_id'] ?? null,
                    'issue_description' => $line['issue_description'] ?? ($data['note'] ?? null),
                ])
                ->values()
                ->all();
        }

        if (!empty($data['asset_id'])) {
            return [[
                'asset_id' => (int) $data['asset_id'],
                'qty' => 1,
                'technician_user_id' => $data['assigned_to_user_id'] ?? null,
                'supplier_id' => null,
                'issue_description' => $data['note'] ?? null,
            ]];
        }

        return [];
    }

    /**
     * Build detail payload from existing rows when caller only changes header state.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getExistingDetailLines(MaintenanceEvent $event): array
    {
        $event->loadMissing('details');

        if ($event->details->isNotEmpty()) {
            return $event->details
                ->map(fn (MaintenanceDetail $detail) => [
                    'asset_id' => $detail->asset_id,
                    'qty' => $detail->qty ?? 1,
                    'technician_user_id' => $detail->technician_user_id,
                    'supplier_id' => $detail->supplier_id,
                    'issue_description' => $detail->issue_description,
                ])
                ->values()
                ->all();
        }

        if ($event->asset_id) {
            return [[
                'asset_id' => $event->asset_id,
                'qty' => 1,
                'technician_user_id' => $event->assigned_to_user_id,
                'supplier_id' => null,
                'issue_description' => $event->note,
            ]];
        }

        return [];
    }

    /**
     * Sync canonical maintenance detail rows and legacy repair logs.
     *
     * @param array<int, array<string, mixed>>|null $detailLines
     */
    private function syncMaintenanceDetails(MaintenanceEvent $event, ?array $detailLines = null): void
    {
        $detailLines = $detailLines ?? $this->getExistingDetailLines($event);

        if ($detailLines === []) {
            return;
        }

        $assetIds = [];
        $lineCount = count($detailLines);
        $detailCost = $lineCount === 1 ? $event->cost : null;

        foreach ($detailLines as $line) {
            $assetId = (int) $line['asset_id'];
            $assetIds[] = $assetId;

            $detailData = [
                'asset_id' => $assetId,
                'qty' => (int) ($line['qty'] ?? 1),
                'technician_user_id' => $line['technician_user_id'] ?? $event->assigned_to_user_id,
                'supplier_id' => $line['supplier_id'] ?? null,
                'status' => $event->status,
                'issue_description' => $line['issue_description'] ?? $event->note,
                'action_taken' => $event->result_note,
                'cost' => $detailCost,
                'started_at' => $event->started_at,
                'completed_at' => $event->completed_at,
                'logged_at' => $event->completed_at ?? $event->started_at ?? $event->planned_at,
            ];

            MaintenanceDetail::updateOrCreate(
                [
                    'maintenance_event_id' => $event->id,
                    'asset_id' => $assetId,
                ],
                $detailData
            );

            RepairLog::updateOrCreate(
                [
                    'maintenance_event_id' => $event->id,
                    'asset_id' => $assetId,
                ],
                collect($detailData)
                    ->except('qty')
                    ->all()
            );
        }

        MaintenanceDetail::query()
            ->where('maintenance_event_id', $event->id)
            ->whereNotIn('asset_id', $assetIds)
            ->delete();

        RepairLog::query()
            ->where('maintenance_event_id', $event->id)
            ->whereNotIn('asset_id', $assetIds)
            ->delete();
    }

    /**
     * @param array<int, array<string, mixed>> $detailLines
     */
    private function resolvePrimaryAssetId(array $data, array $detailLines): ?int
    {
        if (!empty($data['asset_id'])) {
            return (int) $data['asset_id'];
        }

        return $detailLines[0]['asset_id'] ?? null;
    }

    /**
     * @return array<int>
     */
    private function getAffectedAssetIds(MaintenanceEvent $event): array
    {
        $detailLines = $this->getExistingDetailLines($event);

        return collect($detailLines)
            ->pluck('asset_id')
            ->map(fn ($assetId) => (int) $assetId)
            ->unique()
            ->values()
            ->all();
    }

    private function assetHasAnotherInProgressMaintenance(int $assetId, int $excludeEventId): bool
    {
        $existsInDetails = MaintenanceDetail::query()
            ->where('asset_id', $assetId)
            ->whereHas('maintenanceEvent', function ($query) use ($excludeEventId) {
                $query->where('status', MaintenanceEvent::STATUS_IN_PROGRESS)
                    ->where('id', '!=', $excludeEventId);
            })
            ->exists();

        if ($existsInDetails) {
            return true;
        }

        return MaintenanceEvent::query()
            ->where('asset_id', $assetId)
            ->where('status', MaintenanceEvent::STATUS_IN_PROGRESS)
            ->where('id', '!=', $excludeEventId)
            ->whereDoesntHave('details')
            ->exists();
    }
}
