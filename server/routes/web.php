<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamInviteController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

Route::prefix('api')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'show'])->middleware('auth:sanctum');
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

                    Route::prefix('{restaurant}')
                        ->scopeBindings()
                        ->group(function () {
                            Route::get('', [RestaurantController::class, 'show'])->middleware('can:view,restaurant');
                            Route::patch('', [RestaurantController::class, 'update'])->middleware('can:update,restaurant');
                            Route::put('', [RestaurantController::class, 'update'])->middleware('can:update,restaurant');
                            Route::delete('', [RestaurantController::class, 'destroy'])->middleware('can:delete,restaurant');
                        });
                });

                Route::prefix('members')->group(function () {
                    Route::get('', [TeamMemberController::class, 'index'])->middleware('can:view,team');
                    Route::delete('', [TeamMemberController::class, 'destroy'])->middleware('can:update,team');
                });

                Route::prefix('invites')->group(function () {
                    Route::get('', [TeamInviteController::class, 'index'])->middleware('can:view,team');
                    Route::post('', [TeamInviteController::class, 'store'])->middleware('can:update,team');
                    Route::delete('{invite}', [TeamInviteController::class, 'destroy'])->middleware('can:update,team');
                });
            });
    });

    Route::prefix('restaurants')->middleware('auth:sanctum')->group(function () {
        Route::prefix('{restaurant}')
            ->scopeBindings()
            ->group(function () {
                Route::prefix('visits')->group(function () {
                    Route::get('', [VisitController::class, 'index'])->middleware('can:view,restaurant');
                    Route::post('', [VisitController::class, 'store'])->middleware('can:view,restaurant');

                    Route::prefix('{visit}')->group(function () {
                        Route::get('', [VisitController::class, 'show'])->middleware('can:view,visit');
                        Route::patch('', [VisitController::class, 'update'])->middleware('can:update,visit');
                        Route::put('', [VisitController::class, 'update'])->middleware('can:update,visit');
                        Route::delete('', [VisitController::class, 'destroy'])->middleware('can:delete,visit');
                    });
                });
            });
    });

    Route::prefix('visits')->middleware('auth:sanctum')->group(function () {
        Route::prefix('{visit}')
            ->scopeBindings()
            ->group(function () {
                Route::prefix('reviews')->group(function () {
                    Route::get('', [ReviewController::class, 'index'])->middleware('can:view,visit');
                    Route::post('', [ReviewController::class, 'store'])->middleware('can:view,visit');

                    Route::prefix('{review}')->group(function () {
                        Route::get('', [ReviewController::class, 'show'])->middleware('can:view,visit');
                        Route::patch('', [ReviewController::class, 'update'])->middleware('can:update,visit');
                        Route::put('', [ReviewController::class, 'update'])->middleware('can:update,visit');
                        Route::delete('', [ReviewController::class, 'destroy'])->middleware('can:delete,visit');
                    });
                });
            });
    });

    Route::prefix('team-invites')->middleware('auth:sanctum')->group(function () {
        Route::get('', [TeamInviteController::class, 'userIndex']);
        Route::prefix('{invite}')->group(function () {
            Route::post('accept', [TeamInviteController::class, 'accept'])->middleware('can:accept,invite');
            Route::post('reject', [TeamInviteController::class, 'reject'])->middleware('can:reject,invite');
        });
    });
});
