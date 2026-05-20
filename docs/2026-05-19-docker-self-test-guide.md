# Audit & Fix Plan: Mesoco IT Asset Management (2026-05-19)

**Ngày:** 2026-05-19  
**Audit by:** AI agent (read-only, không sửa code)  
**Scope:** So sánh codebase hiện tại vs. kế hoạch sửa từ needtofix.pdf  
**Output:** Đề xuất 2-3 cách sửa cho P0 items kèm ưu/nhược điểm

---

## Phần I: Tóm Tắt Hiện Trạng

### 1. Sidebar / Navigation (resources/js/layouts/Sidebar.jsx)

**Hiện trạng:**
- Dashboard (Tổng quan) ✅ đứng đầu (L144)
- `qrScan` lồng trong `bfd-operations` group → **1 cấp con** (L154, 189)
- `reviewRequests` lồng trong `bfd-operations` → **1 cấp con** (L156)
- 6 nhóm BFD chính: `bfd-catalog`, `bfd-orders`, `bfd-operations`, `bfd-maintenance`, `bfd-inventory-disposal`, `bfd-records`, `bfd-reports` (L143-210)
- Technician không có `reviewRequests` ✅ (đúng vì technician không duyệt request)

**Vấn đề vs. needtofix:**
- Need2fix: "Quét QR thành mục chính dưới Tổng quan" → Hiện nằm trong group `bfd-operations`
- Need2fix: "Phê duyệt phiếu yêu cầu thành mục chính" → Hiện nằm trong group `bfd-operations`
- Label nhóm dùng "BFD" (docs/BFD.md:5 nói không hiển thị BFD cho người dùng) → wording cần cân nhắc

### 2. Purchase Orders (PurchaseOrdersPage.jsx + PurchaseOrderController + StorePurchaseOrderRequest)

**Hiện trạng:**
- **Status model** (app/Models/PurchaseOrder.php:10-26):
  - Constants: `STATUS_PREPARING`, `STATUS_SHIPPING`, `STATUS_DELIVERED`
  - `statusOptions()` trả `[preparing, delivered]` (L45) → user-facing chỉ 2 trạng thái ✅
  - `displayStatus()` map: `delivered` → "Giao hàng thành công", else → "Chờ giao hàng" (L60-65) ✅

- **Form validation** (app/Http/Requests/StorePurchaseOrderRequest.php):
  - `order_date` bắt buộc (L15)
  - `expected_delivery_date` optional (L16)
  - `payment_method` optional (L19) ✅ (không bắt buộc)
  - `items.*.unit_price` optional (L28) ✅ (không bắt buộc)
  - `items.*.asset_id` optional (L29) ✅ (cho phép item mới chưa có asset)
  - Yêu cầu: `supplier_id`, `items` (bắt buộc, array, min:1) ✅

- **Frontend** (resources/js/pages/PurchaseOrdersPage.jsx):
  - `getStatusLabel()` L47-56: map `preparing` → "Chờ giao hàng", `delivered` → "Giao hàng thành công" ✅
  - Nút Sửa/Xóa nằm trong column "Thao tác" của bảng (L218 → `<button>Sửa</button>`, `<button>Xóa</button>`)
  - Detail modal hiển thị order + items

**Vấn đề vs. needtofix:**
- Need2fix: "Nút Sửa/Xóa ngoài bảng đổi thành Chi tiết; trong chi tiết mới có Sửa, Xóa" → Hiện Sửa/Xóa ở trong bảng (inline actions)
- Việc tạo đơn hàng **logic ổn**, nhưng UI cần điều chỉnh layout

### 3. Reports (ReportPage.jsx + ReportController)

**Hiện trạng:**
- **Frontend** (resources/js/pages/ReportPage.jsx:95-98):
  ```javascript
  [
    { key: 'device_status', label: 'Báo cáo trạng thái thiết bị', exportable: true },
    { key: 'depreciation_remaining_value', label: 'Báo cáo khấu hao / giá trị còn lại', exportable: true },
    { key: 'disposal_proposal', label: 'Báo cáo đề xuất thu hủy', exportable: true },
    { key: 'lifecycle_analysis', label: 'Báo cáo phân tích vòng đời', exportable: true, method: 'rule_based' }
  ]
  ```
  - 4 loại báo cáo định nghĩa ✅
  - Nút "Xuất" tồn tại (L156-159)

- **Backend** (app/Http/Controllers/ReportController.php):
  - `summary()` method tồn tại (L28), trả `assets`, `maintenance`, `disposal`, `inventory` stats
  - `reportTypes()` định nghĩa 4 report types (L39-56)
  - **NHƯNG:** Không tìm thấy endpoint `/api/reports/export` hoặc `/api/reports/{type}` để thực sự generate/export report
  - `handleExport()` frontend gọi `reportsApi.export({type})` (L72) → backend chưa implement ❌

**Vấn đề vs. needtofix:**
- Need2fix: "Báo cáo không tạo được. Phải sửa để tạo/xuất được" → **Backend thiếu export endpoint**

### 4. Requests & Review Requests (RequestController + ReviewRequestController + AssetRequest Model)

**Hiện trạng:**
- **AssetRequest Model** (app/Models/AssetRequest.php):
  - `REQUESTABLE_TYPES = ['JUSTIFICATION', 'CONSUMABLE_REQUEST']` (L17)
  - `STATUSES = ['SUBMITTED', 'APPROVED', 'REJECTED']` (L22)
  - Không có enum để request type "Bàn giao", "Thu hồi", "Sửa chữa", "Thu hủy" ✅ (đúng, những cái này là workflow display category, không phải request type)

- **RequestController** (app/Http/Controllers/RequestController.php):
  - Line 14-16: Query scoping - Employee/technician thấy chỉ request của họ, manager thấy all
  - Không có logic kiểm tra "asset phải được handed-over" khi tạo repair request ❌

- **ReviewRequestController** (app/Http/Controllers/ReviewRequestController.php):
  - `can('viewReviewQueue', AssetRequest::class)` (L24) → manager-only ✅
  - Default filter `status = SUBMITTED` (L47) → hiển thị pending requests ✅

**Vấn đề vs. needtofix:**
- Need2fix: "Yêu cầu sửa chữa chỉ cho chọn thiết bị đã được bàn giao" → Backend không kiểm tra asset eligibility ❌

### 5. Maintenance & Repair Log (MaintenanceEventController + MaintenanceEvent Model + repair_logs table)

**Hiện trạng:**
- **Schema** (schema.sql):
  - `maintenance_events` table: `id`, `asset_id`, `type`, `status`, `planned_at`, `assigned_to_user_id`, etc. ✅
  - `maintenance_details` table: chi tiết task/asset cụ thể, `issue_description`, `action_taken`, `cost`, `completed_at` ✅
  - `repair_logs` table: `asset_id`, `maintenance_event_id`, `issue_description`, `action_taken`, `completed_at` ✅ (duplicate/alternative?)

**Vấn đề vs. needtofix:**
- Có table `repair_logs` nhưng chưa rõ được dùng hay không, hay dùng `maintenance_details` thay thế
- Need2fix: "Thêm nhật ký sửa chữa" (append-only log) → Logic chưa clear

### 6. Inventory & Planning

**Hiện trạng:**
- **Schema** (schema.sql):
  - `inventory_checks` table: `code`, `title`, `check_date`, `status`, `created_by_user_id`, `completed_by_user_id` ✅
  - `inventory_check_items` table: chi tiết từng asset, `expected_status`, `actual_status`, `result`, `condition_note` ✅

**Vấn đề vs. needtofix:**
- Need2fix: "Lập kế hoạch kiểm kê" (có nút tạo/lập kế hoạch) → Schema có nhưng UI/API không rõ implement bao nhiêu

### 7. Labels & Terminology (i18n + UI)

**Hiện trạng:**
- resources/js/i18n/ không tìm thấy file `.json` (có thể là `.js` hoặc khác), cần verify

**Vấn đề vs. needtofix:**
- "Sửa label + terminology: UI dùng 'Thiết bị', không dùng lẫn 'Tài sản'" → Cần scan toàn bộ UI để kiểm tra consistency
- trich_xuat_field_erd_ui_thiet_bi.md:1 nói "toàn bộ từ 'Tài sản' trên giao diện nên đổi thành 'Thiết bị'" ✅ (guideline rõ)

---

## Phần II: Đề Xuất 2-3 Cách Sửa cho Mỗi P0 Item

### P0-01: Sửa Navigation/Menu

**Yêu cầu:**
- `Tổng quan` lên đầu ✅ (đã đúng)
- `Quét QR` thành mục chính dưới `Tổng quan`
- `Phê duyệt phiếu yêu cầu` thành mục chính
- `Hồ sơ` là hồ sơ người dùng, nằm trong `Quản lý danh mục và hồ sơ`
- Xóa/ẩn "Sơ đồ chức năng BFD" khỏi UI khách

---

**Đề xuất Cách 1: Refactor sidebar structure thành flat top-level items**

**Code location:** `resources/js/layouts/Sidebar.jsx` L143-235

**Chi tiết:**
```javascript
// BEFORE: (L154-156)
bfdGroup('bfd-operations', 'nav.bfdOperations', 'requests', [
    navItems.requests,
    navItems.handover,
    navItems.reviewRequests,  // Lồng
    navItems.qrScan,          // Lồng
]),

// AFTER:
navItems.qrScan,              // Top-level
navItems.reviewRequests,       // Top-level (manager only)
bfdGroup('bfd-operations', 'nav.operations', 'requests', [
    navItems.requests,
    navItems.handover,
]),
```

**Ưu điểm:**
- ✅ Giải quyết trực tiếp yêu cầu "mục chính"
- ✅ QR scan dễ truy cập (high priority)
- ✅ Minimal code change (~20 dòng trong Sidebar.jsx)

**Nhược điểm:**
- ❌ Sidebar có thêm 2 item top-level → Visual crowding (7+ items)
- ❌ Chưa giải quyết vấn đề "hồ sơ người dùng" (cần thêm profile page/section)

---

**Đề xuất Cách 2: Tạo section "Quick Access" cho QR + Review, giữ BFD groups**

**Code location:** `resources/js/layouts/Sidebar.jsx` L143-235

**Chi tiết:**
```javascript
// Tạo section "Truy cập nhanh" (Quick Access)
const navSections = [
    {
        id: 'quick-access',
        label: sectionLabel('Truy cập nhanh', 'Quick access'),
        items: [
            navItems.dashboard,
            navItems.qrScan,
            ...(isManager ? [navItems.reviewRequests] : []),
        ],
    },
    {
        id: 'main',
        label: sectionLabel('Quản lý', 'Management'),
        items: bfdItems.filter(item => item.id !== 'dashboard' && item.id !== 'qr-scan' && item.id !== 'review-requests'),
    },
];
```

**Ưu điểm:**
- ✅ QR & Review đứng đầu, dễ truy cập
- ✅ Giữ structure BFD groups (không loạn)
- ✅ Nhân viên/technician cũng thấy QR ở top
- ✅ Không phá vỡ hierarchy hiện tại

**Nhược điểm:**
- ❌ Thêm navigation section header mới → chưa confirm customer có chấp nhận không
- ❌ Cần update i18n key `nav.quickAccess`

---

**Đề xuất Cách 3: Giữ nguyên structure, chỉ đổi label & order trong bfdGroup**

**Code location:** `resources/js/layouts/Sidebar.jsx` + i18n

**Chi tiết:**
- Giữ QR & Review trong `bfd-operations`
- Nhưng đổi label nhóm từ "Khối vận hành" → "Vận hành & Duyệt phiếu"
- Đảo vị trí: QR lên đầu, ReviewRequests thứ 2

```javascript
bfdGroup('bfd-operations', 'nav.operationsAndApproval', 'requests', [
    navItems.qrScan,
    navItems.reviewRequests,
    navItems.requests,
    navItems.handover,
]),
```

**Ưu điểm:**
- ✅ Minimal change (label + order)
- ✅ Vẫn giữ grouping logic
- ✅ Dễ rollback nếu customer không hài lòng

**Nhược điểm:**
- ❌ QR & Review vẫn không phải "mục chính" (chỉ first item trong group)
- ❌ Không giải quyết hoàn toàn yêu cầu "thành mục chính"

---

**Khuyến nghị:** **Cách 1** nếu customer strict yêu cầu "mục chính" (top-level), **Cách 2** nếu muốn balance ux + cấu trúc.

---

### P0-02: Sửa Dashboard Overview UI Labels

**Yêu cầu:**
- Dashboard là Tổng quan, không nested
- Cards: Tổng thiết bị, Tổng giá trị còn lại, thiết bị đang bàn giao/bảo trì/đề xuất thu hủy
- Dùng >=75% depreciation threshold cho đề xuất thu hủy (không 90%)

---

**Đề xuất Cách 1: Thêm depreciation card vào Dashboard**

**Code location:** `resources/js/pages/Dashboard.jsx` + `app/Http/Controllers/ReportController.php` (getAssetStats)

**Chi tiết:**
```javascript
// ReportController.php - Thêm logic depreciation threshold
protected function getAssetStats(): array {
    $deprecatedCount = Asset::whereRaw('(purchase_cost - salvage_value) / useful_life_months * depreciation_rate >= 75')
        ->count();  // Hoặc dùng computed column nếu có
    
    return [
        'total' => $total,
        'active' => $active,
        'deprecation_threshold_75_pct' => $deprecatedCount,  // Thêm field này
        // ...
    ];
}

// Dashboard.jsx - Render card
<DashboardCard 
    title="Thiết bị ≥75% khấu hao"
    value={stats.deprecation_threshold_75_pct}
    link="/reports#disposal_proposal"
/>
```

**Ưu điểm:**
- ✅ Tính toán real-time, không hardcode threshold
- ✅ Link trực tiếp tới disposal_proposal report
- ✅ Customer thấy ngay số thiết bị cần xem xét thu hủy

**Nhược điểm:**
- ❌ Cần verify depreciation logic ở backend (có tính đúng không?)
- ❌ Nếu schema missing depreciation fields → cần thêm migration

---

**Đề xuất Cách 2: Hiển thị stats từ endpoint `/api/reports/summary` sẵn có**

**Code location:** `resources/js/pages/Dashboard.jsx` + optimize `ReportController.php::summary()`

**Chi tiết:**
- Gọi `GET /api/reports/summary` (đã có endpoint)
- Parse response để lấy `assets.deprecation_threshold_75_pct` nếu có, hoặc tính client-side
- Render 5 cards: Total, Active, Maintenance, Off-Service, Deprecated >=75%

**Ưu điểm:**
- ✅ Reuse endpoint hiện có (không thêm endpoint mới)
- ✅ Summary API trả stats full → flexible
- ✅ Không cần thay đổi ReportController

**Nhược điểm:**
- ❌ Endpoint summary chưa trả deprecation count → cần thêm code
- ❌ Client-side tính toán depreciation % có thể sai nếu logic mất ở backend

---

**Đề xuất Cách 3: Tạo endpoint riêng `/api/dashboard/stats` cho dashboard**

**Code location:** New endpoint `DashboardController.php::stats()`

**Chi tiết:**
```php
// app/Http/Controllers/DashboardController.php
public function stats(Request $request): JsonResponse {
    $user = $request->user();
    
    return response()->json([
        'total_devices' => Asset::count(),
        'value_total' => Asset::sum('purchase_cost'),
        'value_remaining' => Asset::sum('salvage_value'),
        'assigned_count' => Asset::whereIn('status', ['assigned', 'maintenance'])->count(),
        'maintenance_count' => Asset::where('status', 'maintenance')->count(),
        'deprecated_75_pct' => Asset::where('deprecation_rate', '>=', 0.75)->count(),
    ]);
}
```

**Ưu điểm:**
- ✅ Dedicated endpoint cho dashboard → tối ưu query
- ✅ Rõ ràng về data structure
- ✅ Dễ mở rộng thêm stats khác

**Nhược điểm:**
- ❌ Thêm endpoint mới → thêm code
- ❌ Duplicate logic nếu ReportController cũng tính

---

**Khuyến nghị:** **Cách 2** (quick fix, reuse `summary()`). Nếu có thời gian → **Cách 3** (clean architecture).

---

### P0-03: Sửa Form/Filter: Dropdown cho Master Data

**Yêu cầu:**
- Locations, categories, status, supplier, user/technician, asset dùng select/searchable select
- Không free text nếu dữ liệu đã có danh mục
- Nút "Xóa bộ lọc" ngang hàng với nút "Lọc"

---

**Đề xuất Cách 1: Batch update UI pages (Assets, PurchaseOrders, Maintenance, Inventory, Requests)**

**Code location:** Mỗi page `resources/js/pages/*.jsx`

**Chi tiết:**
- Thay `<input type="text">` → `<Select>`/`<Combobox>` cho category, location, status
- Fetch dropdown options từ API endpoint (hoặc hardcode nếu static)
- Add "Xóa bộ lọc" button ngang hàng `<button>Lọc</button>`

**Ví dụ:**
```javascript
// AssetsPage.jsx
<div className="filter-row">
    <Select 
        name="category"
        options={categories}  // fetch từ /api/categories
        placeholder="Chọn danh mục..."
    />
    <Select 
        name="location"
        options={locations}  // fetch từ /api/locations
        placeholder="Chọn vị trí..."
    />
    <Select 
        name="status"
        options={[
            { value: 'active', label: 'Sẵn sàng' },
            { value: 'assigned', label: 'Đã bàn giao' },
            { value: 'maintenance', label: 'Đang bảo trì' },
            { value: 'retired', label: 'Đã thu hủy' },
        ]}
        placeholder="Chọn trạng thái..."
    />
    <button onClick={handleFilter}>Lọc</button>
    <button onClick={handleClearFilter}>Xóa bộ lọc</button>
</div>
```

**Ưu điểm:**
- ✅ Tránh typo user input
- ✅ UX tốt hơn (autocomplete)
- ✅ Consistent across pages

**Nhược điểm:**
- ❌ Công việc lớn (~15 pages cần update)
- ❌ Cần create/verify API endpoints để fetch dropdown data

---

**Đề xuất Cách 2: Tạo reusable FilterForm component**

**Code location:** `resources/js/components/FilterForm.jsx` (new) + pages dùng

**Chi tiết:**
```javascript
// components/FilterForm.jsx
export const FilterForm = ({ 
    fields = [],  // [{ name: 'category', type: 'select', options: [...], ... }]
    onFilter,
    onClear,
}) => {
    const [filters, setFilters] = useState({});
    
    return (
        <div className="filter-form">
            {fields.map(field => (
                <div key={field.name}>
                    {field.type === 'select' && (
                        <Select 
                            name={field.name}
                            options={field.options}
                            onChange={(e) => setFilters({...filters, [field.name]: e.value})}
                        />
                    )}
                    {/* ... other field types */}
                </div>
            ))}
            <button onClick={() => onFilter(filters)}>Lọc</button>
            <button onClick={() => { onClear(); setFilters({}); }}>Xóa bộ lọc</button>
        </div>
    );
};

// Usage in AssetsPage.jsx
<FilterForm 
    fields={[
        { name: 'category', type: 'select', options: categoryOptions },
        { name: 'location', type: 'select', options: locationOptions },
        { name: 'status', type: 'select', options: statusOptions },
    ]}
    onFilter={handleFilter}
    onClear={handleClearFilters}
/>
```

**Ưu điểm:**
- ✅ DRY principle (code reuse)
- ✅ Consistent UI cross pages
- ✅ Easier to maintain

**Nhược điểm:**
- ❌ Cần thêm component file + testing
- ❌ Phức tạp hơn nếu filter logic khác nhau per page

---

**Đề xuất Cách 3: Tập trung sửa chỉ P0 pages (Assets, PurchaseOrders, Requests, Maintenance)**

**Code location:** 4 pages chính

**Chi tiết:**
- Ưu tiên fix AssetsPage (most used) + PurchaseOrdersPage + ReviewRequestsPage + MaintenancePage
- Sửa step-by-step, test từng page
- Để sau P0 fix các page khác (InventoryPage, DisposalPage, ...)

**Ưu điểm:**
- ✅ Focus + faster delivery
- ✅ Giải quyết 80% user pain point
- ✅ Dễ phân chia công việc song parallel

**Nhược điểm:**
- ❌ Inconsistent UX nếu một page còn free-text
- ❌ Sau P0 vẫn cần patch page còn lại

---

**Khuyến nghị:** **Cách 3** (pragmatic). P0 chỉ cần 4 pages chính. Cách 2 có thể áp dụng nếu có dev time thêm.

---

### P0-04: Sửa Purchase Order UI/UX Layout

**Yêu cầu:**
- Status chỉ `Chờ giao hàng` + `Giao hàng thành công` ✅ (backend đã đúng)
- Replace `Sửa/Xóa` → `Chi tiết` ngoài bảng
- Trong detail: header + items + fields, rồi `Sửa` + `Xóa` at bottom
- Delete phải confirm
- Create order: supplier + devices + unit + qty + note (không cần unit_price, payment)
- Note nullable ✅ (form rule `nullable`)

---

**Đề xuất Cách 1: Refactor table layout + thêm modal chi tiết**

**Code location:** `resources/js/pages/PurchaseOrdersPage.jsx` (~L218-250 table actions)

**Chi tiết:**
```javascript
// BEFORE: (inline actions)
<td>
    <button>Sửa</button>
    <button>Xóa</button>
</td>

// AFTER: (chi tiết → modal)
<td>
    <button onClick={() => openDetailModal(order.id)}>Chi tiết</button>
</td>

// Detail Modal
<Modal open={selectedOrder}>
    <div className="order-header">
        <h3>{selectedOrder.order_code}</h3>
        <p>Supplier: {selectedOrder.supplier.name}</p>
        <p>Status: {selectedOrder.status}</p>
    </div>
    
    <div className="order-items">
        <h4>Danh sách hàng</h4>
        <table>
            {selectedOrder.items.map(item => (
                <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.qty}</td>
                    <td>{item.unit}</td>
                </tr>
            ))}
        </table>
    </div>
    
    <div className="order-actions">
        <button onClick={handleEdit}>Sửa</button>
        <button onClick={handleDelete}>Xóa</button>
    </div>
</Modal>
```

**Ưu điểm:**
- ✅ Hiển thị rõ ràng order details
- ✅ Delete action phải mở modal → tự confirm
- ✅ Không lộn lẫn với table layout

**Nhược điểm:**
- ❌ Cần thêm modal component (hoặc dùng Headless UI)
- ❌ 2 HTTP request: list + show detail (optimize bằng cách include trong list response)

---

**Đề xuất Cách 2: Dùng expandable row (accordion style)**

**Code location:** `resources/js/pages/PurchaseOrdersPage.jsx` + React component library (ví dụ Radix UI)

**Chi tiết:**
```javascript
// Table with expandable detail row
<table>
    <tbody>
        {orders.map(order => (
            <React.Fragment key={order.id}>
                <tr className="order-row" onClick={() => toggleExpand(order.id)}>
                    <td>{order.order_code}</td>
                    <td>{order.supplier.name}</td>
                    <td>{order.status}</td>
                    <td>
                        <button onClick={() => openDetailView(order.id)}>Chi tiết</button>
                    </td>
                </tr>
                {expanded[order.id] && (
                    <tr className="detail-row">
                        <td colSpan="4">
                            <div className="order-detail">
                                <Items table />
                                <div className="actions">
                                    <button>Sửa</button>
                                    <button onClick={handleDelete}>Xóa</button>
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </React.Fragment>
        ))}
    </tbody>
</table>
```

**Ưu điểm:**
- ✅ Tất cả details inline (không modal)
- ✅ Dễ nhìn lịch sử expand/collapse
- ✅ Actions (Sửa/Xóa) ở detail row

**Nhược điểm:**
- ❌ Table có thể dài nếu mở nhiều row
- ❌ Cần CSS cẩn thận để UI đẹp

---

**Đề xuất Cách 3: Separate detail page (`/purchase-orders/:id`)**

**Code location:** Routes + new page component

**Chi tiết:**
```javascript
// routes.jsx
<Route path="/purchase-orders/:id" element={<PurchaseOrderDetailPage />} />

// PurchaseOrderDetailPage.jsx
export default function PurchaseOrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    
    useEffect(() => {
        fetch(`/api/purchase-orders/${id}`)
            .then(res => res.json())
            .then(data => setOrder(data.data));
    }, [id]);
    
    return (
        <div className="order-detail-page">
            <header>
                <h1>{order?.order_code}</h1>
                <Link to="/purchase-orders">← Quay lại</Link>
            </header>
            
            <section className="order-info">
                <p>Nhà cung cấp: {order?.supplier.name}</p>
                <p>Trạng thái: {order?.status}</p>
                <p>Ngày lập: {order?.order_date}</p>
            </section>
            
            <section className="order-items">
                <h3>Danh sách hàng</h3>
                <table>{/* items */}</table>
            </section>
            
            <footer className="order-actions">
                <button onClick={handleEdit}>Sửa</button>
                <button onClick={handleDelete}>Xóa</button>
            </footer>
        </div>
    );
}
```

**Ưu điểm:**
- ✅ Clean separation (list vs. detail)
- ✅ Full screen để see tất cả info
- ✅ Dễ add thêm related info (history, timeline, etc.)
- ✅ Deep link friendly (bookmark detail page)

**Nhược điểm:**
- ❌ Thêm route + page component
- ❌ Back button → navigate back (UX cần care)

---

**Khuyến nghị:** **Cách 3** (best practice). **Cách 1** nếu không muốn thêm route.

---

### P0-05: Sửa Request/Repair Constraint

**Yêu cầu:**
- Yêu cầu sửa chữa chỉ cho chọn thiết bị **đã được bàn giao**
- Nhân viên/kỹ thuật viên chỉ xem phiếu của mình
- Kỹ thuật viên chỉ xem phiếu sửa chữa mà mình phụ trách

---

**Đề xuất Cách 1: Thêm validation rule & API scope ở backend**

**Code location:** `app/Http/Controllers/RequestController.php` + `app/Http/Requests/StoreRequestRequest.php`

**Chi tiết:**
```php
// app/Http/Requests/StoreRequestRequest.php - Thêm validation
public function rules(): array {
    return [
        'type' => ['required', 'in:JUSTIFICATION,CONSUMABLE_REQUEST'],
        'asset_id' => ['required_if:type,JUSTIFICATION', 
                       'integer', 
                       'exists:assets,id',
                       new ValidateAssetHanded  // Custom rule],
        // ...
    ];
}

// Custom rule class
class ValidateAssetHanded implements ValidationRule {
    public function validate($attribute, $value, $fail): void {
        $asset = Asset::find($value);
        $user = auth()->user();
        
        // Check nếu request type là JUSTIFICATION/REPAIR
        // thì asset phải assigned tới employee hiện tại
        if (!$asset->isAssignedTo($user->employee)) {
            $fail('Thiết bị này chưa được bàn giao cho bạn.');
        }
    }
}

// RequestController - Thêm scope
public function index(HttpRequest $httpRequest): JsonResponse {
    // ...
    $shouldScopeToSelf = $httpRequest->boolean('mine') || !$user->isManager();
    
    if ($shouldScopeToSelf) {
        $query->byRequester($employee->id);
        
        // Nếu là JUSTIFICATION, chỉ show assigned assets
        if ($httpRequest->input('type') === 'JUSTIFICATION') {
            $query->whereHas('asset', function ($assetQuery) use ($employee) {
                $assetQuery->where('assigned_to_employee_id', $employee->id);
            });
        }
    }
}
```

**Ưu điểm:**
- ✅ Server-side validation (không bị bypass)
- ✅ Rõ ràng logic: JUSTIFICATION ← assigned assets
- ✅ API response tự động filter (frontend không cần logic)

**Nhược điểm:**
- ❌ Cần cấu hình relationship `asset.assigned_to_employee_id` hoặc dùng `asset_assignments` table
- ❌ Thêm query complexity

---

**Đề xuất Cách 2: Frontend validation + API endpoint riêng cho assigned assets**

**Code location:** `resources/js/pages/RequestsPage.jsx` + `app/Http/Controllers/AssetController.php`

**Chi tiết:**
```php
// app/Http/Controllers/AssetController.php - New endpoint
public function assignedToMe(Request $request): JsonResponse {
    $employee = $request->user()->employee;
    
    $assets = Asset::whereHas('assignments', function ($query) use ($employee) {
        $query->where('employee_id', $employee->id)
              ->whereNull('unassigned_at');  // Currently assigned
    })->select('id', 'asset_code', 'name')->get();
    
    return response()->json(['data' => $assets]);
}

// Frontend
export function RequestsPage() {
    const [assignedAssets, setAssignedAssets] = useState([]);
    
    useEffect(() => {
        fetch('/api/my-assets/assigned')
            .then(res => res.json())
            .then(data => setAssignedAssets(data.data));
    }, []);
    
    return (
        <form onSubmit={handleSubmit}>
            <Select 
                name="asset_id"
                options={assignedAssets.map(a => ({ value: a.id, label: a.name }))}
                placeholder="Chọn thiết bị đã được bàn giao..."
            />
            {/* ... */}
        </form>
    );
}
```

**Ưu điểm:**
- ✅ Dedicated endpoint (semantic)
- ✅ Frontend get fresh list of assigned assets
- ✅ Dễ debug (dedicated network call)

**Nhược điểm:**
- ❌ 1 HTTP request thêm khi load page
- ❌ Cần cấu hình endpoint routing

---

**Đề xuất Cách 3: Role-based approach + Include assigned assets trong GET /api/requests response**

**Code location:** `RequestController::index()` + model

**Chi tiết:**
```php
// RequestController
public function index(HttpRequest $httpRequest): JsonResponse {
    // ...
    $response = [
        'requests' => [...],
        'pagination' => [...],
        'available_types' => AssetRequest::REQUESTABLE_TYPES,
        'available_statuses' => AssetRequest::STATUSES,
    ];
    
    // Include assigned assets if user is employee/technician
    if (!$user->isManager()) {
        $employee = $user->employee;
        $response['assigned_assets'] = Asset::whereHas('assignments', function ($q) use ($employee) {
            $q->where('employee_id', $employee->id)->whereNull('unassigned_at');
        })->select('id', 'asset_code', 'name')->get();
    }
    
    return response()->json($response);
}
```

**Ưu điểm:**
- ✅ Single HTTP request (list requests + assigned assets cùng lúc)
- ✅ Dễ triển khai (reuse RequestController)
- ✅ Giảm network overhead

**Nhược điểm:**
- ❌ Response payload lớn hơn
- ❌ Cần refactor response structure (backward compatible?)

---

**Khuyến nghị:** **Cách 1** (most robust). **Cách 3** (most efficient).

---

### P0-06: Sửa Báo Cáo Không Tạo Được

**Yêu cầu:**
- Báo cáo tạo/xuất được
- Ít nhất 2 loại: equipment status + lifecycle/depreciation/disposal
- Không crash với dữ liệu trống
- Respect >=75% threshold

---

**Đề xuất Cách 1: Implement export endpoint + export to JSON/CSV**

**Code location:** `app/Http/Controllers/ReportController.php` + route

**Chi tiết:**
```php
// routes/api.php
Route::post('/reports/export', [ReportController::class, 'export'])->middleware('auth:sanctum');

// ReportController
public function export(Request $request): StreamedResponse {
    $type = $request->input('type');
    $fromDate = Carbon::parse($request->input('from', now()->startOfMonth()))->startOfDay();
    $toDate = Carbon::parse($request->input('to', now()->endOfMonth()))->endOfDay();
    
    $data = match ($type) {
        'device_status' => $this->getDeviceStatusData(),
        'deprecation_remaining_value' => $this->getDepreciationData($fromDate, $toDate),
        'disposal_proposal' => $this->getDisposalProposalData(),
        default => [],
    };
    
    // Export to CSV
    $filename = "report_{$type}_" . now()->format('YmdHis') . ".csv";
    
    return response()->streamDownload(function () use ($data) {
        $fp = fopen('php://output', 'w');
        foreach ($data as $row) {
            fputcsv($fp, $row);
        }
        fclose($fp);
    }, $filename, ['Content-Type' => 'text/csv']);
}

protected function getDeviceStatusData(): array {
    $assets = Asset::with('category:id,name', 'supplier:id,name')
        ->select('id', 'asset_code', 'name', 'category_id', 'supplier_id', 'status', 'created_at')
        ->get();
    
    $data = [['Mã thiết bị', 'Tên thiết bị', 'Danh mục', 'Nhà cung cấp', 'Trạng thái', 'Ngày tạo']];
    
    foreach ($assets as $asset) {
        $data[] = [
            $asset->asset_code,
            $asset->name,
            $asset->category->name ?? '',
            $asset->supplier->name ?? '',
            $asset->status,
            $asset->created_at->format('Y-m-d'),
        ];
    }
    
    return $data;
}

protected function getDisposalProposalData(): array {
    // Assets with >=75% depreciation
    $assets = Asset::whereRaw('(purchase_cost - salvage_value) / NULLIF(useful_life_months, 0) >= purchase_cost * 0.75')
        ->select('id', 'asset_code', 'name', 'purchase_cost', 'deprecation_rate')
        ->get();
    
    $data = [['Mã thiết bị', 'Tên thiết bị', 'Giá mua', 'Tỷ lệ khấu hao', 'Trạng thái đề xuất']];
    
    foreach ($assets as $asset) {
        $data[] = [
            $asset->asset_code,
            $asset->name,
            $asset->purchase_cost,
            round($asset->deprecation_rate * 100, 2) . '%',
            'Đề xuất thu hủy',
        ];
    }
    
    return $data;
}
```

**Ưu điểm:**
- ✅ Export ra file (user có hard copy)
- ✅ Có data processing logic rõ ràng
- ✅ Dễ mở rộng thêm report type

**Nhược điểm:**
- ❌ Query SQL có thể không chính xác (cần verify depreciation logic)
- ❌ CSV format đơn giản (không có formatting)

---

**Đề xuất Cách 2: Implement export to Excel (XLSX) bằng Laravel Excel**

**Code location:** `app/Http/Controllers/ReportController.php` + composer require `maatwebsite/excel`

**Chi tiết:**
```php
// composer.json thêm dependency
"maatwebsite/excel": "^3.1"

// ReportController::export()
public function export(Request $request) {
    $type = $request->input('type');
    $fromDate = Carbon::parse($request->input('from'))->startOfDay();
    $toDate = Carbon::parse($request->input('to'))->endOfDay();
    
    return match ($type) {
        'device_status' => Excel::download(
            new DeviceStatusExport(),
            "device_status_" . now()->format('YmdHis') . ".xlsx"
        ),
        'disposal_proposal' => Excel::download(
            new DisposalProposalExport($fromDate, $toDate),
            "disposal_proposal_" . now()->format('YmdHis') . ".xlsx"
        ),
        default => response()->json(['error' => 'Invalid type'], 400),
    };
}

// app/Exports/DeviceStatusExport.php
class DeviceStatusExport implements FromCollection, WithHeadings {
    public function collection() {
        return Asset::with('category', 'supplier')
            ->select('asset_code', 'name', 'category_id', 'supplier_id', 'status', 'created_at')
            ->get()
            ->map(fn ($a) => [
                $a->asset_code,
                $a->name,
                $a->category->name ?? '',
                $a->supplier->name ?? '',
                $a->status,
                $a->created_at->format('Y-m-d'),
            ]);
    }
    
    public function headings(): array {
        return ['Mã thiết bị', 'Tên thiết bị', 'Danh mục', 'Nhà cung cấp', 'Trạng thái', 'Ngày tạo'];
    }
}
```

**Ưu điểm:**
- ✅ Export XLSX (professional, editable)
- ✅ Dùng library chuyên dụng (reliable)
- ✅ Support styling, formulas if needed

**Nhược điểm:**
- ❌ Thêm dependency (~30MB)
- ❌ Thêm class file per export
- ❌ Phục tạp hơn CSV

---

**Đề xuất Cách 3: Tạo HTML report view + CSS print-friendly**

**Code location:** `resources/views/reports/...blade.php` + `ReportController`

**Chi tiết:**
```php
// ReportController::show($type)
public function show(Request $request, string $type) {
    $data = match ($type) {
        'device_status' => $this->getDeviceStatusData(),
        'disposal_proposal' => $this->getDisposalProposalData(),
        default => [],
    };
    
    return view("reports.{$type}", ['data' => $data]);
}

// resources/views/reports/device_status.blade.php
@extends('layouts.base')
@section('content')
<div class="report-container">
    <h1>Báo cáo Trạng thái Thiết bị</h1>
    <p>In ngày: {{ now()->format('d/m/Y') }}</p>
    
    <table class="report-table">
        <thead>
            <tr>
                <th>Mã thiết bị</th>
                <th>Tên thiết bị</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $item)
            <tr>
                <td>{{ $item['asset_code'] }}</td>
                <td>{{ $item['name'] }}</td>
                <td>{{ $item['category'] }}</td>
                <td>{{ $item['status'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>

<style>
    @media print {
        .report-container { page-break-inside: avoid; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
    }
</style>
@endsection
```

**Ưu điểm:**
- ✅ View được hiển thị trên browser trước khi in/export
- ✅ User có control: in, save PDF, export nếu browser support
- ✅ Không thêm dependency nặng

**Nhược điểm:**
- ❌ Print PDF cần plugin (hoặc mconf in browser)
- ❌ Formatting phức tạp nếu report lớn

---

**Khuyến nghị:** **Cách 1** (quick, CSV). **Cách 2** (professional, Excel). **Cách 3** (no dependency, browser-native).

---

## Phần III: Thứ Tự Ưu Tiên & Tiểm Năng Triển Khai

### Timeline Recommendation (nộp chiều/tối nay)

```
| Thứ tự | Công việc | Effort | Backend | Frontend | Test |
|--------|----------|--------|---------|----------|------|
| 1      | P0-01: Menu hierarchy | 2h | 0 | Sidebar.jsx (20-30 line) | Visual check |
| 2      | P0-04: PO UI layout | 2.5h | 0 | PurchaseOrdersPage.jsx (~50 line) | Manual test create/edit/delete |
| 3      | P0-05: Request/asset eligibility | 3h | RequestController + validation (60 line) | Dropdown filters | E2E test repair flow |
| 4      | P0-06: Report export | 4h | ReportController + export logic (200 line) | ReportPage (10 line modify) | Manual export test |
| 5      | P0-02: Dashboard cards | 2h | ReportController (extend) | Dashboard.jsx (add card) | Visual check |
| 6      | P0-03: Dropdown filters | 5h | API endpoints (nếu chưa có) | 4 pages × ~15 line | Filter UX test |
| **Total** | | **~18.5h** | | | |
```

### Parallel Assignment (2 agents)

**Agent B (Backend):** P0-05, P0-06 → Finish ~7h  
**Agent A (Frontend):** P0-01, P0-04, P0-02 → Finish ~6.5h  
**Overlap:** P0-03 (decide who does what)

### Must-Have Checklist Before Submit

- ✅ Dashboard xem được, không crash
- ✅ Create PO không require unit_price
- ✅ Report export một loại (device_status) được
- ✅ Sidebar menu hierarchy đúng
- ✅ Manager/tech/employee role screens không rò rỉ data
- ✅ npm run check:i18n pass
- ✅ npm run build pass
- ✅ php artisan test pass (nếu có test)
- ✅ Chụp screenshot: Dashboard, Sidebar, PO detail, Request review, Report

---

## Phần IV: Known Blockers & Open Questions

### Cần Verify/Confirm

1. **Depreciation calculation:**
   - Công thức nào? `(purchase_cost - salvage_value) * time_elapsed / useful_life` ?
   - Hay có field `deprecation_rate` riêng trong `assets` table?
   - Schema: có field nào không? Cần migration?

2. **Asset assignment logic:**
   - Table `asset_assignments` hay field `assigned_to_employee_id` trong `assets`?
   - `unassigned_at` thế nào? NULL → still assigned? Hoặc foreign key tới `employee_id` đơn giản?

3. **Maintenance vs. Repair:**
   - Dùng `maintenance_events` + `maintenance_details`? Hay `repair_logs` riêng?
   - Type = "repair", "maintenance"? Hay riêng enum?

4. **Report types priority:**
   - Need2fix chỉ bắt buộc 2 loại: device_status + disposal_proposal
   - Depreciation + lifecycle analysis có bắt buộc ngay không?

5. **i18n file format:**
   - `resources/js/i18n/locales/` là `.json` hay `.js`?
   - Hiện không tìm thấy file, cần init fresh?

---

## Phần V: Recommended Implementation Order

### Phase 1: Quick Wins (P0 visual + logic)

1. **Fix menu + QR top-level** (30 min)
   - resources/js/layouts/Sidebar.jsx
   - No backend change
   - Immediate visual improvement

2. **Fix PO table layout** (1 h)
   - Move Sửa/Xóa into detail modal
   - Add detail modal component

3. **Add clear-filter button** (30 min)
   - All filter forms

**Subtotal: 2h → Immediate screenshot readiness**

### Phase 2: API/Business Logic (P0 functional)

4. **Report export endpoint** (2.5 h)
   - ReportController::export() method
   - 2 report types: device_status, disposal_proposal
   - CSV or JSON output

5. **Request asset eligibility** (2 h)
   - Validation rule + RequestController scope
   - Only assigned assets in dropdown

6. **Dashboard deprecation card** (1 h)
   - Extend ReportController::summary()
   - Add card to Dashboard

**Subtotal: 5.5h → Functional P0 features**

### Phase 3: Polish (if time permits)

7. **Dropdown filters for master data** (3+ h)
   - Assets page
   - PO page
   - Request page
   - Maintenance page

8. **i18n audit** (1 h)
   - Check consistency "Thiết bị" vs "Tài sản"
   - Run npm run check:i18n

9. **Seed data fix** (1 h)
   - Update demo user
   - Ensure test data has assigned assets, suppliers, etc.

---

## Phần VI: Code Patterns & API Contract

### Expected API Endpoints (verify these exist or need creating)

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/purchase-orders` | GET | List PO | ✅ Exists |
| `/api/purchase-orders/{id}` | GET | Detail PO | ✅ Exists |
| `/api/purchase-orders` | POST | Create PO | ✅ Exists (StorePurchaseOrderRequest) |
| `/api/purchase-orders/{id}` | PUT | Update PO | ✅ Exists |
| `/api/purchase-orders/{id}` | DELETE | Delete PO | ❓ Check |
| `/api/reports/summary` | GET | Dashboard stats | ✅ Exists |
| `/api/reports/export` | POST | Export report | ❌ **Missing** |
| `/api/my-assets/assigned` | GET | Employee's assigned assets | ❌ **Missing** (or use filters) |
| `/api/requests` | GET | List requests | ✅ Exists |
| `/api/requests` | POST | Create request | ✅ Exists |
| `/api/review-requests` | GET | Review queue | ✅ Exists |
| `/api/categories` | GET | Dropdown categories | ❓ Check |
| `/api/locations` | GET | Dropdown locations | ✅ Exists |
| `/api/suppliers` | GET | Dropdown suppliers | ✅ Exists |

### Frontend Component Patterns

**Dropdown Select:**
```javascript
import Select from 'react-select';

<Select
    name="category"
    options={categories}
    isSearchable
    isClearable
    placeholder="Chọn danh mục..."
    value={selectedCategory}
    onChange={(option) => setSelectedCategory(option)}
/>
```

**Confirm Modal:**
```javascript
<ConfirmDialog
    open={confirmDelete}
    title="Xác nhận xóa"
    message="Bạn chắc chắn muốn xóa đơn hàng này?"
    onConfirm={handleConfirmDelete}
    onCancel={() => setConfirmDelete(false)}
/>
```

---

## Phần VII: Test Strategy

### Manual UAT (before screenshot)

```gherkin
Scenario: Manager creates purchase order
  Given manager login
  When navigate to Purchase Orders
  And click "Tạo đơn hàng mới"
  And select supplier
  And add item (supplier sẽ ship tự động)
  And add 2nd item
  And click "Tạo"
  Then order created with status "Chờ giao hàng"
  And can open detail view
  And can edit/delete from detail modal

Scenario: Report export
  Given manager login
  When navigate to Reports
  And select "Báo cáo trạng thái thiết bị"
  And click "Xuất"
  Then CSV/JSON file downloaded with device data
  And file not empty (if assets exist in DB)

Scenario: Request repair asset eligibility
  Given technician with assigned laptop
  When create request type JUSTIFICATION
  And click "Chọn thiết bị"
  Then dropdown shows only assigned laptop
  And cannot select unassigned devices
```

### Automated Tests (if time)

- Feature test: PurchaseOrderControllerTest::testCreateOrder()
- Feature test: ReportControllerTest::testExportDeviceStatus()
- Unit test: ValidateAssetHanded rule

---

## Phần VIII: Documentation Updates Required

If code changes → update docs:

- [ ] docs/README.md (if user-facing flow changes)
- [ ] docs/RBAC_MATRIX.md (if role scope changes)
- [ ] routes/api.php comments (if endpoint added)
- [ ] app/Models/PurchaseOrder.php docblock (if status logic changes)

---

## Summary: Recommended Fix Sequence

**RECOMMENDED IMPLEMENTATION ORDER (pragmatic 2-agent split):**

### Agent B (Backend/API) — Start first
1. Extend ReportController: `export()` method → device_status + disposal_proposal reports
2. Add validation: ValidateAssetHanded rule for request asset eligibility
3. Extend RequestController::index() scoping for assigned assets
4. Verify PurchaseOrder status normalize logic (already looks good)

### Agent A (Frontend/UI) — While B works on API
1. Fix Sidebar.jsx: Move qrScan + reviewRequests to top-level
2. Fix PurchaseOrdersPage: Move Sửa/Xóa to detail modal
3. Add clear-filter buttons to all pages
4. Update Dashboard: Add deprecation >=75% card

### Merge & Test
1. B pushes API endpoints
2. A connects frontend to B's endpoints
3. Both run npm run check:i18n + npm run build
4. Manual smoke test (manager, technician, employee)
5. Screenshot & submit

**Estimated Total:** 7-9 hours (realistic, includes testing)

---

**END OF AUDIT REPORT**
