# SkillForge Technical Recruiter & Talent Sourcing Guide

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

# Chapter 15: The Complete SkillForge Workflow Flowchart Catalog (FC-01 to FC-16)

This catalog provides an end-to-end reference for all 16 standardized workflow pipeline flowcharts that govern SkillForge. Every flowchart is implemented as a swimlane diagram with explicit decision diamonds, status states, and accessibility alternatives.

---

## 1. FC-01: Platform Master Architecture & Holistic User Journey
- **File**: [`flows/FC-01_Platform_Master.mmd`](./flows/FC-01_Platform_Master.mmd)
- **Purpose**: Provides a bird's-eye view of the entire SkillForge lifecycle from onboarding to hiring.
- **Key Swimlanes**: New User, Project Owner, Team Workspace, Verification & Credentials, Recruiters & Companies.
- **Key Decision**: Whether to start a new project or join an existing team.

---

## 2. FC-02: Project Creation to Certification Full Pipeline
- **File**: [`flows/FC-02_Project_Creation_to_Certification.mmd`](./flows/FC-02_Project_Creation_to_Certification.mmd)
- **Purpose**: Flagship end-to-end engineering pipeline tracing natural-language ideation, AI scaffolding, team recruitment, Project Room execution, peer confirmation, and certificate minting.
- **Key States**: `Draft` -> `Recruiting` -> `Active` -> `Completed` -> `Verified` (or `Archived`).

---

## 3. FC-03: Resume Ingestion, AI Parsing & Profile Normalization
- **File**: [`flows/FC-03_Resume_and_Profile.mmd`](./flows/FC-03_Resume_and_Profile.mmd)
- **Purpose**: Demonstrates the strict Human-in-the-Loop quarantine review screen ensuring no unvetted AI extraction is written to user profiles without explicit consent.
- **Key States**: `uploaded` -> `parsing` -> `review_ready` -> `confirmed`.

---

## 4. FC-04: AI Collaborator Matching & Team Assembly Flow
- **File**: [`flows/FC-04_Matching_and_Team_Formation.mmd`](./flows/FC-04_Matching_and_Team_Formation.mmd)
- **Purpose**: Details the mutual-consent matching engine connecting project owners with complementary builders.
- **Key States**: `suggested` -> `invited` -> `accepted` (or `declined` / `expired` after 7 days).

---

## 5. FC-05: Project Room Execution & Contribution Loop
- **File**: [`flows/FC-05_Project_Room_Loop.mmd`](./flows/FC-05_Project_Room_Loop.mmd)
- **Purpose**: Tracks sprint execution, Kanban task flows, commit linking, and real-time health telemetry.
- **Key States**: `To Do` -> `In Progress` -> `Review` -> `Done`. Health: `Healthy`, `At Risk`, `Needs Attention`.

---

## 6. FC-06: Project Rescue & Skill-Gap Replacement Architecture
- **File**: [`flows/FC-06_Rescue_a_Stalled_Project.mmd`](./flows/FC-06_Rescue_a_Stalled_Project.mmd)
- **Purpose**: Emergency failover protocol triggered by inactivity or departures, packaging handover notes with rescue invitations.
- **Key Principle**: Prior contributors' commit history is permanently preserved in the audit log.

---

## 7. FC-07: Project Completion, Verification & Public Credentials
- **File**: [`flows/FC-07_Completion_Verification_and_Certificate.mmd`](./flows/FC-07_Completion_Verification_and_Certificate.mmd)
- **Purpose**: The rigorous cryptographic verification pipeline minting SHA-256 certificates and scannable QR verification pages.
- **Key Consensus Rule**: 100% of active members must agree on attributions to fast-track verification.

---

## 8. FC-08: Hackathon & Rapid 48-Hour Sprint Lifecycle
- **File**: [`flows/FC-08_Hackathon_or_Sprint.mmd`](./flows/FC-08_Hackathon_or_Sprint.mmd)
- **Purpose**: Time-boxed sprint events featuring rapid solo matching, live countdown clocks, and expedited judging.

---

## 9. FC-09: Company-Sponsored Real-World Challenge Architecture
- **File**: [`flows/FC-09_Company_Challenge.mmd`](./flows/FC-09_Company_Challenge.mmd)
- **Purpose**: Enterprise problem briefs solved by engineering teams, offering bounties and fast-tracked recruiter pipelines.

---

## 10. FC-10: Mentor Layer & Milestone Advisory Flow
- **File**: [`flows/FC-10_Mentorship.mmd`](./flows/FC-10_Mentorship.mmd)
- **Purpose**: Scoped advisory engagements where industry experts critique milestone architecture and endorse completed projects.

---

## 11. FC-11: Recruiter Talent Radar, AI Matching & Hiring Pipeline
- **File**: [`flows/FC-11_Hiring_Pipeline.mmd`](./flows/FC-11_Hiring_Pipeline.mmd)
- **Purpose**: Evidence-based recruitment comparing candidates across 8 standardized Kanban pipeline stages.
- **Key Stages**: `New`, `Reviewed`, `Shortlisted`, `Contacted`, `Interview`, `Selected`, `Rejected`, `Closed`.

---

## 12. FC-12: Individual Opportunity Discovery & Career Inbound
- **File**: [`flows/FC-12_Opportunities_for_Individuals.mmd`](./flows/FC-12_Opportunities_for_Individuals.mmd)
- **Purpose**: How engineers discover matching projects and jobs while maintaining complete control over recruiter contact.

---

## 13. FC-13: Notifications, Invitations & Alert Dispatch Lifecycle
- **File**: [`flows/FC-13_Invitations_and_Notifications.mmd`](./flows/FC-13_Invitations_and_Notifications.mmd)
- **Purpose**: System event bus dispatching inline-actionable alerts, handling 7-day invitation expiry and mute preferences.

---

## 14. FC-14: Platform Governance, Moderation & Audit Architecture
- **File**: [`flows/FC-14_Admin_and_Moderation.mmd`](./flows/FC-14_Admin_and_Moderation.mmd)
- **Purpose**: Administrative oversight encompassing abuse moderation, dispute resolution, certificate revocation, and taxonomy merges.

---

## 15. FC-15: The Six Role Contexts & Dynamic Switching Architecture
- **File**: [`flows/FC-15_Roles_and_Contexts_Map.mmd`](./flows/FC-15_Roles_and_Contexts_Map.mmd)
- **Purpose**: Explains how single user identities switch dynamically between Guest, Individual, Recruiter, Company Admin, Mentor, and Admin.

---

## 16. FC-16: Privacy Boundaries, Data Visibility & Confidentiality
- **File**: [`flows/FC-16_Who_Can_See_My_Data.mmd`](./flows/FC-16_Who_Can_See_My_Data.mmd)
- **Purpose**: Clarifies what is visible to the public, what is shared with recruiters, and what remains strictly confidential inside team rooms.


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


<!-- PAGE BREAK -->

# Chapter 17: Troubleshooting & Frequently Asked Questions (FAQ)

This guide provides causes and actionable solutions for the most common user questions and technical scenarios encountered on SkillForge.

---

## 1. Frequently Asked Questions (FAQ)

### What makes a SkillForge certificate different from other certificates?
Traditional course certificates only verify that someone watched videos or completed quizzes. A SkillForge certificate proves that an individual actually built and delivered working software with a real team. It is backed by immutable cryptographic commit hashes (SHA-256), peer reviews, and live production URLs.

### Can an AI automatically edit my profile without my knowledge?
**Never**. SkillForge strictly adheres to the Human-in-the-Loop mandate. When AI parses your resume or suggests skills, it creates a quarantine draft. No data is ever added to your talent graph until you explicitly review, edit, and click *Confirm & Write to Profile*.

### How do I switch roles?
Look at the top navigation bar. Click the role chip (e.g. `Context: Individual`) and choose another role (such as `Recruiter` or `Mentor`). The interface re-renders instantly without reloading the page.

### Are my private project chats visible to recruiters or companies?
**No**. Recruiter accounts and corporate sponsors can only see verified proof artifacts: certificates, public project cards, and commit metrics. Internal team discussions, 1:1 messages, meeting notes, and internal disputes are strictly confidential and locked behind project membership authorization.

---

## 2. Troubleshooting Guide

### Blocker 1: "I cannot see a project or page when I click a link."
- **Possible Cause**: Your active role context does not have permission to view that page (e.g., trying to access Recruiter Pipeline while in the Individual context).
- **Fix**: Open the Context Switcher in the top bar and switch to the role with matching permissions (e.g. Recruiter or Company Admin).

### Blocker 2: "My project shows 'Error: Project not found'."
- **Possible Cause**: The requested project ID was not seeded in the database or network timed out.
- **Fix**: The platform now includes an automatic canonical fallback that renders canonical projects immediately. If the error persists, click `← View All Projects` to return to the active project catalog.

### Blocker 3: "My resume upload failed or skills were misidentified."
- **Possible Cause**: The file was an image-only scanned PDF or password-protected.
- **Fix**: Export your resume as a standard text-based PDF or DOCX file under 10MB. During the review step, you can manually type any technology that the parser missed.

### Blocker 4: "My GitHub commits are not showing up in my project."
- **Possible Cause**: Your local git email address does not match your SkillForge account email.
- **Fix**: Check `git config user.email` in your terminal. Add that email address as an alias under `/auth/settings`.

### Blocker 5: "My project health displays 'At Risk'."
- **Possible Cause**: No commits have been pushed in the last 7 days or a task is overdue.
- **Fix**: Push an active commit to your linked repository or update the due dates on overdue tasks in the Kanban board.

### Blocker 6: "I cannot contact a candidate on the Talent Radar."
- **Possible Cause**: The candidate has set their inbound recruiter contact preference to `Disabled` or `Shortlist Only`.
- **Fix**: Bookmark the candidate to your pipeline. When the candidate expresses interest in your public job openings, direct messaging will unlock.

---

## 3. How to Report Content or Abuse
If you discover offensive content, plagiarized code, or inappropriate conduct:
1. Click the `...` menu on any project, comment, or candidate card.
2. Select **Report Content**.
3. Choose the violation type (`Plagiarism`, `Harassment`, `Spam`, `Academic Fraud`).
4. Enter supporting notes and click **Submit Report**.
5. Your report immediately routes to the Platform Admin Moderation Queue for review.
