<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Support\Facades\Hash;

use App\Models\User;
use App\Models\Store;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $developer = User::updateOrCreate(
            ['email' => 'arsalan@gmail.com'],
            [
                'name' => 'Arsalan Khan',
                'user_name'=>'arsalan',
                'user_role'=>'Developer',
                'password' => Hash::make('12345678'),
            ]
        );
        
        $admin = User::updateOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Admin',
                'user_name'=>'admin',
                'user_role'=>'Admin',
                'password' => Hash::make('12345678'),
            ]
        );

        $this->call([
            SettingSeeder::class,
            PermissionSeeder::class,
        ]);

        // Assign roles after permissions are created
        $developer->assignRole('Developer');
        $admin->assignRole('Admin');

    }
}
