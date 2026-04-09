<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\PermissionRegistrar;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $version = config('version.version');

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'version' => $version,
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // OPTIMIZED: Only sync roles if user doesn't already have the role assigned
        // This avoids unnecessary database operations on every login
        $user = Auth::user();
        if ($user && $user->user_role) {
            try {
                // Check if user already has the role to avoid unnecessary sync
                if (!$user->hasRole($user->user_role)) {
                    $user->syncRoles([$user->user_role]);
                    // Only clear cache if we actually changed roles
                    app()[PermissionRegistrar::class]->forgetCachedPermissions();
                }
            } catch (\Exception $e) {
                // Log error but don't block login
                \Illuminate\Support\Facades\Log::warning('Failed to sync user role on login: '.$e->getMessage());
            }
        }

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
