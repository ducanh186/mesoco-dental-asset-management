<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewRequestRequest;
use App\Models\AssetRequest;
use App\Models\MaintenanceEvent;
use App\Models\RequestEvent;
use App\Models\User;
use App\Services\MaintenanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;

class ReviewRequestController extends Controller
{
    public function __construct(
        protected MaintenanceService $maintenanceService
    ) {}

    /**
     * Display a listing of requests for review.
     *
     * GET /api/review-requests
     * Query params: status, type, search, per_page
     */
    public function index(HttpRequest $httpRequest): JsonResponse
    {
        $user = $httpRequest->user();

        if (!$user->can('viewReviewQueue', AssetRequest::class)) {
            return response()->json([
                'message' => 'You are not authorized to view the review queue.',
            ], 403);
        }

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

        $query = AssetRequest::with([
            'asset:id,asset_code,name',
            'requester',
            'reviewer',
            'assignee:id,name,email',
        ]);

        $status = $httpRequest->input('status', AssetRequest::STATUS_SUBMITTED);
        $query->byStatus($status);

        $query->byType($httpRequest->input('type'))
            ->search($httpRequest->input('search'));

        $query->orderByRaw("CASE severity
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
            ELSE 5 END ASC")
            ->orderBy('created_at', 'asc');

        $requests = $query->paginate($perPage);

        return response()->json([
            'requests' => collect($requests->items())->map(
                fn ($request) => $request->toApiArray(false)
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
     * Review (approve/reject) a request.
     *
     * POST /api/requests/{id}/review
     */
    public function review(ReviewRequestRequest $httpRequest, int $id): JsonResponse
    {
        $user = $httpRequest->user();
        $assetRequest = AssetRequest::with(['items.asset'])->find($id);

        if (!$assetRequest) {
            return response()->json([
                'message' => 'Request not found.',
            ], 404);
        }

        if (!$user->can('review', $assetRequest)) {
            if (!$assetRequest->canBeReviewed()) {
                return response()->json([
                    'message' => 'This request cannot be reviewed in its current status.',
                ], 422);
            }

            return response()->json([
                'message' => 'You are not authorized to review this request.',
            ], 403);
        }

        $validated = $httpRequest->validated();
        $action = strtoupper($validated['action']);
        $note = $validated['note'] ?? null;

        try {
            DB::beginTransaction();

            $assignee = null;
            $maintenanceEvent = null;

            if ($action === 'APPROVE') {
                $assignee = $this->resolveTechnicianAssignee(
                    $assetRequest,
                    $validated['assigned_to_user_id'] ?? null
                );

                $success = $assetRequest->approve($user, $note, $assignee);

                if (!$success) {
                    DB::rollBack();

                    return response()->json([
                        'message' => 'Failed to review request.',
                    ], 500);
                }

                if ($assetRequest->requiresTechnicianAssignment()) {
                    $maintenanceEvent = $this->createMaintenanceTicket($assetRequest, $assignee, $user);

                    $assetRequest->logEvent(RequestEvent::TYPE_DISPATCHED, $user, [
                        'assigned_to' => [
                            'id' => $assignee->id,
                            'name' => $assignee->name,
                            'email' => $assignee->email,
                        ],
                        'maintenance_event' => [
                            'id' => $maintenanceEvent->id,
                            'code' => $maintenanceEvent->code,
                            'status' => $maintenanceEvent->status,
                        ],
                    ]);
                }
            } else {
                $success = $assetRequest->reject($user, $note);

                if (!$success) {
                    DB::rollBack();

                    return response()->json([
                        'message' => 'Failed to review request.',
                    ], 500);
                }
            }

            DB::commit();
        } catch (InvalidArgumentException $exception) {
            DB::rollBack();

            return response()->json([
                'message' => $exception->getMessage(),
                'errors' => [
                    'assigned_to_user_id' => [$exception->getMessage()],
                ],
            ], 422);
        } catch (\Throwable $exception) {
            DB::rollBack();

            return response()->json([
                'message' => 'Failed to review request.',
                'error' => config('app.debug') ? $exception->getMessage() : null,
            ], 500);
        }

        $assetRequest->load([
            'asset:id,asset_code,name',
            'requester',
            'reviewer',
            'assignee:id,name,email',
            'items.asset',
            'items.fromShift',
            'items.toShift',
            'events.actor',
            'approvals.reviewer',
        ]);

        $response = [
            'message' => "Request {$action}D successfully.",
            'request' => $assetRequest->toApiArray(true, true),
        ];

        if (isset($maintenanceEvent) && $maintenanceEvent) {
            $response['maintenance_event'] = $maintenanceEvent->loadMissing([
                'asset:id,name,asset_code,status',
                'assignedUser:id,name,email',
            ]);
        }

        return response()->json($response);
    }

    private function resolveTechnicianAssignee(AssetRequest $assetRequest, ?int $assignedToUserId): ?User
    {
        if (!$assignedToUserId) {
            if ($assetRequest->requiresTechnicianAssignment()) {
                throw new InvalidArgumentException(
                    'Phải chỉ định kỹ thuật viên trước khi duyệt phiếu báo cáo sự cố.'
                );
            }

            return null;
        }

        $assignee = User::query()->find($assignedToUserId);

        if (!$assignee || !$assignee->isTechnician()) {
            throw new InvalidArgumentException(
                'Người được phân công phải là kỹ thuật viên hợp lệ.'
            );
        }

        return $assignee;
    }

    private function createMaintenanceTicket(
        AssetRequest $assetRequest,
        ?User $assignee,
        User $reviewer
    ): MaintenanceEvent {
        if (!$assetRequest->asset_id) {
            throw new InvalidArgumentException(
                'Phiếu báo cáo sự cố chưa gắn thiết bị nên không thể chuyển cho kỹ thuật viên.'
            );
        }

        if (!$assignee) {
            throw new InvalidArgumentException(
                'Phiếu báo cáo sự cố cần có kỹ thuật viên được phân công.'
            );
        }

        return $this->maintenanceService->create([
            'asset_id' => $assetRequest->asset_id,
            'type' => MaintenanceEvent::TYPE_REPAIR,
            'planned_at' => now()->addMinute()->toDateTimeString(),
            'priority' => $this->mapSeverityToPriority($assetRequest->severity),
            'note' => $this->buildIncidentDispatchNote($assetRequest),
            'assigned_to_user_id' => $assignee->id,
        ], $reviewer);
    }

    private function mapSeverityToPriority(?string $severity): string
    {
        return match ($severity) {
            AssetRequest::SEVERITY_CRITICAL => MaintenanceEvent::PRIORITY_URGENT,
            AssetRequest::SEVERITY_HIGH => MaintenanceEvent::PRIORITY_HIGH,
            AssetRequest::SEVERITY_LOW => MaintenanceEvent::PRIORITY_LOW,
            default => MaintenanceEvent::PRIORITY_NORMAL,
        };
    }

    private function buildIncidentDispatchNote(AssetRequest $assetRequest): string
    {
        $parts = array_filter([
            "Incident request {$assetRequest->code}",
            $assetRequest->title,
            $assetRequest->description,
            $assetRequest->suspected_cause
                ? "Nguyên nhân nghi ngờ: {$assetRequest->suspected_cause}"
                : null,
            $assetRequest->incident_at
                ? 'Thời điểm xảy ra: ' . $assetRequest->incident_at->format('Y-m-d H:i')
                : null,
        ]);

        return implode(' | ', $parts);
    }
}
