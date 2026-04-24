import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import axios from 'axios';
import { StatCard, QuickActionGrid, RecentEquipmentTable } from '../components/dashboard';
import { Badge, Card, Table } from '../components/ui';
import { ROLE_MANAGER, ROLE_SUPPLIER, ROLE_TECHNICIAN, hasOperationalAccess, normalizeRole } from '../utils/roles';

/**
 * Dashboard Page - Role-based conditional rendering
 * 
 * - Manager: reporting overview
 * - Technician: operational overview for catalog, purchase orders, maintenance, disposal, and inventory
 * - Employee: department handover metrics
 */
const Dashboard = ({ user }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    
    // States for different role data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Operational stats
    const [inventorySummary, setInventorySummary] = useState(null);
    const [inventoryChecks, setInventoryChecks] = useState([]);
    const [maintenanceEvents, setMaintenanceEvents] = useState([]);
    const [globalAssets, setGlobalAssets] = useState([]);
    
    // Department handover stats
    const [myAssets, setMyAssets] = useState([]);
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
                const [inventoryRes, inventoryChecksRes, maintenanceRes, assetsRes] = await Promise.all([
                    axios.get('/api/inventory/summary').catch(() => ({ data: null })),
                    axios.get('/api/inventory/checks', { params: { status: 'in_progress', per_page: 5 } }).catch(() => ({ data: { data: [] } })),
                    axios.get('/api/maintenance-events').catch(() => ({ data: { maintenance_events: [] } })),
                    axios.get('/api/assets', { params: { per_page: 5 } }).catch(() => ({ data: { assets: [] } }))
                ]);
                
                setInventorySummary(inventoryRes.data);
                setInventoryChecks(inventoryChecksRes.data?.data || []);
                setMaintenanceEvents(maintenanceRes.data?.maintenance_events || maintenanceRes.data?.data || []);
                setGlobalAssets(inventoryRes.data?.assets || assetsRes.data?.assets || assetsRes.data?.data || []);
                
            } else if (isTechnician) {
                const [inventoryRes, maintenanceRes, assetsRes] = await Promise.all([
                    axios.get('/api/inventory/summary').catch(() => ({ data: null })),
                    axios.get('/api/maintenance-events').catch(() => ({ data: { maintenance_events: [] } })),
                    axios.get('/api/assets', { params: { per_page: 5 } }).catch(() => ({ data: { assets: [] } }))
                ]);
                
                setInventorySummary(inventoryRes.data);
                setMaintenanceEvents(maintenanceRes.data?.maintenance_events || maintenanceRes.data?.data || []);
                setGlobalAssets(assetsRes.data?.assets || assetsRes.data?.data || []);
                
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
            } else {
                const myAssetsRes = await axios.get('/api/department-assets/dropdown').catch(() => ({ data: { data: [] } }));
                
                setMyAssets(myAssetsRes.data?.data || []);
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
            const totalEquipment = inventorySummary?.total_assets || inventorySummary?.total || 0;
            const inventoryCheckCount = inventoryChecks.length;
            const maintenanceDue = maintenanceEvents.filter(
                m => m.status === 'scheduled' || m.status === 'overdue'
            ).length;
            const overdueCount = maintenanceEvents.filter(m => m.status === 'overdue').length;

            return [
                {
                    title: t('dashboard.totalEquipment'),
                    value: totalEquipment,
                    subtitle: inventorySummary?.active_count 
                        ? t('dashboard.activeCount', { count: inventorySummary.active_count })
                        : null,
                    color: 'primary',
                    trend: 'neutral',
                    icon: equipmentIcon
                },
                {
                    title: t('nav.inventory'),
                    value: inventoryCheckCount,
                    subtitle: inventoryCheckCount > 0
                        ? t('dashboard.upcomingTasks')
                        : t('dashboard.allClear'),
                    color: inventoryCheckCount > 0 ? 'warning' : 'success',
                    trend: inventoryCheckCount > 0 ? 'neutral' : 'up',
                    icon: requestsIcon
                },
                {
                    title: t('dashboard.maintenanceDue'),
                    value: maintenanceDue,
                    subtitle: overdueCount > 0 
                        ? t('dashboard.overdue', { count: overdueCount })
                        : t('dashboard.onSchedule'),
                    color: overdueCount > 0 ? 'danger' : 'success',
                    trend: overdueCount > 0 ? 'down' : 'up',
                    icon: maintenanceIcon
                }
            ];
        }

        if (isTechnician) {
            const totalEquipment = inventorySummary?.total_assets || inventorySummary?.total || globalAssets.length;
            const inProgressCount = maintenanceEvents.filter(m => m.status === 'in_progress').length;
            const scheduledCount = maintenanceEvents.filter(m => m.status === 'scheduled').length;

            return [
                {
                    title: t('dashboard.totalEquipment'),
                    value: totalEquipment,
                    subtitle: scheduledCount > 0 ? t('dashboard.scheduled', { count: scheduledCount }) : null,
                    color: 'primary',
                    trend: 'neutral',
                    icon: equipmentIcon
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
                    title: t('dashboard.scheduledMaintenance'),
                    value: scheduledCount,
                    subtitle: scheduledCount > 0 ? t('dashboard.upcomingTasks') : t('dashboard.noScheduled'),
                    color: scheduledCount > 0 ? 'info' : 'success',
                    trend: 'neutral',
                    icon: calendarIcon
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

        const myEquipmentCount = myAssets.length;
        const lockedCount = myAssets.filter(a => a.is_locked || a.status === 'off_service').length;

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
        navigate(`/assets/${item.id}`);
    };

    const handleEdit = (item) => {
        navigate(`/assets/${item.id}/edit`);
    };

    const handleDelete = (item) => {
        // TODO: Implement delete confirmation modal
        console.log('Delete:', item);
    };

    // Get table data based on role
    const getTableData = () => {
        if (isOperationalRole) {
            return globalAssets.slice(0, 5);
        }
        return myAssets.slice(0, 5);
    };

    const stats = getStats();

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
