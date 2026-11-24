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
