import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';

/**
 * QuickActionGrid - Role-based quick action buttons grid
 * 
 * @param {Object} props
 * @param {string} props.role - User role: 'admin' | 'hr' | 'technician' | 'doctor' | 'staff'
 */
const QuickActionGrid = ({ role }) => {
    const { t } = useI18n();

    // Define actions by role
    const getActionsForRole = (role) => {
        const isAdminOrHr = ['admin', 'hr'].includes(role);
        const isTechnician = role === 'technician';

        if (isAdminOrHr) {
            return [
                {
                    key: 'addEquipment',
                    label: t('dashboard.addEquipment'),
                    to: '/assets',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    )
                },
                {
                    key: 'reviewRequests',
                    label: t('dashboard.reviewRequests'),
                    to: '/review-requests',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                            <rect x="9" y="3" width="6" height="4" rx="1" />
                            <path d="M9 14l2 2 4-4" />
                        </svg>
                    )
                },
                {
                    key: 'maintenance',
                    label: t('dashboard.maintenance'),
                    to: '/maintenance',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    )
                },
                {
                    key: 'inventory',
                    label: t('dashboard.inventory'),
                    to: '/inventory',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3v18h18" />
                            <path d="M18 17V9" />
                            <path d="M13 17V5" />
                            <path d="M8 17v-3" />
                        </svg>
                    )
                }
            ];
        }

        if (isTechnician) {
            return [
                {
                    key: 'maintenance',
                    label: t('dashboard.maintenance'),
                    to: '/maintenance',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                    )
                },
                {
                    key: 'newRequest',
                    label: t('dashboard.newRequest'),
                    to: '/requests/new',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                    )
                },
                {
                    key: 'myEquipment',
                    label: t('dashboard.myEquipment'),
                    to: '/my-assets',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                    )
                },
                {
                    key: 'scanQrCode',
                    label: t('dashboard.scanQrCode'),
                    to: '/qr-scan',
                    icon: (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                    )
                }
            ];
        }

        // Doctor/Staff - personal actions
        return [
            {
                key: 'newRequest',
                label: t('dashboard.newRequest'),
                to: '/requests/new',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                )
            },
            {
                key: 'scanQrCode',
                label: t('dashboard.scanQrCode'),
                to: '/qr-scan',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                    </svg>
                )
            },
            {
                key: 'myEquipment',
                label: t('dashboard.myEquipment'),
                to: '/my-assets',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                )
            },
            {
                key: 'myRequests',
                label: t('dashboard.myRequests'),
                to: '/requests',
                icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <path d="M9 12h6" />
                        <path d="M9 16h6" />
                    </svg>
                )
            }
        ];
    };

    const actions = getActionsForRole(role);

    return (
        <div className="quick-actions-section mb-6">
            <h3 className="section-title text-text font-semibold mb-4">{t('dashboard.quickActions')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action) => (
                    <Link 
                        key={action.key}
                        to={action.to} 
                        className="quick-action-btn flex flex-col items-center justify-center gap-2 p-4 bg-surface hover:bg-surface-hover border border-border text-text rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="w-8 h-8 text-primary">
                            {action.icon}
                        </div>
                        <span className="text-sm font-medium text-center">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActionGrid;
