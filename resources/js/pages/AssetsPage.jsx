import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Button,
    Card,
    CardBody,
    ConfirmModal,
    Input,
    Modal,
    Select,
    StatusBadge,
    Table,
    TablePagination,
    useToast,
} from '../components/ui';
import { assetsApi, employeesApi, handleApiError, locationsApi, suppliersApi } from '../services/api';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const AssetsPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const querySearch = searchParams.get('q') || '';

    const [assets, setAssets] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [locations, setLocations] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(querySearch);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [assignmentFilter, setAssignmentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedAsset, setSelectedAsset] = useState(null);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [handoverModalOpen, setHandoverModalOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);

    const [createLoading, setCreateLoading] = useState(false);
    const [handoverLoading, setHandoverLoading] = useState(false);
    const [createErrors, setCreateErrors] = useState({});

    const [createForm, setCreateForm] = useState({
        asset_code: '',
        serial_number: '',
        name: '',
        model: '',
        qr_code: '',
        configuration: '',
        type: 'equipment',
        category: '',
        location_id: '',
        status: 'active',
        supplier_id: '',
        purchase_date: '',
        purchase_price: '',
        current_depreciation_rate: '',
        useful_life_months: '',
        warranty_expiry: '',
        notes: '',
    });

    const [handoverTarget, setHandoverTarget] = useState('');

    const assetTypes = [
        { value: '', label: 'Tất cả loại' },
        { value: 'tray', label: 'Khay' },
        { value: 'machine', label: 'Máy' },
        { value: 'tool', label: 'Dụng cụ' },
        { value: 'equipment', label: 'Thiết bị' },
        { value: 'other', label: 'Khác' },
    ];

    const assetStatuses = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'active', label: 'Đang hoạt động' },
        { value: 'off_service', label: 'Ngưng sử dụng' },
        { value: 'maintenance', label: 'Đang bảo trì' },
        { value: 'retired', label: 'Đã thu hủy' },
    ];

    const assignmentOptions = [
        { value: '', label: 'Tất cả phụ trách' },
        { value: 'assigned', label: 'Có người phụ trách' },
        { value: 'unassigned', label: 'Chưa có người phụ trách' },
    ];

    useEffect(() => {
        fetchAssets();
    }, [currentPage, searchQuery, typeFilter, statusFilter, locationFilter, assignmentFilter]);

    useEffect(() => {
        if (querySearch === searchQuery) {
            return;
        }

        setSearchQuery(querySearch);
        setCurrentPage(1);
    }, [querySearch, searchQuery]);

    useEffect(() => {
        fetchSuppliers();
        fetchEmployees();
        fetchLocations();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await assetsApi.list({
                page: currentPage,
                search: searchQuery || undefined,
                type: typeFilter || undefined,
                status: statusFilter || undefined,
                location: locationFilter || undefined,
            });

            let nextAssets = response.assets || [];
            if (assignmentFilter === 'assigned') {
                nextAssets = nextAssets.filter((asset) => asset.is_assigned);
            }
            if (assignmentFilter === 'unassigned') {
                nextAssets = nextAssets.filter((asset) => !asset.is_assigned);
            }

            setAssets(nextAssets);
            setPagination(response.pagination || { current_page: 1, last_page: 1, total: 0 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);

            if (value.trim()) {
                nextParams.set('q', value.trim());
            } else {
                nextParams.delete('q');
            }

            return nextParams;
        });
    };

    const fetchSuppliers = async () => {
        try {
            const response = await suppliersApi.dropdown();
            setSuppliers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await employeesApi.list({ per_page: 100, status: 'active' });
            setEmployees(response.employees || []);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await locationsApi.dropdown();
            setLocations(response.data || []);
        } catch (error) {
            console.error('Failed to fetch locations', error);
        }
    };

    const getAssetTypeLabel = (type) => assetTypes.find((option) => option.value === type)?.label || 'Khác';
    const getResponsibleEmployee = (asset) => asset.responsible_employee?.full_name || asset.current_assignment?.assignment_target?.name || 'Chưa có';
    const getDepartmentLabel = (asset) => asset.responsible_employee?.department || 'Chưa bàn giao';
    const getLocationLabel = (asset) => {
        if (asset.location?.code && asset.location?.name) {
            return `${asset.location.code} - ${asset.location.name}`;
        }
        return asset.location_name || 'Chưa chọn';
    };

    const buildHandoverValue = (employee) => {
        if (employee?.user?.id) {
            return `staff:${employee.user.id}`;
        }

        if (employee?.id) {
            return `employee:${employee.id}`;
        }

        return '';
    };

    const parseHandoverValue = (value) => {
        if (!value) {
            return null;
        }

        const [targetType, rawId] = value.split(':');
        const id = Number(rawId);

        if (!targetType || !Number.isFinite(id)) {
            return null;
        }

        return { targetType, id };
    };

    const locationOptions = [
        { value: '', label: 'Tất cả vị trí' },
        ...locations.map((location) => ({
            value: location.code,
            label: `${location.code} - ${location.name}`,
        })),
    ];

    const filteredSummary = {
        total: assets.length,
        assigned: assets.filter((asset) => asset.is_assigned).length,
        available: assets.filter((asset) => !asset.is_assigned && asset.status === 'active').length,
        attention: assets.filter((asset) => ['maintenance', 'off_service', 'retired'].includes(asset.status)).length,
    };

    const activeFilterTags = [
        searchQuery ? `Tìm kiếm: ${searchQuery}` : null,
        typeFilter ? `Loại: ${getAssetTypeLabel(typeFilter)}` : null,
        statusFilter ? `Trạng thái: ${assetStatuses.find((option) => option.value === statusFilter)?.label}` : null,
        locationFilter ? `Vị trí: ${locationOptions.find((option) => option.value === locationFilter)?.label}` : null,
        assignmentFilter ? `Phụ trách: ${assignmentOptions.find((option) => option.value === assignmentFilter)?.label}` : null,
    ].filter(Boolean);

    const normalizeAssetPayload = (form) => ({
        ...form,
        category: form.category || null,
        location_id: form.location_id ? Number(form.location_id) : null,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        purchase_date: form.purchase_date || null,
        purchase_price: form.purchase_price === '' ? null : Number(form.purchase_price),
        current_depreciation_rate: form.current_depreciation_rate === '' ? null : Number(form.current_depreciation_rate),
        useful_life_months: form.useful_life_months === '' ? null : Number(form.useful_life_months),
        warranty_expiry: form.warranty_expiry || null,
    });

    const handleViewAsset = async (asset) => {
        try {
            const response = await assetsApi.get(asset.id);
            setSelectedAsset(response.asset);
            setDetailDrawerOpen(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleCreateAsset = async (event) => {
        event.preventDefault();
        setCreateLoading(true);
        setCreateErrors({});

        try {
            const response = await assetsApi.create(normalizeAssetPayload(createForm));
            toast.success('Đã tạo tài sản.');
            setCreateModalOpen(false);
            setCreateForm({
                asset_code: '',
                serial_number: '',
                name: '',
                model: '',
                qr_code: '',
                configuration: '',
                type: 'equipment',
                category: '',
                location_id: '',
                status: 'active',
                supplier_id: '',
                purchase_date: '',
                purchase_price: '',
                current_depreciation_rate: '',
                useful_life_months: '',
                warranty_expiry: '',
                notes: '',
            });
            fetchAssets();
            setSelectedAsset(response.asset);
            setDetailDrawerOpen(true);
        } catch (error) {
            if (error.response?.status === 422) {
                setCreateErrors(error.response.data.errors || {});
            }
            handleApiError(error, toast);
        } finally {
            setCreateLoading(false);
        }
    };

    const openHandoverModal = (asset = selectedAsset) => {
        const targetAsset = asset || selectedAsset;

        if (!targetAsset) {
            return;
        }

        setSelectedAsset(targetAsset);
        setHandoverTarget(buildHandoverValue(targetAsset.responsible_employee));
        setHandoverModalOpen(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setTypeFilter('');
        setStatusFilter('');
        setLocationFilter('');
        setAssignmentFilter('');
        setCurrentPage(1);
        setSearchParams(new URLSearchParams());
    };

    const openMaintenanceWorkspace = (asset) => {
        toast.info(`Mở workspace bảo trì để tạo phiếu cho ${asset.name}.`);
        navigate('/maintenance');
    };

    const handleHandoverAsset = async () => {
        const handoverSelection = parseHandoverValue(handoverTarget);

        if (!selectedAsset || !handoverSelection) {
            toast.error('Vui lòng chọn người nhận tài sản.');
            return;
        }

        setHandoverLoading(true);
        try {
            await assetsApi.assign(
                selectedAsset.id,
                handoverSelection.targetType === 'staff'
                    ? { staff_id: handoverSelection.id }
                    : { employee_id: handoverSelection.id },
            );
            toast.success('Đã gán người phụ trách.');
            setHandoverModalOpen(false);
            setHandoverTarget('');

            const updated = await assetsApi.get(selectedAsset.id);
            setSelectedAsset(updated.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setHandoverLoading(false);
        }
    };

    const handleUnassignAsset = async () => {
        if (!selectedAsset) {
            return;
        }

        try {
            await assetsApi.unassign(selectedAsset.id);
            toast.success('Đã bỏ nhân viên chịu trách nhiệm.');
            setConfirmUnassignOpen(false);
            const updated = await assetsApi.get(selectedAsset.id);
            setSelectedAsset(updated.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDeleteAsset = async () => {
        if (!selectedAsset) {
            return;
        }

        try {
            await assetsApi.delete(selectedAsset.id);
            toast.success('Đã xóa tài sản.');
            setConfirmDeleteOpen(false);
            setDetailDrawerOpen(false);
            setSelectedAsset(null);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const columns = [
        {
            key: 'asset_code',
            label: 'Mã tài sản',
            width: '140px',
            render: (value) => <span className="font-mono text-sm font-semibold text-text">{value}</span>,
        },
        {
            key: 'name',
            label: 'Tài sản',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted">{row.category || 'Chưa gắn danh mục'} · {getDepartmentLabel(row)}</div>
                </div>
            ),
        },
        {
            key: 'type',
            label: 'Loại',
            width: '120px',
            render: (value) => <span className="text-sm text-text-muted">{getAssetTypeLabel(value)}</span>,
        },
        {
            key: 'current_assignment',
            label: 'Nhân viên chịu trách nhiệm',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-text">{getResponsibleEmployee(row)}</div>
                    <div className="text-xs text-text-muted">
                        {row.current_assignment?.assigned_at
                            ? `Từ ${new Date(row.current_assignment.assigned_at).toLocaleDateString('vi-VN')}`
                            : 'Chưa có người phụ trách'}
                    </div>
                </div>
            ),
        },
        {
            key: 'location',
            label: 'Vị trí',
            render: (_, row) => <span className="text-sm text-text-muted">{getLocationLabel(row)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '140px',
            render: (value) => <StatusBadge status={value} />,
        },
        {
            key: 'actions',
            label: '',
            width: '176px',
            align: 'right',
            render: (_, row) => (
                <div className="flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleViewAsset(row);
                        }}
                        title="Xem chi tiết"
                    >
                        Chi tiết
                    </button>
                    <button
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (row.is_assigned) {
                                setSelectedAsset(row);
                                setConfirmUnassignOpen(true);
                                return;
                            }
                            openHandoverModal(row);
                        }}
                        title={row.is_assigned ? 'Bỏ người phụ trách' : 'Gán người phụ trách'}
                    >
                        {row.is_assigned ? 'Thu hồi' : 'Bàn giao'}
                    </button>
                    <button
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            openMaintenanceWorkspace(row);
                        }}
                        title="Mở workspace bảo trì"
                    >
                        Bảo trì
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-text">Danh mục tài sản</h2>
                    <p className="text-sm text-text-muted">Tra cứu nhanh tài sản theo vị trí, người giữ và trạng thái vận hành.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    + Tạo tài sản
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Tài sản phù hợp</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{filteredSummary.total}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Đang bàn giao</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{filteredSummary.assigned}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Sẵn sàng điều phối</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{filteredSummary.available}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Cần chú ý</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{filteredSummary.attention}</div>
                </Card>
            </div>

            <Card>
                <CardBody className="py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                        <div className="xl:col-span-2">
                            <Input
                                placeholder="Tìm theo mã, serial, QR, model, vị trí hoặc người đang giữ"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                helper="Global search cho mã tài sản, serial, QR, model, vị trí và người phụ trách"
                            />
                        </div>
                        <Select
                            options={assetTypes}
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            options={assetStatuses}
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            options={locationOptions}
                            value={locationFilter}
                            onChange={(e) => {
                                setLocationFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            options={assignmentOptions}
                            value={assignmentFilter}
                            onChange={(e) => {
                                setAssignmentFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Button variant="outline" onClick={resetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>

                    {activeFilterTags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activeFilterTags.map((tag) => (
                                <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-muted">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    data={assets}
                    loading={loading}
                    emptyMessage="Chưa có tài sản phù hợp"
                    onRowClick={handleViewAsset}
                />
                {pagination.last_page > 1 && (
                    <div className="border-t border-border px-4 py-3">
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            totalItems={pagination.total}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>

            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Tạo tài sản"
                size="md"
            >
                <form onSubmit={handleCreateAsset} className="space-y-4">
                    <Input
                        label="Mã tài sản (không bắt buộc)"
                        value={createForm.asset_code}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, asset_code: e.target.value }))}
                        error={createErrors.asset_code?.[0]}
                    />
                    <Input
                        label="Serial number"
                        value={createForm.serial_number}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, serial_number: e.target.value }))}
                        error={createErrors.serial_number?.[0]}
                    />
                    <Input
                        label="Tên tài sản *"
                        value={createForm.name}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                        error={createErrors.name?.[0]}
                        required
                    />
                    <Input
                        label="Model"
                        value={createForm.model}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, model: e.target.value }))}
                        error={createErrors.model?.[0]}
                    />
                    <Input
                        label="QR code"
                        value={createForm.qr_code}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, qr_code: e.target.value }))}
                        error={createErrors.qr_code?.[0]}
                    />
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-text">Configuration</label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary min-h-[88px]"
                            value={createForm.configuration}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, configuration: e.target.value }))}
                            placeholder="VD: Intel Core Ultra 7 / 32GB RAM / 1TB SSD"
                        />
                        {createErrors.configuration?.[0] && (
                            <p className="mt-1 text-xs text-error">{createErrors.configuration[0]}</p>
                        )}
                    </div>
                    <Select
                        label="Loại tài sản *"
                        options={assetTypes.filter((option) => option.value)}
                        value={createForm.type}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
                    />
                    <Input
                        label="Danh mục"
                        value={createForm.category}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="VD: Laptop, Printer, Network"
                        error={createErrors.category?.[0]}
                    />
                    <Select
                        label="Vị trí"
                        options={[
                            { value: '', label: 'Chọn vị trí' },
                            ...locations.map((location) => ({
                                value: location.id,
                                label: `${location.code} - ${location.name}`,
                            })),
                        ]}
                        value={createForm.location_id}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, location_id: e.target.value }))}
                    />
                    <Select
                        label="Trạng thái"
                        options={assetStatuses.filter((option) => option.value)}
                        value={createForm.status}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}
                    />
                    <Select
                        label="Nhà cung cấp"
                        options={[
                            { value: '', label: 'Chọn nhà cung cấp' },
                            ...suppliers.map((supplier) => ({
                                value: supplier.id,
                                label: supplier.code ? `${supplier.code} - ${supplier.name}` : supplier.name,
                            })),
                        ]}
                        value={createForm.supplier_id}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
                    />
                    <Input
                        label="Ngày mua"
                        type="date"
                        value={createForm.purchase_date}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, purchase_date: e.target.value }))}
                        error={createErrors.purchase_date?.[0]}
                    />
                    <Input
                        label="Purchase price"
                        type="number"
                        min="0"
                        value={createForm.purchase_price}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, purchase_price: e.target.value }))}
                        error={createErrors.purchase_price?.[0] || createErrors.purchase_cost?.[0]}
                    />
                    <Input
                        label="Current depreciation rate"
                        type="number"
                        min="0"
                        step="0.0001"
                        value={createForm.current_depreciation_rate}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, current_depreciation_rate: e.target.value }))}
                        error={createErrors.current_depreciation_rate?.[0]}
                    />
                    <Input
                        label="Thời gian sử dụng dự kiến (tháng)"
                        type="number"
                        min="1"
                        value={createForm.useful_life_months}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, useful_life_months: e.target.value }))}
                        error={createErrors.useful_life_months?.[0]}
                    />
                    <Input
                        label="Ngày hết bảo hành"
                        type="date"
                        value={createForm.warranty_expiry}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, warranty_expiry: e.target.value }))}
                        error={createErrors.warranty_expiry?.[0]}
                    />
                    <Input
                        label="Ghi chú"
                        value={createForm.notes}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="ghost" type="button" onClick={() => setCreateModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={createLoading}>
                            {createLoading ? 'Đang tạo...' : 'Tạo tài sản'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={handoverModalOpen}
                onClose={() => setHandoverModalOpen(false)}
                title="Gán nhân viên chịu trách nhiệm"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-surface-muted rounded-lg p-3">
                        <div className="font-medium text-text">{selectedAsset?.name}</div>
                        <div className="text-xs text-text-muted font-mono">{selectedAsset?.asset_code}</div>
                    </div>
                    <Select
                        label="Người nhận tài sản *"
                        options={[
                            { value: '', label: 'Chọn người nhận' },
                            ...employees.map((employee) => ({
                                value: buildHandoverValue(employee),
                                label: `${employee.employee_code} - ${employee.full_name}${employee.user?.username ? ` · ${employee.user.username}` : ''}${employee.position ? ` (${employee.position})` : ''}`,
                            })),
                        ]}
                        value={handoverTarget}
                        onChange={(e) => setHandoverTarget(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setHandoverModalOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleHandoverAsset} disabled={handoverLoading}>
                        {handoverLoading ? 'Đang lưu...' : 'Xác nhận'}
                    </Button>
                </div>
            </Modal>

            {detailDrawerOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-surface-invert/20 backdrop-blur-sm"
                        onClick={() => setDetailDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-surface shadow-xl flex flex-col h-full animate-slide-in-right">
                        <div className="p-6 border-b border-border bg-background">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-text">{selectedAsset.name}</h2>
                                    <p className="text-sm text-text-muted font-mono">{selectedAsset.asset_code}</p>
                                    <div className="mt-3 inline-flex">
                                        <StatusBadge status={selectedAsset.status} />
                                    </div>
                                </div>
                                <button
                                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"
                                    onClick={() => setDetailDrawerOpen(false)}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <Card>
                                <CardBody className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Loại</span>
                                        <span className="text-sm font-medium">{getAssetTypeLabel(selectedAsset.type)}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Serial</span>
                                        <span className="text-sm font-medium text-right">{selectedAsset.serial_number || 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Model</span>
                                        <span className="text-sm font-medium text-right">{selectedAsset.model || 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">QR code</span>
                                        <span className="text-sm font-medium text-right break-all">{selectedAsset.qr_code || 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Danh mục</span>
                                        <span className="text-sm font-medium text-right">{selectedAsset.category || 'Chưa gắn danh mục'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Vị trí</span>
                                        <span className="text-sm font-medium text-right">{getLocationLabel(selectedAsset)}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Nhà cung cấp</span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-text">{selectedAsset.supplier?.name || 'Chưa chọn'}</div>
                                            <div className="text-xs text-text-muted">{selectedAsset.supplier?.code || selectedAsset.supplier?.contact_person || ''}</div>
                                        </div>
                                    </div>
                                    {selectedAsset.notes && (
                                        <div className="pt-3 border-t border-border">
                                            <div className="text-xs font-semibold text-text-muted uppercase mb-1">Ghi chú</div>
                                            <div className="text-sm text-text">{selectedAsset.notes}</div>
                                        </div>
                                    )}
                                    {selectedAsset.configuration && (
                                        <div className="pt-3 border-t border-border">
                                            <div className="text-xs font-semibold text-text-muted uppercase mb-1">Configuration</div>
                                            <div className="text-sm text-text whitespace-pre-wrap">{selectedAsset.configuration}</div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-semibold text-text-muted uppercase">Nhân viên chịu trách nhiệm</div>
                                            <div className="font-medium text-text">{getResponsibleEmployee(selectedAsset)}</div>
                                            <div className="text-xs text-text-muted">
                                                {selectedAsset.current_assignment?.assigned_at
                                                    ? `Từ ${new Date(selectedAsset.current_assignment.assigned_at).toLocaleDateString('vi-VN')}`
                                                    : 'Chưa có người phụ trách'}
                                            </div>
                                            <div className="text-xs text-text-muted mt-1">{getDepartmentLabel(selectedAsset)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedAsset.current_assignment ? (
                                            <Button variant="danger" fullWidth onClick={() => setConfirmUnassignOpen(true)}>
                                                Bỏ người phụ trách
                                            </Button>
                                        ) : (
                                            <Button fullWidth onClick={() => openHandoverModal(selectedAsset)}>
                                                Gán người phụ trách
                                            </Button>
                                        )}
                                        <Button variant="outline" fullWidth onClick={() => openMaintenanceWorkspace(selectedAsset)}>
                                            Mở workspace bảo trì
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="space-y-3">
                                    <div className="font-semibold text-text">Giá trị & vòng đời</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Purchase price</span>
                                        <span className="text-sm font-medium">{selectedAsset.purchase_price ? formatCurrency(selectedAsset.purchase_price) : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Depreciation rate</span>
                                        <span className="text-sm font-medium">{selectedAsset.current_depreciation_rate !== null && selectedAsset.current_depreciation_rate !== undefined ? selectedAsset.current_depreciation_rate : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Giá trị còn lại</span>
                                        <span className="text-sm font-medium">{selectedAsset.valuation?.current_book_value ? formatCurrency(selectedAsset.valuation.current_book_value) : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Khấu hao</span>
                                        <span className="text-sm font-medium">{selectedAsset.valuation?.depreciation_percentage ? `${selectedAsset.valuation.depreciation_percentage.toFixed(1)}%` : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Ngày mua</span>
                                        <span className="text-sm font-medium">{selectedAsset.purchase_date ? new Date(selectedAsset.purchase_date).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Hết bảo hành</span>
                                        <span className="text-sm font-medium">{selectedAsset.warranty_expiry ? new Date(selectedAsset.warranty_expiry).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                                    </div>
                                </CardBody>
                            </Card>

                            {selectedAsset.assignment_history?.length > 0 && (
                                <Card>
                                    <CardBody className="space-y-3">
                                        <div className="font-semibold text-text">Lịch sử người phụ trách</div>
                                        <div className="divide-y divide-border">
                                            {selectedAsset.assignment_history.slice(0, 5).map((history) => (
                                                <div key={history.id} className="py-3">
                                                    <div className="font-medium text-text">{history.assignment_target?.name || 'Không xác định'}</div>
                                                    <div className="text-xs text-text-muted">
                                                        {new Date(history.assigned_at).toLocaleDateString('vi-VN')}
                                                        {history.unassigned_at ? ` - ${new Date(history.unassigned_at).toLocaleDateString('vi-VN')}` : ' - hiện tại'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            <div className="pt-4 border-t border-border">
                                <button
                                    className="w-full flex items-center justify-center gap-2 p-3 text-error hover:bg-error-light rounded-lg transition-colors"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                >
                                    Xóa tài sản
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmUnassignOpen}
                onClose={() => setConfirmUnassignOpen(false)}
                onConfirm={handleUnassignAsset}
                title="Bỏ người phụ trách"
                message={`Bạn có chắc muốn bỏ người phụ trách của ${selectedAsset?.name || ''}?`}
                confirmText="Xác nhận"
                variant="warning"
            />

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleDeleteAsset}
                title="Xóa tài sản"
                message={`Bạn có chắc muốn xóa ${selectedAsset?.name || ''}?`}
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
};

export default AssetsPage;
