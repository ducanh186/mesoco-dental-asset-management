# MESOCO - CHECKLIST CÁC ĐIỀU CẦN SỬA

> Checklist kết hợp từ `Recording_3.txt`, `needtofix.pdf`, và context dự án Mesoco.  
> Cách dùng: AI Agent tick từng dòng sau khi đã sửa và tự test.  
> Không tick nếu chỉ sửa UI text nhưng chưa kiểm tra data/API.

---

## 0. Chuẩn bị trước khi sửa

- [ ] Đọc `CLAUDE.md`.
- [ ] Đọc `HANDOVER.md`.
- [ ] Đọc `spec.MD`.
- [ ] Đọc `schema.sql`.
- [ ] Đọc `CHAPTER3_DATABASE_SCHEMA_QUICK_REFERENCE.md`.
- [ ] Đọc `trich_xuat_field_erd_ui_thiet_bi.md`.
- [ ] Đọc `needtofix.pdf`.
- [ ] Đọc `Recording_3.txt`.
- [ ] Audit routes/controllers/models liên quan trước khi code.
- [ ] Audit React pages trong `resources/js/pages`.
- [ ] Audit navigation trong `resources/js/layouts/Sidebar.jsx`.
- [ ] Audit i18n keys EN/VI trong `resources/js/i18n/locales`.

---

## 1. Navigation / Sidebar / RBAC

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Đưa `Tổng quan` lên đầu sidebar. | Login manager/technician/employee, kiểm tra menu đầu tiên. |
| [ ] | P0 | Xóa/ẩn item `Sơ đồ chức năng BFD` khỏi UI. | Search toàn UI không còn BFD như chức năng. |
| [ ] | P0 | Đưa `Quét QR thiết bị` ra menu chính dưới Tổng quan. | Sidebar có QR ở đúng vị trí. |
| [ ] | P0 | Đưa `Phê duyệt phiếu yêu cầu` ra menu chính cho manager. | Manager thấy, employee không thấy. |
| [ ] | P0 | Sửa `Quản lý danh mục và hồ sơ` có đủ: Danh mục thiết bị, Danh mục vị trí, Nhà cung cấp, Hồ sơ người dùng. | Mở từng submenu được. |
| [ ] | P0 | Technician không thấy Đơn hàng. | Login technician kiểm tra. |
| [ ] | P0 | Employee không thấy Đơn hàng, Báo cáo, Phân quyền. | Login employee kiểm tra. |
| [ ] | P0 | Employee/technician chỉ thấy phiếu liên quan đến mình/theo phụ trách. | API/UI không leak dữ liệu người khác. |

---

## 2. Wording / Thuật ngữ UI

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Đổi UI active từ `Tài sản` sang `Thiết bị` nơi phù hợp. | Search text UI/i18n. |
| [ ] | P0 | Đổi `Loại tài sản` thành `Danh mục thiết bị`. | Kiểm tra filter/form/table. |
| [ ] | P0 | `Hồ sơ` trong danh mục là `Hồ sơ người dùng`, không phải hồ sơ thiết bị. | Mở menu hồ sơ, data là user/employee. |
| [ ] | P1 | Sửa copy filter thành `Tra cứu nhanh thiết bị theo danh mục, trạng thái thiết bị và vị trí.` | Kiểm tra danh sách thiết bị. |
| [ ] | P2 | Sửa tên demo `Nguyễn Văn A` thành `Nguyễn Văn An` nếu còn trong seed/UI. | Search DB seed/UI. |

---

## 3. Trạng thái và dropdown

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Dropdown trạng thái thiết bị có `Tất cả` ở đầu. | Mở filter trạng thái. |
| [ ] | P0 | Trạng thái thiết bị UI chỉ gồm: Sẵn sàng, Đã bàn giao, Đang bảo trì, Đang kiểm kê, Đã thu hủy. | Kiểm tra list/filter/detail. |
| [ ] | P0 | Không hiển thị các trạng thái/action vô nghĩa như “chi tiết thu hủy/bảo trì” cạnh status nếu bấm không có tác dụng. | Click thử các status/action. |
| [ ] | P0 | Trạng thái duyệt chỉ gồm: Chờ duyệt, Đã duyệt, Không duyệt. | Tạo/review request. |
| [ ] | P0 | Trạng thái đơn hàng chỉ gồm: Chờ giao hàng, Giao hàng thành công. | Tạo/cập nhật order. |
| [ ] | P1 | Nút `Xóa bộ lọc` nằm ngang hàng với `Lọc`. | Kiểm tra layout. |

---

## 4. Quản lý danh mục - Vị trí

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Bảng vị trí hiển thị `Mã vị trí`, `Tên vị trí`, `Mô tả`. | Mở danh mục vị trí. |
| [ ] | P0 | `Mã vị trí` auto-increment, không bắt nhập thủ công. | Tạo vị trí mới. |
| [ ] | P1 | Tên vị trí dùng data mẫu: Kho tầng 1/2/3, Khu HR, Khu kế toán, Khu lễ tân, Khu Dự án. | Kiểm tra seed/dropdown. |
| [ ] | P1 | Nếu schema có `description`, lưu được mô tả; nếu không, thêm migration hoặc bỏ field UI. | Tạo/sửa/reload. |

---

## 5. Quản lý danh mục - Danh mục thiết bị

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Dropdown danh mục gồm PC, Màn hình, Thiết bị Test, Phụ kiện dùng, Linh kiện thay thế. | Kiểm tra filter/form. |
| [ ] | P1 | Không để danh mục cũ/sai domain xuất hiện trong UI active. | Search UI. |
| [ ] | P1 | Danh mục map đúng `categories` hoặc field category hiện có. | Tạo thiết bị, reload vẫn giữ category. |

---

## 6. Nhà cung cấp

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Audit schema supplier trước khi sửa UI. | Ghi rõ field đang có. |
| [ ] | P1 | Form nhà cung cấp có: mã, tên, người liên hệ, điện thoại, email, địa chỉ, ghi chú. | Add/edit supplier. |
| [ ] | P1 | Không có field nhập được nhưng không lưu. | Reload sau submit. |
| [ ] | P1 | Thông tin liên hệ supplier dùng được khi tạo đơn hàng/gửi thông báo. | Tạo order, kiểm tra message. |

---

## 7. Đơn hàng

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Form tạo đơn chỉ bắt buộc: Nhà cung cấp, thiết bị, đơn vị, số lượng. | Submit không cần giá/payment. |
| [ ] | P0 | Ghi chú được phép null. | Submit item không ghi chú. |
| [ ] | P0 | Bỏ bắt buộc đơn giá/thành tiền/phương thức thanh toán ở bước tạo. | Tạo order thành công. |
| [ ] | P1 | Có searchable select/autocomplete cho tên thiết bị; không bắt nhớ/gõ tay khó kiểm soát. | Thử chọn thiết bị. |
| [ ] | P1 | Nút `Thêm thiết bị` hoạt động. | Add nhiều dòng. |
| [ ] | P1 | Gỡ thiết bị hoạt động. | Remove dòng. |
| [ ] | P1 | Table ngoài chỉ có `Chi tiết` và `Cập nhật trạng thái`. | Kiểm tra order list. |
| [ ] | P1 | `Xóa` đổi thành `Hủy` nếu đúng nghiệp vụ. | Kiểm tra action. |
| [ ] | P1 | Hủy đơn có confirm. | Click hủy. |
| [ ] | P1 | Có action cập nhật trạng thái sau phản hồi nhà cung cấp. | Chuyển Chờ giao hàng -> Giao hàng thành công. |
| [ ] | P1 | Tạo đơn xong hiện message đã gửi thông báo tới nhà cung cấp. | Tạo order. |
| [ ] | P2 | Nếu gửi thông báo lỗi, UI phân biệt “tạo đơn thành công nhưng gửi thông báo thất bại”. | Mock/fail email nếu có. |

---

## 8. Phiếu yêu cầu / Phê duyệt

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Loại phiếu UI gồm Bàn giao, Thu hồi, Sửa chữa, Thu hủy. | Filter/list request. |
| [ ] | P0 | Table ngoài chỉ action `Chi tiết`. | Không thấy Duyệt/Từ chối ở list. |
| [ ] | P0 | Trong detail mới có `Duyệt` và `Từ chối`. | Mở detail request. |
| [ ] | P0 | Detail hiển thị người tạo phiếu. | Xem detail. |
| [ ] | P0 | Detail hiển thị người duyệt nếu đã xử lý. | Duyệt rồi mở lại. |
| [ ] | P1 | Thu hủy hiển thị là đề xuất hệ thống, không phải phiếu nhân viên tạo thủ công. | Kiểm tra tạo request. |
| [ ] | P1 | Thời gian demo tạo phiếu sửa từ 06/05/2026 sang 13/05/2026 nếu còn seed sai. | Kiểm tra seed/list. |

---

## 9. Bàn giao / Thu hồi

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Tách rõ màn/section bàn giao và thu hồi. | Không còn trộn label/field. |
| [ ] | P0 | Bàn giao không yêu cầu field tình trạng sau thu hồi. | Tạo phiếu bàn giao. |
| [ ] | P0 | Thu hồi có field `Tình trạng thiết bị lúc thu hồi`. | Mở/tạo phiếu thu hồi. |
| [ ] | P0 | `Tình trạng thiết bị lúc thu hồi` bắt buộc, không null. | Submit thiếu phải báo lỗi. |
| [ ] | P1 | Sau thu hồi, không cần status `Đã thu hồi`; thiết bị về `Sẵn sàng` nếu nhập kho lại. | Thu hồi xong kiểm tra device status. |
| [ ] | P1 | Thu hồi liên kết được phiếu bàn giao gốc. | Xem detail thu hồi. |

---

## 10. Bảo trì định kỳ

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Tách `Bảo trì định kỳ` khỏi `Sửa chữa`. | Sidebar/page. |
| [ ] | P1 | Có chức năng lập kế hoạch bảo trì mới. | Tạo kế hoạch. |
| [ ] | P1 | Chu kỳ bảo trì gợi ý 6 - 12 tháng/lần. | Kiểm tra form/validation/copy. |
| [ ] | P1 | Kỹ thuật viên phụ trách không được để trống. | Submit thiếu phải lỗi. |
| [ ] | P1 | Xem được kế hoạch bảo trì đã tạo. | Reload/list. |

---

## 11. Sửa chữa / Nhật ký sửa chữa

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Sửa chữa là phiếu sửa chữa sinh từ yêu cầu sửa chữa đã duyệt. | Duyệt request -> xuất hiện repair. |
| [ ] | P0 | Technician không phải nhập lại phiếu sửa chữa từ đầu. | Flow sau duyệt. |
| [ ] | P0 | Detail sửa chữa hiển thị người tạo yêu cầu. | Mở detail. |
| [ ] | P0 | Detail sửa chữa hiển thị người duyệt yêu cầu. | Mở detail sau duyệt. |
| [ ] | P0 | Kỹ thuật viên phụ trách không null. | Validation. |
| [ ] | P1 | Có chỗ thêm/cập nhật nhật ký sửa chữa. | Add log. |
| [ ] | P1 | Nhật ký sửa chữa xem được trong detail sửa chữa. | Reload detail. |
| [ ] | P1 | Nhật ký sửa chữa xem được từ chi tiết thiết bị nếu có liên kết. | Mở asset detail. |
| [ ] | P1 | Technician cập nhật trạng thái thiết bị sau sửa. | Change status. |
| [ ] | P1 | Không dùng “trạng thái sửa chữa” mơ hồ nếu không có model rõ. | Kiểm tra UI text. |

---

## 12. Kiểm kê định kỳ / Nhật ký kiểm kê

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Có form/bảng lập kế hoạch kiểm kê. | Tạo kế hoạch. |
| [ ] | P0 | Chọn được danh sách thiết bị đưa vào kiểm kê. | Add devices to plan. |
| [ ] | P0 | Chọn được người thực hiện/kỹ thuật viên kiểm kê. | Submit plan. |
| [ ] | P1 | Xem được kế hoạch kiểm kê. | Reload/list. |
| [ ] | P1 | Xem được thời gian kiểm kê lần cuối. | Asset/list/detail. |
| [ ] | P1 | Có chỗ thêm/cập nhật nhật ký kiểm kê. | Add inventory log. |
| [ ] | P1 | Ghi nhận kết quả thực tế từng thiết bị. | Update item. |
| [ ] | P1 | Hiển thị khấu hao % để so với rule >=75%. | Detail/checklist. |
| [ ] | P1 | Hiển thị người kiểm kê. | Detail/checklist. |
| [ ] | P2 | Đối chiếu được nhật ký sửa chữa + thông tin thiết bị khi kiểm kê. | Xem detail kiểm kê. |

---

## 13. Thu hủy / Đề xuất thu hủy

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Dùng rule `khấu hao >= 75%` để đề xuất thu hủy. | Tạo asset >=75%. |
| [ ] | P0 | Bỏ rule hiển thị `>=90%`. | Search UI. |
| [ ] | P0 | Thu hủy là đề xuất hệ thống tự tạo, không phải nhân viên tạo. | Kiểm tra request/create UI. |
| [ ] | P1 | Màn thu hủy hiển thị giá mua đúng. | So DB/UI. |
| [ ] | P1 | Màn thu hủy hiển thị khấu hao đúng. | So DB/UI. |
| [ ] | P1 | Màn thu hủy hiển thị giá trị còn lại đúng. | So formula/API. |
| [ ] | P1 | Manager duyệt đề xuất thu hủy. | Duyệt disposal. |
| [ ] | P1 | Thiết bị đã thu hủy không còn bàn giao/sửa chữa mới được. | Try assign/repair disposed asset. |

---

## 14. Báo cáo

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P0 | Fix lỗi không tạo được báo cáo. | Manager tạo báo cáo. |
| [ ] | P0 | Fix lỗi không xuất được báo cáo. | Export report. |
| [ ] | P1 | Có báo cáo tình trạng thiết bị. | Xem/export. |
| [ ] | P1 | Có báo cáo dự đoán/phân tích vòng đời thiết bị. | Xem/export. |
| [ ] | P1 | Empty state khi không có dữ liệu: không crash. | Clear/no data scenario. |
| [ ] | P1 | Report source lấy đúng bảng: assets, maintenance, inventory, purchase_orders, disposals. | Audit query/API. |
| [ ] | P2 | Gộp các mục báo cáo sai/lẻ tẻ vào một luồng báo cáo thống nhất. | Kiểm tra UI. |

---

## 15. Thiết bị của tôi / QR

| Done | Priority | Việc cần sửa | Test |
|---|---|---|---|
| [ ] | P1 | `Thiết bị của tôi` hiển thị đúng thiết bị liên quan đến user. | Login employee. |
| [ ] | P1 | Từ thiết bị của tôi tạo được yêu cầu sửa chữa. | Submit request. |
| [ ] | P1 | Form sửa chữa tự điền mã thiết bị, tên thiết bị, ngày giờ. | Mở form từ asset detail. |
| [ ] | P1 | QR là menu chính nhưng không thành workflow chính bắt buộc. | Kiểm tra flow. |
| [ ] | P2 | QR hiển thị data theo role. | Scan/view bằng manager/technician/employee. |

---

## 16. Final test commands

- [ ] Chạy `npm run check:i18n`.
- [ ] Chạy `npm run build`.
- [ ] Chạy `php artisan test`.
- [ ] Nếu dùng Docker, chạy `scripts\docker-start.bat` và test browser tại `http://localhost:8000`.
- [ ] Ghi lại test pass/fail vào final report.

---

## 17. Manual smoke test theo role

### Manager

- [ ] Đăng nhập manager.
- [ ] Sidebar đúng và đầy đủ.
- [ ] Tạo/sửa vị trí.
- [ ] Tạo/sửa supplier.
- [ ] Tạo đơn hàng không cần đơn giá/payment.
- [ ] Cập nhật trạng thái đơn hàng.
- [ ] Duyệt/từ chối request trong detail.
- [ ] Xem đề xuất thu hủy >=75%.
- [ ] Tạo/xuất báo cáo.

### Technician

- [ ] Đăng nhập technician.
- [ ] Không thấy Đơn hàng.
- [ ] Thấy bảo trì/sửa chữa/kiểm kê.
- [ ] Tạo kế hoạch bảo trì.
- [ ] Cập nhật nhật ký sửa chữa.
- [ ] Tạo kế hoạch kiểm kê.
- [ ] Cập nhật nhật ký kiểm kê.
- [ ] Chỉ thấy phiếu sửa chữa mình phụ trách.

### Employee

- [ ] Đăng nhập employee.
- [ ] Không thấy Đơn hàng/Báo cáo/Phân quyền.
- [ ] Thấy Thiết bị của tôi.
- [ ] Chỉ thấy phiếu yêu cầu của mình.
- [ ] Tạo yêu cầu sửa chữa từ thiết bị của tôi.

---

## 18. Không được coi là xong nếu còn các lỗi này

- [ ] UI vẫn có `Tài sản` ở màn active quan trọng.
- [ ] Hồ sơ vẫn là hồ sơ thiết bị thay vì hồ sơ người dùng.
- [ ] Thu hủy vẫn cho nhân viên tạo thủ công như request thường.
- [ ] Rule thu hủy vẫn là 90%.
- [ ] Phiếu sửa chữa không có người tạo/người duyệt.
- [ ] Không có nhật ký sửa chữa.
- [ ] Không có lập kế hoạch kiểm kê.
- [ ] Không có nhật ký kiểm kê.
- [ ] Báo cáo vẫn không tạo/xuất được.
- [ ] Technician/employee vẫn xem được đơn hàng.
- [ ] `npm run build` fail.
- [ ] `npm run check:i18n` fail.

