import React, { useEffect, useState } from 'react';
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
import { assetsApi, handleApiError, suppliersApi } from '../services/api';

const AssetsPage = () => {
    const toast = useToast();

    const [assets, setAssets] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
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
        name: '',
        type: 'equipment',
        status: 'active',
        supplier_id: '',
        notes: '',
    });

    const [departmentName, setDepartmentName] = useState('');

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
        { value: 'retired', label: 'Đã thu hồi' },
    ];

    const assignmentOptions = [
        { value: '', label: 'Tất cả bàn giao' },
        { value: 'assigned', label: 'Đã bàn giao' },
        { value: 'unassigned', label: 'Chưa bàn giao' },
    ];

    useEffect(() => {
        fetchAssets();
    }, [currentPage, searchQuery, typeFilter, statusFilter, assignmentFilter]);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await assetsApi.list({
                page: currentPage,
                search: searchQuery || undefined,
                type: typeFilter || undefined,
                status: statusFilter || undefined,
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

    const fetchSuppliers = async () => {
        try {
            const response = await suppliersApi.dropdown();
            setSuppliers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        }
    };

    const getAssetTypeLabel = (type) => assetTypes.find((option) => option.value === type)?.label || 'Khác';
    const getAssignmentTarget = (asset) => asset.current_assignment?.assignment_target?.name || 'Chưa bàn giao';

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
            const response = await assetsApi.create(createForm);
            toast.success('Đã tạo tài sản.');
            setCreateModalOpen(false);
            setCreateForm({
                asset_code: '',
                name: '',
                type: 'equipment',
                status: 'active',
                supplier_id: '',
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

    const openHandoverModal = () => {
        setDepartmentName(selectedAsset?.current_assignment?.department_name || '');
        setHandoverModalOpen(true);
    };

    const handleHandoverAsset = async () => {
        if (!selectedAsset || !departmentName.trim()) {
            toast.error('Vui lòng nhập phòng ban nhận bàn giao.');
            return;
        }

        setHandoverLoading(true);
        try {
            await assetsApi.assign(selectedAsset.id, { department_name: departmentName.trim() });
            toast.success('Đã bàn giao tài sản cho phòng ban.');
            setHandoverModalOpen(false);
            setDepartmentName('');

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
            toast.success('Đã kết thúc bàn giao.');
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
            render: (value) => <span className="font-mono text-sm text-text-muted">{value}</span>,
        },
        {
            key: 'name',
            label: 'Tài sản',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted capitalize">{getAssetTypeLabel(row.type)}</div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '130px',
            render: (value) => <StatusBadge status={value} />,
        },
        {
            key: 'current_assignment',
            label: 'Phòng ban nhận bàn giao',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-text">{getAssignmentTarget(row)}</div>
                    <div className="text-xs text-text-muted">
                        {row.current_assignment?.assigned_at
                            ? `Từ ${new Date(row.current_assignment.assigned_at).toLocaleDateString('vi-VN')}`
                            : 'Chưa có bản ghi bàn giao'}
                    </div>
                </div>
            ),
        },
        {
            key: 'actions',
            label: '',
            width: '60px',
            align: 'right',
            render: (_, row) => (
                <button
                    className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"
                    onClick={() => handleViewAsset(row)}
                    title="Xem chi tiết"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-text">Danh mục tài sản</h2>
                    <p className="text-sm text-text-muted">Theo scope mới, tài sản được bàn giao theo phòng ban thay vì gắn cho từng nhân viên.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    + Tạo tài sản
                </Button>
            </div>

            <Card>
                <CardBody className="py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <Input
                                placeholder="Tìm theo mã hoặc tên tài sản"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
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
                            options={assignmentOptions}
                            value={assignmentFilter}
                            onChange={(e) => {
                                setAssignmentFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
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
                        label="Tên tài sản *"
                        value={createForm.name}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                        error={createErrors.name?.[0]}
                        required
                    />
                    <Select
                        label="Loại tài sản *"
                        options={assetTypes.filter((option) => option.value)}
                        value={createForm.type}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
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
                title="Bàn giao cho phòng ban"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-surface-muted rounded-lg p-3">
                        <div className="font-medium text-text">{selectedAsset?.name}</div>
                        <div className="text-xs text-text-muted font-mono">{selectedAsset?.asset_code}</div>
                    </div>
                    <Input
                        label="Phòng ban nhận bàn giao *"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                        placeholder="VD: Nha khoa tổng quát, Khử trùng, Hành chính"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setHandoverModalOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleHandoverAsset} disabled={handoverLoading}>
                        {handoverLoading ? 'Đang lưu...' : 'Xác nhận bàn giao'}
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
                                        <span className="text-xs font-semibold text-text-muted uppercase">Trạng thái</span>
                                        <StatusBadge status={selectedAsset.status} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Loại</span>
                                        <span className="text-sm font-medium">{getAssetTypeLabel(selectedAsset.type)}</span>
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
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-semibold text-text-muted uppercase">Bàn giao hiện tại</div>
                                            <div className="font-medium text-text">{getAssignmentTarget(selectedAsset)}</div>
                                            <div className="text-xs text-text-muted">
                                                {selectedAsset.current_assignment?.assigned_at
                                                    ? `Từ ${new Date(selectedAsset.current_assignment.assigned_at).toLocaleDateString('vi-VN')}`
                                                    : 'Chưa có bản ghi bàn giao'}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedAsset.current_assignment ? (
                                        <Button variant="danger" fullWidth onClick={() => setConfirmUnassignOpen(true)}>
                                            Kết thúc bàn giao
                                        </Button>
                                    ) : (
                                        <Button fullWidth onClick={openHandoverModal}>
                                            Bàn giao cho phòng ban
                                        </Button>
                                    )}
                                </CardBody>
                            </Card>

                            {selectedAsset.assignment_history?.length > 0 && (
                                <Card>
                                    <CardBody className="space-y-3">
                                        <div className="font-semibold text-text">Lịch sử bàn giao</div>
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
                title="Kết thúc bàn giao"
                message={`Bạn có chắc muốn kết thúc bàn giao ${selectedAsset?.name || ''}?`}
                confirmText="Kết thúc"
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
