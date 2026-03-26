<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetAssignment extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'asset_id',
        'employee_id',
        'assigned_by',
        'assigned_at',
        'unassigned_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
            'unassigned_at' => 'datetime',
        ];
    }

    /**
     * Get the asset being assigned.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the employee this asset is assigned to.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who made the assignment.
     */
    public function assignedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    /**
     * Check if this assignment is currently active.
     */
    public function isActive(): bool
    {
        return is_null($this->unassigned_at);
    }

    /**
     * Scope to get only active assignments.
     */
    public function scopeActive($query)
    {
        return $query->whereNull('unassigned_at');
    }

    /**
     * Scope to get only historical (unassigned) assignments.
     */
    public function scopeHistory($query)
    {
        return $query->whereNotNull('unassigned_at');
    }

    /**
     * Scope to get assignments for a specific employee.
     */
    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    /**
     * Scope to get assignments for a specific asset.
     */
    public function scopeForAsset($query, int $assetId)
    {
        return $query->where('asset_id', $assetId);
    }
}
