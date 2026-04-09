<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class LicenseEmergencyBypass extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'license:emergency-bypass 
                            {action : enable or disable the bypass}
                            {--hours=24 : Duration in hours for the bypass}
                            {--reason= : Reason for the emergency bypass}';

    /**
     * The console command description.
     */
    protected $description = 'Enable or disable emergency license bypass for system access';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');
        $hours = (int) $this->option('hours');
        $reason = $this->option('reason') ?? 'Emergency system access';

        if (!in_array($action, ['enable', 'disable'])) {
            $this->error('Action must be "enable" or "disable"');
            return 1;
        }

        if ($action === 'enable') {
            if ($hours <= 0 || $hours > 168) { // Max 7 days
                $this->error('Hours must be between 1 and 168 (7 days)');
                return 1;
            }

            $this->enableEmergencyBypass($hours, $reason);
        } else {
            $this->disableEmergencyBypass();
        }

        return 0;
    }

    /**
     * Enable emergency bypass
     */
    protected function enableEmergencyBypass(int $hours, string $reason)
    {
        $expiresAt = now()->addHours($hours);
        
        Cache::put('license_emergency_override', [
            'enabled' => true,
            'reason' => $reason,
            'enabled_at' => now()->toISOString(),
            'expires_at' => $expiresAt->toISOString(),
            'enabled_by' => get_current_user() ?: 'system',
        ], $hours * 3600); // Convert to seconds

        $this->info('✅ Emergency license bypass enabled!');
        $this->table(
            ['Setting', 'Value'],
            [
                ['Status', 'ENABLED'],
                ['Duration', "{$hours} hours"],
                ['Expires At', $expiresAt->format('Y-m-d H:i:s')],
                ['Reason', $reason],
                ['Enabled By', get_current_user() ?: 'system'],
            ]
        );

        Log::warning('Emergency license bypass enabled', [
            'reason' => $reason,
            'hours' => $hours,
            'expires_at' => $expiresAt,
            'enabled_by' => get_current_user() ?: 'system',
        ]);

        $this->line("\n⚠️  WARNING: Emergency bypass allows system access without valid license!");
        $this->line("   Use this only for legitimate emergency situations.");
        $this->line("   The bypass will automatically expire on {$expiresAt->format('Y-m-d H:i:s')}.");
    }

    /**
     * Disable emergency bypass
     */
    protected function disableEmergencyBypass()
    {
        $bypass = Cache::get('license_emergency_override');
        
        if (!$bypass) {
            $this->info('ℹ️  No emergency bypass is currently active.');
            return;
        }

        Cache::forget('license_emergency_override');

        $this->info('✅ Emergency license bypass disabled!');

        Log::info('Emergency license bypass disabled', [
            'was_enabled_at' => $bypass['enabled_at'] ?? null,
            'was_expiring_at' => $bypass['expires_at'] ?? null,
            'disabled_by' => get_current_user() ?: 'system',
        ]);

        if ($bypass) {
            $this->line("Previously enabled at: " . ($bypass['enabled_at'] ?? 'Unknown'));
            $this->line("Was expiring at: " . ($bypass['expires_at'] ?? 'Unknown'));
            $this->line("Reason: " . ($bypass['reason'] ?? 'Unknown'));
        }
    }
}
