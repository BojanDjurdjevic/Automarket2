<?php

namespace App\Providers;

use App\Models\Car;
use App\Policies\CarPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function ($notifiable, $url) {

            $frontend = rtrim(config('app.frontend_url'), '/');
            /*
            $parsed = parse_url($url);

            $path = $parsed['path'];
            $query = $parsed['query'];

            $spaUrl =
                $frontend .
                str_replace(
                    '/verify-email/',
                    '/email-check/',
                    $path
                ) .
                '?' . $query; */

            $spaUrl = $frontend . '/email-check?verify_url=' . urlencode($url);

            return (new MailMessage)
                ->subject('Verify Email')
                ->line('Click below to verify your email.')
                ->action('Verify Email', $spaUrl);
        });
        /*
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        }); */

        ResetPassword::createUrlUsing(function (object $user, string $token) {
                return rtrim(config('app.frontend_url'), '/')
                    . "/reset-password/{$token}?".http_build_query(['email' => $user->email]);
            }
        );

        Gate::policy(Car::class, CarPolicy::class);
    }
}
