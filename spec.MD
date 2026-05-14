# Mesoco IT Asset Management Spec

## 1. Mục đích

Tài liệu này là bản đặc tả phục vụ triển khai code, được chắt lọc từ file luận văn đã trích xuất và chuẩn hóa lại theo phạm vi đang active của repository này.

Mục tiêu của tài liệu:

- Giữ lại các yêu cầu nghiệp vụ có ích cho backend, frontend, database và test.
- Loại bỏ các phần mang tính trình bày học thuật hoặc các đoạn bị lệch scope trong file nguồn.
- Chốt rõ những gì được phép code và những gì tuyệt đối không đưa lại.

## 2. Nguồn và nguyên tắc chuẩn hóa

### Nguồn gốc

- Nguồn nghiệp vụ chính: luận văn "Xây dựng phần mềm quản lý tài sản thiết bị IT tại Công ty Cổ phần Công nghệ và Giải pháp Mesoco".
- Nguồn ràng buộc triển khai: quy ước hiện tại của repository Mesoco IT Asset Management.

### Chuẩn hóa khi đưa vào spec code

- Vai trò chuẩn trong codebase: `manager`, `technician`, `employee`, `supplier`.
- Phạm vi active là quản lý tài sản IT theo phòng ban, không phải mô hình mượn/trả cá nhân.
- Các đoạn trong file nguồn bị nhiễu hoặc lệch domain không được dùng để triển khai.
- Các route hoặc API legacy ngoài phạm vi active phải tiếp tục trả `410 Gone`.

## 3. Phạm vi sản phẩm

### In scope

- Quản lý danh mục và hồ sơ tài sản IT.
- Quản lý theo phòng ban, vị trí, nhà cung cấp và người chịu trách nhiệm.
- Mua sắm và theo dõi đơn hàng thiết bị.
- Bàn giao, thu hồi nội bộ và tái phân bổ tài sản theo phòng ban.
- Bảo trì, sửa chữa, kiểm tra định kỳ và lưu lịch sử bảo trì.
- Kiểm kê tài sản và ghi nhận chênh lệch thực tế.
- Tính toán giá trị, khấu hao, bảo hành, vòng đời tài sản.
- Thu hủy, thanh lý, off-service và lưu hồ sơ disposal.
- Yêu cầu nội bộ liên quan đến tài sản hoặc vật tư/tiêu hao theo các loại request hiện đang active.
- Báo cáo, thống kê, dashboard và RBAC.

### Out of scope

- Flow mượn/trả tài sản cá nhân kiểu thư viện thiết bị.
- Trang lịch sử tài sản cá nhân độc lập ngoài luồng quản lý theo phòng ban.
- Giao diện hoặc nghiệp vụ "available for loan".
- Scanner/QR là công cụ phụ trợ, không phải workflow chính.
- CRUD hợp đồng nhân viên.
- Các màn hình hoặc thuật ngữ từ domain khác xuất hiện sai trong tài liệu nguồn.

## 4. Bài toán nghiệp vụ

Mesoco có số lượng tài sản và thiết bị IT ngày càng tăng như laptop, desktop, màn hình, máy in, thiết bị mạng, server và phụ kiện. Việc quản lý thủ công bằng bảng tính hoặc giấy tờ gây khó khăn trong theo dõi trạng thái tài sản, lịch sử bàn giao, bảo trì, kiểm kê, khấu hao và xử lý thất thoát.

Hệ thống cần số hóa vòng đời tài sản IT từ lúc mua sắm, nhập kho, gán mã nhận diện, bàn giao cho bộ phận sử dụng, bảo trì, kiểm kê, tái phân bổ, đến thu hủy hoặc thanh lý.

## 5. Vai trò và quyền hạn

### `manager`

- Quản lý danh mục, nhà cung cấp, cấu hình metadata.
- Tạo và phê duyệt đơn mua sắm.
- Phê duyệt bàn giao, thu hồi, bảo trì, disposal, kiểm kê.
- Xem báo cáo, thống kê, dashboard.
- Quản lý người dùng và phân quyền theo phạm vi hệ thống cho phép.

### `technician`

- Tiếp nhận và xử lý các nghiệp vụ vận hành tài sản.
- Thực hiện bàn giao vật lý, thu hồi, kiểm kê, bảo trì, sửa chữa.
- Cập nhật tình trạng kỹ thuật, chi phí, kết quả xử lý.
- Hỗ trợ gắn mã tài sản, QR identity, cập nhật hồ sơ tài sản.

### `employee`

- Xem tài sản thuộc phòng ban hoặc phần tài sản liên quan được cấp quyền.
- Gửi yêu cầu hợp lệ theo loại request đang active.
- Theo dõi tình trạng xử lý yêu cầu.
- Xem thông tin bàn giao hoặc thu hồi liên quan đến mình khi được hệ thống hỗ trợ.

### `supplier`

- Chỉ xem và cập nhật các purchase order thuộc chính supplier đó.
- Cập nhật trạng thái cung ứng, giao hàng hoặc phản hồi đơn hàng theo quyền được cấp.

## 6. Các module chức năng cần code

### 6.1. Asset Catalog

Hệ thống phải quản lý hồ sơ tài sản tập trung, tối thiểu gồm:

- Mã tài sản hoặc asset tag.
- Tên tài sản.
- Loại phân loại theo `category`.
- Serial number, model, cấu hình.
- Nhà cung cấp, ngày mua, giá mua.
- Hạn bảo hành.
- Phòng ban, vị trí, người hoặc bộ phận đang chịu trách nhiệm.
- Trạng thái sử dụng.
- Thông tin giá trị còn lại, useful life, salvage value, depreciation nếu schema hiện tại đã hỗ trợ.
- QR identity nếu module QR đang được sử dụng.

Quy tắc:

- `assets.type` giữ enum generic; phân loại IT phải đi qua `category`.
- Mỗi tài sản cần có mã định danh duy nhất.
- Serial number nên là duy nhất khi có giá trị.
- Không tạo song song hai hệ quản lý tài sản khác nhau cho cùng một nghiệp vụ.

### 6.2. Purchase Orders

Hệ thống phải hỗ trợ:

- Tạo purchase order theo supplier.
- Quản lý danh sách item trong đơn hàng.
- Theo dõi ngày tạo, tổng tiền, trạng thái xử lý, người phê duyệt.
- Ghi nhận kết quả nhập hàng.
- Từ đơn hàng đã nhận, cho phép khởi tạo tài sản mới vào kho với hồ sơ đầy đủ.

Quy tắc:

- Chỉ `manager` hoặc vai trò tương đương trong policy được tạo hoặc phê duyệt purchase order.
- `supplier` chỉ thấy đơn thuộc chính supplier của họ.
- Khi hàng về và được nhập kho, asset record phải được tạo hoặc cập nhật theo item thực nhận.

### 6.3. Department Handover and Recovery

Hệ thống phải hỗ trợ:

- Bàn giao tài sản cho phòng ban hoặc cá nhân đại diện theo quy trình nội bộ.
- Ghi nhận phiếu bàn giao, người nhận, người thực hiện, thời điểm, ghi chú, người phê duyệt.
- Thu hồi tài sản khi thôi dùng, đổi bộ phận, nghỉ việc hoặc tái phân bổ.
- Sau thu hồi, tài sản quay về trạng thái sẵn sàng tái phân bổ hoặc chờ xử lý tiếp theo.

Quy tắc:

- Đây là luồng quản lý nội bộ theo phòng ban, không phải tính năng mượn/trả cá nhân kiểu loan system.
- Khi asset bị thu hồi, thông tin assignee hiện tại phải được xóa hoặc cập nhật đúng mô hình dữ liệu hiện có.
- Không cho bàn giao tài sản đã disposed hoặc đang ở trạng thái không khả dụng.

### 6.4. Maintenance

Hệ thống phải hỗ trợ:

- Tạo và theo dõi maintenance event.
- Ghi nhận technician phụ trách, thời gian bắt đầu, thời gian hoàn thành, chi phí, người phê duyệt.
- Lưu maintenance details cho từng tài sản hoặc từng lỗi cụ thể.
- Chuyển trạng thái tài sản trong quá trình sửa chữa.
- Hỗ trợ bảo trì định kỳ và sửa chữa phát sinh.

Quy tắc:

- Asset đang bảo trì không được bàn giao mới trừ khi hoàn tất xử lý.
- Chi phí sửa chữa phải được lưu để phục vụ báo cáo và đánh giá TCO.
- Lịch sử maintenance không được ghi đè; cần theo hướng append-only theo event.

### 6.5. Inventory and Valuation

Hệ thống phải hỗ trợ:

- Tạo đợt kiểm kê.
- Giao technician phụ trách và manager phê duyệt kết quả.
- Ghi nhận từng item kiểm kê: có mặt, thiếu, hỏng, sai vị trí, sai trạng thái hoặc chênh lệch dữ liệu.
- Cập nhật giá trị tài sản, khấu hao và trạng thái sau kiểm kê khi có rule tương ứng.

Quy tắc:

- Kiểm kê là snapshot nghiệp vụ, không được sửa phá lịch sử đợt kiểm kê cũ.
- Mọi chênh lệch giữa dữ liệu hệ thống và thực tế phải được lưu vết.
- Kết quả kiểm kê có thể là đầu vào cho maintenance, reassignment hoặc disposal.

### 6.6. Disposal and Off-service

Hệ thống phải hỗ trợ:

- Tạo phiếu disposal hoặc off-service.
- Ghi nhận người lập, ngày disposal, tổng giá trị thu hồi nếu có, ghi chú, người phê duyệt.
- Gắn các asset nằm trong disposal detail.
- Cập nhật trạng thái cuối cùng của tài sản và dừng vòng đời active.

Quy tắc:

- Thiết bị quá cũ, hỏng nặng hoặc không còn giá trị sử dụng có thể vào diện disposal.
- Nếu doanh nghiệp dùng ngưỡng khấu hao để đề xuất disposal, ngưỡng mặc định từ tài liệu nguồn là `>= 75%`.
- Asset đã disposed không được xuất hiện như tài sản có thể bàn giao hoặc sửa chữa tiếp.

### 6.7. Requests

Hệ thống phải hỗ trợ các request nội bộ đang active trong codebase.

Ràng buộc hiện tại:

- Request active chỉ gồm `JUSTIFICATION` và `CONSUMABLE_REQUEST`.
- Không tự ý mở thêm request type mới chỉ vì trong luận văn có mô tả chung về incident hoặc repair request.

Hướng xử lý:

- Nếu nghiệp vụ là xin cấp mới, giải trình, đề xuất điều chuyển hoặc nhu cầu liên quan tài sản thì đi qua `JUSTIFICATION` nếu schema hiện tại đang dùng kiểu này.
- Nếu nghiệp vụ là vật tư, tiêu hao hoặc phụ kiện thì dùng `CONSUMABLE_REQUEST`.
- Nếu phát sinh hỏng hóc thiết bị, ưu tiên nối vào workflow maintenance hiện có thay vì tạo subsystem request mới.

### 6.8. Reports and Dashboard

Tối thiểu cần hỗ trợ các chỉ số sau:

- Tổng số tài sản đang active.
- Tài sản đang sử dụng, đang bảo trì, chờ thu hồi, chờ disposal, đã disposal.
- Tài sản theo phòng ban, category, supplier, location.
- Chi phí bảo trì theo thời gian.
- Tình trạng bảo hành, khấu hao, useful life.
- Lịch sử bàn giao theo nhân sự hoặc phòng ban.
- Kết quả kiểm kê và chênh lệch.

## 7. Mô hình dữ liệu cốt lõi cho code

Spec này không ép tạo lại schema từ đầu; ưu tiên bám vào các model và migration đã có trong repo.

### Nhóm danh mục và quyền

- `Role`: mã vai trò, tên vai trò.
- `User`: tài khoản, thông tin liên hệ, vai trò, trạng thái hoạt động.
- `Category`: phân loại tài sản IT.
- `Location`: vị trí vật lý hoặc logical placement.
- `Supplier`: nhà cung cấp và thông tin liên hệ.

### Nhóm asset lifecycle

- `Asset`: thực thể trung tâm của hệ thống.
- `AssetQrIdentity`: ánh xạ asset với QR identity.
- `AssetAssignment` hoặc `Assignment` cùng `AssignmentDetail`: bàn giao và chi tiết bàn giao.
- `AssetCheckin` hoặc `AssetReturn`: thu hồi hoặc nhận lại tài sản theo mô hình hiện hữu.
- `MaintenanceEvent` cùng `MaintenanceDetail`: sự kiện bảo trì.
- `InventoryCheck` cùng `InventoryCheckItem`: đợt kiểm kê.
- `Disposal` cùng `DisposalDetail`: thu hủy, thanh lý, off-service.

### Nhóm mua sắm và request

- `PurchaseOrder` cùng các dòng chi tiết đơn hàng.
- `AssetRequest`: yêu cầu nội bộ.
- `Approval`: dữ liệu phê duyệt hoặc dấu vết duyệt nếu hệ thống đã dùng bảng riêng.

### Thuộc tính nghiệp vụ tối thiểu cần có ở asset

- Mã định danh nội bộ.
- Tên tài sản.
- Category.
- Model và serial number.
- Configuration.
- Supplier.
- Purchase date và purchase cost.
- Warranty expiry.
- Department hoặc owner scope hiện tại.
- Location.
- Status.
- Useful life, salvage value, depreciation, book value nếu hệ hiện tại đã hỗ trợ.

## 8. Quy tắc nghiệp vụ quan trọng

### Nhận diện và tính duy nhất

- Asset code phải unique.
- QR identity phải unique nếu được bật.
- Serial number nên unique hoặc được validate để tránh trùng thiết bị vật lý.

### Trạng thái tài sản

Tập trạng thái cụ thể phải bám schema hiện có, nhưng nghiệp vụ tối thiểu phải phân biệt được:

- Trong kho hoặc sẵn sàng cấp phát.
- Đang sử dụng hoặc đã bàn giao.
- Đang bảo trì hoặc sửa chữa.
- Chờ thu hồi hoặc đang kiểm kê nếu workflow yêu cầu.
- Chờ disposal hoặc đã off-service.
- Đã disposal hoặc thanh lý.

### Chuyển trạng thái hợp lệ

- Nhập mới -> sẵn sàng cấp phát.
- Bàn giao hợp lệ -> đang sử dụng.
- Thu hồi hợp lệ -> sẵn sàng cấp phát hoặc chờ xử lý.
- Gửi bảo trì -> đang bảo trì.
- Hoàn tất bảo trì -> quay lại trạng thái khả dụng phù hợp.
- Phê duyệt disposal -> disposed hoặc off-service.

### Approval và audit

- Các nghiệp vụ có tác động lớn như purchase order, handover, disposal, inventory result, maintenance cost cần có người phê duyệt hoặc ít nhất có audit trail rõ ràng.
- Không cập nhật phá hủy lịch sử các event nghiệp vụ chính.

### Department-first

- Mọi nghiệp vụ phải ưu tiên nhìn theo phòng ban sở hữu hoặc phòng ban sử dụng.
- Không xây feature theo logic cá nhân hóa hoàn toàn tách khỏi department ownership.

## 9. Yêu cầu phi chức năng

### Hiệu năng

- Dashboard, tra cứu asset, lọc danh mục, xem chi tiết asset và listing lớn phải phản hồi đủ nhanh cho vận hành nội bộ.
- Các tác vụ thống kê hoặc xuất báo cáo nên có phân trang, filter và query tối ưu.

### Bảo mật

- Bắt buộc xác thực và phân quyền theo role.
- Dữ liệu supplier phải được giới hạn theo đúng supplier.
- Không lộ dữ liệu tài sản hoặc purchase order vượt quá phạm vi vai trò.
- Nên có log thao tác cho các thay đổi nhạy cảm.

### Độ tin cậy

- Không làm mất dữ liệu lịch sử bảo trì, kiểm kê, bàn giao, disposal.
- Các thao tác nghiệp vụ nhiều bảng nên đảm bảo transaction khi cần.

### Dễ dùng

- Giao diện ưu tiên thao tác nhanh cho quản lý và kỹ thuật viên.
- Trạng thái, nhãn, bộ lọc và thông báo cần rõ ràng, dễ hiểu.

### Khả năng mở rộng

- Không hard-code logic chỉ cho một loại tài sản duy nhất.
- Giữ kiến trúc đủ mở để bổ sung metadata, báo cáo hoặc automation sau này.

## 10. Mapping với codebase hiện tại

### Backend controllers active

- `AssetController`: asset catalog, metadata, category, supplier, department handover-related surfaces.
- `MaintenanceEventController`: maintenance event và chi tiết.
- `InventoryController`: kiểm kê, valuation, warranty.
- `PurchaseOrderController`: đơn hàng và supplier scope.
- `RequestController` và `ReviewRequestController`: request và approval flow.
- `DisposalController`: disposal và off-service.

### Backend models cần ưu tiên tái sử dụng

- `Asset`, `Category`, `Location`, `Employee`, `Supplier`.
- `Assignment`, `AssignmentDetail`, `AssetAssignment`, `AssetCheckin`, `AssetReturn`.
- `MaintenanceEvent`, `MaintenanceDetail`.
- `InventoryCheck`, `InventoryCheckItem`.
- `Disposal`, `DisposalDetail`.
- `AssetRequest`, `Approval`, `AssetQrIdentity`.

### Frontend

- Trang active nằm trong `resources/js/pages`.
- Điều hướng chính nằm trong `resources/js/layouts/Sidebar.jsx`.
- Nếu thêm hoặc đổi text phải cập nhật i18n trong `resources/js/i18n/locales`.

## 11. Guardrails khi code

- Không drop migration cũ hoặc xóa bảng lịch sử nếu không có kế hoạch migration riêng.
- Không đưa lại personal borrow hoặc return flow.
- Không đổi semantics của legacy route đang phải trả `410 Gone`.
- Không thêm request type mới nếu chưa thống nhất schema và UI.
- Không tạo UI hoặc wording demo lệch sang domain khác.

## 12. Acceptance criteria tối thiểu

Một increment được coi là bám spec khi đáp ứng được các điểm sau:

- Có thể tạo và quản lý asset với metadata IT cốt lõi.
- Có thể mua sắm và theo dõi purchase order theo supplier.
- Có thể bàn giao, thu hồi và tái phân bổ tài sản theo workflow nội bộ.
- Có thể tạo maintenance event và lưu chi phí, kết quả xử lý.
- Có thể tạo đợt kiểm kê và ghi nhận discrepancy cho từng asset.
- Có thể đưa asset vào disposal hoặc off-service và khóa các thao tác không còn hợp lệ.
- Có thể phân quyền rõ giữa `manager`, `technician`, `employee`, `supplier`.
- Có dashboard hoặc report phản ánh tình trạng tài sản và vận hành.
- Không tái đưa vào code các flow bị loại khỏi scope.

## 13. Checklist verify sau khi sửa code

Sau mỗi thay đổi liên quan spec này, dùng bộ kiểm tra chuẩn của repo:

```bash
npm run check:i18n
npm run build
php artisan test
```

Nếu chỉ sửa tài liệu thì không cần chạy full suite, nhưng mọi thay đổi code bám theo spec này phải được verify theo ba bước trên hoặc subset hẹp hơn nếu có lý do rõ ràng.
