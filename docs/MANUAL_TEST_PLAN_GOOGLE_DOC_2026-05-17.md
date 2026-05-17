# Manual test plan for Google Doc requirements - 2026-05-17

Nguon yeu cau: Google Doc `1iFpcMoYM-PJyZv_2MUotl8hG6AbF84AgnNS0CTZW1Iw`.

Muc tieu: test thu cong de cover toan bo yeu cau UI/ERD trong doc va ghi ro ket qua Pass/Fail/Blocked.

## 1. Chuan bi moi truong

1. Chay Docker:

```powershell
cd D:\CODE\mesoco-dental-asset-management\docker
docker compose up -d --build --wait
```

2. Reset demo data neu can test tu dau:

```powershell
docker compose exec -T app php artisan migrate:fresh --seed
```

3. Mo app:

- LAN/local: `http://192.168.123.10:8000/login`
- Local fallback: `http://127.0.0.1:8000/login`

4. Tai khoan test:

| Role | Username | Password |
|---|---|---|
| Quan ly | `E1001` | `password` |
| Ky thuat vien | `E1002` | `password` |
| Nhan vien | `E1003` | `password` |

## 2. Smoke test bat buoc

| ID | Buoc test | Expected result |
|---|---|---|
| SMK-01 | Dang nhap `E1001/password` | Vao dashboard, hien ten `Nguyen Van An`, role Quan Ly |
| SMK-02 | Mo sidebar | Co cac menu chinh: Tong quan, Quet QR thiet bi, Duyet yeu cau, Quan ly danh muc, Quan ly don hang, Quan ly van hanh, Quan ly bao tri, Quan ly kiem ke & thu huy, Quan ly ho so, Bao cao & thong ke |
| SMK-03 | Mo moi menu chinh | Khong co trang loi, khong treo `Dang tai...` qua 10 giay |
| SMK-04 | Mo DevTools console hoac Browser console | Khong co loi frontend nghiem trong; 401 `/api/me` truoc login chap nhan duoc neu sau login binh thuong |

## 3. Checklist theo Google Doc

| ID | Yeu cau | Buoc test | Expected result | Trang thai hien tai can chu y |
|---|---|---|---|---|
| REQ-01 | Toan bo UI dung `Thiet bi`, han che `Tai san` | Di qua dashboard, danh muc, QR, don hang, bao tri, kiem ke, thu huy, bao cao | Label nghiep vu chinh dung `Thiet bi` | Can ghi lai neu con chu `Tai san` |
| REQ-02 | Danh muc vi tri gom `Ma vi tri - Ten vi tri - Mo ta` | Vao `Quan ly danh muc > Danh muc vi tri` | Bang co 3 cot nay; ma vi tri la so tu tang | Da thay dung tren UI |
| REQ-03 | Ten vi tri theo ban/khu | Kiem tra filter vi tri va danh sach vi tri | Co `Ban 1 - Kho tang 1`, `Khu HR`, `Khu ke toan`, `Khu le tan`, `Khu du an` | Da thay co du lieu |
| REQ-04 | Danh muc thiet bi co 5 tuy chon | Vao `Danh muc thiet bi`, mo filter danh muc | Co PC, Man hinh, Thiet bi Test, Phu kien dung, Linh kien thay the | Da thay dung |
| REQ-05 | Don hang chi co 2 trang thai | Vao `Quan ly don hang > Don hang`, mo filter trang thai | Chi co `Cho giao hang`, `Giao hang thanh cong` | Da thay dung |
| REQ-06 | Don hang co man `Chi tiet`, sua/xoa nam trong chi tiet | Tao hoac seed 1 don hang, bam `Chi tiet` | Hien danh sach thiet bi, chi tiet don hang; nut Sua/Xoa o cuoi; Xoa co confirm | Chua xac minh vi lan test bang rong |
| REQ-07 | Dua `Quet QR thiet bi` ra menu chinh | Kiem tra sidebar | `Quet QR thiet bi` la menu cap chinh | Da thay dung |
| REQ-08 | Dua `Duyet yeu cau` ra menu chinh | Kiem tra sidebar | `Duyet yeu cau` la menu cap chinh | Da thay dung |
| REQ-09 | Loai phieu gom Ban giao, Thu hoi, Sua chua, Thu huy | Vao `Phiếu yêu cầu` va `Duyệt yêu cầu`, mo filter loai phieu | Chi hien 4 loai nay | Hien tai dang sai: van co `Bao su co thiet bi`, `Xin vat tu` |
| REQ-10 | Trang thai duyet: Da duyet, Cho duyet, Khong duyet | Mo filter trang thai o `Phiếu yêu cầu` va `Duyệt yêu cầu` | Co dung 3 trang thai | Da thay dung |
| REQ-11 | Ngay tao phieu doi tu 6/5/2026 sang 13/5/2026 | Xem cot ngay tao phieu va data demo | Ngay theo dung moc spec 13/5/2026 neu doc yeu cau fix data | Hien tai thay 17/5/2026 |
| REQ-12 | Tach Bao tri va Sua chua thanh 2 de muc con | Kiem tra sidebar va page bao tri | Co de muc con rieng cho Bao tri va Sua chua | Hien tai van gom `Bao tri & Sua chua` |
| REQ-13 | Sua chua co phieu sua chua va chi tiet sua chua | Mo man Sua chua, xem/tạo phiếu | Co thong tin phieu va dong chi tiet sua chua | DB co, UI chua tach ro |
| REQ-14 | Bao tri dinh ky 6-12 thang/lần | Tao phieu bao tri dinh ky | Co plan/schedule va hien chu ky 6-12 thang neu yeu cau bat buoc | Can xac minh/bo sung |
| REQ-15 | Co nhat ki sua chua va cho cap nhat nhat ki | Vao phieu sua chua, bam xem/cap nhat | Co issue, action, cost, logged_at/technician | UI chua ro nut `Cap nhat nhat ki sua chua` |
| REQ-16 | Kiem ke co ky thuat vien thuc hien va lan cuoi kiem ke | Vao `Kiem ke dinh ki`, xem thiet bi/chi tiet kiem ke | Hien nguoi kiem ke va ngay kiem ke | UI chua hien ro tren danh sach |
| REQ-17 | Kiem ke doi chieu thong tin thiet bi + nhat ki sua chua + tinh trang thuc te de tinh khau hao | Mo chi tiet kiem ke | Hien du nguon doi chieu va % khau hao | Can xac minh/bo sung |
| REQ-18 | Thu huy theo nguong khau hao >= 75% | Vao `Thu huy` | Hien danh sach de xuat thu huy theo nguong >=75% | Y tuong co, nhung data hien loi |
| REQ-19 | Man Thu huy khong hien `undefined` | Vao `Thu huy` | Gia mua, gia tri so sach, trang thai, khau hao co so hop le | Hien tai Fail: `undefined ₫`, `common.status.undefined`, `%` rong |
| REQ-20 | Bao cao theo spec | Vao `Bao cao & thong ke` | Co report trang thai, khau hao/gia tri con lai, de xuat thu huy, vong doi | Da co cac card report |
| REQ-21 | Ngay bao cao theo moc yeu cau | Xem date range report | Neu doc yeu cau 13/5/2026, default/date data phai dung 13/5/2026 | Hien tai la 17/5/2026 |
| REQ-22 | Quan ly ho so la ho so nguoi dung theo bang Users | Mo `Quan ly ho so` va cac menu con | Noi dung phai la user/profile records, khong lech sang nghiep vu khac | Can test chi tiet |
| REQ-23 | Staff chi xem pham vi cua minh, khong xem don hang | Login `E1003`, kiem tra sidebar va truy cap `/purchase-orders` | Khong thay menu don hang; truy cap truc tiep bi redirect/forbidden | Can test lai role |
| REQ-24 | Technician co Sua chua, Kiem ke thu huy, chi xem phieu sua chua cua minh | Login `E1002`, kiem tra sidebar/list | Co dung menu; list duoc filter theo technician | Can test lai role |

## 4. ERD manual check

| ID | Hang muc ERD | Cach test | Expected result |
|---|---|---|---|
| ERD-01 | `Locations` | Doi chieu DB voi ERD | ERD phai co `id/code/name/description/address/is_active` neu theo he thong hien tai |
| ERD-02 | `Users` | Doi chieu DB voi ERD | ERD phai co `employee_id`, `supplier_id`, `employee_code`, `role_id`, `status`, `must_change_password` |
| ERD-03 | `Assets` | Doi chieu status | ERD phai dung status hien tai `active/off_service/maintenance/inventorying/retired` hoac co mapping ro sang UI |
| ERD-04 | Request workflow | Doi chieu voi DB | ERD phai co `requests`, `request_items`, `request_events`, `approvals` neu giu flow hien tai |
| ERD-05 | Maintenance/Repair | Doi chieu voi DB | ERD phai co `maintenance_events`, `maintenance_details`, `repair_logs` |
| ERD-06 | Inventory | Doi chieu voi DB | ERD phai co `inventory_checks`, `inventory_check_items`, `counted_by_user_id`, `checked_at` |
| ERD-07 | Disposal | Doi chieu voi DB | ERD phai khop `disposals`, `disposal_details`, `asset_book_value`, `proceeds_amount`, nguoi duyet/nguoi xu ly |

## 5. Bang ket luan de nghiem thu

Dung format sau khi test:

```text
Tong ket manual test:
- Pass: x/y
- Fail: x/y
- Blocked: x/y
- Loi nghiem trong can fix truoc demo: ...
- Screenshot evidence folder: .firecrawl/
- ERD status: Matching / Not matching
```
