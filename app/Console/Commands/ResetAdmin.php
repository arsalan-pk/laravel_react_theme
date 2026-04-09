<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:reset {--email=admin@admin.com} {--password=admin123}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset or create admin user for emergency access';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->option('email');
        $password = $this->option('password');
        
        $this->info('Resetting admin user...');
        
        try {
            // Check if admin user exists
            $admin = User::where('email', $email)->first();
            
            if (!$admin) {
                // Create new admin user
                $admin = User::create([
                    'name' => 'Administrator',
                    'user_name' => 'admin',
                    'email' => $email,
                    'user_role' => 'super-admin',
                    'password' => Hash::make($password),
                    'is_active' => 1,
                    'store_id' => 1,
                ]);
                $this->info('✅ New admin user created!');
            } else {
                // Reset existing admin password
                $admin->update([
                    'password' => Hash::make($password),
                    'is_active' => 1,
                    'user_role' => 'super-admin',
                ]);
                $this->info('✅ Admin password reset!');
            }
            
            $this->line('');
            $this->line('Admin Login Details:');
            $this->line('Email: ' . $email);
            $this->line('Password: ' . $password);
            $this->line('Role: ' . $admin->user_role);
            $this->line('');
            
            // Show all users
            $this->info('All Users in Database:');
            $users = User::select('id', 'name', 'email', 'user_role', 'is_active')->get();
            
            $headers = ['ID', 'Name', 'Email', 'Role', 'Active'];
            $rows = [];
            
            foreach ($users as $user) {
                $rows[] = [
                    $user->id,
                    $user->name,
                    $user->email,
                    $user->user_role,
                    $user->is_active ? 'Yes' : 'No'
                ];
            }
            
            $this->table($headers, $rows);
            
            return 0;
            
        } catch (\Exception $e) {
            $this->error('❌ Error: ' . $e->getMessage());
            return 1;
        }
    }
}
