# Bộ tài liệu dự án

Thư mục `docs/` là nguồn tài liệu chính của repo. README ở root chỉ đóng vai trò trang vào nhanh; mọi mô tả chi tiết đều nên đọc từ đây.

## 1. Hệ thống hiện tại đang phục vụ gì

Repo đã được chốt lại theo 5 nhiệm vụ nghiệp vụ của DFD mức 0:

1. Quản lý danh mục và hồ sơ
2. Quản lý cấp phát
3. Quản lý bảo trì sửa chữa
4. Quản lý thu hủy
5. Báo cáo và thống kê

Luồng sự cố chuẩn của hệ thống:

`nhân viên / bác sĩ báo cáo sự cố -> quản lý -> kỹ thuật viên`

## 2. Nên đọc theo thứ tự nào

### Nếu cần nắm tổng quan nhanh

1. [Stack công nghệ](STACK.md)
2. [Tính năng theo vai trò](ROLE_FEATURES.md)
3. [Ma trận RBAC](RBAC_MATRIX.md)

### Nếu cần nắm cấu trúc dữ liệu

1. [Quy ước database](DB_CONVENTIONS.md)
2. [Dữ liệu mẫu và seeder](SEED_DATA.md)

### Nếu cần nghiệm thu hoặc kiểm thử

1. [Checklist nghiệm thu theo vai trò](feat_role.md)
2. [Ma trận RBAC](RBAC_MATRIX.md)
3. [Dữ liệu mẫu và seeder](SEED_DATA.md)

## 3. Danh sách tài liệu

| File | Nội dung |
| --- | --- |
| [STACK.md](STACK.md) | Stack, cấu trúc thư mục và lệnh phát triển |
| [ROLE_FEATURES.md](ROLE_FEATURES.md) | Quyền và tính năng của `manager`, `technician`, `doctor`, `employee` |
| [RBAC_MATRIX.md](RBAC_MATRIX.md) | Ma trận phân quyền API theo route và policy |
| [DB_CONVENTIONS.md](DB_CONVENTIONS.md) | Quy ước schema, bảng lõi, luồng dữ liệu |
| [SEED_DATA.md](SEED_DATA.md) | Seeder, tài khoản demo và cách dựng dữ liệu mẫu |
| [feat_role.md](feat_role.md) | Checklist nghiệm thu theo vai trò và phân hệ |

## 4. Lưu ý quan trọng

- Role cũ `admin`, `hr`, `staff` không còn là mô hình nghiệp vụ chính.
- Tài liệu hiện dùng role chuẩn:
  - `manager`
  - `technician`
  - `doctor`
  - `employee`
- Một số module cũ như `feedback` hoặc `contracts` vẫn còn trong codebase để tương thích, nhưng không phải là trọng tâm của tài liệu nghiệp vụ hiện tại.
