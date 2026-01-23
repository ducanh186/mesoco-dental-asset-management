import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Sidebar - OrangeHRM-inspired collapsible sidebar navigation
 */
const Sidebar = ({ collapsed, mobileOpen, onToggle, onMobileClose }) => {
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});

    // Navigation items with optional children for submenus
    const navItems = [
        { 
            id: 'dashboard',
            path: '/dashboard', 
            label: 'Dashboard', 
            icon: 'dashboard'
        },
        { 
            id: 'equipment',
            path: '/equipment', 
            label: 'Equipment', 
            icon: 'equipment',
            children: [
                { path: '/equipment', label: 'All Equipment' },
                { path: '/equipment/assigned', label: 'Assigned' },
                { path: '/equipment/available', label: 'Available' },
            ]
        },
        { 
            id: 'requests',
            path: '/requests', 
            label: 'Requests', 
            icon: 'requests'
        },
        { 
            id: 'maintenance',
            path: '/maintenance', 
            label: 'Maintenance', 
            icon: 'maintenance'
        },
        { 
            id: 'reports',
            path: '/reports', 
            label: 'Reports', 
            icon: 'reports'
        },
        { 
            id: 'users',
            path: '/users', 
            label: 'Users', 
            icon: 'users'
        },
        { 
            id: 'settings',
            path: '/settings', 
            label: 'Settings', 
            icon: 'settings'
        },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const toggleSubmenu = (id) => {
        setExpandedMenus(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const renderIcon = (iconName) => {
        const icons = {
            dashboard: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
            equipment: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            ),
            requests: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                </svg>
            ),
            maintenance: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            ),
            reports: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                </svg>
            ),
            users: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            settings: (
                <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            ),
        };
        return icons[iconName] || icons.dashboard;
    };

    const renderNavItem = (item) => {
        const active = isActive(item.path);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedMenus[item.id];

        if (hasChildren) {
            return (
                <div key={item.id} className="nav-item-group">
                    <button
                        className={`nav-item ${active ? 'active' : ''}`}
                        onClick={() => toggleSubmenu(item.id)}
                        aria-expanded={isExpanded}
                    >
                        {renderIcon(item.icon)}
                        {!collapsed && (
                            <>
                                <span className="nav-label">{item.label}</span>
                                <svg 
                                    className={`nav-arrow ${isExpanded ? 'expanded' : ''}`} 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </>
                        )}
                    </button>
                    {!collapsed && isExpanded && (
                        <div className="nav-submenu">
                            {item.children.map((child, idx) => (
                                <Link
                                    key={idx}
                                    to={child.path}
                                    className={`nav-subitem ${location.pathname === child.path ? 'active' : ''}`}
                                    onClick={onMobileClose}
                                >
                                    {child.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.id}
                to={item.path}
                className={`nav-item ${active ? 'active' : ''}`}
                onClick={onMobileClose}
            >
                {renderIcon(item.icon)}
                {!collapsed && <span className="nav-label">{item.label}</span>}
            </Link>
        );
    };

    return (
        <aside className={`sidebar bg-surface border-r border-border shadow-sm ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Sidebar Header / Logo */}
            <div className="sidebar-header border-b border-border">
                <Link to="/dashboard" className="sidebar-logo text-primary hover:text-primary-hover" onClick={onMobileClose}>
                    <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                    {!collapsed && <span className="logo-text text-text font-semibold">Mesoco Dental</span>}
                </Link>

                {/* Mobile Close Button */}
                <button 
                    className="sidebar-close-btn text-text-muted hover:text-text hover:bg-surface-muted rounded-md"
                    onClick={onMobileClose}
                    aria-label="Close sidebar"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map(renderNavItem)}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer border-t border-border">
                <button 
                    className="collapse-btn text-text-muted hover:text-text hover:bg-surface-muted rounded-md"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg 
                        className={`collapse-icon ${collapsed ? 'collapsed' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
