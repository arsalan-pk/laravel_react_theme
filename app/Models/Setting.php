<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Settings
 * @package App\Models
 */

class Setting extends Model
{
    use HasFactory;

    protected $fillable = ['meta_key', 'meta_value'];

    public static function getMiscSettings()
    {
        $setting = self::where('meta_key', 'misc_settings')->first();
        if ($setting) {
            $decodedValue = json_decode($setting->meta_value, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decodedValue;
            }
        }
        return null;
    }

    /**
     * Retrieve modules as an array by splitting the comma-separated string
     *
     * @return array
     */
    public static function getModules()
    {
        $setting = self::where('meta_key', 'modules')->first();
        if ($setting) {
            return explode(',', $setting->meta_value);
        }
        return [];
    }
}
