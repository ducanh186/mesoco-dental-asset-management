import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import axios from 'axios';
import { StatCard, QuickActionGrid, RecentEquipmentTable } from '../components/dashboard';
import { Badge, Card, Table } from '../components/ui';
import { ROLE_MANAGER, ROLE_SUPPLIER, ROLE_TECHNICIAN, hasOperationalAccess, normalizeRole } from '../utils/roles';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const DepartmentDistribution = ({ title, subtitle, data }) => {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <Card className="p-5">
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-text">{title}</h3>
                <p className="text-sm text-text-muted mt-1">{subtitle}</p>
            </div>

            {data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
                    Chưa có dữ liệu phân bổ tài sản.
                </div>
            ) : (
                <div className="space-y-4">
                    {data.map((item) => (
                        <div key={item.label}>
                            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                                <span className="font-medium text-text">{item.label}</span>
                                <span className="text-text-muted">{item.count}</span>
                            </div>
                            <div className="h-2.5 overflow-hidden rounded-full bg-surface-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${Math.max((item.count / maxCount) * 100, 8)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const AssetTrend = ({ title, subtitle, data }) => {
    const maxCount = Math.max(...data.map((item) => item.count), 1);

    return (
        <Card className="p-5">
            <div className="mb-5">
                <h3 className="text-lg font-semibold text-text">{title}</h3>
                <p className="text-sm text-text-muted mt-1">{subtitle}</p>
            </div>

            {data.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
                    Chưa có dữ liệu biến động theo tháng.
                </div>
            ) : (
                <div className="flex h-56 items-end gap-3">
                    {data.map((item) => (
                        <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                            <div className="flex h-40 w-full items-end rounded-2xl bg-surface-muted/80 px-1 pb-1">
                                <div
                                    className="w-full rounded-xl bg-gradient-to-t from-primary to-info"
                                    style={{ height: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 12 : 0)}%` }}
                                />
                            </div>
                            <div className="text-center">
                                <div className="text-sm font-semibold text-text">{item.count}</div>
                                <div className="text-xs text-text-muted">{item.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

/**
 * Dashboard Page - Role-based conditional rendering
 * 
 * - Manager: reporting overview
 * - Technician: operational overview for catalog, purchase orders, maintenance, disposal, and inventory
 * - Employee: responsible asset metrics
 */
const Dashboard = ({ user }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    
    // States for different role data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Operational stats
    const [inventorySummary, setInventorySummary] = useState(null);
    const [inventoryValuation, setInventoryValuation] = useState(null);
    const [maintenanceEvents, setMaintenanceEvents] = useState([]);
    const [globalAssets, setGlobalAssets] = useState([]);
    const [reviewQueueTotal, setReviewQueueTotal] = useState(0);
    
    // Responsible asset stats
    const [responsibleAssets, setResponsibleAssets] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [purchaseOrderSummary, setPurchaseOrderSummary] = useState({
        total: 0,
        preparing: 0,
        shipping: 0,
        delivered: 0,
    });
    
    const role = normalizeRole(user?.role);
    const isManager = role === ROLE_MANAGER;
    const isTechnician = role === ROLE_TECHNICIAN;
    const isSupplier = role === ROLE_SUPPLIER;
    const isOperationalRole = hasOperationalAccess(user);

    // Fetch data based on role
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            if (isManager) {
                const [inventoryRes, maintenanceRes, assetsRes, reviewQueueRes] = await Promise.all([
                    axios.get('/api/inventory/summary').catch(() => ({ data: null })),
                    axios.get('/api/maintenance-events').catch(() => ({ data: { maintenance_events: [] } })),
                    axios.get('/api/assets', { params: { per_page: 100 } }).catch(() => ({ data: { assets: [] } })),
                    axios.get('/api/review-requests', { params: { status: 'SUBMITTED', per_page: 1 } }).catch(() => ({ data: { pagination: { total: 0 } } })),
                ]);
                
                setInventorySummary(inventoryRes.data?.summary || null);
                setInventoryValuation(inventoryRes.data?.valuation || null);
                setMaintenanceEvents(maintenanceRes.data?.maintenance_events || maintenanceRes.data?.data || []);
                setGlobalAssets(assetsRes.data?.assets || assetsRes.data?.data || []);
                setReviewQueueTotal(reviewQueueRes.data?.pagination?.total || 0);
                
            } else if (isTechnician) {
                const [inventoryRes, maintenanceRes, assetsRes] = await Promise.all([
                    axios.get('/api/inventory/summary').catch(() => ({ data: null })),
                    axios.get('/api/maintenance-events').catch(() => ({ data: { maintenance_events: [] } })),
                    axios.get('/api/assets', { params: { per_page: 100 } }).catch(() => ({ data: { assets: [] } }))
                ]);
                
                setInventorySummary(inventoryRes.data?.summary || null);
                setInventoryValuation(inventoryRes.data?.valuation || null);
                setMaintenanceEvents(maintenanceRes.data?.maintenance_events || maintenanceRes.data?.data || []);
                setGlobalAssets(assetsRes.data?.assets || assetsRes.data?.data || []);
                setReviewQueueTotal(0);
                
            } else if (isSupplier) {
                const ordersRes = await axios.get('/api/purchase-orders', {
                    params: { per_page: 5 }
                }).catch(() => ({
                    data: {
                        data: [],
                        summary: { total: 0, preparing: 0, shipping: 0, delivered: 0 },
                    }
                }));

                setPurchaseOrders(ordersRes.data?.data || []);
                setPurchaseOrderSummary(ordersRes.data?.summary || {
                    total: 0,
                    preparing: 0,
                    shipping: 0,
                    delivered: 0,
                });
                setInventorySummary(null);
                setInventoryValuation(null);
                setGlobalAssets([]);
                setMaintenanceEvents([]);
                setReviewQueueTotal(0);
            } else {
                const responsibleAssetsRes = await axios.get('/api/my-assigned-assets/dropdown').catch(() => ({ data: { data: [] } }));

                setResponsibleAssets(responsibleAssetsRes.data?.data || []);
                setInventorySummary(null);
                setInventoryValuation(null);
                setGlobalAssets([]);
                setMaintenanceEvents([]);
                setReviewQueueTotal(0);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(t('dashboard.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [isManager, isSupplier, isTechnician, t]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Icon components
    const equipmentIcon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    );

    const requestsIcon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
        </svg>
    );

    const maintenanceIcon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    );

    const alertIcon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );

    const calendarIcon = (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );

    // Calculate stats for cards based on role
    const getStats = () => {
        if (isManager) {
            const totalEquipment = inventorySummary?.total_assets || 0;
            const interruptedCount = (inventorySummary?.by_status?.maintenance || 0) + (inventorySummary?.by_status?.off_service || 0);
            const maintenanceDue = maintenanceEvents.filter((event) => event.status === 'scheduled' || event.status === 'overdue').length;
            const totalInventoryValue = inventoryValuation?.total_current_book_value || 0;

            return [
                {
                    title: t('dashboard.totalEquipment'),
                    value: totalEquipment,
                    subtitle: t('dashboard.activeCount', { count: inventorySummary?.by_status?.active || 0 }),
                    color: 'primary',
                    trend: 'neutral',
                    icon: equipmentIcon
                },
                {
                    title: 'Giá trị tồn kho',
                    value: formatCurrency(totalInventoryValue),
                    subtitle: `${inventoryValuation?.assets_with_valuation || 0} tài sản đã định giá`,
                    color: 'info',
                    trend: 'neutral',
                    icon: requestsIcon
                },
                {
                    title: 'Thiết bị gián đoạn',
                    value: interruptedCount,
                    subtitle: maintenanceDue > 0 ? `${maintenanceDue} mục đang chờ xử lý` : t('dashboard.onSchedule'),
                    color: interruptedCount > 0 ? 'warning' : 'success',
                    trend: interruptedCount > 0 ? 'neutral' : 'up',
                    icon: maintenanceIcon
                },
                {
                    title: 'Yêu cầu chờ duyệt',
                    value: reviewQueueTotal,
                    subtitle: reviewQueueTotal > 0 ? 'Cần xử lý trong hàng đợi' : t('dashboard.allClear'),
                    color: reviewQueueTotal > 0 ? 'danger' : 'success',
                    trend: reviewQueueTotal > 0 ? 'down' : 'up',
                    icon: alertIcon,
                }
            ];
        }

        if (isTechnician) {
            const totalEquipment = inventorySummary?.total_assets || globalAssets.length;
            const totalInventoryValue = inventoryValuation?.total_current_book_value || 0;
            const inProgressCount = maintenanceEvents.filter(m => m.status === 'in_progress').length;
            const scheduledCount = maintenanceEvents.filter(m => m.status === 'scheduled').length;
            const highDepreciationCount = globalAssets.filter((asset) => Number(asset.valuation?.depreciation_percentage || 0) >= 75).length;

            return [
                {
                    title: t('dashboard.totalEquipment'),
                    value: totalEquipment,
                    subtitle: t('dashboard.activeCount', { count: inventorySummary?.by_status?.active || 0 }),
                    color: 'primary',
                    trend: 'neutral',
                    icon: equipmentIcon
                },
                {
                    title: 'Giá trị tồn kho',
                    value: formatCurrency(totalInventoryValue),
                    subtitle: `${inventoryValuation?.assets_with_valuation || 0} tài sản đã định giá`,
                    color: 'info',
                    trend: 'neutral',
                    icon: requestsIcon
                },
                {
                    title: t('dashboard.maintenanceInProgress'),
                    value: inProgressCount,
                    subtitle: inProgressCount > 0 ? t('dashboard.upcomingTasks') : null,
                    color: inProgressCount > 0 ? 'warning' : 'success',
                    trend: 'neutral',
                    icon: maintenanceIcon
                },
                {
                    title: 'Khấu hao cao',
                    value: highDepreciationCount,
                    subtitle: scheduledCount > 0 ? t('dashboard.scheduled', { count: scheduledCount }) : t('dashboard.noScheduled'),
                    color: highDepreciationCount > 0 ? 'danger' : 'success',
                    trend: highDepreciationCount > 0 ? 'down' : 'neutral',
                    icon: calendarIcon,
                }
            ];
        }

        if (isSupplier) {
            return [
                {
                    title: t('dashboard.totalOrders'),
                    value: purchaseOrderSummary.total,
                    subtitle: t('dashboard.preparingCount', { count: purchaseOrderSummary.preparing }),
                    color: 'primary',
                    trend: 'neutral',
                    icon: requestsIcon,
                },
                {
                    title: t('dashboard.ordersShipping'),
                    value: purchaseOrderSummary.shipping,
                    subtitle: purchaseOrderSummary.shipping > 0
                        ? t('dashboard.shippingInProgress')
                        : t('dashboard.noShippingOrders'),
                    color: purchaseOrderSummary.shipping > 0 ? 'info' : 'success',
                    trend: 'neutral',
                    icon: maintenanceIcon,
                },
                {
                    title: t('dashboard.ordersDelivered'),
                    value: purchaseOrderSummary.delivered,
                    subtitle: purchaseOrderSummary.delivered > 0
                        ? t('dashboard.deliveredCount', { count: purchaseOrderSummary.delivered })
                        : t('dashboard.awaitingDelivery'),
                    color: purchaseOrderSummary.delivered > 0 ? 'success' : 'warning',
                    trend: 'neutral',
                    icon: calendarIcon,
                }
            ];
        }

        const myEquipmentCount = responsibleAssets.length;
        const lockedCount = responsibleAssets.filter(a => a.is_locked || a.status === 'off_service').length;

        return [
            {
                title: t('dashboard.myEquipmentCount'),
                value: myEquipmentCount,
                subtitle: lockedCount > 0 
                    ? t('dashboard.lockedCount', { count: lockedCount })
                    : t('dashboard.allAvailable'),
                color: lockedCount > 0 ? 'warning' : 'primary',
                trend: lockedCount > 0 ? 'down' : 'neutral',
                icon: equipmentIcon
            },
            {
                title: t('dashboard.alerts'),
                value: lockedCount,
                subtitle: lockedCount > 0 
                    ? t('dashboard.equipmentLocked')
                    : t('dashboard.noAlerts'),
                color: lockedCount > 0 ? 'danger' : 'success',
                trend: lockedCount > 0 ? 'down' : 'up',
                icon: alertIcon
            }
        ];
    };

    // Table handlers
    const handleView = (item) => {
        navigate(`/assets?q=${encodeURIComponent(item.asset_code || item.code || item.name || '')}`);
    };

    const handleEdit = (item) => {
        navigate(`/assets?q=${encodeURIComponent(item.asset_code || item.code || item.name || '')}`);
    };

    const handleDelete = (item) => {
        navigate(`/assets?q=${encodeURIComponent(item.asset_code || item.code || item.name || '')}`);
    };

    // Get table data based on role
    const getTableData = () => {
        if (isOperationalRole) {
            return globalAssets.slice(0, 5);
        }
        return responsibleAssets.slice(0, 5);
    };

    const stats = getStats();
    const departmentDistribution = Object.entries(globalAssets.reduce((accumulator, asset) => {
        const department = asset.responsible_employee?.department || 'Chưa bàn giao';
        accumulator[department] = (accumulator[department] || 0) + 1;
        return accumulator;
    }, {}))
        .map(([label, count]) => ({ label, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 6);

    const monthFormatter = new Intl.DateTimeFormat('vi-VN', { month: 'short' });
    const monthAnchors = Array.from({ length: 6 }, (_, index) => {
        const month = new Date();
        month.setDate(1);
        month.setMonth(month.getMonth() - (5 - index));
        return {
            key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
            label: monthFormatter.format(month),
            count: 0,
        };
    });

    const monthlyTrend = monthAnchors.map((bucket) => {
        const count = globalAssets.filter((asset) => {
            if (!asset.created_at) {
                return false;
            }

            const createdAt = new Date(asset.created_at);
            const bucketKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            return bucketKey === bucket.key;
        }).length;

        return {
            label: bucket.label,
            count,
        };
    });

    const depreciationAlerts = globalAssets
        .map((asset) => ({
            id: asset.id,
            name: asset.name,
            assetCode: asset.asset_code,
            department: asset.responsible_employee?.department || 'Chưa bàn giao',
            percentage: Number(asset.valuation?.depreciation_percentage || 0),
            currentBookValue: Number(asset.valuation?.current_book_value || 0),
        }))
        .filter((asset) => asset.percentage >= 65)
        .sort((left, right) => right.percentage - left.percentage)
        .slice(0, 6);

    return (
        <div className="dashboard-page p-6">
            {/* Welcome Section */}
            <div className="welcome-section bg-surface rounded-lg shadow-sm border border-border p-6 mb-6">
                <h2 className="text-xl font-semibold text-text mb-1">
                    {t('dashboard.welcome', { name: user?.name || 'Bạn' })}
                </h2>
                <p className="text-text-muted">
                    {isManager 
                        ? t('dashboard.welcomeSubtitleAdmin')
                        : isTechnician
                            ? t('dashboard.welcomeSubtitleTechnician')
                            : isSupplier
                                ? t('dashboard.welcomeSubtitleSupplier')
                                : t('dashboard.welcomeSubtitleUser')
                    }
                </p>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-error/10 border border-error text-error rounded-lg p-4 mb-6">
                    <p>{error}</p>
                    <button 
                        onClick={fetchDashboardData}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        {t('common.retry')}
                    </button>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        subtitle={stat.subtitle}
                        color={stat.color}
                        trend={stat.trend}
                        icon={stat.icon}
                        loading={loading}
                    />
                ))}
            </div>

            {isOperationalRole && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    <DepartmentDistribution
                        title="Tình trạng tài sản theo bộ phận"
                        subtitle="Theo nhân viên đang được giao hoặc bộ phận quản lý"
                        data={departmentDistribution}
                    />
                    <AssetTrend
                        title="Xu hướng biến động tài sản"
                        subtitle="Số tài sản mới được ghi nhận trong 6 tháng gần đây"
                        data={monthlyTrend}
                    />
                </div>
            )}

            {isOperationalRole && (
                <Card className="p-5 mb-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold text-text">Cảnh báo khấu hao</h3>
                            <p className="text-sm text-text-muted mt-1">Danh sách thiết bị đang tiến sát hoặc vượt ngưỡng đề xuất thu hủy 75%.</p>
                        </div>
                        <Badge variant={depreciationAlerts.length > 0 ? 'warning' : 'success'} size="sm">
                            {depreciationAlerts.length > 0 ? `${depreciationAlerts.length} cần theo dõi` : 'Ổn định'}
                        </Badge>
                    </div>

                    {depreciationAlerts.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
                            Chưa có thiết bị nào gần ngưỡng 75%.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {depreciationAlerts.map((asset) => (
                                <div key={asset.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="font-semibold text-text">{asset.name}</div>
                                        <div className="mt-1 text-sm text-text-muted">{asset.assetCode} · {asset.department}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-text">{asset.percentage.toFixed(1)}%</div>
                                            <div className="text-xs text-text-muted">Giá trị còn lại {formatCurrency(asset.currentBookValue)}</div>
                                        </div>
                                        <Badge variant={asset.percentage >= 75 ? 'danger' : 'warning'} size="sm">
                                            {asset.percentage >= 75 ? 'Đề xuất thu hủy' : 'Gần ngưỡng'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* Quick Actions */}
            <QuickActionGrid role={role} />

            {isSupplier ? (
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-text">{t('dashboard.recentOrders')}</h3>
                            <p className="text-sm text-text-muted">{t('dashboard.recentOrdersHint')}</p>
                        </div>
                        <Link
                            to="/purchase-orders"
                            className="text-sm text-primary hover:text-primary-hover"
                        >
                            {t('dashboard.viewAll')}
                        </Link>
                    </div>
                    <Table
                        columns={[
                            {
                                key: 'order_code',
                                label: t('purchaseOrders.orderCode'),
                            },
                            {
                                key: 'order_date',
                                label: t('purchaseOrders.orderDate'),
                                render: (value) => value || '—',
                            },
                            {
                                key: 'total_amount',
                                label: t('purchaseOrders.totalAmount'),
                                align: 'right',
                                render: (value) => new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    maximumFractionDigits: 0,
                                }).format(Number(value || 0)),
                            },
                            {
                                key: 'status',
                                label: t('common.status.label'),
                                render: (value) => (
                                    <Badge
                                        variant={value === 'delivered' ? 'success' : value === 'shipping' ? 'info' : 'warning'}
                                        size="sm"
                                    >
                                        {value === 'delivered'
                                            ? t('common.status.delivered')
                                            : value === 'shipping'
                                                ? t('common.status.shipping')
                                                : t('common.status.preparing')}
                                    </Badge>
                                ),
                            },
                        ]}
                        data={purchaseOrders}
                        loading={loading}
                        emptyMessage={t('dashboard.noOrdersFound')}
                    />
                </Card>
            ) : (
                <RecentEquipmentTable
                    role={role}
                    data={getTableData()}
                    loading={loading}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default Dashboard;
