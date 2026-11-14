# SkillForge

AI-Powered Project Collaboration and Management System.

## Prerequisites
- Node.js 20 LTS
- Python 3.11+
- Git

## Getting Started
1. Run \`npm run setup\` to install dependencies, set up the Python venv, and seed the local SQLite database.
2. Run \`npm run dev\` to start the API (port 4000), Web UI (port 5173), and AI service (port 8000) concurrently.

See \`docs/ONBOARDING.md\` for more detailed steps.

## Testing
- \`npm test\` to run all tests (API, Web, AI).
- \`npm run check:contract\` to verify API routes match the OpenAPI contract.

## Resetting Database
- \`npm run db:reset\` to wipe the SQLite DB and re-seed it with the initial mock data.

## Member 2 intelligence workspace

For the six intelligence modules and dark workspace, use `npm ci`, then `npm run setup:member2`, then `npm run dev`. Open http://localhost:5173/ai. This additive setup preserves existing database rows and module flags. See [Member 2 setup and integration](docs/member2/README.md), [contract proposal](docs/member2/CONTRACT_ADDENDUM.md), and [validation](docs/member2/VALIDATION.md).
