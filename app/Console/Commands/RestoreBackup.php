<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use ZipArchive;

class RestoreBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:restore {file : Path to backup ZIP file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Restore database and media files from a backup ZIP file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');
        
        if (!File::exists($filePath)) {
            $this->error("Backup file not found: {$filePath}");
            return 1;
        }

        if (!$this->confirm('This will replace your current database and media files. Are you sure?')) {
            $this->info('Restore cancelled.');
            return 0;
        }

        // Increase memory limit and execution time for large files
        ini_set('memory_limit', '4G');
        set_time_limit(7200); // 2 hours for very large restores

        $tempDir = storage_path('app/temp/restore_' . Str::random(16));
        $extractPath = $tempDir . '/extracted';

        try {
            $this->info('Starting restore process...');
            
            // Create temporary directories
            if (!File::exists($tempDir)) {
                File::makeDirectory($tempDir, 0755, true);
            }
            if (!File::exists($extractPath)) {
                File::makeDirectory($extractPath, 0755, true);
            }

            // Extract ZIP file
            $this->info('Extracting backup file...');
            $zip = new ZipArchive();
            if ($zip->open($filePath) !== TRUE) {
                throw new \Exception('Failed to open backup ZIP file');
            }

            $zip->extractTo($extractPath);
            $zip->close();

            // Find SQL file in extracted contents
            $sqlFile = $this->findSqlFile($extractPath);
            if (!$sqlFile) {
                throw new \Exception('No SQL backup file found in the ZIP');
            }

            // Restore database
            $this->info('Restoring database...');
            $this->restoreDatabase($sqlFile);

            // Restore media files
            $this->info('Restoring media files...');
            $this->restoreMediaFiles($extractPath);

            // Clean up temporary files
            File::deleteDirectory($tempDir);

            $this->info('✅ Backup restored successfully!');
            return 0;

        } catch (\Exception $e) {
            // Clean up on error
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }

            $this->error('❌ Restore failed: ' . $e->getMessage());
            Log::error('Console restore failed: ' . $e->getMessage());
            return 1;
        }
    }

    private function findSqlFile($directory)
    {
        $files = File::allFiles($directory);
        
        foreach ($files as $file) {
            if ($file->getExtension() === 'sql') {
                return $file->getPathname();
            }
        }
        
        return null;
    }

    private function restoreDatabase($sqlFile)
    {
        $this->info('Analyzing SQL file...');
        
        // Get file size for progress tracking
        $fileSize = filesize($sqlFile);
        $this->line("  SQL file size: " . $this->formatBytes($fileSize));
        
        // Read SQL file in chunks to handle large files
        $handle = fopen($sqlFile, 'r');
        if (!$handle) {
            throw new \Exception('Failed to open SQL file');
        }

        // Set optimized MySQL settings for restore
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        DB::statement('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO"');
        DB::statement('SET AUTOCOMMIT = 0');
        DB::statement('SET UNIQUE_CHECKS = 0');
        
        // Start transaction for better performance
        DB::beginTransaction();
        
        $query = '';
        $lineNumber = 0;
        $executedQueries = 0;
        $bytesProcessed = 0;
        $lastProgressUpdate = 0;
        $batchSize = 100;
        $queryBatch = [];
        
        try {
            while (($line = fgets($handle)) !== false) {
                $lineNumber++;
                $bytesProcessed += strlen($line);
                $line = trim($line);
                
                // Skip comments and empty lines
                if (empty($line) || 
                    strpos($line, '--') === 0 || 
                    strpos($line, '/*') === 0 || 
                    strpos($line, 'SET FOREIGN_KEY_CHECKS') === 0 ||
                    strpos($line, 'SET SQL_MODE') === 0 ||
                    strpos($line, 'SET AUTOCOMMIT') === 0 ||
                    strpos($line, 'START TRANSACTION') === 0 ||
                    strpos($line, 'COMMIT') === 0) {
                    continue;
                }
                
                $query .= $line . ' ';
                
                // Execute query when we hit a semicolon
                if (substr($line, -1) === ';') {
                    $query = trim($query);
                    if (!empty($query)) {
                        $queryBatch[] = $query;
                        
                        // Execute batch when it reaches the batch size
                        if (count($queryBatch) >= $batchSize) {
                            $this->executeBatch($queryBatch, $lineNumber);
                            $executedQueries += count($queryBatch);
                            $queryBatch = [];
                            
                            // Commit periodically for large datasets
                            if ($executedQueries % 1000 === 0) {
                                DB::commit();
                                DB::beginTransaction();
                            }
                        }
                    }
                    $query = '';
                }
                
                // Progress reporting every 10MB processed
                if ($bytesProcessed - $lastProgressUpdate > 10485760) {
                    $progress = ($bytesProcessed / $fileSize) * 100;
                    $this->line(sprintf('  Progress: %.1f%% (%s/%s), %d queries executed', 
                        $progress, 
                        $this->formatBytes($bytesProcessed), 
                        $this->formatBytes($fileSize),
                        $executedQueries
                    ));
                    $lastProgressUpdate = $bytesProcessed;
                }
            }
            
            // Execute any remaining queries in batch
            if (!empty($queryBatch)) {
                $this->executeBatch($queryBatch, $lineNumber);
                $executedQueries += count($queryBatch);
            }
            
            // Execute any remaining single query
            if (!empty(trim($query))) {
                try {
                    DB::unprepared(trim($query));
                    $executedQueries++;
                } catch (\Exception $e) {
                    $this->warn("Failed to execute final query: " . $e->getMessage());
                }
            }
            
            // Commit final transaction
            DB::commit();
            
            $this->line("  Total queries executed: {$executedQueries}");
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        } finally {
            fclose($handle);
            // Re-enable all checks
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            DB::statement('SET UNIQUE_CHECKS = 1');
            DB::statement('SET AUTOCOMMIT = 1');
        }
    }
    
    /**
     * Execute a batch of queries with error handling
     */
    private function executeBatch($queries, $currentLine)
    {
        foreach ($queries as $query) {
            try {
                DB::unprepared($query);
            } catch (\Exception $e) {
                $this->warn("Failed to execute query near line {$currentLine}: " . $e->getMessage());
                
                // For critical errors, we might want to stop
                if (strpos($e->getMessage(), 'syntax error') !== false) {
                    throw new \Exception("Critical SQL syntax error at line {$currentLine}: " . $e->getMessage());
                }
            }
        }
    }

    private function restoreMediaFiles($extractPath)
    {
        $this->info('Restoring media files...');
        
        // Look for storage/public directory in extracted files
        $storagePublicPath = $extractPath . '/storage/public';
        
        if (File::exists($storagePublicPath)) {
            $targetPath = storage_path('app/public');
            
            // Create backup of existing media files
            $backupPath = storage_path('app/media_backup_' . date('Y-m-d_H-i-s'));
            if (File::exists($targetPath)) {
                $this->line('  Creating backup of existing media files...');
                try {
                    File::copyDirectory($targetPath, $backupPath);
                    $this->line('  Existing media backed up to: ' . basename($backupPath));
                } catch (\Exception $e) {
                    $this->warn('  Failed to backup existing media: ' . $e->getMessage());
                }
            }
            
            // Create target directory if it doesn't exist
            if (!File::exists($targetPath)) {
                File::makeDirectory($targetPath, 0755, true);
            }
            
            // Copy files recursively with progress tracking
            $result = $this->copyDirectoryOptimized($storagePublicPath, $targetPath);
            
            $this->line("  Media files restored: {$result['copied']} files copied, {$result['skipped']} skipped, {$result['errors']} errors");
        } else {
            $this->line('  No media files found in backup');
        }
    }

    /**
     * Optimized directory copying with better error handling
     */
    private function copyDirectoryOptimized($source, $destination)
    {
        if (!File::exists($destination)) {
            File::makeDirectory($destination, 0755, true);
        }
        
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($source, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        $copiedFiles = 0;
        $skippedFiles = 0;
        $errorFiles = 0;
        $totalSize = 0;
        $maxFileSize = 104857600; // 100MB limit
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileSize = $file->getSize();
                
                // Skip very large files
                if ($fileSize > $maxFileSize) {
                    $this->warn("    Skipping large file: {$file->getFilename()} (" . $this->formatBytes($fileSize) . ")");
                    $skippedFiles++;
                    continue;
                }
                
                $relativePath = str_replace($source, '', $file->getPathname());
                $targetFile = $destination . $relativePath;
                
                // Create directory if it doesn't exist
                $targetDir = dirname($targetFile);
                if (!File::exists($targetDir)) {
                    try {
                        File::makeDirectory($targetDir, 0755, true);
                    } catch (\Exception $e) {
                        $this->error("    Failed to create directory: " . $e->getMessage());
                        $errorFiles++;
                        continue;
                    }
                }
                
                // Copy file with error handling
                try {
                    File::copy($file->getPathname(), $targetFile);
                    $copiedFiles++;
                    $totalSize += $fileSize;
                    
                    // Show progress every 100 files
                    if ($copiedFiles % 100 === 0) {
                        $this->line("    Copied {$copiedFiles} files (" . $this->formatBytes($totalSize) . ")...");
                    }
                } catch (\Exception $e) {
                    $this->error("    Failed to copy {$file->getFilename()}: " . $e->getMessage());
                    $errorFiles++;
                }
            }
        }
        
        return [
            'copied' => $copiedFiles,
            'skipped' => $skippedFiles,
            'errors' => $errorFiles,
            'total_size' => $totalSize
        ];
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
