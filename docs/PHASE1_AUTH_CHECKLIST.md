# Phase 1 Auth Implementation - Checklist

> Implementation completed: 2026-01-23

## Files Changed/Created

### New Files
| File | Description |
|------|-------------|
| `database/migrations/2026_01_23_120000_create_password_reset_codes_table.php` | Migration for password reset codes table |
| `database/migrations/2026_01_23_120001_make_employee_code_not_nullable.php` | Migration to make employee_code required |
| `app/Models/PasswordResetCode.php` | Eloquent model for password reset codes |
| `app/Services/AuthService.php` | Business logic for authentication operations |
| `app/Http/Controllers/AuthController.php` | Controller handling all auth endpoints |
| `app/Http/Requests/LoginRequest.php` | Form request for login validation |
| `app/Http/Requests/ForgotPasswordRequest.php` | Form request for forgot password |
| `app/Http/Requests/ResetPasswordRequest.php` | Form request for password reset |
| `app/Http/Requests/ChangePasswordRequest.php` | Form request for change password |
| `tests/Feature/AuthTest.php` | Feature tests for all auth functionality |
| `docs/API_CONTRACT.md` | Complete API documentation |

### Modified Files
| File | Changes |
|------|---------|
| `routes/web.php` | Replaced inline closures with AuthController methods, added rate limiting |
| `routes/api.php` | Added `/api/me` and `/api/change-password` endpoints via controller |
| `bootstrap/app.php` | Added JSON 401 handler for unauthenticated API requests |
| `app/Providers/AppServiceProvider.php` | Configured rate limiting rules |
| `app/Models/User.php` | Added `status` to fillable array |
| `database/factories/UserFactory.php` | Added employee_code, role, status to factory |

## How to Run

### 1. Run Migrations
```bash
# Using Docker
docker compose exec app php artisan migrate

# Or locally
php artisan migrate
```

### 2. Seed Database (if needed)
```bash
# Using Docker
docker compose exec app php artisan db:seed

# Or locally
php artisan db:seed
```

### 3. Run Tests
```bash
# Using Docker
docker compose exec app php artisan test --filter=AuthTest

# Or locally
php artisan test --filter=AuthTest

# Run all tests
php artisan test
```

## Test Users (from seeder)

| Employee Code | Email | Password | Role |
|---------------|-------|----------|------|
| E0001 | admin@mesoco.vn | password | admin |
| E0002 | doctor@mesoco.vn | password | doctor |
| E0003 | tech@mesoco.vn | password | technician |

## API Endpoints Summary

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| GET | `/sanctum/csrf-cookie` | No | - | Get CSRF token |
| POST | `/login` | No | 5/min per IP+code | Login with employee_code |
| POST | `/logout` | Yes | - | Logout user |
| GET | `/api/me` | Yes | - | Get current user |
| POST | `/api/change-password` | Yes | - | Change password |
| POST | `/forgot-password/request` | No | 3/min IP, 1/min email | Request reset code |
| POST | `/forgot-password/reset` | No | 5/min IP, 5/min email | Reset password |

## Security Features Implemented

- ✅ Login uses `employee_code` + `password` (not email)
- ✅ Forgot password NEVER leaks user existence
- ✅ Reset code stored as SHA-256 hash (not plaintext)
- ✅ Code TTL: 5 minutes
- ✅ Resend cooldown: 1 minute
- ✅ Codes are single-use
- ✅ New code invalidates previous codes
- ✅ Rate limiting on all auth endpoints
- ✅ API returns JSON 401 (not redirect/500)
- ✅ Field-level validation errors for 422

## Quick Postman/Thunder Test

1. **Get CSRF Cookie**
   ```
   GET http://localhost:8000/sanctum/csrf-cookie
   ```

2. **Login** (copy `XSRF-TOKEN` cookie value, URL-decode it)
   ```
   POST http://localhost:8000/login
   Content-Type: application/json
   Accept: application/json
   X-XSRF-TOKEN: {decoded_token}
   
   {"employee_code": "E0001", "password": "password"}
   ```

3. **Get User**
   ```
   GET http://localhost:8000/api/me
   Accept: application/json
   ```

4. **Request Reset Code**
   ```
   POST http://localhost:8000/forgot-password/request
   Content-Type: application/json
   Accept: application/json
   X-XSRF-TOKEN: {decoded_token}
   
   {"email": "admin@mesoco.vn"}
   ```
   Check `storage/logs/laravel.log` for the 6-digit code.

5. **Reset Password**
   ```
   POST http://localhost:8000/forgot-password/reset
   Content-Type: application/json
   Accept: application/json
   X-XSRF-TOKEN: {decoded_token}
   
   {
     "email": "admin@mesoco.vn",
     "verification_code": "123456",
     "password": "NewPass123!",
     "password_confirmation": "NewPass123!"
   }
   ```

6. **Change Password** (while logged in)
   ```
   POST http://localhost:8000/api/change-password
   Content-Type: application/json
   Accept: application/json
   X-XSRF-TOKEN: {decoded_token}
   
   {
     "current_password": "password",
     "password": "NewPass123!",
     "password_confirmation": "NewPass123!"
   }
   ```

7. **Logout**
   ```
   POST http://localhost:8000/logout
   Accept: application/json
   X-XSRF-TOKEN: {decoded_token}
   ```

## Test Coverage

The `AuthTest.php` covers:
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Login with non-existent employee code
- ✅ Deactivated user cannot login
- ✅ Login validation errors
- ✅ Authenticated user can get profile
- ✅ Unauthenticated returns 401 JSON (not 500)
- ✅ User can logout
- ✅ Forgot password always returns 200
- ✅ Same 200 for non-existent email (no enumeration)
- ✅ Code record created for valid email
- ✅ Previous codes invalidated when new requested
- ✅ Password reset with valid code
- ✅ Reset fails with wrong code
- ✅ Reset fails with invalid email (same error)
- ✅ Reset fails with expired code
- ✅ Reset fails with used code
- ✅ Code is single-use
- ✅ Password requirements validation
- ✅ Change password works
- ✅ Change password fails with wrong current password
- ✅ Code TTL expiry test
