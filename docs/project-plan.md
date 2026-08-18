# ACME Salary Management — Project Plan

## Overview

Work is split between a **backend developer** and a **frontend developer**. The sequencing follows this fixed order:

```
Requirements → Architecture → API Contract → Backend API → Frontend integration
```

The API contract (OpenAPI spec) is produced jointly at the end of Phase 0 and must be agreed before any integration work begins. The frontend developer may build layout, component shells, and mock-data pages in parallel with backend Phases 1–5, but **no frontend integration phase starts until the API contract for that feature is finalised**.

Each phase produces a working, committed, and tested increment.

> **Rule:** No phase starts until the previous phase passes its verification gate.

---

## Phase 0 — Project Setup
*Both developers in parallel. ~1 day.*

### Backend Developer

| Task | Detail |
|------|--------|
| B0-1 | Initialise `acme-salary-backend` repo with TypeScript + Express skeleton |
| B0-2 | Configure `tsconfig.json`, `eslint`, `prettier`, `.env.example` |
| B0-3 | Set up `pino` logger and centralised error handler middleware |
| B0-4 | Configure Jest + Supertest test runner with a test PostgreSQL DB |
| B0-5 | Create GitHub Actions CI: lint → typecheck → test |
| B0-6 | Set up `node-pg-migrate` and create migration runner script |
| B0-7 | Create `GET /health` endpoint |
| B0-8 | Connect Render deployment; verify health check is green |
| B0-9 | **Draft `docs/api-contract.md` (or `openapi.yaml`)** — all endpoints, request/response shapes, error codes; reviewed and signed off by both developers before Phase 6 starts |

### Frontend Developer

| Task | Detail |
|------|--------|
| F0-1 | Initialise `acme-salary-frontend` repo with Vite + React 18 + TypeScript |
| F0-2 | Configure `tsconfig.json`, `eslint`, `prettier`, `tailwind.css` |
| F0-3 | Install and configure shadcn/ui base components |
| F0-4 | Set up TanStack Query, React Router v6, Axios, Zustand |
| F0-5 | Set up Vitest + React Testing Library |
| F0-6 | Create GitHub Actions CI: lint → typecheck → test |
| F0-7 | Create placeholder page routes (Login, Employees, Dashboard) with mock data |
| F0-8 | Connect Vercel deployment; verify placeholder renders |

> **Note:** The frontend developer may build component shells and static layouts during Phases 1–5 using mock data. Integration against the real API must not begin until the API contract (B0-9) is finalised.

**Verification gate:** Both repos build, lint, and test with no errors. CI is green. Both deployments are live. API contract (`docs/api-contract.md` or `openapi.yaml`) is committed and agreed by both developers.

---

## Phase 1 — Database Schema & Migrations
*Backend developer. ~1 day.*

| Task | Detail |
|------|--------|
| B1-1 | Migration: create `departments` and `countries` tables |
| B1-2 | Migration: create `users` table (HR managers) |
| B1-3 | Migration: create `employees` table with FK references |
| B1-4 | Migration: create `salary_records` table (append-only) |
| B1-5 | Migration: create `refresh_tokens` table |
| B1-6 | Migration: create `exchange_rates` table |
| B1-7 | Migration: add all required indexes (see architecture doc) |
| B1-8 | Seed script: insert departments, countries, exchange rates, 1 test HR user |
| B1-9 | Seed script: generate 10,000 synthetic employees with salary records |
| B1-10 | Verify: run migrations + seeds against local DB; confirm row counts |

**Verification gate:** `npm run migrate && npm run seed` succeeds. Tables, indexes, and seed data are correct. Schema matches the architecture document.

---

## Phase 2 — Authentication API
*Backend developer. ~1–2 days.*

| Task | Detail |
|------|--------|
| B2-1 | Implement `POST /auth/login` — validate credentials, return access token + set refresh cookie |
| B2-2 | Implement `POST /auth/refresh` — validate refresh token cookie, issue new access token |
| B2-3 | Implement `POST /auth/logout` — invalidate refresh token in DB, clear cookie |
| B2-4 | Implement JWT auth middleware — verify Bearer token, attach `req.user` |
| B2-5 | Write integration tests: login happy path, wrong password, token refresh, logout |
| B2-6 | Write unit tests: JWT validation edge cases, expired token |

**Verification gate:** All auth tests pass. CI is green. Postman/curl can complete full login → refresh → logout cycle.

---

## Phase 3 — Employee API
*Backend developer. ~2 days.*

| Task | Detail |
|------|--------|
| B3-1 | Implement `GET /employees` — paginated, with search (name/employee_no), filter (dept, country, status), sort |
| B3-2 | Implement `GET /employees/:id` — single employee with current salary |
| B3-3 | Zod schemas for all query params; validate page, pageSize, sortBy |
| B3-4 | Enforce `pageSize` max of 100 |
| B3-5 | Integration tests: pagination, search, filter, 404 for unknown employee |
| B3-6 | Manual verification: `GET /employees?page=1&pageSize=25` returns correct structure |
| B3-7 | Implement `GET /departments` and `GET /countries` reference endpoints |

**Verification gate:** All employee endpoint tests pass. Pagination meta (`page`, `pageSize`, `total`) is correct. Search and filter reduce results correctly.

---

## Phase 4 — Salary API
*Backend developer. ~2 days.*

| Task | Detail |
|------|--------|
| B4-1 | Implement `GET /employees/:id/salary` — returns current salary record |
| B4-2 | Implement `POST /employees/:id/salary` — validates and inserts new salary record; records `changed_by` from JWT |
| B4-3 | Implement `GET /employees/:id/salary/history` — paginated list of all salary records for employee |
| B4-4 | Zod validation: amount > 0, valid currency_code, valid pay_frequency, effective_date not in future |
| B4-5 | Integration tests: create salary, fetch current, history ordering, validation errors |

**Verification gate:** All salary tests pass. History is append-only (no ability to update). `changed_by` is correctly recorded.

---

## Phase 5 — Analytics API
*Backend developer. ~1–2 days.*

| Task | Detail |
|------|--------|
| B5-1 | Implement `GET /analytics/summary` — headcount, total payroll (USD), avg/median/min/max by dept and country |
| B5-2 | Implement currency conversion in SQL using `exchange_rates` table |
| B5-3 | Implement `GET /analytics/export` — streamed CSV of filtered employee+current salary data |
| B5-4 | Integration tests: summary returns correct aggregations; export produces valid CSV |
| B5-5 | Performance check: analytics query explains show index usage, no sequential scans on large tables |

**Verification gate:** Analytics query runs in < 300 ms on seeded 10,000-employee DB. CSV export streams correctly. Tests pass.

---

## Phase 6 — Frontend Authentication
*Frontend developer. Starts after **Phase 2 (Auth API)** is complete **and** the API contract is finalised. ~1 day.*

> From this phase onwards the frontend integrates against real backend endpoints. All request/response shapes must match the agreed API contract. Any divergence found during integration is raised as a contract amendment — not resolved unilaterally.

| Task | Detail |
|------|--------|
| F6-1 | Build Login page: email + password form with React Hook Form + Zod |
| F6-2 | Implement Axios instance with `Authorization` header interceptor |
| F6-3 | Implement 401 response interceptor: call `POST /auth/refresh`, retry original request |
| F6-4 | Implement Zustand auth store: `{ user, accessToken, login, logout }` |
| F6-5 | Implement protected route wrapper (redirect to `/` if unauthenticated) |
| F6-6 | Implement silent refresh on app load (`POST /auth/refresh` on mount) |
| F6-7 | Component tests: Login form validation, auth store, protected route redirect |

**Verification gate:** Login flow works end-to-end against the backend. Token refresh works transparently. Protected routes redirect unauthenticated users.

---

## Phase 7 — Employee List & Detail Pages
*Frontend developer (starts after Phase 3 is complete). ~2 days.*

| Task | Detail |
|------|--------|
| F7-1 | Build Employee List page: paginated table with shadcn DataTable |
| F7-2 | Implement search input (debounced, synced to URL query params) |
| F7-3 | Implement Department and Country filter dropdowns |
| F7-4 | Implement sort controls on table columns |
| F7-5 | React Query hook: `useEmployees({ page, pageSize, search, department, country })` |
| F7-6 | Build pagination controls (prev/next, page jump, page size selector) |
| F7-7 | Build Employee Detail page: display employee info and current salary |
| F7-8 | Component tests: Employee list renders correctly, pagination controls, filter UI |

**Verification gate:** List page loads with real data. Search, filter, and pagination work. URL reflects current state (bookmarkable).

---

## Phase 8 — Salary History & Update
*Frontend developer (starts after Phase 4 is complete). ~2 days.*

| Task | Detail |
|------|--------|
| F8-1 | Build Salary History section on Employee page: chronological list |
| F8-2 | Build Salary Update form: amount, currency, effective_date, pay_frequency, reason, notes |
| F8-3 | Form validation with Zod (mirrors backend rules) |
| F8-4 | React Query mutation: `useUpdateSalary`; invalidate employee and history queries on success |
| F8-5 | Display success/error toast notifications |
| F8-6 | Component tests: form validation, salary history rendering, mutation success/error |

**Verification gate:** Salary update creates a history record visible immediately. Form rejects invalid input. History list is in correct order.

---

## Phase 9 — Analytics Dashboard
*Frontend developer (starts after Phase 5 is complete). ~1–2 days.*

| Task | Detail |
|------|--------|
| F9-1 | Build Analytics Dashboard page with summary stats cards |
| F9-2 | Build department breakdown bar chart (Recharts) |
| F9-3 | Build country breakdown table |
| F9-4 | Implement CSV export button (triggers `GET /analytics/export` download) |
| F9-5 | React Query hook: `useAnalytics()` |
| F9-6 | Component tests: stats render correctly, chart data binding |

**Verification gate:** Dashboard displays real aggregated data. CSV export downloads a valid file. Page loads in < 2 s.

---

## Phase 10 — Integration Testing & QA
*Both developers. ~1–2 days.*

| Task | Detail |
|------|--------|
| QA-1 | End-to-end Playwright tests: login → search employee → update salary → view history |
| QA-2 | End-to-end Playwright tests: login → view analytics → export CSV |
| QA-3 | Test all API error responses: 400, 401, 404, 422 |
| QA-4 | Test pagination boundary conditions (last page, empty results) |
| QA-5 | Accessibility audit: run axe-core on main pages; fix WCAG 2.1 AA violations |
| QA-6 | Performance: verify employee list at page 100 still responds < 300 ms |
| QA-7 | Security: verify all endpoints return 401 without a valid token |

**Verification gate:** All E2E tests pass. No critical accessibility violations. Performance budget met.

---

## Phase 11 — Deployment & Documentation
*Both developers. ~0.5 days.*

| Task | Detail |
|------|--------|
| D-1 | Configure production environment variables on Render and Vercel |
| D-2 | Run migrations on production database |
| D-3 | Smoke test production deployment against acceptance criteria |
| D-4 | Update `README.md` on both repos: setup, env vars, running locally, running tests |
| D-5 | Tag `v1.0.0` release on both repos |

**Verification gate:** All AC-1 through AC-10 from `requirements.md` pass on production.

---

## Summary Timeline

| Phase | Owner | Duration |
|-------|-------|----------|
| 0 — Setup | Both | 1 day |
| 1 — Schema | Backend | 1 day |
| 2 — Auth API | Backend | 1–2 days |
| 3 — Employee API | Backend | 2 days |
| 4 — Salary API | Backend | 2 days |
| 5 — Analytics API | Backend | 1–2 days |
| 6 — Frontend Auth | Frontend | 1 day |
| 7 — Employee Pages | Frontend | 2 days |
| 8 — Salary Pages | Frontend | 2 days |
| 9 — Analytics Page | Frontend | 1–2 days |
| 10 — Integration QA | Both | 1–2 days |
| 11 — Deployment | Both | 0.5 day |
| **Total** | | **~17–20 days** |

> Backend and frontend phases 2–5 / 6–9 run in parallel once Phase 0 and 1 are complete.
