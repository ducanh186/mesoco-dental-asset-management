# MESOCO - SPEC SỬA UI/NGHIỆP VỤ CHO AI AGENT

> Mục đích: đây là bản spec đã làm sạch từ `Recording_3.txt` và `needtofix.pdf`, dùng để giao việc cho AI Agent sửa dự án Mesoco IT Asset Management.  
> Trạng thái: spec triển khai, không phải ghi chú thô.  
> Nguyên tắc: sửa đúng nghiệp vụ, đúng field dữ liệu, không tự bịa flow mới.

---

## 0. Context bắt buộc phải đọc trước khi sửa

AI Agent phải đọc các file sau trước khi code:

1. `CLAUDE.md`
2. `HANDOVER.md`
3. `spec.MD`
4. `schema.sql`
5. `CHAPTER3_DATABASE_SCHEMA_QUICK_REFERENCE.md`
6. `trich_xuat_field_erd_ui_thiet_bi.md`
7. `needtofix.pdf`
8. `Recording_3.txt`

Sau khi đọc, AI Agent phải tự audit codebase trước, rồi mới sửa. Không được sửa theo cảm tính chỉ từ UI hiện tại.

---

## 1. Scope nghiệp vụ phải giữ

Dự án là **Mesoco IT Asset Management**: quản lý vòng đời thiết bị IT.

Các module active:

- Tổng quan / Dashboard
- Quản lý danh mục và hồ sơ
- Danh mục thiết bị
- Danh mục vị trí
- Nhà cung cấp
- Hồ sơ người dùng
- Danh sách thiết bị
- Quét QR thiết bị
- Thiết bị của tôi
- Đơn hàng
- Phiếu yêu cầu
- Phê duyệt phiếu yêu cầu
- Bàn giao / Thu hồi
- Bảo trì định kỳ
- Sửa chữa
- Nhật ký sửa chữa
- Kiểm kê định kỳ
- Nhật ký kiểm kê
- Đề xuất thu hủy / Thu hủy
- Báo cáo
- Phân quyền

### Không đưa lại các flow ngoài scope

- Không đưa lại flow mượn/trả cá nhân kiểu thư viện.
- Không dùng QR scan làm workflow chính.
- Không dùng từ “tài sản” trên UI nếu có thể đổi sang “thiết bị”.
- Không đưa domain khác như medical/dental/legal vào UI.
- Không tự tạo request type mới nếu backend active chỉ có `JUSTIFICATION` và `CONSUMABLE_REQUEST`, trừ khi đã audit và map rõ vào nghiệp vụ hiện có.

---

## 2. Thuật ngữ UI chuẩn

| Từ/cụm từ sai hoặc chưa chuẩn | Từ/cụm từ phải dùng |
|---|---|
| Tài sản | Thiết bị |
| Loại tài sản | Danh mục thiết bị |
| Hồ sơ thiết bị trong menu hồ sơ | Hồ sơ người dùng nếu nằm trong Quản lý danh mục và hồ sơ |
| Sơ đồ chức năng BFD trên UI | Không hiển thị trên UI sản phẩm |
| Thu vỉ / thu huỷ OCR sai | Thu hủy |
| Bàn lao / bàn dao OCR sai | Bàn giao |
| Kiểm kế OCR sai | Kiểm kê |
| Khủng hao / khố hao OCR sai | Khấu hao |

---

## 3. Trạng thái thiết bị và trạng thái nghiệp vụ

### 3.1. Trạng thái thiết bị hiển thị ở UI

UI chỉ dùng 5 trạng thái chính:

1. `Sẵn sàng`
2. `Đã bàn giao`
3. `Đang bảo trì`
4. `Đang kiểm kê`
5. `Đã thu hủy`

Yêu cầu:

- Dropdown trạng thái phải có `Tất cả` ở đầu danh sách.
- Sau `Tất cả` mới là các trạng thái cụ thể.
- Không để pattern sai kiểu: placeholder “Chọn một tùy chọn...” rồi bên dưới lại có `Tất cả` làm option đầu nhưng layout gây hiểu nhầm.
- Với filter, thống nhất vị trí dropdown và nút `Xóa bộ lọc` ở cùng hàng với nút `Lọc`.

### 3.2. Trạng thái đơn hàng

Đơn hàng chỉ cần 2 trạng thái ở UI giai đoạn hiện tại:

1. `Chờ giao hàng`
2. `Giao hàng thành công`

Yêu cầu:

- Bổ sung action để manager cập nhật trạng thái đơn hàng sau khi nhà cung cấp phản hồi.
- Bên ngoài table đơn hàng chỉ để action `Chi tiết` và `Cập nhật trạng thái`.
- Không để action `Xóa` trực tiếp; đổi thành `Hủy` nếu nghiệp vụ là hủy đơn.
- Nếu vẫn có xóa/hủy, phải confirm lại: `Bạn chắc chắn muốn hủy đơn hàng này?`

### 3.3. Trạng thái duyệt phiếu yêu cầu

Trạng thái duyệt chỉ gồm:

1. `Chờ duyệt`
2. `Đã duyệt`
3. `Không duyệt`

Yêu cầu:

- Table ngoài chỉ hiện `Chi tiết`.
- Trong màn chi tiết mới có `Duyệt` và `Từ chối`.
- Loại phiếu hiển thị gồm: `Bàn giao`, `Thu hồi`, `Sửa chữa`, `Thu hủy`.
- Thời gian tạo phiếu demo/test phải sửa từ `06/05/2026` sang `13/05/2026` nếu đang dùng seed/demo cố định.

---

## 4. Navigation / Sidebar chuẩn

### 4.1. Thứ tự menu chính

Menu chính nên đi theo thứ tự:

1. `Tổng quan`
2. `Quét QR thiết bị`
3. `Thiết bị của tôi` nếu role có quyền
4. `Quản lý danh mục và hồ sơ`
5. `Đơn hàng` nếu role có quyền
6. `Phiếu yêu cầu`
7. `Phê duyệt phiếu yêu cầu` nếu role có quyền
8. `Quản lý bàn giao / thu hồi`
9. `Quản lý bảo trì`
10. `Quản lý kiểm kê`
11. `Thu hủy thiết bị` hoặc `Đề xuất thu hủy`
12. `Báo cáo`
13. `Phân quyền`

### 4.2. Quản lý danh mục và hồ sơ

Menu con gồm:

- `Danh mục thiết bị`
- `Danh mục vị trí`
- `Nhà cung cấp`
- `Hồ sơ người dùng`

`Hồ sơ người dùng` là danh sách user/employee trong hệ thống, dùng field từ bảng `users`/`employees`. Không phải hồ sơ thiết bị.

### 4.3. Quản lý bảo trì

Menu con gồm:

- `Bảo trì định kỳ`
- `Sửa chữa`
- `Nhật ký sửa chữa` nếu cần tách view, nhưng ưu tiên nhật ký nằm trong chi tiết sửa chữa/chi tiết thiết bị.

Yêu cầu nghiệp vụ:

- `Bảo trì định kỳ` có chức năng lập kế hoạch bảo trì mới.
- `Sửa chữa` không tạo phiếu sửa chữa mới thủ công từ module này. Phiếu sửa chữa đến từ phiếu yêu cầu của nhân viên sau khi được duyệt.

### 4.4. Quản lý kiểm kê

Menu con gồm:

- `Kiểm kê định kỳ`
- `Lập kế hoạch kiểm kê`
- `Nhật ký kiểm kê`

Yêu cầu:

- Phải có bảng/form lập kế hoạch kiểm kê.
- Phải xem được lần kiểm kê cuối.
- Phải có chỗ thêm/cập nhật nhật ký kiểm kê.

---

## 5. RBAC chuẩn theo role

### 5.1. Manager

Manager được xem/quản lý gần như toàn bộ:

- Tổng quan
- Quản lý danh mục và hồ sơ
- Danh sách thiết bị
- Quét QR thiết bị
- Đơn hàng
- Phiếu yêu cầu
- Phê duyệt phiếu yêu cầu
- Bàn giao / Thu hồi
- Bảo trì
- Sửa chữa
- Kiểm kê
- Thu hủy / Đề xuất thu hủy
- Báo cáo
- Phân quyền

Riêng phần `Hồ sơ người dùng`, manager xem danh sách hồ sơ người dùng: nhân viên, kỹ thuật viên, quản lý. Đổi tên demo `Nguyễn Văn A` thành `Nguyễn Văn An` nếu đang có seed/UI demo này.

### 5.2. Technician

Technician chỉ nên thấy:

- Tổng quan
- Quét QR thiết bị
- Quản lý danh mục và hồ sơ: chỉ cần danh mục thiết bị nếu đang cho xem catalog
- Thiết bị của tôi
- Phiếu yêu cầu liên quan đến mình
- Quản lý bảo trì
  - Bảo trì định kỳ
  - Sửa chữa
  - Nhật ký sửa chữa
- Quản lý kiểm kê
  - Kiểm kê định kỳ
  - Nhật ký kiểm kê
- Thu hủy/đề xuất thu hủy nếu nghiệp vụ giao cho technician cập nhật trạng thái kỹ thuật

Không được xem `Đơn hàng`.

### 5.3. Employee

Employee chỉ nên thấy:

- Tổng quan
- Quét QR thiết bị
- Thiết bị của tôi
- Phiếu yêu cầu của mình

Trong `Thiết bị của tôi`, cuối phần chi tiết thiết bị cần có:

- Tạo yêu cầu sửa chữa, tự động điền mã thiết bị, tên thiết bị, ngày giờ.
- Tạo phiếu tùy chọn `Bàn giao` hoặc `Thu hồi` nếu nghiệp vụ còn cho phép nhân viên khởi tạo yêu cầu này.

Employee không được xem `Đơn hàng`, không được xem toàn bộ phiếu của người khác.

### 5.4. Supplier

Supplier nếu active thì chỉ xem/cập nhật purchase order thuộc chính supplier đó. Không mở quyền xem catalog nội bộ, báo cáo, phân quyền, hồ sơ người dùng.

---

## 6. Module: Quản lý danh mục và hồ sơ

### 6.1. Danh mục vị trí

Field UI:

- `Mã vị trí`
- `Tên vị trí`
- `Mô tả`

Yêu cầu:

- `Mã vị trí` để hệ thống tự tăng, kiểu int/id nội bộ.
- Không bắt người dùng nhập mã thủ công nếu DB dùng auto-increment.
- `Tên vị trí` theo mẫu: `Bàn 1 - Kho tầng 1`, `Kho tầng 1`, `Kho tầng 2`, `Kho tầng 3`, `Khu HR`, `Khu kế toán`, `Khu lễ tân`, `Khu Dự án`.
- Nếu schema hiện tại có `locations.name`, `locations.description`, `locations.address`, `locations.is_active`, UI phải map đúng field.

### 6.2. Danh mục thiết bị

Danh mục thiết bị dropdown gồm:

- `PC`
- `Màn hình`
- `Thiết bị Test`
- `Phụ kiện dùng`
- `Linh kiện thay thế`

Ví dụ `Linh kiện thay thế`: RAM 16GB, SSD, cáp, phụ kiện thay thế.

### 6.3. Nhà cung cấp

Form nhà cung cấp cần có các thông tin đang có trong UI/PDF:

- Mã nhà cung cấp
- Tên nhà cung cấp
- Người liên hệ
- Số điện thoại
- Email
- Địa chỉ
- Ghi chú

Yêu cầu kỹ thuật:

- Audit schema hiện tại trước. Nếu DB đã có field tách riêng `contact_person`, `phone`, `email`, `note`, dùng trực tiếp.
- Nếu schema chỉ có `Contact`, phải quyết định rõ: gộp thông tin liên hệ vào một field hoặc thêm migration nhỏ để tách field. Không tự sửa nửa vời làm UI nhập được nhưng backend không lưu.

### 6.4. Hồ sơ người dùng

Hồ sơ ở đây là **hồ sơ người dùng**, không phải hồ sơ thiết bị.

Nên hiển thị tối thiểu:

- Mã người dùng / mã nhân viên
- Họ và tên
- Email
- Vai trò
- Trạng thái
- Bộ phận / vị trí công việc nếu có

---

## 7. Module: Danh sách thiết bị

### 7.1. Bộ lọc

Bộ lọc chuẩn:

- Danh mục thiết bị
- Trạng thái thiết bị
- Vị trí

Yêu cầu:

- Copy mô tả: `Tra cứu nhanh thiết bị theo danh mục, trạng thái thiết bị và vị trí.`
- Bỏ câu: `Tra cứu nhanh tài sản theo vị trí, người giữ và trạng thái vận hành.`
- `Xóa bộ lọc` nằm ngang hàng với `Lọc`.

### 7.2. Trạng thái thiết bị trong danh sách

Trạng thái chỉ dùng 5 trạng thái UI đã chốt:

- `Sẵn sàng`
- `Đã bàn giao`
- `Đang bảo trì`
- `Đang kiểm kê`
- `Đã thu hủy`

Không hiển thị trạng thái phụ như “chi tiết thu hủy”, “chi tiết bảo trì” cạnh trạng thái nếu bấm không có tác dụng. Nếu cần xem chi tiết thì đặt trong action `Chi tiết`.

---

## 8. Module: Đơn hàng

### 8.1. Tạo đơn hàng

Bước tạo đơn hàng hiện tại chỉ cần:

- `Nhà cung cấp`
- Danh sách thiết bị đặt mua:
  - `Tên thiết bị` hoặc dropdown/search thiết bị/danh mục thiết bị
  - `Đơn vị`
  - `Số lượng`
  - `Ghi chú` nullable
- Nút `Thêm thiết bị`
- Nút `Gỡ thiết bị`

Không bắt buộc ở bước tạo đơn:

- Đơn giá
- Thành tiền
- Phương thức thanh toán

Lý do: giá và thanh toán sẽ nhập/cập nhật sau khi giao hàng thành công, vì có khả năng thiết bị không đạt và hoàn về nhà cung cấp.

### 8.2. Nhập tên thiết bị

Không bắt người dùng tự gõ tên thiết bị từ trí nhớ. Cần có một trong các hướng:

- Searchable select từ danh mục thiết bị/template thiết bị.
- Cho chọn danh mục rồi nhập tên cụ thể.
- Cho gõ autocomplete theo danh sách đã có.

### 8.3. Sau khi tạo đơn hàng

Yêu cầu:

- Hệ thống gửi email/thông báo đơn đặt hàng cho nhà cung cấp dựa trên thông tin liên hệ của supplier.
- Sau khi tạo thành công, hiển thị message rõ: `Đã tạo đơn hàng và gửi thông báo đặt hàng tới nhà cung cấp.`
- Nếu gửi email thất bại nhưng đơn hàng tạo thành công, message phải tách rõ: `Đã tạo đơn hàng nhưng gửi thông báo tới nhà cung cấp thất bại.`

### 8.4. Chi tiết đơn hàng

Table ngoài:

- Chỉ để `Chi tiết` và `Cập nhật trạng thái`.
- `Sửa`/`Hủy` đặt trong màn chi tiết nếu cần.

Màn chi tiết phải hiển thị:

- Thông tin đơn hàng
- Nhà cung cấp
- Trạng thái
- Danh sách thiết bị trong chi tiết đơn hàng
- Đơn vị, số lượng, ghi chú
- Tổng tiền nếu đã cập nhật sau giao hàng
- Action cuối màn: sửa/hủy nếu có quyền

---

## 9. Module: Phiếu yêu cầu và phê duyệt

### 9.1. Loại phiếu hiển thị

Loại phiếu UI:

- `Bàn giao`
- `Thu hồi`
- `Sửa chữa`
- `Thu hủy`

Lưu ý:

- `Thu hủy` không phải do người dùng tạo trực tiếp như một phiếu bình thường.
- `Thu hủy` là **đề xuất thu hủy do hệ thống tự động tạo** khi thiết bị đạt ngưỡng khấu hao từ `>= 75%` hoặc theo rule nghiệp vụ tương ứng.

### 9.2. Review request

Danh sách ngoài:

- Chỉ action `Chi tiết`.

Màn chi tiết:

- Hiển thị người tạo phiếu.
- Hiển thị người duyệt nếu đã duyệt/từ chối.
- Hiển thị thông tin thiết bị liên quan.
- Hiển thị lịch sử xử lý nếu có.
- Chỉ trong chi tiết mới có `Duyệt` và `Từ chối`.

### 9.3. Phiếu sửa chữa sau duyệt

Khi phiếu yêu cầu sửa chữa được duyệt:

- Nó trở thành phiếu sửa chữa.
- Technician không cần nhập lại phiếu sửa chữa từ đầu.
- Phải giữ liên kết ngược về người tạo yêu cầu và người duyệt yêu cầu.
- Technician phụ trách không được để trống.

---

## 10. Module: Bàn giao và thu hồi

### 10.1. Tách bàn giao và thu hồi

Bàn giao và thu hồi phải tách rõ trong UI/logic.

Lý do:

- Bàn giao và thu hồi có dữ liệu giống nhau một phần nhưng không giống hoàn toàn.
- Thu hồi có thêm field bắt buộc: `Tình trạng thiết bị lúc thu hồi`.

### 10.2. Bàn giao

Phiếu bàn giao cần có tối thiểu:

- Người nhận
- Người thực hiện bàn giao
- Ngày bàn giao
- Danh sách thiết bị
- Ghi chú nếu có
- Người phê duyệt nếu workflow có duyệt

Sau khi bàn giao thành công:

- Trạng thái thiết bị: `Đã bàn giao`.

### 10.3. Thu hồi

Phiếu thu hồi cần có tối thiểu:

- Phiếu bàn giao liên quan
- Người trả thiết bị
- Người nhận lại
- Ngày thu hồi
- Lý do thu hồi
- Tình trạng thiết bị lúc thu hồi: bắt buộc, không null
- Người phê duyệt nếu workflow có duyệt

Sau khi thu hồi thành công:

- Không cần trạng thái riêng `Đã thu hồi`.
- Thiết bị quay về `Sẵn sàng` nếu đủ điều kiện nhập kho lại.
- Nếu tình trạng thu hồi là hỏng/nặng, chuyển sang `Đang bảo trì` hoặc tạo luồng sửa chữa tùy rule.

---

## 11. Module: Bảo trì định kỳ và sửa chữa

### 11.1. Tách 2 đề mục

Bắt buộc tách:

- `Bảo trì định kỳ`
- `Sửa chữa`

### 11.2. Bảo trì định kỳ

Yêu cầu:

- Có chức năng `Lập kế hoạch bảo trì định kỳ`.
- Chu kỳ gợi ý: 6 - 12 tháng/lần.
- Form kế hoạch cần có: thiết bị, kỹ thuật viên phụ trách, thời gian dự kiến, nội dung bảo trì, ghi chú.
- Technician phụ trách không được để trống.

### 11.3. Sửa chữa

Nguồn dữ liệu:

- Phiếu sửa chữa sinh ra từ yêu cầu sửa chữa đã được duyệt.

Màn chi tiết sửa chữa cần có:

- Người tạo yêu cầu sửa chữa
- Người duyệt yêu cầu sửa chữa
- Kỹ thuật viên phụ trách
- Thiết bị liên quan
- Mô tả lỗi
- Trạng thái thiết bị
- Nhật ký sửa chữa
- Chi phí nếu có
- Ngày bắt đầu, ngày hoàn thành

### 11.4. Nhật ký sửa chữa

Không nhất thiết tạo một menu độc lập bên ngoài nếu không cần. Ưu tiên:

- Nhật ký sửa chữa nằm trong chi tiết sửa chữa.
- Có thể xem nhật ký sửa chữa từ chi tiết thiết bị.
- Technician có chỗ thêm/cập nhật nhật ký sửa chữa.

Nội dung nhật ký sửa chữa tối thiểu:

- Ngày giờ cập nhật
- Kỹ thuật viên cập nhật
- Lỗi ghi nhận
- Hành động sửa chữa
- Linh kiện/thay thế nếu có
- Chi phí
- Kết quả xử lý
- Trạng thái thiết bị sau sửa

Logic:

- Technician cập nhật **trạng thái thiết bị**, không cập nhật “trạng thái sửa chữa” mơ hồ.
- Khi sửa xong, lần cập nhật cuối của nhật ký sửa chữa đánh dấu kết quả xử lý hoàn tất.

---

## 12. Module: Kiểm kê định kỳ

### 12.1. Lập kế hoạch kiểm kê

Hiện đang thiếu bảng/form tạo kế hoạch kiểm kê. Cần bổ sung UI/logic để:

- Tạo kế hoạch kiểm kê.
- Chọn danh sách thiết bị kiểm kê.
- Chọn kỹ thuật viên/người thực hiện kiểm kê.
- Chọn thời gian kiểm kê.
- Nhập mô tả/nội dung kiểm kê.

### 12.2. Chi tiết kiểm kê

Mỗi thiết bị trong kế hoạch kiểm kê cần có:

- Thiết bị
- Trạng thái hệ thống trước kiểm kê
- Vị trí hệ thống trước kiểm kê
- Trạng thái thực tế
- Vị trí thực tế
- Tình trạng thực tế
- Tỷ lệ khấu hao hiện tại
- Ghi chú
- Người kiểm kê
- Thời gian kiểm kê

### 12.3. Không dùng `Trạng thái kiểm kê` như trạng thái thiết bị chính

Ghi chú từ source: “Làm gì có trạng thái kiểm kê.”

Diễn giải triển khai:

- Không tạo một status thiết bị mơ hồ nếu backend không hỗ trợ.
- Nếu UI cần hiển thị thiết bị đang trong đợt kiểm kê, có thể dùng trạng thái hiển thị `Đang kiểm kê`, nhưng phải map rõ với nghiệp vụ kiểm kê hiện có.
- Kết quả kiểm kê là dữ liệu trong `inventory_checks`/`inventory_check_items`, không thay thế toàn bộ asset status nếu chưa có rule.

### 12.4. Đối chiếu khi kiểm kê

Technician khi kiểm kê cần đối chiếu:

- Thông tin thiết bị
- Nhật ký sửa chữa
- Lịch sử bảo trì
- Vị trí hiện tại
- Tình trạng thực tế
- Tỷ lệ khấu hao

Mục tiêu: đánh giá đúng tình trạng thiết bị và khả năng đề xuất thu hủy.

---

## 13. Module: Thu hủy / Đề xuất thu hủy

### 13.1. Rule thu hủy

Rule chốt:

- Khi khấu hao `>= 75%`, hệ thống tạo/hiển thị `Đề xuất thu hủy`.
- Không dùng ngưỡng `>= 90%`.
- Đề xuất thu hủy do **hệ thống tự động tạo**, không phải do nhân viên tạo thủ công.
- Đề xuất không tự động xóa thiết bị và không tự động hoàn tất thu hủy.

### 13.2. Màn đề xuất thu hủy

Cần hiển thị:

- Mã thiết bị
- Tên thiết bị
- Danh mục
- Vị trí
- Giá mua
- Tỷ lệ khấu hao
- Giá trị còn lại
- Lý do đề xuất
- Trạng thái đề xuất
- Người duyệt nếu đã xử lý

### 13.3. Xử lý sau duyệt

Sau khi manager duyệt thu hủy:

- Cập nhật trạng thái thiết bị thành `Đã thu hủy` hoặc status kỹ thuật tương ứng (`retired`/`disposed` tùy codebase).
- Không cho thiết bị đã thu hủy xuất hiện trong danh sách có thể bàn giao/sửa chữa mới.
- Lưu disposal detail/book value nếu schema hỗ trợ.

---

## 14. Module: Báo cáo

Hiện có lỗi/thiếu:

- Không có dữ liệu nên không xuất được.
- Không có bảng báo cáo hoặc report source chưa đúng.
- Tạo báo cáo/xuất báo cáo không chạy ổn định.
- Các mục báo cáo bên dưới không khớp với phần trên.

Yêu cầu tối thiểu:

1. Có chỗ tạo báo cáo.
2. Có chỗ xuất báo cáo.
3. Báo cáo tình trạng thiết bị.
4. Báo cáo dự đoán/phân tích vòng đời thiết bị.
5. Báo cáo nên gộp logic vào một khu báo cáo thống nhất, không tách nhỏ sai nghiệp vụ.

Dữ liệu báo cáo nên lấy từ:

- `assets`
- `maintenance_events` / `maintenance_details` / `repair_logs`
- `inventory_checks` / `inventory_check_items`
- `purchase_orders` / `purchase_order_items`
- `disposals` / `disposal_details`

---

## 15. Dashboard / Tổng quan

Yêu cầu:

- `Tổng quan` phải nằm đầu sidebar.
- Không đặt tổng quan trong `Báo cáo`.
- Không hiển thị `Sơ đồ chức năng BFD` như một item UI.
- Dashboard cần dùng wording đúng: thiết bị, đơn hàng, yêu cầu chờ duyệt, đề xuất thu hủy, giá trị còn lại, bảo trì/kiểm kê.

---

## 16. Test bắt buộc sau sửa

Chạy tối thiểu:

```bash
npm run check:i18n
npm run build
php artisan test
```

Nếu dùng Docker:

```bash
scripts\docker-start.bat
```

### Test thủ công theo role

#### Manager

- Đăng nhập manager.
- Kiểm tra sidebar đầy đủ và đúng thứ tự.
- Mở Quản lý danh mục và hồ sơ: có Danh mục thiết bị, Danh mục vị trí, Nhà cung cấp, Hồ sơ người dùng.
- Tạo/sửa nhà cung cấp.
- Tạo đơn hàng chỉ với supplier + item + đơn vị + số lượng + ghi chú.
- Cập nhật trạng thái đơn hàng.
- Mở phê duyệt phiếu yêu cầu: ngoài table chỉ có Chi tiết; vào trong mới có Duyệt/Từ chối.
- Kiểm tra đề xuất thu hủy với thiết bị khấu hao >=75%.
- Tạo/xuất báo cáo.

#### Technician

- Đăng nhập technician.
- Không thấy Đơn hàng.
- Thấy Quản lý bảo trì, Quản lý kiểm kê.
- Mở sửa chữa: chỉ thấy phiếu mình phụ trách.
- Cập nhật nhật ký sửa chữa.
- Tạo kế hoạch bảo trì định kỳ.
- Tạo/cập nhật kế hoạch kiểm kê.
- Cập nhật nhật ký kiểm kê.

#### Employee

- Đăng nhập employee.
- Không thấy Đơn hàng, Báo cáo, Phân quyền.
- Chỉ thấy phiếu yêu cầu của mình.
- Mở Thiết bị của tôi.
- Tạo yêu cầu sửa chữa từ thiết bị của tôi; form tự điền mã thiết bị, tên thiết bị, ngày giờ.

---

## 17. Thứ tự triển khai đề xuất

### P0 - Sửa sai nghiệp vụ lộ rõ

1. Sidebar/navigation/RBAC.
2. Đổi wording `tài sản` -> `thiết bị` ở UI active.
3. Sửa Quản lý danh mục và hồ sơ: hồ sơ là hồ sơ người dùng.
4. Sửa trạng thái thiết bị, trạng thái đơn hàng, trạng thái duyệt.
5. Sửa phiếu yêu cầu/phê duyệt: table ngoài chỉ `Chi tiết`, duyệt/từ chối trong detail.

### P1 - Sửa luồng nghiệp vụ chính

1. Đơn hàng: form tạo đơn đúng, cập nhật trạng thái, gửi thông báo nhà cung cấp.
2. Bàn giao/Thu hồi: tách rõ, thêm tình trạng thiết bị lúc thu hồi.
3. Bảo trì/Sửa chữa: tách module, sửa chữa sinh từ request đã duyệt.
4. Nhật ký sửa chữa nằm trong chi tiết sửa chữa/thiết bị.

### P2 - Hoàn thiện kiểm kê, thu hủy, báo cáo

1. Lập kế hoạch kiểm kê.
2. Nhật ký kiểm kê.
3. Đề xuất thu hủy tự động >=75%.
4. Báo cáo tình trạng thiết bị và vòng đời thiết bị.
5. Fix export/tạo báo cáo khi thiếu dữ liệu.

---

## 18. Prompt giao cho AI Agent

```text
Bạn là AI Agent trong repo Mesoco IT Asset Management. Hãy đọc kỹ các file: CLAUDE.md, HANDOVER.md, spec.MD, schema.sql, CHAPTER3_DATABASE_SCHEMA_QUICK_REFERENCE.md, trich_xuat_field_erd_ui_thiet_bi.md, needtofix.pdf, Recording_3.txt.

Nhiệm vụ: audit và sửa UI/nghiệp vụ theo file mesoco_ai_spec_cleaned.md này.

Yêu cầu làm việc:
1. Không code ngay theo cảm tính. Trước tiên audit codebase: routes, controllers, models, pages React, Sidebar, i18n, seed/demo data.
2. Xuất ra plan ngắn: file nào sẽ sửa, sửa gì, module nào bị ảnh hưởng.
3. Sau đó triển khai theo thứ tự P0 -> P1 -> P2.
4. Giữ scope nhỏ, không rewrite migration cũ, không drop bảng/cột lịch sử.
5. Không đưa lại flow mượn/trả cá nhân hoặc QR scan làm workflow chính.
6. UI active dùng từ “Thiết bị”, không dùng “Tài sản” nếu không bắt buộc.
7. Luôn map field UI với schema/model hiện có; nếu thiếu field, ghi rõ cần migration hoặc fallback, không bịa field.
8. Sau khi sửa chạy: npm run check:i18n, npm run build, php artisan test.
9. Cuối cùng xuất báo cáo: đã sửa gì, file nào, test nào pass/fail, còn blocker nào.
10. Không commit/push nếu chưa được yêu cầu.
```
