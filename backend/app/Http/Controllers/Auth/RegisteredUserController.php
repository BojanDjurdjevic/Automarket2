<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): Response
    {
        $request->validate([
            'name' => ['required', 'string', 'max:64'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:128', 'unique:'.User::class],
            'phone' => 'nullable|string|max:64',
            'city' => 'nullable|string|max:64',
            'avatar' => 'nullable|string|max:255',
            'password' => ['required', 'string', 'confirmed', Rules\Password::defaults()], //->letters()->numbers()->symbols()
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'city' => $request->city,
            'avatar' => $request->avatar,
            'password' => $request->password //Hash::make($request->string('password')),
        ]);

        event(new Registered($user));

        Auth::login($user);

        $request->session()->regenerate();

        return response()->noContent();
    }
}
