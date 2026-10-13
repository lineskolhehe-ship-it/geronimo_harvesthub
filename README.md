# Harvest Connect — Local Farmers' Harvest and Buyer Coordination System

**Developer:** Lenin Geronimo
**Client:** FarmniBai (farmers' group), Barangay Pooc Oriental, Municipality of Tubigon
**Course:** Course 4 — React Fundamentals with Laravel as Backend (Mini Capstone)

## Theme and client

FarmniBai is a farmers' group in Barangay Pooc Oriental, Tubigon. Recording harvests, tracking
which crops are available and at what price, and handling buyers' purchase requests are hard to
manage without one shared system. Harvest Connect gives the group a single place where farmers
record harvests and publish crop listings, buyers search listings and send purchase requests,
and group officers (admins) manage accounts and monitor activity.

## Features

- Laravel Sanctum token authentication: register, login, logout, current user
- Three roles — **Admin**, **Farmer**, **Buyer** — enforced in React (hidden pages) and in Laravel (middleware + policies)
- Full CRUD: crops (admin), harvest records, crop listings, buyer requests, users (admin)
- Search and filters (keyword, category, status) with Laravel `paginate()` displayed in React
- Role-specific dashboard with figures calculated from the database
- Validation on both sides: React form checks and Laravel Form Requests (422 errors shown under each field)
- Loading spinners, success and error messages, and a confirm step before deleting or changing a status
- Buyer request workflow: Pending → Approved / Rejected → Completed (or Cancelled by the buyer);
  completing a sale deducts the quantity from the listing
- Responsive layout (tables turn into cards on phone screens)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Vite), React Router 6, Axios, plain CSS |
| Backend | Laravel 12, PHP 8.2+, Laravel Sanctum |
| Database | MySQL / MariaDB |
| Tools | Git + GitHub, Postman, Composer, npm |

## Repository layout

```
/backend    Laravel REST API
/frontend   React single-page app
/docs       ERD, Postman collection, screenshots, slides
```

## Setup (fresh clone)

Requirements: PHP 8.2+, Composer, Node.js 18+, MySQL/MariaDB (for example XAMPP or Laragon).

### 1. Get the code

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Backend

Create an empty MySQL database named `harvest_connect`, then:

```bash
cd backend
composer install
cp .env.example .env        # Windows CMD: copy .env.example .env
php artisan key:generate
```

Open `backend/.env` and check the database settings match your MySQL setup:

```
DB_DATABASE=harvest_connect
DB_USERNAME=root
DB_PASSWORD=
```

Then create the tables, load the sample data, and start the API:

```bash
php artisan migrate --seed
php artisan serve           # http://localhost:8000
```

### 3. Frontend (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env        # Windows CMD: copy .env.example .env
npm run dev                 # http://localhost:5173
```

Open http://localhost:5173 and log in with a demo account.

## Demo accounts (password for all: `password`)

| Role | Email |
|---|---|
| Admin | admin@harvest.test |
| Farmer | farmer@harvest.test |
| Buyer | buyer@harvest.test |

More seeded farmers and buyers use the same password (see `backend/database/seeders/DatabaseSeeder.php`).

## Demo scenario

1. **Buyer** (Josefina Mercado) browses the listings, filters by *Vegetables*, and requests some tomatoes.
2. **Farmer** (Roberto Dela Cruz) opens *Buyer Requests*, approves the request, then marks it completed.
   The quantity is deducted from the listing.
3. **Buyer** sees the new status under *My Requests*.
4. **Admin** reviews the dashboard and manages the crop catalog and user accounts.

## API endpoints

Base URL: `http://localhost:8000/api`. Protected routes need the header
`Authorization: Bearer <token>`. Send `Accept: application/json` on every request.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Create a farmer or buyer account (returns token) |
| POST | `/login` | Public | Log in (returns token) |
| POST | `/logout` | Auth | Revoke the current token |
| GET | `/user` | Auth | Current user |
| GET | `/dashboard` | Auth | Role-specific summary figures |
| GET | `/crops?search=&category=&page=` | Auth | List the crop catalog |
| GET | `/crops/{id}` | Auth | View one crop |
| POST | `/crops` | Admin | Create a crop |
| PUT | `/crops/{id}` | Admin | Update a crop |
| DELETE | `/crops/{id}` | Admin | Delete a crop |
| GET | `/users?search=&role=&page=` | Admin | List users |
| POST | `/users` | Admin | Create a user |
| GET | `/users/{id}` | Admin | View one user |
| PUT | `/users/{id}` | Admin | Update a user |
| DELETE | `/users/{id}` | Admin | Delete a user |
| GET | `/harvest-records?search=&status=&page=` | Farmer (own) / Admin (all) | List harvest records |
| POST | `/harvest-records` | Farmer | Create a harvest record |
| GET | `/harvest-records/{id}` | Owner / Admin | View one |
| PUT | `/harvest-records/{id}` | Owner / Admin | Update |
| DELETE | `/harvest-records/{id}` | Owner / Admin | Delete |
| GET | `/crop-listings?search=&category=&status=&mine=&page=` | Auth | Browse listings (buyers see available only by default) |
| POST | `/crop-listings` | Farmer | Create a listing |
| GET | `/crop-listings/{id}` | Auth | View one |
| PUT | `/crop-listings/{id}` | Owner / Admin | Update |
| DELETE | `/crop-listings/{id}` | Owner / Admin | Delete |
| GET | `/buyer-requests?search=&status=&page=` | Auth | Buyer: own. Farmer: for own listings. Admin: all |
| POST | `/buyer-requests` | Buyer | Submit a purchase request |
| GET | `/buyer-requests/{id}` | Buyer / listing farmer / Admin | View one |
| PUT | `/buyer-requests/{id}` | Buyer (own, pending) | Edit quantity or message |
| DELETE | `/buyer-requests/{id}` | Buyer (own, pending) / Admin | Delete |
| PATCH | `/buyer-requests/{id}/status` | Role-based (see below) | Change the request status |

### Request status workflow

| From | To | Who |
|---|---|---|
| pending | approved or rejected | Farmer (own listing) or Admin |
| approved | completed | Farmer (own listing) or Admin — deducts the quantity from the listing |
| pending | cancelled | Buyer (own request) |

Any other change returns HTTP 422.

### Status codes used

200 OK · 201 Created · 204 No Content · 401 Unauthenticated · 403 Forbidden · 404 Not Found · 422 Validation error

## Documentation

- ERD: `docs/erd.png`
- API collection: `docs/harvest-connect.postman_collection.json`
- Screenshots: `docs/screenshots/`
- Presentation slides (PDF): `docs/`
- Demo video: _add the link here_

## Known limitations and Phase 2 ideas

The first version has no online payments, delivery tracking, or notifications. Possible Phase 2
features: crop photos, SMS or email notifications, price history charts, and CSV or PDF reports.

## References

**AI assistance:** I used Claude (an AI assistant made by Anthropic) while building this project.
It generated the initial code for the Laravel migrations, models, policies, controllers, Form
Requests, API Resources, seeders and factories, the React components and pages, the stylesheet,
and the ERD image. I then ran the project, tested it, and modified it myself.

Other sources:
- Laravel documentation (https://laravel.com/docs) — routing, validation, Eloquent, API Resources
- Laravel Sanctum documentation (https://laravel.com/docs/sanctum) — API token authentication
- React documentation (https://react.dev) and React Router documentation (https://reactrouter.com)
- Axios documentation (https://axios-http.com)

_Add any other tutorials, videos, or Stack Overflow answers you used here._
