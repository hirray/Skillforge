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
