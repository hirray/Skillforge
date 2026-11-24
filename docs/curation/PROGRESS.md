# SkillForge Curation: PROGRESS.md

## Current Status
- **Current Phase**: Phase 1: ROLE-BASED NAVIGATION AND CLEAN STRUCTURE (In Progress)
- **Active Branch**: `curation/full-pass`
- **Target Goal**: Transform SkillForge from 34 standalone modules into ONE clean, unified, role-aware platform with 6 contexts, 11 guided flows, in-app help center, and zero broken links.

---

## Phase Checklist
- [x] **Phase 0: Audit** (read-only inventory, dead ends, route matrix, crawl script, write `docs/curation/AUDIT.md`)
- [ ] **Phase 1: Role-Based Navigation and Clean Structure** (single `navigation.ts`, Context Switcher, 5-zone Home layout per context, GLOSSARY.md)
- [ ] **Phase 2: Dataset and Demo Accounts** (data mapping, idempotent seed:dataset, demo persona accounts, check:data)
- [ ] **Phase 3: Interconnection and Next-Step Guidance** (entity chips, ROUTES.md, nextBestActions, command palette, empty states)
- [ ] **Phase 4: Visual Clean-Up** (deduplicate components, single StatusChip, design token alignment, accessibility & responsive checks)
- [ ] **Phase 5: Guided Tours** (TourProvider, tours.config.ts, spotlight UI, first-run checklists, onboarding endpoints)
- [ ] **Phase 6: Help Center and Manuals** (Markdown manuals 00-14, /help route, route-to-manual drawer, docs:screenshots)
- [ ] **Phase 7: End-to-End QA by Role** (Playwright test suite for F1-F11, full story test, security/auth sweep, QA_REPORT.md)
- [ ] **Phase 8: Final Acceptance** (re-run audit, FINAL_REPORT.md, DEMO_SCRIPT.md, release branch verification)

---

## Decisions Log
1. **Design System & Palette Compliance**:
   - Strictly locked to SkillForge foundational palette: Bleu océan `#0A1680`, Bleu ciel `#93B2F8`, Butter yellow `#FBEDB0`, Orange pastel `#F1B94C`, Blanc cassé `#FCFDFF`, text `#16213A`, muted `#6B7685`, border `#E7EAF3`, surface `#FFFFFF`.
   - Card rhythm: 16px cards, 8px grid rhythm, pill buttons, 3-level elevation (`0 1px 3px`, `0 4px 8px`, `0 12px 20px`), skeleton loaders.
2. **Context Model (The 6 North Star Contexts)**:
   - `Guest`: Explore projects, Explore talent (public only), Sign in.
   - `Individual` (student, freelancer, professional, founder): Home, Discover, My Projects, Challenges & Hackathons, Portfolio, Inbox.
   - `Recruiter`: Home, Jobs, Talent, Pipeline, Challenges, Messages.
   - `Company Admin`: Recruiter items + Company (profile, seats, verification) and Analytics.
   - `Mentor`: Home, Requests, Mentored Projects, Feedback, Availability.
   - `Platform Admin`: Overview, Moderation, Verification, Certificates, Skills, Users, Audit, AI Evaluation.
3. **Additive-Only Contract Rule**:
   - Existing OpenAPI/Contract endpoints must not be broken or reshaped. The only contract addition allowed is the onboarding state endpoints (`/users/me/onboarding`).

---

## Open Problems & Blockers
- None currently. Audit in progress.
