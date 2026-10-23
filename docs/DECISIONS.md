# Decisions

- SQLite is used for Phase 0 local dev to avoid Postgres setup.
- To switch to Postgres later: Update `schema.prisma` provider to `postgresql` and apply migration.
- Python venv is created automatically via setup script cross-platform.

## Phase 1: Project Creation Colors and Decisions
- Added `--color-text: #16213A` (dark neutral derived from primary navy for main text).
- Added `--color-text-muted: #6B7685` (neutral gray for secondary text).
- Added `--color-border: #E7EAF3` (light neutral for borders).
- Draft/Archived status colors share the neutral gray/muted text colors (`#E7EAF3` background, `#6B7685` text).
- Prisma Schema was updated for Project, ProjectRole, and ProjectRequirement to support the contract definition.

## Phase 1: Team Formation Status Pill Mapping & Decisions
- Invitation & Join-Request Status Pill Mappings:
  - `Pending`: Butter yellow background (`#FBEDB0` / `bg-yellow`), primary dark text (`#0A1680` / `text-primary`).
  - `Accepted`: Bleu ciel background (`#93B2F8` / `bg-accent`), primary-colored text (`#0A1680` / `text-primary`).
  - `Declined` / `Rejected`: Neutral gray background (`#E7EAF3`), muted text (`#6B7685`).
  - `Expired`: Neutral gray background (`#E7EAF3`), muted text (`#6B7685`), slightly reduced opacity (`opacity-75`).
- Member rows are never hard deleted upon leaving or removal; `status` is set to `left` or `removed`, with `leftAt` and reason recorded.
- Ownership transfer requires explicit acceptance by the designated new owner before ownership moves.
- Optimistic locking via `version` column prevents race conditions on join request acceptance/rejection.

## Phase 1: Tasks Status Pill Mapping & Decisions
- Priority Pill Mappings:
  - `Low`: Neutral gray background (`#E7EAF3`), muted text (`#6B7685`).
  - `Medium`: Bleu ciel background (`#93B2F8` / `bg-accent`), primary-colored text (`#0A1680` / `text-primary`).
  - `High`: Orange pastel background (`#F1B94C` / `bg-warning`), dark text (`#16213A` / `text-mainText`).
  - `Critical`: Bleu océan background (`#0A1680` / `bg-primary`), white text (`text-white`).
- Task Status Pill Mappings (Kanban Columns):
  - `To Do`: Neutral gray background (`#E7EAF3`), muted text (`#6B7685`).
  - `In Progress`: Bleu ciel background (`#93B2F8` / `bg-accent`), primary-colored text (`#0A1680` / `text-primary`).
  - `In Review`: Butter yellow background (`#FBEDB0` / `bg-yellow`), dark text (`#16213A` / `text-mainText`).
  - `Done`: Bleu océan background (`#0A1680` / `bg-primary`), white text (`text-white`) with small check icon.
- Tasks Architecture & Data Integrity:
  - Task completion timestamps (`completedAt`) are written upon reaching `Done` and preserved if reopened/recompleted; all transitions append to `TaskHistory` (immutable audit trail).
  - Dependency cycles (e.g. A blocks B blocks A) are detected using transitive graph search at validation time and rejected with `400 DEPENDENCY_CYCLE`.
  - Member removal triggers domain event listener on `DomainEvent.MemberLeft` that sets `assigneeId = null`, flags `needsReassignment = true`, and logs a system `TaskHistory` event.
  - Task creation and assignment are restricted to confirmed active project members and the project owner.

## Phase 2: Project Room & Chat Design System & Decisions
- Reusable Design System Primitives added in `apps/web/src/design-system/components/`:
  - `Avatar`: Avatar circle with user initials/image and optional online/offline presence indicator dot.
  - `SkeletonLoader`: Shimmering placeholder component for chat bubbles, cards, rows, and text.
  - `ChatBubble`: Rich bubble component handling "my messages" vs "others", consecutive grouping, @mention chips, attachments, reply previews, edit/delete markers, and seen receipts.
  - `DateDivider`: Group divider for chat streams ("Today", "Yesterday", date).
  - `TypingIndicator`: Animated 3-dot jumping wave indicating real-time active typers.
  - `NewMessagesPill`: Floating accent pill for unread messages when scrolled up.
- Elevation Scale Tokens:
  - `elevation-1` (`shadow-elevation-1`): `0 1px 3px 0 rgba(10, 22, 128, 0.05), 0 1px 2px 0 rgba(10, 22, 128, 0.03)` for resting cards and items.
  - `elevation-2` (`shadow-elevation-2`): `0 4px 8px -1px rgba(10, 22, 128, 0.08), 0 2px 4px -2px rgba(10, 22, 128, 0.04)` for active panels and chat stream containers.
  - `elevation-3` (`shadow-elevation-3`): `0 12px 20px -3px rgba(10, 22, 128, 0.12), 0 4px 6px -4px rgba(10, 22, 128, 0.06)` for modals, pickers, and floating action pills.
- Header Surface Treatment:
  - Subtle gradient using Bleu océan to slightly lighter navy (`bg-gradient-to-r from-[#0A1680] to-[#16279E]`) for room headers.
- Presence Indicator Convention:
  - Online: `#22C55E` (Universal UI green convention for active real-time socket connection).
  - Offline: `#9CA3AF` / `#6B7685` (Neutral muted gray).
- 1:1 Direct Chat Privacy:
  - Stored as `ChatRoom` with `type: 'direct'` and explicit `participant1Id` and `participant2Id`.
  - Enforced strictly at the API and Socket.IO level: access is denied (403 FORBIDDEN) to any third party, including the project owner.
- Former Member Message Policy:
  - Historical messages from members who left or were removed remain visible to the team with sender labeled "Former member" (`isFormerMember: true`), preserving conversation integrity without erasing history.
- Message Lifecycle:
  - Edit window: messages can only be edited within 10 minutes of creation; edited messages are marked `(edited)`.
  - Deletion: soft deleted with `(deleted)` placeholder for accountability.
- Activity Feed:
  - Consumes `MemberJoined`, `MemberLeft`, `TaskCompleted`, `TaskCreated`, `ProjectUpdated` domain events from `eventBus` and persists them as `ActivityFeedEntry` records. Chat content is never exposed in the activity feed.
- Project-Scoped Notifications:
  - New group messages, direct messages, and @mentions write `Notification` records with appropriate `type` and links.

## Phase 2: Milestones Design System & Decisions (PRD Area 11)
- Reusable Design System Primitives added in `apps/web/src/design-system/components/`:
  - `ProgressRing`: Smoothly animated (500ms ease) circular SVG progress indicator with locked palette strokes (`#0A1680` for complete, `#93B2F8` for active progress, `#F1B94C` for overdue, `#E7EAF3` for track), customizable diameter and centered checkmark / percentage readout.
  - `Timeline`: Horizontal delivery roadmap with connected state-styled milestone nodes (`#0A1680` filled with checkmark for Done, `#93B2F8` outlined with percentage for upcoming/active, `#F1B94C` with subtle pulse animation for overdue), summary statistics, and horizontal scroll.
- Milestones Status Pill & Accent Mappings:
  - `To Do` / Not Started: Neutral gray accent bar and pill (`#E7EAF3` background, `#6B7685` text).
  - `In Progress`: Bleu ciel accent bar and pill (`#93B2F8` / `bg-accent`, `#0A1680` text).
  - `Done`: Bleu océan accent bar and pill (`#0A1680` background, `#FFFFFF` text) with checkmark.
  - `Overdue`: Orange pastel accent bar and pill (`#F1B94C` background, `#16213A` text) with pulse indicator on timeline.
- Milestones Architecture & Progress Calculation:
  - Automated Progress Calculation: Evaluated as `(linked tasks with status = Done) / (total linked tasks) * 100`. If 0 linked tasks, returns 0% (guarded against divide-by-zero).
  - Reactive Updates: Subscribed to `DomainEvent.TaskCompleted` and hooked into task CRUD operations to trigger instant progress recalculation.
  - Completion Rules:
    - Auto-complete: Triggers when all linked tasks reach `Done` (for total tasks > 0). Emits `DomainEvent.MilestoneReached`.
    - Manual Confirmation Override: Explicit separate action requiring a mandatory rationale string (`completionRationale`). Sets `isManualCompletion: true`, `completedBy`, `completedAt`, and preserves the real task completion percentage so the UI transparently displays "Manually Confirmed" alongside real task progress rather than faking 100%.
    - Empty Milestone Guard: An empty milestone (0 linked tasks) cannot be completed without providing a manual confirmation rationale.
    - Snapshot Rule: Unlinking or modifying tasks after a milestone is marked complete does not retroactively un-complete it.
    - One-Milestone-Per-Task Constraint: Moving a task from Milestone A to Milestone B unlinks it from Milestone A and recalculates progress for both milestones automatically.
  - Audit & History:
    - Added `MilestoneHistory` model (`milestoneId`, `field`, `oldValue`, `newValue`, `changedBy`, `changedAt`) for tracking creation, edits, linked/unlinked tasks, and completion rationales.
  - Cross-Module Integration:
    - `MilestoneReached` domain event emits on completion and writes to `ActivityFeedEntry` and `Notification`.
    - Added "Link to Milestone" selector in Task detail panel and task creation modal in the Tasks module.

## Phase 2: Resources Module Design System & Decisions (PRD Area 12)
- Reusable Design System Primitives added in `apps/web/src/design-system/components/`:
  - `LinkCard`: Rich external URL preview card featuring domain-derived favicon/icon (GitHub, Figma, Google Drive, Notion, YouTube, generic), URL host name, resource label/title, category badge, uploader attribution, upload date, external link launcher, and scoped delete control.
  - `FileCard`: Platform file attachment card featuring deterministic type icons based on file extension (PDF, Word documents, Excel spreadsheets, Images, Compressed archives, Code/text, generic), formatted file size (Bytes/KB/MB), real-time animated upload progress bar (0-100%), inline retry and error state for failed uploads, secure download action, and delete control.
- File Upload & Storage Constraints:
  - Maximum File Size: 25MB (`26,214,400` bytes) enforced on client-side drop/select and server-side validation. Exceeded size returns `400 FILE_TOO_LARGE` and guarantees zero partial or corrupt file records in the database.
  - Supported File Formats: Common document formats (`.pdf`, `.doc`, `.docx`, `.txt`, `.md`), spreadsheets (`.xls`, `.xlsx`, `.csv`), presentations (`.ppt`, `.pptx`), images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`), archives (`.zip`, `.tar`, `.gz`, `.7z`), and code files (`.ts`, `.tsx`, `.js`, `.json`, `.py`).
  - Storage Layer: Uploads utilize the existing `StorageProvider` interface (`apps/api/src/core/storage.ts`) and local filesystem adapter (`uploads/`). Downloads are protected with time-limited signed access URLs (`/api/v1/projects/:id/resources/:resourceId/download` -> `/api/v1/storage/:fileId?token=...`). Public static file paths are prohibited.
- Authorization & Permissions:
  - Add Resource: Restricted to confirmed active project members and project owner (`requireProjectMember`).
  - View / Download Resource: Requires confirmed active project membership or project ownership.
  - Delete Resource: Only the member who uploaded/added the resource or the project owner/admin can delete it.
  - Deletion Lifecycle: Deleting a resource removes the database record and deletes the underlying storage file, but preserves all preexisting `ActivityFeedEntry` and `Notification` entries to maintain immutable audit history.
- Former Member Attribution:
  - When a member leaves or is removed from a project (`DomainEvent.MemberLeft`), their uploaded files and external links remain intact and are attributed to "Former member" (`isFormerMember: true`), identical to the chat message history retention policy.
- Cross-Module Integration:
  - `DomainEvent.ResourceAdded` emits on every link creation and file upload, appending an entry to `ActivityFeedEntry` and triggering project notifications.
- Explicit Scope Boundary & Gap Flags:
  - Meeting Notes (PRD 9.7) Gap: Explicitly flagged as unassigned and out of scope for both the Chat module and Resources module. Recorded here as a pending feature gap.
  - GitHub Integration (PRD Area 13) Boundary: Area 12 strictly stores GitHub URLs as regular external links with a "Repository" category tag. A disabled "Connect GitHub for live sync (Coming Soon)" button is provided in the UI as a non-breaking placeholder for Area 13's OAuth implementation.



