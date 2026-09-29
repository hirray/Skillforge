# Decisions

- SQLite is used for Phase 0 local dev to avoid Postgres setup.
- To switch to Postgres later: Update \`schema.prisma\` provider to \`postgresql\` and apply migration.
- Python venv is created automatically via setup script cross-platform.
