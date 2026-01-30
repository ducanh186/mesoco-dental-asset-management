# AUDIT + PHASE 9 READINESS REPORT

> **Generated:** 2026-01-27  
> **Repository:** mesoco-dental-asset-management  
> **Test Status:** ✅ 253 passed (857 assertions)

---

## A) API Inventory (MVP Scope)

### Core Asset & Assignment Routes

| Method | Path | Controller@action | Middleware |
|--------|------|-------------------|------------|
| GET | `/api/assets` | `AssetController@index` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| POST | `/api/assets` | `AssetController@store` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/assets/{asset}` | `AssetController@show` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| PUT | `/api/assets/{asset}` | `AssetController@update` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| DELETE | `/api/assets/{asset}` | `AssetController@destroy` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| POST | `/api/assets/{asset}/assign` | `AssetController@assign` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| POST | `/api/assets/{asset}/unassign` | `AssetController@unassign` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/my-assets` | `AssetController@myAssets` | `auth:sanctum`, `must_change_password` |
| GET | `/api/assets/available-for-loan` | `AssetController@availableForLoan` | `auth:sanctum`, `must_change_password` |

### Request Workflow Routes

| Method | Path | Controller@action | Middleware |
|--------|------|-------------------|------------|
| GET | `/api/requests` | `RequestController@index` | `auth:sanctum`, `must_change_password` |
| POST | `/api/requests` | `RequestController@store` | `auth:sanctum`, `must_change_password` |
| GET | `/api/requests/{id}` | `RequestController@show` | `auth:sanctum`, `must_change_password` |
| POST | `/api/requests/{id}/cancel` | `RequestController@cancel` | `auth:sanctum`, `must_change_password` |
| GET | `/api/review-requests` | `ReviewRequestController@index` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| POST | `/api/requests/{id}/review` | `ReviewRequestController@review` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |

### Check-in Routes

| Method | Path | Controller@action | Middleware |
|--------|------|-------------------|------------|
| POST | `/api/checkins` | `CheckinController@store` | `auth:sanctum`, `must_change_password` |
| PATCH | `/api/checkins/{checkin}/checkout` | `CheckinController@checkout` | `auth:sanctum`, `must_change_password` |
| GET | `/api/my-checkins` | `CheckinController@myCheckins` | `auth:sanctum`, `must_change_password` |
| GET | `/api/assets/{asset}/checkin-status` | `CheckinController@assetCheckinStatus` | `auth:sanctum`, `must_change_password` |
| POST | `/api/qr/resolve` | `QrController@resolve` | `auth:sanctum`, `must_change_password` |

### Maintenance & Off-Service Routes (Phase 7)

| Method | Path | Controller@action | Middleware |
|--------|------|-------------------|------------|
| GET | `/api/maintenance-events` | `MaintenanceEventController@index` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| POST | `/api/maintenance-events` | `MaintenanceEventController@store` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| GET | `/api/maintenance-events/{id}` | `MaintenanceEventController@show` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| PUT | `/api/maintenance-events/{id}` | `MaintenanceEventController@update` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| DELETE | `/api/maintenance-events/{id}` | `MaintenanceEventController@destroy` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| POST | `/api/maintenance-events/{id}/start` | `MaintenanceEventController@start` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| POST | `/api/maintenance-events/{id}/complete` | `MaintenanceEventController@complete` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| POST | `/api/maintenance-events/{id}/cancel` | `MaintenanceEventController@cancel` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| GET | `/api/maintenance-events/summary` | `MaintenanceEventController@summary` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| POST | `/api/assets/{asset}/lock` | `AssetOffServiceController@lock` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| POST | `/api/assets/{asset}/unlock` | `AssetOffServiceController@unlock` | `auth:sanctum`, `must_change_password`, `role:admin,hr,technician` |
| GET | `/api/assets/{asset}/lock-status` | `AssetOffServiceController@status` | `auth:sanctum`, `must_change_password` |

### Inventory & Valuation Routes (Phase 6)

| Method | Path | Controller@action | Middleware |
|--------|------|-------------------|------------|
| GET | `/api/inventory/summary` | `InventoryController@summary` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/inventory/assets` | `InventoryController@assets` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/inventory/valuation` | `InventoryController@valuation` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/inventory/export` | `InventoryController@export` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/my-asset-history` | `MyAssetHistoryController@index` | `auth:sanctum`, `must_change_password` |
| GET | `/api/my-asset-history/summary` | `MyAssetHistoryController@summary` | `auth:sanctum`, `must_change_password` |

### Feedback & Reports Routes (Phase 8)

| Method | Path | Controller@action | Middleware |
|--------|------|-------------------|------------|
| GET | `/api/feedbacks` | `FeedbackController@index` | `auth:sanctum`, `must_change_password` |
| POST | `/api/feedbacks` | `FeedbackController@store` | `auth:sanctum`, `must_change_password` |
| GET | `/api/feedbacks/{id}` | `FeedbackController@show` | `auth:sanctum`, `must_change_password` |
| PUT | `/api/feedbacks/{id}` | `FeedbackController@update` | `auth:sanctum`, `must_change_password` |
| DELETE | `/api/feedbacks/{id}` | `FeedbackController@destroy` | `auth:sanctum`, `must_change_password` |
| PATCH | `/api/feedbacks/{id}/status` | `FeedbackController@updateStatus` | `auth:sanctum`, `must_change_password` |
| GET | `/api/feedbacks/summary` | `FeedbackController@summary` | `auth:sanctum`, `must_change_password` |
| GET | `/api/reports/summary` | `ReportController@summary` | `auth:sanctum`, `must_change_password`, `role:admin,hr` |
| GET | `/api/reports/export` | `ReportController@export` | `auth:sanctum`, `must_change_password`, `role:admin` |

---

## B) End-to-End Workflow Verification

### 1. Loan Request → Approve → Assign → Return

**Data Path:**
```
POST /api/requests (type=ASSET_LOAN)
  └─ StoreRequestRequest.php L184 → validates $asset->isLocked() ❌ blocks locked
  └─ StoreRequestRequest.php L188 → validates isAvailableForLoan()
     
POST /api/requests/{id}/review (action=approve)
  └─ ReviewRequestController@review → policy check via AssetRequestPolicy
  └─ No re-validation of asset lock status (approve is workflow, not physical assignment)

POST /api/assets/{asset}/assign
  └─ AssetController.php L327 → DB::transaction + lockForUpdate()
  └─ AssetController.php L332 → $lockedAsset->isLocked() ✅ race-safe re-check
  └─ AssetController.php L352 → lockForUpdate() on AssetAssignment to prevent double-assign

POST /api/assets/{asset}/unassign
  └─ AssetController.php L391 → DB::transaction + lockForUpdate()
```

**Evidence Files:**
- [StoreRequestRequest.php#L184](app/Http/Requests/StoreRequestRequest.php#L184) - Lock check on loan request
- [AssetController.php#L327-L382](app/Http/Controllers/AssetController.php#L327) - Transaction + lock on assign

**Race Safety:** ✅ Uses `lockForUpdate()` in transaction before assign

---

### 2. QR Scan / Check-in Flow

**Data Path:**
```
POST /api/qr/resolve
  └─ QrController.php L29-56 → Parse payload, lookup QrIdentity
  └─ QrController.php L75 → Check asset.status === 'off_service' → block
  └─ Returns: canCheckIn, checkInBlockedReason, actions[]

POST /api/checkins
  └─ CheckinController.php L48 → Gate::inspect('checkIn', [$asset])
  └─ AssetCheckinPolicy.php L47 → $asset->isLocked() → deny with ASSET_LOCKED
  └─ CheckinController.php L53 → Returns { message, error: 'ASSET_LOCKED' } 422
  └─ CheckinController.php L83-91 → Transaction + lockForUpdate() to prevent duplicate
```

**Error Response Schema:**
```json
{
  "message": "Asset is currently unavailable",
  "error": "ASSET_LOCKED"
}
```

**Evidence Files:**
- [QrController.php#L75](app/Http/Controllers/QrController.php#L75) - Block reason detection
- [AssetCheckinPolicy.php#L47](app/Policies/AssetCheckinPolicy.php#L47) - Policy lock check
- [CheckinController.php#L48-56](app/Http/Controllers/CheckinController.php#L48) - Error response

---

### 3. Maintenance: Create → Start → Lock → Complete → Unlock

**Data Path:**
```
POST /api/maintenance-events
  └─ MaintenanceService.php L36 → DB::transaction → create with status=scheduled
  
POST /api/maintenance-events/{id}/start
  └─ MaintenanceService.php L107 → DB::transaction
  └─ MaintenanceService.php L109 → Asset::lockForUpdate()->find()
  └─ MaintenanceService.php L128 → lockAsset() → status='maintenance'

POST /api/maintenance-events/{id}/complete
  └─ MaintenanceService.php L161 → DB::transaction
  └─ MaintenanceService.php L162 → Asset::lockForUpdate()
  └─ MaintenanceService.php L185 → maybeUnlockAsset() 
     └─ Only unlocks if NO other in_progress events exist
```

**State Machine:**
```
scheduled ──start──► in_progress ──complete──► completed
    │                     │
    └──cancel──►  canceled ◄──cancel──┘
```

**Evidence Files:**
- [MaintenanceService.php#L107-130](app/Services/MaintenanceService.php#L107) - Start with lockForUpdate
- [MaintenanceService.php#L161-186](app/Services/MaintenanceService.php#L161) - Complete with maybeUnlock
- [MaintenanceEvent model](app/Models/MaintenanceEvent.php) - State machine methods

---

### 4. Manual Off-Service Lock/Unlock

**Data Path:**
```
POST /api/assets/{asset}/lock
  └─ AssetOffServiceController.php L37 → Gate::allows('manageOffService')
  └─ MaintenanceEventPolicy.php L160 → role in [admin, hr, technician]
  └─ AssetOffServiceController.php L54 → $asset->isLocked() → 422 ASSET_ALREADY_LOCKED
  └─ MaintenanceService.php L231-245 → lockForUpdate + update fields

POST /api/assets/{asset}/unlock
  └─ AssetOffServiceController.php L98 → Gate::allows('manageOffService')
  └─ AssetOffServiceController.php L106 → Check !isLocked() → 422 ASSET_NOT_LOCKED
  └─ AssetOffServiceController.php L113 → hasActiveMaintenanceEvent() → 422 HAS_ACTIVE_MAINTENANCE
  └─ MaintenanceService.php L258-275 → lockForUpdate + clear fields
```

**Metadata Mapping:**

| Field | Description |
|-------|-------------|
| `off_service_reason` | Why locked (string, max 500) |
| `off_service_from` | When lock started (timestamp) |
| `off_service_until` | Expected unlock date (nullable) |
| `off_service_set_by` | User ID who locked (FK→users) |

**Lock Condition (Single Source of Truth):**
```php
// Asset.php L117-120
public function isLocked(): bool
{
    return in_array($this->status, ['off_service', 'maintenance']);
}
```

---

## C) RBAC Evidence

### Roles Definition

**Source:** `app/Models/User.php` L20-27

```php
public const ROLES = ['admin', 'hr', 'doctor', 'technician', 'employee'];
public const ADMIN_ROLES = ['admin', 'hr'];
```

### Role → Abilities Matrix

| Ability | admin | hr | technician | doctor | staff |
|---------|-------|-----|------------|--------|-------|
| **Asset CRUD** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Assign/Unassign** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Maintenance CRUD** | ✅ | ✅ | ✅ (own) | ❌ | ❌ |
| **Maintenance start/complete/cancel** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Lock/Unlock assets** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Review requests** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Inventory/Reports** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Check-in own assets** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create requests** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manage feedback status** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Delete feedback** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **User role changes** | ✅ | ❌ | ❌ | ❌ | ❌ |

### Enforcement Layers

| Layer | File | Evidence |
|-------|------|----------|
| Route Middleware | `routes/api.php` L220-243 | `->middleware('role:admin,hr,technician')` |
| Role Middleware | `app/Http/Middleware/CheckRole.php` | `$user->hasAnyRole($allowedRoles)` |
| Gate | `AppServiceProvider.php` L54 | `Gate::define('manageOffService', ...)` |
| Policy | `MaintenanceEventPolicy.php` L28-29 | `MANAGER_ROLES = ['admin', 'hr', 'technician']` |

---

## D) Error Schema Contract

### Pattern Analysis

**Predominant Pattern:** `{ message: string, error: string }`

**Examples from Controllers:**

1. **AssetController.php L335** (Asset locked):
```json
{
  "message": "Asset is currently unavailable.",
  "error": "ASSET_LOCKED",
  "asset_status": "maintenance"
}
```

2. **CheckinController.php L54** (Check-in denied):
```json
{
  "message": "Asset is currently unavailable",
  "error": "ASSET_LOCKED"
}
```

3. **AssetOffServiceController.php L56** (Already locked):
```json
{
  "message": "Asset is already locked.",
  "error": "ASSET_ALREADY_LOCKED",
  "current_status": "off_service",
  "lock_reason": "Broken motor"
}
```

### Inconsistency Found

| File | Line | Field Used |
|------|------|------------|
| CheckinController.php | L76 | `error_code` ← **outlier** |
| All others | — | `error` |

**Location:** [CheckinController.php#L76](app/Http/Controllers/CheckinController.php#L76)
```php
return response()->json([
    'message' => 'No active shifts configured.',
    'error_code' => 'NO_ACTIVE_SHIFTS',  // Should be 'error'
], 422);
```

### Conclusion

- **Schema in use:** `{ message, error }` (95%+ of endpoints)
- **Backward compatibility:** FE should handle both `error` and `error_code`
- **Recommendation:** Standardize to `error` in CheckinController L76

---

## E) Database Schema Evidence

### Migration Files (Phase 6/7/8)

| Phase | Migration | Purpose |
|-------|-----------|---------|
| 6 | `2026_01_27_000001_add_valuation_fields_to_assets_table.php` | purchase_cost, useful_life_months, salvage_value, warranty_expiry, location, category |
| 6 | `2024_01_15_000001_create_locations_table.php` | Physical locations |
| 7 | `2026_01_27_100001_add_off_service_metadata_to_assets.php` | off_service_reason, off_service_from, off_service_until, off_service_set_by |
| 7 | `2026_01_27_100002_create_maintenance_events_table.php` | code, asset_id, type, status, planned_at, started_at, completed_at, cost |
| 8 | `2026_01_27_223425_create_feedbacks_table.php` | code, user_id, asset_id, content, type, status, rating |

### Key Table Schemas

**assets (status + off_service_*)**
```
status: enum('active', 'off_service', 'maintenance', 'retired')
off_service_reason: varchar(255) nullable
off_service_from: timestamp nullable
off_service_until: timestamp nullable  
off_service_set_by: FK→users nullable
```

**maintenance_events**
```
id, code (unique), asset_id (FK), type, status (enum), 
planned_at, started_at, completed_at, priority, 
note, result_note, cost, assigned_to, 
created_by (FK), updated_by (FK), timestamps, soft_delete
```

**asset_checkins**
```
id, asset_id (FK), employee_id (FK→users), shift_id (FK), 
shift_date, checked_in_at, checked_out_at, source (enum), notes
UNIQUE(asset_id, shift_id, shift_date)
```

**requests (asset_requests)**
```
id, code, type (JUSTIFICATION|ASSET_LOAN|CONSUMABLE_REQUEST),
employee_id (FK), status, justification, reviewed_by, timestamps
```

---

## F) Test Evidence

### Test Files Covering MVP Flows

| File | Tests | Coverage |
|------|-------|----------|
| `MaintenanceTest.php` | 27 | Lock/unlock, state transitions, IDOR, block effects |
| `AssetCheckinTest.php` | 22 | Check-in/out, lock blocking, QR resolve |
| `RequestTest.php` | 31 | CRUD, cancel, review, RBAC |
| `RequestValidationTest.php` | 6 | Asset lock validation, IDOR |
| `InventoryApiTest.php` | 28 | Inventory, valuation, export, warranty |
| `FeedbackTest.php` | 24 | CRUD, status management, RBAC |
| `ReportTest.php` | 10 | Summary stats, date range |
| `AuthTest.php` | 28 | Login, password, rate limit |
| `MyAssetHistoryTest.php` | 12 | History, IDOR protection |

### Test Results

```
Tests:    253 passed (857 assertions)
Duration: 9.76s
```

### Key Test Cases

| Test | File | Line | Coverage |
|------|------|------|----------|
| `test_cannot_assign_locked_asset` | MaintenanceTest.php | 410 | Lock blocking on assign |
| `test_cannot_checkin_locked_asset` | MaintenanceTest.php | 425 | Lock blocking on check-in |
| `test_cannot_request_loan_for_locked_asset` | MaintenanceTest.php | 454 | Lock blocking on request |
| `test_complete_maintenance_keeps_lock_if_other_active` | MaintenanceTest.php | 230 | Multi-event lock logic |
| `test_employee_cannot_view_others_request_idor_protection` | RequestTest.php | 209 | IDOR prevention |

---

## G) Phase 9 Readiness Checklist

| Area | Status | Evidence / Notes |
|------|--------|------------------|
| **IDOR Protection** | ✅ Pass | Tests: `test_employee_cannot_view_others_request_idor_protection`, `test_user_cannot_see_other_users_history_via_any_parameter` |
| **Validation Consistency** | ✅ Pass | All FormRequests use `authorize()` + `rules()`. Lock checks in StoreRequestRequest. |
| **Rate Limiting** | ✅ Pass | Configured in AppServiceProvider for login (5/min), forgot-password (3/min per IP). |
| **Concurrency/Transactions** | ✅ Pass | `lockForUpdate()` in assign, check-in, maintenance start/complete. |
| **Audit Logging** | ⚠️ Partial | `created_by`, `updated_by` on maintenance. No general audit_log table. |
| **Seed/Smoke Tests** | ✅ Pass | `FinalMvpSeeder` creates all roles. 253 tests green. |
| **Error Schema** | ⚠️ Minor | 1 outlier using `error_code` instead of `error`. See Section D. |
| **Deploy: Timezone** | ✅ Ready | Uses `now()` from Carbon, respects `config('app.timezone')`. |
| **Deploy: Config Cache** | ✅ Ready | No env() calls outside config files. |

### Backlog for Phase 9

| Priority | Item | Effort |
|----------|------|--------|
| P1 | Fix `error_code` → `error` in CheckinController L76 | 5 min |
| P2 | Add comprehensive audit_log table (optional) | 2-4 hrs |
| P2 | Add API versioning headers for FE compatibility | 1 hr |
| P3 | Add request timeout middleware for long operations | 1 hr |
| P3 | Document all error codes in central reference | 2 hrs |

---

## Summary

**MVP Readiness:** ✅ **READY**

- 84 API routes covering all core workflows
- 253 tests passing with 857 assertions
- RBAC enforced at route + policy + gate levels
- Lock semantics consistent via `Asset::isLocked()`
- Transactions + `lockForUpdate()` for race safety
- 1 minor error schema inconsistency (easy fix)

**Recommendation:** Fix the single `error_code` outlier and proceed to Phase 9 (Production Hardening).
