import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    ConfirmModal,
    Input,
    Modal,
    Select,
    Table,
    TablePagination,
    Badge,
    useToast,
} from '../components/ui';
import { assetsApi, handleApiError, maintenanceApi, usersApi } from '../services/api';
import { hasOperationalAccess } from '../utils/roles';

const emptyDetailLine = () => ({
    asset_id: '',
    qty: '1',
});

const MaintenancePage = ({ user }) => {
    const toast = useToast();
    const canManage = hasOperationalAccess(user);

    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [assets, setAssets] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        type: 'inspection',
        planned_at: '',
        priority: 'normal',
        note: '',
        estimated_duration_minutes: '',
        assigned_to_user_id: '',
        details: [emptyDetailLine()],
    });

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
        { value: 'filter_change', label: 'Thay bộ lọc' },
        { value: 'calibration', label: 'Hiệu chuẩn' },
        { value: 'repair', label: 'Sửa chữa' },
        { value: 'cleaning', label: 'Vệ sinh' },
        { value: 'replacement', label: 'Thay thế linh kiện' },
        { value: 'other', label: 'Khác' },
    ];

    const priorityOptions = [
        { value: 'low', label: 'Thấp' },
        { value: 'normal', label: 'Bình thường' },
        { value: 'high', label: 'Cao' },
        { value: 'urgent', label: 'Khẩn cấp' },
    ];

    useEffect(() => {
        fetchEvents();
    }, [currentPage, statusFilter, typeFilter]);

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        if (!showCreateModal) {
            return;
        }

        if (assets.length === 0) {
            fetchAssets();
        }

        if (technicians.length === 0) {
            fetchTechnicians();
        }
    }, [showCreateModal]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await maintenanceApi.list({
                page: currentPage,
                per_page: 15,
                status: statusFilter || undefined,
                type: typeFilter || undefined,
            });

            setEvents(response.data || []);
            setPagination(response.pagination || { current_page: 1, last_page: 1, total: 0, per_page: 15 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const response = await maintenanceApi.summary();
            setSummary(response);
        } catch (error) {
            console.error('Failed to fetch maintenance summary', error);
        }
    };

    const fetchAssets = async () => {
        try {
            const response = await assetsApi.list({ status: 'active', per_page: 100 });
            setAssets(response.assets || []);
        } catch (error) {
            console.error('Failed to fetch assets', error);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const response = await usersApi.list({ role: 'technician', per_page: 100 });
            setTechnicians(response.users || []);
        } catch (error) {
            console.error('Failed to fetch technicians', error);
        }
    };

    const getTypeLabel = (type) => typeOptions.find((option) => option.value === type)?.label || 'Khác';
    const getPriorityLabel = (priority) => priorityOptions.find((option) => option.value === priority)?.label || 'Không xác định';
    const getStatusLabel = (status) => statusOptions.find((option) => option.value === status)?.label || 'Không xác định';

    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'in_progress':
                return 'primary';
            case 'scheduled':
                return 'warning';
            case 'canceled':
                return 'default';
            default:
                return 'default';
        }
    };

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'urgent':
                return 'danger';
            case 'high':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatDateTime = (value) => {
        if (!value) {
            return '-';
        }

        return new Date(value).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const summarizeAssets = (event) => {
        const detailLines = event.details || [];
        if (detailLines.length === 0) {
            return {
                title: event.asset?.name || '-',
                subtitle: event.asset?.asset_code || '',
                totalLines: 0,
                totalQty: 0,
            };
        }

        const first = detailLines[0];
        const totalQty = detailLines.reduce((sum, detail) => sum + Number(detail.qty || 0), 0);

        if (detailLines.length === 1) {
            return {
                title: first.asset?.name || event.asset?.name || '-',
                subtitle: `${first.asset?.asset_code || event.asset?.asset_code || ''} | SL: ${first.qty || 1}`,
                totalLines: 1,
                totalQty,
            };
        }

        return {
            title: `${first.asset?.name || event.asset?.name || 'Phiếu nhiều thiết bị'} +${detailLines.length - 1} thiết bị`,
            subtitle: `${detailLines.length} dòng chi tiết | Tổng SL: ${totalQty}`,
            totalLines: detailLines.length,
            totalQty,
        };
    };

    const filteredEvents = events.filter((event) => {
        if (!searchQuery.trim()) {
            return true;
        }

        const q = searchQuery.trim().toLowerCase();
        const detailText = (event.details || [])
            .map((detail) => `${detail.asset?.name || ''} ${detail.asset?.asset_code || ''}`)
            .join(' ')
            .toLowerCase();

        return [
            event.code,
            event.type,
            event.asset?.name,
            event.asset?.asset_code,
            detailText,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(q);
    });

    const updateDetailLine = (index, field, value) => {
        setFormData((prev) => ({
            ...prev,
            details: prev.details.map((line, lineIndex) => (
                lineIndex === index ? { ...line, [field]: value } : line
            )),
        }));
    };

    const addDetailLine = () => {
        setFormData((prev) => ({
            ...prev,
            details: [...prev.details, emptyDetailLine()],
        }));
    };

    const removeDetailLine = (index) => {
        setFormData((prev) => ({
            ...prev,
            details: prev.details.length === 1
                ? prev.details
                : prev.details.filter((_, lineIndex) => lineIndex !== index),
        }));
    };

    const resetForm = () => {
        setFormData({
            type: 'inspection',
            planned_at: '',
            priority: 'normal',
            note: '',
            estimated_duration_minutes: '',
            assigned_to_user_id: '',
            details: [emptyDetailLine()],
        });
    };

    const handleCreate = async () => {
        const normalizedDetails = formData.details
            .map((line) => ({
                asset_id: Number(line.asset_id),
                qty: Number(line.qty || 0),
            }))
            .filter((line) => line.asset_id && line.qty > 0);

        if (normalizedDetails.length === 0) {
            toast.error('Phiếu bảo trì phải có ít nhất một thiết bị.');
            return;
        }

        setFormLoading(true);
        try {
            const payload = {
                type: formData.type,
                planned_at: formData.planned_at,
                priority: formData.priority,
                note: formData.note || null,
                estimated_duration_minutes: formData.estimated_duration_minutes
                    ? Number(formData.estimated_duration_minutes)
                    : null,
                assigned_to_user_id: formData.assigned_to_user_id
                    ? Number(formData.assigned_to_user_id)
                    : null,
                details: normalizedDetails,
            };

            await maintenanceApi.create(payload);
            toast.success('Đã tạo phiếu bảo trì.');
            setShowCreateModal(false);
            resetForm();
            fetchEvents();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    };

    const openDetail = async (event) => {
        try {
            const response = await maintenanceApi.get(event.id);
            setSelectedEvent(response.data || event);
            setShowDetailModal(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleStart = async (event) => {
        try {
            await maintenanceApi.start(event.id);
            toast.success(`Đã bắt đầu ${event.code}.`);
            setShowDetailModal(false);
            fetchEvents();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleComplete = async (event) => {
        try {
            await maintenanceApi.complete(event.id, { result_note: 'Hoàn thành theo phiếu bảo trì' });
            toast.success(`Đã hoàn thành ${event.code}.`);
            setShowDetailModal(false);
            fetchEvents();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleCancel = async (event) => {
        try {
            await maintenanceApi.cancel(event.id, 'Hủy bởi người dùng');
            toast.success(`Đã hủy ${event.code}.`);
            setConfirmAction(null);
            setShowDetailModal(false);
            fetchEvents();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDelete = async (event) => {
        try {
            await maintenanceApi.delete(event.id);
            toast.success(`Đã xóa ${event.code}.`);
            setConfirmAction(null);
            setShowDetailModal(false);
            fetchEvents();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const columns = [
        {
            key: 'code',
            label: 'Mã phiếu',
            width: '140px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded">{value}</code>,
        },
        {
            key: 'details',
            label: 'Thiết bị bảo trì',
            render: (_, row) => {
                const summaryInfo = summarizeAssets(row);
                return (
                    <div>
                        <div className="font-medium text-text">{summaryInfo.title}</div>
                        <div className="text-xs text-text-muted">{summaryInfo.subtitle}</div>
                    </div>
                );
            },
        },
        {
            key: 'type',
            label: 'Loại',
            width: '130px',
            render: (value) => <Badge variant="info" size="sm">{getTypeLabel(value)}</Badge>,
        },
        {
            key: 'planned_at',
            label: 'Ngày dự kiến',
            render: (value) => formatDateTime(value),
        },
        {
            key: 'priority',
            label: 'Ưu tiên',
            width: '120px',
            render: (value) => <Badge variant={getPriorityVariant(value)} size="sm" outline>{getPriorityLabel(value)}</Badge>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '140px',
            render: (value) => <Badge variant={getStatusVariant(value)} size="sm" dot>{getStatusLabel(value)}</Badge>,
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
                        <Button size="sm" onClick={() => handleComplete(row)}>
                            Hoàn thành
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const stats = summary?.stats || { scheduled: 0, in_progress: 0, completed: 0, overdue: 0 };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Đã lên lịch', value: stats.scheduled, tone: 'text-warning bg-warning/10' },
                    { label: 'Đang thực hiện', value: stats.in_progress, tone: 'text-primary bg-primary/10' },
                    { label: 'Hoàn thành', value: stats.completed, tone: 'text-success bg-success/10' },
                    { label: 'Quá hạn', value: stats.overdue, tone: 'text-error bg-error/10' },
                ].map((item) => (
                    <Card key={item.label}>
                        <CardBody>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.tone}`}>
                                    <span className="text-lg font-semibold">{item.value}</span>
                                </div>
                                <div>
                                    <div className="text-sm text-text-muted">{item.label}</div>
                                    <div className="text-xl font-bold text-text">{item.value}</div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader
                    title="Phiếu bảo trì"
                    subtitle="Một phiếu có thể chứa nhiều thiết bị và số lượng trong từng dòng chi tiết."
                    action={canManage ? (
                        <Button size="sm" onClick={() => setShowCreateModal(true)}>
                            + Tạo phiếu mới
                        </Button>
                    ) : null}
                />
                <CardBody>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm theo mã phiếu, tên thiết bị, mã thiết bị..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                options={typeOptions}
                                value={typeFilter}
                                onChange={(e) => {
                                    setTypeFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        data={filteredEvents}
                        loading={loading}
                        emptyMessage="Chưa có phiếu bảo trì nào"
                    />

                    {pagination.total > 0 && (
                        <div className="pt-4">
                            <TablePagination
                                currentPage={pagination.current_page}
                                totalPages={pagination.last_page}
                                totalItems={pagination.total}
                                pageSize={pagination.per_page}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tạo phiếu bảo trì"
                size="lg"
            >
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Loại bảo trì *</label>
                            <Select
                                options={typeOptions.filter((option) => option.value)}
                                value={formData.type}
                                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Ngày dự kiến *</label>
                            <Input
                                type="datetime-local"
                                value={formData.planned_at}
                                onChange={(e) => setFormData((prev) => ({ ...prev, planned_at: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Độ ưu tiên</label>
                            <Select
                                options={priorityOptions}
                                value={formData.priority}
                                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Kỹ thuật viên phụ trách</label>
                            <Select
                                options={[
                                    { value: '', label: 'Chưa phân công' },
                                    ...technicians.map((technician) => ({
                                        value: String(technician.id),
                                        label: technician.name,
                                    })),
                                ]}
                                value={formData.assigned_to_user_id}
                                onChange={(e) => setFormData((prev) => ({ ...prev, assigned_to_user_id: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Thời lượng dự kiến (phút)</label>
                        <Input
                            type="number"
                            min="1"
                            value={formData.estimated_duration_minutes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, estimated_duration_minutes: e.target.value }))}
                            placeholder="VD: 90"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Ghi chú chung</label>
                        <Input
                            value={formData.note}
                            onChange={(e) => setFormData((prev) => ({ ...prev, note: e.target.value }))}
                            placeholder="Mô tả chung cho phiếu bảo trì"
                        />
                    </div>

                    <div className="border rounded-xl border-border">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-muted/40">
                            <div>
                                <div className="font-medium text-text">Chi tiết thiết bị</div>
                                <div className="text-xs text-text-muted">Mỗi dòng gồm thiết bị và số lượng cần bảo trì.</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={addDetailLine}>
                                + Thêm dòng
                            </Button>
                        </div>

                        <div className="p-4 space-y-3">
                            {formData.details.map((line, index) => (
                                <div key={`detail-line-${index}`} className="grid grid-cols-1 md:grid-cols-[1fr_120px_90px] gap-3 items-end">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">
                                            Thiết bị {index + 1}
                                        </label>
                                        <Select
                                            options={[
                                                { value: '', label: 'Chọn thiết bị...' },
                                                ...assets.map((asset) => ({
                                                    value: String(asset.id),
                                                    label: `${asset.asset_code} - ${asset.name}`,
                                                })),
                                            ]}
                                            value={line.asset_id}
                                            onChange={(e) => updateDetailLine(index, 'asset_id', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1">Số lượng</label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={line.qty}
                                            onChange={(e) => updateDetailLine(index, 'qty', e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        className="text-error"
                                        onClick={() => removeDetailLine(index)}
                                        disabled={formData.details.length === 1}
                                    >
                                        Xóa dòng
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreate} disabled={formLoading}>
                            {formLoading ? 'Đang tạo...' : 'Tạo phiếu'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Chi tiết ${selectedEvent?.code || ''}`}
                size="lg"
            >
                {selectedEvent && (
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-text-muted">Loại bảo trì</div>
                                <div className="font-medium">{getTypeLabel(selectedEvent.type)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-text-muted">Trạng thái</div>
                                <Badge variant={getStatusVariant(selectedEvent.status)} dot>
                                    {getStatusLabel(selectedEvent.status)}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-text-muted">Ưu tiên</div>
                                <Badge variant={getPriorityVariant(selectedEvent.priority)} outline>
                                    {getPriorityLabel(selectedEvent.priority)}
                                </Badge>
                            </div>
                            <div>
                                <div className="text-sm text-text-muted">Ngày dự kiến</div>
                                <div className="font-medium">{formatDateTime(selectedEvent.planned_at)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-text-muted">Kỹ thuật viên phụ trách</div>
                                <div className="font-medium">{selectedEvent.assigned_user?.name || selectedEvent.assigned_to || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm text-text-muted">Tổng thiết bị</div>
                                <div className="font-medium">
                                    {(selectedEvent.details || []).reduce((sum, detail) => sum + Number(detail.qty || 0), 0)}
                                </div>
                            </div>
                        </div>

                        {selectedEvent.note && (
                            <div>
                                <div className="text-sm text-text-muted">Ghi chú chung</div>
                                <div className="text-text">{selectedEvent.note}</div>
                            </div>
                        )}

                        <div className="border rounded-xl border-border">
                            <div className="px-4 py-3 border-b border-border bg-surface-muted/40">
                                <div className="font-medium text-text">Danh sách chi tiết</div>
                            </div>
                            <div className="divide-y divide-border">
                                {(selectedEvent.details || []).map((detail) => (
                                    <div key={`detail-${detail.id}`} className="px-4 py-3 flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-medium text-text">{detail.asset?.name || 'Thiết bị đã xóa'}</div>
                                            <div className="text-sm text-text-muted">{detail.asset?.asset_code || '-'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-text-muted">Số lượng</div>
                                            <div className="font-semibold text-text">{detail.qty || 1}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedEvent.result_note && (
                            <div>
                                <div className="text-sm text-text-muted">Kết quả</div>
                                <div className="text-text">{selectedEvent.result_note}</div>
                            </div>
                        )}

                        {canManage && !['completed', 'canceled'].includes(selectedEvent.status) && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button
                                    variant="ghost"
                                    onClick={() => setConfirmAction({ type: 'cancel', event: selectedEvent })}
                                >
                                    Hủy phiếu
                                </Button>
                                {selectedEvent.status === 'scheduled' && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="text-error"
                                            onClick={() => setConfirmAction({ type: 'delete', event: selectedEvent })}
                                        >
                                            Xóa phiếu
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

            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => {
                    if (confirmAction?.type === 'cancel') {
                        handleCancel(confirmAction.event);
                    }
                    if (confirmAction?.type === 'delete') {
                        handleDelete(confirmAction.event);
                    }
                }}
                title={confirmAction?.type === 'delete' ? 'Xác nhận xóa phiếu' : 'Xác nhận hủy phiếu'}
                message={confirmAction?.type === 'delete'
                    ? `Bạn có chắc muốn xóa ${confirmAction?.event?.code}?`
                    : `Bạn có chắc muốn hủy ${confirmAction?.event?.code}?`
                }
                confirmText={confirmAction?.type === 'delete' ? 'Xóa phiếu' : 'Hủy phiếu'}
                variant="danger"
            />
        </div>
    );
};

export default MaintenancePage;
