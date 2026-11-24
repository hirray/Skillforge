# SkillForge Individual Builder & Candidate User Manual

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

# Chapter 3: Profile Setup, Skills & Resume Intelligence

## Who it is for
Individual Builders, Students, Freelancers, and Technical Candidates.

## Time to complete
10 minutes

## What you will achieve
Upload your existing resume, let SkillForge AI normalize your skills into canonical taxonomy entities, perform mandatory human review before writing to your profile, and configure your privacy visibility.

## Before you start
Prepare your resume file in PDF or DOCX format. Keep it under 10MB.

---

## The Flow at a Glance
Refer to [FC-03 Resume Ingestion, AI Parsing & Profile Normalization](./flows/FC-03_Resume_and_Profile.mmd).

---

## Step by Step Guide

### Step 1: Access Resume Intelligence
- **Where**: Click *Resume Intelligence* in the Zone D home shortcuts or navigate to `/resumes`.
- **You will see**: The Resume Studio upload container with drag-and-drop support.
- **Tip**: You can upload updated versions at any time without losing previous verified skills.

### Step 2: Upload Your Resume File
- **Action**: Drag your resume into the drop zone or click *Browse Files*.
- **You will see**: The extraction pipeline status move from `uploaded` to `parsing` and then `review_ready`.
- **Core Rule**: SkillForge **NEVER** automatically writes extracted information to your public profile without your explicit review.

### Step 3: Mandatory Human-in-the-Loop Review
- **Where**: The side-by-side extraction review drawer.
- **You will see**: Extracted skills, work experience dates, and degrees mapped against canonical taxonomy items.
- **Action**:
  - Adjust proficiency levels (`beginner`, `intermediate`, `expert`).
  - Delete any skill misidentified by the AI parser.
  - Add any missing technologies.
- **Confirmation**: Click the purple *Confirm & Write to Profile* button.

### Step 4: Link Codebase Skill Evidence
- **Where**: Navigate to `/me/profile` under the *Skills* tab.
- **Action**: Next to each skill, click *Attach Evidence* to link a GitHub commit hash, pull request URL, or completed SkillForge project.
- **You will see**: An `Attested` badge appear next to verified skills on your talent graph.

### Step 5: Configure Profile Visibility
- **Where**: In `/settings/privacy` or the top of `/me/profile`.
- **Options**:
  - `Public`: Anyone on the web can view your profile and verified proof.
  - `Registered Users`: Only authenticated SkillForge members can view.
  - `Recruiters Only`: Public cannot see your profile, but verified corporate recruiters can discover you on the Talent Radar.
  - `Private`: Completely hidden from discovery; only members of your active projects can see your details.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Resume File | PDF or DOCX resume document | Yes | Max 10MB |
| Skill Name | Canonical technology name (e.g. React, Kafka) | Yes | Validated against taxonomy |
| Proficiency | Self-assessed technical depth | Yes | beginner, intermediate, expert |
| Availability | Current weekly commitment capacity | Yes | available, busy, not_available |
| Visibility | Public discovery policy | Yes | public, registered, recruiters_only, private |

---

## Common Problems & Fixes
- **Problem**: The AI parser mapped my custom framework incorrectly.
  - *Cause*: The technology is an alias or proprietary library not in the canonical taxonomy.
  - *Fix*: Edit the skill name manually during Step 3, or propose a new skill in `/admin/skills`.
- **Problem**: Recruiters are not finding my profile in search.
  - *Cause*: Your profile visibility is set to `Private` or `Registered Users`.
  - *Fix*: Change visibility to `Recruiters Only` or `Public` in `/settings/privacy`.

---

## Related Chapters
- [Chapter 4: Project Creation & Scaffolding](./04_project_creation.md)
- [Chapter 10: Portfolio & Opportunity Discovery](./10_portfolio_and_discovery.md)

[Start Resume Upload Tour](#tour-resume-upload)


<!-- PAGE BREAK -->

# Chapter 4: Launching an Engineering Project & AI Scaffolding

## Who it is for
Project Creators, Team Leads, Technical Founders, and Individual Builders.

## Time to complete
12 minutes

## What you will achieve
Create a collaborative engineering project by describing your concept in plain English, using SkillForge AI to scaffold technical requirements and identify team skill gaps before publishing.

## Before you start
Have a rough problem statement or technical objective in mind. You do not need a fully structured specification—the AI will help deconstruct it.

---

## The Flow at a Glance
Refer to [FC-02 Project Creation to Certification Full Pipeline](./flows/FC-02_Project_Creation_to_Certification.mmd).

---

## Step by Step Guide

### Step 1: Click '+ Create Project'
- **Where**: Top right of Home or Projects page, or navigate to `/projects/create`.
- **You will see**: The Project Creation Wizard form.

### Step 2: Describe Your Idea in Natural Language
- **Action**: Fill in the *Project Title*, select a *Category* (e.g. Systems & Backend, Machine Learning, Fullstack), and describe the problem in the *Problem Statement* field.
- **Tip**: Be specific about the engineering challenge (e.g. "Real-time payment fraud detector with sub-10ms latency using Kafka and graph neural networks").

### Step 3: Trigger AI Requirement Scaffolding
- **Action**: Click the purple *AI Deconstruct Requirements* button (or visit `/ai/requirements`).
- **You will see**:
  - Suggested technical roles (e.g., Lead Architect, Streaming Engineer, ML Ops).
  - Recommended core technologies and proficiency levels.
  - Delivery phase timeline suggestions.

### Step 4: Review and Edit Recommendations (Human Override)
- **Action**: You have complete authority to override AI suggestions:
  - Add or remove specific skills.
  - Change requirement weight from `required` to `preferred`.
  - Set *Min Team Size* (default 1) and *Max Team Size* (default 5).

### Step 5: Inspect the Skill-Gap Analysis
- **Where**: The Skill Gap strip at the bottom of the creation form.
- **You will see**: A clear breakdown of skills:
  - `Covered`: Skills you already possess based on your verified profile.
  - `Partial`: Skills you possess at a lower proficiency than required.
  - `Missing`: Skills your project needs where no current member has verified experience.

### Step 6: Save Draft or Publish for Recruiting
- **Action**: Click *Publish Project*.
- **You will see**: The project status transitions from `Draft` to `Recruiting`, and AI collaborator matching is immediately activated.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Title | Public project name | Yes | 5-100 characters |
| Problem Statement | Detailed description of the technical problem | Yes | 20-2000 characters |
| Category | Technical domain | Yes | Select from preset domains |
| Min / Max Team Size | Minimum and maximum collaborator headcount | Yes | 1 to 10 members |
| Target Date | Target milestone completion date | Optional | Future date |
| Visibility | Discovery policy | Yes | Public or Private |

---

## Common Problems & Fixes
- **Problem**: The AI suggested technologies I do not want to use.
  - *Cause*: AI provides generalized recommendations based on typical architectures.
  - *Fix*: Click the trash can icon next to any unwanted requirement and manually add your preferred stack.
- **Problem**: I cannot publish my project.
  - *Cause*: Minimum team size exceeds maximum team size, or required fields are missing.
  - *Fix*: Check that Title, Problem Statement, and valid team bounds are filled.

---

## Related Chapters
- [Chapter 5: Collaborator Matching & Team Formation](./05_team_matching_and_invitations.md)
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)

[Start Project Creation Tour](#tour-create-project)


<!-- PAGE BREAK -->

# Chapter 5: Collaborator Matching, Invitations & Team Assembly

## Who it is for
Project Owners looking for builders, and Individual Contributors seeking projects to join.

## Time to complete
10 minutes

## What you will achieve
Find complementary collaborators using SkillForge's explainable AI matching engine, issue role-specific invitations, handle inbound join requests, and establish mutual consent before work begins.

## Before you start
Publish an engineering project (status: `Recruiting`) or have a completed profile ready for discovery.

---

## The Flow at a Glance
Refer to [FC-04 AI Collaborator Matching & Team Assembly Flow](./flows/FC-04_Matching_and_Team_Formation.mmd).

---

## Step by Step Guide

### Step 1: Open Collaborator Matching
- **Where**: Inside your project under the *Team* tab, or visit `/ai/match`.
- **You will see**: Candidate cards ranked by a percentage synergy score (0-100%).

### Step 2: Understand the Synergy Breakdown (Explainability)
- **Action**: Click *Why this match?* on any candidate card.
- **You will see**: An explainable breakdown rather than a black-box number:
  - *Skill Overlap*: Identifies which of your project's missing gaps this candidate covers.
  - *Timezone Compatibility*: Evaluates working hour overlap.
  - *Past Evidence*: Cites verified commit history or completion certificates.

### Step 3: Issue a Role-Specific Invitation
- **Action**: Click *Invite to Project*.
- **Where**: The invitation modal.
- **You will see**: Options to select the specific role opening (e.g. "Distributed Systems Engineer") and append a personalized orientation note.
- **Dispatch**: The candidate immediately receives an alert in their notifications and inbox.

### Step 4: The Candidate Experience (Responding to Invites)
- **Where**: In `/notifications` or `/team` under *My Invitations*.
- **You will see**: The project title, problem statement, required role, and owner's note.
- **Action**: Click *Accept* or *Decline*.
- **Expiry Rule**: Invitations automatically expire after 7 days if unresponded to ensure teams do not remain stalled.

### Step 5: Handling Inbound Join Requests
- **Where**: Project *Team* tab under *Join Requests*.
- **Action**: Review incoming requests submitted by developers who found your project on the Discover feed.
- **Decision**: Click *Approve* to assign their role, or *Decline* with optional feedback.

### Step 6: Team Formation & Activation
- **Outcome**: Once minimum team size is satisfied and mutual consent is recorded, the project status automatically transitions to `Active`.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Role Title | Title assigned to collaborator | Yes | E.g. Frontend Lead, ML Ops |
| Invitation Note | Personal message from project owner | Optional | Max 500 characters |
| Invitation Status | Lifecycle state of the invitation | System | pending, accepted, declined, expired |

---

## Common Problems & Fixes
- **Problem**: Candidate cannot see my project invitation.
  - *Cause*: Candidate has muted project notifications or invitation expired.
  - *Fix*: Check `/team` in your project to see if the invitation is marked `expired`. If so, re-send the invite.
- **Problem**: The project remains in 'Recruiting' even though members joined.
  - *Cause*: The number of confirmed members is below your configured `Min Team Size`.
  - *Fix*: Invite additional collaborators or lower the minimum team size in Project Details.

---

## Related Chapters
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)
- [Chapter 8: Project Rescue & Emergency Handover](./08_project_rescue.md)

[Start Team Matching Tour](#tour-find-collaborators)


<!-- PAGE BREAK -->

# Chapter 6: Project Room Collaboration & Delivery Execution

## Who it is for
Project Owners, Team Members, and Assigned Mentors.

## Time to complete
15 minutes

## What you will achieve
Run your engineering sprint using the Project Room: organize tasks on a Kanban board, link pull request evidence, track delivery milestones, use group and direct chat, and monitor project health telemetry.

## Before you start
Have an active project (status: `Active`) with at least one confirmed collaborator.

---

## The Flow at a Glance
Refer to [FC-05 Project Room Execution & Contribution Loop](./flows/FC-05_Project_Room_Loop.mmd).

---

## Step by Step Guide

### Step 1: Open the Project Room
- **Where**: Click *Projects & Delivery Hub* from Home or navigate to `/projects/:id`.
- **You will see**: The Project Room navigation tabs: *Overview*, *Team*, *Tasks*, *Milestones*, *Contributions*, *Resources*, *Discussions*, and *Analytics*.

### Step 2: Organize Work on the Kanban Board
- **Where**: The *Tasks* tab.
- **Action**:
  - Click `+ New Task`. Enter Title, Description, Milestone linkage, Priority (`Low`, `Medium`, `High`, `Urgent`), and Assignee.
  - Drag task cards across columns: `To Do` -> `In Progress` -> `Review` -> `Done`.
  - When moving to `Review`, paste your GitHub commit hash or pull request link.

### Step 3: Track Milestones & Delivery Velocity
- **Where**: The *Milestones* tab.
- **You will see**: The chronological timeline of milestones with individual progress bars calculated from completed linked tasks.
- **Action**: When all linked tasks reach `Done`, the milestone lead marks the milestone `Under Review` for owner approval.

### Step 4: Real-Time Team Communication
- **Where**: The *Discussions* tab (or `/chat/:id`).
- **You will see**:
  - *Group Chat*: Public to all confirmed project members. Share code snippets, architecture diagrams, and sprint goals.
  - *Direct Messages*: Private 1:1 channels between collaborators.
  - *Meeting Notes*: Structured repository of sprint sync notes, action items, and technical decisions.

### Step 5: Monitor Project Health Telemetry
- **Where**: The *Analytics* tab or the project header health pill.
- **You will see**: Real-time automated health indicators:
  - `Healthy`: Normal task velocity, active commits, milestones on schedule.
  - `At Risk`: One or more tasks overdue by >5 days, or low commit activity.
  - `Needs Attention`: Milestone deadline breached or key contributor inactive.
- **Recommended Action**: If health drops, the system recommends reallocating tasks or initiating a Project Rescue.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Task Title | Description of work item | Yes | 3-120 characters |
| Task Priority | Urgency ranking | Yes | Low, Medium, High, Urgent |
| Assignee | Assigned team member | Optional | Must be confirmed project member |
| Milestone Name | Objective title | Yes | E.g. MVP Core, API Integration |
| Target Date | Due date for milestone | Yes | Future date |

---

## Common Problems & Fixes
- **Problem**: Moving a task to 'Done' does not increase milestone progress.
  - *Cause*: The task was not associated with that specific milestone when created.
  - *Fix*: Click the task to edit it, select the milestone from the dropdown, and save.
- **Problem**: Project health displays 'At Risk' even though we are actively coding.
  - *Cause*: GitHub integration is not linked, so commits are not being streamed to the platform telemetry.
  - *Fix*: Connect your repository in the *GitHub* tab (see Chapter 7).

---

## Related Chapters
- [Chapter 7: GitHub & Contribution Evidence](./07_github_and_contributions.md)
- [Chapter 8: Project Rescue & Emergency Handover](./08_project_rescue.md)

[Start Project Room Tour](#tour-project-room)


<!-- PAGE BREAK -->

# Chapter 7: GitHub Integration & Contribution Evidence

## Who it is for
Individual Contributors, Team Leads, and Project Owners.

## Time to complete
8 minutes

## What you will achieve
Link your project to a GitHub repository, automatically stream commit logs and pull requests into your contribution ledger, and generate verifiable cryptographic evidence for each team member.

## Before you start
Ensure you have a GitHub account and administrative or contributor access to the repository you want to link.

---

## The Flow at a Glance
Refer to [FC-05 Project Room Execution & Contribution Loop](./flows/FC-05_Project_Room_Loop.mmd).

---

## Step by Step Guide

### Step 1: Connect GitHub via OAuth
- **Where**: Navigate to `/integrations/github` or the *GitHub* tab inside your project.
- **Action**: Click *Connect GitHub Account*.
- **You will see**: The standard GitHub authorization dialog requesting read access to repositories and commit metadata.
- **Safety**: SkillForge requests minimal read permissions; it never requests write access or personal repository deletion rights.

### Step 2: Link Repository to Your SkillForge Project
- **Where**: In the Project Room *GitHub* panel.
- **Action**: Select the target repository from the dropdown menu (or enter the repository full path `owner/repo-name`).
- **Confirmation**: Click *Link Repository*.
- **Sync**: The integration immediately indexes repository commit history, branches, and merged pull requests.

### Step 3: Automated Contribution Evidence Extraction
- **Action**: When team members push commits or merge pull requests, SkillForge matches the git author email to confirmed team member profiles.
- **You will see**: Real-time commits appear under the *Contributions* tab:
  - Commit SHA-256 hash.
  - Number of lines added / deleted.
  - Linked task ID (if the commit message included `#task-id`).

### Step 4: Reviewing Your Contribution Profile
- **Where**: Inside the project *Contributions* tab.
- **You will see**: A breakdown per member:
  - Total commits contributed.
  - Core technologies touched (e.g. TypeScript, Kafka, Docker).
  - Peer-attested review score.

### Step 5: Handling Wrong Attributions & Disputes
- **Action**: If a commit is attributed to the wrong member or missing:
  1. Click *Contest Attribution* next to the commit entry.
  2. Provide the correct git author email or co-author metadata.
  3. The project owner or team consensus reviews and confirms the correction.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Repository Name | Full GitHub repo identifier (`org/repo`) | Yes | Valid public or authorized private repo |
| Commit Hash | SHA-1 or SHA-256 commit identifier | System | 40-character hex string |
| Linked Task | Associated Kanban task ID | Optional | Must exist in current project |

---

## Common Problems & Fixes
- **Problem**: My commits are not showing up under my name.
  - *Cause*: The email address configured in your local git client (`git config user.email`) does not match your SkillForge account email.
  - *Fix*: Add your git email as an alias in `/auth/settings`, or link the commits manually with task IDs.
- **Problem**: Synchronization appears paused.
  - *Cause*: GitHub OAuth token expired or rate limit reached.
  - *Fix*: Click *Re-sync Repository* in the GitHub panel to refresh the OAuth token.

---

## Related Chapters
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)

[Start GitHub Integration Tour](#tour-github-evidence)


<!-- PAGE BREAK -->

# Chapter 8: Project Rescue & Emergency Handover

## Who it is for
Project Owners facing collaborator inactivity, and Incoming Replacement Engineers taking over stalled projects.

## Time to complete
10 minutes

## What you will achieve
Recover a stalled or abandoned project by declaring an emergency skill gap, writing a structured handover brief, sourcing replacement talent, and preserving prior contributors' commit history without losing momentum.

## Before you start
Identify which role or technical component is blocked. If an inactive member has been unresponsive for >7 days, document the affected tasks.

---

## The Flow at a Glance
Refer to [FC-06 Project Rescue & Skill-Gap Replacement Architecture](./flows/FC-06_Rescue_a_Stalled_Project.mmd).

---

## Step by Step Guide

### Step 1: Detect Stalled Milestones or Inactive Members
- **Where**: The Project Room header banner or `/ai/health`.
- **You will see**: If telemetry detects zero commits or overdue tasks for >10 days, a red alert banner appears: *Project Stalled: Rescue Recommended*.

### Step 2: Declare an Emergency Project Gap
- **Where**: Project Details under *Team* -> *Project Rescue* (or `/projects/:id/rescue`).
- **Action**: Click *Declare Gap*.
- **You will see**: The Gap Wizard modal prompting for:
  - Role Title (e.g. "Replacement Backend Lead").
  - Trigger Reason (`member_left`, `inactive`, `skill_deficit`).
  - Priority (`High`, `Urgent`).

### Step 3: Write the Context-First Handover Note
- **Action**: Fill in the Handover Brief:
  - *Current State*: What is working and what is broken in the codebase.
  - *Immediate Next Tasks*: What the replacement engineer must complete in their first 48 hours.
  - *Architectural Pitfalls*: Key blockers to avoid.
- **Why this matters**: Replacement developers are 5x more likely to accept a rescue project if they receive clear orientation notes upfront.

### Step 4: Dispatch Urgent Replacement Invitations
- **Action**: SkillForge AI filters candidates marked as *Available for Immediate Rescue Work*.
- **You will see**: Candidates ranked by exact match to the unblocked technologies.
- **Dispatch**: Click *Send Rescue Invitation*. The invite includes the full handover brief so the candidate knows exactly what they are stepping into.

### Step 5: Handover Acceptance & Work Resumption
- **Action**: The replacement engineer clicks *Accept Rescue*.
- **System Actions**:
  - Orphaned tasks are automatically transferred to the incoming engineer.
  - The departed member's prior commits and PRs remain permanently credited to them.
  - Project health telemetry recalculates and returns to `Healthy`.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Gap Role | Title of replacement position | Yes | 3-50 characters |
| Trigger Reason | Reason for replacement | Yes | member_left, inactive, manual |
| Handover Summary | High-level status of the codebase | Yes | 20-1000 characters |
| Immediate Deliverables | Concrete tasks to be completed first | Yes | At least one item |

---

## Common Problems & Fixes
- **Problem**: Does the departed member lose credit for their previous commits?
  - *Answer*: **No**. SkillForge strictly adheres to the Immutable Attribution rule. Any commit SHA pushed prior to departure remains cryptographically linked to the departed member's profile.
- **Problem**: Candidates are declining the rescue invitation.
  - *Cause*: The handover brief does not provide enough technical context or specifies an unrealistic deadline.
  - *Fix*: Edit the handover note in `/projects/:id/rescue` to clarify the architecture and extend the milestone date.

---

## Related Chapters
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)

[Start Project Rescue Tour](#tour-rescue-project)


<!-- PAGE BREAK -->

# Chapter 9: Project Completion, Verification & Certificates

## Who it is for
Project Creators, Team Collaborators, Technical Evaluators, and Verifiers.

## Time to complete
12 minutes

## What you will achieve
Guide your finished project through formal completion: verify deliverables, collect unanimous peer confirmations, submit for cryptographic verification, and receive an immutable digital certificate with a public QR code.

## Before you start
Ensure all planned milestones are completed and all code is merged into your linked GitHub repository.

---

## The Flow at a Glance
Refer to [FC-07 Project Completion, Cryptographic Verification & Public Credentials](./flows/FC-07_Completion_Verification_and_Certificate.mmd).

---

## Step by Step Guide

### Step 1: Submit the Completion Checklist
- **Where**: Project *Overview* or the *Certification* tab.
- **Action**: Click *Request Project Completion*.
- **You will see**: The formal completion checklist modal prompting for:
  - Live Demo URL (e.g. Vercel, Railway, or Docker repository).
  - Final Production GitHub Release / Commit SHA.
  - Final Architecture Summary & Outcomes achieved.
- **Locking**: Submitting the checklist temporarily locks the Project Room to capture a frozen snapshot of evidence.

### Step 2: Unanimous Peer Confirmation
- **Where**: Every confirmed member receives an urgent confirmation alert in Zone E of their Home dashboard.
- **Action**: Each collaborator reviews the final deliverable summary and clicks *Confirm My Contributions & Role*.
- **Consensus Rule**: 100% of confirmed active members must vote to approve before the project advances.

### Step 3: Handling Attribution Disputes
- **Action**: If any collaborator clicks *Dispute Attributions*:
  1. The project state transitions to `Disputed`.
  2. The issue routes automatically to the Platform Admin Mediation Queue (see Chapter 14).
  3. An administrator inspects commit logs and mediates role adjustments.

### Step 4: Verification Engine (Automated vs Admin)
- **Fast-Track Auto-Verification**: If a project has:
  - More than 10 verified git commits.
  - All milestones marked complete with task history.
  - Unanimous peer approval.
  The platform auto-approves verification in seconds.
- **Admin Review**: Flagged projects, sponsored challenges, and high-value bounty projects route to an admin for code audit.

### Step 5: Cryptographic Certificate Minting
- **Outcome**: The moment verification passes:
  - An immutable SHA-256 certificate is minted for **EVERY** confirmed member.
  - A unique scannable QR code and public URL are generated (`/verify/:certId`).
  - The project automatically becomes a *Verified Project Experience* card on each member's portfolio.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Live Demo URL | Publicly accessible production link | Yes | Valid HTTPS URL |
| Final Commit SHA | Git commit hash of final release | Yes | 40-char hex string |
| Certificate UUID | Unique credential identifier | System | Immutable UUID |
| Public Verify URL | Public link for recruiters to audit proof | System | `https://skillforge.dev/verify/:certId` |

---

## Common Problems & Fixes
- **Problem**: One team member is unreachable and cannot click 'Confirm'.
  - *Cause*: Unresponsive member blocks the 100% consensus requirement.
  - *Fix*: If a member has been inactive for >14 days, the owner can initiate an inactivity removal request, which routes to admin resolution.
- **Problem**: Can a certificate be revoked?
  - *Answer*: **Yes**. If plagiarism, code tampering, or academic fraud is subsequently proven, an administrator can revoke the certificate, which immediately marks the public QR page as `Revoked` (see Chapter 14).

---

## Related Chapters
- [Chapter 7: GitHub & Contribution Evidence](./07_github_and_contributions.md)
- [Chapter 10: Portfolio & Opportunity Discovery](./10_portfolio_and_discovery.md)

[Start Completion & Verification Tour](#tour-complete-verify)


<!-- PAGE BREAK -->

# Chapter 10: Professional Portfolio & Opportunity Discovery

## Who it is for
Individual Developers, Freelancers, Job Seekers, and Candidates.

## Time to complete
8 minutes

## What you will achieve
Customize your public engineering dossier, showcase verified project cards, generate a shareable vanity URL with embedded proof badges, and discover matching career opportunities.

## Before you start
Complete your profile details or have at least one verified experience card minted from a completed project.

---

## The Flow at a Glance
Refer to [FC-12 Individual Opportunity Discovery & Career Inbound](./flows/FC-12_Opportunities_for_Individuals.mmd) and [FC-16 Privacy Boundaries](./flows/FC-16_Who_Can_See_My_Data.mmd).

---

## Step by Step Guide

### Step 1: Open the Portfolio Editor
- **Where**: Under *My Portfolio* in the navigation bar or navigate to `/me/portfolio`.
- **You will see**: The interactive portfolio customizer with a live split-screen preview.

### Step 2: Organize Your Verified Project Cards
- **Action**:
  - Reorder project cards using drag handles to highlight your strongest engineering work.
  - Pin up to 3 *Featured Projects* to the top of your public showcase.
  - Toggle individual project visibility (e.g., hide early learning projects, showcase production MVPs).

### Step 3: Embed Verifiable Cryptographic Badges
- **You will see**: Verified cards display an attested green badge:
  - Total confirmed repository commits.
  - Specific technologies used in production (e.g. `Kafka (Advanced)`, `Docker`).
  - One-click link to the public verification certificate (`/verify/:certId`).

### Step 4: Share Your Public Vanity URL
- **Where**: Top right of `/me/portfolio`.
- **Action**: Copy your public URL (format: `https://skillforge.dev/u/:username` or `/portfolio/:username`).
- **Use case**: Paste this link into your resume, GitHub profile, LinkedIn, or send directly to hiring managers.

### Step 5: Discovering Career Opportunities
- **Where**: Navigate to the Discover hub at `/discover` or `/feed`.
- **Tabs**:
  - *Projects Seeking Skills*: Browse collaborative teams that have active gaps matching your exact verified technologies.
  - *Full-Time Jobs*: Corporate engineering openings posted by verified tech companies.
  - *Hackathons & Sprints*: Time-boxed weekend challenges with cash bounties.
- **Action**: Click *Save* to bookmark an opportunity, or *Express Interest* to share your verified dossier with the hiring team.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Vanity Username | Custom URL slug (`/u/username`) | Yes | 3-30 alphanumeric characters |
| Bio Headline | Professional engineering specialty | Yes | Max 100 characters |
| Featured Projects | Top highlighted projects | Optional | Max 3 pinned cards |
| Inbound Status | Open to recruiter discussions | Yes | Active / Paused |

---

## Common Problems & Fixes
- **Problem**: When recruiters visit my link, they see 'Profile Not Found'.
  - *Cause*: Your portfolio visibility is set to `Private` or `Registered Users Only`.
  - *Fix*: In `/settings/privacy`, change *Portfolio Visibility* to `Public`.
- **Problem**: A project I completed is not appearing in my portfolio editor.
  - *Cause*: The project completion checklist is still awaiting peer confirmation from teammates.
  - *Fix*: Check the project certification status at `/projects/:id` to verify all members have signed off.

---

## Related Chapters
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)
- [Chapter 12: Recruiter Radar & Hiring Pipeline](./12_recruiters_and_companies.md)

[Start Portfolio Tour](#tour-portfolio)


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
