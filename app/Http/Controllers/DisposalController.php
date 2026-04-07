<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Disposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Controller for asset disposal management (Thu hủy).
 *
 * BFD Module: Quản lý thu hủy
 * - Lists assets eligible for disposal (depreciation >= 70%)
 * - Allows retiring assets (changing status to 'retired')
 * - Summary statistics for disposal management
 */
class DisposalController extends Controller
{
    /**
     * Get disposal summary statistics.
     *
     * GET /api/disposal/summary
     */
    public function summary(): JsonResponse
    {
        $allAssets = Asset::whereNotNull('purchase_cost')
            ->whereNotNull('useful_life_months')
            ->where('useful_life_months', '>', 0)
            ->where('status', '!=', Asset::STATUS_RETIRED)
            ->get();

        $eligibleCount = 0;
        $highDepreciationCount = 0; // >= 90%
        $totalDepreciatedValue = 0;

        foreach ($allAssets as $asset) {
            $percentage = $asset->getDepreciationPercentage();
            if ($percentage !== null && $percentage >= 70) {
                $eligibleCount++;
                $totalDepreciatedValue += $asset->getCurrentBookValue() ?? 0;
                if ($percentage >= 90) {
                    $highDepreciationCount++;
                }
            }
        }

        $retiredCount = Asset::where('status', Asset::STATUS_RETIRED)->count();

        return response()->json([
            'eligible_for_disposal' => $eligibleCount,
            'high_depreciation' => $highDepreciationCount,
            'already_retired' => $retiredCount,
            'total_remaining_value' => round($totalDepreciatedValue, 2),
        ]);
    }

    /**
     * List assets eligible for disposal or already retired.
     *
     * GET /api/disposal/assets
     *
     * Query params:
     * - tab: 'eligible' (default) | 'retired'
     * - search: string
     * - category: string
     * - page: int
     * - per_page: int
     * - sort_by: string
     * - sort_dir: 'asc' | 'desc'
     */
    public function assets(Request $request): JsonResponse
    {
        $tab = $request->input('tab', 'eligible');
        $perPage = min((int) $request->input('per_page', 15), 50);

        if ($tab === 'retired') {
            return $this->retiredAssets($request, $perPage);
        }

        return $this->eligibleAssets($request, $perPage);
    }

    /**
     * Retire an asset (mark as disposed / thu hủy).
     *
     * POST /api/disposal/assets/{asset}/retire
     */
    public function retire(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'method' => 'nullable|string|in:' . implode(',', Disposal::METHODS),
            'disposed_at' => 'nullable|date',
            'proceeds_amount' => 'nullable|numeric|min:0',
            'note' => 'nullable|string|max:2000',
        ]);

        if ($asset->status === Asset::STATUS_RETIRED) {
            return response()->json([
                'message' => 'Thiết bị đã được thu hủy trước đó.',
                'error' => 'ALREADY_RETIRED',
            ], 422);
        }

        $user = $request->user();

        $disposal = DB::transaction(function () use ($asset, $validated, $user) {
            $disposedAt = $validated['disposed_at'] ?? now();

            $asset->update([
                'status' => Asset::STATUS_RETIRED,
                'off_service_reason' => $validated['reason'],
                'off_service_from' => $disposedAt,
                'off_service_set_by' => $user?->id,
            ]);

            return Disposal::create([
                'code' => Disposal::generateCode(),
                'asset_id' => $asset->id,
                'method' => $validated['method'] ?? 'destroy',
                'reason' => $validated['reason'],
                'disposed_by_user_id' => $user?->id,
                'approved_by_user_id' => $user?->id,
                'disposed_at' => $disposedAt,
                'asset_book_value' => $asset->getCurrentBookValue(),
                'proceeds_amount' => $validated['proceeds_amount'] ?? null,
                'note' => $validated['note'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'Đã thu hủy thiết bị thành công.',
            'data' => [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'status' => $asset->status,
                'disposal' => [
                    'id' => $disposal->id,
                    'code' => $disposal->code,
                    'method' => $disposal->method,
                    'disposed_at' => $disposal->disposed_at?->toISOString(),
                ],
            ],
        ]);
    }

    /**
     * Get eligible assets (depreciation >= 70%, not retired).
     */
    private function eligibleAssets(Request $request, int $perPage): JsonResponse
    {
        $query = Asset::whereNotNull('purchase_cost')
            ->whereNotNull('useful_life_months')
            ->where('useful_life_months', '>', 0)
            ->where('status', '!=', Asset::STATUS_RETIRED);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('asset_code', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        // Get all matching, then filter by depreciation percentage in PHP
        // (since depreciation is calculated, not stored)
        $allAssets = $query->get();

        $eligible = $allAssets->filter(function ($asset) {
            return $asset->isEligibleForDisposal();
        })->map(function ($asset) {
            $valuation = $asset->getValuationData();
            return [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'category' => $asset->category,
                'status' => $asset->status,
                'location' => $asset->location,
                'purchase_cost' => $valuation['purchase_cost'],
                'purchase_date' => $valuation['purchase_date'],
                'current_book_value' => $valuation['current_book_value'],
                'depreciation_percentage' => $valuation['depreciation_percentage'],
                'months_in_service' => $valuation['months_in_service'],
                'useful_life_months' => $valuation['useful_life_months'],
                'is_fully_depreciated' => $valuation['is_fully_depreciated'],
            ];
        })->values();

        // Sort
        $sortBy = $request->input('sort_by', 'depreciation_percentage');
        $sortDir = $request->input('sort_dir', 'desc');
        $sorted = $sortDir === 'desc'
            ? $eligible->sortByDesc($sortBy)->values()
            : $eligible->sortBy($sortBy)->values();

        // Paginate manually
        $page = max(1, (int) $request->input('page', 1));
        $total = $sorted->count();
        $items = $sorted->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'assets' => $items,
            'pagination' => [
                'current_page' => $page,
                'last_page' => (int) ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ]);
    }

    /**
     * Get retired/disposed assets.
     */
    private function retiredAssets(Request $request, int $perPage): JsonResponse
    {
        $query = Asset::with('latestDisposal')->where('status', Asset::STATUS_RETIRED);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('asset_code', 'like', "%{$search}%");
            });
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $paginated = $query->orderBy('off_service_from', 'desc')
            ->paginate($perPage);

        $assets = $paginated->getCollection()->map(function ($asset) {
            $valuation = $asset->getValuationData();
            return [
                'id' => $asset->id,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'category' => $asset->category,
                'status' => $asset->status,
                'off_service_reason' => $asset->off_service_reason,
                'off_service_from' => $asset->off_service_from?->toDateString(),
                'disposal_method' => $asset->latestDisposal?->method,
                'proceeds_amount' => $asset->latestDisposal?->proceeds_amount !== null
                    ? (float) $asset->latestDisposal->proceeds_amount
                    : null,
                'purchase_cost' => $valuation['purchase_cost'],
                'current_book_value' => $valuation['current_book_value'],
                'depreciation_percentage' => $valuation['depreciation_percentage'],
            ];
        });

        return response()->json([
            'assets' => $assets,
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }
}
