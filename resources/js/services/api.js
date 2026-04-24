/**
 * API Client Module - IT Asset Management
 * Handles all API calls with consistent error handling
 */
import axios from 'axios';

const getCurrentLocale = () => {
    if (typeof document === 'undefined') {
        return 'vi';
    }

    return document.documentElement.lang || 'vi';
};

const looksEnglishMessage = (message) => {
    if (typeof message !== 'string' || !message.trim()) {
        return false;
    }

    return /[A-Za-z]/.test(message) && !/[À-ỹà-ỹ]/.test(message);
};

export const preferLocalizedMessage = (message, fallback) => {
    if (!message) {
        return fallback;
    }

    if (getCurrentLocale() === 'vi' && looksEnglishMessage(message)) {
        return fallback;
    }

    return message;
};

// ============================================================================
// Error Handler
// ============================================================================
export const handleApiError = (error, toast) => {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
        case 401:
            // Unauthenticated - will be handled by axios interceptor
            break;
        case 403:
            toast?.error(preferLocalizedMessage(data?.message, 'Bạn không có quyền thực hiện thao tác này'));
            break;
        case 404:
            toast?.error(preferLocalizedMessage(data?.message, 'Không tìm thấy dữ liệu'));
            break;
        case 409:
            // MUST_CHANGE_PASSWORD - should redirect to change password
            if (data?.error === 'MUST_CHANGE_PASSWORD') {
                window.location.href = '/change-password';
            } else {
                toast?.error(preferLocalizedMessage(data?.message, 'Dữ liệu đang xung đột'));
            }
            break;
        case 422:
            // Validation errors - return for form handling
            const firstError = Object.values(data?.errors || {})[0]?.[0];
            toast?.error(preferLocalizedMessage(firstError || data?.message, 'Dữ liệu không hợp lệ'));
            break;
        default:
            toast?.error(preferLocalizedMessage(data?.message, 'Đã xảy ra lỗi ngoài dự kiến'));
    }

    return { status, data, error };
};

// ============================================================================
// Assets API
// ============================================================================
export const assetsApi = {
    /**
     * List all assets with filters
     * GET /api/assets
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/assets', { params });
        return response.data;
    },

    /**
     * Get available (unassigned) assets
     * GET /api/assets/available
     */
    available: async () => {
        const response = await axios.get('/api/assets/available');
        return response.data;
    },

    /**
     * Get single asset details
     * GET /api/assets/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/assets/${id}`);
        return response.data;
    },

    /**
     * Create new asset
     * POST /api/assets
     */
    create: async (data) => {
        const response = await axios.post('/api/assets', data);
        return response.data;
    },

    /**
     * Update asset
     * PATCH /api/assets/{id}
     */
    update: async (id, data) => {
        const response = await axios.patch(`/api/assets/${id}`, data);
        return response.data;
    },

    /**
     * Delete asset (soft delete)
     * DELETE /api/assets/{id}
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/assets/${id}`);
        return response.data;
    },

    /**
     * Hand over asset to department.
     * Backward compatible with legacy employee payloads.
     * POST /api/assets/{id}/assign
     */
    assign: async (id, payload) => {
        const body = typeof payload === 'string'
            ? { department_name: payload }
            : payload;

        const response = await axios.post(`/api/assets/${id}/assign`, body);
        return response.data;
    },

    /**
     * Unassign asset from current employee
     * POST /api/assets/{id}/unassign
     */
    unassign: async (id) => {
        const response = await axios.post(`/api/assets/${id}/unassign`);
        return response.data;
    },

};

// ============================================================================
// Department Assets API
// ============================================================================
export const departmentAssetsApi = {
    /**
     * Get assets handed over to the current user's department.
     * GET /api/department-assets/dropdown
     */
    dropdown: async () => {
        const response = await axios.get('/api/department-assets/dropdown');
        return response.data;
    },
};

// ============================================================================
// Employees API (for assignment dropdown)
// ============================================================================
export const employeesApi = {
    /**
     * List all employees
     * GET /api/employees
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/employees', { params });
        return response.data;
    },

    /**
     * Get single employee details
     * GET /api/employees/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/employees/${id}`);
        return response.data;
    },

    /**
     * Create new employee
     * POST /api/employees
     */
    create: async (data) => {
        const response = await axios.post('/api/employees', data);
        return response.data;
    },

    /**
     * Update employee
     * PUT /api/employees/{id}
     */
    update: async (id, data) => {
        const response = await axios.put(`/api/employees/${id}`, data);
        return response.data;
    },

    /**
     * Delete employee
     * DELETE /api/employees/{id}
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/employees/${id}`);
        return response.data;
    },

    /**
     * Get available employees (no user account yet)
     * GET /api/employees/available
     */
    available: async () => {
        const response = await axios.get('/api/employees/available');
        return response.data;
    },
};

// ============================================================================
// Requests API - Phase 5
// ============================================================================
export const requestsApi = {
    /**
     * List requests (filtered by mine=1 for staff, or all for admin)
     * GET /api/requests
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/requests', { params });
        return response.data;
    },

    /**
     * Get single request details
     * GET /api/requests/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/requests/${id}`);
        return response.data;
    },

    /**
     * Create new request
     * POST /api/requests
     */
    create: async (data) => {
        const response = await axios.post('/api/requests', data);
        return response.data;
    },

    /**
     * Cancel a request
     * POST /api/requests/{id}/cancel
     */
    cancel: async (id) => {
        const response = await axios.post(`/api/requests/${id}/cancel`);
        return response.data;
    },

    /**
     * Get review queue (admin/HR only)
     * GET /api/review-requests
     */
    reviewQueue: async (params = {}) => {
        const response = await axios.get('/api/review-requests', { params });
        return response.data;
    },

    /**
     * Review (approve/reject) a request
     * POST /api/requests/{id}/review
     */
    review: async (id, action, payload = {}) => {
        const normalizedPayload = (typeof payload === 'string' || payload === null)
            ? { note: payload }
            : payload;

        const response = await axios.post(`/api/requests/${id}/review`, {
            action,
            ...normalizedPayload,
        });
        return response.data;
    },
};

// ============================================================================
// Shifts API
// ============================================================================
export const shiftsApi = {
    /**
     * List all shifts
     * GET /api/shifts
     */
    list: async () => {
        const response = await axios.get('/api/shifts');
        return response.data;
    },
};

// ============================================================================
// Users API (Admin Only)
// ============================================================================
export const usersApi = {
    /**
     * List all users with pagination
     * GET /api/users
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/users', { params });
        return response.data;
    },

    /**
     * Get user by ID
     * GET /api/users/:id
     */
    get: async (id) => {
        const response = await axios.get(`/api/users/${id}`);
        return response.data;
    },

    /**
     * Create new user (Admin/HR only)
     * POST /api/users
     */
    create: async (data) => {
        const response = await axios.post('/api/users', data);
        return response.data;
    },

    /**
     * Update user role (Admin only)
     * PATCH /api/users/:id/role
     */
    updateRole: async (id, role) => {
        const response = await axios.patch(`/api/users/${id}/role`, { role });
        return response.data;
    },

    /**
     * Delete user (Admin only)
     * DELETE /api/users/:id
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/users/${id}`);
        return response.data;
    },
};

// ============================================================================
// Inventory API
// ============================================================================
export const inventoryApi = {
    /**
     * Get inventory summary statistics
     * GET /api/inventory/summary
     */
    summary: async () => {
        const response = await axios.get('/api/inventory/summary');
        return response.data;
    },

    /**
     * Get paginated inventory assets with filters
     * GET /api/inventory/assets
     */
    assets: async (params = {}) => {
        const response = await axios.get('/api/inventory/assets', { params });
        return response.data;
    },

    /**
     * Get asset valuation report
     * GET /api/inventory/valuation
     */
    valuation: async (params = {}) => {
        const response = await axios.get('/api/inventory/valuation', { params });
        return response.data;
    },

    /**
     * Export inventory to CSV
     * GET /api/inventory/export
     * Returns a blob for download
     */
    exportCsv: async (params = {}) => {
        const response = await axios.get('/api/inventory/export', { 
            params,
            responseType: 'blob' 
        });
        return response;
    },

    checks: async (params = {}) => {
        const response = await axios.get('/api/inventory/checks', { params });
        return response.data;
    },

    createCheck: async (data) => {
        const response = await axios.post('/api/inventory/checks', data);
        return response.data;
    },

    showCheck: async (id) => {
        const response = await axios.get(`/api/inventory/checks/${id}`);
        return response.data;
    },

    updateCheckItem: async (checkId, itemId, data) => {
        const response = await axios.patch(`/api/inventory/checks/${checkId}/items/${itemId}`, data);
        return response.data;
    },

    completeCheck: async (id, data = {}) => {
        const response = await axios.post(`/api/inventory/checks/${id}/complete`, data);
        return response.data;
    },
};

// ============================================================================
// My Asset History API (Phase 6 - All Users)
// ============================================================================
// Locations API
// ============================================================================
export const locationsApi = {
    /**
     * List all locations with pagination
     * GET /api/locations
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/locations', { params });
        return response.data;
    },

    /**
     * Get location details
     * GET /api/locations/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/locations/${id}`);
        return response.data;
    },

    /**
     * Create new location
     * POST /api/locations
     */
    create: async (data) => {
        const response = await axios.post('/api/locations', data);
        return response.data;
    },

    /**
     * Update location
     * PUT /api/locations/{id}
     */
    update: async (id, data) => {
        const response = await axios.put(`/api/locations/${id}`, data);
        return response.data;
    },

    /**
     * Delete location
     * DELETE /api/locations/{id}
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/locations/${id}`);
        return response.data;
    },

    /**
     * Get dropdown list (active only)
     * GET /api/locations/dropdown
     */
    dropdown: async () => {
        const response = await axios.get('/api/locations/dropdown');
        return response.data;
    },
};

// ============================================================================
// Suppliers API
// ============================================================================
export const suppliersApi = {
    list: async (params = {}) => {
        const response = await axios.get('/api/suppliers', { params });
        return response.data;
    },

    get: async (id) => {
        const response = await axios.get(`/api/suppliers/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axios.post('/api/suppliers', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axios.put(`/api/suppliers/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(`/api/suppliers/${id}`);
        return response.data;
    },

    dropdown: async () => {
        const response = await axios.get('/api/suppliers/dropdown');
        return response.data;
    },
};

// ============================================================================
// Purchase Orders API
// ============================================================================
export const purchaseOrdersApi = {
    list: async (params = {}) => {
        const response = await axios.get('/api/purchase-orders', { params });
        return response.data;
    },

    get: async (id) => {
        const response = await axios.get(`/api/purchase-orders/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await axios.post('/api/purchase-orders', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await axios.put(`/api/purchase-orders/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(`/api/purchase-orders/${id}`);
        return response.data;
    },

    updateStatus: async (id, data) => {
        const response = await axios.patch(`/api/purchase-orders/${id}/status`, data);
        return response.data;
    },
};

// ============================================================================
// Maintenance Events API (Phase 7)
// ============================================================================
export const maintenanceApi = {
    /**
     * List maintenance events with filters
     * GET /api/maintenance-events
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/maintenance-events', { params });
        return response.data;
    },

    /**
     * Get maintenance summary (stats + upcoming/overdue)
     * GET /api/maintenance-events/summary
     */
    summary: async () => {
        const response = await axios.get('/api/maintenance-events/summary');
        return response.data;
    },

    /**
     * Get single maintenance event
     * GET /api/maintenance-events/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/maintenance-events/${id}`);
        return response.data;
    },

    /**
     * Create maintenance event
     * POST /api/maintenance-events
     */
    create: async (data) => {
        const response = await axios.post('/api/maintenance-events', data);
        return response.data;
    },

    /**
     * Update maintenance event
     * PUT /api/maintenance-events/{id}
     */
    update: async (id, data) => {
        const response = await axios.put(`/api/maintenance-events/${id}`, data);
        return response.data;
    },

    /**
     * Delete maintenance event
     * DELETE /api/maintenance-events/{id}
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/maintenance-events/${id}`);
        return response.data;
    },

    /**
     * Start maintenance (scheduled -> in_progress)
     * POST /api/maintenance-events/{id}/start
     */
    start: async (id, note = null) => {
        const response = await axios.post(`/api/maintenance-events/${id}/start`, { note });
        return response.data;
    },

    /**
     * Complete maintenance (in_progress -> completed)
     * POST /api/maintenance-events/{id}/complete
     */
    complete: async (id, data = {}) => {
        const response = await axios.post(`/api/maintenance-events/${id}/complete`, data);
        return response.data;
    },

    /**
     * Cancel maintenance
     * POST /api/maintenance-events/{id}/cancel
     */
    cancel: async (id, reason = null) => {
        const response = await axios.post(`/api/maintenance-events/${id}/cancel`, { reason });
        return response.data;
    },

    /**
     * Lock asset manually
     * POST /api/assets/{id}/lock
     */
    lockAsset: async (assetId, reason, until = null) => {
        const response = await axios.post(`/api/assets/${assetId}/lock`, { reason, until });
        return response.data;
    },

    /**
     * Unlock asset manually
     * POST /api/assets/{id}/unlock
     */
    unlockAsset: async (assetId) => {
        const response = await axios.post(`/api/assets/${assetId}/unlock`);
        return response.data;
    },

    /**
     * Get asset lock status
     * GET /api/assets/{id}/lock-status
     */
    getLockStatus: async (assetId) => {
        const response = await axios.get(`/api/assets/${assetId}/lock-status`);
        return response.data;
    },
};

// ============================================================================
// Feedback API (Phase 8)
// ============================================================================
export const feedbackApi = {
    /**
     * List feedbacks with filters
     * GET /api/feedbacks
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/feedbacks', { params });
        return response.data;
    },

    /**
     * Get feedback summary stats
     * GET /api/feedbacks/summary
     */
    summary: async () => {
        const response = await axios.get('/api/feedbacks/summary');
        return response.data;
    },

    /**
     * Get single feedback
     * GET /api/feedbacks/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/feedbacks/${id}`);
        return response.data;
    },

    /**
     * Create feedback
     * POST /api/feedbacks
     */
    create: async (data) => {
        const response = await axios.post('/api/feedbacks', data);
        return response.data;
    },

    /**
     * Update feedback
     * PUT /api/feedbacks/{id}
     */
    update: async (id, data) => {
        const response = await axios.put(`/api/feedbacks/${id}`, data);
        return response.data;
    },

    /**
     * Update feedback status (managers only)
     * PATCH /api/feedbacks/{id}/status
     */
    updateStatus: async (id, status, response = null) => {
        const res = await axios.patch(`/api/feedbacks/${id}/status`, { status, response });
        return res.data;
    },

    /**
     * Delete feedback (admin only)
     * DELETE /api/feedbacks/{id}
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/feedbacks/${id}`);
        return response.data;
    },
};

// ============================================================================
// Reports API (Phase 8 - Admin/HR Only)
// ============================================================================
export const reportsApi = {
    /**
     * Get overall system summary report
     * GET /api/reports/summary
     */
    summary: async (params = {}) => {
        const response = await axios.get('/api/reports/summary', { params });
        return response.data;
    },

    /**
     * Export report (admin only - placeholder)
     * GET /api/reports/export
     */
    export: async (params = {}) => {
        const response = await axios.get('/api/reports/export', { params });
        return response.data;
    },
};

// ============================================================================
// Employee Contracts API (Admin Only)
// ============================================================================
export const contractsApi = {
    /**
     * List contracts for an employee
     * GET /api/employees/{employeeId}/contracts
     */
    listByEmployee: async (employeeId, params = {}) => {
        const response = await axios.get(`/api/employees/${employeeId}/contracts`, { params });
        return response.data;
    },

    /**
     * Get single contract details
     * GET /api/contracts/{id}
     */
    get: async (id) => {
        const response = await axios.get(`/api/contracts/${id}`);
        return response.data;
    },

    /**
     * Create contract for employee
     * POST /api/employees/{employeeId}/contracts
     * @param {number} employeeId
     * @param {FormData} data - includes pdf_file if uploading
     */
    create: async (employeeId, data) => {
        const response = await axios.post(`/api/employees/${employeeId}/contracts`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Update contract
     * PUT /api/contracts/{id}
     * @param {number} id
     * @param {FormData} data
     */
    update: async (id, data) => {
        const response = await axios.put(`/api/contracts/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    /**
     * Delete contract
     * DELETE /api/contracts/{id}
     */
    delete: async (id) => {
        const response = await axios.delete(`/api/contracts/${id}`);
        return response.data;
    },

    /**
     * Stream/download PDF file
     * GET /api/contracts/{id}/file
     */
    streamFile: async (id) => {
        const response = await axios.get(`/api/contracts/${id}/file`, {
            responseType: 'blob'
        });
        return response;
    },
};

// ============================================================================
// Disposal API (Thu hủy)
// ============================================================================
export const disposalApi = {
    summary: async () => {
        const response = await axios.get('/api/disposal/summary');
        return response.data;
    },
    assets: async (params = {}) => {
        const response = await axios.get('/api/disposal/assets', { params });
        return response.data;
    },
    retire: async (assetId, data) => {
        const response = await axios.post(`/api/disposal/assets/${assetId}/retire`, data);
        return response.data;
    },
};

export default {
    assets: assetsApi,
    departmentAssets: departmentAssetsApi,
    employees: employeesApi,
    requests: requestsApi,
    shifts: shiftsApi,
    users: usersApi,
    inventory: inventoryApi,
    locations: locationsApi,
    suppliers: suppliersApi,
    purchaseOrders: purchaseOrdersApi,
    maintenance: maintenanceApi,
    feedback: feedbackApi,
    reports: reportsApi,
    contracts: contractsApi,
    disposal: disposalApi,
    handleApiError,
};
