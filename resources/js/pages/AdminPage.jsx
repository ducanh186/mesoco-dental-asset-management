import React, { useState, useEffect, useCallback } from 'react';
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
import { useI18n } from '../i18n';
import { usersApi, handleApiError } from '../services/api';

/**
 * AdminPage - System Administration (Admin only)
 * 
 * Features:
 * - Users Management (create, edit role, reset password, lock/unlock)
 * - Roles & Permissions overview
 * - System Settings
 * - Audit Log (coming soon)
 */
const AdminPage = ({ user }) => {
    const toast = useToast();
    const { t } = useI18n();
    
    // Active tab
    const [activeTab, setActiveTab] = useState('users');

    // Users state
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [availableRoles, setAvailableRoles] = useState([]);

    // Modal states
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [employees, setEmployees] = useState([]);
    const [createForm, setCreateForm] = useState({
        employee_id: '',
        role: 'employee',
        default_password: ''
    });
    const [newRole, setNewRole] = useState('');

    // ========================================================================
    // Data Fetching
    // ========================================================================
    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };
            if (searchQuery) params.search = searchQuery;
            if (roleFilter) params.role = roleFilter;

            const data = await usersApi.list(params);
            setUsers(data.users || []);
            setPagination(data.pagination || { current_page: 1, last_page: 1, total: 0 });
            if (data.available_roles) {
                setAvailableRoles(data.available_roles);
            }
        } catch (error) {
            handleApiError(error, toast);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, roleFilter, toast]);

    const fetchAvailableEmployees = async () => {
        try {
            const response = await fetch('/api/employees/available', {
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                setEmployees(data.employees || []);
            }
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ========================================================================
    // Handlers
    // ========================================================================
    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const handleCreateUser = async () => {
        if (!createForm.employee_id || !createForm.default_password) {
            toast.warning(t('errors.required'));
            return;
        }

        try {
            await usersApi.create(createForm);
            toast.success(t('admin.userCreated'));
            setCreateModalOpen(false);
            setCreateForm({ employee_id: '', role: 'employee', default_password: '' });
            fetchUsers();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        try {
            await usersApi.updateRole(selectedUser.id, newRole);
            toast.success(t('admin.roleUpdated'));
            setRoleModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm(t('admin.deleteConfirm'))) return;

        try {
            await usersApi.delete(userId);
            toast.success(t('admin.userDeleted'));
            fetchUsers();
        } catch (error) {
            handleApiError(error, toast);
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role);
        setRoleModalOpen(true);
    };

    const openCreateModal = () => {
        fetchAvailableEmployees();
        setCreateModalOpen(true);
    };

    // ========================================================================
    // Role Options
    // ========================================================================
    const roleOptions = [
        { value: '', label: t('common.all') },
        { value: 'admin', label: t('roles.admin') },
        { value: 'hr', label: t('roles.hr') },
        { value: 'doctor', label: t('roles.doctor') },
        { value: 'technician', label: t('roles.technician') },
        { value: 'employee', label: t('roles.employee') },
    ];

    const roleSelectOptions = roleOptions.filter(r => r.value !== '');

    // ========================================================================
    // Table Columns
    // ========================================================================
    const userColumns = [
        {
            key: 'employee_code',
            label: t('admin.employeeCode'),
            width: '120px',
            render: (value) => (
                <span className="font-mono text-sm text-primary">{value}</span>
            )
        },
        {
            key: 'name',
            label: t('admin.userName'),
            render: (value, row) => (
                <div>
                    <div className="font-medium text-text">{value}</div>
                    <div className="text-xs text-text-muted">{row.employee?.email}</div>
                </div>
            )
        },
        {
            key: 'role',
            label: t('admin.role'),
            width: '120px',
            render: (value) => (
                <Badge variant={getRoleBadgeVariant(value)} size="sm">
                    {t(`roles.${value}`)}
                </Badge>
            )
        },
        {
            key: 'status',
            label: t('common.status.label'),
            width: '100px',
            render: (value) => <StatusBadge status={value} />
        },
        {
            key: 'actions',
            label: t('common.actions'),
            width: '150px',
            render: (_, row) => (
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openRoleModal(row)}
                        title={t('admin.changeRole')}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                    </Button>
                    {row.id !== user?.id && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(row.id)}
                            title={t('common.delete')}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </Button>
                    )}
                </div>
            )
        }
    ];

    const getRoleBadgeVariant = (role) => {
        const variants = {
            admin: 'error',
            hr: 'primary',
            doctor: 'success',
            technician: 'warning',
            employee: 'default'
        };
        return variants[role] || 'default';
    };

    // ========================================================================
    // Tabs Configuration
    // ========================================================================
    const tabs = [
        { id: 'users', labelKey: 'admin.users', icon: 'users' },
        { id: 'roles', labelKey: 'admin.rolesPermissions', icon: 'shield' },
        { id: 'settings', labelKey: 'admin.systemSettings', icon: 'settings' },
        { id: 'audit', labelKey: 'admin.auditLog', icon: 'activity' },
    ];

    // ========================================================================
    // Render Tab Content
    // ========================================================================
    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return renderUsersTab();
            case 'roles':
                return renderRolesTab();
            case 'settings':
                return renderSettingsTab();
            case 'audit':
                return renderAuditTab();
            default:
                return null;
        }
    };

    const renderUsersTab = () => (
        <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <Input
                        placeholder={t('admin.searchUsers')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                    </Button>
                </form>
                <Select
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        fetchUsers(1);
                    }}
                    options={roleOptions}
                    className="w-40"
                />
                <Button onClick={openCreateModal}>
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    {t('admin.createUser')}
                </Button>
            </div>

            {/* Users Table */}
            <Card>
                <CardBody className="p-0">
                    <Table
                        columns={userColumns}
                        data={users}
                        loading={loading}
                        emptyMessage={t('admin.noUsers')}
                    />
                    {pagination.last_page > 1 && (
                        <div className="p-4 border-t border-border">
                            <TablePagination
                                currentPage={pagination.current_page}
                                totalPages={pagination.last_page}
                                total={pagination.total}
                                onPageChange={(page) => fetchUsers(page)}
                            />
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    );

    const renderRolesTab = () => (
        <div className="space-y-6">
            {/* RBAC Matrix */}
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-text">{t('admin.rbacMatrix')}</h3>
                </CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-medium text-text-muted">{t('admin.permission')}</th>
                                    <th className="text-center py-3 px-4 font-medium text-text-muted">{t('roles.admin')}</th>
                                    <th className="text-center py-3 px-4 font-medium text-text-muted">{t('roles.hr')}</th>
                                    <th className="text-center py-3 px-4 font-medium text-text-muted">{t('roles.doctor')}</th>
                                    <th className="text-center py-3 px-4 font-medium text-text-muted">{t('roles.technician')}</th>
                                    <th className="text-center py-3 px-4 font-medium text-text-muted">{t('roles.employee')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rbacMatrix.map((row, idx) => (
                                    <tr key={idx} className="border-b border-border/50 hover:bg-surface-hover">
                                        <td className="py-3 px-4 text-text">{row.permission}</td>
                                        {['admin', 'hr', 'doctor', 'technician', 'employee'].map(role => (
                                            <td key={role} className="py-3 px-4 text-center">
                                                {row[role] ? (
                                                    <span className="text-success">✓</span>
                                                ) : (
                                                    <span className="text-text-muted">—</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>

            {/* Role Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roleDescriptions.map(role => (
                    <Card key={role.id}>
                        <CardBody>
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg ${role.bgColor} flex items-center justify-center`}>
                                    <span className={`text-lg ${role.textColor}`}>{role.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-text">{t(`roles.${role.id}`)}</h4>
                                    <p className="text-sm text-text-muted mt-1">{role.description}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            {/* Company Profile */}
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-text">{t('admin.companyProfile')}</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={t('admin.companyName')}
                            value="Mesoco Dental Clinic"
                            disabled
                        />
                        <Input
                            label={t('admin.companyEmail')}
                            value="contact@mesoco.com"
                            disabled
                        />
                        <Input
                            label={t('admin.companyPhone')}
                            value="+84 28 1234 5678"
                            disabled
                        />
                        <Input
                            label={t('admin.companyAddress')}
                            value="123 Dental Street, District 1, HCMC"
                            disabled
                        />
                    </div>
                    <div className="mt-4 p-3 bg-warning-light rounded-lg text-sm text-warning">
                        <strong>{t('common.note')}:</strong> {t('admin.settingsComingSoon')}
                    </div>
                </CardBody>
            </Card>

            {/* Code Generation Rules */}
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-text">{t('admin.codeGeneration')}</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                            <div>
                                <div className="font-medium text-text">{t('admin.assetCodeFormat')}</div>
                                <div className="text-sm text-text-muted">EQUIP-XXXX</div>
                            </div>
                            <Badge variant="primary">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                            <div>
                                <div className="font-medium text-text">{t('admin.employeeCodeFormat')}</div>
                                <div className="text-sm text-text-muted">NV-XXXX</div>
                            </div>
                            <Badge variant="primary">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                            <div>
                                <div className="font-medium text-text">{t('admin.requestCodeFormat')}</div>
                                <div className="text-sm text-text-muted">REQ-YYYYMMDD-XXXX</div>
                            </div>
                            <Badge variant="primary">Active</Badge>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderAuditTab = () => (
        <Card>
            <CardBody>
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
                        <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3"/>
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text mb-2">{t('admin.auditLog')}</h3>
                    <p className="text-text-muted mb-4">{t('admin.auditComingSoon')}</p>
                    <Badge variant="warning">{t('common.comingSoon')}</Badge>
                </div>
            </CardBody>
        </Card>
    );

    // ========================================================================
    // Static Data
    // ========================================================================
    const rbacMatrix = [
        { permission: 'Thiết bị của tôi (My Equipment)', admin: true, hr: true, doctor: true, technician: true, employee: true },
        { permission: 'Quét QR / Check-in', admin: true, hr: true, doctor: true, technician: true, employee: true },
        { permission: 'Phiếu yêu cầu (tạo/xem)', admin: true, hr: true, doctor: true, technician: true, employee: true },
        { permission: 'Quản lý thiết bị', admin: true, hr: true, doctor: false, technician: false, employee: false },
        { permission: 'Giao/Thu hồi thiết bị', admin: true, hr: true, doctor: false, technician: false, employee: false },
        { permission: 'Duyệt phiếu', admin: true, hr: true, doctor: false, technician: false, employee: false },
        { permission: 'Bảo trì (xem/sửa)', admin: true, hr: true, doctor: false, technician: true, employee: false },
        { permission: 'Báo cáo', admin: true, hr: true, doctor: false, technician: false, employee: false },
        { permission: 'Quản lý nhân sự', admin: true, hr: true, doctor: false, technician: false, employee: false },
        { permission: 'Tạo tài khoản', admin: true, hr: true, doctor: false, technician: false, employee: false },
        { permission: 'Gán/Đổi quyền (Role)', admin: true, hr: false, doctor: false, technician: false, employee: false },
        { permission: 'Xóa tài khoản', admin: true, hr: false, doctor: false, technician: false, employee: false },
        { permission: 'Cài đặt hệ thống', admin: true, hr: false, doctor: false, technician: false, employee: false },
    ];

    const roleDescriptions = [
        { id: 'admin', icon: '👑', bgColor: 'bg-error/10', textColor: 'text-error', description: 'Toàn quyền hệ thống, quản trị người dùng và cấu hình' },
        { id: 'hr', icon: '👔', bgColor: 'bg-primary/10', textColor: 'text-primary', description: 'Quản lý nhân sự, thiết bị, duyệt phiếu, xem báo cáo' },
        { id: 'doctor', icon: '🩺', bgColor: 'bg-success/10', textColor: 'text-success', description: 'Xem thiết bị được giao, tạo phiếu yêu cầu' },
        { id: 'technician', icon: '🔧', bgColor: 'bg-warning/10', textColor: 'text-warning', description: 'Xem thiết bị, bảo trì, báo sự cố thiết bị' },
        { id: 'employee', icon: '👤', bgColor: 'bg-surface', textColor: 'text-text', description: 'Xem thiết bị được giao, tạo phiếu cơ bản' },
    ];

    // ========================================================================
    // Render
    // ========================================================================
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-text">{t('admin.title')}</h2>
                <p className="text-sm text-text-muted">{t('admin.subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <nav className="flex gap-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-muted hover:text-text'
                            }`}
                        >
                            {t(tab.labelKey)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {renderTabContent()}

            {/* Create User Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={t('admin.createUser')}
            >
                <div className="space-y-4">
                    <Select
                        label={t('admin.selectEmployee')}
                        value={createForm.employee_id}
                        onChange={(e) => setCreateForm({ ...createForm, employee_id: e.target.value })}
                        options={[
                            { value: '', label: t('admin.selectEmployeePlaceholder') },
                            ...employees.map(emp => ({
                                value: emp.id,
                                label: `${emp.employee_code} - ${emp.full_name}`
                            }))
                        ]}
                    />
                    <Select
                        label={t('admin.role')}
                        value={createForm.role}
                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                        options={roleSelectOptions}
                    />
                    <Input
                        label={t('admin.defaultPassword')}
                        type="password"
                        value={createForm.default_password}
                        onChange={(e) => setCreateForm({ ...createForm, default_password: e.target.value })}
                        placeholder={t('admin.defaultPasswordPlaceholder')}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleCreateUser}>
                            {t('common.create')}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Change Role Modal */}
            <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title={t('admin.changeRole')}
            >
                <div className="space-y-4">
                    <div className="p-3 bg-surface rounded-lg">
                        <div className="text-sm text-text-muted">{t('admin.currentUser')}</div>
                        <div className="font-medium text-text">{selectedUser?.name}</div>
                        <div className="text-sm text-text-muted">{selectedUser?.employee_code}</div>
                    </div>
                    <Select
                        label={t('admin.newRole')}
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        options={roleSelectOptions}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={() => setRoleModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleUpdateRole}>
                            {t('common.save')}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminPage;
