<?php

namespace App\Http\Controllers;

use App\Models\BackupStorageMedia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class BackupController extends Controller
{
    public function download($file)
    {
        $filePath = "backups/{$file}";

        if (! Storage::disk('backups')->exists($file)) {
            abort(404, 'Backup file not found.');
        }

        return response()->download(storage_path("app/backups/{$file}"));
    }

    public function downloadBackupZip(Request $request)
    {
        $storageMediaId = $request->input('storage_media_id');
        $storageMedia = $storageMediaId
            ? BackupStorageMedia::find($storageMediaId)
            : BackupStorageMedia::getDefault();

        // Optimize PHP settings for large databases and files
        ini_set('memory_limit', '4G');
        ini_set('max_execution_time', '0'); // No time limit
        set_time_limit(0); // No time limit for script execution

        $dbName = env('DB_DATABASE');
        // Get all tables for backup
        $tables = DB::select("SHOW TABLES");
        $timestamp = date('Y-m-d_H-i-s');
        $sqlFileName = "backup-{$timestamp}.sql";
        $zipFileName = 'db-backup-'.$timestamp.'.zip';
        $tmpSqlPath = storage_path('app/temp/'.Str::random(16).'.sql');
        $tmpZipPath = storage_path('app/temp/'.Str::random(16).'.zip');

        // Ensure temp directory exists
        if (! File::exists(storage_path('app/temp'))) {
            File::makeDirectory(storage_path('app/temp'), 0755, true);
        }

        // Open SQL file for writing (streaming instead of memory)
        $sqlFile = fopen($tmpSqlPath, 'w');
        if (! $sqlFile) {
            return response()->json(['error' => 'Failed to create SQL file'], 500);
        }

        // Write SQL header
        fwrite($sqlFile, "-- Database Backup\n");
        fwrite($sqlFile, '-- Generated: '.date('Y-m-d H:i:s')."\n");
        fwrite($sqlFile, "-- Database: {$dbName}\n\n");
        fwrite($sqlFile, "SET FOREIGN_KEY_CHECKS=0;\n\n");

        // Process each table with chunking for large tables
        foreach ($tables as $table) {
            $tableName = array_values((array)$table)[0];

            // Drop table
            fwrite($sqlFile, "DROP TABLE IF EXISTS `$tableName`;\n");

            // Create table structure using SHOW CREATE TABLE for MySQL
            $createTableResult = DB::select("SHOW CREATE TABLE `$tableName`");
            if (!empty($createTableResult)) {
                $createTableSql = $createTableResult[0]->{'Create Table'};
                fwrite($sqlFile, $createTableSql . ";\n\n");
            }

            // Get row count to decide chunking strategy
            $rowCount = DB::table($tableName)->count();
            $chunkSize = 1000; // Process 1000 rows at a time

            if ($rowCount > 0) {
                fwrite($sqlFile, "INSERT INTO `$tableName` ");

                // Process in chunks for large tables
                $firstChunk = true;
                DB::table($tableName)->orderBy(DB::raw('1'))->chunk($chunkSize, function ($rows) use ($sqlFile, &$firstChunk) {
                    foreach ($rows as $row) {
                        $row = (array) $row;
                        $columns = implode('`,`', array_keys($row));
                        $values = implode(',', array_map(function ($v) {
                            if ($v === null) {
                                return 'NULL';
                            }

                            return "'".addslashes($v)."'";
                        }, $row));

                        if ($firstChunk) {
                            fwrite($sqlFile, "(`$columns`) VALUES\n");
                            $firstChunk = false;
                        } else {
                            fwrite($sqlFile, ",\n");
                        }
                        fwrite($sqlFile, "($values)");
                    }
                });

                fwrite($sqlFile, ";\n\n");
            }
        }

        fwrite($sqlFile, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($sqlFile);

        $zip = new ZipArchive;
        if ($zip->open($tmpZipPath, ZipArchive::CREATE) !== true) {
            unlink($tmpSqlPath);

            return response()->json(['error' => 'Failed to create backup file'], 500);
        }

        // Add SQL file to ZIP
        $zip->addFile($tmpSqlPath, $sqlFileName);

        // Add storage/app/public directory
        $publicPath = storage_path('app/public');
        if (File::exists($publicPath)) {
            $this->addDirectoryToZip($zip, $publicPath, 'storage/public');
        }

        $zip->close();

        // Remove temporary SQL file
        unlink($tmpSqlPath);

        // Save to storage media if specified
        if ($storageMedia && $storageMedia->is_active) {
            try {
                $this->saveToStorageMedia($storageMedia, $zipFileName, $tmpZipPath);
            } catch (\Exception $e) {
                Log::error('Failed to save backup to storage media: '.$e->getMessage());
                // Continue to download even if storage save fails
            }
        }

        // Return as download and delete after sending
        return response()->download($tmpZipPath, $zipFileName)->deleteFileAfterSend(true);
    }

    public function createBackup(Request $request)
    {
        $storageMediaId = $request->input('storage_media_id');
        $storageMedia = $storageMediaId
            ? BackupStorageMedia::find($storageMediaId)
            : BackupStorageMedia::getDefault();

        // Optimize PHP settings for large databases and files
        ini_set('memory_limit', '8G');
        ini_set('max_execution_time', '0'); // No time limit
        set_time_limit(0); // No time limit for script execution

        $dbName = env('DB_DATABASE');
        // Get all tables for backup
        $tables = DB::select("SHOW TABLES");
        $timestamp = date('Y-m-d_H-i-s');
        $sqlFileName = "backup-{$timestamp}.sql";
        $zipFileName = 'db-backup-'.$timestamp.'.zip';
        $tmpSqlPath = storage_path('app/temp/'.Str::random(16).'.sql');
        $tmpZipPath = storage_path('app/temp/'.Str::random(16).'.zip');

        if (! File::exists(storage_path('app/temp'))) {
            File::makeDirectory(storage_path('app/temp'), 0755, true);
        }

        // Open SQL file for writing (streaming instead of memory)
        $sqlFile = fopen($tmpSqlPath, 'w');
        if (! $sqlFile) {
            return response()->json(['error' => 'Failed to create SQL file'], 500);
        }

        // Write SQL header
        fwrite($sqlFile, "-- Database Backup\n");
        fwrite($sqlFile, '-- Generated: '.date('Y-m-d H:i:s')."\n");
        fwrite($sqlFile, "-- Database: {$dbName}\n\n");
        fwrite($sqlFile, "SET FOREIGN_KEY_CHECKS=0;\n\n");

        // Process each table with chunking for large tables
        foreach ($tables as $table) {
            $tableName = array_values((array)$table)[0];

            // Drop table
            fwrite($sqlFile, "DROP TABLE IF EXISTS `$tableName`;\n");

            // Create table structure using SHOW CREATE TABLE for MySQL
            $createTableResult = DB::select("SHOW CREATE TABLE `$tableName`");
            if (!empty($createTableResult)) {
                $createTableSql = $createTableResult[0]->{'Create Table'};
                fwrite($sqlFile, $createTableSql . ";\n\n");
            }

            // Get row count to decide chunking strategy
            $rowCount = DB::table($tableName)->count();
            $chunkSize = 1000; // Process 1000 rows at a time

            if ($rowCount > 0) {
                fwrite($sqlFile, "INSERT INTO `$tableName` ");

                // Process in chunks for large tables
                $firstChunk = true;
                DB::table($tableName)->orderBy(DB::raw('1'))->chunk($chunkSize, function ($rows) use ($sqlFile, &$firstChunk) {
                    foreach ($rows as $row) {
                        $row = (array) $row;
                        $columns = implode('`,`', array_keys($row));
                        $values = implode(',', array_map(function ($v) {
                            if ($v === null) {
                                return 'NULL';
                            }

                            return "'".addslashes($v)."'";
                        }, $row));

                        if ($firstChunk) {
                            fwrite($sqlFile, "(`$columns`) VALUES\n");
                            $firstChunk = false;
                        } else {
                            fwrite($sqlFile, ",\n");
                        }
                        fwrite($sqlFile, "($values)");
                    }
                });

                fwrite($sqlFile, ";\n\n");
            }
        }

        fwrite($sqlFile, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($sqlFile);

        // Create ZIP file
        $zip = new ZipArchive;
        if ($zip->open($tmpZipPath, ZipArchive::CREATE) !== true) {
            unlink($tmpSqlPath);

            return response()->json(['error' => 'Failed to create backup file'], 500);
        }

        // Add SQL file to ZIP
        $zip->addFile($tmpSqlPath, $sqlFileName);

        // Add storage/app/public directory
        $publicPath = storage_path('app/public');
        if (File::exists($publicPath)) {
            $this->addDirectoryToZip($zip, $publicPath, 'storage/public');
        }

        $zip->close();

        // Remove temporary SQL file
        unlink($tmpSqlPath);

        $savedPath = null;
        if ($storageMedia && $storageMedia->is_active) {
            try {
                $savedPath = $this->saveToStorageMedia($storageMedia, $zipFileName, $tmpZipPath);
            } catch (\Exception $e) {
                Log::error('Failed to save backup to storage media: '.$e->getMessage());

                return response()->json(['error' => 'Failed to save backup: '.$e->getMessage()], 500);
            }
        } else {
            // Save to default local storage
            $savedPath = "backups/{$zipFileName}";
            Storage::disk('backups')->put($zipFileName, file_get_contents($tmpZipPath));
        }

        // Clean up temp file
        if (File::exists($tmpZipPath)) {
            File::delete($tmpZipPath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Backup created successfully',
            'file' => $zipFileName,
            'path' => $savedPath,
            'storage_media' => $storageMedia ? $storageMedia->name : 'Local Storage',
        ]);
    }

    public function listBackups()
    {
        $backups = [];
        $backupPath = storage_path('app/backups');

        if (File::exists($backupPath)) {
            $files = File::files($backupPath);
            foreach ($files as $file) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'zip') {
                    $createdAt = Carbon::createFromTimestamp($file->getMTime(), config('app.timezone', 'UTC'));
                    $backups[] = [
                        'name' => $file->getFilename(),
                        'size' => $file->getSize(),
                        'size_formatted' => $this->formatBytes($file->getSize()),
                        'created_at' => $createdAt->toIso8601String(),
                        'path' => $file->getPathname(),
                    ];
                }
            }
        }

        // Sort by creation time, newest first
        usort($backups, fn ($a, $b) => strtotime($b['created_at']) - strtotime($a['created_at']));

        return response()->json($backups);
    }

    public function index()
    {
        $storageMedia = BackupStorageMedia::getActive();
        $backupResponse = $this->listBackups();
        $backups = is_array($backupResponse->getData(true))
            ? $backupResponse->getData(true)
            : [];

        return inertia('Backup/Index', [
            'storageMedia' => $storageMedia,
            'backups' => $backups,
        ]);
    }

    private function saveToStorageMedia($storageMedia, $fileName, $filePath)
    {
        $type = $storageMedia->type;
        $config = $storageMedia->config ?? [];

        switch ($type) {
            case 'local':
            case 'custom_path':
                $targetPath = $config['path'] ?? storage_path('app/backups');
                if (! File::exists($targetPath)) {
                    File::makeDirectory($targetPath, 0755, true);
                }
                $destination = $targetPath.'/'.$fileName;
                File::copy($filePath, $destination);

                return $destination;

            case 's3':
                $disk = Storage::disk('s3');
                $s3Path = ($config['path'] ?? 'backups').'/'.$fileName;
                $disk->put($s3Path, file_get_contents($filePath));

                return $s3Path;

            case 'google_drive':
                return $this->saveToGoogleDrive($config, $fileName, $filePath);

            case 'ftp':
                $disk = Storage::disk('ftp');
                $ftpPath = ($config['path'] ?? 'backups').'/'.$fileName;
                $disk->put($ftpPath, file_get_contents($filePath));

                return $ftpPath;

            case 'sftp':
                $disk = Storage::disk('sftp');
                $sftpPath = ($config['path'] ?? 'backups').'/'.$fileName;
                $disk->put($sftpPath, file_get_contents($filePath));

                return $sftpPath;

            default:
                // Default to local backups directory
                $destination = storage_path('app/backups/'.$fileName);
                File::copy($filePath, $destination);

                return $destination;
        }
    }

    public function delete($file)
    {
        $filePath = storage_path('app/backups/'.$file);

        if (! File::exists($filePath)) {
            return response()->json(['error' => 'Backup file not found'], 404);
        }

        try {
            File::delete($filePath);

            return response()->json(['success' => true, 'message' => 'Backup deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete backup: '.$e->getMessage()], 500);
        }
    }

    private function saveToGoogleDrive($config, $fileName, $filePath)
    {
        try {
            if (! class_exists('\Google_Client')) {
                throw new \Exception('Google API client is not installed. Run: composer require google/apiclient');
            }

            $client = new \Google_Client;
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            $client->refreshToken($config['refresh_token']);
            $client->addScope(\Google_Service_Drive::DRIVE_FILE);

            $service = new \Google_Service_Drive($client);

            $fileMetadata = new \Google_Service_Drive_DriveFile([
                'name' => $fileName,
            ]);

            // Set parent folder if specified
            if (! empty($config['folder_id'])) {
                $fileMetadata->setParents([$config['folder_id']]);
            }

            $content = file_get_contents($filePath);
            $file = $service->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => 'application/zip',
                'uploadType' => 'multipart',
                'fields' => 'id, name',
            ]);

            return 'Google Drive: '.$file->getName().' (ID: '.$file->getId().')';
        } catch (\Exception $e) {
            Log::error('Google Drive upload failed: '.$e->getMessage());
            throw new \Exception('Failed to upload to Google Drive: '.$e->getMessage());
        }
    }

    private function addDirectoryToZip($zip, $directory, $zipPath = '')
    {
        $files = File::allFiles($directory);

        foreach ($files as $file) {
            $relativePath = $zipPath.'/'.str_replace($directory.DIRECTORY_SEPARATOR, '', $file->getPathname());
            $relativePath = str_replace('\\', '/', $relativePath);
            $zip->addFile($file->getPathname(), $relativePath);
        }
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }
}