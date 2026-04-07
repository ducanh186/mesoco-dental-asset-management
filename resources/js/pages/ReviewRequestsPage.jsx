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
    useToast 
} from '../components/ui';
import { useI18n } from '../i18n';
import { requestsApi, usersApi, handleApiError } from '../services/api';

// ============================================================================
// Constants
// ============================================================================
const REQUEST_TYPES = {
    JUSTIFICATION: 'JUSTIFICATION',
    ASSET_LOAN: 'ASSET_LOAN',
    CONSUMABLE_REQUEST: 'CONSUMABLE_REQUEST',
};

const REQUEST_STATUSES = {
    SUBMITTED: 'SUBMITTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED',
};

const SEVERITIES = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
};

// ============================================================================
// ReviewRequestsPage - Manager review queue
// ============================================================================
const ReviewRequestsPage = ({ user }) => {
    const { t, locale } = useI18n();
    const toast = useToast();
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';
    
    // List state
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState(REQUEST_STATUSES.SUBMITTED); // Default to pending
    
    // Modal states
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState('');
    const [reviewNote, setReviewNote] = useState('');
    const [assignedTechnicianId, setAssignedTechnicianId] = useState('');
    const [technicians, setTechnicians] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // ========================================
    // Data Fetching
    // ========================================
    const fetchRequests = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                per_page: 15,
            };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.type = typeFilter;
            if (searchQuery) params.search = searchQuery;

            const data = await requestsApi.reviewQueue(params);
            setRequests(data.requests || []);
            setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, typeFilter, searchQuery, toast]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const fetchTechnicians = useCallback(async () => {
        try {
            const data = await usersApi.list({ role: 'technician', per_page: 100 });
            setTechnicians(data.users || []);
        } catch (error) {
            console.error('Failed to fetch technicians:', error);
        }
    }, []);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    // ========================================
    // Actions
    // ========================================
    const handleViewDetail = async (request) => {
        try {
            const data = await requestsApi.get(request.id);
            setSelectedRequest(data.request);
            setIsDetailOpen(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const closeReviewModal = () => {
        setIsReviewOpen(false);
        setReviewAction('');
        setReviewNote('');
        setAssignedTechnicianId('');
    };

    const openReviewModal = (request, action) => {
        setSelectedRequest(request);
        setReviewAction(action);
        setReviewNote('');
        setAssignedTechnicianId(request?.assigned_to?.id ? String(request.assigned_to.id) : '');
        setIsReviewOpen(true);
    };

    const handleReview = async () => {
        if (!selectedRequest || !reviewAction) return;

        if (
            reviewAction === 'APPROVE' &&
            selectedRequest.requires_technician_assignment &&
            !assignedTechnicianId
        ) {
            toast.error('Vui lòng chỉ định kỹ thuật viên trước khi duyệt phiếu sự cố');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                note: reviewNote || null,
            };

            if (assignedTechnicianId) {
                payload.assigned_to_user_id = Number(assignedTechnicianId);
            }

            await requestsApi.review(selectedRequest.id, reviewAction, payload);
            toast.success(reviewAction === 'APPROVE' ? t('review.approveSuccess') : t('review.rejectSuccess'));
            closeReviewModal();
            setIsDetailOpen(false);
            setSelectedRequest(null);
            fetchRequests(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSubmitting(false);
        }
    };

    // ========================================
    // UI Helpers
    // ========================================
    const getTypeLabel = (type) => {
        switch (type) {
            case REQUEST_TYPES.JUSTIFICATION: return t('requests.types.JUSTIFICATION');
            case REQUEST_TYPES.ASSET_LOAN: return t('requests.types.ASSET_LOAN');
            case REQUEST_TYPES.CONSUMABLE_REQUEST: return t('requests.types.CONSUMABLE_REQUEST');
            default: return type;
        }
    };

    const getTypeVariant = (type) => {
        switch (type) {
            case REQUEST_TYPES.JUSTIFICATION: return 'warning';
            case REQUEST_TYPES.ASSET_LOAN: return 'primary';
            case REQUEST_TYPES.CONSUMABLE_REQUEST: return 'info';
            default: return 'default';
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case REQUEST_STATUSES.SUBMITTED: return 'warning';
            case REQUEST_STATUSES.APPROVED: return 'success';
            case REQUEST_STATUSES.REJECTED: return 'danger';
            case REQUEST_STATUSES.CANCELLED: return 'default';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case REQUEST_STATUSES.SUBMITTED: return t('requests.statuses.SUBMITTED');
            case REQUEST_STATUSES.APPROVED: return t('requests.statuses.APPROVED');
            case REQUEST_STATUSES.REJECTED: return t('requests.statuses.REJECTED');
            case REQUEST_STATUSES.CANCELLED: return t('requests.statuses.CANCELLED');
            default: return status;
        }
    };

    const getSeverityVariant = (severity) => {
        switch (severity) {
            case SEVERITIES.critical: return 'danger';
            case SEVERITIES.high: return 'warning';
            case SEVERITIES.medium: return 'info';
            case SEVERITIES.low: return 'default';
            default: return 'default';
        }
    };

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case SEVERITIES.critical: return t('requests.severities.critical');
            case SEVERITIES.high: return t('requests.severities.high');
            case SEVERITIES.medium: return t('requests.severities.medium');
            case SEVERITIES.low: return t('requests.severities.low');
            default: return severity;
        }
    };

    const getEventLabel = (eventType) => {
        switch (eventType) {
            case 'CREATED': return 'Tạo phiếu';
            case 'SUBMITTED': return 'Gửi phiếu';
            case 'APPROVED': return 'Duyệt phiếu';
            case 'DISPATCHED': return 'Chuyển kỹ thuật xử lý';
            case 'REJECTED': return 'Từ chối phiếu';
            case 'CANCELLED': return 'Hủy phiếu';
            default: return eventType;
        }
    };

    // ========================================
    // Table Columns
    // ========================================
    const columns = [
        { 
            key: 'code', 
            label: t('requests.requestId'),
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded">{value}</code>
        },
        { 
            key: 'type', 
            label: t('requests.requestType'),
            render: (value) => <Badge variant={getTypeVariant(value)} size="sm">{getTypeLabel(value)}</Badge>
        },
        { 
            key: 'title', 
            label: 'Tiêu đề',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    {row.severity && (
                        <Badge variant={getSeverityVariant(row.severity)} size="sm" outline className="mt-1">
                            {getSeverityLabel(row.severity)}
                        </Badge>
                    )}
                </div>
            )
        },
        {
            key: 'requester',
            label: t('requests.requester'),
            render: (value) => value?.full_name || '-'
        },
        { 
            key: 'created_at', 
            label: t('requests.requestDate'),
            render: (value) => value ? new Date(value).toLocaleDateString(dateLocale) : '-'
        },
        { 
            key: 'status', 
            label: t('requests.requestStatus'),
            render: (value) => <Badge variant={getStatusVariant(value)}>{getStatusLabel(value)}</Badge>
        },
        {
            key: 'actions',
            label: t('common.actions'),
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetail(row)}>
                        {t('common.view')}
                    </Button>
                    {row.can_be_reviewed && (
                        <>
                            <Button 
                                size="sm" 
                                variant="success" 
                                onClick={() => openReviewModal(row, 'APPROVE')}
                            >
                                {t('review.approve')}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => openReviewModal(row, 'REJECT')}
                            >
                                {t('review.reject')}
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    // Type & Status options for filters
    const typeOptions = [
        { value: '', label: t('requests.types.all') },
        { value: REQUEST_TYPES.JUSTIFICATION, label: t('requests.types.JUSTIFICATION') },
        { value: REQUEST_TYPES.ASSET_LOAN, label: t('requests.types.ASSET_LOAN') },
        { value: REQUEST_TYPES.CONSUMABLE_REQUEST, label: t('requests.types.CONSUMABLE_REQUEST') },
    ];

    const statusOptions = [
        { value: REQUEST_STATUSES.SUBMITTED, label: t('requests.statuses.SUBMITTED') },
        { value: '', label: t('requests.statuses.all') },
        { value: REQUEST_STATUSES.APPROVED, label: t('requests.statuses.APPROVED') },
        { value: REQUEST_STATUSES.REJECTED, label: t('requests.statuses.REJECTED') },
        { value: REQUEST_STATUSES.CANCELLED, label: t('requests.statuses.CANCELLED') },
    ];

    // ========================================
    // Render
    // ========================================
    return (
        <div className="review-requests-page space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-warning">{pagination.total}</p>
                            <p className="text-sm text-text-muted">
                                {statusFilter === REQUEST_STATUSES.SUBMITTED 
                                    ? 'Phiếu chờ duyệt' 
                                    : 'Tổng số phiếu phù hợp'}
                            </p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-danger">
                                {requests.filter(r => r.severity === 'critical' || r.severity === 'high').length}
                            </p>
                            <p className="text-sm text-text-muted">Ưu tiên cao</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Review Queue */}
            <Card>
                <CardHeader 
                    title={t('review.title')}
                    subtitle="Duyệt hoặc từ chối các phiếu đang chờ xử lý"
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Tìm theo mã phiếu hoặc tiêu đề..."
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
                        <div className="w-full sm:w-48">
                            <Select
                                options={typeOptions}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-56">
                            <Select
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="loading-spinner mx-auto"></div>
                            <p className="mt-2 text-text-muted">{t('common.loading')}</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={requests}
                            emptyMessage={t('requests.noRequests')}
                            emptyState={
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">Không còn phiếu tồn đọng</h3>
                                    <p className="mt-1 text-sm text-text-muted">Hiện không có phiếu nào cần duyệt</p>
                                </div>
                            }
                        />
                    )}

                    {/* Pagination */}
                    {requests.length > 0 && (
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            totalItems={pagination.total}
                            pageSize={15}
                            onPageChange={(page) => fetchRequests(page)}
                        />
                    )}
                </CardBody>
            </Card>

            {/* Request Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedRequest(null); }}
                title={selectedRequest?.code || 'Chi tiết phiếu'}
                size="lg"
                footer={selectedRequest?.can_be_reviewed && (
                    <div className="flex gap-3">
                        <Button 
                            variant="danger" 
                            onClick={() => openReviewModal(selectedRequest, 'REJECT')}
                        >
                            {t('review.reject')}
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={() => openReviewModal(selectedRequest, 'APPROVE')}
                        >
                            {t('review.approve')}
                        </Button>
                    </div>
                )}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        {/* Status & Type */}
                        <div className="flex gap-3 flex-wrap">
                            <Badge variant={getTypeVariant(selectedRequest.type)} size="lg">
                                {getTypeLabel(selectedRequest.type)}
                            </Badge>
                            <Badge variant={getStatusVariant(selectedRequest.status)} size="lg">
                                {getStatusLabel(selectedRequest.status)}
                            </Badge>
                            {selectedRequest.severity && (
                                <Badge variant={getSeverityVariant(selectedRequest.severity)} outline>
                                    {getSeverityLabel(selectedRequest.severity)}
                                </Badge>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h3 className="text-lg font-semibold text-text">{selectedRequest.title}</h3>
                            {selectedRequest.description && (
                                <p className="mt-1 text-text-muted">{selectedRequest.description}</p>
                            )}
                        </div>

                        {/* Meta Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-text-muted">Người yêu cầu:</span>
                                <span className="ml-2 text-text font-medium">
                                    {selectedRequest.requester?.full_name} 
                                    {selectedRequest.requester?.employee_code && (
                                        <span className="text-text-muted ml-1">
                                            ({selectedRequest.requester.employee_code})
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div>
                                <span className="text-text-muted">Ngày tạo:</span>
                                <span className="ml-2 text-text">
                                    {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString(dateLocale) : '-'}
                                </span>
                            </div>
                            {selectedRequest.incident_at && (
                                <div>
                                    <span className="text-text-muted">Thời điểm xảy ra:</span>
                                    <span className="ml-2 text-text">
                                        {new Date(selectedRequest.incident_at).toLocaleString(dateLocale)}
                                    </span>
                                </div>
                            )}
                            {selectedRequest.suspected_cause && (
                                <div>
                                    <span className="text-text-muted">Nguyên nhân nghi ngờ:</span>
                                    <span className="ml-2 text-text">{selectedRequest.suspected_cause}</span>
                                </div>
                            )}
                            {selectedRequest.assigned_to && (
                                <div>
                                    <span className="text-text-muted">Kỹ thuật viên phụ trách:</span>
                                    <span className="ml-2 text-text">
                                        {selectedRequest.assigned_to.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Review Note (if already reviewed) */}
                        {selectedRequest.review_note && (
                            <div className="p-3 bg-surface-muted rounded-md">
                                <span className="text-sm font-medium text-text">{t('requests.reviewNote')}:</span>
                                <p className="text-sm text-text-muted mt-1">{selectedRequest.review_note}</p>
                            </div>
                        )}

                        {/* Items */}
                        {selectedRequest.items && selectedRequest.items.length > 0 && (
                            <div>
                                <h4 className="font-medium text-text mb-2">{t('requests.items')}</h4>
                                <div className="space-y-2">
                                    {selectedRequest.items.map((item, index) => (
                                        <div key={index} className="p-3 bg-surface-muted rounded-md flex justify-between">
                                            <div>
                                                {item.item_kind === 'ASSET' ? (
                                                    <span className="text-text">
                                                        {item.asset?.asset_code} - {item.asset?.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-text">
                                                        {item.name} {item.sku && `(${item.sku})`}
                                                    </span>
                                                )}
                                                {item.note && (
                                                    <p className="text-sm text-text-muted">{item.note}</p>
                                                )}
                                                {item.from_shift && item.to_shift && (
                                                    <p className="text-sm text-text-muted">
                                                        Ca: {item.from_shift.name} → {item.to_shift.name}
                                                    </p>
                                                )}
                                            </div>
                                            {item.qty && (
                                                <span className="text-text-muted">
                                                    {item.qty} {item.unit}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Events Timeline */}
                        {selectedRequest.events && selectedRequest.events.length > 0 && (
                            <div>
                                <h4 className="font-medium text-text mb-2">{t('requests.activity')}</h4>
                                <div className="space-y-2">
                                    {selectedRequest.events.map((event, index) => (
                                        <div key={index} className="flex gap-3 text-sm">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-border"></div>
                                            <div>
                                                <span className="text-text">{getEventLabel(event.event_type)}</span>
                                                {event.actor && (
                                                    <span className="text-text-muted"> bởi {event.actor.name}</span>
                                                )}
                                                <span className="text-text-muted block text-xs">
                                                    {event.created_at ? new Date(event.created_at).toLocaleString(dateLocale) : ''}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Review Action Modal */}
            <Modal
                isOpen={isReviewOpen}
                onClose={closeReviewModal}
                title={`${reviewAction === 'APPROVE' ? t('review.approve') : t('review.reject')} phiếu`}
                size="sm"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={closeReviewModal}>
                            {t('common.cancel')}
                        </Button>
                        <Button 
                            variant={reviewAction === 'APPROVE' ? 'success' : 'danger'}
                            onClick={handleReview}
                            disabled={submitting}
                        >
                            {submitting ? 'Đang xử lý...' : (reviewAction === 'APPROVE' ? t('review.approve') : t('review.reject'))}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-text-muted">
                        {reviewAction === 'APPROVE' 
                            ? 'Bạn có chắc muốn duyệt phiếu này không?' 
                            : 'Bạn có chắc muốn từ chối phiếu này không?'}
                    </p>
                    
                    {selectedRequest && (
                        <div className="p-3 bg-surface-muted rounded-md">
                            <p className="font-medium text-text">{selectedRequest.code}</p>
                            <p className="text-sm text-text-muted">{selectedRequest.title}</p>
                        </div>
                    )}

                    {reviewAction === 'APPROVE' && selectedRequest?.requires_technician_assignment && (
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                Kỹ thuật viên phụ trách <span className="text-danger">*</span>
                            </label>
                            <Select
                                options={[
                                    { value: '', label: 'Chọn kỹ thuật viên...' },
                                    ...technicians.map((technician) => ({
                                        value: String(technician.id),
                                        label: technician.name,
                                    })),
                                ]}
                                value={assignedTechnicianId}
                                onChange={(e) => setAssignedTechnicianId(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Ghi chú {reviewAction === 'REJECT' && <span className="text-danger">*</span>}
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text"
                            rows={3}
                            placeholder={reviewAction === 'APPROVE' 
                                ? 'Có thể thêm ghi chú cho người yêu cầu...'
                                : 'Vui lòng nhập lý do từ chối...'}
                            value={reviewNote}
                            onChange={(e) => setReviewNote(e.target.value)}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ReviewRequestsPage;
