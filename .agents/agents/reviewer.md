Review Phase 2: HR Authentication.

You are reviewing the implementation produced by the Backend Developer Agent.

Do NOT modify any files.

First read:

- docs/requirements.md
- docs/architecture.md
- docs/decisions.md
- docs/project-plan.md
- .agents/rules/project-rules.md

Then inspect:

- the current Git diff
- Phase 1 database schema
- users table
- refresh_tokens table
- authentication implementation
- tests
- package.json
- environment configuration

## Scope

Phase 2 should implement ONLY HR authentication.

Expected functionality:

1. HR manager login
2. Secure password verification
3. Access token generation
4. Refresh token generation
5. Refresh token validation/rotation according to the approved architecture
6. Authentication middleware
7. Protected route support
8. Token expiration handling
9. Refresh token revocation where required
10. Input validation
11. Proper HTTP status codes
12. Authentication error handling

Do NOT approve functionality outside this phase.

Verify that Phase 3+ functionality has NOT been implemented, including:

- employee CRUD/list APIs
- salary APIs
- salary history APIs
- analytics APIs
- CSV export

## Security Review

Pay special attention to:

- passwords are never stored or logged in plaintext
- passwords are securely verified against the stored hash
- JWT secrets come from environment variables
- JWT secrets are not committed to Git
- access tokens have appropriate expiration
- refresh tokens have appropriate expiration
- refresh tokens cannot be reused after revocation/rotation if rotation is part of the approved design
- invalid tokens are rejected
- expired tokens are rejected
- malformed authorization headers are rejected
- authentication errors do not leak sensitive information
- database queries are parameterized
- user input is validated
- sensitive credentials are not exposed in API responses or logs

## API Review

Verify the authentication endpoints against docs/architecture.md.

Check:

- endpoint paths
- HTTP methods
- request body validation
- response structure
- status codes
- authentication requirements
- error responses

Do not invent requirements that are not present in the approved architecture.

## Database Review

Verify that the existing:

- users
- refresh_tokens

tables are used correctly.

Check:

- foreign keys
- token persistence
- token expiration
- token revocation
- indexes
- transactions where required
- no unnecessary schema changes

## Tests

Verify meaningful tests exist for:

- successful login
- invalid email/user
- invalid password
- missing credentials
- malformed credentials
- protected endpoint without token
- protected endpoint with valid token
- invalid access token
- expired access token
- refresh token flow
- invalid refresh token
- revoked refresh token
- token expiration/revocation behavior

Tests must be:

- deterministic
- isolated
- easy to understand
- fast

Run:

npm test

npm run lint

npm run typecheck

## Code Quality

Review:

- separation of routes/controllers/services
- reusable authentication middleware
- error handling
- TypeScript quality
- naming
- maintainability
- unnecessary complexity
- duplication
- logging
- configuration management

Do not approve simply because the tests pass.

Check whether the implementation actually follows the approved architecture.

## Git Review

Inspect the current Git diff.

Make sure:

- only Phase 2 changes are present
- no secrets are committed
- no .env file is committed
- no unrelated files were modified
- no unnecessary dependencies were added

## Final Decision

Return exactly one of:

APPROVED

or

CHANGES REQUESTED

If CHANGES REQUESTED, provide each issue using:

Priority:
Problem:
Why it matters:
Recommended fix:

Do NOT modify any files.

At the end provide a concise review summary.
