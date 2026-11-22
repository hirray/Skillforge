# Phase 4 · Module 25: Candidate Comparison & Hiring Pipeline Notes

## Implementation Summary
- **Module**: Member 4 (Proof, Verification & Talent Market)
- **Feature Flag**: `PIPELINE_SOURCE` (`real` | `mock`)
- **API Endpoints**:
  - `GET /api/v1/pipeline`: Company-scoped pipeline board entries with stage history, candidate profile, and private recruiter notes.
  - `POST /api/v1/pipeline`: Add a candidate to company pipeline with initial stage and stage history audit entry.
  - `PATCH /api/v1/pipeline/:id`: Move candidate stage (with optional recruiter note and stage history recording).
  - `POST /api/v1/pipeline/:id/notes`: Add private recruiter notes (strictly confidential to company recruiters).
  - `POST /api/v1/pipeline/compare`: Compare 2 to 4 candidates side-by-side with verified evidence, demonstrated skills matrix, and match rationale.
  - `POST /api/v1/pipeline/outreach`: Send consent-aware direct outreach message to candidate's Opportunities Inbox.
  - `GET /api/v1/pipeline/opportunities/me`: Candidate-facing inbound messages from verified recruiters.
  - `POST /api/v1/pipeline/opportunities/:id/respond`: Candidate accepts or declines opportunity.
  - `POST /api/v1/pipeline/candidate/consent`: Candidate toggles recruiter visibility and matching opt-in.

## Design & Security Guarantees
- **Confidentiality**: Recruiter notes and pipeline stages are strictly inaccessible to candidates.
- **Consent Enforcement**: Recruiter outreach validates candidate visibility consent (`recruiterVisible`) at transmission time.
- **Visibility Changed Notice**: If candidate withdraws consent after being shortlisted, pipeline card displays `Profile no longer visible` badge and contact is locked.
- **Verification Matrix**: Comparison engine cross-references verified commits, milestone scores, and skill evidence levels.

## Test Verification
- All 8 integration test scenarios pass with zero errors in `apps/api/src/modules/pipeline/pipeline.test.ts`.
