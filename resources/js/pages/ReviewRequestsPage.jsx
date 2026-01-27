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
import { requestsApi, handleApiError } from '../services/api';

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
// ReviewRequestsPage - Review queue for Admin/HR
// ============================================================================
const ReviewRequestsPage = ({ user }) => {
    const { t } = useI18n();
    const toast = useToast();
    
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

    const openReviewModal = (request, action) => {
        setSelectedRequest(request);
        setReviewAction(action);
        setReviewNote('');
        setIsReviewOpen(true);
    };

    const handleReview = async () => {
        if (!selectedRequest || !reviewAction) return;

        setSubmitting(true);
        try {
            await requestsApi.review(selectedRequest.id, reviewAction, reviewNote || null);
            toast.success(`Request ${reviewAction === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
            setIsReviewOpen(false);
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
            case REQUEST_TYPES.JUSTIFICATION: return 'Justification';
            case REQUEST_TYPES.ASSET_LOAN: return 'Asset Loan';
            case REQUEST_TYPES.CONSUMABLE_REQUEST: return 'Consumable';
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

    const getSeverityVariant = (severity) => {
        switch (severity) {
            case SEVERITIES.critical: return 'danger';
            case SEVERITIES.high: return 'warning';
            case SEVERITIES.medium: return 'info';
            case SEVERITIES.low: return 'default';
            default: return 'default';
        }
    };

    // ========================================
    // Table Columns
    // ========================================
    const columns = [
        { 
            key: 'code', 
            label: 'Request ID',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded">{value}</code>
        },
        { 
            key: 'type', 
            label: 'Type',
            render: (value) => <Badge variant={getTypeVariant(value)} size="sm">{getTypeLabel(value)}</Badge>
        },
        { 
            key: 'title', 
            label: 'Title',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    {row.severity && (
                        <Badge variant={getSeverityVariant(row.severity)} size="sm" outline className="mt-1">
                            {row.severity}
                        </Badge>
                    )}
                </div>
            )
        },
        {
            key: 'requester',
            label: 'Requester',
            render: (value) => value?.full_name || '-'
        },
        { 
            key: 'created_at', 
            label: 'Date',
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (value) => <Badge variant={getStatusVariant(value)}>{value}</Badge>
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetail(row)}>
                        View
                    </Button>
                    {row.can_be_reviewed && (
                        <>
                            <Button 
                                size="sm" 
                                variant="success" 
                                onClick={() => openReviewModal(row, 'APPROVE')}
                            >
                                Approve
                            </Button>
                            <Button 
                                size="sm" 
                                variant="danger" 
                                onClick={() => openReviewModal(row, 'REJECT')}
                            >
                                Reject
                            </Button>
                        </>
                    )}
                </div>
            )
        }
    ];

    // Type & Status options for filters
    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: REQUEST_TYPES.JUSTIFICATION, label: 'Justification' },
        { value: REQUEST_TYPES.ASSET_LOAN, label: 'Asset Loan' },
        { value: REQUEST_TYPES.CONSUMABLE_REQUEST, label: 'Consumable' },
    ];

    const statusOptions = [
        { value: REQUEST_STATUSES.SUBMITTED, label: 'Pending (SUBMITTED)' },
        { value: '', label: 'All Statuses' },
        { value: REQUEST_STATUSES.APPROVED, label: 'Approved' },
        { value: REQUEST_STATUSES.REJECTED, label: 'Rejected' },
        { value: REQUEST_STATUSES.CANCELLED, label: 'Cancelled' },
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
                                    ? 'Pending Review' 
                                    : 'Total Matching Requests'}
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
                            <p className="text-sm text-text-muted">High Priority</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Review Queue */}
            <Card>
                <CardHeader 
                    title="Review Requests"
                    subtitle="Approve or reject pending requests"
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by code or title..."
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
                            <p className="mt-2 text-text-muted">Loading requests...</p>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            data={requests}
                            emptyMessage="No requests found"
                            emptyState={
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">All caught up!</h3>
                                    <p className="mt-1 text-sm text-text-muted">No pending requests to review</p>
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
                title={selectedRequest?.code || 'Request Detail'}
                size="lg"
                footer={selectedRequest?.can_be_reviewed && (
                    <div className="flex gap-3">
                        <Button 
                            variant="danger" 
                            onClick={() => openReviewModal(selectedRequest, 'REJECT')}
                        >
                            Reject
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={() => openReviewModal(selectedRequest, 'APPROVE')}
                        >
                            Approve
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
                                {selectedRequest.status}
                            </Badge>
                            {selectedRequest.severity && (
                                <Badge variant={getSeverityVariant(selectedRequest.severity)} outline>
                                    {selectedRequest.severity} severity
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
                                <span className="text-text-muted">Requested by:</span>
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
                                <span className="text-text-muted">Created:</span>
                                <span className="ml-2 text-text">
                                    {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString() : '-'}
                                </span>
                            </div>
                            {selectedRequest.incident_at && (
                                <div>
                                    <span className="text-text-muted">Incident at:</span>
                                    <span className="ml-2 text-text">
                                        {new Date(selectedRequest.incident_at).toLocaleString()}
                                    </span>
                                </div>
                            )}
                            {selectedRequest.suspected_cause && (
                                <div>
                                    <span className="text-text-muted">Suspected cause:</span>
                                    <span className="ml-2 text-text">{selectedRequest.suspected_cause}</span>
                                </div>
                            )}
                        </div>

                        {/* Review Note (if already reviewed) */}
                        {selectedRequest.review_note && (
                            <div className="p-3 bg-surface-muted rounded-md">
                                <span className="text-sm font-medium text-text">Review Note:</span>
                                <p className="text-sm text-text-muted mt-1">{selectedRequest.review_note}</p>
                            </div>
                        )}

                        {/* Items */}
                        {selectedRequest.items && selectedRequest.items.length > 0 && (
                            <div>
                                <h4 className="font-medium text-text mb-2">Items</h4>
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
                                                        Shift: {item.from_shift.name} → {item.to_shift.name}
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
                                <h4 className="font-medium text-text mb-2">Activity</h4>
                                <div className="space-y-2">
                                    {selectedRequest.events.map((event, index) => (
                                        <div key={index} className="flex gap-3 text-sm">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-border"></div>
                                            <div>
                                                <span className="text-text">{event.event_type}</span>
                                                {event.actor && (
                                                    <span className="text-text-muted"> by {event.actor.name}</span>
                                                )}
                                                <span className="text-text-muted block text-xs">
                                                    {event.created_at ? new Date(event.created_at).toLocaleString() : ''}
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
                onClose={() => { setIsReviewOpen(false); setReviewNote(''); }}
                title={`${reviewAction === 'APPROVE' ? 'Approve' : 'Reject'} Request`}
                size="sm"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => { setIsReviewOpen(false); setReviewNote(''); }}>
                            Cancel
                        </Button>
                        <Button 
                            variant={reviewAction === 'APPROVE' ? 'success' : 'danger'}
                            onClick={handleReview}
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : (reviewAction === 'APPROVE' ? 'Approve' : 'Reject')}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-text-muted">
                        {reviewAction === 'APPROVE' 
                            ? 'Are you sure you want to approve this request?' 
                            : 'Are you sure you want to reject this request?'}
                    </p>
                    
                    {selectedRequest && (
                        <div className="p-3 bg-surface-muted rounded-md">
                            <p className="font-medium text-text">{selectedRequest.code}</p>
                            <p className="text-sm text-text-muted">{selectedRequest.title}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            Note {reviewAction === 'REJECT' && <span className="text-danger">*</span>}
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text"
                            rows={3}
                            placeholder={reviewAction === 'APPROVE' 
                                ? 'Optional: Add a note for the requester...'
                                : 'Please provide a reason for rejection...'}
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
