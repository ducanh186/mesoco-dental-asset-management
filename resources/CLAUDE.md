# Frontend Guide

Frontend là React SPA trong `resources/js`. Scope UI hiện tại là IT Asset Management theo phòng ban.

## Page Active

- `Dashboard.jsx`
- `AssetsPage.jsx`
- `RequestsPage.jsx`
- `ReviewRequestsPage.jsx`
- `MaintenancePage.jsx`
- `InventoryPage.jsx`
- `LocationsPage.jsx`
- `SuppliersPage.jsx`
- `PurchaseOrdersPage.jsx`
- `DisposalPage.jsx`
- `ReportPage.jsx`
- `ProfilePage.jsx`

## Quy Tắc UI

- Không thêm lại page quét mã cá nhân, personal asset history, available-for-loan hoặc employee contract CRUD.
- Label phải dùng wording IT asset, department handover, maintenance, inventory, purchase order, request.
- Nếu thêm i18n key mới, cập nhật cả `en.js` và `vi.js`.
- Sau khi sửa i18n, chạy `npm run check:i18n`.

## API Client

`resources/js/services/api.js` chỉ nên expose API wrapper cho module active. Legacy endpoint không cần wrapper frontend.
