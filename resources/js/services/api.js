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

export default {
    assets: assetsApi,
    myAssets: myAssetsApi,
    qr: qrApi,
    employees: employeesApi,
    handleApiError,
};
