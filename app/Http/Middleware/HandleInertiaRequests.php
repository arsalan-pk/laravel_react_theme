<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Spatie\Permission\Models\Role;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $permissions = collect();
        $user = null;
        
        if ($request->user()) {
            $user = $request->user()->load('userDetails');
            $role = Role::where('name', $user->user_role)->first();
            if ($role) {
                $permissions = $role->permissions;
            }
        }

        $siteNameMeta = Setting::where('meta_key', 'site_name')->first();
        $shopNameMeta = Setting::where('meta_key', 'shop_name')->first();
        $currencySettingsMeta = Setting::where('meta_key', 'currency_settings')->first();

        // Use site_name first, fallback to shop_name
        $siteName = $siteNameMeta ? $siteNameMeta->meta_value : ($shopNameMeta ? $shopNameMeta->meta_value : 'Site Name');

        // Parse currency settings JSON or use defaults
        $currencySettings = [];
        if ($currencySettingsMeta) {
            try {
                $currencySettings = json_decode($currencySettingsMeta->meta_value, true) ?? [];
            } catch (\Exception $e) {
                $currencySettings = [];
            }
        }

        $modules = Setting::getModules();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
            ],
            'settings' => [
                'site_name' => $siteName,
                'currency_settings' => $currencySettings,
            ],
            'modules' => $modules,
            'userPermissions' => $permissions->pluck('name')->merge($permissions->pluck('group'))->unique()->filter()->values()->toArray(),
        ];
    }
}
