# Help Build & Guided Tours: PROGRESS.md

## Current Status
- **Phase**: Complete (Parts A & B Delivered, Verified, and Audited)
- **Active Branch**: `help/manual-flows-tours`
- **Objective**: Deliver a complete product user manual with 16 workflow pipeline flowcharts (FC-01 to FC-16), a comprehensive Help Center with contextual `?` drawer, and feature-wise spotlight tours for all 34 modules across the 6 contexts.

---

## Phase Checklist

### Part A: Help Center, User Manual and Workflow Flowcharts
- [x] **A0. Inventory & Coverage**:
  - `docs/help-build/INVENTORY.md` (All 34 modules, routes, roles, real state machines, actions)
  - `docs/manuals/COVERAGE.md` (Strict 34-module mapping to manual chapter, flowchart, and tour)
- [x] **A1. The Flowchart Set (FC-01 to FC-16 in docs/manuals/flows/*.mmd)**:
  - [x] FC-01: Whole Platform Overview (Links to all flows)
  - [x] FC-02: Project Creation to Certification (Main end-to-end pipeline)
  - [x] FC-03: Resume and Profile (AI parse, human review, taxonomy normalisation)
  - [x] FC-04: Matching and Team Formation (AI matching, invites, join requests, consent)
  - [x] FC-05: Project Room Loop (Tasks, milestones, chat, GitHub, health)
  - [x] FC-06: Rescue a Stalled Project (Leave/inactivity trigger, gap definition, handover)
  - [x] FC-07: Completion, Verification & Certificate (Checklist, confirmations, disputes, QR, revoke)
  - [x] FC-08: Hackathon or Sprint (Event, rapid matching, sprint room, submission, certificate)
  - [x] FC-09: Company Challenge (Sponsorship, teams, work, review, verified experience)
  - [x] FC-10: Mentorship (Profile, request, session, milestone feedback)
  - [x] FC-11: Hiring Pipeline (Jobs, talent filters, AI match, compare, pipeline stages, consent)
  - [x] FC-12: Opportunities for Individuals (Discover, recommendations, apply, track)
  - [x] FC-13: Invitations & Notifications (Event, bell, inline actions, expiry, mute)
  - [x] FC-14: Admin & Moderation (Reports, verification queue, certificate revoke, taxonomy)
  - [x] FC-15: Roles and Contexts Map (6 contexts, permissions, switching)
  - [x] FC-16: Who Can See My Data (Privacy levels, recruiter visibility, private rooms)
- [x] **A2. Flowchart Standards & In-App Viewer**:
  - [x] Interactive SVG stage & flowchart viewer with pan, zoom (60% to 180%), reset
  - [x] Accessible numbered "Same steps in words" under every flowchart
  - [x] Raw Mermaid code viewer with one-click clipboard copy
  - [x] Mini pipeline bars on ProjectDetail (`Draft` -> `Recruiting` -> `Active` -> `Completed` -> `Verified` linking to `FC-02`) and JobsBoard (`Draft` -> `Active` -> `Paused` -> `Closed` linking to `FC-11`)
- [x] **A3. Product User Manual (17 Chapters in docs/manuals/)**:
  - [x] 01_introduction.md: Platform vision, 6 contexts, canonical glossary, AI philosophy
  - [x] 02_getting_started.md: 5-zone Home Cockpit HUD, switcher, universal search, tours
  - [x] 03_profile_and_resume.md: Profile, AI resume parsing, human review, skill graph
  - [x] 04_project_creation.md: Project creation, AI requirements, skill gaps, team openings
  - [x] 05_team_matching_and_invitations.md: Candidate matching, invitations, join requests
  - [x] 06_project_room_execution.md: Tasks Kanban, milestones, team chat, resources
  - [x] 07_github_and_contributions.md: Repository sync, commit verification, telemetry
  - [x] 08_project_rescue.md: Stalled project rescue, handover notes, vacancy backfills
  - [x] 09_completion_and_certification.md: Verification checklist, digital certificates, QR codes
  - [x] 10_portfolio_and_discovery.md: Verified dossier, showcase, talent search discovery
  - [x] 11_hackathons_and_challenges.md: 48-hour sprint room, sponsored company bounties
  - [x] 12_recruiters_and_companies.md: Job postings, talent radar, candidate pipelines
  - [x] 13_mentorship.md: Mentor profiles, advisory requests, milestone critiques
  - [x] 14_administrators.md: Content moderation, verification queues, taxonomy management
  - [x] 15_workflow_catalog.md: Complete cross-reference for FC-01 through FC-16
  - [x] 16_system_reference.md: System enums, status dictionaries, permissions matrix
  - [x] 17_troubleshooting_and_faq.md: Real blockers, causes, step-by-step remediation
- [x] **A4. Help Center UI & Contextual Drawer**:
  - [x] Interactive `/help` landing with search, tab switching, and flowchart viewer
  - [x] Contextual slide-out `?` Help Drawer mounted globally in Workspace top bar matching current route to manual chapters and mini flowcharts
  - [x] Automated audit scripts: `npm run check:flows` (verified), `npm run check:manuals` (verified)
  - [x] Export scripts: `npm run docs:screenshots` (verified), `npm run docs:manual-pdf` (generates 6 audience-specific bundles in `docs/manuals/pdf/`)

### Part B: Feature-Wise Spotlight Guided Tours
- [x] **B1 & B2. Tour Engine Upgrades (`TourProvider.tsx`, `tours.config.ts`)**:
  - [x] Click-to-advance target capture (`advanceOn: 'click-target'`)
  - [x] Multi-page routing with automatic route changes before highlighting elements
  - [x] MutationObserver with 3s timeout resilience and fallback
  - [x] Per-user per-tour per-version persistence in `localStorage`
  - [x] Accessibility: Esc confirmation dialog, aria-live, high contrast bounding boxes
  - [x] Plain language copy: <=6 words per title, <=2 short sentences per body
- [x] **B3. Tour Catalog**:
  - [x] 5 Welcome Tours: Individual, Recruiter, Company Admin, Mentor, Platform Admin
  - [x] 20 Feature Tours (`T1` to `T20` covering all 34 modules)
- [x] **B4. Entry Points & UI Integration**:
  - [x] Top-bar Tour Menu (`✨ Tour`) with dropdown: Replay Welcome Tour, Tours for This Screen, All 20 Feature Tours, and Reset Tour History
  - [x] Contextual Help Drawer integration (`?`)
  - [x] Home Cockpit HUD `data-tour` attributes on all critical action elements
- [x] **B5. Integration & Verification**:
  - [x] Manual chapters link to "Start Guided Tour"; tours link to manual chapters and flowcharts
  - [x] Zero build/compilation errors in `apps/web` (`tsc && vite build`)
  - [x] All web tests passing cleanly

---

## Decisions Log
1. **Mermaid Flowcharts**: Native Mermaid syntax embedded in `.mmd` files, rendered cleanly in markdown and via SVG in-app with pan/zoom.
2. **Persistence**: Tour progress stored in `localStorage` under `sf_tour_<userId>_<tourId>_v<version>` with status `not_started | in_progress | completed | skipped` and `stepIndex`.
3. **No Feature Creep**: Documentation, manuals, flowcharts, data-tour attributes, and tour engine enhancements only.
4. **Resilient Tour Navigation**: If a DOM element takes time to mount across routes, `TourProvider` observes DOM mutations for up to 3000ms before falling back gracefully rather than crashing.

---

## PRD Mismatches & Real Implementation Truth
- Project lifecycle states in code: `Draft`, `Recruiting`, `Active`, `Completed`, `Verified`, `Archived`.
- Job posting lifecycle states in code: `Draft`, `Active`, `Paused`, `Closed`.
- Both mini pipeline bars accurately reflect these canonical Prisma states.
