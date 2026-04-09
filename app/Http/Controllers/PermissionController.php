<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionController extends Controller
{
    /**
     * Get current user's permissions
     */
    public function myPermissions(): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        $role = Role::where('name', $user->user_role)->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'user_role' => $user->user_role,
            ],
            'role' => $role ? [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name')->toArray(),
            ] : null,
            'permissions_check' => [
                'can_view_dashboard' => $user->can('view_dashboard'),
            ],
        ]);
    }

    /**
     * Refresh current user's permissions
     */
    public function refreshMyPermissions(): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Not authenticated'], 401);
        }

        try {
            if ($user->user_role) {
                // Sync the user's role with Spatie
                $user->syncRoles([$user->user_role]);
                // Clear permission cache
                $this->clearPermissionCache();

                $role = Role::where('name', $user->user_role)->first();

                return response()->json([
                    'success' => true,
                    'message' => 'Permissions refreshed successfully',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'user_role' => $user->user_role,
                    ],
                    'role' => $role ? [
                        'name' => $role->name,
                        'permissions' => $role->permissions->pluck('name')->toArray(),
                    ] : null,
                    'permissions_check' => [
                        'can_view_dashboard' => $user->can('view_dashboard'),
                    ],
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'User has no role assigned',
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Failed to refresh user permissions: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to refresh permissions: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Fix permissions for all users (admin only)
     */
    public function fixAllPermissions(): JsonResponse
    {
        $user = auth()->user();
        if (!$user || !$user->can('access_dev_tools')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            DB::beginTransaction();

            // Get all users
            $users = User::whereNotNull('user_role')->get();
            $syncedCount = 0;
            $errors = [];

            foreach ($users as $user) {
                try {
                    // Check if role exists
                    $role = Role::where('name', $user->user_role)->first();

                    if ($role) {
                        // Sync the user's role with Spatie
                        $user->syncRoles([$user->user_role]);
                        $syncedCount++;
                    } else {
                        $errors[] = "User {$user->id} ({$user->name}) has role '{$user->user_role}' which doesn't exist in roles table";
                    }
                } catch (\Exception $e) {
                    $errors[] = "Error syncing user {$user->id}: ".$e->getMessage();
                }
            }

            // Clear permission cache
            $this->clearPermissionCache();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully synced {$syncedCount} user(s) with their roles",
                'synced_count' => $syncedCount,
                'total_users' => $users->count(),
                'errors' => $errors,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to fix all permissions: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to sync permissions: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear permission cache
     */
    protected function clearPermissionCache(): void
    {
        try {
            app()[PermissionRegistrar::class]->forgetCachedPermissions();
        } catch (\Exception $e) {
            Log::warning('Failed to clear permission cache: '.$e->getMessage());
        }
    }
}

