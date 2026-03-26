<?php

use App\Http\Middleware\CheckMustChangePassword;
use App\Http\Middleware\CheckRole;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        
        // Disable CSRF for specific routes (testing purposes)
        $middleware->validateCsrfTokens(except: [
            '/login',
            '/logout', 
            'forgot-password/*',
            'api/*'
        ]);
        
        // Register custom middleware aliases
        $middleware->alias([
            'role' => CheckRole::class,
            'must_change_password' => CheckMustChangePassword::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle unauthenticated requests for API - return JSON 401, not redirect
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });
    })->create();
