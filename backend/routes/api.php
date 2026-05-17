<?php

use App\Http\Controllers\Api\CarController;
use App\Http\Controllers\Api\CarImageController;
use App\Http\Controllers\Api\CarMakeController;
use App\Http\Controllers\Api\MetaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::apiResource('/cars', CarController::class)->only(['index', 'show']);

Route::get('/meta/filters', [MetaController::class, 'filters']);

Route::get('/makes', [CarMakeController::class, 'index']);

Route::get('/makes/{make}/models', [CarMakeController::class, 'models']);

Route::get('/users/{user}/cars', [CarController::class, 'userCars']);

Route::middleware(['auth:sanctum'])->group(function() {
    /*
    Route::get('/user', function (Request $request) {
        return $request->user();
    }); */

    Route::apiResource('/cars', CarController::class)->except(['index', 'show']);

    Route::get('/my-cars', [CarController::class, 'myCars']);

    Route::post('/cars/{car}/images', [CarImageController::class,'store']);

    Route::put('/cars/{car}/images/{image}/primary', [CarImageController::class, 'setPrimary']);

    Route::delete('/cars/{car}/images/{image}', [CarImageController::class,'destroy']);
});

//require __DIR__.'/auth.php';