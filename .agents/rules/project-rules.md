---
trigger: always_on
---

# ACME Salary Management

## Project

ACME Salary Management is an HR salary management system for an organization with 10,000 employees across multiple countries.

## Product Goal

Allow HR managers to manage employee salary information and understand how the organization pays its employees.

## Architecture

The system consists of:

- React frontend
- Node.js backend
- PostgreSQL relational database

Frontend and backend are maintained as separate GitHub repositories.

## Engineering Principles

- Prefer simple production-quality solutions.
- Avoid unnecessary complexity.
- Use TypeScript.
- Write meaningful tests.
- Use incremental Git commits.
- Validate all external input.
- Keep business logic testable.
- Optimize database queries.
- Use server-side pagination.
- Do not load all 10,000 employees unnecessarily.

## AI Development

AI agents must not blindly generate and accept code.

Every implementation must be:

1. Reviewed
2. Tested
3. Validated
4. Documented when necessary

## Deployment

Backend:
GitHub → Render

Frontend:
GitHub → Vercel
