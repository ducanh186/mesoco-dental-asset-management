# Mesoco Dental — Security Checklist

## Authentication & Session

- [ ] Login với employee_id, không expose "user không tồn tại" vs "sai password"
- [ ] Verification code expire sau 5 phút
- [ ] Resend cooldown 1 phút
- [ ] Rate limit login: 5 attempts / 15 min per IP
- [ ] Rate limit forgot-password: 3 requests / 15 min per email
- [ ] Password policy: min 8 chars, không trùng current password
- [ ] Token expiry hợp lý (1 ngày hoặc "remember me" 7 ngày)
- [ ] Logout invalidate token phía server

## Authorization (RBAC)

- [ ] Mỗi endpoint kiểm tra role/permission trước khi xử lý
- [ ] Không leak data qua error messages
- [ ] IDOR protection: user chỉ xem/sửa data của mình hoặc được phân quyền
- [ ] Admin-only routes có middleware riêng
- [ ] Contract PDFs chỉ admin xem được

## Input Validation

- [ ] Validate tất cả input phía server (không trust client)
- [ ] Sanitize input trước khi lưu DB
- [ ] File upload (nếu có): validate type, size, scan malware
- [ ] QR code input: validate format, reject malformed

## API Security

- [ ] HTTPS only (production)
- [ ] CORS config đúng origin
- [ ] CSRF protection cho web forms
- [ ] API versioning (`/api/v1`)
- [ ] Response không leak stack trace / debug info

## Database

- [ ] Dùng parameterized queries / ORM (prevent SQL injection)
- [ ] Password hash với bcrypt / argon2
- [ ] Sensitive fields encrypted at rest (nếu cần)
- [ ] Backup định kỳ

## Logging & Audit

- [ ] Log authentication events (login, logout, failed attempts)
- [ ] Log authorization failures
- [ ] Log data changes quan trọng (approve, inventory, off-service)
- [ ] Không log sensitive data (passwords, tokens)
- [ ] Audit trail cho admin actions

## Error Handling

- [ ] Generic error messages cho user (không lộ internal error)
- [ ] Detailed errors chỉ log server-side
- [ ] Graceful degradation khi service down

## Deployment

- [ ] Environment variables cho secrets (không commit .env)
- [ ] Disable debug mode production
- [ ] Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Dependencies scan cho vulnerabilities

---

## Mapping to Codebase

| Check | Implementation Location |
|-------|------------------------|
| Rate limiting | `app/Http/Middleware/ThrottleRequests.php` |
| RBAC | `app/Http/Middleware/CheckRole.php`, `app/Policies/*` |
| Validation | `app/Http/Requests/*` |
| Password hash | Laravel default (bcrypt) |
| Audit log | `app/Models/AuditLog.php`, Observer pattern |
| CORS | `config/cors.php` |
| CSRF | Laravel Sanctum handles |
