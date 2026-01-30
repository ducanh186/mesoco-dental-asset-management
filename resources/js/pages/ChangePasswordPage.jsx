import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useI18n } from '../i18n';
import { useToast } from '../components/ui';

/**
 * Change Password Page
 * - Back button to go to previous page
 * - Current password, New password, Confirm new password fields
 * - Validation with red border highlighting and focus management
 * - Password visibility toggles
 * - Loading state on submit
 */
const ChangePasswordPage = ({ user, onLogout }) => {
    const { t } = useI18n();
    const navigate = useNavigate();
    const toast = useToast();

    // Form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Password visibility toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // UI state
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Refs for focus management
    const currentPasswordRef = useRef(null);
    const newPasswordRef = useRef(null);
    const confirmPasswordRef = useRef(null);

    // Focus first field on mount
    useEffect(() => {
        currentPasswordRef.current?.focus();
    }, []);

    /**
     * Validate form fields
     * Returns true if valid, false otherwise
     * Sets fieldErrors and focuses first invalid field
     */
    const validateForm = () => {
        const errors = {};
        
        // Trim values
        const trimmedCurrent = currentPassword.trim();
        const trimmedNew = newPassword.trim();
        const trimmedConfirm = confirmPassword.trim();

        // Required field checks
        if (!trimmedCurrent) {
            errors.currentPassword = t('changePassword.currentPasswordRequired');
        }
        
        if (!trimmedNew) {
            errors.newPassword = t('changePassword.newPasswordRequired');
        } else if (trimmedNew.length < 8) {
            errors.newPassword = t('auth.passwordTooShort');
        } else if (trimmedCurrent && trimmedNew === trimmedCurrent) {
            // New password must be different from current
            errors.newPassword = t('changePassword.newPasswordSameAsCurrent');
        }
        
        if (!trimmedConfirm) {
            errors.confirmPassword = t('changePassword.confirmPasswordRequired');
        } else if (trimmedNew && trimmedConfirm !== trimmedNew) {
            // Passwords must match
            errors.newPassword = t('changePassword.passwordsDoNotMatch');
            errors.confirmPassword = t('changePassword.passwordsDoNotMatch');
        }

        setFieldErrors(errors);

        // Focus first invalid field
        if (errors.currentPassword) {
            currentPasswordRef.current?.focus();
        } else if (errors.newPassword && !errors.confirmPassword) {
            newPasswordRef.current?.focus();
        } else if (errors.confirmPassword) {
            confirmPasswordRef.current?.focus();
        }

        return Object.keys(errors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prevent double submit
        if (isSubmitting || isLoading) return;

        // Clear previous errors
        setFieldErrors({});

        // Validate
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setIsSubmitting(true);

        try {
            await axios.post('/api/change-password', {
                current_password: currentPassword.trim(),
                password: newPassword.trim(),
                password_confirmation: confirmPassword.trim(),
            });

            // Success
            toast.success(t('changePassword.success'));
            
            // Logout and redirect to login
            if (onLogout) {
                setTimeout(async () => {
                    await onLogout();
                    navigate('/login');
                }, 1500);
            } else {
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (err) {
            const status = err.response?.status;
            const errors = err.response?.data?.errors;
            const message = err.response?.data?.message;

            if (status === 422 && errors) {
                // Validation errors from server
                const newFieldErrors = {};
                
                if (errors.current_password) {
                    // Current password incorrect
                    newFieldErrors.currentPassword = t('changePassword.currentPasswordIncorrect');
                    currentPasswordRef.current?.focus();
                }
                
                if (errors.password) {
                    // Password policy or confirmation error
                    const passwordError = errors.password[0];
                    if (passwordError.includes('confirmation') || passwordError.includes('match')) {
                        newFieldErrors.newPassword = t('changePassword.passwordsDoNotMatch');
                        newFieldErrors.confirmPassword = t('changePassword.passwordsDoNotMatch');
                        confirmPasswordRef.current?.focus();
                    } else {
                        // Password policy error - show the server message
                        newFieldErrors.newPassword = passwordError;
                        newPasswordRef.current?.focus();
                    }
                }
                
                setFieldErrors(newFieldErrors);
            } else {
                // Generic error - don't leak system details
                toast.error(t('changePassword.genericError'));
            }
        } finally {
            setIsLoading(false);
            setIsSubmitting(false);
        }
    };

    /**
     * Handle field change - clear error for that field
     */
    const handleFieldChange = (field, value, setter) => {
        setter(value);
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    /**
     * Handle back button
     */
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="change-password-page">
            <div className="page-header">
                <button 
                    type="button" 
                    className="btn btn-ghost btn-back"
                    onClick={handleBack}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {t('common.back')}
                </button>
                <h1 className="page-title">{t('auth.changePassword')}</h1>
            </div>

            <div className="change-password-card">
                <form onSubmit={handleSubmit} className="change-password-form">
                    {/* Current Password */}
                    <div className="form-group">
                        <label htmlFor="currentPassword" className="form-label">
                            {t('auth.currentPassword')} <span className="required">*</span>
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                ref={currentPasswordRef}
                                id="currentPassword"
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => handleFieldChange('currentPassword', e.target.value, setCurrentPassword)}
                                className={`form-input ${fieldErrors.currentPassword ? 'form-input-error' : ''}`}
                                placeholder={t('changePassword.enterCurrentPassword')}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="form-input-icon-btn"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                tabIndex={-1}
                                aria-label={showCurrentPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                            >
                                {showCurrentPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.currentPassword && (
                            <span className="form-error-text">{fieldErrors.currentPassword}</span>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="form-group">
                        <label htmlFor="newPassword" className="form-label">
                            {t('auth.newPassword')} <span className="required">*</span>
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                ref={newPasswordRef}
                                id="newPassword"
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => handleFieldChange('newPassword', e.target.value, setNewPassword)}
                                className={`form-input ${fieldErrors.newPassword ? 'form-input-error' : ''}`}
                                placeholder={t('auth.enterNewPassword')}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="form-input-icon-btn"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                tabIndex={-1}
                                aria-label={showNewPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                            >
                                {showNewPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="form-hint">{t('auth.passwordRequirements')}</p>
                        {fieldErrors.newPassword && (
                            <span className="form-error-text">{fieldErrors.newPassword}</span>
                        )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            {t('auth.confirmNewPassword')} <span className="required">*</span>
                        </label>
                        <div className="form-input-wrapper">
                            <input
                                ref={confirmPasswordRef}
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => handleFieldChange('confirmPassword', e.target.value, setConfirmPassword)}
                                className={`form-input ${fieldErrors.confirmPassword ? 'form-input-error' : ''}`}
                                placeholder={t('auth.confirmNewPassword')}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="form-input-icon-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                            >
                                {showConfirmPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {fieldErrors.confirmPassword && (
                            <span className="form-error-text">{fieldErrors.confirmPassword}</span>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    {t('changePassword.changing')}
                                </>
                            ) : (
                                t('common.continue')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
