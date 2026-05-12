import React from 'react';

/**
 * StatCard - Mesoco summary card with accent color
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (i18n key or text)
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Subtitle/trend text
 * @param {string} props.color - Accent color: 'primary' | 'warning' | 'danger' | 'success' | 'info'
 * @param {React.ReactNode} props.icon - Icon component
 * @param {'up' | 'down' | 'neutral'} props.trend - Trend direction for styling
 * @param {boolean} props.loading - Show loading state
 */
const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    color = 'primary', 
    icon, 
    trend = 'neutral',
    loading = false 
}) => {
    if (loading) {
        return (
            <div className={`stat-card stat-card-${color} stat-card-loading`}>
                <div className="stat-card-content animate-pulse">
                    <div className="stat-card-copy">
                        <div className="stat-skeleton stat-skeleton-label" />
                        <div className="stat-skeleton stat-skeleton-value" />
                        <div className="stat-skeleton stat-skeleton-subtitle" />
                    </div>
                    <div className="stat-skeleton stat-skeleton-icon" />
                </div>
            </div>
        );
    }

    const valueClassName = String(value ?? '').length > 12
        ? 'stat-card-value stat-card-value-long'
        : 'stat-card-value';

    return (
        <div className={`stat-card stat-card-${color}`}>
            <div className="stat-card-content">
                <div className="stat-card-copy">
                    <p className="stat-card-label">{title}</p>
                    <p className={valueClassName}>{value}</p>
                    {subtitle && (
                        <p className={`stat-card-subtitle stat-trend-${trend}`}>
                            {trend === 'up' && <span className="stat-trend-mark">↑</span>}
                            {trend === 'down' && <span className="stat-trend-mark">↓</span>}
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className="stat-card-icon" aria-hidden="true">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
