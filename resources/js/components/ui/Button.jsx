import React from 'react';

/**
 * Button Component - OrangeHRM-inspired
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} loading - Shows loading spinner
 * @param {boolean} disabled - Disables the button
 * @param {boolean} fullWidth - Makes button full width
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {React.ReactNode} leftIcon - Icon on the left
 * @param {React.ReactNode} rightIcon - Icon on the right
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    leftIcon,
    rightIcon,
    className = '',
    onClick,
    ...props
}) => {
    const baseClasses = 'ui-btn';
    const variantClasses = {
        primary: 'ui-btn-primary',
        secondary: 'ui-btn-secondary',
        danger: 'ui-btn-danger',
        ghost: 'ui-btn-ghost',
        outline: 'ui-btn-outline',
    };
    const sizeClasses = {
        sm: 'ui-btn-sm',
        md: 'ui-btn-md',
        lg: 'ui-btn-lg',
    };

    const classes = [
        baseClasses,
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'ui-btn-full' : '',
        loading ? 'ui-btn-loading' : '',
        className,
    ].filter(Boolean).join(' ');

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            className={classes}
            disabled={isDisabled}
            onClick={onClick}
            aria-busy={loading}
            aria-disabled={isDisabled}
            {...props}
        >
            {loading && (
                <span className="ui-btn-spinner" aria-hidden="true">
                    <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                        />
                        <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </span>
            )}
            {!loading && leftIcon && (
                <span className="ui-btn-icon ui-btn-icon-left">{leftIcon}</span>
            )}
            <span className="ui-btn-text">{children}</span>
            {!loading && rightIcon && (
                <span className="ui-btn-icon ui-btn-icon-right">{rightIcon}</span>
            )}
        </button>
    );
};

// Button Group Component
export const ButtonGroup = ({ children, className = '' }) => (
    <div className={`ui-btn-group ${className}`} role="group">
        {children}
    </div>
);

export default Button;
