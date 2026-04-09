<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDetail extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'key',
        'value',
        'group',
        'type',
        'uuid',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    protected function casts(): array
    {
        return [
            'value' => 'string',
        ];
    }

    /**
     * Get the user that owns the details.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get details by group.
     */
    public function scopeByGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope to get a specific key for a user.
     */
    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    /**
     * Get a specific value for a key.
     */
    public static function getValue($userId, $key, $default = null)
    {
        $detail = self::where('user_id', $userId)->where('key', $key)->first();
        return $detail ? $detail->value : $default;
    }

    /**
     * Set a value for a key.
     */
    public static function setValue($userId, $key, $value, $group = 'general', $type = 'string')
    {
        $detail = self::where('user_id', $userId)->where('key', $key)->first();
        
        if ($detail) {
            $detail->value = $value;
            $detail->group = $group;
            $detail->type = $type;
            $detail->save();
        } else {
            self::create([
                'user_id' => $userId,
                'key' => $key,
                'value' => $value,
                'group' => $group,
                'type' => $type,
                'uuid' => (string) \Illuminate\Support\Str::uuid(),
            ]);
        }
        
        return $detail;
    }

    /**
     * Delete a key.
     */
    public static function deleteKey($userId, $key)
    {
        return self::where('user_id', $userId)->where('key', $key)->delete();
    }

    /**
     * Get all details for a user as key-value array.
     */
    public static function getAllDetails($userId)
    {
        $details = self::where('user_id', $userId)->get();
        $result = [];
        
        foreach ($details as $detail) {
            $result[$detail->key] = [
                'value' => $detail->value,
                'group' => $detail->group,
                'type' => $detail->type,
            ];
        }
        
        return $result;
    }

    /**
     * Get profile picture URL for a user.
     */
    public static function getProfilePictureUrl($userId): string
    {
        $value = self::getValue($userId, 'profile_picture');
        if ($value) {
            return '/storage/' . $value;
        }
        return '';
    }
}
