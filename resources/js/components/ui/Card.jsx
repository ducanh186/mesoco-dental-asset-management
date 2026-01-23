import React from 'react';

/**
 * Card Component - OrangeHRM-inspired container
 * 
 * @param {string} variant - 'default' | 'outlined' | 'elevated'
 * @param {boolean} noPadding - Removes default padding
 */
const Card = ({
    children,
    variant = 'default',
    noPadding = false,
    className = '',
    ...props
}) => {
    const variantClasses = {
        default: 'ui-card-default',
        outlined: 'ui-card-outlined',
        elevated: 'ui-card-elevated',
    };

    const classes = [
        'ui-card',
        variantClasses[variant] || variantClasses.default,
        noPadding ? 'ui-card-no-padding' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

// Card Header
export const CardHeader = ({ 
    children, 
    title, 
    subtitle, 
    action,
    className = '',
    ...props 
}) => (
    <div className={`ui-card-header ${className}`} {...props}>
        {(title || subtitle) ? (
            <div className="ui-card-header-content">
                {title && <h3 className="ui-card-title">{title}</h3>}
                {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
            </div>
        ) : children}
        {action && <div className="ui-card-header-action">{action}</div>}
    </div>
);

// Card Body
export const CardBody = ({ children, className = '', ...props }) => (
    <div className={`ui-card-body ${className}`} {...props}>
        {children}
    </div>
);

// Card Footer
export const CardFooter = ({ children, align = 'right', className = '', ...props }) => {
    const alignClasses = {
        left: 'ui-card-footer-left',
        center: 'ui-card-footer-center',
        right: 'ui-card-footer-right',
        between: 'ui-card-footer-between',
    };

    return (
        <div 
            className={`ui-card-footer ${alignClasses[align] || alignClasses.right} ${className}`} 
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
