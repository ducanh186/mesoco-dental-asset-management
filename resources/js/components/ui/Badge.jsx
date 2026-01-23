import React from 'react';

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
    const statusConfig = {
        active: { variant: 'success', label: 'Active' },
        inactive: { variant: 'default', label: 'Inactive' },
        pending: { variant: 'warning', label: 'Pending' },
        approved: { variant: 'success', label: 'Approved' },
        rejected: { variant: 'danger', label: 'Rejected' },
        maintenance: { variant: 'warning', label: 'Maintenance' },
        available: { variant: 'info', label: 'Available' },
        assigned: { variant: 'primary', label: 'Assigned' },
        overdue: { variant: 'danger', label: 'Overdue' },
    };

    const config = statusConfig[status?.toLowerCase()] || { 
        variant: 'default', 
        label: status || 'Unknown' 
    };

    return (
        <Badge variant={config.variant} dot className={className} {...props}>
            {config.label}
        </Badge>
    );
};

export default Badge;
