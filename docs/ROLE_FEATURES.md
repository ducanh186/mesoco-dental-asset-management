# Tính năng theo vai trò

Hệ thống hiện dùng 4 vai trò chuẩn:

- `manager`
- `technician`
- `doctor`
- `employee`

Các role cũ như `admin`, `hr`, `staff` chỉ còn là alias để tương thích dữ liệu cũ và sẽ được chuẩn hóa về 4 role trên khi lưu xuống database.

## 1. Nguyên tắc nghiệp vụ

- Không còn khái niệm “nhân sự” là một nhóm chức năng độc lập trong phạm vi DFD mức 0.
- `manager` thay cho `admin` cũ ở các tác vụ phê duyệt, báo cáo và quản trị quyền.
- `technician` giữ toàn bộ quyền vận hành mà trước đây nhóm hành chính/nhân sự cũ dùng để quản lý danh mục, tài sản, bảo trì và thu hủy.
- `doctor` và `employee` là nhóm người dùng đầu cuối, chỉ làm việc với tài sản được giao và yêu cầu của chính họ.

## 2. Bảng tổng quan

| Chức năng | Manager | Technician | Doctor | Employee |
| --- | :---: | :---: | :---: | :---: |
| Xem và cập nhật hồ sơ cá nhân | ✅ | ✅ | ✅ | ✅ |
| Xem tài sản cá nhân | ✅ | ✅ | ✅ | ✅ |
| Quét QR và check-in/check-out | ✅ | ✅ | ✅ | ✅ |
| Tạo yêu cầu báo sự cố | ✅ | ✅ | ✅ | ✅ |
| Tạo yêu cầu mượn thiết bị | ✅ | ✅ | ✅ | ✅ |
| Tạo yêu cầu vật tư | ✅ | ✅ | ✅ | ✅ |
| Xem và hủy yêu cầu của chính mình | ✅ | ✅ | ✅ | ✅ |
| Xem toàn bộ yêu cầu vận hành | ✅ | ✅ | ❌ | ❌ |
| Duyệt yêu cầu | ✅ | ❌ | ❌ | ❌ |
| Chỉ định kỹ thuật viên cho phiếu sự cố | ✅ | ❌ | ❌ | ❌ |
| Quản lý tài sản, vị trí, tồn kho | ✅ | ✅ | ❌ | ❌ |
| Phân công và thu hồi tài sản | ✅ | ✅ | ❌ | ❌ |
| Quản lý bảo trì/sửa chữa | ✅ | ✅ | ❌ | ❌ |
| Khóa/mở thiết bị off-service | ✅ | ✅ | ❌ | ❌ |
| Quản lý thu hủy/thanh lý | ✅ | ✅ | ❌ | ❌ |
| Xem báo cáo và thống kê | ✅ | ❌ | ❌ | ❌ |
| Đổi role người dùng | ✅ | ❌ | ❌ | ❌ |
| Xóa tài khoản người dùng | ✅ | ❌ | ❌ | ❌ |

## 3. Manager

`manager` là vai trò điều phối nghiệp vụ cấp cao.

Quyền chính:

- Duyệt hoặc từ chối request trong hàng chờ.
- Khi duyệt phiếu `JUSTIFICATION`, bắt buộc chỉ định kỹ thuật viên.
- Tự động sinh ticket bảo trì/sửa chữa từ phiếu sự cố đã duyệt.
- Xem báo cáo tổng hợp tài sản, request, bảo trì, thu hủy.
- Quản lý role tài khoản.
- Truy cập toàn bộ phân hệ vận hành như technician.

Manager là người chịu trách nhiệm ở bước giữa trong luồng:

`nhân viên / bác sĩ -> quản lý -> kỹ thuật viên`

## 4. Technician

`technician` là vai trò vận hành chính ở backend sau lần refactor này.

Quyền chính:

- Quản lý danh mục và hồ sơ tài sản:
  - tài sản
  - vị trí
  - tồn kho
  - QR
- Phân công và thu hồi tài sản.
- Tạo và cập nhật sự kiện bảo trì.
- Bắt đầu, hoàn thành, hủy bảo trì.
- Khóa và mở tài sản ở trạng thái off-service.
- Thực hiện thu hủy/thanh lý.
- Xem danh sách yêu cầu để phối hợp xử lý.

Giới hạn:

- Không được duyệt request.
- Không được xem báo cáo tổng hợp.
- Không được đổi role hoặc xóa user.

## 5. Doctor

`doctor` là người dùng đầu cuối trong khối chuyên môn.

Quyền chính:

- Xem tài sản được giao.
- Quét QR để xem tình trạng thiết bị.
- Check-in/check-out tài sản theo ca.
- Gửi phiếu báo sự cố cho thiết bị mình đang dùng.
- Gửi phiếu mượn thiết bị.
- Gửi phiếu xin vật tư tiêu hao.
- Theo dõi trạng thái request của mình.

Giới hạn:

- Không truy cập danh mục tổng.
- Không phân công tài sản cho người khác.
- Không thao tác bảo trì, thu hủy, báo cáo.

## 6. Employee

`employee` có quyền gần giống `doctor`, khác nhau chủ yếu ở ngữ cảnh nghiệp vụ và vị trí công việc.

Quyền chính:

- Xem tài sản cá nhân.
- Quét QR và check-in/check-out.
- Gửi request của mình.
- Theo dõi hoặc hủy request khi còn hợp lệ.
- Cập nhật hồ sơ cá nhân.

## 7. Các phân hệ theo DFD mức 0

### 7.1 Quản lý danh mục và hồ sơ

- Manager: toàn quyền
- Technician: toàn quyền vận hành
- Doctor/Employee: không truy cập phân hệ quản trị

### 7.2 Quản lý cấp phát

- Doctor/Employee: tạo request
- Manager: duyệt request
- Technician: thực hiện cấp phát và xử lý phần vận hành phía sau

### 7.3 Quản lý bảo trì sửa chữa

- Doctor/Employee: báo sự cố
- Manager: duyệt và điều phối
- Technician: xử lý ticket bảo trì/sửa chữa

### 7.4 Quản lý thu hủy

- Manager và Technician có quyền vận hành.
- Doctor/Employee không trực tiếp thao tác.

### 7.5 Báo cáo và thống kê

- Chỉ `manager` được truy cập.

## 8. Lưu ý về module cũ

Trong repo vẫn còn một số phần cũ như `feedback`, `contracts`, `employees` để giữ tương thích dữ liệu hoặc phục vụ nội bộ. Tuy nhiên luồng sản phẩm chính hiện được chốt theo 5 phân hệ ở trên.

## 9. Tài liệu liên quan

- [Mục lục tài liệu](README.md)
- [Ma trận phân quyền API](RBAC_MATRIX.md)
- [Checklist nghiệm thu](feat_role.md)
