# Seed Data

Seed data dùng để demo hệ thống IT Asset Management sau khi migrate fresh. Dữ liệu mẫu tập trung vào thiết bị máy tính, phòng ban công ty, nhà cung cấp, maintenance, inventory và purchase order.

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
| employee | employee@mesoco.vn | password | Gửi request và xem thiết bị phòng ban |
| supplier | supplier@mesoco.vn | password | Theo dõi purchase order |

## Phòng Ban Mẫu

- IT Operations
- IT Support
- Finance
- Sales
- Operations
- Engineering

## Thiết Bị Mẫu

| Asset code | Tên | Category | Vị trí |
| --- | --- | --- | --- |
| IT-LAP-001 | Dell Latitude 5440 | Laptop | IT Support Room |
| IT-DES-001 | HP EliteDesk 800 G9 | Desktop | Finance Office |
| IT-MON-001 | LG 27-inch Monitor | Monitor | Sales Office |
| IT-NET-001 | Cisco Catalyst Switch | Network | Server Room |
| IT-SRV-001 | Dell PowerEdge R450 | Server | Server Room |
| IT-PRN-001 | HP LaserJet Pro M404dn | Printer | Operations Office |

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

Mục tiêu là có dữ liệu để xem valuation, depreciation và warranty expiring soon.

## Lưu Ý

Seed data không tạo flow mượn/trả và không tạo dữ liệu quét mã cá nhân. Các helper/factory active chỉ nên tạo request loại `JUSTIFICATION` hoặc `CONSUMABLE_REQUEST`.
