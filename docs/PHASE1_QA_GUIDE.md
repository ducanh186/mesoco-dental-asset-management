# Phase 1 QA Testing Guide

> Quick reference for testing auth features in local development

---

## 🔐 Forgot Password Testing

### Prerequisites
- Server running: `php artisan serve`
- Environment: `local` (check `.env` → `APP_ENV=local`)

### Test Accounts
| Email | Employee ID | Password |
|-------|-------------|----------|
| `admin@mesoco.vn` | `E0001` | `password` |
| `doctor@mesoco.vn` | `E0002` | `password` |
| `tech@mesoco.vn` | `E0003` | `password` |

---

## 📧 Retrieve OTP Code (Local Dev Only)

### Method 1: Get Latest OTP for Specific Email

**PowerShell:**
```powershell
# Get latest OTP for admin@mesoco.vn
Select-String -Path storage\app\private\otp\password_reset_codes.log -Pattern "admin@mesoco.vn" | Select-Object -Last 1
```

**Output Example:**
```
2026-01-24T10:30:45+00:00 | admin@mesoco.vn | 123456 | 2026-01-24T10:35:45+00:00
```

---

### Method 2: Get Latest OTP (Any Email)

**PowerShell:**
```powershell
# Get the most recent OTP code
Get-Content storage\app\private\otp\password_reset_codes.log -Tail 1
```

---

### Method 3: Extract Just the Code

**PowerShell:**
```powershell
# Extract only the 6-digit code from latest entry
(Get-Content storage\app\private\otp\password_reset_codes.log -Tail 1) -split '\|' | Select-Object -Index 2 | ForEach-Object { $_.Trim() }
```

**Output:**
```
123456
```

---

### Method 4: Watch OTP File in Real-Time

**PowerShell:**
```powershell
# Monitor OTP file for new codes (like tail -f)
Get-Content storage\app\private\otp\password_reset_codes.log -Wait -Tail 5
```

---

## 🧪 Complete Forgot Password Test Flow

1. **Request OTP:**
   - Navigate to: http://localhost:8000/forgot-password
   - Enter email: `admin@mesoco.vn`
   - Click "Send Verification Code"

2. **Retrieve OTP:**
   ```powershell
   Select-String -Path storage\app\private\otp\password_reset_codes.log -Pattern "admin@mesoco.vn" | Select-Object -Last 1
   ```

3. **Extract Code:**
   ```powershell
   # Get just the code
   (Select-String -Path storage\app\private\otp\password_reset_codes.log -Pattern "admin@mesoco.vn" | Select-Object -Last 1) -split '\|' | Select-Object -Index 2 | ForEach-Object { $_.Trim() }
   ```

4. **Reset Password:**
   - Enter the 6-digit code
   - New password: `NewPass123!` (min 8 chars, uppercase, lowercase, number, symbol)
   - Confirm password: `NewPass123!`
   - Click "Reset Password"

5. **Test Login:**
   - Navigate to: http://localhost:8000/login
   - Login: `admin@mesoco.vn` or `E0001`
   - Password: `NewPass123!`

---

## 📂 OTP File Location

**Path:** `storage/app/private/otp/password_reset_codes.log`

**Format:**
```
ISO_TIMESTAMP | email | code | expires_at
```

**Example:**
```
2026-01-24T10:30:45+00:00 | admin@mesoco.vn | 123456 | 2026-01-24T10:35:45+00:00
2026-01-24T10:31:12+00:00 | doctor@mesoco.vn | 987654 | 2026-01-24T10:36:12+00:00
```

---

## 🔒 Security Notes

### ⚠️ Important
- **OTP file is LOCAL ONLY** - `APP_ENV=local` required
- **Production/Staging:** OTP never written to any file/log
- **Never commit** `storage/app/otp/` directory to Git (already in .gitignore)

### .gitignore Entry
```
/storage/app/private/otp/
```

---

## 🧹 Clear OTP File

**PowerShell:**
```powershell
# Clear all OTP codes
Remove-Item storage\app\private\otp\password_reset_codes.log -ErrorAction SilentlyContinue
```

**Or just empty it:**
```powershell
# Empty the file but keep it
Clear-Content storage\app\private\otp\password_reset_codes.log -ErrorAction SilentlyContinue
```

---

## 🐛 Troubleshooting

### "OTP file not found"
**Cause:** No OTP has been generated yet, or not in local environment

**Fix:**
1. Check `.env`: `APP_ENV=local`
2. Request a password reset
3. File will be created automatically at `storage/app/private/otp/password_reset_codes.log`

---

### "Code expired"
**Cause:** OTP codes expire after 5 minutes

**Fix:**
- Request a new code (wait 1 minute for cooldown to pass)
- Check expires_at column in OTP file

---

### "Code incorrect"
**Cause:** Wrong code or already used

**Fix:**
1. Verify you copied the correct 6-digit code
2. Check it's the latest code for that email:
   ```powershell
   Select-String -Path storage\app\private\otp\password_reset_codes.log -Pattern "your@email.com" | Select-Object -Last 1
   ```
3. Request a new code if needed

---

## 📝 Related Documentation

- [PHASE1_AUTH_CHECKLIST.md](PHASE1_AUTH_CHECKLIST.md) - Auth feature implementation checklist
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Project organization
- [README.md](../README.md) - Getting started guide
