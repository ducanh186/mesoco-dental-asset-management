<?php

namespace App\Http\Controllers;

use App\Http\Requests\CompleteMaintenanceEventRequest;
use App\Http\Requests\StoreMaintenanceEventRequest;
use App\Http\Requests\UpdateMaintenanceEventRequest;
use App\Models\MaintenanceEvent;
use App\Services\MaintenanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * Controller for MaintenanceEvent CRUD and state transitions.
 * 
 * Phase 7: Maintenance scheduling and tracking.
 */
class MaintenanceEventController extends Controller
{
    public function __construct(
        protected MaintenanceService $maintenanceService
    ) {}

    /**
     * List maintenance events with filters and pagination.
     * 
     * GET /api/maintenance-events
     * 
     * Query params:
     * - asset_id: Filter by asset
     * - status: Filter by status (scheduled, in_progress, completed, canceled)
     * - type: Filter by type
     * - from_date: Filter planned_at >= date
     * - to_date: Filter planned_at <= date
     * - priority: Filter by priority
     * - per_page: Pagination (default 15)
     */
    public function index(Request $request): JsonResponse
    {
        $query = MaintenanceEvent::query()
            ->with([
                'asset:id,name,asset_code',
                'creator:id,name',
                'assignedUser:id,name,email',
                'details.asset:id,name,asset_code',
            ])
            ->withCount('details');

        // Filter by asset
        if ($request->filled('asset_id')) {
            $query->forAsset($request->integer('asset_id'));
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->input('priority'));
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->where('planned_at', '>=', $request->input('from_date'));
        }
        if ($request->filled('to_date')) {
            $query->where('planned_at', '<=', $request->input('to_date'));
        }

        // Overdue filter
        if ($request->boolean('overdue')) {
            $query->overdue();
        }

        // Upcoming filter (next N days)
        if ($request->filled('upcoming_days')) {
            $query->upcoming($request->integer('upcoming_days'));
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'planned_at');
        $sortDir = $request->input('sort_dir', 'asc');
        $allowedSorts = ['planned_at', 'created_at', 'priority', 'type', 'status'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir === 'desc' ? 'desc' : 'asc');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $events = $query->paginate($perPage);

        return response()->json([
            'data' => $events->items(),
            'pagination' => [
                'current_page' => $events->currentPage(),
                'per_page' => $events->perPage(),
                'total' => $events->total(),
                'last_page' => $events->lastPage(),
            ],
            'filters' => [
                'asset_id' => $request->input('asset_id'),
                'status' => $request->input('status'),
                'type' => $request->input('type'),
                'priority' => $request->input('priority'),
                'from_date' => $request->input('from_date'),
                'to_date' => $request->input('to_date'),
            ],
        ]);
    }

    /**
     * Show a single maintenance event.
     * 
     * GET /api/maintenance-events/{maintenanceEvent}
     */
    public function show(MaintenanceEvent $maintenanceEvent): JsonResponse
    {
        Gate::authorize('view', $maintenanceEvent);

        $maintenanceEvent->load([
            'asset:id,name,asset_code,type,status',
            'creator:id,name',
            'updater:id,name',
            'assignedUser:id,name,email',
            'details.asset:id,name,asset_code,type,status,location',
            'details.technician:id,name,email',
            'details.supplier:id,name,code',
        ]);

        return response()->json([
            'data' => $maintenanceEvent,
        ]);
    }

    /**
     * Create a new scheduled maintenance event.
     * 
     * POST /api/maintenance-events
     */
    public function store(StoreMaintenanceEventRequest $request): JsonResponse
    {
        $event = $this->maintenanceService->create(
            $request->validated(),
            $request->user()
        );

        $event->load([
            'asset:id,name,asset_code',
            'creator:id,name',
            'assignedUser:id,name,email',
            'details.asset:id,name,asset_code,type,status,location',
            'details.technician:id,name,email',
            'details.supplier:id,name,code',
        ]);

        return response()->json([
            'message' => 'Maintenance event scheduled successfully.',
            'data' => $event,
        ], 201);
    }

    /**
     * Update a scheduled maintenance event.
     * 
     * PUT /api/maintenance-events/{maintenanceEvent}
     */
    public function update(
        UpdateMaintenanceEventRequest $request,
        MaintenanceEvent $maintenanceEvent
    ): JsonResponse {
        $event = $this->maintenanceService->update(
            $maintenanceEvent,
            $request->validated(),
            $request->user()
        );

        $event->load([
            'asset:id,name,asset_code',
            'creator:id,name',
            'assignedUser:id,name,email',
            'details.asset:id,name,asset_code,type,status,location',
            'details.technician:id,name,email',
            'details.supplier:id,name,code',
        ]);

        return response()->json([
            'message' => 'Maintenance event updated successfully.',
            'data' => $event,
        ]);
    }

    /**
     * Delete a scheduled maintenance event.
     * 
     * DELETE /api/maintenance-events/{maintenanceEvent}
     */
    public function destroy(MaintenanceEvent $maintenanceEvent): JsonResponse
    {
        Gate::authorize('delete', $maintenanceEvent);

        $maintenanceEvent->delete();

        return response()->json([
            'message' => 'Maintenance event deleted successfully.',
        ]);
    }

    /**
     * Start a maintenance event (transition to in_progress).
     * Locks the asset automatically.
     * 
     * POST /api/maintenance-events/{maintenanceEvent}/start
     */
    public function start(Request $request, MaintenanceEvent $maintenanceEvent): JsonResponse
    {
        Gate::authorize('start', $maintenanceEvent);

        $event = $this->maintenanceService->start(
            $maintenanceEvent,
            $request->user()
        );

        $event->load([
            'asset:id,name,asset_code,status',
            'creator:id,name',
            'assignedUser:id,name,email',
            'details.asset:id,name,asset_code,type,status,location',
            'details.technician:id,name,email',
            'details.supplier:id,name,code',
        ]);

        return response()->json([
            'message' => 'Maintenance started. Asset is now locked.',
            'data' => $event,
        ]);
    }

    /**
     * Complete a maintenance event (transition to completed).
     * Unlocks the asset if no other in_progress events.
     * 
     * POST /api/maintenance-events/{maintenanceEvent}/complete
     */
    public function complete(
        CompleteMaintenanceEventRequest $request,
        MaintenanceEvent $maintenanceEvent
    ): JsonResponse {
        $validated = $request->validated();
        
        $event = $this->maintenanceService->complete(
            $maintenanceEvent,
            $request->user(),
            $validated['result_note'] ?? null,
            $validated['cost'] ?? null,
            $validated['actual_duration_minutes'] ?? null
        );

        $event->load([
            'asset:id,name,asset_code,status',
            'creator:id,name',
            'assignedUser:id,name,email',
            'details.asset:id,name,asset_code,type,status,location',
            'details.technician:id,name,email',
            'details.supplier:id,name,code',
        ]);

        return response()->json([
            'message' => 'Maintenance completed successfully.',
            'data' => $event,
        ]);
    }

    /**
     * Cancel a maintenance event (transition to canceled).
     * Unlocks the asset if no other in_progress events.
     * 
     * POST /api/maintenance-events/{maintenanceEvent}/cancel
     */
    public function cancel(Request $request, MaintenanceEvent $maintenanceEvent): JsonResponse
    {
        Gate::authorize('cancel', $maintenanceEvent);

        $event = $this->maintenanceService->cancel(
            $maintenanceEvent,
            $request->user(),
            $request->input('reason')
        );

        $event->load([
            'asset:id,name,asset_code,status',
            'creator:id,name',
            'assignedUser:id,name,email',
            'details.asset:id,name,asset_code,type,status,location',
            'details.technician:id,name,email',
            'details.supplier:id,name,code',
        ]);

        return response()->json([
            'message' => 'Maintenance canceled.',
            'data' => $event,
        ]);
    }

    /**
     * Get statistics/summary for maintenance events.
     * 
     * GET /api/maintenance-events/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $baseQuery = MaintenanceEvent::query();

        // Optional asset filter
        if ($request->filled('asset_id')) {
            $baseQuery->forAsset($request->integer('asset_id'));
        }

        $stats = [
            'total' => (clone $baseQuery)->count(),
            'scheduled' => (clone $baseQuery)->scheduled()->count(),
            'in_progress' => (clone $baseQuery)->inProgress()->count(),
            'completed' => (clone $baseQuery)->completed()->count(),
            'overdue' => (clone $baseQuery)->overdue()->count(),
            'upcoming_7_days' => (clone $baseQuery)->upcoming(7)->count(),
        ];

        // Get next upcoming events
        $upcomingEvents = MaintenanceEvent::query()
            ->scheduled()
            ->upcoming(7)
            ->with(['asset:id,name,asset_code'])
            ->orderBy('planned_at')
            ->limit(5)
            ->get();

        // Get overdue events (urgency list)
        $overdueEvents = MaintenanceEvent::query()
            ->overdue()
            ->with(['asset:id,name,asset_code'])
            ->orderBy('planned_at')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => $stats,
            'upcoming_events' => $upcomingEvents,
            'overdue_events' => $overdueEvents,
        ]);
    }
}
