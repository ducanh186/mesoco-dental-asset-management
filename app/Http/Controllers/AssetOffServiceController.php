<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Services\MaintenanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Controller for manual off-service lock/unlock operations.
 * 
 * Phase 7: Manual asset locking (outside maintenance workflow).
 * 
 * Use cases:
 * - Broken equipment that needs immediate lock
 * - Compliance/safety hold
 * - Pending investigation
 */
class AssetOffServiceController extends Controller
{
    public function __construct(
        protected MaintenanceService $maintenanceService
    ) {}

    /**
     * Manually lock an asset (set off_service status).
     * 
     * POST /api/assets/{asset}/lock
     * 
     * Body:
     * - reason: string (required) - Why the asset is being locked
     * - until: date (optional) - Expected unlock date
     */
    public function lock(Request $request, Asset $asset): JsonResponse
    {
        // RBAC check
        if (!Gate::allows('manageOffService')) {
            return response()->json([
                'message' => 'You do not have permission to lock assets.',
                'error' => 'FORBIDDEN',
            ], 403);
        }

        // Validate input
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'until' => 'nullable|date|after:now',
        ]);

        // Check if already locked
        if ($asset->isLocked()) {
            return response()->json([
                'message' => 'Asset is already locked.',
                'error' => 'ASSET_ALREADY_LOCKED',
                'current_status' => $asset->status,
                'lock_reason' => $asset->getLockReason(),
            ], 422);
        }

        // Parse until date if provided
        $untilDate = null;
        if (!empty($validated['until'])) {
            $untilDate = \Carbon\Carbon::parse($validated['until']);
        }

        // Perform lock
        $lockedAsset = $this->maintenanceService->lockAssetManually(
            $asset,
            $request->user(),
            $validated['reason'],
            $untilDate
        );

        return response()->json([
            'message' => 'Asset locked successfully.',
            'data' => [
                'id' => $lockedAsset->id,
                'asset_code' => $lockedAsset->asset_code,
                'name' => $lockedAsset->name,
                'status' => $lockedAsset->status,
                'off_service_reason' => $lockedAsset->off_service_reason,
                'off_service_from' => $lockedAsset->off_service_from,
                'off_service_until' => $lockedAsset->off_service_until,
            ],
        ]);
    }

    /**
     * Manually unlock an asset (restore to active status).
     * 
     * POST /api/assets/{asset}/unlock
     * 
     * Note: Will fail if asset has in_progress maintenance events.
     */
    public function unlock(Request $request, Asset $asset): JsonResponse
    {
        // RBAC check
        if (!Gate::allows('manageOffService')) {
            return response()->json([
                'message' => 'You do not have permission to unlock assets.',
                'error' => 'FORBIDDEN',
            ], 403);
        }

        // Check if asset is actually locked
        if (!$asset->isLocked()) {
            return response()->json([
                'message' => 'Asset is not locked.',
                'error' => 'ASSET_NOT_LOCKED',
                'current_status' => $asset->status,
            ], 422);
        }

        // Check for active maintenance
        if ($asset->hasActiveMaintenanceEvent()) {
            return response()->json([
                'message' => 'Cannot unlock asset with active maintenance. Complete or cancel the maintenance first.',
                'error' => 'HAS_ACTIVE_MAINTENANCE',
                'active_maintenance_count' => $asset->activeMaintenanceEvents()->count(),
            ], 422);
        }

        // Perform unlock
        $unlockedAsset = $this->maintenanceService->unlockAssetManually(
            $asset,
            $request->user()
        );

        return response()->json([
            'message' => 'Asset unlocked successfully.',
            'data' => [
                'id' => $unlockedAsset->id,
                'asset_code' => $unlockedAsset->asset_code,
                'name' => $unlockedAsset->name,
                'status' => $unlockedAsset->status,
            ],
        ]);
    }

    /**
     * Get lock status and reason for an asset.
     * 
     * GET /api/assets/{asset}/lock-status
     */
    public function status(Asset $asset): JsonResponse
    {
        $isLocked = $asset->isLocked();

        $response = [
            'is_locked' => $isLocked,
            'status' => $asset->status,
        ];

        if ($isLocked) {
            $response['lock_reason'] = $asset->getLockReason();
            $response['off_service_from'] = $asset->off_service_from;
            $response['off_service_until'] = $asset->off_service_until;
            
            // Check if locked due to maintenance
            if ($asset->status === Asset::STATUS_MAINTENANCE) {
                $activeEvents = $asset->activeMaintenanceEvents()
                    ->select(['id', 'code', 'type', 'started_at'])
                    ->get();
                $response['active_maintenance_events'] = $activeEvents;
            }
        }

        return response()->json($response);
    }
}
