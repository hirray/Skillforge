# Analytics and AI evaluation

## Implemented

Admin-only aggregate summary, SQL date aggregation, module-live indicators, sample counts/cohort suppression, range selection, product/matching/project/recruiter views, labelled synthetic history, offline precision/NDCG reports and optional local TF-IDF blend.

## Review

Open http://localhost:5173/analytics. Choose Admin; run npm run dev:fake-activity and npm run eval:matching. Review sample sizes, synthetic labels, small-cohort suppression, ranker comparison and non-admin denial.

## Integration boundaries

Definitions are in docs/member2/METRICS.md. Synthetic evaluation is not production validation. Baseline stays default even if a tiny synthetic set favours hybrid. Missing upstream workflows show Not yet live.

See docs/member2/README.md for setup and docs/member2/VALIDATION.md for exact checks and inherited failures. No shared-contract approval or production readiness is implied.
