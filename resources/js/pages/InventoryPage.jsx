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

/**
 * InventoryPage - Full equipment inventory with search and filters (Phase 6)
 * Admin/HR only - connected to real API
 */
const InventoryPage = ({ user }) => {
    const toast = useToast();
    
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
            
            toast.success('Export downloaded successfully');
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
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Inventory columns
    const inventoryColumns = [
        { 
            key: 'asset_code', 
            label: 'Code',
            width: '120px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded font-mono">{value || '—'}</code>
        },
        { 
            key: 'name', 
            label: 'Equipment',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.category || row.type}</p>
                </div>
            )
        },
        { key: 'location', label: 'Location', render: (v) => v || '—' },
        { 
            key: 'status', 
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        { 
            key: 'assigned_to', 
            label: 'Assigned To',
            render: (value) => value?.name || <span className="text-text-light">—</span>
        },
        { 
            key: 'current_book_value', 
            label: 'Book Value',
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
                        title="Print Label"
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
                        View
                    </Button>
                </div>
            )
        }
    ];

    // Valuation columns
    const valuationColumns = [
        { 
            key: 'asset_code', 
            label: 'Code',
            width: '100px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded font-mono">{value || '—'}</code>
        },
        { 
            key: 'name', 
            label: 'Asset',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.category}</p>
                </div>
            )
        },
        { 
            key: 'valuation.purchase_cost', 
            label: 'Purchase Cost',
            align: 'right',
            render: (_, row) => formatCurrency(row.valuation?.purchase_cost)
        },
        { 
            key: 'valuation.months_in_service', 
            label: 'Months Used',
            align: 'center',
            render: (_, row) => row.valuation?.months_in_service ?? '—'
        },
        { 
            key: 'valuation.monthly_depreciation', 
            label: 'Monthly Depr.',
            align: 'right',
            render: (_, row) => formatCurrency(row.valuation?.monthly_depreciation)
        },
        { 
            key: 'valuation.accumulated_depreciation', 
            label: 'Accum. Depr.',
            align: 'right',
            render: (_, row) => formatCurrency(row.valuation?.accumulated_depreciation)
        },
        { 
            key: 'valuation.current_book_value', 
            label: 'Book Value',
            align: 'right',
            render: (_, row) => (
                <span className={`font-semibold ${row.valuation?.is_fully_depreciated ? 'text-warning' : 'text-success'}`}>
                    {formatCurrency(row.valuation?.current_book_value)}
                </span>
            )
        },
        { 
            key: 'valuation.is_fully_depreciated', 
            label: 'Status',
            align: 'center',
            render: (_, row) => row.valuation?.is_fully_depreciated 
                ? <Badge variant="warning" size="sm">Fully Depr.</Badge>
                : <Badge variant="success" size="sm">Active</Badge>
        },
    ];

    // Category options for filter
    const categoryOptions = [
        { value: '', label: 'All Categories' },
        ...(filters?.categories || summary?.available_categories || []).map(c => ({ value: c, label: c }))
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'maintenance', label: 'In Maintenance' },
        { value: 'off_service', label: 'Off Service' },
        { value: 'retired', label: 'Retired' },
    ];

    const locationOptions = [
        { value: '', label: 'All Locations' },
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
                                    <p className="text-sm text-text-muted">Total Assets</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-success">{summary.summary.by_status.active}</p>
                                    <p className="text-sm text-text-muted">Active</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">{summary.summary.by_assignment.assigned}</p>
                                    <p className="text-sm text-text-muted">Assigned</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-warning">{summary.summary.by_status.maintenance}</p>
                                    <p className="text-sm text-text-muted">Maintenance</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card className="col-span-2 lg:col-span-1">
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-text">{formatCurrency(summary.valuation.total_current_book_value)}</p>
                                    <p className="text-sm text-text-muted">Total Book Value</p>
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
                                        {summary.warranty.expiring_soon_count} asset{summary.warranty.expiring_soon_count > 1 ? 's' : ''} with warranty expiring soon
                                    </p>
                                    <p className="text-sm text-text-muted">
                                        Within {summary.warranty.threshold_days} days
                                        {summary.warranty.expired_count > 0 && (
                                            <span className="text-error ml-2">• {summary.warranty.expired_count} expired</span>
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
                                {warrantyExpiringSoonFilter ? 'Show All' : 'Show Expiring'}
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Main Content Card */}
            <Card>
                <CardHeader 
                    title={viewMode === 'inventory' ? 'Equipment Inventory' : 'Asset Valuation Report'}
                    subtitle={`${pagination.total} total items${warrantyExpiringSoonFilter ? ' (warranty expiring soon)' : ''}`}
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
                                    Inventory
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        viewMode === 'valuation' 
                                            ? 'bg-primary text-white' 
                                            : 'bg-surface text-text hover:bg-surface-muted'
                                    }`}
                                    onClick={() => setViewMode('valuation')}
                                >
                                    Valuation
                                </button>
                            </div>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleExportCsv}
                                disabled={exportLoading}
                            >
                                {exportLoading ? 'Exporting...' : 'Export CSV'}
                            </Button>
                        </div>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name or code..."
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
                                emptyMessage="No assets found"
                                emptyState={
                                    <div className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                        </svg>
                                        <h3 className="mt-3 text-sm font-medium text-text">No assets found</h3>
                                        <p className="mt-1 text-sm text-text-muted">Try adjusting your search or filters.</p>
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
                title={selectedItem?.name || 'Asset Details'}
                size="lg"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-muted">Asset Code</p>
                                <p className="font-medium text-text">{selectedItem.asset_code || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Category</p>
                                <p className="font-medium text-text">{selectedItem.category || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Type</p>
                                <p className="font-medium text-text capitalize">{selectedItem.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Location</p>
                                <p className="font-medium text-text">{selectedItem.location || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Status</p>
                                <StatusBadge status={selectedItem.status} />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Assigned To</p>
                                <p className="font-medium text-text">{selectedItem.assigned_to?.name || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Purchase Date</p>
                                <p className="font-medium text-text">{formatDate(selectedItem.purchase_date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Warranty Expiry</p>
                                <p className="font-medium text-text">{formatDate(selectedItem.warranty_expiry)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Purchase Cost</p>
                                <p className="font-medium text-text">{formatCurrency(selectedItem.purchase_cost)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Current Book Value</p>
                                <p className="text-xl font-bold text-success">{formatCurrency(selectedItem.current_book_value)}</p>
                            </div>
                        </div>
                        {selectedItem.notes && (
                            <div>
                                <p className="text-sm text-text-muted">Notes</p>
                                <p className="font-medium text-text">{selectedItem.notes}</p>
                            </div>
                        )}
                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                                Close
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
                title="Print Asset Label"
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
