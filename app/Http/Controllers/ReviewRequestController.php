<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewRequestRequest;
use App\Models\AssetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request as HttpRequest;

class ReviewRequestController extends Controller
{
    /**
     * Display a listing of requests for review.
     * Admin/HR only - shows all SUBMITTED requests by default.
     * 
     * GET /api/review-requests
     * Query params: status, type, search, per_page
     */
    public function index(HttpRequest $httpRequest): JsonResponse
    {
        $user = $httpRequest->user();

        // Authorization: only admin/HR can view review queue
        if (!$user->can('viewReviewQueue', AssetRequest::class)) {
            return response()->json([
                'message' => 'You are not authorized to view the review queue.',
            ], 403);
        }

        $perPage = min($httpRequest->input('per_page', 15), 100);

        $query = AssetRequest::with(['requester', 'reviewer']);

        // Default to SUBMITTED status for review queue
        $status = $httpRequest->input('status', AssetRequest::STATUS_SUBMITTED);
        $query->byStatus($status);

        // Apply filters
        $query->byType($httpRequest->input('type'))
            ->search($httpRequest->input('search'));

        // Order: priority/severity first (critical > high > medium > low), then by created_at
        // Use CASE WHEN for cross-database compatibility (MySQL and SQLite)
        $query->orderByRaw("CASE severity 
            WHEN 'critical' THEN 1 
            WHEN 'high' THEN 2 
            WHEN 'medium' THEN 3 
            WHEN 'low' THEN 4 
            ELSE 5 END ASC")
            ->orderBy('created_at', 'asc'); // Oldest first for FIFO

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
            'available_types' => AssetRequest::TYPES,
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

        $assetRequest = AssetRequest::find($id);

        if (!$assetRequest) {
            return response()->json([
                'message' => 'Request not found.',
            ], 404);
        }

        // Authorization: check if user can review this request
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

        $success = match ($action) {
            'APPROVE' => $assetRequest->approve($user, $note),
            'REJECT' => $assetRequest->reject($user, $note),
            default => false,
        };

        if (!$success) {
            return response()->json([
                'message' => 'Failed to review request.',
            ], 500);
        }

        $assetRequest->load(['requester', 'reviewer', 'items.asset', 'events.actor']);

        return response()->json([
            'message' => "Request {$action}D successfully.",
            'request' => $assetRequest->toApiArray(true, true),
        ]);
    }
}
