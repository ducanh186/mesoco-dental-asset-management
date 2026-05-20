<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Disposal;
use App\Models\InventoryCheck;
use App\Models\MaintenanceEvent;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'report_types' => $this->reportTypes(),
        ]);
    }

    protected function reportTypes(): array
    {
        return [
            [
                'key' => 'device_status',
                'label' => 'Báo cáo trạng thái thiết bị',
                'exportable' => true,
            ],
            [
                'key' => 'depreciation_remaining_value',
                'label' => 'Báo cáo khấu hao / giá trị còn lại',
                'exportable' => true,
            ],
            [
                'key' => 'disposal_proposal',
                'label' => 'Báo cáo đề xuất thu hủy',
                'exportable' => true,
            ],
            [
                'key' => 'lifecycle_analysis',
                'label' => 'Báo cáo phân tích vòng đời',
                'exportable' => true,
                'method' => 'rule_based',
            ],
        ];
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
        $disposalProposal = $this->getDisposalProposalAssets()->count();

        return [
            'total' => $total,
            'active' => $active,
            'locked' => $locked,
            'off_service' => $offService,
            'maintenance' => $maintenance,
            'retired' => $retired,
            'deprecation_threshold_75_pct' => $disposalProposal,
            'depreciation_threshold_75_pct' => $disposalProposal,
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
        $eligibleForDisposal = $this->getDisposalProposalAssets()->count();

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
    public function export(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:device_status,depreciation_remaining_value,disposal_proposal,lifecycle_analysis'],
        ]);

        [$filename, $headers, $rows] = match ($validated['type']) {
            'device_status' => $this->deviceStatusCsvData(),
            'depreciation_remaining_value' => $this->depreciationRemainingValueCsvData(),
            'disposal_proposal' => $this->disposalProposalCsvData(),
            'lifecycle_analysis' => $this->lifecycleAnalysisCsvData(),
        };

        return response()->streamDownload(function () use ($headers, $rows) {
            $output = fopen('php://output', 'w');
            fputcsv($output, $headers);

            foreach ($rows as $row) {
                fputcsv($output, $row);
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function deviceStatusCsvData(): array
    {
        $rows = Asset::query()
            ->orderBy('asset_code')
            ->orderBy('id')
            ->get()
            ->map(fn (Asset $asset) => [
                $asset->asset_code,
                $asset->name,
                $asset->category,
                $asset->status,
                $asset->location,
                $asset->purchase_date ? Carbon::parse((string) $asset->purchase_date)->toDateString() : null,
            ])
            ->all();

        return [
            'device-status.csv',
            ['Asset Code', 'Name', 'Category', 'Status', 'Location', 'Purchase Date'],
            $rows,
        ];
    }

    private function disposalProposalCsvData(): array
    {
        $rows = $this->getDisposalProposalAssets()
            ->map(function (Asset $asset) {
                $valuation = $asset->getValuationData();

                return [
                    $asset->asset_code,
                    $asset->name,
                    $asset->category,
                    $asset->status,
                    $valuation['purchase_date'],
                    $valuation['purchase_cost'],
                    $valuation['accumulated_depreciation'],
                    $valuation['depreciation_percentage'],
                    $valuation['current_book_value'],
                ];
            })
            ->all();

        return [
            'disposal-proposal.csv',
            [
                'Asset Code',
                'Name',
                'Category',
                'Status',
                'Purchase Date',
                'Purchase Cost',
                'Accumulated Depreciation',
                'Depreciation Percentage',
                'Current Book Value',
            ],
            $rows,
        ];
    }

    private function depreciationRemainingValueCsvData(): array
    {
        $rows = Asset::query()
            ->orderBy('asset_code')
            ->orderBy('id')
            ->get()
            ->map(function (Asset $asset) {
                $valuation = $asset->getValuationData();

                return [
                    $asset->asset_code,
                    $asset->name,
                    $asset->category,
                    $valuation['purchase_date'],
                    $valuation['purchase_cost'],
                    $valuation['months_in_service'],
                    $valuation['depreciation_percentage'],
                    $valuation['accumulated_depreciation'],
                    $valuation['current_book_value'],
                ];
            })
            ->all();

        return [
            'depreciation-remaining-value.csv',
            [
                'Asset Code',
                'Name',
                'Category',
                'Purchase Date',
                'Purchase Cost',
                'Months In Service',
                'Depreciation Percentage',
                'Accumulated Depreciation',
                'Current Book Value',
            ],
            $rows,
        ];
    }

    private function lifecycleAnalysisCsvData(): array
    {
        $rows = Asset::query()
            ->with(['currentAssignment.employee', 'locationDefinition'])
            ->orderBy('asset_code')
            ->orderBy('id')
            ->get()
            ->map(function (Asset $asset) {
                $valuation = $asset->getValuationData();

                return [
                    $asset->asset_code,
                    $asset->name,
                    $asset->category,
                    $asset->status,
                    $asset->lifecycle_status,
                    $asset->currentAssignment?->employee?->full_name,
                    $asset->locationDefinition?->name ?? $asset->location,
                    $valuation['months_in_service'],
                    $valuation['depreciation_percentage'],
                    $asset->isEligibleForDisposal() ? 'Yes' : 'No',
                ];
            })
            ->all();

        return [
            'lifecycle-analysis.csv',
            [
                'Asset Code',
                'Name',
                'Category',
                'Status',
                'Lifecycle Status',
                'Responsible Employee',
                'Location',
                'Months In Service',
                'Depreciation Percentage',
                'Disposal Candidate',
            ],
            $rows,
        ];
    }

    private function getDisposalProposalAssets()
    {
        return Asset::query()
            ->where('status', '!=', Asset::STATUS_RETIRED)
            ->get()
            ->filter(fn (Asset $asset) => $asset->isEligibleForDisposal())
            ->values();
    }
}
