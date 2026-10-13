# Harvest Connect — Local Farmers' Harvest and Buyer Coordination System

**Developer:** _Your Full Name_
**Client:** _Name of the farmers' group / cooperative_ (_barangay, municipality_)
**Course:** Course 4 — React Fundamentals with Laravel as Backend (Mini Capstone)

## Theme

Farmers record their harvests and publish crop listings with quantities and prices.
Buyers browse and search listings and send purchase requests. Farmers approve or reject
requests, and cooperative officers (admins) manage accounts and monitor everything.

## Features

- Sanctum token authentication: register, login, logout, current user
- Three roles — **Admin**, **Farmer**, **Buyer** — enforced in React (hidden pages) **and** Laravel (middleware + policies)
- Full CRUD: crops (admin), harvest records, crop listings, buyer requests, users (admin)
- Search + filters (keyword, category, status) with Laravel `paginate()` shown in React
- Role-specific dashboard with database-driven figures
- Validation on both sides (React checks + Laravel Form Requests, 422 messages under each field)
- Loading spinners, success/error alerts, confirm dialogs before delete / status changes
- Request status workflow: Pending → Approved / Rejected → Completed (or Cancelled by the buyer); completing a sale deducts stock
- Responsive layout (tables turn into cards on phones)

## Tech stack

React 18 (Vite) · React Router 6 · Axios · plain CSS — Laravel 11/12 · PHP 8.2+ · Laravel Sanctum · MySQL/MariaDB

## Repository layout

```
/backend    Laravel API (built from a fresh Laravel + the files in backend-overlay, see below)
/frontend   React SPA
/docs       ERD, API docs, screenshots, slides, Postman collection
```

## Setup

### 0. One-time: create the Laravel app and apply the project files

This repository ships the **project-specific** Laravel code in `backend-overlay/`.
Create a fresh Laravel app, then copy the overlay on top of it:

```bash
composer create-project laravel/laravel backend
cd backend
php artisan install:api            # installs Laravel Sanctum + routes/api.php + token migration
cd ..
```

Copy `backend-overlay/*` into `backend/` and **overwrite when asked**:

- macOS / Linux: `cp -R backend-overlay/. backend/`
- Windows (PowerShell): `Copy-Item -Recurse -Force backend-overlay\* backend\`
- Windows (CMD): `xcopy backend-overlay backend /E /Y`

Then delete the `backend-overlay` folder (its contents now live in `backend/`) and commit.

> The overlay replaces `routes/api.php`, `bootstrap/app.php`, `app/Models/User.php`,
> `database/factories/UserFactory.php`, `database/seeders/DatabaseSeeder.php`, and `.env.example`,
> and adds the migrations, controllers, requests, resources, policies, middleware, and `config/cors.php`.

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env               # (Windows CMD: copy .env.example .env)
php artisan key:generate
# create an empty MySQL database named harvest_connect, then check DB_* values in .env
php artisan migrate --seed
php artisan serve                  # http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env               # VITE_API_URL=http://localhost:8000/api
npm run dev                        # http://localhost:5173
```

## Demo accounts (password for all: `password`)

| Role | Email |
|---|---|
| Admin | admin@harvest.test |
| Farmer | farmer@harvest.test (also maria.santos@harvest.test, …) |
| Buyer | buyer@harvest.test (also antonio.reyes@harvest.test, …) |

## Demo scenario

1. **Buyer** (Josefina Mercado) browses listings, filters by *Vegetables*, requests 20 kg of tomatoes.
2. **Farmer** (Roberto Dela Cruz) opens *Buyer Requests*, approves it, then marks it completed → stock is deducted.
3. **Buyer** sees the status change under *My Requests*.
4. **Admin** reviews the dashboard, manages the crop catalog and users.

## Documentation

- ERD: `docs/erd.png` (source in `docs/erd.md`)
- API: `docs/api-endpoints.md` and the Postman collection in `docs/`
- Screenshots: `docs/screenshots/`
- Slides: `docs/` (PDF)
- Demo video: _add link here_

## Known limitations / Phase 2 ideas

No online payments or delivery tracking. Possible Phase 2: crop photos, SMS/email notifications,
price history charts, CSV/PDF reports.

## References

List every tutorial, AI assistant, or Stack Overflow answer you used for code here.
_(AI assistance was used to scaffold parts of this project — declare it here as required.)_
