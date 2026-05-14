import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, CardBody, StatusBadge, useToast } from '../components/ui';
import { handleApiError, qrApi } from '../services/api';

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'Chưa có';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(value));
};

const formatDate = (value) => {
    if (!value) {
        return 'Chưa có';
    }

    return new Date(value).toLocaleDateString('vi-VN');
};

const roleLabel = (role) => {
    switch (role) {
        case 'manager':
            return 'Quản lý';
        case 'technician':
            return 'Kỹ thuật viên';
        case 'employee':
            return 'Nhân viên';
        default:
            return 'Công khai';
    }
};

const actionLabels = {
    view_basic: 'Xem thông tin cơ bản',
    report_issue: 'Báo sự cố',
    view_technical: 'Xem thông tin kỹ thuật',
    open_maintenance: 'Mở bảo trì',
    inventory_check: 'Kiểm kê',
    view_supplier: 'Xem nhà cung cấp',
    regenerate_qr: 'Tạo lại QR',
    review_disposal: 'Duyệt thu hủy',
};

const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 py-2 last:border-b-0">
        <span className="text-xs font-semibold uppercase text-text-muted">{label}</span>
        <span className="max-w-[60%] break-words text-right text-sm font-medium text-text">{value || 'Chưa có'}</span>
    </div>
);

const QrScanPage = () => {
    const toast = useToast();
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanTimerRef = useRef(null);
    const [payload, setPayload] = useState('');
    const [result, setResult] = useState(null);
    const [resolving, setResolving] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraMessage, setCameraMessage] = useState('');

    const stopCamera = () => {
        if (scanTimerRef.current) {
            window.clearInterval(scanTimerRef.current);
            scanTimerRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        setCameraActive(false);
    };

    useEffect(() => stopCamera, []);

    const resolvePayload = async (nextPayload = payload) => {
        const normalizedPayload = nextPayload.trim();

        if (!normalizedPayload) {
            toast.warning('Vui lòng nhập hoặc quét mã QR trước.', { title: 'Thiếu mã QR' });
            return;
        }

        setResolving(true);
        try {
            const data = await qrApi.resolve(normalizedPayload);
            setResult(data);
            setPayload(normalizedPayload);
            toast.success('Đã đọc mã và hiển thị dữ liệu theo quyền của bạn.', { title: 'Quét QR thành công' });
        } catch (error) {
            setResult(null);
            handleApiError(error, toast);
        } finally {
            setResolving(false);
        }
    };

    const startCamera = async () => {
        setCameraMessage('');

        if (!navigator.mediaDevices?.getUserMedia || !window.BarcodeDetector) {
            setCameraMessage('Trình duyệt chưa hỗ trợ quét camera ổn định. Hãy paste payload QR vào ô bên dưới để kiểm thử.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false,
            });
            const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setCameraActive(true);
            scanTimerRef.current = window.setInterval(async () => {
                if (!videoRef.current) {
                    return;
                }

                try {
                    const codes = await detector.detect(videoRef.current);
                    const rawValue = codes?.[0]?.rawValue;

                    if (rawValue) {
                        stopCamera();
                        await resolvePayload(rawValue);
                    }
                } catch (error) {
                    setCameraMessage('Không đọc được QR từ camera. Bạn vẫn có thể dùng ô nhập payload.');
                }
            }, 800);
        } catch (error) {
            stopCamera();
            setCameraMessage('Không mở được camera. Vui lòng cấp quyền camera hoặc dùng fallback nhập/paste payload.');
        }
    };

    const asset = result?.asset;
    const technical = asset?.technical;
    const supplier = asset?.supplier;
    const role = asset?.visibility?.role;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-text">Quét QR thiết bị</h2>
                </div>
                {role && <Badge variant="primary">Đang xem như: {roleLabel(role)}</Badge>}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
                <Card>
                    <CardBody className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-text">Camera scan</h3>
                            <p className="mt-1 text-sm text-text-muted">
                                Nếu browser hỗ trợ BarcodeDetector, bạn có thể quét trực tiếp. Fallback nhập payload luôn dùng được cho demo.
                            </p>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-border bg-background">
                            <video ref={videoRef} className="h-56 w-full object-cover" muted playsInline />
                        </div>

                        {cameraMessage && (
                            <div className="rounded-lg border border-warning bg-warning/10 px-3 py-2 text-sm text-text">
                                {cameraMessage}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button onClick={startCamera} disabled={cameraActive || resolving}>
                                {cameraActive ? 'Đang quét...' : 'Mở camera'}
                            </Button>
                            <Button variant="outline" onClick={stopCamera} disabled={!cameraActive}>
                                Dừng camera
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text" htmlFor="qr_payload">Payload QR</label>
                            <textarea
                                id="qr_payload"
                                className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={payload}
                                onChange={(event) => setPayload(event.target.value)}
                                placeholder="MESOCO|ASSET|v1|xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx hoặc https://host/asset-portal/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                            />
                        </div>

                        <Button fullWidth onClick={() => resolvePayload()} loading={resolving}>
                            Resolve QR
                        </Button>
                    </CardBody>
                </Card>

                <div className="space-y-6">
                    {!asset ? (
                        <Card>
                            <CardBody className="py-14 text-center">
                                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                        <path d="M14 14h3v3h-3zM17 17h4v4h-4z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-text">Chưa có dữ liệu QR</h3>
                                <p className="mt-1 text-sm text-text-muted">Quét camera hoặc paste payload để xem thông tin thiết bị.</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <>
                            <Card>
                                <CardBody className="space-y-3">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-text">{asset.name}</h3>
                                            <p className="font-mono text-sm text-text-muted">{asset.asset_code}</p>
                                        </div>
                                        <StatusBadge status={asset.status} />
                                    </div>
                                    <InfoRow label="Serial" value={asset.serial_number} />
                                    <InfoRow label="Model" value={asset.model} />
                                    <InfoRow label="Cấu hình" value={asset.configuration} />
                                    <InfoRow label="Danh mục" value={asset.category_name || asset.category} />
                                    <InfoRow label="Vị trí" value={asset.location_name} />
                                    <InfoRow label="Người đang sở hữu" value={asset.responsible_employee?.full_name || asset.current_user} />
                                    <InfoRow label="Bảo hành" value={asset.warranty_status?.label} />
                                    <InfoRow label="Ngày hết bảo hành" value={formatDate(asset.warranty_expiry)} />
                                </CardBody>
                            </Card>

                            {technical && (
                                <Card>
                                    <CardBody className="space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-text">Thông tin kỹ thuật</h3>
                                            <p className="text-sm text-text-muted">Dữ liệu dành cho kỹ thuật viên và quản lý.</p>
                                        </div>
                                        <InfoRow label="Trạng thái thiết bị" value={technical.device_status} />
                                        <InfoRow label="Lần bảo trì cuối" value={formatDate(technical.last_maintenance_date)} />
                                        <InfoRow label="Lỗi gần nhất" value={technical.last_issue_note} />
                                        <InfoRow label="Xử lý gần nhất" value={technical.last_action_taken} />
                                        <InfoRow label="Mức khấu hao" value={technical.current_depreciation_rate !== null ? `${technical.current_depreciation_rate}%` : null} />
                                        <InfoRow label="Giá trị còn lại" value={formatCurrency(technical.remaining_value)} />
                                        <div className="pt-2">
                                            <div className="mb-2 text-xs font-semibold uppercase text-text-muted">Nhật ký sửa chữa</div>
                                            {technical.repair_logs?.length ? (
                                                <div className="space-y-2">
                                                    {technical.repair_logs.slice(0, 4).map((log) => (
                                                        <div key={log.id} className="rounded-lg border border-border bg-background px-3 py-2">
                                                            <div className="text-sm font-medium text-text">{log.issue_description || 'Không ghi lỗi'}</div>
                                                            <div className="text-xs text-text-muted">{log.action_taken || 'Chưa ghi hành động'} · {formatDate(log.completed_at || log.logged_at)}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-text-muted">Chưa có nhật ký sửa chữa.</p>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {supplier && (
                                <Card>
                                    <CardBody className="space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-text">Thông tin nhà cung cấp</h3>
                                            <p className="text-sm text-text-muted">Chỉ quản lý được xem phần tài chính và nguồn gốc.</p>
                                        </div>
                                        <InfoRow label="Nhà cung cấp" value={supplier.name} />
                                        <InfoRow label="Liên hệ" value={supplier.contact_person || supplier.phone || supplier.email} />
                                        <InfoRow label="Ngày mua" value={formatDate(asset.purchase_date)} />
                                        <InfoRow label="Giá mua" value={formatCurrency(asset.purchase_price)} />
                                    </CardBody>
                                </Card>
                            )}

                            <Card>
                                <CardBody>
                                    <div className="mb-3 text-xs font-semibold uppercase text-text-muted">Hành động khả dụng</div>
                                    <div className="flex flex-wrap gap-2">
                                        {(asset.available_actions || []).map((action) => (
                                            <Badge key={action} variant="info" outline>{actionLabels[action] || action}</Badge>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QrScanPage;
