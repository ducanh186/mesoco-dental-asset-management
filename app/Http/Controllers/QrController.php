<?php

namespace App\Http\Controllers;

use App\Http\Requests\ResolveQrRequest;
use App\Models\AssetCheckin;
use App\Models\AssetQrIdentity;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;

class QrController extends Controller
{
    /**
     * Resolve a QR code payload to get asset and assignee info.
     * All authenticated users can call this endpoint.
     * 
     * POST /api/qr/resolve
     * Body: { payload: "MESOCO|ASSET|v1|<qr_uid>" }
     * 
     * Phase 4: Returns check-in status and action hints for UI.
     */
    public function resolve(ResolveQrRequest $request): JsonResponse
    {
        $payload = $request->input('payload');
        $user = $request->user();

        // Parse the payload
        $parsed = AssetQrIdentity::parsePayload($payload);
        
        if (!$parsed) {
            return response()->json([
                'message' => 'Invalid QR code format.',
                'error' => 'INVALID_QR_FORMAT',
                'expected_format' => 'MESOCO|ASSET|v1|<uuid>',
            ], 422);
        }

        // Find the QR identity
        $qrIdentity = AssetQrIdentity::findByPayload($payload);

        if (!$qrIdentity) {
            return response()->json([
                'message' => 'QR code not found in system.',
                'error' => 'QR_NOT_FOUND',
            ], 404);
        }

        // Load asset (soft delete aware - returns null if deleted)
        $asset = $qrIdentity->asset;
        
        // Check if asset was soft deleted
        if (!$asset || $asset->trashed()) {
            return response()->json([
                'message' => 'Asset has been removed from system.',
                'error' => 'ASSET_DELETED',
            ], 404);
        }

        $asset->load(['currentAssignment.employee']);

        $currentAssignment = $asset->currentAssignment;
        $currentAssignee = $currentAssignment?->employee;

        // Phase 4: Get check-in status for today
        $today = now()->toDateString();
        $currentShift = Shift::getCurrentShift();
        
        $todayCheckin = null;
        $canCheckIn = false;
        $checkInBlockedReason = null;

        if ($currentShift) {
            $todayCheckin = AssetCheckin::where('asset_id', $asset->id)
                ->where('shift_id', $currentShift->id)
                ->where('shift_date', $today)
                ->first();
        }

        // Determine if user can check in this asset
        if ($asset->status === 'off_service') {
            $checkInBlockedReason = 'ASSET_OFF_SERVICE';
        } elseif (!$currentAssignment) {
            $checkInBlockedReason = 'ASSET_NOT_ASSIGNED';
        } elseif (!$currentShift) {
            $checkInBlockedReason = 'NO_ACTIVE_SHIFT';
        } elseif ($todayCheckin) {
            $checkInBlockedReason = 'ALREADY_CHECKED_IN';
        } elseif (!in_array($user->role, ['admin', 'hr']) && 
                  $currentAssignment->employee_id !== $user->employee_id) {
            $checkInBlockedReason = 'NOT_ASSIGNEE';
        } else {
            $canCheckIn = true;
        }

        // Build action hints for UI
        $actions = [];
        
        if ($canCheckIn) {
            $actions[] = [
                'type' => 'check_in',
                'label' => 'Check In',
                'enabled' => true,
            ];
        }
        
        if ($todayCheckin && $todayCheckin->isActive()) {
            $actions[] = [
                'type' => 'check_out',
                'label' => 'Check Out',
                'enabled' => true,
                'checkin_id' => $todayCheckin->id,
            ];
        }

        $actions[] = [
            'type' => 'view_status',
            'label' => 'View Status',
            'enabled' => true,
        ];

        $actions[] = [
            'type' => 'view_instructions',
            'label' => 'View Instructions',
            'enabled' => true,
        ];

        return response()->json([
            'message' => 'QR code resolved successfully.',
            'asset' => [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
                'status' => $asset->status,
                'notes' => $asset->notes,
                'instructions' => [
                    'type' => $asset->instructions_url ? 'url' : null,
                    'url' => $asset->instructions_url,
                    'available' => $asset->instructions_url !== null,
                ],
            ],
            'is_assigned' => $currentAssignment !== null,
            'assignee' => $currentAssignment ? [
                'employee_code' => $currentAssignee->employee_code,
                'full_name' => $currentAssignee->full_name,
            ] : null,
            // Phase 4: Check-in status
            'checkin_status' => [
                'current_shift' => $currentShift?->toApiArray(),
                'today_checkin' => $todayCheckin?->toApiArray(),
                'can_check_in' => $canCheckIn,
                'blocked_reason' => $checkInBlockedReason,
            ],
            'actions' => $actions,
        ]);
    }
}
