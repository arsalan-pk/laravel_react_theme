<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\UserDetail;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('userDetails');
        
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'pageLabel'=>'Profile',
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        // Hard delete to match expectation that the user record is removed after account deletion
        $user->forceDelete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Upload profile picture.
     */
    public function uploadProfilePicture(Request $request): RedirectResponse
    {
        $request->validate([
            'profile_picture' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:5120'],
        ]);

        $user = $request->user();
        
        // Delete old profile picture if exists
        $oldPath = UserDetail::getValue($user->id, 'profile_picture');
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        // Process and compress image using Intervention Image
        $image = $request->file('profile_picture');
        $manager = new ImageManager(new Driver());
        $img = $manager->read($image);
        
        // Resize to max 300x300 and compress
        $img->cover(300, 300);
        
        // Generate unique filename
        $filename = 'profile_' . $user->id . '_' . time() . '.webp';
        
        // Store compressed image
        $path = 'profile-pictures/' . $filename;
        Storage::disk('public')->put($path, $img->toWebp(quality: 80));
        
        // Save using key-value structure
        UserDetail::setValue($user->id, 'profile_picture', $path, 'profile', 'string');

        return Redirect::route('profile.edit')->with('status', 'profile-picture-updated');
    }

    /**
     * Delete profile picture.
     */
    public function deleteProfilePicture(Request $request): RedirectResponse
    {
        $user = $request->user();
        
        // Get current profile picture path
        $path = UserDetail::getValue($user->id, 'profile_picture');
        
        if ($path) {
            // Delete file from storage
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
            
            // Delete from database
            UserDetail::deleteKey($user->id, 'profile_picture');
        }

        return Redirect::route('profile.edit')->with('status', 'profile-picture-deleted');
    }
}
