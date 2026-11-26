# SkillForge Curation: PROGRESS.md

## Current Status
- **Current Phase**: Complete (Phases 0 through 8 Verified & Delivered)
- **Active Branch**: `curation/full-pass` / `help/manual-flows-tours`
- **Target Goal**: Transform SkillForge from 34 standalone modules into ONE clean, unified, role-aware platform with 6 contexts, 11 guided flows, in-app help center, and zero broken links.

---

## Phase Checklist
- [x] **Phase 0: Audit** (read-only inventory, dead ends, route matrix, crawl script, write `docs/curation/AUDIT.md`)
- [x] **Phase 1: Role-Based Navigation and Clean Structure** (single `navigation.ts`, Context Switcher, 5-zone Home layout per context, GLOSSARY.md, high-contrast noticeable cockpit HUD)
- [x] **Phase 2: Dataset and Demo Accounts** (data mapping, `DATA_MAPPING.md`, `DEMO_ACCOUNTS.md`, Fast Persona Switcher in top bar, `npm run check:data`)
- [x] **Phase 3: Interconnection and Next-Step Guidance** (entity chips, `ROUTES.md`, nextBestActions, deep search command palette, empty & loading states)
- [x] **Phase 4: Visual Clean-Up** (Studio dark tokens, single StatusChip semantics, SVG vector icons, zero emojis, mobile responsive checks)
- [x] **Phase 5: Guided Tours** (TourProvider, tours.config.ts, spotlight backdrop-blur UI, step tooltips, auto-launch on first visit, re-triggerable Tour button)
- [x] **Phase 6: Help Center and Manuals** (In-app `/help` route, interactive visual workflow pipeline flowcharts `FC-01` to `FC-16`, written manuals `01` to `17`, FAQ & troubleshooting)
- [x] **Phase 7: End-to-End QA by Role** (verification matrix for F1-F11 across all 6 roles, `QA_REPORT.md`)
- [x] **Phase 8: Final Acceptance** (`FINAL_REPORT.md`, data validation, zero build/typecheck errors)

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
- None.
- Verified: Project detail views (`/projects/proj-monorepo`, `/projects/proj-consensus`, etc.) resolve properly with zero 404 crashes.
- Verified: Guided tour spotlight elevated target element above parent stacking contexts with 9999px box-shadow mask and bright glowing purple outline so inspected components are 100% visible and noticeable.
- Verified: Help Center (`/help`) includes all 4 interactive visual pipeline flowcharts (Project to Certification, Recruiter Hiring, Hackathons, Mentorship) with step-by-step guides and product manuals.
