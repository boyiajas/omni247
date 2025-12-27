<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AuditController as AdminAuditController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DeviceController as AdminDeviceController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\AchievementController as AdminAchievementController;
use App\Http\Controllers\Admin\SupportTicketController as AdminSupportTicketController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\GeocodingController;
use App\Http\Controllers\Api\MediaController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\LandingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

require base_path('routes/channels.php');

// Public API routes (no authentication required)
Route::prefix('public')->group(function () {
    Route::get('/reports', [LandingController::class,  'publicNews']);
    Route::get('/stats', [LandingController::class, 'stats']);
    Route::get('/categories', [LandingController::class, 'categories']);
});

// Unauthenticated routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/anonymous', [AuthController::class, 'anonymousLogin']);

// Public categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Broadcast::routes(['middleware' => ['auth:sanctum']]);

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::get('/user/notification-settings', [AuthController::class, 'notificationSettings']);
    Route::put('/user/notification-settings', [AuthController::class, 'updateNotificationSettings']);
    Route::post('/user/complete-onboarding', [AuthController::class, 'completeOnboarding']);
    Route::get('/user/reports', [ReportController::class, 'userReports']);
    Route::get('/user/rewards', [AuthController::class, 'rewards']);
    Route::get('/user/achievements', [AuthController::class, 'achievements']);
    Route::get('/user/privacy-settings', [AuthController::class, 'getPrivacySettings']);
    Route::put('/user/privacy-settings', [AuthController::class, 'updatePrivacySettings']);

    // Reports
    Route::get('/reports', [ReportController::class, 'index']);
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/reports/nearby', [ReportController::class, 'nearby']);
    Route::get('/reports/{report}', [ReportController::class, 'show']);
    Route::put('/reports/{report}', [ReportController::class, 'update']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);
    Route::post('/reports/{report}/rate', [ReportController::class, 'rate']);

    // Comments
    Route::get('/reports/{report}/comments', [CommentController::class, 'index']);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);
    Route::get('/favorites/check/{report}', [FavoriteController::class, 'check']);

    // Media
    Route::post('/media/upload', [MediaController::class, 'upload']);
    Route::get('/media/{id}', [MediaController::class, 'show']);
    Route::delete('/media/{id}', [MediaController::class, 'destroy']);

    // Geocoding
    Route::get('/geocode', [GeocodingController::class, 'geocode']);
    Route::get('/geocode/reverse', [GeocodingController::class, 'reverse']);

    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::post('/alerts/dismiss', [AlertController::class, 'dismiss']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/notifications/register-device', [NotificationController::class, 'registerDevice']);

    // User's own support tickets
    Route::get('/support-tickets', [\App\Http\Controllers\Api\SupportTicketController::class, 'index']);
    Route::get('/support-tickets/{id}', [\App\Http\Controllers\Api\SupportTicketController::class, 'show']);
});

// Public support ticket submission (no auth required)
Route::post('/support-tickets', [\App\Http\Controllers\Api\SupportTicketController::class, 'store']);

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/overview', [AdminDashboardController::class, 'overview']);
        Route::get('/reports/timeline', [AdminDashboardController::class, 'reportTimeline']);
        Route::get('/reports/map', [AdminDashboardController::class, 'mapFeed']);

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::post('/users', [AdminUserController::class, 'store']);
        Route::get('/users/{user}', [AdminUserController::class, 'show']);
        Route::put('/users/{user}', [AdminUserController::class, 'update']);
        Route::post('/users/{user}/status', [AdminUserController::class, 'updateStatus']);
        Route::post('/users/{user}/role', [AdminUserController::class, 'updateRole']);

        Route::get('/roles', [AdminRoleController::class, 'index']);
        Route::post('/roles', [AdminRoleController::class, 'store']);
        Route::put('/roles/{role}', [AdminRoleController::class, 'update']);
        Route::delete('/roles/{role}', [AdminRoleController::class, 'destroy']);

        Route::get('/reports', [AdminReportController::class, 'index']);
        Route::get('/reports/{report}', [AdminReportController::class, 'show']);
        Route::post('/reports/{report}/moderate', [AdminReportController::class, 'moderate']);
        Route::delete('/reports/{report}', [AdminReportController::class, 'destroy']);

        Route::get('/support-tickets', [AdminSupportTicketController::class, 'index']);
        Route::get('/support-tickets/stats', [AdminSupportTicketController::class, 'stats']);
        Route::get('/support-tickets/{id}', [AdminSupportTicketController::class, 'show']);
        Route::put('/support-tickets/{id}', [AdminSupportTicketController::class, 'update']);
        Route::delete('/support-tickets/{id}', [AdminSupportTicketController::class, 'destroy']);

        Route::get('/devices', [AdminDeviceController::class, 'index']);
        Route::delete('/devices/{id}', [AdminDeviceController::class, 'destroy']);
        Route::get('/audits', [AdminAuditController::class, 'index']);

        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{category}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy']);

        Route::get('/achievements', [AdminAchievementController::class, 'index']);
        Route::post('/achievements', [AdminAchievementController::class, 'store']);
        Route::get('/achievements/{achievement}', [AdminAchievementController::class, 'show']);
        Route::put('/achievements/{achievement}', [AdminAchievementController::class, 'update']);
        Route::delete('/achievements/{achievement}', [AdminAchievementController::class, 'destroy']);

        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::post('/settings', [AdminSettingsController::class, 'store']);
        Route::get('/settings/{key}', [AdminSettingsController::class, 'show']);
        Route::put('/settings/{key}', [AdminSettingsController::class, 'update']);
        Route::delete('/settings/{key}', [AdminSettingsController::class, 'destroy']);
    });
});
