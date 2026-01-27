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
    handleApiError,
};
