<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Requests\UpdateFeedbackRequest;
use App\Models\Feedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * FeedbackController - Phase 8
 * 
 * Handles user feedback, issues, and suggestions.
 */
class FeedbackController extends Controller
{
    /**
     * List feedbacks with filters
     * - Users see only their own by default
     * - Managers (admin/hr/technician) see all
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Feedback::query()
            ->with(['user:id,name,employee_code', 'asset:id,name,asset_code', 'resolver:id,name']);

        // Non-managers only see their own
        if (!$user->hasAnyRole(['admin', 'hr', 'technician'])) {
            $query->where('user_id', $user->id);
        } else {
            // Managers can filter by user
            if ($request->filled('user_id')) {
                $query->byUser($request->integer('user_id'));
            }
        }

        // Apply filters
        $query->byStatus($request->input('status'))
              ->byType($request->input('type'))
              ->byAsset($request->input('asset_id'))
              ->dateRange($request->input('from'), $request->input('to'))
              ->search($request->input('search'));

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Paginate
        $perPage = min($request->integer('per_page', 15), 100);
        $feedbacks = $query->paginate($perPage);

        return response()->json([
            'data' => $feedbacks->items(),
            'meta' => [
                'current_page' => $feedbacks->currentPage(),
                'per_page' => $feedbacks->perPage(),
                'total' => $feedbacks->total(),
                'last_page' => $feedbacks->lastPage(),
            ],
        ]);
    }

    /**
     * Get feedback summary stats
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Feedback::query();

        // Non-managers only see their own
        if (!$user->hasAnyRole(['admin', 'hr', 'technician'])) {
            $query->where('user_id', $user->id);
        }

        $stats = [
            'total' => (clone $query)->count(),
            'new' => (clone $query)->where('status', Feedback::STATUS_NEW)->count(),
            'in_progress' => (clone $query)->where('status', Feedback::STATUS_IN_PROGRESS)->count(),
            'resolved' => (clone $query)->where('status', Feedback::STATUS_RESOLVED)->count(),
            'by_type' => [
                'issue' => (clone $query)->where('type', Feedback::TYPE_ISSUE)->count(),
                'suggestion' => (clone $query)->where('type', Feedback::TYPE_SUGGESTION)->count(),
                'praise' => (clone $query)->where('type', Feedback::TYPE_PRAISE)->count(),
                'other' => (clone $query)->where('type', Feedback::TYPE_OTHER)->count(),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Create a new feedback
     */
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        $feedback = Feedback::create([
            'user_id' => $request->user()->id,
            'asset_id' => $request->input('asset_id'),
            'maintenance_event_id' => $request->input('maintenance_event_id'),
            'content' => $request->input('content'),
            'rating' => $request->input('rating'),
            'type' => $request->input('type', Feedback::TYPE_OTHER),
            'status' => Feedback::STATUS_NEW,
        ]);

        $feedback->load(['user:id,name,employee_code', 'asset:id,name,asset_code']);

        return response()->json([
            'message' => 'Gửi phản hồi thành công.',
            'feedback' => $feedback,
        ], 201);
    }

    /**
     * Get a single feedback
     */
    public function show(Request $request, Feedback $feedback): JsonResponse
    {
        $this->authorize('view', $feedback);

        $feedback->load([
            'user:id,name,employee_code',
            'asset:id,name,asset_code',
            'maintenanceEvent:id,code,type,status',
            'resolver:id,name,employee_code',
        ]);

        return response()->json($feedback);
    }

    /**
     * Update a feedback
     */
    public function update(UpdateFeedbackRequest $request, Feedback $feedback): JsonResponse
    {
        $user = $request->user();
        $isManager = $user->hasAnyRole(['admin', 'hr', 'technician']);

        // Handle status transition
        $newStatus = $request->input('status');
        if ($isManager && $newStatus && $newStatus !== $feedback->status) {
            if ($newStatus === Feedback::STATUS_RESOLVED) {
                $feedback->resolved_by = $user->id;
                $feedback->resolved_at = now();
            }
            $feedback->status = $newStatus;
        }

        // Update other fields
        if ($request->has('content')) {
            $feedback->content = $request->input('content');
        }
        if ($request->has('response') && $isManager) {
            $feedback->response = $request->input('response');
        }
        if ($request->has('rating') && !$isManager) {
            $feedback->rating = $request->input('rating');
        }

        $feedback->save();
        $feedback->load(['user:id,name,employee_code', 'asset:id,name,asset_code', 'resolver:id,name']);

        return response()->json([
            'message' => 'Cập nhật phản hồi thành công.',
            'feedback' => $feedback,
        ]);
    }

    /**
     * Delete a feedback (admin only)
     */
    public function destroy(Request $request, Feedback $feedback): JsonResponse
    {
        $this->authorize('delete', $feedback);

        $feedback->delete();

        return response()->json([
            'message' => 'Xóa phản hồi thành công.',
        ]);
    }

    /**
     * Update feedback status (shortcut for managers)
     */
    public function updateStatus(Request $request, Feedback $feedback): JsonResponse
    {
        $this->authorize('manage', $feedback);

        $request->validate([
            'status' => ['required', 'in:' . implode(',', Feedback::STATUSES)],
            'response' => ['nullable', 'string', 'max:5000'],
        ]);

        $newStatus = $request->input('status');

        if ($newStatus === Feedback::STATUS_RESOLVED) {
            $feedback->resolve($request->user()->id, $request->input('response'));
        } else {
            $feedback->status = $newStatus;
            if ($request->has('response')) {
                $feedback->response = $request->input('response');
            }
            $feedback->save();
        }

        $feedback->load(['user:id,name,employee_code', 'resolver:id,name']);

        return response()->json([
            'message' => 'Cập nhật trạng thái thành công.',
            'feedback' => $feedback,
        ]);
    }
}
