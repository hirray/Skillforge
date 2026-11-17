# Phase 3 · Module 16: Project Rescue & Replacement (Member 3)

## 1. Overview & Objectives

**Module 16 (Project Rescue & Replacement)** provides high-priority resilience mechanisms for projects when team members leave, become inactive, or when critical skill gaps arise. It ensures that projects do not silently stall by:
1. Detecting triggers automatically (`MemberLeft` events, periodic inactivity detection thresholds).
2. Allowing project owners to declare, configure, and merge skill gaps.
3. Discovering candidate replacements via scoped AI matching.
4. Sending context-first invitations containing role requirements and high-level handover summaries.
5. Securing handover notes so sensitive repo keys and internal decisions are revealed only after invitation acceptance.
6. Maintaining past contributor history and attributing previous work up to the departure date.

---

## 2. Architecture & Contract Extensions

### 2.1 Domain Models (`prisma/schema.prisma`)
- **`ProjectGap`**:
  - `id`: Unique identifier (UUID).
  - `projectId`: References `Project(id)`.
  - `roleId`: Nullable reference to `ProjectRole`.
  - `roleTitle`: Title of the role needed.
  - `skillsJson`: Serialized list of required technical skills.
  - `targetProficiency`: Target proficiency level (`beginner`, `intermediate`, `advanced`, `expert`).
  - `hoursPerWeek`: Expected time commitment.
  - `status`: `open` | `filled` | `cancelled`.
  - `origin`: `member_left` | `inactive` | `manual`.
  - `departedUserId`: Identifier of departing member (if applicable).
  - `createdAt`, `updatedAt`: Timestamps.

- **`HandoverNote`**:
  - `id`: Unique identifier (UUID).
  - `projectId`: References `Project(id)`.
  - `gapId`: Nullable link to `ProjectGap`.
  - `authorId`: Author identifier.
  - `workState`: State of work accomplished and progress notes.
  - `unfinishedTasksJson`: Serialized task IDs flagged for reassignment.
  - `repoInfo`: Repository, branch, and development environment setup instructions.
  - `decisions`: Architectural and technical decisions.
  - `candidateSummary`: Clean summary visible to candidates during pre-acceptance.
  - `createdAt`, `updatedAt`: Timestamps.

- **`ProjectInvitation`**:
  - Added optional `gapId?: string | null` linking invitation to the rescue gap.

### 2.2 API Contract Endpoints (`packages/contract/openapi.yaml`)
- `GET /projects/{id}/gaps`: List gaps (with optional `status` filter).
- `POST /projects/{id}/gaps`: Open a rescue gap (supports duplicate role warning and `merge: true`).
- `PATCH /projects/{id}/gaps/{gapId}`: Update gap details, change status to `cancelled` or `filled`.
- `POST /projects/{id}/gaps/{gapId}/candidates`: Retrieve candidate recommendations scoped to the gap requirements.
- `GET /projects/{id}/handover`: Retrieve handover notes. (Restricted: active members see full details; invitees see only `candidateSummary`).
- `POST /projects/{id}/handover`: Create or update handover documentation.
- `GET /projects/{id}/inactivity-check`: Check for inactive members exceeding the threshold (default: 14 days).

### 2.3 Domain Events (`packages/contract/src/events.ts`)
- `DomainEvent.GapOpened`: Fired when a gap is opened or auto-proposed.
- `DomainEvent.GapFilled`: Fired when a gap-linked invitation is accepted or matched.
- `DomainEvent.GapCancelled`: Fired when a gap is cancelled (e.g. member returns).
- `DomainEvent.HandoverCreated`: Fired when handover notes are submitted.

---

## 3. Frontend Components (`apps/web/src/modules/projects/rescue/`)

1. **`RescueBanner`**:
   - Prominently displays open rescue gaps with role title, origin badge (`Outgoing Member`, `Inactivity Alert`, `Manual Gap`), time commitment, and required skills.
   - Shows inactive member alerts with a one-click trigger to declare a gap.
   - Action buttons: *Find Replacement*, *Edit Gap*, *Handover Notes*, *Lifecycle*.
2. **`GapWizardModal`**:
   - Two-step wizard:
     - Step 1: Gap Definition (Role title, proficiency level, hours/week, interactive skill chip builder).
     - Step 2: Handover Documentation (Candidate summary, current work state, repo/branch instructions, decisions, and auto-flagging of uncompleted tasks).
   - Handles duplicate role conflicts with prompt to merge skill sets.
3. **`GapCandidatesModal`**:
   - Displays scoped candidate matches with match percentages, reason fit badges, and skill strengths.
   - *Invite with Context* drawer allowing owners to compose personalized notes and attach pre-acceptance summaries.
4. **`HandoverModal`**:
   - Tabbed view showing saved handover documentation, associated branch instructions, and form to add new notes.
5. **`GapTimelineModal`**:
   - Visual lifecycle tracking: `Opened` ➔ `Candidates Reviewed` ➔ `Context Invitation Sent` ➔ `Role Filled`.

---

## 4. Test Coverage & Verification

### 4.1 Unit & Integration Tests (`apps/api/src/modules/team/rescue.test.ts`)
- **Test 1**: Outgoing member departure (`MemberLeft`) automatically creates draft open gap and flags uncompleted tasks with `needsReassignment = true`.
- **Test 2**: Past contribution and member history remain preserved and attributed upon member removal or departure.
- **Test 3**: Owner-only authorization: non-owners receive `403 Forbidden` when attempting to open or update gaps.
- **Test 4**: Gap closure on invitation acceptance: accepting an invitation carrying `gapId` marks the gap as `filled`.
- **Test 5**: Gap closure on join request acceptance: accepting a join request matching the gap's role automatically marks the gap as `filled`.
- **Test 6**: Handover privacy gating: candidates/invitees only see `candidateSummary` prior to acceptance; internal credentials, repo details, and task lists are strictly hidden.
- **Test 7**: Full handover visibility: active project members and owners receive complete handover details including repo setup and architecture decisions.
- **Test 8**: Inactivity detection: detects members without activity past threshold days (default 14 days) and prompts the owner.
- **Test 9**: Owner can cancel a gap if the departed member returns.
- **Test 10**: Duplicate gap handling: warns on existing open gap for the same role and safely merges skill sets when `merge: true` is passed.

### 4.2 Test Execution Results
- `npm run check:contract`: **Passed** (All routes match OpenAPI specification).
- `npm run typecheck --prefix apps/web`: **Passed** (0 errors).
- `npm run typecheck --prefix apps/api`: **Passed** (0 errors).
- `npm test --prefix apps/web`: **Passed** (100%).
- `npm test --prefix apps/api -- src/modules/team/`: **Passed** (21/21 tests passed).
- `npm run build --prefix apps/web`: **Passed** (Production bundle built cleanly).
