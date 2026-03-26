import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Breadcrumbs from './Breadcrumbs';

/**
 * AdminLayout - OrangeHRM-inspired admin layout
 * Features: Collapsible sidebar, responsive topbar, breadcrumbs, main content area
 */
const AdminLayout = ({ children, title, breadcrumbs = [], user, onLogout }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setSidebarMobileOpen(false);
    }, [title]);

    // Handle escape key to close mobile sidebar
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSidebarMobileOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileSidebar = () => {
        setSidebarMobileOpen(!sidebarMobileOpen);
    };

    return (
        <div className="admin-layout min-h-screen bg-background">
            {/* Mobile Overlay */}
            {sidebarMobileOpen && (
                <div 
                    className="sidebar-overlay fixed inset-0 bg-surface-invert/50 z-40 lg:hidden"
                    onClick={() => setSidebarMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <Sidebar 
                collapsed={sidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                onToggle={toggleSidebar}
                onMobileClose={() => setSidebarMobileOpen(false)}
                user={user}
            />

            {/* Main Content Area */}
            <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {/* Topbar */}
                <Topbar 
                    user={user}
                    onLogout={onLogout}
                    onMenuClick={toggleMobileSidebar}
                    sidebarCollapsed={sidebarCollapsed}
                    onToggleSidebar={toggleSidebar}
                />

                {/* Page Content */}
                <main className="admin-content bg-background">
                    {/* Page Header */}
                    {(title || breadcrumbs.length > 0) && (
                        <div className="page-header bg-surface border-b border-border">
                            <div className="page-header-content">
                                {title && <h1 className="page-title text-text">{title}</h1>}
                                {breadcrumbs.length > 0 && (
                                    <Breadcrumbs items={breadcrumbs} />
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="page-body">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
