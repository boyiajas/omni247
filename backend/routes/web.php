<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\LandingController;

// Landing page
Route::get('/', [LandingController::class, 'index'])->name('landing');

// Portal login pages
Route::view('/client-login', 'welcome')->name('client.login');
Route::view('/admin-login', 'welcome')->name('admin.login');

// Catch-all for Vue/Inertia routes (excluding API)
Route::view('/{any}', 'welcome')
    ->where('any', '^(?!api).*$');
