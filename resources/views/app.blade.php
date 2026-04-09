<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
        <meta name="theme-color" content="#667eea">
        
        <!-- Favicon -->
        <link rel="icon" type="image/x-icon" href="{{ asset(\App\Models\Setting::where('meta_key', 'favicon')->value('meta_value') ?? 'AppImages/android/android-launchericon-192-192.png') }}">
        
        <title inertia>{{ \App\Models\Setting::where('meta_key', 'site_name')->value('meta_value') ?? config('app.name', 'arsasoft') }}</title>
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <!-- Professional Receipt Fonts -->
        <link href="https://fonts.bunny.net/css?family=roboto-mono:400,500,600,700|source-code-pro:400,500,600,700|fira-code:400,500,600,700|roboto:400,500,600,700|open-sans:400,500,600,700|inter:400,500,600,700|lato:400,500,600,700|montserrat:400,500,600,700|poppins:400,500,600,700|merriweather:400,700|playfair-display:400,700|space-mono:400,700&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <link rel="stylesheet" href="{{ asset('css/custom.css') }}">
    </head>
    <body class="font-sans antialiased">
        @inertia
        
        <!-- Timezone sync utility (Electron only) -->
        @if(request()->header('User-Agent') && str_contains(request()->header('User-Agent'), 'Electron'))
        <script src="{{ asset('js/utils/timezone-sync.js') }}"></script>
        @endif
    </body>
</html>
