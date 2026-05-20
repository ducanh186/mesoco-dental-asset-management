import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { assetsApi, handleApiError, purchaseOrdersApi, suppliersApi } from '../services/api';
import {
    Badge,
    Button,
    Card,
    Input,
    Modal,
    Select,
    Table,
    TablePagination,
    Textarea,
    useToast,
} from '../components/ui';
import { getUserRole, isManager as userIsManager, ROLE_SUPPLIER } from '../utils/roles';

const EMPTY_ITEM = {
    item_name: '',
    qty: '1',
    unit: '',
    note: '',
};

const today = () => new Date().toISOString().slice(0, 10);

const createEmptyForm = () => ({
    supplier_id: '',
    order_date: today(),
    expected_delivery_date: '',
    status: 'preparing',
    note: '',
    items: [{ ...EMPTY_ITEM }],
});

const getStatusVariant = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'preparing':
        case 'shipping':
            return 'warning';
        case 'delivered':
            return 'success';
        default:
            return 'default';
    }
};

const getStatusLabel = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'preparing':
        case 'shipping':
            return 'Chờ giao hàng';
        case 'delivered':
            return 'Giao hàng thành công';
        default:
            return status || 'Không xác định';
    }
};

const PurchaseOrdersPage = ({ user }) => {
    const toast = useToast();
    const role = getUserRole(user);
    const isSupplier = role === ROLE_SUPPLIER;
    const canManageOrders = userIsManager(user);

    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [deviceOptions, setDeviceOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [summary, setSummary] = useState({
        total: 0,
        pending_delivery: 0,
        delivered: 0,
    });
    const [statusOptions, setStatusOptions] = useState(['preparing', 'delivered']);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailStatusValue, setDetailStatusValue] = useState('');
    const [receiptLoading, setReceiptLoading] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(createEmptyForm);
    const [formErrors, setFormErrors] = useState({});

    const supplierOptions = useMemo(() => (
        suppliers.map((supplier) => ({
            value: String(supplier.id),
            label: supplier.code ? `${supplier.code} - ${supplier.name}` : supplier.name,
        }))
    ), [suppliers]);

    const purchaseOrderDeviceOptions = useMemo(() => (
        deviceOptions.map((asset) => {
            const label = asset.asset_code ? `${asset.asset_code} - ${asset.name}` : asset.name;

            return {
                id: asset.id,
                label,
            };
        }).filter((asset) => asset.label)
    ), [deviceOptions]);

    const statusSelectOptions = useMemo(() => (
        statusOptions.map((status) => ({
            value: status,
            label: getStatusLabel(status),
        }))
    ), [statusOptions]);

    const statusFilterOptions = useMemo(() => ([
        { value: '', label: 'Tất cả' },
        ...statusSelectOptions,
    ]), [statusSelectOptions]);

    const fetchOrders = useCallback(async (page = 1) => {
        setLoading(true);

        try {
            const response = await purchaseOrdersApi.list({
                page,
                per_page: pagination.per_page,
                search: search || undefined,
                status: statusFilter || undefined,
            });

            setOrders(response.data || []);
            setPagination({
                current_page: response.current_page || 1,
                last_page: response.last_page || 1,
                per_page: response.per_page || 15,
                total: response.total || 0,
            });
            setSummary(response.summary || {
                total: 0,
                pending_delivery: 0,
                delivered: 0,
            });
            setStatusOptions(response.status_options || ['preparing', 'delivered']);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [pagination.per_page, search, statusFilter, toast]);

    const fetchSuppliers = useCallback(async () => {
        if (!canManageOrders) {
            return;
        }

        try {
            const response = await suppliersApi.dropdown();
            setSuppliers(response.data || []);
        } catch (error) {
            handleApiError(error, toast);
        }
    }, [canManageOrders, toast]);

    const fetchDeviceOptions = useCallback(async () => {
        if (!canManageOrders) {
            return;
        }

        try {
            const response = await assetsApi.list({ per_page: 100 });
            setDeviceOptions(response.assets || response.data || []);
        } catch (error) {
            handleApiError(error, toast);
        }
    }, [canManageOrders, toast]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    useEffect(() => {
        fetchDeviceOptions();
    }, [fetchDeviceOptions]);

    const resetForm = () => {
        setFormData(createEmptyForm());
        setFormErrors({});
        setEditingOrderId(null);
    };

    const handleCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleOpenDetail = async (order) => {
        try {
            const response = await purchaseOrdersApi.get(order.id);
            setSelectedOrder(response.data);
            setDetailStatusValue(response.data?.status || '');
            setDetailModalOpen(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleEdit = async (order) => {
        setEditingOrderId(order.id);
        setFormErrors({});
        setDetailModalOpen(false);

        try {
            const response = await purchaseOrdersApi.get(order.id);
            const payload = response.data;

            setFormData({
                supplier_id: payload.supplier?.id ? String(payload.supplier.id) : '',
                order_date: payload.order_date || '',
                expected_delivery_date: payload.expected_delivery_date || '',
                status: payload.status || 'preparing',
                note: payload.note || '',
                items: (payload.items || []).length > 0
                    ? payload.items.map((item) => ({
                        item_name: item.item_name || '',
                        qty: item.qty || '1',
                        unit: item.unit || '',
                        note: item.note || '',
                    }))
                    : [{ ...EMPTY_ITEM }],
            });
            setIsModalOpen(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDelete = async (order) => {
        if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) {
            return;
        }

        try {
            await purchaseOrdersApi.delete(order.id);
            toast.success('Đã hủy đơn hàng thành công');
            setDetailModalOpen(false);
            setSelectedOrder(null);
            fetchOrders(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleStatusUpdate = async (order, nextStatus) => {
        try {
            const response = await purchaseOrdersApi.updateStatus(order.id, { status: nextStatus });
            toast.success('Cập nhật trạng thái đơn hàng thành công');
            setSelectedOrder(response.data);
            setDetailStatusValue(response.data?.status || '');
            fetchOrders(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleCreateReceipt = async (order) => {
        setReceiptLoading(true);

        try {
            const response = await purchaseOrdersApi.createReceipt(order.id, {
                received_at: new Date().toISOString(),
                note: 'Phiếu nhập hàng tạo sau khi đơn hàng giao thành công.',
                items: (order.items || []).map((item) => ({
                    purchase_order_item_id: item.id,
                    accepted_qty: item.qty,
                    rejected_qty: 0,
                    condition_status: 'accepted',
                    note: 'Đạt chuẩn',
                })),
            });

            toast.success('Đã tạo phiếu nhập hàng');
            setSelectedOrder(response.data);
            fetchOrders(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setReceiptLoading(false);
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (formErrors[name]) {
            setFormErrors((previous) => ({
                ...previous,
                [name]: null,
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.map((item, itemIndex) => (
                itemIndex === index ? { ...item, [field]: value } : item
            )),
        }));
    };

    const handleAddItem = () => {
        setFormData((previous) => ({
            ...previous,
            items: [...previous.items, { ...EMPTY_ITEM }],
        }));
    };

    const handleRemoveItem = (index) => {
        setFormData((previous) => ({
            ...previous,
            items: previous.items.length === 1
                ? previous.items
                : previous.items.filter((_, itemIndex) => itemIndex !== index),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        const payload = {
            supplier_id: Number(formData.supplier_id),
            order_date: formData.order_date || today(),
            expected_delivery_date: null,
            status: formData.status || 'preparing',
            note: formData.note || null,
            items: formData.items.map((item) => ({
                item_name: item.item_name,
                qty: Number(item.qty),
                unit: item.unit || null,
                note: item.note || null,
            })),
        };

        try {
            if (editingOrderId) {
                await purchaseOrdersApi.update(editingOrderId, payload);
                toast.success('Cập nhật đơn hàng thành công');
            } else {
                const response = await purchaseOrdersApi.create(payload);
                const notificationMessage = response.supplier_notification?.message || 'Thông báo nhà cung cấp đã được xử lý.';
                toast.success(`Tạo đơn hàng thành công. ${notificationMessage}`);
            }

            setIsModalOpen(false);
            resetForm();
            fetchOrders(editingOrderId ? pagination.current_page : 1);
        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response?.data?.errors || {});
            } else {
                handleApiError(error, toast);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            key: 'order_code',
            label: 'Đơn hàng',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted">{row.order_date || 'Chưa có ngày đặt'}</div>
                </div>
            ),
        },
        ...(!isSupplier ? [{
            key: 'supplier',
            label: 'Nhà cung cấp',
            render: (value) => (
                <div>
                    <div className="text-sm text-text">{value?.name || '—'}</div>
                    <div className="text-xs text-text-muted">{value?.code || value?.contact_person || '—'}</div>
                </div>
            ),
        }] : []),
        {
            key: 'items_count',
            label: 'Thiết bị',
            align: 'center',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value ?? 0}</div>
                    <div className="text-xs text-text-muted">{row.items?.[0]?.item_name || '—'}</div>
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value, row) => (
                <Badge variant={getStatusVariant(value)} size="sm">
                    {row.status_label || getStatusLabel(value)}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => handleOpenDetail(row)}>
                        Chi tiết
                    </Button>
                    {(canManageOrders || isSupplier) && row.status !== 'delivered' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(row, 'delivered')}>
                            Cập nhật trạng thái
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-text">
                        {isSupplier ? 'Đơn hàng của tôi' : 'Quản lý đơn hàng'}
                    </h1>
                    <p className="text-text-muted mt-1">
                        {isSupplier
                            ? 'Theo dõi tiến độ giao hàng và cập nhật trạng thái đơn hàng của nhà cung cấp'
                            : 'Quản lý đơn đặt hàng theo nhà cung cấp, thiết bị, đơn vị và số lượng'}
                    </p>
                </div>
                {canManageOrders && (
                    <Button onClick={handleCreate}>Tạo đơn hàng</Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Tổng đơn hàng</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.total}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Chờ giao hàng</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.pending_delivery ?? summary.preparing ?? 0}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Giao thành công</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.delivered}</div>
                </Card>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                        placeholder="Tìm theo mã đơn, thiết bị, nhà cung cấp..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        options={statusFilterOptions}
                        placeholder={false}
                    />
                    <Button variant="primary" onClick={() => fetchOrders(1)}>
                        Lọc
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('');
                            fetchOrders(1);
                        }}
                    >
                        Xóa bộ lọc
                    </Button>
                </div>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    data={orders}
                    loading={loading}
                    emptyMessage="Không có đơn hàng nào"
                />

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex justify-center pb-4">
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            totalItems={pagination.total}
                            pageSize={pagination.per_page}
                            onPageChange={(page) => fetchOrders(page)}
                        />
                    </div>
                )}
            </Card>

            <Modal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                size="lg"
                title={selectedOrder ? `Chi tiết ${selectedOrder.order_code}` : 'Chi tiết đơn hàng'}
            >
                {selectedOrder && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                                <div className="text-xs font-semibold uppercase text-text-muted">Nhà cung cấp</div>
                                <div className="mt-1 text-sm font-medium text-text">{selectedOrder.supplier?.name || '—'}</div>
                                <div className="text-xs text-text-muted">{selectedOrder.supplier?.code || selectedOrder.supplier?.contact_person || '—'}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase text-text-muted">Trạng thái</div>
                                <div className="mt-1 inline-flex">
                                    <Badge variant={getStatusVariant(selectedOrder.status)} size="sm">
                                        {selectedOrder.status_label || getStatusLabel(selectedOrder.status)}
                                    </Badge>
                                </div>
                            </div>
                            {(canManageOrders || isSupplier) && (
                                <div>
                                    <div className="text-xs font-semibold uppercase text-text-muted">Cập nhật trạng thái</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Select
                                            value={detailStatusValue}
                                            onChange={(event) => setDetailStatusValue(event.target.value)}
                                            options={statusSelectOptions}
                                            placeholder={false}
                                            disabled={selectedOrder.status === 'delivered'}
                                        />
                                        <Button
                                            variant="outline"
                                            disabled={selectedOrder.status === 'delivered' || detailStatusValue === selectedOrder.status}
                                            onClick={() => handleStatusUpdate(selectedOrder, detailStatusValue)}
                                        >
                                            Cập nhật trạng thái
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="text-xs font-semibold uppercase text-text-muted">Ngày tạo</div>
                                <div className="mt-1 text-sm text-text">{selectedOrder.order_date || '—'}</div>
                            </div>
                            <div>
                                <div className="text-xs font-semibold uppercase text-text-muted">Ghi chú</div>
                                <div className="mt-1 text-sm text-text">{selectedOrder.note || '—'}</div>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 text-sm font-semibold text-text">Danh sách thiết bị</div>
                            <div className="divide-y divide-border rounded-md border border-border">
                                {(selectedOrder.items || []).map((item) => (
                                    <div key={item.id} className="grid grid-cols-1 gap-2 p-3 text-sm md:grid-cols-[1fr_auto_auto]">
                                        <div>
                                            <div className="font-medium text-text">{item.item_name}</div>
                                            <div className="text-xs text-text-muted">{item.note || 'Không có ghi chú'}</div>
                                        </div>
                                        <div className="text-text-muted">{item.unit || '—'}</div>
                                        <div className="font-medium text-text">{item.qty}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedOrder.status === 'delivered' && (
                            <div>
                                <div className="mb-2 text-sm font-semibold text-text">Phiếu nhập hàng</div>
                                {selectedOrder.receipt ? (
                                    <div className="rounded-md border border-success/40 bg-success/5 p-3">
                                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                                            <div>
                                                <div className="text-xs font-semibold uppercase text-text-muted">Mã phiếu nhập</div>
                                                <div className="mt-1 font-medium text-text">{selectedOrder.receipt.receipt_code}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold uppercase text-text-muted">Người nhập</div>
                                                <div className="mt-1 text-text">{selectedOrder.receipt.receiver?.name || '—'}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold uppercase text-text-muted">Thời gian nhập</div>
                                                <div className="mt-1 text-text">{selectedOrder.receipt.received_at || '—'}</div>
                                            </div>
                                        </div>
                                        <div className="mt-3 divide-y divide-border">
                                            {(selectedOrder.receipt.items || []).map((item) => (
                                                <div key={`receipt-${item.id}`} className="grid grid-cols-1 gap-2 py-2 text-sm md:grid-cols-[1fr_auto_auto_auto]">
                                                    <div>
                                                        <div className="font-medium text-text">{item.item_name}</div>
                                                        <div className="text-xs text-text-muted">
                                                            {item.asset_id ? `Thiết bị hiện có #${item.asset_id}` : 'Thiết bị mới, cần nhập vào danh mục thiết bị'}
                                                        </div>
                                                    </div>
                                                    <Badge variant="success" size="sm">Đạt chuẩn</Badge>
                                                    <div className="font-medium text-text">Đạt: {item.accepted_qty} {item.unit || ''}</div>
                                                    <div className="text-text-muted">Không đạt: {item.rejected_qty} {item.unit || ''}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-md border border-warning/40 bg-warning/5 p-3">
                                        <p className="text-sm text-text-muted">
                                            Đơn hàng đã giao thành công nhưng chưa có phiếu nhập hàng được lưu trong hệ thống.
                                        </p>
                                        {canManageOrders && (
                                            <Button
                                                className="mt-3"
                                                variant="outline"
                                                disabled={receiptLoading}
                                                onClick={() => handleCreateReceipt(selectedOrder)}
                                            >
                                                {receiptLoading ? 'Đang tạo phiếu...' : 'Tạo phiếu nhập hàng'}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                            {isSupplier && selectedOrder.status !== 'delivered' && (
                                <Button onClick={() => handleStatusUpdate(selectedOrder, 'delivered')}>
                                    Xác nhận giao hàng thành công
                                </Button>
                            )}
                            {canManageOrders && (
                                <>
                                    <Button variant="outline" onClick={() => handleEdit(selectedOrder)}>
                                        Sửa
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(selectedOrder)}>
                                        Hủy
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                size="xl"
                title={editingOrderId ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                            <Card className="p-5">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-text">Khối 1 · Thông tin nhà cung cấp</h3>
                                    <p className="mt-1 text-sm text-text-muted">Chọn nhà cung cấp và ghi chú đơn hàng nếu cần.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Select
                                        label="Nhà cung cấp"
                                        value={formData.supplier_id}
                                        onChange={(event) => handleInputChange({
                                            target: { name: 'supplier_id', value: event.target.value },
                                        })}
                                        options={supplierOptions}
                                        error={formErrors.supplier_id?.[0]}
                                        required
                                    />
                                    <Textarea
                                        label="Ghi chú đơn hàng"
                                        name="note"
                                        value={formData.note}
                                        onChange={handleInputChange}
                                        rows={3}
                                        error={formErrors.note?.[0]}
                                    />
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="mb-4 flex items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-text">Khối 2 · Danh sách thiết bị</h3>
                                        <p className="mt-1 text-sm text-text-muted">Nhập từng dòng thiết bị cần đặt: tên, đơn vị, số lượng và ghi chú.</p>
                                    </div>
                                    <Button type="button" variant="outline" onClick={handleAddItem}>
                                        Thêm thiết bị
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {formData.items.map((item, index) => (
                                        <Card key={`item-${index}`} className="border border-border p-4 shadow-none">
                                            <div className="mb-3 flex items-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={formData.items.length === 1}
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                    title="Gỡ thiết bị khỏi đơn hàng"
                                                    aria-label={`Gỡ dòng thiết bị ${index + 1}`}
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1m-6-3h4a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1Z" />
                                                    </svg>
                                                </button>
                                                <div className="text-sm font-semibold text-text">Dòng thiết bị #{index + 1}</div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.8fr_0.8fr_0.7fr]">
                                                <Input
                                                    label="Chọn thiết bị"
                                                    value={item.item_name}
                                                    onChange={(event) => handleItemChange(index, 'item_name', event.target.value)}
                                                    error={formErrors[`items.${index}.item_name`]?.[0]}
                                                    list="purchase-order-device-options"
                                                    required
                                                />
                                                <Input
                                                    label="Đơn vị"
                                                    value={item.unit}
                                                    onChange={(event) => handleItemChange(index, 'unit', event.target.value)}
                                                    error={formErrors[`items.${index}.unit`]?.[0]}
                                                    placeholder="cái / bộ / hộp"
                                                    required
                                                />
                                                <Input
                                                    label="Số lượng"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.qty}
                                                    onChange={(event) => handleItemChange(index, 'qty', event.target.value)}
                                                    error={formErrors[`items.${index}.qty`]?.[0]}
                                                    required
                                                />
                                            </div>

                                            <div className="mt-4">
                                                <Textarea
                                                    label="Ghi chú thiết bị"
                                                    value={item.note}
                                                    onChange={(event) => handleItemChange(index, 'note', event.target.value)}
                                                    rows={2}
                                                    error={formErrors[`items.${index}.note`]?.[0]}
                                                />
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                                <datalist id="purchase-order-device-options">
                                    {purchaseOrderDeviceOptions.map((asset) => (
                                        <option key={asset.id} value={asset.label} />
                                    ))}
                                </datalist>
                            </Card>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-border pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : (editingOrderId ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PurchaseOrdersPage;
