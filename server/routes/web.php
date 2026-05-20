<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'show']);
        Route::post('/login', [AuthController::class, 'authenticate']);
        Route::post('/register', [AuthController::class, 'register']);
    });

    Route::prefix('teams')->middleware('auth:sanctum')->group(function () {
        Route::post('', [TeamController::class, 'store']);
        Route::get('', [TeamController::class, 'index']);

        Route::prefix('{team}')
            ->scopeBindings()
            ->group(function () {
                Route::get('', [TeamController::class, 'show'])->middleware('can:view,team');
                Route::patch('', [TeamController::class, 'update'])->middleware('can:update,team');
                Route::put('', [TeamController::class, 'update'])->middleware('can:update,team');
                Route::delete('', [TeamController::class, 'destroy'])->middleware('can:delete,team');

                Route::prefix('restaurants')->group(function () {
                    Route::get('', [RestaurantController::class, 'index'])->middleware('can:view,team');
                    Route::post('', [RestaurantController::class, 'store'])->middleware('can:view,team');

                    Route::prefix('{restaurant}')->group(function () {
                        Route::get('', [RestaurantController::class, 'show'])->middleware('can:view,restaurant');
                        Route::patch('', [RestaurantController::class, 'update'])->middleware('can:update,restaurant');
                        Route::put('', [RestaurantController::class, 'update'])->middleware('can:update,restaurant');
                        Route::delete('', [RestaurantController::class, 'destroy'])->middleware('can:delete,restaurant');
                    });
                });
            });
    });
});
