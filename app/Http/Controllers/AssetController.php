<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignAssetRequest;
use App\Models\Assignment;
use App\Models\AssignmentDetail;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\AssetQrIdentity;
use App\Models\AssetReturn;
use App\Models\Employee;
use App\Models\PurchaseOrderItem;
use App\Models\Shift;
use App\Models\User;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AssetController extends Controller
{
    /**
     * Display a listing of all assets.
     * 
     * SECURITY: This endpoint is protected by route middleware (role:manager,technician).
     * DO NOT add auto-filtering logic here - that's a security footgun.
     * Use my-assigned-assets/dropdown for employee-facing responsible assets.
     * 
     * GET /api/assets (Manager/Technician only via route middleware)
     * Query params: search, type, status, per_page, include_checkin_status
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->input('per_page', 15), 100);
        $includeCheckinStatus = $request->boolean('include_checkin_status', false);

        $query = Asset::with(['currentAssignment.employee.user', 'currentAssignment.assignedByUser', 'supplier', 'locationDefinition', 'latestQrIdentity'])
            ->search($request->input('search'))
            ->byType($request->input('type'))
            ->byCategory($request->input('category'))
            ->byStatus($request->input('status'))
            ->byLocation($request->input('location'));

        // Filter by assignment status if provided
        if ($request->has('assigned')) {
            if ($request->boolean('assigned')) {
                $query->whereHas('currentAssignment');
            } else {
                $query->whereDoesntHave('currentAssignment');
            }
        }

        $summary = $this->assetCatalogSummary();
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
            'summary' => $summary,
            'available_types' => Asset::TYPES,
            'available_categories' => Asset::CATEGORIES,
            'available_statuses' => Asset::STATUSES,
        ]);
    }

    private function assetCatalogSummary(): array
    {
        return [
            'total' => Asset::query()->count(),
            'available' => Asset::query()
                ->where('status', Asset::STATUS_ACTIVE)
                ->whereDoesntHave('currentAssignment')
                ->count(),
            'assigned' => Asset::query()
                ->whereHas('currentAssignment')
                ->count(),
            'maintenance' => Asset::query()
                ->where('status', Asset::STATUS_MAINTENANCE)
                ->count(),
            'inventorying' => Asset::query()
                ->where('status', Asset::STATUS_INVENTORYING)
                ->count(),
        ];
    }

    /**
     * Get assets assigned to the current employee in dropdown format.
     *
     * GET /api/my-assigned-assets/dropdown
     *
     * @return JsonResponse { data: [{ value, label, asset_code, name, type, responsible_employee }] }
     */
    public function myAssignedAssetsDropdown(Request $request): JsonResponse
    {
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee) {
            return response()->json([
                'data' => [],
            ]);
        }

        $assets = Asset::with(['currentAssignment.employee.user', 'currentAssignment.assignedByUser', 'locationDefinition'])
            ->whereHas('currentAssignment', function ($query) use ($employee) {
                $query->where('employee_id', $employee->id);
            })
            ->where('status', Asset::STATUS_ACTIVE)
            ->orderBy('asset_code')
            ->get();

        // Transform to dropdown format with null-safe label
        $dropdownAssets = $assets->map(function (Asset $asset) {
            $label = $asset->asset_code 
                ? $asset->asset_code . ' - ' . $asset->name 
                : $asset->name . ' (ID: ' . $asset->id . ')';
            
            return [
                'value' => $asset->id,
                'label' => $label,
                'asset_code' => $asset->asset_code,
                'name' => $asset->name,
                'type' => $asset->type,
                'category' => Asset::displayCategory($asset->category),
                'raw_category' => $asset->category,
                'location' => $this->transformLocation($asset),
                'location_name' => $this->locationLabel($asset),
                'responsible_employee' => $this->transformEmployee($asset->currentAssignment?->employee),
                'assignedTo' => $asset->currentAssignment?->employee?->full_name,
                'status' => $asset->status,
                'is_locked' => $asset->isLocked(),
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

        $asset->load(['currentAssignment.employee.user', 'currentAssignment.assignedByUser', 'supplier', 'locationDefinition']);

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
            if (!$employeeId || !$asset->isAssignedToResponsibleEmployee($user->employee)) {
                return response()->json([
                    'message' => 'Forbidden. You can only view assets you are responsible for.',
                ], 403);
            }
        }

        $asset->load([
            'currentAssignment.employee.user',
            'currentAssignment.assignedByUser',
            'supplier',
            'locationDefinition',
            'latestQrIdentity',
            'assignments' => fn($q) => $q->with(['employee.user', 'assignedByUser'])->orderByDesc('assigned_at')->limit(10),
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

        $asset->load(['currentAssignment.employee.user', 'currentAssignment.assignedByUser', 'supplier', 'locationDefinition']);

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
     * Assign a responsible employee to an asset.
     *
     * POST /api/assets/{asset}/assign
     */
    public function assign(AssignAssetRequest $request, Asset $asset): JsonResponse
    {
        return DB::transaction(function () use ($request, $asset) {
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

            $staffUser = $this->resolveAssignmentUser($request);

            if (!$staffUser) {
                return response()->json([
                    'message' => 'Selected assignment user could not be resolved.',
                    'error' => 'STAFF_NOT_FOUND',
                ], 422);
            }

            $employee = $staffUser->employee;

            $assignmentRecord = Assignment::create([
                'staff_id' => $staffUser->id,
                'admin_id' => $request->user()->id,
                'assign_date' => now(),
                'note' => $request->input('department_name'),
                'approved_by' => $request->user()->id,
            ]);

            $assignmentDetail = AssignmentDetail::create([
                'assignment_id' => $assignmentRecord->id,
                'asset_id' => $lockedAsset->id,
            ]);

            $assignment = AssetAssignment::create([
                'asset_id' => $lockedAsset->id,
                'employee_id' => $employee?->id,
                'department_name' => null,
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);

            $assignment->load(['employee', 'assignedByUser']);

            return response()->json([
                'message' => 'Responsible employee assigned successfully.',
                'assignment' => [
                    'id' => $assignmentRecord->id,
                    'detail_id' => $assignmentDetail->id,
                    'staff_id' => $staffUser->id,
                    'employee_id' => $employee?->id,
                    'admin_id' => $request->user()->id,
                    'assigned_by' => $request->user()->id,
                    'approved_by' => $request->user()->id,
                    'assign_date' => $assignmentRecord->assign_date,
                    'staff' => [
                        'id' => $staffUser->id,
                        'username' => $staffUser->username,
                        'full_name' => $staffUser->full_name,
                    ],
                    'legacy_assignment_id' => $assignment->id,
                ],
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
        return DB::transaction(function () use ($request, $asset) {
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

            $activeAssignment = Assignment::query()
                ->whereHas('details', function ($query) use ($asset) {
                    $query->where('asset_id', $asset->id);
                })
                ->whereDoesntHave('returnRecord')
                ->with('staff')
                ->lockForUpdate()
                ->latest('assign_date')
                ->first();

            $returnRecord = null;
            if ($activeAssignment) {
                $returnRecord = AssetReturn::create([
                    'assignment_id' => $activeAssignment->id,
                    'staff_id' => $activeAssignment->staff_id,
                    'admin_id' => $request->user()?->id,
                    'return_date' => now(),
                    'reason' => 'Returned from asset workspace.',
                    'approved_by' => $request->user()?->id,
                ]);
            }

            $currentAssignment->update([
                'unassigned_at' => now(),
            ]);

            return response()->json([
                'message' => 'Asset handover cleared successfully.',
                'previous_assignment' => [
                    'assignment_id' => $activeAssignment?->id,
                    'return_id' => $returnRecord?->id,
                    'staff_id' => $activeAssignment?->staff_id,
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
        $assets = Asset::with(['currentAssignment.employee.user', 'currentAssignment.assignedByUser', 'supplier', 'locationDefinition', 'latestQrIdentity'])
            ->where('status', Asset::STATUS_ACTIVE)
            ->unassigned()
            ->orderBy('asset_code')
            ->get();

        return response()->json([
            'assets' => $assets->map(fn (Asset $asset) => $this->transformAsset($asset)),
        ]);
    }

    public function regenerateQr(Request $request, Asset $asset): JsonResponse
    {
        return DB::transaction(function () use ($asset) {
            $qrIdentity = AssetQrIdentity::create([
                'qr_uid' => (string) Str::uuid(),
                'asset_id' => $asset->id,
                'payload_version' => 'v1',
                'printed_at' => now(),
            ]);

            $payload = $this->buildQrPayload($qrIdentity);

            $asset->forceFill([
                'qr_value' => $payload,
                'qr_code' => $payload,
            ])->save();

            $asset->load([
                'currentAssignment.employee.user',
                'currentAssignment.assignedByUser',
                'supplier',
                'locationDefinition',
                'latestQrIdentity',
            ]);

            return response()->json([
                'message' => 'QR code regenerated successfully.',
                'asset' => $this->transformAsset($asset),
            ]);
        });
    }

    public function resolveQr(Request $request): JsonResponse
    {
        $payload = trim((string) $request->input('payload', ''));
        $parsedPayload = $this->parseQrResolvable($payload);

        if (!$parsedPayload) {
            return response()->json([
                'message' => 'QR payload format is invalid.',
                'error' => 'INVALID_QR_FORMAT',
            ], 422);
        }

        $qrIdentity = $this->findQrIdentity($parsedPayload['qr_uid']);

        if (!$qrIdentity) {
            return response()->json([
                'message' => 'QR identity was not found.',
                'error' => 'QR_NOT_FOUND',
            ], 404);
        }

        $asset = $qrIdentity->asset;

        if (!$asset || $asset->trashed()) {
            return response()->json([
                'message' => 'The resolved asset is no longer available.',
                'error' => 'ASSET_DELETED',
            ], 404);
        }

        $asset->load($this->assetPortalRelations());

        return response()->json([
            'message' => 'QR resolved successfully.',
            'asset' => $this->transformAssetPortal($asset, $request->user()),
            'portal_url' => route('asset-portal.show', ['qrUid' => $qrIdentity->qr_uid]),
        ]);
    }

    public function portal(Request $request, string $qrUid): View|RedirectResponse
    {
        if (!$request->user()) {
            return redirect()->route('login', [
                'redirect' => "/asset-portal/{$qrUid}",
            ]);
        }

        $qrIdentity = $this->findQrIdentity($qrUid);

        abort_if(!$qrIdentity || !$qrIdentity->asset || $qrIdentity->asset->trashed(), 404);

        $asset = $qrIdentity->asset->load($this->assetPortalRelations());

        return view('asset-portal', [
            'asset' => $this->transformAssetPortal($asset, $request->user()),
            'portalUrl' => route('asset-portal.show', ['qrUid' => $qrIdentity->qr_uid]),
            'resolvedAt' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    private function assetPortalRelations(): array
    {
        return [
            'currentAssignment.employee.user',
            'currentAssignment.assignedByUser',
            'categoryDefinition',
            'supplier',
            'locationDefinition',
            'latestQrIdentity',
            'maintenanceDetails.maintenanceEvent',
            'maintenanceDetails.technician',
            'repairLogs.maintenanceEvent',
            'repairLogs.technician',
        ];
    }

    private function transformAssetPortal(Asset $asset, ?User $viewer): array
    {
        $role = $viewer?->canonicalRole() ?? 'public';
        $canSeeTechnical = in_array($role, [User::ROLE_TECHNICIAN, User::ROLE_MANAGER], true);
        $canSeeSupplier = $role === User::ROLE_MANAGER;
        $sections = ['basic'];

        if ($canSeeTechnical) {
            $sections[] = 'technical';
        }

        if ($canSeeSupplier) {
            $sections[] = 'supplier';
        }

        $data = [
            'id' => $asset->id,
            'asset_code' => $asset->asset_code,
            'serial_number' => $asset->serial_number,
            'qr_code' => $asset->qr_code ?: $asset->qr_value,
            'name' => $asset->name,
            'model' => $asset->model,
            'configuration' => $asset->configuration,
            'status' => $asset->status,
            'asset_status' => $asset->lifecycle_status,
            'lifecycle_status' => $asset->lifecycle_status,
            'category' => Asset::displayCategory($asset->category),
            'raw_category' => $asset->category,
            'category_name' => $asset->categoryDefinition?->name ?? Asset::displayCategory($asset->category),
            'location_name' => $this->locationLabel($asset),
            'location' => $this->transformLocation($asset),
            'responsible_employee' => $this->transformEmployee($asset->currentAssignment?->employee),
            'current_user' => $asset->currentAssignment?->employee?->full_name,
            'warranty_expiry' => optional($asset->warranty_expiry)->format('Y-m-d'),
            'warranty_status' => $this->transformWarrantyStatus($asset),
            'qr' => $this->transformQr($asset),
            'visibility' => [
                'role' => $role,
                'sections' => $sections,
            ],
            'available_actions' => $this->assetPortalActions($role),
        ];

        if ($canSeeTechnical) {
            $data['technical'] = $this->transformAssetPortalTechnical($asset);
        }

        if ($canSeeSupplier) {
            $purchaseOrigin = $this->latestPurchaseOrigin($asset);
            $supplier = $purchaseOrigin?->purchaseOrder?->supplier ?? $asset->supplier;
            $purchasePrice = $this->assetPurchasePrice($asset);

            $data['purchase_price'] = $purchasePrice;
            $data['purchase_date'] = $purchaseOrigin?->purchaseOrder?->order_date
                ? $purchaseOrigin->purchaseOrder->order_date->format('Y-m-d')
                : optional($asset->purchase_date)->format('Y-m-d');
            $data['supplier'] = $supplier ? [
                'id' => $supplier->id,
                'code' => $supplier->code,
                'name' => $supplier->name,
                'contact_person' => $supplier->contact_person,
                'phone' => $supplier->phone,
                'email' => $supplier->email,
                'address' => $supplier->address,
            ] : null;
        }

        return $data;
    }

    private function assetPortalActions(string $role): array
    {
        return match ($role) {
            User::ROLE_MANAGER => [
                'view_basic',
                'view_technical',
                'view_supplier',
                'regenerate_qr',
                'review_disposal',
            ],
            User::ROLE_TECHNICIAN => [
                'view_basic',
                'view_technical',
                'open_maintenance',
                'inventory_check',
            ],
            User::ROLE_EMPLOYEE => [
                'view_basic',
                'report_issue',
            ],
            default => [
                'view_basic',
            ],
        };
    }

    private function transformWarrantyStatus(Asset $asset): array
    {
        if (!$asset->warranty_expiry) {
            return [
                'status' => 'unknown',
                'label' => 'Chưa có ngày hết hạn bảo hành',
                'expires_at' => null,
            ];
        }

        $expiry = $asset->warranty_expiry->copy()->endOfDay();
        $active = $expiry->greaterThanOrEqualTo(now());

        return [
            'status' => $active ? 'active' : 'expired',
            'label' => $active ? 'Còn bảo hành' : 'Hết bảo hành',
            'expires_at' => $asset->warranty_expiry->format('Y-m-d'),
        ];
    }

    private function transformAssetPortalTechnical(Asset $asset): array
    {
        $lastMaintenance = $asset->maintenanceDetails
            ->sortByDesc(fn ($detail) => $detail->completed_at ?? $detail->logged_at ?? $detail->created_at)
            ->first();
        $lastMaintenanceDate = $lastMaintenance
            ? ($lastMaintenance->completed_at
                ?? $lastMaintenance->maintenanceEvent?->completed_at
                ?? $lastMaintenance->logged_at)
            : null;
        $purchasePrice = $this->assetPurchasePrice($asset);
        $depreciationRate = $this->assetDepreciationRate($asset);
        $repairLogs = $asset->repairLogs->isNotEmpty()
            ? $asset->repairLogs
            : $asset->maintenanceDetails;

        return [
            'device_status' => $asset->lifecycle_status,
            'last_maintenance_date' => $lastMaintenanceDate?->format('Y-m-d H:i:s'),
            'last_issue_note' => $this->normalizeQrPortalText($lastMaintenance?->issue_description),
            'last_action_taken' => $this->normalizeQrPortalText($lastMaintenance?->action_taken),
            'current_depreciation_rate' => $depreciationRate,
            'remaining_value' => $purchasePrice !== null && $depreciationRate !== null
                ? round(max(0, $purchasePrice * (1 - ($depreciationRate / 100))), 2)
                : null,
            'repair_logs' => $repairLogs
                ->sortByDesc(fn ($log) => $log->completed_at ?? $log->logged_at ?? $log->created_at)
                ->take(10)
                ->values()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'status' => $log->status,
                    'issue_description' => $this->normalizeQrPortalText($log->issue_description),
                    'action_taken' => $this->normalizeQrPortalText($log->action_taken),
                    'cost' => $log->cost !== null ? (float) $log->cost : null,
                    'started_at' => $log->started_at?->toIso8601String(),
                    'completed_at' => $log->completed_at?->toIso8601String(),
                    'logged_at' => $log->logged_at?->toIso8601String(),
                    'technician' => $log->technician ? [
                        'id' => $log->technician->id,
                        'username' => $log->technician->username,
                        'full_name' => $log->technician->full_name,
                    ] : null,
                ]),
        ];
    }

    private function normalizeQrPortalText(?string $value): ?string
    {
        if ($value === null || !preg_match('/(?:Ã|Â|áº|á»)/u', $value)) {
            return $value;
        }

        $source = preg_replace('/Ã\s+/', 'Ã  ', $value) ?? $value;
        $decoded = @iconv('UTF-8', 'Windows-1252//IGNORE', $source);

        if (!is_string($decoded) || $decoded === '' || !mb_check_encoding($decoded, 'UTF-8')) {
            return $value;
        }

        return $decoded;
    }

    private function assetPurchasePrice(Asset $asset): ?float
    {
        $value = $asset->purchase_price ?? $asset->purchase_cost;

        return $value !== null ? (float) $value : null;
    }

    private function assetDepreciationRate(Asset $asset): ?float
    {
        $value = $asset->current_depreciation_rate ?? $asset->depreciation_rate;

        return $value !== null ? (float) $value : null;
    }

    private function latestPurchaseOrigin(Asset $asset): ?PurchaseOrderItem
    {
        return PurchaseOrderItem::query()
            ->with('purchaseOrder.supplier')
            ->join('purchase_orders', 'purchase_order_items.purchase_order_id', '=', 'purchase_orders.id')
            ->where('asset_id', $asset->id)
            ->whereHas('purchaseOrder')
            ->orderByDesc('purchase_orders.order_date')
            ->orderByDesc('purchase_order_items.id')
            ->select('purchase_order_items.*')
            ->first();
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
        $assignmentTargetName = $assignee?->full_name;
        $assignmentTargetType = $assignee ? 'employee' : null;

        $data = [
            'id' => $asset->id,
            'asset_code' => $asset->asset_code,
            'serial_number' => $asset->serial_number,
            'name' => $asset->name,
            'model' => $asset->model,
            'configuration' => $asset->configuration,
            'type' => $asset->type,
            'category' => Asset::displayCategory($asset->category),
            'raw_category' => $asset->category,
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
            'location' => $this->transformLocation($asset),
            'location_name' => $this->locationLabel($asset),
            'status' => $asset->status,
            'lifecycle_status' => $asset->lifecycle_status,
            'qr_code' => $asset->qr_code ?: $asset->qr_value,
            'notes' => $asset->notes,
            'purchase_date' => optional($asset->purchase_date)->format('Y-m-d'),
            'purchase_cost' => $asset->purchase_cost ? (float) $asset->purchase_cost : null,
            'purchase_price' => $asset->purchase_price ? (float) $asset->purchase_price : ($asset->purchase_cost ? (float) $asset->purchase_cost : null),
            'warranty_expiry' => optional($asset->warranty_expiry)->format('Y-m-d'),
            'current_depreciation_rate' => $asset->current_depreciation_rate !== null
                ? (float) $asset->current_depreciation_rate
                : ($asset->depreciation_rate !== null ? (float) $asset->depreciation_rate : null),
            'qr' => $this->transformQr($asset),
            'valuation' => $asset->getValuationData(),
            'instructions' => [
                'type' => $asset->instructions_url ? 'url' : null,
                'url' => $asset->instructions_url,
                'available' => $asset->instructions_url !== null,
            ],
            'is_assigned' => $currentAssignment !== null,
            'responsible_employee' => $this->transformEmployee($assignee),
            'current_assignment' => $currentAssignment ? [
                'id' => $currentAssignment->id,
                'assigned_at' => $currentAssignment->assigned_at,
                'department_name' => null,
                'assignment_target' => [
                    'type' => $assignmentTargetType,
                    'name' => $assignmentTargetName,
                ],
                'assignee' => $this->transformEmployee($assignee),
                'assigned_by' => $currentAssignment->assignedByUser ? [
                    'id' => $currentAssignment->assignedByUser->id,
                    'name' => $currentAssignment->assignedByUser->name,
                ] : null,
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
                'department_name' => null,
                'assignment_target' => [
                    'type' => $a->employee ? 'employee' : null,
                    'name' => $a->employee?->full_name,
                ],
                'employee' => $this->transformEmployee($a->employee),
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

    private function transformEmployee(?Employee $employee): ?array
    {
        if (!$employee) {
            return null;
        }

        $linkedUser = $employee->user;

        return [
            'id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'full_name' => $employee->full_name,
            'position' => $employee->position,
            'department' => $employee->department,
            'user' => $linkedUser ? [
                'id' => $linkedUser->id,
                'username' => $linkedUser->username,
                'full_name' => $linkedUser->full_name,
                'status' => $linkedUser->status,
            ] : null,
        ];
    }

    private function transformQr(Asset $asset): ?array
    {
        $latestQrIdentity = $asset->relationLoaded('latestQrIdentity') ? $asset->latestQrIdentity : null;
        $payload = $latestQrIdentity ? $this->buildQrPayload($latestQrIdentity) : ($asset->qr_code ?: $asset->qr_value);

        if (!$payload) {
            return null;
        }

        return [
            'uid' => $latestQrIdentity?->qr_uid,
            'payload' => $payload,
            'portal_url' => $latestQrIdentity ? route('asset-portal.show', ['qrUid' => $latestQrIdentity->qr_uid]) : null,
            'printed_at' => $latestQrIdentity?->printed_at?->toIso8601String(),
        ];
    }

    private function parseQrPayload(string $payload): ?array
    {
        $parts = explode('|', $payload);

        if (count($parts) !== 4) {
            return null;
        }

        [$namespace, $resourceType, $version, $qrUid] = $parts;

        if ($namespace !== 'MESOCO' || $resourceType !== 'ASSET' || $version === '' || !Str::isUuid($qrUid)) {
            return null;
        }

        return [
            'payload_version' => $version,
            'qr_uid' => $qrUid,
        ];
    }

    private function parseQrResolvable(string $value): ?array
    {
        $normalizedValue = trim($value);

        if ($normalizedValue === '') {
            return null;
        }

        $parsedPayload = $this->parseQrPayload($normalizedValue);

        if ($parsedPayload) {
            return $parsedPayload;
        }

        $path = parse_url($normalizedValue, PHP_URL_PATH);

        if (!is_string($path) || $path === '') {
            return null;
        }

        if (!preg_match('~(?:^|/)asset-portal/([0-9a-fA-F-]{36})/?$~', $path, $matches)) {
            return null;
        }

        $qrUid = $matches[1];

        if (!Str::isUuid($qrUid)) {
            return null;
        }

        return [
            'payload_version' => 'v1',
            'qr_uid' => $qrUid,
        ];
    }

    private function findQrIdentity(string $qrUid): ?AssetQrIdentity
    {
        return AssetQrIdentity::query()
            ->with(['asset' => fn ($query) => $query->withTrashed()])
            ->where('qr_uid', $qrUid)
            ->latest('id')
            ->first();
    }

    private function buildQrPayload(AssetQrIdentity $qrIdentity): string
    {
        return implode('|', ['MESOCO', 'ASSET', $qrIdentity->payload_version, $qrIdentity->qr_uid]);
    }

    private function resolveAssignmentUser(AssignAssetRequest $request): ?User
    {
        if ($request->filled('staff_id')) {
            return User::query()->find($request->integer('staff_id'));
        }

        if (!$request->filled('employee_id')) {
            return null;
        }

        $employee = Employee::query()->find($request->integer('employee_id'));

        if (!$employee) {
            return null;
        }

        $existingUser = User::query()
            ->where('employee_id', $employee->id)
            ->first();

        if ($existingUser) {
            return $existingUser;
        }

        $username = $this->generateAssignmentUsername($employee);
        $email = $employee->email ?: "employee-{$employee->id}@mesoco.local";

        if (User::query()->where('email', $email)->exists()) {
            $email = "employee-{$employee->id}-" . Str::lower(Str::random(6)) . '@mesoco.local';
        }

        return User::query()->create([
            'employee_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'username' => $username,
            'name' => $employee->full_name,
            'full_name' => $employee->full_name,
            'email' => $email,
            'password' => Hash::make(Str::random(40)),
            'role' => User::ROLE_EMPLOYEE,
            'status' => 'active',
            'must_change_password' => true,
        ]);
    }

    private function generateAssignmentUsername(Employee $employee): string
    {
        $base = trim((string) ($employee->employee_code ?: Str::slug($employee->full_name ?: 'employee', '_')));
        $base = $base !== '' ? Str::lower($base) : 'employee_' . $employee->id;
        $username = $base;
        $suffix = 1;

        while (User::query()->where('username', $username)->exists()) {
            $suffix++;
            $username = $base . '_' . $suffix;
        }

        return $username;
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
