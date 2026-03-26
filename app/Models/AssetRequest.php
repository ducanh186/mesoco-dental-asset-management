<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * AssetRequest Model
 * 
 * Handles justifications, asset loans, and consumable requests.
 * Named AssetRequest (not Request) to avoid conflict with Illuminate\Http\Request.
 */
class AssetRequest extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * Keep table name as 'requests' for migration compatibility.
     */
    protected $table = 'requests';

    /**
     * Request types
     */
    public const TYPES = ['JUSTIFICATION', 'ASSET_LOAN', 'CONSUMABLE_REQUEST'];

    public const TYPE_JUSTIFICATION = 'JUSTIFICATION';
    public const TYPE_ASSET_LOAN = 'ASSET_LOAN';
    public const TYPE_CONSUMABLE_REQUEST = 'CONSUMABLE_REQUEST';

    /**
     * Request statuses
     */
    public const STATUSES = ['SUBMITTED', 'APPROVED', 'REJECTED', 'CANCELLED'];

    public const STATUS_SUBMITTED = 'SUBMITTED';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_REJECTED = 'REJECTED';
    public const STATUS_CANCELLED = 'CANCELLED';

    /**
     * Final statuses (read-only after reaching these)
     */
    public const FINAL_STATUSES = ['APPROVED', 'REJECTED', 'CANCELLED'];

    /**
     * Severity levels
     */
    public const SEVERITIES = ['low', 'medium', 'high', 'critical'];

    public const SEVERITY_LOW = 'low';
    public const SEVERITY_MEDIUM = 'medium';
    public const SEVERITY_HIGH = 'high';
    public const SEVERITY_CRITICAL = 'critical';

    /**
     * Suspected causes for JUSTIFICATION
     */
    public const SUSPECTED_CAUSES = ['wear', 'operation', 'unknown'];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'code',
        'type',
        'status',
        'requested_by_employee_id',
        'reviewed_by_user_id',
        'reviewed_at',
        'review_note',
        'title',
        'description',
        'severity',
        'incident_at',
        'suspected_cause',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'incident_at' => 'datetime',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * Get the employee who requested this.
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'requested_by_employee_id');
    }

    /**
     * Get the user who reviewed this.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    /**
     * Get the request items.
     */
    public function items(): HasMany
    {
        return $this->hasMany(RequestItem::class, 'request_id');
    }

    /**
     * Get the request events (audit log).
     */
    public function events(): HasMany
    {
        return $this->hasMany(RequestEvent::class, 'request_id')->orderBy('created_at', 'asc');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    /**
     * Scope to filter by type.
     */
    public function scopeByType($query, ?string $type)
    {
        if ($type) {
            return $query->where('type', $type);
        }
        return $query;
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, ?string $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }
        return $query;
    }

    /**
     * Scope to filter by requester employee.
     */
    public function scopeByRequester($query, int $employeeId)
    {
        return $query->where('requested_by_employee_id', $employeeId);
    }

    /**
     * Scope for pending review (SUBMITTED status).
     */
    public function scopePendingReview($query)
    {
        return $query->where('status', self::STATUS_SUBMITTED);
    }

    /**
     * Scope to search by code or title.
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    // =========================================================================
    // State Machine / Status Helpers
    // =========================================================================

    /**
     * Check if request is in a final (read-only) state.
     */
    public function isFinal(): bool
    {
        return in_array($this->status, self::FINAL_STATUSES);
    }

    /**
     * Check if request can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    /**
     * Check if request can be reviewed (approved/rejected).
     */
    public function canBeReviewed(): bool
    {
        return $this->status === self::STATUS_SUBMITTED;
    }

    /**
     * Approve this request.
     * 
     * Uses DB transaction + lock to prevent race conditions.
     */
    public function approve(User $reviewer, ?string $note = null): bool
    {
        return DB::transaction(function () use ($reviewer, $note) {
            // Lock and re-check status to prevent race condition
            $locked = self::where('id', $this->id)->lockForUpdate()->first();
            
            if (!$locked || !$locked->canBeReviewed()) {
                return false;
            }

            $locked->update([
                'status' => self::STATUS_APPROVED,
                'reviewed_by_user_id' => $reviewer->id,
                'reviewed_at' => now(),
                'review_note' => $note,
            ]);

            $locked->logEvent(RequestEvent::TYPE_APPROVED, $reviewer, [
                'note' => $note,
            ]);

            // Refresh current instance
            $this->refresh();

            return true;
        });
    }

    /**
     * Reject this request.
     * 
     * Uses DB transaction + lock to prevent race conditions.
     */
    public function reject(User $reviewer, ?string $note = null): bool
    {
        return DB::transaction(function () use ($reviewer, $note) {
            // Lock and re-check status to prevent race condition
            $locked = self::where('id', $this->id)->lockForUpdate()->first();
            
            if (!$locked || !$locked->canBeReviewed()) {
                return false;
            }

            $locked->update([
                'status' => self::STATUS_REJECTED,
                'reviewed_by_user_id' => $reviewer->id,
                'reviewed_at' => now(),
                'review_note' => $note,
            ]);

            $locked->logEvent(RequestEvent::TYPE_REJECTED, $reviewer, [
                'note' => $note,
            ]);

            // Refresh current instance
            $this->refresh();

            return true;
        });
    }

    /**
     * Cancel this request (by requester).
     * 
     * Uses DB transaction + lock to prevent race conditions.
     */
    public function cancel(User $actor): bool
    {
        return DB::transaction(function () use ($actor) {
            // Lock and re-check status to prevent race condition
            $locked = self::where('id', $this->id)->lockForUpdate()->first();
            
            if (!$locked || !$locked->canBeCancelled()) {
                return false;
            }

            $locked->update([
                'status' => self::STATUS_CANCELLED,
            ]);

            $locked->logEvent(RequestEvent::TYPE_CANCELLED, $actor);

            // Refresh current instance
            $this->refresh();

            return true;
        });
    }

    /**
     * Log an event for this request.
     */
    public function logEvent(string $type, ?User $actor = null, ?array $meta = null): RequestEvent
    {
        return $this->events()->create([
            'actor_user_id' => $actor?->id,
            'event_type' => $type,
            'meta' => $meta,
        ]);
    }

    // =========================================================================
    // Code Generation
    // =========================================================================

    /**
     * Generate a unique request code with transaction lock to prevent race conditions.
     * Format: REQ-YYYYMM-0001
     * 
     * Uses SELECT ... FOR UPDATE to lock rows during code generation.
     * Falls back to retry logic if lock fails.
     */
    public static function generateCode(): string
    {
        $prefix = 'REQ-' . now()->format('Ym') . '-';
        $maxRetries = 3;
        $attempt = 0;

        while ($attempt < $maxRetries) {
            try {
                return DB::transaction(function () use ($prefix) {
                    // Lock rows for this month's codes to prevent race condition
                    $lastRequest = static::where('code', 'like', $prefix . '%')
                        ->lockForUpdate()
                        ->orderByDesc('id')
                        ->first();

                    if ($lastRequest) {
                        $lastNumber = (int) substr($lastRequest->code, -4);
                        $nextNumber = $lastNumber + 1;
                    } else {
                        $nextNumber = 1;
                    }

                    return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
                });
            } catch (\Throwable $e) {
                $attempt++;
                if ($attempt >= $maxRetries) {
                    // Fallback: use timestamp + random to ensure uniqueness
                    return $prefix . now()->format('dHis') . rand(10, 99);
                }
                usleep(50000); // Wait 50ms before retry
            }
        }

        // Should never reach here, but fallback just in case
        return $prefix . now()->format('dHis') . rand(10, 99);
    }

    // =========================================================================
    // API Transformation
    // =========================================================================

    /**
     * Transform to API response array.
     */
    public function toApiArray(bool $includeItems = true, bool $includeEvents = false): array
    {
        $data = [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type,
            'status' => $this->status,
            'title' => $this->title,
            'description' => $this->description,
            'severity' => $this->severity,
            'incident_at' => $this->incident_at?->toISOString(),
            'suspected_cause' => $this->suspected_cause,
            'requester' => $this->requester ? [
                'id' => $this->requester->id,
                'employee_code' => $this->requester->employee_code,
                'full_name' => $this->requester->full_name,
            ] : null,
            'reviewer' => $this->reviewer ? [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ] : null,
            'reviewed_at' => $this->reviewed_at?->toISOString(),
            'review_note' => $this->review_note,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'is_final' => $this->isFinal(),
            'can_be_cancelled' => $this->canBeCancelled(),
            'can_be_reviewed' => $this->canBeReviewed(),
        ];

        if ($includeItems && $this->relationLoaded('items')) {
            $data['items'] = $this->items->map(fn($item) => $item->toApiArray());
        }

        if ($includeEvents && $this->relationLoaded('events')) {
            $data['events'] = $this->events->map(fn($event) => $event->toApiArray());
        }

        return $data;
    }
}
