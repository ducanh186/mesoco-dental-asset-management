# RBAC Matrix

`RBAC` là Role-Based Access Control, nghĩa là hệ thống quyết định người dùng được làm gì dựa trên role. Dự án hiện dùng 4 role canonical: `manager`, `technician`, `employee`, `supplier`.

## Ma Trận Quyền

| Module | manager | technician | employee | supplier |
| --- | --- | --- | --- | --- |
| Dashboard | Xem toàn hệ thống | Xem vận hành | Xem phòng ban | Xem đơn hàng |
| Asset Catalog | CRUD | CRUD | Xem thiết bị phòng ban | Không |
| Department Handover | Bàn giao/thu hồi | Bàn giao/thu hồi | Xem | Không |
| Maintenance | CRUD, điều phối | CRUD, xử lý | Xem liên quan | Không |
| Inventory | Xem, tạo, hoàn tất | Xem, tạo, hoàn tất | Không | Không |
| Valuation/Depreciation | Xem báo cáo | Xem vận hành | Không | Không |
| Purchase Orders | CRUD, xem tất cả | CRUD, xem tất cả | Không | Xem/cập nhật đơn của mình |
| Requests | Tạo/xem | Tạo/xem | Tạo/xem của mình | Không |
| Review Requests | Duyệt/từ chối | Không | Không | Không |
| Disposal | Duyệt/xử lý | Xử lý | Không | Không |
| Reports | Xem/export | Không | Không | Không |
| User/Profile | Quản lý user | Xem user vận hành | Hồ sơ cá nhân | Hồ sơ supplier |

## Role Canonical

- `manager`: người quản lý hệ thống, báo cáo và phê duyệt.
- `technician`: kỹ thuật viên IT vận hành tài sản, bảo trì, kiểm kê.
- `employee`: nhân viên công ty gửi request và xem thiết bị phòng ban.
- `supplier`: nhà cung cấp theo dõi purchase order liên quan.

## Legacy Endpoint

Các API cũ ngoài scope active vẫn trả HTTP `410 Gone`. Mục tiêu là báo rõ chức năng đã dừng, không để client cũ hiểu nhầm rằng endpoint mất ngẫu nhiên.

| Endpoint legacy | Hành vi |
| --- | --- |
| `/api/qr/resolve` | `410 Gone` |
| `/api/my-assets` | `410 Gone` |
| `/api/my-asset-history*` | `410 Gone` |
| `/api/assets/available-for-loan` | `410 Gone` |
| `/api/assets/{asset}/regenerate-qr` | `410 Gone` |
| `/api/employees/{employee}/contracts` | `410 Gone` |
| `/api/contracts/{contract}*` | `410 Gone` |

## Nguyên Tắc

Employee không quản lý tài sản cá nhân theo flow mượn/trả. Tài sản được nhìn theo phòng ban nhận bàn giao. Technician và manager chịu trách nhiệm vận hành, kiểm kê và bảo trì.
