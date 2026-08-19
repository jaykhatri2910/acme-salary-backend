Phase 1 has been reviewed and APPROVED.

The Phase 1 changes are now committed and pushed.

We can start Phase 2: HR Authentication.

Before implementation, read:

- docs/requirements.md
- docs/architecture.md
- docs/decisions.md
- docs/project-plan.md
- .agents/rules/project-rules.md

Inspect the existing Phase 0 and Phase 1 implementation.

Implement ONLY the authentication functionality defined in the approved architecture.

Do not implement employee, salary, analytics, or CSV APIs yet.

Before coding, explain the authentication flow you will implement and identify the relevant existing database tables.

Then implement the approved authentication design.

Requirements:

- HR manager login
- Secure password verification
- Access token
- Refresh token
- Authentication middleware
- Protected route support
- Secure token handling
- Input validation
- Appropriate HTTP status codes
- Authentication error handling

Use the existing PostgreSQL schema and users/refresh_tokens tables.

Do not introduce an ORM or change the approved stack.

Add meaningful unit and integration tests covering:

- successful login
- invalid email
- invalid password
- missing credentials
- protected route without authentication
- invalid/expired access token
- refresh token flow
- invalid/revoked refresh token

Run:

- npm test
- npm run lint
- npm run typecheck

Do not commit changes.

At the end report:

- authentication flow
- endpoints added
- security decisions
- tests
- any issues or trade-offs
