<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetCode extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'code_hash',
        'expires_at',
        'used_at',
        'resend_available_at',
        'last_sent_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
            'resend_available_at' => 'datetime',
            'last_sent_at' => 'datetime',
        ];
    }

    /**
     * Check if the code is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the code has been used.
     */
    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    /**
     * Check if resend is available.
     */
    public function canResend(): bool
    {
        return $this->resend_available_at === null || $this->resend_available_at->isPast();
    }

    /**
     * Mark the code as used.
     */
    public function markAsUsed(): void
    {
        $this->update(['used_at' => now()]);
    }

    /**
     * Verify a plain code against the hash.
     */
    public function verifyCode(string $plainCode): bool
    {
        return hash_equals($this->code_hash, hash('sha256', $plainCode));
    }

    /**
     * Invalidate all previous codes for an email.
     */
    public static function invalidatePreviousCodes(string $email): void
    {
        static::where('email', $email)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);
    }

    /**
     * Get the latest valid code for an email.
     */
    public static function getLatestValidCode(string $email): ?self
    {
        return static::where('email', $email)
            ->whereNull('used_at')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();
    }
}
