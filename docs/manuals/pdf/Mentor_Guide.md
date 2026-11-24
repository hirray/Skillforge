# SkillForge Senior Mentor & Milestone Advisory Guide

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

# Chapter 13: Mentorship & Expert Advisory Layer

## Who it is for
Industry Mentors, Senior Architects, Advisors, and Project Leads seeking guidance.

## Time to complete
8 minutes

## What you will achieve
Set up your mentor profile and availability, evaluate incoming project mentorship inquiries, review milestone architectures, and provide high-leverage structured feedback.

## Before you start
Switch your active role context to **Mentor** using the top-bar Context Switcher.

---

## The Flow at a Glance
Refer to [FC-10 Mentor Layer & Milestone Advisory Flow](./flows/FC-10_Mentorship.mmd).

---

## Step by Step Guide

### Step 1: Configure Mentor Profile & Availability
- **Where**: Under *Availability* in the navigation bar or navigate to `/mentors`.
- **Action**:
  - Select your architectural specialties (e.g., Distributed Systems, Machine Learning, Security Auditing).
  - Set your weekly advisory availability (e.g., "2 hours/week", "Open for architectural reviews").
  - Configure maximum simultaneous project slots (default: 3 projects).

### Step 2: Review Inbound Mentorship Requests
- **Where**: Navigate to `/mentors` under the *Requests* tab.
- **You will see**: Project inquiries submitted by project owners detailing:
  - Project Problem Statement and current tech stack.
  - Specific milestone where the team needs senior advice.
  - Current health telemetry status.
- **Decision**: Click *Accept* to take on the advisory role, or *Decline* with a polite referral.

### Step 3: Scoped Access to Project Milestones
- **Security Rule**: Mentors receive scoped read access to the project's milestones, architecture documentation, and discussion threads. Mentors do **not** receive write permissions or access to private 1:1 direct messages between team members.

### Step 4: Submit Structured Milestone Feedback
- **Where**: Inside the project *Milestones* or *Discussions* tab.
- **Action**: Click *Leave Milestone Feedback*.
- **Fill Sections**:
  - *Architectural Strengths*: What the team engineered well.
  - *Blindspots & Failure Modes*: Concurrency bottlenecks, missing indexes, unpartitioned queues.
  - *Actionable Next Steps*: Concrete tasks the team must complete before final release.

### Step 5: Final Endorsement & Completed Mentorship
- **Action**: When the project passes its final milestone, the mentor submits a final endorsement.
- **Outcome**: The mentor's verified advisory role is cited on the team's final completion certificate, and the project is added to the mentor's *Mentored Projects* portfolio.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Technical Specialties | Key advisory areas | Yes | 1 to 5 taxonomy domains |
| Availability Status | Weekly advisory capacity | Yes | available, busy, not_available |
| Feedback Rating | Qualitative assessment | Yes | Recommended, Needs Work, Approved |

---

## Common Problems & Fixes
- **Problem**: I am receiving too many mentorship inquiries.
  - *Fix*: Toggle your status to `Busy` in the top-bar availability chip, or lower your maximum simultaneous project slots.

---

## Related Chapters
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)

[Start Mentor Tour](#tour-mentor)


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
