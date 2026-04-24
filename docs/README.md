# Tài Liệu Dự Án IT Asset Management

Thư mục này mô tả hệ thống theo hướng báo cáo/luận văn: bài toán nhỏ, đúng nghiệp vụ và dễ giải thích. Dự án không còn lấy domain chuyên môn cũ làm trọng tâm; scope hiện tại là quản lý thiết bị IT theo phòng ban trong công ty công nghệ.

## Bài Toán

Công ty cần biết mỗi thiết bị IT đang ở đâu, thuộc phòng ban nào, mua từ ngày nào, còn bảo hành không, đã bảo trì gần nhất khi nào, còn bao nhiêu giá trị sổ sách và khi nào cần thanh lý. Người dùng chính là manager, technician, employee và supplier.

## Mục Lục

| Tài liệu | Nội dung |
| --- | --- |
| [STACK.md](STACK.md) | Công nghệ, cấu trúc repo, lệnh chạy và flow runtime |
| [RBAC_MATRIX.md](RBAC_MATRIX.md) | Ma trận quyền theo role |
| [ROLE_FEATURES.md](ROLE_FEATURES.md) | Tính năng nhìn từ từng người dùng |
| [DB_CONVENTIONS.md](DB_CONVENTIONS.md) | Database, bảng chính, enum và legacy compatibility |
| [SEED_DATA.md](SEED_DATA.md) | Tài khoản mẫu và dữ liệu demo IT |
| [CLASS_DIAGRAM.md](CLASS_DIAGRAM.md) | Class diagram Mermaid cho báo cáo |
| [feat_role.md](feat_role.md) | Checklist nghiệm thu theo yêu cầu khách |

## Module Chính

- `Asset Catalog`: danh mục tài sản IT và thông tin vòng đời.
- `Department Handover`: bàn giao tài sản cho phòng ban, không dùng flow mượn/trả cá nhân.
- `Maintenance`: bảo trì một hoặc nhiều thiết bị, có chi tiết xử lý và chi phí.
- `Inventory & Valuation`: kiểm kê, khấu hao, giá trị còn lại và bảo hành.
- `Purchase Orders`: nhà cung cấp, đơn mua hàng và trạng thái giao.
- `Requests`: báo sự cố thiết bị và xin vật tư/linh kiện IT.
- `Disposal`: khóa sử dụng, thu hồi khỏi vận hành, thanh lý.

## Legacy Compatibility

Một số endpoint cũ vẫn tồn tại để trả `410 Gone`. Đây là quyết định kỹ thuật nhằm báo rõ rằng chức năng đã bị loại khỏi scope, thay vì để client cũ nhận HTML của SPA hoặc lỗi `404` không rõ nguyên nhân.

Các migration và bảng lịch sử vẫn giữ lại. Dự án chỉ gỡ code active, UI active, seed data và docs active khỏi domain cũ.
