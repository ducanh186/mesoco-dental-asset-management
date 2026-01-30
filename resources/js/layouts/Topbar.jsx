import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';
import { useI18n } from '../i18n';

/**
 * Topbar - OrangeHRM-inspired top navigation bar
 */
const Topbar = ({ user, onLogout, onMenuClick, sidebarCollapsed, onToggleSidebar }) => {
    const { t } = useI18n();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setUserDropdownOpen(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleLogout = async () => {
        setUserDropdownOpen(false);
        if (onLogout) {
            await onLogout();
        }
    };

    const getUserInitials = () => {
        if (!user?.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
    };

    return (
        <header className="topbar bg-surface border-b border-border shadow-xs">
            <div className="topbar-left">
                {/* Mobile Menu Button */}
                <button 
                    className="topbar-menu-btn mobile-only text-text-muted hover:text-text hover:bg-surface-muted rounded-md"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                {/* Desktop Sidebar Toggle */}
                <button 
                    className="topbar-menu-btn desktop-only text-text-muted hover:text-text hover:bg-surface-muted rounded-md"
                    onClick={onToggleSidebar}
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                </button>

                {/* Search (optional placeholder) */}
                <div className="topbar-search desktop-only">
                    <svg className="search-icon text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="search-input bg-surface-muted border-border text-text placeholder:text-text-light focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            <div className="topbar-right">
                {/* Language Switcher */}
                <LanguageSwitcher variant="compact" />

                {/* User Dropdown */}
                <div className="user-dropdown-container" ref={dropdownRef}>
                    <button 
                        className="user-dropdown-trigger hover:bg-surface-muted rounded-lg"
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        aria-expanded={userDropdownOpen}
                        aria-haspopup="true"
                    >
                        <div className="user-avatar bg-primary text-text-invert">
                            {getUserInitials()}
                        </div>
                        <div className="user-info desktop-only">
                            <span className="user-name text-text">{user?.name || 'User'}</span>
                            <span className="user-role text-text-muted">{user?.role || 'Staff'}</span>
                        </div>
                        <svg 
                            className={`dropdown-arrow text-text-muted ${userDropdownOpen ? 'open' : ''}`}
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {userDropdownOpen && (
                        <div className="user-dropdown-menu bg-surface border border-border shadow-dropdown rounded-lg">
                            <div className="dropdown-header border-b border-border">
                                <div className="user-avatar large bg-primary text-text-invert">
                                    {getUserInitials()}
                                </div>
                                <div className="dropdown-user-info">
                                    <span className="user-name text-text">{user?.name || 'User'}</span>
                                    <span className="user-email text-text-muted">{user?.email || 'user@example.com'}</span>
                                    <span className="user-code text-text-light">{user?.employee_code}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider" />
                            <ul className="dropdown-menu-list" role="menu">
                                <li role="none">
                                    <Link 
                                        to="/profile" 
                                        className="dropdown-item text-text hover:bg-surface-muted"
                                        role="menuitem"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                        {t('nav.profile')}
                                    </Link>
                                </li>
                                <li role="none">
                                    <Link 
                                        to="/change-password" 
                                        className="dropdown-item text-text hover:bg-surface-muted"
                                        role="menuitem"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                        {t('auth.changePassword')}
                                    </Link>
                                </li>
                                <div className="dropdown-divider" />
                                <li role="none">
                                    <button 
                                        className="dropdown-item logout"
                                        role="menuitem"
                                        onClick={handleLogout}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        {t('nav.logout')}
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
