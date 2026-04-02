# CHECK-LIST tính năng theo ROLE

# Role matrix (ai làm gì ở đâu)

> Mapping theo spec của “Ý tưởng” và thực tế dự án Mesoco thường có các role sau:
> 
- **Admin (Chủ phòng khám):** xem tổng quan, duyệt mua sắm/sửa chữa, xem báo cáo.
- **HR / Admin staff (Hành chính/nhân sự):** quản lý nhân sự, tạo tài khoản/role, quản lý kho (tuỳ phân công).
- **Technician (Kỹ thuật viên):** kho + bảo trì + off-service + xử lý justification.
- **Doctor/Nurse/Staff (Bác sĩ/Y tá/nhân viên):** my equipment, check-in QR, tạo request, tạo justification, feedback.

**Nguyên tắc test:**

1. UI đúng role (menu, button).
2. API chặn đúng (RBAC/IDOR).
3. Data flow đúng (tạo → duyệt → trạng thái đổi → log/history ghi nhận).

## “Critical path” cần test trước (để ra MVP demo nhanh)

1. **Login** bằng Employee ID → vào đúng dashboard theo role
2. **My Equipment** (Doctor/Staff) → **Scan QR** → xem status + instruction → **Check-in** ca làm
3. **Asset Request** (mượn thiết bị di động / xin vật tư tiêu hao) → Admin/Manager **Review** → trạng thái cập nhật
4. **Equipment Justification** (báo hỏng) → Technician/Manager **Review** → tạo maintenance + set **Off-service**
5. **Maintenance Calendar** → asset bị off-service thì **không cho mượn/assign/use**

## MODULE 2.1 — Authentication

### 3.1 Login (Employee ID)

**Roles:** tất cả role

**Precondition**

- Có user account đã được tạo từ “Roles & Permissions” (gắn với employee).
- User active (không bị disable).

**Steps**

1. Mở trang **Login**
2. Nhập **Employee ID**
3. Nhập **Password**
4. Click **"Login"**

**Expected**

- Đăng nhập thành công → redirect về **Dashboard**
- Menu hiển thị theo role (RBAC)
- Header có avatar/name + menu **"View Profile"**, **"Change Password"**, **"Logout"**

**Negative/Edge**

- Sai password → show error chung (không leak “ID tồn tại hay không”)
- Employee ID trống → highlight + focus field đầu tiên lỗi
- Trim spaces đầu/cuối input
- Rate limit login (ít nhất: lock 30–60s sau N lần sai)

**UI polish**

- Button **"Login"** có loading + disabled khi submit
- Error message rõ ràng nhưng không lộ thông tin nhạy cảm

### 3.2 Forgot Password — Screen 1 (Email)

**Roles:** tất cả role (chưa login)

**Precondition**

- Email đã đăng ký trong hệ thống (nhưng UI không được tiết lộ có/không)

**Steps**

1. Từ Login click **"Forgot Password"**
2. Click **"Back"** để kiểm tra quay lại Login
3. Nhập **Email** (*)
4. Click **"Continue"**

**Expected**

- Show message đúng spec:
    
    “If the email is registered, we’ve sent a verification code to your inbox. Please check your email.”
    
- Button **"Continue"** chuyển loading → disabled tới khi sang màn 2 (chặn spam)

**Negative/Edge**

- Email trống → highlight + focus + warning “Email is required.”
- Email format sai → warning “Invalid email format.” (nếu có)

**UI polish**

- Thêm hint text dưới Email: “Use your work email”
- Thêm countdown nhỏ “You can request again in …”

### 3.3 Forgot Password — Screen 2 (New password + code)

**Roles:** tất cả role

**Precondition**

- Verification code đã được gửi (TTL ≤ 5 phút)
- Code dùng 1 lần; resend thì invalidate code cũ

**Steps**

1. Nhập **"New password"**
2. Nhập **"Confirm password"**
3. Toggle icon **eye** để show/hide
4. Nhập **"Verification code"**
5. Click **"Continue"**
6. Click link **"Resend verification code"** (test disable 1 phút)

**Expected**

- Nếu code đúng & còn hạn → đổi mật khẩu thành công → (tuỳ thiết kế) redirect Login + toast success
- Nếu click **Resend verification code** → message “A new verification code has been sent.” và link disabled 1 phút

**Negative/Edge**

- Code sai → highlight **Verification code**, focus vào field, warning: “The verification code is incorrect!”
- Code hết hạn → warning “The verification code has expired.”
- Password mismatch → highlight cả 2, focus confirm, warning “Passwords do not match.”
- Missing field → focus field thiếu đầu tiên, warning theo spec
- New password policy fail → warning mô tả rule
- Resend nhiều lần → chỉ cho sau 1 phút; code cũ invalid ngay khi resend

**UI polish**

- OTP input dạng 6 ô (nếu code 6 số), auto-advance, paste hỗ trợ
- Hiển thị “Code expires in: mm:ss”
- Nút **"Continue"** disabled đến khi đủ input hợp lệ (optional)

### 3.4 View Profile

**Roles:** tất cả role (đã login)

**Precondition**

- User có liên kết employee record

**Steps**

1. Từ header click **"View Profile"**
2. Kiểm tra field disable: **Employee Id**, **Email**
3. Edit allowed fields: **Employee Full Name**, **Position**, **Date of Birth**, **Gender**, **Phone number**, **Address**
4. Click **"Save"**

**Expected**

- Save success → toast “Saved successfully.”
- Save fail (validation/server) → field lỗi highlight + message
- Disabled fields không sửa được (UI + API)

**Negative/Edge**

- Phone invalid → warning
- Date of birth invalid → warning
- IDOR: thử gọi API update profile người khác (đổi employee_id) → bị chặn

**UI polish**

- “Unsaved changes” guard khi rời trang
- Skeleton loading khi fetch profile
- Inline validation (hiện lỗi ngay khi blur)

## MODULE 2.2 — Header / Profile / Change Password / Logout

### 3.4 View Profile

**Roles:** tất cả role (đã login)

**Precondition**

- User có liên kết employee record

**Steps**

1. Từ header click **"View Profile"**
2. Kiểm tra field disable: **Employee Id**, **Email**
3. Edit allowed fields: **Employee Full Name**, **Position**, **Date of Birth**, **Gender**, **Phone number**, **Address**
4. Click **"Save"**

**Expected**

- Save success → toast “Saved successfully.”
- Save fail (validation/server) → field lỗi highlight + message
- Disabled fields không sửa được (UI + API)

**Negative/Edge**

- Phone invalid → warning
- Date of birth invalid → warning
- IDOR: thử gọi API update profile người khác (đổi employee_id) → bị chặn

**UI polish**

- “Unsaved changes” guard khi rời trang
- Skeleton loading khi fetch profile
- Inline validation (hiện lỗi ngay khi blur)

### 3.5 Change Password

## 

**Roles:** tất cả

**Steps**

1. Click **"Change Password"**
2. Click **"Back"** kiểm tra quay lại trang trước
3. Nhập **"Current password"**, **"New password"**, **"Confirm new password"**
4. Click **"Continue"**

**Expected**

- Success → “Your password has been changed successfully.” (+ optional logout sessions khác)
- Loading + disabled button trong lúc xử lý

**Negative/Edge**

- Missing field → highlight/focus/warning theo spec
- Current password sai → warning “Current password is incorrect.”
- New=Current → warning phù hợp
- Confirm mismatch → warning “Passwords do not match.”
- Policy fail → warning rule

**UI polish**

- Password strength meter (nhẹ)
- Toggle eye icon cho 3 field

### 3.6 Logout

**Roles:** tất cả

**Steps:** header click **"Logout"**

**Expected:** redirect Login, session cookie cleared

**Edge:** back browser không vào được trang protected

## MODULE 2.3 — Roles & Permissions (tạo account + role)

### 3.7 List + Filter accounts

## 

**Roles:** Admin/HR

**Precondition**

- Có employees đã được tạo ở module Employee

**Steps**

1. Vào tab **"Roles & Permissions"**
2. Filter theo **Employee ID / name / role**
3. Verify table columns: id, name, role, actions (**edit**, **delete**)

**Expected**

- Filter chạy đúng, pagination (nếu có)
- Không lộ employees chưa được phép (nếu HR scope theo manager)

**Negative/Edge**

- IDOR: HR xem user của clinic khác (nếu multi-tenant) → chặn
- Delete account đang login → policy rõ (block hoặc cho)

**UI polish**

- Empty state: “No accounts found”
- Confirm modal khi delete

### 3.8 Add Employee account (popup)

**Roles:** Admin/HR

**Steps**

1. Click **"Add Employee"**
2. Dropdown **Employee ID** (type-to-search)
3. Dropdown **Role**
4. Nhập **"Default password"**
5. Click **"Add"**

**Expected**

- Tạo user account thành công → login được bằng Employee ID + default password
- Mỗi employee chỉ có 1 role duy nhất (unique constraint)
- Toast success/fail

**Negative/Edge**

- Employee đã có account → error “Account already exists”
- Default password trống / policy fail → warning
- Employee dropdown search hoạt động tốt với danh sách lớn

**UI polish**

- Gợi ý “Force change password at first login” (optional)
- Hiển thị password dạng masked + copy icon (optional)

### 3.9 Edit role

**Roles:** Admin/HR

**Steps:** click **edit** → chỉ sửa role → **"Save"**

**Expected:** employee id/name locked; role updated; permissions reflect ngay

**Edge:** đổi role khi user đang online → refresh permissions sau reload

## MODULE 2.4 — Employee (HR record)

### 3.10 General Information (CRUD)

**Roles:** Admin full; HR/Manager scope theo “PM only see their managed staff” (spec có nhắc)

**Steps (Create)**

1. Vào tab **"Employee" → "General Information"**
2. Click **"Add"**
3. Nhập fields (Full Name, Employee Id, Position, DOB, Gender, Phone, Email, Address)
4. Click **"Save"**

**Expected**

- Employee Id unique
- Success toast
- Record xuất hiện trong list và dùng được ở Roles & Permissions dropdown

**Negative/Edge**

- Missing/invalid fields highlight + focus
- Email duplicate (nếu policy) → error
- Employee Id format rule (nếu có) → enforced

**Edit/Delete**

- Edit cập nhật đúng
- Delete: nếu employee đã có asset assignment / user account → policy (soft delete hoặc block)

**UI polish**

- Drawer/modal form + auto-focus
- Search debounce
- Column density toggle (compact/comfortable)

### 3.11 Contract tab (Admin only)

**Roles:** Admin

**Precondition**

- Employee tồn tại

**Steps**

1. Tab **"Contract"**
2. Click **"Add"**
3. Chọn employee
4. Upload/generate PDF contract
5. Save
6. Click **"View detail"** để mở PDF

**Expected**

- Only Admin thấy tab
- PDF render đúng, download (optional)

**Negative/Edge**

- Upload file type sai → reject
- File lớn → progress bar
- Permission: non-admin gọi API PDF → 403

**UI polish**

- PDF preview embedded
- Versioning (optional

## MODULE 2.5 — Asset Tracking (“Timesheet”): My Equipment + QR + Check-in

### 3.12 My Equipment (list)

**Roles:** Doctor/Staff/Technician (tuỳ ai được giao giữ thiết bị)

**Precondition**

- Có asset đã assign cho employee

**Steps**

1. Vào tab **"My Equipment"**
2. Verify list: asset name, code, status, last check-in, off-service badge

**Expected**

- Chỉ thấy asset của mình (ownership)
- Asset off-service hiển thị badge + disabled actions

**Negative/Edge**

- IDOR: đổi employee_id trên API list → chặn
- Empty state: user chưa có asset

**UI polish**

- Quick filter: Active / Off-service / Needs maintenance
- “Scan QR” CTA nổi bật

---

### 3.13 Scan QR → Asset quick view

**Roles:** Doctor/Staff/Technician

**Precondition**

- Asset có QR identity payload dạng `MESOCO|ASSET|v1|<uuid>` (ví dụ)

**Steps**

1. Click **"Scan QR"**
2. Cho camera quyền (web)
3. Scan QR
4. Màn detail hiển thị: status, instruction, last maintenance, assigned to

**Expected**

- QR parse ok; nếu sai format → message “Invalid QR code.”
- Nếu asset off-service → warning “This asset is off-service. Do not use.”
- Instruction hiển thị rõ (y khoa/khuyến cáo)

**Negative/Edge**

- QR hợp lệ nhưng asset không tồn tại → “Asset not found.”
- QR version v0/v2 → “Unsupported QR version.”

**UI polish**

- Flashlight toggle (mobile)
- Manual input fallback (paste code)
- Haptic/beep (nếu mobile wrapper)

---

### 3.14 Check-in khi bắt đầu ca (Timesheet behavior)

**Roles:** Doctor/Staff

**Precondition**

- User có shift/ca hiện tại (hoặc system cho “start shift”)
- Asset đang Active (không off-service)

**Steps**

1. Từ QR view click **"Check-in"** (hoặc **"Start shift check-in"**)
2. Confirm modal (asset list nếu check-in nhiều)
3. Submit

**Expected**

- Tạo record check-in: employee_id, asset_id, timestamp, shift_id
- Cập nhật usage count (nếu depreciation theo usage)
- UI hiển thị “Checked-in at …”

**Negative/Edge**

- Check-in trùng trong 5 phút → block hoặc coalesce
- Asset off-service → không cho check-in
- User không được assigned asset nhưng scan QR → policy: cho xem instruction nhưng không cho check-in

**UI polish**

- “Today’s check-ins” mini list
- Undo trong 10s (optional)

## MODULE 2.6— Equipment Justification (báo hỏng/sự cố)

### 3.15 Create justification

**Roles:** Doctor/Staff

**Precondition**

- Có asset liên quan (từ My Equipment hoặc scan QR)

**Steps**

1. Vào **"Equipment Justification"**
2. Select **Asset** (dropdown hoặc auto from QR)
3. Nhập **Issue type** (error/physical damage/abnormal noise…)
4. Nhập **Description**
5. Chọn **Cause**: normal wear vs operational mistake (spec yêu cầu lý do)
6. Upload ảnh/video (optional)
7. Click **"Submit"**

**Expected**

- Tạo record justification với status **Pending**
- Notify Technician/Admin
- Asset có thể chuyển trạng thái “Needs review” (tuỳ rule)

**Negative/Edge**

- Không chọn asset → highlight
- User báo hỏng asset không thuộc mình → policy (allow nếu scan QR tại phòng? nhưng phải log actor)
- Spam submit → rate limit

**UI polish**

- Template text theo loại thiết bị
- Auto-fill asset fields từ QR

### 3.16 Review justification

**Roles:** Technician + Admin/Manager (tuỳ phân công)

**Steps**

1. Vào **"Review Requests"** (hoặc screen riêng)
2. Lọc type = Justification
3. Open detail
4. Choose action:
    - **"Approve repair"** / **"Reject"** / **"Need more info"**
5. Nếu approve → tạo maintenance event + set asset **Off-service**
6. Add comment → **"Save"**

**Expected**

- Status change + audit log (who/when/action/comment)
- If Off-service: asset bị khóa khỏi borrow/assign/check-in

**Negative/Edge**

- Approve nhưng thiếu required info (cost estimate?) → block nếu policy
- IDOR: non-tech gọi API approve → 403

**UI polish**

- Side-by-side: request info + asset history + last maintenance
- Quick actions buttons

## MODULE 2.7— Asset Request (mượn thiết bị di động / xin vật tư tiêu hao)

### 3.17 Create request (Loan / Transfer asset)

**Roles:** Doctor/Staff

**Precondition**

- Có catalog assets “loanable”
- Asset không off-service, không đang loan conflict

**Steps**

1. Vào **"Asset Request"**
2. Chọn tab **"Loan"** (nếu UI chia tab)
3. Select **Asset** (đúng loại di động)
4. Chọn **From room/To room** hoặc **Pickup time**
5. Nhập reason
6. Click **"Submit"**

**Expected**

- Request status Pending
- Reviewer sees in Review Requests

**Negative/Edge**

- Asset unavailable → show availability info
- Missing asset selection → highlight (đây là bug bạn từng gặp: dropdown không có lựa chọn)
- Request trùng asset/time → block

**UI polish**

- Availability badge “Available / In use / Off-service”
- Default suggested time slot

### 3.18 Create request (Consumables

**Roles:** Doctor/Staff

**Steps**

1. Tab **"Consumables"**
2. Select item + quantity
3. Click **"Submit"**

**Expected**

- Inventory reservation (optional) hoặc request pending
- Sau approve: trừ kho, tạo issue log

**Negative/Edge**

- Quantity > stock → warning
- Item không tồn tại → block

**UI polish**

- Quick-add +/-
- Show current stock inline

### 3.19 Review requests (approve/deny)

**Roles:** Admin/Manager, HR (tuỳ)

**Steps**

1. Vào **"Review Requests"**
2. Filter status Pending
3. Open request detail
4. Click **"Approve"** hoặc **"Reject"**
5. (Nếu approve loan) hệ thống tạo assignment/transfer record
6. Add comment → Save

**Expected**

- Status transitions rõ: Pending → Approved/Rejected
- Noti về requester
- Audit log

**Negative/Edge**

- Approve request khi asset off-service → block
- Double approve do concurrent clicks → idempotency

**UI polish**

- Bulk approve (optional)
- SLA timer: “pending for X hours”

## MODULE 2.8— Inventory & Asset Value + Depreciation + My Asset History

### 3.20 Inventory dashboard

**Roles:** Technician + Admin/HR (tuỳ)

**Steps**

1. Vào **"Inventory & Asset Value"**
2. Verify tổng kho: total items, low stock, total asset value
3. Search/filter theo category

**Expected**

- Data đúng theo DB
- Low stock rule hiển thị

**Negative/Edge**

- Permission: Doctor không thấy inventory tổng (chỉ xem request/consumables)

**UI polish**

- KPI cards + sparklines (optional)
- Export CSV (optional)

### 3.21 Asset value & depreciation (time vs usage)

**Roles:** Admin/Technician

**Precondition**

- Asset có purchase_cost, purchase_date
- Depreciation rule configured: theo **time** hoặc **usage** (spec có nhắc trade-off)

**Steps**

1. Open asset detail trong Inventory
2. Chọn depreciation method: **"Time-based"** / **"Usage-based"**
3. Set params (months / number of cases)
4. Save
5. Simulate: tạo check-in usage → value giảm theo rule

**Expected**

- Value calculation đúng
- History log ghi thay đổi rule và value snapshots (nếu có)

**Negative/Edge**

- Rule invalid (negative months) → block
- Switching method mid-way → policy rõ (reset? keep?)

**UI polish**

- Show “Current value” + “Projected value”
- Explain method bằng tooltip

### 3.22 My Asset History

**Roles:** Doctor/Staff

**Precondition**

- Có usage logs (check-in) hoặc assignment history

**Steps**

1. Vào **"My Asset History"**
2. Filter by date range
3. Open asset timeline

**Expected**

- Liệt kê assets đã dùng + mức hao mòn (nếu usage-based)
- Không thấy lịch sử người khác

**Negative/Edge**

- Nếu chưa có logs → empty state hướng dẫn “Scan QR to check-in”

**UI polish**

- Timeline UI (assignment → check-ins → maintenance)
- Quick “Report issue” từ history item

## MODULE 2.9— Maintenance Calendar + Off-service lock

### 3.23 Maintenance calendar view

**Roles:** Technician/Admin

**Precondition**

- Có maintenance events (scheduled hoặc từ justification)

**Steps**

1. Vào **"Maintenance Calendar"**
2. Switch view: Month/Week/List
3. Click event detail
4. Update status: Scheduled → In progress → Done
5. Set **"Off-service"** toggle khi In progress
6. Mark Done → auto return to Active (tuỳ policy)

**Expected**

- Off-service locks asset: không assign/loan/check-in
- Khi Done: unlock + log

**Negative/Edge**

- Overlap events → warning
- Non-tech tries toggle Off-service → 403

**UI polish**

- Color badges theo status
- Drag-drop reschedule (optional)
- Conflict detection popover

### 3.24 Off-service enforcement (cross-module test)

**Roles:** Doctor/Staff + Technician

**Precondition**

- Asset A set Off-service

**Steps**

1. Doctor vào **"Asset Request"** chọn asset A → submit
2. Doctor scan QR asset A → attempt **"Check-in"**
3. Technician/admin attempt assign asset A to someone

**Expected**

- Tất cả thao tác dùng/mượn/assign đều bị chặn
- UI message nhất quán: “Asset is off-service.”

**UI polish**

- Disable button + tooltip lý do
- Link tới maintenance event detail

## MODULE 2.10— Employee Feedbacks

### 3.23 Maintenance calendar view

**Roles:** Technician/Admin

**Precondition**

- Có maintenance events (scheduled hoặc từ justification)

**Steps**

1. Vào **"Maintenance Calendar"**
2. Switch view: Month/Week/List
3. Click event detail
4. Update status: Scheduled → In progress → Done
5. Set **"Off-service"** toggle khi In progress
6. Mark Done → auto return to Active (tuỳ policy)

**Expected**

- Off-service locks asset: không assign/loan/check-in
- Khi Done: unlock + log

**Negative/Edge**

- Overlap events → warning
- Non-tech tries toggle Off-service → 403

**UI polish**

- Color badges theo status
- Drag-drop reschedule (optional)
- Conflict detection popover

### 3.24 Off-service enforcement (cross-module test)

**Roles:** Doctor/Staff + Technician

**Precondition**

- Asset A set Off-service

**Steps**

1. Doctor vào **"Asset Request"** chọn asset A → submit
2. Doctor scan QR asset A → attempt **"Check-in"**
3. Technician/admin attempt assign asset A to someone

**Expected**

- Tất cả thao tác dùng/mượn/assign đều bị chặn
- UI message nhất quán: “Asset is off-service.”

**UI polish**

- Disable button + tooltip lý do
- Link tới maintenance event detail

## MODULE 2.11— Employee Feedbacks

### 3.25 Submit feedback

**Roles:** Doctor/Staff

**Steps**

1. Vào **"Employee Feedbacks"**
2. Chọn type: material quality / new tech suggestion
3. Nhập nội dung + priority
4. Upload reference (optional)
5. Click **"Submit"**

**Expected**

- Record created pending review
- Admin sees in reporting/review

**Negative/Edge**

- Empty content → highlight
- Spam rate limit

**UI polish**

- Anonymous toggle? (thường không nên anonymous trong nội bộ, nhưng có thể “private to Admin”)

### 3.26 Review feedback

**Roles:**Admin

**Steps:** open feedback → mark status (Open/Planned/Done) → comment

**Expected:** audit log + notify author

## MODULE 2.12— Reporting (Admin)

### 3.27 Admin reports

**Roles:** Admin

**Report test cases**

- Assets by status (Active/Off-service/Needs maintenance)
- Requests SLA (avg approval time)
- Top frequently used assets (from check-in)
- Depreciation summary (value drop)
- Consumables usage (issue logs)
- Justification count by cause (wear vs operation)

**Expected**

- Filters đúng; export; role restriction

**UI polish**

- Date range presets (Last 7/30/90 days)
- KPI cards + drill-down tables