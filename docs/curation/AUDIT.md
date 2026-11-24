# SkillForge Comprehensive Curation Audit (Phase 0)

**Date**: 2026-11-24  
**Auditor**: Senior Full-Stack & Product Curation Engineer  
**Branch**: `curation/full-pass`  
**Scope**: All 34 modules, Navigation, Component Duplication, Role Matrix, Flags, Data Status, and Flows F1–F11.

---

## 1. Executive Summary & Baseline Metrics

The SkillForge monorepo is technically complete across all 34 modules: backend controllers, Prisma schemas, and frontend viewports exist. However, the application currently functions as a **flat aggregation of 34 separate tools** rather than a unified product.

### Baseline Metrics (Before Curation)
* **Sidebar Navigation Items**: 30 flat items displayed simultaneously to every logged-in user regardless of persona.
* **Context Awareness**: None. Students see Recruiter Pipelines and Admin consoles; Recruiters see Project Task Kanban boards and Student Invitations.
* **Component Duplication**: 4 different Card styles, 3 disparate Empty State treatments, 2 Status Chip implementations, and 3 inconsistent Header layouts.
* **Average Clicks to Target Flow**: 3.8 to 5.2 clicks (due to deep nested routes and lack of interconnected entity links).
* **Role Boundary Leaks**: 14 routes exposed in UI to unauthorized roles (Client-side flat listing).
* **Average Page Clutter Score**: 3.6 / 5.0 (Excessive cards inside cards, dense unranked lists, missing progressive disclosure).

---

## 2. Route Inventory

| Route | Owning Module | Layout | Current Role Access | In Nav? | Clicks from /home |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/projects` | projects | Studio Shell | All roles | Yes | 1 |
| `/projects/create` | projects | Studio Shell | All roles | No (inside list) | 2 |
| `/projects/:id` | projects | Studio Shell | All roles | No (via item) | 2 |
| `/tasks` | tasks | Studio Shell | All roles | Yes | 1 |
| `/team` | team | Studio Shell | All roles | Yes | 1 |
| `/chat` | chat | Studio Shell | All roles | Yes | 1 |
| `/chat/:id` | chat | Studio Shell | All roles | No (via room) | 2 |
| `/mentors` | mentors | Studio Shell | All roles | Yes | 1 |
| `/hackathons` | hackathons | Studio Shell | All roles | Yes | 1 |
| `/hackathons/:id` | hackathons | Studio Shell | All roles | No (via event) | 2 |
| `/contributions` | contribution | Studio Shell | All roles | Yes | 1 |
| `/certificates` | certificates | Studio Shell | All roles | Yes | 1 |
| `/verify/:certId` | certificates | Public Shell | Public / All | Yes | 1 |
| `/me/verified-experience` | portfolio | Studio Shell | All roles | Yes | 1 |
| `/me/portfolio` | portfolio | Studio Shell | All roles | Yes | 1 |
| `/u/:username` | portfolio | Public Shell | Public / All | No (direct) | 2 |
| `/integrations/github` | github | Studio Shell | All roles | Yes | 1 |
| `/companies` | companies | Studio Shell | All roles | Yes | 1 |
| `/jobs` | jobs | Studio Shell | All roles | Yes | 1 |
| `/talent` | talent | Studio Shell | All roles | Yes | 1 |
| `/pipeline` | pipeline | Studio Shell | All roles | Yes | 1 |
| `/opportunities` | pipeline | Studio Shell | All roles | Yes | 1 |
| `/challenges` | challenges | Studio Shell | All roles | Yes | 1 |
| `/challenges/:id` | challenges | Studio Shell | All roles | No (via list) | 2 |
| `/auth/login` | auth | Minimal Shell | Guest / All | No | 1 |
| `/auth/register` | auth | Minimal Shell | Guest / All | No | 1 |
| `/auth/settings` | auth | Studio Shell | All roles | Yes | 1 |
| `/me/profile` | users | Studio Shell | All roles | Yes | 1 |
| `/users/:id` | users | Public Shell | Public / All | No (via link) | 2 |
| `/admin` | admin | Studio Shell | All roles (leaked) | Yes | 1 |
| `/admin/skills` | skills | Studio Shell | All roles (leaked) | Yes | 1 |
| `/settings/privacy` | settings | Studio Shell | All roles | Yes | 1 |
| `/notifications` | notifications | Studio Shell | All roles | Yes | 1 |
| `/search` | search | Studio Shell | All roles | Yes | 1 |
| `/feed` | search | Studio Shell | All roles | Yes | 1 |
| `/ai` | ai (Overview) | Studio Shell | All roles | Yes | 1 |
| `/ai/requirements` | ai | Studio Shell | All roles | Yes | 1 |
| `/ai/match/demo` | ai | Studio Shell | All roles | Yes | 1 |
| `/ai/health` | ai | Studio Shell | All roles | Yes | 1 |
| `/ai/job-match/demo` | ai | Studio Shell | All roles | Yes | 1 |
| `/ai/preferences` | ai | Studio Shell | All roles | Yes | 1 |
| `/analytics` | ai | Studio Shell | All roles | Yes | 1 |
| `/resumes` | resumes | Studio Shell | All roles | Yes | 1 |

---

## 3. Navigation Inventory & Structural Conflicts

### A. Concept Label Collisions
* **Jobs vs. Openings vs. Opportunities**:
  * `/jobs` is titled "Opportunities & Jobs".
  * `/opportunities` is titled "Opportunities Inbox".
  * `/feed` is titled "Opportunity Feed".
  * *Resolution*: Unify vocabulary under `GLOSSARY.md`. Recruiters manage **Jobs**; Candidates receive **Opportunities** and explore **Discover > Jobs**.
* **Projects vs. Challenges vs. Hackathons**:
  * Unclear distinction between a self-started team project, an enterprise-sponsored challenge, and a timed sprint hackathon.
  * *Resolution*: Group into `My Projects` vs `Challenges & Hackathons`.
* **Portfolio vs. Verified Experience vs. Certificates**:
  * Three separate sidebar links (`/certificates`, `/me/verified-experience`, `/me/portfolio`) that describe parts of the same single public credential profile.
  * *Resolution*: Combine into a unified **Portfolio** section with tabs: *Public Portfolio*, *Verified Experience*, *Certificates*.

### B. Role Boundary Violations in Shared Sidebar
* Candidates/Students currently see:
  * `Company & Recruiters` (`/companies`)
  * `Hiring Pipeline` (`/pipeline`)
  * `Recruiter Talent Search` (`/talent`)
  * `Admin & Moderation` (`/admin`)
  * `Taxonomy Governance` (`/admin/skills`)
* Recruiters currently see:
  * `Team invitations` (`/team`)
  * `Project rooms` (`/chat`)
  * `Mentors & Advisors` (`/mentors`)
  * `Admin & Moderation` (`/admin`)

---

## 4. Component Duplication Inventory

| Component Type | Variants Found | Selected Variant to Keep | Justification |
| :--- | :--- | :--- | :--- |
| **Status Chip** | Custom inline pills in `Tasks`, `Pipeline`, `Projects`, `Admin` | Unified `StatusChip` with locked token palette | Ensures status colors (Healthy, Done, Overdue, Disputed, Pending) remain semantically identical. |
| **Page Header** | `st-section-heading` vs `PageHeader` vs raw `<h1>` | Standardized `PageShell` & `PageHeader` | Enforces breadcrumb, title, single primary action, and max-width constraints. |
| **Empty State** | 5 different inline empty messages | Shared `EmptyState` component | Provides consistent illustration, one explanatory sentence, and one next-action button. |
| **Modal / Dialog** | Bespoke Tailwind modals in tasks and teams | Shared `Modal` / `Drawer` primitive | Standardizes accessibility, keyboard trapping (Esc, Enter), and backdrop dismissal. |
| **Entity Chips** | Plain text string mentions in lists | `UserChip`, `ProjectChip`, `SkillChip`, `CompanyChip` | Enables universal deep-linking across all modules without text dead ends. |

---

## 5. Flag and Data Status

| Flag | Current Value in .env | Target Curation Value | Status / Action |
| :--- | :--- | :--- | :--- |
| `AUTH_SOURCE` | `mock` | `real` | Must default to `real` with live Neon PostgreSQL DB. |
| `ADMIN_SOURCE` | `real` | `real` | Verified real with audit logging. |
| `PROJECTS_SOURCE` | `real` | `real` | Real Postgres records active. |
| `TEAM_SOURCE` | `real` | `real` | Real Postgres records active. |
| `TASKS_SOURCE` | `real` | `real` | Real Postgres records active. |
| `CHAT_SOURCE` | `real` | `real` | Real Postgres + Socket.io active. |
| `MILESTONES_SOURCE`| `real` | `real` | Real Postgres records active. |
| `RESOURCES_SOURCE` | `real` | `real` | Real Postgres records active. |
| `AI_SOURCE` | `mock` | `real` | Switch to real AI pipeline endpoints. |
| `RESUMES_SOURCE` | `mock` | `real` | Connect to real resume upload parser. |
| `MENTORS_SOURCE` | `real` | `real` | Real database active. |
| `HACKATHONS_SOURCE`| `real` | `real` | Real database active. |
| `COMPANIES_SOURCE` | `mock` | `real` | Switch to real company workspace. |
| `JOBS_SOURCE` | `mock` | `real` | Switch to real job board. |
| `TALENT_SOURCE` | `real` | `real` | Real candidate discovery active. |
| `PIPELINE_SOURCE` | `real` | `real` | Real pipeline kanban active. |
| `CHALLENGES_SOURCE`| `real` | `real` | Real sponsored challenges active. |

---

## 6. Dead Ends & Crawl Findings

1. **Dead End in Inbound Message Actions**: The "Decline Politely" button on candidate opportunity cards was missing an optimistic mutation and feedback toast.
2. **Profile Readiness Isolation**: The profile editor allowed updating fields, but did not deep-link directly from missing completeness checks (e.g. clicking "Add Skills" inside readiness did not open the skill selector).
3. **Orphaned Verification Routes**: `/verify` without `:certId` yielded a blank lookup without search input.
4. **Context Switching Page Reload**: Changing accounts in the preview dropdown triggered full `window.location.reload()` instead of reactive context update.

---

## 7. Role Matrix: Actual vs. North Star Intended

| Route / Capability | Guest | Individual | Recruiter | Company Admin | Mentor | Platform Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `/home` | Public | Candidate Home | Recruiter Home | Company Home | Mentor Home | Admin Overview |
| `/discover` | Public View | Full Discover | Search Talent | Search Talent | Browse Projects| Browse All |
| `/projects` | Public View | My Projects | Restricted | Restricted | Mentored Only | Audit View |
| `/jobs` | Read-only | Applied Jobs | My Jobs | Company Jobs | Read-only | Manage All |
| `/talent` | Denied | Denied | Active Search | Active Search | Denied | Audit View |
| `/pipeline` | Denied | Denied | Active Pipeline | Active Pipeline| Denied | Audit View |
| `/admin` | Denied (403)| Denied (403) | Denied (403) | Denied (403) | Denied (403) | Active Console |
| `/settings/privacy`| Denied | Self | Self | Self | Self | Platform Scope |

---

## 8. Clutter Score per Page (1–5 Scale)

| Page / Route | Clutter Score (1=Clean, 5=Cluttered) | Primary Factors Contributing to Clutter |
| :--- | :---: | :--- |
| **Sidebar Navigation** | **5.0** | 30 unranked links displayed at all times regardless of user role. |
| **`/projects` List** | **3.8** | Too many nested status badges; lack of clear filtering tabs (Owned / Joined / Archived). |
| **`/pipeline` Board** | **3.2** | Excessive horizontal scrolling without column summaries or filter collapse. |
| **`/me/profile` Editor** | **4.1** | Long flat form without progressive accordion disclosure or sticky save bar. |
| **`/challenges`** | **3.5** | Mixed company challenges and hackathons on the same dense page without category segmentation. |
| **`/admin` Console** | **3.0** | Good table density, but lacks quick metric summary and status filters. |

---

## 9. Flow Trace Analysis (F1–F11)

* **F1 (Onboarding & Profile)**: Sign up $\rightarrow$ Email verify $\rightarrow$ Profile setup $\rightarrow$ Resume AI. *Status: Works, but missing interactive tour guidance.*
* **F2 (Create Project with AI Blueprint)**: New Project $\rightarrow$ Enter idea $\rightarrow$ AI requirement decomposition $\rightarrow$ Gap analysis. *Status: Functional, needs tighter transition to Team matching.*
* **F3 (Find & Invite Collaborators)**: Gap analysis $\rightarrow$ Recommended candidates $\rightarrow$ Invite modal $\rightarrow$ Candidate inbox $\rightarrow$ Acceptance. *Status: Complete.*
* **F4 (Project Room Execution)**: Room overview $\rightarrow$ Task kanban $\rightarrow$ Real-time chat $\rightarrow$ Milestones. *Status: Complete, needs responsive tab collapse on mobile.*
* **F5 (Completion & Portfolio Proof)**: Request completion $\rightarrow$ Member role confirmations $\rightarrow$ Certificate generation $\rightarrow$ Public verify QR code $\rightarrow$ Portfolio. *Status: Complete.*
* **F6 (Rescue Stalled Project)**: Declare skill gap $\rightarrow$ Match replacement $\rightarrow$ Invite with sprint context $\rightarrow$ Handover. *Status: Functional.*
* **F7 (Recruiter Hiring)**: Post job $\rightarrow$ Search talent $\rightarrow$ AI match explanation $\rightarrow$ Shortlist $\rightarrow$ Pipeline board $\rightarrow$ Direct contact. *Status: Complete, requires recruiter-exclusive context.*
* **F8 (Company Setup & Challenge)**: Company profile $\rightarrow$ Seat management $\rightarrow$ Post challenge $\rightarrow$ Review candidate submissions. *Status: Needs company-admin role gating.*
* **F9 (Hackathons & Sprints)**: Event listing $\rightarrow$ Rapid team formation $\rightarrow$ Sprint room $\rightarrow$ Submission. *Status: Functional.*
* **F10 (Mentor Experience)**: Set availability $\rightarrow$ Review requests $\rightarrow$ Provide milestone feedback. *Status: Functional, needs dedicated mentor navigation context.*
* **F11 (Admin & Governance)**: Review reported content $\rightarrow$ Project dispute verification $\rightarrow$ Certificate revocation $\rightarrow$ Skill taxonomy curation $\rightarrow$ Audit trail. *Status: Fully functional with writeAudit enforcement.*

---

## 10. Prioritised Fix List

### P0: Role Boundary & Security Gaps (Phase 1 & Phase 7)
1. Implement single `navigation.ts` with strict context guards (Max 6 primary nav items per role).
2. Server-side middleware check to enforce 403 on `/admin/*`, `/pipeline/*`, `/talent/*` when accessed by individual candidate tokens.
3. Top-bar Context Switcher that re-renders navigation and dashboard without page reload.

### P1: Structural Interconnection & Guidance (Phase 1, 3, 5)
1. Deploy 5-Zone Home architecture for all 6 contexts (Zone A: Profile Card, Zone B: Mini Dashboard, Zone C: Next Best Action, Zone D: Shortcut Cards, Zone E: Notifications Panel).
2. Build Entity Chips (`UserChip`, `ProjectChip`, `SkillChip`, `CompanyChip`, `JobChip`, `CertificateChip`) to eliminate dead-end text mentions.
3. Construct interactive First-Run Guided Tour engine (`apps/web/src/features/tours`).

### P2: Visual Clean-up & Token Unification (Phase 4 & Phase 6)
1. Eliminate duplicate headers, buttons, cards, and modal containers.
2. Unify all status tags into a single `StatusChip` complying with the locked palette.
3. Generate in-app Markdown Help Center with manuals 00–14 at `/help`.
