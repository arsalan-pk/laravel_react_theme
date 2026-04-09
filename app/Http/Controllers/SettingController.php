<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $imageUrl = '';
        if (app()->environment('production')) {
            $imageUrl = 'public/';
        }

        $settings = Setting::all();
        $settingArray = $settings->pluck('meta_value', 'meta_key')->all();
        if (isset($settingArray['site_logo'])) {
            $settingArray['site_logo'] = $imageUrl.$settingArray['site_logo'];
        }
        if (isset($settingArray['favicon'])) {
            $settingArray['favicon'] = $imageUrl.$settingArray['favicon'];
        }

        // Render the 'Settings' component with data
        return Inertia::render('Settings/Settings', [
            'settings' => $settingArray,
            'pageLabel' => 'Settings',
        ]);
    }

    public function update(Request $request)
    {
        $setting_type = $request->setting_type;
        $settingsData = $request->only([
            'site_name',
            'favicon',
        ]);

        if ($setting_type == 'site_information') {
            $request->validate([
                'site_name' => 'required|string',
                'site_logo' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
                'favicon' => 'image|mimes:ico,png,jpg,jpeg|max:512',
            ]);
        }

        foreach ($settingsData as $metaKey => $metaValue) {
            if ($metaValue !== null) { // Ensure the value is not null before updating
                Setting::updateOrCreate(
                    ['meta_key' => $metaKey],
                    ['meta_value' => $metaValue]
                );
            }
        }

        // Handle image upload if a file is present
        if ($request->hasFile('site_logo')) {
            $image = $request->file('site_logo');

            // Retrieve the current site logo path from the database
            $currentImage = Setting::where('meta_key', 'site_logo')->first();

            if ($currentImage) {
                $currentImagePath = public_path($currentImage->meta_value);

                // Check if the file exists and delete it
                if (file_exists($currentImagePath)) {
                    unlink($currentImagePath);
                }
            }

            $folderPath = 'uploads/'.date('Y').'/'.date('m');
            $imageUrl = $image->store($folderPath, 'public');

            // Update the 'site_logo' setting in the database with the image path
            Setting::updateOrCreate(
                ['meta_key' => 'site_logo'],
                ['meta_value' => 'storage/'.$imageUrl]
            );
        }

        // Handle favicon upload if a file is present
        if ($request->hasFile('favicon')) {
            $image = $request->file('favicon');

            // Retrieve the current favicon path from the database
            $currentImage = Setting::where('meta_key', 'favicon')->first();

            if ($currentImage) {
                $currentImagePath = public_path($currentImage->meta_value);

                // Check if the file exists and delete it
                if (file_exists($currentImagePath)) {
                    unlink($currentImagePath);
                }
            }

            $folderPath = 'uploads/'.date('Y').'/'.date('m');
            $imageUrl = $image->store($folderPath, 'public');

            // Update the 'favicon' setting in the database with the image path
            Setting::updateOrCreate(
                ['meta_key' => 'favicon'],
                ['meta_value' => 'storage/'.$imageUrl]
            );
        }

        return response()->json(['message' => 'Setting has been updated successfully!'], 200);
    }
}
