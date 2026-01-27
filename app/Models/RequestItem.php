<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestItem extends Model
{
    use HasFactory;

    /**
     * Item kinds
     */
    public const KINDS = ['ASSET', 'CONSUMABLE'];

    public const KIND_ASSET = 'ASSET';
    public const KIND_CONSUMABLE = 'CONSUMABLE';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'request_id',
        'item_kind',
        'asset_id',
        'sku',
        'name',
        'qty',
        'unit',
        'from_shift_id',
        'to_shift_id',
        'from_date',
        'to_date',
        'note',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'qty' => 'decimal:2',
            'from_date' => 'date',
            'to_date' => 'date',
        ];
    }

    // =========================================================================
    // Relationships
    // =========================================================================

    /**
     * Get the parent request.
     */
    public function assetRequest(): BelongsTo
    {
        return $this->belongsTo(AssetRequest::class, 'request_id');
    }

    /**
     * Get the asset (for ASSET items).
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Get the from shift.
     */
    public function fromShift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'from_shift_id');
    }

    /**
     * Get the to shift.
     */
    public function toShift(): BelongsTo
    {
        return $this->belongsTo(Shift::class, 'to_shift_id');
    }

    // =========================================================================
    // Scopes
    // =========================================================================

    /**
     * Scope to filter by item kind.
     */
    public function scopeByKind($query, string $kind)
    {
        return $query->where('item_kind', $kind);
    }

    /**
     * Scope to filter ASSET items.
     */
    public function scopeAssets($query)
    {
        return $query->where('item_kind', self::KIND_ASSET);
    }

    /**
     * Scope to filter CONSUMABLE items.
     */
    public function scopeConsumables($query)
    {
        return $query->where('item_kind', self::KIND_CONSUMABLE);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    /**
     * Check if this is an asset item.
     */
    public function isAsset(): bool
    {
        return $this->item_kind === self::KIND_ASSET;
    }

    /**
     * Check if this is a consumable item.
     */
    public function isConsumable(): bool
    {
        return $this->item_kind === self::KIND_CONSUMABLE;
    }

    // =========================================================================
    // API Transformation
    // =========================================================================

    /**
     * Transform to API response array.
     */
    public function toApiArray(): array
    {
        $data = [
            'id' => $this->id,
            'item_kind' => $this->item_kind,
            'qty' => $this->qty,
            'unit' => $this->unit,
            'note' => $this->note,
        ];

        if ($this->isAsset()) {
            $data['asset'] = $this->asset ? [
                'id' => $this->asset->id,
                'asset_code' => $this->asset->asset_code,
                'name' => $this->asset->name,
            ] : null;
            $data['from_shift'] = $this->fromShift ? [
                'id' => $this->fromShift->id,
                'code' => $this->fromShift->code,
                'name' => $this->fromShift->name,
            ] : null;
            $data['to_shift'] = $this->toShift ? [
                'id' => $this->toShift->id,
                'code' => $this->toShift->code,
                'name' => $this->toShift->name,
            ] : null;
            $data['from_date'] = $this->from_date?->toDateString();
            $data['to_date'] = $this->to_date?->toDateString();
        } else {
            $data['sku'] = $this->sku;
            $data['name'] = $this->name;
        }

        return $data;
    }
}
