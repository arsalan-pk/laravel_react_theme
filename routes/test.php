<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/test-restore', function () {
    return view('test-restore');
});

Route::post('/test-simple-restore', function (Request $request) {
    try {
        if (!$request->hasFile('backup_file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }
        
        $file = $request->file('backup_file');
        
        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'file_info' => [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime' => $file->getMimeType(),
                'extension' => $file->getClientOriginalExtension()
            ]
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
