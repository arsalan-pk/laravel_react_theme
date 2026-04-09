<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait Userstamps
{
    protected static function bootUserstamps()
    {
        static::creating(function ($model) {
            $model->created_by = Auth::id(); // Automatically set created_by to the authenticated user's ID
        });
    }
}