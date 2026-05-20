import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Select, Table, TablePagination, useToast } from '../components/ui';
import { handleApiError, handoverApi } from '../services/api';

const statusOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'active', label: 'Đang bàn giao' },
    { value: 'returned', label: 'Đã thu hồi' },
];

const statusMeta = {
    active: { label: 'Đang bàn giao', variant: 'info' },
    returned: { label: 'Đã thu hồi', variant: 'success' },
};

const HandoverPage = () => {
    const toast = useToast();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [summary, setSummary] = useState({
        total: 0,
        active: 0,
        returned: 0,
        assets: 0,
    });

    const fetchRecords = useCallback(async (page = 1) => {
        setLoading(true);

        try {
            const response = await handoverApi.list({
                page,
                per_page: pagination.per_page,
                search: search || undefined,
                status: status || undefined,
            });

            setRecords(response.data || []);
            setSummary(response.summary || { total: 0, active: 0, returned: 0, assets: 0 });
            setPagination(response.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: pagination.per_page,
                total: 0,
            });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [pagination.per_page, search, status, toast]);

    useEffect(() => {
        fetchRecords(1);
    }, [fetchRecords]);

    const clearFilters = () => {
        setSearch('');
        setStatus('');
    };

    const columns = [
        {
            key: 'code',
            label: 'Mã phiếu',
            render: (value) => <span className="font-mono text-sm text-text-muted">{value}</span>,
        },
        {
            key: 'staff_name',
            label: 'Nhân viên nhận',
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted">{row.staff_code || 'Chưa có mã nhân viên'}</div>
                </div>
            ),
        },
        {
            key: 'assets',
            label: 'Thiết bị',
            render: (assets) => (
                <div className="space-y-1">
                    {(assets || []).slice(0, 3).map((asset) => (
                        <div key={asset.id || asset.asset_code} className="text-sm text-text">
                            <span className="font-medium">{asset.asset_code || 'Chưa có mã'}</span>
                            <span className="text-text-muted"> · {asset.name || 'Thiết bị'}</span>
                        </div>
                    ))}
                    {(assets || []).length > 3 && (
                        <div className="text-xs text-text-muted">+{assets.length - 3} thiết bị khác</div>
                    )}
                </div>
            ),
        },
        {
            key: 'assigned_at',
            label: 'Ngày bàn giao',
            render: (value) => <span className="text-sm text-text-muted">{value || '—'}</span>,
        },
        {
            key: 'returned_at',
            label: 'Ngày thu hồi',
            render: (value, row) => (
                <div>
                    <div className="text-sm text-text-muted">{value || '—'}</div>
                    {row.return_reason && <div className="text-xs text-text-muted">{row.return_reason}</div>}
                </div>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (value) => {
                const meta = statusMeta[value] || { label: value || 'Không rõ', variant: 'default' };
                return <Badge variant={meta.variant}>{meta.label}</Badge>;
            },
        },
        {
            key: 'note',
            label: 'Ghi chú',
            render: (value) => <span className="text-sm text-text-muted">{value || '—'}</span>,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-text">Bàn giao / Thu hồi</h2>
                <p className="text-sm text-text-muted">Theo dõi phiếu bàn giao, thiết bị đã cấp và thông tin thu hồi.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Tổng phiếu</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.total}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Đang bàn giao</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.active}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Đã thu hồi</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.returned}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-sm text-text-muted">Thiết bị liên quan</div>
                    <div className="mt-1 text-2xl font-semibold text-text">{summary.assets}</div>
                </Card>
            </div>

            <Card className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(180px,1fr)_auto] md:items-end">
                    <Input
                        label="Tìm kiếm"
                        placeholder="Tìm theo nhân viên, mã thiết bị hoặc ghi chú"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Select
                        label="Trạng thái"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        options={statusOptions}
                    />
                    <Button type="button" variant="outline" onClick={clearFilters}>
                        Xóa bộ lọc
                    </Button>
                </div>
            </Card>

            <Card>
                <Table
                    columns={columns}
                    data={records}
                    loading={loading}
                    emptyMessage="Chưa có phiếu bàn giao hoặc thu hồi"
                />

                {pagination.last_page > 1 && (
                    <div className="mt-4 flex justify-center">
                        <TablePagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.last_page}
                            totalItems={pagination.total}
                            pageSize={pagination.per_page}
                            onPageChange={(page) => fetchRecords(page)}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default HandoverPage;
