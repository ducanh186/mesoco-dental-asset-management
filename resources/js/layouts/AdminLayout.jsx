import React, { useCallback, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Breadcrumbs from './Breadcrumbs';

const SIDEBAR_WIDTH_STORAGE_KEY = 'mesoco.sidebar.width';
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_MAX_WIDTH = 360;
const SIDEBAR_DEFAULT_WIDTH = 260;

const clampSidebarWidth = (width) => Math.min(
    SIDEBAR_MAX_WIDTH,
    Math.max(SIDEBAR_MIN_WIDTH, width)
);

const getStoredSidebarWidth = () => {
    if (typeof window === 'undefined') {
        return SIDEBAR_DEFAULT_WIDTH;
    }

    const storedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
    return Number.isFinite(storedWidth)
        ? clampSidebarWidth(storedWidth)
        : SIDEBAR_DEFAULT_WIDTH;
};

/**
 * AdminLayout - Mesoco admin layout
 * Features: Collapsible sidebar, responsive topbar, breadcrumbs, main content area
 */
const AdminLayout = ({ children, title, breadcrumbs = [], user, onLogout }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(getStoredSidebarWidth);
    const [sidebarResizing, setSidebarResizing] = useState(false);

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

    const expandSidebar = () => {
        setSidebarCollapsed(false);
    };

    const toggleMobileSidebar = () => {
        setSidebarMobileOpen(!sidebarMobileOpen);
    };

    const handleSidebarResize = useCallback((clientX) => {
        const nextWidth = clampSidebarWidth(clientX);
        setSidebarWidth(nextWidth);
        window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth));
    }, []);

    const startSidebarResize = (event) => {
        if (event.button !== 0) {
            return;
        }

        event.preventDefault();
        setSidebarCollapsed(false);
        setSidebarResizing(true);
    };

    useEffect(() => {
        if (!sidebarResizing) {
            return undefined;
        }

        const handleMouseMove = (event) => {
            handleSidebarResize(event.clientX);
        };

        const handleMouseUp = () => {
            setSidebarResizing(false);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleSidebarResize, sidebarResizing]);

    return (
        <div
            className={`admin-layout min-h-screen bg-background ${sidebarResizing ? 'sidebar-is-resizing' : ''}`}
            style={{ '--sidebar-width': `${sidebarWidth}px` }}
        >
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
                onExpand={expandSidebar}
                onMobileClose={() => setSidebarMobileOpen(false)}
                onResizeStart={startSidebarResize}
                isResizing={sidebarResizing}
                user={user}
            />

            {/* Main Content Area */}
            <div className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
                {/* Topbar */}
                <Topbar 
                    user={user}
                    onLogout={onLogout}
                    onMenuClick={toggleMobileSidebar}
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
