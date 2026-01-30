import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input, 
    Select,
    Badge,
    Table,
    TablePagination,
    useToast,
    LoadingSpinner
} from '../components/ui';
import { myAssetHistoryApi, handleApiError } from '../services/api';

/**
 * MyAssetHistoryPage - Personal asset history timeline (Phase 6)
 * All roles - shows assignment and check-in history for the current user
 */
const MyAssetHistoryPage = ({ user }) => {
    const toast = useToast();
    
    // State
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0
    });

    // Filter states
    const [eventTypeFilter, setEventTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Event type icons
    const eventTypeConfig = {
        assigned: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
            ),
            color: 'text-success',
            bgColor: 'bg-success/10',
            label: 'Assigned'
        },
        unassigned: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="18" y1="11" x2="23" y2="11" />
                </svg>
            ),
            color: 'text-warning',
            bgColor: 'bg-warning/10',
            label: 'Unassigned'
        },
        checkin: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
            ),
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            label: 'Check-in'
        },
        checkout: {
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
            ),
            color: 'text-info',
            bgColor: 'bg-info/10',
            label: 'Check-out'
        }
    };

    // Fetch summary
    const fetchSummary = useCallback(async () => {
        try {
            setSummaryLoading(true);
            const data = await myAssetHistoryApi.summary();
            setSummary(data.summary);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setSummaryLoading(false);
        }
    }, [toast]);

    // Fetch events
    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                per_page: 20,
                event_type: eventTypeFilter || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            };
            
            const data = await myAssetHistoryApi.list(params);
            setEvents(data.events || []);
            setPagination(data.pagination);
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [currentPage, eventTypeFilter, dateFrom, dateTo, toast]);

    // Initial load
    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [eventTypeFilter, dateFrom, dateTo]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const eventTypeOptions = [
        { value: '', label: 'All Events' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'unassigned', label: 'Unassigned' },
        { value: 'checkin', label: 'Check-in' },
        { value: 'checkout', label: 'Check-out' },
    ];

    const clearFilters = () => {
        setEventTypeFilter('');
        setDateFrom('');
        setDateTo('');
    };

    return (
        <div className="my-asset-history-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryLoading ? (
                    <div className="col-span-4 flex justify-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : summary && (
                    <>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-primary">{summary.current_assignments}</p>
                                    <p className="text-sm text-text-muted">Current Assignments</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-text">{summary.total_assignments}</p>
                                    <p className="text-sm text-text-muted">Total Assignments</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-success">{summary.total_checkins}</p>
                                    <p className="text-sm text-text-muted">Total Check-ins</p>
                                </div>
                            </CardBody>
                        </Card>
                        <Card>
                            <CardBody>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-info">{summary.checkins_this_month}</p>
                                    <p className="text-sm text-text-muted">Check-ins This Month</p>
                                </div>
                            </CardBody>
                        </Card>
                    </>
                )}
            </div>

            {/* History Timeline */}
            <Card>
                <CardHeader 
                    title="My Asset History"
                    subtitle="Timeline of your asset assignments and check-ins"
                    action={
                        <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={clearFilters}
                            disabled={!eventTypeFilter && !dateFrom && !dateTo}
                        >
                            Clear Filters
                        </Button>
                    }
                />
                <CardBody>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="w-full sm:w-48">
                            <Select
                                options={eventTypeOptions}
                                value={eventTypeFilter}
                                onChange={(e) => setEventTypeFilter(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <Input
                                type="date"
                                placeholder="From date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-44">
                            <Input
                                type="date"
                                placeholder="To date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Timeline */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <h3 className="mt-3 text-sm font-medium text-text">No history found</h3>
                            <p className="mt-1 text-sm text-text-muted">
                                {eventTypeFilter || dateFrom || dateTo 
                                    ? 'Try adjusting your filters.'
                                    : 'Your asset history will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                            
                            {/* Events */}
                            <div className="space-y-4">
                                {events.map((event) => {
                                    const config = eventTypeConfig[event.event_type] || eventTypeConfig.assigned;
                                    
                                    return (
                                        <div key={event.id} className="relative flex gap-4 pl-3">
                                            {/* Icon */}
                                            <div className={`relative z-10 flex-shrink-0 w-7 h-7 rounded-full ${config.bgColor} flex items-center justify-center ${config.color}`}>
                                                {config.icon}
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 bg-surface-muted rounded-lg p-4 -mt-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={
                                                            event.event_type === 'assigned' ? 'success' :
                                                            event.event_type === 'unassigned' ? 'warning' :
                                                            event.event_type === 'checkin' ? 'primary' : 'info'
                                                        } size="sm">
                                                            {config.label}
                                                        </Badge>
                                                        <span className="text-sm text-text-muted">
                                                            {formatDateTime(event.event_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-text">
                                                            {event.asset?.name || 'Unknown Asset'}
                                                        </p>
                                                        <p className="text-sm text-text-muted">
                                                            Code: {event.asset?.asset_code || '—'} • Type: {event.asset?.type || '—'}
                                                        </p>
                                                        
                                                        {/* Event-specific details */}
                                                        {event.details && (
                                                            <div className="mt-2 text-sm text-text-muted">
                                                                {event.event_type === 'assigned' && event.details.assigned_by && (
                                                                    <p>Assigned by: {event.details.assigned_by}</p>
                                                                )}
                                                                {(event.event_type === 'checkin' || event.event_type === 'checkout') && (
                                                                    <>
                                                                        {event.details.shift && <p>Shift: {event.details.shift}</p>}
                                                                        {event.details.shift_date && <p>Date: {formatDate(event.details.shift_date)}</p>}
                                                                        {event.details.source && <p>Source: {event.details.source}</p>}
                                                                        {event.details.notes && <p>Notes: {event.details.notes}</p>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {events.length > 0 && (
                        <div className="mt-6">
                            <TablePagination
                                currentPage={pagination.current_page}
                                totalPages={pagination.last_page}
                                totalItems={pagination.total}
                                pageSize={pagination.per_page}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default MyAssetHistoryPage;
