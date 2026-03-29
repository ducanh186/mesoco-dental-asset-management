import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';

/**
 * Breadcrumbs - OrangeHRM-inspired breadcrumb navigation
 * 
 * @param {Array} items - Array of breadcrumb items: { label: string, path?: string }
 *                        Last item should not have a path (current page)
 */
const Breadcrumbs = ({ items = [] }) => {
    const { locale } = useI18n();

    if (items.length === 0) return null;

    return (
        <nav className="breadcrumbs" aria-label={locale === 'vi' ? 'Điều hướng phân cấp' : 'Breadcrumb'}>
            <ol className="breadcrumbs-list">
                {/* Home is always first */}
                <li className="breadcrumb-item">
                    <Link to="/dashboard" className="breadcrumb-link">
                        <svg 
                            className="breadcrumb-home-icon" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </Link>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    
                    return (
                        <li 
                            key={index} 
                            className={`breadcrumb-item ${isLast ? 'current' : ''}`}
                            aria-current={isLast ? 'page' : undefined}
                        >
                            <span className="breadcrumb-separator">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </span>
                            {isLast || !item.path ? (
                                <span className="breadcrumb-text">{item.label}</span>
                            ) : (
                                <Link to={item.path} className="breadcrumb-link">
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
