# Job-to-talent matching

## Implemented

Company-recruiter authorization, explicit recruiter visibility, evidence-weighted required/preferred skills, minimum experience, hard/soft location/work-mode constraints, reasons, local comparison, append-only explanation/input snapshots, latest-run reads and stale-job detection.

## Review

Open http://localhost:5173/ai/job-match/demo. Choose Recruiter. Run the demo job with soft constraints, then change location to hard. Inspect reasons/comparison and confirm a recruiter outside the company receives 403.

## Integration boundaries

Exports JobMatchResults with an onShortlist callback. Shortlisting is deliberately disabled until Member 4 supplies Pipeline integration. The existing Jobs, Talent and Pipeline implementations were not changed.

See docs/member2/README.md for setup and docs/member2/VALIDATION.md for exact checks and inherited failures. No shared-contract approval or production readiness is implied.
