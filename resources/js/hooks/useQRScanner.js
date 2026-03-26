import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * QR Payload validation utilities
 */
const QR_PREFIX = 'MESOCO';
const QR_TYPE = 'ASSET';
const SUPPORTED_VERSION = 'v1';

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse and validate QR payload before calling API
 * @param {string} raw - Raw QR payload
 * @returns {{ valid: boolean, error?: string, data?: object }}
 */
export function parseQRPayload(raw) {
    if (!raw || typeof raw !== 'string') {
        return { valid: false, error: 'invalidFormat' };
    }

    const trimmed = raw.trim();
    const parts = trimmed.split('|');

    // Must have exactly 4 parts
    if (parts.length !== 4) {
        return { valid: false, error: 'invalidFormat' };
    }

    const [prefix, type, version, uuid] = parts;

    // Validate prefix
    if (prefix !== QR_PREFIX) {
        return { valid: false, error: 'invalidFormat' };
    }

    // Validate type
    if (type !== QR_TYPE) {
        return { valid: false, error: 'invalidFormat' };
    }

    // Validate version - return specific error for unsupported versions
    if (version !== SUPPORTED_VERSION) {
        return { valid: false, error: 'unsupportedVersion', version };
    }

    // Validate UUID format
    if (!UUID_REGEX.test(uuid)) {
        return { valid: false, error: 'invalidFormat' };
    }

    return {
        valid: true,
        data: {
            prefix,
            type,
            version,
            uuid,
            payload: trimmed
        }
    };
}

/**
 * useQRScanner Hook
 * Manages html5-qrcode camera lifecycle and scanning state
 * 
 * @param {object} options
 * @param {function} options.onScan - Callback when QR code is scanned (receives raw payload)
 * @param {function} options.onError - Callback for scanner errors
 * @param {number} options.cooldownMs - Cooldown between scans (default: 2000ms)
 */
export function useQRScanner({ onScan, onError, cooldownMs = 2000 } = {}) {
    const [isScanning, setIsScanning] = useState(false);
    const [hasCamera, setHasCamera] = useState(null); // null = unknown, true/false = checked
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [lastScanTime, setLastScanTime] = useState(0);
    
    const scannerRef = useRef(null);
    const scannerContainerId = useRef(`qr-scanner-${Date.now()}`);
    const isMountedRef = useRef(true);

    // Check if camera is available
    useEffect(() => {
        const checkCamera = async () => {
            try {
                const devices = await navigator.mediaDevices?.enumerateDevices();
                const videoDevices = devices?.filter(d => d.kind === 'videoinput') || [];
                if (isMountedRef.current) {
                    setHasCamera(videoDevices.length > 0);
                }
            } catch {
                if (isMountedRef.current) {
                    setHasCamera(false);
                }
            }
        };
        checkCamera();
        
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Start camera scanning
    const startScanning = useCallback(async () => {
        if (isScanning || scannerRef.current) return;

        try {
            // Dynamically import html5-qrcode to avoid SSR issues
            const { Html5Qrcode } = await import('html5-qrcode');
            
            const scanner = new Html5Qrcode(scannerContainerId.current);
            scannerRef.current = scanner;

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
            };

            await scanner.start(
                { facingMode: 'environment' }, // Prefer back camera
                config,
                (decodedText) => {
                    // Cooldown check
                    const now = Date.now();
                    if (now - lastScanTime < cooldownMs) {
                        return;
                    }
                    setLastScanTime(now);
                    
                    if (onScan && isMountedRef.current) {
                        onScan(decodedText);
                    }
                },
                () => {
                    // QR code not detected in frame - ignore
                }
            );

            if (isMountedRef.current) {
                setIsScanning(true);
                setPermissionDenied(false);
            }
        } catch (err) {
            console.error('QR Scanner start failed:', err);
            
            if (isMountedRef.current) {
                // Check if it's a permission error
                if (err.name === 'NotAllowedError' || 
                    err.message?.includes('Permission') ||
                    err.message?.includes('denied')) {
                    setPermissionDenied(true);
                }
                
                if (onError) {
                    onError(err.name === 'NotAllowedError' ? 'permissionDenied' : 'startFailed', err);
                }
            }
            
            // Clean up failed scanner
            if (scannerRef.current) {
                try {
                    await scannerRef.current.clear();
                } catch {}
                scannerRef.current = null;
            }
        }
    }, [isScanning, onScan, onError, cooldownMs, lastScanTime]);

    // Stop camera scanning
    const stopScanning = useCallback(async () => {
        if (!scannerRef.current) return;

        try {
            const scanner = scannerRef.current;
            const state = scanner.getState();
            
            if (state === 2) { // Html5QrcodeScannerState.SCANNING
                await scanner.stop();
            }
            await scanner.clear();
        } catch (err) {
            console.error('QR Scanner stop error:', err);
        } finally {
            scannerRef.current = null;
            if (isMountedRef.current) {
                setIsScanning(false);
            }
        }
    }, []);

    // Toggle scanning
    const toggleScanning = useCallback(async () => {
        if (isScanning) {
            await stopScanning();
        } else {
            await startScanning();
        }
    }, [isScanning, startScanning, stopScanning]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().then(() => {
                        scannerRef.current?.clear();
                    }).catch(() => {});
                } catch {}
            }
        };
    }, []);

    return {
        isScanning,
        hasCamera,
        permissionDenied,
        containerId: scannerContainerId.current,
        startScanning,
        stopScanning,
        toggleScanning,
    };
}

export default useQRScanner;
