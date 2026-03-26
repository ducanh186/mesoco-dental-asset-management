# RBAC Matrix — Mesoco Dental Asset Management

> **Last Updated:** 2024-01-XX (Phase 9 Hardening)
> **Total Routes:** 84+ API endpoints
> **Enforcement Layers:** Route Middleware → FormRequest authorize() → Policy

---

## 1. Role Definitions

| Role | Code | Description | ADMIN_ROLES? |
|------|------|-------------|--------------|
| Admin | `admin` | Full system access, manages users/roles | ✅ |
| HR | `hr` | Asset/employee management, request review | ✅ |
| Technician | `technician` | Maintenance operations, limited asset ops | ❌ |
| Doctor | `doctor` | Request assets, view own assignments | ❌ |
| Staff/Employee | `employee` | Request assets, view own assignments | ❌ |

**Note:** `isAdmin()` returns `true` for both `admin` and `hr` roles (see `User::ADMIN_ROLES`).

---

## 2. Endpoint Permission Matrix

### 2.1 Authentication & Profile (All Authenticated Users)

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/me` | GET | All | auth:sanctum | Current user info |
| `/api/profile` | PUT | All | auth:sanctum | Update own profile |
| `/api/change-password` | POST | All | auth:sanctum | Must change password flow |
| `/api/logout` | POST | All | auth:sanctum | End session |

### 2.2 Assets — Admin/HR Only

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/assets` | GET | admin, hr | `role:admin,hr` | List all assets |
| `/api/assets` | POST | admin, hr | `role:admin,hr` + FormRequest | Create asset |
| `/api/assets/{id}` | GET | admin, hr | `role:admin,hr` | View single asset |
| `/api/assets/{id}` | PUT | admin, hr | `role:admin,hr` + FormRequest | Update asset |
| `/api/assets/{id}` | DELETE | admin, hr | `role:admin,hr` | Soft delete asset |
| `/api/assets/{id}/assign` | POST | admin, hr | `role:admin,hr` + FormRequest | Assign to employee |
| `/api/assets/{id}/unassign` | POST | admin, hr | `role:admin,hr` | Unassign asset |
| `/api/assets/{id}/lock` | POST | admin, hr, tech | `role:admin,hr,technician` | Lock (off-service) |
| `/api/assets/{id}/unlock` | POST | admin, hr, tech | `role:admin,hr,technician` | Unlock asset |

### 2.3 My Assets (Current User's Assignments)

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/my-assets` | GET | All | auth:sanctum | Filtered by employee_id |
| `/api/my-assets/{id}` | GET | All | auth:sanctum + Policy | View assigned asset |
| `/api/my-asset-history` | GET | All | auth:sanctum | Assignment history |

### 2.4 Employees — Admin/HR Only

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/employees` | GET | admin, hr | `role:admin,hr` | List employees |
| `/api/employees` | POST | admin, hr | `role:admin,hr` + FormRequest | Create employee |
| `/api/employees/{id}` | GET | admin, hr | `role:admin,hr` | View employee |
| `/api/employees/{id}` | PUT | admin, hr | `role:admin,hr` + FormRequest | Update employee |
| `/api/employees/{id}` | DELETE | admin, hr | `role:admin,hr` | Soft delete |
| `/api/employees-without-users` | GET | admin, hr | `role:admin,hr` | For user creation dropdown |

### 2.5 Users (Roles & Permission) — Tiered Access

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/users` | GET | admin, hr | `role:admin,hr` | List users |
| `/api/users` | POST | admin, hr | `role:admin,hr` + FormRequest | Create user account |
| `/api/users/{id}` | GET | admin, hr | `role:admin,hr` | View user |
| `/api/users/{id}/role` | PATCH | **admin only** | `role:admin` + FormRequest | ⚠️ Change role |
| `/api/users/{id}` | DELETE | **admin only** | `role:admin` | ⚠️ Delete user |
| `/api/roles` | GET | admin, hr | `role:admin,hr` | Role list for dropdown |

### 2.6 Locations — Admin/HR Only

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/locations` | GET/POST | admin, hr | `role:admin,hr` | CRUD locations |
| `/api/locations/{id}` | GET/PUT/DELETE | admin, hr | `role:admin,hr` | Location management |

### 2.7 Asset Requests — Tiered Access

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/requests` | GET | All | auth:sanctum | Returns own requests only |
| `/api/requests` | POST | All | auth:sanctum + Policy | Create request |
| `/api/requests/{id}` | GET | All | auth:sanctum + **Policy** | View (owns or admin) |
| `/api/requests/{id}/cancel` | POST | All | auth:sanctum + **Policy** | Cancel own request |
| `/api/review-requests` | GET | admin, hr | `role:admin,hr` | Review queue |
| `/api/review-requests/{id}/approve` | POST | admin, hr | `role:admin,hr` + Policy | Approve request |
| `/api/review-requests/{id}/reject` | POST | admin, hr | `role:admin,hr` + Policy | Reject request |

### 2.8 Check-in/Check-out — Policy-Based

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/checkins` | POST | All | auth:sanctum + **Policy** | Check-in asset |
| `/api/checkins/{id}/checkout` | POST | All | auth:sanctum + **Policy** | Check-out asset |
| `/api/checkins/history` | GET | admin, hr | `role:admin,hr` | Global check-in history |
| `/api/my-checkins` | GET | All | auth:sanctum | Own check-in history |

### 2.9 Shifts — Admin/HR Only

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/shifts` | GET/POST | admin, hr | `role:admin,hr` | Shift management |
| `/api/shifts/{id}` | GET/PUT/DELETE | admin, hr | `role:admin,hr` | CRUD shifts |
| `/api/shifts/current` | GET | All | auth:sanctum | Get current active shift |

### 2.10 Inventory — Admin/HR Only

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/inventory/summary` | GET | admin, hr | `role:admin,hr` | Dashboard stats |
| `/api/inventory/assets` | GET | admin, hr | `role:admin,hr` | Inventory list |
| `/api/inventory/valuation` | GET | admin, hr | `role:admin,hr` | Valuation report |
| `/api/inventory/export` | GET | admin, hr | `role:admin,hr` | CSV export |

### 2.11 Maintenance — Tiered Access

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/maintenance-events` | GET | admin, hr, tech | `role:admin,hr,technician` | List events |
| `/api/maintenance-events` | POST | admin, hr, tech | `role:admin,hr,technician` | Create event |
| `/api/maintenance-events/{id}` | GET | admin, hr, tech | middleware + **Policy** | View event |
| `/api/maintenance-events/{id}` | PUT | admin, hr, tech | middleware + **Policy** | Update event |
| `/api/maintenance-events/{id}` | DELETE | admin, hr | `role:admin,hr` + **Policy** | Delete (scheduled only) |
| `/api/maintenance-events/{id}/start` | POST | admin, hr, tech | middleware + **Policy** | Transition to in_progress |
| `/api/maintenance-events/{id}/complete` | POST | admin, hr, tech | middleware + **Policy** | Transition to completed |
| `/api/maintenance-events/{id}/cancel` | POST | admin, hr, tech | middleware + **Policy** | Transition to canceled |

### 2.12 Feedback — Policy-Based

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/feedback` | GET | All | auth:sanctum | List (filtered for non-admin) |
| `/api/feedback` | POST | All | auth:sanctum | Submit feedback |
| `/api/feedback/{id}` | GET | All | auth:sanctum + **Policy** | View (owns or admin) |
| `/api/feedback/{id}` | DELETE | admin, hr | **Policy** | Delete feedback |
| `/api/feedback/{id}/resolve` | POST | admin, hr | **Policy** | Mark as resolved |

### 2.13 Reports — Admin/HR Only

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/reports/*` | GET | admin, hr | `role:admin,hr` | Various reports |

### 2.14 QR Codes — All Authenticated

| Endpoint | Method | Roles | Enforcement | Notes |
|----------|--------|-------|-------------|-------|
| `/api/qr/resolve/{code}` | GET | All | auth:sanctum | Resolve QR to asset |

---

## 3. Policy Summary

| Policy | Model | Key Methods |
|--------|-------|-------------|
| `AssetPolicy` | Asset | view (admin OR assigned), create/update/delete (admin) |
| `AssetRequestPolicy` | AssetRequest | view/cancel (requester OR admin), review (admin) |
| `AssetCheckinPolicy` | AssetCheckin | checkIn/checkOut (assignee OR admin), blocks locked assets |
| `UserPolicy` | User | CRUD (admin), view own profile (all) |
| `EmployeePolicy` | Employee | CRUD (admin) |
| `MaintenanceEventPolicy` | MaintenanceEvent | CRUD (admin/hr/tech with ownership rules) |
| `FeedbackPolicy` | Feedback | view/delete (author OR admin) |

---

## 4. IDOR Protection Verification

### 4.1 Critical IDOR Test Cases

| # | Scenario | Expected | Verified? |
|---|----------|----------|-----------|
| 1 | Doctor GET `/requests/{other_user_request_id}` | 403 Forbidden | ⬜ |
| 2 | Doctor POST `/requests/{other_user_request_id}/cancel` | 403 Forbidden | ⬜ |
| 3 | Staff GET `/assets/{any_id}` (not assigned) | 403 Forbidden | ⬜ |
| 4 | HR PATCH `/users/{id}/role` | 403 Forbidden | ⬜ |
| 5 | Technician DELETE `/users/{id}` | 403 Forbidden | ⬜ |
| 6 | Doctor GET `/maintenance-events` | 403 Forbidden | ⬜ |
| 7 | Staff POST `/checkins` (asset not assigned to them) | 403 NOT_ASSIGNEE | ⬜ |
| 8 | Any user GET `/feedback/{other_user_feedback_id}` | 403 Forbidden | ⬜ |

### 4.2 404 vs 403 Decision Matrix

| Scenario | Response Code | Rationale |
|----------|---------------|-----------|
| Resource doesn't exist | 404 Not Found | No info leak |
| Resource exists, no permission | 403 Forbidden | Explicit denial |
| Resource exists, ownership check fails | 403 Forbidden | Policy-enforced |

---

## 5. Enforcement Verification Checklist

### 5.1 Route Middleware (`role:X`)

- [x] All admin-only routes use `role:admin`
- [x] All admin+hr routes use `role:admin,hr`
- [x] All admin+hr+tech routes use `role:admin,hr,technician`
- [x] CheckRole middleware returns proper 403 with role info

### 5.2 FormRequest authorize()

| FormRequest | authorize() Check | Status |
|-------------|-------------------|--------|
| StoreAssetRequest | `isAdmin()` | ✅ |
| UpdateAssetRequest | `isAdmin()` | ✅ |
| AssignAssetRequest | `isAdmin()` | ✅ |
| StoreUserRequest | `isAdmin()` | ✅ |
| UpdateUserRoleRequest | `isAdmin()` | ✅ |
| StoreEmployeeRequest | `isAdmin()` | ✅ |
| UpdateEmployeeRequest | `isAdmin()` | ✅ |
| StoreMaintenanceEventRequest | TBD | ⬜ |
| UpdateMaintenanceEventRequest | TBD | ⬜ |

### 5.3 Policy Enforcement in Controllers

| Controller | Policy Used | Verified? |
|------------|-------------|-----------|
| RequestController | AssetRequestPolicy | ✅ view, cancel |
| ReviewRequestController | AssetRequestPolicy | ✅ viewReviewQueue, review |
| CheckinController | AssetCheckinPolicy | ✅ checkIn, checkOut |
| MaintenanceEventController | MaintenanceEventPolicy | ✅ view, delete, start, cancel |
| FeedbackController | FeedbackPolicy | ✅ view, delete, manage |
| AssetController | AssetPolicy | ⬜ (uses route middleware primarily) |
| UserController | UserPolicy | ⬜ (uses route middleware primarily) |

---

## 6. Security Notes

### 6.1 Non-negotiable Rules

1. **Never rely on frontend hiding** for security — all RBAC enforced at backend
2. **Never auto-scope admin endpoints** to current user — use explicit `/my-*` routes
3. **Prevent IDOR** via Policy checks on all resource-specific endpoints
4. **Auth is cookie-based** (Sanctum session) — respect CSRF
5. **Login uses employee_code**, not email

### 6.2 Known Gaps to Address

1. Some controllers rely solely on route middleware without Policy double-check
2. Need to verify all Maintenance FormRequests have proper authorize()
3. Consider adding rate limiting to sensitive endpoints

---

## 7. Test Coverage Status

```
PHPUnit Tests: 253 tests, 857 assertions
Status: ALL PASSING ✅
```

### Key RBAC Test Files:
- `tests/Feature/Auth/RbacTest.php`
- `tests/Feature/UserManagementTest.php`
- `tests/Feature/AssetRequestFlowTest.php`
- `tests/Feature/MaintenanceEventTest.php`
- `tests/Feature/CheckinTest.php`

---

*Document generated during Phase 9 Hardening audit.*
