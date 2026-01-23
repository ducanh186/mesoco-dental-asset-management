# Mesoco Dental — API Contract (Phase 1: Authentication)

> **Version:** 1.0  
> **Last Updated:** 2026-01-23  
> **Base URL:** `/` (web routes) and `/api` (API routes)

---

## Overview

This document describes the authentication API endpoints for the Mesoco Dental Equipment Management system.

### Authentication Method
- **SPA Authentication** using Laravel Sanctum with cookie-based sessions
- Login uses `employee_code` + `password` (NOT email login)
- CSRF protection via `/sanctum/csrf-cookie`

### Error Response Policy
| HTTP Code | Description | Response |
|-----------|-------------|----------|
| 401 | Unauthenticated | `{"message": "Unauthenticated."}` |
| 403 | Forbidden | `{"message": "Forbidden."}` |
| 422 | Validation Error | `{"message": "...", "errors": {"field": ["error message"]}}` |
| 429 | Too Many Requests | `{"message": "Too many requests. Please try again later."}` |
| 500 | Server Error | `{"message": "Server error. Please try again later."}` |

### Security Notes
- Forgot password endpoints **MUST NOT** leak user existence
- All error messages for `/forgot-password/*` return generic messages
- Rate limiting is applied per IP and per identifier

---

## Authentication Endpoints

### GET `/sanctum/csrf-cookie`

Initialize CSRF protection for subsequent requests.

**Request:**
```http
GET /sanctum/csrf-cookie HTTP/1.1
Host: localhost:8000
Accept: application/json
```

**Response:** `204 No Content`  
Sets `XSRF-TOKEN` cookie.

---

### POST `/login`

Authenticate user with employee code and password.

**Rate Limit:** 5 requests/minute per IP + employee_code

**Request:**
```http
POST /login HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json
X-XSRF-TOKEN: {token_from_cookie}

{
    "employee_code": "EMP001",
    "password": "SecurePass123!"
}
```

**Success Response:** `200 OK`
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "employee_code": "EMP001",
        "name": "John Doe",
        "email": "john@mesoco.vn",
        "role": "employee",
        "status": "active",
        "created_at": "2026-01-23T10:00:00.000000Z",
        "updated_at": "2026-01-23T10:00:00.000000Z"
    }
}
```

**Error Response:** `422 Unprocessable Entity`
```json
{
    "message": "The provided credentials are incorrect.",
    "errors": {
        "employee_code": ["The provided credentials are incorrect."]
    }
}
```

**Deactivated Account:** `422 Unprocessable Entity`
```json
{
    "message": "Your account has been deactivated.",
    "errors": {
        "employee_code": ["Your account has been deactivated."]
    }
}
```

**Validation Error:** `422 Unprocessable Entity`
```json
{
    "message": "The employee code field is required. (and 1 more error)",
    "errors": {
        "employee_code": ["The employee code field is required."],
        "password": ["The password field is required."]
    }
}
```

---

### GET `/api/me`

Get current authenticated user information.

**Requires:** Authentication

**Request:**
```http
GET /api/me HTTP/1.1
Host: localhost:8000
Accept: application/json
Cookie: {session_cookies}
```

**Success Response:** `200 OK`
```json
{
    "user": {
        "id": 1,
        "employee_code": "EMP001",
        "name": "John Doe",
        "email": "john@mesoco.vn",
        "role": "employee",
        "status": "active",
        "created_at": "2026-01-23T10:00:00.000000Z",
        "updated_at": "2026-01-23T10:00:00.000000Z"
    }
}
```

**Unauthenticated:** `401 Unauthorized`
```json
{
    "message": "Unauthenticated."
}
```

---

### POST `/logout`

Logout current user and invalidate session.

**Requires:** Authentication

**Request:**
```http
POST /logout HTTP/1.1
Host: localhost:8000
Accept: application/json
X-XSRF-TOKEN: {token_from_cookie}
Cookie: {session_cookies}
```

**Success Response:** `200 OK`
```json
{
    "message": "Logged out successfully"
}
```

---

## Password Reset Endpoints

### POST `/forgot-password/request`

Request a password reset verification code. 

**IMPORTANT:** Always returns success message to prevent email enumeration.

**Rate Limit:** 
- 3 requests/minute per IP
- 1 request/minute per email

**Request:**
```http
POST /forgot-password/request HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json
X-XSRF-TOKEN: {token_from_cookie}

{
    "email": "john@mesoco.vn"
}
```

**Response (Always):** `200 OK`
```json
{
    "message": "If the email is registered, we've sent a verification code to your inbox. Please check your email."
}
```

**Validation Error:** `422 Unprocessable Entity`
```json
{
    "message": "The email field is required.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

**Code Details:**
- 6-digit numeric code
- TTL: 5 minutes
- Resend cooldown: 1 minute
- Single-use (invalidated after successful reset)
- New code invalidates previous codes

---

### POST `/forgot-password/reset`

Reset password using verification code.

**IMPORTANT:** Returns same error for invalid email, wrong code, expired code, or used code to prevent enumeration.

**Rate Limit:**
- 5 requests/minute per IP
- 5 requests/minute per email

**Request:**
```http
POST /forgot-password/reset HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json
X-XSRF-TOKEN: {token_from_cookie}

{
    "email": "john@mesoco.vn",
    "verification_code": "123456",
    "password": "NewSecurePass123!",
    "password_confirmation": "NewSecurePass123!"
}
```

**Success Response:** `200 OK`
```json
{
    "message": "Password reset successfully."
}
```

**Error Response (Any Invalid Code/Email):** `422 Unprocessable Entity`
```json
{
    "message": "The verification code is incorrect!",
    "errors": {
        "verification_code": ["The verification code is incorrect!"]
    }
}
```

**Validation Errors:** `422 Unprocessable Entity`
```json
{
    "message": "The verification code must be 6 characters.",
    "errors": {
        "verification_code": ["The verification code must be 6 characters."]
    }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

### POST `/api/change-password`

Change password for authenticated user.

**Requires:** Authentication

**Request:**
```http
POST /api/change-password HTTP/1.1
Host: localhost:8000
Content-Type: application/json
Accept: application/json
X-XSRF-TOKEN: {token_from_cookie}
Cookie: {session_cookies}

{
    "current_password": "OldPassword123!",
    "password": "NewSecurePass123!",
    "password_confirmation": "NewSecurePass123!"
}
```

**Success Response:** `200 OK`
```json
{
    "message": "Password changed successfully."
}
```

**Wrong Current Password:** `422 Unprocessable Entity`
```json
{
    "message": "The current password is incorrect.",
    "errors": {
        "current_password": ["The current password is incorrect."]
    }
}
```

**Validation Errors:** `422 Unprocessable Entity`
```json
{
    "message": "The password confirmation does not match.",
    "errors": {
        "password": ["The password confirmation does not match."]
    }
}
```

---

## Health Check

### GET `/api/health`

Public health check endpoint.

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:8000
Accept: application/json
```

**Response:** `200 OK`
```json
{
    "status": "ok",
    "timestamp": "2026-01-23T10:00:00.000000Z"
}
```

---

## QA Testing Instructions (Postman/Thunder Client)

### Prerequisites
1. Start the application: `php artisan serve`
2. Ensure database is migrated: `php artisan migrate`
3. Seed test user: `php artisan db:seed`

### Test Flow

#### 1. Get CSRF Cookie
```
GET http://localhost:8000/sanctum/csrf-cookie
```
- Store the `XSRF-TOKEN` cookie value
- Decode URL-encoded value for use in headers

#### 2. Login
```
POST http://localhost:8000/login
Headers:
  Content-Type: application/json
  Accept: application/json
  X-XSRF-TOKEN: {decoded_xsrf_token}
Body:
{
    "employee_code": "EMP001",
    "password": "password"
}
```

#### 3. Get Current User
```
GET http://localhost:8000/api/me
Headers:
  Accept: application/json
```
- Cookies from login should be automatically sent

#### 4. Test Unauthenticated (Clear cookies first)
```
GET http://localhost:8000/api/me
Headers:
  Accept: application/json
```
- Should return 401 `{"message": "Unauthenticated."}` (NOT 500 error)

#### 5. Request Password Reset Code
```
POST http://localhost:8000/forgot-password/request
Headers:
  Content-Type: application/json
  Accept: application/json
  X-XSRF-TOKEN: {decoded_xsrf_token}
Body:
{
    "email": "test@mesoco.vn"
}
```
- Check Laravel log for the code: `storage/logs/laravel.log`

#### 6. Reset Password
```
POST http://localhost:8000/forgot-password/reset
Headers:
  Content-Type: application/json
  Accept: application/json
  X-XSRF-TOKEN: {decoded_xsrf_token}
Body:
{
    "email": "test@mesoco.vn",
    "verification_code": "123456",
    "password": "NewPass123!",
    "password_confirmation": "NewPass123!"
}
```

#### 7. Change Password (Authenticated)
```
POST http://localhost:8000/api/change-password
Headers:
  Content-Type: application/json
  Accept: application/json
  X-XSRF-TOKEN: {decoded_xsrf_token}
Body:
{
    "current_password": "password",
    "password": "NewPass123!",
    "password_confirmation": "NewPass123!"
}
```

#### 8. Logout
```
POST http://localhost:8000/logout
Headers:
  Accept: application/json
  X-XSRF-TOKEN: {decoded_xsrf_token}
```

### Verification Scenarios

| Scenario | Expected Result |
|----------|-----------------|
| Login with valid credentials | 200 + user data |
| Login with invalid credentials | 422 + field error |
| Login with deactivated account | 422 + account deactivated |
| GET /api/me unauthenticated | 401 JSON (NOT 500) |
| Forgot password with valid email | 200 + generic message |
| Forgot password with invalid email | 200 + same generic message |
| Reset with wrong code | 422 + "code is incorrect" |
| Reset with expired code | 422 + "code is incorrect" |
| Reset with used code | 422 + "code is incorrect" |
| Reset with non-existent email | 422 + "code is incorrect" |
| Change password wrong current | 422 + field error |
| Rate limit exceeded | 429 |

---

## Database Schema

### password_reset_codes
| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| email | varchar(255) | User email (indexed) |
| code_hash | varchar(255) | SHA-256 hash of code |
| expires_at | timestamp | Code expiration time |
| used_at | timestamp | When code was used (null if unused) |
| resend_available_at | timestamp | When resend is allowed |
| last_sent_at | timestamp | Last send time |
| created_at | timestamp | Record creation time |
| updated_at | timestamp | Record update time |

---

## Rate Limits Summary

| Endpoint | Limit |
|----------|-------|
| POST /login | 5/min per IP+employee_code |
| POST /forgot-password/request | 3/min per IP, 1/min per email |
| POST /forgot-password/reset | 5/min per IP, 5/min per email |
