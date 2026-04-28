<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\InventoryCheck;
use App\Models\InventoryCheckItem;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * InventoryController - Phase 6 Inventory Management
 * 
 * Provides inventory dashboard, asset listing with filters,
 * valuation reports, and CSV export for Admin/HR roles.
 * 
 * RBAC: admin, hr only (enforced via route middleware)
 */
class InventoryController extends Controller
{
    public function checks(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 15), 100);

        $query = InventoryCheck::query()
            ->with(['creator:id,name,email', 'completer:id,name,email'])
            ->withCount('items');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('from_date')) {
            $query->where('check_date', '>=', $request->input('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->where('check_date', '<=', $request->input('to_date'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%");
            });
        }

        $checks = $query->orderByDesc('check_date')->paginate($perPage);

        return response()->json([
            'data' => $checks->items(),
            'pagination' => [
                'current_page' => $checks->currentPage(),
                'last_page' => $checks->lastPage(),
                'per_page' => $checks->perPage(),
                'total' => $checks->total(),
            ],
            'available_statuses' => InventoryCheck::STATUSES,
            'available_results' => InventoryCheckItem::RESULTS,
        ]);
    }

    public function storeCheck(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'check_date' => ['nullable', 'date'],
            'location' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:2000'],
            'asset_ids' => ['nullable', 'array'],
            'asset_ids.*' => ['integer', 'exists:assets,id'],
        ]);

        $assetQuery = Asset::query()
            ->with('locationDefinition')
            ->where('status', '!=', Asset::STATUS_RETIRED)
            ->orderBy('asset_code');

        if (!empty($validated['asset_ids'])) {
            $assetQuery->whereIn('id', array_unique($validated['asset_ids']));
        }

        if (!empty($validated['location'])) {
            $assetQuery->byLocation($validated['location']);
        }

        $assets = $assetQuery->get();

        $inventoryCheck = DB::transaction(function () use ($validated, $assets, $request) {
            $check = InventoryCheck::create([
                'title' => $validated['title'] ?? null,
                'check_date' => $validated['check_date'] ?? now()->toDateString(),
                'status' => InventoryCheck::STATUS_IN_PROGRESS,
                'created_by_user_id' => $request->user()?->id,
                'location' => $validated['location'] ?? null,
                'note' => $validated['note'] ?? null,
            ]);

            foreach ($assets as $asset) {
                $check->items()->create([
                    'asset_id' => $asset->id,
                    'expected_status' => $asset->status,
                    'expected_location' => $this->locationLabel($asset),
                    'result' => InventoryCheckItem::RESULT_PENDING,
                ]);
            }

            return $check->fresh(['creator:id,name,email'])->loadCount('items');
        });

        return response()->json([
            'message' => 'Inventory check created successfully.',
            'data' => $inventoryCheck,
        ], 201);
    }

    public function showCheck(InventoryCheck $inventoryCheck): JsonResponse
    {
        $inventoryCheck->load([
            'creator:id,name,email',
            'completer:id,name,email',
            'items.asset:id,asset_code,name,status,location',
            'items.countedBy:id,name,email',
        ]);

        return response()->json([
            'data' => $inventoryCheck,
            'available_results' => InventoryCheckItem::RESULTS,
        ]);
    }

    public function updateCheckItem(
        Request $request,
        InventoryCheck $inventoryCheck,
        InventoryCheckItem $inventoryCheckItem
    ): JsonResponse {
        if ($inventoryCheckItem->inventory_check_id !== $inventoryCheck->id) {
            abort(404);
        }

        if ($inventoryCheck->status !== InventoryCheck::STATUS_IN_PROGRESS) {
            return response()->json([
                'message' => 'Only in-progress inventory checks can be updated.',
            ], 422);
        }

        $validated = $request->validate([
            'actual_status' => ['nullable', 'string', Rule::in(Asset::STATUSES)],
            'actual_location' => ['nullable', 'string', 'max:255'],
            'result' => ['nullable', 'string', Rule::in(InventoryCheckItem::RESULTS)],
            'condition_note' => ['nullable', 'string', 'max:2000'],
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        if (!isset($validated['result'])) {
            $actualStatus = $validated['actual_status'] ?? $inventoryCheckItem->actual_status;
            $actualLocation = $validated['actual_location'] ?? $inventoryCheckItem->actual_location;

            $statusMatches = !$actualStatus || $actualStatus === $inventoryCheckItem->expected_status;
            $locationMatches = !$actualLocation || $actualLocation === $inventoryCheckItem->expected_location;

            $validated['result'] = ($statusMatches && $locationMatches)
                ? InventoryCheckItem::RESULT_MATCHED
                : InventoryCheckItem::RESULT_MOVED;
        }

        $inventoryCheckItem->update([
            ...$validated,
            'counted_by_user_id' => $request->user()?->id,
            'checked_at' => now(),
        ]);

        $inventoryCheckItem->load(['asset:id,asset_code,name,status,location', 'countedBy:id,name,email']);

        return response()->json([
            'message' => 'Inventory detail updated successfully.',
            'data' => $inventoryCheckItem,
        ]);
    }

    public function completeCheck(Request $request, InventoryCheck $inventoryCheck): JsonResponse
    {
        if ($inventoryCheck->status !== InventoryCheck::STATUS_IN_PROGRESS) {
            return response()->json([
                'message' => 'Only in-progress inventory checks can be completed.',
            ], 422);
        }

        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $inventoryCheck->update([
            'status' => InventoryCheck::STATUS_COMPLETED,
            'completed_by_user_id' => $request->user()?->id,
            'completed_at' => now(),
            'note' => $validated['note'] ?? $inventoryCheck->note,
        ]);

        $inventoryCheck->load(['creator:id,name,email', 'completer:id,name,email'])->loadCount('items');

        return response()->json([
            'message' => 'Inventory check completed successfully.',
            'data' => $inventoryCheck,
        ]);
    }

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

        // Warranty statistics
        $warrantyThresholdDays = config('inventory.warranty_expiry_threshold_days', 30);
        $warrantyExpiringSoonCount = Asset::warrantyExpiringSoon($warrantyThresholdDays)->count();
        $warrantyExpiredCount = Asset::warrantyExpired()->count();
        $warrantyValidCount = Asset::warrantyValid()->count();

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
            'warranty' => [
                'expiring_soon_count' => $warrantyExpiringSoonCount,
                'expired_count' => $warrantyExpiredCount,
                'valid_count' => $warrantyValidCount,
                'threshold_days' => $warrantyThresholdDays,
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
     * Query params: search, type, status, category, location, assigned, warranty_expiring_soon, per_page
     */
    public function assets(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 15), 100);
        $warrantyThresholdDays = config('inventory.warranty_expiry_threshold_days', 30);

        $query = Asset::with(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'locationDefinition'])
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

        // Filter by warranty expiring soon
        if ($request->has('warranty_expiring_soon') && $request->boolean('warranty_expiring_soon')) {
            $query->warrantyExpiringSoon($warrantyThresholdDays);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'asset_code');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSorts = ['asset_code', 'name', 'type', 'status', 'category', 'location', 'purchase_date', 'purchase_cost', 'created_at', 'warranty_expiry'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $assets = $query->paginate($perPage);

        $transformedAssets = collect($assets->items())->map(function ($asset) use ($warrantyThresholdDays) {
            return [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
                'category' => $asset->category,
                'location' => $this->transformLocation($asset),
                'location_name' => $this->locationLabel($asset),
                'status' => $asset->status,
                'notes' => $asset->notes,
                'purchase_date' => $asset->purchase_date?->toDateString(),
                'purchase_cost' => $asset->purchase_cost ? (float) $asset->purchase_cost : null,
                'warranty_expiry' => $asset->warranty_expiry?->toDateString(),
                'warranty_status' => $asset->getWarrantyStatus($warrantyThresholdDays),
                'warranty_days_left' => $asset->getWarrantyDaysLeft(),
                'is_warranty_expiring_soon' => $asset->isWarrantyExpiringSoon($warrantyThresholdDays),
                'current_book_value' => $asset->getCurrentBookValue(),
                'assigned_to' => $asset->currentAssignment ? [
                    'id' => $asset->currentAssignment->id,
                    'name' => $asset->currentAssignment->employee?->full_name,
                    'type' => 'employee',
                    'employee_id' => $asset->currentAssignment->employee_id,
                    'assigned_at' => $asset->currentAssignment->assigned_at?->toISOString(),
                ] : null,
                'created_at' => $asset->created_at?->toISOString(),
            ];
        });

        // Get distinct locations for filter dropdown
        $locations = Location::active()
            ->orderBy('name')
            ->get(['id', 'code', 'name'])
            ->map(fn (Location $location) => [
                'value' => $location->code,
                'label' => "{$location->code} - {$location->name}",
                'code' => $location->code,
                'name' => $location->name,
            ])
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
     * 
     * Note: fully_depreciated filter is applied server-side using SQL calculation
     * to ensure correct pagination results.
     */
    public function valuation(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 15), 100);

        $query = Asset::withValuation()
            ->with(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'locationDefinition'])
            ->search($request->input('search'))
            ->byCategory($request->input('category'));

        // Apply fully_depreciated filter server-side for correct pagination
        if ($request->has('fully_depreciated')) {
            $isFullyDepreciated = filter_var($request->input('fully_depreciated'), FILTER_VALIDATE_BOOLEAN);
            $query->fullyDepreciated($isFullyDepreciated);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'purchase_cost');
        $sortDir = $request->input('sort_dir', 'desc');
        $allowedSorts = ['asset_code', 'name', 'purchase_date', 'purchase_cost', 'useful_life_months'];
        
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $assets = $query->paginate($perPage);
        
        $transformedAssets = collect($assets->items())->map(function ($asset) {
            $valuation = $asset->getValuationData();
            
            return [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
                'category' => $asset->category,
                'status' => $asset->status,
                'assigned_to' => $asset->currentAssignment?->employee?->full_name,
                'valuation' => $valuation,
            ];
        });

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

    /**
     * Export inventory assets to CSV.
     * 
     * GET /api/inventory/export
     * Query params: Same filters as /inventory/assets (search, type, status, category, location, assigned)
     * 
     * Returns CSV file with all matching assets (no pagination).
     */
    public function export(Request $request): StreamedResponse
    {
        $query = Asset::with(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'locationDefinition'])
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

        // Filter by warranty status
        if ($request->has('warranty_expiring_soon')) {
            $thresholdDays = config('inventory.warranty_expiry_threshold_days', 30);
            $query->warrantyExpiringSoon($thresholdDays);
        }

        // Sort consistently
        $query->orderBy('asset_code', 'asc');

        $assets = $query->get();

        $filename = 'inventory_export_' . now()->format('Y-m-d_His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0',
        ];

        $callback = function () use ($assets) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($file, [
                'Asset Code',
                'Name',
                'Type',
                'Category',
                'Location',
                'Status',
                'Assigned To',
                'Purchase Date',
                'Purchase Cost',
                'Warranty Expiry',
                'Current Book Value',
                'Notes',
            ]);

            // Data rows
            foreach ($assets as $asset) {
                fputcsv($file, [
                    $asset->asset_code ?? '',
                    $asset->name ?? '',
                    $asset->type ?? '',
                    $asset->category ?? '',
                    $this->locationLabel($asset) ?? '',
                    $asset->status ?? '',
                    $asset->currentAssignment?->employee?->full_name ?? '',
                    $asset->purchase_date?->toDateString() ?? '',
                    $asset->purchase_cost ? number_format((float) $asset->purchase_cost, 2, '.', '') : '',
                    $asset->warranty_expiry?->toDateString() ?? '',
                    $asset->getCurrentBookValue() !== null ? number_format($asset->getCurrentBookValue(), 2, '.', '') : '',
                    $asset->notes ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function transformLocation(Asset $asset): ?array
    {
        $location = $asset->locationDefinition;

        if (!$location) {
            return null;
        }

        return [
            'id' => $location->id,
            'code' => $location->code,
            'name' => $location->name,
            'description' => $location->description,
        ];
    }

    private function locationLabel(Asset $asset): ?string
    {
        $location = $asset->locationDefinition;

        if ($location) {
            return trim("{$location->code} - {$location->name}", ' -');
        }

        return $asset->location;
    }
}
