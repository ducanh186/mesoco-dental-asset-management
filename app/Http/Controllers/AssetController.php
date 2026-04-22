<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignAssetRequest;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\AssetQrIdentity;
use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    /**
     * Display a listing of all assets.
     * 
     * SECURITY: This endpoint is protected by route middleware (role:manager,technician).
     * DO NOT add auto-filtering logic here - that's a security footgun.
     * Use myAssets() for user's own assets instead.
     * 
     * GET /api/assets (Manager/Technician only via route middleware)
     * Query params: search, type, status, per_page, include_checkin_status
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 15), 100);
        $includeCheckinStatus = $request->boolean('include_checkin_status', false);

        $query = Asset::with(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'qrIdentity', 'supplier'])
            ->search($request->input('search'))
            ->byType($request->input('type'))
            ->byStatus($request->input('status'));

        // Filter by assignment status if provided
        if ($request->has('assigned')) {
            if ($request->boolean('assigned')) {
                $query->whereHas('currentAssignment');
            } else {
                $query->whereDoesntHave('currentAssignment');
            }
        }

        $assets = $query->orderBy('asset_code')->paginate($perPage);

        // Phase 4: Batch load check-in status
        $checkinMap = [];
        $currentShift = null;
        if ($includeCheckinStatus) {
            $currentShift = Shift::getCurrentShift();
            if ($currentShift) {
                $assetIds = collect($assets->items())->pluck('id');
                $today = now()->toDateString();
                
                $checkins = AssetCheckin::whereIn('asset_id', $assetIds)
                    ->where('shift_id', $currentShift->id)
                    ->where('shift_date', $today)
                    ->get()
                    ->keyBy('asset_id');
                
                $checkinMap = $checkins->toArray();
            }
        }

        $transformedAssets = collect($assets->items())->map(
            fn($asset) => $this->transformAsset(
                $asset, 
                false, 
                $includeCheckinStatus,
                $currentShift,
                $checkinMap[$asset->id] ?? null
            )
        );

        return response()->json([
            'assets' => $transformedAssets,
            'pagination' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
            ],
            'available_types' => Asset::TYPES,
            'available_statuses' => Asset::STATUSES,
        ]);
    }

    /**
     * Display assets assigned to the current user (All authenticated users).
     * 
     * GET /api/my-assets
     * Query params: search, type, status, per_page, include_checkin_status
     */
    public function myAssets(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = min($request->input('per_page', 15), 100);
        $includeCheckinStatus = $request->boolean('include_checkin_status', false);

        $employeeId = $user->employee?->id;
        
        // User has no employee record, return empty
        if (!$employeeId) {
            return response()->json([
                'assets' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                ],
            ]);
        }

        $query = Asset::with(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'qrIdentity', 'supplier'])
            ->assignedTo($employeeId)
            ->search($request->input('search'))
            ->byType($request->input('type'))
            ->byStatus($request->input('status'));

        $assets = $query->orderBy('asset_code')->paginate($perPage);

        // Phase 4: Batch load check-in status
        $checkinMap = [];
        $currentShift = null;
        if ($includeCheckinStatus) {
            $currentShift = Shift::getCurrentShift();
            if ($currentShift) {
                $assetIds = collect($assets->items())->pluck('id');
                $today = now()->toDateString();
                
                $checkins = AssetCheckin::whereIn('asset_id', $assetIds)
                    ->where('shift_id', $currentShift->id)
                    ->where('shift_date', $today)
                    ->get()
                    ->keyBy('asset_id');
                
                $checkinMap = $checkins->toArray();
            }
        }

        $transformedAssets = collect($assets->items())->map(
            fn($asset) => $this->transformAsset(
                $asset, 
                false, 
                $includeCheckinStatus,
                $currentShift,
                $checkinMap[$asset->id] ?? null
            )
        );

        return response()->json([
            'assets' => $transformedAssets,
            'pagination' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
            ],
            'available_types' => Asset::TYPES,
            'available_statuses' => Asset::STATUSES,
        ]);
    }

    /**
     * Get user's assigned assets in dropdown format for internal asset workflows.
     * All authenticated users can view their assigned assets.
     * 
     * GET /api/my-assigned-assets/dropdown
     * 
     * @return JsonResponse { data: [{ value, label, asset_code, name, type }] }
     */
    public function myAssignedAssetsDropdown(Request $request): JsonResponse
    {
        $user = $request->user();
        $employeeId = $user->employee?->id;
        
        // User has no employee record, return empty
        if (!$employeeId) {
            return response()->json([
                'data' => [],
            ]);
        }

        $assets = Asset::with(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'qrIdentity'])
            ->assignedTo($employeeId)
            ->where('status', Asset::STATUS_ACTIVE)
            ->orderBy('asset_code')
            ->get();

        // Transform to dropdown format with null-safe label
        $dropdownAssets = $assets->map(function($asset) {
            $label = $asset->asset_code 
                ? $asset->asset_code . ' - ' . $asset->name 
                : $asset->name . ' (ID: ' . $asset->id . ')';
            
            return [
                'value' => $asset->id,
                'label' => $label,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
            ];
        });

        return response()->json([
            'data' => $dropdownAssets,
        ]);
    }

    /**
     * Store a newly created asset.
     * Manager/Technician only.
     * 
     * POST /api/assets
     */
    public function store(StoreAssetRequest $request): JsonResponse
    {
        $validatedData = $request->validated();

        // Auto-generate asset_code if not provided
        if (empty($validatedData['asset_code'])) {
            $validatedData['asset_code'] = $this->generateAssetCode();
        }

        $asset = Asset::create($validatedData);

        // Auto-generate QR identity for new asset
        $qrIdentity = AssetQrIdentity::create([
            'asset_id' => $asset->id,
        ]);
        $asset->update(['qr_value' => $qrIdentity->payload]);

        $asset->load(['qrIdentity', 'currentAssignment.employee', 'currentAssignment.assignedByUser', 'supplier']);

        return response()->json([
            'message' => 'Asset created successfully.',
            'asset' => $this->transformAsset($asset),
        ], 201);
    }

    /**
     * Display the specified asset.
     * 
     * GET /api/assets/{asset}
     */
    public function show(Request $request, Asset $asset): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasOperationalAccess()) {
            $employeeId = $user->employee?->id;
            if (!$employeeId || $asset->currentAssignment?->employee_id !== $employeeId) {
                return response()->json([
                    'message' => 'Forbidden. You can only view assets assigned to you.',
                ], 403);
            }
        }

        $asset->load([
            'currentAssignment.employee',
            'currentAssignment.assignedByUser',
            'qrIdentity',
            'supplier',
            'assignments' => fn($q) => $q->with(['employee', 'assignedByUser'])->orderByDesc('assigned_at')->limit(10),
        ]);

        return response()->json([
            'asset' => $this->transformAsset($asset, includeHistory: true),
        ]);
    }

    /**
     * Update the specified asset.
     * Manager/Technician only.
     * 
     * PATCH /api/assets/{asset}
     */
    public function update(UpdateAssetRequest $request, Asset $asset): JsonResponse
    {
        $asset->update($request->validated());

        $asset->load(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'qrIdentity', 'supplier']);

        return response()->json([
            'message' => 'Asset updated successfully.',
            'asset' => $this->transformAsset($asset),
        ]);
    }

    /**
     * Remove the specified asset.
     * Manager/Technician only.
     * Cannot delete if asset is currently assigned.
     * 
     * DELETE /api/assets/{asset}
     */
    public function destroy(Request $request, Asset $asset): JsonResponse
    {
        // Check if asset is currently assigned
        if ($asset->isAssigned()) {
            return response()->json([
                'message' => 'Cannot delete asset that is currently assigned.',
                'error' => 'ASSET_ASSIGNED',
            ], 422);
        }

        $asset->delete();

        return response()->json([
            'message' => 'Asset deleted successfully.',
        ]);
    }

    /**
     * Hand over asset to a department.
     * Legacy employee-based payloads are still accepted for backward compatibility.
     *
     * POST /api/assets/{asset}/assign
     */
    public function assign(AssignAssetRequest $request, Asset $asset): JsonResponse
    {
        return \DB::transaction(function () use ($request, $asset) {
            // Lock the asset row for update to prevent race conditions
            $lockedAsset = Asset::where('id', $asset->id)->lockForUpdate()->first();

            // Check if asset is locked (off_service or maintenance)
            if ($lockedAsset->isLocked()) {
                return response()->json([
                    'message' => $lockedAsset->getLockReason() ?? 'Asset is currently unavailable.',
                    'error' => 'ASSET_LOCKED',
                    'asset_status' => $lockedAsset->status,
                ], 422);
            }

            // Check if asset status allows assignment (must be active)
            if ($lockedAsset->status !== Asset::STATUS_ACTIVE) {
                return response()->json([
                    'message' => 'Cannot assign asset that is not active.',
                    'error' => 'ASSET_NOT_ACTIVE',
                    'asset_status' => $lockedAsset->status,
                ], 422);
            }

            // Re-check if asset is already assigned (with lock held)
            $existingAssignment = AssetAssignment::where('asset_id', $lockedAsset->id)
                ->whereNull('unassigned_at')
                ->lockForUpdate()
                ->first();

            if ($existingAssignment) {
                $currentAssignee = $existingAssignment->employee;
                return response()->json([
                    'message' => 'Asset is already handed over.',
                    'error' => 'ALREADY_ASSIGNED',
                    'current_assignment' => [
                        'department_name' => $existingAssignment->department_name,
                        'employee_id' => $currentAssignee?->id,
                        'employee_code' => $currentAssignee?->employee_code,
                        'full_name' => $currentAssignee?->full_name,
                    ],
                ], 422);
            }

            $employeeId = $request->integer('employee_id') ?: null;
            $employee = $employeeId ? Employee::query()->find($employeeId) : null;
            $departmentName = trim((string) $request->input('department_name', ''));
            if ($departmentName === '' && $employee?->department) {
                $departmentName = $employee->department;
            }

            // Create assignment
            $assignment = AssetAssignment::create([
                'asset_id' => $lockedAsset->id,
                'employee_id' => $employee?->id,
                'department_name' => $departmentName !== '' ? $departmentName : null,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);

            $assignment->load(['employee', 'assignedByUser']);

            return response()->json([
                'message' => 'Asset handed over successfully.',
                'assignment' => $assignment,
            ]);
        });
    }

    /**
     * Unassign asset from current employee.
     * Manager/Technician only.
     * Uses transaction + pessimistic lock to ensure consistency.
     * 
     * POST /api/assets/{asset}/unassign
     */
    public function unassign(Request $request, Asset $asset): JsonResponse
    {
        return \DB::transaction(function () use ($asset) {
            // Find and lock the active assignment
            $currentAssignment = AssetAssignment::where('asset_id', $asset->id)
                ->whereNull('unassigned_at')
                ->lockForUpdate()
                ->first();

            if (!$currentAssignment) {
                return response()->json([
                    'message' => 'Asset is not currently assigned.',
                    'error' => 'NOT_ASSIGNED',
                ], 422);
            }

            // Load current assignment target before updating
            $currentAssignment->load('employee');
            $employee = $currentAssignment->employee;

            // Mark assignment as ended
            $currentAssignment->update([
                'unassigned_at' => now(),
            ]);

            return response()->json([
                'message' => 'Asset handover cleared successfully.',
                'previous_assignment' => [
                    'department_name' => $currentAssignment->department_name,
                    'employee_id' => $employee?->id,
                    'employee_code' => $employee?->employee_code,
                    'full_name' => $employee?->full_name,
                ],
            ]);
        });
    }

    /**
     * Get assets available for assignment (not currently assigned).
     * Manager/Technician only.
     * 
     * GET /api/assets/available
     */
    public function available(Request $request): JsonResponse
    {
        $assets = Asset::with(['qrIdentity', 'currentAssignment.employee', 'currentAssignment.assignedByUser', 'supplier'])
            ->where('status', Asset::STATUS_ACTIVE)
            ->unassigned()
            ->orderBy('asset_code')
            ->get();

        return response()->json([
            'assets' => $assets->map(fn($asset) => $this->transformAsset($asset)),
        ]);
    }

    /**
     * Get assets available for assignment (unassigned and movable).
     * All authenticated internal users can view this dropdown.
     * 
     * GET /api/assets/available-for-loan
     * 
     * @return JsonResponse { data: [{ value, label, asset_code, name, type }] }
     */
    public function availableForLoan(Request $request): JsonResponse
    {
        $assets = Asset::with(['qrIdentity', 'currentAssignment.employee', 'currentAssignment.assignedByUser'])
            ->availableForLoan()
            ->orderBy('asset_code')
            ->get();

        // Transform to dropdown format with null-safe label
        $dropdownAssets = $assets->map(function($asset) {
            $label = $asset->asset_code 
                ? $asset->asset_code . ' - ' . $asset->name 
                : $asset->name . ' (ID: ' . $asset->id . ')';
            
            return [
                'value' => $asset->id,
                'label' => $label,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
            ];
        });

        return response()->json([
            'data' => $dropdownAssets,
        ]);
    }

    /**
     * Regenerate QR identity for an asset.
     * Admin/HR only. Creates new QR code (old one becomes invalid).
     * 
     * POST /api/assets/{asset}/regenerate-qr
     */
    public function regenerateQr(Request $request, Asset $asset): JsonResponse
    {
        // Create new QR identity (old one stays in DB but new one is "active")
        $qrIdentity = AssetQrIdentity::create([
            'asset_id' => $asset->id,
        ]);
        $asset->update(['qr_value' => $qrIdentity->payload]);

        $asset->load(['currentAssignment.employee', 'currentAssignment.assignedByUser', 'qrIdentity', 'supplier']);

        return response()->json([
            'message' => 'QR code regenerated successfully.',
            'asset' => $this->transformAsset($asset),
        ]);
    }

    /**
     * Transform asset to consistent response structure.
     * Used across all endpoints for uniformity.
     * 
     * @param Asset $asset
     * @param bool $includeHistory Include assignment history
     * @param bool $includeCheckinStatus Include check-in status
     * @param Shift|null $preloadedShift Preloaded current shift (to avoid N+1)
     * @param array|null $preloadedCheckin Preloaded check-in data (to avoid N+1)
     */
    private function transformAsset(
        Asset $asset, 
        bool $includeHistory = false, 
        bool $includeCheckinStatus = false,
        ?Shift $preloadedShift = null,
        ?array $preloadedCheckin = null
    ): array
    {
        $currentAssignment = $asset->currentAssignment;
        $assignee = $currentAssignment?->employee;
        $assignmentTargetName = $currentAssignment?->department_name ?: $assignee?->full_name;
        $assignmentTargetType = $currentAssignment?->department_name
            ? 'department'
            : ($assignee ? 'employee' : null);

        $data = [
            'id' => $asset->id,
            'asset_code' => $asset->asset_code,
            'name' => $asset->name,
            'type' => $asset->type,
            'category' => $asset->category,
            'category_id' => $asset->category_id,
            'supplier_id' => $asset->supplier_id,
            'supplier' => $asset->supplier ? [
                'id' => $asset->supplier->id,
                'code' => $asset->supplier->code,
                'name' => $asset->supplier->name,
                'contact_person' => $asset->supplier->contact_person,
                'phone' => $asset->supplier->phone,
                'email' => $asset->supplier->email,
            ] : null,
            'location' => $asset->location,
            'status' => $asset->status,
            'notes' => $asset->notes,
            'instructions' => [
                'type' => $asset->instructions_url ? 'url' : null,
                'url' => $asset->instructions_url,
                'available' => $asset->instructions_url !== null,
            ],
            'qr_value' => $asset->qr_value ?? $asset->qrIdentity?->payload,
            'is_assigned' => $currentAssignment !== null,
            'current_assignment' => $currentAssignment ? [
                'id' => $currentAssignment->id,
                'assigned_at' => $currentAssignment->assigned_at,
                'department_name' => $currentAssignment->department_name,
                'assignment_target' => [
                    'type' => $assignmentTargetType,
                    'name' => $assignmentTargetName,
                ],
                'assignee' => $assignee ? [
                    'id' => $assignee->id,
                    'employee_code' => $assignee->employee_code,
                    'full_name' => $assignee->full_name,
                    'position' => $assignee->position,
                ] : null,
                'assigned_by' => $currentAssignment->assignedByUser ? [
                    'id' => $currentAssignment->assignedByUser->id,
                    'name' => $currentAssignment->assignedByUser->name,
                ] : null,
            ] : null,
            'qr' => $asset->qrIdentity ? [
                'uid' => $asset->qrIdentity->qr_uid,
                'payload' => $asset->qrIdentity->payload,
            ] : null,
            'created_at' => $asset->created_at,
            'updated_at' => $asset->updated_at,
        ];

        // Include assignment history for detail view
        if ($includeHistory && $asset->relationLoaded('assignments')) {
            $data['assignment_history'] = $asset->assignments->map(fn($a) => [
                'id' => $a->id,
                'assigned_at' => $a->assigned_at,
                'unassigned_at' => $a->unassigned_at,
                'is_active' => $a->unassigned_at === null,
                'department_name' => $a->department_name,
                'assignment_target' => [
                    'type' => $a->department_name ? 'department' : ($a->employee ? 'employee' : null),
                    'name' => $a->department_name ?: $a->employee?->full_name,
                ],
                'employee' => $a->employee ? [
                    'id' => $a->employee->id,
                    'employee_code' => $a->employee->employee_code,
                    'full_name' => $a->employee->full_name,
                ] : null,
                'assigned_by' => $a->assignedByUser ? [
                    'id' => $a->assignedByUser->id,
                    'name' => $a->assignedByUser->name,
                ] : null,
            ]);
        }

        // Phase 4: Include check-in status for today's current shift
        if ($includeCheckinStatus) {
            // Use preloaded data if available (batch query optimization)
            // Otherwise, fallback to single query (for single asset endpoints)
            $currentShift = $preloadedShift ?? Shift::getCurrentShift();
            
            $todayCheckin = null;
            if ($preloadedCheckin !== null) {
                // Use preloaded check-in from batch query
                $todayCheckin = new AssetCheckin($preloadedCheckin);
                $todayCheckin->exists = true;
            } elseif ($currentShift) {
                // Fallback: single query for detail endpoints
                $today = now()->toDateString();
                $todayCheckin = AssetCheckin::where('asset_id', $asset->id)
                    ->where('shift_id', $currentShift->id)
                    ->where('shift_date', $today)
                    ->first();
            }

            $data['checkin_status'] = [
                'current_shift' => $currentShift?->toApiArray(),
                'today_checkin' => $todayCheckin?->toApiArray(),
                'is_checked_in' => $todayCheckin !== null,
            ];
        }

        return $data;
    }

    /**
     * Generate a unique asset code using sequence table.
     * Uses atomic increment to prevent race conditions.
     * 
     * Format: EQUIP-YYYYMM-NNNN
     * 
     * @return string Generated unique asset code
     */
    private function generateAssetCode(): string
    {
        return \App\Models\AssetCodeSequence::generateNextCode('EQUIP');
    }
}
