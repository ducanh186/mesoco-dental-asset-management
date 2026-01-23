import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

/**
 * MyEquipmentPage - Equipment assigned to current user
 */
const MyEquipmentPage = ({ user }) => {
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Mock data - equipment assigned to user
    const mockEquipment = [
        { 
            id: 1, 
            name: 'Dental X-Ray Machine', 
            code: 'EQ-001', 
            category: 'Imaging',
            assignedDate: '2025-11-15',
            condition: 'Good',
            status: 'active',
            nextMaintenance: '2026-02-15'
        },
        { 
            id: 2, 
            name: 'Ultrasonic Scaler', 
            code: 'EQ-015', 
            category: 'Cleaning',
            assignedDate: '2025-12-01',
            condition: 'Excellent',
            status: 'active',
            nextMaintenance: '2026-03-01'
        },
        { 
            id: 3, 
            name: 'LED Curing Light', 
            code: 'EQ-023', 
            category: 'Treatment',
            assignedDate: '2026-01-05',
            condition: 'Good',
            status: 'active',
            nextMaintenance: '2026-04-05'
        },
        { 
            id: 4, 
            name: 'Intraoral Camera', 
            code: 'EQ-034', 
            category: 'Imaging',
            assignedDate: '2026-01-10',
            condition: 'Fair',
            status: 'maintenance',
            nextMaintenance: '2026-01-25'
        },
        { 
            id: 5, 
            name: 'Dental Handpiece', 
            code: 'EQ-042', 
            category: 'Treatment',
            assignedDate: '2025-10-20',
            condition: 'Good',
            status: 'active',
            nextMaintenance: '2026-01-30'
        },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'maintenance', label: 'In Maintenance' },
        { value: 'pending', label: 'Pending Return' },
    ];

    // Filter data
    const filteredData = mockEquipment.filter(item => {
        const matchesSearch = !searchQuery || 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const columns = [
        { 
            key: 'name', 
            label: 'Equipment',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.code}</p>
                </div>
            )
        },
        { key: 'category', label: 'Category' },
        { key: 'assignedDate', label: 'Assigned Date' },
        { 
            key: 'condition', 
            label: 'Condition',
            render: (value) => {
                const variant = value === 'Excellent' ? 'success' : value === 'Good' ? 'info' : 'warning';
                return <Badge variant={variant} size="sm">{value}</Badge>;
            }
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        { key: 'nextMaintenance', label: 'Next Maintenance' },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${row.name}`)}>
                        View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toast.info(`Request return for ${row.name}`)}>
                        Return
                    </Button>
                </div>
            )
        }
    ];

    const handleRequestEquipment = () => {
        toast.info('Opening equipment request form...');
    };

    return (
        <div className="my-equipment-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{mockEquipment.length}</p>
                                <p className="text-sm text-text-muted">Total Assigned</p>
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
                                <p className="text-2xl font-bold text-text">{mockEquipment.filter(e => e.status === 'active').length}</p>
                                <p className="text-sm text-text-muted">Active</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text">{mockEquipment.filter(e => e.status === 'maintenance').length}</p>
                                <p className="text-sm text-text-muted">In Maintenance</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card>
                <CardHeader 
                    title="My Equipment"
                    subtitle={`${filteredData.length} items assigned to you`}
                    action={
                        <Button size="sm" onClick={handleRequestEquipment}>
                            Request Equipment
                        </Button>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name or code..."
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
                                placeholder="Filter by status"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        columns={columns}
                        data={filteredData}
                        emptyMessage="No equipment assigned to you yet"
                        emptyState={
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                <h3 className="mt-3 text-sm font-medium text-text">No equipment assigned</h3>
                                <p className="mt-1 text-sm text-text-muted">Get started by requesting equipment.</p>
                                <div className="mt-4">
                                    <Button size="sm" onClick={handleRequestEquipment}>Request Equipment</Button>
                                </div>
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

export default MyEquipmentPage;
