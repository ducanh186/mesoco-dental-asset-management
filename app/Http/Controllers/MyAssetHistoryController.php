<?php

namespace App\Http\Controllers;

use App\Models\AssetAssignment;
use App\Models\AssetCheckin;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * MyAssetHistoryController - Phase 6 Personal Asset History
 * 
 * Provides timeline of asset assignments and check-ins for the current user.
 * Enforces ownership server-side - users can only see their own history.
 * 
 * RBAC: All authenticated users (ownership enforced)
 */
class MyAssetHistoryController extends Controller
{
    /**
     * Event types for timeline
     */
    public const EVENT_ASSIGNED = 'assigned';
    public const EVENT_UNASSIGNED = 'unassigned';
    public const EVENT_CHECKIN = 'checkin';
    public const EVENT_CHECKOUT = 'checkout';

    /**
     * Get my asset history timeline.
     * 
     * GET /api/my-asset-history
     * Query params: 
     *   - event_type: assigned|unassigned|checkin|checkout (comma-separated)
     *   - asset_id: filter by specific asset
     *   - date_from: start date (Y-m-d)
     *   - date_to: end date (Y-m-d)
     *   - per_page: pagination (default 20, max 100)
     * 
     * Returns unified timeline of assignments and check-ins sorted by date desc.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get employee_id from user (User belongsTo Employee via employee_id)
        $employeeId = $user->employee_id;
        
        if (!$employeeId) {
            return response()->json([
                'events' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 20,
                    'total' => 0,
                ],
                'filters' => [
                    'event_types' => [
                        self::EVENT_ASSIGNED,
                        self::EVENT_UNASSIGNED,
                        self::EVENT_CHECKIN,
                        self::EVENT_CHECKOUT,
                    ],
                ],
                'message' => 'No employee profile linked to this user.',
            ]);
        }

        $perPage = min($request->input('per_page', 20), 100);
        $eventTypes = $this->parseEventTypes($request->input('event_type'));
        $assetId = $request->input('asset_id');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Collect events from different sources
        $events = collect();

        // Assignment events (assigned/unassigned)
        if ($this->shouldIncludeAssignmentEvents($eventTypes)) {
            $assignmentEvents = $this->getAssignmentEvents(
                $employeeId,
                $eventTypes,
                $assetId,
                $dateFrom,
                $dateTo
            );
            $events = $events->merge($assignmentEvents);
        }

        // Check-in events (checkin/checkout)
        if ($this->shouldIncludeCheckinEvents($eventTypes)) {
            $checkinEvents = $this->getCheckinEvents(
                $user->id, // Check-ins use user_id directly
                $eventTypes,
                $assetId,
                $dateFrom,
                $dateTo
            );
            $events = $events->merge($checkinEvents);
        }

        // Sort all events by date descending
        $sortedEvents = $events->sortByDesc('event_at')->values();

        // Manual pagination
        $page = max(1, (int) $request->input('page', 1));
        $total = $sortedEvents->count();
        $lastPage = (int) ceil($total / $perPage);
        $offset = ($page - 1) * $perPage;
        $paginatedEvents = $sortedEvents->slice($offset, $perPage)->values();

        return response()->json([
            'events' => $paginatedEvents,
            'pagination' => [
                'current_page' => $page,
                'last_page' => max(1, $lastPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
            'filters' => [
                'event_types' => [
                    self::EVENT_ASSIGNED,
                    self::EVENT_UNASSIGNED,
                    self::EVENT_CHECKIN,
                    self::EVENT_CHECKOUT,
                ],
            ],
        ]);
    }

    /**
     * Get summary statistics for my asset history.
     * 
     * GET /api/my-asset-history/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $employeeId = $user->employee_id;

        if (!$employeeId) {
            return response()->json([
                'summary' => [
                    'total_assignments' => 0,
                    'current_assignments' => 0,
                    'total_checkins' => 0,
                    'checkins_this_month' => 0,
                ],
            ]);
        }

        $totalAssignments = AssetAssignment::forEmployee($employeeId)->count();
        $currentAssignments = AssetAssignment::forEmployee($employeeId)->active()->count();
        $totalCheckins = AssetCheckin::forEmployee($user->id)->count();
        $checkinsThisMonth = AssetCheckin::forEmployee($user->id)
            ->whereMonth('shift_date', now()->month)
            ->whereYear('shift_date', now()->year)
            ->count();

        return response()->json([
            'summary' => [
                'total_assignments' => $totalAssignments,
                'current_assignments' => $currentAssignments,
                'total_checkins' => $totalCheckins,
                'checkins_this_month' => $checkinsThisMonth,
            ],
        ]);
    }

    /**
     * Parse event types from comma-separated string.
     */
    private function parseEventTypes(?string $eventType): array
    {
        if (!$eventType) {
            return []; // Empty means all types
        }

        $types = array_map('trim', explode(',', $eventType));
        $valid = [self::EVENT_ASSIGNED, self::EVENT_UNASSIGNED, self::EVENT_CHECKIN, self::EVENT_CHECKOUT];
        
        return array_values(array_intersect($types, $valid));
    }

    /**
     * Check if we should include assignment events.
     */
    private function shouldIncludeAssignmentEvents(array $eventTypes): bool
    {
        if (empty($eventTypes)) {
            return true;
        }
        return in_array(self::EVENT_ASSIGNED, $eventTypes) || in_array(self::EVENT_UNASSIGNED, $eventTypes);
    }

    /**
     * Check if we should include check-in events.
     */
    private function shouldIncludeCheckinEvents(array $eventTypes): bool
    {
        if (empty($eventTypes)) {
            return true;
        }
        return in_array(self::EVENT_CHECKIN, $eventTypes) || in_array(self::EVENT_CHECKOUT, $eventTypes);
    }

    /**
     * Get assignment events for employee.
     */
    private function getAssignmentEvents(
        int $employeeId,
        array $eventTypes,
        ?int $assetId,
        ?string $dateFrom,
        ?string $dateTo
    ): Collection {
        $query = AssetAssignment::with(['asset', 'assignedByUser'])
            ->forEmployee($employeeId);

        if ($assetId) {
            $query->forAsset($assetId);
        }

        $assignments = $query->get();
        $events = collect();

        foreach ($assignments as $assignment) {
            // Assigned event
            if (empty($eventTypes) || in_array(self::EVENT_ASSIGNED, $eventTypes)) {
                $assignedAt = $assignment->assigned_at;
                
                if ($this->isWithinDateRange($assignedAt, $dateFrom, $dateTo)) {
                    $events->push([
                        'id' => "assignment-{$assignment->id}-assigned",
                        'event_type' => self::EVENT_ASSIGNED,
                        'event_at' => $assignedAt?->toISOString(),
                        'event_date' => $assignedAt?->toDateString(),
                        'asset' => [
                            'id' => $assignment->asset?->id,
                            'asset_code' => $assignment->asset?->asset_code,
                            'name' => $assignment->asset?->name,
                            'type' => $assignment->asset?->type,
                        ],
                        'details' => [
                            'assigned_by' => $assignment->assignedByUser?->name,
                        ],
                    ]);
                }
            }

            // Unassigned event (if applicable)
            if ($assignment->unassigned_at && (empty($eventTypes) || in_array(self::EVENT_UNASSIGNED, $eventTypes))) {
                $unassignedAt = $assignment->unassigned_at;
                
                if ($this->isWithinDateRange($unassignedAt, $dateFrom, $dateTo)) {
                    $events->push([
                        'id' => "assignment-{$assignment->id}-unassigned",
                        'event_type' => self::EVENT_UNASSIGNED,
                        'event_at' => $unassignedAt?->toISOString(),
                        'event_date' => $unassignedAt?->toDateString(),
                        'asset' => [
                            'id' => $assignment->asset?->id,
                            'asset_code' => $assignment->asset?->asset_code,
                            'name' => $assignment->asset?->name,
                            'type' => $assignment->asset?->type,
                        ],
                        'details' => [
                            'originally_assigned_at' => $assignment->assigned_at?->toISOString(),
                        ],
                    ]);
                }
            }
        }

        return $events;
    }

    /**
     * Get check-in events for user.
     */
    private function getCheckinEvents(
        int $userId,
        array $eventTypes,
        ?int $assetId,
        ?string $dateFrom,
        ?string $dateTo
    ): Collection {
        $query = AssetCheckin::with(['asset', 'shift'])
            ->forEmployee($userId);

        if ($assetId) {
            $query->forAsset($assetId);
        }

        if ($dateFrom) {
            $query->where('shift_date', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->where('shift_date', '<=', $dateTo);
        }

        $checkins = $query->get();
        $events = collect();

        foreach ($checkins as $checkin) {
            // Check-in event
            if (empty($eventTypes) || in_array(self::EVENT_CHECKIN, $eventTypes)) {
                $events->push([
                    'id' => "checkin-{$checkin->id}-in",
                    'event_type' => self::EVENT_CHECKIN,
                    'event_at' => $checkin->checked_in_at?->toISOString(),
                    'event_date' => $checkin->shift_date?->toDateString(),
                    'asset' => [
                        'id' => $checkin->asset?->id,
                        'asset_code' => $checkin->asset?->asset_code,
                        'name' => $checkin->asset?->name,
                        'type' => $checkin->asset?->type,
                    ],
                    'details' => [
                        'shift' => $checkin->shift?->name,
                        'shift_date' => $checkin->shift_date?->toDateString(),
                        'source' => $checkin->source,
                        'notes' => $checkin->notes,
                    ],
                ]);
            }

            // Check-out event (if applicable)
            if ($checkin->checked_out_at && (empty($eventTypes) || in_array(self::EVENT_CHECKOUT, $eventTypes))) {
                $events->push([
                    'id' => "checkin-{$checkin->id}-out",
                    'event_type' => self::EVENT_CHECKOUT,
                    'event_at' => $checkin->checked_out_at?->toISOString(),
                    'event_date' => $checkin->shift_date?->toDateString(),
                    'asset' => [
                        'id' => $checkin->asset?->id,
                        'asset_code' => $checkin->asset?->asset_code,
                        'name' => $checkin->asset?->name,
                        'type' => $checkin->asset?->type,
                    ],
                    'details' => [
                        'shift' => $checkin->shift?->name,
                        'shift_date' => $checkin->shift_date?->toDateString(),
                        'checked_in_at' => $checkin->checked_in_at?->toISOString(),
                    ],
                ]);
            }
        }

        return $events;
    }

    /**
     * Check if date is within range.
     */
    private function isWithinDateRange($date, ?string $dateFrom, ?string $dateTo): bool
    {
        if (!$date) {
            return true;
        }

        $dateString = $date->toDateString();

        if ($dateFrom && $dateString < $dateFrom) {
            return false;
        }

        if ($dateTo && $dateString > $dateTo) {
            return false;
        }

        return true;
    }
}
