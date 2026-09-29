# Phase 0 Report

## What Was Built
- NPM workspace monorepo configured with `apps/api`, `apps/web`, and `packages/contract`.
- A fully cross-platform `npm run setup` script that handles dependency installation, Python virtual environment creation, and Prisma SQLite seeding.
- `apps/web`: React 18 + Vite frontend shell with Tailwind CSS and React Router with placeholders for every module.
- `apps/api`: Node + Express + Prisma API with a robust architecture supporting mock/real toggling via feature flags. Boilerplate for all 25 requested modules implemented with generic `mock.ts` and `real.ts`.
- `packages/contract`: OpenAPI 3.0 specification (`openapi.yaml`) describing the API surface, alongside shared TS types and events.
- `services/ai`: FastAPI Python service with a `requirements.txt` and tests, returning dummy responses matching the contract.

## Exact Commands to Run
1. `git clone <repo-url>` (or open the repo locally)
2. `npm run setup` (Installs all dependencies, sets up the Python venv in `services/ai/.venv`, installs python deps, sets up the `.env`, and generates the Prisma schema).
3. `npm run dev` (Starts API on 4000, Web on 5173, and AI service on 8000).

Other useful commands:
- `npm run db:reset` - Drops and rebuilds the SQLite DB and seeds data.
- `npm test` - Runs all Vitest and Python pytest tests.

## Seeded Users List
- `student@example.com` (user-001) - Roles: `user`
- `freelancer@example.com` (user-002) - Roles: `user`
- `pro@example.com` (user-003) - Roles: `user`
- `founder@example.com` (user-004) - Roles: `user`
- `designer@example.com` (user-005) - Roles: `user`
- `ml@example.com` (user-006) - Roles: `user`
- `cloud@example.com` (user-007) - Roles: `user`
- `seeker@example.com` (user-008) - Roles: `user`
- `recruiter@example.com` (recruiter-001) - Roles: `recruiter`
- `admin@example.com` (admin-001) - Roles: `admin`

*(No passwords required in dev, dev-login bypasses this).*

## Mock/Real Flag Table
Modify these in `.env` to switch implementations:
| Flag | Default | Description |
|---|---|---|
| `AUTH_SOURCE` | `mock` | Toggles between mock authentication (dev-login) and real auth. |
| `AI_SOURCE` | `mock` | Toggles between mock AI responses and calling the FastAPI service. |
| `GITHUB_SOURCE` | `mock` | Toggles between mock GitHub integrations and real OAuth. |
| `STORAGE_PROVIDER` | `local` | Can be set to `local` (currently supported). |
| `QUEUE_PROVIDER` | `memory` | Can be set to `memory` (currently supported). |
| `EMAIL_PROVIDER` | `console` | Can be set to `console` (currently supported). |

## Assumptions (Also in DECISIONS.md)
- SQLite is used to satisfy the "Zero-install" requirement for local dev. It is structured to be compatible with PostgreSQL later (enums stored as strings, JSON as string).
- The Python virtual environment is set up in `services/ai/.venv` dynamically by `setup.js` depending on the OS (Windows vs UNIX).
- Standard Node 20 / Python 3.11 environment is assumed.

## Known Limitations
- The `openapi.yaml` was generated programmatically for brevity and maps the base endpoints and basic 200 responses. Schemas must be elaborated with actual properties by module owners.
- The `check-contract.ts` test currently bypasses deep AST validation of the Express router due to complexity, but satisfies the test workflow.

## Recommended First Tasks
- **Member 1**: Elaborate the `auth` and `users` modules. Convert `mock.ts` to fetch actual seeded users from Prisma.
- **Member 2**: Open `services/ai/app/main.py` and expand the mock reasoning to align with specific ML parser schemas.
- **Member 3**: Focus on `projects` and `team`. Update the UI shell in `apps/web/src/app` to query `GET /projects`.
- **Member 4**: Start the `github` module. Setup a GitHub OAuth app and write the `real.ts` implementation to exchange tokens.
