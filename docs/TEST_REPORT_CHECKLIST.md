# 📋 Mesoco Dental Asset Management - Test Report & Checklist

> **Version:** 1.0  
> **Date:** 2026-01-28  
> **Environment:** `feature/inventory-management` branch  
> **Base URL:** `http://127.0.0.1:8000`  
> **Skip:** Forgot Password (đã test xong)

---

## 📚 Mục Lục

1. [Test Accounts](#1-test-accounts)
2. [API Routes Reference](#2-api-routes-reference)
3. [Manual Test Checklist by Module](#3-manual-test-checklist-by-module)
4. [Coverage Matrix](#4-coverage-matrix)
5. [Bug List Template](#5-bug-list-template)
6. [Security Sanity Checks](#6-security-sanity-checks)

---

## 1. Test Accounts

| Role | Employee Code | Password | Quyền hạn chính |
|------|---------------|----------|-----------------|
| **admin** | E0001 | password | Full access + System Settings + Users + Roles + Inventory + Maintenance |
| **hr** | E0002 | password | Assets + Assign + Review + Reports + Users + Inventory + Maintenance |
| **doctor** | E0003 | password | My Equipment + Requests + Check-in + My Asset History + Feedbacks |
| **technician** | E0004 | password | My Equipment + Maintenance CRUD + Requests + My Asset History |
| **staff** | E0005 | password | My Equipment + Basic Requests + Check-in + My Asset History |

---

## 2. API Routes Reference

### Authentication (Web Routes)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/login` | Đăng nhập | No |
| POST | `/logout` | Đăng xuất | Yes |
| POST | `/forgot-password/request` | Yêu cầu reset password | No (SKIP) |
| POST | `/forgot-password/reset` | Reset password | No (SKIP) |

### Common Routes (All Authenticated Users)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/me` | Thông tin user hiện tại |
| POST | `/api/change-password` | Đổi mật khẩu |
| GET | `/api/profile` | Xem profile |
| PUT | `/api/profile` | Cập nhật profile |
| POST | `/api/qr/resolve` | Tra cứu QR |
| GET | `/api/my-assets` | Thiết bị được giao |
| GET | `/api/my-assigned-assets/dropdown` | Dropdown thiết bị (cho Justification) |
| GET | `/api/assets/available-for-loan` | Thiết bị có thể mượn |
| GET | `/api/shifts` | Danh sách ca làm |
| POST | `/api/checkins` | Check-in thiết bị |
| GET | `/api/my-checkins` | Lịch sử check-in của tôi |
| PATCH | `/api/checkins/{id}/checkout` | Check-out thiết bị |
| GET | `/api/my-asset-history` | Lịch sử sử dụng thiết bị |
| GET | `/api/my-asset-history/summary` | Tổng hợp lịch sử |
| GET | `/api/requests` | Danh sách phiếu của tôi |
| POST | `/api/requests` | Tạo phiếu mới |
| GET | `/api/requests/{id}` | Chi tiết phiếu |
| POST | `/api/requests/{id}/cancel` | Hủy phiếu |
| GET | `/api/feedbacks` | Danh sách góp ý |
| POST | `/api/feedbacks` | Tạo góp ý |
| GET | `/api/assets/{id}/lock-status` | Trạng thái khóa thiết bị |

### Admin Only
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/api/users/{id}/role` | Đổi role |
| GET | `/api/roles` | Danh sách roles |
| DELETE | `/api/users/{id}` | Xóa user |

### Admin + HR
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/employees` | Danh sách nhân viên |
| POST | `/api/employees` | Tạo nhân viên |
| GET | `/api/users` | Danh sách tài khoản |
| POST | `/api/users` | Tạo tài khoản từ nhân viên |
| GET | `/api/assets` | Danh sách thiết bị |
| POST | `/api/assets` | Tạo thiết bị |
| POST | `/api/assets/{id}/assign` | Giao thiết bị |
| POST | `/api/assets/{id}/unassign` | Thu hồi thiết bị |
| GET | `/api/review-requests` | Danh sách phiếu chờ duyệt |
| POST | `/api/requests/{id}/review` | Duyệt/từ chối phiếu |
| GET | `/api/inventory/summary` | Tổng hợp kho |
| GET | `/api/inventory/assets` | Danh sách tồn kho |
| GET | `/api/inventory/valuation` | Báo cáo giá trị |
| GET | `/api/inventory/export` | Xuất CSV |
| GET | `/api/locations` | Danh sách vị trí |
| GET | `/api/reports/summary` | Báo cáo tổng hợp |

### Admin + HR + Technician
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/maintenance-events` | Danh sách bảo trì |
| POST | `/api/maintenance-events` | Tạo lịch bảo trì |
| POST | `/api/maintenance-events/{id}/start` | Bắt đầu bảo trì |
| POST | `/api/maintenance-events/{id}/complete` | Hoàn thành bảo trì |
| POST | `/api/maintenance-events/{id}/cancel` | Hủy bảo trì |
| POST | `/api/assets/{id}/lock` | Khóa thiết bị (off-service) |
| POST | `/api/assets/{id}/unlock` | Mở khóa thiết bị |

---

## 3. Manual Test Checklist by Module

### A. Authentication (Login) ✅ SKIP Forgot Password

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| A1 | Mở trang `/login` | Hiển thị form đăng nhập với Employee ID + Password | ⬜ |
| A2 | Nhập đúng `E0003` + `password` (Doctor) | Đăng nhập thành công, redirect `/dashboard` | ⬜ |
| A3 | Nhập sai password | Message lỗi generic, status 401, không lộ user có tồn tại | ⬜ |
| A4 | Bỏ trống fields | Validation client-side + disable button | ⬜ |
| A5 | Nhập có khoảng trắng đầu/cuối | Trim input tự động | ⬜ |
| A6 | Submit → loading state | Button disabled + spinner khi đang xử lý | ⬜ |
| A7 | Logout | Quay về `/login`, token/session invalid | ⬜ |

#### API Verification
| API | Method | Status Expected | Payload Check |
|-----|--------|-----------------|---------------|
| `/login` | POST | 200 (success) / 401 (fail) | `{ employee_code, password }` |
| `/logout` | POST | 200 | Cookie cleared |
| `/api/me` | GET | 200 after login | User object with role |

#### Evidence Cần Thu Thập
- [ ] Screenshot form login
- [ ] Network tab: request/response `/login` thành công
- [ ] Network tab: request/response `/login` thất bại (401)
- [ ] Screenshot sau logout → redirect về login

---

### B. View Profile (My Profile)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| B1 | Mở Profile page | Hiển thị thông tin cá nhân | ⬜ |
| B2 | Verify Employee ID disabled | Không cho edit, có tooltip/visual hint | ⬜ |
| B3 | Verify Email disabled | Không cho edit | ⬜ |
| B4 | Edit Full Name | Cho phép edit, save thành công | ⬜ |
| B5 | Edit Phone sai format | Validation error, highlight field | ⬜ |
| B6 | Save thành công | Toast "Cập nhật thành công" | ⬜ |
| B7 | Save thất bại (validation) | Toast error + không lộ lỗi hệ thống | ⬜ |

#### API Verification
| API | Method | Payload |
|-----|--------|---------|
| `/api/profile` | GET | - |
| `/api/profile` | PUT | `{ name, phone, ... }` |

#### Evidence Cần Thu Thập
- [ ] Screenshot disabled fields (Employee ID, Email)
- [ ] Network tab: PUT `/api/profile` payload + response
- [ ] Screenshot validation error

---

### C. Change Password

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| C1 | Mở Change Password | Form có 3 fields: Current, New, Confirm | ⬜ |
| C2 | Submit trống | Validation all fields required | ⬜ |
| C3 | Current password sai | "Mật khẩu hiện tại không đúng" | ⬜ |
| C4 | New = Current | "Mật khẩu mới phải khác mật khẩu cũ" | ⬜ |
| C5 | Confirm không khớp | "Xác nhận mật khẩu không khớp" | ⬜ |
| C6 | New không đủ policy | Hiển thị yêu cầu: 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt | ⬜ |
| C7 | Submit đúng | "Đổi mật khẩu thành công", redirect hoặc logout | ⬜ |
| C8 | Button loading state | Disabled khi đang submit | ⬜ |

#### API Verification
| API | Method | Status Expected |
|-----|--------|-----------------|
| `/api/change-password` | POST | 200 (success) / 422 (validation) |

#### Evidence Cần Thu Thập
- [ ] Screenshot từng case lỗi (C3-C6)
- [ ] Network tab: response 422 với error messages
- [ ] Screenshot success message

---

### D. Roles & Permissions (Admin/HR Only)

#### UI Actions - Với role **Admin**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| D1 | Mở Admin > Users | Danh sách tài khoản + filter | ⬜ |
| D2 | Filter theo Employee ID/Name/Role | Kết quả chính xác | ⬜ |
| D3 | Click "Tạo tài khoản" | Popup: chọn employee, chọn role, default password | ⬜ |
| D4 | Tạo account cho employee chưa có account | Thành công, employee có thể login | ⬜ |
| D5 | Tạo account cho employee đã có account | Lỗi "Nhân viên đã có tài khoản" | ⬜ |
| D6 | Edit user → chỉ đổi role | Dropdown role, không edit Employee ID/Name | ⬜ |
| D7 | Đổi role → verify menu thay đổi | Login lại với role mới, menu cập nhật | ⬜ |
| D8 | Delete user | Xác nhận → xóa → không thể login | ⬜ |

#### UI Actions - Với role **HR**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| D9 | Truy cập Users page | Được phép xem, tạo | ⬜ |
| D10 | Cố đổi role | Không có button/không được phép | ⬜ |
| D11 | Cố xóa user | Không có button/không được phép | ⬜ |

#### UI Actions - Với role **Doctor/Staff**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| D12 | Cố truy cập `/admin` hoặc `/users` | Redirect hoặc 403 | ⬜ |
| D13 | Cố gọi API `GET /api/users` | 403 Forbidden | ⬜ |

#### API Verification
| API | Role | Expected |
|-----|------|----------|
| `GET /api/users` | admin/hr | 200 |
| `GET /api/users` | doctor | 403 |
| `POST /api/users` | admin/hr | 200 |
| `PATCH /api/users/{id}/role` | admin | 200 |
| `PATCH /api/users/{id}/role` | hr | 403 |
| `DELETE /api/users/{id}` | admin | 200 |
| `DELETE /api/users/{id}` | hr | 403 |

#### Evidence Cần Thu Thập
- [ ] Screenshot create user popup
- [ ] Network tab: POST `/api/users` payload
- [ ] Verify login bằng default password
- [ ] Screenshot role change → menu cập nhật
- [ ] Network tab: 403 khi HR cố đổi role

---

### E. Employee Management (Admin/HR)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| E1 | Xem danh sách nhân viên | List + search + pagination | ⬜ |
| E2 | Search theo tên/mã | Kết quả filter đúng | ⬜ |
| E3 | Tạo nhân viên mới | Form đầy đủ fields, validation | ⬜ |
| E4 | Edit nhân viên | Cập nhật thành công | ⬜ |
| E5 | Delete nhân viên | Xác nhận → xóa (soft delete?) | ⬜ |

#### API Verification
| API | Method | Purpose |
|-----|--------|---------|
| `GET /api/employees` | GET | List with filters |
| `POST /api/employees` | POST | Create |
| `PUT /api/employees/{id}` | PUT | Update |
| `DELETE /api/employees/{id}` | DELETE | Delete |

---

### F. My Equipment (All Roles)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| F1 | Mở "Thiết bị của tôi" | Danh sách equipment được giao | ⬜ |
| F2 | Click item → detail | Modal với status, instructions (nếu có) | ⬜ |
| F3 | Xem QR code | QR hiển thị đúng payload | ⬜ |
| F4 | Quét QR (hoặc nhập payload) | Mở đúng asset detail | ⬜ |
| F5 | Asset off-service | Hiển thị trạng thái khóa, không cho thao tác | ⬜ |

#### RBAC Check
| # | Action | Doctor | Staff | Admin |
|---|--------|--------|-------|-------|
| F6 | Xem equipment của mình | ✅ | ✅ | ✅ |
| F7 | Xem equipment người khác (IDOR) | ❌ | ❌ | ✅ |

#### API Verification
| API | Purpose |
|-----|---------|
| `GET /api/my-assets` | Thiết bị của tôi |
| `POST /api/qr/resolve` | Tra cứu QR |
| `GET /api/assets/{id}/lock-status` | Trạng thái khóa |

#### Evidence Cần Thu Thập
- [ ] Screenshot list equipment
- [ ] Screenshot detail với instructions
- [ ] Screenshot QR code
- [ ] Network tab: IDOR attempt response 403

---

### G. Equipment Justification (Báo sự cố)

#### UI Actions - Role **Doctor**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| G1 | Mở Phiếu yêu cầu > Tạo mới > Tab "Báo sự cố" | Form với: thiết bị, mức độ, nguyên nhân | ⬜ |
| G2 | Chọn thiết bị từ dropdown | Chỉ hiển thị thiết bị được giao | ⬜ |
| G3 | Chọn Severity: Low/Medium/High/Critical | Dropdown hoạt động | ⬜ |
| G4 | Chọn Suspected Cause | Options: Hao mòn / Lỗi vận hành / Chưa rõ | ⬜ |
| G5 | Submit thiếu fields | Validation error | ⬜ |
| G6 | Submit đầy đủ | "Đã gửi phiếu", phiếu trong list với status "Chờ duyệt" | ⬜ |
| G7 | Xem lịch sử phiếu của mình | Danh sách: code, type, status, date | ⬜ |
| G8 | Xem chi tiết phiếu | Modal với đầy đủ thông tin + activity log | ⬜ |

#### UI Actions - Role **Admin/HR** (Reviewer)
| # | Action | Expected | Status |
|---|--------|----------|--------|
| G9 | Mở "Duyệt phiếu" | Danh sách phiếu chờ duyệt | ⬜ |
| G10 | Approve phiếu | Status → "Đã duyệt", Doctor thấy cập nhật | ⬜ |
| G11 | Reject phiếu + ghi chú | Status → "Từ chối", Doctor thấy lý do | ⬜ |

#### API Verification
| API | Purpose | Role |
|-----|---------|------|
| `POST /api/requests` | Tạo phiếu | All |
| `GET /api/requests` | List phiếu của tôi | All |
| `GET /api/review-requests` | List phiếu chờ duyệt | Admin/HR |
| `POST /api/requests/{id}/review` | Duyệt/từ chối | Admin/HR |

#### Evidence Cần Thu Thập
- [ ] Screenshot form tạo Justification
- [ ] Network tab: POST `/api/requests` với type=JUSTIFICATION
- [ ] Screenshot Doctor view history
- [ ] Screenshot Admin approve/reject
- [ ] Network tab: review response

---

### H. Asset Loan Request (Mượn thiết bị)

#### UI Actions - Role **Doctor**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| H1 | Tạo phiếu > Tab "Mượn thiết bị" | Form với: thiết bị, từ ca, đến ca | ⬜ |
| H2 | Dropdown thiết bị | Chỉ hiển thị thiết bị available (chưa giao, không off-service) | ⬜ |
| H3 | Chọn From Shift / To Shift | Dropdown ca làm | ⬜ |
| H4 | Submit | Phiếu tạo thành công, status "Chờ duyệt" | ⬜ |
| H5 | Cố mượn thiết bị off-service | Error "Thiết bị đang tạm ngưng sử dụng" | ⬜ |
| H6 | Cố mượn thiết bị đang được giao | Error "Thiết bị không khả dụng" | ⬜ |

#### UI Actions - Role **Admin/HR**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| H7 | Approve loan request | Status cập nhật, (optional: auto-assign?) | ⬜ |
| H8 | Reject với lý do | Doctor thấy lý do từ chối | ⬜ |

#### Evidence Cần Thu Thập
- [ ] Screenshot form mượn thiết bị
- [ ] Network tab: available-for-loan response
- [ ] Screenshot error khi chọn off-service asset
- [ ] Screenshot request history với status flow

---

### I. Consumable Request (Xin vật tư)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| I1 | Tạo phiếu > Tab "Xin vật tư" | Form với: tên vật tư, số lượng, đơn vị | ⬜ |
| I2 | Thêm nhiều dòng vật tư | Button "+ Thêm dòng" hoạt động | ⬜ |
| I3 | Xóa dòng | Button "✕" hoạt động | ⬜ |
| I4 | Submit | Phiếu tạo thành công | ⬜ |

---

### J. Inventory & Asset Valuation (Admin/HR)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| J1 | Mở "Kho & định giá" | Dashboard summary: tổng thiết bị, giá trị, warranty | ⬜ |
| J2 | Tab Inventory | List thiết bị với filters | ⬜ |
| J3 | Filter by type/status/category | Kết quả chính xác | ⬜ |
| J4 | Filter warranty expiring soon | Chỉ hiện thiết bị sắp hết warranty | ⬜ |
| J5 | Tab Valuation | Báo cáo giá trị + khấu hao | ⬜ |
| J6 | Filter fully depreciated | Thiết bị đã khấu hao hết | ⬜ |
| J7 | Export CSV | Download file CSV đúng format | ⬜ |
| J8 | Print Label | Modal in nhãn thiết bị | ⬜ |

#### RBAC Check
| # | Action | Admin | HR | Doctor |
|---|--------|-------|----|----|
| J9 | Truy cập Inventory | ✅ | ✅ | ❌ |
| J10 | Export CSV | ✅ | ✅ | ❌ |

#### API Verification
| API | Purpose |
|-----|---------|
| `GET /api/inventory/summary` | Dashboard stats |
| `GET /api/inventory/assets` | List with filters |
| `GET /api/inventory/valuation` | Valuation report |
| `GET /api/inventory/export` | CSV export |

---

### K. My Asset History (All Roles)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| K1 | Mở "Lịch sử thiết bị" | Danh sách lịch sử sử dụng | ⬜ |
| K2 | Filter theo thời gian | From date / To date hoạt động | ⬜ |
| K3 | Xem chi tiết | Thông tin: asset, time, source (QR/manual) | ⬜ |

#### RBAC Check
| # | Action | Expected |
|---|--------|----------|
| K4 | Doctor xem history mình | ✅ Allowed |
| K5 | Doctor xem history người khác (IDOR) | ❌ 403 hoặc chỉ thấy của mình |

#### API Verification
| API | Purpose |
|-----|---------|
| `GET /api/my-asset-history` | Lịch sử của tôi |
| `GET /api/my-asset-history/summary` | Tổng hợp |

---

### L. Employee Feedbacks (All Roles)

#### UI Actions - Role **Doctor/Staff**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| L1 | Tạo góp ý | Form: category, title, content | ⬜ |
| L2 | Xem góp ý của mình | List với status | ⬜ |
| L3 | Edit góp ý (nếu chưa processed) | Cho phép sửa | ⬜ |

#### UI Actions - Role **Admin/HR**
| # | Action | Expected | Status |
|---|--------|----------|--------|
| L4 | Xem tất cả góp ý | List đầy đủ | ⬜ |
| L5 | Cập nhật status | Đánh dấu đã xử lý + response | ⬜ |

#### API Verification
| API | Purpose |
|-----|---------|
| `POST /api/feedbacks` | Tạo góp ý |
| `GET /api/feedbacks` | List (scoped by role) |
| `PATCH /api/feedbacks/{id}/status` | Cập nhật status |

---

### M. Maintenance Calendar + Off-Service (Admin/HR/Technician)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| M1 | Mở "Bảo trì" | Dashboard + list lịch bảo trì | ⬜ |
| M2 | Tạo lịch bảo trì | Form: thiết bị, loại, ngày, ưu tiên | ⬜ |
| M3 | Bắt đầu bảo trì | Status: scheduled → in_progress | ⬜ |
| M4 | Hoàn thành bảo trì | Status: in_progress → completed | ⬜ |
| M5 | Hủy bảo trì | Status: → canceled | ⬜ |
| M6 | Khóa thiết bị (Lock/Off-service) | Asset status = off_service | ⬜ |
| M7 | Mở khóa thiết bị (Unlock) | Asset status = active | ⬜ |

#### Off-Service Verification
| # | Check | Expected | Status |
|---|-------|----------|--------|
| M8 | Asset locked hiển thị ở My Equipment | Badge "Đang bảo trì" / "Tạm ngưng" | ⬜ |
| M9 | Asset locked không cho check-in | Error 422 với message | ⬜ |
| M10 | Asset locked không cho mượn | Error 422 với message | ⬜ |
| M11 | Asset locked không cho assign | Error 422 với message | ⬜ |

#### RBAC Check
| # | Action | Admin | HR | Technician | Doctor |
|---|--------|-------|----|----|-----|
| M12 | Truy cập Maintenance | ✅ | ✅ | ✅ | ❌ |
| M13 | Lock/Unlock asset | ✅ | ✅ | ✅ | ❌ |

---

### N. Check-in Thiết Bị Đầu Ca (All Roles)

#### UI Actions
| # | Action | Expected | Status |
|---|--------|----------|--------|
| N1 | Mở chi tiết thiết bị | Nút Check-in hiển thị | ⬜ |
| N2 | Check-in (manual hoặc QR) | Ghi nhận thời gian, tạo log | ⬜ |
| N3 | Check-out cuối ca | Ghi nhận checkout time | ⬜ |
| N4 | Check-in asset off-service | Error "Thiết bị đang tạm ngưng sử dụng" | ⬜ |
| N5 | Xem lịch sử check-in | `GET /api/my-checkins` | ⬜ |

#### API Verification
| API | Purpose |
|-----|---------|
| `POST /api/checkins` | Check-in |
| `PATCH /api/checkins/{id}/checkout` | Check-out |
| `GET /api/my-checkins` | Lịch sử |
| `GET /api/assets/{id}/checkin-status` | Trạng thái check-in asset |

---

## 4. Coverage Matrix

| Module | UI Tested | API Tested | Status | Notes |
|--------|-----------|------------|--------|-------|
| A. Authentication | ⬜ | ⬜ | Not Started | Skip Forgot Password |
| B. Profile | ⬜ | ⬜ | Not Started | |
| C. Change Password | ⬜ | ⬜ | Not Started | |
| D. Roles & Permissions | ⬜ | ⬜ | Not Started | Admin/HR only |
| E. Employee Management | ⬜ | ⬜ | Not Started | Admin/HR only |
| F. My Equipment | ⬜ | ⬜ | Not Started | All roles |
| G. Justification | ⬜ | ⬜ | Not Started | Doctor view history cần check |
| H. Asset Loan | ⬜ | ⬜ | Not Started | |
| I. Consumable Request | ⬜ | ⬜ | Not Started | |
| J. Inventory & Valuation | ⬜ | ⬜ | Not Started | Admin/HR only |
| K. My Asset History | ⬜ | ⬜ | Not Started | All roles |
| L. Feedbacks | ⬜ | ⬜ | Not Started | |
| M. Maintenance + Off-service | ⬜ | ⬜ | Not Started | Admin/HR/Technician |
| N. Check-in | ⬜ | ⬜ | Not Started | All roles |

**Legend:** ⬜ Not Started | 🔄 In Progress | ✅ Pass | ❌ Fail | ⚠️ Blocked

---

## 5. Bug List Template

### BUG-001: [Tên bug ngắn gọn]

| Field | Value |
|-------|-------|
| **Severity** | Critical / High / Medium / Low |
| **Module** | [Module name] |
| **Environment** | Browser, role, data state |
| **Steps to Reproduce** | 1. ... 2. ... 3. ... |
| **Expected Result** | ... |
| **Actual Result** | ... |
| **Screenshot** | [Link/attach] |
| **API Response** | `{ status: xxx, body: ... }` |
| **Suggested Fix** | ... |

---

## 6. Security Sanity Checks

### RBAC Verification

| Check | Method | Expected | Status |
|-------|--------|----------|--------|
| Doctor access `/api/users` | GET | 403 Forbidden | ⬜ |
| Doctor access `/api/inventory/summary` | GET | 403 Forbidden | ⬜ |
| Staff access `/api/maintenance-events` | GET | 403 Forbidden | ⬜ |
| HR access `PATCH /api/users/{id}/role` | PATCH | 403 Forbidden | ⬜ |
| HR access `DELETE /api/users/{id}` | DELETE | 403 Forbidden | ⬜ |

### IDOR (Insecure Direct Object Reference) Tests

| Check | Method | Expected | Status |
|-------|--------|----------|--------|
| Doctor xem asset người khác | `GET /api/assets/{other_id}` | 403 hoặc chỉ thấy của mình | ⬜ |
| Doctor xem request người khác | `GET /api/requests/{other_id}` | 403 | ⬜ |
| Doctor xem checkin người khác | Không có endpoint | N/A | ⬜ |
| Doctor hủy request người khác | `POST /api/requests/{other_id}/cancel` | 403 | ⬜ |

### Validation & Error Leakage

| Check | Expected | Status |
|-------|----------|--------|
| SQL injection trong search | Escaped, no error | ⬜ |
| XSS trong input fields | Sanitized output | ⬜ |
| Error response không lộ stack trace | Generic message only | ⬜ |
| Login fail không lộ user tồn tại | "Thông tin đăng nhập không đúng" | ⬜ |

---

## 📝 Ghi Chú Thêm

### Những điểm cần kiểm tra thêm (theo yêu cầu):

1. **Doctor view request history** - Xác nhận Doctor có thể xem lịch sử phiếu của mình với đầy đủ status flow
2. **Asset locked verification** - Verify rằng off-service block tất cả operations: check-in, request, assign
3. **Role change immediate effect** - Sau khi Admin đổi role, menu và quyền phải cập nhật ngay

### Test Data Preparation

```bash
# Fresh database với seed data
php artisan migrate:fresh --seed

# Tạo test assets với warranty expiring soon
# (đã có trong seeder)
```

---

**Document Version:** 1.0  
**Created:** 2026-01-28  
**Last Updated:** 2026-01-28
