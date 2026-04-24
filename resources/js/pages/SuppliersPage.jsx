import React, { useState, useEffect, useCallback } from 'react';
import { suppliersApi, handleApiError } from '../services/api';
import {
    Card,
    Table,
    Modal,
    Button,
    Input,
    TablePagination,
    useToast
} from '../components/ui';

const EMPTY_FORM = {
    code: '',
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    note: '',
};

const SuppliersPage = () => {
    const toast = useToast();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 25,
        total: 0,
        last_page: 1,
    });
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});

    const fetchSuppliers = useCallback(async (page = 1) => {
        setLoading(true);

        try {
            const response = await suppliersApi.list({
                page,
                per_page: pagination.per_page,
                search: search || undefined,
                sort_by: 'name',
                sort_dir: 'asc',
            });

            setSuppliers(response.data || []);
            setPagination({
                current_page: response.current_page,
                per_page: response.per_page,
                total: response.total,
                last_page: response.last_page,
            });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [pagination.per_page, search, toast]);

    useEffect(() => {
        fetchSuppliers(1);
    }, [fetchSuppliers]);

    const handleCreate = () => {
        setEditingSupplier(null);
        setFormData(EMPTY_FORM);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            code: supplier.code || '',
            name: supplier.name || '',
            contact_person: supplier.contact_person || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            note: supplier.note || '',
        });
        setFormErrors({});
        setIsModalOpen(true);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        try {
            if (editingSupplier) {
                await suppliersApi.update(editingSupplier.id, formData);
                toast.success('Cập nhật nhà cung cấp thành công');
            } else {
                await suppliersApi.create(formData);
                toast.success('Tạo nhà cung cấp thành công');
            }

            setIsModalOpen(false);
            fetchSuppliers(editingSupplier ? pagination.current_page : 1);
        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response.data.errors || {});
            } else {
                handleApiError(error, toast);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (supplier) => {
        if (!window.confirm(`Bạn có chắc muốn xóa nhà cung cấp "${supplier.name}" không?`)) {
            return;
        }

        try {
            await suppliersApi.delete(supplier.id);
            toast.success('Xóa nhà cung cấp thành công');
            fetchSuppliers(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Nhà cung cấp',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted">{row.code || 'Chưa có mã'}</div>
                </div>
            ),
        },
        {
            key: 'contact_person',
            label: 'Liên hệ',
            render: (value, row) => (
                <div>
                    <div className="text-sm text-text">{value || '—'}</div>
                    <div className="text-xs text-text-muted">{row.phone || row.email || '—'}</div>
                </div>
            ),
        },
        {
            key: 'address',
            label: 'Địa chỉ',
            render: (value) => (
                <span className="text-text-muted">{value || '—'}</span>
            ),
        },
        {
            key: 'assets_count',
            label: 'Thiết bị',
            align: 'center',
            render: (value) => <span className="font-medium">{value ?? 0}</span>,
        },
        {
            key: 'repair_logs_count',
            label: 'Lần sửa chữa',
            align: 'center',
            render: (value) => <span className="font-medium">{value ?? 0}</span>,
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
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
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Nhà cung cấp</h1>
                    <p className="text-text-muted mt-1">Quản lý danh mục nhà cung cấp gắn với hồ sơ thiết bị và sửa chữa</p>
                </div>
                <Button onClick={handleCreate}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm nhà cung cấp
                </Button>
            </div>

            <Card>
                <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Tìm theo tên, mã, liên hệ..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>
                </div>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    data={suppliers}
                    loading={loading}
                    emptyMessage="Không có nhà cung cấp nào"
                />

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex justify-center">
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            onPageChange={(page) => fetchSuppliers(page)}
                        />
                    </div>
                )}
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Mã nhà cung cấp"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder="VD: NCC-001"
                            error={formErrors.code?.[0]}
                        />
                        <Input
                            label="Tên nhà cung cấp *"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="VD: Công ty Thiết bị CNTT ABC"
                            error={formErrors.name?.[0]}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Người liên hệ"
                            name="contact_person"
                            value={formData.contact_person}
                            onChange={handleInputChange}
                            placeholder="Tên người phụ trách"
                            error={formErrors.contact_person?.[0]}
                        />
                        <Input
                            label="Số điện thoại"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Số điện thoại"
                            error={formErrors.phone?.[0]}
                        />
                    </div>

                    <Input
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                        error={formErrors.email?.[0]}
                    />

                    <Input
                        label="Địa chỉ"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ nhà cung cấp"
                        error={formErrors.address?.[0]}
                    />

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Ghi chú
                        </label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleInputChange}
                            placeholder="Thông tin thêm nếu cần"
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text"
                        />
                        {formErrors.note && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.note[0]}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : (editingSupplier ? 'Cập nhật' : 'Tạo mới')}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SuppliersPage;
