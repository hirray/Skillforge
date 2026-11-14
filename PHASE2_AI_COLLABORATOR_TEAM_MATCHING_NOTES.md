# Collaborator matching

## Implemented

Configurable evidence weights, complementarity/open-role fit, availability/duration/growth signals, consent/existing-member/owner/decline exclusions, deterministic ordering, reasons and caveats, saved runs, outcome attribution/dedupe and evaluation.

## Review

Open http://localhost:5173/ai/match/demo. Match m2-demo-project; ML/cloud candidates should lead. Inspect See why, filter role/availability, opt out of discovery, and test invitation cooldown.

## Integration boundaries

Exports MatchResultsPanel. Invitations require an explicit user action and use the existing Team API. Protected input fields are rejected. No bare match score is shown in cards.

See docs/member2/README.md for setup and docs/member2/VALIDATION.md for exact checks and inherited failures. No shared-contract approval or production readiness is implied.
