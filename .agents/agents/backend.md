We are starting Phase 1: Database Schema and Seed.

Read these files first:

- docs/requirements.md
- docs/architecture.md
- docs/decisions.md
- docs/project-plan.md
- .agents/rules/project-rules.md

Also inspect the existing Phase 0 implementation.

The database is PostgreSQL hosted on Supabase.

Use the existing approved stack:

- PostgreSQL
- pg
- node-pg-migrate
- TypeScript

Do NOT introduce Prisma or another ORM.

## Goal

Implement the PostgreSQL database foundation and deterministic seed data.

## Tables

Create migrations for:

1. users
2. departments
3. countries
4. employees
5. salary_records
6. refresh_tokens
7. exchange_rates

Before writing migrations:

- inspect the approved architecture
- define relationships and constraints
- add appropriate indexes
- use appropriate PostgreSQL data types
- define foreign keys
- define sensible delete/update behavior

## Salary history

salary_records must be append-only.

A salary change creates a new record.

Never overwrite historical salary records.

Current salary selection must be deterministic:

effective_date DESC

with a deterministic tie-breaker such as:

created_at DESC

## Seed

Create a deterministic seed that creates:

- countries
- departments
- exchange rates
- one HR manager
- exactly 10,000 employees
- salary records for employees

Use deterministic data generation.

Do NOT use unseeded Math.random().

Employees should have realistic:

- first name
- last name
- email
- country
- department
- hire date
- employment status

Create realistic salary distributions across countries/departments.

Passwords must be securely hashed.

## Important

Do NOT implement:

- login API
- JWT middleware
- employee APIs
- salary APIs
- analytics APIs
- CSV export
- frontend

Those belong to later phases.

## Verification

After implementation:

1. Run all tests.
2. Run lint.
3. Run typecheck.
4. Run database migrations against the configured Supabase database.
5. Run the seed.
6. Verify exactly 10,000 employees exist.
7. Verify salary records exist.
8. Verify relationships and foreign keys.
9. Verify important indexes.
10. Verify the seed is deterministic.
11. Ensure no passwords or secrets are logged.

Add meaningful tests for database-related behavior where practical.

Do not commit anything.

At the end report:

- tables created
- relationships
- indexes
- seed strategy
- employee count
- salary record count
- tests
- migration result
- any issues or trade-offs

Do not implement anything outside Phase 1.
