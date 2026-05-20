import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Button,
    Card,
    CardBody,
    Badge,
    ConfirmModal,
    Input,
    Modal,
    Select,
    StatusBadge,
    Table,
    TablePagination,
    useToast,
} from '../components/ui';
import { assetsApi, employeesApi, handleApiError, locationsApi, suppliersApi } from '../services/api';
import { buildQrDataUrl, getPrintableQrValue, getQrPayload, getQrPortalUrl } from '../utils/qr';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const AssetsPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const querySearch = searchParams.get('q') || '';

    const [assets, setAssets] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [locations, setLocations] = useState([]);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [summary, setSummary] = useState({
        total: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
    });
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(querySearch);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedAsset, setSelectedAsset] = useState(null);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [handoverModalOpen, setHandoverModalOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [confirmUnassignOpen, setConfirmUnassignOpen] = useState(false);
    const [returnCondition, setReturnCondition] = useState('');

    const [createLoading, setCreateLoading] = useState(false);
    const [handoverLoading, setHandoverLoading] = useState(false);
    const [qrLoading, setQrLoading] = useState(false);
    const [detailQrImageUrl, setDetailQrImageUrl] = useState('');
    const [createErrors, setCreateErrors] = useState({});

    const [createForm, setCreateForm] = useState({
        asset_code: '',
        serial_number: '',
        name: '',
        model: '',
        qr_code: '',
        configuration: '',
        type: 'equipment',
        category: '',
        location_id: '',
        status: 'active',
        supplier_id: '',
        purchase_date: '',
        purchase_price: '',
        current_depreciation_rate: '',
        useful_life_months: '',
        warranty_expiry: '',
        notes: '',
    });

    const [handoverTarget, setHandoverTarget] = useState('');

    const deviceCategories = [
        { value: '', label: 'Tất cả' },
        { value: 'PC', label: 'PC' },
        { value: 'Màn hình', label: 'Màn hình' },
        { value: 'Thiết bị Test', label: 'Thiết bị Test' },
        { value: 'Phụ kiện dùng', label: 'Phụ kiện dùng' },
        { value: 'Linh kiện thay thế', label: 'Linh kiện thay thế' },
    ];

    const assetStatuses = [
        { value: '', label: 'Tất cả' },
        { value: 'available', label: 'Sẵn sàng' },
        { value: 'assigned', label: 'Đã bàn giao' },
        { value: 'maintenance', label: 'Đang bảo trì' },
        { value: 'inventorying', label: 'Đang kiểm kê' },
        { value: 'retired', label: 'Đã thu hủy' },
    ];

    useEffect(() => {
        if (location.hash === '#handover') {
            navigate('/handover', { replace: true });
        }
    }, [location.hash, navigate]);

    useEffect(() => {
        fetchAssets();
    }, [currentPage, searchQuery, categoryFilter, statusFilter, locationFilter]);

    useEffect(() => {
        if (querySearch === searchQuery) {
            return;
        }

        setSearchQuery(querySearch);
        setCurrentPage(1);
    }, [querySearch, searchQuery]);

    useEffect(() => {
        fetchSuppliers();
        fetchEmployees();
        fetchLocations();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const printableQrValue = getPrintableQrValue(selectedAsset);

        if (!detailDrawerOpen || !printableQrValue) {
            setDetailQrImageUrl('');
            return () => {
                cancelled = true;
            };
        }

        setDetailQrImageUrl('');
        buildQrDataUrl(printableQrValue, { width: 260 })
            .then((dataUrl) => {
                if (!cancelled) {
                    setDetailQrImageUrl(dataUrl);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setDetailQrImageUrl('');
                }
            });

        return () => {
            cancelled = true;
        };
    }, [
        detailDrawerOpen,
        selectedAsset?.id,
        selectedAsset?.qr?.uid,
        selectedAsset?.qr?.portal_url,
        selectedAsset?.qr?.payload,
        selectedAsset?.qr_code,
    ]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const response = await assetsApi.list({
                page: currentPage,
                search: searchQuery || undefined,
                category: categoryFilter || undefined,
                status: statusFilter === 'available' ? 'active' : (statusFilter === 'assigned' ? undefined : statusFilter || undefined),
                assigned: statusFilter === 'assigned' ? true : (statusFilter === 'available' ? false : undefined),
                location: locationFilter || undefined,
            });

            setAssets(response.assets || []);
            setPagination(response.pagination || { current_page: 1, last_page: 1, total: 0 });
            setSummary(response.summary || {
                total: 0,
                available: 0,
                assigned: 0,
                maintenance: 0,
            });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value) => {
        setSearchQuery(value);
        setCurrentPage(1);
        setSearchParams((currentParams) => {
            const nextParams = new URLSearchParams(currentParams);

            if (value.trim()) {
                nextParams.set('q', value.trim());
            } else {
                nextParams.delete('q');
            }

            return nextParams;
        });
    };

    const fetchSuppliers = async () => {
        try {
            const response = await suppliersApi.dropdown();
            setSuppliers(response.data || []);
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await employeesApi.list({ per_page: 100, status: 'active' });
            setEmployees(response.employees || []);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await locationsApi.dropdown();
            setLocations(response.data || []);
        } catch (error) {
            console.error('Failed to fetch locations', error);
        }
    };

    const getDeviceCategoryLabel = (category) => deviceCategories.find((option) => option.value === category)?.label || category || 'Chưa gắn danh mục';
    const getResponsibleEmployee = (asset) => asset.responsible_employee?.full_name || asset.current_assignment?.assignment_target?.name || 'Chưa có';
    const getDepartmentLabel = (asset) => asset.responsible_employee?.department || 'Chưa bàn giao';
    const getOperationalStatus = (asset) => {
        if (asset?.is_assigned && asset?.status === 'active') {
            return 'assigned';
        }

        return asset?.status;
    };
    const getLocationLabel = (asset) => {
        if (asset.location?.code && asset.location?.name) {
            return `${asset.location.id} - ${asset.location.name}`;
        }
        return asset.location_name || 'Chưa chọn';
    };

    const buildHandoverValue = (employee) => {
        if (employee?.user?.id) {
            return `staff:${employee.user.id}`;
        }

        if (employee?.id) {
            return `employee:${employee.id}`;
        }

        return '';
    };

    const parseHandoverValue = (value) => {
        if (!value) {
            return null;
        }

        const [targetType, rawId] = value.split(':');
        const id = Number(rawId);

        if (!targetType || !Number.isFinite(id)) {
            return null;
        }

        return { targetType, id };
    };

    const locationOptions = [
        { value: '', label: 'Tất cả' },
        ...locations.map((location) => ({
            value: String(location.id),
            label: `${location.id} - ${location.name}`,
        })),
    ];

    const activeFilterTags = [
        searchQuery ? `Tìm kiếm: ${searchQuery}` : null,
        categoryFilter ? `Danh mục: ${getDeviceCategoryLabel(categoryFilter)}` : null,
        statusFilter ? `Trạng thái: ${assetStatuses.find((option) => option.value === statusFilter)?.label}` : null,
        locationFilter ? `Vị trí: ${locationOptions.find((option) => option.value === locationFilter)?.label}` : null,
    ].filter(Boolean);

    const normalizeAssetPayload = (form) => ({
        ...form,
        category: form.category || null,
        location_id: form.location_id ? Number(form.location_id) : null,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        purchase_date: form.purchase_date || null,
        purchase_price: form.purchase_price === '' ? null : Number(form.purchase_price),
        current_depreciation_rate: form.current_depreciation_rate === '' ? null : Number(form.current_depreciation_rate),
        useful_life_months: form.useful_life_months === '' ? null : Number(form.useful_life_months),
        warranty_expiry: form.warranty_expiry || null,
    });

    const handleViewAsset = async (asset) => {
        try {
            const response = await assetsApi.get(asset.id);
            setSelectedAsset(response.asset);
            setDetailDrawerOpen(true);
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleCreateAsset = async (event) => {
        event.preventDefault();
        setCreateLoading(true);
        setCreateErrors({});

        try {
            const response = await assetsApi.create(normalizeAssetPayload(createForm));
            toast.success('Đã tạo thiết bị.');
            setCreateModalOpen(false);
            setCreateForm({
                asset_code: '',
                serial_number: '',
                name: '',
                model: '',
                qr_code: '',
                configuration: '',
                type: 'equipment',
                category: '',
                location_id: '',
                status: 'active',
                supplier_id: '',
                purchase_date: '',
                purchase_price: '',
                current_depreciation_rate: '',
                useful_life_months: '',
                warranty_expiry: '',
                notes: '',
            });
            fetchAssets();
            setSelectedAsset(response.asset);
            setDetailDrawerOpen(true);
        } catch (error) {
            if (error.response?.status === 422) {
                setCreateErrors(error.response.data.errors || {});
            }
            handleApiError(error, toast);
        } finally {
            setCreateLoading(false);
        }
    };

    const openHandoverModal = (asset = selectedAsset) => {
        const targetAsset = asset || selectedAsset;

        if (!targetAsset) {
            return;
        }

        setSelectedAsset(targetAsset);
        setHandoverTarget(buildHandoverValue(targetAsset.responsible_employee));
        setHandoverModalOpen(true);
    };

    const resetFilters = () => {
        setSearchQuery('');
        setCategoryFilter('');
        setStatusFilter('');
        setLocationFilter('');
        setCurrentPage(1);
        setSearchParams(new URLSearchParams());
    };

    const openMaintenanceWorkspace = (asset) => {
        toast.info(`Mở workspace bảo trì để tạo phiếu cho ${asset.name}.`);
        navigate('/maintenance');
    };

    const copyText = async (text) => {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    };

    const handleCopyQrPayload = async () => {
        const payload = getQrPayload(selectedAsset);

        if (!payload) {
            toast.warning('Thiết bị chưa có payload QR để sao chép.', { title: 'Chưa có QR' });
            return;
        }

        try {
            await copyText(payload);
            toast.success('Payload QR đã được sao chép.', { title: 'Đã sao chép QR' });
        } catch (error) {
            toast.error('Không thể sao chép QR. Vui lòng thử lại.');
        }
    };

    const handleRegenerateQr = async () => {
        if (!selectedAsset) {
            return;
        }

        setQrLoading(true);
        try {
            const response = await assetsApi.regenerateQr(selectedAsset.id);
            setSelectedAsset(response.asset);
            fetchAssets();
            toast.success('Mã QR mới đã sẵn sàng để in hoặc quét.', { title: 'Đã tạo lại QR' });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setQrLoading(false);
        }
    };

    const openQrPortal = () => {
        const portalUrl = getQrPortalUrl(selectedAsset);

        if (!portalUrl) {
            toast.warning('Thiết bị chưa có portal URL. Hãy tạo lại QR trước.', { title: 'Chưa có portal' });
            return;
        }

        window.open(portalUrl, '_blank', 'noopener,noreferrer');
    };

    const buildQrLabelMarkup = async (asset) => {
        const payload = getQrPayload(asset);
        const portalUrl = getQrPortalUrl(asset);
        const printableQrValue = getPrintableQrValue(asset);
        const qrImageUrl = printableQrValue ? await buildQrDataUrl(printableQrValue, { width: 240 }) : '';
        const assetCode = escapeHtml(asset.asset_code);
        const assetName = escapeHtml(asset.name || 'Asset');
        const safePayload = escapeHtml(payload || 'Chưa có payload QR');
        const safePortalUrl = escapeHtml(portalUrl || 'Tạo lại QR để có portal URL');
        const qrMarkup = qrImageUrl
            ? `<img class="qr" src="${qrImageUrl}" alt="Equipment QR" />`
            : '<div class="qr-placeholder">Tạo lại QR để in nhãn</div>';

        return `<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Mesoco QR Label - ${assetCode}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 24px; color: #0f2742; }
        .label { width: 360px; border: 2px solid #1b5f9e; border-radius: 12px; padding: 18px; }
        .brand { color: #1b5f9e; font-size: 28px; font-weight: 800; letter-spacing: 0; }
        .accent { color: #f5822a; }
        .qr-wrap { margin-top: 16px; display: flex; justify-content: center; }
        .qr { width: 220px; height: 220px; object-fit: contain; }
        .qr-placeholder { width: 220px; height: 220px; display: flex; align-items: center; justify-content: center; border: 1px dashed #88a8c6; border-radius: 12px; font-size: 12px; color: #486177; text-align: center; padding: 16px; }
        .asset { margin-top: 12px; font-size: 18px; font-weight: 700; }
        .code { margin-top: 4px; font-family: monospace; font-size: 13px; color: #486177; }
        .hint { margin-top: 12px; font-size: 12px; color: #486177; }
        .portal { margin-top: 8px; font-size: 11px; color: #486177; overflow-wrap: anywhere; }
        .payload-label { margin-top: 16px; font-size: 11px; font-weight: 700; color: #486177; text-transform: uppercase; }
        .payload { margin-top: 6px; padding: 12px; border: 1px dashed #88a8c6; border-radius: 8px; font-family: monospace; font-size: 11px; overflow-wrap: anywhere; }
        @media print { body { margin: 0; } .label { margin: 0; } }
    </style>
</head>
<body>
    <div class="label">
        <div class="brand">MES<span class="accent">O</span>CO</div>
        <div class="qr-wrap">${qrMarkup}</div>
        <div class="asset">${assetName}</div>
        <div class="code">${assetCode}</div>
        <div class="hint">Quét bằng camera để mở portal thiết bị</div>
        <div class="portal">${safePortalUrl}</div>
        <div class="payload-label">Payload nội bộ</div>
        <div class="payload">${safePayload}</div>
    </div>
</body>
</html>`;
    };

    const printQrLabel = async () => {
        if (!selectedAsset) {
            return;
        }

        const printWindow = window.open('', '_blank', 'width=520,height=620');
        if (!printWindow) {
            toast.warning('Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup.');
            return;
        }

        printWindow.document.write('<!doctype html><html><body style="font-family: Arial, sans-serif; padding: 24px;">Đang tạo nhãn QR...</body></html>');
        printWindow.document.close();

        try {
            const markup = await buildQrLabelMarkup(selectedAsset);
            printWindow.document.open();
            printWindow.document.write(markup);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } catch (error) {
            printWindow.close();
            toast.error('Không thể tạo nhãn QR để in. Vui lòng thử lại.');
        }
    };

    const downloadQrLabel = async () => {
        if (!selectedAsset) {
            return;
        }

        try {
            const markup = await buildQrLabelMarkup(selectedAsset);
            const blob = new Blob([markup], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `${selectedAsset.asset_code || 'mesoco-asset'}-qr-label.html`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
            toast.success('Đã tải nhãn QR dạng HTML.', { title: 'Tải xuống thành công' });
        } catch (error) {
            toast.error('Không thể tạo nhãn QR để tải xuống. Vui lòng thử lại.');
        }
    };

    const handleHandoverAsset = async () => {
        const handoverSelection = parseHandoverValue(handoverTarget);

        if (!selectedAsset || !handoverSelection) {
            toast.error('Vui lòng chọn người nhận thiết bị.');
            return;
        }

        setHandoverLoading(true);
        try {
            await assetsApi.assign(
                selectedAsset.id,
                handoverSelection.targetType === 'staff'
                    ? { staff_id: handoverSelection.id }
                    : { employee_id: handoverSelection.id },
            );
            toast.success('Đã gán người phụ trách.');
            setHandoverModalOpen(false);
            setHandoverTarget('');

            const updated = await assetsApi.get(selectedAsset.id);
            setSelectedAsset(updated.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setHandoverLoading(false);
        }
    };

    const handleUnassignAsset = async () => {
        if (!selectedAsset) {
            return;
        }

        try {
            if (!returnCondition.trim()) {
                toast.error('Vui lòng nhập tình trạng thiết bị khi thu hồi.');
                return;
            }

            await assetsApi.unassign(selectedAsset.id, {
                return_condition: returnCondition.trim(),
            });
            toast.success('Đã bỏ nhân viên chịu trách nhiệm.');
            setConfirmUnassignOpen(false);
            setReturnCondition('');
            const updated = await assetsApi.get(selectedAsset.id);
            setSelectedAsset(updated.asset);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDeleteAsset = async () => {
        if (!selectedAsset) {
            return;
        }

        try {
            await assetsApi.delete(selectedAsset.id);
            toast.success('Đã xóa thiết bị.');
            setConfirmDeleteOpen(false);
            setDetailDrawerOpen(false);
            setSelectedAsset(null);
            fetchAssets();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const columns = [
        {
            key: 'asset_code',
            label: 'Mã thiết bị',
            width: '140px',
            render: (value) => <span className="font-mono text-sm font-semibold text-text">{value}</span>,
        },
        {
            key: 'name',
            label: 'Thiết bị',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted">{row.category || 'Chưa gắn danh mục'} · {getDepartmentLabel(row)}</div>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Danh mục thiết bị',
            width: '120px',
            render: (value) => <span className="text-sm text-text-muted">{getDeviceCategoryLabel(value)}</span>,
        },
        {
            key: 'current_assignment',
            label: 'Nhân viên chịu trách nhiệm',
            render: (_, row) => (
                <div>
                    <div className="font-medium text-text">{getResponsibleEmployee(row)}</div>
                    <div className="text-xs text-text-muted">
                        {row.current_assignment?.assigned_at
                            ? `Từ ${new Date(row.current_assignment.assigned_at).toLocaleDateString('vi-VN')}`
                            : 'Chưa có người phụ trách'}
                    </div>
                </div>
            ),
        },
        {
            key: 'location',
            label: 'Vị trí',
            render: (_, row) => <span className="text-sm text-text-muted">{getLocationLabel(row)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            width: '140px',
            render: (_, row) => <StatusBadge status={getOperationalStatus(row)} />,
        },
        {
            key: 'actions',
            label: '',
            width: '176px',
            align: 'right',
            render: (_, row) => (
                <div className="flex justify-end gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            handleViewAsset(row);
                        }}
                        title="Xem chi tiết"
                    >
                        Chi tiết
                    </button>
                    <button
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (row.is_assigned) {
                                setSelectedAsset(row);
                                setConfirmUnassignOpen(true);
                                return;
                            }
                            openHandoverModal(row);
                        }}
                        title={row.is_assigned ? 'Bỏ người phụ trách' : 'Gán người phụ trách'}
                    >
                        {row.is_assigned ? 'Thu hồi' : 'Bàn giao'}
                    </button>
                    <button
                        className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                        onClick={(event) => {
                            event.stopPropagation();
                            openMaintenanceWorkspace(row);
                        }}
                        title="Mở workspace bảo trì"
                    >
                        Bảo trì
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-text">Danh mục thiết bị</h2>
                    <p className="text-sm text-text-muted">Tra cứu nhanh thiết bị theo danh mục, trạng thái thiết bị và vị trí.</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)}>
                    + Tạo thiết bị
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Thiết bị sẵn sàng</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.available}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Đã bàn giao</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.assigned}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Đang bảo trì</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.maintenance}</div>
                </Card>
            </div>

            <Card>
                <CardBody className="py-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <div className="xl:col-span-2">
                            <Input
                                placeholder="Tìm theo mã, serial, QR, model hoặc vị trí"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                helper="Tìm theo mã thiết bị, serial, QR, model và vị trí"
                            />
                        </div>
                        <Select
                            options={deviceCategories}
                            value={categoryFilter}
                            placeholder=""
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            options={assetStatuses}
                            value={statusFilter}
                            placeholder=""
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Select
                            options={locationOptions}
                            value={locationFilter}
                            placeholder=""
                            onChange={(e) => {
                                setLocationFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                        <Button variant="outline" onClick={resetFilters}>
                            Xóa bộ lọc
                        </Button>
                    </div>

                    {activeFilterTags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activeFilterTags.map((tag) => (
                                <span key={tag} className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-text-muted">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    data={assets}
                    loading={loading}
                    emptyMessage="Chưa có thiết bị phù hợp"
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

            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="Tạo thiết bị"
                size="md"
            >
                <form onSubmit={handleCreateAsset} className="space-y-4">
                    <Input
                        label="Mã thiết bị (không bắt buộc)"
                        value={createForm.asset_code}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, asset_code: e.target.value }))}
                        error={createErrors.asset_code?.[0]}
                    />
                    <Input
                        label="Serial number"
                        value={createForm.serial_number}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, serial_number: e.target.value }))}
                        error={createErrors.serial_number?.[0]}
                    />
                    <Input
                        label="Tên thiết bị *"
                        value={createForm.name}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                        error={createErrors.name?.[0]}
                        required
                    />
                    <Input
                        label="Model"
                        value={createForm.model}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, model: e.target.value }))}
                        error={createErrors.model?.[0]}
                    />
                    <Input
                        label="QR code"
                        value={createForm.qr_code}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, qr_code: e.target.value }))}
                        error={createErrors.qr_code?.[0]}
                    />
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-text">Configuration</label>
                        <textarea
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text outline-none transition-colors focus:border-primary min-h-[88px]"
                            value={createForm.configuration}
                            onChange={(e) => setCreateForm((prev) => ({ ...prev, configuration: e.target.value }))}
                            placeholder="VD: Intel Core Ultra 7 / 32GB RAM / 1TB SSD"
                        />
                        {createErrors.configuration?.[0] && (
                            <p className="mt-1 text-xs text-error">{createErrors.configuration[0]}</p>
                        )}
                    </div>
                    <Select
                        label="Danh mục thiết bị *"
                        options={deviceCategories.filter((option) => option.value)}
                        value={createForm.category}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, category: e.target.value }))}
                        error={createErrors.category?.[0]}
                        required
                    />
                    <Select
                        label="Vị trí"
                        options={[
                            { value: '', label: 'Chọn vị trí' },
                            ...locations.map((location) => ({
                                value: location.id,
                                label: `${location.id} - ${location.name}`,
                            })),
                        ]}
                        value={createForm.location_id}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, location_id: e.target.value }))}
                    />
                    <Select
                        label="Trạng thái"
                        options={assetStatuses.filter((option) => option.value)}
                        value={createForm.status}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value }))}
                    />
                    <Select
                        label="Nhà cung cấp"
                        options={[
                            { value: '', label: 'Chọn nhà cung cấp' },
                            ...suppliers.map((supplier) => ({
                                value: supplier.id,
                                label: supplier.code ? `${supplier.code} - ${supplier.name}` : supplier.name,
                            })),
                        ]}
                        value={createForm.supplier_id}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, supplier_id: e.target.value }))}
                    />
                    <Input
                        label="Ngày mua"
                        type="date"
                        value={createForm.purchase_date}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, purchase_date: e.target.value }))}
                        error={createErrors.purchase_date?.[0]}
                    />
                    <Input
                        label="Purchase price"
                        type="number"
                        min="0"
                        value={createForm.purchase_price}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, purchase_price: e.target.value }))}
                        error={createErrors.purchase_price?.[0] || createErrors.purchase_cost?.[0]}
                    />
                    <Input
                        label="Current depreciation rate"
                        type="number"
                        min="0"
                        step="0.0001"
                        value={createForm.current_depreciation_rate}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, current_depreciation_rate: e.target.value }))}
                        error={createErrors.current_depreciation_rate?.[0]}
                    />
                    <Input
                        label="Thời gian sử dụng dự kiến (tháng)"
                        type="number"
                        min="1"
                        value={createForm.useful_life_months}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, useful_life_months: e.target.value }))}
                        error={createErrors.useful_life_months?.[0]}
                    />
                    <Input
                        label="Ngày hết bảo hành"
                        type="date"
                        value={createForm.warranty_expiry}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, warranty_expiry: e.target.value }))}
                        error={createErrors.warranty_expiry?.[0]}
                    />
                    <Input
                        label="Ghi chú"
                        value={createForm.notes}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="ghost" type="button" onClick={() => setCreateModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={createLoading}>
                            {createLoading ? 'Đang tạo...' : 'Tạo thiết bị'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={handoverModalOpen}
                onClose={() => setHandoverModalOpen(false)}
                title="Gán nhân viên chịu trách nhiệm"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="bg-surface-muted rounded-lg p-3">
                        <div className="font-medium text-text">{selectedAsset?.name}</div>
                        <div className="text-xs text-text-muted font-mono">{selectedAsset?.asset_code}</div>
                    </div>
                    <Select
                        label="Người nhận thiết bị *"
                        options={[
                            { value: '', label: 'Chọn người nhận' },
                            ...employees.map((employee) => ({
                                value: buildHandoverValue(employee),
                                label: `${employee.employee_code} - ${employee.full_name}${employee.user?.username ? ` · ${employee.user.username}` : ''}${employee.position ? ` (${employee.position})` : ''}`,
                            })),
                        ]}
                        value={handoverTarget}
                        onChange={(e) => setHandoverTarget(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <Button variant="ghost" onClick={() => setHandoverModalOpen(false)}>
                        Hủy
                    </Button>
                    <Button onClick={handleHandoverAsset} disabled={handoverLoading}>
                        {handoverLoading ? 'Đang lưu...' : 'Xác nhận'}
                    </Button>
                </div>
            </Modal>

            {detailDrawerOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-surface-invert/20 backdrop-blur-sm"
                        onClick={() => setDetailDrawerOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-surface shadow-xl flex flex-col h-full animate-slide-in-right">
                        <div className="p-6 border-b border-border bg-background">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-text">{selectedAsset.name}</h2>
                                    <p className="text-sm text-text-muted font-mono">{selectedAsset.asset_code}</p>
                                    <div className="mt-3 inline-flex">
                                        <StatusBadge status={getOperationalStatus(selectedAsset)} />
                                    </div>
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

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <Card>
                                <CardBody className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Loại</span>
                                        <span className="text-sm font-medium">{getAssetTypeLabel(selectedAsset.type)}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Serial</span>
                                        <span className="text-sm font-medium text-right">{selectedAsset.serial_number || 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Model</span>
                                        <span className="text-sm font-medium text-right">{selectedAsset.model || 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">QR code</span>
                                        <span className="text-sm font-medium text-right break-all">{selectedAsset.qr_code || 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Danh mục</span>
                                        <span className="text-sm font-medium text-right">{selectedAsset.category || 'Chưa gắn danh mục'}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Vị trí</span>
                                        <span className="text-sm font-medium text-right">{getLocationLabel(selectedAsset)}</span>
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Nhà cung cấp</span>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-text">{selectedAsset.supplier?.name || 'Chưa chọn'}</div>
                                            <div className="text-xs text-text-muted">{selectedAsset.supplier?.code || selectedAsset.supplier?.contact_person || ''}</div>
                                        </div>
                                    </div>
                                    {selectedAsset.notes && (
                                        <div className="pt-3 border-t border-border">
                                            <div className="text-xs font-semibold text-text-muted uppercase mb-1">Ghi chú</div>
                                            <div className="text-sm text-text">{selectedAsset.notes}</div>
                                        </div>
                                    )}
                                    {selectedAsset.configuration && (
                                        <div className="pt-3 border-t border-border">
                                            <div className="text-xs font-semibold text-text-muted uppercase mb-1">Configuration</div>
                                            <div className="text-sm text-text whitespace-pre-wrap">{selectedAsset.configuration}</div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="font-semibold text-text">QR thiết bị</div>
                                            <div className="text-sm text-text-muted">Dùng cùng một mã QR, dữ liệu sẽ được lọc theo quyền người quét.</div>
                                        </div>
                                        <Badge variant={getQrPayload(selectedAsset) ? 'success' : 'warning'} size="sm">
                                            {getQrPayload(selectedAsset) ? 'Sẵn sàng' : 'Chưa có QR'}
                                        </Badge>
                                    </div>

                                    {detailQrImageUrl ? (
                                        <div className="rounded-lg border border-border bg-white p-4 flex flex-col items-center gap-3">
                                            <img
                                                data-testid="asset-detail-qr-image"
                                                src={detailQrImageUrl}
                                                alt="QR thiết bị để quét"
                                                className="h-48 w-48 object-contain"
                                            />
                                            <div className="text-center text-xs font-medium text-text-muted">
                                                Quét bằng điện thoại để mở portal thiết bị
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-text-muted">
                                            {getPrintableQrValue(selectedAsset)
                                                ? 'Đang tạo ảnh QR...'
                                                : 'Tạo lại QR để hiển thị mã quét'}
                                        </div>
                                    )}

                                    <div className="rounded-lg border border-border bg-background px-3 py-3">
                                        <div className="text-xs font-semibold uppercase text-text-muted">QR in ra</div>
                                        <div className="mt-1 break-all text-xs text-text">
                                            {getQrPortalUrl(selectedAsset) || 'Tạo lại QR để có portal URL cho mobile'}
                                        </div>
                                        <div className="mt-3 text-xs font-semibold uppercase text-text-muted">Payload nội bộ</div>
                                        <div className="mt-1 break-all font-mono text-xs text-text">
                                            {getQrPayload(selectedAsset) || 'Chưa tạo QR'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button size="sm" onClick={handleRegenerateQr} loading={qrLoading}>
                                            Tạo lại QR
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={handleCopyQrPayload}>
                                            Sao chép payload
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={openQrPortal}>
                                            Mở portal
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={printQrLabel}>
                                            In nhãn
                                        </Button>
                                        <Button size="sm" variant="ghost" className="col-span-2" onClick={downloadQrLabel}>
                                            Tải nhãn HTML
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-semibold text-text-muted uppercase">Nhân viên chịu trách nhiệm</div>
                                            <div className="font-medium text-text">{getResponsibleEmployee(selectedAsset)}</div>
                                            <div className="text-xs text-text-muted">
                                                {selectedAsset.current_assignment?.assigned_at
                                                    ? `Từ ${new Date(selectedAsset.current_assignment.assigned_at).toLocaleDateString('vi-VN')}`
                                                    : 'Chưa có người phụ trách'}
                                            </div>
                                            <div className="text-xs text-text-muted mt-1">{getDepartmentLabel(selectedAsset)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {selectedAsset.current_assignment ? (
                                            <Button
                                                variant="danger"
                                                fullWidth
                                                onClick={() => {
                                                    setReturnCondition('');
                                                    setConfirmUnassignOpen(true);
                                                }}
                                            >
                                                Bỏ người phụ trách
                                            </Button>
                                        ) : (
                                            <Button fullWidth onClick={() => openHandoverModal(selectedAsset)}>
                                                Gán người phụ trách
                                            </Button>
                                        )}
                                        <Button variant="outline" fullWidth onClick={() => openMaintenanceWorkspace(selectedAsset)}>
                                            Mở workspace bảo trì
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card>
                                <CardBody className="space-y-3">
                                    <div className="font-semibold text-text">Giá trị & vòng đời</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Purchase price</span>
                                        <span className="text-sm font-medium">{selectedAsset.purchase_price ? formatCurrency(selectedAsset.purchase_price) : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Depreciation rate</span>
                                        <span className="text-sm font-medium">{selectedAsset.current_depreciation_rate !== null && selectedAsset.current_depreciation_rate !== undefined ? selectedAsset.current_depreciation_rate : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Giá trị còn lại</span>
                                        <span className="text-sm font-medium">{selectedAsset.valuation?.current_book_value ? formatCurrency(selectedAsset.valuation.current_book_value) : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Khấu hao</span>
                                        <span className="text-sm font-medium">{selectedAsset.valuation?.depreciation_percentage ? `${selectedAsset.valuation.depreciation_percentage.toFixed(1)}%` : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Ngày mua</span>
                                        <span className="text-sm font-medium">{selectedAsset.purchase_date ? new Date(selectedAsset.purchase_date).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold text-text-muted uppercase">Hết bảo hành</span>
                                        <span className="text-sm font-medium">{selectedAsset.warranty_expiry ? new Date(selectedAsset.warranty_expiry).toLocaleDateString('vi-VN') : 'Chưa có'}</span>
                                    </div>
                                </CardBody>
                            </Card>

                            {selectedAsset.assignment_history?.length > 0 && (
                                <Card>
                                    <CardBody className="space-y-3">
                                        <div className="font-semibold text-text">Lịch sử người phụ trách</div>
                                        <div className="divide-y divide-border">
                                            {selectedAsset.assignment_history.slice(0, 5).map((history) => (
                                                <div key={history.id} className="py-3">
                                                    <div className="font-medium text-text">{history.assignment_target?.name || 'Không xác định'}</div>
                                                    <div className="text-xs text-text-muted">
                                                        {new Date(history.assigned_at).toLocaleDateString('vi-VN')}
                                                        {history.unassigned_at ? ` - ${new Date(history.unassigned_at).toLocaleDateString('vi-VN')}` : ' - hiện tại'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            <div className="pt-4 border-t border-border">
                                <button
                                    className="w-full flex items-center justify-center gap-2 p-3 text-error hover:bg-error-light rounded-lg transition-colors"
                                    onClick={() => setConfirmDeleteOpen(true)}
                                >
                                    Xóa thiết bị
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                isOpen={confirmUnassignOpen}
                onClose={() => setConfirmUnassignOpen(false)}
                title="Thu hồi thiết bị"
                size="sm"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setConfirmUnassignOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="warning" onClick={handleUnassignAsset}>
                            Xác nhận thu hồi
                        </Button>
                    </div>
                }
            >
                <div className="space-y-3">
                    <p className="text-sm text-text-muted">
                        Nhập tình trạng thiết bị tại thời điểm thu hồi {selectedAsset?.name || ''}.
                    </p>
                    <textarea
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={3}
                        value={returnCondition}
                        onChange={(event) => setReturnCondition(event.target.value)}
                        placeholder="VD: Hoạt động bình thường, trầy nhẹ vỏ máy"
                    />
                </div>
            </Modal>

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                onConfirm={handleDeleteAsset}
                title="Xóa thiết bị"
                message={`Bạn có chắc muốn xóa ${selectedAsset?.name || ''}?`}
                confirmText="Xóa"
                variant="danger"
            />
        </div>
    );
};

export default AssetsPage;
