# Phase 2: Milestones Module (PRD Area 11) Notes

## Summary of Implementation
The **Milestones module (PRD Area 11)** is now fully implemented with real Prisma-backed persistence, reactive automated progress calculation, horizontal timeline visualization, and manual completion override with rationale auditing.

### 1. API & Backend Implementation (`apps/api/src/modules/milestones/`)
- **Persistence (`prisma/schema.prisma`)**:
  - `Milestone` model enriched with `status`, `progress`, `dueDate`, `isManualCompletion`, `completionRationale`, `completedBy`, `completedAt`, relation to `Task[]` with cascade delete, and `history` relation to `MilestoneHistory[]`.
  - `MilestoneHistory` model tracking field-level transitions, manual completion rationales, and task link/unlink events.
- **Service (`real.ts`)**:
  - `list`, `create`, `getById`, `update`, `delete`, `linkTask`, `unlinkTask`, `manualComplete`, `getHistory`.
  - Enforced project membership (`ensureMember`) so only active confirmed project members and the project owner can create/edit milestones.
  - Calculated progress: `(doneTasks / totalTasks) * 100` (returns 0% on 0 linked tasks, preventing divide-by-zero).
  - Snapshot Rule: Unlinking a task after milestone completion does not un-complete the milestone.
  - One-Milestone-Per-Task: Linking a task to a new milestone automatically unlinks from the former and triggers reactive recalculation of both.
  - Zero-Tasks Rule: Marking an empty milestone complete without manual confirmation rationale is rejected with `400 COMPLETION_RULE_VIOLATION`.
  - Manual completion requires a non-empty rationale, sets `isManualCompletion: true`, and stores real task completion without faking 100%.
- **Event Bus Integration (`eventBus.ts`)**:
  - Listens to `DomainEvent.TaskCompleted` to recalculate milestone progress reactively.
  - Emits `DomainEvent.MilestoneReached` on milestone completion (auto or manual).
  - Integrated with Chat / Project Room to persist `ActivityFeedEntry` (`eventType: 'MilestoneReached'`) and send notifications to the project team.

### 2. Design System Reusable Primitives (`apps/web/src/design-system/components/`)
- **`ProgressRing.tsx`**:
  - Circular SVG progress ring with smooth 500ms ease-out fill animation.
  - Palette strokes: `#0A1680` (Done), `#93B2F8` (In Progress), `#F1B94C` (Overdue), `#E7EAF3` (track).
  - Centered percentage readout or checkmark on completion.
- **`Timeline.tsx`**:
  - Horizontal delivery roadmap with connected state-styled milestone nodes.
  - Completed nodes show `#0A1680` filled node with checkmark; in-progress show `#93B2F8` outlined with percentage; overdue show `#F1B94C` with subtle pulse animation.
  - Smooth horizontal scrolling with momentum.

### 3. Frontend Milestones Module (`apps/web/src/modules/milestones/`)
- **`MilestonesSection.tsx`**:
  - Toggle between **Card List** and **Roadmap Timeline** views.
  - Filter by status (`All`, `To Do`, `In Progress`, `Done`, `Overdue`) and search by keyword.
  - Responsive cards with elevation scale (`shadow-elevation-1` hover `shadow-elevation-2`) and status-coded left-edge accent bars.
  - Shimmering loading states via `SkeletonLoader`, graceful empty states, error states, and permission-denied views.
- **`MilestoneDetailModal.tsx`**:
  - Full milestone breakdown, ProgressRing, linked task management (linking new tasks / unlinking tasks), and audit log.
- **`MilestoneCreateModal.tsx`**:
  - Create milestone with title, description, due date, and multi-select task linking.
- **`MilestoneCompleteModal.tsx`**:
  - Mandatory rationale modal for manual completion overrides.
- **`MilestoneTimelineView.tsx`**:
  - Summary metrics (Total, Completed, In Progress, Overdue) and active milestone spotlight.
- **Cross-Module Integration**:
  - Added "Milestones" tab to `apps/web/src/modules/projects/ProjectDetail.tsx`.
  - Added "Link to Milestone" selector and milestone badges in `apps/web/src/modules/tasks/TasksSection.tsx`.

---

## How to Test Progress Recalculation & Behavior

1. **Automated Unit & Integration Tests**:
   ```bash
   npx vitest run src/modules/milestones/module.test.ts
   ```
   All 13 unit & integration tests pass cleanly, validating:
   - Authorization and active member checks.
   - Initial 0% progress on milestone creation.
   - Dynamic progress recalculation when linked tasks transition to `Done`.
   - Auto-completion when all linked tasks reach 100%.
   - Snapshot rule preservation on task unlink.
   - Rejection of empty milestone completion without rationale.
   - Manual confirmation override with rationale preserving actual task progress.
   - Automatic handling of deleted linked tasks and one-milestone-per-task constraint.

2. **Manual UI Verification**:
   - Start local dev server: `npm run dev` with `MILESTONES_SOURCE=real`.
   - Navigate to any project -> Click the **Milestones** tab.
   - Click **+ Add Milestone** -> Link 3 tasks -> Verify ProgressRing displays 0%.
   - Switch to the **Tasks** tab -> Move 1 task to `Done` -> Return to **Milestones** -> Verify ProgressRing updates to 33%.
   - Move remaining 2 tasks to `Done` -> Verify milestone transitions to `Done` and reflects on the **Roadmap Timeline**.
   - Create a milestone with 0 tasks -> Attempt to mark Done -> Verify it prompts for rationale -> Provide rationale -> Verify "Manually Confirmed" pill appears with 0% progress preserved.

---

## What the Next Module (Resources Hub, PRD Area 12) Can Now Rely On
- **Real Milestone records** in SQLite / Prisma with IDs, titles, due dates, statuses, and project relationships.
- Resource links can optionally associate with specific `milestoneId` or `projectId` to organize deliverable assets by milestone phase.
- Reusable `ProgressRing` and `Timeline` primitives in `apps/web/src/design-system/components/` ready for resource delivery tracking.
