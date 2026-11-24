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
