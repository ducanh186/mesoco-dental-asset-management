<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Supplier extends Model
{
    use HasFactory;

    public const IMMUTABLE_FIELDS = ['code', 'email'];

    public const PROFILE_EDITABLE_FIELDS = [
        'name',
        'contact_person',
        'phone',
        'address',
        'note',
    ];

    protected $fillable = [
        'code',
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'note',
    ];

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    public function repairLogs(): HasMany
    {
        return $this->hasMany(RepairLog::class);
    }
}
