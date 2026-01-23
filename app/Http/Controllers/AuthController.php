<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * POST /login
     * Login with email OR employee_code + password.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $login = $request->login;
        $password = $request->password;

        // Determine if login is email or employee_code
        $fieldType = filter_var($login, FILTER_VALIDATE_EMAIL) ? 'email' : 'employee_code';
        
        $credentials = [
            $fieldType => $login,
            'password' => $password,
        ];

        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'login' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is active
        $user = Auth::user();
        if ($user->status !== 'active') {
            Auth::logout();
            throw ValidationException::withMessages([
                'login' => ['Your account has been deactivated.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
        ]);
    }

    /**
     * GET /api/me
     * Get current authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    /**
     * POST /logout
     * Logout and invalidate session.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * POST /forgot-password/request
     * Request a password reset code.
     * Always returns 200 with generic message to prevent email enumeration.
     */
    public function forgotPasswordRequest(ForgotPasswordRequest $request): JsonResponse
    {
        $result = $this->authService->requestPasswordResetCode($request->email);

        return response()->json([
            'message' => $result['message'],
        ]);
    }

    /**
     * POST /forgot-password/reset
     * Reset password using verification code.
     */
    public function forgotPasswordReset(ResetPasswordRequest $request): JsonResponse
    {
        $result = $this->authService->resetPassword(
            $request->email,
            $request->verification_code,
            $request->password
        );

        if (!$result['success']) {
            throw ValidationException::withMessages([
                $result['error'] => [$result['message']],
            ]);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }

    /**
     * POST /change-password
     * Change password for authenticated user.
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $result = $this->authService->changePassword(
            $request->user(),
            $request->current_password,
            $request->password
        );

        if (!$result['success']) {
            throw ValidationException::withMessages([
                $result['error'] => [$result['message']],
            ]);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }
}
