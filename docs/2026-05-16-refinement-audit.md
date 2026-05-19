# 2026-05-16 Refinement Audit

## 1. Current Files / Pages / Controllers Affected

- Navigation and RBAC surface: `resources/js/layouts/Sidebar.jsx`, `routes/api.php`, `resources/js/utils/roles.js`.
- Purchase orders: `resources/js/pages/PurchaseOrdersPage.jsx`, `app/Http/Controllers/PurchaseOrderController.php`, `app/Http/Requests/StorePurchaseOrderRequest.php`, `app/Http/Requests/UpdatePurchaseOrderRequest.php`, `tests/Feature/PurchaseOrderApiTest.php`, `tests/Feature/UserFacingCopyTest.php`.
- Requests and approvals: `resources/js/pages/RequestsPage.jsx`, `resources/js/pages/ReviewRequestsPage.jsx`, `app/Models/AssetRequest.php`, `app/Http/Controllers/RequestController.php`, `app/Http/Controllers/ReviewRequestController.php`, `app/Http/Requests/StoreRequestRequest.php`, `app/Http/Requests/ReviewRequestRequest.php`.
- Catalog and locations: `resources/js/pages/AssetsPage.jsx`, `resources/js/pages/LocationsPage.jsx`, `app/Http/Controllers/AssetController.php`, `app/Http/Controllers/LocationController.php`.
- Demo data and copy: `database/seeders/FeatureDemoDataSeeder.php`, `resources/js/i18n/locales/vi.js`, `resources/js/i18n/locales/en.js`.

## 2. Requirements Already Satisfied

- `Tổng quan` is the first top-level item for the active sidebar groups.
- `Quét QR thiết bị` is a top-level item directly after dashboard/overview.
- `Phê duyệt phiếu yêu cầu` is top-level for manager.
- Purchase orders are hidden from technician and employee in the active sidebar.
- Employee cannot access purchase orders through the API; technician is also forbidden by API test coverage.
- Purchase order list action is detail-first.
- Edit and delete purchase-order actions are inside the detail modal.
- Purchase-order status display is reduced to `Chờ giao hàng` and `Giao hàng thành công`.
- Initial purchase-order creation does not require unit price, subtotal, total amount, or payment method.
- Success toast for order creation mentions supplier notification.
- Catalog copy uses `Tra cứu nhanh thiết bị theo danh mục, trạng thái thiết bị và vị trí.`
- Location UI uses `Mã vị trí`, `Tên vị trí`, and `Mô tả`.
- Device category copy includes `PC`, `Màn hình`, `Thiết bị Test`, `Phụ kiện dùng`, and `Linh kiện thay thế`.
- Request/review API responses now expose a derived `workflow_label` for demo-safe labels without changing stored request enums.
- Request/review lists and detail modals prefer `workflow_label`, so visible demo labels can show `Bàn giao`, `Thu hồi`, `Sửa chữa`, and `Thu hủy`.
- Demo request seed dates are fixed from `06/05/2026` to `13/05/2026` for visible request/review pages.

## 3. Requirements Missing Before This Pass

- Required audit file `docs/2026-05-16-refinement-audit.md` did not exist.
- Purchase-order delete confirmation used dynamic text instead of the required exact text `Bạn chắc chắn muốn xóa?`.
- Purchase-order item selection was a plain text input, so users still had to remember/type device names manually.
- Backend validation allowed purchase-order item `unit` to be omitted on create/update, while the refinement says `Đơn vị` is required.
- Request/review type display still depended only on backend enum labels, so it could not show all four refinement workflow names.
- Demo request dates were relative to seed time instead of the requested `06/05/2026` to `13/05/2026` demo window.

## 4. Requirements Needing Backend / Schema Changes

- No schema change is needed for this safe pass.
- Backend validation change is needed for `items.*.unit` on purchase-order create/update.
- Request workflow labels are derived in the API response from existing fields; no stored enum expansion or migration is used in this pass.
- Deeper workflow items should remain later-phase work if they require new persisted fields or tables: return-device condition expansion, repair-log update workflow, maintenance planning, inventory performer, last inventory date, depreciation surfaces, report exports.

## 5. Conflicts Between Current Spec And 16/5 Refinement

- Current project guidance says active request backend types are still `JUSTIFICATION` and `CONSUMABLE_REQUEST`. The 16/5 refinement asks the UI to show `Bàn giao`, `Thu hồi`, `Sửa chữa`, and `Thu hủy`. This should remain a mapping/workflow-label decision unless the backend enum is deliberately extended.
- Historical purchase-order statuses include `preparing` and `shipping`; the refinement wants users to see only `Chờ giao hàng` and `Giao hàng thành công`. Current UI maps both `preparing` and `shipping` to `Chờ giao hàng`, which preserves legacy data while simplifying demo copy.
- The repo still contains internal BFD identifiers in code keys. The active UI must not show `Sơ đồ chức năng BFD`; internal key names can stay unless they leak to users.
- `Đang kiểm kê` should not become a primary device status. Inventory should remain an inventory check/session concept.

## 6. Exact Implementation Checklist For Phase B

- [x] Create this audit at `docs/2026-05-16-refinement-audit.md`.
- [x] Add user-facing regression coverage for purchase-order delete confirmation and device autocomplete.
- [x] Add backend validation coverage for required purchase-order item unit on create and update.
- [x] Change delete confirmation to exactly `Bạn chắc chắn muốn xóa?`.
- [x] Add a device datalist/autocomplete to the purchase-order item input using the existing assets API.
- [x] Require `items.*.unit` in purchase-order create/update requests.
- [x] Add derived request `workflow_label` to API responses without changing stored request enums.
- [x] Render request/review type badges from `workflow_label` in list and detail views.
- [x] Adjust request type copy for the two active create-form types to `Bàn giao` and `Sửa chữa`.
- [x] Seed demo requests across `Bàn giao`, `Thu hồi`, `Sửa chữa`, and `Thu hủy` with created dates from `06/05/2026` to `13/05/2026`.
- [x] Run `npm run check:i18n`.
- [x] Run `npm run build`.
- [x] Run `php artisan test`.
- [x] Browser smoke test with temporary non-conflicting ports if a dev server is needed.

## Later-Phase Backlog

- Split `Bàn giao` and `Thu hồi` into deeper separate workflows if the backend contract needs more than display mapping.
- Add required return-device-condition field if it must replace note across the workflow.
- Split `Bảo trì` and `Sửa chữa` into separate submodules only if the current grouped UI is not enough.
- Add repair log update workflow for assigned technician work.
- Add maintenance planning every 6-12 months.
- Add inventory performer and last inventory date where missing.
- Add depreciation percentage to all relevant device detail surfaces.
- Keep `>=75%` depreciation as a disposal suggestion only, not an automatic status mutation.
- Add create/export reports and predictive lifecycle/depreciation reports.
