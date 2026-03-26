<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

/**
 * MaintenanceEvent Model
 * 
 * Event-based maintenance tracking with state machine.
 * 
 * State Machine:
 *   scheduled -> in_progress -> completed
 *   scheduled -> canceled
 *   in_progress -> canceled (with reason)
 * 
 * Lock Rule:
 *   When status = in_progress, the linked asset is automatically locked.
 *   When completed/canceled (and no other in_progress events), asset is unlocked.
 */
class MaintenanceEvent extends Model
{
    use HasFactory, SoftDeletes;

    // =========================================================================
    // Constants
    // =========================================================================

    /**
     * Maintenance types
     */
    public const TYPES = [
        'inspection',
        'sterilization',
        'filter_change',
        'calibration',
        'repair',
        'cleaning',
        'replacement',
        'other',
    ];

    public const TYPE_INSPECTION = 'inspection';
    public const TYPE_STERILIZATION = 'sterilization';
    public const TYPE_FILTER_CHANGE = 'filter_change';
    public const TYPE_CALIBRATION = 'calibration';
    public const TYPE_REPAIR = 'repair';
    public const TYPE_CLEANING = 'cleaning';
    public const TYPE_REPLACEMENT = 'replacement';
    public const TYPE_OTHER = 'other';

    /**
     * Status values (state machine)
     */
    public const STATUSES = ['scheduled', 'in_progress', 'completed', 'canceled'];

    public const STATUS_SCHEDULED = 'scheduled';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELED = 'canceled';

    /**
     * Final statuses (no further transitions allowed)
     */
    public const FINAL_STATUSES = ['completed', 'canceled'];

    /**
     * Priority levels
     */
    public const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

    public const PRIORITY_LOW = 'low';
    public const PRIORITY_NORMAL = 'normal';
    public const PRIORITY_HIGH = 'high';
    public const PRIORITY_URGENT = 'urgent';

    /**
     * Valid state transitions
     * [from_status => [allowed_to_statuses]]
     */
    public const TRANSITIONS = [
        self::STATUS_SCHEDULED => [self::STATUS_IN_PROGRESS, self::STATUS_CANCELED],
        self::STATUS_IN_PROGRESS => [self::STATUS_COMPLETED, self::STATUS_CANCELED],
        self::STATUS_COMPLETED => [], // Final - no transitions
        self::STATUS_CANCELED => [],  // Final - no transitions
    ];

    // =========================================================================
    // Model Configuration
    // =========================================================================

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'code',
        'asset_id',
        'type',
        'status',
        'planned_at',
        'priority',
        'started_at',
        'completed_at',
        'note',
        'result_note',
        'estimated_duration_minutes',
        'actual_duration_minutes',
        'cost',
        'assigned_to',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'planned_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'cost' => 'decimal:2',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * Get the asset being maintained.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the user who created this event.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this event.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    /**
     * Filter by status.
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Get scheduled events.
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED);
    }

    /**
     * Get in-progress events.
     */
    public function scopeInProgress($query)
    {
        return $query->where('status', self::STATUS_IN_PROGRESS);
    }

    /**
     * Get completed events.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Get events for a specific asset.
     */
    public function scopeForAsset($query, int $assetId)
    {
        return $query->where('asset_id', $assetId);
    }

    /**
     * Get due events (planned_at <= now and still scheduled).
     */
    public function scopeDue($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
            ->where('planned_at', '<=', now());
    }

    /**
     * Get overdue events (planned_at < now and still scheduled).
     * An event is overdue if it was scheduled but not started by its planned time.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
            ->where('planned_at', '<', now());
    }

    /**
     * Get upcoming events (scheduled and planned_at in future).
     */
    public function scopeUpcoming($query)
    {
        return $query->where('status', self::STATUS_SCHEDULED)
            ->where('planned_at', '>', now());
    }

    // =========================================================================
    // State Machine Methods
    // =========================================================================

    /**
     * Check if transition to new status is valid.
     */
    public function canTransitionTo(string $newStatus): bool
    {
        $allowedTransitions = self::TRANSITIONS[$this->status] ?? [];
        return in_array($newStatus, $allowedTransitions);
    }

    /**
     * Check if this event is in a final state.
     */
    public function isFinal(): bool
    {
        return in_array($this->status, self::FINAL_STATUSES);
    }

    /**
     * Check if this event is active (not completed/canceled).
     */
    public function isActive(): bool
    {
        return !$this->isFinal();
    }

    // =========================================================================
    // Code Generation
    // =========================================================================

    /**
     * Generate unique maintenance code.
     * Format: MNT-YYYYMM-0001
     */
    public static function generateCode(): string
    {
        $prefix = 'MNT-' . now()->format('Ym') . '-';
        
        $lastCode = static::where('code', 'like', $prefix . '%')
            ->orderByDesc('code')
            ->value('code');
        
        if ($lastCode) {
            $lastNumber = (int) substr($lastCode, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }
        
        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    // =========================================================================
    // Boot
    // =========================================================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function (MaintenanceEvent $event) {
            if (empty($event->code)) {
                $event->code = static::generateCode();
            }
        });
    }
}
