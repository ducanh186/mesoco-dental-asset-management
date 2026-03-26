<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * EmployeeContract Model
 * 
 * Manages employee contract records including PDF storage.
 * Admin-only access for CRUD operations.
 */
class EmployeeContract extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'employee_contracts';

    // =========================================================================
    // Constants
    // =========================================================================

    /**
     * Contract types
     */
    public const TYPES = ['FULL_TIME', 'PART_TIME', 'INTERN', 'OUTSOURCE'];

    public const TYPE_FULL_TIME = 'FULL_TIME';
    public const TYPE_PART_TIME = 'PART_TIME';
    public const TYPE_INTERN = 'INTERN';
    public const TYPE_OUTSOURCE = 'OUTSOURCE';

    /**
     * Contract statuses
     */
    public const STATUSES = ['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING'];

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_EXPIRED = 'EXPIRED';
    public const STATUS_TERMINATED = 'TERMINATED';
    public const STATUS_PENDING = 'PENDING';

    // =========================================================================
    // Configuration
    // =========================================================================

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'employee_id',
        'department',
        'contract_type',
        'start_date',
        'end_date',
        'status',
        'pdf_path',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * Get the employee that owns this contract.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the user who created this contract.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus($query, ?string $status)
    {
        if ($status) {
            return $query->where('status', strtoupper($status));
        }
        return $query;
    }

    /**
     * Scope to filter by contract type.
     */
    public function scopeByType($query, ?string $type)
    {
        if ($type) {
            return $query->where('contract_type', strtoupper($type));
        }
        return $query;
    }

    /**
     * Scope to filter active contracts.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope to filter by employee.
     */
    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    // =========================================================================
    // Accessors & Helpers
    // =========================================================================

    /**
     * Check if the contract is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }

    /**
     * Check if the contract has expired based on end_date.
     */
    public function isExpired(): bool
    {
        if (!$this->end_date) {
            return false;
        }
        return $this->end_date->isPast();
    }

    /**
     * Check if the contract has a PDF file.
     */
    public function hasPdf(): bool
    {
        return !empty($this->pdf_path);
    }

    /**
     * Get the storage path for PDFs for a given employee and contract.
     */
    public static function getPdfStoragePath(int $employeeId, int $contractId): string
    {
        return "contracts/{$employeeId}/{$contractId}.pdf";
    }

    /**
     * Convert to API response array.
     */
    public function toApiArray(): array
    {
        $data = [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'department' => $this->department,
            'contract_type' => $this->contract_type,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'status' => $this->status,
            'has_pdf' => $this->hasPdf(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        // Include employee if loaded
        if ($this->relationLoaded('employee') && $this->employee) {
            $data['employee'] = [
                'id' => $this->employee->id,
                'employee_code' => $this->employee->employee_code,
                'full_name' => $this->employee->full_name,
            ];
        }

        // Include createdBy if loaded
        if ($this->relationLoaded('createdBy') && $this->createdBy) {
            $data['created_by'] = [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ];
        }

        return $data;
    }
}
