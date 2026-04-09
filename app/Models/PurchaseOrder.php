<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PurchaseOrder extends Model
{
    use HasFactory;

    public const STATUS_PREPARING = 'preparing';
    public const STATUS_SHIPPING = 'shipping';
    public const STATUS_DELIVERED = 'delivered';

    public const STATUSES = [
        self::STATUS_PREPARING,
        self::STATUS_SHIPPING,
        self::STATUS_DELIVERED,
    ];

    protected $fillable = [
        'order_code',
        'supplier_id',
        'requested_by_user_id',
        'approved_by_user_id',
        'order_date',
        'expected_delivery_date',
        'status',
        'total_amount',
        'payment_method',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'expected_delivery_date' => 'date',
            'total_amount' => 'decimal:2',
        ];
    }

    public function getStatusAttribute(?string $value): string
    {
        return self::normalizeStatus($value);
    }

    protected static function booted(): void
    {
        static::saving(function (self $purchaseOrder) {
            $purchaseOrder->status = self::normalizeStatus($purchaseOrder->getAttributes()['status'] ?? null);

            if (!$purchaseOrder->order_code) {
                $purchaseOrder->order_code = self::generateCode();
            }
        });
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function approvals(): MorphMany
    {
        return $this->morphMany(Approval::class, 'approvable');
    }

    public static function normalizeStatus(?string $status): string
    {
        $normalized = strtolower(trim((string) $status));

        return match ($normalized) {
            '', 'draft' => self::STATUS_PREPARING,
            self::STATUS_SHIPPING => self::STATUS_SHIPPING,
            self::STATUS_DELIVERED => self::STATUS_DELIVERED,
            default => self::STATUS_PREPARING,
        };
    }

    public static function statusOptions(): array
    {
        return self::STATUSES;
    }

    public static function generateCode(): string
    {
        $prefix = 'PO-' . now()->format('Ym') . '-';
        $latestCode = self::query()
            ->where('order_code', 'like', $prefix . '%')
            ->orderByDesc('order_code')
            ->value('order_code');

        $nextNumber = 1;

        if ($latestCode && preg_match('/(\d+)$/', $latestCode, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
