# Seeder và dữ liệu mẫu

## 1. Seeder đang dùng

Các seeder chính trong repo:

- `ShiftSeeder`
- `FinalMvpSeeder`
- `DemoSeeder`
- `ErdAlignmentSeeder`

## 2. Dữ liệu demo hiện có

Seeder hiện tập trung vào dữ liệu nội bộ:

- employee
- manager
- technician
- assets
- requests
- maintenance
- disposal
- review log

## 3. Supplier role trong môi trường seed

Hiện tại repo đã có:

- role `supplier` trong bảng `roles`
- bảng `suppliers`
- schema `purchase_orders` và `purchase_order_items`
- factory cho `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`

Nhưng seed demo mặc định chưa bắt buộc tạo sẵn tài khoản supplier portal. Nếu cần demo supplier login, nên:

1. seed dữ liệu chuẩn
2. tạo nhà cung cấp trong `suppliers`
3. tạo user role `supplier` gắn `supplier_id`
4. tạo đơn hàng mẫu qua API hoặc factory

## 4. Factory phục vụ test

Các factory mới và đang dùng:

- `SupplierFactory`
- `PurchaseOrderFactory`
- `PurchaseOrderItemFactory`
- `UserFactory::supplier()`

## 5. Test quan trọng cần chạy sau khi đụng seed/schema

```bash
php artisan test tests/Feature/PurchaseOrderApiTest.php
php artisan test tests/Feature/ProfileTest.php
php artisan test tests/Feature/SupplierApiTest.php
```

Nếu thay đổi nghiệp vụ cấp phát/bảo trì:

```bash
php artisan test tests/Feature/RequestTest.php tests/Feature/MaintenanceTest.php
```
