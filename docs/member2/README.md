# Member 2 intelligence workspace

Six modules are implemented: resume upload/review, project requirement and gap analysis, collaborator recommendations, project health, recruiter job matching, and admin analytics/evaluation. The UI follows the user's dark charcoal/lavender reference and is scoped to `/ai`, `/resumes`, and `/analytics`. Existing collaboration pages and shared design tokens are preserved.

## Run locally

Prerequisites: Node 20+ and Python 3.11+.

```sh
npm ci
npm run setup:member2
npm run dev
```

Open http://localhost:5173/ai. Setup is additive: it does **not** run `db:reset`, delete rows, or switch teammates' module flags. It creates an ignored `.env.member2.local` from `.env.member2.example`, generates Prisma, adds the schema, seeds only missing demo records, and generates synthetic PDFs. Existing development databases should be backed up before any schema update.

The demo account menu includes project owner, eight individual roles, Recruiter, and Admin. Use Recruiter for `/ai/job-match/demo` and Admin for `/analytics`. The existing shared `core/auth.ts` still uses development user-ID bearer tokens; Member 1 must supply verified sessions before production deployment. This work does not replace their authentication implementation.

Demo project `m2-demo-project` contains open ML/cloud roles and deliberately overdue tasks. Demo job `m2-demo-job` belongs to `m2-demo-company`. Demo records are prefixed `m2-`; real records are not overwritten. The demo profile adapter is not a replacement for Member 1's full profile editor.

```sh
npm run dev:fake-activity   # labelled synthetic chart history
npm run eval:matching      # offline golden-set report
npm run test:member2       # owned HTTP tests and Python tests
npm run check:member2-contract
npm run typecheck
npm run lint
npm run build -w apps/web
npm run build -w apps/api
npm test                  # includes inherited failures documented in VALIDATION.md
```

Five synthetic sample PDFs and golden expectations are under `services/ai/tests/fixtures/`. Upload `frontend.pdf` or `ml.pdf` to test actual extraction. `no-text.pdf` tests the manual-entry warning. An extraction never updates the profile before confirmation. Replacing a resume does not delete previously confirmed profile data. A simple ScanProvider signature guard rejects active PDF content; this is not an antivirus product. Scanned PDFs are not OCRed.

Switch any `AI_*_SOURCE` to mock to use labelled fixtures without a running Python service. `AI_SOURCE` remains the fallback for unspecified AI flags. `RESUMES_SOURCE=real` enables the workflow/storage; `AI_RESUME_SOURCE=mock` tests that workflow against sample extraction. `MATCH_RANKER=hybrid` enables the optional experiment; baseline remains the default. No paid keys or external AI services are used.

## Integration and contract review

See CONTRACT_ADDENDUM.md. The new workspace is reachable through the existing AI, Resumes and Analytics navigation entries. Reusable panels are exported from `apps/web/src/modules/ai/index.ts`; their owners can mount them at the team integration session. No Create Project, Team, Task, Chat, Milestone, Resources, Jobs, or Pipeline implementation was rewritten.

The local example enables proposed utility routes with `MEMBER2_EXTENSIONS=true`. The committed server default is false pending the team's contract review. No shared contract approval or merge is claimed.

## Database migrations

The repo previously used `db push` and had no migration history. Two checked-in migrations now describe the exact original schema and Member 2's additive changes. For a **new empty database**, `prisma migrate deploy` applies both. For an **existing original database**, back it up, verify it matches the baseline, mark `20260929_baseline` applied with `prisma migrate resolve --applied 20260929_baseline`, then deploy the additions. Databases already updated with `db push` need both migrations marked applied after schema verification; do not blindly deploy them twice. The local setup continues the repo's non-resetting `db push` workflow.
