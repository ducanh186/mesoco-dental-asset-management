import React, { useState, useCallback } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Badge,
    StatusBadge,
    useToast
} from '../components/ui';
import { qrApi, handleApiError } from '../services/api';
import { useI18n } from '../i18n';
import { useQRScanner, parseQRPayload } from '../hooks/useQRScanner';

/**
 * QRScanPage - QR Code Scanner / Asset Lookup
 * 
 * Features:
 * - Camera-based QR scanning (mobile-first)
 * - Manual payload input fallback
 * - Pre-validates QR format before API call
 * - Displays asset details with off-service warnings
 * - Check-in action if allowed
 */
const QRScanPage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();

    // State
    const [mode, setMode] = useState('camera'); // 'camera' | 'manual'
    const [qrInput, setQrInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [resolvedAsset, setResolvedAsset] = useState(null);
    const [error, setError] = useState(null);

    // ========================================================================
    // QR Resolution Logic
    // ========================================================================
    const resolvePayload = useCallback(async (rawPayload) => {
        if (loading) return; // Anti-spam lock

        const trimmed = rawPayload?.trim();
        if (!trimmed) {
            toast.warning(t('qrScan.enterPayload'));
            return;
        }

        // Pre-validate payload format before calling API
        const parsed = parseQRPayload(trimmed);
        
        if (!parsed.valid) {
            setError(null);
            setResolvedAsset(null);
            
            if (parsed.error === 'unsupportedVersion') {
                setError({
                    type: 'unsupportedVersion',
                    message: t('qrScan.unsupportedVersion'),
                    detail: `Version: ${parsed.version}`
                });
                toast.error(t('qrScan.unsupportedVersion'));
            } else {
                setError({
                    type: 'invalidFormat',
                    message: t('qrScan.invalidFormat'),
                    detail: t('qrScan.expectedFormat')
                });
                toast.error(t('qrScan.invalidFormat'));
            }
            return;
        }

        // Valid format - call API
        setLoading(true);
        setError(null);
        setResolvedAsset(null);

        try {
            const data = await qrApi.resolve(trimmed);
            setResolvedAsset(data);
            toast.success(t('qrScan.assetFound'));
        } catch (err) {
            if (err.response?.status === 404) {
                setError({
                    type: 'notFound',
                    message: t('qrScan.assetNotFound'),
                    detail: err.response?.data?.message || ''
                });
                toast.error(t('qrScan.assetNotFound'));
            } else if (err.response?.status === 422) {
                // BE returns 422 for invalid format (shouldn't happen if FE validates)
                setError({
                    type: 'invalidFormat',
                    message: t('qrScan.invalidFormat'),
                    detail: err.response?.data?.message || ''
                });
                toast.error(t('qrScan.invalidFormat'));
            } else {
                handleApiError(err, toast);
                setError({
                    type: 'error',
                    message: t('qrScan.resolveFailed'),
                    detail: ''
                });
            }
        } finally {
            setLoading(false);
        }
    }, [loading, toast, t]);

    // ========================================================================
    // QR Scanner Hook
    // ========================================================================
    const handleScanSuccess = useCallback((payload) => {
        // Auto-resolve on successful scan
        resolvePayload(payload);
    }, [resolvePayload]);

    const handleScanError = useCallback((errorType) => {
        if (errorType === 'permissionDenied') {
            toast.warning(t('qrScan.cameraPermissionDenied'));
            setMode('manual'); // Fall back to manual input
        }
    }, [toast, t]);

    const {
        isScanning,
        hasCamera,
        permissionDenied,
        containerId,
        startScanning,
        stopScanning,
    } = useQRScanner({
        onScan: handleScanSuccess,
        onError: handleScanError,
        cooldownMs: 2000,
    });

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleManualResolve = () => {
        resolvePayload(qrInput);
    };

    const handleClear = () => {
        setQrInput('');
        setResolvedAsset(null);
        setError(null);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleManualResolve();
        }
    };

    const handleStartCamera = async () => {
        setError(null);
        setResolvedAsset(null);
        await startScanning();
    };

    const handleStopCamera = async () => {
        await stopScanning();
    };

    const handleSwitchToManual = async () => {
        await stopScanning();
        setMode('manual');
    };

    const handleSwitchToCamera = () => {
        setMode('camera');
    };

    // Determine if check-in is allowed
    const canCheckIn = resolvedAsset?.checkin_status?.can_check_in === true;
    const isOffService = resolvedAsset?.asset?.status === 'off_service';
    const checkInBlockedReason = resolvedAsset?.checkin_status?.blocked_reason;

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="qr-scan-page space-y-6">
            {/* Header */}
            <Card>
                <CardBody>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-text">{t('qrScan.title')}</h2>
                        <p className="text-sm text-text-muted mt-1">{t('qrScan.subtitle')}</p>
                    </div>
                </CardBody>
            </Card>

            {/* Scanner Section */}
            <Card>
                <CardHeader 
                    title={t('qrScan.scannerTitle')} 
                    action={
                        <div className="flex gap-2">
                            <Button
                                variant={mode === 'camera' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={handleSwitchToCamera}
                                disabled={!hasCamera || permissionDenied}
                            >
                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                                {t('qrScan.useCamera')}
                            </Button>
                            <Button
                                variant={mode === 'manual' ? 'primary' : 'outline'}
                                size="sm"
                                onClick={handleSwitchToManual}
                            >
                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="4 7 4 4 20 4 20 7" />
                                    <line x1="9" y1="20" x2="15" y2="20" />
                                    <line x1="12" y1="4" x2="12" y2="20" />
                                </svg>
                                {t('qrScan.manualInput')}
                            </Button>
                        </div>
                    }
                />
                <CardBody>
                    {/* Camera Mode */}
                    {mode === 'camera' && (
                        <div className="space-y-4">
                            {/* Camera Viewfinder */}
                            <div className="relative mx-auto w-full max-w-md">
                                {/* Scanner container - html5-qrcode renders here */}
                                <div 
                                    id={containerId}
                                    className={`
                                        aspect-square bg-surface-muted rounded-lg overflow-hidden
                                        ${isScanning ? 'border-2 border-primary' : 'border-2 border-dashed border-primary/30'}
                                    `}
                                >
                                    {/* Placeholder when not scanning */}
                                    {!isScanning && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                            {/* Viewfinder frame */}
                                            <div className="relative w-48 h-48 mb-4">
                                                <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                                                    <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl" />
                                                    <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr" />
                                                    <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl" />
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br" />
                                                </div>
                                                <svg className="absolute inset-0 m-auto h-16 w-16 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <rect x="3" y="3" width="7" height="7" />
                                                    <rect x="14" y="3" width="7" height="7" />
                                                    <rect x="3" y="14" width="7" height="7" />
                                                    <rect x="14" y="14" width="7" height="7" />
                                                </svg>
                                            </div>
                                            
                                            {hasCamera === false && (
                                                <p className="text-sm text-warning text-center">
                                                    {t('qrScan.noCameraAvailable')}
                                                </p>
                                            )}
                                            
                                            {permissionDenied && (
                                                <p className="text-sm text-error text-center">
                                                    {t('qrScan.cameraPermissionDenied')}
                                                </p>
                                            )}
                                            
                                            {hasCamera !== false && !permissionDenied && (
                                                <p className="text-sm text-text-muted text-center">
                                                    {t('qrScan.tapToStart')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Scanning indicator */}
                                {isScanning && (
                                    <div className="absolute top-2 left-2 bg-success/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                        {t('qrScan.scanning')}
                                    </div>
                                )}
                            </div>

                            {/* Camera Controls */}
                            <div className="flex justify-center gap-3">
                                {!isScanning ? (
                                    <Button 
                                        onClick={handleStartCamera}
                                        disabled={hasCamera === false || permissionDenied || loading}
                                        size="lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        {t('qrScan.startScanning')}
                                    </Button>
                                ) : (
                                    <Button 
                                        variant="outline"
                                        onClick={handleStopCamera}
                                        size="lg"
                                    >
                                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="6" y="6" width="12" height="12" />
                                        </svg>
                                        {t('qrScan.stopScanning')}
                                    </Button>
                                )}
                            </div>

                            {loading && (
                                <div className="text-center text-text-muted">
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                                        </svg>
                                        {t('qrScan.resolving')}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual Mode */}
                    {mode === 'manual' && (
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <Input
                                    value={qrInput}
                                    onChange={(e) => setQrInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={t('qrScan.inputPlaceholder')}
                                    className="flex-1 font-mono"
                                    autoFocus
                                />
                                <Button 
                                    onClick={handleManualResolve} 
                                    disabled={loading || !qrInput.trim()}
                                >
                                    {loading ? t('common.loading') : t('qrScan.resolve')}
                                </Button>
                                {(qrInput || resolvedAsset || error) && (
                                    <Button variant="outline" onClick={handleClear}>
                                        {t('common.clear')}
                                    </Button>
                                )}
                            </div>

                            <p className="text-xs text-text-muted text-center">
                                {t('qrScan.inputHint')}
                            </p>
                            <p className="text-xs text-text-muted text-center font-mono">
                                {t('qrScan.expectedFormat')}
                            </p>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Error State */}
            {error && (
                <Card className="border-error/30 bg-error-light/10">
                    <CardBody>
                        <div className="flex items-center gap-3 text-error">
                            <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                            <div>
                                <p className="font-medium">{error.message}</p>
                                {error.detail && (
                                    <p className="text-sm opacity-80">{error.detail}</p>
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Result */}
            {resolvedAsset && (
                <Card className={`border-2 ${isOffService ? 'border-warning/50' : 'border-success/30'}`}>
                    <CardHeader 
                        title={t('qrScan.assetResolved')}
                        action={
                            <Badge variant={isOffService ? 'warning' : 'success'} size="sm">
                                {isOffService ? t('qrScan.offService') : t('qrScan.identified')}
                            </Badge>
                        }
                    />
                    <CardBody>
                        <div className="space-y-4">
                            {/* Off-Service Warning */}
                            {isOffService && (
                                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex items-start gap-3">
                                    <svg className="w-6 h-6 text-warning flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                        <line x1="12" y1="9" x2="12" y2="13" />
                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                    </svg>
                                    <div>
                                        <p className="font-semibold text-warning">{t('qrScan.offServiceWarning')}</p>
                                        <p className="text-sm text-text-muted mt-1">{t('qrScan.offServiceDetail')}</p>
                                    </div>
                                </div>
                            )}

                            {/* Asset Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-sm text-text-muted">{t('assets.assetCode')}</span>
                                    <p className="font-medium font-mono">{resolvedAsset.asset?.asset_code || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-text-muted">{t('assets.assetName')}</span>
                                    <p className="font-medium">{resolvedAsset.asset?.name || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-text-muted">{t('assets.assetType')}</span>
                                    <p className="font-medium capitalize">{resolvedAsset.asset?.type || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-text-muted">{t('common.status')}</span>
                                    <p><StatusBadge status={resolvedAsset.asset?.status || 'active'} /></p>
                                </div>
                                <div>
                                    <span className="text-sm text-text-muted">{t('assets.assignedTo')}</span>
                                    <p className="font-medium">
                                        {resolvedAsset.assignee?.full_name || t('assets.unassigned')}
                                    </p>
                                </div>
                                {resolvedAsset.checkin_status?.current_shift && (
                                    <div>
                                        <span className="text-sm text-text-muted">{t('assets.currentShift')}</span>
                                        <p className="font-medium">{resolvedAsset.checkin_status.current_shift.name}</p>
                                    </div>
                                )}
                            </div>

                            {/* Check-in Status */}
                            {resolvedAsset.checkin_status && (
                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium text-text mb-2">{t('assets.checkinStatus')}</h4>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant={resolvedAsset.checkin_status.today_checkin ? 'success' : 'default'}>
                                            {resolvedAsset.checkin_status.today_checkin 
                                                ? t('assets.checkedInToday') 
                                                : t('assets.notCheckedInToday')}
                                        </Badge>
                                        {!canCheckIn && checkInBlockedReason && (
                                            <span className="text-sm text-text-muted">
                                                {t(`qrScan.blockedReason.${checkInBlockedReason}`, checkInBlockedReason)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            {resolvedAsset.asset?.instructions?.available && (
                                <div className="pt-4 border-t">
                                    <h4 className="text-sm font-medium text-text mb-2">{t('qrScan.instructions')}</h4>
                                    <div className="bg-surface-muted rounded-lg p-4">
                                        {resolvedAsset.asset.instructions.url ? (
                                            <a 
                                                href={resolvedAsset.asset.instructions.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                                    <polyline points="15 3 21 3 21 9" />
                                                    <line x1="10" y1="14" x2="21" y2="3" />
                                                </svg>
                                                {t('qrScan.viewInstructions')}
                                            </a>
                                        ) : (
                                            <p className="text-sm text-text-muted">
                                                {t('qrScan.instructionsNotAvailable')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4 border-t flex flex-wrap gap-3">
                                {resolvedAsset.asset?.id && (
                                    <Button 
                                        variant="outline"
                                        onClick={() => window.location.href = `/assets?id=${resolvedAsset.asset.id}`}
                                    >
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        {t('qrScan.viewAsset')}
                                    </Button>
                                )}
                                
                                {canCheckIn && !isOffService ? (
                                    <Button onClick={() => toast.info(t('qrScan.checkinFromMyAssets'))}>
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        {t('assets.checkIn')}
                                    </Button>
                                ) : (
                                    <Button disabled title={isOffService ? t('qrScan.offServiceWarning') : ''}>
                                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        {t('assets.checkIn')}
                                    </Button>
                                )}

                                <Button variant="outline" onClick={handleClear}>
                                    {t('qrScan.scanAnother')}
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {/* Help Section */}
            {!resolvedAsset && !error && !isScanning && (
                <Card>
                    <CardBody>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-info/10 text-info flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-text">{t('qrScan.helpTitle')}</h4>
                                <p className="text-sm text-text-muted mt-1">{t('qrScan.helpDesc')}</p>
                                <ul className="text-sm text-text-muted mt-2 space-y-1 list-disc list-inside">
                                    <li>{t('qrScan.helpStep1')}</li>
                                    <li>{t('qrScan.helpStep2')}</li>
                                    <li>{t('qrScan.helpStep3')}</li>
                                </ul>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default QRScanPage;
