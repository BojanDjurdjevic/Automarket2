<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertOk()->assertJson(['name' => $user->name]);
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertNoContent();
    }

    public function test_profile_password_change_validates_strings_and_keeps_current_session(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->putJson('/profile/password', [
            'current_password' => ['bad'], 'password' => ['bad'], 'password_confirmation' => ['bad'],
        ])->assertUnprocessable()->assertJsonValidationErrors(['current_password', 'password']);

        $this->putJson('/profile/password', [
            'current_password' => 'password', 'password' => 'New-password-123', 'password_confirmation' => 'New-password-123',
        ])->assertOk();

        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('New-password-123', $user->fresh()->password));
        $this->getJson('/profile')->assertOk();
    }

    public function test_a_session_with_an_old_password_hash_is_rejected(): void
    {
        $this->actingAs(User::factory()->create())->withSession(['password_hash_web' => 'old-password-hash'])
            ->getJson('/profile')->assertUnauthorized();
        $this->assertGuest('web');
    }
}
