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
    Modal,
    useToast
} from '../components/ui';
import { useI18n } from '../i18n';
import { employeesApi, contractsApi, handleApiError } from '../services/api';

/**
 * EmployeesPage - Employee Management (Admin/HR)
 * 
 * Requirements: 2.4 Employee
 * - Tab 1: General Information (employee master data)
 * - Tab 2: Contract (employee contracts)
 * 
 * Features:
 * - List employees with search/filter
 * - Create/Edit employee
 * - View/Manage contracts per employee
 */
const EmployeesPage = ({ user }) => {
    const toast = useToast();
    const { t, locale } = useI18n();
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    // Tab state
    const [activeTab, setActiveTab] = useState('general'); // 'general' | 'contract'

    // ========================================================================
    // GENERAL TAB STATE
    // ========================================================================
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [hasUserFilter, setHasUserFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form state for General Info
    const [formData, setFormData] = useState({
        employee_code: '',
        full_name: '',
        position: '',
        dob: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        status: 'active',
    });

    // ========================================================================
    // CONTRACT TAB STATE
    // ========================================================================
    const [contracts, setContracts] = useState([]);
    const [contractsLoading, setContractsLoading] = useState(false);
    const [contractsPagination, setContractsPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
    const [contractsPage, setContractsPage] = useState(1);
    const [contractStatusFilter, setContractStatusFilter] = useState('');
    const [contractTypeFilter, setContractTypeFilter] = useState('');
    const [showContractModal, setShowContractModal] = useState(false);
    const [contractFormLoading, setContractFormLoading] = useState(false);
    const [contractFormData, setContractFormData] = useState({
        employee_id: '',
        contract_type: 'FULL_TIME',
        department: '',
        start_date: '',
        end_date: '',
        status: 'ACTIVE',
        pdf_file: null,
    });

    // Status options
    const statusOptions = [
        { value: '', label: t('common.all') },
        { value: 'active', label: t('employees.statuses.active') },
        { value: 'inactive', label: t('employees.statuses.inactive') },
    ];

    const hasUserOptions = [
        { value: '', label: t('common.all') },
        { value: 'true', label: t('employees.hasUser') },
        { value: 'false', label: t('employees.noUser') },
    ];

    const genderOptions = [
        { value: '', label: t('common.select') },
        { value: 'male', label: t('employees.genders.male') },
        { value: 'female', label: t('employees.genders.female') },
        { value: 'other', label: t('employees.genders.other') },
    ];

    // Contract options
    const contractTypes = [
        { value: 'FULL_TIME', label: t('contracts.types.fullTime') },
        { value: 'PART_TIME', label: t('contracts.types.partTime') },
        { value: 'INTERN', label: t('contracts.types.intern') },
        { value: 'OUTSOURCE', label: t('contracts.types.outsource') },
    ];

    const contractStatusOptions = [
        { value: '', label: t('common.all') },
        { value: 'active', label: t('contracts.statuses.active') },
        { value: 'expired', label: t('contracts.statuses.expired') },
        { value: 'terminated', label: t('contracts.statuses.terminated') },
        { value: 'pending', label: t('contracts.statuses.pending') },
    ];

    // ========================================================================
    // DATA FETCHING - GENERAL TAB
    // ========================================================================
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            const params = { 
                page: currentPage,
                per_page: 15,
            };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;
            if (hasUserFilter) params.has_user = hasUserFilter;

            const response = await employeesApi.list(params);
            setEmployees(response.employees || response.data || []);
            setPagination(response.pagination || { current_page: 1, last_page: 1, total: 0, per_page: 15 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, statusFilter, hasUserFilter, toast]);

    useEffect(() => {
        if (activeTab === 'general') {
            fetchEmployees();
        }
    }, [fetchEmployees, activeTab]);

    // ========================================================================
    // DATA FETCHING - CONTRACT TAB
    // ========================================================================
    const fetchContracts = useCallback(async () => {
        if (!selectedEmployee) return;
        
        setContractsLoading(true);
        try {
            const params = { page: contractsPage };
            if (contractStatusFilter) params.status = contractStatusFilter;
            if (contractTypeFilter) params.type = contractTypeFilter;
            
            const response = await contractsApi.listByEmployee(selectedEmployee.id, params);
            setContracts(response.data || response.contracts || []);
            setContractsPagination(response.pagination || { current_page: 1, last_page: 1, total: 0, per_page: 15 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setContractsLoading(false);
        }
    }, [selectedEmployee, contractsPage, contractStatusFilter, contractTypeFilter, toast]);

    useEffect(() => {
        if (activeTab === 'contract' && selectedEmployee) {
            fetchContracts();
        }
    }, [fetchContracts, activeTab, selectedEmployee]);

    // ========================================================================
    // HANDLERS - GENERAL TAB
    // ========================================================================
    const handleSearch = () => {
        setCurrentPage(1);
        fetchEmployees();
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const resetForm = () => {
        setFormData({
            employee_code: '',
            full_name: '',
            position: '',
            dob: '',
            gender: '',
            phone: '',
            email: '',
            address: '',
            status: 'active',
        });
    };

    const handleOpenCreate = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const handleOpenEdit = (employee) => {
        setSelectedEmployee(employee);
        setFormData({
            employee_code: employee.employee_code || '',
            full_name: employee.full_name || '',
            position: employee.position || '',
            dob: employee.dob ? employee.dob.split('T')[0] : '',
            gender: employee.gender || '',
            phone: employee.phone || '',
            email: employee.email || '',
            address: employee.address || '',
            status: employee.status || 'active',
        });
        setShowEditModal(true);
    };

    const handleCreate = async () => {
        if (!formData.employee_code || !formData.full_name) {
            toast.error(t('employees.requiredFields'));
            return;
        }

        setFormLoading(true);
        try {
            await employeesApi.create(formData);
            toast.success(t('employees.createSuccess'));
            setShowCreateModal(false);
            resetForm();
            fetchEmployees();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!formData.full_name) {
            toast.error(t('employees.requiredFields'));
            return;
        }

        setFormLoading(true);
        try {
            await employeesApi.update(selectedEmployee.id, formData);
            toast.success(t('employees.updateSuccess'));
            setShowEditModal(false);
            setSelectedEmployee(null);
            fetchEmployees();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (employee) => {
        if (!window.confirm(t('employees.deleteConfirm', { name: employee.full_name }))) return;

        try {
            await employeesApi.delete(employee.id);
            toast.success(t('employees.deleteSuccess'));
            fetchEmployees();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleViewContracts = (employee) => {
        setSelectedEmployee(employee);
        setActiveTab('contract');
        setContractsPage(1);
    };

    // ========================================================================
    // HANDLERS - CONTRACT TAB
    // ========================================================================
    const handleOpenContractCreate = () => {
        setContractFormData({
            employee_id: selectedEmployee?.id || '',
            contract_type: 'FULL_TIME',
            department: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            status: 'ACTIVE',
            pdf_file: null,
        });
        setShowContractModal(true);
    };

    const handleContractCreate = async () => {
        if (!contractFormData.start_date) {
            toast.error(t('contracts.startDateRequired'));
            return;
        }

        setContractFormLoading(true);
        try {
            const data = new FormData();
            data.append('contract_type', contractFormData.contract_type);
            data.append('start_date', contractFormData.start_date);
            if (contractFormData.end_date) data.append('end_date', contractFormData.end_date);
            if (contractFormData.department) data.append('department', contractFormData.department);
            data.append('status', contractFormData.status);
            if (contractFormData.pdf_file) data.append('pdf_file', contractFormData.pdf_file);

            await contractsApi.create(selectedEmployee.id, data);
            toast.success(t('contracts.createSuccess'));
            setShowContractModal(false);
            fetchContracts();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setContractFormLoading(false);
        }
    };

    const handleViewPdf = (contract) => {
        try {
            window.open(`/api/contracts/${contract.id}/file`, '_blank');
        } catch (error) {
            toast.error(t('contracts.pdfNotAvailable'));
        }
    };

    const handleContractDelete = async (contract) => {
        if (!window.confirm(t('contracts.deleteConfirm'))) return;
        
        try {
            await contractsApi.delete(contract.id);
            toast.success(t('contracts.deleteSuccess'));
            fetchContracts();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleBackToList = () => {
        setSelectedEmployee(null);
        setActiveTab('general');
    };

    // ========================================================================
    // TABLE COLUMNS - GENERAL TAB
    // ========================================================================
    const employeeColumns = [
        {
            key: 'employee_code',
            label: t('employees.employeeCode'),
            render: (value) => (
                <span className="font-mono text-sm font-medium">{value}</span>
            )
        },
        {
            key: 'full_name',
            label: t('employees.fullName'),
        },
        {
            key: 'position',
            label: t('employees.position'),
            render: (value) => value || '-'
        },
        {
            key: 'email',
            label: t('common.email'),
            render: (value) => value || '-'
        },
        {
            key: 'phone',
            label: t('employees.phone'),
            render: (value) => value || '-'
        },
        {
            key: 'status',
            label: t('common.status.label'),
            render: (value) => (
                <Badge variant={value === 'active' ? 'success' : 'warning'} size="sm">
                    {t(`employees.statuses.${value}`)}
                </Badge>
            )
        },
        {
            key: 'user',
            label: t('employees.userAccount'),
            render: (_, row) => (
                row.user ? (
                    <Badge variant="info" size="sm">{t('employees.hasUser')}</Badge>
                ) : (
                    <Badge variant="default" size="sm">{t('employees.noUser')}</Badge>
                )
            )
        },
        {
            key: 'actions',
            label: t('common.actions'),
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => handleViewContracts(row)}>
                        {t('employees.viewContracts')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(row)}>
                        {t('common.edit')}
                    </Button>
                    {!row.user && (
                        <Button size="sm" variant="ghost" className="text-error" onClick={() => handleDelete(row)}>
                            {t('common.delete')}
                        </Button>
                    )}
                </div>
            )
        }
    ];

    // ========================================================================
    // TABLE COLUMNS - CONTRACT TAB
    // ========================================================================
    const contractColumns = [
        {
            key: 'id',
            label: t('contracts.contractId'),
            render: (value) => (
                <span className="font-mono text-sm">C-{String(value).padStart(4, '0')}</span>
            )
        },
        {
            key: 'contract_type',
            label: t('contracts.type'),
            render: (value) => {
                const typeLabels = {
                    FULL_TIME: t('contracts.types.fullTime'),
                    PART_TIME: t('contracts.types.partTime'),
                    INTERN: t('contracts.types.intern'),
                    OUTSOURCE: t('contracts.types.outsource'),
                };
                return <Badge variant="info" size="sm">{typeLabels[value] || value}</Badge>;
            }
        },
        {
            key: 'department',
            label: t('contracts.department'),
            render: (value) => value || '-'
        },
        {
            key: 'start_date',
            label: t('contracts.startDate'),
            render: (value) => value ? new Date(value).toLocaleDateString(dateLocale) : '-'
        },
        {
            key: 'end_date',
            label: t('contracts.endDate'),
            render: (value) => value ? new Date(value).toLocaleDateString(dateLocale) : t('contracts.indefinite')
        },
        {
            key: 'status',
            label: t('common.status.label'),
            render: (value) => {
                const variants = {
                    active: 'success',
                    expired: 'warning',
                    terminated: 'error',
                    pending: 'info',
                };
                return <Badge variant={variants[value] || 'default'} size="sm">{t(`contracts.statuses.${value}`)}</Badge>;
            }
        },
        {
            key: 'actions',
            label: t('common.actions'),
            align: 'right',
            render: (_, row) => (
                <div className="flex gap-2 justify-end">
                    {row.has_pdf && (
                        <Button size="sm" variant="outline" onClick={() => handleViewPdf(row)}>
                            PDF
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-error" onClick={() => handleContractDelete(row)}>
                        {t('common.delete')}
                    </Button>
                </div>
            )
        }
    ];

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="employees-page space-y-6">
            {/* Header */}
            <Card>
                <CardBody>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-text">{t('employees.title')}</h2>
                            <p className="text-sm text-text-muted">{t('employees.subtitle')}</p>
                        </div>
                        {activeTab === 'general' && (
                            <Button onClick={handleOpenCreate}>
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                {t('employees.addEmployee')}
                            </Button>
                        )}
                        {activeTab === 'contract' && (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleBackToList}>
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="15 18 9 12 15 6" />
                                    </svg>
                                    {t('common.back')}
                                </Button>
                                <Button onClick={handleOpenContractCreate}>
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                    {t('contracts.addContract')}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 border-b border-border">
                        <nav className="flex gap-4" aria-label="Các tab">
                            <button
                                onClick={() => {
                                    setActiveTab('general');
                                    setSelectedEmployee(null);
                                }}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'general'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-text-muted hover:text-text hover:border-border'
                                }`}
                            >
                                {t('employees.tabs.general')}
                            </button>
                            <button
                                onClick={() => setActiveTab('contract')}
                                disabled={!selectedEmployee}
                                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'contract'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-text-muted hover:text-text hover:border-border'
                                } ${!selectedEmployee ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {t('employees.tabs.contract')}
                                {selectedEmployee && (
                                    <span className="ml-2 text-xs text-text-muted">
                                        ({selectedEmployee.employee_code})
                                    </span>
                                )}
                            </button>
                        </nav>
                    </div>
                </CardBody>
            </Card>

            {/* ============================================================ */}
            {/* GENERAL TAB CONTENT */}
            {/* ============================================================ */}
            {activeTab === 'general' && (
                <>
                    {/* Filters */}
                    <Card>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <Input
                                    placeholder={t('employees.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                />
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    options={statusOptions}
                                />
                                <Select
                                    value={hasUserFilter}
                                    onChange={(e) => {
                                        setHasUserFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    options={hasUserOptions}
                                />
                                <div className="flex gap-2">
                                    <Button onClick={handleSearch}>
                                        {t('common.search')}
                                    </Button>
                                    <Button variant="outline" onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('');
                                        setHasUserFilter('');
                                        setCurrentPage(1);
                                    }}>
                                        {t('common.clear')}
                                    </Button>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Employee Table */}
                    <Card>
                        <CardBody>
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="loading-spinner" />
                                    <span className="ml-2 text-text-muted">{t('common.loading')}</span>
                                </div>
                            ) : employees.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">{t('employees.noEmployees')}</h3>
                                    <p className="mt-1 text-sm text-text-muted">{t('employees.noEmployeesHint')}</p>
                                    <div className="mt-4">
                                        <Button size="sm" onClick={handleOpenCreate}>{t('employees.addEmployee')}</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Table columns={employeeColumns} data={employees} />
                                    {pagination.last_page > 1 && (
                                        <TablePagination
                                            currentPage={pagination.current_page}
                                            totalPages={pagination.last_page}
                                            totalItems={pagination.total}
                                            pageSize={pagination.per_page}
                                            onPageChange={setCurrentPage}
                                        />
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </>
            )}

            {/* ============================================================ */}
            {/* CONTRACT TAB CONTENT */}
            {/* ============================================================ */}
            {activeTab === 'contract' && (
                <>
                    {/* Selected Employee Info */}
                    {selectedEmployee && (
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                            <circle cx="12" cy="7" r="4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-text">{selectedEmployee.full_name}</h3>
                                        <p className="text-sm text-text-muted">
                                            {selectedEmployee.employee_code} • {selectedEmployee.position || t('employees.noPosition')}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Contract Filters */}
                    <Card>
                        <CardBody>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Select
                                    value={contractStatusFilter}
                                    onChange={(e) => setContractStatusFilter(e.target.value)}
                                    options={contractStatusOptions}
                                />
                                <Select
                                    value={contractTypeFilter}
                                    onChange={(e) => setContractTypeFilter(e.target.value)}
                                    options={[
                                        { value: '', label: t('common.all') },
                                        ...contractTypes
                                    ]}
                                />
                                <Button variant="outline" onClick={() => {
                                    setContractStatusFilter('');
                                    setContractTypeFilter('');
                                }}>
                                    {t('common.clear')}
                                </Button>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Contract Table */}
                    <Card>
                        <CardBody>
                            {!selectedEmployee ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">{t('employees.selectEmployeeFirst')}</h3>
                                    <p className="mt-1 text-sm text-text-muted">{t('employees.selectEmployeeHint')}</p>
                                </div>
                            ) : contractsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="loading-spinner" />
                                    <span className="ml-2 text-text-muted">{t('common.loading')}</span>
                                </div>
                            ) : contracts.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    <h3 className="mt-3 text-sm font-medium text-text">{t('contracts.noContracts')}</h3>
                                    <p className="mt-1 text-sm text-text-muted">{t('contracts.noContractsHint')}</p>
                                    <div className="mt-4">
                                        <Button size="sm" onClick={handleOpenContractCreate}>{t('contracts.addContract')}</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Table columns={contractColumns} data={contracts} />
                                    {contractsPagination.last_page > 1 && (
                                        <TablePagination
                                            currentPage={contractsPagination.current_page}
                                            totalPages={contractsPagination.last_page}
                                            totalItems={contractsPagination.total}
                                            pageSize={contractsPagination.per_page}
                                            onPageChange={setContractsPage}
                                        />
                                    )}
                                </>
                            )}
                        </CardBody>
                    </Card>
                </>
            )}

            {/* ============================================================ */}
            {/* CREATE EMPLOYEE MODAL */}
            {/* ============================================================ */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('employees.addEmployee')}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.employeeCode')} *
                            </label>
                            <Input
                                value={formData.employee_code}
                                onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                                placeholder="E0001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.fullName')} *
                            </label>
                            <Input
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.position')}
                            </label>
                            <Input
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('common.email')}
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.dob')}
                            </label>
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.gender')}
                            </label>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                options={genderOptions}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('common.status.label')}
                            </label>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'active', label: t('employees.statuses.active') },
                                    { value: 'inactive', label: t('employees.statuses.inactive') },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t('employees.phone')}
                        </label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t('employees.address')}
                        </label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleCreate} disabled={formLoading}>
                            {formLoading ? t('common.loading') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ============================================================ */}
            {/* EDIT EMPLOYEE MODAL */}
            {/* ============================================================ */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                }}
                title={t('employees.editEmployee')}
                size="lg"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.employeeCode')}
                            </label>
                            <Input
                                value={formData.employee_code}
                                disabled
                                className="bg-surface-hover"
                            />
                            <p className="text-xs text-text-muted mt-1">{t('employees.codeNotEditable')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.fullName')} *
                            </label>
                            <Input
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.position')}
                            </label>
                            <Input
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('common.email')}
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                disabled
                                className="bg-surface-hover"
                            />
                            <p className="text-xs text-text-muted mt-1">{t('employees.emailNotEditable')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.dob')}
                            </label>
                            <Input
                                type="date"
                                value={formData.dob}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('employees.gender')}
                            </label>
                            <Select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                options={genderOptions}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('common.status.label')}
                            </label>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                options={[
                                    { value: 'active', label: t('employees.statuses.active') },
                                    { value: 'inactive', label: t('employees.statuses.inactive') },
                                ]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t('employees.phone')}
                        </label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t('employees.address')}
                        </label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                            setShowEditModal(false);
                            setSelectedEmployee(null);
                        }}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleUpdate} disabled={formLoading}>
                            {formLoading ? t('common.loading') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* ============================================================ */}
            {/* CREATE CONTRACT MODAL */}
            {/* ============================================================ */}
            <Modal
                isOpen={showContractModal}
                onClose={() => setShowContractModal(false)}
                title={t('contracts.addContract')}
                size="lg"
            >
                <div className="space-y-4">
                    {/* Employee info (read-only) */}
                    {selectedEmployee && (
                        <div className="p-3 bg-surface-hover rounded-lg">
                            <span className="text-sm text-text-muted">{t('contracts.employee')}:</span>
                            <p className="font-medium">{selectedEmployee.employee_code} - {selectedEmployee.full_name}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.type')} *
                            </label>
                            <Select
                                value={contractFormData.contract_type}
                                onChange={(e) => setContractFormData({ ...contractFormData, contract_type: e.target.value })}
                                options={contractTypes}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.department')}
                            </label>
                            <Input
                                value={contractFormData.department}
                                onChange={(e) => setContractFormData({ ...contractFormData, department: e.target.value })}
                                placeholder={t('contracts.departmentPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.startDate')} *
                            </label>
                            <Input
                                type="date"
                                value={contractFormData.start_date}
                                onChange={(e) => setContractFormData({ ...contractFormData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.endDate')}
                            </label>
                            <Input
                                type="date"
                                value={contractFormData.end_date}
                                onChange={(e) => setContractFormData({ ...contractFormData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t('contracts.pdfFile')}
                        </label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setContractFormData({ ...contractFormData, pdf_file: e.target.files[0] })}
                            className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover"
                        />
                        <p className="mt-1 text-xs text-text-muted">{t('contracts.pdfHint')}</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setShowContractModal(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleContractCreate} disabled={contractFormLoading}>
                            {contractFormLoading ? t('common.loading') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeesPage;
