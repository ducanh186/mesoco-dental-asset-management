<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\AssetCheckin;
use App\Models\AssetRequest;
use App\Models\Employee;
use App\Models\User;
use App\Policies\AssetCheckinPolicy;
use App\Policies\AssetRequestPolicy;
use App\Policies\EmployeePolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->registerPolicies();
    }

    /**
     * Register authorization policies.
     */
    protected function registerPolicies(): void
    {
        Gate::policy(Employee::class, EmployeePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(AssetCheckin::class, AssetCheckinPolicy::class);
        Gate::policy(AssetRequest::class, AssetRequestPolicy::class);

        // Register checkIn ability for Asset (used via Gate::inspect)
        Gate::define('checkIn', [AssetCheckinPolicy::class, 'checkIn']);
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // POST /login: 5/min per IP + employee_code keying
        RateLimiter::for('login', function (HttpRequest $request) {
            $employeeCode = $request->input('employee_code', '');
            $key = $request->ip() . '|' . $employeeCode;
            
            return Limit::perMinute(5)->by($key);
        });

        // POST /forgot-password/request: 3/min per IP + 1/min per email
        RateLimiter::for('forgot-password-request', function (HttpRequest $request) {
            $ip = $request->ip();
            $email = strtolower($request->input('email', ''));

            return [
                // 3 requests per minute per IP
                Limit::perMinute(3)->by('forgot-ip:' . $ip),
                // 1 request per minute per email
                Limit::perMinute(1)->by('forgot-email:' . $email),
            ];
        });

        // POST /forgot-password/reset: 5/min per IP + 5/min per email
        RateLimiter::for('forgot-password-reset', function (HttpRequest $request) {
            $ip = $request->ip();
            $email = strtolower($request->input('email', ''));

            return [
                // 5 requests per minute per IP
                Limit::perMinute(5)->by('reset-ip:' . $ip),
                // 5 requests per minute per email
                Limit::perMinute(5)->by('reset-email:' . $email),
            ];
        });
    }
}
