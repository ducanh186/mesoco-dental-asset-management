# Phân Quyền và Tính Năng Theo Vai Trò

Hệ thống quản lý tài sản nha khoa Mesoco sử dụng mô hình phân quyền theo vai trò (RBAC). Mỗi người dùng được gán **một vai trò duy nhất**, quyết định những tính năng và dữ liệu họ có thể truy cập.

---

## 📊 Bảng Tổng Quan Quyền Hạn

| Tính năng | Admin | HR | Bác sĩ | Kỹ thuật viên | Nhân viên |
|-----------|:-----:|:--:|:------:|:-------------:|:---------:|
| **Quản lý Tài sản** |
| Xem danh sách tài sản | ✅ | ✅ | ❌ | ❌ | ❌ |
| Thêm/Sửa/Xóa tài sản | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gán/Thu hồi tài sản | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tạo lại mã QR | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Quản lý Nhân viên** |
| Xem/Thêm/Sửa nhân viên | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xóa nhân viên | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Quản lý Tài khoản** |
| Xem danh sách tài khoản | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tạo tài khoản mới | ✅ | ✅ | ❌ | ❌ | ❌ |
| Thay đổi vai trò | ✅ | ❌ | ❌ | ❌ | ❌ |
| Xóa tài khoản | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Xử lý Yêu cầu** |
| Duyệt/Từ chối yêu cầu | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Tính năng Chung** |
| Xem tài sản được giao | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check-in/Check-out | ✅ | ✅ | ✅ | ✅ | ✅ |
| Báo cáo sự cố (Justification) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mượn thiết bị (Asset Loan) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Yêu cầu vật tư (Consumable) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Quét mã QR | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cập nhật hồ sơ cá nhân | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 👤 Chi Tiết Từng Vai Trò

<a id="admin-features"></a>
### 1. Admin (Quản trị viên)

**Mô tả:** Quyền cao nhất trong hệ thống, có toàn quyền truy cập và quản lý.

**Quyền hạn đặc biệt:**
- ✅ **Thay đổi vai trò người dùng** - Chỉ Admin mới có thể nâng/hạ quyền
- ✅ **Xóa tài khoản** - Chỉ Admin mới có quyền xóa người dùng
- ✅ Toàn bộ quyền của HR

**Trường hợp sử dụng:**
- Thiết lập hệ thống ban đầu
- Quản lý phân quyền người dùng
- Xử lý các tác vụ nhạy cảm (xóa dữ liệu, thay đổi cấu hình)

---

<a id="hr-features"></a>
### 2. HR (Nhân sự)

**Mô tả:** Quản lý tài sản, nhân viên và xử lý các yêu cầu từ nhân viên.

**Quyền hạn chính:**
- ✅ **Quản lý Tài sản** - Thêm, sửa, xóa, gán, thu hồi thiết bị
- ✅ **Quản lý Nhân viên** - CRUD đầy đủ hồ sơ nhân viên
- ✅ **Tạo Tài khoản** - Tạo tài khoản mới cho nhân viên (không đổi role)
- ✅ **Duyệt Yêu cầu** - Phê duyệt/từ chối báo cáo sự cố, mượn thiết bị

**Không có quyền:**
- ❌ Thay đổi vai trò người dùng
- ❌ Xóa tài khoản người dùng

**Trường hợp sử dụng:**
- Nhập liệu tài sản mới vào hệ thống
- Gán thiết bị cho nhân viên khi onboarding
- Thu hồi thiết bị khi nhân viên nghỉ việc
- Duyệt các yêu cầu mượn thiết bị

---

<a id="doctor-features"></a>
### 3. Doctor (Bác sĩ)

**Mô tả:** Sử dụng thiết bị y tế, có nhu cầu mượn thêm thiết bị và báo cáo sự cố.

**Quyền hạn chính:**
- ✅ **Xem tài sản được giao** - Xem danh sách thiết bị đang sử dụng
- ✅ **Check-in/Check-out** - Ghi nhận sử dụng thiết bị theo ca
- ✅ **Báo cáo sự cố** - Gửi yêu cầu Justification khi thiết bị hỏng
- ✅ **Mượn thiết bị** - Tạo yêu cầu Asset Loan khi cần thêm
- ✅ **Yêu cầu vật tư** - Xin cấp vật tư tiêu hao

**Workflow điển hình:**
1. Đầu ca: Check-in các thiết bị được giao
2. Trong ca: Phát hiện máy hỏng → Báo cáo sự cố
3. Cần thêm dụng cụ → Tạo yêu cầu mượn
4. Cuối ca: Check-out thiết bị

---

<a id="technician-features"></a>
### 4. Technician (Kỹ thuật viên)

**Mô tả:** Hỗ trợ kỹ thuật, sử dụng và bảo trì thiết bị.

**Quyền hạn chính:**
- ✅ **Xem tài sản được giao** - Quản lý thiết bị kỹ thuật được giao
- ✅ **Check-in/Check-out** - Theo dõi sử dụng thiết bị
- ✅ **Báo cáo sự cố** - Gửi báo cáo kỹ thuật chi tiết
- ✅ **Mượn thiết bị** - Mượn công cụ phục vụ bảo trì
- ✅ **Yêu cầu vật tư** - Xin linh kiện thay thế

**Lưu ý:** Tính năng **Quản lý Bảo trì** (Maintenance Module) đang được phát triển và sẽ mở rộng quyền cho Technician trong tương lai.

---

<a id="staff-features"></a>
### 5. Employee/Staff (Nhân viên)

**Mô tả:** Vai trò cơ bản, có quyền sử dụng và báo cáo về thiết bị được giao.

**Quyền hạn chính:**
- ✅ **Xem tài sản được giao** - Xem thiết bị mình đang sử dụng
- ✅ **Check-in/Check-out** - Ghi nhận sử dụng hàng ngày
- ✅ **Tạo yêu cầu** - Gửi các loại yêu cầu (sự cố, mượn, vật tư)
- ✅ **Quét QR** - Xem thông tin thiết bị qua QR code

---

## 📝 Các Loại Yêu Cầu (Request Types)

Tất cả các vai trò đều có thể tạo các loại yêu cầu sau:

### 1. Báo Cáo Sự Cố (Justification)
- **Mục đích:** Báo cáo thiết bị hỏng, mất, hoặc cần sửa chữa
- **Yêu cầu:** Chọn tài sản **đang được giao cho mình**
- **Trường bắt buộc:** Mức độ nghiêm trọng (severity)

### 2. Mượn Thiết Bị (Asset Loan)
- **Mục đích:** Mượn tạm thiết bị chưa được gán cho ai
- **Yêu cầu:** Chọn tài sản **đang sẵn có** (chưa gán, status=active)
- **Trường bắt buộc:** Khoảng thời gian mượn (ca hoặc ngày)

### 3. Yêu Cầu Vật Tư (Consumable Request)
- **Mục đích:** Xin cấp vật tư tiêu hao (bông, gạc, dung dịch...)
- **Yêu cầu:** Nhập tên/mã SKU và số lượng
- **Trường bắt buộc:** Tên vật tư, số lượng

---

## 🔒 Bảo Mật và Xác Thực

### Luồng Đăng Nhập
1. Người dùng đăng nhập với email/password
2. Nếu `must_change_password = true`: Bắt buộc đổi mật khẩu
3. Sau khi đổi password: Truy cập đầy đủ theo vai trò

### API Token
- Sử dụng **Laravel Sanctum** cho SPA authentication
- Session-based cho web, Token-based cho mobile/API

### Middleware Bảo Vệ
```
auth:sanctum          → Yêu cầu đăng nhập
must_change_password  → Kiểm tra đổi mật khẩu lần đầu
role:admin            → Chỉ Admin
role:admin,hr         → Admin hoặc HR
```

---

## 📖 Ví Dụ Thực Tế

### Kịch bản 1: Bác sĩ báo máy hỏng
```
1. Bác sĩ Nguyễn Văn A đăng nhập
2. Vào "Tài sản của tôi" → Thấy máy X-Ray đang được giao
3. Tạo yêu cầu "Báo cáo sự cố" → Chọn máy X-Ray
4. Nhập mức độ: "Cao", mô tả: "Màn hình không hiển thị"
5. HR nhận được thông báo → Duyệt → Chuyển kỹ thuật
```

### Kịch bản 2: HR gán thiết bị cho nhân viên mới
```
1. HR đăng nhập
2. Vào "Quản lý Nhân viên" → Tạo hồ sơ mới
3. Vào "Quản lý Tài sản" → Chọn thiết bị chưa gán
4. Nhấn "Gán tài sản" → Chọn nhân viên mới
5. Nhân viên đăng nhập → Thấy thiết bị trong "Tài sản của tôi"
```

### Kịch bản 3: Admin nâng quyền nhân viên lên HR
```
1. Admin đăng nhập
2. Vào "Quản lý Tài khoản" → Tìm nhân viên
3. Nhấn "Thay đổi vai trò" → Chọn "HR"
4. Nhân viên refresh → Có thêm menu quản lý
```

---

## 🔗 Tài Liệu Liên Quan

- [Checklist tính năng theo role](feat_role.md)
- [Hướng dẫn API](postman/) - Postman Collection
- [Stack công nghệ](STACK.md)
- [Quy ước database](DB_CONVENTIONS.md)
