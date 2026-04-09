<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use App\Models\BackupStorageMedia;
use ZipArchive;
use Illuminate\Support\Str;

class BackupDatabase extends Command
{
    protected $signature = 'backup:database {--storage-media-id= : ID of storage media to use}';
    protected $description = 'Backup database to a SQL file';

    public function handle()
    {
        $storageMediaId = $this->option('storage-media-id');
        $storageMedia = $storageMediaId 
            ? BackupStorageMedia::find($storageMediaId)
            : BackupStorageMedia::getDefault();

        // Increase memory limit for large databases
        ini_set('memory_limit', '2G');
        set_time_limit(7200); // 2 hour timeout for very large databases

        $dbName = env('DB_DATABASE');
        // Get all tables for backup
        $tables = DB::select("SHOW TABLES");

        $this->info('Starting database backup...');
        $this->info("Memory limit: " . ini_get('memory_limit'));

        $timestamp = date('Y-m-d_H-i-s');
        $sqlFileName = "backup-{$timestamp}.sql";
        $tmpSqlPath = storage_path('app/temp/' . Str::random(16) . '.sql');

        // Ensure temp directory exists
        if (!File::exists(storage_path('app/temp'))) {
            File::makeDirectory(storage_path('app/temp'), 0755, true);
        }

        // Open SQL file for writing (streaming instead of memory)
        $sqlFile = fopen($tmpSqlPath, 'w');
        if (!$sqlFile) {
            $this->error('Failed to create SQL file');
            return 1;
        }

        // Write SQL header with optimized settings
        fwrite($sqlFile, "-- Database Backup\n");
        fwrite($sqlFile, "-- Generated: " . date('Y-m-d H:i:s') . "\n");
        fwrite($sqlFile, "-- Database: {$dbName}\n\n");
        fwrite($sqlFile, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($sqlFile, "SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n");
        fwrite($sqlFile, "SET AUTOCOMMIT = 0;\n");
        fwrite($sqlFile, "START TRANSACTION;\n\n");

        foreach ($tables as $table) {
            $tableName = array_values((array)$table)[0];
            $this->line("Processing table: {$tableName}");

            // Drop table statement
            fwrite($sqlFile, "DROP TABLE IF EXISTS `$tableName`;\n");

            // Create table structure using SHOW CREATE TABLE for MySQL
            $createTableResult = DB::select("SHOW CREATE TABLE `$tableName`");
            if (!empty($createTableResult)) {
                $createTableSql = $createTableResult[0]->{'Create Table'};
                fwrite($sqlFile, $createTableSql . ";\n\n");
            }

            // Get row count
            $rowCount = DB::table($tableName)->count();
            $this->line("  Rows: {$rowCount}");
            
            if ($rowCount > 0) {
                // Use adaptive chunk size based on table size
                $chunkSize = $this->calculateOptimalChunkSize($rowCount);
                $processed = $this->exportTableDataInChunks($sqlFile, $tableName, $chunkSize);
                $this->line("  Processed: {$processed} rows");
            }
        }

        fwrite($sqlFile, "COMMIT;\n");
        fwrite($sqlFile, "SET FOREIGN_KEY_CHECKS=1;\n");
        fclose($sqlFile);

        $zipFileName = 'db-backup-' . $timestamp . '.zip';
        $tmpZipPath = storage_path('app/temp/' . Str::random(16) . '.zip');

        $this->info('Creating ZIP archive...');

        // Create ZIP file
        $zip = new ZipArchive();
        if ($zip->open($tmpZipPath, ZipArchive::CREATE) !== TRUE) {
            $this->error('Failed to create backup ZIP file');
            unlink($tmpSqlPath);
            return 1;
        }
        
        // Add SQL file to ZIP
        $zip->addFile($tmpSqlPath, $sqlFileName);
        
        // Add storage/app/public directory with optimized handling
        $publicPath = storage_path('app/public');
        if (File::exists($publicPath)) {
            $mediaResult = $this->addDirectoryToZipOptimized($zip, $publicPath, 'storage/public');
            $this->info("Added media files to backup: {$mediaResult['added']} files, {$mediaResult['skipped']} skipped");
        }
        
        $zip->close();
        
        // Remove temporary SQL file
        unlink($tmpSqlPath);

        // Save to storage media
        if ($storageMedia && $storageMedia->is_active) {
            try {
                $savedPath = $this->saveToStorageMedia($storageMedia, $zipFileName, $tmpZipPath);
                $this->info("Backup saved to storage media: {$storageMedia->name} at {$savedPath}");
            } catch (\Exception $e) {
                $this->error("Failed to save to storage media: " . $e->getMessage());
                // Fallback to local storage
                $this->saveToLocal($zipFileName, $tmpZipPath);
            }
        } else {
            $this->saveToLocal($zipFileName, $tmpZipPath);
        }

        // Clean up temp file
        if (File::exists($tmpZipPath)) {
            File::delete($tmpZipPath);
        }

        $this->info("Database backup completed successfully!");
        return 0;
    }

    private function saveToLocal($fileName, $filePath)
    {
        $destination = storage_path('app/backups/' . $fileName);
        if (!File::exists(storage_path('app/backups'))) {
            File::makeDirectory(storage_path('app/backups'), 0755, true);
        }
        File::copy($filePath, $destination);
        $this->info("Backup saved to: {$destination}");
    }

    private function saveToStorageMedia($storageMedia, $fileName, $filePath)
    {
        $type = $storageMedia->type;
        $config = $storageMedia->config ?? [];

        switch ($type) {
            case 'local':
            case 'custom_path':
                $targetPath = $config['path'] ?? storage_path('app/backups');
                if (!File::exists($targetPath)) {
                    File::makeDirectory($targetPath, 0755, true);
                }
                $destination = $targetPath . '/' . $fileName;
                File::copy($filePath, $destination);
                return $destination;

            case 's3':
                $disk = Storage::disk('s3');
                $s3Path = ($config['path'] ?? 'backups') . '/' . $fileName;
                $disk->put($s3Path, file_get_contents($filePath));
                return $s3Path;

            case 'google_drive':
                return $this->saveToGoogleDrive($config, $fileName, $filePath);

            case 'ftp':
                $disk = Storage::disk('ftp');
                $ftpPath = ($config['path'] ?? 'backups') . '/' . $fileName;
                $disk->put($ftpPath, file_get_contents($filePath));
                return $ftpPath;

            case 'sftp':
                $disk = Storage::disk('sftp');
                $sftpPath = ($config['path'] ?? 'backups') . '/' . $fileName;
                $disk->put($sftpPath, file_get_contents($filePath));
                return $sftpPath;

            default:
                return $this->saveToLocal($fileName, $filePath);
        }
    }

    private function saveToGoogleDrive($config, $fileName, $filePath)
    {
        try {
            if (!class_exists('\Google_Client')) {
                throw new \Exception('Google API client is not installed. Run: composer require google/apiclient');
            }

            $client = new \Google_Client();
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            $client->refreshToken($config['refresh_token']);
            $client->addScope(\Google_Service_Drive::DRIVE_FILE);

            $service = new \Google_Service_Drive($client);

            $fileMetadata = new \Google_Service_Drive_DriveFile([
                'name' => $fileName,
            ]);

            // Set parent folder if specified
            if (!empty($config['folder_id'])) {
                $fileMetadata->setParents([$config['folder_id']]);
            }

            $content = file_get_contents($filePath);
            $file = $service->files->create($fileMetadata, [
                'data' => $content,
                'mimeType' => 'application/zip',
                'uploadType' => 'multipart',
                'fields' => 'id, name',
            ]);

            return 'Google Drive: ' . $file->getName() . ' (ID: ' . $file->getId() . ')';
        } catch (\Exception $e) {
            $this->error('Google Drive upload failed: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Calculate optimal chunk size based on table size
     */
    private function calculateOptimalChunkSize($rowCount)
    {
        if ($rowCount < 1000) {
            return min(500, $rowCount);
        } elseif ($rowCount < 10000) {
            return 300;
        } elseif ($rowCount < 100000) {
            return 200;
        } else {
            return 100; // Very conservative for large tables
        }
    }

    /**
     * Export table data in optimized chunks to prevent memory issues
     */
    private function exportTableDataInChunks($sqlFile, $tableName, $chunkSize = 500)
    {
        $offset = 0;
        $totalRows = 0;
        $insertBatchSize = 50; // Number of rows per INSERT statement
        
        do {
            // Get chunk of data with proper ordering
            $rows = DB::table($tableName)
                ->orderBy(DB::raw('1'))
                ->offset($offset)
                ->limit($chunkSize)
                ->get();
            
            if ($rows->isEmpty()) {
                break;
            }
            
            // Process rows in smaller INSERT batches
            $rowsArray = $rows->toArray();
            $batches = array_chunk($rowsArray, $insertBatchSize);
            
            foreach ($batches as $batch) {
                if (empty($batch)) continue;
                
                $firstRow = (array) $batch[0];
                $columns = array_keys($firstRow);
                $escapedColumns = array_map(function($col) {
                    return "`{$col}`";
                }, $columns);
                
                fwrite($sqlFile, "INSERT INTO `$tableName` (" . implode(',', $escapedColumns) . ") VALUES\n");
                
                $valueStrings = [];
                foreach ($batch as $row) {
                    $row = (array) $row;
                    $values = [];
                    
                    foreach ($columns as $column) {
                        $value = $row[$column] ?? null;
                        if ($value === null) {
                            $values[] = 'NULL';
                        } else {
                            $values[] = $this->escapeValue($value);
                        }
                    }
                    
                    $valueStrings[] = '(' . implode(',', $values) . ')';
                }
                
                fwrite($sqlFile, implode(",\n", $valueStrings) . ";\n\n");
                $totalRows += count($batch);
            }
            
            $offset += $chunkSize;
            
            // Show progress and force garbage collection
            if ($offset % 5000 === 0) {
                $this->line("    Processed {$offset} rows...");
                gc_collect_cycles();
            }
            
        } while ($rows->count() === $chunkSize);
        
        return $totalRows;
    }

    /**
     * Improved value escaping
     */
    private function escapeValue($value)
    {
        if (is_numeric($value)) {
            return $value;
        }
        
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }
        
        return DB::connection()->getPdo()->quote($value);
    }

    /**
     * Optimized media file backup with size limits
     */
    private function addDirectoryToZipOptimized($zip, $directory, $zipPath = '', $maxFileSize = 104857600)
    {
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        $addedFiles = 0;
        $skippedFiles = 0;
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileSize = $file->getSize();
                
                // Skip very large files
                if ($fileSize > $maxFileSize) {
                    $this->warn("Skipping large file: {$file->getPathname()} (" . $this->formatBytes($fileSize) . ")");
                    $skippedFiles++;
                    continue;
                }
                
                // Skip certain file types
                $extension = strtolower($file->getExtension());
                $skipExtensions = ['tmp', 'log', 'cache', 'lock'];
                if (in_array($extension, $skipExtensions)) {
                    $skippedFiles++;
                    continue;
                }
                
                $relativePath = $zipPath . '/' . str_replace($directory . DIRECTORY_SEPARATOR, '', $file->getPathname());
                $relativePath = str_replace('\\', '/', $relativePath);
                
                try {
                    $zip->addFile($file->getPathname(), $relativePath);
                    $addedFiles++;
                    
                    // Set compression based on file type
                    if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'zip', 'rar'])) {
                        $zip->setCompressionName($relativePath, ZipArchive::CM_STORE);
                    } else {
                        $zip->setCompressionName($relativePath, ZipArchive::CM_DEFLATE, 6);
                    }
                } catch (\Exception $e) {
                    $this->error("Failed to add file: {$file->getPathname()} - " . $e->getMessage());
                    $skippedFiles++;
                }
            }
        }
        
        return ['added' => $addedFiles, 'skipped' => $skippedFiles];
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
