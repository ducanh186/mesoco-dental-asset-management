# Phase 4: Asset Tracking (Timesheet) - QA Checklist

## Overview
Shift-based check-in/out system for asset tracking. Clinic uses 3 shifts per day.

## Default Shifts
| Code | Name      | Time Range    |
|------|-----------|---------------|
| S1   | Morning   | 08:00 - 12:00 |
| S2   | Afternoon | 13:00 - 17:00 |
| S3   | Evening   | 18:00 - 21:00 |

---

## Database Schema

### `shifts` table
- [x] `id`, `code` (unique), `name`
- [x] `start_time`, `end_time`
- [x] `is_active` (boolean), `sort_order`
- [x] Indexes on `is_active`, `sort_order`

### `asset_checkins` table
- [x] `id`, `asset_id`, `employee_id`, `shift_id`
- [x] `shift_date` (date)
- [x] `checked_in_at`, `checked_out_at` (nullable)
- [x] `source` (qr/manual), `notes`
- [x] Unique constraint: `(asset_id, shift_id, shift_date)`

---

## API Endpoints

### GET /api/shifts
- [x] Returns all active shifts ordered by `sort_order`
- [x] Includes `current_shift` based on current time
- [x] Any authenticated user can access

### POST /api/checkins
- [x] Auto-detects current shift if `shift_id` not provided
- [x] Defaults `shift_date` to today if not provided
- [x] Validates asset exists
- [x] Only assignee OR admin/hr can check-in
- [x] Blocks `off_service` assets (422, ASSET_OFF_SERVICE)
- [x] Prevents duplicate: same asset + shift + date (409, DUPLICATE_CHECKIN)
- [x] Returns created check-in with relations

### PATCH /api/checkins/{id}/checkout
- [x] Only the person who checked in (or admin/hr) can checkout
- [x] Returns error if already checked out (ALREADY_CHECKED_OUT)

### GET /api/my-checkins
- [x] Returns all check-ins for authenticated user
- [x] Optional `?date=YYYY-MM-DD` filter
- [x] Ordered by date desc, checked_in_at desc

### GET /api/assets/{asset}/checkin-status
- [x] Returns today's check-in status for an asset
- [x] Includes current shift and today's check-ins

### GET /api/my-assets?include_checkin_status=true
- [x] Extended to optionally include check-in status
- [x] Each asset includes `checkin_status` object

### POST /api/qr/resolve
- [x] Extended to include `checkin_status` object
- [x] Returns `can_check_in` boolean
- [x] Returns `blocked_reason` if can't check-in
- [x] Returns `actions` array for UI buttons

---

## Business Rules

### Check-in Authorization
- [x] Only assignee can check-in their assigned asset
- [x] Admin/HR can check-in any asset
- [x] Non-assignee gets 403 (NOT_ASSIGNEE)

### Check-in Restrictions
- [x] Asset status `off_service` → 422 (ASSET_OFF_SERVICE)
- [x] Asset not assigned → 403 (ASSET_NOT_ASSIGNED)
- [x] Already checked in same shift+date → 409 (DUPLICATE_CHECKIN)

### Check-out Authorization
- [x] Only the person who checked in can checkout
- [x] Admin/HR can checkout any check-in
- [x] Already checked out → 403 (ALREADY_CHECKED_OUT)

---

## Smoke Test Workflow

### Prerequisites
```bash
# Reset database and seed
php artisan migrate:fresh --seed
```

### Test Flow

1. **Login as Admin (E0001)**
```
POST /login
{ "employee_code": "E0001", "password": "password" }
```

2. **Get Shifts**
```
GET /api/shifts
Expected: 3 shifts (S1, S2, S3), current_shift based on time
```

3. **Check-in Asset (Manual)**
```
POST /api/checkins
{ "asset_id": 1, "source": "manual" }
Expected: 201, check-in created
```

4. **Try Duplicate Check-in**
```
POST /api/checkins
{ "asset_id": 1 }
Expected: 409, DUPLICATE_CHECKIN
```

5. **Get My Check-ins**
```
GET /api/my-checkins
Expected: Contains the check-in from step 3
```

6. **Check-out**
```
PATCH /api/checkins/{id}/checkout
Expected: 200, checked_out_at populated
```

7. **Login as Doctor (E0003)**
```
POST /login
{ "employee_code": "E0003", "password": "password" }
```

8. **Get My Assets with Check-in Status**
```
GET /api/my-assets?include_checkin_status=true
Expected: Assets have checkin_status object
```

9. **QR Resolve with Check-in Actions**
```
POST /api/qr/resolve
{ "payload": "<valid_qr_payload>" }
Expected: Response includes checkin_status and actions
```

---

## Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| ASSET_OFF_SERVICE | 422 | Asset is off_service |
| ASSET_NOT_ASSIGNED | 403 | Asset has no current assignee |
| NOT_ASSIGNEE | 403 | User is not the current assignee |
| DUPLICATE_CHECKIN | 409 | Already checked in for this shift/date |
| NO_ACTIVE_SHIFTS | 422 | No active shifts configured |
| ALREADY_CHECKED_OUT | 403 | Check-in already has checkout |
| NOT_OWNER | 403 | User is not the one who checked in |

---

## Test Results

```
php artisan test tests/Feature/AssetCheckinTest.php

✓ authenticated user can list shifts
✓ unauthenticated user cannot list shifts
✓ assignee can check in asset
✓ admin can check in any asset
✓ non assignee cannot check in asset
✓ cannot check in off service asset
✓ cannot duplicate checkin same shift same day
✓ checkin auto detects current shift
✓ checkin can specify shift
✓ user can checkout own checkin
✓ admin can checkout any checkin
✓ cannot checkout already checked out
✓ user can get own checkins
✓ user can filter checkins by date
✓ can get asset checkin status
✓ qr resolve includes checkin status
✓ qr resolve shows can checkin for assignee
✓ qr resolve blocks checkin for off service
✓ my assets can include checkin status

Tests: 19 passed (74 assertions)
```

---

## Files Created/Modified

### New Files
- `database/migrations/2026_01_26_100000_create_shifts_table.php`
- `database/migrations/2026_01_26_100001_create_asset_checkins_table.php`
- `app/Models/Shift.php`
- `app/Models/AssetCheckin.php`
- `database/seeders/ShiftSeeder.php`
- `database/factories/EmployeeFactory.php`
- `app/Http/Controllers/ShiftController.php`
- `app/Http/Controllers/CheckinController.php`
- `app/Policies/AssetCheckinPolicy.php`
- `tests/Feature/AssetCheckinTest.php`
- `docs/PHASE4_QA_GUIDE.md` (this file)

### Modified Files
- `database/seeders/DatabaseSeeder.php` - Added ShiftSeeder call
- `app/Providers/AppServiceProvider.php` - Registered policy
- `routes/api.php` - Added Phase 4 routes
- `app/Http/Controllers/QrController.php` - Extended with check-in status
- `app/Http/Controllers/AssetController.php` - Extended with check-in status
- `postman/mesoco.postman_collection.json` - Added Phase 4 endpoints

---

## Sign-off

| Check | Status |
|-------|--------|
| All tests pass | ✅ |
| Postman collection updated | ✅ |
| Existing Phase 1-3 tests pass | ✅ |
| Documentation complete | ✅ |

**Phase 4 Backend: COMPLETE** ✅
