<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * CheckRole Middleware
 * 
 * Enforces role-based access control at the backend level.
 * Do NOT rely on frontend menu hiding for security.
 * 
 * Usage in routes:
 *   ->middleware('role:admin')           // single role
 *   ->middleware('role:admin,hr')        // multiple roles (OR)
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Allowed roles (comma-separated or multiple args)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Flatten roles (handle both 'admin,hr' and 'admin', 'hr')
        $allowedRoles = [];
        foreach ($roles as $role) {
            $allowedRoles = array_merge($allowedRoles, explode(',', $role));
        }
        $allowedRoles = array_map('trim', $allowedRoles);

        if (!$user->hasAnyRole($allowedRoles)) {
            return response()->json([
                'message' => 'Forbidden. You do not have permission to access this resource.',
                'required_roles' => $allowedRoles,
                'your_role' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
