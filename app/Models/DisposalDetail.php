<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisposalDetail extends Model
{
    protected $fillable = [
        'disposal_id',
        'asset_id',
        'condition_summary',
        'asset_book_value',
        'proceeds_amount',
        'processed_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'asset_book_value' => 'decimal:2',
            'proceeds_amount' => 'decimal:2',
            'processed_at' => 'datetime',
        ];
    }

    public function disposal(): BelongsTo
    {
        return $this->belongsTo(Disposal::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
