import React, { forwardRef, useId } from 'react';
import { useI18n } from '../../i18n';

/**
 * Select Component - OrangeHRM-inspired
 * 
 * @param {string} label - Label text
 * @param {string} helper - Helper text below select
 * @param {string} error - Error message (shows error state)
 * @param {boolean} required - Shows required marker
 * @param {boolean} disabled - Disables the select
 * @param {string} placeholder - Placeholder option text
 * @param {Array} options - Array of { value, label, disabled? } objects
 */
const Select = forwardRef(({
    label,
    helper,
    error,
    required = false,
    disabled = false,
    placeholder,
    options = [],
    size = 'md',
    className = '',
    id: providedId,
    value,
    onChange,
    ...props
}, ref) => {
    const { t } = useI18n();
    const generatedId = useId();
    const id = providedId || generatedId;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    const resolvedPlaceholder = placeholder ?? t('common.selectOption');

    const hasError = Boolean(error);
    const hasHelper = Boolean(helper) && !hasError;

    const sizeClasses = {
        sm: 'ui-select-sm',
        md: 'ui-select-md',
        lg: 'ui-select-lg',
    };

    const selectClasses = [
        'ui-select',
        sizeClasses[size] || sizeClasses.md,
        hasError ? 'ui-select-error' : '',
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
            <div className="ui-select-container">
                <select
                    ref={ref}
                    id={id}
                    className={selectClasses}
                    disabled={disabled}
                    required={required}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : hasHelper ? helperId : undefined}
                    value={value}
                    onChange={onChange}
                    {...props}
                >
                    {resolvedPlaceholder && (
                        <option value="" disabled>
                            {resolvedPlaceholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option 
                            key={option.value} 
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                <span className="ui-select-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
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

Select.displayName = 'Select';

export default Select;
