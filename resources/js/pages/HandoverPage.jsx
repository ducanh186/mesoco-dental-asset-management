import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Input, Select, Table, TablePagination, useToast } from '../components/ui';
import { assetsApi, handleApiError, handoverApi, usersApi } from '../services/api';

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
    const [availableAssets, setAvailableAssets] = useState([]);
    const [employeeUsers, setEmployeeUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(true);
    const [submittingHandover, setSubmittingHandover] = useState(false);
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [handoverForm, setHandoverForm] = useState({
        asset_id: '',
        staff_id: '',
        note: '',
    });
    const [returnForm, setReturnForm] = useState({
        asset_id: '',
        reason: '',
        return_condition: '',
    });
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

    const fetchFormOptions = useCallback(async () => {
        setFormLoading(true);

        try {
            const [assetsResponse, usersResponse] = await Promise.all([
                assetsApi.available(),
                usersApi.list({ role: 'employee', per_page: 100 }),
            ]);

            setAvailableAssets(assetsResponse.assets || []);
            setEmployeeUsers(usersResponse.users || []);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRecords(1);
    }, [fetchRecords]);

    useEffect(() => {
        fetchFormOptions();
    }, [fetchFormOptions]);

    const clearFilters = () => {
        setSearch('');
        setStatus('');
    };

    const refreshAfterMutation = async () => {
        await Promise.all([
            fetchRecords(1),
            fetchFormOptions(),
        ]);
    };

    const assetOptions = availableAssets.map((asset) => ({
        value: String(asset.id),
        label: `${asset.asset_code || 'Chưa có mã'} - ${asset.name || 'Thiết bị'}`,
    }));

    const employeeOptions = employeeUsers.map((user) => ({
        value: String(user.id),
        label: `${user.employee_code || user.username || 'Chưa có mã'} - ${user.name || user.employee?.full_name || 'Người dùng'}`,
    }));

    const returnOptions = records
        .filter((record) => record.status === 'active')
        .flatMap((record) => (record.assets || [])
            .filter((asset) => asset.id)
            .map((asset) => ({
                value: String(asset.id),
                label: `${record.code} - ${asset.asset_code || 'Chưa có mã'} - ${record.staff_name}`,
            })));

    const handleCreateHandover = async (event) => {
        event.preventDefault();
        setSubmittingHandover(true);

        try {
            await assetsApi.assign(handoverForm.asset_id, {
                staff_id: Number(handoverForm.staff_id),
                department_name: handoverForm.note || undefined,
            });
            toast.success('Đã tạo phiếu bàn giao thiết bị.');
            setHandoverForm({ asset_id: '', staff_id: '', note: '' });
            await refreshAfterMutation();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSubmittingHandover(false);
        }
    };

    const handleCreateReturn = async (event) => {
        event.preventDefault();
        setSubmittingReturn(true);

        try {
            await assetsApi.unassign(returnForm.asset_id, {
                reason: returnForm.reason || undefined,
                return_condition: returnForm.return_condition,
            });
            toast.success('Đã tạo phiếu thu hồi thiết bị.');
            setReturnForm({ asset_id: '', reason: '', return_condition: '' });
            await refreshAfterMutation();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSubmittingReturn(false);
        }
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

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <Card className="p-4">
                    <form className="space-y-4" onSubmit={handleCreateHandover}>
                        <div>
                            <h3 className="text-base font-semibold text-text">Tạo phiếu bàn giao</h3>
                            <p className="text-sm text-text-muted">Chọn thiết bị sẵn sàng và người nhận thiết bị.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <Select
                                label="Thiết bị bàn giao"
                                value={handoverForm.asset_id}
                                onChange={(event) => setHandoverForm((current) => ({ ...current, asset_id: event.target.value }))}
                                options={assetOptions}
                                placeholder="Chọn thiết bị"
                                disabled={formLoading || submittingHandover}
                                required
                            />
                            <Select
                                label="Người nhận"
                                value={handoverForm.staff_id}
                                onChange={(event) => setHandoverForm((current) => ({ ...current, staff_id: event.target.value }))}
                                options={employeeOptions}
                                placeholder="Chọn người nhận"
                                disabled={formLoading || submittingHandover}
                                required
                            />
                        </div>
                        <Input
                            label="Ghi chú"
                            value={handoverForm.note}
                            onChange={(event) => setHandoverForm((current) => ({ ...current, note: event.target.value }))}
                            placeholder="Ghi chú bàn giao nếu có"
                            disabled={submittingHandover}
                        />
                        <Button type="submit" disabled={formLoading || submittingHandover}>
                            {submittingHandover ? 'Đang tạo...' : 'Tạo phiếu bàn giao'}
                        </Button>
                    </form>
                </Card>

                <Card className="p-4">
                    <form className="space-y-4" onSubmit={handleCreateReturn}>
                        <div>
                            <h3 className="text-base font-semibold text-text">Tạo phiếu thu hồi</h3>
                            <p className="text-sm text-text-muted">Thu hồi thiết bị đang bàn giao và ghi rõ tình trạng khi thu hồi.</p>
                        </div>
                        <Select
                            label="Thiết bị cần thu hồi"
                            value={returnForm.asset_id}
                            onChange={(event) => setReturnForm((current) => ({ ...current, asset_id: event.target.value }))}
                            options={returnOptions}
                            placeholder="Chọn phiếu / thiết bị"
                            disabled={loading || submittingReturn}
                            required
                        />
                        <Input
                            label="Lý do thu hồi"
                            value={returnForm.reason}
                            onChange={(event) => setReturnForm((current) => ({ ...current, reason: event.target.value }))}
                            placeholder="Ví dụ: đổi thiết bị, nghỉ việc, tái phân bổ"
                            disabled={submittingReturn}
                        />
                        <Input
                            label="Tình trạng thiết bị khi thu hồi"
                            value={returnForm.return_condition}
                            onChange={(event) => setReturnForm((current) => ({ ...current, return_condition: event.target.value }))}
                            placeholder="Ví dụ: hoạt động tốt, trầy xước nhẹ, lỗi màn hình"
                            disabled={submittingReturn}
                            required
                        />
                        <Button type="submit" disabled={loading || submittingReturn}>
                            {submittingReturn ? 'Đang tạo...' : 'Tạo phiếu thu hồi'}
                        </Button>
                    </form>
                </Card>
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
