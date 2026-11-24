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
