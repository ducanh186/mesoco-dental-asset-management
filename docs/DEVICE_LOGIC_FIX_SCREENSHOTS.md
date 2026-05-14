# Checklist screenshot sau chỉnh sửa logic thiết bị

Ngày kiểm: 2026-05-15
Môi trường: Docker, `http://192.168.123.8:8000`
Tài khoản kiểm: `E1001 / password`

## Screenshot đối chiếu nhanh

| Mục kiểm | Screenshot |
| --- | --- |
| Sidebar: Tổng quan lên đầu, không còn mục Sơ đồ chức năng BFD, có Quản lý hồ sơ | `docs/screenshots/device-logic-2026-05-15/01-dashboard-sidebar.png` |
| Danh mục thiết bị: terminology thiết bị, card trạng thái, filter danh mục/trạng thái/vị trí, không còn filter người phụ trách | `docs/screenshots/device-logic-2026-05-15/02-device-catalog-filters.png` |
| Danh mục vị trí: cột Mã vị trí, Tên vị trí, Mô tả; dữ liệu vị trí thực tế | `docs/screenshots/device-logic-2026-05-15/03-location-catalog.png` |
| Đơn hàng: danh sách đơn không còn cột đơn giá/thanh toán | `docs/screenshots/device-logic-2026-05-15/04-purchase-orders-list.png` |
| Phiếu yêu cầu: filter loại yêu cầu đúng nghiệp vụ | `docs/screenshots/device-logic-2026-05-15/05-requests-filters.png` |
| Duyệt yêu cầu: trạng thái duyệt chỉ còn Chờ duyệt, Đã duyệt, Không duyệt | `docs/screenshots/device-logic-2026-05-15/06-review-requests-status.png` |
| Kiểm kê: Tổng thiết bị, Tổng giá trị còn lại, Đang kiểm kê, Lập kế hoạch kiểm kê; không còn 90% | `docs/screenshots/device-logic-2026-05-15/07-inventory-summary.png` |
| Nhà cung cấp: form field đúng scope, chỉ Tên nhà cung cấp bắt buộc | `docs/screenshots/device-logic-2026-05-15/08-supplier-form.png` |
| Tạo đơn hàng: chỉ còn nhà cung cấp, danh sách thiết bị, đơn vị, số lượng, ghi chú; không có đơn giá/thanh toán | `docs/screenshots/device-logic-2026-05-15/09-purchase-order-form.png` |
| Bàn giao / Thu hồi: route `/handover` có thống kê, filter và bảng phiếu bàn giao/thu hồi | `docs/screenshots/device-logic-2026-05-15/10-handover-records.png` |

## Kiểm tra bằng browser-use

- Danh mục thiết bị: có `Danh mục thiết bị`, không có `Danh mục tài sản`, không có `Tất cả phụ trách`.
- Danh mục thiết bị: có đủ danh mục `PC`, `Màn hình`, `Thiết bị Test`, `Phụ kiện dùng`, `Linh kiện thay thế`.
- Danh mục thiết bị: có đủ trạng thái `Sẵn sàng`, `Đã bàn giao`, `Đang bảo trì`, `Đang kiểm kê`, `Đã thu hủy`.
- Form tạo đơn hàng: không có `Đơn giá`, không có `Thanh toán`/`Phương thức thanh toán`, có khối `Danh sách thiết bị`.
- Duyệt yêu cầu: có `Chờ duyệt`, `Đã duyệt`, `Không duyệt`, không có `Đã hủy`.
- Kiểm kê: có `Tổng thiết bị`, `Tổng giá trị còn lại`, `Lập kế hoạch kiểm kê`, không có `90%`.
- Bàn giao / Thu hồi: `/assets#handover` chuyển về `/handover`; bảng có dữ liệu demo bàn giao và thu hồi.
