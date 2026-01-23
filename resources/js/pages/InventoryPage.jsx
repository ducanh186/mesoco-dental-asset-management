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
 * InventoryPage - Full equipment inventory with search and filters
 */
const InventoryPage = ({ user }) => {
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Mock data - full inventory
    const mockInventory = [
        { 
            id: 1, 
            name: 'Dental X-Ray Machine', 
            code: 'EQ-001', 
            category: 'Imaging',
            location: 'Room 101',
            status: 'available',
            condition: 'Good',
            purchaseDate: '2022-03-15',
            warrantyExpiry: '2027-03-15',
            value: 45000,
            assignedTo: null
        },
        { 
            id: 2, 
            name: 'Autoclave Sterilizer', 
            code: 'EQ-008', 
            category: 'Sterilization',
            location: 'Lab Area',
            status: 'assigned',
            condition: 'Excellent',
            purchaseDate: '2023-06-20',
            warrantyExpiry: '2026-06-20',
            value: 15000,
            assignedTo: 'Lab Team'
        },
        { 
            id: 3, 
            name: 'Dental Chair Unit #1', 
            code: 'EQ-101', 
            category: 'Furniture',
            location: 'Room 101',
            status: 'assigned',
            condition: 'Good',
            purchaseDate: '2021-01-10',
            warrantyExpiry: '2026-01-10',
            value: 25000,
            assignedTo: 'Dr. Smith'
        },
        { 
            id: 4, 
            name: 'Dental Chair Unit #2', 
            code: 'EQ-102', 
            category: 'Furniture',
            location: 'Room 102',
            status: 'maintenance',
            condition: 'Fair',
            purchaseDate: '2021-01-10',
            warrantyExpiry: '2026-01-10',
            value: 25000,
            assignedTo: null
        },
        { 
            id: 5, 
            name: 'Ultrasonic Scaler', 
            code: 'EQ-015', 
            category: 'Cleaning',
            location: 'Storage',
            status: 'available',
            condition: 'Excellent',
            purchaseDate: '2024-02-28',
            warrantyExpiry: '2027-02-28',
            value: 3500,
            assignedTo: null
        },
        { 
            id: 6, 
            name: 'LED Curing Light', 
            code: 'EQ-023', 
            category: 'Treatment',
            location: 'Room 103',
            status: 'assigned',
            condition: 'Good',
            purchaseDate: '2023-11-05',
            warrantyExpiry: '2025-11-05',
            value: 800,
            assignedTo: 'Dr. Johnson'
        },
        { 
            id: 7, 
            name: 'Intraoral Camera', 
            code: 'EQ-034', 
            category: 'Imaging',
            location: 'Room 101',
            status: 'assigned',
            condition: 'Good',
            purchaseDate: '2024-07-12',
            warrantyExpiry: '2026-07-12',
            value: 2500,
            assignedTo: 'Dr. Smith'
        },
        { 
            id: 8, 
            name: 'Compressor Unit', 
            code: 'EQ-201', 
            category: 'Infrastructure',
            location: 'Utility Room',
            status: 'available',
            condition: 'Good',
            purchaseDate: '2020-05-18',
            warrantyExpiry: '2025-05-18',
            value: 8000,
            assignedTo: null
        },
        { 
            id: 9, 
            name: 'Dental Handpiece Set', 
            code: 'EQ-042', 
            category: 'Treatment',
            location: 'Storage',
            status: 'available',
            condition: 'Excellent',
            purchaseDate: '2025-01-02',
            warrantyExpiry: '2028-01-02',
            value: 1200,
            assignedTo: null
        },
        { 
            id: 10, 
            name: 'Panoramic X-Ray', 
            code: 'EQ-003', 
            category: 'Imaging',
            location: 'Imaging Room',
            status: 'assigned',
            condition: 'Excellent',
            purchaseDate: '2024-09-01',
            warrantyExpiry: '2029-09-01',
            value: 85000,
            assignedTo: 'Radiology Dept'
        },
    ];

    const categoryOptions = [
        { value: '', label: 'All Categories' },
        { value: 'Imaging', label: 'Imaging' },
        { value: 'Sterilization', label: 'Sterilization' },
        { value: 'Treatment', label: 'Treatment' },
        { value: 'Cleaning', label: 'Cleaning' },
        { value: 'Furniture', label: 'Furniture' },
        { value: 'Infrastructure', label: 'Infrastructure' },
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'available', label: 'Available' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'maintenance', label: 'In Maintenance' },
        { value: 'retired', label: 'Retired' },
    ];

    // Filter data
    const filteredData = mockInventory.filter(item => {
        const matchesSearch = !searchQuery || 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
    };

    const columns = [
        { 
            key: 'code', 
            label: 'Code',
            width: '100px',
            render: (value) => <code className="text-sm bg-surface-muted px-2 py-1 rounded font-mono">{value}</code>
        },
        { 
            key: 'name', 
            label: 'Equipment',
            render: (value, row) => (
                <div>
                    <p className="font-medium text-text">{value}</p>
                    <p className="text-sm text-text-muted">{row.category}</p>
                </div>
            )
        },
        { key: 'location', label: 'Location' },
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
        { 
            key: 'assignedTo', 
            label: 'Assigned To',
            render: (value) => value || <span className="text-text-light">—</span>
        },
        { 
            key: 'value', 
            label: 'Value',
            align: 'right',
            render: (value) => <span className="font-medium">{formatCurrency(value)}</span>
        },
        {
            key: 'actions',
            label: 'Actions',
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                            setSelectedItem(row);
                            setIsDetailOpen(true);
                        }}
                    >
                        View
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => toast.info(`QR code for ${row.code}`)}
                    >
                        QR
                    </Button>
                </div>
            )
        }
    ];

    // Stats
    const totalValue = mockInventory.reduce((sum, item) => sum + item.value, 0);
    const stats = {
        total: mockInventory.length,
        available: mockInventory.filter(i => i.status === 'available').length,
        assigned: mockInventory.filter(i => i.status === 'assigned').length,
        maintenance: mockInventory.filter(i => i.status === 'maintenance').length,
    };

    return (
        <div className="inventory-page space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-text">{stats.total}</p>
                            <p className="text-sm text-text-muted">Total Items</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-success">{stats.available}</p>
                            <p className="text-sm text-text-muted">Available</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">{stats.assigned}</p>
                            <p className="text-sm text-text-muted">Assigned</p>
                        </div>
                    </CardBody>
                </Card>
                <Card>
                    <CardBody>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-warning">{stats.maintenance}</p>
                            <p className="text-sm text-text-muted">Maintenance</p>
                        </div>
                    </CardBody>
                </Card>
                <Card className="col-span-2 lg:col-span-1">
                    <CardBody>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-text">{formatCurrency(totalValue)}</p>
                            <p className="text-sm text-text-muted">Total Value</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Inventory Table */}
            <Card>
                <CardHeader 
                    title="Equipment Inventory"
                    subtitle={`${filteredData.length} of ${mockInventory.length} items`}
                    action={
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => toast.info('Export coming soon')}>
                                Export
                            </Button>
                            <Button size="sm" onClick={() => toast.info('Add equipment form coming soon')}>
                                Add Equipment
                            </Button>
                        </div>
                    }
                />
                <CardBody>
                    {/* Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by name, code, or location..."
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
                                options={categoryOptions}
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
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
                        emptyMessage="No equipment found"
                        emptyState={
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                                </svg>
                                <h3 className="mt-3 text-sm font-medium text-text">No equipment in inventory</h3>
                                <p className="mt-1 text-sm text-text-muted">Get started by adding your first equipment.</p>
                                <div className="mt-4">
                                    <Button size="sm" onClick={() => toast.info('Add equipment form coming soon')}>
                                        Add Equipment
                                    </Button>
                                </div>
                            </div>
                        }
                    />

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(filteredData.length / 10)}
                            totalItems={filteredData.length}
                            pageSize={10}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </CardBody>
            </Card>

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                title={selectedItem?.name || 'Equipment Details'}
                size="lg"
            >
                {selectedItem && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-text-muted">Equipment Code</p>
                                <p className="font-medium text-text">{selectedItem.code}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Category</p>
                                <p className="font-medium text-text">{selectedItem.category}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Location</p>
                                <p className="font-medium text-text">{selectedItem.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Status</p>
                                <StatusBadge status={selectedItem.status} />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Condition</p>
                                <p className="font-medium text-text">{selectedItem.condition}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Assigned To</p>
                                <p className="font-medium text-text">{selectedItem.assignedTo || '—'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Purchase Date</p>
                                <p className="font-medium text-text">{selectedItem.purchaseDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Warranty Expiry</p>
                                <p className="font-medium text-text">{selectedItem.warrantyExpiry}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-text-muted">Value</p>
                                <p className="text-xl font-bold text-text">{formatCurrency(selectedItem.value)}</p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => toast.info('Edit form coming soon')}>
                                Edit
                            </Button>
                            <Button variant="outline" onClick={() => toast.info('Maintenance history coming soon')}>
                                Maintenance History
                            </Button>
                            <Button onClick={() => toast.info('QR code coming soon')}>
                                Generate QR
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default InventoryPage;
