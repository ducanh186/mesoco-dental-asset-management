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
import { contractsApi, employeesApi, handleApiError } from '../services/api';

/**
 * ContractsPage - Employee Contract Administration (Admin Only)
 * 
 * Features:
 * - List contracts by employee or all
 * - Create/Edit contract with PDF upload
 * - View/Stream PDF files
 * - Filter by status, type
 */
const ContractsPage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();

    // State
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
    
    // Filters
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Employees dropdown
    const [employees, setEmployees] = useState([]);
    const [employeesLoading, setEmployeesLoading] = useState(false);
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedContract, setSelectedContract] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        employee_id: '',
        contract_type: 'FULL_TIME',
        department: '',
        start_date: '',
        end_date: '',
        status: 'ACTIVE',
        pdf_file: null,
    });

    // Contract type options
    const contractTypes = [
        { value: 'FULL_TIME', label: t('contracts.types.fullTime') },
        { value: 'PART_TIME', label: t('contracts.types.partTime') },
        { value: 'INTERN', label: t('contracts.types.intern') },
        { value: 'OUTSOURCE', label: t('contracts.types.outsource') },
    ];

    // Status options
    const statusOptions = [
        { value: '', label: t('common.all') },
        { value: 'active', label: t('contracts.statuses.active') },
        { value: 'expired', label: t('contracts.statuses.expired') },
        { value: 'terminated', label: t('contracts.statuses.terminated') },
        { value: 'pending', label: t('contracts.statuses.pending') },
    ];

    // ========================================================================
    // Data Fetching
    // ========================================================================
    const fetchEmployees = useCallback(async () => {
        setEmployeesLoading(true);
        try {
            const response = await employeesApi.list({ per_page: 100 });
            setEmployees(response.employees || response.data || []);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setEmployeesLoading(false);
        }
    }, []);

    const fetchContracts = useCallback(async () => {
        if (!selectedEmployee) {
            setContracts([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const params = { page: currentPage };
            if (statusFilter) params.status = statusFilter;
            if (typeFilter) params.type = typeFilter;
            
            const response = await contractsApi.listByEmployee(selectedEmployee, params);
            setContracts(response.data || response.contracts || []);
            setPagination(response.pagination || { current_page: 1, last_page: 1, total: 0, per_page: 15 });
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [selectedEmployee, currentPage, statusFilter, typeFilter, toast]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleOpenCreate = () => {
        setFormData({
            employee_id: selectedEmployee || '',
            contract_type: 'FULL_TIME',
            department: '',
            start_date: new Date().toISOString().split('T')[0],
            end_date: '',
            status: 'ACTIVE',
            pdf_file: null,
        });
        setShowCreateModal(true);
    };

    const handleCreate = async () => {
        if (!formData.employee_id) {
            toast.error(t('contracts.selectEmployee'));
            return;
        }
        if (!formData.start_date) {
            toast.error(t('contracts.startDateRequired'));
            return;
        }

        setFormLoading(true);
        try {
            const data = new FormData();
            data.append('contract_type', formData.contract_type);
            data.append('start_date', formData.start_date);
            if (formData.end_date) data.append('end_date', formData.end_date);
            if (formData.department) data.append('department', formData.department);
            data.append('status', formData.status);
            if (formData.pdf_file) data.append('pdf_file', formData.pdf_file);

            await contractsApi.create(formData.employee_id, data);
            toast.success(t('contracts.createSuccess'));
            setShowCreateModal(false);
            fetchContracts();
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setFormLoading(false);
        }
    };

    const handleViewContract = async (contract) => {
        setSelectedContract(contract);
        setShowDetailModal(true);
    };

    const handleViewPdf = async (contract) => {
        try {
            window.open(`/api/contracts/${contract.id}/file`, '_blank');
        } catch (error) {
            toast.error(t('contracts.pdfNotAvailable'));
        }
    };

    const handleDelete = async (contract) => {
        if (!window.confirm(t('contracts.deleteConfirm'))) return;
        
        try {
            await contractsApi.delete(contract.id);
            toast.success(t('contracts.deleteSuccess'));
            fetchContracts();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    // ========================================================================
    // Table Columns
    // ========================================================================
    const columns = [
        {
            key: 'id',
            label: t('contracts.contractId'),
            render: (value) => (
                <span className="font-mono text-sm">C-{String(value).padStart(4, '0')}</span>
            )
        },
        {
            key: 'employee',
            label: t('contracts.employee'),
            render: (_, row) => row.employee?.full_name || row.employee_name || '-'
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
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        },
        {
            key: 'end_date',
            label: t('contracts.endDate'),
            render: (value) => value ? new Date(value).toLocaleDateString() : t('contracts.indefinite')
        },
        {
            key: 'status',
            label: t('common.status'),
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
                    <Button size="sm" variant="ghost" onClick={() => handleViewContract(row)}>
                        {t('common.view')}
                    </Button>
                    {row.has_pdf && (
                        <Button size="sm" variant="outline" onClick={() => handleViewPdf(row)}>
                            PDF
                        </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-error" onClick={() => handleDelete(row)}>
                        {t('common.delete')}
                    </Button>
                </div>
            )
        }
    ];

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="contracts-page space-y-6">
            {/* Header */}
            <Card>
                <CardBody>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-text">{t('contracts.title')}</h2>
                            <p className="text-sm text-text-muted">{t('contracts.subtitle')}</p>
                        </div>
                        <Button onClick={handleOpenCreate} disabled={!selectedEmployee}>
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            {t('contracts.addContract')}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Filters */}
            <Card>
                <CardBody>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Select
                            value={selectedEmployee}
                            onChange={(e) => {
                                setSelectedEmployee(e.target.value);
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: '', label: t('contracts.selectEmployee') },
                                ...employees.map(emp => ({
                                    value: emp.id,
                                    label: `${emp.employee_code} - ${emp.full_name}`
                                }))
                            ]}
                            disabled={employeesLoading}
                        />
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            options={statusOptions}
                        />
                        <Select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            options={[
                                { value: '', label: t('common.all') },
                                ...contractTypes
                            ]}
                        />
                        <Button variant="outline" onClick={() => {
                            setStatusFilter('');
                            setTypeFilter('');
                        }}>
                            {t('common.clear')}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Table */}
            <Card>
                <CardBody>
                    {!selectedEmployee ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-text-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                                <rect x="9" y="3" width="6" height="4" rx="1" />
                            </svg>
                            <h3 className="mt-3 text-sm font-medium text-text">{t('contracts.selectEmployeeFirst')}</h3>
                            <p className="mt-1 text-sm text-text-muted">{t('contracts.selectEmployeeHint')}</p>
                        </div>
                    ) : loading ? (
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
                                <Button size="sm" onClick={handleOpenCreate}>{t('contracts.addContract')}</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Table columns={columns} data={contracts} />
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

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t('contracts.addContract')}
                size="lg"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text mb-1">
                            {t('contracts.employee')} *
                        </label>
                        <Select
                            value={formData.employee_id}
                            onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                            options={[
                                { value: '', label: t('contracts.selectEmployee') },
                                ...employees.map(emp => ({
                                    value: emp.id,
                                    label: `${emp.employee_code} - ${emp.full_name}`
                                }))
                            ]}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.type')} *
                            </label>
                            <Select
                                value={formData.contract_type}
                                onChange={(e) => setFormData({ ...formData, contract_type: e.target.value })}
                                options={contractTypes}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.department')}
                            </label>
                            <Input
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">
                                {t('contracts.endDate')}
                            </label>
                            <Input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, pdf_file: e.target.files[0] })}
                            className="block w-full text-sm text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary-hover"
                        />
                        <p className="mt-1 text-xs text-text-muted">{t('contracts.pdfHint')}</p>
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

            {/* Detail Modal */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title={t('contracts.contractDetails')}
                size="md"
            >
                {selectedContract && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-text-muted">{t('contracts.contractId')}</span>
                                <p className="font-medium">C-{String(selectedContract.id).padStart(4, '0')}</p>
                            </div>
                            <div>
                                <span className="text-sm text-text-muted">{t('common.status')}</span>
                                <p><Badge variant={selectedContract.status === 'active' ? 'success' : 'warning'}>
                                    {t(`contracts.statuses.${selectedContract.status}`)}
                                </Badge></p>
                            </div>
                            <div>
                                <span className="text-sm text-text-muted">{t('contracts.type')}</span>
                                <p className="font-medium">{t(`contracts.types.${selectedContract.contract_type?.toLowerCase()}`) || selectedContract.contract_type}</p>
                            </div>
                            <div>
                                <span className="text-sm text-text-muted">{t('contracts.department')}</span>
                                <p className="font-medium">{selectedContract.department || '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-text-muted">{t('contracts.startDate')}</span>
                                <p className="font-medium">{selectedContract.start_date ? new Date(selectedContract.start_date).toLocaleDateString() : '-'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-text-muted">{t('contracts.endDate')}</span>
                                <p className="font-medium">{selectedContract.end_date ? new Date(selectedContract.end_date).toLocaleDateString() : t('contracts.indefinite')}</p>
                            </div>
                        </div>
                        
                        {selectedContract.has_pdf && (
                            <div className="pt-4 border-t">
                                <Button variant="outline" onClick={() => handleViewPdf(selectedContract)}>
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                    {t('contracts.viewPdf')}
                                </Button>
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t">
                            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                                {t('common.close')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ContractsPage;
