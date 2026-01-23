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
    Modal,
    useToast 
} from '../components/ui';

/**
 * RequestsPage - Equipment borrow/return/maintenance requests
 */
const RequestsPage = ({ user }) => {
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

    // Mock data - requests
    const mockRequests = [
        { 
            id: 'REQ-001', 
            type: 'Borrow',
            equipment: 'Portable Dental Unit',
            requestDate: '2026-01-22',
            status: 'pending',
            priority: 'normal',
            requester: 'John Doe',
            notes: 'Needed for offsite clinic visit'
        },
        { 
            id: 'REQ-002', 
            type: 'Maintenance',
            equipment: 'Dental X-Ray Machine',
            requestDate: '2026-01-21',
            status: 'approved',
            priority: 'high',
            requester: 'John Doe',
            notes: 'Calibration required'
        },
        { 
            id: 'REQ-003', 
            type: 'Return',
            equipment: 'Ultrasonic Scaler',
            requestDate: '2026-01-20',
            status: 'completed',
            priority: 'normal',
            requester: 'Jane Smith',
            notes: ''
        },
        { 
            id: 'REQ-004', 
            type: 'Borrow',
            equipment: 'LED Curing Light',
            requestDate: '2026-01-19',
            status: 'rejected',
            priority: 'low',
            requester: 'Bob Wilson',
            notes: 'Equipment not available'
        },
        { 
            id: 'REQ-005', 
            type: 'Maintenance',
            equipment: 'Autoclave Sterilizer',
            requestDate: '2026-01-18',
            status: 'pending',
            priority: 'high',
            requester: 'Alice Brown',
            notes: 'Temperature issues'
        },
        { 
            id: 'REQ-006', 
            type: 'Borrow',
            equipment: 'Intraoral Camera',
            requestDate: '2026-01-17',
            status: 'approved',
            priority: 'normal',
            requester: 'John Doe',
            notes: 'Patient documentation'
        },
    ];

    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'Borrow', label: 'Borrow' },
        { value: 'Return', label: 'Return' },
        { value: 'Maintenance', label: 'Maintenance' },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'completed', label: 'Completed' },
    ];

    // Filter data
    const filteredData = mockRequests.filter(item => {
        const matchesSearch = !searchQuery || 
            item.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !typeFilter || item.type === typeFilter;
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });

    const getTypeVariant = (type) => {
        switch (type) {
            case 'Borrow': return 'primary';
            case 'Return': return 'info';
            case 'Maintenance': return 'warning';
            default: return 'default';
        }
    };

    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'high': return 'danger';
            case 'normal': return 'default';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    const columns = [
        { 
            key: 'id', 
            label: 'Request ID',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded">{value}</code>
        },
        { 
            key: 'type', 
            label: 'Type',
            render: (value) => <Badge variant={getTypeVariant(value)} size="sm">{value}</Badge>
        },
        { 
            key: 'equipment', 
            label: 'Equipment',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    {row.notes && <p className="text-sm text-text-muted truncate max-w-[200px]">{row.notes}</p>}
                </div>
            )
        },
        { key: 'requestDate', label: 'Request Date' },
        { 
            key: 'priority', 
            label: 'Priority',
            render: (value) => <Badge variant={getPriorityVariant(value)} size="sm" outline>{value}</Badge>
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => toast.info(`Viewing ${row.id}`)}>
                        View
                    </Button>
                    {row.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => toast.warning(`Cancelling ${row.id}`)}>
                            Cancel
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // Stats
    const stats = {
        pending: mockRequests.filter(r => r.status === 'pending').length,
        approved: mockRequests.filter(r => r.status === 'approved').length,
        completed: mockRequests.filter(r => r.status === 'completed').length,
    };

    return (
        <div className="requests-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-text">{mockRequests.length}</p>
                            <p className="text-sm text-text-muted">Total Requests</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-warning">{stats.pending}</p>
                            <p className="text-sm text-text-muted">Pending</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-success">{stats.approved}</p>
                            <p className="text-sm text-text-muted">Approved</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-info">{stats.completed}</p>
                            <p className="text-sm text-text-muted">Completed</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Requests Table */}
            <Card>
                <CardHeader 
                    title="All Requests"
                    subtitle="Manage equipment borrow, return, and maintenance requests"
                    action={
                        <Button size="sm" onClick={() => setIsNewRequestOpen(true)}>
                            New Request
                        </Button>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by equipment or request ID..."
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
                        <div className="w-full sm:w-40">
                            <Select
                                options={typeOptions}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-40">
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
                        emptyMessage="No requests found"
                        emptyState={
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                    <rect x="9" y="3" width="6" height="4" rx="1" />
                                </svg>
                                <h3 className="mt-3 text-sm font-medium text-text">No requests</h3>
                                <p className="mt-1 text-sm text-text-muted">Get started by creating a new request.</p>
                                <div className="mt-4">
                                    <Button size="sm" onClick={() => setIsNewRequestOpen(true)}>New Request</Button>
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

            {/* New Request Modal */}
            <Modal
                isOpen={isNewRequestOpen}
                onClose={() => setIsNewRequestOpen(false)}
                title="New Request"
                size="md"
                footer={
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => setIsNewRequestOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={() => {
                            toast.success('Request submitted successfully!');
                            setIsNewRequestOpen(false);
                        }}>
                            Submit Request
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <Select
                        label="Request Type"
                        options={[
                            { value: 'borrow', label: 'Borrow Equipment' },
                            { value: 'return', label: 'Return Equipment' },
                            { value: 'maintenance', label: 'Request Maintenance' },
                        ]}
                        required
                    />
                    <Select
                        label="Equipment"
                        options={[
                            { value: '1', label: 'Dental X-Ray Machine (EQ-001)' },
                            { value: '2', label: 'Ultrasonic Scaler (EQ-015)' },
                            { value: '3', label: 'LED Curing Light (EQ-023)' },
                            { value: '4', label: 'Intraoral Camera (EQ-034)' },
                        ]}
                        required
                    />
                    <Select
                        label="Priority"
                        options={[
                            { value: 'low', label: 'Low' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'high', label: 'High' },
                        ]}
                    />
                    <Input
                        label="Notes"
                        placeholder="Add any additional details..."
                    />
                </div>
            </Modal>
        </div>
    );
};

export default RequestsPage;
