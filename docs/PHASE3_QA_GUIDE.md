# Phase 3 + 4 QA Testing Guide

> Quick reference for testing Asset Management (Phase 3) and Check-in (Phase 4) features

---

## 📋 Prerequisites

- Server running: `php artisan serve`
- Database seeded: `php artisan migrate:fresh --seed`
- Login as admin: `E0001` / `password`

---

## 🔑 Test Accounts

| Role | Employee Code | Password | Permissions |
|------|--------------|----------|-------------|
| Admin | `E0001` | `password` | Full access: CRUD assets, assign, check-in any |
| Doctor | `E0002` | `password` | View assigned, resolve QR, check-in own |
| Technician | `E0003` | `password` | View assigned, resolve QR, check-in own |

---

## 🏷️ Seeded Test Assets

| Asset Code | Name | Type | Status | Has Instructions |
|------------|------|------|--------|------------------|
| `TRAY-001` | Basic Examination Tray | tray | active | ✅ Yes |
| `TRAY-002` | Surgical Tray Set A | tray | active | ❌ No |
| `TRAY-003` | Orthodontic Tray | tray | active | ❌ No |
| `MACH-001` | Dental X-Ray Unit | machine | active | ✅ Yes |
| `MACH-002` | Ultrasonic Scaler | machine | active | ❌ No |
| `MACH-003` | Autoclave Sterilizer | machine | maintenance | ❌ No |
| `EQUIP-001` | Dental Chair Unit #1 | equipment | active | ❌ No |
| `EQUIP-002` | Light Curing Unit | equipment | active | ❌ No |
| `EQUIP-003` | Old Compressor | equipment | off_service | ❌ No |

---

## 📱 QR Code Testing

### Get QR Payload

**Method 1: Via API**
```powershell
# Get asset details including QR payload
curl -s http://localhost:8000/api/assets/1 -H "Accept: application/json" | jq '.asset.qr'
```

**Method 2: Via UI**
1. Login as admin
2. Go to Asset Management
3. Find asset → View Details
4. Copy QR payload (e.g., `MESOCO|ASSET|v1|xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### Resolve QR Code

**Via UI (My Assets page):**
1. Go to "My Assets" page
2. Paste QR payload in search box
3. Click "Resolve"
4. Modal opens with Status/Instructions tabs

**Via API:**
```bash
POST /api/qr/resolve
{
  "payload": "MESOCO|ASSET|v1|<uuid>"
}
```

**Expected Response:**
```json
{
  "message": "QR code resolved successfully.",
  "asset": {
    "id": 1,
    "asset_code": "TRAY-001",
    "name": "Basic Examination Tray",
    "type": "tray",
    "status": "active",
    "notes": "...",
    "instructions": {
      "type": "url",
      "url": "https://docs.mesoco.example/trays/basic-examination-tray",
      "available": true
    }
  },
  "is_assigned": true,
  "assignee": { ... },
  "checkin_status": {
    "current_shift": { ... },
    "today_checkin": null,
    "can_check_in": true,
    "blocked_reason": null
  },
  "actions": [ ... ]
}
```

---

## ✅ Check-in / Check-out Testing

### Shifts (Seeded)

| Shift | Time Range |
|-------|-----------|
| Morning (S1) | 06:00 - 12:00 |
| Afternoon (S2) | 12:00 - 18:00 |
| Evening (S3) | 18:00 - 22:00 |

### Check-in Flow

1. **Assign asset first (as admin):**
   - Go to Asset Management
   - Select TRAY-001 → Assign to E0002 (Doctor)

2. **Check in (as assignee):**
   - Login as E0002
   - Go to My Assets
   - Resolve QR for TRAY-001
   - Click "Check In" button
   - Verify status shows "Checked In"

3. **Check out:**
   - Click "Check Out" button
   - Verify status shows "Not Checked In"

### Check-in API

**Create Check-in:**
```bash
POST /api/checkins
{
  "asset_id": 1,
  "shift_id": 1  // optional, auto-detects if omitted
}
```

**Check Out:**
```bash
PATCH /api/checkins/{id}/checkout
```

**View My Check-ins:**
```bash
GET /api/my-checkins?date=2026-01-26
```

---

## 🔍 Instructions Feature Testing

### Assets with Instructions

- `TRAY-001`: https://docs.mesoco.example/trays/basic-examination-tray
- `MACH-001`: https://docs.mesoco.example/machines/dental-xray-unit

### Test via UI

1. Go to My Assets
2. Resolve QR for TRAY-001
3. In modal, click "Instructions" tab
4. Verify "Open Instructions" button shows
5. Click opens external link in new tab

### Test via API

```bash
GET /api/assets/1

# Response should include:
{
  "asset": {
    ...
    "instructions": {
      "type": "url",
      "url": "https://docs.mesoco.example/trays/basic-examination-tray",
      "available": true
    }
  }
}
```

---

## 🛡️ Error Cases to Test

| Scenario | Expected |
|----------|----------|
| Resolve invalid QR format | 422 with `INVALID_QR_FORMAT` |
| Resolve unknown QR | 404 with `QR_NOT_FOUND` |
| Resolve deleted asset | 404 with `ASSET_DELETED` |
| Check-in unassigned asset | 403 with `ASSET_NOT_ASSIGNED` |
| Check-in off_service asset | 403 with `ASSET_OFF_SERVICE` |
| Double check-in same shift | 409 with `ALREADY_CHECKED_IN` |
| Non-assignee check-in | 403 with `NOT_ASSIGNEE` |

---

## 🧪 Automated Tests

Run all Phase 3+4 tests:
```powershell
php artisan test --filter=AssetCheckinTest
```

Run instructions-specific tests:
```powershell
php artisan test --filter=instructions
```

### Test Count: 52 total
- Phase 1 Auth: 29 tests
- Phase 4 Check-in + Instructions: 23 tests

---

## 📮 Postman Collection

Import from: `postman/mesoco.postman_collection.json`

### Phase 3 Requests:
- Assets CRUD (admin)
- Assignment workflow
- QR Resolve (all users)
- My Assets endpoint

### Phase 4 Requests:
- Shifts list
- Check-in create
- Check-out
- My check-ins

---

## 🔄 Quick Reset for Testing

```powershell
# Reset database with fresh seed data
php artisan migrate:fresh --seed

# Run all tests
php artisan test --stop-on-failure
```

---

## 📝 Known Limitations

1. **Instructions URL only** - No embedded PDF/image support yet
2. **Single shift per day** - Can only check-in once per asset per shift per day
3. **No QR scanning camera** - Manual payload input only (Phase 5 scope)
