<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Client\ClientAuthController;
use App\Http\Controllers\Client\ClientDashboardController;
use App\Http\Controllers\Client\ClientReportController;
use App\Http\Controllers\Client\ClientAlertController;
use App\Http\Controllers\Client\ClientProfileController;
use App\Http\Controllers\Client\ClientSettingsController;
use App\Http\Controllers\Client\ClientRewardsController;

// Landing page
Route::get('/', [LandingController::class, 'index'])->name('landing');

// Client Portal Routes
Route::prefix('client')->name('client.')->group(function () {
    // Guest routes (login, register)
    Route::middleware('guest:client')->group(function () {
        Route::get('/login', [ClientAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [ClientAuthController::class, 'login']);
        Route::get('/register', [ClientAuthController::class, 'showRegister'])->name('register');
        Route::post('/register', [ClientAuthController::class, 'register']);
    });

    // Authenticated client routes
    Route::middleware('client.auth')->group(function () {
        Route::post('/logout', [ClientAuthController::class, 'logout'])->name('logout');
        Route::get('/api/overview', [ClientDashboardController::class, 'overview'])->name('overview');
        Route::get('/api/categories', [ClientReportController::class, 'categories'])->name('categories');
        Route::get('/api/reports', [ClientReportController::class, 'index'])->name('reports.index');
        Route::post('/api/reports', [ClientReportController::class, 'store'])->name('reports.store');
        Route::get('/api/my-reports', [ClientReportController::class, 'myReports'])->name('reports.mine');
        Route::get('/api/alerts', [ClientAlertController::class, 'index'])->name('alerts.index');
        Route::get('/api/profile', [ClientProfileController::class, 'show'])->name('profile.show');
        Route::put('/api/profile', [ClientProfileController::class, 'update'])->name('profile.update');
        Route::get('/api/settings', [ClientSettingsController::class, 'show'])->name('settings.show');
        Route::put('/api/settings', [ClientSettingsController::class, 'update'])->name('settings.update');
        Route::get('/api/rewards', [ClientRewardsController::class, 'index'])->name('rewards.index');
        
        // All client dashboard routes will be handled by Vue SPA
        Route::view('/{any}', 'client.app')
            ->where('any', '.*')
            ->name('app');
    });
});

// Admin Portal Login (keep as is for now)
Route::view('/admin-login', 'welcome')->name('admin.login');

// Catch-all for Admin Vue/Inertia routes (excluding API and client)
Route::view('/{any}', 'welcome')
    ->where('any', '^(?!api|client).*$');
