<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BackupStorageMedia;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BackupStorageMediaController extends Controller
{
    public function index()
    {
        $storageMedia = BackupStorageMedia::orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Backup/StorageMedia', [
            'storageMedia' => $storageMedia,
            'types' => [
                'local' => 'Local Storage',
                'custom_path' => 'Custom Path',
                's3' => 'Amazon S3',
                'google_drive' => 'Google Drive',
                'ftp' => 'FTP Server',
                'sftp' => 'SFTP Server',
            ],
            'pageLabel' => 'Backup Storage Media',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:local,custom_path,s3,google_drive,ftp,sftp',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
            'config' => 'nullable|array',
        ]);

        // Ensure config is an array (default to empty array for local storage)
        $validated['config'] = $validated['config'] ?? [];

        // If this is set as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            DB::table('backup_storage_media')
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        // Validate config based on type
        $this->validateConfig($validated['type'], $validated['config']);

        $storageMedia = BackupStorageMedia::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Storage media created successfully',
            'data' => $storageMedia,
        ]);
    }

    public function update(Request $request, $id)
    {
        $storageMedia = BackupStorageMedia::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:local,custom_path,s3,google_drive,ftp,sftp',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'description' => 'nullable|string',
            'config' => 'nullable|array',
        ]);

        // Ensure config is an array (default to empty array for local storage)
        $validated['config'] = $validated['config'] ?? [];

        // If this is set as default, unset other defaults
        if ($validated['is_default'] ?? false) {
            DB::table('backup_storage_media')
                ->where('is_default', true)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        // Validate config based on type
        $this->validateConfig($validated['type'], $validated['config']);

        $storageMedia->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Storage media updated successfully',
            'data' => $storageMedia,
        ]);
    }

    public function destroy($id)
    {
        $storageMedia = BackupStorageMedia::findOrFail($id);

        // Don't allow deleting if it's the only one
        $count = BackupStorageMedia::count();
        if ($count <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the only storage media. At least one storage media must exist.',
            ], 400);
        }

        // If deleting default, set another one as default
        if ($storageMedia->is_default) {
            $newDefault = BackupStorageMedia::where('id', '!=', $id)->first();
            if ($newDefault) {
                $newDefault->update(['is_default' => true]);
            }
        }

        $storageMedia->delete();

        return response()->json([
            'success' => true,
            'message' => 'Storage media deleted successfully',
        ]);
    }

    private function validateConfig($type, $config)
    {
        switch ($type) {
            case 'local':
                // No additional config needed
                break;

            case 'custom_path':
                if (empty($config['path'])) {
                    throw new \Illuminate\Validation\ValidationException(
                        validator([], []),
                        ['config.path' => ['The path field is required for custom path storage.']]
                    );
                }
                break;

            case 's3':
                $required = ['key', 'secret', 'region', 'bucket'];
                foreach ($required as $field) {
                    if (empty($config[$field])) {
                        throw new \Illuminate\Validation\ValidationException(
                            validator([], []),
                            ["config.{$field}" => ["The {$field} field is required for S3 storage."]]
                        );
                    }
                }
                break;

            case 'google_drive':
                $required = ['client_id', 'client_secret', 'refresh_token'];
                foreach ($required as $field) {
                    if (empty($config[$field])) {
                        throw new \Illuminate\Validation\ValidationException(
                            validator([], []),
                            ["config.{$field}" => ["The {$field} field is required for Google Drive storage."]]
                        );
                    }
                }
                // folder_id is optional, no validation needed
                break;

            case 'ftp':
                $required = ['host', 'username', 'password'];
                foreach ($required as $field) {
                    if (empty($config[$field])) {
                        throw new \Illuminate\Validation\ValidationException(
                            validator([], []),
                            ["config.{$field}" => ["The {$field} field is required for FTP storage."]]
                        );
                    }
                }
                break;

            case 'sftp':
                $required = ['host', 'username'];
                foreach ($required as $field) {
                    if (empty($config[$field])) {
                        throw new \Illuminate\Validation\ValidationException(
                            validator([], []),
                            ["config.{$field}" => ["The {$field} field is required for SFTP storage."]]
                        );
                    }
                }
                // Password or private key must be provided
                if (empty($config['password']) && empty($config['private_key'])) {
                    throw new \Illuminate\Validation\ValidationException(
                        validator([], []),
                        ['config.auth' => ['Either password or private key must be provided for SFTP storage.']]
                    );
                }
                break;
        }
    }
}
