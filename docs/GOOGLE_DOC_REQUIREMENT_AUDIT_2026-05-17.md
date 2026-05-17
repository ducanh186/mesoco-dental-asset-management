# Google Doc requirement audit - 2026-05-17

Nguon yeu cau: Google Docs `1iFpcMoYM-PJyZv_2MUotl8hG6AbF84AgnNS0CTZW1Iw`

Pham vi da lam:

- Doc text: da doc bang Firecrawl, luu tai `.firecrawl/mesoco-google-doc.md`.
- Doc image: da mo bang Browser de xem anh trong Google Docs. Firecrawl doc markdown da thay anh bang `Base64-Image-Removed`, nen anh duoc doi chieu qua Browser.
- App test: da dang nhap demo `E1001/password`, test cac man hinh chinh tren `http://127.0.0.1:8000` va `http://192.168.123.10:8000/login`.
- Docker status luc test: `mesoco-app` healthy, `mesoco-db` healthy, `mesoco-vite` up.

## Screenshot evidence

| Man hinh | File |
|---|---|
| Dashboard | `.firecrawl/mesoco-dashboard-playwright.png` |
| Danh muc thiet bi | `.firecrawl/mesoco-assets-after-wait.png` |
| Danh muc vi tri | `.firecrawl/mesoco-locations-after-wait.png` |
| Don hang | `.firecrawl/mesoco-purchase-orders.png` |
| Bao tri & sua chua | `.firecrawl/mesoco-maintenance.png` |
| Kiem ke | `.firecrawl/mesoco-inventory.png` |
| Thu huy | `.firecrawl/mesoco-disposal.png` |
| Bao cao | `.firecrawl/mesoco-reports.png` |

## Ket qua doi chieu yeu cau

| Nhom yeu cau trong Google Doc | Ket qua hien tai | Danh gia |
|---|---|---|
| Doi UI tu "Tai san" sang "Thiet bi" | Cac man hinh chinh da dung "Thiet bi": dashboard, QR, danh muc, kiem ke, thu huy, bao cao. | Dat phan lon |
| Danh muc vi tri gom `Ma vi tri - Ten vi tri - Mo ta`, ma vi tri tu tang int | UI hien `MA VI TRI`, `TEN VI TRI`, `MO TA`; DB `locations.id` la bigint auto increment, co them `code`, `description`. | Dat ve UI; ERD cu chua khop hoan toan |
| Tuy chon danh muc thiet bi: PC, Man hinh, Thiet bi Test, Phu kien dung, Linh kien thay the | UI filter danh muc thiet bi co dung 5 nhom nay. | Dat |
| Dua `Quet QR thiet bi` ra de muc chinh | Sidebar hien `Quet QR thiet bi` la menu cap chinh. | Dat |
| Dua `Duyet yeu cau` ra de muc chinh | Sidebar hien `Duyet yeu cau` la menu cap chinh. | Dat |
| Don hang chi co 2 trang thai: `Cho giao hang`, `Giao hang thanh cong` | UI don hang va filter chi hien 2 trang thai nay. | Dat ve UI |
| Don hang: sua/xoa nam trong man `Chi tiet`, xoa phai confirm | Bang don hang hien dang rong trong lan test, chua xac minh duoc flow chi tiet/xoa tren UI bang du lieu that. | Chua xac minh |
| Loai phieu: Ban giao, Thu hoi, Sua chua, Thu huy | UI `Phiếu yêu cầu` va `Duyệt yêu cầu` van hien `Bao su co thiet bi`, `Xin vat tu`. | Sai khac |
| Trang thai duyet co 3 loai: Da duyet, Cho duyet, Khong duyet | UI hien dung 3 trang thai nay. | Dat |
| Thoi gian tao phieu tu 6/5/2026 -> 13/5/2026 | Du lieu demo hien ngay `17/5/2026`. Bao cao hien khoang `1/5/2026 den 17/5/2026`. | Sai khac |
| Tach Bao tri va Sua chua thanh 2 de muc con | Sidebar van la `Quan ly bao tri` -> `Bao tri & Sua chua`; trong man co filter `Bao tri/Sua chua` nhung chua tach thanh 2 de muc con rieng. | Sai khac mot phan |
| Sua chua can co phieu sua chua va chi tiet sua chua | Backend co `maintenance_events`, `maintenance_details`, `repair_logs`; UI van gom trong man `Bao tri & Sua chua`. | Sai khac mot phan |
| Bao tri dinh ki co lap ke hoach 6-12 thang/lần | UI co `Phiếu bảo trì` va `Ngày dự kiến`; chua thay rule 6-12 thang duoc the hien ro trong UI. | Chua xac minh/Can bo sung |
| Thieu nhat ki sua chua, can co cho cap nhat nhat ki sua chua | DB co `repair_logs` va `maintenance_details` co `issue_description`, `action_taken`, `logged_at`; UI chua the hien ro nut/section `Cap nhat nhat ki sua chua`. | Sai khac mot phan |
| Kiem ke can biet ky thuat vien nao thuc hien, lan cuoi kiem ke la ngay nao | DB `inventory_check_items.counted_by_user_id`, `checked_at`; UI kiem ke chua hien ro ky thuat vien thuc hien/lan cuoi kiem ke tren danh sach thiet bi. | Sai khac mot phan |
| Thu huy can dua theo nguong khau hao >= 75% | UI co `De xuat thu huy`, `Khau hao >= 75%`. | Dat ve y tuong |
| Man Thu huy khong duoc hien du lieu loi | UI dang hien `undefined ₫`, `common.status.undefined`, cot `KHAU HAO` chi hien `%` khong co so. | Sai khac nghiem trong |
| Bao cao can xem lai theo yeu cau trong doc | UI bao cao co nhieu report card, nhung ngay dang la `05/01/2026` den `05/17/2026`, khong phai moc 13/5/2026. | Sai khac |
| Staff/Technician chi xem dung pham vi: khong xem don hang; tech co them sua chua/kiem ke/thu huy | Chua test xong role `E1002`, `E1003` vi Browser/Playwright bi treo o login sau khi clear session. Backend co policy phan quyen nhung can test lai UI role. | Chua xac minh |

## ERD check

Ket luan ngan: ERD trong Google Doc va file `erd_final.md` chua matching voi he thong hien tai.

Ly do chinh:

1. ERD dang dung kieu SQL Server va ten bang PascalCase nhu `Roles`, `Users`, `OrderDetails`, `Maintenance`, `InventoryDetails`. He thong Laravel/MySQL hien tai dung snake_case va nhieu bang da tach/doi ten, vi du `purchase_order_items`, `maintenance_events`, `maintenance_details`, `repair_logs`, `inventory_check_items`.
2. ERD bang `Locations` chi co `LocationID`, `LocationName`; he thong hien tai co `locations.id`, `code`, `name`, `description`, `address`, `is_active`.
3. ERD bang `Users` thieu nhieu field hien tai: `employee_id`, `supplier_id`, `employee_code`, `name`, `role_id`, `status`, `must_change_password`.
4. ERD bang `Assets` dung status `Available/Assigned/Repairing/Disposed`; he thong hien tai dung `active/off_service/maintenance/inventorying/retired` va UI map sang tieng Viet.
5. ERD `Maintenance` qua don gian; he thong hien tai co `maintenance_events`, `maintenance_details`, `repair_logs`, co nguoi duoc giao, chi phi, trang thai, thoi diem bat dau/hoan thanh.
6. ERD `InventoryChecks/InventoryDetails` chua khop voi `inventory_checks/inventory_check_items`; he thong hien tai co `counted_by_user_id`, `checked_at`, `expected_status`, `actual_status`, `condition_note`.
7. ERD `Disposals/DisposalDetails` chua khop hoan toan voi `disposals/disposal_details`; he thong hien tai gan truc tiep `asset_id`, co `method`, `reason`, `disposed_by_user_id`, `approved_by_user_id`, `asset_book_value`, `proceeds_amount`.
8. Request workflow trong UI hien tai dung `requests`, `request_items`, `request_events`, `approvals`; Google Doc lai yeu cau loai phieu moi `Ban giao/Thu hoi/Sua chua/Thu huy`, nen ERD can cap nhat them workflow nay neu day la source of truth moi.

## De xuat huong sua tiep theo

1. Chot Google Doc la source of truth moi hay chi la checklist review UI.
2. Neu Google Doc la source of truth moi, sua theo thu tu rui ro thap -> cao:
   - UI label/request type/date demo data.
   - Man thu huy bi `undefined`.
   - Tach Bao tri/Sua chua va hien repair log.
   - Bo sung inventory UI cho ky thuat vien, ngay kiem ke, depreciation evidence.
   - Cap nhat ERD/schema docs theo schema that hien tai.
3. Sau moi nhom sua can test lai bang Browser screenshot va `php artisan test`.
