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
