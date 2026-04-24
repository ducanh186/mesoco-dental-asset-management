# Project Guide: Mesoco IT Asset Management

Hệ thống quản lý tài sản IT theo phòng ban cho công ty công nghệ. Khi sửa code, giữ scope nhỏ và đúng nghiệp vụ: asset catalog, department handover, maintenance, inventory, valuation, purchase orders, requests sự cố/vật tư và disposal.

## Quy Tắc Kỹ Thuật

- Không đổi tên repo hoặc bảng/cột lịch sử nếu không có yêu cầu migration riêng.
- Không drop migration cũ trong cleanup thông thường.
- Không đưa lại flow mượn/trả cá nhân hoặc quét mã cá nhân vào UI active.
- Legacy API ngoài scope phải trả JSON `410 Gone`.
- `assets.type` giữ enum generic; phân loại IT dùng `category`.
- Request active chỉ gồm `JUSTIFICATION` và `CONSUMABLE_REQUEST`.

## Lệnh Chính

```bash
composer install
npm install
php artisan migrate --seed
npm run check:i18n
npm run build
php artisan test
```

## Module Active

- `AssetController`: asset catalog, department handover, supplier/category metadata.
- `MaintenanceEventController`: maintenance event và detail.
- `InventoryController`: inventory check, valuation, warranty.
- `PurchaseOrderController`: purchase order và supplier scope.
- `RequestController`, `ReviewRequestController`: incident/supply request và approval.
- `DisposalController`: off-service, disposal và book value.

## Role Active

- `manager`: quản lý, duyệt request, report, user.
- `technician`: vận hành asset, maintenance, inventory, purchase order.
- `employee`: xem thiết bị phòng ban và gửi request.
- `supplier`: xem/cập nhật purchase order của chính supplier.

## Frontend

React pages active nằm trong `resources/js/pages`. Navigation chính nằm ở `resources/js/layouts/Sidebar.jsx`. i18n nằm trong `resources/js/i18n/locales`; sau khi sửa key phải chạy `npm run check:i18n`.

## Docs

Docs chính nằm trong `docs/`. Nếu đổi nghiệp vụ hoặc public API, cập nhật docs cùng commit.
