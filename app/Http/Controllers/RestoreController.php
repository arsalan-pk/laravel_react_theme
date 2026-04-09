<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RestoreController extends Controller
{
    public function index()
    {
        if (! auth()->user()->can('view_restore')) {
            abort(403, 'Unauthorized access to recovery center');
        }

        // Get counts of soft-deleted records
        $deletedCounts = [
            'users' => User::where('is_active', 0)->count(),
        ];

        return Inertia::render('Restore/Index', [
            'deletedCounts' => $deletedCounts,
            'pageLabel' => 'Recovery Center',
        ]);
    }

    public function users(Request $request)
    {
        if (! auth()->user()->can('restore_users')) {
            abort(403, 'Unauthorized to view deactivated users');
        }

        $users = User::where('is_active', 0)
            ->select('id', 'name', 'email', 'user_role', 'updated_at', 'created_at')
            ->orderBy('updated_at', 'desc')
            ->paginate(20);

        return Inertia::render('Restore/Users', [
            'users' => $users,
            'pageLabel' => 'Restore Users',
        ]);
    }

    public function restoreUser($id)
    {
        if (! auth()->user()->can('restore_users')) {
            abort(403, 'Unauthorized to restore users');
        }

        try {
            $user = User::where('is_active', 0)->findOrFail($id);
            $user->is_active = 1;
            $user->save();

            return redirect()->back()->with('success', 'User reactivated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to reactivate user: '.$e->getMessage());
        }
    }

    // Backup file restore method
    public function restore(Request $request)
    {
        if (! auth()->user()->can('manage_backups')) {
            return response()->json(['error' => 'Unauthorized access'], 403);
        }

        $request->validate([
            'backup_file' => 'required|file|mimes:zip|max:52428800', // 50GB max (in KB)
        ]);

        // Optimize PHP settings for large files and databases
        ini_set('memory_limit', '4G');
        ini_set('max_execution_time', '0'); // No time limit
        ini_set('max_input_time', '0'); // No input time limit
        set_time_limit(0); // No time limit for script execution
        ini_set('post_max_size', '50G');
        ini_set('upload_max_filesize', '50G');

        $backupFile = $request->file('backup_file');
        $tempDir = storage_path('app/temp/restore_'.Str::random(16));
        $extractPath = $tempDir.'/extracted';

        try {
            Log::info('Starting backup restore process', [
                'file_name' => $backupFile->getClientOriginalName(),
                'file_size' => $backupFile->getSize(),
                'user_id' => auth()->id(),
            ]);

            // Create temporary directories
            if (! File::exists($tempDir)) {
                File::makeDirectory($tempDir, 0755, true);
            }
            if (! File::exists($extractPath)) {
                File::makeDirectory($extractPath, 0755, true);
            }

            // Move uploaded file to temp location
            $zipPath = $tempDir.'/backup.zip';
            $backupFile->move($tempDir, 'backup.zip');

            // Extract ZIP file
            $zip = new \ZipArchive;
            if ($zip->open($zipPath) !== true) {
                throw new \Exception('Failed to open backup ZIP file');
            }

            $zip->extractTo($extractPath);
            $zip->close();

            // Find SQL file in extracted contents
            $sqlFile = $this->findSqlFile($extractPath);
            if (! $sqlFile) {
                throw new \Exception('No SQL backup file found in the ZIP');
            }

            try {
                // Restore database (manages its own transactions)
                $this->restoreDatabase($sqlFile);

                // Restore media files
                $this->restoreMediaFiles($extractPath);

                // Clean up temporary files
                File::deleteDirectory($tempDir);

                Log::info('Backup restore completed successfully', [
                    'user_id' => auth()->id(),
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Backup restored successfully! Database and media files have been restored.',
                ]);

            } catch (\Exception $e) {
                // restoreDatabase handles its own rollback, so we just re-throw
                throw $e;
            }

        } catch (\Exception $e) {
            // Clean up on error
            if (File::exists($tempDir)) {
                File::deleteDirectory($tempDir);
            }

            Log::error('Backup restore failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Restore failed: '.$e->getMessage(),
            ], 500);
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
        Log::info('Starting database restore from file: '.$sqlFile);

        $connection = config('database.default');
        $driver = config("database.connections.{$connection}.driver");
        $isMysql = in_array($driver, ['mysql', 'mariadb']);

        // Get file size for progress tracking
        $fileSize = filesize($sqlFile);
        Log::info('SQL file size: '.$this->formatBytes($fileSize));

        // Optimize PHP settings for large SQL files
        ini_set('memory_limit', '4G');
        set_time_limit(0); // No time limit

        // Read SQL file in chunks to handle large files (streaming)
        $handle = fopen($sqlFile, 'r');
        if (! $handle) {
            throw new \Exception('Failed to open SQL file');
        }

        if ($isMysql) {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        }

        // Transactions don't help in MySQL/MariaDB because DDL auto-commits, so only use them for other drivers
        $useTransactions = ! $isMysql;
        $transactionActive = false;

        if ($useTransactions) {
            DB::beginTransaction();
            $transactionActive = true;
        }

        $query = '';
        $lineNumber = 0;
        $executedQueries = 0;
        $bytesProcessed = 0;
        $lastProgressUpdate = 0;
        $batchSize = 500; // Increased batch size for better performance with large databases
        $queryBatch = [];

        try {
            while (($line = fgets($handle)) !== false) {
                $lineNumber++;
                $bytesProcessed += strlen($line);
                $line = trim($line);

                $isCommentOrEmpty = empty($line)
                    || strpos($line, '--') === 0
                    || strpos($line, '/*') === 0;

                if ($isCommentOrEmpty) {
                    continue;
                }

                if (! $isMysql &&
                    (stripos($line, 'SET ') === 0
                        || stripos($line, 'START TRANSACTION') === 0
                        || stripos($line, 'COMMIT') === 0
                        || stripos($line, 'DROP TABLE IF EXISTS') === 0)) {
                    continue;
                }

                $query .= $line.' ';

                // Execute query when we hit a semicolon
                if (substr($line, -1) === ';') {
                    $query = trim($query);
                    if (! empty($query)) {
                        $queryBatch[] = $query;

                        // Execute batch when it reaches the batch size
                        if (count($queryBatch) >= $batchSize) {
                            $this->executeBatch($queryBatch, $lineNumber, $isMysql);
                            $executedQueries += count($queryBatch);
                            $queryBatch = [];

                            // Commit periodically for large datasets (only when transactions are in use)
                            if ($useTransactions && $transactionActive && $executedQueries % 1000 === 0) {
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
                    Log::info(sprintf('Restore progress: %.1f%% (%s/%s), %d queries executed',
                        $progress,
                        $this->formatBytes($bytesProcessed),
                        $this->formatBytes($fileSize),
                        $executedQueries
                    ));
                    $lastProgressUpdate = $bytesProcessed;
                }
            }

            // Execute any remaining queries in batch
            if (! empty($queryBatch)) {
                $this->executeBatch($queryBatch, $lineNumber, $isMysql);
                $executedQueries += count($queryBatch);
            }

            // Execute any remaining single query
            if (! empty(trim($query))) {
                try {
                    $allowCreateStatements = $isMysql;

                    if ($allowCreateStatements || stripos($query, 'CREATE TABLE') === false) {
                        DB::unprepared(trim($query));
                        $executedQueries++;
                    } else {
                        Log::info("Skipping final CREATE TABLE query for SQLite compatibility: ".substr($query, 0, 100).'...');
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to execute final query: '.$e->getMessage());
                    // Be more lenient with SQLite syntax errors
                    if (strpos($e->getMessage(), 'near "SET"') !== false || 
                        strpos($e->getMessage(), 'near "DROP"') !== false ||
                        strpos($e->getMessage(), 'near "CREATE"') !== false) {
                        Log::info("Skipping SQLite-incompatible final query: ".substr($query, 0, 100).'...');
                    }
                }
            }

            // Commit final transaction if one is active
            if ($useTransactions && $transactionActive) {
                DB::commit();
                $transactionActive = false;
            }

            Log::info("Database restore completed successfully. Executed {$executedQueries} queries.");

        } catch (\Exception $e) {
            // Only rollback if there's an active transaction
            if ($useTransactions && $transactionActive) {
                try {
                    DB::rollBack();
                    $transactionActive = false;
                } catch (\Exception $rollbackException) {
                    // Ignore rollback errors - transaction may have already been committed or not exist
                    // This can happen when periodic commits are used
                    Log::warning('Rollback failed (transaction may not be active): '.$rollbackException->getMessage());
                }
            }
            throw $e;
        } finally {
            fclose($handle);
            if ($isMysql) {
                DB::statement('SET FOREIGN_KEY_CHECKS=1');
            }
        }
    }

    /**
     * Execute a batch of queries with error handling
     */
    private function executeBatch($queries, $currentLine, $allowCreateStatements = false)
    {
        foreach ($queries as $query) {
            try {
                // Skip empty queries
                if (empty(trim($query))) {
                    continue;
                }
                
                // Check for SQLite compatibility issues
                if (! $allowCreateStatements && stripos($query, 'CREATE TABLE') !== false) {
                    // Skip CREATE TABLE statements since our backup doesn't include them
                    Log::info("Skipping CREATE TABLE statement for SQLite compatibility: ".substr($query, 0, 100).'...');
                    continue;
                }
                
                // Execute the query
                DB::unprepared($query);
                Log::debug("Successfully executed query: ".substr($query, 0, 100).'...');
                
            } catch (\Exception $e) {
                // Log error but continue with other queries
                Log::warning("Failed to execute query near line {$currentLine}: ".$e->getMessage());
                Log::debug('Failed query: '.substr($query, 0, 200).'...');

                // For critical errors, we might want to stop
                if (strpos($e->getMessage(), 'syntax error') !== false) {
                    // For SQLite, be more lenient with syntax errors
                    if (strpos($e->getMessage(), 'near "SET"') !== false || 
                        strpos($e->getMessage(), 'near "DROP"') !== false ||
                        strpos($e->getMessage(), 'near "CREATE"') !== false) {
                        Log::info("Skipping SQLite-incompatible query: ".substr($query, 0, 100).'...');
                        continue;
                    }
                    throw new \Exception("Critical SQL syntax error at line {$currentLine}: ".$e->getMessage());
                }
            }
        }
    }

    private function restoreMediaFiles($extractPath)
    {
        Log::info('Starting media files restore');

        // Look for storage/public directory in extracted files
        $storagePublicPath = $extractPath.'/storage/public';

        if (File::exists($storagePublicPath)) {
            $targetPath = storage_path('app/public');

            // Create backup of existing media files before restore
            $backupPath = storage_path('app/media_backup_'.date('Y-m-d_H-i-s'));
            if (File::exists($targetPath)) {
                Log::info('Creating backup of existing media files');
                try {
                    File::copyDirectory($targetPath, $backupPath);
                    Log::info('Existing media files backed up to: '.$backupPath);
                } catch (\Exception $e) {
                    Log::warning('Failed to backup existing media files: '.$e->getMessage());
                }
            }

            // Create target directory if it doesn't exist
            if (! File::exists($targetPath)) {
                File::makeDirectory($targetPath, 0755, true);
            }

            // Copy files recursively with progress tracking
            $result = $this->copyDirectoryRecursiveOptimized($storagePublicPath, $targetPath);

            Log::info("Media files restored successfully: {$result['copied']} files copied, {$result['skipped']} skipped, {$result['errors']} errors");
        } else {
            Log::info('No media files found in backup');
        }
    }

    /**
     * Optimized directory copying with better error handling and progress tracking
     */
    private function copyDirectoryRecursiveOptimized($source, $destination)
    {
        if (! File::exists($destination)) {
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
        $lastProgressUpdate = 0;
        $maxFileSize = 10737418240; // 10GB limit per file (increased from 100MB for large media files)

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileSize = $file->getSize();

                // Skip extremely large files (>10GB) to prevent memory issues
                if ($fileSize > $maxFileSize) {
                    Log::warning("Skipping extremely large file during restore: {$file->getPathname()} (".$this->formatBytes($fileSize).')');
                    $skippedFiles++;

                    continue;
                }

                $relativePath = str_replace($source, '', $file->getPathname());
                $targetFile = $destination.$relativePath;

                // Create directory if it doesn't exist
                $targetDir = dirname($targetFile);
                if (! File::exists($targetDir)) {
                    try {
                        File::makeDirectory($targetDir, 0755, true);
                    } catch (\Exception $e) {
                        Log::error("Failed to create directory {$targetDir}: ".$e->getMessage());
                        $errorFiles++;

                        continue;
                    }
                }

                // Copy file with streaming for large files (>10MB)
                try {
                    if ($fileSize > 10485760) { // Files larger than 10MB
                        // Use streaming copy for large files to save memory
                        $sourceHandle = fopen($file->getPathname(), 'rb');
                        $targetHandle = fopen($targetFile, 'wb');

                        if ($sourceHandle && $targetHandle) {
                            // Stream copy in chunks to prevent memory issues
                            while (! feof($sourceHandle)) {
                                $chunk = fread($sourceHandle, 8192); // 8KB chunks
                                fwrite($targetHandle, $chunk);
                            }
                            fclose($sourceHandle);
                            fclose($targetHandle);
                        } else {
                            throw new \Exception('Failed to open file handles for streaming copy');
                        }
                    } else {
                        // Use regular copy for smaller files
                        File::copy($file->getPathname(), $targetFile);
                    }

                    $copiedFiles++;
                    $totalSize += $fileSize;

                    // Progress update every 100 files or every 100MB
                    if ($copiedFiles % 100 === 0 || $totalSize - $lastProgressUpdate > 104857600) {
                        Log::info("Media restore progress: {$copiedFiles} files copied (".$this->formatBytes($totalSize).')');
                        $lastProgressUpdate = $totalSize;
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to copy file {$file->getPathname()}: ".$e->getMessage());
                    $errorFiles++;
                }
            }
        }

        return [
            'copied' => $copiedFiles,
            'skipped' => $skippedFiles,
            'errors' => $errorFiles,
            'total_size' => $totalSize,
        ];
    }

    /**
     * Format bytes for human readable output
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }

    private function restoreDeletedProduct(Product $product)
    {
        // Restore the product
        $product->restore();

        // Restore associated batches
        $deletedBatches = ProductBatch::onlyTrashed()
            ->where('product_id', $product->id)
            ->get();

        foreach ($deletedBatches as $batch) {
            $batch->restore();
        }

        return $deletedBatches->count();
    }

    private function restoreSaleRecord(Sale $sale)
    {
        if ($sale->sale_type === 'Paper') {
            throw new \Exception('Please use the Paper Bills restore section');
        }

        $saleType = Str::lower($sale->sale_type ?? '');
        $contact = $sale->contact_id ? Contact::find($sale->contact_id) : null;
        $user = Auth::user();
        $deleteBatchId = $sale->deleted_batch_id;

        $saleItems = $sale->saleItems()->onlyTrashed()->get();
        $transactions = Transaction::onlyTrashed()
            ->where('sales_id', $sale->id)
            ->when($deleteBatchId, function ($query) use ($deleteBatchId) {
                $query->where('deleted_batch_id', $deleteBatchId);
            })
            ->get();

        // Restore sale record first
        $sale->restore();
        $sale->deleted_batch_id = null;
        $sale->save();

        foreach ($saleItems as $item) {
            $item->restore();

            if (! $item->product_id) {
                continue;
            }

            $product = Product::find($item->product_id);
            if (! $product || ! $product->is_stock_managed) {
                continue;
            }

            $productStock = ProductStock::where('store_id', $sale->store_id)
                ->where('batch_id', $item->batch_id)
                ->first();

            if ($productStock) {
                $productStock->quantity -= $item->quantity;
                $productStock->save();
            }
        }

        $creditTransactionRestored = false;

        foreach ($transactions as $transaction) {
            $transaction->restore();
            if ($transaction->deleted_batch_id !== null) {
                $transaction->deleted_batch_id = null;
                $transaction->save();
            }

            $paymentMethod = strtolower($transaction->payment_method ?? '');

            if ($paymentMethod === 'cash') {
                CashLog::withTrashed()
                    ->where('reference_id', $transaction->id)
                    ->where('source', 'sales')
                    ->restore();
            }

            if (in_array($paymentMethod, ['credit', 'account'], true) && $contact && $user) {
                $delta = $saleType === 'return'
                    ? -$transaction->amount
                    : $transaction->amount;

                if ($delta != 0) {
                    $contact->adjustBalanceBy(
                        -$delta,
                        $user,
                       $sale->invoice_number . ' Sale restore credit reversal',
                        $saleType === 'return' ? 'decrease' : 'increase'
                    );
                }

                $creditTransactionRestored = true;
            }
        }

        if ($contact && ! $creditTransactionRestored && $user) {
            if ($saleType === 'sale') {
                $delta = $sale->status === 'completed'
                    ? $sale->total_amount
                    : ($sale->total_amount - $sale->amount_received);

                if ($delta != 0) {
                    $contact->adjustBalanceBy(
                        -$delta,
                        $user,
                        $sale->invoice_number . ' Sale restore  balance reversal',
                        'increase'
                    );
                }
            } elseif ($saleType === 'return') {
                $delta = -$sale->amount_received;
                if ($delta != 0) {
                    $contact->adjustBalanceBy(
                        -$delta,
                        $user,
                        $sale->invoice_number . ' Return restore  reversal',
                        'decrease'
                    );
                }
            }
        }

        if ($saleType === 'refund') {
            CashLog::withTrashed()
                ->where('reference_id', $sale->id)
                ->where('source', 'sales')
                ->restore();
        }
    }

    private function restorePaperBillRecord(Sale $sale)
    {
        if ($sale->sale_type !== 'Paper') {
            throw new \Exception('Invalid paper bill restore request');
        }

        $contact = $sale->contact_id ? Contact::find($sale->contact_id) : null;
        $user = Auth::user();
        $deleteBatchId = $sale->deleted_batch_id;

        $sale->restore();
        $sale->deleted_batch_id = null;
        $sale->save();

        $transactions = Transaction::onlyTrashed()
            ->where('sales_id', $sale->id)
            ->when($deleteBatchId, function ($query) use ($deleteBatchId) {
                $query->where('deleted_batch_id', $deleteBatchId);
            })
            ->get();

        foreach ($transactions as $transaction) {
            $transaction->restore();

            $paymentMethod = strtolower($transaction->payment_method ?? '');

            if ($paymentMethod === 'cash') {
                CashLog::withTrashed()
                    ->where('reference_id', $transaction->id)
                    ->where('source', 'sales')
                    ->restore();
            }

            if (in_array($paymentMethod, ['credit', 'account'], true) && $contact && $user) {
                $contact->adjustBalanceBy(
                    -$transaction->amount,
                    $user,
                    $sale->invoice_number . ' Paper bill restore balance reversal',
                    'increase'
                );
            }
        }
    }

    private function restorePurchaseRecord(Purchase $purchase)
    {
        if ($purchase->is_return) {
            throw new \Exception('Return purchases cannot be restored from this section');
        }

        $purchase->restore();

        $items = $purchase->items()->onlyTrashed()->get();

        foreach ($items as $item) {
            $item->restore();

            if (! $item->product_id || ! $item->batch_id || ! $purchase->store_id) {
                continue;
            }

            $productStock = ProductStock::firstOrCreate(
                [
                    'store_id' => $purchase->store_id,
                    'product_id' => $item->product_id,
                    'batch_id' => $item->batch_id,
                ],
                ['quantity' => 0]
            );

            $productStock->quantity += $item->quantity;
            $productStock->save();
        }

        if ($purchase->contact_id && $purchase->total_amount != 0) {
            Contact::where('id', $purchase->contact_id)->adjustBalanceBy($purchase->total_amount, Auth::user(),  'Purchase restore balance reversal', 'decrease');
        }

        $transactions = PurchaseTransaction::onlyTrashed()
            ->where('purchase_id', $purchase->id)
            ->get();

        foreach ($transactions as $transaction) {
            $transaction->restore();

            if (strtolower($transaction->payment_method ?? '') === 'cash') {
                CashLog::withTrashed()
                    ->where('reference_id', $transaction->id)
                    ->where('source', 'purchases')
                    ->restore();
            }
        }
    }

    private function forceDeleteSale(Sale $sale)
    {
        // Delete paper bill attachments if present
        if ($sale->sale_type === 'Paper' && $sale->paper_images) {
            $paperImages = is_array($sale->paper_images) ? $sale->paper_images : json_decode($sale->paper_images, true);
            if ($paperImages) {
                foreach ($paperImages as $imagePath) {
                    if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                        Storage::disk('public')->delete($imagePath);
                    }
                }
            }

            $paperBillDir = 'paper_bills/'.$sale->id;
            if (Storage::disk('public')->exists($paperBillDir)) {
                Storage::disk('public')->deleteDirectory($paperBillDir);
            }
        }

        $transactions = Transaction::withTrashed()
            ->where('sales_id', $sale->id)
            ->get();

        foreach ($transactions as $transaction) {
            if (strtolower($transaction->payment_method ?? '') === 'cash') {
                CashLog::withTrashed()
                    ->where('reference_id', $transaction->id)
                    ->where('source', 'sales')
                    ->forceDelete();
            }

            $transaction->forceDelete();
        }

        foreach ($sale->saleItems()->withTrashed()->get() as $item) {
            $item->forceDelete();
        }

        // Refunds log entries reference the sale directly
        CashLog::withTrashed()
            ->where('reference_id', $sale->id)
            ->where('source', 'sales')
            ->forceDelete();

        $sale->forceDelete();
    }

    private function forceDeleteProduct(Product $product)
    {
        // Delete product image file if exists
        if ($product->image_url && Storage::disk('public')->exists($product->image_url)) {
            Storage::disk('public')->delete($product->image_url);
        }

        // Delete attachment and its file if exists
        if ($product->attachment_id) {
            $attachment = Attachment::find($product->attachment_id);
            if ($attachment) {
                if ($attachment->path && Storage::disk('public')->exists($attachment->path)) {
                    Storage::disk('public')->delete($attachment->path);
                }
                $attachment->delete();
            }
        }

        // Remove related product batches (and their stocks) before force deleting product
        $batchIds = ProductBatch::withTrashed()
            ->where('product_id', $product->id)
            ->pluck('id');

        $stockQuery = ProductStock::withTrashed()
            ->where('product_id', $product->id);

        if ($batchIds->isNotEmpty()) {
            $stockQuery->orWhereIn('batch_id', $batchIds);
        }

        $stockIds = $stockQuery->pluck('id');

        if ($stockIds->isNotEmpty()) {
            QuantityAdjustment::whereIn('stock_id', $stockIds)->delete();

            ProductStock::withTrashed()
                ->whereIn('id', $stockIds)
                ->forceDelete();
        }

        if ($batchIds->isNotEmpty()) {
            ProductBatch::withTrashed()
                ->whereIn('id', $batchIds)
                ->forceDelete();
        }

        $product->forceDelete();
    }

    // Permanent delete methods
    public function permanentDelete(Request $request)
    {
        if (! auth()->user()->can('permanent_delete')) {
            abort(403, 'Unauthorized to permanently delete records');
        }

        $type = $request->input('type');
        $id = $request->input('id');

        DB::beginTransaction();
        try {
            switch ($type) {
                case 'product':
                    $product = Product::onlyTrashed()->findOrFail($id);
                    $this->forceDeleteProduct($product);
                    break;
                case 'sale':
                    $sale = Sale::onlyTrashed()->findOrFail($id);
                    $this->forceDeleteSale($sale);
                    break;
                case 'purchase':
                    $purchase = Purchase::onlyTrashed()->with('items')->findOrFail($id);
                    foreach ($purchase->items()->onlyTrashed()->get() as $item) {
                        $item->forceDelete();
                    }
                    $purchase->forceDelete();
                    break;
                case 'customer':
                    Contact::onlyTrashed()->findOrFail($id)->forceDelete();
                    break;
                case 'employee':
                    Employee::onlyTrashed()->findOrFail($id)->forceDelete();
                    break;
                case 'expense':
                    Expense::onlyTrashed()->findOrFail($id)->forceDelete();
                    break;
                case 'store':
                    Store::onlyTrashed()->findOrFail($id)->forceDelete();
                    break;
                case 'user':
                    // Users should never be permanently deleted for security and audit reasons
                    throw new \Exception('Users cannot be permanently deleted. They can only be deactivated.');
                default:
                    throw new \Exception('Invalid type specified');
            }

            DB::commit();

            return redirect()->back()->with('success', ucfirst($type).' permanently deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Failed to permanently delete: '.$e->getMessage());
        }
    }

    public function permanentDeleteProductsBulk(Request $request)
    {
        if (! auth()->user()->can('permanent_delete')) {
            abort(403, 'Unauthorized to permanently delete records');
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $ids = collect($validated['ids'])->unique()->values()->all();

        $deletedCount = 0;
        $skippedCount = 0;

        foreach (array_chunk($ids, 50) as $chunk) {
            DB::beginTransaction();
            try {
                $products = Product::onlyTrashed()
                    ->whereIn('id', $chunk)
                    ->get();

                $skippedCount += count($chunk) - $products->count();

                foreach ($products as $product) {
                    $this->forceDeleteProduct($product);
                    $deletedCount++;
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();

                Log::error('Bulk product permanent delete failed', [
                    'error' => $e->getMessage(),
                    'user_id' => auth()->id(),
                ]);

                return redirect()->back()->with('error', 'Bulk permanent delete failed: '.$e->getMessage());
            }
        }

        if ($deletedCount === 0) {
            return redirect()->back()->with('error', 'No selected products could be permanently deleted.');
        }

        $message = "{$deletedCount} product(s) permanently deleted.";
        if ($skippedCount > 0) {
            $message .= " {$skippedCount} selection(s) were skipped because they were not found.";
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Standalone restore page - works without authentication
     * Accessible via /restore-standalone route
     */
    public function showStandalone()
    {
        return view('restore.standalone');
    }

    /**
     * Standalone restore handler - works without authentication
     * This allows restoring backups even when database is empty or app is fresh
     */
    public function restoreStandalone(Request $request)
    {
        // No authentication check - this is a standalone restore
        // But we can add a simple security check (e.g., check if app key matches or a token)

        $request->validate([
            'backup_file' => 'required|file|mimes:zip|max:52428800', // 50GB max (in KB)
        ]);

        // Optimize PHP settings for large files and databases
        ini_set('memory_limit', '4G');
        ini_set('max_execution_time', '0'); // No time limit
        ini_set('max_input_time', '0'); // No input time limit
        set_time_limit(0); // No time limit for script execution
        ini_set('post_max_size', '50G');
        ini_set('upload_max_filesize', '50G');

        $backupFile = $request->file('backup_file');
        $tempDir = storage_path('app/temp/restore_'.Str::random(16));
        $extractPath = $tempDir.'/extracted';

        try {
            Log::info('Starting standalone backup restore process', [
                'file_name' => $backupFile->getClientOriginalName(),
                'file_size' => $backupFile->getSize(),
            ]);

            // Create temporary directories
            if (! File::exists($tempDir)) {
                File::makeDirectory($tempDir, 0755, true);
            }
            if (! File::exists($extractPath)) {
                File::makeDirectory($extractPath, 0755, true);
            }

            // Move uploaded file to temp location
            $zipPath = $tempDir.'/backup.zip';
            $backupFile->move($tempDir, 'backup.zip');

            // Extract ZIP file
            $zip = new \ZipArchive;
            if ($zip->open($zipPath) !== true) {
                throw new \Exception('Failed to open backup ZIP file');
            }

            $zip->extractTo($extractPath);
            $zip->close();

            // Find SQL file in extracted contents
            $sqlFile = $this->findSqlFile($extractPath);
            if (! $sqlFile) {
                throw new \Exception('No SQL backup file found in the ZIP archive');
            }

            try {
                // Restore database (manages its own transactions)
                $this->restoreDatabase($sqlFile);

                // Restore media files
                $this->restoreMediaFiles($extractPath);

                // Clean up temporary files
                File::deleteDirectory($tempDir);

                Log::info('Standalone backup restore completed successfully');

                return response()->json([
                    'success' => true,
                    'message' => 'Backup restored successfully! Database and media files have been restored. You can now log in to your application.',
                ]);

            } catch (\Exception $e) {
                // restoreDatabase handles its own rollback, so we just re-throw
                throw $e;
            }

        } catch (\Exception $e) {
            // Clean up on error
            if (File::exists($tempDir)) {
                try {
                    File::deleteDirectory($tempDir);
                } catch (\Exception $cleanupException) {
                    // Ignore cleanup errors
                }
            }

            Log::error('Standalone backup restore failed', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Restore failed: '.$e->getMessage(),
            ], 500);
        }
    }
}
