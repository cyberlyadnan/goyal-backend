# Goyal Wholesale API

Production-ready **TypeScript** backend starter for a B2B Wholesale Ordering Platform (FMCG distributors).

This repository contains the enterprise architecture, security baseline, and feature-module scaffolds only. **Business logic is intentionally not implemented yet.**

## Tech Stack

- Node.js (LTS) + Express.js
- TypeScript (ES Modules)
- MongoDB + Mongoose
- JWT Authentication
- Winston logging
- Swagger (OpenAPI 3)
- Razorpay / Cloudinary / Firebase (config + service stubs)
- Helmet, CORS, Rate Limiting, Input Sanitization

## Project Structure

```text
backend/
├── src/
│   ├── config/           # App, DB, JWT, Razorpay, Cloudinary, Firebase, Swagger, env
│   ├── constants/        # HTTP status, roles, messages, order/payment enums
│   ├── database/         # MongoDB connection + graceful shutdown
│   ├── helpers/          # Pagination, search, filter, sort, JWT, OTP, password
│   ├── middleware/       # Auth, roles, validate, rate limit, sanitize, errors
│   ├── modules/          # Feature-based modules (auth, products, orders, ...)
│   │   └── <feature>/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── models/
│   │       ├── routes/
│   │       └── validators/
│   ├── routes/           # API router aggregation
│   ├── services/         # Shared integrations (Cloudinary, Razorpay, Firebase)
│   ├── utils/            # ApiResponse, ApiError, catchAsync, logger
│   ├── validations/      # Cross-module validators
│   ├── jobs/             # Background job stubs
│   ├── sockets/          # Realtime stubs
│   ├── events/           # Domain event stubs
│   ├── uploads/          # Local upload staging
│   ├── logs/             # Winston log files
│   ├── types/            # Shared TypeScript types
│   ├── app.ts            # Express app factory
│   └── server.ts         # Process entry + graceful shutdown
├── .env.example
├── eslint.config.js
├── tsconfig.json
└── package.json
```

## Architecture

Feature-based modular architecture:

| Layer | Responsibility |
| --- | --- |
| **Routes** | HTTP paths, middleware wiring, Swagger annotations |
| **Controllers** | Thin request/response adapters |
| **Services** | Business logic (to be implemented per feature) |
| **Repositories** | MongoDB / Mongoose data access |
| **Models** | Schemas & persistence models |
| **Validators** | `express-validator` chains |

Dependency flow:

```text
Route → Controller → Service → Repository → MongoDB
```

Shared cross-cutting concerns live under `config/`, `middleware/`, `helpers/`, `utils/`, and `services/`.

## Response Format

Success:

```json
{
  "success": true,
  "message": "",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

## Environment Variables

Copy `.env.example` to `.env` and fill values:

| Variable | Description |
| --- | --- |
| `PORT` | HTTP port (default `5000`) |
| `NODE_ENV` | `development` \| `production` \| `test` |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token secret |
| `JWT_EXPIRE` | Access token TTL (e.g. `7d`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay credentials |
| `CLOUDINARY_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary |
| `FIREBASE_PROJECT_ID` | FCM / Firebase project |

Additional optional vars are documented in `.env.example` (`CORS_ORIGIN`, rate limits, refresh tokens, etc.).

## How to Run

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start with Nodemon + `tsx` (hot reload) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled `dist/server.js` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |

API base: `http://localhost:5000/api/v1`  
Swagger UI: `http://localhost:5000/api-docs`  
Health: `GET /api/v1/health`

Each module also exposes a scaffold health route, e.g. `GET /api/v1/products/health`.

## Security Baseline

- Helmet
- CORS
- Rate limiting
- Request size limits
- NoSQL injection sanitization (`express-mongo-sanitize`)
- XSS sanitization (`xss-clean`)
- JWT auth + role middleware (ready for use)

## Logging

Winston writes:

- `src/logs/error.log`
- `src/logs/combined.log`
- Colored console output in development

## Coding Guidelines

1. Use **TypeScript** + **ES Modules** (`import` / `export`). Prefer `async/await` — no callback style.
2. Keep **controllers thin**. Put business rules in **services**.
3. Put all MongoDB queries in **repositories**.
4. Throw `ApiError` for operational failures; return via `ApiResponse`.
5. Wrap async handlers with `catchAsync`.
6. Validate inputs with module `validators/` + `validate` middleware.
7. Read configuration from `src/config` — do not scatter `process.env` reads.
8. Prefer constructor injection on service/repository classes for testability.
9. Do not duplicate helpers — extend `helpers/` / `utils/` instead.
10. Add Swagger JSDoc on every new public route.

## Next Steps

Implement features module-by-module (suggested order):

1. `auth` + `users`
2. `retailers` / `brands` / `categories` / `products`
3. `cart` → `orders` → `payments`
4. `notifications`, `banners`, `offers`, `dashboard`
