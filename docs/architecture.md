# ACME Salary Management — Architecture

## Overview

The system is a three-tier web application: a React SPA frontend, a Node.js REST API backend, and a PostgreSQL relational database. Frontend and backend live in separate GitHub repositories and are deployed independently.

```
Browser (React SPA)
       │ HTTPS / REST JSON
       ▼
Node.js API (Render)
       │ SQL / pg
       ▼
PostgreSQL (Render managed DB)
```

---

## Frontend Architecture

**Stack:** React 18 + TypeScript + Vite

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | React 18 | Required by spec |
| Language | TypeScript | Required by spec |
| Build tool | Vite | Fast dev server; lightweight |
| Routing | React Router v6 | Standard SPA routing |
| State management | React Query (TanStack Query) | Server-state caching, pagination, background refresh |
| Forms | React Hook Form + Zod | Lightweight; schema-based client validation |
| HTTP client | Axios with interceptors | Centralised auth header injection; token refresh |
| Component library | shadcn/ui (Radix + Tailwind) | Accessible, composable; avoids heavyweight MUI |
| Charts | Recharts | Lightweight; composable |
| Testing | Vitest + React Testing Library | Fast; first-class TypeScript |
| Deployment | Vercel | Required by spec |

### Page Map

```
/ ──────────────────── Login
/dashboard ─────────── Analytics Dashboard
/employees ─────────── Employee List (paginated, searchable, filterable)
/employees/:id ──────── Employee Detail
/employees/:id/salary ─ Salary History + Update Form
```

### Pagination Pattern

- React Query manages cursor/page-based pagination state.
- Query params (`?page=1&pageSize=25&search=…&department=…&country=…`) are reflected in the URL via `useSearchParams`.
- Never fetch all 10,000 employees; always paginate.

### Authentication Flow

1. `POST /auth/login` → receives `{ accessToken }` in body; `refreshToken` set as HTTP-only cookie by server.
2. Access token stored in memory (React state / Zustand store) — **not** localStorage.
3. Axios request interceptor attaches `Authorization: Bearer <token>` header.
4. Axios response interceptor catches 401, calls `POST /auth/refresh`, retries original request.
5. On logout, `POST /auth/logout` clears server-side refresh token cookie.

---

## Backend Architecture

**Stack:** Node.js + Express + TypeScript

```
src/
├── config/          # env, db pool, logger
├── middleware/       # auth, validation, error handler
├── modules/
│   ├── auth/        # login, refresh, logout
│   ├── employees/   # CRUD, search, filter
│   ├── salaries/    # salary records, history
│   └── analytics/   # aggregate queries
├── db/
│   ├── migrations/  # sequential SQL migrations
│   └── seeds/       # development seed data
├── utils/           # currency, pagination helpers
└── app.ts           # Express app assembly
```

### Key Design Decisions

| Concern | Decision |
|---------|----------|
| Framework | Express (minimal, familiar) |
| DB driver | `pg` (node-postgres) + connection pool |
| Validation | Zod on all request bodies and query params |
| Auth | JWT (`jsonwebtoken`); access token 15 min TTL; refresh token 7 days, HTTP-only cookie |
| Migrations | `node-pg-migrate` — SQL files, sequential, committed to Git |
| Logging | `pino` structured JSON logging; no PII in log lines |
| Error handling | Centralised Express error handler; always returns `{ error: string }` |
| Testing | Jest + Supertest for integration tests against a test database |
| Linting | ESLint + Prettier |

### Request Lifecycle

```
Request → Auth Middleware → Zod Validation → Route Handler → Service → DB Query → Response
                                              ↓ error
                                         Error Handler → { error: "..." }
```

---

## Database Architecture

**Engine:** PostgreSQL 15

### Schema

```sql
-- Users (HR Managers)
users
  id            UUID PK
  email         TEXT UNIQUE NOT NULL
  password_hash TEXT NOT NULL
  name          TEXT NOT NULL
  role          TEXT NOT NULL DEFAULT 'hr_manager'
  created_at    TIMESTAMPTZ DEFAULT now()

-- Reference tables
departments
  id    UUID PK
  name  TEXT UNIQUE NOT NULL

countries
  id            UUID PK
  name          TEXT NOT NULL
  code          CHAR(2) UNIQUE NOT NULL  -- ISO 3166-1 alpha-2
  currency_code CHAR(3) NOT NULL          -- ISO 4217

-- Core
employees
  id            UUID PK
  employee_no   TEXT UNIQUE NOT NULL
  first_name    TEXT NOT NULL
  last_name     TEXT NOT NULL
  email         TEXT UNIQUE NOT NULL
  department_id UUID FK → departments
  country_id    UUID FK → countries
  status        TEXT NOT NULL DEFAULT 'active'  -- active | inactive
  hire_date     DATE NOT NULL
  created_at    TIMESTAMPTZ DEFAULT now()
  updated_at    TIMESTAMPTZ DEFAULT now()

salary_records
  id              UUID PK
  employee_id     UUID FK → employees
  amount          NUMERIC(15,2) NOT NULL
  currency_code   CHAR(3) NOT NULL
  pay_frequency   TEXT NOT NULL  -- monthly | annual
  grade           TEXT           -- optional pay band
  effective_date  DATE NOT NULL
  reason          TEXT NOT NULL
  notes           TEXT
  changed_by      UUID FK → users
  created_at      TIMESTAMPTZ DEFAULT now()
  -- NO updates or deletes; append-only

refresh_tokens
  id          UUID PK
  user_id     UUID FK → users
  token_hash  TEXT UNIQUE NOT NULL
  expires_at  TIMESTAMPTZ NOT NULL
  created_at  TIMESTAMPTZ DEFAULT now()

exchange_rates
  from_currency  CHAR(3) NOT NULL
  to_currency    CHAR(3) NOT NULL
  rate           NUMERIC(18,6) NOT NULL
  effective_date DATE NOT NULL
  PRIMARY KEY (from_currency, to_currency, effective_date)
```

### Indexes

```sql
-- Employees list: search + filter
CREATE INDEX idx_employees_last_name  ON employees (last_name);
CREATE INDEX idx_employees_department ON employees (department_id);
CREATE INDEX idx_employees_country    ON employees (country_id);
CREATE INDEX idx_employees_status     ON employees (status);

-- Salary history per employee
CREATE INDEX idx_salary_employee ON salary_records (employee_id, effective_date DESC);
```

### Data Integrity Rules

- `salary_records` is append-only. No `UPDATE` or `DELETE` is issued by the application; enforced by code convention and DB-level permissions if required.
- `employees.updated_at` is maintained via a trigger.
- All foreign keys have `ON DELETE RESTRICT`.

### Salary History — Deriving Old and New Amounts

The `salary_records` table stores only the **new amount** at the time of each change. The "old amount" (previous salary) is **not stored as a column**; it is derived at query time using a SQL window function:

```sql
SELECT
  id,
  employee_id,
  amount                                                        AS new_amount,
  LAG(amount) OVER (
    PARTITION BY employee_id
    ORDER BY effective_date ASC, created_at ASC
  )                                                             AS old_amount,
  effective_date,
  reason,
  notes,
  changed_by,
  created_at
FROM salary_records
WHERE employee_id = $1
ORDER BY effective_date DESC, created_at DESC;
```

The first salary record for an employee will have `old_amount = NULL` (no prior record exists). The API and UI must handle this case gracefully (e.g. display "—" or "Initial salary").

---

## API Architecture

**Base URL:**

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3000/api/v1` |
| Production | Configured via `API_BASE_URL` environment variable (e.g. the Render service URL) |

The frontend reads the base URL from `VITE_API_BASE_URL` at build time. Neither the backend service URL nor any environment-specific domain is hardcoded in source code.

**Response envelope:**

```json
// Success (list)
{ "data": [...], "meta": { "page": 1, "pageSize": 25, "total": 10000 } }

// Success (single)
{ "data": { ... } }

// Error
{ "error": "Human-readable message", "details": { ... } }
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Authenticate HR manager |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Invalidate refresh token |
| GET | `/employees` | List employees (paginated, filterable) |
| GET | `/employees/:id` | Get single employee |
| GET | `/employees/:id/salary` | Current salary record |
| POST | `/employees/:id/salary` | Create new salary record (update) |
| GET | `/employees/:id/salary/history` | Full salary history |
| GET | `/analytics/summary` | Aggregate statistics |
| GET | `/analytics/export` | CSV export (streamed) |
| GET | `/departments` | List all departments |
| GET | `/countries` | List all countries |

### Pagination Query Params

All list endpoints accept:
- `page` (default 1)
- `pageSize` (default 25, max 100)
- `sortBy`, `sortOrder` (asc/desc)
- Endpoint-specific filters: `search`, `department`, `country`, `status`

---

## Authentication

- **Mechanism:** JWT (RS256 or HS256 with strong secret)
- **Access token TTL:** 15 minutes (in-memory on client)
- **Refresh token TTL:** 7 days (HTTP-only, Secure, SameSite=Strict cookie)
- **Refresh token storage:** Hashed in `refresh_tokens` table; invalidated on logout
- **Protected routes:** All `/employees`, `/analytics` routes require `Authorization: Bearer` header
- **Public routes:** `/auth/login`, `/auth/refresh`

---

## Pagination

All list responses follow offset pagination for v1 (simpler to implement, sufficient for 10,000 rows):

```
GET /employees?page=2&pageSize=25&search=smith&department=Engineering
```

Response includes `meta.total` to allow the UI to render page controls. Cursor-based pagination can be adopted in v2 if needed.

---

## Analytics

Analytics queries run as **server-side SQL aggregations** — never load rows into application memory and aggregate in JavaScript.

Key queries:
- `COUNT(*), SUM(current_salary_usd)` grouped by `department` and `country`.
- Median salary uses PostgreSQL `PERCENTILE_CONT(0.5)` aggregate.
- "Current salary" is the latest `salary_records` row per employee, ordered by `effective_date DESC, created_at DESC`. The secondary `created_at DESC` sort is the tie-breaker when two records share the same effective date, ensuring deterministic results.
- All amounts converted to USD using `exchange_rates` before aggregation.

---

## Currency Handling

- Salaries are stored in the employee's local currency (from `countries.currency_code`).
- Analytics normalise amounts to USD via the `exchange_rates` table.
- Exchange rates are loaded manually (e.g., monthly) and kept as static reference data.
- The frontend displays amounts with the ISO currency code (e.g., "₹85,000 INR").
- No live FX API integration in v1.

---

## Testing Strategy

### Backend

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest | Service functions, validators, currency helpers |
| Integration | Jest + Supertest | Full HTTP request → DB round-trip against test DB |
| Coverage target | — | ≥ 80% on services and routes |

### Frontend

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest + RTL | Components, hooks, form validation |
| E2E | Playwright | Critical paths: login, employee search, salary update |
| Coverage target | — | Critical paths covered; no vanity metrics |

### Test Database

- A separate PostgreSQL database is used for integration tests.
- Migrations are applied before tests; DB is reset between test suites.

---

## Deployment

### Backend (Render)

- GitHub → Render Web Service (auto-deploy on `main` branch push).
- Environment variables managed in Render dashboard (never committed).
- Database: Render managed PostgreSQL.
- Migrations run via a `render` build command: `npm run migrate`.
- Health check endpoint: `GET /health`.

### Frontend (Vercel)

- GitHub → Vercel Project (auto-deploy on `main` branch push).
- Environment variables: `VITE_API_BASE_URL` set per environment.
- Preview deployments on pull requests.
- SPA routing: `vercel.json` rewrites all paths to `index.html`.

### CI (GitHub Actions)

```
On PR:
  - Lint
  - Type-check
  - Unit tests
  - Integration tests (Docker PostgreSQL)

On merge to main:
  - All of the above
  - Auto-deploy via Render/Vercel webhook
```
