<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Asset extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Asset types
     */
    public const TYPES = ['tray', 'machine', 'tool', 'equipment', 'other'];
    
    public const TYPE_TRAY = 'tray';
    public const TYPE_MACHINE = 'machine';
    public const TYPE_TOOL = 'tool';
    public const TYPE_EQUIPMENT = 'equipment';
    public const TYPE_OTHER = 'other';

    /**
     * Asset statuses
     */
    public const STATUSES = ['active', 'off_service', 'maintenance', 'retired'];
    
    public const STATUS_ACTIVE = 'active';
    public const STATUS_OFF_SERVICE = 'off_service';
    public const STATUS_MAINTENANCE = 'maintenance';
    public const STATUS_RETIRED = 'retired';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'asset_code',
        'name',
        'type',
        'status',
        'notes',
        'instructions_url',
    ];

    /**
     * Get all assignments for this asset.
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(AssetAssignment::class);
    }

    /**
     * Get the current active assignment (unassigned_at is null).
     */
    public function currentAssignment(): HasOne
    {
        return $this->hasOne(AssetAssignment::class)
            ->whereNull('unassigned_at')
            ->latest('assigned_at');
    }

    /**
     * Get the QR identities for this asset.
     */
    public function qrIdentities(): HasMany
    {
        return $this->hasMany(AssetQrIdentity::class);
    }

    /**
     * Get the primary/active QR identity.
     */
    public function qrIdentity(): HasOne
    {
        return $this->hasOne(AssetQrIdentity::class)->latest();
    }

    /**
     * Check if asset is currently assigned to someone.
     */
    public function isAssigned(): bool
    {
        return $this->currentAssignment()->exists();
    }

    /**
     * Get current assignee (Employee).
     */
    public function getCurrentAssignee(): ?Employee
    {
        return $this->currentAssignment?->employee;
    }

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
     * Scope to search by asset_code or name.
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('asset_code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Scope to get only assigned assets.
     */
    public function scopeAssigned($query)
    {
        return $query->whereHas('currentAssignment');
    }

    /**
     * Scope to get only unassigned assets.
     */
    public function scopeUnassigned($query)
    {
        return $query->whereDoesntHave('assignments', function ($q) {
            $q->whereNull('unassigned_at');
        });
    }

    /**
     * Scope to get assets assigned to a specific employee.
     */
    public function scopeAssignedTo($query, int $employeeId)
    {
        return $query->whereHas('currentAssignment', function ($q) use ($employeeId) {
            $q->where('employee_id', $employeeId);
        });
    }
}
