<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $version = config('version.version');
        $imageUrl = '';
        if (app()->environment('production')) {
            $imageUrl = 'public/';
        }

        $settings = Setting::whereIn('meta_key', ['site_logo', 'misc_settings', 'site_name'])->get();
        $settingArray = $settings->pluck('meta_value', 'meta_key')->all();
        
        // Safely handle missing settings with null coalescing
        $settingArray['site_logo'] = isset($settingArray['site_logo']) 
            ? $imageUrl.$settingArray['site_logo'] 
            : null;
        $settingArray['site_name'] = $settingArray['site_name'] ?? 'Default Store';
        
        if (isset($settingArray['misc_settings'])) {
            $miscSettings = json_decode($settingArray['misc_settings'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settingArray = array_merge($settingArray, $miscSettings);
            }
        }

        // Static dashboard data - no database queries for deleted models
        $data = [
            'totalItems' => '1,250',
            'soldItems' => '3,450',
            'totalQuantities' => '3,450',
            'cheque_alert_count' => 2,
            'pending_cheque_count' => 3,
            'totalValuation' => '450,000.00',
            'customerBalance' => '-85,000.75',
            'lowStock' => '0',
            'outOfStock' => '0',
            'overdueReminders' => '0',
            'saleChart' => [],
        ];

        return Inertia::render('Dashboard/Dashboard', [
            'pageLabel' => 'Dashboard',
            'data' => $data,
            'logo' => $settingArray['site_logo'],
            'version' => $version,
            'store_name' => $settingArray['site_name'],
        ]);
    }

    public function getDashboardSummary(Request $request)
    {
        if (!auth()->user()->can('view_dashboard_summary')) {
            return response()->json(['error' => 'Unauthorized access to dashboard summary'], 403);
        }

        // Return static summary data
        $data = [
            'inventory_purchase' => 75000.00,
            'total_sales' => 250000.75,
            'cash_in' => 125000.50,
            'expenses' => 45000.25,
            'salary_expense' => 0,
        ];

        return response()->json([
            'summary' => $data,
        ], 200);
    }

    public function getSoldItemsSummary(Request $request)
    {
        if (!auth()->user()->can('view_dashboard_analytics')) {
            return response()->json(['error' => 'Unauthorized access to dashboard analytics'], 403);
        }

        // Return empty arrays for deleted models
        return response()->json([
            'top_sold_items' => [],
            'top_profit_items' => [],
            'top_gross_items' => [],
        ]);
    }
}
