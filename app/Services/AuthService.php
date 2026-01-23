<?php

namespace App\Services;

use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AuthService
{
    /**
     * Code TTL in minutes.
     */
    public const CODE_TTL_MINUTES = 5;

    /**
     * Resend cooldown in minutes.
     */
    public const RESEND_COOLDOWN_MINUTES = 1;

    /**
     * Code length (6 digits).
     */
    public const CODE_LENGTH = 6;

    /**
     * Request a password reset code.
     * Always returns true to prevent email enumeration.
     */
    public function requestPasswordResetCode(string $email): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            // Log the attempt but don't reveal user doesn't exist
            Log::info('Password reset requested for non-existent email', ['email' => $email]);
            return [
                'success' => true,
                'message' => "If the email is registered, we've sent a verification code to your inbox. Please check your email.",
            ];
        }

        // Check for existing valid code and resend cooldown
        $existingCode = PasswordResetCode::getLatestValidCode($email);

        if ($existingCode && !$existingCode->canResend()) {
            // Still return success message to prevent enumeration
            Log::info('Password reset requested but cooldown not passed', ['email' => $email]);
            return [
                'success' => true,
                'message' => "If the email is registered, we've sent a verification code to your inbox. Please check your email.",
            ];
        }

        // Invalidate any previous codes
        PasswordResetCode::invalidatePreviousCodes($email);

        // Generate new code
        $plainCode = $this->generateCode();
        $codeHash = hash('sha256', $plainCode);

        // Create new code record
        PasswordResetCode::create([
            'email' => $email,
            'code_hash' => $codeHash,
            'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
            'resend_available_at' => now()->addMinutes(self::RESEND_COOLDOWN_MINUTES),
            'last_sent_at' => now(),
        ]);

        // Send the code (in production, use Mail. For now, log it for testing)
        $this->sendResetCode($user, $plainCode);

        return [
            'success' => true,
            'message' => "If the email is registered, we've sent a verification code to your inbox. Please check your email.",
        ];
    }

    /**
     * Reset password using verification code.
     * Returns generic error for any validation failure to prevent enumeration.
     */
    public function resetPassword(string $email, string $code, string $newPassword): array
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            Log::info('Password reset attempted for non-existent email', ['email' => $email]);
            return [
                'success' => false,
                'error' => 'verification_code',
                'message' => 'The verification code is incorrect!',
            ];
        }

        $resetCode = PasswordResetCode::getLatestValidCode($email);

        if (!$resetCode) {
            Log::info('Password reset attempted with no valid code', ['email' => $email]);
            return [
                'success' => false,
                'error' => 'verification_code',
                'message' => 'The verification code is incorrect!',
            ];
        }

        if ($resetCode->isExpired()) {
            Log::info('Password reset attempted with expired code', ['email' => $email]);
            return [
                'success' => false,
                'error' => 'verification_code',
                'message' => 'The verification code is incorrect!',
            ];
        }

        if ($resetCode->isUsed()) {
            Log::info('Password reset attempted with used code', ['email' => $email]);
            return [
                'success' => false,
                'error' => 'verification_code',
                'message' => 'The verification code is incorrect!',
            ];
        }

        if (!$resetCode->verifyCode($code)) {
            Log::info('Password reset attempted with wrong code', ['email' => $email]);
            return [
                'success' => false,
                'error' => 'verification_code',
                'message' => 'The verification code is incorrect!',
            ];
        }

        // Mark code as used
        $resetCode->markAsUsed();

        // Update password
        $user->update([
            'password' => $newPassword, // Will be hashed by cast
        ]);

        // Invalidate all tokens/sessions for security
        $user->tokens()->delete();

        Log::info('Password reset successful', ['email' => $email]);

        return [
            'success' => true,
            'message' => 'Password reset successfully.',
        ];
    }

    /**
     * Change password for authenticated user.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): array
    {
        if (!Hash::check($currentPassword, $user->password)) {
            return [
                'success' => false,
                'error' => 'current_password',
                'message' => 'The current password is incorrect.',
            ];
        }

        $user->update([
            'password' => $newPassword, // Will be hashed by cast
        ]);

        Log::info('Password changed successfully', ['user_id' => $user->id]);

        return [
            'success' => true,
            'message' => 'Password changed successfully.',
        ];
    }

    /**
     * Generate a random numeric code.
     */
    protected function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), self::CODE_LENGTH, '0', STR_PAD_LEFT);
    }

    /**
     * Send the reset code to the user.
     * In production, this would send an actual email.
     */
    protected function sendResetCode(User $user, string $code): void
    {
        // TODO: In production, implement actual email sending
        // Mail::to($user)->send(new PasswordResetCodeMail($code));
        
        // For development/testing, write to dedicated OTP file (local only)
        if (app()->environment('local')) {
            $this->writeDevOtpToFile($user->email, $code);
        }
    }

    /**
     * Write OTP to dedicated file for local development.
     * NEVER runs in production/staging.
     */
    private function writeDevOtpToFile(string $email, string $code): void
    {
        $directory = 'otp';
        $filename = 'password_reset_codes.log';
        
        // Ensure directory exists
        if (!Storage::exists($directory)) {
            Storage::makeDirectory($directory);
        }
        
        // Format: ISO_TIMESTAMP | email | code | expires_at
        $expiresAt = now()->addMinutes(self::CODE_TTL_MINUTES);
        $line = sprintf(
            "%s | %s | %s | %s",
            now()->toIso8601String(),
            $email,
            $code,
            $expiresAt->toIso8601String()
        );
        
        // Append to file
        Storage::append($directory . '/' . $filename, $line);
    }
}
