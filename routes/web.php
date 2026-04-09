<?php

use App\Http\Controllers\BackupController;
use App\Http\Controllers\BackupStorageMediaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PosNoteController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RestoreController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('login');
});

// Permission routes
Route::get('/api/my-permissions', [PermissionController::class, 'myPermissions'])->middleware('auth');
Route::post('/api/refresh-my-permissions', [PermissionController::class, 'refreshMyPermissions'])->middleware('auth');
Route::post('/api/fix-permissions', [PermissionController::class, 'fixAllPermissions'])->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/upload-picture', [ProfileController::class, 'uploadProfilePicture'])->name('profile.upload-picture');
    Route::delete('/profile/delete-picture', [ProfileController::class, 'deleteProfilePicture'])->name('profile.delete-picture');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard')->middleware('can:view_dashboard');
    Route::post('/dashboard/summary', [DashboardController::class, 'getDashboardSummary'])->name('dashboard.summary')->middleware('can:view_dashboard_summary');

    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index')->middleware('can:view_settings');
    Route::post('/settings-update', [SettingController::class, 'update'])->name('settings.update')->middleware('can:edit_settings');

    Route::get('/users', [UserController::class, 'index'])->name('users.index')->middleware('can:view_users');
    Route::post('/user', [UserController::class, 'store'])->name('user.store')->middleware('can:create_user');
    Route::post('/api/check-username', [UserController::class, 'checkUsername'])->name('user.check-username')->middleware('auth');
    Route::get('/user/role', [UserController::class, 'userRole'])->name('user.role')->middleware('can:view_roles');
    Route::get('/user/role/create', [UserController::class, 'createRole'])->name('user.role.create')->middleware('can:create_role');
    Route::get('/user/role/{id}/edit', [UserController::class, 'editRole'])->name('user.role.edit')->middleware('can:edit_role');
    Route::post('/user/role', [UserController::class, 'storeRole'])->name('user.storeRole')->middleware('can:create_role');
    Route::put('/user/role/{id}', [UserController::class, 'updateRole'])->name('user.updateRole')->middleware('can:edit_role');
    Route::delete('/user/role/{id}', [UserController::class, 'deleteRole'])->name('user.deleteRole')->middleware('can:delete_role');
    Route::post('/user/{id}', [UserController::class, 'update'])->name('user.update')->middleware('can:edit_user');
    Route::post('/users/{id}/deactivate', [UserController::class, 'userDeactivate'])->name('user.deactivate')->middleware('can:deactivate_user');

    Route::get('/clear-cache', function () {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('route:clear');
            Artisan::call('view:clear');
            Artisan::call('event:clear');
            Artisan::call('optimize:clear');

            // Also clear permission cache
            app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

            return response()->json([
                'success' => true,
                'message' => 'All caches cleared and configurations updated successfully!',
                'title' => 'Cache Cleared'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache: ' . $e->getMessage(),
                'title' => 'Error'
            ], 500);
        }
    });

    Route::get('/backups', [BackupController::class, 'index'])->name('backups.index')->middleware('can:manage_backups');
    Route::post('/backups/create', [BackupController::class, 'createBackup'])->name('backups.create')->middleware('can:manage_backups');
    Route::get('/backups/list', [BackupController::class, 'listBackups'])->name('backups.list')->middleware('can:manage_backups');
    Route::delete('/backups/{file}', [BackupController::class, 'delete'])->name('backups.delete')->middleware('can:manage_backups');
    Route::get('/download-backup/{file}', [BackupController::class, 'download'])->name('backups.download')->middleware('can:manage_backups');
    Route::get('/backup-now', [BackupController::class, 'downloadBackupZip'])->name('backups.download-now')->middleware('can:manage_backups');
    Route::post('/backup/restore', [RestoreController::class, 'restore'])->name('backup.restore')->middleware('can:manage_backups');

    // Recovery Center routes - only for users
    Route::get('/restore', [RestoreController::class, 'index'])->name('restore.index')->middleware('can:view_restore');
    Route::get('/restore/users', [RestoreController::class, 'users'])->name('restore.users')->middleware('can:restore_users');
    Route::post('/restore/users/{id}', [RestoreController::class, 'restoreUser'])->name('restore.user')->middleware('can:restore_users');

    Route::get('/backup-storage-media', [BackupStorageMediaController::class, 'index'])->name('backup-storage-media.index')->middleware('can:manage_backups');
    Route::post('/backup-storage-media', [BackupStorageMediaController::class, 'store'])->name('backup-storage-media.store')->middleware('can:manage_backups');
    Route::post('/backup-storage-media/{id}', [BackupStorageMediaController::class, 'update'])->name('backup-storage-media.update')->middleware('can:manage_backups');
    Route::delete('/backup-storage-media/{id}', [BackupStorageMediaController::class, 'destroy'])->name('backup-storage-media.destroy')->middleware('can:manage_backups');

    // POS Notes routes
    Route::get('/api/pos-notes/days', [PosNoteController::class, 'getDays'])->name('pos-notes.days');
    Route::get('/api/pos-notes/by-day', [PosNoteController::class, 'getNotesByDay'])->name('pos-notes.by-day');
    Route::post('/api/pos-notes', [PosNoteController::class, 'store'])->name('pos-notes.store');
    Route::put('/api/pos-notes/{id}', [PosNoteController::class, 'update'])->name('pos-notes.update');
    Route::patch('/api/pos-notes/{id}/toggle-complete', [PosNoteController::class, 'toggleComplete'])->name('pos-notes.toggle-complete');
    Route::delete('/api/pos-notes/{id}', [PosNoteController::class, 'destroy'])->name('pos-notes.destroy');

    // Soft delete routes
    Route::get('/api/pos-notes/trashed', [PosNoteController::class, 'getTrashedNotes'])->name('pos-notes.trashed');
    Route::post('/api/pos-notes/{id}/restore', [PosNoteController::class, 'restore'])->name('pos-notes.restore');
    Route::delete('/api/pos-notes/{id}/force', [PosNoteController::class, 'forceDelete'])->name('pos-notes.force-delete');

    });

require __DIR__.'/auth.php';
