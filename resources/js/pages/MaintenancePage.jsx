import React, { useState } from 'react';
import { 
    Card, 
    CardHeader, 
    CardBody, 
    Button, 
    Input, 
    Select,
    Badge,
    StatusBadge,
    Table,
    TablePagination,
    useToast 
} from '../components/ui';
import { useI18n } from '../i18n';

/**
 * MaintenancePage - Maintenance schedules and service records
 */
const MaintenancePage = ({ user }) => {
    const { t } = useI18n();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

    // Mock data - maintenance records
    const mockMaintenance = [
        { 
            id: 'MNT-001', 
            equipment: 'Dental X-Ray Machine',
            equipmentCode: 'EQ-001',
            type: 'Scheduled',
            scheduledDate: '2026-01-25',
            status: 'upcoming',
            assignedTo: 'Tech Team',
            priority: 'high',
            description: 'Annual calibration and safety check'
        },
        { 
            id: 'MNT-002', 
            equipment: 'Autoclave Sterilizer',
            equipmentCode: 'EQ-008',
            type: 'Emergency',
            scheduledDate: '2026-01-23',
            status: 'in-progress',
            assignedTo: 'External Vendor',
            priority: 'high',
            description: 'Temperature sensor replacement'
        },
        { 
            id: 'MNT-003', 
            equipment: 'Dental Chair Unit #3',
            equipmentCode: 'EQ-103',
            type: 'Scheduled',
            scheduledDate: '2026-01-20',
            status: 'completed',
            assignedTo: 'Tech Team',
            priority: 'normal',
            description: 'Quarterly inspection and lubrication'
        },
        { 
            id: 'MNT-004', 
            equipment: 'LED Curing Light',
            equipmentCode: 'EQ-023',
            type: 'Preventive',
            scheduledDate: '2026-01-30',
            status: 'upcoming',
            assignedTo: 'Tech Team',
            priority: 'low',
            description: 'Light intensity check and cleaning'
        },
        { 
            id: 'MNT-005', 
            equipment: 'Ultrasonic Scaler',
            equipmentCode: 'EQ-015',
            type: 'Scheduled',
            scheduledDate: '2026-02-05',
            status: 'scheduled',
            assignedTo: 'Tech Team',
            priority: 'normal',
            description: 'Tip replacement and performance test'
        },
        { 
            id: 'MNT-006', 
            equipment: 'Compressor Unit',
            equipmentCode: 'EQ-201',
            type: 'Emergency',
            scheduledDate: '2026-01-19',
            status: 'completed',
            assignedTo: 'External Vendor',
            priority: 'high',
            description: 'Motor bearing replacement'
        },
    ];

    const statusOptions = [
        { value: '', label: t('assets.statuses.all') },
        { value: 'scheduled', label: t('maintenance.types.scheduled') },
        { value: 'upcoming', label: t('maintenance.upcoming') },
        { value: 'in-progress', label: t('maintenance.inProgress') },
        { value: 'completed', label: t('maintenance.completed') },
        { value: 'overdue', label: t('maintenance.overdue') },
    ];

    // Filter data
    const filteredData = mockMaintenance.filter(item => {
        const matchesSearch = !searchQuery || 
            item.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getTypeVariant = (type) => {
        switch (type) {
            case 'Emergency': return 'danger';
            case 'Scheduled': return 'primary';
            case 'Preventive': return 'info';
            default: return 'default';
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'in-progress': return 'primary';
            case 'upcoming': return 'warning';
            case 'scheduled': return 'info';
            case 'overdue': return 'danger';
            default: return 'default';
        }
    };

    const columns = [
        { 
            key: 'id', 
            label: t('maintenance.maintenanceId'),
            width: '100px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded">{value}</code>
        },
        { 
            key: 'equipment', 
            label: t('requests.equipment'),
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.equipmentCode}</p>
                </div>
            )
        },
        { 
            key: 'type', 
            label: t('common.type'),
            render: (value) => <Badge variant={getTypeVariant(value)} size="sm">{value}</Badge>
        },
        { key: 'scheduledDate', label: t('maintenance.scheduledDate') },
        { key: 'assignedTo', label: t('maintenance.assignedTo') },
        { 
            key: 'priority', 
            label: t('requests.priority'),
            render: (value) => {
                const colors = { high: 'danger', normal: 'default', low: 'info' };
                return <Badge variant={colors[value]} size="sm" outline>{value}</Badge>;
            }
        },
        { 
            key: 'status', 
            label: t('common.status'),
            render: (value) => <Badge variant={getStatusVariant(value)} size="sm" dot>{value}</Badge>
        },
        {
            key: 'actions',
            label: t('common.actions'),
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${row.id}`)}>
                        {t('common.view')}
                    </Button>
                    {row.status !== 'completed' && (
                        <Button size="sm" variant="outline" onClick={() => toast.info(`Updating ${row.id}`)}>
                            {t('common.edit')}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Stats
    const stats = {
        upcoming: mockMaintenance.filter(m => m.status === 'upcoming' || m.status === 'scheduled').length,
        inProgress: mockMaintenance.filter(m => m.status === 'in-progress').length,
        completed: mockMaintenance.filter(m => m.status === 'completed').length,
        emergency: mockMaintenance.filter(m => m.type === 'Emergency').length,
    };

    return (
        <div className="maintenance-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.upcoming}</p>
                                <p className="text-sm text-text-muted">{t('maintenance.upcoming')}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v2M12 21v2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.inProgress}</p>
                                <p className="text-sm text-text-muted">{t('maintenance.inProgress')}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-success/10 text-success flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.completed}</p>
                                <p className="text-sm text-text-muted">{t('maintenance.completed')}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-error/10 text-error flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{stats.emergency}</p>
                                <p className="text-sm text-text-muted">{t('maintenance.types.emergency')}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Maintenance Table */}
            <Card>
                <CardHeader 
                    title={t('maintenance.schedule')}
                    subtitle={t('maintenance.subtitle')}
                    action={
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => toast.info(t('maintenance.comingSoon'))}>
                                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                {t('maintenance.calendarView')}
                            </Button>
                            <Button size="sm" onClick={() => toast.info(t('maintenance.comingSoon'))}>
                                {t('maintenance.createSchedule')}
                            </Button>
                        </div>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder={t('maintenance.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                }
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Select
                                options={statusOptions}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={filteredData}
                        emptyMessage={t('maintenance.noRecords')}
                        emptyState={
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42" />
                                </svg>
                                <h3 className="mt-3 text-sm font-medium text-text">{t('maintenance.noRecords')}</h3>
                                <p className="mt-1 text-sm text-text-muted">{t('maintenance.noRecordsHint')}</p>
                            </div>
                        }
                    />

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={1}
                            totalItems={filteredData.length}
                            pageSize={10}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default MaintenancePage;
