# Phase 4 · Module 28: Company-Sponsored Real-World Projects Notes

## Implementation Summary
- **Module**: Member 4 (Proof, Verification & Talent Market)
- **Feature Flag**: `CHALLENGES_SOURCE` (`real` | `mock`)
- **API Endpoints**:
  - `GET /api/v1/challenges`: List sponsored challenges with company verification badge and entries count.
  - `POST /api/v1/challenges`: Create enterprise challenge (title, problem statement, deliverables, skills, deadline, rules).
  - `GET /api/v1/challenges/:id`: Challenge detail with full brief and rules.
  - `PATCH /api/v1/challenges/:id`: Update challenge status, deliverables, or deadline.
  - `POST /api/v1/challenges/:id/entries`: Submit team project solution (validates deadline cutoff and project existence).
  - `GET /api/v1/challenges/:id/entries`: Retrieve team submissions (with private notes only visible to recruiters).
  - `PATCH /api/v1/challenge-entries/:id`: Recruiter evaluation console (sets status: `submitted`, `under_review`, `shortlisted`, `declined` and adds private notes).

## Design & Verification Guarantees
- **Deadline Cutoff**: Automated validation prevents submissions once `endsAt` passes or challenge status is closed (`400 VALIDATION_ERROR`).
- **Team Collaboration Integration**: Teams can create a project explicitly linked to the challenge (`/projects/create?challengeId=:id`).
- **Recruiter Evaluation Privacy**: Private evaluation notes are visible exclusively to company recruiters, stripped from participant and public responses.

## Test Verification
- All 7 integration test scenarios pass with zero errors in `apps/api/src/modules/challenges/challenges.test.ts`.
