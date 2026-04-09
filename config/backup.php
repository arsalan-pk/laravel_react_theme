<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Backup Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for backup and restore functionality
    |
    */

    'max_file_size' => env('BACKUP_MAX_FILE_SIZE', 512 * 1024 * 1024), // 512MB default
    'memory_limit' => env('BACKUP_MEMORY_LIMIT', '1G'),
    'time_limit' => env('BACKUP_TIME_LIMIT', 3600), // 1 hour
    'chunk_size' => env('BACKUP_CHUNK_SIZE', 1000), // Database chunk size
    
    'temp_directory' => storage_path('app/temp'),
    'backup_directory' => storage_path('app/backups'),
    
    'allowed_extensions' => ['zip'],
    
    'restore' => [
        'verify_backup' => true,
        'backup_before_restore' => true,
        'cleanup_temp_files' => true,
    ],
];
