<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/debug-user', function (\Illuminate\Http\Request $request) {
    return [
        'user' => $request->user(),
        'auth_check' => auth()->check(),
        'session_id' => session()->getId(),
    ];
});

Route::get('/', function () {
    return response()->json([
        'app' => 'AutoPlac API',
        'version' => app()->version(),
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get(
    '/verify-email/{id}/{hash}',
    VerifyEmailController::class
)->middleware(['auth:sanctum', 'signed'])->name('verification.verify');


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/profile', function (Request $request) {
        return response()->json(
            $request->user()
        );
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
