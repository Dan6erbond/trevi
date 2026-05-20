<?php

use App\Http\Controllers\AuthController;
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
        Route::get('/{team}', [TeamController::class, 'show'])->middleware('can:view,team');
        Route::patch('/{team}', [TeamController::class, 'update'])->middleware('can:update,team');
        Route::put('/{team}', [TeamController::class, 'update'])->middleware('can:update,team');
        Route::delete('/{team}', [TeamController::class, 'destroy'])->middleware('can:delete,team');
    });
});
