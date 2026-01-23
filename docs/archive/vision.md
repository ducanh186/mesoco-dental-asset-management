# Mesoco Dental Equipment Management — Vision

## 1) Problem statement
Hiện tại việc quản lý thiết bị/vật tư nha khoa dễ bị thất lạc, khó truy vết “ai đang giữ”, và bảo trì bị trễ vì thiếu lịch/nhắc tự động.
Hệ quả: tăng downtime thiết bị, rủi ro dùng nhầm thiết bị đang bảo trì (off-service), và tốn thời gian tìm/đối soát.

## 2) Target users & roles
- Doctor/Nurse: xem “My Equipment”, check-in theo ca (QR), mượn/trả, báo hỏng (justification), gửi feedback.
- Technician/Admin staff: quản lý kho (inventory), nhập/điều chuyển thiết bị, lập lịch bảo trì/kiểm định, set off-service.
- Owner/Admin: quản trị tài khoản + roles, duyệt request/chi phí, xem báo cáo tổng quan (inventory/value, history, maintenance).

## 3) Core value
Hệ thống giúp phòng khám kiểm soát thiết bị theo người giữ/ca trực và vòng đời bảo trì bằng QR + workflow phê duyệt,
đo bằng: giảm thất lạc, giảm downtime, rút ngắn thời gian tìm thiết bị và tăng tỷ lệ bảo trì đúng hạn.

## 4) In-scope
- Auth: Login (employee id), Forgot password (email + verification code), Change password, Logout
- Roles & Permissions: 1 employee = 1 role; admin quản trị
- Employee: hồ sơ nhân viên + giới hạn field edit; Contract tab (admin-only, view PDF)
- Asset Tracking: My Equipment (QR quick view), Equipment Justification (report issue), Asset Request (borrow/return + consumables/new supply)
- Management: Review Requests, Inventory & Asset Value (depreciation), My Asset History
- Feedbacks; Maintenance Calendar; Off-service lock
- QR-based workflow: scan/check-in theo ca, mở nhanh tình trạng + hướng dẫn sử dụng

## 5) Out-of-scope / Non-goals
- Patient/appointment/EMR management; billing/invoice
- Tích hợp kế toán/ERP, mua hàng tự động, e-signature phức tạp
- Mobile native app (iOS/Android) ở giai đoạn đầu (web-first)
- Multi-branch/multi-tenant phức tạp (nếu không có yêu cầu rõ)
- IoT telemetry realtime từ thiết bị y tế (chỉ workflow vận hành)

## 6) Key flows (Start → End)
- Login: employee id + password → vào dashboard theo role
- Forgot password: nhập email → nhận verification code (<=5 min) → set password mới
- Profile edit: mở profile → chỉ edit allowed fields → save → success/fail message
- Change password: nhập current/new/confirm → validate policy → cập nhật → (optional) logout sessions khác
- Admin create account: Employee tab add nhân sự → Roles tab gán role + default password → user login
- Shift start check-in: scan QR thiết bị → ghi nhận usage/assignment event → trạng thái cập nhật
- Borrow/Return request: staff tạo request → manager/admin review → approve/reject → cập nhật custody/history
- Equipment issue: user tạo justification → review → (nếu cần) mở ticket bảo trì → set off-service
- Maintenance: tạo lịch → off-service lock → hoàn tất → mở lại thiết bị + lưu log
- Inventory update: nhập/xuất/điều chuyển → cập nhật tồn + asset value/depreciation

## 7) Data objects (names only)
Employee, UserAccount, Role, Permission
Equipment(Asset), QRTag
AssetAssignment, ShiftCheckInEvent
Request(Borrow/Return/Consumable/Repair/Purchase), RequestApproval, AuditLog
InventoryItem, StockTxn
MaintenancePlan, MaintenanceTicket, OffServiceWindow
Feedback
ContractDocument(PDF)
DepreciationRule, DepreciationEntry

## 8) Success metrics
- Giảm thất lạc thiết bị ≥ 50% trong 3 tháng
- Thời gian tìm thiết bị trung bình < 30 giây (tra cứu bằng QR/search)
- Downtime do “không rõ ai giữ” giảm ≥ 30%
- Tỷ lệ bảo trì đúng hạn ≥ 90%
- Thời gian duyệt request trung bình < 24 giờ

## 9) Assumptions & constraints
- Đăng nhập bằng Employee ID; email đã đăng ký dùng cho forgot password
- Verification code hết hạn <= 5 phút; resend cooldown 1 phút; chống spam (disable Continue khi xử lý)
- Policy mật khẩu: new != current; validate + highlight theo UI spec
- Employee Id & Email không cho sửa; chỉ admin xem Contract tab (PDF)
- QR code đã được dán sẵn cho khay dụng cụ/máy; check-in theo ca là quy trình bắt buộc
- Hệ thống phải có audit log cho các thao tác approve, inventory, off-service
