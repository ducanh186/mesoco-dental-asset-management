<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Disposal extends Model
{
    use HasFactory;

    public const METHODS = ['destroy', 'liquidation', 'scrap', 'other'];

    protected $fillable = [
        'code',
        'asset_id',
        'method',
        'reason',
        'disposed_by_user_id',
        'approved_by_user_id',
        'disposed_at',
        'asset_book_value',
        'proceeds_amount',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'disposed_at' => 'datetime',
            'asset_book_value' => 'decimal:2',
            'proceeds_amount' => 'decimal:2',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function disposedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'disposed_by_user_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }

    public static function generateCode(): string
    {
        $prefix = 'DSP-' . now()->format('Ym') . '-';
        $lastCode = static::where('code', 'like', $prefix . '%')
            ->orderByDesc('code')
            ->value('code');

        $nextNumber = $lastCode ? ((int) substr($lastCode, -4)) + 1 : 1;

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
