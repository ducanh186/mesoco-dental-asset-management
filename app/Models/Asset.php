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
        // Off-service metadata (Phase 7)
        'off_service_reason',
        'off_service_from',
        'off_service_until',
        'off_service_set_by',
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
            'off_service_from' => 'datetime',
            'off_service_until' => 'datetime',
        ];
    }

    /**
     * Statuses that indicate an asset is locked (unavailable for use).
     * Used by isLocked() for consistent lock checking across the system.
     */
    public const LOCKED_STATUSES = [self::STATUS_OFF_SERVICE, self::STATUS_MAINTENANCE];

    // =========================================================================
    // Lock Status Methods (Phase 7)
    // =========================================================================

    /**
     * Check if asset is locked (off_service or maintenance).
     * 
     * SINGLE SOURCE OF TRUTH for lock status.
     * Use this method everywhere instead of checking status directly.
     * 
     * Locked assets cannot be:
     * - Requested for loan
     * - Assigned to employees
     * - Checked in/out
     */
    public function isLocked(): bool
    {
        return in_array($this->status, self::LOCKED_STATUSES);
    }

    /**
     * Get human-readable lock reason.
     * Returns null if asset is not locked.
     */
    public function getLockReason(): ?string
    {
        if (!$this->isLocked()) {
            return null;
        }

        if ($this->off_service_reason) {
            return $this->off_service_reason;
        }

        return match ($this->status) {
            self::STATUS_MAINTENANCE => 'Asset is under maintenance',
            self::STATUS_OFF_SERVICE => 'Asset is off service',
            default => null,
        };
    }

    /**
     * Get the user who locked this asset.
     */
    public function offServiceSetBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'off_service_set_by');
    }

    /**
     * Get maintenance events for this asset.
     */
    public function maintenanceEvents(): HasMany
    {
        return $this->hasMany(MaintenanceEvent::class);
    }

    /**
     * Get active (in_progress) maintenance events.
     */
    public function activeMaintenanceEvents(): HasMany
    {
        return $this->hasMany(MaintenanceEvent::class)
            ->where('status', MaintenanceEvent::STATUS_IN_PROGRESS);
    }

    /**
     * Check if asset has any in-progress maintenance.
     */
    public function hasActiveMaintenanceEvent(): bool
    {
        return $this->activeMaintenanceEvents()->exists();
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
     * Get depreciation percentage (0-100).
     * Formula: accumulated_depreciation / (purchase_cost - salvage_value) * 100
     */
    public function getDepreciationPercentage(?Carbon $asOfDate = null): ?float
    {
        $accumulated = $this->getAccumulatedDepreciation($asOfDate);
        if ($accumulated === null || !$this->purchase_cost) {
            return null;
        }

        $depreciableAmount = (float) $this->purchase_cost - (float) ($this->salvage_value ?? 0);
        if ($depreciableAmount <= 0) {
            return 100.0;
        }

        return round(min(($accumulated / $depreciableAmount) * 100, 100), 1);
    }

    /**
     * Check if asset is eligible for disposal (depreciation >= 70%).
     */
    public function isEligibleForDisposal(?Carbon $asOfDate = null): bool
    {
        $percentage = $this->getDepreciationPercentage($asOfDate);
        return $percentage !== null && $percentage >= 70;
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
            'depreciation_percentage' => $this->getDepreciationPercentage($asOfDate),
            'is_eligible_for_disposal' => $this->isEligibleForDisposal($asOfDate),
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

    /**
     * Scope to get assets with warranty expiring soon.
     * 
     * @param int $thresholdDays Days before expiry to consider as "expiring soon"
     */
    public function scopeWarrantyExpiringSoon($query, int $thresholdDays = 30)
    {
        $today = Carbon::today();
        $thresholdDate = $today->copy()->addDays($thresholdDays);
        
        return $query->whereNotNull('warranty_expiry')
            ->where('warranty_expiry', '>=', $today)
            ->where('warranty_expiry', '<=', $thresholdDate);
    }

    /**
     * Scope to get assets with expired warranty.
     */
    public function scopeWarrantyExpired($query)
    {
        return $query->whereNotNull('warranty_expiry')
            ->where('warranty_expiry', '<', Carbon::today());
    }

    /**
     * Scope to get assets with valid warranty.
     */
    public function scopeWarrantyValid($query)
    {
        return $query->whereNotNull('warranty_expiry')
            ->where('warranty_expiry', '>=', Carbon::today());
    }

    /**
     * Get warranty status as a string.
     * 
     * @param int $thresholdDays Days before expiry to consider as "expiring soon"
     * @return string|null 'valid', 'expiring_soon', 'expired', or null if no warranty
     */
    public function getWarrantyStatus(int $thresholdDays = 30): ?string
    {
        if (!$this->warranty_expiry) {
            return null;
        }
        
        $today = Carbon::today();
        $expiryDate = $this->warranty_expiry instanceof Carbon 
            ? $this->warranty_expiry 
            : Carbon::parse($this->warranty_expiry);
        
        if ($expiryDate->lt($today)) {
            return 'expired';
        }
        
        $daysLeft = $today->diffInDays($expiryDate, false);
        
        if ($daysLeft <= $thresholdDays) {
            return 'expiring_soon';
        }
        
        return 'valid';
    }

    /**
     * Get warranty days left.
     * 
     * @return int|null Days left until warranty expires, negative if expired, null if no warranty
     */
    public function getWarrantyDaysLeft(): ?int
    {
        if (!$this->warranty_expiry) {
            return null;
        }
        
        $today = Carbon::today();
        $expiryDate = $this->warranty_expiry instanceof Carbon 
            ? $this->warranty_expiry 
            : Carbon::parse($this->warranty_expiry);
        
        return $today->diffInDays($expiryDate, false);
    }

    /**
     * Check if warranty is expiring soon.
     * 
     * @param int $thresholdDays Days before expiry to consider as "expiring soon"
     */
    public function isWarrantyExpiringSoon(int $thresholdDays = 30): bool
    {
        return $this->getWarrantyStatus($thresholdDays) === 'expiring_soon';
    }

    /**
     * Scope to filter by fully depreciated status.
     * Uses a simplified SQL calculation compatible with both MySQL and SQLite.
     * 
     * An asset is fully depreciated when months_in_service >= useful_life_months.
     * This is a reliable proxy for the full depreciation calculation.
     * 
     * @param bool $isFullyDepreciated True to get fully depreciated, false to get not fully depreciated
     */
    public function scopeFullyDepreciated($query, bool $isFullyDepreciated = true)
    {
        // Detect database driver for appropriate SQL syntax
        $driver = $query->getConnection()->getDriverName();
        
        if ($driver === 'sqlite') {
            // SQLite: Use julianday for month calculation
            $monthsInServiceExpr = "CAST((julianday('now') - julianday(purchase_date)) / 30.44 AS INTEGER)";
        } else {
            // MySQL: Use TIMESTAMPDIFF
            $monthsInServiceExpr = 'TIMESTAMPDIFF(MONTH, purchase_date, NOW())';
        }
        
        if ($isFullyDepreciated) {
            // Fully depreciated: months in service >= useful life
            return $query->whereNotNull('useful_life_months')
                ->where('useful_life_months', '>', 0)
                ->whereNotNull('purchase_date')
                ->whereRaw("({$monthsInServiceExpr}) >= useful_life_months");
        } else {
            // Not fully depreciated: months in service < useful life OR no depreciation data
            return $query->where(function ($q) use ($monthsInServiceExpr) {
                $q->whereNull('useful_life_months')
                    ->orWhere('useful_life_months', '<=', 0)
                    ->orWhereNull('purchase_date')
                    ->orWhereRaw("({$monthsInServiceExpr}) < useful_life_months");
            });
        }
    }
}

