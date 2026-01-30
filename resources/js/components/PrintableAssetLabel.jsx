import React, { useEffect, useRef } from 'react';
import { Button, Card, CardBody } from './ui';

/**
 * PrintableAssetLabel - Generates a printable asset label with QR code
 * 
 * Uses the browser's native print functionality.
 * QR code is generated using a simple SVG-based approach without external libs.
 */
const PrintableAssetLabel = ({ asset, onClose }) => {
    const printRef = useRef(null);

    // Generate QR code as a data URI using Google Charts API (lightweight fallback)
    // For production, consider using a local QR library
    const getQrCodeUrl = (payload) => {
        if (!payload) return null;
        const encoded = encodeURIComponent(payload);
        // Using a simple QR code generator API
        return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encoded}`;
    };

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the label');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Asset Label - ${asset.asset_code || 'N/A'}</title>
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
                        letter-spacing: 1px;
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
                    .qr-container {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 8px;
                    }
                    .qr-container img {
                        width: 100px;
                        height: 100px;
                    }
                    .scan-instruction {
                        font-size: 8px;
                        text-align: center;
                        color: #999;
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
                        // Wait for QR image to load
                        const img = document.querySelector('.qr-container img');
                        if (img && !img.complete) {
                            img.onload = function() {
                                window.print();
                                window.close();
                            };
                            img.onerror = function() {
                                window.print();
                                window.close();
                            };
                        } else {
                            window.print();
                            window.close();
                        }
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const qrPayload = asset.qr_payload || `MESOCO|ASSET|v1|${asset.id}`;
    const qrUrl = getQrCodeUrl(qrPayload);

    return (
        <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
                <div ref={printRef} className="label-container w-[3in] p-4 border-2 border-border rounded-lg bg-white">
                    <div className="company-name text-xs uppercase tracking-wider text-text-muted text-center mb-2">
                        MESOCO Dental
                    </div>
                    <div className="asset-code text-xl font-bold text-center mb-1 font-mono">
                        {asset.asset_code || 'N/A'}
                    </div>
                    <div className="asset-name text-sm text-center mb-3 text-text-muted">
                        {asset.name || 'Unnamed Asset'}
                    </div>
                    <div className="qr-container flex justify-center mb-2">
                        {qrUrl ? (
                            <img 
                                src={qrUrl} 
                                alt="QR Code" 
                                className="w-24 h-24"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-24 h-24 bg-surface-muted flex items-center justify-center text-text-light text-xs">
                                No QR
                            </div>
                        )}
                    </div>
                    <div className="scan-instruction text-[8px] text-center text-text-light">
                        Scan QR code to view asset details
                    </div>
                    <div className="asset-details mt-2 pt-2 border-t border-dashed border-border text-[9px]">
                        {asset.category && (
                            <div className="detail-row flex justify-between mb-1">
                                <span className="detail-label text-text-muted">Category:</span>
                                <span>{asset.category}</span>
                            </div>
                        )}
                        {asset.location && (
                            <div className="detail-row flex justify-between mb-1">
                                <span className="detail-label text-text-muted">Location:</span>
                                <span>{asset.location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handlePrint}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Label
                </Button>
            </div>
        </div>
    );
};

export default PrintableAssetLabel;
