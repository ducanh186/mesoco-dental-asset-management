# Phase 1 — Authentication API

> Source of truth for Phase 1 endpoints. Used by `scripts/generate-postman.mjs` to build collection.

## Endpoints

| # | Method | Path | Auth | Description |
|---|--------|------|------|-------------|
| 1 | GET | `{{base_url}}{{csrf_path}}` | No | Get Sanctum CSRF cookie |
| 2 | POST | `{{base_url}}/login` | No | Login with employee_code + password |
| 3 | GET | `{{base_url}}/api/me` | Yes | Get current user info |
| 4 | POST | `{{base_url}}/forgot-password/request` | No | Request password reset OTP |
| 5 | POST | `{{base_url}}/forgot-password/reset` | No | Reset password with OTP |
| 6 | POST | `{{base_url}}/api/change-password` | Yes | Change password (authenticated) |
| 7 | POST | `{{base_url}}/logout` | Yes | Logout and invalidate session |

## Request Bodies

### 2. Login
```json
{
  "employee_code": "{{employee_code}}",
  "password": "{{password}}"
}
```

### 4. Forgot Password - Request OTP
```json
{
  "email": "{{email}}"
}
```

### 5. Forgot Password - Reset
```json
{
  "email": "{{email}}",
  "verification_code": "{{otp_code}}",
  "password": "{{new_password}}",
  "password_confirmation": "{{new_password}}"
}
```
> **Note:** Uses `password` + `password_confirmation` (NOT `new_password`)

### 6. Change Password
```json
{
  "current_password": "{{password}}",
  "new_password": "{{new_password}}",
  "new_password_confirmation": "{{new_password}}"
}
```

### 7. Logout
Empty body or `{}`

## Environment Variables Used

| Variable | Example | Description |
|----------|---------|-------------|
| `base_url` | `http://localhost:8000` | API base URL |
| `csrf_path` | `/sanctum/csrf-cookie` | CSRF cookie endpoint |
| `employee_code` | `E0001` | Employee ID for login |
| `password` | `password` | Current password |
| `email` | `admin@mesoco.vn` | Email for forgot password |
| `otp_code` | `123456` | OTP from password reset |
| `new_password` | `NewPass123!` | New password |
| `new_password2` | `NewPass456!` | Second new password (for chaining) |

## Test Accounts

| Employee Code | Password | Email | Role |
|---------------|----------|-------|------|
| E0001 | password | admin@mesoco.vn | admin |
| E0002 | password | doctor@mesoco.vn | doctor |
| E0003 | password | tech@mesoco.vn | technician |

## Testing Flow

1. **Get CSRF Cookie** → Sets `XSRF-TOKEN` cookie
2. **Login** → Creates authenticated session
3. **Get Current User** → Verify session works
4. **Forgot Password Request** → Get OTP from log file
5. **Forgot Password Reset** → Reset with OTP + new password
6. **Login** (with new password) → Verify reset worked
7. **Change Password** → Change to another password
8. **Logout** → End session

## DEV: Getting OTP Code

OTP codes are logged to `storage/app/private/otp/password_reset_codes.log`

**PowerShell command:**
```powershell
(Get-Content storage\app\private\otp\password_reset_codes.log -Tail 1) -split '\|' | Select-Object -Index 2 | ForEach-Object { $_.Trim() }
```

**Bash command:**
```bash
tail -1 storage/app/private/otp/password_reset_codes.log | cut -d'|' -f3 | tr -d ' '
```
