<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PosNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'note_text',
        'audio_path',
        'note_date',
        'user_id',
        'is_completed',
        'completed_at',
    ];

    protected $casts = [
        'note_date' => 'date',
        'created_at' => 'datetime',
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
