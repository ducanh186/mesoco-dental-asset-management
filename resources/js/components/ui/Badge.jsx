import React from 'react';
import { useI18n } from '../../i18n';

/**
 * Badge Component - OrangeHRM-inspired status pill
 * 
 * @param {string} variant - 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} dot - Shows a dot indicator instead of/before text
 * @param {boolean} outline - Outline style instead of filled
 */
const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    outline = false,
    className = '',
    ...props
}) => {
    const variantClasses = {
        default: 'ui-badge-default',
        primary: 'ui-badge-primary',
        success: 'ui-badge-success',
        warning: 'ui-badge-warning',
        danger: 'ui-badge-danger',
        info: 'ui-badge-info',
    };

    const sizeClasses = {
        sm: 'ui-badge-sm',
        md: 'ui-badge-md',
        lg: 'ui-badge-lg',
    };

    const classes = [
        'ui-badge',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.md,
        outline ? 'ui-badge-outline' : '',
        dot && !children ? 'ui-badge-dot-only' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={classes} {...props}>
            {dot && <span className="ui-badge-dot" aria-hidden="true" />}
            {children && <span className="ui-badge-text">{children}</span>}
        </span>
    );
};

// Status Badge - Predefined status mappings
export const StatusBadge = ({ status, className = '', ...props }) => {
    const { t } = useI18n();
    const normalizedStatus = status?.toLowerCase();
    const statusConfig = {
        active: { variant: 'success', label: t('common.status.active') },
        inactive: { variant: 'default', label: t('common.status.inactive') },
        pending: { variant: 'warning', label: t('common.status.pending') },
        approved: { variant: 'success', label: t('common.status.approved') },
        rejected: { variant: 'danger', label: t('common.status.rejected') },
        submitted: { variant: 'warning', label: t('common.status.submitted') },
        cancelled: { variant: 'default', label: t('common.status.cancelled') },
        maintenance: { variant: 'warning', label: t('common.status.maintenance') },
        in_progress: { variant: 'info', label: t('common.status.in_progress') },
        off_service: { variant: 'danger', label: t('common.status.off_service') },
        available: { variant: 'info', label: t('common.status.available') },
        assigned: { variant: 'primary', label: t('common.status.assigned') },
        overdue: { variant: 'danger', label: t('common.status.overdue') },
        expired: { variant: 'warning', label: t('common.status.expired') },
        terminated: { variant: 'danger', label: t('common.status.terminated') },
        retired: { variant: 'default', label: t('common.status.retired') },
        draft: { variant: 'default', label: t('common.status.draft') },
        preparing: { variant: 'warning', label: t('common.status.preparing') },
        shipping: { variant: 'info', label: t('common.status.shipping') },
        delivered: { variant: 'success', label: t('common.status.delivered') },
    };

    const config = statusConfig[normalizedStatus] || {
        variant: 'default', 
        label: t('common.unknown'),
    };

    return (
        <Badge variant={config.variant} dot className={className} {...props}>
            {config.label}
        </Badge>
    );
};

export default Badge;
