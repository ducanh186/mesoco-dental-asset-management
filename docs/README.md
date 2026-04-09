# Bộ tài liệu dự án

Thư mục `docs/` là nguồn tài liệu chính của repo. Toàn bộ file `.md` trong thư mục này đã được cập nhật theo scope mới nhất.

## 1. Phạm vi nghiệp vụ

Sản phẩm chỉ tập trung vào 5 phân hệ chính:

1. Quản lý danh mục và hồ sơ
2. Quản lý cấp phát
3. Quản lý bảo trì và sửa chữa
4. Quản lý thu hủy
5. Báo cáo và thống kê

Các quyết định đã chốt:

- `employee` là người dùng nội bộ đầu cuối; bác sĩ được gộp vào `employee`
- `manager` thay cho `admin`
- `technician` là vai trò vận hành nội bộ
- `supplier` là vai trò mới cho cổng nhà cung cấp
- hợp đồng nhân viên và các module cũ ngoài 5 phân hệ chính không còn là phạm vi sản phẩm

## 2. Luồng cốt lõi

Luồng sự cố nội bộ:

`nhân viên báo sự cố -> quản lý duyệt/điều phối -> kỹ thuật viên xử lý`

Luồng đơn hàng nhà cung cấp:

`quản lý/kỹ thuật viên tạo đơn hàng -> nhà cung cấp theo dõi -> nhà cung cấp cập nhật trạng thái chuẩn bị / đang giao / giao thành công`

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
