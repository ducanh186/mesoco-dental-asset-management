import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Badge,
    StatusBadge,
    Table,
    useToast
} from '../components/ui';
import { myAssetsApi, qrApi, handleApiError } from '../services/api';
import { useI18n } from '../i18n';
import axios from 'axios';

/**
 * MyAssetsPage - View assigned assets + QR resolve + Check-in
 * Features: List assigned assets, Resolve QR code, Modal with Status/Instructions tabs, Check-in/out
 */
const MyAssetsPage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();

    // Assets State
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    // QR Resolve State
    const [qrInput, setQrInput] = useState('');
    const [resolveLoading, setResolveLoading] = useState(false);
    const [resolvedData, setResolvedData] = useState(null); // Full API response
    const [resolveError, setResolveError] = useState(null);

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('status');
    const [checkinLoading, setCheckinLoading] = useState(false);

    // ========================================================================
    // Data Fetching
    // ========================================================================
    const fetchMyAssets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await myAssetsApi.list();
            setAssets(data.assets || []);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMyAssets();
    }, [fetchMyAssets]);

    // ========================================================================
    // QR Resolve
    // ========================================================================
    const handleResolveQr = async () => {
        if (!qrInput.trim()) {
            toast.warning(t('assets.enterQrPayload'));
            return;
        }

        setResolveLoading(true);
        setResolveError(null);
        setResolvedData(null);

        try {
            const data = await qrApi.resolve(qrInput.trim());
            setResolvedData(data);
            toast.success(t('assets.assetFound'));
            // Auto-open modal on successful resolve
            setModalOpen(true);
            setActiveTab('status');
        } catch (error) {
            if (error.response?.status === 404) {
                setResolveError(t('assets.assetNotFound'));
            } else {
                handleApiError(error, toast);
            }
        } finally {
            setResolveLoading(false);
        }
    };

    const handleClearResolve = () => {
        setQrInput('');
        setResolvedData(null);
        setResolveError(null);
        setModalOpen(false);
    };

    // ========================================================================
    // Check-in / Check-out
    // ========================================================================
    const handleCheckIn = async () => {
        if (!resolvedData?.asset?.id) return;
        
        setCheckinLoading(true);
        try {
            await axios.post('/api/checkins', {
                asset_id: resolvedData.asset.id,
            });
            toast.success(t('assets.checkinSuccess') || 'Checked in successfully');
            // Refresh the resolved data to get updated status
            const data = await qrApi.resolve(qrInput.trim());
            setResolvedData(data);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setCheckinLoading(false);
        }
    };

    const handleCheckOut = async () => {
        const checkinId = resolvedData?.checkin_status?.today_checkin?.id;
        if (!checkinId) return;
        
        setCheckinLoading(true);
        try {
            await axios.patch(`/api/checkins/${checkinId}/checkout`);
            toast.success(t('assets.checkoutSuccess') || 'Checked out successfully');
            // Refresh the resolved data to get updated status
            const data = await qrApi.resolve(qrInput.trim());
            setResolvedData(data);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setCheckinLoading(false);
        }
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
                    <div className="text-xs text-text-muted capitalize">{t(`assets.types.${row.type}`)}</div>
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
            key: 'assigned_at',
            label: t('assets.assignedSince'),
            width: '140px',
            render: (value) => (
                <span className="text-sm text-text-muted">
                    {value ? new Date(value).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-text">{t('assets.myAssets')}</h2>
                <p className="text-sm text-text-muted">{t('assets.myAssetsSubtitle')}</p>
            </div>

            {/* QR Resolve Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* QR Input */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                        <path d="M14 14h7v7h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text">{t('assets.qrLookup')}</h3>
                                    <p className="text-xs text-text-muted">{t('assets.qrLookupSubtitle')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    placeholder={t('assets.enterQrPayload')}
                                    value={qrInput}
                                    onChange={(e) => setQrInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleResolveQr()}
                                    className="flex-1"
                                />
                                <Button onClick={handleResolveQr} loading={resolveLoading}>
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <path d="M21 21l-4.35-4.35" />
                                    </svg>
                                    {t('assets.resolve')}
                                </Button>
                                {(resolvedData || resolveError || qrInput) && (
                                    <Button variant="secondary" onClick={handleClearResolve}>
                                        {t('common.clear')}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* QR Result */}
                        <div className="lg:border-l lg:border-primary/20 lg:pl-6">
                            {resolveError ? (
                                <div className="bg-error-light border border-error/20 rounded-lg p-4 text-error text-sm flex items-center gap-3">
                                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {resolveError}
                                </div>
                            ) : resolvedData?.asset ? (
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-text">{resolvedData.asset.name}</h4>
                                            <p className="text-xs font-mono text-text-muted">{resolvedData.asset.asset_code}</p>
                                        </div>
                                        <StatusBadge status={resolvedData.asset.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-surface/60 rounded p-2">
                                            <span className="text-xs text-text-muted block">{t('assets.columns.type')}</span>
                                            <span className="font-medium capitalize">{resolvedData.asset.type}</span>
                                        </div>
                                        <div className="bg-surface/60 rounded p-2">
                                            <span className="text-xs text-text-muted block">{t('assets.checkinStatus') || 'Check-in'}</span>
                                            <span className={`font-medium ${resolvedData.checkin_status?.today_checkin ? 'text-success' : 'text-text-muted'}`}>
                                                {resolvedData.checkin_status?.today_checkin ? (t('assets.checkedIn') || 'Checked In') : (t('assets.notCheckedIn') || 'Not Checked In')}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            size="sm" 
                                            variant="secondary"
                                            onClick={() => { setModalOpen(true); setActiveTab('status'); }}
                                        >
                                            {t('assets.viewDetails') || 'View Details'}
                                        </Button>
                                        {resolvedData.checkin_status?.can_check_in && (
                                            <Button 
                                                size="sm"
                                                onClick={handleCheckIn}
                                                loading={checkinLoading}
                                            >
                                                {t('assets.checkIn') || 'Check In'}
                                            </Button>
                                        )}
                                        {resolvedData.checkin_status?.today_checkin && !resolvedData.checkin_status?.today_checkin?.checked_out_at && (
                                            <Button 
                                                size="sm"
                                                variant="warning"
                                                onClick={handleCheckOut}
                                                loading={checkinLoading}
                                            >
                                                {t('assets.checkOut') || 'Check Out'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-text-muted py-4">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 mx-auto mb-2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <rect x="3" y="3" width="7" height="7" />
                                            <rect x="14" y="3" width="7" height="7" />
                                            <rect x="3" y="14" width="7" height="7" />
                                            <path d="M14 14h7v7h-7z" />
                                        </svg>
                                        <p className="text-sm">{t('assets.qrEnterHint')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* My Assigned Assets */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                            <h3 className="font-semibold">{t('assets.myAssigned')}</h3>
                        </div>
                        <Badge type="info">{assets.length} {t('common.items')}</Badge>
                    </div>
                </CardHeader>
                <Table
                    columns={columns}
                    data={assets}
                    loading={loading}
                    emptyMessage={t('assets.noAssignedYet')}
                />
            </Card>

            {/* Help Card */}
            <Card className="bg-surface-muted border-border/50">
                <CardBody className="py-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-info/10 rounded-lg">
                            <svg className="w-4 h-4 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 16v-4" />
                                <path d="M12 8h.01" />
                            </svg>
                        </div>
                        <div className="text-sm">
                            <p className="font-medium text-text mb-1">{t('assets.qrHelpTitle')}</p>
                            <p className="text-text-muted">{t('assets.qrHelpDesc')}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Asset Details Modal */}
            {modalOpen && resolvedData?.asset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50" 
                        onClick={() => setModalOpen(false)}
                    />
                    
                    {/* Modal */}
                    <div className="relative bg-surface rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-border flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-text">{resolvedData.asset.name}</h3>
                                <p className="text-sm font-mono text-text-muted">{resolvedData.asset.asset_code}</p>
                            </div>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="p-1 hover:bg-surface-muted rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-border">
                            <button
                                onClick={() => setActiveTab('status')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'status' 
                                        ? 'text-primary border-b-2 border-primary bg-primary/5' 
                                        : 'text-text-muted hover:text-text hover:bg-surface-muted'
                                }`}
                            >
                                {t('assets.statusTab') || 'Status'}
                            </button>
                            <button
                                onClick={() => setActiveTab('instructions')}
                                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                                    activeTab === 'instructions' 
                                        ? 'text-primary border-b-2 border-primary bg-primary/5' 
                                        : 'text-text-muted hover:text-text hover:bg-surface-muted'
                                }`}
                            >
                                {t('assets.instructionsTab') || 'Instructions'}
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 overflow-y-auto flex-1">
                            {activeTab === 'status' ? (
                                <div className="space-y-4">
                                    {/* Asset Status */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-surface-muted rounded-lg p-3">
                                            <span className="text-xs text-text-muted block mb-1">{t('assets.columns.type')}</span>
                                            <span className="font-medium capitalize">{resolvedData.asset.type}</span>
                                        </div>
                                        <div className="bg-surface-muted rounded-lg p-3">
                                            <span className="text-xs text-text-muted block mb-1">{t('common.status.label')}</span>
                                            <StatusBadge status={resolvedData.asset.status} />
                                        </div>
                                    </div>

                                    {/* Assignment */}
                                    <div className="bg-surface-muted rounded-lg p-3">
                                        <span className="text-xs text-text-muted block mb-2">{t('assets.assignment')}</span>
                                        {resolvedData.assignee ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                                                    {resolvedData.assignee.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium">{resolvedData.assignee.full_name}</div>
                                                    <div className="text-xs text-text-muted">{resolvedData.assignee.employee_code}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-text-muted">{t('assets.noAssignment')}</span>
                                        )}
                                    </div>

                                    {/* Check-in Status */}
                                    <div className="bg-surface-muted rounded-lg p-3">
                                        <span className="text-xs text-text-muted block mb-2">{t('assets.checkinStatus') || 'Check-in Status'}</span>
                                        {resolvedData.checkin_status?.current_shift ? (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-text-muted">{t('assets.currentShift') || 'Current Shift'}:</span>
                                                    <span className="font-medium">{resolvedData.checkin_status.current_shift.name}</span>
                                                </div>
                                                {resolvedData.checkin_status.today_checkin ? (
                                                    <div className="flex items-center gap-2 text-success">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                            <path d="M22 4L12 14.01l-3-3" />
                                                        </svg>
                                                        <span className="text-sm font-medium">
                                                            {t('assets.checkedInAt') || 'Checked in at'} {new Date(resolvedData.checkin_status.today_checkin.checked_in_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-text-muted">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <path d="M12 6v6l4 2" />
                                                        </svg>
                                                        <span className="text-sm">{t('assets.notCheckedInYet') || 'Not checked in yet'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-text-muted text-sm">{t('assets.noActiveShift') || 'No active shift'}</span>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {resolvedData.asset.notes && (
                                        <div className="bg-surface-muted rounded-lg p-3">
                                            <span className="text-xs text-text-muted block mb-1">{t('common.notes')}</span>
                                            <p className="text-sm">{resolvedData.asset.notes}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {resolvedData.asset.instructions?.available ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-text-muted">
                                                {t('assets.instructionsDesc') || 'This asset has attached instructions. Click the button below to view them.'}
                                            </p>
                                            <a
                                                href={resolvedData.asset.instructions.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15,3 21,3 21,9" />
                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                                {t('assets.openInstructions') || 'Open Instructions'}
                                            </a>
                                            <p className="text-xs text-text-muted text-center break-all">
                                                {resolvedData.asset.instructions.url}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <svg className="w-12 h-12 mx-auto text-text-muted/30 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <path d="M14 2v6h6" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                                <line x1="10" y1="9" x2="8" y2="9" />
                                            </svg>
                                            <p className="text-text-muted">
                                                {t('assets.noInstructions') || 'No instructions available for this asset'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Check-in Actions */}
                        <div className="p-4 border-t border-border flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => setModalOpen(false)}>
                                {t('common.close')}
                            </Button>
                            {resolvedData.checkin_status?.can_check_in && (
                                <Button onClick={handleCheckIn} loading={checkinLoading}>
                                    {t('assets.checkIn') || 'Check In'}
                                </Button>
                            )}
                            {resolvedData.checkin_status?.today_checkin && !resolvedData.checkin_status?.today_checkin?.checked_out_at && (
                                <Button variant="warning" onClick={handleCheckOut} loading={checkinLoading}>
                                    {t('assets.checkOut') || 'Check Out'}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAssetsPage;
