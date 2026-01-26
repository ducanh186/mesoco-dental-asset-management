<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetCheckin;
use App\Models\Shift;
use App\Policies\AssetCheckinPolicy;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

/**
 * Controller for asset check-in/out operations.
 * 
 * Phase 4: Shift-based asset tracking (timesheet).
 */
class CheckinController extends Controller
{
    /**
     * Create a new check-in for an asset.
     * 
     * POST /api/checkins
     * 
     * Rules:
     * - Only assignee or admin/hr can check in
     * - One check-in per asset per shift_date+shift_id
     * - Block off_service assets
     * - Auto-detect current shift if not provided
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => 'required|integer|exists:assets,id',
            'shift_id' => 'nullable|integer|exists:shifts,id',
            'shift_date' => 'nullable|date_format:Y-m-d',
            'source' => 'nullable|in:qr,manual',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $asset = Asset::findOrFail($validated['asset_id']);

        // Authorization check via policy
        $response = Gate::inspect('checkIn', [AssetCheckin::class, $asset]);
        if ($response->denied()) {
            $code = $response->code() ?? 'CHECK_IN_DENIED';
            return response()->json([
                'message' => $response->message(),
                'error_code' => $code,
            ], $code === 'ASSET_OFF_SERVICE' ? 422 : 403);
        }

        // Determine shift_date (default: today)
        $shiftDate = $validated['shift_date'] ?? now()->toDateString();

        // Determine shift_id (default: current shift or first active)
        $shiftId = $validated['shift_id'] ?? null;
        if (!$shiftId) {
            $currentShift = Shift::getCurrentShift();
            if ($currentShift) {
                $shiftId = $currentShift->id;
            } else {
                // Fallback to first active shift
                $firstShift = Shift::active()->ordered()->first();
                if (!$firstShift) {
                    return response()->json([
                        'message' => 'No active shifts configured.',
                        'error_code' => 'NO_ACTIVE_SHIFTS',
                    ], 422);
                }
                $shiftId = $firstShift->id;
            }
        }

        // Prevent duplicate check-in using transaction
        try {
            $checkin = DB::transaction(function () use ($asset, $user, $shiftId, $shiftDate, $validated) {
                // Check for existing check-in (lock for update)
                $existing = AssetCheckin::where('asset_id', $asset->id)
                    ->where('shift_id', $shiftId)
                    ->where('shift_date', $shiftDate)
                    ->lockForUpdate()
                    ->first();

                if ($existing) {
                    throw ValidationException::withMessages([
                        'asset_id' => ['Asset already checked in for this shift.'],
                    ]);
                }

                // Create the check-in
                return AssetCheckin::create([
                    'asset_id' => $asset->id,
                    'employee_id' => $user->employee_id,
                    'shift_id' => $shiftId,
                    'shift_date' => $shiftDate,
                    'checked_in_at' => now(),
                    'source' => $validated['source'] ?? 'manual',
                    'notes' => $validated['notes'] ?? null,
                ]);
            });
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Asset already checked in for this shift.',
                'error_code' => 'DUPLICATE_CHECKIN',
                'errors' => $e->errors(),
            ], 409);
        } catch (UniqueConstraintViolationException $e) {
            // Race condition: unique constraint caught at DB level
            return response()->json([
                'message' => 'Asset already checked in for this shift.',
                'error_code' => 'DUPLICATE_CHECKIN',
            ], 409);
        }

        $checkin->load(['asset', 'employee', 'shift']);

        return response()->json([
            'message' => 'Check-in successful.',
            'data' => $checkin->toApiArray(),
        ], 201);
    }

    /**
     * Check-out an existing check-in.
     * 
     * PATCH /api/checkins/{checkin}/checkout
     */
    public function checkout(Request $request, AssetCheckin $checkin): JsonResponse
    {
        $response = Gate::inspect('checkOut', $checkin);
        if ($response->denied()) {
            return response()->json([
                'message' => $response->message(),
                'error_code' => $response->code() ?? 'CHECK_OUT_DENIED',
            ], 403);
        }

        $checkin->checkOut();
        $checkin->load(['asset', 'employee', 'shift']);

        return response()->json([
            'message' => 'Check-out successful.',
            'data' => $checkin->toApiArray(),
        ]);
    }

    /**
     * Get check-ins for the authenticated user.
     * 
     * GET /api/my-checkins?date=YYYY-MM-DD
     */
    public function myCheckins(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'nullable|date_format:Y-m-d',
        ]);

        $user = $request->user();
        $query = AssetCheckin::with(['asset', 'shift'])
            ->where('employee_id', $user->employee_id)
            ->orderBy('shift_date', 'desc')
            ->orderBy('checked_in_at', 'desc');

        if (isset($validated['date'])) {
            $query->whereDate('shift_date', $validated['date']);
        }

        $checkins = $query->limit(100)->get();

        return response()->json([
            'data' => $checkins->map(fn($c) => $c->toApiArray()),
        ]);
    }

    /**
     * Get today's check-in status for an asset.
     * 
     * GET /api/assets/{asset}/checkin-status
     */
    public function assetCheckinStatus(Request $request, Asset $asset): JsonResponse
    {
        $today = now()->toDateString();
        $currentShift = Shift::getCurrentShift();

        // Get all check-ins for today
        $todayCheckins = AssetCheckin::with(['employee', 'shift'])
            ->where('asset_id', $asset->id)
            ->where('shift_date', $today)
            ->orderBy('shift_id')
            ->get();

        // Current shift check-in status
        $currentCheckin = null;
        if ($currentShift) {
            $currentCheckin = $todayCheckins->firstWhere('shift_id', $currentShift->id);
        }

        return response()->json([
            'data' => [
                'asset_id' => $asset->id,
                'date' => $today,
                'current_shift' => $currentShift?->toApiArray(),
                'current_checkin' => $currentCheckin?->toApiArray(),
                'today_checkins' => $todayCheckins->map(fn($c) => $c->toApiArray()),
            ],
        ]);
    }
}
