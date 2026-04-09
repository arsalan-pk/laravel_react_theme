<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BackupStorageMedia extends Model
{
    protected $fillable = [
        'name',
        'type',
        'is_active',
        'is_default',
        'config',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'config' => 'array',
    ];

    public static function getDefault()
    {
        return self::where('is_default', true)
            ->where('is_active', true)
            ->first();
    }

    public static function getActive()
    {
        return self::where('is_active', true)->get();
    }
}
