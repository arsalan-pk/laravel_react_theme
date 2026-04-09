<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            ['meta_key' => 'site_name', 'meta_value' => 'My Site'],
            ['meta_key' => 'site_logo', 'meta_value' => 'logo.png'],
        ];

        Setting::insert($settings);
    }
}
