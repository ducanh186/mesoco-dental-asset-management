<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class AssetCodeSequence extends Model
{
    protected $fillable = [
        'prefix',
        'year_month',
        'last_number',
    ];

    /**
     * Generate next asset code atomically.
     * Uses database-level locking to prevent race conditions.
     * 
     * Format: {PREFIX}-{YYYYMM}-{NNNN}
     * Example: EQUIP-202601-0001
     * 
     * @param string $prefix Code prefix (default: 'EQUIP')
     * @return string Generated unique asset code
     */
    public static function generateNextCode(string $prefix = 'EQUIP'): string
    {
        $yearMonth = now()->format('Ym');
        
        return DB::transaction(function () use ($prefix, $yearMonth) {
            // Atomic update with INSERT ON DUPLICATE KEY UPDATE pattern
            // This handles both new month (insert) and existing month (update)
            $sequence = self::lockForUpdate()
                ->where('prefix', $prefix)
                ->where('year_month', $yearMonth)
                ->first();

            if ($sequence) {
                // Existing sequence: increment
                $sequence->increment('last_number');
                $nextNumber = $sequence->last_number;
            } else {
                // New month: create sequence starting at 1
                $sequence = self::create([
                    'prefix' => $prefix,
                    'year_month' => $yearMonth,
                    'last_number' => 1,
                ]);
                $nextNumber = 1;
            }

            return sprintf('%s-%s-%04d', $prefix, $yearMonth, $nextNumber);
        });
    }

    /**
     * Get the current sequence number without incrementing.
     * Useful for display/preview purposes.
     */
    public static function peekNextCode(string $prefix = 'EQUIP'): string
    {
        $yearMonth = now()->format('Ym');
        
        $sequence = self::where('prefix', $prefix)
            ->where('year_month', $yearMonth)
            ->first();

        $nextNumber = $sequence ? $sequence->last_number + 1 : 1;

        return sprintf('%s-%s-%04d', $prefix, $yearMonth, $nextNumber);
    }
}
