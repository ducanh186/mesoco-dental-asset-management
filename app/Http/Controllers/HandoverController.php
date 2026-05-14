<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HandoverController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Assignment::query()
            ->with(['staff', 'admin', 'approver', 'details.asset', 'returnRecord.admin', 'returnRecord.approver']);

        if ($request->filled('status')) {
            match ($request->string('status')->toString()) {
                'active' => $query->whereDoesntHave('returnRecord'),
                'returned' => $query->whereHas('returnRecord'),
                default => null,
            };
        }

        if ($request->filled('search')) {
            $term = '%' . $request->string('search')->toString() . '%';
            $query->where(function ($searchQuery) use ($term) {
                $searchQuery->where('note', 'like', $term)
                    ->orWhereHas('staff', function ($staffQuery) use ($term) {
                        $staffQuery->where('name', 'like', $term)
                            ->orWhere('username', 'like', $term)
                            ->orWhere('employee_code', 'like', $term);
                    })
                    ->orWhereHas('details.asset', function ($assetQuery) use ($term) {
                        $assetQuery->where('asset_code', 'like', $term)
                            ->orWhere('name', 'like', $term)
                            ->orWhere('serial_number', 'like', $term);
                    });
            });
        }

        $summary = [
            'total' => Assignment::query()->count(),
            'active' => Assignment::query()->whereDoesntHave('returnRecord')->count(),
            'returned' => Assignment::query()->whereHas('returnRecord')->count(),
            'assets' => Assignment::query()->withCount('details')->get()->sum('details_count'),
        ];

        $perPage = min($request->integer('per_page', 15), 100);
        $records = $query->latest('assign_date')->paginate($perPage);

        return response()->json([
            'data' => $records->getCollection()
                ->map(fn (Assignment $assignment) => $this->transformAssignment($assignment))
                ->values(),
            'summary' => $summary,
            'pagination' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
            ],
        ]);
    }

    private function transformAssignment(Assignment $assignment): array
    {
        $returnRecord = $assignment->returnRecord;

        return [
            'id' => $assignment->id,
            'code' => sprintf('BG-%04d', $assignment->id),
            'staff_name' => $assignment->staff?->name ?? $assignment->staff?->username ?? 'Chưa xác định',
            'staff_code' => $assignment->staff?->employee_code,
            'admin_name' => $assignment->admin?->name,
            'approved_by' => $assignment->approver?->name,
            'assigned_at' => $assignment->assign_date?->toDateString(),
            'returned_at' => $returnRecord?->return_date?->toDateString(),
            'return_reason' => $returnRecord?->reason,
            'status' => $returnRecord ? 'returned' : 'active',
            'note' => $assignment->note,
            'assets' => $assignment->details->map(fn ($detail) => [
                'id' => $detail->asset?->id,
                'asset_code' => $detail->asset?->asset_code,
                'name' => $detail->asset?->name,
                'category' => $detail->asset?->category,
                'status' => $detail->asset?->status,
            ])->values(),
        ];
    }
}
