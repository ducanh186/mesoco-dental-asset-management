import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Modal Component - Accessible dialog
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Called when modal should close
 * @param {string} title - Modal title
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {boolean} closeOnOverlay - Close when clicking overlay
 * @param {boolean} closeOnEsc - Close on Escape key
 * @param {boolean} showCloseButton - Show close button in header
 */
const Modal = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    closeOnOverlay = true,
    closeOnEsc = true,
    showCloseButton = true,
    children,
    footer,
    className = '',
    ...props
}) => {
    const modalRef = useRef(null);
    const previousActiveElement = useRef(null);

    // Handle Escape key
    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Escape' && closeOnEsc) {
            onClose();
        }
    }, [closeOnEsc, onClose]);

    // Handle overlay click
    const handleOverlayClick = (event) => {
        if (closeOnOverlay && event.target === event.currentTarget) {
            onClose();
        }
    };

    // Manage body scroll and focus
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement;
            document.body.style.overflow = 'hidden';
            
            // Focus the modal
            setTimeout(() => {
                modalRef.current?.focus();
            }, 0);
        } else {
            document.body.style.overflow = '';
            
            // Restore focus
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Add keyboard listener
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'ui-modal-sm',
        md: 'ui-modal-md',
        lg: 'ui-modal-lg',
        xl: 'ui-modal-xl',
        full: 'ui-modal-full',
    };

    const modalContent = (
        <div 
            className="ui-modal-overlay"
            onClick={handleOverlayClick}
            aria-hidden="true"
        >
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                className={`ui-modal ${sizeClasses[size] || sizeClasses.md} ${className}`}
                tabIndex={-1}
                {...props}
            >
                {/* Modal Header */}
                {(title || showCloseButton) && (
                    <div className="ui-modal-header">
                        {title && (
                            <h2 id="modal-title" className="ui-modal-title">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                type="button"
                                className="ui-modal-close"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Modal Body */}
                <div className="ui-modal-body">
                    {children}
                </div>

                {/* Modal Footer */}
                {footer && (
                    <div className="ui-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

// Confirmation Modal
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        size="sm"
        footer={
            <div className="ui-modal-footer-buttons">
                <button 
                    type="button"
                    className="ui-btn ui-btn-secondary ui-btn-md"
                    onClick={onClose}
                    disabled={loading}
                >
                    {cancelText}
                </button>
                <button 
                    type="button"
                    className={`ui-btn ui-btn-${variant} ui-btn-md`}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : confirmText}
                </button>
            </div>
        }
    >
        <p className="ui-modal-message">{message}</p>
    </Modal>
);

export default Modal;
