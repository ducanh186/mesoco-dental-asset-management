<?php

namespace Tests\Feature;

use App\Models\PasswordResetCode;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'employee_code' => 'EMP001',
            'email' => 'test@mesoco.vn',
            'password' => 'Password123!',
            'status' => 'active',
            'role' => 'employee',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Login Tests
    |--------------------------------------------------------------------------
    */

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/login', [
            'employee_code' => 'EMP001',
            'password' => 'Password123!',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Login successful',
            ])
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'employee_code', 'name', 'email', 'role', 'status'],
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/login', [
            'employee_code' => 'EMP001',
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['employee_code']);
    }

    public function test_user_cannot_login_with_nonexistent_employee_code(): void
    {
        $response = $this->postJson('/login', [
            'employee_code' => 'NONEXISTENT',
            'password' => 'Password123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['employee_code']);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $this->user->update(['status' => 'inactive']);

        $response = $this->postJson('/login', [
            'employee_code' => 'EMP001',
            'password' => 'Password123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['employee_code'])
            ->assertJsonFragment([
                'employee_code' => ['Your account has been deactivated.'],
            ]);
    }

    public function test_login_requires_employee_code_and_password(): void
    {
        $response = $this->postJson('/login', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['employee_code', 'password']);
    }

    /*
    |--------------------------------------------------------------------------
    | Me Endpoint Tests
    |--------------------------------------------------------------------------
    */

    public function test_authenticated_user_can_get_profile(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/me');

        $response->assertOk()
            ->assertJsonStructure([
                'user' => ['id', 'employee_code', 'name', 'email', 'role', 'status'],
            ]);
    }

    public function test_unauthenticated_user_gets_401_json_not_500(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertUnauthorized()
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Logout Tests
    |--------------------------------------------------------------------------
    */

    public function test_user_can_logout(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/logout');

        $response->assertOk()
            ->assertJson([
                'message' => 'Logged out successfully',
            ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Forgot Password Request Tests
    |--------------------------------------------------------------------------
    */

    public function test_forgot_password_request_always_returns_200_for_valid_email(): void
    {
        $response = $this->postJson('/forgot-password/request', [
            'email' => 'test@mesoco.vn',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => "If the email is registered, we've sent a verification code to your inbox. Please check your email.",
            ]);
    }

    public function test_forgot_password_request_returns_200_for_nonexistent_email(): void
    {
        $response = $this->postJson('/forgot-password/request', [
            'email' => 'nonexistent@mesoco.vn',
        ]);

        // Should return same 200 response to prevent email enumeration
        $response->assertOk()
            ->assertJson([
                'message' => "If the email is registered, we've sent a verification code to your inbox. Please check your email.",
            ]);
    }

    public function test_forgot_password_request_creates_code_record(): void
    {
        $this->postJson('/forgot-password/request', [
            'email' => 'test@mesoco.vn',
        ]);

        $this->assertDatabaseHas('password_reset_codes', [
            'email' => 'test@mesoco.vn',
        ]);
    }

    public function test_forgot_password_request_invalidates_previous_codes(): void
    {
        // Create first code
        $this->postJson('/forgot-password/request', [
            'email' => 'test@mesoco.vn',
        ]);

        $firstCode = PasswordResetCode::where('email', 'test@mesoco.vn')->first();
        $this->assertNull($firstCode->used_at);

        // Travel past cooldown
        $this->travel(2)->minutes();

        // Request new code
        $this->postJson('/forgot-password/request', [
            'email' => 'test@mesoco.vn',
        ]);

        // First code should be marked as used
        $firstCode->refresh();
        $this->assertNotNull($firstCode->used_at);
    }

    public function test_forgot_password_request_validates_email_format(): void
    {
        $response = $this->postJson('/forgot-password/request', [
            'email' => 'invalid-email',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    /*
    |--------------------------------------------------------------------------
    | Forgot Password Reset Tests
    |--------------------------------------------------------------------------
    */

    public function test_password_reset_succeeds_with_valid_code(): void
    {
        // Create a reset code
        $plainCode = '123456';
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', $plainCode),
            'expires_at' => now()->addMinutes(5),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => $plainCode,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Password reset successfully.',
            ]);

        // Verify password was changed
        $this->user->refresh();
        $this->assertTrue(Hash::check('NewPassword123!', $this->user->password));
    }

    public function test_password_reset_fails_with_wrong_code(): void
    {
        // Create a reset code
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', '123456'),
            'expires_at' => now()->addMinutes(5),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => '654321', // Wrong code
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['verification_code'])
            ->assertJsonFragment([
                'verification_code' => ['The verification code is incorrect!'],
            ]);
    }

    public function test_password_reset_fails_with_invalid_email(): void
    {
        // Create a reset code for existing user
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', '123456'),
            'expires_at' => now()->addMinutes(5),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        // Try to reset with non-existent email - should get SAME error as wrong code
        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'nonexistent@mesoco.vn',
            'verification_code' => '123456',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['verification_code'])
            ->assertJsonFragment([
                'verification_code' => ['The verification code is incorrect!'],
            ]);
    }

    public function test_password_reset_fails_with_expired_code(): void
    {
        // Create an expired code
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', '123456'),
            'expires_at' => now()->subMinute(), // Already expired
            'resend_available_at' => now()->subMinutes(4),
            'last_sent_at' => now()->subMinutes(5),
        ]);

        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => '123456',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['verification_code'])
            ->assertJsonFragment([
                'verification_code' => ['The verification code is incorrect!'],
            ]);
    }

    public function test_password_reset_fails_with_already_used_code(): void
    {
        // Create a used code
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', '123456'),
            'expires_at' => now()->addMinutes(5),
            'used_at' => now()->subMinute(), // Already used
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => '123456',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['verification_code'])
            ->assertJsonFragment([
                'verification_code' => ['The verification code is incorrect!'],
            ]);
    }

    public function test_password_reset_code_becomes_single_use(): void
    {
        // Create a reset code
        $plainCode = '123456';
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', $plainCode),
            'expires_at' => now()->addMinutes(5),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        // First reset succeeds
        $response1 = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => $plainCode,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);
        $response1->assertOk();

        // Second reset with same code fails
        $response2 = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => $plainCode,
            'password' => 'AnotherPassword123!',
            'password_confirmation' => 'AnotherPassword123!',
        ]);
        $response2->assertUnprocessable()
            ->assertJsonValidationErrors(['verification_code']);
    }

    public function test_password_reset_validates_password_requirements(): void
    {
        $plainCode = '123456';
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', $plainCode),
            'expires_at' => now()->addMinutes(5),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        // Too short password
        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => $plainCode,
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    /*
    |--------------------------------------------------------------------------
    | Change Password Tests
    |--------------------------------------------------------------------------
    */

    public function test_authenticated_user_can_change_password(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/change-password', [
                'current_password' => 'Password123!',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Password changed successfully.',
            ]);

        // Verify password was changed
        $this->user->refresh();
        $this->assertTrue(Hash::check('NewPassword456!', $this->user->password));
    }

    public function test_change_password_fails_with_wrong_current_password(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/change-password', [
                'current_password' => 'WrongPassword123!',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'NewPassword456!',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['current_password'])
            ->assertJsonFragment([
                'current_password' => ['The current password is incorrect.'],
            ]);
    }

    public function test_change_password_validates_password_requirements(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/change-password', [
                'current_password' => 'Password123!',
                'password' => 'weak',
                'password_confirmation' => 'weak',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_change_password_requires_confirmation(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/change-password', [
                'current_password' => 'Password123!',
                'password' => 'NewPassword456!',
                'password_confirmation' => 'DifferentPassword456!',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_change_password_requires_authentication(): void
    {
        $response = $this->postJson('/api/change-password', [
            'current_password' => 'Password123!',
            'password' => 'NewPassword456!',
            'password_confirmation' => 'NewPassword456!',
        ]);

        $response->assertUnauthorized();
    }

    /*
    |--------------------------------------------------------------------------
    | Security Tests - Email Enumeration Prevention
    |--------------------------------------------------------------------------
    */

    public function test_forgot_request_and_reset_return_same_error_format(): void
    {
        // Test reset with nonexistent email
        $response1 = $this->postJson('/forgot-password/reset', [
            'email' => 'nonexistent@mesoco.vn',
            'verification_code' => '123456',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        // Test reset with wrong code for existing email
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', '999999'),
            'expires_at' => now()->addMinutes(5),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        $response2 = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => '123456',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        // Both should return same error message
        $this->assertEquals(
            $response1->json('errors.verification_code'),
            $response2->json('errors.verification_code')
        );
    }

    /*
    |--------------------------------------------------------------------------
    | TTL Expiry Test
    |--------------------------------------------------------------------------
    */

    public function test_code_expires_after_ttl(): void
    {
        $plainCode = '123456';
        PasswordResetCode::create([
            'email' => 'test@mesoco.vn',
            'code_hash' => hash('sha256', $plainCode),
            'expires_at' => now()->addMinutes(AuthService::CODE_TTL_MINUTES),
            'resend_available_at' => now()->addMinute(),
            'last_sent_at' => now(),
        ]);

        // Travel past TTL
        $this->travel(AuthService::CODE_TTL_MINUTES + 1)->minutes();

        $response = $this->postJson('/forgot-password/reset', [
            'email' => 'test@mesoco.vn',
            'verification_code' => $plainCode,
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['verification_code']);
    }
}
