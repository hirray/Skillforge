# Project health and risk

## Implemented

Pure signal calculators for overdue priority tasks, delayed milestones, unfinished dependencies, reassignment, inactivity and timeline completion; config-driven status, specific reasons, advisory deep links and short event-invalidated cache.

## Review

Open http://localhost:5173/ai/health. The demo project has overdue and unassigned work. Compare an empty project and a Paused/Completed/Verified/Archived project. Verify health access is restricted to project members/owner.

## Integration boundaries

Exports HealthTab and HealthBadge. Does not edit tasks or automate rescue. One ProjectDetail query-initialization line supports links into existing tabs.

See docs/member2/README.md for setup and docs/member2/VALIDATION.md for exact checks and inherited failures. No shared-contract approval or production readiness is implied.
