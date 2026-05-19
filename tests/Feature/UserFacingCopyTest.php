<?php

namespace Tests\Feature;

use Tests\TestCase;

class UserFacingCopyTest extends TestCase
{
    public function test_key_user_facing_modules_use_device_terminology_and_current_filters(): void
    {
        $assetsPage = file_get_contents(resource_path('js/pages/AssetsPage.jsx'));
        $locationsPage = file_get_contents(resource_path('js/pages/LocationsPage.jsx'));
        $purchaseOrdersPage = file_get_contents(resource_path('js/pages/PurchaseOrdersPage.jsx'));
        $maintenancePage = file_get_contents(resource_path('js/pages/MaintenancePage.jsx'));
        $inventoryPage = file_get_contents(resource_path('js/pages/InventoryPage.jsx'));
        $reportPage = file_get_contents(resource_path('js/pages/ReportPage.jsx'));
        $sidebar = file_get_contents(resource_path('js/layouts/Sidebar.jsx'));
        $quickActions = file_get_contents(resource_path('js/components/dashboard/QuickActionGrid.jsx'));
        $vi = file_get_contents(resource_path('js/i18n/locales/vi.js'));

        $this->assertStringContainsString('Danh mục thiết bị', $assetsPage);
        $this->assertStringContainsString('Tạo thiết bị', $assetsPage);
        $this->assertStringContainsString('PC', $assetsPage);
        $this->assertStringContainsString('Màn hình', $assetsPage);
        $this->assertStringContainsString('Thiết bị Test', $assetsPage);
        $this->assertStringContainsString('Phụ kiện dùng', $assetsPage);
        $this->assertStringContainsString('Linh kiện thay thế', $assetsPage);
        $this->assertStringNotContainsString("{ value: 'RAM'", $assetsPage);
        $this->assertStringNotContainsString("{ value: 'SSD'", $assetsPage);
        $this->assertStringNotContainsString("{ value: 'inventorying'", $assetsPage);
        $this->assertStringNotContainsString('Đang kiểm kê</div>', $assetsPage);
        $this->assertStringNotContainsString('Tất cả phụ trách', $assetsPage);
        $this->assertStringNotContainsString('Danh mục tài sản', $assetsPage);
        $this->assertStringNotContainsString('Tạo tài sản', $assetsPage);

        $this->assertStringContainsString('nơi đặt thiết bị', $locationsPage);
        $this->assertStringNotContainsString('areaFilter', $locationsPage);
        $this->assertStringNotContainsString('Hiển thị cả vị trí ngưng sử dụng', $locationsPage);
        $this->assertStringNotContainsString('nơi đặt tài sản', $locationsPage);

        $reviewRequestsPage = file_get_contents(resource_path('js/pages/ReviewRequestsPage.jsx'));
        $requestsPage = file_get_contents(resource_path('js/pages/RequestsPage.jsx'));
        $this->assertStringContainsString('getDisplayTypeLabel(row)', $requestsPage);
        $this->assertStringContainsString('getDisplayTypeLabel(selectedRequest)', $requestsPage);
        $this->assertStringContainsString('getDisplayTypeLabel(row)', $reviewRequestsPage);
        $this->assertStringContainsString('getDisplayTypeLabel(selectedRequest)', $reviewRequestsPage);
        $this->assertStringContainsString('openReviewModal(selectedRequest', $reviewRequestsPage);
        $this->assertStringNotContainsString("openReviewModal(row, 'APPROVE')", $reviewRequestsPage);
        $this->assertStringNotContainsString("openReviewModal(row, 'REJECT')", $reviewRequestsPage);

        $suppliersPage = file_get_contents(resource_path('js/pages/SuppliersPage.jsx'));
        $this->assertStringContainsString('Mã/ID nhà cung cấp', $suppliersPage);
        $this->assertStringContainsString("key: 'note'", $suppliersPage);

        $this->assertStringContainsString('Danh sách thiết bị', $purchaseOrdersPage);
        $this->assertStringContainsString('Chờ giao hàng', $purchaseOrdersPage);
        $this->assertStringContainsString('Chi tiết', $purchaseOrdersPage);
        $this->assertStringContainsString('Bạn chắc chắn muốn xóa?', $purchaseOrdersPage);
        $this->assertStringContainsString('list="purchase-order-device-options"', $purchaseOrdersPage);
        $this->assertStringContainsString('<datalist id="purchase-order-device-options">', $purchaseOrdersPage);
        $this->assertStringContainsString('response.assets || response.data || []', $purchaseOrdersPage);
        $this->assertStringNotContainsString('Xóa đơn hàng ${order.order_code}?', $purchaseOrdersPage);
        $this->assertStringNotContainsString('Chuẩn bị', $purchaseOrdersPage);
        $this->assertStringNotContainsString('Đang giao', $purchaseOrdersPage);
        $this->assertStringNotContainsString('Đơn giá', $purchaseOrdersPage);
        $this->assertStringNotContainsString('Thanh toán', $purchaseOrdersPage);

        $this->assertStringContainsString("value: 'maintenance_group', label: 'Bảo trì'", $maintenancePage);
        $this->assertStringContainsString("value: 'repair_group', label: 'Sửa chữa'", $maintenancePage);
        $this->assertStringNotContainsString("value: 'inspection', label: 'Kiểm tra'", $maintenancePage);
        $this->assertStringNotContainsString("{ value: 'inventorying'", $inventoryPage);
        $this->assertStringNotContainsString('Đang kiểm kê</p>', $inventoryPage);
        $this->assertStringContainsString('Báo cáo trạng thái thiết bị', $reportPage);
        $this->assertStringContainsString('Báo cáo khấu hao / giá trị còn lại', $reportPage);
        $this->assertStringContainsString('Báo cáo đề xuất thu hủy', $reportPage);
        $this->assertStringContainsString('Báo cáo phân tích vòng đời', $reportPage);

        $this->assertStringNotContainsString('Sơ đồ chức năng BFD', $sidebar);
        $operationalQuickActions = str($quickActions)->between('if (isOperationalRole) {', 'if (isSupplier) {')->toString();
        $this->assertStringNotContainsString("to: '/purchase-orders'", $operationalQuickActions);
        $this->assertStringContainsString('Quản lý hồ sơ', $vi);
        $this->assertStringContainsString('Khấu hao ≥ 75%', $vi);
        $this->assertStringNotContainsString('Khấu hao ≥ 90%', $vi);
    }
}
