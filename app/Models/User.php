<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Available roles in the system.
     * Stored in users.role for backward compatibility and normalized to roles.id.
     */
    public const ROLES = ['manager', 'technician', 'employee', 'supplier'];

    public const ROLE_MANAGER = 'manager';
    public const ROLE_DOCTOR = 'doctor';
    public const ROLE_TECHNICIAN = 'technician';
    public const ROLE_EMPLOYEE = 'employee';
    public const ROLE_SUPPLIER = 'supplier';
    public const ROLE_STAFF = 'staff';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_HR = 'hr';

    /**
     * Legacy roles are mapped to the DFD-aligned role model.
     */
    public const LEGACY_ROLE_MAP = [
        self::ROLE_ADMIN => self::ROLE_MANAGER,
        self::ROLE_HR => self::ROLE_TECHNICIAN,
        self::ROLE_DOCTOR => self::ROLE_EMPLOYEE,
        self::ROLE_STAFF => self::ROLE_EMPLOYEE,
    ];

    /**
     * Quản lý: approval/report/system ownership.
     */
    public const MANAGER_ROLES = [self::ROLE_MANAGER];

    /**
     * Quản lý + kỹ thuật viên: operational backoffice access.
     */
    public const OPERATION_ROLES = [self::ROLE_MANAGER, self::ROLE_TECHNICIAN];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'employee_code',
        'employee_id',
        'supplier_id',
        'role',
        'role_id',
        'status',
        'must_change_password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'must_change_password' => 'boolean',
        ];
    }

    public function getRoleAttribute(?string $value): string
    {
        return self::normalizeRole($value);
    }

    protected static function booted(): void
    {
        static::saving(function (self $user) {
            $rawRole = $user->getAttributes()['role'] ?? null;

            $normalizedRole = $rawRole
                ? self::normalizeRole($rawRole)
                : null;

            if (!$normalizedRole && $user->role_id) {
                $normalizedRole = Role::query()
                    ->whereKey($user->role_id)
                    ->value('code');
            }

            $normalizedRole = $normalizedRole ?: self::ROLE_EMPLOYEE;

            $user->role = $normalizedRole;
            $user->role_id = Role::query()->firstOrCreate(
                ['code' => $normalizedRole],
                ['name' => self::roleLabel($normalizedRole)]
            )->id;
        });

        static::saved(function (self $user) {
            if (!Schema::hasTable('account_roles') || !$user->role_id) {
                return;
            }

            DB::table('account_roles')
                ->where('user_id', $user->id)
                ->update([
                    'status' => 'inactive',
                    'updated_at' => now(),
                ]);

            DB::table('account_roles')->updateOrInsert(
                [
                    'user_id' => $user->id,
                    'role_id' => $user->role_id,
                ],
                [
                    'assigned_at' => $user->created_at ?? now(),
                    'status' => 'active',
                    'note' => 'Synced from users.role_id',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        });
    }

    /**
     * Get the employee record associated with this user.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function roleDefinition(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'account_roles')
            ->withPivot(['assigned_at', 'status', 'note'])
            ->withTimestamps();
    }

    /**
     * Backward-compatible alias retained for legacy authorization checks.
     */
    public function isAdmin(): bool
    {
        return $this->isManager();
    }

    public function isHr(): bool
    {
        return $this->isTechnician();
    }

    public function isManager(): bool
    {
        return in_array($this->canonicalRole(), self::MANAGER_ROLES, true);
    }

    public function isTechnician(): bool
    {
        return $this->canonicalRole() === self::ROLE_TECHNICIAN;
    }

    public function isSupplier(): bool
    {
        return $this->canonicalRole() === self::ROLE_SUPPLIER;
    }

    public function hasOperationalAccess(): bool
    {
        return in_array($this->canonicalRole(), self::OPERATION_ROLES, true);
    }

    public function canReviewRequests(): bool
    {
        return $this->isManager();
    }

    public function canViewReports(): bool
    {
        return $this->isManager();
    }

    public function canManageUsers(): bool
    {
        return $this->isManager();
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string $role): bool
    {
        return $this->canonicalRole() === self::normalizeRole($role);
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        $normalizedRoles = array_map([self::class, 'normalizeRole'], $roles);

        return in_array($this->canonicalRole(), $normalizedRoles, true);
    }

    /**
     * Scope to filter users by role.
     */
    public function scopeByRole($query, ?string $role)
    {
        if ($role) {
            return $query->where('role', self::normalizeRole($role));
        }
        return $query;
    }

    /**
     * Scope to search users by employee_code or name.
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('employee_code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    public function canonicalRole(): string
    {
        return self::normalizeRole($this->getAttributes()['role'] ?? self::ROLE_EMPLOYEE);
    }

    public static function normalizeRole(?string $role): string
    {
        $normalized = strtolower(trim((string) $role));

        if ($normalized === '') {
            return self::ROLE_EMPLOYEE;
        }

        return self::LEGACY_ROLE_MAP[$normalized] ?? $normalized;
    }

    public static function roleLabel(string $role): string
    {
        return match (self::normalizeRole($role)) {
            self::ROLE_MANAGER => 'Manager',
            self::ROLE_TECHNICIAN => 'Technician',
            self::ROLE_SUPPLIER => 'Supplier',
            default => 'Employee',
        };
    }
}
