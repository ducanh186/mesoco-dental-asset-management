Dưới đây là **Spec ban đầu V0.1** để chia dự án thành **2 luồng song song**, mỗi luồng có **microtask nhỏ**, giúp AI Agent không quên context và không sửa lan man.

---

# Spec ban đầu V0.1 — Mesoco Final Cleanup

## 0. Mục tiêu

Clean lại dự án **Mesoco IT Asset Management** để UI, workflow, dữ liệu và phân quyền khớp với nghiệp vụ khóa luận/scope active.

Hệ thống quản lý vòng đời thiết bị IT:

```text
Mua sắm → Nhập kho → Bàn giao → Thu hồi → Bảo trì/Sửa chữa → Kiểm kê → Đề xuất thu hủy → Thu hủy
```

Phạm vi active gồm asset catalog, purchase order, handover/recovery, maintenance, inventory, disposal, request, report, dashboard, RBAC và QR role-aware view. Không đưa lại flow mượn/trả cá nhân hoặc domain sai như dental/medical/law.

---

## 1. Source of truth bắt buộc

AI Agent phải đọc các file này trước khi sửa:

```text
CLAUDE.md
HANDOVER.md
spec.MD
schema.sql
CHAPTER3_DATABASE_SCHEMA_QUICK_REFERENCE.md
trich_xuat_field_erd_ui_thiet_bi.md
Recording_3.txt
```

Khi cần đối chiếu nghiệp vụ:

```text
KLTN_DamThiNguyen_15.05.2026.docx (2).pdf
need2fix.pdf
overall_req.pdf
```

Không được tự bịa field/form/workflow. Nếu UI cần field nào thì phải đối chiếu với model/controller/schema trước.

---

## 2. Guardrails chung

## 2.1. Không được làm

* Không đổi tên repo.
* Không drop migration cũ.
* Không tạo lại flow mượn/trả cá nhân.
* Không tạo request type mới nếu chưa có schema/spec rõ.
* Không đưa domain dental/medical/law vào UI.
* Không sửa lan sang module ngoài task.
* Không commit/push.

## 2.2. Bắt buộc giữ

* Vai trò chuẩn: `manager`, `technician`, `employee`, `supplier`.
* Request active chỉ gồm:

  * `JUSTIFICATION`
  * `CONSUMABLE_REQUEST`
* `assets.type` giữ enum generic, phân loại IT qua `category`.
* Legacy API ngoài scope phải tiếp tục trả `410 Gone`.
* Nếu sửa i18n/text: chạy `npm run check:i18n`.
* Sau code change: chạy tối thiểu `npm run check:i18n`, `npm run build`, `php artisan test`.

---

# 3. Chia 2 luồng song song

## Tổng quan chia việc

| Luồng   | Tên                               | Mục tiêu                                 | Chủ yếu sửa                                              |
| ------- | --------------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| Luồng A | UI/RBAC/Navigation/Reports        | Sửa phần nhìn thấy rõ nhất khi demo      | Sidebar, Dashboard, Role menu, Labels, Reports, Dropdown |
| Luồng B | Lifecycle Workflow/Data Integrity | Sửa nghiệp vụ lõi theo vòng đời thiết bị | PO, Handover/Return, Maintenance, Inventory, Disposal    |

---

# Luồng A — UI/RBAC/Navigation/Reports

## Mục tiêu

Làm cho giao diện không còn sai nghiệp vụ, không còn menu lệch, không còn role nhìn thấy chức năng sai. Luồng này ít đụng business logic sâu, ưu tiên **UI consistency + permission visibility + report bug**.

---

## A0. Audit trước khi sửa

### Microtask A0.1 — Map toàn bộ route/sidebar/page

**Input cần đọc**

```text
resources/js/layouts/Sidebar.jsx
resources/js/pages/*
resources/js/i18n/locales/*
routes/api.php
```

**Việc cần làm**

* Liệt kê sidebar hiện tại theo từng role.
* Chỉ ra menu nào sai nghiệp vụ.
* Chỉ ra label nào còn “tài sản” cần đổi thành “thiết bị”.
* Chỉ ra menu nào đang lẫn BFD/sơ đồ/chức năng kỹ thuật vào UI.

**Output**

```text
docs/audit-final-ui-rbac.md
```

**Không sửa code ở task này.**

---

## A1. Sidebar + Navigation

### Microtask A1.1 — Sửa thứ tự sidebar

**Yêu cầu**

Sidebar phải theo hướng:

```text
Tổng quan
Quản lý danh mục và hồ sơ
  - Danh mục thiết bị
  - Vị trí
  - Nhà cung cấp
  - Hồ sơ người dùng
Quản lý thiết bị
Quản lý đơn hàng
Phiếu yêu cầu
Duyệt phiếu yêu cầu
Quản lý bảo trì
Quản lý kiểm kê
Thu hủy thiết bị
Báo cáo thống kê
```

**Acceptance criteria**

* Tổng quan nằm đầu.
* Không còn “Sơ đồ chức năng BFD” trong UI.
* Hồ sơ người dùng không bị nhầm thành hồ sơ thiết bị.
* Không hiển thị menu không có route hoặc bấm không hoạt động.

---

### Microtask A1.2 — Chuẩn hóa label tiếng Việt

**Yêu cầu**

* UI dùng “Thiết bị”, không dùng lẫn “Tài sản” nếu là label user-facing.
* “Disposal” hiển thị là “Thu hủy”.
* “Maintenance” tách nghĩa:

  * Bảo trì định kỳ.
  * Sửa chữa.
* “Inventory” hiển thị là “Kiểm kê”.

**Acceptance criteria**

* Không còn label domain sai.
* Không còn text kiểu “BFD”, “Sơ đồ chức năng” trong app.
* i18n EN/VI không lệch key.

---

## A2. RBAC visibility

### Microtask A2.1 — Manager menu

**Manager được thấy**

```text
Tổng quan
Quản lý danh mục và hồ sơ
Quản lý thiết bị
Quản lý đơn hàng
Phiếu yêu cầu
Duyệt phiếu yêu cầu
Quản lý bảo trì
Quản lý kiểm kê
Thu hủy thiết bị
Báo cáo thống kê
Quản lý người dùng/phân quyền nếu đã có page
```

**Acceptance criteria**

* Manager không bị thiếu chức năng quản trị.
* Manager không thấy menu legacy ngoài scope.

---

### Microtask A2.2 — Technician menu

**Technician được thấy**

```text
Tổng quan
Phiếu yêu cầu liên quan
Quản lý bảo trì
  - Bảo trì định kỳ
  - Sửa chữa
Quản lý kiểm kê
  - Kiểm kê định kỳ
QR / Xem thiết bị theo quyền
Profile / Đổi mật khẩu
```

**Acceptance criteria**

* Technician không thấy quản lý user.
* Technician không thấy báo cáo manager-only nếu policy không cho.
* Nhật ký sửa chữa không cần menu riêng; nằm trong chi tiết sửa chữa/thiết bị.

---

### Microtask A2.3 — Employee menu

**Employee được thấy**

```text
Tổng quan tối giản
Tạo/theo dõi phiếu yêu cầu
QR / Xem thiết bị theo quyền
Profile / Đổi mật khẩu
```

**Acceptance criteria**

* Employee không thấy quản lý bảo trì.
* Employee không thấy quản lý kiểm kê.
* Employee không thấy thu hủy/báo cáo/quản lý danh mục.

---

## A3. Filter/dropdown/status UI

### Microtask A3.1 — Chuẩn hóa trạng thái thiết bị

5 trạng thái UI:

```text
Sẵn sàng
Đã bàn giao
Đang bảo trì
Đang kiểm kê
Đã thu hủy
```

**Yêu cầu**

* Dropdown mặc định là “Tất cả”.
* Không để “Chọn một tùy chọn...” lẫn với dữ liệu thật.
* Không dùng ngưỡng 90% cho thu hủy; đề xuất thu hủy dùng `>= 75%`.

Ngưỡng đề xuất thu hủy `>= 75%` là rule trong spec và tài liệu yêu cầu, không phải 90%.

---

## A4. Reports

### Microtask A4.1 — Audit bug báo cáo

**Việc cần kiểm tra**

* Nút tạo báo cáo có gọi API không.
* Refresh có load lại dữ liệu không.
* Export có chạy không.
* Có console error/network error không.
* API report trả data đúng shape không.

**Output**

```text
docs/audit-final-reports.md
```

---

### Microtask A4.2 — Sửa report page về một module thống nhất

**Yêu cầu**

Sidebar chỉ cần:

```text
Báo cáo thống kê
```

Bên trong page có các section:

```text
Tổng quan thiết bị
Thiết bị theo trạng thái
Thiết bị theo danh mục/vị trí/phòng ban
Khấu hao và giá trị còn lại
Bảo trì/sửa chữa
Kiểm kê và chênh lệch
Đơn hàng
```

Spec yêu cầu reports/dashboard phản ánh tổng số thiết bị active, trạng thái, category, supplier, location, chi phí bảo trì, bảo hành, khấu hao, lịch sử bàn giao và kết quả kiểm kê.

---

# Luồng B — Lifecycle Workflow/Data Integrity

## Mục tiêu

Sửa nghiệp vụ lõi theo vòng đời thiết bị. Luồng này đụng backend/form/schema nhiều hơn. Phải cực kỳ chặt, không tự thêm field nếu DB chưa có.

---

## B0. Audit trước khi sửa

### Microtask B0.1 — Map controller/model/table/page theo lifecycle

**Input cần đọc**

```text
app/Http/Controllers/*
app/Models/*
database/migrations/*
schema.sql
resources/js/pages/*
```

**Output**

```text
docs/audit-final-lifecycle-workflow.md
```

**Bảng audit bắt buộc**

| Module | Page | Controller | Model | Table | Field đang dùng | Field thiếu/sai |
| ------ | ---- | ---------- | ----- | ----- | --------------- | --------------- |

---

## B1. Purchase Orders

### Microtask B1.1 — Sửa form tạo đơn hàng

**Form tạo đơn chỉ cần**

```text
Nhà cung cấp
Danh sách thiết bị đặt mua
  - Tên thiết bị
  - Đơn vị
  - Số lượng
  - Ghi chú
```

**Không bắt buộc ở bước tạo**

```text
Đơn giá
Thành tiền
Phương thức thanh toán
```

Purchase order phải theo supplier, có item, trạng thái xử lý, người phê duyệt và khi hàng về có thể khởi tạo asset record.

---

### Microtask B1.2 — Sửa bảng đơn hàng

**Yêu cầu UI**

```text
Mã đơn
Nhà cung cấp
Ngày tạo
Trạng thái
Cập nhật trạng thái
Chi tiết
Thao tác
```

**Chi tiết**

* Bấm “Chi tiết” mới mở danh sách item.
* Sửa/Xóa nằm trong “Thao tác”.
* Xóa phải confirm.

---

## B2. Handover / Return

### Microtask B2.1 — Tách rõ bàn giao và thu hồi

**Phiếu bàn giao**

```text
Người nhận
Người thực hiện bàn giao
Ngày bàn giao
Danh sách thiết bị
Ghi chú
Người phê duyệt
```

**Phiếu thu hồi**

```text
Phiếu bàn giao liên quan
Người trả thiết bị
Người nhận lại
Ngày thu hồi
Lý do thu hồi
Danh sách thiết bị thu hồi
Tình trạng thiết bị khi thu hồi
Ghi chú
Người phê duyệt
```

Bảng Assignments lưu người nhận, người thực hiện, ngày bàn giao, ghi chú và người phê duyệt; bảng Returns lưu phiếu bàn giao liên quan, người trả, người nhận lại, ngày thu hồi, lý do và người phê duyệt.

---

### Microtask B2.2 — Technician cập nhật tình trạng sau thu hồi

**Yêu cầu**

* Trong chi tiết phiếu thu hồi, technician cập nhật:

  * Tình trạng thiết bị khi thu hồi.
  * Ghi chú hư hỏng nếu có.
  * Gợi ý xử lý tiếp: sẵn sàng tái bàn giao / chuyển sửa chữa / đề xuất thu hủy.

**Acceptance criteria**

* Không dùng chung form bàn giao cho thu hồi.
* Thu hồi có condition/note rõ ràng.
* Sau thu hồi, assignee hiện tại được clear/cập nhật đúng mô hình dữ liệu.

---

## B3. Maintenance / Repair

### Microtask B3.1 — Tách bảo trì định kỳ và sửa chữa

Cấu trúc đúng:

```text
Quản lý bảo trì
├── Bảo trì định kỳ
│   └── Lập kế hoạch bảo trì mới
└── Sửa chữa
    └── Danh sách phiếu/yêu cầu sửa chữa đã được duyệt
```

Maintenance phải ghi technician, thời gian bắt đầu/kết thúc, chi phí, người phê duyệt, detail từng thiết bị/lỗi và lịch sử append-only.

---

### Microtask B3.2 — Repair không tạo tay sai workflow

**Yêu cầu**

* Tab sửa chữa không tự tạo phiếu sửa chữa mới nếu nghiệp vụ yêu cầu đi từ request đã duyệt.
* Nếu người dùng báo hỏng, map vào `JUSTIFICATION` hoặc workflow maintenance hiện có.
* Không tạo request type mới.

Request active chỉ gồm `JUSTIFICATION` và `CONSUMABLE_REQUEST`; lỗi thiết bị nên nối vào maintenance thay vì tạo subsystem request mới.

---

### Microtask B3.3 — Nhật ký sửa chữa nằm trong chi tiết

**Yêu cầu**

* Không tạo menu “Nhật ký sửa chữa” độc lập.
* Log sửa chữa nằm trong:

  * Chi tiết phiếu sửa chữa, hoặc
  * Chi tiết thiết bị.
* Mỗi log gồm:

  * Thiết bị.
  * Lỗi.
  * Cách xử lý.
  * Technician.
  * Chi phí.
  * Thời gian.
  * Kết quả.

---

## B4. Inventory

### Microtask B4.1 — Lập kế hoạch kiểm kê phải có item list

**Yêu cầu**

Khi lập kế hoạch kiểm kê phải chọn được danh sách thiết bị kiểm kê.

Mỗi item cần:

```text
Thiết bị
Trạng thái dự kiến
Trạng thái thực tế
Vị trí dự kiến
Vị trí thực tế
Kết quả kiểm kê
Ghi chú tình trạng
Người kiểm kê
Thời điểm kiểm kê
```

Inventory phải tạo đợt kiểm kê, giao technician, manager phê duyệt, ghi nhận từng item có mặt/thiếu/hỏng/sai vị trí/sai trạng thái/chênh lệch dữ liệu.

---

### Microtask B4.2 — Không ghi đè lịch sử kiểm kê

**Yêu cầu**

* Một đợt kiểm kê là snapshot.
* Không sửa phá lịch sử đợt cũ.
* Nếu cập nhật kết quả thì ghi rõ updated/log hoặc giữ audit trail nếu hệ thống có.

---

## B5. Disposal / Thu hủy

### Microtask B5.1 — Sửa rule đề xuất thu hủy

**Rule**

```text
depreciation >= 75% → hiển thị trong danh sách đề xuất thu hủy
```

**Không làm**

```text
Không dùng 90%
Không tự chuyển status nếu chưa xác nhận
Không tự xóa thiết bị khỏi hệ thống
```

Handover ghi rõ depreciation trên 75% chỉ tạo đề xuất thu hủy, không tự động chuyển status; thu hủy là thao tác xác nhận của manager/technician.

---

### Microtask B5.2 — Form xác nhận thu hủy

**Form cần có**

```text
Thiết bị
Lý do thu hủy
Giá trị còn lại/book value
Giá trị thu hồi nếu có
Ngày thu hủy
Người lập
Người phê duyệt
Ghi chú
```

Disposals cần người lập, ngày thu hủy, giá trị thu hồi, ghi chú, người phê duyệt; DisposalDetails gắn từng thiết bị bị thu hủy.

---

### Microtask B5.3 — Khóa thao tác sau thu hủy

**Yêu cầu**

Thiết bị đã thu hủy/retired/disposed:

* Không được bàn giao.
* Không được tạo sửa chữa mới.
* Không xuất hiện trong dropdown thiết bị khả dụng.
* Không tính vào thiết bị active.
* Vẫn xem được lịch sử.

---

# 4. Cách phối hợp 2 luồng để tránh conflict

## Quy tắc chia file

| Khu vực                  | Luồng A                  | Luồng B                   |
| ------------------------ | ------------------------ | ------------------------- |
| `Sidebar.jsx`            | Sửa chính                | Không sửa                 |
| `i18n/locales`           | Sửa chính                | Chỉ thêm key cần thiết    |
| `ReportPage.jsx`         | Sửa chính                | Không sửa trừ API shape   |
| `PurchaseOrdersPage.jsx` | Không sửa nếu B đang sửa | Sửa chính                 |
| `HandoverPage.jsx`       | Không sửa                | Sửa chính                 |
| `MaintenancePage.jsx`    | Không sửa                | Sửa chính                 |
| `InventoryPage.jsx`      | Không sửa                | Sửa chính                 |
| `DisposalPage.jsx`       | Không sửa                | Sửa chính                 |
| Controllers/Models       | Chỉ đọc                  | Sửa chính nếu cần         |
| Tests                    | Có thể thêm UI/API smoke | Có thể thêm feature tests |

---

# 5. Definition of Done chung

Một microtask chỉ được coi là xong khi có đủ:

```text
1. Đã mô tả file sửa.
2. Đã nói rõ sửa vì nghiệp vụ nào.
3. Không làm lan sang scope khác.
4. Không tạo request type mới.
5. Không phá legacy route.
6. Không để UI bấm không phản hồi.
7. npm run check:i18n pass nếu sửa text.
8. npm run build pass nếu sửa frontend.
9. php artisan test pass nếu sửa backend.
10. Có hướng dẫn test tay theo role liên quan.
```

---
