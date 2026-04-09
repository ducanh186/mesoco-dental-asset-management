<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetOffServiceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DisposalController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MaintenanceEventController;
use App\Http\Controllers\MyAssetHistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseOrderController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReviewRequestController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

$legacyContractModuleResponse = static function () {
    return response()->json([
        'message' => 'Employee contract module has been removed from the main product scope.',
    ], 410);
};

/*
|--------------------------------------------------------------------------
| API Routes - Protected by Sanctum
|--------------------------------------------------------------------------
| 
| RBAC Matrix:
| ┌─────────────┬────────────────────────────────────────────────────────────────────┐
| │ Role        │ Permissions                                                        │
| ├─────────────┼────────────────────────────────────────────────────────────────────┤
| │ manager     │ Duyệt yêu cầu, báo cáo, cấu hình và điều phối hệ thống             │
| │ technician  │ Danh mục, cấp phát, bảo trì, thu hủy và vận hành thiết bị          │
| │ employee    │ Báo sự cố / mượn thiết bị / theo dõi thiết bị cá nhân              │
| │ supplier    │ Theo dõi và cập nhật trạng thái đơn hàng của chính nhà cung cấp     │
| └─────────────┴────────────────────────────────────────────────────────────────────┘
|
| Ghi chú: bác sĩ dùng chung vai trò `employee`.
*/

/**
 * Authenticated Routes
 */
Route::middleware(['auth:sanctum', 'must_change_password'])->group(function () use ($legacyContractModuleResponse) {
    /**
     * GET /api/me
     * Get current authenticated user
     */
    Route::get('/me', [AuthController::class, 'me']);

    /**
     * POST /api/change-password
     * Change password for authenticated user
     */
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    /*
    |--------------------------------------------------------------------------
    | COMMON ROUTES - All Authenticated Users
    |--------------------------------------------------------------------------
    */

    /**
     * Profile Routes (self)
     * All authenticated users can view/edit their own profile
     */
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::middleware('role:manager,technician,employee')->group(function () {
        /**
         * QR Resolve - core internal roles only
         */
        Route::post('/qr/resolve', [QrController::class, 'resolve']);

        /**
         * My Assets - internal users can view their assigned assets
         */
        Route::get('/my-assets', [AssetController::class, 'myAssets']);
        Route::get('/my-assigned-assets/dropdown', [AssetController::class, 'myAssignedAssetsDropdown']);
        Route::get('/assets/available-for-loan', [AssetController::class, 'availableForLoan']);

        /**
         * Shifts and check-ins
         */
        Route::get('/shifts', [ShiftController::class, 'index']);
        Route::get('/shifts/{shift}', [ShiftController::class, 'show']);
        Route::post('/checkins', [CheckinController::class, 'store']);
        Route::get('/my-checkins', [CheckinController::class, 'myCheckins']);
        Route::patch('/checkins/{checkin}/checkout', [CheckinController::class, 'checkout']);
        Route::get('/assets/{asset}/checkin-status', [CheckinController::class, 'assetCheckinStatus']);

        /**
         * My asset history
         */
        Route::get('/my-asset-history', [MyAssetHistoryController::class, 'index']);
        Route::get('/my-asset-history/summary', [MyAssetHistoryController::class, 'summary']);

        /**
         * Internal request workflow
         */
        Route::get('/requests', [RequestController::class, 'index']);
        Route::post('/requests', [RequestController::class, 'store']);
        Route::get('/requests/{id}', [RequestController::class, 'show']);
        Route::post('/requests/{id}/cancel', [RequestController::class, 'cancel']);

        /*
        |--------------------------------------------------------------------------
        | FEEDBACK ROUTES - Internal authenticated roles
        |--------------------------------------------------------------------------
        */
        Route::get('/feedbacks', [FeedbackController::class, 'index']);
        Route::get('/feedbacks/summary', [FeedbackController::class, 'summary']);
        Route::post('/feedbacks', [FeedbackController::class, 'store']);
        Route::get('/feedbacks/{feedback}', [FeedbackController::class, 'show']);
        Route::put('/feedbacks/{feedback}', [FeedbackController::class, 'update']);
        Route::patch('/feedbacks/{feedback}/status', [FeedbackController::class, 'updateStatus']);
        Route::delete('/feedbacks/{feedback}', [FeedbackController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | LEGACY CONTRACT ROUTES
    |--------------------------------------------------------------------------
    | Employee contracts are out of the current product scope. Keep explicit
    | JSON endpoints so old clients do not fall through to the SPA HTML.
    */
    Route::get('/employees/{employee}/contracts', $legacyContractModuleResponse);
    Route::post('/employees/{employee}/contracts', $legacyContractModuleResponse);
    Route::get('/contracts/{contract}', $legacyContractModuleResponse);
    Route::put('/contracts/{contract}', $legacyContractModuleResponse);
    Route::patch('/contracts/{contract}', $legacyContractModuleResponse);
    Route::delete('/contracts/{contract}', $legacyContractModuleResponse);
    Route::get('/contracts/{contract}/file', $legacyContractModuleResponse);

    /*
    |--------------------------------------------------------------------------
    | MANAGER ONLY ROUTES
    |--------------------------------------------------------------------------
    | Approval, reporting, and system-level governance
    */
    Route::middleware('role:manager')->group(function () {
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::get('/roles', [UserController::class, 'roles']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        Route::get('/review-requests', [ReviewRequestController::class, 'index']);
        Route::post('/requests/{id}/review', [ReviewRequestController::class, 'review']);

        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::get('/reports/export', [ReportController::class, 'export']);
    });

    /*
    |--------------------------------------------------------------------------
    | MANAGER + TECHNICIAN ROUTES
    |--------------------------------------------------------------------------
    | Operational modules from the DFD:
    | 1. Catalog & records
    | 2. Allocation
    | 3. Maintenance & repair
    | 4. Disposal
    */
    Route::middleware('role:manager,technician')->group(function () {
        Route::get('/employees/available', [EmployeeController::class, 'available']);
        Route::apiResource('employees', EmployeeController::class);

        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);

        Route::get('/assets', [AssetController::class, 'index']);
        Route::get('/assets/available', [AssetController::class, 'available']);
        Route::post('/assets', [AssetController::class, 'store']);
        Route::get('/assets/{asset}', [AssetController::class, 'show']);
        Route::put('/assets/{asset}', [AssetController::class, 'update']);
        Route::delete('/assets/{asset}', [AssetController::class, 'destroy']);
        Route::post('/assets/{asset}/assign', [AssetController::class, 'assign']);
        Route::post('/assets/{asset}/unassign', [AssetController::class, 'unassign']);
        Route::post('/assets/{asset}/regenerate-qr', [AssetController::class, 'regenerateQr']);

        Route::get('/inventory/summary', [InventoryController::class, 'summary']);
        Route::get('/inventory/assets', [InventoryController::class, 'assets']);
        Route::get('/inventory/valuation', [InventoryController::class, 'valuation']);
        Route::get('/inventory/export', [InventoryController::class, 'export']);

        Route::get('/locations/dropdown', [LocationController::class, 'dropdown']);
        Route::apiResource('locations', LocationController::class);
        Route::get('/suppliers/dropdown', [SupplierController::class, 'dropdown']);
        Route::apiResource('suppliers', SupplierController::class);
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
        Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);

        Route::get('/disposal/summary', [DisposalController::class, 'summary']);
        Route::get('/disposal/assets', [DisposalController::class, 'assets']);
        Route::post('/disposal/assets/{asset}/retire', [DisposalController::class, 'retire']);
        Route::get('/maintenance-events', [MaintenanceEventController::class, 'index']);
        Route::get('/maintenance-events/summary', [MaintenanceEventController::class, 'summary']);
        Route::post('/maintenance-events', [MaintenanceEventController::class, 'store']);
        Route::get('/maintenance-events/{maintenanceEvent}', [MaintenanceEventController::class, 'show']);
        Route::put('/maintenance-events/{maintenanceEvent}', [MaintenanceEventController::class, 'update']);
        Route::delete('/maintenance-events/{maintenanceEvent}', [MaintenanceEventController::class, 'destroy']);
        Route::post('/maintenance-events/{maintenanceEvent}/start', [MaintenanceEventController::class, 'start']);
        Route::post('/maintenance-events/{maintenanceEvent}/complete', [MaintenanceEventController::class, 'complete']);
        Route::post('/maintenance-events/{maintenanceEvent}/cancel', [MaintenanceEventController::class, 'cancel']);
        Route::post('/assets/{asset}/lock', [AssetOffServiceController::class, 'lock']);
        Route::post('/assets/{asset}/unlock', [AssetOffServiceController::class, 'unlock']);
    });

    Route::middleware('role:manager,technician,supplier')->group(function () {
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
        Route::patch('/purchase-orders/{purchaseOrder}/status', [PurchaseOrderController::class, 'updateStatus']);
    });

    // Lock status is viewable by all authenticated users
    Route::get('/assets/{asset}/lock-status', [AssetOffServiceController::class, 'status']);
});

/**
 * GET /api/health
 * Health check endpoint (public)
 */
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toISOString(),
    ]);
});
