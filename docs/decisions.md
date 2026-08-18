# ACME Salary Management — Decisions

This document records key architectural and engineering decisions, the context in which they were made, the options considered, and the rationale for the choice. It is a living document and should be updated as significant decisions are made during implementation.

---

## D-001 — Use offset pagination (not cursor-based) for v1

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The employee list must be paginated. Two common strategies exist: offset pagination and cursor-based pagination.

### Options
| Option | Pros | Cons |
|--------|------|------|
| Offset (`LIMIT/OFFSET`) | Simple to implement; allows random page jumps; easy to expose `total` count | Slight performance degradation at very high offsets; inconsistent results during concurrent inserts |
| Cursor-based | Stable; performant at any depth | Cannot jump to arbitrary pages; harder to implement; `total` count requires separate query |

### Decision
Use offset pagination for v1. At 10,000 rows, `OFFSET` performance is acceptable with proper indexes. HR managers need to jump to arbitrary pages and see a total count. Cursor-based pagination can be adopted in v2 if profiling shows a problem.

---

## D-002 — Access token stored in memory, not localStorage

**Status:** Accepted  
**Date:** 2026-08-18

### Context
JWTs can be stored in localStorage or in JavaScript memory (React state / Zustand).

### Options
| Option | Pros | Cons |
|--------|------|------|
| localStorage | Survives page refresh | Vulnerable to XSS — any script can read it |
| Memory (React state) | Not accessible to injected scripts | Lost on refresh; requires token refresh on mount |
| HTTP-only cookie | XSS-proof; auto-sent by browser | Requires careful CSRF handling |

### Decision
Access token in memory (short TTL: 15 min). Refresh token in HTTP-only Secure cookie. On app load, silently call `POST /auth/refresh` to restore session. This is the industry-recommended approach for SPAs.

---

## D-003 — Salary records are append-only (no updates/deletes)

**Status:** Accepted  
**Date:** 2026-08-18

### Context
Compensation data is sensitive and auditable. We need to know the full history of salary changes.

### Decision
`salary_records` is an append-only ledger. A new row is inserted for every salary change. The "current salary" is always the record with the highest `effective_date` for a given employee, with `created_at DESC` as a deterministic tie-breaker when two records share the same effective date. This eliminates the need for a separate audit log table and makes history queries trivial.

---

## D-004 — Analytics run as SQL aggregations, not in-application logic

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The analytics dashboard requires aggregations over up to 10,000 salary records.

### Decision
All aggregations (SUM, COUNT, AVG, PERCENTILE_CONT) are computed in PostgreSQL and returned as pre-aggregated results. Loading raw rows into Node.js for aggregation is rejected — it defeats the purpose of a relational database and does not scale.

---

## D-005 — Static exchange rates (no live FX API)

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The analytics dashboard needs to display salary totals in a common currency (USD). Exchange rates change daily.

### Options
| Option | Pros | Cons |
|--------|------|------|
| Live FX API (e.g., Open Exchange Rates) | Always current | External dependency; API key cost; rate limits; failure mode |
| Static rates in DB (manual update) | No external dependency; predictable | Rates become stale between updates |

### Decision
Static exchange rates stored in the `exchange_rates` table. HR managers are not performing financial accounting; salary analytics with monthly-updated rates are sufficiently accurate. External FX dependency adds failure modes that are not justified in v1.

---

## D-006 — Single role (`hr_manager`) in v1

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The requirements mention HR managers as users. No other roles (admin, employee self-service, finance) are specified.

### Decision
A single `hr_manager` role is supported in v1. The `users.role` column is included in the schema so that additional roles can be added in v2 without a schema migration. RBAC middleware can be layered onto the existing auth middleware.

---

## D-007 — Express over NestJS for the backend

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The backend is a Node.js TypeScript API. NestJS provides structure and DI out of the box. Express is minimal.

### Options
| Option | Pros | Cons |
|--------|------|------|
| Express | Simple; widely understood; no magic; easy to onboard | More boilerplate for structure |
| NestJS | Opinionated structure; DI; decorators | Heavy abstraction; steeper learning curve; overkill for a single-service API |

### Decision
Express. The API surface is limited (< 15 endpoints). Express gives the team full control without learning NestJS conventions. A clear module folder structure (`src/modules/`) provides sufficient organisation.

---

## D-008 — `node-pg-migrate` for database migrations

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The database schema must be versioned and applied consistently across environments.

### Decision
`node-pg-migrate` with raw SQL migration files. SQL migrations are explicit, reviewable, and do not abstract away the database. ORM-generated migrations (e.g., TypeORM, Prisma) introduce risk of hidden schema changes. Raw SQL is production-safe and fully auditable.

---

## D-009 — shadcn/ui (Radix + Tailwind) for the frontend component library

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The frontend needs accessible, well-styled UI components. Options include MUI, Ant Design, shadcn/ui, or building from scratch.

### Decision
shadcn/ui. Components are copied into the project (not a dependency), giving full control over styling. Built on Radix UI primitives, which are accessible by default. Tailwind CSS provides utility-based styling consistent with the component system. MUI is rejected as overly opinionated and heavy for this use case.

---

## D-010 — React Query for server-state management (no Redux)

**Status:** Accepted  
**Date:** 2026-08-18

### Context
The frontend is data-driven: paginated lists, employee detail, salary history, analytics. This is primarily server state.

### Decision
TanStack Query (React Query) manages all server state: fetching, caching, background refresh, pagination, and optimistic updates. Redux is not needed — there is minimal global client state beyond the current user session. Zustand handles that lightweight need (auth token, current user).
