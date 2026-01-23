import React, { useState } from 'react';
import {
    Button,
    ButtonGroup,
    Input,
    Textarea,
    Select,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Badge,
    StatusBadge,
    Table,
    TableCard,
    TablePagination,
    Modal,
    ConfirmModal,
    useToast,
} from '../components/ui';

/**
 * UI Kit Showcase Page
 * Demonstrates all UI components with their various states
 */
const UIKit = () => {
    const toast = useToast();
    
    // Component states
    const [inputValue, setInputValue] = useState('');
    const [selectValue, setSelectValue] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Sample data
    const selectOptions = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
        { value: 'disabled', label: 'Disabled Option', disabled: true },
    ];

    const tableColumns = [
        { key: 'id', label: 'ID', width: '80px' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
        { 
            key: 'actions', 
            label: 'Actions', 
            align: 'right',
            render: (_, row) => (
                <Button size="sm" variant="ghost" onClick={() => toast.info(`Clicked row ${row.id}`)}>
                    View
                </Button>
            )
        },
    ];

    const tableData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active' },
        { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', status: 'rejected' },
    ];

    const handleLoadingDemo = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 2000);
    };

    const handleTableLoadingDemo = () => {
        setTableLoading(true);
        setTimeout(() => setTableLoading(false), 2000);
    };

    // Section Component
    const Section = ({ title, children }) => (
        <section className="ui-kit-section bg-surface rounded-lg shadow-sm border border-border">
            <h2 className="ui-kit-section-title bg-surface-muted text-text border-b border-border">{title}</h2>
            <div className="ui-kit-section-content">{children}</div>
        </section>
    );

    // Subsection Component
    const Subsection = ({ title, children }) => (
        <div className="ui-kit-subsection">
            <h3 className="ui-kit-subsection-title text-text-muted border-b border-border">{title}</h3>
            <div className="ui-kit-subsection-content">{children}</div>
        </div>
    );

    return (
        <div className="ui-kit-page min-h-screen bg-background">
            <header className="ui-kit-header border-b border-border">
                <h1 className="ui-kit-title text-text">UI Kit</h1>
                <p className="ui-kit-subtitle text-text-muted">
                    OrangeHRM-inspired component library built with React and Tailwind CSS
                </p>
            </header>

            <div className="ui-kit-content">
                {/* ============================================ */}
                {/* BUTTONS */}
                {/* ============================================ */}
                <Section title="Buttons">
                    <Subsection title="Variants">
                        <div className="ui-kit-row">
                            <Button variant="primary">Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="danger">Danger</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="outline">Outline</Button>
                        </div>
                    </Subsection>

                    <Subsection title="Sizes">
                        <div className="ui-kit-row ui-kit-row-center">
                            <Button size="sm">Small</Button>
                            <Button size="md">Medium</Button>
                            <Button size="lg">Large</Button>
                        </div>
                    </Subsection>

                    <Subsection title="States">
                        <div className="ui-kit-row">
                            <Button>Default</Button>
                            <Button disabled>Disabled</Button>
                            <Button loading={isLoading} onClick={handleLoadingDemo}>
                                {isLoading ? 'Loading...' : 'Click to Load'}
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="With Icons">
                        <div className="ui-kit-row">
                            <Button 
                                leftIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                }
                            >
                                Add Item
                            </Button>
                            <Button 
                                variant="secondary"
                                rightIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Button Group">
                        <ButtonGroup>
                            <Button variant="outline">Left</Button>
                            <Button variant="outline">Center</Button>
                            <Button variant="outline">Right</Button>
                        </ButtonGroup>
                    </Subsection>

                    <Subsection title="Full Width">
                        <Button fullWidth>Full Width Button</Button>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* INPUTS */}
                {/* ============================================ */}
                <Section title="Inputs">
                    <Subsection title="Basic Input">
                        <div className="ui-kit-form-grid">
                            <Input 
                                label="Default Input" 
                                placeholder="Enter text..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Input 
                                label="Required Input" 
                                placeholder="This is required"
                                required 
                            />
                            <Input 
                                label="With Helper" 
                                placeholder="Enter email"
                                helper="We'll never share your email"
                            />
                            <Input 
                                label="With Error" 
                                placeholder="Invalid input"
                                error="This field is required"
                                value="bad value"
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Input States">
                        <div className="ui-kit-form-grid">
                            <Input 
                                label="Disabled" 
                                placeholder="Disabled input"
                                disabled 
                            />
                            <Input 
                                label="Read Only" 
                                value="Read only value"
                                readOnly 
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Input Sizes">
                        <div className="ui-kit-form-grid">
                            <Input label="Small" size="sm" placeholder="Small input" />
                            <Input label="Medium" size="md" placeholder="Medium input" />
                            <Input label="Large" size="lg" placeholder="Large input" />
                        </div>
                    </Subsection>

                    <Subsection title="Input Types">
                        <div className="ui-kit-form-grid">
                            <Input label="Password" type="password" placeholder="Enter password" />
                            <Input label="Email" type="email" placeholder="user@example.com" />
                            <Input label="Number" type="number" placeholder="0" />
                            <Input label="Date" type="date" />
                        </div>
                    </Subsection>

                    <Subsection title="With Icons">
                        <div className="ui-kit-form-grid">
                            <Input 
                                label="Search" 
                                placeholder="Search..."
                                leftIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                }
                            />
                            <Input 
                                label="Email" 
                                placeholder="Enter email"
                                type="email"
                                rightIcon={
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                }
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Textarea">
                        <div className="ui-kit-form-grid">
                            <Textarea 
                                label="Description" 
                                placeholder="Enter description..."
                                helper="Max 500 characters"
                            />
                            <Textarea 
                                label="With Error" 
                                placeholder="Invalid content"
                                error="Description is too short"
                                rows={3}
                            />
                        </div>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* SELECT */}
                {/* ============================================ */}
                <Section title="Select">
                    <Subsection title="Basic Select">
                        <div className="ui-kit-form-grid">
                            <Select 
                                label="Default Select"
                                options={selectOptions}
                                value={selectValue}
                                onChange={(e) => setSelectValue(e.target.value)}
                            />
                            <Select 
                                label="Required Select"
                                options={selectOptions}
                                required
                            />
                            <Select 
                                label="With Helper"
                                options={selectOptions}
                                helper="Choose one option"
                            />
                            <Select 
                                label="With Error"
                                options={selectOptions}
                                error="Please select an option"
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Select States">
                        <div className="ui-kit-form-grid">
                            <Select 
                                label="Disabled"
                                options={selectOptions}
                                disabled
                            />
                        </div>
                    </Subsection>

                    <Subsection title="Select Sizes">
                        <div className="ui-kit-form-grid">
                            <Select label="Small" size="sm" options={selectOptions} />
                            <Select label="Medium" size="md" options={selectOptions} />
                            <Select label="Large" size="lg" options={selectOptions} />
                        </div>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* CARDS */}
                {/* ============================================ */}
                <Section title="Cards">
                    <Subsection title="Card Variants">
                        <div className="ui-kit-card-grid">
                            <Card>
                                <CardHeader title="Default Card" subtitle="Card subtitle" />
                                <CardBody>
                                    <p>This is the default card variant with standard styling.</p>
                                </CardBody>
                                <CardFooter>
                                    <Button size="sm">Action</Button>
                                </CardFooter>
                            </Card>

                            <Card variant="outlined">
                                <CardHeader title="Outlined Card" />
                                <CardBody>
                                    <p>This card has a subtle border instead of a shadow.</p>
                                </CardBody>
                            </Card>

                            <Card variant="elevated">
                                <CardHeader title="Elevated Card" />
                                <CardBody>
                                    <p>This card has a more prominent shadow.</p>
                                </CardBody>
                            </Card>
                        </div>
                    </Subsection>

                    <Subsection title="Card with Action">
                        <Card>
                            <CardHeader 
                                title="Users" 
                                subtitle="Manage your team members"
                                action={<Button size="sm">Add User</Button>}
                            />
                            <CardBody>
                                <p>Card content goes here with an action button in the header.</p>
                            </CardBody>
                            <CardFooter align="between">
                                <span className="text-sm text-gray-500">Last updated: Today</span>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost">Cancel</Button>
                                    <Button size="sm">Save</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* BADGES */}
                {/* ============================================ */}
                <Section title="Badges">
                    <Subsection title="Variants">
                        <div className="ui-kit-row">
                            <Badge variant="default">Default</Badge>
                            <Badge variant="primary">Primary</Badge>
                            <Badge variant="success">Success</Badge>
                            <Badge variant="warning">Warning</Badge>
                            <Badge variant="danger">Danger</Badge>
                            <Badge variant="info">Info</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Sizes">
                        <div className="ui-kit-row ui-kit-row-center">
                            <Badge size="sm">Small</Badge>
                            <Badge size="md">Medium</Badge>
                            <Badge size="lg">Large</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="With Dot Indicator">
                        <div className="ui-kit-row">
                            <Badge variant="success" dot>Online</Badge>
                            <Badge variant="warning" dot>Away</Badge>
                            <Badge variant="danger" dot>Busy</Badge>
                            <Badge variant="default" dot>Offline</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Outline Style">
                        <div className="ui-kit-row">
                            <Badge variant="primary" outline>Primary</Badge>
                            <Badge variant="success" outline>Success</Badge>
                            <Badge variant="danger" outline>Danger</Badge>
                        </div>
                    </Subsection>

                    <Subsection title="Status Badges (Predefined)">
                        <div className="ui-kit-row">
                            <StatusBadge status="active" />
                            <StatusBadge status="pending" />
                            <StatusBadge status="inactive" />
                            <StatusBadge status="approved" />
                            <StatusBadge status="rejected" />
                            <StatusBadge status="maintenance" />
                            <StatusBadge status="available" />
                            <StatusBadge status="assigned" />
                            <StatusBadge status="overdue" />
                        </div>
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* TABLE */}
                {/* ============================================ */}
                <Section title="Table">
                    <Subsection title="Basic Table">
                        <Table 
                            columns={tableColumns}
                            data={tableData}
                        />
                    </Subsection>

                    <Subsection title="Table with Card Wrapper">
                        <TableCard
                            title="Team Members"
                            subtitle="Manage your organization's users"
                            action={<Button size="sm">Add Member</Button>}
                            columns={tableColumns}
                            data={tableData}
                        >
                            <TablePagination 
                                currentPage={currentPage}
                                totalPages={3}
                                totalItems={15}
                                pageSize={5}
                                onPageChange={setCurrentPage}
                            />
                        </TableCard>
                    </Subsection>

                    <Subsection title="Loading State">
                        <div className="mb-4">
                            <Button size="sm" onClick={handleTableLoadingDemo}>
                                Toggle Loading
                            </Button>
                        </div>
                        <Table 
                            columns={tableColumns}
                            data={tableData}
                            loading={tableLoading}
                        />
                    </Subsection>

                    <Subsection title="Empty State">
                        <Table 
                            columns={tableColumns}
                            data={[]}
                            emptyMessage="No team members found"
                        />
                    </Subsection>

                    <Subsection title="Custom Empty State">
                        <Table 
                            columns={tableColumns}
                            data={[]}
                            emptyState={
                                <div className="text-center py-8">
                                    <svg 
                                        className="mx-auto h-12 w-12 text-gray-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new team member.</p>
                                    <div className="mt-4">
                                        <Button size="sm">Add Team Member</Button>
                                    </div>
                                </div>
                            }
                        />
                    </Subsection>

                    <Subsection title="Clickable Rows">
                        <Table 
                            columns={tableColumns.slice(0, 4)}
                            data={tableData}
                            onRowClick={(row) => toast.info(`Clicked: ${row.name}`)}
                        />
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* MODAL */}
                {/* ============================================ */}
                <Section title="Modal">
                    <Subsection title="Basic Modal">
                        <div className="ui-kit-row">
                            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                            <Button variant="danger" onClick={() => setIsConfirmOpen(true)}>
                                Open Confirm Dialog
                            </Button>
                        </div>

                        <Modal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Example Modal"
                            footer={
                                <div className="ui-modal-footer-buttons">
                                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => {
                                        toast.success('Saved successfully!');
                                        setIsModalOpen(false);
                                    }}>
                                        Save Changes
                                    </Button>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <p>This is a basic modal dialog with a title, body content, and footer actions.</p>
                                <Input label="Name" placeholder="Enter your name" />
                                <Select 
                                    label="Category" 
                                    options={selectOptions}
                                />
                            </div>
                        </Modal>

                        <ConfirmModal
                            isOpen={isConfirmOpen}
                            onClose={() => setIsConfirmOpen(false)}
                            onConfirm={() => {
                                toast.success('Action confirmed!');
                                setIsConfirmOpen(false);
                            }}
                            title="Delete Item"
                            message="Are you sure you want to delete this item? This action cannot be undone."
                            confirmText="Delete"
                            cancelText="Cancel"
                            variant="danger"
                        />
                    </Subsection>
                </Section>

                {/* ============================================ */}
                {/* TOAST */}
                {/* ============================================ */}
                <Section title="Toast Notifications">
                    <Subsection title="Toast Types">
                        <div className="ui-kit-row">
                            <Button 
                                variant="primary" 
                                onClick={() => toast.success('Operation completed successfully!')}
                            >
                                Success Toast
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={() => toast.error('Something went wrong. Please try again.')}
                            >
                                Error Toast
                            </Button>
                            <Button 
                                variant="secondary" 
                                onClick={() => toast.warning('Please review your input before submitting.')}
                            >
                                Warning Toast
                            </Button>
                            <Button 
                                variant="ghost" 
                                onClick={() => toast.info('Here is some helpful information.')}
                            >
                                Info Toast
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Toast with Title">
                        <div className="ui-kit-row">
                            <Button onClick={() => toast.addToast({
                                type: 'success',
                                title: 'Success!',
                                message: 'Your changes have been saved successfully.',
                            })}>
                                With Title
                            </Button>
                            <Button onClick={() => toast.addToast({
                                type: 'error',
                                title: 'Error',
                                message: 'Failed to save changes. Please check your connection and try again.',
                                duration: 10000,
                            })}>
                                Long Duration (10s)
                            </Button>
                        </div>
                    </Subsection>

                    <Subsection title="Multiple Toasts">
                        <Button onClick={() => {
                            toast.success('First notification');
                            setTimeout(() => toast.info('Second notification'), 500);
                            setTimeout(() => toast.warning('Third notification'), 1000);
                        }}>
                            Show Multiple Toasts
                        </Button>
                    </Subsection>
                </Section>
            </div>
        </div>
    );
};

export default UIKit;
