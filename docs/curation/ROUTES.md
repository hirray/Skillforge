# SkillForge Canonical Route & Navigation Manifest (ROUTES.md)

This manifest provides the single source of truth for all routes in SkillForge, specifying their authorization level, primary navigation context, parent layouts, and next-best actions.

---

## 1. Global & Cross-Context Routes

| Route | Context Access | Description | Next-Best Action |
|---|---|---|---|
| `/` | All (`guest` default) | Root redirector routing directly to `/home` or `/discover`. | Redirects to `/home` if authenticated. |
| `/home` | All authenticated | 5-Zone Cockpit HUD tailored per role context. | Launch recommended action or active project room. |
| `/discover` | All | Public & talent exploration hub (projects, people, opportunities). | Apply to join a team or contact talent. |
| `/search` | All | Universal deep search & command palette across modules. | Jump directly to candidate, repo, or challenge. |
| `/help` | All | Help Center, user manuals, and 16 interactive workflow pipeline flowcharts (`FC-01` to `FC-16`). | Walk through relevant visual flowchart. |
| `/notifications` | All authenticated | Inbox and invitations center with instant RSVP actions. | Accept or decline incoming team / interview invitations. |
| `/settings` | All authenticated | Account settings and personal preferences. | Configure notification digest or work mode. |
| `/settings/privacy` | All authenticated | Privacy center, recruiter visibility, and data masking controls. | Adjust public portfolio and search index visibility. |

---

## 2. Individual Context (`individual`)

| Route | Primary Sidebar Item | Description | Next-Best Action |
|---|---|---|---|
| `/home` | Home | Cockpit HUD displaying current project focus, milestones, and KPI metrics. | Open Project Room or review interview inquiries. |
| `/discover` | Discover | Find active projects needing your skills and discover complementary builders. | Request to join project team. |
| `/projects` | My Projects | Collaborative repositories, active sprints, and owned codebases. | Click into project room or create a new project. |
| `/projects/create` | Overflow | AI-assisted project creation wizard with requirements and role generation. | Define team openings and launch project. |
| `/projects/:id` | My Projects | Deep project workspace with Overview, Team, Tasks, Milestones, GitHub, and Certification tabs. | Move tasks on Kanban or mark milestone complete. |
| `/challenges` | Challenges & Hackathons | Active sponsored hackathons, timed sprints, and company bounties. | Register team or submit milestone deliverables. |
| `/me/portfolio` | Portfolio | Verified professional portfolio showcasing attested certificates and code commits. | Share public portfolio URL `/u/:username`. |
| `/u/:username` | Public | Publicly accessible verified engineer dossier. | Download verified CV or contact engineer. |
| `/resumes` | Overflow (Resume Intelligence) | AI resume ingestion, taxonomy normalization, and skill confirmation. | Confirm extracted skills into profile. |
| `/ai/requirements` | Overflow (Project Blueprint AI) | Interactive architecture AI deconstructing project ideas into skill requirements. | Scaffold project from generated blueprint. |
| `/ai/health` | Overflow (Project Health) | Telemetry dashboard tracking milestone velocity, overdue tasks, and rescue alerts. | Initiate project rescue or backfill request. |
| `/integrations/github` | Overflow (GitHub Integration) | GitHub account sync, repository link, and commit verification. | Link repository and sync commit hashes. |

---

## 3. Recruiter Context (`recruiter`)

| Route | Primary Sidebar Item | Description | Next-Best Action |
|---|---|---|---|
| `/home` | Home | Recruiter HUD with open positions, candidate pipeline, and synergy matches. | Review incoming candidate applications. |
| `/jobs` | Jobs | Job postings management with lifecycle controls (`Draft`, `Active`, `Paused`, `Closed`). | Post a new position or review applicants. |
| `/talent` | Talent | Search verified talent pool by attested skills, commit proof, and synergy scores. | Shortlist candidate or send interview inquiry. |
| `/pipeline` | Pipeline | Interactive Kanban candidate hiring pipeline with stages (`Applied`, `Screen`, `Technical`, `Offer`, `Hired`). | Advance candidate or trigger offer consent. |
| `/challenges` | Challenges | Sponsored challenges to evaluate engineering applicants in real workflows. | Review challenge submissions. |
| `/notifications` | Messages | Direct recruiter outreach messaging and candidate responses. | Schedule technical interview. |

---

## 4. Company Admin Context (`company_admin`)

| Route | Primary Sidebar Item | Description | Next-Best Action |
|---|---|---|---|
| `/home` | Home | Executive enterprise dashboard tracking hiring velocity, seat allocation, and challenge engagement. | Invite team recruiters or review billing. |
| `/companies` | Company | Company profile, domain verification, team seats, and verification badges. | Verify domain or purchase recruiting seats. |
| `/jobs` | Jobs | All enterprise job listings across teams. | Review cross-team requisitions. |
| `/talent` | Talent | Candidate search with team-wide notes and shared shortlists. | Tag candidate for recruiter follow-up. |
| `/pipeline` | Pipeline | Consolidated enterprise hiring funnel and time-to-hire metrics. | Approve pending offers. |
| `/challenges` | Challenges | Sponsor and publish company-branded hackathons and bounties. | Launch new sponsored challenge. |

---

## 5. Mentor Context (`mentor`)

| Route | Primary Sidebar Item | Description | Next-Best Action |
|---|---|---|---|
| `/home` | Home | Advisory HUD with pending inquiries, mentored teams, and office hours. | Review incoming advisory requests. |
| `/mentors` | Requests | Mentor network and directory with availability hours filter. | Accept mentorship inquiry. |
| `/mentors/inbox` | Requests | Direct advisory communication and milestone feedback threads. | Submit milestone architecture critique. |
| `/projects` | Mentored Projects | Projects under active technical guidance. | Inspect project architecture and code commits. |

---

## 6. Platform Admin Context (`platform_admin`)

| Route | Primary Sidebar Item | Description | Next-Best Action |
|---|---|---|---|
| `/admin` | Overview | Platform governance, audit logs, and system telemetry. | Inspect flagged activity. |
| `/admin/moderation` | Moderation | Content reports, project disputes, and user suspension controls. | Resolve dispute report. |
| `/admin/skills` | Skills | Global canonical skill taxonomy curation (240+ skills with parent categories). | Add or merge skill taxonomy node. |
| `/admin/certificates` | Certificates | Cryptographic certificate registry and revocation authority. | Verify certificate validity or revoke on infraction. |
| `/admin/ai` | AI Evaluation | Explainable AI evaluation metrics, matching accuracy, and hallucination safeguards. | Adjust ranking weights. |
