<?php

namespace App\Models;

use Carbon\Carbon;
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
     * Depreciation methods
     */
    public const DEPRECIATION_TIME = 'TIME';
    public const DEPRECIATION_USAGE = 'USAGE';
    public const DEPRECIATION_METHODS = ['TIME', 'USAGE'];

    /**
     * Common asset categories for dental clinics
     */
    public const CATEGORIES = [
        'Imaging',
        'Sterilization', 
        'Treatment',
        'Cleaning',
        'Furniture',
        'Infrastructure',
        'Handpieces',
        'Other',
    ];

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'asset_code',
        'name',
        'type',
        'category',
        'location',
        'status',
        'notes',
        'instructions_url',
        'purchase_date',
        'purchase_cost',
        'useful_life_months',
        'salvage_value',
        'depreciation_method',
        'warranty_expiry',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'warranty_expiry' => 'date',
            'purchase_cost' => 'decimal:2',
            'salvage_value' => 'decimal:2',
        ];
    }

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

    /**
     * Scope to get assets available for loan.
     * Business rule: active status + not currently assigned
     * 
     * SINGLE SOURCE OF TRUTH for "available" logic.
     * Used by: availableForLoan endpoint, StoreRequestRequest validation
     */
    public function scopeAvailableForLoan($query)
    {
        return $query->where('status', self::STATUS_ACTIVE)
            ->unassigned();
    }

    /**
     * Check if asset is available for loan.
     * Instance method for single asset check.
     */
    public function isAvailableForLoan(): bool
    {
        return $this->status === self::STATUS_ACTIVE && !$this->isAssigned();
    }

    /**
     * Check if asset is assigned to specific employee.
     * Instance method for ownership verification.
     */
    public function isAssignedToEmployee(int $employeeId): bool
    {
        return $this->currentAssignment && $this->currentAssignment->employee_id === $employeeId;
    }

    // =========================================================================
    // Depreciation & Valuation Methods (Phase 6)
    // =========================================================================

    /**
     * Calculate months in service from purchase date.
     * Returns null if purchase_date is not set.
     */
    public function getMonthsInService(?Carbon $asOfDate = null): ?int
    {
        if (!$this->purchase_date) {
            return null;
        }
        
        $asOfDate = $asOfDate ?? Carbon::now();
        $purchaseDate = $this->purchase_date instanceof Carbon 
            ? $this->purchase_date 
            : Carbon::parse($this->purchase_date);
        
        // If purchase date is in future, return 0
        if ($purchaseDate->isAfter($asOfDate)) {
            return 0;
        }
        
        return (int) $purchaseDate->diffInMonths($asOfDate);
    }

    /**
     * Calculate monthly depreciation using straight-line method.
     * Formula: (purchase_cost - salvage_value) / useful_life_months
     * 
     * Returns null if required fields are missing or invalid.
     */
    public function getMonthlyDepreciation(): ?float
    {
        if (!$this->purchase_cost || !$this->useful_life_months || $this->useful_life_months <= 0) {
            return null;
        }
        
        $depreciableAmount = (float) $this->purchase_cost - (float) ($this->salvage_value ?? 0);
        
        if ($depreciableAmount <= 0) {
            return 0;
        }
        
        return round($depreciableAmount / $this->useful_life_months, 2);
    }

    /**
     * Calculate accumulated depreciation.
     * Capped at (purchase_cost - salvage_value) to prevent negative book value.
     */
    public function getAccumulatedDepreciation(?Carbon $asOfDate = null): ?float
    {
        $monthlyDepreciation = $this->getMonthlyDepreciation();
        $monthsInService = $this->getMonthsInService($asOfDate);
        
        if ($monthlyDepreciation === null || $monthsInService === null) {
            return null;
        }
        
        $maxDepreciation = (float) $this->purchase_cost - (float) ($this->salvage_value ?? 0);
        $accumulated = $monthlyDepreciation * $monthsInService;
        
        return round(min($accumulated, $maxDepreciation), 2);
    }

    /**
     * Calculate current book value.
     * Formula: purchase_cost - accumulated_depreciation
     * Minimum value is salvage_value (asset doesn't depreciate below salvage).
     */
    public function getCurrentBookValue(?Carbon $asOfDate = null): ?float
    {
        if (!$this->purchase_cost) {
            return null;
        }
        
        $accumulatedDepreciation = $this->getAccumulatedDepreciation($asOfDate);
        
        if ($accumulatedDepreciation === null) {
            // No depreciation data, return purchase cost as book value
            return (float) $this->purchase_cost;
        }
        
        $bookValue = (float) $this->purchase_cost - $accumulatedDepreciation;
        $salvageValue = (float) ($this->salvage_value ?? 0);
        
        return round(max($bookValue, $salvageValue), 2);
    }

    /**
     * Check if asset is fully depreciated.
     */
    public function isFullyDepreciated(?Carbon $asOfDate = null): bool
    {
        $bookValue = $this->getCurrentBookValue($asOfDate);
        $salvageValue = (float) ($this->salvage_value ?? 0);
        
        return $bookValue !== null && $bookValue <= $salvageValue;
    }

    /**
     * Get remaining useful life in months.
     */
    public function getRemainingUsefulLifeMonths(?Carbon $asOfDate = null): ?int
    {
        if (!$this->useful_life_months) {
            return null;
        }
        
        $monthsInService = $this->getMonthsInService($asOfDate);
        
        if ($monthsInService === null) {
            return $this->useful_life_months;
        }
        
        return max(0, $this->useful_life_months - $monthsInService);
    }

    /**
     * Get valuation data as array for API responses.
     */
    public function getValuationData(?Carbon $asOfDate = null): array
    {
        return [
            'purchase_date' => $this->purchase_date?->toDateString(),
            'purchase_cost' => $this->purchase_cost ? (float) $this->purchase_cost : null,
            'useful_life_months' => $this->useful_life_months,
            'salvage_value' => (float) ($this->salvage_value ?? 0),
            'depreciation_method' => $this->depreciation_method ?? self::DEPRECIATION_TIME,
            'warranty_expiry' => $this->warranty_expiry?->toDateString(),
            'months_in_service' => $this->getMonthsInService($asOfDate),
            'monthly_depreciation' => $this->getMonthlyDepreciation(),
            'accumulated_depreciation' => $this->getAccumulatedDepreciation($asOfDate),
            'current_book_value' => $this->getCurrentBookValue($asOfDate),
            'remaining_useful_life_months' => $this->getRemainingUsefulLifeMonths($asOfDate),
            'is_fully_depreciated' => $this->isFullyDepreciated($asOfDate),
        ];
    }

    // =========================================================================
    // Additional Scopes (Phase 6)
    // =========================================================================

    /**
     * Scope to filter by category.
     */
    public function scopeByCategory($query, ?string $category)
    {
        if ($category) {
            return $query->where('category', $category);
        }
        return $query;
    }

    /**
     * Scope to filter by location.
     */
    public function scopeByLocation($query, ?string $location)
    {
        if ($location) {
            return $query->where('location', $location);
        }
        return $query;
    }

    /**
     * Scope to get assets with valuation data (has purchase_cost).
     */
    public function scopeWithValuation($query)
    {
        return $query->whereNotNull('purchase_cost');
    }
}

