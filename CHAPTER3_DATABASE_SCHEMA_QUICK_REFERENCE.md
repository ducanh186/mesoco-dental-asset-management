<!-- markdownlint-disable MD060 -->

# Chapter 3 Database Schema Quick Reference

## Mục đích

Tài liệu này tách riêng phần `3.3.2. Các bảng dữ liệu` trong báo cáo thành một format chuẩn hơn để dùng nhanh khi code.

Tài liệu này ưu tiên 3 mục tiêu:

- Đọc nhanh tên bảng, tên field, kiểu dữ liệu và ý nghĩa nghiệp vụ trong báo cáo.
- Đối chiếu sang model hoặc table thực tế trong repo hiện tại.
- Chỉ ra các điểm lệch tên giữa báo cáo và codebase để tránh code nhầm.

## Nguồn

- Nguồn báo cáo đầy đủ: `docs/REPORT_FULL_EXTRACT_CODE_REFERENCE.md`
- Bản spec đã chuẩn hóa scope: `spec.MD`

## Quy ước đọc

- `Field code gần nhất` là mapping best-effort sang model hoặc schema hiện tại trong repo.
- `Legacy` nghĩa là còn tồn tại để tương thích cũ, nhưng không còn là hướng active chính.
- `Active` nghĩa là đang gần với scope quản lý tài sản IT theo phòng ban của repo hơn.
- Có bảng trong báo cáo không map 1:1 với code hiện tại; các chỗ đó được ghi rõ ở cột ghi chú.

## Tổng quan 18 bảng

| STT | Bảng trong báo cáo | Model code gần nhất | Table code gần nhất | Trạng thái | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 3.3.2.1 | Roles | `Role` | `roles` | Active | Khớp tốt |
| 3.3.2.2 | Users | `User` | `users` | Active | Khớp tốt |
| 3.3.2.3 | Categories | `Category` | `categories` | Active | Khớp tốt |
| 3.3.2.4 | Assets | `Asset` | `assets` | Active | Khớp tốt, nhưng status và valuation đã mở rộng |
| 3.3.2.5 | Locations | `Location` | `locations` | Active | Báo cáo tối giản hơn code |
| 3.3.2.6 | Suppliers | `Supplier` | `suppliers` | Active | `Contact` trong báo cáo tách nhỏ hơn trong code |
| 3.3.2.7 | PurchaseOrders | `PurchaseOrder` | `purchase_orders` | Active | Khớp tốt |
| 3.3.2.8 | OrderDetails | `PurchaseOrderItem` | `purchase_order_items` | Active | Lệch tên `Detail` và `Item` |
| 3.3.2.9 | Assignments | `Assignment` hoặc `AssetAssignment` | `assignments` hoặc `asset_assignments` | Mixed | `Assignment` là legacy, `AssetAssignment` gần scope active hơn |
| 3.3.2.10 | AssignmentDetails | `AssignmentDetail` | `assignment_details` | Legacy leaning | Phụ thuộc `Assignment` |
| 3.3.2.11 | Returns | `AssetReturn` | `returns` | Legacy leaning | Tên table generic |
| 3.3.2.12 | ReturnDetails | Không thấy model trực tiếp | Không thấy map 1:1 | Mismatch | Có thể được thay bằng checkin hoặc condition workflow khác |
| 3.3.2.13 | Maintenance | `MaintenanceEvent` | `maintenance_events` | Active | Code dùng event-based workflow |
| 3.3.2.14 | MaintenanceDetails | `MaintenanceDetail` | `maintenance_details` | Active | Khớp tốt |
| 3.3.2.15 | Disposals | `Disposal` | `disposals` | Active | Code có thêm method và book value |
| 3.3.2.16 | DisposalDetails | `DisposalDetail` | `disposal_details` | Active | Khớp tốt |
| 3.3.2.17 | Inventory | `InventoryCheck` | `inventory_checks` | Active | Code dùng check session rõ hơn |
| 3.3.2.18 | InventoryDetails | `InventoryCheckItem` | `inventory_check_items` | Active | Lệch tên `Detail` và `Item` |

## 3.3.2.1 Roles

Code model: `Role`

Code table: `roles`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `RoleID` | `INT` | Khóa chính, tự tăng | `id` | Laravel convention |
| `RoleName` | `NVARCHAR(50)` | Tên vai trò | `name` | Code còn có `code`, `description`, `is_active` |

Ghi chú:

- Báo cáo dùng ví dụ `Admin`, `Staff`.
- Repo active dùng `manager`, `technician`, `employee`, `supplier`.

## 3.3.2.2 Users

Code model: `User`

Code table: `users`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `UserID` | `INT` | Mã định danh người dùng | `id` | PK chuẩn Laravel |
| `Username` | `VARCHAR(50)` | Tên đăng nhập | `username` | Unique login |
| `Password` | `VARCHAR(255)` | Mật khẩu đã mã hóa | `password` | Hash qua auth flow |
| `FullName` | `NVARCHAR(100)` | Họ tên đầy đủ | `full_name` | Code còn có `name` |
| `Email` | `VARCHAR(100)` | Email liên hệ | `email` | Unique theo rule hiện tại nếu có |
| `RoleID` | `INT` | FK sang vai trò | `role_id` | Repo còn hỗ trợ `role` legacy string |

Ghi chú:

- Code hiện tại có thêm `employee_id`, `supplier_id`, `employee_code`, `status`, `must_change_password`.

## 3.3.2.3 Categories

Code model: `Category`

Code table: `categories`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `CategoryID` | `INT` | Mã loại tài sản | `id` | PK |
| `CategoryName` | `NVARCHAR(100)` | Tên loại tài sản | `name` | Ví dụ laptop, monitor |
| `Description` | `NVARCHAR(255)` | Mô tả loại tài sản | `description` | Code còn có `code` |

## 3.3.2.4 Assets

Code model: `Asset`

Code table: `assets`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `AssetID` | `INT` | Mã tài sản duy nhất | `id` | PK |
| `AssetName` | `NVARCHAR(100)` | Tên tài sản | `name` | Code còn có `asset_code` riêng |
| `SerialNumber` | `VARCHAR(50)` | Số serial | `serial_number` | Nên unique nếu có |
| `Model` | `NVARCHAR(100)` | Model sản phẩm | `model` |  |
| `Configuration` | `NVARCHAR(255)` | Cấu hình chi tiết | `configuration` |  |
| `Status` | `VARCHAR(20)` | Trạng thái tài sản | `status` | Tên trạng thái trong code đã chuẩn hóa khác báo cáo |
| `PurchasePrice` | `DECIMAL(18,2)` | Giá mua | `purchase_price` | Repo còn có `purchase_cost` ở một số surface nếu legacy |
| `WarrantyExpiry` | `DATE` | Hết hạn bảo hành | `warranty_expiry` |  |
| `CurrentDepreciationRate` | `FLOAT` | Tỷ lệ khấu hao hiện tại | `current_depreciation_rate` | Repo có thêm các field valuation khác |
| `CategoryID` | `INT` | FK loại tài sản | `category_id` |  |
| `LocationID` | `INT` | FK vị trí | `location_id` |  |

Ghi chú:

- Báo cáo dùng status kiểu `Available`, `Assigned`, `Repairing`, `Disposed`.
- Code active dùng status kiểu `active`, `maintenance`, `off_service`, `retired`.
- Repo hiện có thêm `supplier_id`, `purchase_date`, `useful_life_months`, `salvage_value`, `depreciation_method`, `type`, `category` text, `notes`, `instructions_url`.

## 3.3.2.5 Locations

Code model: `Location`

Code table: `locations`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `LocationID` | `INT` | Mã vị trí | `id` | PK |
| `LocationName` | `NVARCHAR(100)` | Tên vị trí | `name` | Code còn có `code`, `description`, `address`, `is_active` |

## 3.3.2.6 Suppliers

Code model: `Supplier`

Code table: `suppliers`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `SupplierID` | `INT` | Mã nhà cung cấp | `id` | PK |
| `SupplierName` | `NVARCHAR(50)` | Tên đơn vị cung cấp | `name` |  |
| `Contact` | `VARCHAR(50)` | Thông tin liên hệ | `contact_person` | Code tách thêm `phone`, `email` |
| `Address` | `NVARCHAR(255)` | Địa chỉ | `address` | Code còn có `code`, `note` |

## 3.3.2.7 PurchaseOrders

Code model: `PurchaseOrder`

Code table: `purchase_orders`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `OrderID` | `INT` | Mã đơn hàng | `id` | PK |
| `OrderDate` | `DATETIME` | Ngày lập đơn | `order_date` |  |
| `TotalAmount` | `DECIMAL(18,2)` | Tổng giá trị đơn | `total_amount` |  |
| `Status` | `NVARCHAR(50)` | Trạng thái đơn hàng | `status` | Code dùng enum nội bộ như `preparing`, `shipping`, `delivered` |
| `SupplierID` | `INT` | FK nhà cung cấp | `supplier_id` |  |
| `ApprovedBy` | `VARCHAR(20)` | Người phê duyệt đơn | `approved_by_user_id` | FK user trong code |

Ghi chú:

- Repo có thêm `order_code`, `requested_by_user_id`, `expected_delivery_date`, `payment_method`, `note`.

## 3.3.2.8 OrderDetails

Code model: `PurchaseOrderItem`

Code table: `purchase_order_items`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `OrderDetailID` | `INT` | Mã chi tiết đơn mua | `id` | PK |
| `OrderID` | `INT` | FK đơn hàng | `purchase_order_id` |  |
| `AssetID` | `INT` | FK tài sản, có thể để trống | `asset_id` | Nullable trong workflow phù hợp |
| `DeviceName` | `NVARCHAR(200)` | Tên thiết bị trên đơn | `item_name` | Code không dùng `device_name` |
| `Quantity` | `INT` | Số lượng | `qty` |  |
| `UnitPrice` | `DECIMAL(18,2)` | Đơn giá | `unit_price` |  |
| `SubTotal` | Tính toán | Thành tiền | `line_total` | `qty * unit_price` |

Ghi chú:

- Báo cáo gọi là `OrderDetails`, code gọi là `PurchaseOrderItem`.
- Repo có thêm `category_id`, `unit`, `note`.

## 3.3.2.9 Assignments

Code model gần nhất: `Assignment` hoặc `AssetAssignment`

Code table gần nhất: `assignments` hoặc `asset_assignments`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `AssignmentID` | `INT` | Mã phiếu bàn giao | `id` | Cả 2 model đều có PK chuẩn |
| `StaffID` | `INT` | Người nhận tài sản | `staff_id` hoặc `employee_id` | `Assignment` dùng user, `AssetAssignment` dùng employee |
| `AdminID` | `INT` | Người quản lý thực hiện bàn giao | `admin_id` hoặc `assigned_by` | Lệch naming do đổi workflow |
| `AssignDate` | `DATETIME` | Ngày bàn giao | `assign_date` hoặc `assigned_at` |  |
| `Note` | `NVARCHAR(255)` | Ghi chú | `note` |  |
| `ApprovedBy` | `VARCHAR(20)` | Người phê duyệt | `approved_by` | Không thấy field tương đương trực tiếp trong `AssetAssignment` active |

Ghi chú:

- `Assignment` là legacy, gần báo cáo hơn.
- `AssetAssignment` gần scope active theo phòng ban hơn và nên ưu tiên khi code tính năng mới.

## 3.3.2.10 AssignmentDetails

Code model: `AssignmentDetail`

Code table: `assignment_details`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `AssignDetailID` | `INT` | Mã chi tiết bàn giao | `id` | PK |
| `AssignmentID` | `INT` | FK phiếu bàn giao | `assignment_id` |  |
| `AssetID` | `INT` | FK tài sản | `asset_id` |  |

Ghi chú:

- Bảng này gắn chặt với `Assignment` legacy hơn là workflow `AssetAssignment` active.

## 3.3.2.11 Returns

Code model: `AssetReturn`

Code table: `returns`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `ReturnID` | `INT` | Mã phiếu thu hồi | `id` | PK |
| `AssignmentID` | `INT` | FK phiếu bàn giao ban đầu | `assignment_id` |  |
| `StaffID` | `INT` | Nhân viên trả tài sản | `staff_id` |  |
| `AdminID` | `INT` | Người nhận lại tài sản | `admin_id` |  |
| `ReturnDate` | `DATETIME` | Ngày thu hồi | `return_date` |  |
| `Reason` | `NVARCHAR(255)` | Lý do thu hồi | `reason` |  |
| `ApprovedBy` | `VARCHAR(20)` | Người phê duyệt | `approved_by` |  |

Ghi chú:

- Model tên `AssetReturn`, nhưng table giữ tên generic `returns`.
- Workflow active có thể nghiêng sang lifecycle khác thay vì dùng return phiếu cũ làm trung tâm.

## 3.3.2.12 ReturnDetails

Code model: không thấy model trực tiếp khớp 1:1

Code table: không thấy map trực tiếp rõ ràng

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `ReturnDetailID` | `INT` | Mã chi tiết thu hồi | `id` | Không thấy model trực tiếp |
| `ReturnID` | `INT` | FK phiếu thu hồi | `return_id` | Không thấy field rõ ràng trong model riêng |
| `AssetID` | `INT` | FK tài sản | `asset_id` | Có thể rơi vào workflow khác |
| `ConditionOnReturn` | `NVARCHAR(255)` | Tình trạng tài sản lúc trả | `condition`, `status` hoặc `condition_note` | Chỉ là best-effort mapping |
| `Note` | `NVARCHAR(255)` | Ghi chú | `note` | Có thể nằm trong event/log khác |

Ghi chú:

- Repo không có model `ReturnDetail` rõ ràng.
- Khi code, cần kiểm tra kỹ xem use case này đã được hấp thụ sang `AssetCheckin`, maintenance, hoặc inventory workflow hay chưa.

## 3.3.2.13 Maintenance

Code model: `MaintenanceEvent`

Code table: `maintenance_events`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `MaintenanceID` | `INT` | Mã đợt bảo trì | `id` | PK |
| `TechnicianID` | `INT` | Kỹ thuật viên phụ trách | `technician_user_id` |  |
| `StartDate` | `DATETIME` | Bắt đầu bảo trì | `started_at` | Báo cáo đơn giản hơn code |
| `EndDate` | `DATETIME` | Hoàn thành bảo trì | `completed_at` |  |
| `TotalCost` | `DECIMAL(18,2)` | Tổng chi phí | `total_cost` |  |
| `ApprovedBy` | `VARCHAR(20)` | Người phê duyệt | `approved_by_user_id` |  |

Ghi chú:

- Code là event-based workflow với `type`, `status`, `priority`, `scheduled_date`, `canceled_at`, `canceled_reason`, `note`.
- Báo cáo thiên về cấu trúc chi phí và thời gian.

## 3.3.2.14 MaintenanceDetails

Code model: `MaintenanceDetail`

Code table: `maintenance_details`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `MaintDetailID` | `INT` | Mã chi tiết bảo trì | `id` | PK |
| `MaintenanceID` | `INT` | FK đợt bảo trì | `maintenance_event_id` |  |
| `AssetID` | `INT` | FK tài sản | `asset_id` |  |
| `Issue` | `NVARCHAR(255)` | Mô tả lỗi | `issue_description` |  |
| `Action` | `NVARCHAR(255)` | Cách xử lý | `action_taken` |  |
| `Cost` | `DECIMAL(18,2)` | Chi phí sửa chữa cho dòng này | `cost` |  |

Ghi chú:

- Code còn có `qty`, `technician_user_id`, `supplier_id`, `status`, `started_at`, `completed_at`, `logged_at`.

## 3.3.2.15 Disposals

Code model: `Disposal`

Code table: `disposals`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `DisposalID` | `INT` | Mã phiếu thanh lý hoặc thu hủy | `id` | PK |
| `AdminID` | `INT` | Người lập phiếu | `disposed_by_user_id` |  |
| `DisposalDate` | `DATETIME` | Ngày thực hiện disposal | `disposed_at` |  |
| `TotalValue` | `DECIMAL(18,2)` | Giá trị thu hồi | `proceeds_amount` |  |
| `Notes` | `NVARCHAR(255)` | Ghi chú lý do hoặc phương thức | `note` |  |
| `ApprovedBy` | `VARCHAR(20)` | Người phê duyệt | `approved_by_user_id` |  |

Ghi chú:

- Code có thêm `code`, `asset_id`, `method`, `reason`, `asset_book_value`.
- Báo cáo thiên hướng multi-asset disposal kết hợp với `DisposalDetails`.

## 3.3.2.16 DisposalDetails

Code model: `DisposalDetail`

Code table: `disposal_details`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `DisposalDetailID` | `INT` | Mã chi tiết thu hủy | `id` | PK |
| `DisposalID` | `INT` | FK phiếu disposal | `disposal_id` |  |
| `AssetID` | `INT` | FK tài sản bị disposal | `asset_id` |  |

Ghi chú:

- Code còn có `condition_summary`, `asset_book_value`, `proceeds_amount`, `processed_at`, `note`.

## 3.3.2.17 Inventory

Code model: `InventoryCheck`

Code table: `inventory_checks`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `CheckID` | `INT` | Mã đợt kiểm kê | `id` | PK |
| `StartDate` | `DATETIME` | Ngày bắt đầu kiểm kê | `check_date` | Code còn có `completed_at` riêng |
| `TechnicianID` | `INT` | Người phụ trách đợt kiểm kê | `created_by_user_id` | Best-effort mapping |
| `ApprovedBy` | `VARCHAR(20)` | Người phê duyệt kết quả | `completed_by_user_id` | Best-effort mapping |

Ghi chú:

- Code có thêm `code`, `title`, `status`, `completed_at`, `location`, `note`.
- Báo cáo không tách rõ creator và completer như code.

## 3.3.2.18 InventoryDetails

Code model: `InventoryCheckItem`

Code table: `inventory_check_items`

| Field báo cáo | Kiểu dữ liệu | Ý nghĩa trong báo cáo | Field code gần nhất | Ghi chú map |
| --- | --- | --- | --- | --- |
| `InvDetailID` | `INT` | Mã chi tiết kiểm kê | `id` | PK |
| `CheckID` | `INT` | FK đợt kiểm kê | `inventory_check_id` |  |
| `AssetID` | `INT` | FK tài sản được kiểm | `asset_id` |  |
| `StatusInReality` | `NVARCHAR(100)` | Tình trạng thực tế | `actual_status` |  |
| `Note` | `NVARCHAR(255)` | Ghi chú sai lệch hoặc hiện trạng | `note` |  |

Ghi chú:

- Code mở rộng hơn nhiều: `expected_status`, `expected_location`, `actual_location`, `result`, `condition_note`, `counted_by_user_id`, `checked_at`.
- Đây là một trong những bảng nên ưu tiên nhìn vào code schema thực tế khi implement vì báo cáo mô tả quá gọn.

## Ghi chú tổng hợp để code nhanh

| Nhóm | Nên ưu tiên dùng | Tránh hiểu nhầm |
| --- | --- | --- |
| Asset lifecycle | `Asset`, `MaintenanceEvent`, `InventoryCheck`, `Disposal` | Không chỉ bám vào ERD status cũ trong báo cáo |
| Purchase | `PurchaseOrder`, `PurchaseOrderItem` | Báo cáo gọi `OrderDetails`, repo gọi `Item` |
| Handover | `AssetAssignment` cho scope active | `Assignment` gần báo cáo hơn nhưng nghiêng legacy |
| Return | `AssetReturn` để đọc legacy flow | `ReturnDetails` không có map 1:1 rõ ràng |
| Inventory | `InventoryCheckItem` | Báo cáo đơn giản hóa phần discrepancy |
| Requests | `AssetRequest` | Không có trong Chương 3 schema cổ điển nhưng là module active của repo |

## Khi dùng tài liệu này

- Nếu đang code đúng theo repo hiện tại, ưu tiên field và enum trong model hoặc migration thực tế.
- Nếu đang viết phần báo cáo, demo, hoặc tài liệu nghiệp vụ, ưu tiên tên và mô tả trong cột `Field báo cáo`.
- Khi hai bên khác nhau, dùng phần ghi chú để quyết định đang bám `legacy` hay `active scope`.
