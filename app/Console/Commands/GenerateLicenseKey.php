<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\License;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GenerateLicenseKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'license:generate 
                            {--customer= : Customer name}
                            {--email= : Customer email}
                            {--type=lifetime : License type (lifetime, yearly, trial)}
                            {--days=0 : Duration in days (0 for lifetime)}
                            {--activations=1 : Maximum activations}
                            {--notes= : Additional notes}
                            {--secret= : Optional secret to store with license}
                            {--shop_name= : Shop name}
                            {--address= : Shop address}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate a new license key and store metadata in database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $customer = $this->option('customer') ?: $this->ask('Customer name');
        $email = $this->option('email') ?: $this->ask('Customer email');
        $type = $this->option('type');
        $days = (int) $this->option('days');
        $maxActivations = (int) $this->option('activations');
        $notes = $this->option('notes');
        $secret = $this->option('secret');
        $shopName = $this->option('shop_name');
        $address = $this->option('address');

        // Validate inputs
        if (!in_array($type, ['lifetime', 'yearly', 'trial'])) {
            $this->error('License type must be: lifetime, yearly, or trial');
            return 1;
        }

        if ($type === 'lifetime' && $days > 0) {
            $this->error('Lifetime licenses cannot have duration days');
            return 1;
        }

        if ($type !== 'lifetime' && $days <= 0) {
            $days = $type === 'trial' ? 30 : 365;
            $this->info("Auto-setting duration to {$days} days for {$type} license");
        }

        // Generate license key
        $licenseKey = $this->generateLicenseKey();

        // Calculate expiration
        $expiresAt = null;
        if ($type !== 'lifetime') {
            $expiresAt = Carbon::now()->addDays($days);
        }

        // Store in database
        $license = License::create([
            'license_key' => $licenseKey,
            'customer_name' => $customer,
            'customer_email' => $email,
            'is_trial' => ($type === 'trial'),
            'is_active' => false, // Not activated yet
            'max_activations' => $maxActivations,
            'activation_count' => 0,
            'activated_at' => null,
            'expires_at' => $expiresAt,
            'last_validated_at' => null,
            'hardware_fingerprint' => null,
            'machine_id' => null,
            'notes' => $notes,
            'secret' => $secret,
            'shop_name' => $shopName,
            'address' => $address,
        ]);

        $this->info('✅ License key generated successfully!');
        $this->table(
            ['Field', 'Value'],
            [
                ['License Key', $licenseKey],
                ['Customer', $customer],
                ['Email', $email],
                ['Type', $type],
                ['Duration', $type === 'lifetime' ? 'Lifetime' : "{$days} days"],
                ['Max Activations', $maxActivations],
                ['Expires At', $expiresAt ? $expiresAt->format('Y-m-d H:i:s') : 'Never'],
                ['Status', 'Unused (awaiting activation)'],
                ['Notes', $notes ?: 'None'],
                ['Shop Name', $shopName ?: 'None'],
                ['Address', $address ?: 'None'],
            ]
        );

        $this->line('');
        $this->info('📋 Next steps:');
        $this->line('1. Share this license key with the customer');
        $this->line('2. Customer will activate it in the application');
        $this->line('3. Activation will create an encrypted license.dat file');
        $this->line('4. Daily validation will verify the license file');

        return 0;
    }

    /**
     * Generate a unique license key
     */
    private function generateLicenseKey(): string
    {
        do {
            $key = strtoupper(Str::random(4)) . '-' .
                   strtoupper(Str::random(4)) . '-' .
                   strtoupper(Str::random(4)) . '-' .
                   strtoupper(Str::random(4));
        } while (License::where('license_key', $key)->exists());

        return $key;
    }
}
