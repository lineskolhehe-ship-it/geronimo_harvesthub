# API Endpoints

Base URL: `http://localhost:8000/api` — all protected routes need `Authorization: Bearer <token>`.
Send `Accept: application/json` on every request.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/register` | Public | Create a farmer or buyer account (returns token) |
| POST | `/login` | Public | Log in (returns token) |
| POST | `/logout` | Auth | Revoke current token (204) |
| GET | `/user` | Auth | Current user |
| GET | `/dashboard` | Auth | Role-specific summary figures |
| GET | `/crops?search=&category=&page=&all=` | Auth | List crop catalog |
| GET | `/crops/{id}` | Auth | View one crop |
| POST / PUT / DELETE | `/crops`, `/crops/{id}` | Admin | Manage crop catalog |
| GET | `/users?search=&role=&page=` | Admin | List users |
| POST / GET / PUT / DELETE | `/users`, `/users/{id}` | Admin | Manage users |
| GET | `/harvest-records?search=&status=&page=&all=` | Farmer (own) / Admin (all) | List harvest records |
| POST | `/harvest-records` | Farmer | Create |
| GET / PUT / DELETE | `/harvest-records/{id}` | Owner / Admin | View, update, delete |
| GET | `/crop-listings?search=&category=&status=&mine=&page=` | Auth | Browse listings (buyers see available only by default) |
| POST | `/crop-listings` | Farmer | Create |
| GET | `/crop-listings/{id}` | Auth | View one |
| PUT / DELETE | `/crop-listings/{id}` | Owner / Admin | Update, delete |
| GET | `/buyer-requests?search=&status=&page=` | Auth | Buyer: own · Farmer: for own listings · Admin: all |
| POST | `/buyer-requests` | Buyer | Submit a purchase request |
| GET | `/buyer-requests/{id}` | Buyer / listing farmer / Admin | View one |
| PUT | `/buyer-requests/{id}` | Buyer (own, pending) | Edit quantity/message |
| DELETE | `/buyer-requests/{id}` | Buyer (own, pending) / Admin | Delete |
| PATCH | `/buyer-requests/{id}/status` | Role-based | Change status (see workflow) |

## Request status workflow

| From | To | Who |
|---|---|---|
| pending | approved / rejected | Farmer (own listing) or Admin |
| approved | completed | Farmer (own listing) or Admin — deducts stock from the listing |
| pending | cancelled | Buyer (own request) |

Any other move returns **422**.

## Status codes used

200 OK · 201 Created · 204 No Content · 401 Unauthenticated · 403 Forbidden · 404 Not Found · 422 Validation error
