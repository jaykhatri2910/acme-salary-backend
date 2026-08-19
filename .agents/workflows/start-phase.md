---
name: start-phase
description: Workspace workflow to automate the software development phase process across the Manager, Developer, Reviewer, and QA agents.
---

# Start Phase Workflow

This workflow automates the software development phase process for the ACME Salary Management system. It orchestrates analysis, planning, development, testing, peer review, QA, and git commits.

## Workflow Orchestration

Follow these steps sequentially to execute a development phase:

### Step 1: Input and Requirements Analysis
1. Accept the target phase or task input from the user.
2. Read the following core documents to establish context, constraints, and requirements:
   - [requirements.md](file:///Users/jaykhatri/Documents/acme-salary-backend/docs/requirements.md)
   - [architecture.md](file:///Users/jaykhatri/Documents/acme-salary-backend/docs/architecture.md)
   - [decisions.md](file:///Users/jaykhatri/Documents/acme-salary-backend/docs/decisions.md)
   - [project-plan.md](file:///Users/jaykhatri/Documents/acme-salary-backend/docs/project-plan.md)
   - [project-rules.md](file:///Users/jaykhatri/Documents/acme-salary-backend/.agents/rules/project-rules.md)

### Step 2: Implementation Planning
1. Invoke the [Manager Agent](file:///Users/jaykhatri/Documents/acme-salary-backend/.agents/agents/manager.md) to analyze the requested phase.
2. The Manager Agent must create a concise implementation plan that defines the scope, API contracts, database adjustments, and breakdown of tasks.
3. Review the plan to ensure it does not include functionality belonging to later phases or introduce unnecessary architectural complexity.

### Step 3: Development Delegation
1. **Backend Work**: If the phase contains backend tasks, delegate them to the [Backend Developer Agent](file:///Users/jaykhatri/Documents/acme-salary-backend/.agents/agents/backend.md).
2. **Frontend Work**: If the phase contains frontend tasks, delegate them to the **Frontend Developer Agent** (defined in `frontend.md` or the frontend repository's custom agents).
3. The developers must implement functionality strictly within the scope of the current phase. Do not implement functionality belonging to later phases.

### Step 4: Automated Verification
After developers complete their implementations, run the following automated checks to verify correctness:
* Run unit and integration tests:
  ```bash
  npm test
  ```
* Run linter checks:
  ```bash
  npm run lint
  ```
* Run TypeScript compiler checks:
  ```bash
  npm run typecheck
  ```

### Step 5: Independent Peer Review
1. Delegate the changes to the [Reviewer Agent](file:///Users/jaykhatri/Documents/acme-salary-backend/.agents/agents/reviewer.md) for independent review.
2. **Review Feedback Loop**:
   - If the Reviewer returns `CHANGES REQUESTED`, compile the findings, send them back to the appropriate developer agent (Backend or Frontend), and return to **Step 3**.
   - If the Reviewer returns `APPROVED`, proceed to Step 6.

### Step 6: QA Verification
1. Delegate the approved implementation to the **QA Agent** (representing the QA role / defined in `qa.md`).
2. **QA Feedback Loop**:
   - If QA finds failures or bugs, return the failures to the developer agent, implement the fixes, run automated tests/checks (**Step 4**), re-run the Reviewer flow (**Step 5**), and repeat QA verification.
   - If QA approves, proceed to Step 7.

### Step 7: Commit Preparation
Only after receiving approvals from both the Reviewer Agent and the QA Agent, prepare the Git commit:
1. Ensure that **no secrets, API keys, or `.env` files** are staged or committed.
2. Keep the commit message descriptive, incremental, and phase-specific.
3. Create the commit.

### Step 8: Final Reporting
At the end of the phase, report:
* **Implemented Functionality**: List of features/endpoints added or modified.
* **Test Results**: Output status of test suite, lint, and typecheck.
* **Review Result**: Confirmation of Reviewer approval.
* **QA Result**: Confirmation of QA verification.
* **Commit Status**: Details of the created Git commit (message and status).
