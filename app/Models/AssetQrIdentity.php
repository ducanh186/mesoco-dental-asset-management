<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AssetQrIdentity extends Model
{
    use HasFactory;

    /**
     * QR Payload format versions
     */
    public const VERSION_1 = 'v1';
    public const CURRENT_VERSION = self::VERSION_1;

    /**
     * QR Payload prefix parts
     */
    public const PAYLOAD_PREFIX = 'MESOCO';
    public const PAYLOAD_TYPE = 'ASSET';
    public const PAYLOAD_SEPARATOR = '|';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'qr_uid',
        'asset_id',
        'payload_version',
        'printed_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'printed_at' => 'datetime',
        ];
    }

    /**
     * Boot method to auto-generate qr_uid.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->qr_uid)) {
                $model->qr_uid = (string) Str::uuid();
            }
            if (empty($model->payload_version)) {
                $model->payload_version = self::CURRENT_VERSION;
            }
        });
    }

    /**
     * Get the asset this QR identity belongs to.
     * Includes soft deleted assets for proper error handling.
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class)->withTrashed();
    }

    /**
     * Generate the full QR payload string.
     * Format: "MESOCO|ASSET|v1|<qr_uid>"
     */
    public function getPayloadAttribute(): string
    {
        return implode(self::PAYLOAD_SEPARATOR, [
            self::PAYLOAD_PREFIX,
            self::PAYLOAD_TYPE,
            $this->payload_version,
            $this->qr_uid,
        ]);
    }

    /**
     * Parse a QR payload string and extract components.
     * Returns null if format is invalid.
     * 
     * @param string $payload The scanned QR payload
     * @return array|null ['prefix', 'type', 'version', 'qr_uid'] or null
     */
    public static function parsePayload(string $payload): ?array
    {
        $parts = explode(self::PAYLOAD_SEPARATOR, $payload);

        if (count($parts) !== 4) {
            return null;
        }

        [$prefix, $type, $version, $qrUid] = $parts;

        // Validate prefix and type
        if ($prefix !== self::PAYLOAD_PREFIX || $type !== self::PAYLOAD_TYPE) {
            return null;
        }

        // Validate version (only v1 supported currently)
        if (!in_array($version, [self::VERSION_1])) {
            return null;
        }

        // Validate UUID format
        if (!Str::isUuid($qrUid)) {
            return null;
        }

        return [
            'prefix' => $prefix,
            'type' => $type,
            'version' => $version,
            'qr_uid' => $qrUid,
        ];
    }

    /**
     * Find QR identity by payload string.
     * 
     * @param string $payload The scanned QR payload
     * @return self|null
     */
    public static function findByPayload(string $payload): ?self
    {
        $parsed = self::parsePayload($payload);

        if (!$parsed) {
            return null;
        }

        return self::where('qr_uid', $parsed['qr_uid'])->first();
    }

    /**
     * Mark this QR code as printed.
     */
    public function markAsPrinted(): void
    {
        $this->update(['printed_at' => now()]);
    }
}
