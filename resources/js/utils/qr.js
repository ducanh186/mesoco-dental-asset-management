import QRCode from 'qrcode';

export const getQrPayload = (asset) => asset?.qr?.payload || asset?.qr_code || '';

export const getQrPortalUrl = (asset) => asset?.qr?.portal_url || '';

export const getPrintableQrValue = (asset) => getQrPortalUrl(asset) || getQrPayload(asset);

export const buildQrDataUrl = async (value, options = {}) => {
    if (!value) {
        return '';
    }

    return QRCode.toDataURL(value, {
        width: options.width ?? 220,
        margin: options.margin ?? 1,
        errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
        color: {
            dark: options.darkColor ?? '#0f2742',
            light: options.lightColor ?? '#FFFFFF',
        },
    });
};