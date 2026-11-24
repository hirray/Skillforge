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
