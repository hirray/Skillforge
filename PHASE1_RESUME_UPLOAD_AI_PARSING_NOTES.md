# Resume upload and AI parsing

## Implemented

Multipart PDF validation, generated private keys, signature scanning interface, queued extraction with persisted retry status/recovery, hash dedupe, review and edit choices, transaction/idempotent confirmation, origin/evidence tracking, private signed downloads and deletion.

## Review

Open http://localhost:5173/resumes. Upload services/ai/tests/fixtures/frontend.pdf; review/edit/discard fields, confirm, repeat the confirm request, test no-text.pdf and an expired download URL.

## Integration boundaries

The profile receives only confirmed skills, education, experience and certifications. Links and project excerpts remain explicitly in the private review because those profile tables are not present. DOCX and OCR are optional and not implemented. The signature guard is not a full antivirus scanner.

See docs/member2/README.md for setup and docs/member2/VALIDATION.md for exact checks and inherited failures. No shared-contract approval or production readiness is implied.
