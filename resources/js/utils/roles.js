export const ROLE_MANAGER = 'manager';
export const ROLE_TECHNICIAN = 'technician';
export const ROLE_EMPLOYEE = 'employee';
export const ROLE_SUPPLIER = 'supplier';

const LEGACY_ROLE_MAP = {
    admin: ROLE_MANAGER,
    hr: ROLE_TECHNICIAN,
    staff: ROLE_EMPLOYEE,
};

export const normalizeRole = (role) => {
    const normalized = (role || '').toString().trim().toLowerCase();

    if (!normalized) {
        return ROLE_EMPLOYEE;
    }

    return LEGACY_ROLE_MAP[normalized] || normalized;
};

export const getUserRole = (user) => normalizeRole(user?.role);

export const hasAnyRole = (value, roles = []) => {
    const role = typeof value === 'string' ? normalizeRole(value) : getUserRole(value);

    return roles.includes(role);
};

export const isManager = (value) => hasAnyRole(value, [ROLE_MANAGER]);

export const hasOperationalAccess = (value) => hasAnyRole(value, [ROLE_MANAGER, ROLE_TECHNICIAN]);

export const isSupplier = (value) => hasAnyRole(value, [ROLE_SUPPLIER]);
