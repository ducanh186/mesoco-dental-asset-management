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
import { requestsApi, assetsApi, departmentAssetsApi, handleApiError } from '../services/api';
import { hasOperationalAccess } from '../utils/roles';

// ============================================================================
// Constants
// ============================================================================
const REQUEST_TYPES = {
    JUSTIFICATION: 'JUSTIFICATION',
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
// RequestsPage - Equipment requests (Staff view)
// ============================================================================
const RequestsPage = ({ user }) => {
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
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modal states
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    // Form state
    const [formType, setFormType] = useState(REQUEST_TYPES.JUSTIFICATION);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: SEVERITIES.medium,
        incident_at: '',
        suspected_cause: '',
        items: [],
    });
    const [submitting, setSubmitting] = useState(false);
    
    // Asset options for incident reports.
    const [assetOptions, setAssetOptions] = useState([]);

    // ========================================
    // Data Fetching
    // ========================================
    const fetchRequests = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                mine: 1, // Staff always sees their own requests
                page,
                per_page: 10,
            };
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const data = await requestsApi.list(params);
            setRequests(data.requests || []);
            setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [typeFilter, statusFilter, searchQuery, toast]);

    const fetchAssets = async () => {
        // Operational users can pick from the full active IT asset catalog.
        try {
            const data = await assetsApi.list({ per_page: 100 });
            setAssetOptions((data.assets || []).map(a => ({
                value: a.id,
                label: `${a.asset_code} - ${a.name}`,
            })));
        } catch (error) {
            console.error('Failed to fetch assets', error);
        }
    };

    const fetchAssetsForType = async (requestType) => {
        try {
            let response;
            const canSelectAnyAsset = hasOperationalAccess(user);
            
            if (requestType === REQUEST_TYPES.JUSTIFICATION) {
                if (canSelectAnyAsset) {
                    response = await assetsApi.list({ per_page: 200, status: 'active' });
                    setAssetOptions((response.assets || []).map(a => ({
                        value: a.id,
                        label: a.asset_code ? `${a.asset_code} - ${a.name}` : `${a.name} (ID: ${a.id})`,
                    })));
                } else {
                    response = await departmentAssetsApi.dropdown();
                    setAssetOptions(response.data || []);
                }
            } else {
                response = await assetsApi.list({ per_page: 100 });
                setAssetOptions((response.assets || []).map(a => ({
                    value: a.id,
                    label: a.asset_code ? `${a.asset_code} - ${a.name}` : `${a.name} (ID: ${a.id})`,
                })));
            }
        } catch (error) {
            console.error('Failed to fetch assets for type:', requestType, error);
            handleApiError(error, toast);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    useEffect(() => {
        fetchAssetsForType(formType);
    }, []);

    // Re-fetch assets when form type changes
    useEffect(() => {
        fetchAssetsForType(formType);
    }, [formType]);

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

    const handleCancel = async (request) => {
        if (!confirm('Bạn có chắc muốn hủy phiếu này không?')) return;
        
        try {
            await requestsApi.cancel(request.id);
            toast.success(t('requests.cancelSuccess'));
            fetchRequests(pagination.current_page);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleSubmitRequest = async () => {
        setSubmitting(true);
        try {
            const payload = {
                type: formType,
                title: formData.title,
                description: formData.description,
                items: formData.items,
            };

            if (formType === REQUEST_TYPES.JUSTIFICATION) {
                payload.severity = formData.severity;
                if (formData.incident_at) payload.incident_at = formData.incident_at;
                if (formData.suspected_cause) payload.suspected_cause = formData.suspected_cause;
            }

            await requestsApi.create(payload);
            toast.success(t('requests.submitSuccess'));
            setIsNewRequestOpen(false);
            resetForm();
            fetchRequests(1);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormType(REQUEST_TYPES.JUSTIFICATION);
        setFormData({
            title: '',
            description: '',
            severity: SEVERITIES.medium,
            incident_at: '',
            suspected_cause: '',
            items: [],
        });
    };

    const addItem = () => {
        const newItem = formType === REQUEST_TYPES.CONSUMABLE_REQUEST
            ? { item_kind: 'CONSUMABLE', name: '', qty: 1, unit: '' }
            : { item_kind: 'ASSET', asset_id: '' };
        
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem],
        }));
    };

    const updateItem = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            ),
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index),
        }));
    };

    // ========================================
    // UI Helpers
    // ========================================
    const getTypeLabel = (type) => {
        switch (type) {
            case REQUEST_TYPES.JUSTIFICATION: return t('requests.types.JUSTIFICATION');
            case REQUEST_TYPES.CONSUMABLE_REQUEST: return t('requests.types.CONSUMABLE_REQUEST');
            default: return type;
        }
    };

    const getTypeVariant = (type) => {
        switch (type) {
            case REQUEST_TYPES.JUSTIFICATION: return 'warning';
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

    const getSeverityLabel = (severity) => {
        switch (severity) {
            case SEVERITIES.low: return t('requests.severities.low');
            case SEVERITIES.medium: return t('requests.severities.medium');
            case SEVERITIES.high: return t('requests.severities.high');
            case SEVERITIES.critical: return t('requests.severities.critical');
            default: return severity;
        }
    };

    const getEventLabel = (eventType) => {
        switch (eventType) {
            case 'CREATED': return 'Tạo phiếu';
            case 'SUBMITTED': return 'Gửi phiếu';
            case 'APPROVED': return 'Duyệt phiếu';
            case 'REJECTED': return 'Từ chối phiếu';
            case 'CANCELLED': return 'Hủy phiếu';
            default: return eventType;
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
                    {row.can_be_cancelled && (
                        <Button size="sm" variant="outline" onClick={() => handleCancel(row)}>
                            {t('common.cancel')}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Type & Status options for filters
    const typeOptions = [
        { value: '', label: t('requests.types.all') },
        { value: REQUEST_TYPES.JUSTIFICATION, label: t('requests.types.JUSTIFICATION') },
        { value: REQUEST_TYPES.CONSUMABLE_REQUEST, label: t('requests.types.CONSUMABLE_REQUEST') },
    ];

    const statusOptions = [
        { value: '', label: t('requests.statuses.all') },
        { value: REQUEST_STATUSES.SUBMITTED, label: t('requests.statuses.SUBMITTED') },
        { value: REQUEST_STATUSES.APPROVED, label: t('requests.statuses.APPROVED') },
        { value: REQUEST_STATUSES.REJECTED, label: t('requests.statuses.REJECTED') },
        { value: REQUEST_STATUSES.CANCELLED, label: t('requests.statuses.CANCELLED') },
    ];

    // Stats
    const stats = {
        total: pagination.total,
        submitted: requests.filter(r => r.status === REQUEST_STATUSES.SUBMITTED).length,
        approved: requests.filter(r => r.status === REQUEST_STATUSES.APPROVED).length,
    };

    // ========================================
    // Render
    // ========================================
    return (
        <div className="requests-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-text">{stats.total}</p>
                            <p className="text-sm text-text-muted">{t('requests.totalRequests')}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-warning">{stats.submitted}</p>
                            <p className="text-sm text-text-muted">{t('requests.pendingReview')}</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-success">{stats.approved}</p>
                            <p className="text-sm text-text-muted">{t('requests.approved')}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Requests Table */}
            <Card>
                <CardHeader 
                    title={t('requests.myRequests')}
                    subtitle={t('requests.myRequestsSubtitle')}
                    action={
                        <Button size="sm" onClick={() => setIsNewRequestOpen(true)}>
                            {t('requests.newRequest')}
                        </Button>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder={t('requests.searchPlaceholder')}
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
                        <div className="w-full sm:w-48">
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
                                    <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                        <rect x="9" y="3" width="6" height="4" rx="1" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">Chưa có phiếu nào</h3>
                                    <p className="mt-1 text-sm text-text-muted">Tạo phiếu đầu tiên để bắt đầu</p>
                                    <div className="mt-4">
                                        <Button size="sm" onClick={() => setIsNewRequestOpen(true)}>{t('requests.newRequest')}</Button>
                                    </div>
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
                            pageSize={10}
                            onPageChange={(page) => fetchRequests(page)}
                        />
                    )}
                </CardBody>
            </Card>

            {/* New Request Modal */}
            <Modal
                isOpen={isNewRequestOpen}
                onClose={() => { setIsNewRequestOpen(false); resetForm(); }}
                title={t('requests.createNewRequest')}
                size="lg"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => { setIsNewRequestOpen(false); resetForm(); }}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSubmitRequest} disabled={submitting || !formData.title || formData.items.length === 0}>
                            {submitting ? t('requests.submitting') : t('requests.submitRequest')}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* Request Type Tabs */}
                    <div className="flex gap-2 border-b border-border pb-3">
                        {Object.entries(REQUEST_TYPES).map(([key, value]) => (
                            <Button
                                key={key}
                                variant={formType === value ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => {
                                    setFormType(value);
                                    setFormData(prev => ({ ...prev, items: [] }));
                                }}
                            >
                                {getTypeLabel(value)}
                            </Button>
                        ))}
                    </div>

                    <Input
                        label={t('requests.title')}
                        placeholder={t('requests.titlePlaceholder')}
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">{t('requests.description')}</label>
                        <textarea
                            className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text"
                            rows={3}
                            placeholder={t('requests.descriptionPlaceholder')}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Justification-specific fields */}
                    {formType === REQUEST_TYPES.JUSTIFICATION && (
                        <div className="grid grid-cols-2 gap-4">
                            <Select
                                label={t('requests.severity')}
                                options={[
                                    { value: SEVERITIES.low, label: t('requests.severities.low') },
                                    { value: SEVERITIES.medium, label: t('requests.severities.medium') },
                                    { value: SEVERITIES.high, label: t('requests.severities.high') },
                                    { value: SEVERITIES.critical, label: t('requests.severities.critical') },
                                ]}
                                value={formData.severity}
                                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                            />
                            <Select
                                label={t('requests.suspectedCause')}
                                options={[
                                    { value: '', label: t('requests.suspectedCauses.unknown') },
                                    { value: 'wear', label: t('requests.suspectedCauses.wear') },
                                    { value: 'operation', label: t('requests.suspectedCauses.operation') },
                                ]}
                                value={formData.suspected_cause}
                                onChange={(e) => setFormData(prev => ({ ...prev, suspected_cause: e.target.value }))}
                            />
                        </div>
                    )}

                    {/* Items Section */}
                    <div className="border-t border-border pt-4">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-text">
                                {formType === REQUEST_TYPES.CONSUMABLE_REQUEST ? t('requests.consumableItems') : t('requests.assets')}
                            </h4>
                            <Button size="sm" variant="outline" onClick={addItem}>
                                {t('requests.addItem')}
                            </Button>
                        </div>

                        {formData.items.length === 0 && (
                            <p className="text-sm text-text-muted text-center py-4">
                                Chưa có mục nào. Nhấn "Thêm dòng" để bắt đầu.
                            </p>
                        )}

                        {formData.items.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start mb-3 p-3 bg-surface-muted rounded-md">
                                {formType === REQUEST_TYPES.CONSUMABLE_REQUEST ? (
                                    <>
                                        <div className="flex-1">
                                            <Input
                                                placeholder={t('requests.itemName')}
                                                value={item.name}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-20">
                                            <Input
                                                type="number"
                                                placeholder={t('requests.quantity')}
                                                value={item.qty}
                                                onChange={(e) => updateItem(index, 'qty', e.target.value)}
                                            />
                                        </div>
                                        <div className="w-24">
                                            <Input
                                                placeholder={t('requests.unit')}
                                                value={item.unit}
                                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <Select
                                                placeholder={t('requests.selectAsset')}
                                                options={assetOptions}
                                                value={item.asset_id}
                                                onChange={(e) => updateItem(index, 'asset_id', e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-danger"
                                    onClick={() => removeItem(index)}
                                >
                                    ✕
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>

            {/* Request Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => { setIsDetailOpen(false); setSelectedRequest(null); }}
                title={selectedRequest?.code || t('requests.requestDetail')}
                size="lg"
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        {/* Status & Type */}
                        <div className="flex gap-3">
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
                                <span className="text-text-muted">{t('requests.requestedBy')}:</span>
                                <span className="ml-2 text-text">{selectedRequest.requester?.full_name}</span>
                            </div>
                            <div>
                                <span className="text-text-muted">{t('common.createdAt')}:</span>
                                <span className="ml-2 text-text">
                                    {selectedRequest.created_at ? new Date(selectedRequest.created_at).toLocaleString(dateLocale) : '-'}
                                </span>
                            </div>
                            {selectedRequest.reviewer && (
                                <>
                                    <div>
                                        <span className="text-text-muted">{t('requests.reviewedBy')}:</span>
                                        <span className="ml-2 text-text">{selectedRequest.reviewer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-text-muted">{t('requests.reviewedAt')}:</span>
                                        <span className="ml-2 text-text">
                                            {selectedRequest.reviewed_at ? new Date(selectedRequest.reviewed_at).toLocaleString(dateLocale) : '-'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Review Note */}
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
        </div>
    );
};

export default RequestsPage;
