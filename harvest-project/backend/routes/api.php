<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BuyerRequestController;
use App\Http\Controllers\Api\CropController;
use App\Http\Controllers\Api\CropListingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\HarvestRecordController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ---------- Public ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ---------- Authenticated (Sanctum token) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', DashboardController::class);

    // Crop catalog: everyone can read, admin manages
    Route::get('/crops', [CropController::class, 'index']);
    Route::get('/crops/{crop}', [CropController::class, 'show']);

    // Crop listings: everyone can browse; farmers manage their own (policy)
    Route::apiResource('crop-listings', CropListingController::class);

    // Buyer requests: buyers create, farmers/admin review (policy + transitions)
    Route::apiResource('buyer-requests', BuyerRequestController::class);
    Route::patch('/buyer-requests/{buyer_request}/status', [BuyerRequestController::class, 'updateStatus']);

    // Harvest records: farmers (own) and admin (all)
    Route::apiResource('harvest-records', HarvestRecordController::class)
        ->middleware('role:farmer,admin');

    // ---------- Admin only ----------
    Route::middleware('role:admin')->group(function () {
        Route::post('/crops', [CropController::class, 'store']);
        Route::put('/crops/{crop}', [CropController::class, 'update']);
        Route::delete('/crops/{crop}', [CropController::class, 'destroy']);

        Route::apiResource('users', UserController::class);
    });
});
