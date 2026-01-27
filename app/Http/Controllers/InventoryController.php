<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * InventoryController - Phase 6 Inventory Management
 * 
 * Provides inventory dashboard, asset listing with filters,
 * and valuation reports for Admin/HR roles.
 * 
 * RBAC: admin, hr only (enforced via route middleware)
 */
class InventoryController extends Controller
{
    /**
     * Get inventory summary statistics.
     * 
     * GET /api/inventory/summary
     * 
     * Returns counts by status, category, and total values.
     */
    public function summary(): JsonResponse
    {
        // Status counts (excludes soft-deleted)
        $statusCounts = Asset::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Category counts
        $categoryCounts = Asset::query()
            ->selectRaw('category, COUNT(*) as count')
            ->whereNotNull('category')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        // Assignment status
        $totalAssets = Asset::count();
        $assignedCount = Asset::assigned()->count();
        $unassignedCount = $totalAssets - $assignedCount;

        // Valuation totals (only assets with purchase_cost)
        $valuationStats = Asset::withValuation()
            ->selectRaw('
                COUNT(*) as assets_with_valuation,
                SUM(purchase_cost) as total_purchase_cost,
                SUM(salvage_value) as total_salvage_value
            ')
            ->first();

        // Calculate total current book value (need to iterate for computed values)
        $totalCurrentBookValue = Asset::withValuation()
            ->get()
            ->sum(fn($asset) => $asset->getCurrentBookValue() ?? 0);

        $totalAccumulatedDepreciation = Asset::withValuation()
            ->get()
            ->sum(fn($asset) => $asset->getAccumulatedDepreciation() ?? 0);

        return response()->json([
            'summary' => [
                'total_assets' => $totalAssets,
                'by_status' => [
                    'active' => $statusCounts[Asset::STATUS_ACTIVE] ?? 0,
                    'maintenance' => $statusCounts[Asset::STATUS_MAINTENANCE] ?? 0,
                    'off_service' => $statusCounts[Asset::STATUS_OFF_SERVICE] ?? 0,
                    'retired' => $statusCounts[Asset::STATUS_RETIRED] ?? 0,
                ],
                'by_assignment' => [
                    'assigned' => $assignedCount,
                    'available' => $unassignedCount,
                ],
                'by_category' => $categoryCounts,
            ],
            'valuation' => [
                'assets_with_valuation' => (int) $valuationStats->assets_with_valuation,
                'total_purchase_cost' => round((float) $valuationStats->total_purchase_cost, 2),
                'total_salvage_value' => round((float) $valuationStats->total_salvage_value, 2),
                'total_current_book_value' => round($totalCurrentBookValue, 2),
                'total_accumulated_depreciation' => round($totalAccumulatedDepreciation, 2),
            ],
            'available_types' => Asset::TYPES,
            'available_statuses' => Asset::STATUSES,
            'available_categories' => Asset::CATEGORIES,
        ]);
    }

    /**
     * Get paginated inventory list with filters.
     * 
     * GET /api/inventory/assets
     * Query params: search, type, status, category, location, assigned, per_page
     */
    public function assets(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 15), 100);

        $query = Asset::with(['currentAssignment.employee', 'qrIdentity'])
            ->search($request->input('search'))
            ->byType($request->input('type'))
            ->byStatus($request->input('status'))
            ->byCategory($request->input('category'))
            ->byLocation($request->input('location'));

        // Filter by assignment status
        if ($request->has('assigned')) {
            if ($request->boolean('assigned')) {
                $query->assigned();
            } else {
                $query->unassigned();
            }
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'asset_code');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSorts = ['asset_code', 'name', 'type', 'status', 'category', 'location', 'purchase_date', 'purchase_cost', 'created_at'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $assets = $query->paginate($perPage);

        $transformedAssets = collect($assets->items())->map(function ($asset) {
            return [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
                'category' => $asset->category,
                'location' => $asset->location,
                'status' => $asset->status,
                'notes' => $asset->notes,
                'purchase_date' => $asset->purchase_date?->toDateString(),
                'purchase_cost' => $asset->purchase_cost ? (float) $asset->purchase_cost : null,
                'warranty_expiry' => $asset->warranty_expiry?->toDateString(),
                'current_book_value' => $asset->getCurrentBookValue(),
                'qr_payload' => $asset->qrIdentity?->qr_payload,
                'assigned_to' => $asset->currentAssignment ? [
                    'id' => $asset->currentAssignment->employee_id,
                    'name' => $asset->currentAssignment->employee?->name,
                    'assigned_at' => $asset->currentAssignment->assigned_at?->toISOString(),
                ] : null,
                'created_at' => $asset->created_at?->toISOString(),
            ];
        });

        // Get distinct locations for filter dropdown
        $locations = Asset::query()
            ->whereNotNull('location')
            ->distinct()
            ->pluck('location')
            ->sort()
            ->values();

        return response()->json([
            'assets' => $transformedAssets,
            'pagination' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
            ],
            'filters' => [
                'types' => Asset::TYPES,
                'statuses' => Asset::STATUSES,
                'categories' => Asset::CATEGORIES,
                'locations' => $locations,
            ],
        ]);
    }

    /**
     * Get asset valuation report with depreciation details.
     * 
     * GET /api/inventory/valuation
     * Query params: search, category, fully_depreciated, per_page
     */
    public function valuation(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 15), 100);

        $query = Asset::withValuation()
            ->with(['currentAssignment.employee'])
            ->search($request->input('search'))
            ->byCategory($request->input('category'));

        // Sorting
        $sortBy = $request->input('sort_by', 'purchase_cost');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['asset_code', 'name', 'purchase_date', 'purchase_cost', 'useful_life_months'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $assets = $query->paginate($perPage);

        // Filter fully depreciated after pagination (computed field)
        $filterFullyDepreciated = $request->input('fully_depreciated');
        
        $transformedAssets = collect($assets->items())->map(function ($asset) {
            $valuation = $asset->getValuationData();
            
            return [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
                'category' => $asset->category,
                'status' => $asset->status,
                'assigned_to' => $asset->currentAssignment?->employee?->name,
                'valuation' => $valuation,
            ];
        });

        // Filter by fully_depreciated if specified
        if ($filterFullyDepreciated !== null) {
            $isFullyDepreciated = filter_var($filterFullyDepreciated, FILTER_VALIDATE_BOOLEAN);
            $transformedAssets = $transformedAssets->filter(function ($asset) use ($isFullyDepreciated) {
                return $asset['valuation']['is_fully_depreciated'] === $isFullyDepreciated;
            })->values();
        }

        return response()->json([
            'assets' => $transformedAssets,
            'pagination' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
            ],
        ]);
    }
}
