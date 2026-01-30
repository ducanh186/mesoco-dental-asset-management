<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'start_time',
        'end_time',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // =========================================================================
    // Relationships
    // =========================================================================

    public function checkins(): HasMany
    {
        return $this->hasMany(AssetCheckin::class);
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('start_time');
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /**
     * Get the current shift based on time.
     * Returns null if no shift matches current time.
     */
    public static function getCurrentShift(?Carbon $time = null): ?self
    {
        $time = $time ?? now();
        $currentTime = $time->format('H:i:s');

        return static::active()
            ->ordered()
            ->where('start_time', '<=', $currentTime)
            ->where('end_time', '>', $currentTime)
            ->first();
    }

    /**
     * Check if a given time falls within this shift.
     */
    public function containsTime(Carbon $time): bool
    {
        $checkTime = $time->format('H:i:s');
        return $checkTime >= $this->start_time && $checkTime < $this->end_time;
    }

    /**
     * Get formatted time range for display.
     */
    public function getTimeRangeAttribute(): string
    {
        $start = Carbon::parse($this->start_time)->format('H:i');
        $end = Carbon::parse($this->end_time)->format('H:i');
        return "{$start} - {$end}";
    }

    /**
     * Convert to array for API response.
     */
    public function toApiArray(): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'start_time' => Carbon::parse($this->start_time)->format('H:i'),
            'end_time' => Carbon::parse($this->end_time)->format('H:i'),
            'time_range' => $this->time_range,
            'is_active' => $this->is_active,
        ];
    }
}
