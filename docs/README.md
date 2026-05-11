# Tài Liệu Dự Án IT Asset Management

Thư mục này mô tả hệ thống theo hướng báo cáo/luận văn: bài toán nhỏ, đúng nghiệp vụ và dễ giải thích cho người không chuyên kỹ thuật. Scope hiện tại là quản lý tài sản IT theo **vị trí** và **nhân viên chịu trách nhiệm**.

## Bài Toán

Công ty cần biết mỗi tài sản IT đang ở vị trí nào, ai đang chịu trách nhiệm, mua từ ngày nào, còn bảo hành không, đã bảo trì gần nhất khi nào, còn bao nhiêu giá trị sổ sách và khi nào nên đề xuất thu hủy. Người dùng chính là `manager`, `technician`, `employee` và `supplier`.

## Mục Lục

| Tài liệu | Nội dung |
| --- | --- |
| [BFD.md](BFD.md) | Business Flow Diagram đơn giản cho báo cáo |
| [STACK.md](STACK.md) | Công nghệ, cấu trúc repo, lệnh chạy và flow runtime |
| [RBAC_MATRIX.md](RBAC_MATRIX.md) | Ma trận quyền theo role |
| [ROLE_FEATURES.md](ROLE_FEATURES.md) | Tính năng nhìn từ từng người dùng |
| [DB_CONVENTIONS.md](DB_CONVENTIONS.md) | Database, bảng chính, enum và legacy compatibility |
| [SEED_DATA.md](SEED_DATA.md) | Tài khoản mẫu và dữ liệu demo IT |
| [CLASS_DIAGRAM.md](CLASS_DIAGRAM.md) | Class diagram Mermaid cho báo cáo |
| [feat_role.md](feat_role.md) | Checklist nghiệm thu theo yêu cầu khách |

## Module Chính

- `Asset Catalog`: danh mục tài sản IT và thông tin vòng đời.
- `Location Catalog`: mã vị trí, tên vị trí và mô tả nơi đặt tài sản.
- `Responsible Employee`: gắn tài sản với một nhân viên chịu trách nhiệm.
- `Maintenance`: bảo trì một hoặc nhiều thiết bị, có chi tiết xử lý và chi phí.
- `Inventory & Valuation`: kiểm kê, khấu hao, giá trị còn lại và bảo hành.
- `Requests`: báo sự cố thiết bị và xin vật tư/linh kiện IT.
- `Disposal`: thu hồi khỏi vận hành; khi thu hủy thì asset mất vị trí và mất người phụ trách active.
- `Purchase Orders`: nhà cung cấp, đơn mua hàng và trạng thái giao.

## Legacy Compatibility

Một số endpoint/cột cũ vẫn tồn tại để giảm rủi ro migration và trả lỗi rõ ràng cho client cũ. UI, docs active và business logic mới không dùng đơn vị tổ chức nội bộ làm nguồn nghiệp vụ chính.
