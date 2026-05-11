# Seed Data

Seed data dùng để demo hệ thống IT Asset Management sau khi migrate fresh. Dữ liệu mẫu tập trung vào thiết bị máy tính, vị trí, nhân viên chịu trách nhiệm, nhà cung cấp, maintenance, inventory và purchase order.

## Chạy Seed

```bash
php artisan migrate:fresh --seed
```

Nếu chỉ muốn chạy seeder chính:

```bash
php artisan db:seed --class=DatabaseSeeder
```

## Tài Khoản Mẫu

| Role | Email | Password | Mục đích |
| --- | --- | --- | --- |
| manager | manager@mesoco.vn | password | Quản lý toàn hệ thống |
| technician | technician@mesoco.vn | password | Vận hành IT asset |
| employee | employee@mesoco.vn | password | Gửi request và xem thiết bị mình phụ trách |
| supplier | supplier@mesoco.vn | password | Theo dõi purchase order |

## Vị Trí Mẫu

| Code | Tên vị trí | Mô tả |
| --- | --- | --- |
| LOC-001 | Kho IT | Lưu thiết bị IT chưa cấp phát hoặc đang chờ xử lý |
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
| IT-PRN-001 | HP LaserJet Pro M404dn | Printer | LOC-001 - Kho IT |

## Nhân Viên Chịu Trách Nhiệm

Seeder tạo active assignment bằng `employee_id`. `department_name` để null trong dữ liệu active mới.

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
