/**
 * API Client Module - Phase 3 Assets & QR
 * Handles all API calls with consistent error handling
 */
import axios from 'axios';

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
            toast?.error(data?.message || "You don't have permission to perform this action");
            break;
        case 404:
            toast?.error(data?.message || 'Resource not found');
            break;
        case 409:
            // MUST_CHANGE_PASSWORD - should redirect to change password
            if (data?.error === 'MUST_CHANGE_PASSWORD') {
                window.location.href = '/change-password';
            } else {
                toast?.error(data?.message || 'Conflict error');
            }
            break;
        case 422:
            // Validation errors - return for form handling
            const firstError = Object.values(data?.errors || {})[0]?.[0];
            toast?.error(firstError || data?.message || 'Validation failed');
            break;
        default:
            toast?.error(data?.message || 'An unexpected error occurred');
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
     * Assign asset to employee
     * POST /api/assets/{id}/assign
     */
    assign: async (id, employeeId) => {
        const response = await axios.post(`/api/assets/${id}/assign`, {
            employee_id: employeeId
        });
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

    /**
     * Regenerate QR code for asset
     * POST /api/assets/{id}/regenerate-qr
     */
    regenerateQr: async (id) => {
        const response = await axios.post(`/api/assets/${id}/regenerate-qr`);
        return response.data;
    },
};

// ============================================================================
// My Assets API
// ============================================================================
export const myAssetsApi = {
    /**
     * Get current user's assigned assets
     * GET /api/my-assets
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/my-assets', { params });
        return response.data;
    },

    /**
     * Get current user's assigned assets in dropdown format
     * GET /api/my-assigned-assets/dropdown
     * @returns { data: [{ value, label, asset_code, name, type }] }
     */
    dropdown: async () => {
        const response = await axios.get('/api/my-assigned-assets/dropdown');
        return response.data;
    },

    /**
     * Get available assets for loan in dropdown format
     * GET /api/assets/available-for-loan
     * @returns { data: [{ value, label, asset_code, name, type }] }
     */
    availableForLoan: async () => {
        const response = await axios.get('/api/assets/available-for-loan');
        return response.data;
    },
};

// ============================================================================
// QR API
// ============================================================================
export const qrApi = {
    /**
     * Resolve QR payload to asset info
     * POST /api/qr/resolve
     */
    resolve: async (payload) => {
        const response = await axios.post('/api/qr/resolve', { payload });
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
    review: async (id, action, note = null) => {
        const response = await axios.post(`/api/requests/${id}/review`, {
            action,
            note,
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
// Inventory API (Phase 6 - Admin/HR Only)
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
};

// ============================================================================
// My Asset History API (Phase 6 - All Users)
// ============================================================================
export const myAssetHistoryApi = {
    /**
     * Get personal asset history timeline
     * GET /api/my-asset-history
     */
    list: async (params = {}) => {
        const response = await axios.get('/api/my-asset-history', { params });
        return response.data;
    },

    /**
     * Get history summary statistics
     * GET /api/my-asset-history/summary
     */
    summary: async () => {
        const response = await axios.get('/api/my-asset-history/summary');
        return response.data;
    },
};

// ============================================================================
// Locations API (Phase 6 - Admin/HR)
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
        const response = await axios.post(`/api/maintenance-events/${id}/cancel`, { cancel_reason: reason });
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

export default {
    assets: assetsApi,
    myAssets: myAssetsApi,
    qr: qrApi,
    employees: employeesApi,
    requests: requestsApi,
    shifts: shiftsApi,
    users: usersApi,
    inventory: inventoryApi,
    myAssetHistory: myAssetHistoryApi,
    locations: locationsApi,
    maintenance: maintenanceApi,
    feedback: feedbackApi,
    reports: reportsApi,
    contracts: contractsApi,
    handleApiError,
};
