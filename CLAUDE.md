# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mesoco Dental Asset Management is a Vietnamese medical equipment management system (Quản lý trang thiết bị y tế). It is a Laravel 12 + React 19 SPA — the React frontend is served from a single Blade template (`resources/views/spa.blade.php`) and uses React Router for all client-side navigation.

## Development Commands

### Docker (Recommended)

```bash
# First-time setup
scripts\docker-setup.bat

# Daily start/stop
scripts\docker-start.bat
scripts\docker-stop.bat

# Run artisan inside container
docker compose -f docker/docker-compose.yml exec app php artisan <command>

# View logs
docker compose -f docker/docker-compose.yml logs app -f
```

**Services:** Laravel at `http://localhost:8000`, Vite HMR at `http://localhost:5173`, MySQL at `localhost:3307`. Always test at port 8000, not 5173.

### Local Development (no Docker)

```bash
composer install && npm install

# Full dev stack (Laravel + Queue + Pail + Vite concurrently)
composer run dev

# Build frontend only
npm run build

# Lint PHP
./vendor/bin/pint

# Check i18n key coverage
npm run check:i18n
```

### Database

```bash
# Reset and reseed (wipes all data)
php artisan migrate:fresh --seed
```

### Testing

Tests use SQLite in-memory — no DB setup needed.

```bash
php artisan test                                         # all tests
php artisan test tests/Feature/AssetCheckinTest.php     # single file
php artisan test --filter=test_method_name              # single method
php artisan test --testsuite=Feature                    # suite only
```

## Architecture

### Request Lifecycle

1. All HTTP requests hit Laravel. Non-API routes serve `spa.blade.php` via a catch-all in `routes/web.php`.
2. The React SPA bootstraps in `resources/js/app.jsx`, fetches `/api/me` on load, and gates routes via `AuthContext`.
3. API calls use axios with `withCredentials: true` and CSRF cookies (Sanctum cookie-based session auth).
4. Login uses `employee_code` + `password` (not email).

### Authentication Flow

- `POST /login` → `AuthController@login` → sets Sanctum session cookie
- All protected routes use `auth:sanctum` + `must_change_password` middleware
- If `must_change_password` is true, all routes except `/api/change-password`, `/api/me`, and `/logout` return HTTP 409 with `error: MUST_CHANGE_PASSWORD`

### RBAC

Three layers always applied together:
1. **Route middleware** (`role:admin,hr`) — in `routes/api.php`
2. **FormRequest `authorize()`** — validates role during request validation
3. **Policies** — ownership checks (e.g., can only cancel own request)

`User::isAdmin()` returns `true` for both `admin` and `hr`. Never rely on frontend menu hiding for security.

### Employee vs. User Distinction

- `Employee` — HR record (physical person): `full_name`, `department`, `employee_code`
- `User` — System login account, has nullable FK `employee_id → employees.id`
- `AssetAssignment` and `AssetCheckin` reference `employee_id`. Audit logs reference `user_id`.

### Asset State Machine

Statuses: `active`, `off_service`, `maintenance`, `retired`. `Asset::isLocked()` is the single source of truth for `off_service` and `maintenance`. Locked assets cannot be requested, assigned, or checked in/out.

### AssetRequest State Machine

Model is `AssetRequest` (table is `requests` — named to avoid collision with `Illuminate\Http\Request`). States: `SUBMITTED → APPROVED | REJECTED | CANCELLED`. Transitions use `DB::transaction` + `lockForUpdate()` to prevent race conditions.

### Frontend

`resources/js/app.jsx` contains `AuthContext`, `I18nProvider`, React Router routes, and Axios CSRF setup. Pages are in `resources/js/pages/`. Shared UI primitives are in `resources/js/components/ui/` (Button, Input, Select, Card, Badge, Table, Modal, Toast).

### Internationalization

Default locale is Vietnamese (`vi`). Keys use dot notation, e.g., `t('common.save')`. When Vietnamese is active, English-only backend error messages are suppressed via `preferLocalizedMessage()` in `services/api.js`.

### BFD Business Modules

The system follows a BFD with 5 main modules:
1. **Quản lý danh mục & hồ sơ** — hồ sơ nhân viên, danh mục tài sản, danh mục vị trí, phân loại thiết bị, nhà cung cấp
2. **Quản lý cấp phát** — phiếu cấp phát, mượn/trả
3. **Quản lý Bảo trì & Sửa chữa** — lịch bảo trì, kiểm kê định kì, phản hồi & đề xuất, trạng thái Off-service
4. **Quản lý thu hủy** — sự cố, phiếu thu hủy (khấu hao > 70% → phiếu thu hủy)
5. **Báo cáo & thống kê** — tình hình sử dụng thiết bị, sửa chữa/bảo trì, tình trạng

## Key Files

| Concern | Location |
|---------|----------|
| API routes + RBAC groups | `routes/api.php` |
| SPA + auth web routes | `routes/web.php` |
| Role check middleware | `app/Http/Middleware/CheckRole.php` |
| Must-change-password gate | `app/Http/Middleware/CheckMustChangePassword.php` |
| All policies | `app/Policies/` |
| All FormRequests | `app/Http/Requests/` |
| Asset depreciation logic | `app/Models/Asset.php` |
| Request state machine | `app/Models/AssetRequest.php` |
| Auth + password reset | `app/Services/AuthService.php` |
| React entry point | `resources/js/app.jsx` |
| i18n system | `resources/js/i18n/` |
| API client + error handler | `resources/js/services/api.js` |
| UI component library | `resources/js/components/ui/` |

## Demo Accounts

All use password `password`.

| Code | Role | Email |
|------|------|-------|
| E0001 | admin | admin@mesoco.vn |
| E0002 | hr | hr@mesoco.vn |
| E0003 | doctor | doctor@mesoco.vn |
| E0004 | technician | tech@mesoco.vn |
| E0005 | employee | staff@mesoco.vn |

Password reset codes appear in `storage/logs/laravel.log` (no real email in dev).
