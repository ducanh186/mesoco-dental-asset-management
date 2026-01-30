<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller for shift management.
 * 
 * Phase 4: Read-only access to clinic shifts.
 */
class ShiftController extends Controller
{
    /**
     * Get all active shifts.
     * 
     * GET /api/shifts
     */
    public function index(): JsonResponse
    {
        $shifts = Shift::active()
            ->ordered()
            ->get()
            ->map(fn($shift) => $shift->toApiArray());

        $currentShift = Shift::getCurrentShift();

        return response()->json([
            'data' => $shifts,
            'current_shift' => $currentShift?->toApiArray(),
        ]);
    }

    /**
     * Get a specific shift.
     * 
     * GET /api/shifts/{shift}
     */
    public function show(Shift $shift): JsonResponse
    {
        return response()->json([
            'data' => $shift->toApiArray(),
        ]);
    }
}
