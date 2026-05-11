# Backend Guide

Backend dùng Laravel 12. Mục tiêu nghiệp vụ là IT Asset Management theo vị trí và nhân viên chịu trách nhiệm.

## Quy Tắc

- Controller trả JSON rõ ràng, không để legacy API rơi vào SPA HTML.
- Validation nằm trong `app/Http/Requests` khi input phức tạp.
- Model giữ relationship cần thiết cho module active.
- Không thêm lại relationship hoặc serialization cho module đã remove khỏi UI active.
- Role phải đi qua canonical role: `manager`, `technician`, `employee`, `supplier`.

## Module Chính

- `Asset`: danh mục thiết bị IT, location, responsible employee, supplier, valuation.
- `MaintenanceEvent`: bảo trì, sửa chữa, cập nhật phần mềm, nâng cấp phần cứng.
- `InventoryCheck`: kiểm kê và đối chiếu tình trạng.
- `PurchaseOrder`: mua sắm thiết bị/vật tư từ supplier.
- `AssetRequest`: báo sự cố thiết bị hoặc xin vật tư IT.
- `Disposal`: đưa asset khỏi vận hành và ghi nhận thanh lý.

## Legacy

Route legacy phải trả `410 Gone`. Không tạo controller mới cho flow đã bỏ khỏi scope trừ khi mục tiêu là giữ compatibility rõ ràng.
