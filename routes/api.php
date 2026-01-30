<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetOffServiceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeContractController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MaintenanceEventController;
use App\Http\Controllers\MyAssetHistoryController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReviewRequestController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Protected by Sanctum
|--------------------------------------------------------------------------
| 
| RBAC Matrix:
| ┌─────────────┬────────────────────────────────────────────────────────────────────┐
| │ Role        │ Permissions                                                        │
| ├─────────────┼────────────────────────────────────────────────────────────────────┤
| │ admin       │ Full access + System Settings + Users + Roles + Inventory + Maint. │
| │ hr          │ Assets + Assign + Review + Reports + Users + Inventory + Maint.    │
| │ technician  │ My Equipment + Maintenance CRUD + Requests + My Asset History      │
| │ doctor      │ My Equipment + Requests + Check-in + My Asset History              │
| │ staff       │ My Equipment + Basic Requests + Check-in + My Asset History        │
| └─────────────┴────────────────────────────────────────────────────────────────────┘
*/

/**
 * Authenticated Routes
 */
Route::middleware(['auth:sanctum', 'must_change_password'])->group(function () {
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

    /**
     * QR Resolve - All authenticated users can scan QR codes
     */
    Route::post('/qr/resolve', [QrController::class, 'resolve']);

    /**
     * My Assets - All users can view their assigned assets
     */
    Route::get('/my-assets', [AssetController::class, 'myAssets']);
    
    /**
     * My Assigned Assets for dropdown (Justification requests)
     */
    Route::get('/my-assigned-assets/dropdown', [AssetController::class, 'myAssignedAssetsDropdown']);
    
    /**
     * Available Assets - All users can view available assets for loan
     */
    Route::get('/assets/available-for-loan', [AssetController::class, 'availableForLoan']);

    /**
     * Shifts - All authenticated users can view shifts
     */
    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::get('/shifts/{shift}', [ShiftController::class, 'show']);

    /**
     * Check-ins - All authenticated users can check-in their assigned assets
     */
    Route::post('/checkins', [CheckinController::class, 'store']);
    Route::get('/my-checkins', [CheckinController::class, 'myCheckins']);
    Route::patch('/checkins/{checkin}/checkout', [CheckinController::class, 'checkout']);

    /**
     * Asset check-in status (own assets only, admin/hr can view any)
     */
    Route::get('/assets/{asset}/checkin-status', [CheckinController::class, 'assetCheckinStatus']);

    /**
     * My Asset History - All users can view their own asset history (Phase 6)
     * Server-side ownership enforcement - users can only see their own history
     */
    Route::get('/my-asset-history', [MyAssetHistoryController::class, 'index']);
    Route::get('/my-asset-history/summary', [MyAssetHistoryController::class, 'summary']);

    /**
     * Staff Requests - All authenticated users can create and view their own requests
     * Types: JUSTIFICATION (báo sự cố), ASSET_LOAN (mượn thiết bị), CONSUMABLE_REQUEST (xin vật tư)
     */
    Route::get('/requests', [RequestController::class, 'index']);
    Route::post('/requests', [RequestController::class, 'store']);
    Route::get('/requests/{id}', [RequestController::class, 'show']);
    Route::post('/requests/{id}/cancel', [RequestController::class, 'cancel']);

    /*
    |--------------------------------------------------------------------------
    | FEEDBACK ROUTES - All authenticated users (Phase 8)
    |--------------------------------------------------------------------------
    | Users can create and view their own feedback
    | Managers can view all and manage status
    */
    Route::get('/feedbacks', [FeedbackController::class, 'index']);
    Route::get('/feedbacks/summary', [FeedbackController::class, 'summary']);
    Route::post('/feedbacks', [FeedbackController::class, 'store']);
    Route::get('/feedbacks/{feedback}', [FeedbackController::class, 'show']);
    Route::put('/feedbacks/{feedback}', [FeedbackController::class, 'update']);
    Route::patch('/feedbacks/{feedback}/status', [FeedbackController::class, 'updateStatus']);
    Route::delete('/feedbacks/{feedback}', [FeedbackController::class, 'destroy']);

    /*
    |--------------------------------------------------------------------------
    | ADMIN ONLY ROUTES
    |--------------------------------------------------------------------------
    | Full system access: Users + Roles + System Settings
    */
    Route::middleware('role:admin')->group(function () {
        // Roles management - Only admin can change roles
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::get('/roles', [UserController::class, 'roles']);
        
        // Delete users - Only admin
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        /*
        |----------------------------------------------------------------------
        | Employee Contracts (Admin Only)
        |----------------------------------------------------------------------
        | Manage employee contracts with PDF upload/view
        */
        Route::get('/employees/{employee}/contracts', [EmployeeContractController::class, 'index']);
        Route::post('/employees/{employee}/contracts', [EmployeeContractController::class, 'store']);
        Route::get('/contracts/{contract}', [EmployeeContractController::class, 'show']);
        Route::put('/contracts/{contract}', [EmployeeContractController::class, 'update']);
        Route::delete('/contracts/{contract}', [EmployeeContractController::class, 'destroy']);
        Route::get('/contracts/{contract}/file', [EmployeeContractController::class, 'streamFile']);
    });

    /*
    |--------------------------------------------------------------------------
    | ADMIN + HR ROUTES
    |--------------------------------------------------------------------------
    | Asset management, Employee management, Review requests, Inventory
    */
    Route::middleware('role:admin,hr')->group(function () {
        // Employees CRUD
        Route::get('/employees/available', [EmployeeController::class, 'available']);
        Route::apiResource('employees', EmployeeController::class);

        // Users Management (HR can list/create/view but NOT change roles or delete)
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);

        // Assets CRUD
        Route::get('/assets', [AssetController::class, 'index']);
        Route::get('/assets/available', [AssetController::class, 'available']);
        Route::post('/assets', [AssetController::class, 'store']);
        Route::get('/assets/{asset}', [AssetController::class, 'show']);
        Route::put('/assets/{asset}', [AssetController::class, 'update']);
        Route::delete('/assets/{asset}', [AssetController::class, 'destroy']);
        
        // Asset Assignment
        Route::post('/assets/{asset}/assign', [AssetController::class, 'assign']);
        Route::post('/assets/{asset}/unassign', [AssetController::class, 'unassign']);
        Route::post('/assets/{asset}/regenerate-qr', [AssetController::class, 'regenerateQr']);

        // Review Requests - Admin/HR can review all pending requests
        Route::get('/review-requests', [ReviewRequestController::class, 'index']);
        Route::post('/requests/{id}/review', [ReviewRequestController::class, 'review']);

        /*
        |----------------------------------------------------------------------
        | Inventory Management (Phase 6)
        |----------------------------------------------------------------------
        | Dashboard, asset list with filters, valuation reports, CSV export
        */
        Route::get('/inventory/summary', [InventoryController::class, 'summary']);
        Route::get('/inventory/assets', [InventoryController::class, 'assets']);
        Route::get('/inventory/valuation', [InventoryController::class, 'valuation']);
        Route::get('/inventory/export', [InventoryController::class, 'export']);

        /*
        |----------------------------------------------------------------------
        | Location Management (Phase 6)
        |----------------------------------------------------------------------
        | CRUD for physical locations
        */
        Route::get('/locations/dropdown', [LocationController::class, 'dropdown']);
        Route::apiResource('locations', LocationController::class);

        /*
        |----------------------------------------------------------------------
        | Reports (Phase 8)
        |----------------------------------------------------------------------
        | System-wide summary reports for management
        */
        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::get('/reports/export', [ReportController::class, 'export']);
    });

    /*
    |--------------------------------------------------------------------------
    | TECHNICIAN + ADMIN + HR ROUTES
    |--------------------------------------------------------------------------
    | Maintenance scheduling, tracking, and off-service management (Phase 7)
    */
    Route::middleware('role:admin,hr,technician')->group(function () {
        // Maintenance Events CRUD
        Route::get('/maintenance-events', [MaintenanceEventController::class, 'index']);
        Route::get('/maintenance-events/summary', [MaintenanceEventController::class, 'summary']);
        Route::post('/maintenance-events', [MaintenanceEventController::class, 'store']);
        Route::get('/maintenance-events/{maintenanceEvent}', [MaintenanceEventController::class, 'show']);
        Route::put('/maintenance-events/{maintenanceEvent}', [MaintenanceEventController::class, 'update']);
        Route::delete('/maintenance-events/{maintenanceEvent}', [MaintenanceEventController::class, 'destroy']);
        
        // State transitions
        Route::post('/maintenance-events/{maintenanceEvent}/start', [MaintenanceEventController::class, 'start']);
        Route::post('/maintenance-events/{maintenanceEvent}/complete', [MaintenanceEventController::class, 'complete']);
        Route::post('/maintenance-events/{maintenanceEvent}/cancel', [MaintenanceEventController::class, 'cancel']);
        
        // Manual off-service lock/unlock
        Route::post('/assets/{asset}/lock', [AssetOffServiceController::class, 'lock']);
        Route::post('/assets/{asset}/unlock', [AssetOffServiceController::class, 'unlock']);
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
