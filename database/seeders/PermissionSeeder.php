<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Dashboard
            ['group' => 'dashboard', 'name' => 'view_dashboard', 'title' => 'View Dashboard', 'guard_name' => 'web'],
            ['group' => 'dashboard', 'name' => 'view_dashboard_summary', 'title' => 'View Dashboard Summary', 'guard_name' => 'web'],
            ['group' => 'dashboard', 'name' => 'view_dashboard_analytics', 'title' => 'View Dashboard Analytics', 'guard_name' => 'web'],
            ['group' => 'dashboard', 'name' => 'access_admin_tools', 'title' => 'View Admin Tools', 'guard_name' => 'web'],
            
            // Settings
            ['group' => 'settings', 'name' => 'view_settings', 'title' => 'View Settings', 'guard_name' => 'web'],
            ['group' => 'settings', 'name' => 'edit_settings', 'title' => 'Edit Settings', 'guard_name' => 'web'],

            // Users & Roles
            ['group' => 'users', 'name' => 'view_users', 'title' => 'View Users', 'guard_name' => 'web'],
            ['group' => 'users', 'name' => 'create_user', 'title' => 'Create User', 'guard_name' => 'web'],
            ['group' => 'users', 'name' => 'edit_user', 'title' => 'Edit User', 'guard_name' => 'web'],
            ['group' => 'users', 'name' => 'delete_user', 'title' => 'Delete User', 'guard_name' => 'web'],
            ['group' => 'users', 'name' => 'deactivate_user', 'title' => 'Deactivate User', 'guard_name' => 'web'],

            ['group' => 'roles', 'name' => 'view_roles', 'title' => 'View Roles', 'guard_name' => 'web'],
            ['group' => 'roles', 'name' => 'create_role', 'title' => 'Create Role', 'guard_name' => 'web'],
            ['group' => 'roles', 'name' => 'edit_role', 'title' => 'Edit Role', 'guard_name' => 'web'],
            ['group' => 'roles', 'name' => 'delete_role', 'title' => 'Delete Role', 'guard_name' => 'web'],

            // Restore/Recovery
            ['group' => 'restore', 'name' => 'view_restore', 'title' => 'View Recovery Center', 'guard_name' => 'web'],
            ['group' => 'restore', 'name' => 'restore_users', 'title' => 'Restore Users', 'guard_name' => 'web'],

            // Backups
            ['group' => 'backups', 'name' => 'manage_backups', 'title' => 'Manage Backups', 'guard_name' => 'web'],
        ];

        try {
            DB::beginTransaction();

            foreach ($permissions as $permission) {
                Permission::updateOrCreate(
                    ['name' => $permission['name'], 'group' => $permission['group']],
                    [
                        'title' => $permission['title'],
                        'guard_name' => $permission['guard_name'] ?? 'web',
                    ]
                );
            }

            $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
            $developer = Role::firstOrCreate(['name' => 'Developer', 'guard_name' => 'web']);
            $admin->syncPermissions(Permission::all());
            $developer->syncPermissions(Permission::all());
          
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Permission seeding failed: '.$e->getMessage());
        }
    }
}
