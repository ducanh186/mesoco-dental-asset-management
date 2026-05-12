# Seed Data

Seed data dùng để demo hệ thống Mesoco Asset Management sau khi migrate fresh. Dữ liệu mẫu tập trung vào thiết bị máy tính, vị trí, nhân viên chịu trách nhiệm, nhà cung cấp, maintenance, inventory và purchase order.

## Chạy Seed

```bash
php artisan migrate:fresh --seed
```

Nếu chỉ muốn chạy seeder chính:

```bash
php artisan db:seed --class=DatabaseSeeder
```

## Tài Khoản Mẫu

Đăng nhập seed account bằng `employee_code + password`. Email được dùng cho profile và forgot-password.

| Role | Employee code | Email | Password | Mục đích |
| --- | --- | --- | --- | --- |
| manager | E1001 | `manager@mesoco.vn` | password | Quản lý toàn hệ thống |
| technician | E1002 | `technician@mesoco.vn` | password | Vận hành tài sản thiết bị |
| employee | E1003 | `employee@mesoco.vn` | password | Gửi request và xem thiết bị mình phụ trách |
| employee | E1004 | `frontdesk@mesoco.vn` | password | Nhân viên lễ tân để test assignment |
| employee | E1005 | `warehouse@mesoco.vn` | password | Nhân viên kho để test assignment |

`Supplier` không được tạo trong `DatabaseSeeder`. Nếu cần test luồng supplier, tạo thêm supplier và user supplier trong seed riêng hoặc qua UI quản trị.

## Vị Trí Mẫu

| Code | Tên vị trí | Mô tả |
| --- | --- | --- |
| LOC-001 | Kho thiết bị | Lưu thiết bị chưa cấp phát hoặc đang chờ xử lý |
| LOC-002 | Phòng kỹ thuật | Khu vực kỹ thuật viên kiểm tra và sửa thiết bị |
| LOC-003 | Khu làm việc nhân viên | Khu vực nhân viên sử dụng thiết bị hằng ngày |
| LOC-004 | Phòng server | Khu vực đặt thiết bị mạng và server |

## Thiết Bị Mẫu

| Asset code | Tên | Category | Vị trí |
| --- | --- | --- | --- |
| IT-LAP-001 | Dell Latitude 5440 | Laptop | LOC-002 - Phòng kỹ thuật |
| IT-DES-001 | HP EliteDesk 800 G9 | Desktop | LOC-003 - Khu làm việc nhân viên |
| IT-MON-001 | LG 27-inch Monitor | Monitor | LOC-003 - Khu làm việc nhân viên |
| IT-NET-001 | Cisco Catalyst Switch | Network | LOC-004 - Phòng server |
| IT-SRV-001 | Dell PowerEdge R450 | Server | LOC-004 - Phòng server |
| IT-PRN-001 | HP LaserJet Pro M404dn | Printer | LOC-001 - Kho thiết bị |

## Nhân Viên Chịu Trách Nhiệm

Seeder tạo active assignment bằng `employee_id`. `department_name` để `null` trong dữ liệu active mới và chỉ giữ vai trò compatibility.

## Maintenance Demo

Seeder tạo ví dụ:

- Cập nhật phần mềm và bảo mật endpoint cho laptop.
- Kiểm tra server theo lịch: CPU load, RAID health, backup verification.
- Tài sản trong trạng thái maintenance/off service để test dashboard và inventory.

## Inventory Demo

Seeder bổ sung dữ liệu:

- `purchase_date`
- `purchase_cost`
- `useful_life_months`
- `salvage_value`
- `depreciation_method`
- `warranty_expiry`

Mục tiêu là có dữ liệu để xem valuation, depreciation, warranty expiring soon và danh sách đề xuất thu hủy khi depreciation `> 75%`.
