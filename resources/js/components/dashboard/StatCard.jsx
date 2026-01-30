import React from 'react';
import { useI18n } from '../../i18n';

/**
 * StatCard - OrangeHRM-inspired summary card with accent color
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
    const { t } = useI18n();

    const colorClasses = {
        primary: 'border-l-primary',
        warning: 'border-l-warning',
        danger: 'border-l-error',
        success: 'border-l-success',
        info: 'border-l-info'
    };

    const iconBgClasses = {
        primary: 'bg-primary/10 text-primary',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-error/10 text-error',
        success: 'bg-success/10 text-success',
        info: 'bg-info/10 text-info'
    };

    const trendClasses = {
        up: 'text-success',
        down: 'text-error',
        neutral: 'text-text-muted'
    };

    if (loading) {
        return (
            <div className={`stat-card bg-surface rounded-lg shadow-sm border border-border border-l-4 ${colorClasses[color]} p-5`}>
                <div className="animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="h-4 bg-surface-muted rounded w-24 mb-2"></div>
                            <div className="h-8 bg-surface-muted rounded w-16 mb-2"></div>
                            <div className="h-3 bg-surface-muted rounded w-32"></div>
                        </div>
                        <div className="w-12 h-12 bg-surface-muted rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`stat-card bg-surface rounded-lg shadow-sm border border-border border-l-4 ${colorClasses[color]} p-5 transition-shadow hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-text-muted mb-1">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-text mb-1">
                        {value}
                    </p>
                    {subtitle && (
                        <p className={`text-xs ${trendClasses[trend]}`}>
                            {trend === 'up' && '↑ '}
                            {trend === 'down' && '↓ '}
                            {subtitle}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClasses[color]}`}>
                        <div className="w-6 h-6">
                            {icon}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
