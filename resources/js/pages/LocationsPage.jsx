/**
 * Locations Management Page (Phase 6)
 * 
 * Manager/technician can manage physical locations for asset tracking.
 * Features: List, Create, Edit, Delete/Deactivate locations.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { locationsApi, handleApiError } from '../services/api';
import { 
    Card, 
    Table, 
    Modal, 
    Button, 
    Input, 
    TablePagination,
    useToast 
} from '../components/ui';

const LocationsPage = () => {
    const toast = useToast();
    
    // List state
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 25,
        total: 0,
        last_page: 1,
    });
    
    // Filter state
    const [search, setSearch] = useState('');
    const [areaFilter, setAreaFilter] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_active: true,
    });
    const [formErrors, setFormErrors] = useState({});

    // Fetch locations
    const fetchLocations = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: pagination.per_page,
                search: search || undefined,
                area: areaFilter || undefined,
                active_only: showInactive ? undefined : '1',
                sort_by: 'name',
                sort_dir: 'asc',
            };
            
            const response = await locationsApi.list(params);
            setLocations(response.data || []);
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
    }, [search, areaFilter, showInactive, pagination.per_page, toast]);

    useEffect(() => {
        fetchLocations(1);
    }, [search, areaFilter, showInactive]);

    const areaOptions = [
        { value: '', label: 'Tất cả khu vực' },
        { value: 'Kho tầng 1', label: 'Kho tầng 1' },
        { value: 'Kho tầng 2', label: 'Kho tầng 2' },
        { value: 'Kho tầng 3', label: 'Kho tầng 3' },
        { value: 'Khu HR', label: 'Khu HR' },
        { value: 'Khu kế toán', label: 'Khu kế toán' },
        { value: 'Khu lễ tân', label: 'Khu lễ tân' },
        { value: 'Khu dự án', label: 'Khu Dự án' },
    ];

    // Open modal for create
    const handleCreate = () => {
        setEditingLocation(null);
        setFormData({
            name: '',
            description: '',
            is_active: true,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Open modal for edit
    const handleEdit = (location) => {
        setEditingLocation(location);
        setFormData({
            name: location.name,
            description: location.description || '',
            is_active: location.is_active,
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        try {
            if (editingLocation) {
                await locationsApi.update(editingLocation.id, formData);
                toast.success('Cập nhật vị trí thành công');
            } else {
                await locationsApi.create(formData);
                toast.success('Tạo vị trí thành công');
            }
            setIsModalOpen(false);
            fetchLocations(pagination.current_page);
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

    // Delete location
    const handleDelete = async (location) => {
        if (!window.confirm(`Bạn có chắc muốn xóa vị trí "${location.name}" không?`)) {
            return;
        }

        try {
            const response = await locationsApi.delete(location.id);
            toast.success(
                response.data?.is_active === false
                    ? 'Đã ngưng sử dụng vị trí vì vẫn còn thiết bị đang gắn với vị trí này'
                    : 'Xóa vị trí thành công'
            );
            fetchLocations(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    // Table columns
    const columns = [
        {
            key: 'id',
            label: 'Mã vị trí',
            render: (value) => <span className="font-mono text-sm text-text-muted">{value}</span>,
        },
        {
            key: 'name',
            label: 'Tên vị trí',
            render: (value, row) => (
                <div>
                    <span className="font-medium text-text">{value}</span>
                    {!row.is_active && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                            Ngưng sử dụng
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'description',
            label: 'Mô tả',
            render: (value) => (
                <span className="text-text-muted">{value || '—'}</span>
            ),
        },
        {
            key: 'actions',
            label: '',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(row)}
                    >
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-text">Vị trí</h1>
                    <p className="text-text-muted mt-1">Quản lý mã vị trí, tên vị trí và mô tả nơi đặt thiết bị</p>
                </div>
                <Button onClick={handleCreate}>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Thêm vị trí
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex gap-4 items-center flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Tìm theo mã hoặc tên vị trí..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        value={areaFilter}
                        onChange={(e) => setAreaFilter(e.target.value)}
                        className="min-w-[180px] rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {areaOptions.map((option) => (
                            <option key={option.value || 'all'} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showInactive}
                            onChange={(e) => setShowInactive(e.target.checked)}
                            className="rounded border-border text-primary focus:ring-primary"
                        />
                        Hiển thị cả vị trí ngưng sử dụng
                    </label>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    data={locations}
                    loading={loading}
                    emptyMessage="Không có vị trí nào"
                />
                
                {pagination.last_page > 1 && (
                    <div className="mt-4 flex justify-center">
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            onPageChange={(page) => fetchLocations(page)}
                        />
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingLocation ? 'Chỉnh sửa vị trí' : 'Thêm vị trí'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Tên vị trí <span className="text-red-500">*</span>
                        </label>
                        <Input
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="VD: Kho thiết bị tầng 1"
                            error={formErrors.name?.[0]}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Mô tả thêm nếu cần"
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text"
                        />
                        {formErrors.description && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.description[0]}</p>
                        )}
                    </div>

                    {editingLocation && (
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className="rounded border-border text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-text">Đang hoạt động</span>
                            </label>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-border">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Đang lưu...' : (editingLocation ? 'Cập nhật' : 'Tạo mới')}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default LocationsPage;
