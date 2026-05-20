<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseReceiptItem extends Model
{
    protected $fillable = [
        'purchase_receipt_id',
        'purchase_order_item_id',
        'asset_id',
        'item_name',
        'ordered_qty',
        'accepted_qty',
        'rejected_qty',
        'unit',
        'condition_status',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'ordered_qty' => 'decimal:2',
            'accepted_qty' => 'decimal:2',
            'rejected_qty' => 'decimal:2',
        ];
    }

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(PurchaseReceipt::class, 'purchase_receipt_id');
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderItem::class, 'purchase_order_item_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
