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
import { feedbackApi, departmentAssetsApi, handleApiError } from '../services/api';

/**
 * FeedbackPage - Phase 8
 * User feedback, issues, and suggestions
 */
const FeedbackPage = ({ user }) => {
    const toast = useToast();
    
    // State
    const [loading, setLoading] = useState(true);
    const [feedbacks, setFeedbacks] = useState([]);
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
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        asset_id: '',
        content: '',
        rating: '',
        type: 'other',
    });
    const [assets, setAssets] = useState([]);
    const [formLoading, setFormLoading] = useState(false);
    
    // Response form for managers
    const [responseText, setResponseText] = useState('');

    // Permission check
    const canManage = ['manager', 'technician'].includes(user?.role);

    // Fetch data
    const fetchFeedbacks = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                per_page: 15,
            };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.type = typeFilter;
            if (searchQuery) params.search = searchQuery;
            
            const response = await feedbackApi.list(params);
            setFeedbacks(response.data || []);
            setPagination(response.meta || { current_page: 1, last_page: 1, total: 0, per_page: 15 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, typeFilter, searchQuery, toast]);

    const fetchSummary = useCallback(async () => {
        try {
            const response = await feedbackApi.summary();
            setSummary(response);
        } catch (error) {
            console.error('Failed to fetch summary:', error);
        }
    }, []);

    const fetchAssets = useCallback(async () => {
        try {
            const response = await departmentAssetsApi.dropdown();
            setAssets(response.data || []);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        }
    }, []);

    useEffect(() => {
        fetchFeedbacks();
        fetchSummary();
    }, [fetchFeedbacks, fetchSummary]);

    useEffect(() => {
        if (showCreateModal && assets.length === 0) {
            fetchAssets();
        }
    }, [showCreateModal, assets.length, fetchAssets]);

    // Handlers
    const handleCreate = async () => {
        if (!formData.content || formData.content.length < 10) {
            toast.error('Nội dung phản hồi phải có ít nhất 10 ký tự');
            return;
        }
        setFormLoading(true);
        try {
            const payload = {
                ...formData,
                asset_id: formData.asset_id || null,
                rating: formData.rating ? parseInt(formData.rating) : null,
            };
            await feedbackApi.create(payload);
            toast.success('Gửi phản hồi thành công');
            setShowCreateModal(false);
            setFormData({ asset_id: '', content: '', rating: '', type: 'other' });
            fetchFeedbacks();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    };

    const handleStatusChange = async (feedback, newStatus) => {
        try {
            await feedbackApi.updateStatus(feedback.id, newStatus, responseText || null);
            toast.success('Cập nhật trạng thái thành công');
            setResponseText('');
            fetchFeedbacks();
            fetchSummary();
            setShowDetailModal(false);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDelete = async (feedback) => {
        try {
            await feedbackApi.delete(feedback.id);
            toast.success('Xóa phản hồi thành công');
            fetchFeedbacks();
            fetchSummary();
            setConfirmAction(null);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const openDetail = (feedback) => {
        setSelectedFeedback(feedback);
        setResponseText(feedback.response || '');
        setShowDetailModal(true);
    };

    // Options
    const statusOptions = [
        { value: '', label: 'Tất cả trạng thái' },
        { value: 'new', label: 'Mới' },
        { value: 'in_progress', label: 'Đang xử lý' },
        { value: 'resolved', label: 'Đã giải quyết' },
    ];

    const typeOptions = [
        { value: '', label: 'Tất cả loại' },
        { value: 'issue', label: 'Sự cố' },
        { value: 'suggestion', label: 'Đề xuất' },
        { value: 'praise', label: 'Khen ngợi' },
        { value: 'other', label: 'Khác' },
    ];

    const getTypeLabel = (type) => {
        const labels = { issue: 'Sự cố', suggestion: 'Đề xuất', praise: 'Khen ngợi', other: 'Khác' };
        return labels[type] || 'Khác';
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'resolved': return 'success';
            case 'in_progress': return 'primary';
            case 'new': return 'warning';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        const labels = { new: 'Mới', in_progress: 'Đang xử lý', resolved: 'Đã giải quyết' };
        return labels[status] || 'Không xác định';
    };

    const getTypeVariant = (type) => {
        switch (type) {
            case 'issue': return 'danger';
            case 'suggestion': return 'info';
            case 'praise': return 'success';
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

    const renderRating = (rating) => {
        if (!rating) return '-';
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
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
            key: 'type', 
            label: 'Loại',
            render: (value) => <Badge variant={getTypeVariant(value)} size="sm">{getTypeLabel(value)}</Badge>
        },
        { 
            key: 'content', 
            label: 'Nội dung',
            render: (value) => (
                <p className="text-sm text-text truncate max-w-xs" title={value}>
                    {value?.substring(0, 50)}{value?.length > 50 ? '...' : ''}
                </p>
            )
        },
        { 
            key: 'user', 
            label: 'Người gửi',
            render: (_, row) => (
                <p className="text-sm">{row.user?.name || '-'}</p>
            )
        },
        { 
            key: 'status', 
            label: 'Trạng thái',
            render: (value) => <Badge variant={getStatusVariant(value)} size="sm" dot>{getStatusLabel(value)}</Badge>
        },
        { 
            key: 'created_at', 
            label: 'Ngày gửi',
            render: (value) => formatDate(value)
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
                </div>
            )
        }
    ];

    // Stats
    const stats = summary || { total: 0, new: 0, in_progress: 0, resolved: 0 };

    return (
        <div className="feedback-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.total}</p>
                                <p className="text-sm text-text-muted">Tổng phản hồi</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.new}</p>
                                <p className="text-sm text-text-muted">Mới</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-info/10 text-info flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v2M12 21v2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.in_progress}</p>
                                <p className="text-sm text-text-muted">Đang xử lý</p>
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
                                <p className="text-2xl font-bold text-text">{stats.resolved}</p>
                                <p className="text-sm text-text-muted">Đã giải quyết</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Feedback Table */}
            <Card>
                <CardHeader 
                    title="Phản hồi"
                    subtitle="Gửi và theo dõi phản hồi, đề xuất, báo cáo sự cố"
                    action={
                        <Button size="sm" onClick={() => setShowCreateModal(true)}>
                            + Gửi phản hồi
                        </Button>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm kiếm theo mã, nội dung..."
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
                            data={feedbacks}
                            emptyMessage="Không có phản hồi nào"
                            emptyState={
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">Không có phản hồi</h3>
                                    <p className="mt-1 text-sm text-text-muted">Gửi phản hồi đầu tiên của bạn</p>
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
                title="Gửi phản hồi mới"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Loại phản hồi</label>
                        <Select
                            options={typeOptions.filter(o => o.value)}
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Thiết bị liên quan (không bắt buộc)</label>
                        <Select
                            options={[
                                { value: '', label: 'Không chọn' },
                                ...assets.map(a => ({ value: a.value, label: a.label }))
                            ]}
                            value={formData.asset_id}
                            onChange={(e) => setFormData({ ...formData, asset_id: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Nội dung *</label>
                        <textarea
                            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                            rows={5}
                            placeholder="Mô tả chi tiết phản hồi của bạn (tối thiểu 10 ký tự)"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Đánh giá (không bắt buộc)</label>
                        <Select
                            options={[
                                { value: '', label: 'Không đánh giá' },
                                { value: '1', label: '★ - Rất tệ' },
                                { value: '2', label: '★★ - Tệ' },
                                { value: '3', label: '★★★ - Bình thường' },
                                { value: '4', label: '★★★★ - Tốt' },
                                { value: '5', label: '★★★★★ - Rất tốt' },
                            ]}
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</Button>
                        <Button onClick={handleCreate} disabled={formLoading}>
                            {formLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={`Chi tiết phản hồi ${selectedFeedback?.code || ''}`}
                size="md"
            >
                {selectedFeedback && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-muted">Người gửi</p>
                                <p className="font-medium">{selectedFeedback.user?.name}</p>
                                <p className="text-sm text-text-muted">{selectedFeedback.user?.employee_code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Loại</p>
                                <Badge variant={getTypeVariant(selectedFeedback.type)}>
                                    {getTypeLabel(selectedFeedback.type)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Trạng thái</p>
                                <Badge variant={getStatusVariant(selectedFeedback.status)} dot>
                                    {getStatusLabel(selectedFeedback.status)}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Đánh giá</p>
                                <p className="text-yellow-500">{renderRating(selectedFeedback.rating)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Ngày gửi</p>
                                <p className="font-medium">{formatDate(selectedFeedback.created_at)}</p>
                            </div>
                            {selectedFeedback.asset && (
                                <div>
                                    <p className="text-sm text-text-muted">Thiết bị</p>
                                    <p className="font-medium">{selectedFeedback.asset.name}</p>
                                    <p className="text-sm text-text-muted">{selectedFeedback.asset.asset_code}</p>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <p className="text-sm text-text-muted mb-1">Nội dung</p>
                            <p className="bg-surface-muted p-3 rounded-lg whitespace-pre-wrap">{selectedFeedback.content}</p>
                        </div>

                        {selectedFeedback.response && (
                            <div>
                                <p className="text-sm text-text-muted mb-1">Phản hồi từ quản lý</p>
                                <p className="bg-primary/5 p-3 rounded-lg whitespace-pre-wrap border-l-4 border-primary">
                                    {selectedFeedback.response}
                                </p>
                            </div>
                        )}

                        {selectedFeedback.resolved_at && (
                            <div>
                                <p className="text-sm text-text-muted">Giải quyết bởi</p>
                                <p>{selectedFeedback.resolver?.name} - {formatDate(selectedFeedback.resolved_at)}</p>
                            </div>
                        )}
                        
                        {canManage && selectedFeedback.status !== 'resolved' && (
                            <div className="border-t pt-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Phản hồi</label>
                                    <textarea
                                        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        rows={3}
                                        placeholder="Nhập phản hồi cho người dùng..."
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    {selectedFeedback.status === 'new' && (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleStatusChange(selectedFeedback, 'in_progress')}
                                        >
                                            Bắt đầu xử lý
                                        </Button>
                                    )}
                                    <Button onClick={() => handleStatusChange(selectedFeedback, 'resolved')}>
                                        Đánh dấu đã giải quyết
                                    </Button>
                                </div>
                            </div>
                        )}

                        {user?.role === 'admin' && (
                            <div className="flex justify-end pt-4 border-t">
                                <Button 
                                    variant="ghost" 
                                    className="text-error"
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setConfirmAction({ type: 'delete', feedback: selectedFeedback });
                                    }}
                                >
                                    Xóa phản hồi
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => handleDelete(confirmAction?.feedback)}
                title="Xác nhận xóa"
                message={`Bạn có chắc muốn xóa phản hồi ${confirmAction?.feedback?.code}?`}
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
};

export default FeedbackPage;
