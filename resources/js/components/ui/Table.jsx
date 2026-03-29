import React from 'react';
import { useI18n } from '../../i18n';

/**
 * Table Component - OrangeHRM-inspired data table
 * 
 * @param {Array} columns - Array of { key, label, width?, align?, render? }
 * @param {Array} data - Array of row objects
 * @param {boolean} striped - Alternating row colors
 * @param {boolean} hoverable - Highlight row on hover
 * @param {boolean} loading - Shows loading state
 * @param {React.ReactNode} emptyState - Custom empty state content
 * @param {string} emptyMessage - Default empty message
 */
const Table = ({
    columns = [],
    data = [],
    striped = true,
    hoverable = true,
    loading = false,
    emptyState,
    emptyMessage,
    className = '',
    onRowClick,
    ...props
}) => {
    const { t } = useI18n();
    const isEmpty = !loading && data.length === 0;
    const resolvedEmptyMessage = emptyMessage || t('common.noData');

    const tableClasses = [
        'ui-table',
        striped ? 'ui-table-striped' : '',
        hoverable ? 'ui-table-hoverable' : '',
        onRowClick ? 'ui-table-clickable' : '',
        className,
    ].filter(Boolean).join(' ');

    const getCellAlignment = (align) => {
        switch (align) {
            case 'center': return 'ui-table-cell-center';
            case 'right': return 'ui-table-cell-right';
            default: return 'ui-table-cell-left';
        }
    };

    return (
        <div className="ui-table-wrapper">
            <table className={tableClasses} {...props}>
                <thead className="ui-table-head">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`ui-table-th ${getCellAlignment(column.align)}`}
                                style={column.width ? { width: column.width } : undefined}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="ui-table-body">
                    {loading ? (
                        <tr>
                            <td colSpan={columns.length} className="ui-table-loading">
                                <div className="ui-table-loading-content">
                                    <span className="ui-table-spinner" />
                                    <span>{t('common.loading')}</span>
                                </div>
                            </td>
                        </tr>
                    ) : isEmpty ? (
                        <tr>
                            <td colSpan={columns.length} className="ui-table-empty">
                                {emptyState || (
                                    <div className="ui-table-empty-content">
                                        <svg 
                                            className="ui-table-empty-icon" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="1.5"
                                        >
                                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                            <line x1="8" y1="21" x2="16" y2="21" />
                                            <line x1="12" y1="17" x2="12" y2="21" />
                                        </svg>
                                        <p className="ui-table-empty-message">{resolvedEmptyMessage}</p>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => (
                            <tr
                                key={row.id || rowIndex}
                                className="ui-table-row"
                                onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                                tabIndex={onRowClick ? 0 : undefined}
                                onKeyDown={onRowClick ? (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onRowClick(row, rowIndex);
                                    }
                                } : undefined}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`ui-table-td ${getCellAlignment(column.align)}`}
                                    >
                                        {column.render
                                            ? column.render(row[column.key], row, rowIndex)
                                            : row[column.key]
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

// Table with Card wrapper
export const TableCard = ({ title, subtitle, action, children, ...props }) => (
    <div className="ui-table-card">
        {(title || action) && (
            <div className="ui-table-card-header">
                <div className="ui-table-card-header-content">
                    {title && <h3 className="ui-table-card-title">{title}</h3>}
                    {subtitle && <p className="ui-table-card-subtitle">{subtitle}</p>}
                </div>
                {action && <div className="ui-table-card-action">{action}</div>}
            </div>
        )}
        <Table {...props} />
        {children}
    </div>
);

// Pagination Component
export const TablePagination = ({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    pageSize = 10,
    onPageChange,
    className = '',
}) => {
    const { t, locale } = useI18n();
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={`ui-table-pagination ${className}`}>
            <span className="ui-table-pagination-info">
                {t('pagination.showing', { from: startItem, to: endItem, total: totalItems })}
            </span>
            <div className="ui-table-pagination-controls">
                <button
                    className="ui-table-pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    aria-label={locale === 'vi' ? 'Trang trước' : 'Previous page'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <span className="ui-table-pagination-pages">
                    {t('pagination.page', { page: currentPage, total: totalPages })}
                </span>
                <button
                    className="ui-table-pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    aria-label={locale === 'vi' ? 'Trang sau' : 'Next page'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Table;
