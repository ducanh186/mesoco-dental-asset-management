import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast System - OrangeHRM-inspired notifications
 */

// Toast Context
const ToastContext = createContext(null);

// Toast Item Component
const ToastItem = ({ toast, onDismiss }) => {
    const { id, type, title, message, duration, dismissible } = toast;

    useEffect(() => {
        if (duration && duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onDismiss]);

    const typeClasses = {
        success: 'ui-toast-success',
        error: 'ui-toast-error',
        warning: 'ui-toast-warning',
        info: 'ui-toast-info',
    };

    const icons = {
        success: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
        ),
        error: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
        warning: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
        info: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
        ),
    };

    return (
        <div 
            className={`ui-toast ${typeClasses[type] || typeClasses.info}`}
            role="alert"
            aria-live="polite"
        >
            <span className="ui-toast-icon" aria-hidden="true">
                {icons[type] || icons.info}
            </span>
            <div className="ui-toast-content">
                {title && <strong className="ui-toast-title">{title}</strong>}
                {message && <p className="ui-toast-message">{message}</p>}
            </div>
            {dismissible !== false && (
                <button 
                    type="button"
                    className="ui-toast-dismiss"
                    onClick={() => onDismiss(id)}
                    aria-label="Dismiss notification"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, onDismiss, position = 'top-right' }) => {
    const positionClasses = {
        'top-right': 'ui-toast-container-top-right',
        'top-left': 'ui-toast-container-top-left',
        'top-center': 'ui-toast-container-top-center',
        'bottom-right': 'ui-toast-container-bottom-right',
        'bottom-left': 'ui-toast-container-bottom-left',
        'bottom-center': 'ui-toast-container-bottom-center',
    };

    if (toasts.length === 0) return null;

    return createPortal(
        <div className={`ui-toast-container ${positionClasses[position] || positionClasses['top-right']}`}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>,
        document.body
    );
};

// Toast Provider
export const ToastProvider = ({ children, position = 'top-right', maxToasts = 5 }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((options) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            type: 'info',
            duration: 5000,
            dismissible: true,
            ...options,
        };

        setToasts((prev) => {
            const newToasts = [toast, ...prev];
            // Limit number of toasts
            if (newToasts.length > maxToasts) {
                return newToasts.slice(0, maxToasts);
            }
            return newToasts;
        });

        return id;
    }, [maxToasts]);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods
    const success = useCallback((message, options = {}) => {
        return addToast({ type: 'success', message, ...options });
    }, [addToast]);

    const error = useCallback((message, options = {}) => {
        return addToast({ type: 'error', message, duration: 8000, ...options });
    }, [addToast]);

    const warning = useCallback((message, options = {}) => {
        return addToast({ type: 'warning', message, ...options });
    }, [addToast]);

    const info = useCallback((message, options = {}) => {
        return addToast({ type: 'info', message, ...options });
    }, [addToast]);

    const value = {
        toasts,
        addToast,
        dismissToast,
        dismissAll,
        success,
        error,
        warning,
        info,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} position={position} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastProvider;
