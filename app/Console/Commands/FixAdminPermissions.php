<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Spatie\Permission\Models\Role;

class FixAdminPermissions extends Command
{
    protected $signature = 'fix:admin-permissions';
    protected $description = 'Fix admin user permissions by assigning Spatie roles';

    public function handle()
    {
        $this->info('Fixing admin permissions...');
        
        // Find admin user - try different possibilities
        $user = User::where('user_name', 'admin')->first();
        if (!$user) {
            $user = User::where('user_role', 'admin')->first();
        }
        if (!$user) {
            $user = User::where('user_role', 'super-admin')->first();
        }
        if (!$user) {
            // Show all users to help debug
            $this->info('Available users:');
            User::select('id', 'name', 'user_name', 'user_role')->get()->each(function($u) {
                $this->info("ID: {$u->id}, Name: {$u->name}, Username: {$u->user_name}, Role: {$u->user_role}");
            });
            $this->error('No admin user found!');
            return 1;
        }
        
        $this->info("Found user: {$user->name}");
        $this->info("Current user_role field: {$user->user_role}");
        
        // Check if admin role exists
        $adminRole = Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $this->error('Admin role not found! Run the PermissionSeeder first.');
            return 1;
        }
        
        $this->info("Admin role found with {$adminRole->permissions->count()} permissions");
        
        // Check if user has Spatie admin role
        if (!$user->hasRole('admin')) {
            $this->info('User does not have Spatie admin role, assigning it...');
            $user->assignRole('admin');
            $this->info('✅ Admin role assigned!');
        } else {
            $this->info('✅ User already has admin role');
        }
        
        // Verify permissions
        $this->info('Spatie roles: ' . $user->roles->pluck('name')->implode(', '));
        $this->info('Total permissions: ' . $user->getAllPermissions()->count());
        
        // Test specific permissions
        $testPermissions = ['view_dashboard', 'view_pos', 'view_bills', 'view_collections'];
        foreach ($testPermissions as $permission) {
            $canDo = $user->can($permission) ? '✅' : '❌';
            $this->info("{$canDo} Can {$permission}: " . ($user->can($permission) ? 'YES' : 'NO'));
        }
        
        $this->info('✅ Admin permissions fixed!');
        return 0;
    }
}