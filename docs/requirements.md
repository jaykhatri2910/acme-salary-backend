# ACME Salary Management — Requirements

## Goal

Enable HR managers to view, manage, and analyse employee salary information across a 10,000-person, multi-country organisation in a reliable, auditable, and efficient system.

---

## User Persona

**HR Manager**
- Manages compensation data for hundreds to thousands of employees.
- Needs to search, filter, and update salary records quickly.
- Requires reporting and analytics to understand pay distribution.
- Works across multiple countries with different currencies.
- Non-technical; expects a clean, fast, professional UI.

---

## Functional Scope

| # | Feature | Description |
|---|---------|-------------|
| 1 | Employee Directory | Paginated, searchable list of employees |
| 2 | Salary Management | View, create, and update employee salary records |
| 3 | Salary History | Immutable audit log of all salary changes |
| 4 | Department & Country Filters | Filter employees by department and country |
| 5 | Currency Support | Store salaries in local currency; display with conversion |
| 6 | Analytics Dashboard | Summary statistics: pay distribution, headcount by dept/country |
| 7 | Export | Export filtered employee/salary data to CSV |
| 8 | Authentication | Secure login for HR managers |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Scale** | Support 10,000 employees without full-table scans on every request |
| **Performance** | API responses < 300 ms at p95 under normal load |
| **Pagination** | All list endpoints server-side paginated (default page size: 25) |
| **Security** | HTTPS only; JWT-based auth; no PII in logs |
| **Auditability** | Every salary change recorded with timestamp and actor |
| **Reliability** | Application is production-ready within the availability characteristics of the selected hosting tier (Render + Vercel). |
| **Maintainability** | TypeScript throughout; meaningful test coverage |
| **Accessibility** | WCAG 2.1 AA compliance for the UI |

---

## Features

### F1 — Employee Directory
- Paginated table (25 per page) with search by name/employee ID.
- Filter by department, country, employment status.
- Sortable columns: name, department, country, salary.

### F2 — Salary Management
- View current salary for an employee.
- Update salary (amount, currency, effective date, reason, note).
- Salary record captures: base salary, currency, effective date, pay frequency, grade/band.

### F3 — Salary History
- Chronological list of all salary changes for an employee.
- Each entry shows: old amount, new amount, effective date, change reason, changed-by user.
- Read-only; no edits or deletions allowed.

### F4 — Analytics Dashboard
- Total headcount and payroll cost (in a base currency, e.g. USD).
- Average, median, min, max salary by department and country.
- Pay band distribution chart.
- Exportable as CSV.

### F5 — Authentication
- Email + password login.
- JWT access token (short-lived) + refresh token (HTTP-only cookie).
- Role: `hr_manager` (initial scope; single role).

### F6 — Export
- Export current filtered employee list (with salary) to CSV.
- Server-side generation; streamed response.

---

## Explicitly Out of Scope

- Employee self-service portal (employees cannot log in).
- Payroll processing or payslip generation.
- Benefits and equity management.
- Performance reviews tied to compensation.
- Real-time currency exchange rates (static exchange rates acceptable for v1).
- SSO / SAML / OAuth (plain email+password for v1).
- Mobile application.
- Multi-tenancy (single organisation).
- Role-based access beyond `hr_manager`.

---

## Assumptions

1. A single organisation with a flat HR manager role; no approval workflows needed in v1.
2. Exchange rates are loaded from a static configuration or occasional manual update — not a live feed.
3. Employees are imported from an existing system (bulk seed); the app manages salary data, not the full HRIS.
4. PostgreSQL is already provisioned on Render; no managed cloud DB setup is needed.
5. Render free/starter tier is acceptable for v1 (cold-start latency acknowledged).
6. All timestamps stored in UTC.

---

## Trade-offs

| Decision | Rationale |
|----------|-----------|
| Single role (`hr_manager`) | Simplifies auth; RBAC can be added in v2 without schema changes if a `role` column is present |
| Static exchange rates | Avoids external API dependency and rate-limit risk in v1 |
| Server-side pagination only | Prevents loading 10,000 rows into memory or the browser |
| Immutable salary history | Ensures auditability; simplifies compliance |
| Render + Vercel over self-hosted | Reduces ops burden; matches team's deployment preferences |
| No microservices | 10,000 employees does not justify distributed infrastructure overhead |

---

## Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-1 | HR manager can log in and see a paginated employee list within 300 ms. |
| AC-2 | Search and filter reduce the visible list without a full page reload. |
| AC-3 | Updating a salary creates an immutable history record with the actor's identity. |
| AC-4 | Salary history is viewable per employee in chronological order. |
| AC-5 | Analytics dashboard shows department and country breakdowns. |
| AC-6 | CSV export downloads the currently filtered employee+salary dataset. |
| AC-7 | All protected API endpoints return 401 for unauthenticated requests. Authentication endpoints (`/auth/login`, `/auth/refresh`) remain publicly accessible. |
| AC-8 | Invalid input to salary update endpoint returns 400 with a meaningful error. |
| AC-9 | The system handles 10,000 employees without degraded performance on list pages. |
| AC-10 | Salary amounts are stored in local currency and displayed with currency code. |
