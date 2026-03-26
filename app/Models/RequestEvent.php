<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestEvent extends Model
{
    use HasFactory;

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * Event types
     */
    public const TYPES = [
        'CREATED',
        'SUBMITTED',
        'APPROVED',
        'REJECTED',
        'CANCELLED',
    ];

    public const TYPE_CREATED = 'CREATED';
    public const TYPE_SUBMITTED = 'SUBMITTED';
    public const TYPE_APPROVED = 'APPROVED';
    public const TYPE_REJECTED = 'REJECTED';
    public const TYPE_CANCELLED = 'CANCELLED';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'request_id',
        'actor_user_id',
        'event_type',
        'meta',
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'created_at' => 'datetime',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * Get the parent request.
     */
    public function assetRequest(): BelongsTo
    {
        return $this->belongsTo(AssetRequest::class, 'request_id');
    }

    /**
     * Get the actor (user) who performed the action.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    /**
     * Scope to filter by event type.
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('event_type', $type);
    }

    // =========================================================================
    // API Transformation
    // =========================================================================

    /**
     * Transform to API response array.
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->event_type,
            'actor' => $this->actor ? [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
            ] : null,
            'meta' => $this->meta,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
