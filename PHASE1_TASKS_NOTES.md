# Phase 1 — Tasks Module (PRD Area 10) Implementation Notes

## Summary
The **Tasks module (PRD area 10)** is now fully real and backed by SQLite / Prisma (`Task`, `TaskDependency`, `TaskComment`, `TaskHistory`). It integrates seamlessly with **Project Creation (Area 5)** and **Team Formation (Area 8)** for member validation, event dispatching, and historical auditability.

---

## What Was Built

### 1. Database Schema (`apps/api/prisma/schema.prisma`)
- **`Task`**: Tracks `title`, `description`, `status` (`To Do`, `In Progress`, `In Review`, `Done`), `priority` (`Low`, `Medium`, `High`, `Critical`), `assigneeId`, `needsReassignment` boolean, `dueDate`, `completedAt`, `labels`, `attachments`, and nullable `milestoneId`.
- **`TaskDependency`**: Tracks blocker relationships (`taskId` is blocked by `dependsOnTaskId`).
- **`TaskComment`**: Comment thread with author relation and timestamps.
- **`TaskHistory`**: Append-only log of every field change, author, timestamp, old and new values.

### 2. Backend Logic (`apps/api/src/modules/tasks/`)
- **`real.ts`**:
  - Full CRUD operations under `/api/v1/projects/:id/tasks` and `/api/v1/tasks/:id`.
  - **Membership Authorization Guard**: Only confirmed active project members (`ProjectMember.status === 'active'`) and project owner can view, create, edit, or comment on tasks.
  - **Confirmed Assignee Guard**: Tasks can only be assigned to confirmed active members or the project owner (rejects non-members with `422 INVALID_ASSIGNEE`).
  - **Completed Status Immutability**: Setting a task to `Done` stamps `completedAt`. Reopening and completing again preserves earlier timestamps and records all transitions in `TaskHistory`.
  - **Dependency Cycle Guard**: Cycle detection rejects self-dependencies and transitive cycles (A blocks B blocks A) with `400 DEPENDENCY_CYCLE`.
  - **Cross-Module Event Subscription**: Subscribes to `DomainEvent.MemberLeft` on `core/eventBus.ts`. Automatically resets active tasks assigned to the departing member to `assigneeId = null`, flags `needsReassignment = true`, and logs a system audit history event.
  - **Automated Reminders**: `checkReminders()` checks for tasks overdue or due within 24 hours.
  - **Domain Event Emission**: Emits `DomainEvent.TaskCreated` and `DomainEvent.TaskCompleted`.
- **`schema.ts`**: Zod validation for task creation, update, and comments.
- **`mock.ts`**: Matches RealService signatures for plug-and-play switching.
- **`routes.ts`**: Express endpoints mounted at `/api/v1` and `/api/v1/tasks`.

### 3. Frontend UI (`apps/web/src/modules/tasks/`)
- **Kanban Board (`TasksSection.tsx`)**:
  - Four fixed workflow columns: **To Do**, **In Progress**, **In Review**, and **Done** with status pill styling according to the frozen design palette.
  - Task cards showing priority pill, title, description preview, labels, due date (highlighted in orange pastel if due soon or overdue), assignee avatar, and **⚠️ Needs Reassignment** alert.
  - Quick column move controls (← / →).
  - Search and filter bar (by assignee, by priority, keyword search).
- **Task Detail & Audit Modal**:
  - Detailed task description, status and priority editor, active-member assignee picker, due date picker, and delete action.
  - Interactive **Comment Thread** with author badges and timestamps.
  - **Activity & History Log** rendering append-only changes from `TaskHistory`.
- **New Task Modal**:
  - Member-accessible creation wizard with title, description, priority, status, assignee, due date, and labels.
- **Member-Only Permission State**:
  - Clean error/permission banner if an unauthorized user attempts to view a project's tasks board.
- **Sidebar Integration**:
  - `/tasks` route in `TasksModule.tsx` providing quick access to active project task boards.

---

## Status & Priority Pill Mappings

| Element | Background | Text Color | Notes |
| :--- | :--- | :--- | :--- |
| **Low Priority** | `#E7EAF3` | `#6B7685` | Neutral gray |
| **Medium Priority** | `#93B2F8` (`bg-accent`) | `#0A1680` (`text-primary`) | Bleu ciel |
| **High Priority** | `#F1B94C` (`bg-warning`) | `#16213A` (`text-mainText`) | Orange pastel |
| **Critical Priority** | `#0A1680` (`bg-primary`) | `#FFFFFF` (`text-white`) | Bleu océan |
| **To Do Status** | `#E7EAF3` | `#6B7685` | Neutral gray |
| **In Progress Status** | `#93B2F8` (`bg-accent`) | `#0A1680` (`text-primary`) | Bleu ciel |
| **In Review Status** | `#FBEDB0` (`bg-yellow`) | `#16213A` (`text-mainText`) | Butter yellow |
| **Done Status** | `#0A1680` (`bg-primary`) | `#FFFFFF` (`text-white`) | Bleu océan with checkmark |

---

## How to Test

1. **Start Environment**:
   ```bash
   npm run dev
   ```
2. **Create and Assign a Task**:
   - Navigate to a project detail page (e.g. `/projects/<id>`).
   - Click the **Tasks** tab.
   - Click **+ New Task**, fill in the details, select an active member from the dropdown, and submit.
3. **Transition Across Columns**:
   - Move task: `To Do` ➔ `In Progress` ➔ `In Review` ➔ `Done`.
   - Click the card to open the modal; confirm the **Activity & History Log** records every move.
4. **Reopen and Complete Again**:
   - Change status back to `In Progress` and then to `Done`.
   - Confirm both completion events appear in the history log without overwriting.
5. **Member Removal & Reassignment**:
   - In the **Team** tab, remove the assigned member from the project.
   - Return to the **Tasks** tab; verify the task card displays `⚠️ Needs Reassignment` with `assigneeId` cleared.
6. **Automated Unit Tests**:
   ```bash
   npm run test
   ```

---

## What Next Phase Can Rely On
- **Project Room & Chat (PRD Area 9)** can subscribe to `DomainEvent.TaskCreated` and `DomainEvent.TaskCompleted` to populate project activity streams and room widgets.
- **Contribution Tracking (PRD Area 15)** can query `TaskHistory` and `completedAt` to compute verified member contributions and effort scores.
