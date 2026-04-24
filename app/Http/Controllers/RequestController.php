<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRequestRequest;
use App\Models\AssetRequest;
use App\Models\RequestEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RequestController extends Controller
{
    /**
     * Display a listing of requests.
     * 
     * GET /api/requests
     * Query params: mine=1 (only own requests), type, status, search, per_page
     */
    public function index(HttpRequest $httpRequest): JsonResponse
    {
        $user = $httpRequest->user();
        $perPage = min($httpRequest->input('per_page', 15), 100);

        if (!Schema::hasTable('requests')) {
            return response()->json([
                'requests' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                ],
                'available_types' => AssetRequest::REQUESTABLE_TYPES,
                'available_statuses' => AssetRequest::STATUSES,
            ]);
        }

        $query = AssetRequest::with(['asset:id,asset_code,name', 'requester', 'reviewer', 'assignee:id,name,email']);

        // Requesters only see their own requests.
        // Operational roles can inspect the broader queue.
        if ($httpRequest->boolean('mine') || !$user->hasOperationalAccess()) {
            $employee = $user->employee;
            if (!$employee) {
                return response()->json([
                    'requests' => [],
                    'pagination' => [
                        'current_page' => 1,
                        'last_page' => 1,
                        'per_page' => $perPage,
                        'total' => 0,
                    ],
                ]);
            }
            $query->byRequester($employee->id);
        }

        // Apply filters
        $query->byType($httpRequest->input('type'))
            ->byStatus($httpRequest->input('status'))
            ->search($httpRequest->input('search'));

        // Order by created_at desc (newest first)
        $query->orderBy('created_at', 'desc');

        $requests = $query->paginate($perPage);

        return response()->json([
            'requests' => collect($requests->items())->map(
                fn($request) => $request->toApiArray(false)
            ),
            'pagination' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
            'available_types' => AssetRequest::REQUESTABLE_TYPES,
            'available_statuses' => AssetRequest::STATUSES,
        ]);
    }

    /**
     * Store a newly created request.
     * 
     * POST /api/requests
     */
    public function store(StoreRequestRequest $httpRequest): JsonResponse
    {
        $user = $httpRequest->user();
        $employee = $user->employee;

        // Ownership check: never trust requested_by from client
        if (!$employee) {
            return response()->json([
                'message' => 'You must have an employee record to create requests.',
            ], 403);
        }

        $validated = $httpRequest->validated();

        try {
            DB::beginTransaction();

            // Create the request
            $assetRequest = AssetRequest::create([
                'code' => AssetRequest::generateCode(),
                'type' => $validated['type'],
                'status' => AssetRequest::STATUS_SUBMITTED,
                'requested_by_employee_id' => $employee->id, // Always from session
                'asset_id' => collect($validated['items'] ?? [])
                    ->pluck('asset_id')
                    ->filter()
                    ->first(),
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'severity' => $validated['severity'] ?? null,
                'incident_at' => $validated['incident_at'] ?? null,
                'suspected_cause' => $validated['suspected_cause'] ?? null,
            ]);

            // Create request items
            if (!empty($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    $assetRequest->items()->create([
                        'item_kind' => $itemData['item_kind'],
                        'asset_id' => $itemData['asset_id'] ?? null,
                        'sku' => $itemData['sku'] ?? null,
                        'name' => $itemData['name'] ?? null,
                        'qty' => $itemData['qty'] ?? null,
                        'unit' => $itemData['unit'] ?? null,
                        'from_shift_id' => $itemData['from_shift_id'] ?? null,
                        'to_shift_id' => $itemData['to_shift_id'] ?? null,
                        'from_date' => $itemData['from_date'] ?? null,
                        'to_date' => $itemData['to_date'] ?? null,
                        'note' => $itemData['note'] ?? null,
                    ]);
                }
            }

            // Log the creation event
            $assetRequest->logEvent(RequestEvent::TYPE_CREATED, $user, [
                'type' => $validated['type'],
            ]);

            DB::commit();

            // Load relationships for response
            $assetRequest->load([
                'asset:id,asset_code,name',
                'requester',
                'assignee:id,name,email',
                'items.asset',
                'items.fromShift',
                'items.toShift',
                'events.actor',
                'approvals.reviewer',
            ]);

            return response()->json([
                'message' => 'Request created successfully.',
                'request' => $assetRequest->toApiArray(true, true),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create request.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Display the specified request.
     * 
     * GET /api/requests/{id}
     */
    public function show(HttpRequest $httpRequest, int $id): JsonResponse
    {
        $user = $httpRequest->user();

        $assetRequest = AssetRequest::with([
            'requester',
            'asset:id,asset_code,name',
            'reviewer',
            'assignee:id,name,email',
            'items.asset',
            'items.fromShift',
            'items.toShift',
            'events.actor',
            'approvals.reviewer',
        ])->find($id);

        if (!$assetRequest) {
            return response()->json([
                'message' => 'Request not found.',
            ], 404);
        }

        // Authorization: check if user can view this request (IDOR protection)
        if (!$user->can('view', $assetRequest)) {
            return response()->json([
                'message' => 'You are not authorized to view this request.',
            ], 403);
        }

        return response()->json([
            'request' => $assetRequest->toApiArray(true, true),
        ]);
    }

    /**
     * Cancel a request.
     * 
     * POST /api/requests/{id}/cancel
     */
    public function cancel(HttpRequest $httpRequest, int $id): JsonResponse
    {
        $user = $httpRequest->user();

        $assetRequest = AssetRequest::find($id);

        if (!$assetRequest) {
            return response()->json([
                'message' => 'Request not found.',
            ], 404);
        }

        // Authorization: check if user can cancel this request (IDOR protection)
        if (!$user->can('cancel', $assetRequest)) {
            if (!$assetRequest->canBeCancelled()) {
                return response()->json([
                    'message' => 'This request cannot be cancelled in its current status.',
                ], 422);
            }
            return response()->json([
                'message' => 'You are not authorized to cancel this request.',
            ], 403);
        }

        $assetRequest->cancel($user);

        $assetRequest->load([
            'requester',
            'reviewer',
            'assignee:id,name,email',
            'asset:id,asset_code,name',
            'items.asset',
            'events.actor',
            'approvals.reviewer',
        ]);

        return response()->json([
            'message' => 'Request cancelled successfully.',
            'request' => $assetRequest->toApiArray(true, true),
        ]);
    }
}
