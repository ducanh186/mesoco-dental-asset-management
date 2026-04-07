<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'employee_code',
        'full_name',
        'position',
        'department',
        'dob',
        'gender',
        'phone',
        'email',
        'address',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'dob' => 'date',
        ];
    }

    /**
     * Fields that are NEVER updatable via profile edit.
     * Backend must enforce this regardless of frontend.
     */
    public const IMMUTABLE_FIELDS = ['employee_code', 'email'];

    /**
     * Fields allowed for profile self-edit.
     */
    public const PROFILE_EDITABLE_FIELDS = [
        'full_name',
        'position',
        'dob',
        'gender',
        'phone',
        'address',
    ];

    /**
     * Get the user account associated with this employee.
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class);
    }

    /**
     * Check if employee has a user account.
     */
    public function hasUserAccount(): bool
    {
        return $this->user()->exists();
    }

    /**
     * Scope to filter by employee_code or name.
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    /**
     * Scope to filter active employees only.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to filter employees without user accounts.
     */
    public function scopeWithoutUserAccount($query)
    {
        return $query->whereDoesntHave('user');
    }
}
