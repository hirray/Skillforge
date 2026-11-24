# SkillForge Enterprise Company Administration Guide

**Product Version**: 3.0 Enterprise Edition  
**Date**: November 2026  
**Status**: Production Verified  

---



<!-- PAGE BREAK -->

# Chapter 1: Introduction to SkillForge

## Who it is for
All users: Individual Builders, Students, Freelancers, Technical Recruiters, Company Admins, Mentors, and Platform Administrators.

## Time to complete
5 minutes read

## What you will achieve
Understand SkillForge's core vision, how work transforms into verifiable cryptographic proof, how the 6 role contexts function, and the non-negotiable principle of human judgment supported by evidence.

## Before you start
SkillForge is not a typical job board or social network. It is an end-to-end engineering collaboration and credential ecosystem. Every project completed here generates cryptographic proof of what you actually built.

---

## 1. The Core Philosophy
1. **Proof Over Claims**: In traditional hiring, candidates list buzzwords on resumes without proof. In SkillForge, skills are attested through real codebase commits, pull requests, and peer-reviewed project delivery.
2. **AI with Human-in-the-Loop**: AI accelerates requirement generation, resume extraction, and candidate matching, but AI never makes unilateral decisions. You retain 100% control over profile writes, team acceptance, and candidate shortlists.
3. **The Six Contexts**: One person can hold multiple roles (for example, a Senior Distributed Systems Engineer who also mentors projects and recruits for a startup). SkillForge lets you switch between these roles dynamically with zero page reloads.

---

## 2. The Six Contexts Explained

```
+-----------------------------------------------------------------------------------+
|                              SKILLFORGE USER IDENTITY                             |
+-----------------------------------------------------------------------------------+
         |                    |                   |                  |
         v                    v                   v                  v
  [ Individual ]        [ Recruiter ]      [ Company Admin ]     [ Mentor ]
   Build projects,       Source talent,     Manage seats &        Advise teams &
   earn certs &          run AI matching,   post challenges,      review project
   showcase proof        manage pipeline    view analytics        milestones
```

- **Guest**: Public visitors exploring open-source projects, public portfolios, and verifying certificates via QR code.
- **Individual**: Engineers, designers, students, and freelancers who build projects, complete tasks, earn verifiable certificates, and receive inbound career inquiries.
- **Recruiter**: Talent acquisition professionals searching verified engineers based on repository commits and managing candidate pipelines.
- **Company Admin**: Organization leaders managing company profiles, team recruiter seats, enterprise challenges, and hiring analytics.
- **Mentor**: Experienced domain experts providing milestone feedback and architectural guidance to project teams.
- **Platform Admin**: System stewards presiding over verification queues, moderation reports, skill taxonomy curation, and security audit logs.

---

## 3. Platform Terminology (Canonical Glossary)
- **Project**: A collaborative engineering undertaking with defined requirements, milestones, and members.
- **Project Room**: The central workspace containing tasks, milestones, group chat, resources, and telemetry.
- **Task**: An atomic unit of work with status tracking (To Do, In Progress, Review, Done) and commit evidence.
- **Milestone**: A major delivery phase representing verifiable technical progress.
- **Certificate**: An immutable SHA-256 digital credential with a scannable QR code issued to confirmed project contributors.
- **Verified Experience**: A rich portfolio record generated automatically upon project completion detailing technologies used and real code contributions.
- **Skill Gap**: A missing technical capability required by a project that triggers automated talent matching.

---

## What happens next
Proceed to [Chapter 2: Getting Started](./02_getting_started.md) to learn how to navigate your workspace cockpit HUD and switch role contexts.


<!-- PAGE BREAK -->

# Chapter 2: Getting Started with SkillForge

## Who it is for
New users across all role contexts.

## Time to complete
8 minutes

## What you will achieve
Master the 5-zone Home Cockpit HUD, switch role contexts seamlessly, trigger universal search, and replay interactive spotlight tours on demand.

## Before you start
Ensure you are logged into your account. If you do not have an account, complete registration at `/auth/register`.

---

## Step by Step

### The Flow at a Glance
Refer to [FC-01 Platform Master Architecture](./flows/FC-01_Platform_Master.mmd) and [FC-15 Roles and Contexts Map](./flows/FC-15_Roles_and_Contexts_Map.mmd).

---

## 1. The 5-Zone Home Cockpit Layout
Every role context in SkillForge uses the identical, high-contrast 5-zone layout so your environment always feels familiar:

```
+------------------------------------------------------------------------------------+
| ZONE A: Profile & Readiness Header (Avatar, Headline, Score & Quick Actions)       |
+------------------------------------------------------------------------------------+
| ZONE B: Interactive Mini Dashboard (4 Clickable Metric Tiles with Status Rings)    |
+------------------------------------------------------------------------------------+
| ZONE C: Next Best Action Banner (AI Guidance on Urgent Items & Milestones)         |
+------------------------------------------------------------------------------------+
| ZONE D: Workspace Capabilities Grid (6 to 8 Direct Shortcut Feature Cards)         |
+------------------------------------------------------------------------------------+
| ZONE E: Audited Cryptographic Trail & Inbound Opportunity Alerts (Bottom Split)    |
+------------------------------------------------------------------------------------+
```

### Zone A: Profile & Readiness Header
- **Where**: Top banner of `/home`.
- **You will see**: Your full name, verified headline, profile completion ring, and primary action buttons (`+ Create New Project`, `Upload Resume (AI Parse)`).
- **Tip**: Click *Preview Public Dossier* to see exactly how technical recruiters view your attested profile.

### Zone B: Mini Dashboard Stats
- **Where**: Four metric cards directly beneath Zone A.
- **You will see**:
  - *Active Projects*: Total projects you currently own or collaborate on.
  - *Verified Skills*: Number of technical skills attested through real repository commits.
  - *Inbound Signals*: Recruiter inquiries and project invitations awaiting response.
  - *Extractions Ready*: Parsed resumes waiting for your manual review.
- **Action**: Every tile is clickable and immediately filters to the underlying data list.

### Zone C: Next Best Action Strip
- **Where**: Slim contextual guidance banner across the dashboard.
- **You will see**: AI suggestions highlighting overdue milestones, pending teammate invitations, or unverified skills.

### Zone D: Workspace Capabilities & Menu Grid
- **Where**: Central 6-card interactive command grid.
- **You will see**: Shortcuts to Projects & Delivery Hub, Project Blueprint AI, Collaborator Matching, Resume Intelligence, Inbound Opportunities, and Project Health Telemetry.

### Zone E: Recent Actions & Verified Delivery
- **Where**: Bottom split panels.
- **You will see**: Live cryptographic commit proof trail on the left (SHA-256 commit hashes, attestations) and Inbound Signals & Alerts on the right.

---

## 2. Dynamic Role Context Switching
SkillForge allows you to switch between Individual, Recruiter, Company Admin, and Mentor contexts without reloading:
1. Locate the **Context Switcher** in the top navigation bar.
2. Click the active role pill (e.g. `Context: Individual`).
3. Select an alternative available role from the dropdown menu.
4. The sidebar navigation, dashboard metrics, and allowed capabilities update instantly.

---

## 3. Keyboard Shortcuts & Universal Search
- **Universal Search**: Press `Ctrl + K` (or `Cmd + K` on macOS) anywhere on the platform to open global search for projects, people, jobs, and skills.
- **Quick Tour Replay**: Click the `✨ Tour` button in the top navigation bar at any time to relaunch the spotlight walkthrough.
- **Contextual Help**: Click the `?` icon in the top bar to open the in-app help drawer for your current screen.

---

## Field Reference
| Element | Description | Requirement | Limits |
|---|---|---|---|
| Context Switcher | Active role environment | Always active | Maximum 6 primary nav items per role |
| Search Bar | Platform-wide entity search | Optional | Supports keywords, skill tags, project IDs |
| Tour Replay | Relaunches feature walkthrough | Optional | Remembers completion in local storage |

---

## Common Problems & Fixes
- **Problem**: I cannot see the Recruiter or Company Admin option in the Context Switcher.
  - *Cause*: Your account only has Individual membership privileges.
  - *Fix*: Create a company organization at `/companies` or request an invitation from your company admin.
- **Problem**: The notification bell shows an unread count but I cannot find the invite.
  - *Fix*: Navigate to `/team` or `/notifications` and select the *Pending Invitations* filter.

---

## Related Chapters
- [Chapter 3: Profile & Resume Intelligence](./03_profile_and_resume.md)
- [Chapter 4: Project Creation & Scaffolding](./04_project_creation.md)

[Start Guided Welcome Tour](#tour-welcome)


<!-- PAGE BREAK -->

# Chapter 11: Hackathons, Sprints & Sponsored Company Challenges

## Who it is for
Individual Developers, Competitive Hackathon Teams, and Enterprise Challenge Sponsors.

## Time to complete
10 minutes

## What you will achieve
Participate in rapid 48-hour engineering hackathons with live sprint countdowns, solve sponsored enterprise challenges, and earn company-endorsed verified credentials.

## Before you start
Ensure your profile has at least 3 declared skills and that you have connected your GitHub account.

---

## The Flow at a Glance
Refer to [FC-08 Hackathon & Rapid 48-Hour Sprint Lifecycle](./flows/FC-08_Hackathon_or_Sprint.mmd) and [FC-09 Company-Sponsored Real-World Challenge Architecture](./flows/FC-09_Company_Challenge.mmd).

---

## Step by Step

### Part 1: Hackathons & Sprint Mode

### Step 1: Browse Upcoming Hackathons
- **Where**: Under *Challenges & Hackathons* in the sidebar or navigate to `/hackathons`.
- **You will see**: Event cards listing theme, countdown timer, prize pool, and registration deadline.

### Step 2: Register & Rapid Teammate Matching
- **Action**: Click *Register for Hackathon*.
- **Solo vs Team**:
  - If you already have a team, enter your team name.
  - If you are solo, select *Find Me Teammates*. SkillForge's rapid matcher groups you with complementary builders based on backend, frontend, and design skill overlap.

### Step 3: 48-Hour Sprint Room Execution
- **You will see**: The specialized Sprint Room with:
  - Live clock counting down to the hard deadline.
  - Expedited 3-milestone structure: `Architecture MVP`, `Core Logic & API`, `Polish & Demo`.
  - Automated continuous GitHub commit tracking.

### Step 4: Final Submission & Judging
- **Action**: Before the timer expires, submit your GitHub release tag, live deployment link, and 2-minute video walkthrough.
- **Outcome**: Submissions are scored by technical judges; valid projects receive official Hackathon Sprint Certificates.

---

## Part 2: Sponsored Company Challenges

### Step 1: Browse Enterprise Challenges
- **Where**: Navigate to `/challenges`.
- **You will see**: Verified company challenges (e.g., "Build a Low-Latency Fraud Detection Pipeline", "Zero-Knowledge Proof Verifier").
- **Rewards**: Cash bounties, enterprise software grants, or direct interview fast-tracks.

### Step 2: Launch Challenge Workspace
- **Action**: Click *Take on Challenge*.
- **You will see**: A dedicated challenge workspace initialized with the company's architectural constraints and test suites.

### Step 3: Company Review & Hiring Fast-Track
- **Action**: The sponsoring company's engineering team audits your code, test coverage, and architecture.
- **Outcome**: Teams with high scores receive:
  - Cash prize payout.
  - Company-endorsed Verified Experience badge on their portfolio.
  - Direct fast-track into the company's senior engineering interview pipeline.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Hackathon Team Name | Unique team identifier | Yes | 3-30 characters |
| Demo Video URL | Loom, YouTube, or MP4 link | Yes | Max 3 minutes |
| Submission Repo | Linked GitHub repository | Yes | Must contain public commits |

---

## Common Problems & Fixes
- **Problem**: I missed the 48-hour submission deadline.
  - *Cause*: Hackathon countdown timers strictly lock submissions at `00:00:00`.
  - *Fix*: You can still convert the workspace into a standard public project at `/projects/create` and complete it via the normal certification pipeline.

---

## Related Chapters
- [Chapter 4: Project Creation & Scaffolding](./04_project_creation.md)
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)

[Start Hackathons Tour](#tour-hackathons)


<!-- PAGE BREAK -->

# Chapter 12: Recruiter Radar, AI Candidate Matching & Hiring Pipeline

## Who it is for
Technical Recruiters, Engineering Hiring Managers, and Company Administrators.

## Time to complete
15 minutes

## What you will achieve
Set up your company profile, post jobs with required taxonomy skills, search verified engineers using commit-based evidence, compare candidates side-by-side, and manage prospects across an 8-stage hiring pipeline.

## Before you start
Switch your active role context to **Recruiter** or **Company Admin** using the top-bar Context Switcher.

---

## The Flow at a Glance
Refer to [FC-11 Recruiter Talent Radar, AI Matching & Hiring Pipeline](./flows/FC-11_Hiring_Pipeline.mmd).

---

## Step by Step Guide

### Step 1: Set Up & Verify Your Company Profile
- **Where**: Switch to *Company Admin* and navigate to `/companies`.
- **Action**:
  - Fill in Company Name, Logo, Website, and Engineering Overview.
  - Upload corporate verification proof (e.g. corporate email domain, business registration).
  - Invite technical recruiters to team seats.

### Step 2: Post a Job Opening
- **Where**: Under *Jobs* in the navigation bar or navigate to `/jobs`.
- **Action**: Click `+ Post New Job`.
- **Fill Details**:
  - *Job Title*: E.g., "Senior Distributed Systems Engineer".
  - *Location & Work Mode*: `remote`, `hybrid`, `onsite`.
  - *Required Skills*: Select from canonical taxonomy (e.g. `Kafka`, `Go`, `Docker`).
  - *Compensation Range*: Base salary range and equity options.
- **Publish**: State moves to `Active`. Candidates can now discover the role in their opportunity feeds.

### Step 3: Search the Talent Radar with Evidence Filters
- **Where**: Navigate to `/talent`.
- **Action**: Filter candidates based on actual verified work rather than resume text:
  - Minimum number of verified git commits (e.g., >20 commits).
  - Completed verified project certificates in specific domains.
  - Availability status (`available_immediate`, `open_to_offers`).

### Step 4: Run AI Job-to-Talent Matching
- **Where**: In `/ai/job-match` or click *Run AI Match* on your job card.
- **You will see**: Candidates ranked into match tiers:
  - `Strong Match` (85-100%): Covers all required skills with proven commit logs.
  - `Good Match` (70-84%): Strong core skills, adjacent secondary technologies.
  - `Adjacent Skills`: High architectural fundamentals, rapid learning trajectory.
- **Explainability**: Every match card cites explicit reasons (e.g. "Contributed 14 verified commits to proj-consensus covering Raft leader election").

### Step 5: Side-by-Side Candidate Comparison
- **Action**: Select up to 3 candidate checkboxes and click *Compare Candidates*.
- **You will see**: A side-by-side comparison matrix evaluating:
  - Verified codebase commits across production repos.
  - Skill depth and taxonomy proficiency.
  - Real project delivery completion rates.

### Step 6: Manage Candidates in the 8-Stage Pipeline
- **Where**: Navigate to `/pipeline`.
- **You will see**: The standardized Kanban pipeline across 8 stages:
  `New` -> `Reviewed` -> `Shortlisted` -> `Contacted` -> `Interview` -> `Selected` -> `Rejected` -> `Closed`
- **Private Team Notes**: Add internal feedback visible only to teammates on your company account.

### Step 7: Consent-Gated Candidate Contact
- **Core Rule**: To prevent spam, direct outreach messages can only be dispatched if the candidate has enabled recruiter outreach in their privacy settings.
- **Action**: Click *Send Outreach Message*. The candidate receives a high-priority inquiry detailing role parameters and compensation.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Job Title | Official title of role | Yes | 5-100 characters |
| Work Mode | Remote, hybrid, or onsite | Yes | Enum |
| Required Skills | Mandatory taxonomy capabilities | Yes | 1 to 10 skills |
| Pipeline Stage | Candidate stage in hiring funnel | System | 8 standardized stages |

---

## Common Problems & Fixes
- **Problem**: I cannot message a strong candidate on the Talent Radar.
  - *Cause*: The candidate has disabled inbound recruiter outreach in `/settings/privacy`.
  - *Fix*: You can bookmark their profile to your private shortlist. If they later express interest in your job posting, messaging will unlock.
- **Problem**: Candidate match scores show 0%.
  - *Cause*: The job posting has no skills tagged from the canonical taxonomy.
  - *Fix*: Edit the job at `/jobs` and select skills from the taxonomy auto-complete dropdown.

---

## Related Chapters
- [Chapter 10: Portfolio & Opportunity Discovery](./10_portfolio_and_discovery.md)
- [Chapter 14: Platform Governance & Admin Tools](./14_administrators.md)

[Start Recruiter Hiring Tour](#tour-recruiter-hiring)


<!-- PAGE BREAK -->

# Chapter 16: Complete System Reference & Status Dictionary

This reference chapter documents every status enum, notification trigger, field constraint, and role permission enforced across SkillForge.

---

## 1. Status Dictionary

### Project Lifecycle States
- `Draft`: Project created by owner; requirements or team settings still being finalized. Hidden from public discovery.
- `Recruiting`: Published and actively seeking collaborators; AI matching and join requests enabled.
- `Active`: Minimum team capacity reached and mutual consent confirmed; Project Room is open.
- `Paused`: Project temporarily suspended by owner. Tasks and milestone countdowns paused.
- `Completed`: All milestones delivered and completion checklist submitted; locked for peer attestation.
- `Archived`: Final verified state; read-only evidence preserved indefinitely.

### Task Workflow States
- `To Do`: Task defined and assigned to a collaborator; work has not begun.
- `In Progress`: Assignee actively developing the deliverable.
- `Review`: Deliverable submitted; awaiting peer review and linked to a commit SHA or PR URL.
- `Done`: Code reviewed and merged; progress credited to linked milestone.
- `Blocked`: Work impeded by dependency or technical issue.

### Project Health Telemetry Statuses
- `Healthy`: Velocity on track; commits logged within the past 7 days; zero overdue tasks.
- `At Risk`: One or more tasks overdue by 3-7 days, or low commit cadence detected.
- `Needs Attention`: Milestones delayed by >7 days or critical role unstaffed. Rescue workflow recommended.

### Pipeline Stages (Recruiter ATS)
- `New`: Candidate matched or inbound application received.
- `Reviewed`: Recruiter examined candidate's verified commit evidence.
- `Shortlisted`: Candidate saved to active hiring consideration list with internal notes.
- `Contacted`: Initial outreach message dispatched (consent-gated).
- `Interview`: Active technical or architectural evaluation in progress.
- `Selected`: Candidate extended an engineering job offer.
- `Rejected`: Candidate disqualified for this opening with respectful notice.
- `Closed`: Requisition filled or requisition closed.

### Certificate Verification States
- `Issued`: Valid cryptographic credential minted with SHA-256 hash.
- `Verified`: Authenticity confirmed by public verification lookup.
- `Revoked`: Invalidated by Platform Administrator due to plagiarism or compliance violation.

---

## 2. Notification Triggers
| Notification Type | Trigger Event | Inline Action |
|---|---|---|
| `project_invitation` | Owner invites candidate to fill open role | Accept / Decline |
| `join_request` | Candidate requests to join project | Approve / Decline |
| `task_assigned` | Task assigned to collaborator | View Task |
| `milestone_review` | Milestone submitted for peer review | Approve Milestone |
| `completion_attestation` | Project completed; member confirmation needed | Confirm Role & Proof |
| `recruiter_outreach` | Verified recruiter sends hiring inquiry | Accept / Decline Chat |
| `project_health_alert` | Project drops to At Risk or Needs Attention | Open Rescue Wizard |

---

## 3. Permissions Matrix
| Capability | Guest | Individual | Recruiter | Company Admin | Mentor | Platform Admin |
|---|---|---|---|---|---|---|
| Browse Public Projects | Yes | Yes | Yes | Yes | Yes | Yes |
| Create Project | No | Yes | No | Yes | No | Yes |
| Project Room (Chat, Tasks) | No | Member only | No | No | Read-only | Full Audit |
| Upload Resume | No | Yes | No | No | No | Yes |
| Post Jobs | No | No | Yes | Yes | No | Yes |
| Search Talent Radar | No | No | Yes | Yes | No | Yes |
| Pipeline Management | No | No | Yes | Yes | No | Yes |
| Submit Milestone Feedback | No | No | No | No | Yes | Yes |
| Revoke Certificate | No | No | No | No | No | Yes |
| Curate Skill Taxonomy | No | No | No | No | No | Yes |

---

## 4. Keyboard Shortcuts
- `Ctrl + K` / `Cmd + K`: Universal search across all entities.
- `Esc`: Dismiss guided spotlight tour or close modal.
- `Right Arrow` / `Enter`: Advance to next spotlight tour step.
- `Left Arrow`: Return to previous spotlight tour step.
