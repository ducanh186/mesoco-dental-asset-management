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
import { disposalApi, handleApiError } from '../services/api';

/**
 * DisposalPage - Asset disposal management (Thu hủy)
 * BFD Module 4: Quản lý thu hủy
 *
 * Shows assets with depreciation >= 70% eligible for disposal,
 * and already retired/disposed assets.
 */
const DisposalPage = ({ user }) => {
    const { t } = useI18n();
    const toast = useToast();

    // State
    const [loading, setLoading] = useState(true);
    const [assets, setAssets] = useState([]);
    const [summary, setSummary] = useState(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

    // Tabs & Filters
    const [activeTab, setActiveTab] = useState('eligible');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [retireAsset, setRetireAsset] = useState(null);
    const [retireReason, setRetireReason] = useState('');
    const [retireLoading, setRetireLoading] = useState(false);

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        try {
            setSummaryLoading(true);
            const data = await disposalApi.summary();
            setSummary(data);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSummaryLoading(false);
        }
    }, [toast]);

    // Fetch assets
    const fetchAssets = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                tab: activeTab,
                page: currentPage,
                per_page: 15,
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
            };
            const data = await disposalApi.assets(params);
            setAssets(data.assets || []);
            setPagination(data.pagination);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, searchQuery, categoryFilter, toast]);

    useEffect(() => { fetchSummary(); }, [fetchSummary]);
    useEffect(() => { fetchAssets(); }, [fetchAssets]);

    // Reset page when filters change
    useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery, categoryFilter]);

    // Handle retire
    const handleRetire = async () => {
        if (!retireAsset || !retireReason.trim()) return;
        try {
            setRetireLoading(true);
            await disposalApi.retire(retireAsset.id, { reason: retireReason });
            toast.success(t('disposal.retireSuccess'));
            setRetireAsset(null);
            setRetireReason('');
            fetchAssets();
            fetchSummary();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setRetireLoading(false);
        }
    };

    // Depreciation badge color
    const getDepreciationBadge = (percentage) => {
        if (percentage >= 90) return 'danger';
        if (percentage >= 70) return 'warning';
        return 'info';
    };

    // Summary cards
    const renderSummary = () => {
        if (summaryLoading || !summary) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[1,2,3,4].map(i => (
                        <Card key={i}><CardBody><div className="animate-pulse h-12 bg-surface-muted rounded" /></CardBody></Card>
                    ))}
                </div>
            );
        }

        const cards = [
            { label: t('disposal.eligibleForDisposal'), value: summary.eligible_for_disposal, color: 'text-warning' },
            { label: t('disposal.highDepreciation'), value: summary.high_depreciation, color: 'text-danger' },
            { label: t('disposal.alreadyRetired'), value: summary.already_retired, color: 'text-text-muted' },
            { label: t('disposal.remainingValue'), value: summary.total_remaining_value?.toLocaleString('vi-VN') + ' ₫', color: 'text-primary' },
        ];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card, i) => (
                    <Card key={i}>
                        <CardBody>
                            <p className="text-sm text-text-muted">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>
        );
    };

    // Eligible tab columns
    const eligibleColumns = [
        { key: 'asset_code', label: t('disposal.assetCode'), render: (row) => <span className="font-mono text-sm">{row.asset_code}</span> },
        { key: 'name', label: t('disposal.assetName') },
        { key: 'category', label: t('disposal.category') },
        {
            key: 'depreciation_percentage', label: t('disposal.depreciation'),
            render: (row) => (
                <Badge variant={getDepreciationBadge(row.depreciation_percentage)}>
                    {row.depreciation_percentage}%
                </Badge>
            )
        },
        {
            key: 'purchase_cost', label: t('disposal.purchaseCost'),
            render: (row) => row.purchase_cost?.toLocaleString('vi-VN') + ' ₫'
        },
        {
            key: 'current_book_value', label: t('disposal.bookValue'),
            render: (row) => row.current_book_value?.toLocaleString('vi-VN') + ' ₫'
        },
        { key: 'status', label: t('common.status.label'), render: (row) => <Badge>{t(`common.status.${row.status}`)}</Badge> },
        {
            key: 'actions', label: t('common.actions'),
            render: (row) => (
                <Button
                    size="sm"
                    variant="danger"
                    onClick={() => { setRetireAsset(row); setRetireReason(''); }}
                >
                    {t('disposal.retire')}
                </Button>
            )
        },
    ];

    // Retired tab columns
    const retiredColumns = [
        { key: 'asset_code', label: t('disposal.assetCode'), render: (row) => <span className="font-mono text-sm">{row.asset_code}</span> },
        { key: 'name', label: t('disposal.assetName') },
        { key: 'category', label: t('disposal.category') },
        {
            key: 'depreciation_percentage', label: t('disposal.depreciation'),
            render: (row) => row.depreciation_percentage != null ? (
                <Badge variant="danger">{row.depreciation_percentage}%</Badge>
            ) : '—'
        },
        {
            key: 'purchase_cost', label: t('disposal.purchaseCost'),
            render: (row) => row.purchase_cost ? row.purchase_cost.toLocaleString('vi-VN') + ' ₫' : '—'
        },
        { key: 'off_service_reason', label: t('disposal.reason') },
        { key: 'off_service_from', label: t('disposal.retiredDate') },
    ];

    return (
        <div>
            {renderSummary()}

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex gap-2">
                            <Button
                                variant={activeTab === 'eligible' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('eligible')}
                            >
                                {t('disposal.eligibleTab')} ({summary?.eligible_for_disposal || 0})
                            </Button>
                            <Button
                                variant={activeTab === 'retired' ? 'primary' : 'ghost'}
                                size="sm"
                                onClick={() => setActiveTab('retired')}
                            >
                                {t('disposal.retiredTab')} ({summary?.already_retired || 0})
                            </Button>
                        </div>

                        <div className="flex gap-2 flex-1 max-w-md">
                            <Input
                                placeholder={t('common.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">{t('common.all')}</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Monitor">Monitor</option>
                                <option value="Network">Network</option>
                                <option value="Server">Server</option>
                                <option value="Peripheral">Peripheral</option>
                                <option value="Printer">Printer</option>
                                <option value="Mobile Device">Mobile Device</option>
                                <option value="Office IT">Office IT</option>
                                <option value="Other">Other</option>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardBody>
                    <Table
                        columns={activeTab === 'eligible' ? eligibleColumns : retiredColumns}
                        data={assets}
                        loading={loading}
                        emptyMessage={activeTab === 'eligible' ? t('disposal.noEligible') : t('disposal.noRetired')}
                    />
                    {pagination.last_page > 1 && (
                        <TablePagination
                            currentPage={pagination.current_page}
                            lastPage={pagination.last_page}
                            total={pagination.total}
                            perPage={pagination.per_page}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardBody>
            </Card>

            {/* Retire Confirmation Modal */}
            {retireAsset && (
                <Modal
                    isOpen={!!retireAsset}
                    onClose={() => setRetireAsset(null)}
                    title={t('disposal.retireConfirmTitle')}
                >
                    <div className="space-y-4">
                        <p className="text-text-muted">
                            {t('disposal.retireConfirmMessage', { name: retireAsset.name, code: retireAsset.asset_code })}
                        </p>
                        <div>
                            <p className="text-sm font-medium mb-1">{t('disposal.depreciation')}: <Badge variant={getDepreciationBadge(retireAsset.depreciation_percentage)}>{retireAsset.depreciation_percentage}%</Badge></p>
                            <p className="text-sm text-text-muted">{t('disposal.bookValue')}: {retireAsset.current_book_value?.toLocaleString('vi-VN')} ₫</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('disposal.reason')} *</label>
                            <textarea
                                className="w-full border border-border rounded-md p-2 text-sm bg-surface text-text"
                                rows={3}
                                value={retireReason}
                                onChange={(e) => setRetireReason(e.target.value)}
                                placeholder={t('disposal.reasonPlaceholder')}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setRetireAsset(null)}>{t('common.cancel')}</Button>
                            <Button
                                variant="danger"
                                onClick={handleRetire}
                                disabled={!retireReason.trim() || retireLoading}
                            >
                                {retireLoading ? t('common.processing') : t('disposal.confirmRetire')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DisposalPage;
