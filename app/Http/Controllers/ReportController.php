<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Disposal;
use App\Models\InventoryCheck;
use App\Models\MaintenanceEvent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * ReportController - Phase 8
 * 
 * Summary reports for dashboard and management.
 * Provides aggregated data for the 5 DFD-aligned modules:
 * - Catalog & asset records
 * - Purchase orders/allocation
 * - Maintenance
 * - Disposal/liquidation
 * - Inventory checks
 */
class ReportController extends Controller
{
    /**
     * Get overall system summary
     * 
     * Accessible by: manager
     */
    public function summary(Request $request): JsonResponse
    {
        // Date range filter (defaults to current month)
        $from = $request->input('from', now()->startOfMonth()->toDateString());
        $to = $request->input('to', now()->endOfMonth()->toDateString());

        $fromDate = Carbon::parse($from)->startOfDay();
        $toDate = Carbon::parse($to)->endOfDay();

        return response()->json([
            'period' => [
                'from' => $fromDate->toDateString(),
                'to' => $toDate->toDateString(),
            ],
            'assets' => $this->getAssetStats(),
            'maintenance' => $this->getMaintenanceStats($fromDate, $toDate),
            'disposal' => $this->getDisposalStats($fromDate, $toDate),
            'inventory' => $this->getInventoryStats($fromDate, $toDate),
        ]);
    }

    /**
     * Get asset statistics
     */
    protected function getAssetStats(): array
    {
        $total = Asset::count();
        $active = Asset::where('status', 'active')->count();
        $locked = Asset::whereIn('status', Asset::LOCKED_STATUSES)->count();
        $offService = Asset::where('status', 'off_service')->count();
        $maintenance = Asset::where('status', 'maintenance')->count();
        $retired = Asset::where('status', 'retired')->count();

        return [
            'total' => $total,
            'active' => $active,
            'locked' => $locked,
            'off_service' => $offService,
            'maintenance' => $maintenance,
            'retired' => $retired,
            'by_status' => [
                'active' => $active,
                'off_service' => $offService,
                'maintenance' => $maintenance,
                'retired' => $retired,
            ],
        ];
    }

    /**
     * Get maintenance statistics
     */
    protected function getMaintenanceStats(Carbon $from, Carbon $to): array
    {
        $periodQuery = MaintenanceEvent::whereBetween('created_at', [$from, $to]);

        // Overdue: scheduled + planned_at < now
        $overdue = MaintenanceEvent::where('status', MaintenanceEvent::STATUS_SCHEDULED)
            ->where('planned_at', '<', now())
            ->count();

        // In progress
        $inProgress = MaintenanceEvent::where('status', MaintenanceEvent::STATUS_IN_PROGRESS)->count();

        // Scheduled (upcoming)
        $scheduled = MaintenanceEvent::where('status', MaintenanceEvent::STATUS_SCHEDULED)
            ->where('planned_at', '>=', now())
            ->count();

        // Completed in period
        $completedInPeriod = (clone $periodQuery)
            ->where('status', MaintenanceEvent::STATUS_COMPLETED)
            ->count();

        // Created in period
        $createdInPeriod = (clone $periodQuery)->count();

        return [
            'overdue' => $overdue,
            'in_progress' => $inProgress,
            'scheduled' => $scheduled,
            'completed_in_period' => $completedInPeriod,
            'created_in_period' => $createdInPeriod,
            'by_type' => $this->getMaintenanceByType(),
        ];
    }

    /**
     * Get maintenance count by type
     */
    protected function getMaintenanceByType(): array
    {
        $counts = [];
        foreach (MaintenanceEvent::TYPES as $type) {
            $counts[$type] = MaintenanceEvent::where('type', $type)->count();
        }
        return $counts;
    }

    /**
     * Get disposal statistics
     */
    protected function getDisposalStats(Carbon $from, Carbon $to): array
    {
        $periodQuery = Disposal::whereBetween('disposed_at', [$from, $to]);
        $eligibleForDisposal = Asset::query()
            ->where('status', '!=', Asset::STATUS_RETIRED)
            ->get()
            ->filter(fn (Asset $asset) => $asset->isEligibleForDisposal())
            ->count();

        return [
            'eligible' => $eligibleForDisposal,
            'retired_total' => Asset::where('status', Asset::STATUS_RETIRED)->count(),
            'retired_in_period' => (clone $periodQuery)->count(),
            'by_method' => [
                'destroy' => (clone $periodQuery)->where('method', 'destroy')->count(),
                'liquidation' => (clone $periodQuery)->where('method', 'liquidation')->count(),
                'scrap' => (clone $periodQuery)->where('method', 'scrap')->count(),
                'other' => (clone $periodQuery)->where('method', 'other')->count(),
            ],
            'recovered_value' => round((float) ((clone $periodQuery)->sum('proceeds_amount') ?? 0), 2),
        ];
    }

    protected function getInventoryStats(Carbon $from, Carbon $to): array
    {
        $periodQuery = InventoryCheck::whereBetween('check_date', [$from->toDateString(), $to->toDateString()]);

        return [
            'total' => InventoryCheck::count(),
            'in_progress' => InventoryCheck::where('status', InventoryCheck::STATUS_IN_PROGRESS)->count(),
            'completed_in_period' => (clone $periodQuery)
                ->where('status', InventoryCheck::STATUS_COMPLETED)
                ->count(),
            'created_in_period' => (clone $periodQuery)->count(),
        ];
    }

    /**
     * Export report as CSV (manager only)
     */
    public function export(Request $request): JsonResponse
    {
        // Placeholder for future implementation
        return response()->json([
            'error_code' => 'NOT_IMPLEMENTED',
            'message' => 'Export feature is planned for a future release.',
        ], 501);
    }
}
