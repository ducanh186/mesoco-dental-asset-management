# Ma trận phân quyền API

Tài liệu này mô tả quyền truy cập API theo trạng thái code hiện tại. Trọng tâm là các route trong `routes/api.php` sau khi chuẩn hóa role về `manager`, `technician`, `doctor`, `employee`.

## 1. Các tầng kiểm soát quyền

Backend đang chặn quyền ở 3 lớp:

1. Route middleware
2. `FormRequest::authorize()`
3. Policy theo resource

Nguyên tắc:

- Không tin vào việc frontend ẩn nút.
- Request theo ID luôn cần policy hoặc kiểm tra ownership.
- `manager` là vai trò duyệt và báo cáo.
- `technician` là vai trò vận hành.

## 2. Nhóm route chung cho mọi người dùng đã đăng nhập

| Nhóm API | Endpoint tiêu biểu | Vai trò |
| --- | --- | --- |
| Hồ sơ và bảo mật | `GET /api/me`, `GET/PUT /api/profile`, `POST /api/change-password` | Tất cả |
| QR và tài sản cá nhân | `POST /api/qr/resolve`, `GET /api/my-assets`, `GET /api/my-asset-history*` | Tất cả |
| Check-in | `POST /api/checkins`, `PATCH /api/checkins/{id}/checkout`, `GET /api/my-checkins` | Tất cả |
| Shift | `GET /api/shifts`, `GET /api/shifts/{shift}` | Tất cả |
| Request của người dùng | `GET /api/requests`, `POST /api/requests`, `GET /api/requests/{id}`, `POST /api/requests/{id}/cancel` | Tất cả |
| Khóa trạng thái tài sản | `GET /api/assets/{asset}/lock-status` | Tất cả |

Ghi chú:

- Người dùng cuối chỉ xem request của chính họ, trừ khi thuộc nhóm vận hành.
- Check-in chỉ hợp lệ với tài sản được giao cho người dùng hoặc được policy cho phép.

## 3. Nhóm route chỉ dành cho manager

| Nhóm API | Endpoint tiêu biểu | Vai trò |
| --- | --- | --- |
| Duyệt request | `GET /api/review-requests`, `POST /api/requests/{id}/review` | Manager |
| Báo cáo | `GET /api/reports/summary`, `GET /api/reports/export` | Manager |
| Quản lý role user | `PATCH /api/users/{user}/role`, `DELETE /api/users/{user}`, `GET /api/roles` | Manager |
| Hợp đồng | `GET/POST /api/employees/{employee}/contracts`, `GET/PUT/DELETE /api/contracts/{contract}` | Manager |

Luồng đặc biệt:

- `POST /api/requests/{id}/review` với phiếu `JUSTIFICATION` sẽ:
  - yêu cầu `assigned_to_user_id`
  - kiểm tra user được gán có role `technician`
  - duyệt request
  - sinh `maintenance_events`
  - log thêm `DISPATCHED`

## 4. Nhóm route cho manager và technician

| Nhóm API | Endpoint tiêu biểu | Vai trò |
| --- | --- | --- |
| Nhân viên | `GET/POST /api/users`, `GET /api/users/{user}`, `GET /api/employees/available`, `apiResource employees` | Manager, Technician |
| Tài sản | `GET /api/assets`, `POST /api/assets`, `PUT /api/assets/{asset}`, `POST /api/assets/{asset}/assign` | Manager, Technician |
| QR quản trị | `POST /api/assets/{asset}/regenerate-qr` | Manager, Technician |
| Tồn kho | `GET /api/inventory/*` | Manager, Technician |
| Vị trí | `GET /api/locations/dropdown`, `apiResource locations` | Manager, Technician |
| Thu hủy | `GET /api/disposal/*`, `POST /api/disposal/assets/{asset}/retire` | Manager, Technician |
| Bảo trì | `GET /api/maintenance-events*`, `POST /api/maintenance-events`, `PUT /api/maintenance-events/{maintenanceEvent}` | Manager, Technician |
| Off-service | `POST /api/assets/{asset}/lock`, `POST /api/assets/{asset}/unlock` | Manager, Technician |

Ghi chú:

- `technician` được quyền vận hành đầy đủ ở 4 phân hệ:
  - danh mục và hồ sơ
  - cấp phát
  - bảo trì sửa chữa
  - thu hủy
- `technician` không được quyền duyệt request hay xem báo cáo.

## 5. Quyền theo resource

### 5.1 Request

`AssetRequestPolicy` chịu trách nhiệm các điểm sau:

- Người tạo request được xem request của chính họ.
- Người tạo request được hủy request của chính họ khi còn `SUBMITTED`.
- Manager được xem queue duyệt và duyệt request.
- Technician không được duyệt.

### 5.2 Maintenance

`MaintenanceEventPolicy` chịu trách nhiệm:

- Manager xem và thao tác toàn bộ.
- Technician thao tác theo rule vận hành.
- Doctor/Employee không truy cập phân hệ bảo trì.

### 5.3 Asset check-in

`AssetCheckinPolicy` chịu trách nhiệm:

- Chỉ check-in tài sản hợp lệ.
- Chặn tài sản đang `off_service` hoặc `maintenance`.

### 5.4 User và Employee

`UserPolicy` và `EmployeePolicy` xử lý:

- Manager có quyền quản trị role và xóa.
- Technician chỉ xem/tạo trong phạm vi vận hành.

## 6. Ma trận tóm tắt theo phân hệ

| Phân hệ | Manager | Technician | Doctor | Employee |
| --- | :---: | :---: | :---: | :---: |
| Hồ sơ cá nhân | ✅ | ✅ | ✅ | ✅ |
| Tài sản cá nhân và QR | ✅ | ✅ | ✅ | ✅ |
| Check-in/check-out | ✅ | ✅ | ✅ | ✅ |
| Tạo request | ✅ | ✅ | ✅ | ✅ |
| Duyệt request | ✅ | ❌ | ❌ | ❌ |
| Danh mục tài sản | ✅ | ✅ | ❌ | ❌ |
| Phân công tài sản | ✅ | ✅ | ❌ | ❌ |
| Bảo trì và sửa chữa | ✅ | ✅ | ❌ | ❌ |
| Thu hủy | ✅ | ✅ | ❌ | ❌ |
| Báo cáo | ✅ | ❌ | ❌ | ❌ |
| Đổi role user | ✅ | ❌ | ❌ | ❌ |

## 7. Endpoint đặc biệt ngoài phạm vi DFD chính

Repo vẫn giữ một số API để tương thích:

- `feedbacks`
- `contracts`
- `employees`

Các API này không phải là trọng tâm của DFD mức 0, nhưng vẫn tồn tại trong codebase. Khi viết tài liệu nghiệp vụ hoặc demo sản phẩm, nên ưu tiên 5 phân hệ chính.

## 8. Checklist rà soát quyền sau mỗi lần sửa

- Manager còn duyệt được request hay không.
- Technician không lọt quyền báo cáo hoặc đổi role.
- Doctor/Employee không xem được danh mục tổng.
- Request theo ID còn chặn IDOR.
- Tài sản `off_service` còn bị khóa ở check-in, assign và loan.

## 9. Tài liệu liên quan

- [Tính năng theo vai trò](ROLE_FEATURES.md)
- [Quy ước database](DB_CONVENTIONS.md)
- [Checklist nghiệm thu](feat_role.md)
