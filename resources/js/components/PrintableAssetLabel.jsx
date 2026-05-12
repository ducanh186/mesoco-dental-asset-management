import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui';
import { useI18n } from '../i18n';
import { buildQrDataUrl, getPrintableQrValue, getQrPayload, getQrPortalUrl } from '../utils/qr';

/**
 * PrintableAssetLabel - printable responsible asset label for Mesoco assets.
 */
const PrintableAssetLabel = ({ asset, onClose }) => {
    const { t } = useI18n();
    const printRef = useRef(null);
    const [qrImageUrl, setQrImageUrl] = useState('');
    const locationLabel = typeof asset.location === 'object' && asset.location
        ? [asset.location.code, asset.location.name].filter(Boolean).join(' - ')
        : (asset.location_name || asset.location);
    const responsibleLabel = asset.responsible_employee?.full_name
        || asset.assignedTo
        || asset.assigned_to?.name
        || asset.current_assignment?.employee?.full_name
        || asset.current_assignment?.employee?.name
        || asset.department_name;
    const portalUrl = getQrPortalUrl(asset);
    const payload = getQrPayload(asset);
    const printableQrValue = getPrintableQrValue(asset);

    useEffect(() => {
        let cancelled = false;

        if (!printableQrValue) {
            setQrImageUrl('');
            return undefined;
        }

        buildQrDataUrl(printableQrValue, { width: 240 })
            .then((nextQrImageUrl) => {
                if (!cancelled) {
                    setQrImageUrl(nextQrImageUrl);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setQrImageUrl('');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [printableQrValue]);

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert(t('printableLabel.popupBlocked'));
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${t('printableLabel.title')} - ${asset.asset_code || 'N/A'}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        padding: 20px;
                    }
                    .label-container {
                        width: 3in;
                        padding: 16px;
                        border: 2px solid #000;
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .company-name {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0;
                        color: #666;
                        margin-bottom: 8px;
                        text-align: center;
                    }
                    .asset-code {
                        font-size: 18px;
                        font-weight: bold;
                        text-align: center;
                        margin-bottom: 4px;
                        font-family: monospace;
                    }
                    .asset-name {
                        font-size: 12px;
                        text-align: center;
                        margin-bottom: 12px;
                        color: #333;
                    }
                    .asset-details {
                        margin-top: 8px;
                        padding-top: 8px;
                        border-top: 1px dashed #ccc;
                        font-size: 9px;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 2px;
                    }
                    .detail-label {
                        color: #666;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .label-container {
                            border: 2px solid #000;
                        }
                    }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
                <div ref={printRef} className="label-container w-[3in] p-4 border-2 border-border rounded-lg bg-white">
                    <div className="company-name text-xs uppercase text-text-muted text-center mb-2">
                        MESOCO Asset Management
                    </div>
                    <div className="flex justify-center mb-3">
                        {qrImageUrl ? (
                            <img src={qrImageUrl} alt="Asset QR" className="w-44 h-44 object-contain" />
                        ) : (
                            <div className="w-44 h-44 flex items-center justify-center border border-dashed border-border rounded text-center text-xs text-text-muted px-3">
                                {printableQrValue ? t('printableLabel.qrLoading') : t('printableLabel.qrUnavailable')}
                            </div>
                        )}
                    </div>
                    <div className="asset-code text-xl font-bold text-center mb-1 font-mono">
                        {asset.asset_code || 'N/A'}
                    </div>
                    <div className="asset-name text-sm text-center mb-3 text-text-muted">
                        {asset.name || t('printableLabel.unnamedAsset')}
                    </div>
                    <div className="text-[10px] text-center text-text-muted mb-3 break-all">
                        {portalUrl || t('printableLabel.scanInstruction')}
                    </div>
                    <div className="handover-note my-2 p-2 border border-border rounded text-center text-xs">
                        {portalUrl ? t('printableLabel.qrPortalHint') : t('printableLabel.handoverNote')}
                    </div>
                    <div className="asset-details mt-2 pt-2 border-t border-dashed border-border text-[9px]">
                        {asset.category && (
                            <div className="detail-row flex justify-between mb-1">
                                <span className="detail-label text-text-muted">{t('assets.category')}:</span>
                                <span>{asset.category}</span>
                            </div>
                        )}
                        {locationLabel && (
                            <div className="detail-row flex justify-between mb-1">
                                <span className="detail-label text-text-muted">{t('assets.location')}:</span>
                                <span>{locationLabel}</span>
                            </div>
                        )}
                        {responsibleLabel && (
                            <div className="detail-row flex justify-between mb-1">
                                <span className="detail-label text-text-muted">{t('assets.handoverDepartment')}:</span>
                                <span>{responsibleLabel}</span>
                            </div>
                        )}
                        {payload && (
                            <div className="detail-row flex justify-between mb-1 gap-2 items-start">
                                <span className="detail-label text-text-muted">{t('printableLabel.internalPayload')}:</span>
                                <span className="text-right break-all max-w-[60%]">{payload}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>
                    {t('common.cancel')}
                </Button>
                <Button onClick={handlePrint} loading={Boolean(printableQrValue) && !qrImageUrl}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {t('common.print')}
                </Button>
            </div>
        </div>
    );
};

export default PrintableAssetLabel;
