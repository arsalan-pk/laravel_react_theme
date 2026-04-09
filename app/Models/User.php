<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Rappasoft\LaravelAuthenticationLog\Traits\AuthenticationLoggable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, AuthenticationLoggable, HasRoles;
    use SoftDeletes;
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'user_name',
        'user_role',
        'is_active',
        'deleted_by_name',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_picture_url',
    ];

    const ROLE_ADMIN = 'admin';
    const ROLE_USER = 'user';

    /**
     * Get the user details associated with the user.
     */
    public function userDetails()
    {
        return $this->hasMany(UserDetail::class);
    }

    /**
     * Get the profile picture URL.
     */
    public function getProfilePictureUrlAttribute(): string
    {
        return UserDetail::getProfilePictureUrl($this->id);
    }

    /**
     * Get a specific user detail value.
     */
    public function getDetail($key, $default = null)
    {
        return UserDetail::getValue($this->id, $key, $default);
    }

    /**
     * Set a specific user detail value.
     */
    public function setDetail($key, $value, $group = 'general', $type = 'string')
    {
        return UserDetail::setValue($this->id, $key, $value, $group, $type);
    }

    /**
     * Delete a specific user detail.
     */
    public function deleteDetail($key)
    {
        return UserDetail::deleteKey($this->id, $key);
    }
}
