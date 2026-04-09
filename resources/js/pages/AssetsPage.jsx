import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Select,
    Badge,
    StatusBadge,
    Table,
    TablePagination,
    Modal,
    ConfirmModal,
    useToast
} from '../components/ui';
import { assetsApi, employeesApi, suppliersApi, handleApiError } from '../services/api';
import { useI18n } from '../i18n';

/**
 * AssetsPage - Admin/HR Asset Management
 * Features: List, Create, Assign/Unassign, Regenerate QR, Delete
 */
const AssetsPage = ({ user }) => {
    const toast = useToast();
    const { t, locale } = useI18n();
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    // Data State
    const [assets, setAssets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [assignmentFilter, setAssignmentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
    const [confirmRegenerateOpen, setConfirmRegenerateOpen] = useState(false);

    // Selected Asset
    const [selectedAsset, setSelectedAsset] = useState(null);

    // Form State
    const [createForm, setCreateForm] = useState({
        asset_code: '',
        name: '',
        type: 'equipment',
        status: 'active',
        supplier_id: '',
        notes: ''
    });
    const [createErrors, setCreateErrors] = useState({});
    const [createLoading, setCreateLoading] = useState(false);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [assignLoading, setAssignLoading] = useState(false);

    // Asset types and statuses - using i18n
    const assetTypes = [
        { value: '', label: t('assets.types.all') },
        { value: 'tray', label: t('assets.types.tray') },
        { value: 'machine', label: t('assets.types.machine') },
        { value: 'tool', label: t('assets.types.tool') },
        { value: 'equipment', label: t('assets.types.equipment') },
        { value: 'other', label: t('assets.types.other') },
    ];

    const assetStatuses = [
        { value: '', label: t('assets.statuses.all') },
        { value: 'active', label: t('assets.statuses.active') },
        { value: 'off_service', label: t('assets.statuses.off_service') },
        { value: 'maintenance', label: t('assets.statuses.maintenance') },
        { value: 'retired', label: t('assets.statuses.retired') },
    ];

    const assignmentOptions = [
        { value: '', label: t('common.all') },
        { value: 'assigned', label: t('assets.assigned') },
        { value: 'unassigned', label: t('assets.unassigned') },
    ];

    const getAssetTypeLabel = useCallback((type) => {
        const normalizedType = String(type || '').trim().toLowerCase();

        if (!normalizedType) {
            return t('common.unknown');
        }

        const supportedTypes = ['tray', 'machine', 'tool', 'equipment', 'other'];
        const typeKey = supportedTypes.includes(normalizedType) ? normalizedType : 'other';

        return t(`assets.types.${typeKey}`);
    }, [t]);

    // ========================================================================
    // Data Fetching
    // ========================================================================
    const fetchAssets = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchQuery || undefined,
                type: typeFilter || undefined,
                status: statusFilter || undefined,
            };
            const data = await assetsApi.list(params);
            
            // Filter by assignment on client side (API doesn't have this filter)
            let filteredAssets = data.assets || [];
            if (assignmentFilter === 'assigned') {
                filteredAssets = filteredAssets.filter(a => a.is_assigned);
            } else if (assignmentFilter === 'unassigned') {
                filteredAssets = filteredAssets.filter(a => !a.is_assigned);
            }
            
            setAssets(filteredAssets);
            setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, typeFilter, statusFilter, assignmentFilter, toast]);

    const fetchEmployees = useCallback(async () => {
        try {
            const data = await employeesApi.list();
            setEmployees(data.employees || []);
        } catch (error) {
            // Silent fail - employees list is supplementary
            console.error('Failed to fetch employees:', error);
        }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const data = await suppliersApi.dropdown();
            setSuppliers(data.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
        }
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [fetchAssets]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, statusFilter, assignmentFilter]);

    // ========================================================================
    // Action Handlers
    // ========================================================================
    const handleViewAsset = async (asset) => {
        try {
            // Fetch fresh data
            const data = await assetsApi.get(asset.id);
            setSelectedAsset(data.asset);
            setDetailDrawerOpen(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleCreateAsset = async (e) => {
        e.preventDefault();
        setCreateErrors({});
        setCreateLoading(true);

        try {
            const data = await assetsApi.create(createForm);
            toast.success(t('assets.createSuccess'));
            setCreateModalOpen(false);
            setCreateForm({ asset_code: '', name: '', type: 'equipment', status: 'active', supplier_id: '', notes: '' });
            
            // Show the new asset in drawer
            setSelectedAsset(data.asset);
            setDetailDrawerOpen(true);
            
            fetchAssets();
        } catch (error) {
            if (error.response?.status === 422) {
                setCreateErrors(error.response.data.errors || {});
            }
            handleApiError(error, toast);
        } finally {
            setCreateLoading(false);
        }
    };

    const handleAssignAsset = async () => {
        if (!selectedAsset || !selectedEmployeeId) return;
        setAssignLoading(true);

        try {
            const data = await assetsApi.assign(selectedAsset.id, selectedEmployeeId);
            toast.success(t('assets.assignSuccess'));
            setAssignModalOpen(false);
            setSelectedEmployeeId('');
            
            // Refresh asset data
            const updated = await assetsApi.get(selectedAsset.id);
            setSelectedAsset(updated.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setAssignLoading(false);
        }
    };

    const handleUnassignAsset = async () => {
        if (!selectedAsset) return;

        try {
            await assetsApi.unassign(selectedAsset.id);
            toast.success(t('assets.unassignSuccess'));
            setConfirmUnassignOpen(false);
            
            // Refresh asset data
            const updated = await assetsApi.get(selectedAsset.id);
            setSelectedAsset(updated.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleRegenerateQr = async () => {
        if (!selectedAsset) return;

        try {
            const data = await assetsApi.regenerateQr(selectedAsset.id);
            toast.success(t('assets.qrRegenerated'));
            setConfirmRegenerateOpen(false);
            setSelectedAsset(data.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDeleteAsset = async () => {
        if (!selectedAsset) return;

        try {
            await assetsApi.delete(selectedAsset.id);
            toast.success(t('assets.deleteSuccess'));
            setConfirmDeleteOpen(false);
            setDetailDrawerOpen(false);
            setSelectedAsset(null);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(t('common.copied'));
    };

    // ========================================================================
    // Table Columns
    // ========================================================================
    const columns = [
        {
            key: 'asset_code',
            label: t('assets.assetCode'),
            width: '120px',
            render: (value) => (
                <span className="font-mono text-sm text-text-muted">{value}</span>
            )
        },
        {
            key: 'name',
            label: t('common.name'),
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted capitalize">{getAssetTypeLabel(row.type)}</div>
                </div>
            )
        },
        {
            key: 'status',
            label: t('common.status.label'),
            width: '120px',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'current_assignment',
            label: t('assets.currentAssignee'),
            render: (assignment) => (
                assignment ? (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                            {assignment.assignee?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <div className="text-sm font-medium">{assignment.assignee?.full_name}</div>
                            <div className="text-xs text-text-muted">{assignment.assignee?.employee_code}</div>
                        </div>
                    </div>
                ) : (
                    <span className="text-text-light text-sm italic">— {t('assets.unassigned')} —</span>
                )
            )
        },
        {
            key: 'qr',
            label: t('assets.qrCode'),
            width: '60px',
            align: 'center',
            render: (qr, row) => qr ? (
                <button
                    className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(qr.payload);
                    }}
                    title={t('assets.copyPayload')}
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <path d="M14 14h7v7h-7z" />
                    </svg>
                </button>
            ) : null
        },
        {
            key: 'actions',
            label: '',
            width: '50px',
            align: 'right',
            render: (_, row) => (
                <button
                    className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-primary transition-colors"
                    onClick={() => handleViewAsset(row)}
                    title={t('assets.viewDetails')}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )
        }
    ];

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-text">{t('assets.title')}</h2>
                    <p className="text-sm text-text-muted">{t('assets.subtitle')}</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {t('assets.createAsset')}
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardBody className="py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <Input
                                placeholder={t('assets.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                }
                            />
                        </div>
                        <Select
                            options={assetTypes}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        />
                        <Select
                            options={assetStatuses}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                        <Select
                            options={assignmentOptions}
                            value={assignmentFilter}
                            onChange={(e) => setAssignmentFilter(e.target.value)}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Assets Table */}
            <Card>
                <Table
                    columns={columns}
                    data={assets}
                    loading={loading}
                    emptyMessage={t('assets.noAssets')}
                    onRowClick={handleViewAsset}
                />
                {pagination.last_page > 1 && (
                    <div className="border-t border-border px-4 py-3">
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            totalItems={pagination.total}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>

            {/* Create Asset Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={t('assets.createAsset')}
                size="md"
            >
                <form onSubmit={handleCreateAsset}>
                    <div className="space-y-4">
                        <Input
                            label={t('assets.assetCode') + ' (' + t('common.optional') + ')'}
                            placeholder={t('assets.assetCodeHint')}
                            value={createForm.asset_code}
                            onChange={(e) => setCreateForm({ ...createForm, asset_code: e.target.value })}
                            error={createErrors.asset_code?.[0]}
                        />
                        <Input
                            label={t('assets.assetName') + ' *'}
                            placeholder={t('assets.enterAssetName')}
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            error={createErrors.name?.[0]}
                            required
                        />
                        <Select
                            label={t('assets.assetType') + ' *'}
                            options={assetTypes.filter(opt => opt.value)}
                            value={createForm.type}
                            onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                            error={createErrors.type?.[0]}
                        />
                        <Select
                            label={t('assets.assetStatus')}
                            options={assetStatuses.filter(s => s.value)}
                            value={createForm.status}
                            onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                        />
                        <Select
                            label={t('assets.supplier')}
                            options={[
                                { value: '', label: t('assets.chooseSupplier') },
                                ...suppliers.map((supplier) => ({
                                    value: supplier.id,
                                    label: supplier.code
                                        ? `${supplier.code} - ${supplier.name}`
                                        : supplier.name,
                                })),
                            ]}
                            value={createForm.supplier_id}
                            onChange={(e) => setCreateForm({ ...createForm, supplier_id: e.target.value })}
                            error={createErrors.supplier_id?.[0]}
                        />
                        <Input
                            label={t('common.notes')}
                            placeholder={t('assets.optionalNotes')}
                            value={createForm.notes}
                            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                        <Button variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" loading={createLoading}>
                            {t('assets.createAsset')}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Assign Modal */}
            <Modal
                isOpen={assignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title={t('assets.assignAsset')}
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-surface-muted rounded-lg p-3">
                        <div className="text-sm font-medium">{selectedAsset?.name}</div>
                        <div className="text-xs text-text-muted font-mono">{selectedAsset?.asset_code}</div>
                    </div>
                    <Select
                        label={t('assets.selectEmployee')}
                        options={[
                            { value: '', label: t('assets.chooseEmployee') },
                            ...employees.map(emp => ({
                                value: emp.id,
                                label: `${emp.full_name} (${emp.employee_code})`
                            }))
                        ]}
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={() => setAssignModalOpen(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleAssignAsset} loading={assignLoading} disabled={!selectedEmployeeId}>
                        {t('common.assign')}
                    </Button>
                </div>
            </Modal>

            {/* Asset Detail Drawer */}
            {detailDrawerOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div 
                        className="absolute inset-0 bg-surface-invert/20 backdrop-blur-sm"
                        onClick={() => setDetailDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-surface shadow-xl flex flex-col h-full animate-slide-in-right">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-border bg-background">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-text">{selectedAsset.name}</h2>
                                    <p className="text-sm text-text-muted font-mono">{selectedAsset.asset_code}</p>
                                </div>
                                <button
                                    className="p-2 rounded-lg hover:bg-surface-hover text-text-muted"
                                    onClick={() => setDetailDrawerOpen(false)}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Status Card */}
                            <Card>
                                <CardBody className="py-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-semibold text-text-muted uppercase">{t('common.status.label')}</span>
                                        <StatusBadge status={selectedAsset.status} />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">{t('common.type')}</span>
                                        <span className="text-sm font-medium capitalize">{getAssetTypeLabel(selectedAsset.type)}</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-border flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">{t('assets.supplier')}</span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-text">
                                                {selectedAsset.supplier?.name || t('assets.noSupplier')}
                                            </div>
                                            {(selectedAsset.supplier?.code || selectedAsset.supplier?.contact_person) && (
                                                <div className="text-xs text-text-muted">
                                                    {selectedAsset.supplier?.code || selectedAsset.supplier?.contact_person}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {selectedAsset.notes && (
                                        <div className="mt-3 pt-3 border-t border-border">
                                            <span className="text-xs font-semibold text-text-muted uppercase block mb-1">{t('common.notes')}</span>
                                            <p className="text-sm text-text">{selectedAsset.notes}</p>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Assignment Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        <span className="font-semibold">{t('assets.assignment')}</span>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {selectedAsset.current_assignment ? (
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                    {selectedAsset.current_assignment.assignee?.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{selectedAsset.current_assignment.assignee?.full_name}</div>
                                                    <div className="text-xs text-text-muted">
                                                        {t('assets.assignedSince')}: {new Date(selectedAsset.current_assignment.assigned_at).toLocaleDateString(dateLocale)}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                fullWidth
                                                onClick={() => setConfirmUnassignOpen(true)}
                                            >
                                                {t('assets.unassignAsset')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <p className="text-sm text-text-muted mb-3">{t('assets.noAssignment')}</p>
                                            <Button
                                                size="sm"
                                                fullWidth
                                                onClick={() => setAssignModalOpen(true)}
                                            >
                                                {t('assets.assignTo')}
                                            </Button>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            {/* QR Identity Card */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                            <path d="M14 14h7v7h-7z" />
                                        </svg>
                                        <span className="font-semibold">{t('assets.qrIdentity')}</span>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {selectedAsset.qr ? (
                                        <>
                                            <div className="bg-surface-muted rounded-lg p-3 mb-3">
                                                <code className="text-xs text-text-muted break-all block mb-2">
                                                    {selectedAsset.qr.payload}
                                                </code>
                                                <button
                                                    className="text-xs text-primary font-medium hover:text-primary-hover flex items-center gap-1"
                                                    onClick={() => copyToClipboard(selectedAsset.qr.payload)}
                                                >
                                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                    </svg>
                                                    {t('assets.copyPayload')}
                                                </button>
                                            </div>
                                            {/* QR Code Placeholder */}
                                            <div className="flex justify-center mb-3">
                                                <div className="w-24 h-24 bg-surface-invert rounded-lg flex items-center justify-center text-text-invert text-xs">
                                                    [{t('assets.qrCode')}]
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                fullWidth
                                                onClick={() => setConfirmRegenerateOpen(true)}
                                            >
                                                {t('assets.regenerateQr')}
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-sm text-text-muted text-center">{t('assets.noQrCode')}</p>
                                    )}
                                </CardBody>
                            </Card>

                            {/* Assignment History */}
                            {selectedAsset.assignment_history?.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <span className="font-semibold">{t('assets.assignmentHistory')}</span>
                                    </CardHeader>
                                    <CardBody className="py-0">
                                        <div className="divide-y divide-border">
                                            {selectedAsset.assignment_history.slice(0, 5).map((history, idx) => (
                                                <div key={idx} className="py-3 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-sm font-medium">{history.employee?.full_name}</div>
                                                        <div className="text-xs text-text-muted">
                                                            {new Date(history.assigned_at).toLocaleDateString(dateLocale)}
                                                            {history.unassigned_at && ` — ${new Date(history.unassigned_at).toLocaleDateString(dateLocale)}`}
                                                        </div>
                                                    </div>
                                                    {history.is_active && (
                                                        <Badge type="success">{t('time.current')}</Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Danger Zone */}
                            <div className="pt-4 border-t border-border">
                                <button
                                    className="w-full flex items-center justify-center gap-2 p-3 text-error hover:bg-error-light rounded-lg transition-colors"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                    {t('assets.deleteAsset')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modals */}
            <ConfirmModal
                isOpen={confirmUnassignOpen}
                onClose={() => setConfirmUnassignOpen(false)}
                onConfirm={handleUnassignAsset}
                title={t('assets.unassignAsset')}
                message={t('confirm.unassignMessage', { name: selectedAsset?.name, assignee: selectedAsset?.current_assignment?.assignee?.full_name })}
                confirmText={t('common.unassign')}
                variant="warning"
            />

            <ConfirmModal
                isOpen={confirmRegenerateOpen}
                onClose={() => setConfirmRegenerateOpen(false)}
                onConfirm={handleRegenerateQr}
                title={t('assets.regenerateQr')}
                message={t('assets.regenerateQrConfirm')}
                confirmText={t('common.regenerate')}
                variant="warning"
            />

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleDeleteAsset}
                title={t('assets.deleteAsset')}
                message={t('confirm.deleteAssetMessage', { name: selectedAsset?.name })}
                confirmText={t('common.delete')}
                variant="danger"
            />
        </div>
    );
};

export default AssetsPage;
