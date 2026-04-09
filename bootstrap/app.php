<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\CheckUserActive::class,
            // \App\Http\Middleware\CheckLicenseExpiration::class,
        ]);

        // Exclude specific routes from CSRF
        $middleware->validateCsrfTokens(except: [
            '/api/application-update',
            '/api/receipt/{id}',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
