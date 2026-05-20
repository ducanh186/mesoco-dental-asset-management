<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseReceipt extends Model
{
    public const STATUS_COMPLETED = 'completed';

    protected $fillable = [
        'receipt_code',
        'purchase_order_id',
        'received_by_user_id',
        'received_at',
        'status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $receipt) {
            if (!$receipt->receipt_code) {
                $receipt->receipt_code = self::generateCode();
            }

            if (!$receipt->status) {
                $receipt->status = self::STATUS_COMPLETED;
            }
        });
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'received_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseReceiptItem::class);
    }

    public static function generateCode(): string
    {
        $prefix = 'PN-' . now()->format('Ym') . '-';
        $latestCode = self::query()
            ->where('receipt_code', 'like', $prefix . '%')
            ->orderByDesc('receipt_code')
            ->value('receipt_code');

        $nextNumber = 1;

        if ($latestCode && preg_match('/(\d+)$/', $latestCode, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
