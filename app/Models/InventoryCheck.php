<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryCheck extends Model
{
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELED = 'canceled';

    public const STATUSES = [
        self::STATUS_IN_PROGRESS,
        self::STATUS_COMPLETED,
        self::STATUS_CANCELED,
    ];

    protected $fillable = [
        'code',
        'title',
        'check_date',
        'status',
        'created_by_user_id',
        'completed_by_user_id',
        'completed_at',
        'location',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'check_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $inventoryCheck) {
            if (!$inventoryCheck->code) {
                $inventoryCheck->code = self::generateCode();
            }
        });
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryCheckItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function completer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by_user_id');
    }

    public static function generateCode(): string
    {
        $prefix = 'INV-' . now()->format('Ym') . '-';
        $latestCode = self::query()
            ->where('code', 'like', $prefix . '%')
            ->orderByDesc('code')
            ->value('code');

        $nextNumber = 1;

        if ($latestCode && preg_match('/(\d+)$/', $latestCode, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }
}
