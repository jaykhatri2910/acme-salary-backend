Review Phase 1: Database Schema and Seed.

Read:

- docs/requirements.md
- docs/architecture.md
- docs/decisions.md
- docs/project-plan.md
- .agents/rules/project-rules.md

Review the current uncommitted Git diff and the actual Supabase PostgreSQL database.

Verify:

1. Required tables:
   - users
   - departments
   - countries
   - employees
   - salary_records
   - refresh_tokens
   - exchange_rates

2. Foreign keys and relationships.

3. Appropriate indexes for:
   - employee search
   - employee filtering
   - pagination
   - salary history
   - analytics

4. Salary records are append-only by design.

5. Current salary selection is deterministic.

6. Salary amount uses an appropriate PostgreSQL numeric type.

7. Exactly 10,000 employees were seeded.

8. Employees have realistic and varied data.

9. Salary records exist for employees.

10. Seed data is deterministic.

11. HR manager password is securely hashed.

12. No secrets or passwords are committed or logged.

13. Database migrations are reproducible.

14. RLS/security configuration is appropriate for our architecture:
    React → Express → pg → Supabase PostgreSQL.

15. RLS policies do not accidentally expose employee or salary data publicly.

16. Supabase Data API is not being used by the frontend.

17. Tests, lint and typecheck pass.

18. No Phase 2+ functionality was implemented prematurely.

Do NOT modify any files or database objects.

Return exactly:

APPROVED

or

CHANGES REQUESTED

For every requested change, provide:

- priority
- problem
- why it matters
- recommended fix.
