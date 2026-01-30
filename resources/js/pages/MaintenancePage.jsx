import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input, 
    Select,
    Badge,
    Table,
    TablePagination,
    Modal,
    ConfirmModal,
    useToast 
} from '../components/ui';
import { useI18n } from '../i18n';
import { maintenanceApi, assetsApi, handleApiError } from '../services/api';

/**
 * MaintenancePage - Maintenance schedules and service records (Phase 7)
 * Real API integration replacing mock data
 */
const MaintenancePage = ({ user }) => {
    const { t } = useI18n();
    const toast = useToast();
    
    // State
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    
    // Form state for create
    const [formData, setFormData] = useState({
        asset_id: '',
        type: 'inspection',
        planned_at: '',
        priority: 'normal',
        note: '',
        estimated_duration_minutes: '',
        assigned_to: '',
    });
    const [assets, setAssets] = useState([]);
    const [formLoading, setFormLoading] = useState(false);

    // Permission check
    const canManage = ['admin', 'hr', 'technician'].includes(user?.role);

    // Fetch data
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: 15,
            };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.type = typeFilter;
            
            const response = await maintenanceApi.list(params);
            setEvents(response.data || []);
            setPagination(response.meta || { current_page: 1, last_page: 1, total: 0, per_page: 15 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, typeFilter, toast]);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await maintenanceApi.summary();
            setSummary(response);
        } catch (error) {
            // Summary is optional, don't block on error
            console.error('Failed to fetch summary:', error);
        }
    }, []);

    const fetchAssets = useCallback(async () => {
        try {
            const response = await assetsApi.list({ status: 'active', per_page: 100 });
            setAssets(response.assets || response.data || []);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
        fetchSummary();
    }, [fetchEvents, fetchSummary]);

    useEffect(() => {
        if (showCreateModal && assets.length === 0) {
            fetchAssets();
        }
    }, [showCreateModal, assets.length, fetchAssets]);

    // Filter client-side by search query
    const filteredEvents = events.filter(event => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            event.code?.toLowerCase().includes(q) ||
            event.asset?.name?.toLowerCase().includes(q) ||
            event.asset?.asset_code?.toLowerCase().includes(q) ||
            event.type?.toLowerCase().includes(q)
        );
    });

    // Handlers
    const handleCreate = async () => {
        if (!formData.asset_id || !formData.planned_at) {
            toast.error('Vui lòng chọn tài sản và ngày dự kiến');
            return;
        }
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                estimated_duration_minutes: formData.estimated_duration_minutes 
                    ? parseInt(formData.estimated_duration_minutes) 
                    : null,
            };
            await maintenanceApi.create(payload);
            toast.success('Tạo lịch bảo trì thành công');
            setShowCreateModal(false);
            setFormData({
                asset_id: '',
                type: 'inspection',
                planned_at: '',
                priority: 'normal',
                note: '',
                estimated_duration_minutes: '',
                assigned_to: '',
            });
            fetchEvents();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    };

    const handleStart = async (event) => {
        try {
            await maintenanceApi.start(event.id);
            toast.success(`Đã bắt đầu bảo trì ${event.code}`);
            fetchEvents();
            fetchSummary();
            setShowDetailModal(false);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleComplete = async (event) => {
        try {
            await maintenanceApi.complete(event.id, { result_note: 'Hoàn thành' });
            toast.success(`Đã hoàn thành bảo trì ${event.code}`);
            fetchEvents();
            fetchSummary();
            setShowDetailModal(false);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleCancel = async (event) => {
        try {
            await maintenanceApi.cancel(event.id, 'Hủy bởi người dùng');
            toast.success(`Đã hủy bảo trì ${event.code}`);
            fetchEvents();
            fetchSummary();
            setShowDetailModal(false);
            setConfirmAction(null);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDelete = async (event) => {
        try {
            await maintenanceApi.delete(event.id);
            toast.success(`Đã xóa lịch bảo trì ${event.code}`);
            fetchEvents();
            fetchSummary();
            setConfirmAction(null);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const openDetail = (event) => {
        setSelectedEvent(event);
        setShowDetailModal(true);
    };

    // Status options
    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'scheduled', label: 'Đã lên lịch' },
        { value: 'in_progress', label: 'Đang thực hiện' },
        { value: 'completed', label: 'Hoàn thành' },
        { value: 'canceled', label: 'Đã hủy' },
    ];

    const typeOptions = [
        { value: '', label: 'Tất cả loại' },
        { value: 'inspection', label: 'Kiểm tra' },
        { value: 'sterilization', label: 'Khử trùng' },
        { value: 'calibration', label: 'Hiệu chuẩn' },
        { value: 'repair', label: 'Sửa chữa' },
        { value: 'cleaning', label: 'Vệ sinh' },
        { value: 'filter_change', label: 'Thay bộ lọc' },
        { value: 'replacement', label: 'Thay thế linh kiện' },
        { value: 'other', label: 'Khác' },
    ];

    const priorityOptions = [
        { value: 'low', label: 'Thấp' },
        { value: 'normal', label: 'Bình thường' },
        { value: 'high', label: 'Cao' },
        { value: 'urgent', label: 'Khẩn cấp' },
    ];

    const getTypeLabel = (type) => {
        const found = typeOptions.find(o => o.value === type);
        return found?.label || type;
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in_progress': return 'primary';
            case 'scheduled': return 'warning';
            case 'canceled': return 'default';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        const found = statusOptions.find(o => o.value === status);
        return found?.label || status;
    };

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'urgent': return 'danger';
            case 'high': return 'warning';
            case 'normal': return 'default';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Table columns
    const columns = [
        { 
            key: 'code', 
            label: 'Mã',
            width: '120px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded">{value}</code>
        },
        { 
            key: 'asset', 
            label: 'Thiết bị',
            render: (_, row) => (
                <div>
                    <p className="font-medium text-text">{row.asset?.name || '-'}</p>
                    <p className="text-sm text-text-muted">{row.asset?.asset_code || ''}</p>
                </div>
            )
        },
        { 
            key: 'type', 
            label: 'Loại',
            render: (value) => <Badge variant="info" size="sm">{getTypeLabel(value)}</Badge>
        },
        { 
            key: 'planned_at', 
            label: 'Ngày dự kiến',
            render: (value) => formatDate(value)
        },
        { 
            key: 'priority', 
            label: 'Ưu tiên',
            render: (value) => {
                const labels = { urgent: 'Khẩn', high: 'Cao', normal: 'TB', low: 'Thấp' };
                return <Badge variant={getPriorityVariant(value)} size="sm" outline>{labels[value] || value}</Badge>;
            }
        },
        { 
            key: 'status', 
            label: 'Trạng thái',
            render: (value) => <Badge variant={getStatusVariant(value)} size="sm" dot>{getStatusLabel(value)}</Badge>
        },
        {
            key: 'actions',
            label: 'Thao tác',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => openDetail(row)}>
                        Xem
                    </Button>
                    {canManage && row.status === 'scheduled' && (
                        <Button size="sm" variant="outline" onClick={() => handleStart(row)}>
                            Bắt đầu
                        </Button>
                    )}
                    {canManage && row.status === 'in_progress' && (
                        <Button size="sm" variant="primary" onClick={() => handleComplete(row)}>
                            Hoàn thành
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Stats from summary
    const stats = summary?.stats || { scheduled: 0, in_progress: 0, completed: 0, overdue: 0 };

    return (
        <div className="maintenance-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.scheduled}</p>
                                <p className="text-sm text-text-muted">Đã lên lịch</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v2M12 21v2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.in_progress}</p>
                                <p className="text-sm text-text-muted">Đang thực hiện</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-success/10 text-success flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.completed}</p>
                                <p className="text-sm text-text-muted">Hoàn thành</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-error/10 text-error flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.overdue}</p>
                                <p className="text-sm text-text-muted">Quá hạn</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Maintenance Table */}
            <Card>
                <CardHeader 
                    title="Lịch bảo trì"
                    subtitle="Quản lý lịch bảo trì và sửa chữa thiết bị"
                    action={
                        canManage && (
                            <Button size="sm" onClick={() => setShowCreateModal(true)}>
                                + Tạo lịch mới
                            </Button>
                        )
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm theo mã, thiết bị..."
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
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="w-full sm:w-40">
                            <Select
                                options={typeOptions}
                                value={typeFilter}
                                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-12 text-text-muted">Đang tải...</div>
                    ) : (
                        <Table
                            columns={columns}
                            data={filteredEvents}
                            emptyMessage="Không có lịch bảo trì nào"
                            emptyState={
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">Không có lịch bảo trì</h3>
                                    <p className="mt-1 text-sm text-text-muted">Tạo lịch bảo trì mới để theo dõi công việc</p>
                                </div>
                            }
                        />
                    )}

                    {/* Pagination */}
                    {pagination.total > 0 && (
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            totalItems={pagination.total}
                            pageSize={pagination.per_page}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardBody>
            </Card>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tạo lịch bảo trì mới"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Thiết bị *</label>
                        <Select
                            options={[
                                { value: '', label: 'Chọn thiết bị...' },
                                ...assets.map(a => ({ value: a.id, label: `${a.asset_code} - ${a.name}` }))
                            ]}
                            value={formData.asset_id}
                            onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Loại bảo trì *</label>
                        <Select
                            options={typeOptions.filter(o => o.value)}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Ngày dự kiến *</label>
                        <Input
                            type="datetime-local"
                            value={formData.planned_at}
                            onChange={(e) => setFormData({ ...formData, planned_at: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Độ ưu tiên</label>
                        <Select
                            options={priorityOptions}
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Thời lượng dự kiến (phút)</label>
                        <Input
                            type="number"
                            placeholder="60"
                            value={formData.estimated_duration_minutes}
                            onChange={(e) => setFormData({ ...formData, estimated_duration_minutes: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Phân công cho</label>
                        <Input
                            placeholder="Tên kỹ thuật viên hoặc nhà cung cấp"
                            value={formData.assigned_to}
                            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Ghi chú</label>
                        <Input
                            placeholder="Mô tả công việc cần thực hiện"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button onClick={handleCreate} disabled={formLoading}>
                            {formLoading ? 'Đang tạo...' : 'Tạo lịch'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Chi tiết bảo trì ${selectedEvent?.code || ''}`}
                size="md"
            >
                {selectedEvent && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-muted">Thiết bị</p>
                                <p className="font-medium">{selectedEvent.asset?.name}</p>
                                <p className="text-sm text-text-muted">{selectedEvent.asset?.asset_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Loại</p>
                                <p className="font-medium">{getTypeLabel(selectedEvent.type)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Trạng thái</p>
                                <Badge variant={getStatusVariant(selectedEvent.status)} dot>
                                    {getStatusLabel(selectedEvent.status)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Ưu tiên</p>
                                <Badge variant={getPriorityVariant(selectedEvent.priority)} outline>
                                    {priorityOptions.find(o => o.value === selectedEvent.priority)?.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Ngày dự kiến</p>
                                <p className="font-medium">{formatDate(selectedEvent.planned_at)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Phân công</p>
                                <p className="font-medium">{selectedEvent.assigned_to || '-'}</p>
                            </div>
                            {selectedEvent.started_at && (
                                <div>
                                    <p className="text-sm text-text-muted">Bắt đầu lúc</p>
                                    <p className="font-medium">{formatDate(selectedEvent.started_at)}</p>
                                </div>
                            )}
                            {selectedEvent.completed_at && (
                                <div>
                                    <p className="text-sm text-text-muted">Hoàn thành lúc</p>
                                    <p className="font-medium">{formatDate(selectedEvent.completed_at)}</p>
                                </div>
                            )}
                        </div>
                        {selectedEvent.note && (
                            <div>
                                <p className="text-sm text-text-muted">Ghi chú</p>
                                <p>{selectedEvent.note}</p>
                            </div>
                        )}
                        {selectedEvent.result_note && (
                            <div>
                                <p className="text-sm text-text-muted">Kết quả</p>
                                <p>{selectedEvent.result_note}</p>
                            </div>
                        )}
                        
                        {canManage && !['completed', 'canceled'].includes(selectedEvent.status) && (
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setConfirmAction({ type: 'cancel', event: selectedEvent })}
                                >
                                    Hủy bảo trì
                                </Button>
                                {selectedEvent.status === 'scheduled' && (
                                    <>
                                        <Button 
                                            variant="ghost" 
                                            className="text-error"
                                            onClick={() => setConfirmAction({ type: 'delete', event: selectedEvent })}
                                        >
                                            Xóa
                                        </Button>
                                        <Button variant="outline" onClick={() => handleStart(selectedEvent)}>
                                            Bắt đầu
                                        </Button>
                                    </>
                                )}
                                {selectedEvent.status === 'in_progress' && (
                                    <Button onClick={() => handleComplete(selectedEvent)}>
                                        Hoàn thành
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => {
                    if (confirmAction?.type === 'cancel') handleCancel(confirmAction.event);
                    if (confirmAction?.type === 'delete') handleDelete(confirmAction.event);
                }}
                title={confirmAction?.type === 'delete' ? 'Xác nhận xóa' : 'Xác nhận hủy'}
                message={confirmAction?.type === 'delete' 
                    ? `Bạn có chắc muốn xóa lịch bảo trì ${confirmAction?.event?.code}?`
                    : `Bạn có chắc muốn hủy bảo trì ${confirmAction?.event?.code}?`
                }
                confirmText={confirmAction?.type === 'delete' ? 'Xóa' : 'Hủy bảo trì'}
                variant="danger"
            />
        </div>
    );
};

export default MaintenancePage;
