# G-iReport Laravel Backend

Backend API for the G-iReport React Native mobile application.

## Features

- ✅ RESTful API with Laravel 11
- ✅ Real-time broadcasting with Laravel Reverb
- ✅ Event-driven architecture with queues
- ✅ Geolocation-based report search
- ✅ Media upload & verification
- ✅ Points & rewards system
- ✅ Push notifications
- ✅ Authentication with Laravel Sanctum
- ✅ Vue 3 admin dashboard to manage users, roles, categories, reports, devices, audits, and a live operations map

## Requirements

- PHP 8.2+
- Composer
- PostgreSQL 15+
- Redis 7+
- Node.js 18+ (for Reverb)

## Installation

```bash
# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run migrations & seed base data (roles, demo users, categories)
php artisan migrate --seed

# Install dashboard dependencies
cd backend && npm install

# Run dev servers (from backend/)
npm run dev   # Vite (Vue dashboard)
php artisan serve
```

### Default dashboard accounts

Seeders provision three ready-to-use logins (all passwords are `password`):

- `admin@omni247.com`
- `moderator@omni247.com`
- `agency@omni247.com`

## Admin Dashboard

The new Vue 3 SPA mirrors the CricBook Pro look & feel and includes:

- Command overview (reports, active users, agency accounts, reward points) with status charts.
- Live report feed, device statistics, category highlights, and audit timeline.
- Full CRUD for users (status/role updates), roles, and moderation actions.
- Device registry tied to the React Native clients and an audit trail for compliance.
- Operations map powered by Google Maps (uses `GOOGLE_MAPS_API_KEY` from your existing React Native `.env` files or `VITE_GOOGLE_MAPS_KEY` in `backend/.env`).

Key admin endpoints:

- `POST /api/admin/login` / `POST /api/admin/logout`
- `GET /api/admin/overview`
- `GET /api/admin/users`, `POST /api/admin/users/{id}/status`, `POST /api/admin/users/{id}/role`
- `GET|POST|PUT|DELETE /api/admin/categories`
- `GET /api/admin/reports`, `POST /api/admin/reports/{report}/moderate`
- `GET /api/admin/devices`
- `GET /api/admin/audits`
- `GET|POST|PUT|DELETE /api/admin/roles`
- `GET /api/admin/reports/map`

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/anonymous` - Anonymous session
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user
- `PUT /api/user` - Update profile

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/nearby` - Get nearby reports
- `GET /api/reports/{id}` - Get report details
- `PUT /api/reports/{id}` - Update report
- `DELETE /api/reports/{id}` - Delete report
- `POST /api/reports/{id}/rate` - Rate a report

### Media
- `POST /api/media/upload` - Upload media
- `GET /api/media/{id}` - Get media
- `DELETE /api/media/{id}` - Delete media

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Unread count
- `PUT /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `POST /api/notifications/register-device` - Register/update a user's device fingerprint

### Categories
- `GET /api/categories` - List categories

## Broadcasting Channels

- `private-user.{userId}` - User notifications
- `presence-report.{reportId}` - Report updates
- `incidents` - Global incident feed
- `location.{gridX}.{gridY}` - Location-based updates
- `emergency-alerts` - Emergency broadcasts

## Queue Jobs

- `ModerateReportJob` - AI content moderation
- `VerifyMediaJob` - Mediaverification & deepfake detection
- `SendNotificationJob` - Push notification delivery

## License

MIT
