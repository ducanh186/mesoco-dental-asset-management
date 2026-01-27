<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Feedback Model (Phase 8)
 * 
 * User feedback, issues, and suggestions about assets or maintenance.
 * 
 * Status workflow: new -> in_progress -> resolved
 */
class Feedback extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The table associated with the model.
     */
    protected $table = 'feedbacks';

    // =========================================================================
    // Constants
    // =========================================================================

    /**
     * Feedback statuses
     */
    public const STATUSES = ['new', 'in_progress', 'resolved'];

    public const STATUS_NEW = 'new';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_RESOLVED = 'resolved';

    /**
     * Feedback types
     */
    public const TYPES = ['issue', 'suggestion', 'praise', 'other'];

    public const TYPE_ISSUE = 'issue';
    public const TYPE_SUGGESTION = 'suggestion';
    public const TYPE_PRAISE = 'praise';
    public const TYPE_OTHER = 'other';

    /**
     * Code prefix for feedback
     */
    public const CODE_PREFIX = 'FB';

    // =========================================================================
    // Configuration
    // =========================================================================

    protected $fillable = [
        'code',
        'user_id',
        'asset_id',
        'maintenance_event_id',
        'content',
        'rating',
        'status',
        'type',
        'response',
        'resolved_by',
        'resolved_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'resolved_at' => 'datetime',
    ];

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * User who created the feedback
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Related asset (optional)
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Related maintenance event (optional)
     */
    public function maintenanceEvent(): BelongsTo
    {
        return $this->belongsTo(MaintenanceEvent::class);
    }

    /**
     * User who resolved the feedback
     */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    // =========================================================================
    // Code Generation
    // =========================================================================

    /**
     * Generate a unique feedback code: FB-YYYYMM-XXXX
     * Uses AssetCodeSequence for atomic code generation.
     */
    public static function generateCode(): string
    {
        return AssetCodeSequence::generateNextCode(self::CODE_PREFIX);
    }

    // =========================================================================
    // Boot
    // =========================================================================

    protected static function booted(): void
    {
        static::creating(function (Feedback $feedback) {
            if (empty($feedback->code)) {
                $feedback->code = self::generateCode();
            }
        });
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    /**
     * Filter by status
     */
    public function scopeByStatus($query, ?string $status)
    {
        if ($status && in_array($status, self::STATUSES)) {
            return $query->where('status', $status);
        }
        return $query;
    }

    /**
     * Filter by type
     */
    public function scopeByType($query, ?string $type)
    {
        if ($type && in_array($type, self::TYPES)) {
            return $query->where('type', $type);
        }
        return $query;
    }

    /**
     * Filter by user
     */
    public function scopeByUser($query, ?int $userId)
    {
        if ($userId) {
            return $query->where('user_id', $userId);
        }
        return $query;
    }

    /**
     * Filter by asset
     */
    public function scopeByAsset($query, ?int $assetId)
    {
        if ($assetId) {
            return $query->where('asset_id', $assetId);
        }
        return $query;
    }

    /**
     * Filter by date range
     */
    public function scopeDateRange($query, ?string $from, ?string $to)
    {
        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Search in content
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Only unresolved (new or in_progress)
     */
    public function scopeUnresolved($query)
    {
        return $query->whereIn('status', [self::STATUS_NEW, self::STATUS_IN_PROGRESS]);
    }

    // =========================================================================
    // State Management
    // =========================================================================

    /**
     * Check if feedback can be updated (not resolved)
     */
    public function canBeUpdated(): bool
    {
        return $this->status !== self::STATUS_RESOLVED;
    }

    /**
     * Mark as in progress
     */
    public function markInProgress(): void
    {
        $this->status = self::STATUS_IN_PROGRESS;
        $this->save();
    }

    /**
     * Mark as resolved
     */
    public function resolve(int $resolvedBy, ?string $response = null): void
    {
        $this->status = self::STATUS_RESOLVED;
        $this->resolved_by = $resolvedBy;
        $this->resolved_at = now();
        if ($response) {
            $this->response = $response;
        }
        $this->save();
    }
}
