import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { hasOperationalAccess } from '../../utils/roles';

/**
 * RecentEquipmentTable - Role-based equipment table
 * 
 * - Quản lý/Kỹ thuật viên: Shows global assets with full actions
 * - Employee: Shows responsible equipment with limited actions
 * 
 * @param {Object} props
 * @param {string} props.role - User role
 * @param {Array} props.data - Equipment data array
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onView - View handler
 * @param {Function} props.onEdit - Edit handler (operational roles only)
 * @param {Function} props.onDelete - Delete handler (operational roles only)
 * @param {Function} props.onCreateRequest - Optional legacy request handler
 */
const RecentEquipmentTable = ({ 
    role, 
    data = [], 
    loading = false,
    onView,
    onEdit,
    onDelete,
    onCreateRequest
}) => {
    const { t } = useI18n();
    const isOperationalRole = hasOperationalAccess({ role });

    const getStatusBadgeClass = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'active': return 'badge-success';
            case 'maintenance': 
            case 'off_service': return 'badge-warning';
            case 'available': return 'badge-info';
            case 'retired': return 'badge-secondary';
            default: return 'badge-secondary';
        }
    };

    const getStatusLabel = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'active': return t('common.status.active');
            case 'maintenance': return t('common.status.maintenance');
            case 'off_service': return t('common.status.offService');
            case 'available': return t('common.status.available');
            case 'retired': return t('common.status.retired');
            default: return status;
        }
    };

    // Define columns based on role
    const getColumns = () => {
        const baseColumns = [
            { key: 'name', label: t('dashboard.equipmentName') },
            { key: 'code', label: t('dashboard.code') },
            { key: 'status', label: t('common.status.label') },
        ];

        if (isOperationalRole) {
            return [
                ...baseColumns,
                { key: 'assignedTo', label: t('dashboard.assignedTo') },
                { key: 'lastMaintenance', label: t('dashboard.lastMaintenance') },
                { key: 'actions', label: t('common.actions') }
            ];
        }

        return [
            ...baseColumns,
            { key: 'lockStatus', label: t('dashboard.lockStatus') },
            { key: 'actions', label: t('common.actions') }
        ];
    };

    const columns = getColumns();

    // Render cell based on column key
    const renderCell = (item, column) => {
        switch (column.key) {
            case 'name':
                return (
                    <span className="equipment-name font-medium text-text">
                        {item.name}
                    </span>
                );
            
            case 'code':
                return (
                    <code className="equipment-code bg-surface-muted text-text-muted px-2 py-1 rounded text-sm">
                        {item.code || item.asset_code}
                    </code>
                );
            
            case 'status':
                return (
                    <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                        {getStatusLabel(item.status)}
                    </span>
                );
            
            case 'assignedTo':
                return (
                    <span className="text-text">
                        {item.assignedTo || item.assigned_to?.name || item.current_assignment?.employee?.name || '-'}
                    </span>
                );
            
            case 'lastMaintenance':
                return (
                    <span className="text-text-muted text-sm">
                        {item.lastMaintenance || item.last_maintenance_at || '-'}
                    </span>
                );
            
            case 'lockStatus':
                const isLocked = item.is_locked || item.status === 'off_service';
                return isLocked ? (
                    <span className="badge badge-danger flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        {t('dashboard.locked')}
                    </span>
                ) : (
                    <span className="badge badge-success">{t('dashboard.available')}</span>
                );
            
            case 'actions':
                return (
                    <div className="flex items-center gap-1">
                        {/* View button - always shown */}
                        <button 
                            onClick={() => onView?.(item)}
                            className="action-btn p-2 text-text-muted hover:text-primary hover:bg-surface-muted rounded-md transition-colors"
                            title={t('common.view')}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>

                        {isOperationalRole && (
                            <>
                                <button 
                                    onClick={() => onEdit?.(item)}
                                    className="action-btn p-2 text-text-muted hover:text-primary hover:bg-surface-muted rounded-md transition-colors"
                                    title={t('common.edit')}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => onDelete?.(item)}
                                    className="action-btn p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-colors"
                                    title={t('common.delete')}
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </>
                        )}

                        {!isOperationalRole && onCreateRequest && (
                            <button 
                                onClick={() => onCreateRequest?.(item)}
                                className="action-btn p-2 text-text-muted hover:text-warning hover:bg-warning/10 rounded-md transition-colors"
                                title={t('dashboard.createRequest')}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="12" y1="18" x2="12" y2="12" />
                                    <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                            </button>
                        )}
                    </div>
                );
            
            default:
                return item[column.key] || '-';
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="data-table-section bg-surface rounded-lg shadow-sm border border-border">
                <div className="section-header p-4 border-b border-border flex items-center justify-between">
                    <div className="h-5 bg-surface-muted rounded w-40 animate-pulse"></div>
                    <div className="h-4 bg-surface-muted rounded w-20 animate-pulse"></div>
                </div>
                <div className="p-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex gap-4 py-3 border-b border-border last:border-0 animate-pulse">
                            <div className="h-4 bg-surface-muted rounded w-32"></div>
                            <div className="h-4 bg-surface-muted rounded w-20"></div>
                            <div className="h-4 bg-surface-muted rounded w-16"></div>
                            <div className="h-4 bg-surface-muted rounded w-24"></div>
                            <div className="h-4 bg-surface-muted rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (!data || data.length === 0) {
        return (
            <div className="data-table-section bg-surface rounded-lg shadow-sm border border-border">
                <div className="section-header p-4 border-b border-border">
                    <h3 className="section-title text-text font-semibold">
                        {isOperationalRole ? t('dashboard.recentEquipment') : t('dashboard.myRecentEquipment')}
                    </h3>
                </div>
                <div className="table-empty p-12 text-center text-text-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" />
                        <rect x="2" y="13" width="20" height="8" rx="2" />
                        <line x1="12" y1="17" x2="12" y2="17.01" />
                    </svg>
                    <h4 className="text-text font-medium mb-2">{t('dashboard.noEquipmentFound')}</h4>
                    <p className="text-sm mb-4">{t('dashboard.noEquipmentHint')}</p>
                    {isOperationalRole && (
                        <Link to="/assets" className="btn btn-primary inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-text-invert rounded-lg">
                            {t('dashboard.addEquipment')}
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="data-table-section bg-surface rounded-lg shadow-sm border border-border overflow-hidden">
            <div className="section-header p-4 border-b border-border flex items-center justify-between">
                <h3 className="section-title text-text font-semibold">
                    {isOperationalRole ? t('dashboard.recentEquipment') : t('dashboard.myRecentEquipment')}
                </h3>
                <Link
                    to={isOperationalRole ? '/assets' : '/requests'}
                    className="view-all-link text-sm text-primary hover:text-primary-hover flex items-center gap-1"
                >
                    {t('dashboard.viewAll')}
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="data-table w-full">
                    <thead className="bg-surface-muted">
                        <tr>
                            {columns.map((col) => (
                                <th 
                                    key={col.key} 
                                    className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider"
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item, index) => (
                            <tr 
                                key={item.id || index} 
                                className="hover:bg-surface-hover transition-colors"
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3">
                                        {renderCell(item, col)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentEquipmentTable;
