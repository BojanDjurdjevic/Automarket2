<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;

/*
Route::get('/debug-user', function (\Illuminate\Http\Request $request) {
    return [
        'user' => $request->user(),
        'auth_check' => auth()->check(),
        'session_id' => session()->getId(),
    ];
}); */

Route::get('/', function () {
    return response()->json([
        'app' => 'AutoPlac API',
        'version' => app()->version(),
    ]);
});


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });//->middleware('auth:sanctum');

    Route::get('/profile', function (Request $request) {
        return response()->json(
            $request->user()
        );
    });

    Route::put('/profile', function (Request $request) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:64'],
            'phone' => ['nullable', 'string', 'max:64'],
            'city' => ['nullable', 'string', 'max:64'],
        ]);

        $request->user()->update($data);

        return response()->json([
            'message' => 'Profile updated',
            'user' => $request->user(),
        ]);
    });

    Route::put('/profile/password', function (Request $request) {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        if (!Hash::check(
            $data['current_password'],
            $request->user()->password
        )) {

            throw ValidationException::withMessages([
                'current_password' => [
                    'Current password is incorrect.'
                ]
            ]);
        }

        $request->user()->update([
            'password' => bcrypt($data['password']),
            'remember_token' => \Illuminate\Support\Str::random(60),
        ]);

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Password updated'
        ]);
    });

    //DELETE user account, all cars and imgs:
    Route::delete('/profile', function (Request $request) {
        $user = $request->user();

        DB::transaction(function () use ($user) {
            $cars = $user->cars()->withTrashed()->lockForUpdate()->get();

            foreach ($cars as $car) {
                app(\App\Services\CarImageService::class)->deleteAllImages($car);
                $car->features()->detach();
                $car->forceDelete();
            }

            auth()->guard('web')->logout();
            $user->delete();
        });

        //Auth::logout();
        
        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Account deleted'
        ]);
    });
});

/*
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        //return redirect('http://127.0.0.1:5173/verify-success'); // 'app.frontend_url') .
        return response()->json([
            'message' => 'Email verified'
        ]);
    })->middleware(['signed'])->name('verification.verify');

    // resend email
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'sent']);
    })->middleware('throttle:6,1');

}); */

require __DIR__.'/auth.php';
