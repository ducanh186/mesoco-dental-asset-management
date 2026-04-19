<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryCheckItem extends Model
{
    public const RESULT_PENDING = 'pending';
    public const RESULT_MATCHED = 'matched';
    public const RESULT_MISSING = 'missing';
    public const RESULT_DAMAGED = 'damaged';
    public const RESULT_MOVED = 'moved';

    public const RESULTS = [
        self::RESULT_PENDING,
        self::RESULT_MATCHED,
        self::RESULT_MISSING,
        self::RESULT_DAMAGED,
        self::RESULT_MOVED,
    ];

    protected $fillable = [
        'inventory_check_id',
        'asset_id',
        'expected_status',
        'actual_status',
        'expected_location',
        'actual_location',
        'result',
        'condition_note',
        'counted_by_user_id',
        'checked_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'checked_at' => 'datetime',
        ];
    }

    public function inventoryCheck(): BelongsTo
    {
        return $this->belongsTo(InventoryCheck::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function countedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counted_by_user_id');
    }
}
