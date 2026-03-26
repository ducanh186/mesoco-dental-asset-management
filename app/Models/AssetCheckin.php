<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class AssetCheckin extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'employee_id',
        'shift_id',
        'shift_date',
        'checked_in_at',
        'checked_out_at',
        'source',
        'notes',
    ];

    protected $casts = [
        'shift_date' => 'date',
        'checked_in_at' => 'datetime',
        'checked_out_at' => 'datetime',
    ];

    // =========================================================================
    // Relationships
    // =========================================================================

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(Shift::class);
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    public function scopeForDate($query, $date)
    {
        return $query->where('shift_date', $date instanceof Carbon ? $date->toDateString() : $date);
    }

    public function scopeForShift($query, $shiftId)
    {
        return $query->where('shift_id', $shiftId);
    }

    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeForAsset($query, $assetId)
    {
        return $query->where('asset_id', $assetId);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('checked_out_at');
    }

    public function scopeCheckedOut($query)
    {
        return $query->whereNotNull('checked_out_at');
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /**
     * Check if this check-in is still active (not checked out).
     */
    public function isActive(): bool
    {
        return $this->checked_out_at === null;
    }

    /**
     * Check out from this check-in.
     */
    public function checkOut(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        $this->checked_out_at = now();
        return $this->save();
    }

    /**
     * Get duration in minutes (if checked out).
     */
    public function getDurationMinutes(): ?int
    {
        if (!$this->checked_out_at) {
            return null;
        }

        return $this->checked_in_at->diffInMinutes($this->checked_out_at);
    }

    /**
     * Convert to array for API response.
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'asset' => $this->relationLoaded('asset') ? [
                'id' => $this->asset->id,
                'asset_code' => $this->asset->asset_code,
                'name' => $this->asset->name,
            ] : null,
            'employee_id' => $this->employee_id,
            'employee' => $this->relationLoaded('employee') ? [
                'id' => $this->employee->id,
                'employee_code' => $this->employee->employee_code,
                'full_name' => $this->employee->full_name,
            ] : null,
            'shift_id' => $this->shift_id,
            'shift' => $this->relationLoaded('shift') ? $this->shift->toApiArray() : null,
            'shift_date' => $this->shift_date->toDateString(),
            'checked_in_at' => $this->checked_in_at->toIso8601String(),
            'checked_out_at' => $this->checked_out_at?->toIso8601String(),
            'is_active' => $this->isActive(),
            'source' => $this->source,
            'notes' => $this->notes,
            'duration_minutes' => $this->getDurationMinutes(),
        ];
    }
}
