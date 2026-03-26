# Checklist Phase 3 + Phase 4 - Đánh giá

> Ngày đánh giá: 2026-01-26

---

# Phase 3 — Asset Master Data + Assignment + QR Identity

## A. Data model

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | `assets` có: `asset_code` (unique), `name`, `type`, `status`, `notes` | ✅ PASS | Migration có đủ, type enum: tray/machine/tool/equipment/other |
| 2 | `assets` có **soft delete** (`deleted_at`) + Model dùng `SoftDeletes` | ✅ PASS | Migration có `$table->softDeletes()`, Model dùng `use SoftDeletes` |
| 3 | `asset_qr_identities` có: `asset_id`, `qr_uid` (unique), `payload` (v1), `is_active` | ⚠️ PARTIAL | Có `qr_uid` unique, `payload_version`. **Thiếu `is_active` column** - dùng latest() để lấy QR mới nhất |
| 4 | `asset_assignments` đảm bảo **1 active assignment/asset** | ✅ PASS | Index `['asset_id', 'unassigned_at']` + business logic enforce |

## B. RBAC & access

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Admin/HR: full CRUD `/api/assets`, assign/unassign, regenerate QR, delete | ✅ PASS | Route middleware `role:admin,hr` |
| 2 | All authenticated: `/api/my-assets`, `/api/qr/resolve` | ✅ PASS | Không có middleware role trên routes này |
| 3 | Doctor/Nurse không truy cập `/api/assets*` (403) | ✅ PASS | `role:admin,hr` middleware sẽ trả 403 |

## C. API contract

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | `/api/my-assets` trả đúng "thiết bị đang giữ/được giao" | ✅ PASS | Filter bằng `assignedTo($employeeId)` |
| 2 | `/api/qr/resolve` nhận payload `MESOCO\|ASSET\|v1\|<uuid>` | ✅ PASS | `parsePayload()` + `findByPayload()` |
| 3 | Response **consistent** format | ✅ PASS | `transformAsset()` dùng chung |
| 4 | Soft-deleted asset: QR resolve trả 404 + `ASSET_DELETED` | ✅ PASS | Check `$asset->trashed()` |
| 5 | Validation: 422 field errors, 403 forbidden, 404 not found | ✅ PASS | |

## D. Seeder + test

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Seed có asset đủ loại (tray/machine/equipment), có assigned/unassigned, có off_service/maintenance | ✅ PASS | TRAY-001,002,003, MACH-001,002,003, EQUIP-001,002,003 |
| 2 | `php artisan migrate:fresh --seed` | ✅ PASS | Chạy OK |
| 3 | `node scripts/test-phase3.mjs` | ⚠️ EXISTS | File tồn tại nhưng chưa verify |
| 4 | `node scripts/test-api.mjs` | ⚠️ EXISTS | File tồn tại nhưng chưa verify |
| 5 | `php artisan test` | ✅ PASS | 49 tests passed |

## E. Postman/Docs

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Postman có folder Phase 3 | ✅ PASS | Có trong mesoco.postman_collection.json |
| 2 | Environment variables đủ cho role test | ✅ PASS | Có local + docker environments |
| 3 | Doc QA/smoke checklist Phase 3 | ❌ MISSING | **Cần tạo `docs/PHASE3_QA_GUIDE.md`** |

## F. UI tối thiểu

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Admin Assets: list + create + assign/unassign + regenerate QR + delete | ✅ PASS | `AssetsPage.jsx` có đủ |
| 2 | My Assets: list + QR resolve input + hiển thị status | ✅ PASS | `MyAssetsPage.jsx` có đủ |

---

# Phase 4 — Asset Tracking (Timesheet)

## A. Shifts

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | `shifts` table seeded default (S1/S2/S3) + flag `is_active` | ✅ PASS | ShiftSeeder có 3 ca, có `is_active` |
| 2 | Helper xác định **current Shift** theo `app.timezone` | ✅ PASS | `Shift::getCurrentShift()` dùng `now()` respect timezone |

## B. Tracking events

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | `asset_checkins` table có đủ columns | ✅ PASS | asset_id, employee_id, shift_id, shift_date, checked_in_at, checked_out_at, source |
| 2 | Unique constraint `(asset_id, shift_id, shift_date)` | ✅ PASS | `unique_asset_shift_date` index |
| 3 | `asset_scans` log mỗi lần scan | ❌ MISSING | **Chưa implement** (Optional per spec) |

## C. Business rules

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Chỉ **assignee** (hoặc admin/hr) được check-in | ✅ PASS | `AssetCheckinPolicy::checkIn()` |
| 2 | Asset `off_service` bị block check-in (422/409) | ✅ PASS | Returns 422 ASSET_OFF_SERVICE |
| 3 | Duplicate check-in trả 409 Conflict | ✅ PASS | Catches `UniqueConstraintViolationException` |
| 4 | Checkout: chỉ checkout check-in của chính mình | ✅ PASS | `AssetCheckinPolicy::checkOut()` |

## D. API

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | `GET /api/shifts` | ✅ PASS | Returns data + current_shift |
| 2 | `POST /api/checkins` (auto-detect Shift) | ✅ PASS | Auto-detects if shift_id not provided |
| 3 | `PATCH /api/checkins/{id}/checkout` | ✅ PASS | Implemented |
| 4 | `GET /api/my-checkins?date=` | ✅ PASS | Filter by date works |
| 5 | `/api/my-assets?include_checkin_status=true` | ✅ PASS | Returns checkin_status per asset |
| 6 | `/api/qr/resolve` trả `checkin_status` | ✅ PASS | Includes can_check_in, blocked_reason |
| 7 | `/api/qr/resolve` trả `instructions` | ❌ MISSING | **Chưa có field instructions/instructions_url** |

## E. QR scan UI behavior

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Sau QR resolve: UI hỏi **Status** hay **Instructions** | ⚠️ PARTIAL | Backend returns `actions[]` nhưng UI chưa hiện modal |
| 2 | Instructions chưa có: message "Chưa có hướng dẫn" | ❌ MISSING | Chưa implement |
| 3 | Nút **Check-in** trong view Status | ❌ MISSING | UI chưa có nút check-in |

## F. Tests + regression

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Feature tests check-in pass | ✅ PASS | 19 tests trong AssetCheckinTest.php |
| 2 | Full regression pass | ✅ PASS | 49 tests total |

## G. Postman/Docs

| # | Item | Status | Ghi chú |
|---|------|--------|---------|
| 1 | Postman có folder Phase 4 | ✅ PASS | Added shifts, checkins, etc. |
| 2 | `docs/PHASE4_QA_GUIDE.md` | ✅ PASS | File tồn tại |

---

# SUMMARY

## ✅ PASS (Đã hoàn thành)

- Data models Phase 3 + 4
- RBAC enforcement
- API endpoints đủ
- Business rules enforcement
- Tests pass 100%
- Postman collection
- Basic UI (AssetsPage, MyAssetsPage)

## ⚠️ PARTIAL / MISSING (Cần bổ sung)

### Ưu tiên cao:

1. **`docs/PHASE3_QA_GUIDE.md`** - Thiếu smoke test checklist Phase 3
2. **QR resolve thiếu `instructions` field** - API không trả instructions/instructions_url
3. **UI Check-in flow** - MyAssetsPage chưa có:
   - Modal hỏi View Status / View Instructions
   - Nút Check-in
   - Message "Chưa có hướng dẫn"

### Ưu tiên thấp (Optional):

4. **`asset_scans` log table** - Optional per spec, để audit trail
5. **`asset_qr_identities.is_active`** - Dùng latest() thay vì flag cũng OK

---

# CÂU HỎI CẦN CLARIFY

1. **Instructions format**: Lưu dạng `instructions_url` (PDF/link) hay `instructions_text` (checklist inline)?
2. **Scan logs**: Log **mọi lần scan** hay chỉ log khi cần audit?

---

# NEXT ACTIONS

```
[ ] Tạo docs/PHASE3_QA_GUIDE.md
[ ] Thêm instructions field vào Asset model + API
[ ] Update MyAssetsPage UI với modal và check-in button
[ ] (Optional) Tạo asset_scans table để log scans
```
