<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetReturn extends Model
{
    use HasFactory;

    protected $table = 'returns';

    protected $fillable = [
        'assignment_id',
        'staff_id',
        'admin_id',
        'return_date',
        'reason',
        'return_condition',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'return_date' => 'datetime',
        ];
    }

    public function assignment(): BelongsTo
    {
        return $this->belongsTo('App\\Models\\Assignment');
    }

    public function staff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
