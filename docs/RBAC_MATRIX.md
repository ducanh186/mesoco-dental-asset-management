# RBAC Matrix

`RBAC` là Role-Based Access Control, nghĩa là hệ thống quyết định người dùng được làm gì dựa trên role. Dự án hiện dùng 4 role canonical: `manager`, `technician`, `employee`, `supplier`.

## Ma Trận Quyền

| Module | manager | technician | employee | supplier |
| --- | --- | --- | --- | --- |
| Dashboard | Xem toàn hệ thống, review queue, valuation, cảnh báo | Xem vận hành, maintenance, valuation, cảnh báo | Xem thiết bị phụ trách | Xem đơn hàng |
| Asset Catalog | CRUD, search, assign/unassign, mở maintenance | CRUD, search, assign/unassign, mở maintenance | Xem thiết bị mình phụ trách | Không |
| Location Catalog | CRUD | CRUD | Không | Không |
| Responsible Employee | Gắn/thu hồi | Gắn/thu hồi | Xem | Không |
| Maintenance | CRUD, điều phối | CRUD, xử lý | Xem liên quan | Không |
| Inventory | Xem, tạo, hoàn tất | Xem, tạo, hoàn tất | Không | Không |
| Valuation/Depreciation | Xem báo cáo | Xem vận hành | Không | Không |
| Purchase Orders | CRUD, xem tất cả, tổng hợp theo supplier | CRUD, xem tất cả, tổng hợp theo supplier | Không | Xem/cập nhật đơn của mình |
| Requests | Tạo/xem | Tạo/xem | Tạo/xem của mình | Không |
| Review Requests | Duyệt/từ chối | Không | Không | Không |
| Disposal | Xử lý | Xử lý | Không | Không |
| Reports | Xem/export | Không | Không | Không |
| User/Profile | Quản lý user | Xem user vận hành | Hồ sơ cá nhân | Hồ sơ supplier |
| QR Resolve Portal | Regenerate, resolve, xem full basic + technical + supplier/purchase | Resolve, xem basic + technical | Resolve, xem basic | Không |

## Role Canonical

- `manager`: người quản lý hệ thống, báo cáo và phê duyệt.
- `technician`: kỹ thuật viên IT vận hành tài sản, bảo trì, kiểm kê.
- `employee`: nhân viên công ty gửi request và xem thiết bị mình phụ trách.
- `supplier`: nhà cung cấp theo dõi purchase order liên quan.

## Legacy Endpoint

Các API cũ ngoài scope active vẫn trả HTTP `410 Gone` cùng JSON message mô tả chức năng đã bị loại khỏi scope active. Mục tiêu là báo rõ chức năng đã dừng, không để client cũ hiểu nhầm rằng endpoint mất ngẫu nhiên.

| Endpoint legacy | Hành vi |
| --- | --- |
| `/api/my-assets` | `410 Gone` |
| `/api/my-asset-history*` | `410 Gone` |
| `/api/assets/available-for-loan` | `410 Gone` |
| `/api/employees/{employee}/contracts` | `410 Gone` |
| `/api/contracts/{contract}*` | `410 Gone` |

## QR Active Endpoints

| Endpoint active | Quyền |
| --- | --- |
| `/api/qr/resolve` | `manager`, `technician`, `employee`; nhận cả portal URL `/asset-portal/{qrUid}` và payload legacy `MESOCO\|ASSET\|v1\|{uuid}` |
| `/api/assets/{asset}/regenerate-qr` | `manager`, `technician` |
| `/asset-portal/{qrUid}` | Read-only portal view; bắt buộc đăng nhập, nếu chưa login sẽ redirect về `/login?redirect=/asset-portal/{qrUid}`; là nội dung QR ưu tiên cho nhãn in/mobile |

## Nguyên Tắc

Employee chỉ nhìn thấy asset đang gắn với `employee_id` của chính mình trong active assignment. Login active dùng `username + password` và vẫn tạm chấp nhận payload `employee_code` cũ ở lớp compatibility.
Technician và manager chịu trách nhiệm vận hành, kiểm kê, bảo trì, disposal và QR lifecycle.
QR vật lý nên encode portal URL để camera điện thoại mở trực tiếp; scanner nội bộ vẫn hỗ trợ resolve cả portal URL mới và payload QR cũ để không phá nhãn đã in.
