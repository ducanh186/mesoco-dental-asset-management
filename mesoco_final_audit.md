# MESOCO - FINAL AUDIT TỪ TRANSCRIPT + NEEDTOFIX

> Mục tiêu: gom các yêu cầu rời rạc từ bản ghi âm và PDF thành audit cuối để AI Agent biết còn sai gì, cần sửa gì, và thứ tự ưu tiên.  
> Lưu ý: đây là **requirement audit** dựa trên tài liệu người dùng cung cấp, không phải kết quả chạy browser/code runtime mới nhất.

---

## 1. Kết luận tổng quan

Dự án hiện cần chỉnh theo 5 nhóm lỗi chính:

1. **Sai cấu trúc navigation/RBAC**: Tổng quan chưa đúng vị trí; QR và phê duyệt request cần đưa ra menu chính; quyền technician/employee còn bị lẫn với manager.
2. **Sai thuật ngữ và domain UI**: UI còn dùng “tài sản” ở nơi cần dùng “thiết bị”; `Hồ sơ` đang bị hiểu sai là hồ sơ thiết bị thay vì hồ sơ người dùng; không được hiển thị BFD như một chức năng sản phẩm.
3. **Sai field nghiệp vụ so với ERD/schema**: form tạo đơn hàng, phiếu bàn giao/thu hồi/sửa chữa, kiểm kê, thu hủy chưa bám đúng trường dữ liệu.
4. **Thiếu luồng nghiệp vụ quan trọng**: thiếu lập kế hoạch bảo trì, lập kế hoạch kiểm kê, nhật ký sửa chữa, nhật ký kiểm kê, cập nhật trạng thái đơn hàng sau phản hồi nhà cung cấp.
5. **Báo cáo chưa dùng được**: thiếu dữ liệu/report source hoặc chưa có bảng/report logic để tạo và xuất báo cáo ổn định.

Ưu tiên cao nhất là sửa những điểm “thầy cô nhìn thấy ngay”: sidebar, tên menu, trạng thái, field form, người tạo/người duyệt phiếu sửa chữa, nhật ký sửa chữa/kiểm kê, và báo cáo.

---

## 2. Nguồn audit

| Nguồn | Nội dung chính được dùng |
|---|---|
| `Recording_3.txt` | Yêu cầu từ ghi âm ngày 20/5: thu hủy tự động, trạng thái thiết bị, phiếu yêu cầu, bảo trì/sửa chữa, kiểm kê, báo cáo, phân quyền. |
| `needtofix.pdf` | Ghi chú theo trang về quản lý danh mục, đơn hàng, yêu cầu, bàn giao/thu hồi, bảo trì, kiểm kê, báo cáo, RBAC. |
| `CLAUDE.md` | Quy tắc kỹ thuật, module active, role active, lệnh kiểm tra. |
| `HANDOVER.md` | Scope active, legacy compatibility, module mapping, database mapping. |
| `spec.MD` | Spec nghiệp vụ gốc đã chuẩn hóa. |
| `trich_xuat_field_erd_ui_thiet_bi.md` | Mapping field ERD -> UI. |
| `schema.sql` | Source để đối chiếu table/field thực tế sau migrate. |

---

## 3. Audit theo module

## 3.1. Sidebar / Navigation

### Vấn đề

- `Tổng quan` phải lên đầu, không nằm trong `Báo cáo`.
- `Quét QR thiết bị` cần là đề mục chính dưới `Tổng quan`.
- `Phê duyệt phiếu yêu cầu` cần đưa ra đề mục chính, không chôn trong module khác.
- Không được hiện `Sơ đồ chức năng BFD` trên UI.
- `Quản lý danh mục và hồ sơ` đang thiếu hoặc sai mục `Hồ sơ người dùng`.

### Yêu cầu sửa

Sidebar chuẩn:

1. Tổng quan
2. Quét QR thiết bị
3. Thiết bị của tôi
4. Quản lý danh mục và hồ sơ
5. Đơn hàng
6. Phiếu yêu cầu
7. Phê duyệt phiếu yêu cầu
8. Quản lý bàn giao / thu hồi
9. Quản lý bảo trì
10. Quản lý kiểm kê
11. Thu hủy thiết bị / Đề xuất thu hủy
12. Báo cáo
13. Phân quyền

### Acceptance Criteria

- Manager thấy đầy đủ mục theo quyền.
- Technician không thấy Đơn hàng.
- Employee không thấy Đơn hàng, Báo cáo, Phân quyền.
- Không còn item `Sơ đồ chức năng BFD`.

---

## 3.2. Quản lý danh mục và hồ sơ

### Vấn đề

- Vị trí cần field `Mã vị trí - Tên vị trí - Mô tả`.
- `Mã vị trí` phải auto-increment, không bắt nhập thủ công.
- Danh mục thiết bị và trạng thái cần dropdown chuẩn.
- Hồ sơ phải là hồ sơ người dùng, không phải hồ sơ thiết bị.

### Yêu cầu sửa

Menu con:

- Danh mục thiết bị
- Danh mục vị trí
- Nhà cung cấp
- Hồ sơ người dùng

Danh mục thiết bị gồm:

- PC
- Màn hình
- Thiết bị Test
- Phụ kiện dùng
- Linh kiện thay thế

Trạng thái thiết bị gồm:

- Tất cả
- Sẵn sàng
- Đã bàn giao
- Đang bảo trì
- Đang kiểm kê
- Đã thu hủy

### Acceptance Criteria

- Filter danh mục/trạng thái/vị trí hoạt động.
- Nút `Xóa bộ lọc` nằm ngang hàng với `Lọc`.
- Copy mô tả đúng: `Tra cứu nhanh thiết bị theo danh mục, trạng thái thiết bị và vị trí.`

---

## 3.3. Nhà cung cấp

### Vấn đề

Form nhà cung cấp đang có nhiều field nhưng cần kiểm tra schema để đảm bảo lưu đủ dữ liệu.

### Yêu cầu sửa

Form cần hỗ trợ:

- Mã nhà cung cấp
- Tên nhà cung cấp
- Người liên hệ
- Số điện thoại
- Email
- Địa chỉ
- Ghi chú

### Rủi ro

Nếu backend chỉ có `Contact` và `Address`, UI nhập nhiều field sẽ mất dữ liệu. Cần audit migration/model trước khi sửa.

### Acceptance Criteria

- Add/edit supplier lưu lại đủ các field UI đang cho nhập.
- Không có field nhập được nhưng reload lại mất dữ liệu.

---

## 3.4. Đơn hàng

### Vấn đề

- Form tạo đơn đang yêu cầu/hiển thị nhiều field chưa đúng giai đoạn tạo đơn.
- Trạng thái đơn hàng cần rút về 2 trạng thái.
- Cần action cập nhật trạng thái sau khi nhà cung cấp phản hồi.
- Tạo đơn xong cần thông báo đã gửi đơn đặt hàng cho nhà cung cấp.

### Yêu cầu sửa

Bước tạo đơn chỉ cần:

- Nhà cung cấp
- Tên/chọn thiết bị
- Đơn vị
- Số lượng
- Ghi chú nullable
- Thêm/gỡ thiết bị

Không bắt buộc:

- Đơn giá
- Thành tiền
- Phương thức thanh toán

Trạng thái:

- Chờ giao hàng
- Giao hàng thành công

Action ngoài table:

- Chi tiết
- Cập nhật trạng thái

Trong chi tiết mới cho sửa/hủy nếu có quyền.

### Acceptance Criteria

- Tạo đơn không cần đơn giá/thành tiền/payment.
- Người dùng không phải nhớ/gõ tên thiết bị thủ công khó kiểm soát; có dropdown/search/autocomplete.
- Sau khi tạo đơn có message gửi thông báo nhà cung cấp.
- Hủy đơn có confirm.

---

## 3.5. Phiếu yêu cầu / Phê duyệt

### Vấn đề

- Loại phiếu đang sai tên.
- Duyệt/từ chối đang lộ ngoài table thay vì nằm trong chi tiết.
- Thu hủy không phải phiếu do nhân viên tạo.

### Yêu cầu sửa

Loại phiếu:

- Bàn giao
- Thu hồi
- Sửa chữa
- Thu hủy

Trạng thái duyệt:

- Chờ duyệt
- Đã duyệt
- Không duyệt

Table ngoài:

- Chỉ action `Chi tiết`.

Detail:

- Duyệt
- Từ chối
- Người tạo
- Người duyệt
- Thông tin thiết bị
- Lịch sử xử lý

### Acceptance Criteria

- Manager vào detail mới thấy nút duyệt/từ chối.
- Employee/technician chỉ thấy phiếu của mình hoặc phiếu mình phụ trách theo quyền.
- Thu hủy hiển thị là đề xuất do hệ thống tạo.

---

## 3.6. Bàn giao / Thu hồi

### Vấn đề

- Bàn giao và thu hồi đang bị trộn logic.
- Thu hồi thiếu `Tình trạng thiết bị lúc thu hồi`.
- Không cần status riêng `Đã thu hồi`; thu hồi xong thiết bị về kho là `Sẵn sàng`.

### Yêu cầu sửa

Bàn giao cần:

- Người nhận
- Người thực hiện
- Ngày bàn giao
- Thiết bị
- Ghi chú
- Người phê duyệt nếu có

Thu hồi cần:

- Phiếu bàn giao liên quan
- Người trả
- Người nhận lại
- Ngày thu hồi
- Lý do
- Tình trạng thiết bị lúc thu hồi: bắt buộc
- Người phê duyệt nếu có

### Acceptance Criteria

- Bàn giao và thu hồi tách rõ ở UI.
- Thu hồi không submit được nếu thiếu tình trạng thiết bị lúc thu hồi.
- Sau thu hồi, thiết bị không hiện `Đã thu hồi`; nếu đủ điều kiện thì `Sẵn sàng`.

---

## 3.7. Bảo trì định kỳ / Sửa chữa / Nhật ký sửa chữa

### Vấn đề

- Bảo trì và sửa chữa cần tách thành 2 đề mục con.
- Sửa chữa không tạo mới thủ công từ module sửa chữa; phiếu sửa chữa đến từ yêu cầu sửa chữa đã duyệt.
- Thiếu thông tin người tạo và người duyệt phiếu sửa chữa.
- Thiếu nơi cập nhật nhật ký sửa chữa.

### Yêu cầu sửa

Bảo trì định kỳ:

- Có lập kế hoạch bảo trì mới.
- Chu kỳ 6 - 12 tháng/lần.
- Có technician phụ trách, không null.

Sửa chữa:

- Dữ liệu đến từ request đã duyệt.
- Detail sửa chữa hiển thị người tạo yêu cầu và người duyệt.
- Technician phụ trách không được trống.
- Có nhật ký sửa chữa trong detail.

Nhật ký sửa chữa:

- Ngày giờ
- Technician
- Lỗi
- Hành động
- Chi phí
- Kết quả
- Trạng thái thiết bị sau sửa

### Acceptance Criteria

- Technician cập nhật được nhật ký sửa chữa.
- Xem chi tiết thiết bị thấy lịch sử sửa chữa liên quan.
- Không còn trạng thái sửa chữa mơ hồ; cập nhật trạng thái thiết bị rõ ràng.

---

## 3.8. Kiểm kê định kỳ / Nhật ký kiểm kê

### Vấn đề

- Thiếu bảng/form lập kế hoạch kiểm kê.
- Không thấy danh sách thiết bị đưa vào kế hoạch kiểm kê.
- Không thấy người thực hiện kiểm kê.
- Không thấy lần kiểm kê cuối.
- Thiếu chỗ thêm/cập nhật nhật ký kiểm kê.

### Yêu cầu sửa

Cần có:

- Tạo kế hoạch kiểm kê.
- Chọn thiết bị cần kiểm kê.
- Chọn technician/người thực hiện.
- Ghi nhận kết quả thực tế.
- Hiển thị lần kiểm kê cuối.
- Cập nhật nhật ký kiểm kê.

Chi tiết kiểm kê cần đối chiếu:

- Thông tin thiết bị
- Vị trí hệ thống
- Vị trí thực tế
- Trạng thái hệ thống
- Tình trạng thực tế
- Nhật ký sửa chữa
- Khấu hao
- Người kiểm kê
- Thời gian kiểm kê

### Acceptance Criteria

- Tạo được kế hoạch kiểm kê có danh sách thiết bị.
- Technician cập nhật được kết quả thực tế từng thiết bị.
- Manager xem được tổng thiết bị và tổng giá trị còn lại.
- Không dùng ngưỡng 90% cho thu hủy; dùng >=75%.

---

## 3.9. Thu hủy / Đề xuất thu hủy

### Vấn đề

- Thu hủy đang bị hiểu như phiếu do người dùng tạo.
- Khấu hao/giá mua/giá trị còn lại đang sai hoặc chưa map đúng dữ liệu.
- Ngưỡng 90% là sai.

### Yêu cầu sửa

- Hệ thống tự đề xuất thu hủy khi khấu hao >=75%.
- Không tự động hoàn tất thu hủy.
- Manager/role có quyền phải duyệt đề xuất.
- Màn thu hủy hiển thị đủ: giá mua, khấu hao, giá trị còn lại, lý do, người duyệt.

### Acceptance Criteria

- Thiết bị khấu hao >=75% xuất hiện trong đề xuất thu hủy.
- Thiết bị <75% không bị đề xuất nếu không có rule khác.
- Sau duyệt thu hủy, thiết bị không thể bàn giao/sửa chữa mới.

---

## 3.10. Báo cáo

### Vấn đề

- Tạo báo cáo không chạy.
- Export không chạy hoặc không có dữ liệu.
- Không có bảng/report source rõ ràng.
- Các mục báo cáo bị chia sai, không khớp module.

### Yêu cầu sửa

Tối thiểu cần:

- Chỗ tạo báo cáo.
- Chỗ xuất báo cáo.
- Báo cáo tình trạng thiết bị.
- Báo cáo dự đoán/phân tích vòng đời thiết bị.
- Có fallback rõ khi không có dữ liệu: không crash, hiển thị empty state.

### Acceptance Criteria

- Manager tạo được báo cáo với dữ liệu seed.
- Export chạy được.
- Nếu không có dữ liệu, UI hiện thông báo rõ thay vì lỗi im lặng.

---

## 4. Priority Matrix

| Priority | Nhóm việc | Lý do |
|---|---|---|
| P0 | Navigation, RBAC, wording, trạng thái, field phiếu yêu cầu | Lộ ngay khi demo/bảo vệ. |
| P1 | Đơn hàng, bàn giao/thu hồi, sửa chữa, nhật ký sửa chữa | Là luồng nghiệp vụ lõi. |
| P2 | Kiểm kê, đề xuất thu hủy, báo cáo/export | Là phần hoàn thiện vòng đời thiết bị. |
| P3 | UI polish, empty state, loading, i18n wording | Làm app demo mượt hơn. |

---

## 5. Rủi ro cần kiểm soát

1. **Field UI không tồn tại trong DB**: đặc biệt supplier, return condition, repair logs, inventory logs.
2. **Status mismatch**: UI tiếng Việt 5 trạng thái nhưng backend có enum khác.
3. **RBAC mismatch**: sidebar ẩn nhưng API vẫn cho gọi hoặc ngược lại.
4. **Request type mismatch**: spec UI muốn nhiều loại phiếu, codebase active có thể chỉ có `JUSTIFICATION` và `CONSUMABLE_REQUEST`.
5. **Report không có source**: cần seed/test data hoặc query đúng bảng.

---

## 6. Definition of Done

Một module chỉ được coi là xong khi:

- UI đúng thuật ngữ.
- Field form map được với backend/schema.
- Submit/reload không mất dữ liệu.
- RBAC đúng theo role.
- Có empty/loading/error state cơ bản.
- `npm run check:i18n` pass.
- `npm run build` pass.
- `php artisan test` pass hoặc ghi rõ test nào fail và lý do.

