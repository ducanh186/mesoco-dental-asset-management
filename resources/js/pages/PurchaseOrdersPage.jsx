import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { handleApiError, purchaseOrdersApi, suppliersApi } from '../services/api';
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
import { getUserRole, hasOperationalAccess, ROLE_SUPPLIER } from '../utils/roles';

const EMPTY_ITEM = {
    item_name: '',
    qty: '1',
    unit: '',
    unit_price: '',
    note: '',
};

const createEmptyForm = () => ({
    supplier_id: '',
    order_date: '',
    expected_delivery_date: '',
    status: 'preparing',
    payment_method: '',
    note: '',
    items: [{ ...EMPTY_ITEM }],
});

const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
};

const getStatusVariant = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'preparing':
            return 'warning';
        case 'shipping':
            return 'info';
        case 'delivered':
            return 'success';
        default:
            return 'default';
    }
};

const getStatusLabel = (status) => {
    switch ((status || '').toLowerCase()) {
        case 'preparing':
            return 'Chuẩn bị';
        case 'shipping':
            return 'Đang giao';
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
    const isOperationalRole = hasOperationalAccess(user);

    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [summary, setSummary] = useState({
        total: 0,
        preparing: 0,
        shipping: 0,
        delivered: 0,
    });
    const [statusOptions, setStatusOptions] = useState(['preparing', 'shipping', 'delivered']);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const statusSelectOptions = useMemo(() => (
        statusOptions.map((status) => ({
            value: status,
            label: getStatusLabel(status),
        }))
    ), [statusOptions]);

    const statusFilterOptions = useMemo(() => ([
        { value: '', label: 'Tất cả trạng thái' },
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
                preparing: 0,
                shipping: 0,
                delivered: 0,
            });
            setStatusOptions(response.status_options || ['preparing', 'shipping', 'delivered']);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [pagination.per_page, search, statusFilter, toast]);

    const fetchSuppliers = useCallback(async () => {
        if (!isOperationalRole) {
            return;
        }

        try {
            const response = await suppliersApi.dropdown();
            setSuppliers(response.data || []);
        } catch (error) {
            handleApiError(error, toast);
        }
    }, [isOperationalRole, toast]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const resetForm = () => {
        setFormData(createEmptyForm());
        setFormErrors({});
        setEditingOrderId(null);
    };

    const handleCreate = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = async (order) => {
        setEditingOrderId(order.id);
        setFormErrors({});

        try {
            const response = await purchaseOrdersApi.get(order.id);
            const payload = response.data;

            setFormData({
                supplier_id: payload.supplier?.id ? String(payload.supplier.id) : '',
                order_date: payload.order_date || '',
                expected_delivery_date: payload.expected_delivery_date || '',
                status: payload.status || 'preparing',
                payment_method: payload.payment_method || '',
                note: payload.note || '',
                items: (payload.items || []).length > 0
                    ? payload.items.map((item) => ({
                        item_name: item.item_name || '',
                        qty: item.qty || '1',
                        unit: item.unit || '',
                        unit_price: item.unit_price || '',
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
        if (!window.confirm(`Xóa đơn hàng ${order.order_code}?`)) {
            return;
        }

        try {
            await purchaseOrdersApi.delete(order.id);
            toast.success('Xóa đơn hàng thành công');
            fetchOrders(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleStatusUpdate = async (order, nextStatus) => {
        try {
            await purchaseOrdersApi.updateStatus(order.id, { status: nextStatus });
            toast.success('Cập nhật trạng thái đơn hàng thành công');
            fetchOrders(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
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
            order_date: formData.order_date,
            expected_delivery_date: formData.expected_delivery_date || null,
            status: formData.status,
            payment_method: formData.payment_method || null,
            note: formData.note || null,
            items: formData.items.map((item) => ({
                item_name: item.item_name,
                qty: Number(item.qty),
                unit: item.unit || null,
                unit_price: Number(item.unit_price),
                note: item.note || null,
            })),
        };

        try {
            if (editingOrderId) {
                await purchaseOrdersApi.update(editingOrderId, payload);
                toast.success('Cập nhật đơn hàng thành công');
            } else {
                await purchaseOrdersApi.create(payload);
                toast.success('Tạo đơn hàng thành công');
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
            label: 'Sản phẩm',
            align: 'center',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value ?? 0}</div>
                    <div className="text-xs text-text-muted">{row.items?.[0]?.item_name || '—'}</div>
                </div>
            ),
        },
        {
            key: 'payment_method',
            label: 'Thanh toán',
            render: (value) => <span className="text-text-muted">{value || '—'}</span>,
        },
        {
            key: 'total_amount',
            label: 'Thành tiền',
            align: 'right',
            render: (value) => <span className="font-medium text-text">{formatCurrency(value)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value) => (
                <Badge variant={getStatusVariant(value)} size="sm">
                    {getStatusLabel(value)}
                </Badge>
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    {isOperationalRole ? (
                        <>
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
                                Sửa
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDelete(row)}
                            >
                                Xóa
                            </Button>
                        </>
                    ) : (
                        <>
                            {row.status === 'preparing' && (
                                <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(row, 'shipping')}>
                                    Chuyển sang giao
                                </Button>
                            )}
                            {row.status === 'shipping' && (
                                <Button size="sm" variant="ghost" onClick={() => handleStatusUpdate(row, 'delivered')}>
                                    Xác nhận giao xong
                                </Button>
                            )}
                        </>
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
                            : 'Quản lý đơn đặt hàng theo nhà cung cấp, sản phẩm, số lượng và thanh toán'}
                    </p>
                </div>
                {isOperationalRole && (
                    <Button onClick={handleCreate}>Tạo đơn hàng</Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Tổng đơn hàng</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.total}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Chuẩn bị</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.preparing}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Đang giao</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.shipping}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Giao thành công</div>
                    <div className="text-2xl font-semibold text-text mt-1">{summary.delivered}</div>
                </Card>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                        placeholder="Tìm theo mã đơn, sản phẩm, nhà cung cấp..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        options={statusFilterOptions}
                        placeholder={false}
                    />
                    <Button variant="outline" onClick={() => fetchOrders(1)}>
                        Làm mới danh sách
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
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                size="xl"
                title={editingOrderId ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Input
                            label="Phương thức thanh toán"
                            name="payment_method"
                            value={formData.payment_method}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Chuyển khoản"
                            error={formErrors.payment_method?.[0]}
                        />
                        <Input
                            label="Ngày đặt hàng"
                            type="date"
                            name="order_date"
                            value={formData.order_date}
                            onChange={handleInputChange}
                            error={formErrors.order_date?.[0]}
                            required
                        />
                        <Input
                            label="Ngày giao dự kiến"
                            type="date"
                            name="expected_delivery_date"
                            value={formData.expected_delivery_date}
                            onChange={handleInputChange}
                            error={formErrors.expected_delivery_date?.[0]}
                        />
                        <Select
                            label="Trạng thái"
                            value={formData.status}
                            onChange={(event) => handleInputChange({
                                target: { name: 'status', value: event.target.value },
                            })}
                            options={statusSelectOptions}
                            error={formErrors.status?.[0]}
                            required
                        />
                    </div>

                    <Textarea
                        label="Ghi chú đơn hàng"
                        name="note"
                        value={formData.note}
                        onChange={handleInputChange}
                        rows={3}
                        error={formErrors.note?.[0]}
                    />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-text">Chi tiết sản phẩm</h3>
                            <Button type="button" variant="outline" onClick={handleAddItem}>
                                Thêm sản phẩm
                            </Button>
                        </div>

                        {formData.items.map((item, index) => (
                            <Card key={`item-${index}`} className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Tên sản phẩm"
                                        value={item.item_name}
                                        onChange={(event) => handleItemChange(index, 'item_name', event.target.value)}
                                        error={formErrors[`items.${index}.item_name`]?.[0]}
                                        required
                                    />
                                    <Input
                                        label="Đơn vị"
                                        value={item.unit}
                                        onChange={(event) => handleItemChange(index, 'unit', event.target.value)}
                                        error={formErrors[`items.${index}.unit`]?.[0]}
                                        placeholder="cái / bộ / hộp"
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
                                    <Input
                                        label="Đơn giá"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(event) => handleItemChange(index, 'unit_price', event.target.value)}
                                        error={formErrors[`items.${index}.unit_price`]?.[0]}
                                        required
                                    />
                                </div>

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-start">
                                    <Textarea
                                        label="Ghi chú sản phẩm"
                                        value={item.note}
                                        onChange={(event) => handleItemChange(index, 'note', event.target.value)}
                                        rows={2}
                                        error={formErrors[`items.${index}.note`]?.[0]}
                                    />
                                    <div className="space-y-3">
                                        <div className="rounded-lg bg-surface-muted px-4 py-3 text-right">
                                            <div className="text-xs text-text-muted">Thành tiền</div>
                                            <div className="text-lg font-semibold text-text">
                                                {formatCurrency(Number(item.qty || 0) * Number(item.unit_price || 0))}
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleRemoveItem(index)}
                                            disabled={formData.items.length === 1}
                                        >
                                            Gỡ sản phẩm
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-border pt-4">
                        <div className="text-text">
                            <span className="text-sm text-text-muted">Tổng cộng</span>
                            <div className="text-2xl font-semibold">
                                {formatCurrency(formData.items.reduce((total, item) => (
                                    total + (Number(item.qty || 0) * Number(item.unit_price || 0))
                                ), 0))}
                            </div>
                        </div>
                        <div className="flex gap-3">
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
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PurchaseOrdersPage;
