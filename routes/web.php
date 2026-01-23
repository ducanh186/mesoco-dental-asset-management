<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Sanctum SPA Authentication
|--------------------------------------------------------------------------
*/

/**
 * Authentication Routes
 */
Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:login');

Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

/**
 * Forgot Password Routes
 */
Route::prefix('forgot-password')->group(function () {
    Route::post('/request', [AuthController::class, 'forgotPasswordRequest'])
        ->middleware('throttle:forgot-password-request');
    
    Route::post('/reset', [AuthController::class, 'forgotPasswordReset'])
        ->middleware('throttle:forgot-password-reset');
});

/*
|--------------------------------------------------------------------------
| Login Page Route (Named for middleware redirects)
|--------------------------------------------------------------------------
*/

Route::view('/login', 'spa')->name('login');

/*
|--------------------------------------------------------------------------
| SPA Catch-All Route
|--------------------------------------------------------------------------
| All non-API routes serve the React SPA shell
*/

Route::get('/{any}', function () {
    return view('spa');
})->where('any', '.*');
