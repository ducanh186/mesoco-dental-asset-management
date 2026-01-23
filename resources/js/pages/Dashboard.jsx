import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * Dashboard Page - OrangeHRM-inspired dashboard with summary cards and data table
 */
const Dashboard = ({ user }) => {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock data simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            setTableData([
                { id: 1, name: 'Dental X-Ray Machine', code: 'EQ-001', status: 'Active', assignedTo: 'Dr. Smith', lastMaintenance: '2026-01-15' },
                { id: 2, name: 'Autoclave Sterilizer', code: 'EQ-002', status: 'Active', assignedTo: 'Lab Team', lastMaintenance: '2026-01-10' },
                { id: 3, name: 'Dental Chair Unit', code: 'EQ-003', status: 'Maintenance', assignedTo: 'Room 101', lastMaintenance: '2025-12-20' },
                { id: 4, name: 'Ultrasonic Scaler', code: 'EQ-004', status: 'Active', assignedTo: 'Dr. Johnson', lastMaintenance: '2026-01-18' },
                { id: 5, name: 'LED Curing Light', code: 'EQ-005', status: 'Available', assignedTo: '-', lastMaintenance: '2026-01-05' },
            ]);
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Summary cards data
    const summaryCards = [
        {
            title: 'Total Equipment',
            value: '156',
            icon: 'equipment',
            trend: '+12 this month',
            trendUp: true,
            color: 'primary'
        },
        {
            title: 'Active Requests',
            value: '24',
            icon: 'requests',
            trend: '8 pending approval',
            trendUp: null,
            color: 'warning'
        },
        {
            title: 'Maintenance Due',
            value: '7',
            icon: 'maintenance',
            trend: '3 overdue',
            trendUp: false,
            color: 'danger'
        }
    ];

    const renderCardIcon = (iconName) => {
        const icons = {
            equipment: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
            ),
            requests: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <path d="M9 12h6" />
                    <path d="M9 16h6" />
                </svg>
            ),
            maintenance: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
            )
        };
        return icons[iconName] || icons.equipment;
    };

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'active': return 'badge-success';
            case 'maintenance': return 'badge-warning';
            case 'available': return 'badge-info';
            default: return 'badge-secondary';
        }
    };

    return (
        <div className="dashboard-page">
            {/* Welcome Section */}
            <div className="welcome-section bg-surface rounded-lg shadow-sm border border-border p-6 mb-6">
                <h2 className="welcome-title text-text">
                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </h2>
                <p className="welcome-subtitle text-text-muted">
                    Here's what's happening with your equipment today.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                {summaryCards.map((card, index) => (
                    <div key={index} className={`summary-card card-${card.color} bg-surface rounded-lg shadow-sm border border-border`}>
                        <div className="card-icon">
                            {renderCardIcon(card.icon)}
                        </div>
                        <div className="card-content">
                            <span className="card-value text-text">{card.value}</span>
                            <span className="card-title text-text-muted">{card.title}</span>
                            <span className={`card-trend ${card.trendUp === true ? 'up text-success' : card.trendUp === false ? 'down text-error' : 'text-text-light'}`}>
                                {card.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h3 className="section-title text-text">Quick Actions</h3>
                <div className="quick-actions-grid">
                    <Link to="/equipment/new" className="quick-action-btn bg-surface hover:bg-surface-hover border border-border text-text rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Equipment
                    </Link>
                    <Link to="/requests/new" className="quick-action-btn bg-surface hover:bg-surface-hover border border-border text-text rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="12" y1="18" x2="12" y2="12" />
                            <line x1="9" y1="15" x2="15" y2="15" />
                        </svg>
                        New Request
                    </Link>
                    <Link to="/qr-scan" className="quick-action-btn bg-surface hover:bg-surface-hover border border-border text-text rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                        Scan QR Code
                    </Link>
                    <Link to="/reports" className="quick-action-btn bg-surface hover:bg-surface-hover border border-border text-text rounded-lg shadow-sm hover:shadow-md transition-shadow">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3v18h18" />
                            <path d="M18 17V9" />
                            <path d="M13 17V5" />
                            <path d="M8 17v-3" />
                        </svg>
                        View Reports
                    </Link>
                </div>
            </div>

            {/* Recent Equipment Table */}
            <div className="data-table-section bg-surface rounded-lg shadow-sm border border-border">
                <div className="section-header border-b border-border">
                    <h3 className="section-title text-text">Recent Equipment</h3>
                    <Link to="/equipment" className="view-all-link text-primary hover:text-primary-hover">
                        View All
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>

                <div className="table-container">
                    {isLoading ? (
                        <div className="table-loading text-text-muted">
                            <div className="loading-spinner border-primary"></div>
                            <p>Loading equipment...</p>
                        </div>
                    ) : tableData.length === 0 ? (
                        <div className="table-empty text-text-muted">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" />
                                <rect x="2" y="13" width="20" height="8" rx="2" />
                                <line x1="12" y1="17" x2="12" y2="17.01" />
                            </svg>
                            <h4 className="text-text">No Equipment Found</h4>
                            <p>Start by adding your first piece of equipment.</p>
                            <Link to="/equipment/new" className="btn btn-primary bg-primary hover:bg-primary-hover text-text-invert">
                                Add Equipment
                            </Link>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead className="bg-surface-muted">
                                <tr>
                                    <th className="text-text-muted">Equipment Name</th>
                                    <th className="text-text-muted">Code</th>
                                    <th className="text-text-muted">Status</th>
                                    <th className="text-text-muted">Assigned To</th>
                                    <th className="text-text-muted">Last Maintenance</th>
                                    <th className="text-text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((item) => (
                                    <tr key={item.id} className="border-b border-border hover:bg-surface-hover">
                                        <td>
                                            <span className="equipment-name text-text">{item.name}</span>
                                        </td>
                                        <td>
                                            <code className="equipment-code bg-surface-muted text-text-muted rounded-sm">{item.code}</code>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="text-text">{item.assignedTo}</td>
                                        <td className="text-text-muted">{item.lastMaintenance}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="action-btn text-text-muted hover:text-primary hover:bg-surface-muted rounded-md" title="View">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                        <circle cx="12" cy="12" r="3" />
                                                    </svg>
                                                </button>
                                                <button className="action-btn" title="Edit">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button className="action-btn action-btn-danger" title="Delete">
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
