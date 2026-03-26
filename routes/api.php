<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QrController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Protected by Sanctum
|--------------------------------------------------------------------------
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
    | PHASE 2: Profile & RBAC Routes
    |--------------------------------------------------------------------------
    */

    /**
     * Profile Routes (self)
     * All authenticated users can view/edit their own profile
     */
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    /**
     * Admin/HR Routes - Employees Management
     * Backend-enforced RBAC via middleware + policies
     */
    Route::middleware('role:admin,hr')->group(function () {
        // Employees CRUD
        Route::get('/employees/available', [EmployeeController::class, 'available']);
        Route::apiResource('employees', EmployeeController::class);

        // Users (Roles & Permission) Management
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        // Utility endpoints
        Route::get('/roles', [UserController::class, 'roles']);
    });

    /*
    |--------------------------------------------------------------------------
    | PHASE 3: Assets + Assignment + QR Routes
    |--------------------------------------------------------------------------
    */

    /**
     * QR Resolve - All authenticated users can scan QR codes
     */
    Route::post('/qr/resolve', [QrController::class, 'resolve']);

    /**
     * My Assets - Non-admin users can view their assigned assets
     */
    Route::get('/my-assets', [AssetController::class, 'index']);

    /**
     * Admin/HR Routes - Asset Management
     */
    Route::middleware('role:admin,hr')->group(function () {
        // Assets CRUD
        Route::get('/assets/available', [AssetController::class, 'available']);
        Route::apiResource('assets', AssetController::class);
        
        // Asset Assignment
        Route::post('/assets/{asset}/assign', [AssetController::class, 'assign']);
        Route::post('/assets/{asset}/unassign', [AssetController::class, 'unassign']);
        Route::post('/assets/{asset}/regenerate-qr', [AssetController::class, 'regenerateQr']);
    });

    /*
    |--------------------------------------------------------------------------
    | PHASE 4: Asset Tracking / Timesheet (Check-in/out)
    |--------------------------------------------------------------------------
    */

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
     * Asset check-in status - Admin/HR can view any, others can view assigned
     */
    Route::get('/assets/{asset}/checkin-status', [CheckinController::class, 'assetCheckinStatus']);
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
