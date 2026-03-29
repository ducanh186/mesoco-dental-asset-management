import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input, 
    Select,
    Badge,
    StatusBadge,
    Table,
    TablePagination,
    Modal,
    useToast
} from '../components/ui';
import { inventoryApi, handleApiError } from '../services/api';
import PrintableAssetLabel from '../components/PrintableAssetLabel';
import { useI18n } from '../i18n';

/**
 * InventoryPage - Full equipment inventory with search and filters (Phase 6)
 * Admin/HR only - connected to real API
 */
const InventoryPage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();
    
    // State
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [assets, setAssets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [warrantyExpiringSoonFilter, setWarrantyExpiringSoonFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Detail modal
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    // Print label modal
    const [printLabelItem, setPrintLabelItem] = useState(null);
    const [isPrintLabelOpen, setIsPrintLabelOpen] = useState(false);
    // View mode: 'inventory' | 'valuation'
    const [viewMode, setViewMode] = useState('inventory');

    // Valuation data
    const [valuationData, setValuationData] = useState([]);
    const [valuationLoading, setValuationLoading] = useState(false);
    
    // Export loading state
    const [exportLoading, setExportLoading] = useState(false);

    // Fetch summary data
    const fetchSummary = useCallback(async () => {
        try {
            setSummaryLoading(true);
            const data = await inventoryApi.summary();
            setSummary(data);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSummaryLoading(false);
        }
    }, [toast]);

    // Fetch assets
    const fetchAssets = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 15,
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
                status: statusFilter || undefined,
                location: locationFilter || undefined,
                warranty_expiring_soon: warrantyExpiringSoonFilter || undefined,
            };
            
            const data = await inventoryApi.assets(params);
            setAssets(data.assets || []);
            setPagination(data.pagination);
            setFilters(data.filters);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, categoryFilter, statusFilter, locationFilter, warrantyExpiringSoonFilter, toast]);

    // Fetch valuation data
    const fetchValuation = useCallback(async () => {
        try {
            setValuationLoading(true);
            const params = {
                page: currentPage,
                per_page: 15,
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
            };
            
            const data = await inventoryApi.valuation(params);
            setValuationData(data.assets || []);
            setPagination(data.pagination);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setValuationLoading(false);
        }
    }, [currentPage, searchQuery, categoryFilter, toast]);
    
    // Handle CSV export
    const handleExportCsv = async () => {
        try {
            setExportLoading(true);
            const params = {
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
                status: statusFilter || undefined,
                location: locationFilter || undefined,
                warranty_expiring_soon: warrantyExpiringSoonFilter || undefined,
            };
            
            const response = await inventoryApi.exportCsv(params);
            
            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Xuất tệp thành công');
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setExportLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    // Fetch data based on view mode
    useEffect(() => {
        if (viewMode === 'inventory') {
            fetchAssets();
        } else {
            fetchValuation();
        }
    }, [viewMode, fetchAssets, fetchValuation]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, statusFilter, locationFilter, warrantyExpiringSoonFilter, viewMode]);

    const formatCurrency = (value) => {
        if (value === null || value === undefined) return '—';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getAssetTypeLabel = useCallback((type) => {
        const normalizedType = String(type || '').trim().toLowerCase();

        if (!normalizedType) {
            return t('common.unknown');
        }

        const supportedTypes = ['tray', 'machine', 'tool', 'equipment', 'other'];
        const typeKey = supportedTypes.includes(normalizedType) ? normalizedType : 'other';

        return t(`assets.types.${typeKey}`);
    }, [t]);

    // Inventory columns
    const inventoryColumns = [
        { 
            key: 'asset_code', 
            label: 'Mã',
            width: '120px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded font-mono">{value || '—'}</code>
        },
        { 
            key: 'name', 
            label: 'Thiết bị',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.category || getAssetTypeLabel(row.type)}</p>
                </div>
            )
        },
        { key: 'location', label: 'Vị trí', render: (v) => v || '—' },
        { 
            key: 'status', 
            label: 'Trạng thái',
            render: (value) => <StatusBadge status={value} />
        },
        { 
            key: 'assigned_to', 
            label: 'Người sử dụng',
            render: (value) => value?.name || <span className="text-text-light">—</span>
        },
        { 
            key: 'current_book_value', 
            label: 'Giá trị còn lại',
            align: 'right',
            render: (value) => <span className="font-medium">{formatCurrency(value)}</span>
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-1 justify-end">
                    <Button 
                        size="sm" 
                        variant="ghost"
                        title="In nhãn"
                        onClick={() => {
                            setPrintLabelItem(row);
                            setIsPrintLabelOpen(true);
                        }}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                    </Button>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                            setSelectedItem(row);
                            setIsDetailOpen(true);
                        }}
                    >
                        Xem
                    </Button>
                </div>
            )
        }
    ];

    // Valuation columns
    const valuationColumns = [
        { 
            key: 'asset_code', 
            label: 'Mã',
            width: '100px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded font-mono">{value || '—'}</code>
        },
        { 
            key: 'name', 
            label: 'Tài sản',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.category}</p>
                </div>
            )
        },
        { 
            key: 'valuation.purchase_cost', 
            label: 'Nguyên giá',
            align: 'right',
            render: (_, row) => formatCurrency(row.valuation?.purchase_cost)
        },
        { 
            key: 'valuation.months_in_service', 
            label: 'Số tháng sử dụng',
            align: 'center',
            render: (_, row) => row.valuation?.months_in_service ?? '—'
        },
        { 
            key: 'valuation.monthly_depreciation', 
            label: 'Khấu hao/tháng',
            align: 'right',
            render: (_, row) => formatCurrency(row.valuation?.monthly_depreciation)
        },
        { 
            key: 'valuation.accumulated_depreciation', 
            label: 'Khấu hao lũy kế',
            align: 'right',
            render: (_, row) => formatCurrency(row.valuation?.accumulated_depreciation)
        },
        { 
            key: 'valuation.current_book_value', 
            label: 'Giá trị còn lại',
            align: 'right',
            render: (_, row) => (
                <span className={`font-semibold ${row.valuation?.is_fully_depreciated ? 'text-warning' : 'text-success'}`}>
                    {formatCurrency(row.valuation?.current_book_value)}
                </span>
            )
        },
        { 
            key: 'valuation.is_fully_depreciated', 
            label: 'Trạng thái',
            align: 'center',
            render: (_, row) => row.valuation?.is_fully_depreciated 
                ? <Badge variant="warning" size="sm">Khấu hao hết</Badge>
                : <Badge variant="success" size="sm">Đang sử dụng</Badge>
        },
    ];

    // Category options for filter
    const categoryOptions = [
        { value: '', label: 'Tất cả nhóm' },
        ...(filters?.categories || summary?.available_categories || []).map(c => ({ value: c, label: c }))
    ];

    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'active', label: 'Đang hoạt động' },
        { value: 'maintenance', label: 'Đang bảo trì' },
        { value: 'off_service', label: 'Tạm ngưng' },
        { value: 'retired', label: 'Đã thanh lý' },
    ];

    const locationOptions = [
        { value: '', label: 'Tất cả vị trí' },
        ...(filters?.locations || []).map(l => ({ value: l, label: l }))
    ];

    const isLoading = viewMode === 'inventory' ? loading : valuationLoading;
    const displayData = viewMode === 'inventory' ? assets : valuationData;
    const columns = viewMode === 'inventory' ? inventoryColumns : valuationColumns;

    return (
        <div className="inventory-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {summaryLoading ? (
                    <div className="col-span-5 flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : summary && (
                    <>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-text">{summary.summary.total_assets}</p>
                                    <p className="text-sm text-text-muted">Tổng thiết bị</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-success">{summary.summary.by_status.active}</p>
                                    <p className="text-sm text-text-muted">Đang hoạt động</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">{summary.summary.by_assignment.assigned}</p>
                                    <p className="text-sm text-text-muted">Đã giao</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-warning">{summary.summary.by_status.maintenance}</p>
                                    <p className="text-sm text-text-muted">Bảo trì</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="col-span-2 lg:col-span-1">
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-text">{formatCurrency(summary.valuation.total_current_book_value)}</p>
                                    <p className="text-sm text-text-muted">Tổng giá trị còn lại</p>
                                </div>
                            </CardBody>
                        </Card>
                    </>
                )}
            </div>

            {/* Warranty Alert Widget */}
            {!summaryLoading && summary?.warranty?.expiring_soon_count > 0 && (
                <Card className="border-warning bg-warning/5">
                    <CardBody>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-text">
                                        {summary.warranty.expiring_soon_count} thiết bị sắp hết hạn bảo hành
                                    </p>
                                    <p className="text-sm text-text-muted">
                                        Trong vòng {summary.warranty.threshold_days} ngày
                                        {summary.warranty.expired_count > 0 && (
                                            <span className="text-error ml-2">• {summary.warranty.expired_count} đã hết hạn</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                size="sm" 
                                variant={warrantyExpiringSoonFilter ? "primary" : "outline"}
                                onClick={() => {
                                    setWarrantyExpiringSoonFilter(!warrantyExpiringSoonFilter);
                                    setViewMode('inventory');
                                }}
                            >
                                {warrantyExpiringSoonFilter ? 'Hiện tất cả' : 'Chỉ xem sắp hết hạn'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Main Content Card */}
            <Card>
                <CardHeader 
                    title={viewMode === 'inventory' ? 'Tồn kho thiết bị' : 'Báo cáo định giá tài sản'}
                    subtitle={`${pagination.total} mục${warrantyExpiringSoonFilter ? ' (lọc sắp hết hạn bảo hành)' : ''}`}
                    action={
                        <div className="flex gap-2">
                            <div className="flex rounded-lg border border-border overflow-hidden">
                                <button
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'inventory' 
                                            ? 'bg-primary text-white' 
                                            : 'bg-surface text-text hover:bg-surface-muted'
                                    }`}
                                    onClick={() => setViewMode('inventory')}
                                >
                                    Tồn kho
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'valuation' 
                                            ? 'bg-primary text-white' 
                                            : 'bg-surface text-text hover:bg-surface-muted'
                                    }`}
                                    onClick={() => setViewMode('valuation')}
                                >
                                    Định giá
                                </button>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleExportCsv}
                                disabled={exportLoading}
                            >
                                {exportLoading ? 'Đang xuất...' : 'Xuất CSV'}
                            </Button>
                        </div>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm theo tên hoặc mã..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                }
                            />
                        </div>
                        <div className="w-full sm:w-40">
                            <Select
                                options={categoryOptions}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            />
                        </div>
                        {viewMode === 'inventory' && (
                            <>
                                <div className="w-full sm:w-40">
                                    <Select
                                        options={statusOptions}
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    />
                                </div>
                                <div className="w-full sm:w-40">
                                    <Select
                                        options={locationOptions}
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <Table
                                columns={columns}
                                data={displayData}
                                emptyMessage="Không tìm thấy thiết bị"
                                emptyState={
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                        </svg>
                                        <h3 className="mt-3 text-sm font-medium text-text">Không tìm thấy thiết bị</h3>
                                        <p className="mt-1 text-sm text-text-muted">Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc.</p>
                                    </div>
                                }
                            />

                            {/* Pagination */}
                            {displayData.length > 0 && (
                                <TablePagination
                                    currentPage={pagination.current_page}
                                    totalPages={pagination.last_page}
                                    totalItems={pagination.total}
                                    pageSize={pagination.per_page}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </>
                    )}
                </CardBody>
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedItem?.name || 'Chi tiết thiết bị'}
                size="lg"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-muted">Mã thiết bị</p>
                                <p className="font-medium text-text">{selectedItem.asset_code || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Nhóm</p>
                                <p className="font-medium text-text">{selectedItem.category || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Loại</p>
                                <p className="font-medium text-text capitalize">{getAssetTypeLabel(selectedItem.type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Vị trí</p>
                                <p className="font-medium text-text">{selectedItem.location || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Trạng thái</p>
                                <StatusBadge status={selectedItem.status} />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Người sử dụng</p>
                                <p className="font-medium text-text">{selectedItem.assigned_to?.name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Ngày mua</p>
                                <p className="font-medium text-text">{formatDate(selectedItem.purchase_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Hết hạn bảo hành</p>
                                <p className="font-medium text-text">{formatDate(selectedItem.warranty_expiry)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Nguyên giá</p>
                                <p className="font-medium text-text">{formatCurrency(selectedItem.purchase_cost)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Giá trị còn lại</p>
                                <p className="text-xl font-bold text-success">{formatCurrency(selectedItem.current_book_value)}</p>
                            </div>
                        </div>
                        {selectedItem.notes && (
                            <div>
                                <p className="text-sm text-text-muted">Ghi chú</p>
                                <p className="font-medium text-text">{selectedItem.notes}</p>
                            </div>
                        )}
                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Print Label Modal */}
            <Modal
                isOpen={isPrintLabelOpen}
                onClose={() => {
                    setIsPrintLabelOpen(false);
                    setPrintLabelItem(null);
                }}
                title="In nhãn thiết bị"
                size="md"
            >
                {printLabelItem && (
                    <PrintableAssetLabel
                        asset={printLabelItem}
                        onClose={() => {
                            setIsPrintLabelOpen(false);
                            setPrintLabelItem(null);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default InventoryPage;
