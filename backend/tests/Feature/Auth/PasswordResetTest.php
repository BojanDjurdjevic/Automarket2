<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_links_use_frontend_config_and_encode_email(): void
    {
        config(['app.frontend_url' => 'https://frontend.example.test/']);
        $user = User::factory()->create(['email' => 'seller+test@example.test']);
        $mail = (new ResetPassword('test-token'))->toMail($user);

        $this->assertSame('https://frontend.example.test/reset-password/test-token?email=seller%2Btest%40example.test', $mail->actionUrl);
        $verification = (new \Illuminate\Auth\Notifications\VerifyEmail)->toMail($user);
        $this->assertStringStartsWith('https://frontend.example.test/email-check?verify_url=', $verification->actionUrl);
    }

    public function test_reset_password_link_can_be_requested(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class);
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function (object $notification) use ($user) {
            $response = $this->post('/reset-password', [
                'token' => $notification->token,
                'email' => $user->email,
                'password' => 'password',
                'password_confirmation' => 'password',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertStatus(200);

            return true;
        });
    }
}
