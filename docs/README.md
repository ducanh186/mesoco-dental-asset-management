# Bộ tài liệu dự án

Thư mục `docs/` là nguồn tài liệu chính của repo. Toàn bộ file `.md` trong thư mục này đã được cập nhật theo scope mới nhất.

## 1. Phạm vi nghiệp vụ

Sản phẩm hiện tập trung vào 4 nghiệp vụ chính:

1. Cấp phát / đơn hàng
2. Bảo trì
3. Thu hủy
4. Kiểm kê

Các quyết định đã chốt:

- `employee` là người dùng nội bộ đầu cuối; bác sĩ được gộp vào `employee`
- `manager` thay cho `admin`
- `technician` là vai trò vận hành nội bộ
- `supplier` là vai trò mới cho cổng nhà cung cấp
- bảng `requests` không còn thuộc scope chính
- mỗi nghiệp vụ chính có một bảng detail tương ứng
- hợp đồng nhân viên và các module cũ ngoài 4 nghiệp vụ chính không còn là phạm vi sản phẩm

## 2. Luồng cốt lõi

Luồng bảo trì:

`manager/technician tạo lịch bảo trì -> technician xử lý -> ghi maintenance detail`

Luồng đơn hàng nhà cung cấp:

`quản lý/kỹ thuật viên tạo đơn hàng -> nhà cung cấp theo dõi -> nhà cung cấp cập nhật trạng thái chuẩn bị / đang giao / giao thành công`

Luồng kiểm kê:

`manager/technician tạo đợt kiểm kê -> kiểm từng tài sản -> hoàn tất inventory check`

## 3. Thứ tự nên đọc

Nếu cần nắm hệ thống nhanh:

1. [STACK.md](STACK.md)
2. [ROLE_FEATURES.md](ROLE_FEATURES.md)
3. [RBAC_MATRIX.md](RBAC_MATRIX.md)

Nếu cần nắm dữ liệu:

1. [DB_CONVENTIONS.md](DB_CONVENTIONS.md)
2. [SEED_DATA.md](SEED_DATA.md)

Nếu cần nghiệm thu theo chốt khách hàng:

1. [feat_role.md](feat_role.md)
2. [ROLE_FEATURES.md](ROLE_FEATURES.md)
3. [RBAC_MATRIX.md](RBAC_MATRIX.md)

## 4. Danh sách tài liệu

| File | Nội dung |
| --- | --- |
| [STACK.md](STACK.md) | Stack kỹ thuật, cấu trúc app, lệnh dev/test/build |
| [ROLE_FEATURES.md](ROLE_FEATURES.md) | Tính năng của từng vai trò theo từng phân hệ |
| [RBAC_MATRIX.md](RBAC_MATRIX.md) | Ma trận phân quyền route và quyền nghiệp vụ |
| [DB_CONVENTIONS.md](DB_CONVENTIONS.md) | Quy ước schema, bảng lõi, enum và ràng buộc dữ liệu |
| [SEED_DATA.md](SEED_DATA.md) | Seeder, dữ liệu demo, factory và ghi chú môi trường test |
| [feat_role.md](feat_role.md) | Checklist chốt phạm vi và tiêu chí nghiệm thu |
| [CLASS_DIAGRAM.md](CLASS_DIAGRAM.md) | Class diagram Mermaid cho các model và quan hệ domain chính |
