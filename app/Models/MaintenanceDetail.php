<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceDetail extends Model
{
    protected $fillable = [
        'maintenance_event_id',
        'asset_id',
        'qty',
        'technician_user_id',
        'supplier_id',
        'status',
        'issue_description',
        'action_taken',
        'cost',
        'started_at',
        'completed_at',
        'logged_at',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'cost' => 'decimal:2',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'logged_at' => 'datetime',
        ];
    }

    public function maintenanceEvent(): BelongsTo
    {
        return $this->belongsTo(MaintenanceEvent::class);
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function technician(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technician_user_id');
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
