# Class Diagram

Sơ đồ này được rút gọn để dùng trong báo cáo nghiệp vụ. Mục tiêu là thể hiện các đối tượng chính của hệ thống và mối quan hệ giữa chúng, không đi sâu vào chi tiết lập trình.

```mermaid
classDiagram
    direction LR

    class User {
        ma_nguoi_dung
        ho_ten
        emaihttps://www.librechat.ai/docs/locall
        vai_tro
        trang_thai
    }

    class Role {
        ma_vai_tro
        ten_vai_tro
        mo_ta
    }

    class Employee {
        ma_nhan_vien
        ho_ten
        phong_ban
        chuc_vu
        trang_thai
    }

    class Supplier {
        ma_nha_cung_cap
        ten_nha_cung_cap
        nguoi_lien_he
        email
        so_dien_thoai
    }

    class Asset {
        ma_tai_san
        ten_tai_san
        loai_tai_san
        nhom_tai_san
        vi_tri
        trang_thai
        nguyen_gia
        ngay_het_bao_hanh
    }

    class Category {
        ma_nhom
        ten_nhom
        mo_ta
    }

    class AssetAssignment {
        ngay_ban_giao
        ngay_thu_hoi
        trang_thai_ban_giao
    }

    class AssetRequest {
        ma_yeu_cau
        loai_yeu_cau
        tieu_de
        muc_do_uu_tien
        trang_thai_duyet
        ngay_tao
    }

    class MaintenanceEvent {
        ma_bao_tri
        loai_bao_tri
        ngay_du_kien
        muc_do_uu_tien
        trang_thai
        chi_phi
    }

    class RepairLog {
        tinh_trang_sua_chua
        mo_ta_su_co
        cach_xu_ly
        chi_phi
        ngay_hoan_thanh
    }

    class PurchaseOrder {
        ma_don_hang
        ngay_dat_hang
        ngay_du_kien_giao
        trang_thai
        tong_tien
        phuong_thuc_thanh_toan
    }

    class PurchaseOrderItem {
        ten_hang
        so_luong
        don_vi
        don_gia
        thanh_tien
    }

    class Disposal {
        ma_thu_huy
        hinh_thuc_xu_ly
        ly_do
        gia_tri_con_lai
        so_tien_thu_hoi
        ngay_xu_ly
    }

    Role "1" --> "0..*" User : phan_quyen
    Employee "1" --> "0..1" User : co_tai_khoan
    Supplier "1" --> "0..1" User : co_tai_khoan

    Category "1" --> "0..*" Asset : phan_loai
    Supplier "1" --> "0..*" Asset : cung_cap

    Asset "1" --> "0..*" AssetAssignment : duoc_ban_giao
    Employee "1" --> "0..*" AssetAssignment : nhan_tai_san
    User "1" --> "0..*" AssetAssignment : thuc_hien_ban_giao

    Employee "1" --> "0..*" AssetRequest : gui_yeu_cau
    Asset "0..1" --> "0..*" AssetRequest : lien_quan_den
    User "1" --> "0..*" AssetRequest : duyet_yeu_cau

    Asset "1" --> "0..*" MaintenanceEvent : duoc_bao_tri
    User "1" --> "0..*" MaintenanceEvent : phu_trach
    MaintenanceEvent "1" --> "0..1" RepairLog : ghi_nhan_sua_chua
    Supplier "0..1" --> "0..*" RepairLog : ho_tro_sua_chua

    Supplier "1" --> "0..*" PurchaseOrder : nhan_don_hang
    User "1" --> "0..*" PurchaseOrder : lap_hoac_duyet_don
    PurchaseOrder "1" --> "1..*" PurchaseOrderItem : gom_cac_mat_hang

    Asset "1" --> "0..*" Disposal : duoc_thu_huy
    User "1" --> "0..*" Disposal : thuc_hien_hoac_duyet
```

## Ghi chú đọc sơ đồ

- `1` nghĩa là một bản ghi duy nhất.
- `0..1` nghĩa là có thể có hoặc không có.
- `0..*` nghĩa là có thể có nhiều bản ghi.
- Sơ đồ chỉ giữ các lớp quan trọng cho báo cáo nghiệp vụ. Các lớp kỹ thuật như mã QR, lịch sử thao tác, sinh mã tự động không được đưa vào để tránh làm rối sơ đồ.
