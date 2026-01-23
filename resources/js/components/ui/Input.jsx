import React, { forwardRef, useId } from 'react';

/**
 * Input Component - OrangeHRM-inspired
 * 
 * @param {string} label - Label text
 * @param {string} helper - Helper text below input
 * @param {string} error - Error message (shows error state)
 * @param {boolean} required - Shows required marker
 * @param {boolean} disabled - Disables the input
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} leftIcon - Icon on the left
 * @param {React.ReactNode} rightIcon - Icon on the right
 */
const Input = forwardRef(({
    label,
    helper,
    error,
    required = false,
    disabled = false,
    size = 'md',
    type = 'text',
    leftIcon,
    rightIcon,
    className = '',
    id: providedId,
    ...props
}, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helper) && !hasError;

    const sizeClasses = {
        sm: 'ui-input-sm',
        md: 'ui-input-md',
        lg: 'ui-input-lg',
    };

    const inputClasses = [
        'ui-input',
        sizeClasses[size] || sizeClasses.md,
        hasError ? 'ui-input-error' : '',
        leftIcon ? 'ui-input-with-left-icon' : '',
        rightIcon ? 'ui-input-with-right-icon' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div className={`ui-input-wrapper ${disabled ? 'ui-input-disabled' : ''}`}>
            {label && (
                <label htmlFor={id} className="ui-input-label">
                    {label}
                    {required && <span className="ui-input-required" aria-hidden="true">*</span>}
                </label>
            )}
            <div className="ui-input-container">
                {leftIcon && (
                    <span className="ui-input-icon ui-input-icon-left" aria-hidden="true">
                        {leftIcon}
                    </span>
                )}
                <input
                    ref={ref}
                    type={type}
                    id={id}
                    className={inputClasses}
                    disabled={disabled}
                    required={required}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
                    {...props}
                />
                {rightIcon && (
                    <span className="ui-input-icon ui-input-icon-right" aria-hidden="true">
                        {rightIcon}
                    </span>
                )}
            </div>
            {hasError && (
                <p id={errorId} className="ui-input-error-text" role="alert">
                    {error}
                </p>
            )}
            {hasHelper && (
                <p id={helperId} className="ui-input-helper-text">
                    {helper}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

// Textarea variant
export const Textarea = forwardRef(({
    label,
    helper,
    error,
    required = false,
    disabled = false,
    rows = 4,
    className = '',
    id: providedId,
    ...props
}, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helper) && !hasError;

    return (
        <div className={`ui-input-wrapper ${disabled ? 'ui-input-disabled' : ''}`}>
            {label && (
                <label htmlFor={id} className="ui-input-label">
                    {label}
                    {required && <span className="ui-input-required" aria-hidden="true">*</span>}
                </label>
            )}
            <textarea
                ref={ref}
                id={id}
                rows={rows}
                className={`ui-textarea ${hasError ? 'ui-input-error' : ''} ${className}`}
                disabled={disabled}
                required={required}
                aria-invalid={hasError}
                aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
                {...props}
            />
            {hasError && (
                <p id={errorId} className="ui-input-error-text" role="alert">
                    {error}
                </p>
            )}
            {hasHelper && (
                <p id={helperId} className="ui-input-helper-text">
                    {helper}
                </p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Input;
