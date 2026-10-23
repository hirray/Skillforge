# Phase 2: Resources Hub (PRD Area 12) Implementation Notes

## Summary
The **Resources Module (PRD Area 12)** is fully implemented, verified, and active across the SkillForge monorepo. The module enables team members to share external links (with domain-derived icon/hostname preview cards) and direct platform file attachments up to 25MB (with drag-and-drop upload zone, real-time in-card animated progress bar, extension-based deterministic icons, and secure signed-URL downloads).

All three of **Member 3's Phase 2 Modules** are now completely built and integrated:
1. **Project Room & Chat (PRD Area 9)**: Real-time Group Chat & 1:1 Direct Chat with presence, typing indicators, threads, mentions, and activity feed.
2. **Milestones (PRD Area 11)**: Milestone tracking, automated task completion calculation, manual override rationales, and timeline delivery roadmaps.
3. **Resources Hub (PRD Area 12)**: External link management with preview cards, platform file uploads via `StorageProvider`, category filtering, search, and access control.

---

## What Was Built

### 1. API & Backend (`apps/api/src/modules/resources/`)
- **Real Service Implementation (`real.ts`)**:
  - `listResources(projectId, userId)`: Verifies project membership via `ensureMember`, fetches resources, and maps former member attributions if the uploader is no longer active.
  - `addLink(projectId, userId, { title, url, category })`: Validates URL format and label length, stores record in Prisma, and publishes `DomainEvent.ResourceAdded`.
  - `uploadFile(projectId, userId, fileData)`: Checks 25MB maximum size limit (`FILE_TOO_LARGE` code 400), uploads via `StorageProvider` (no guessable static paths), stores record, and publishes `DomainEvent.ResourceAdded`.
  - `getDownloadUrl(projectId, resourceId, userId)`: Generates a secure, time-limited signed URL for authorized members.
  - `deleteResource(projectId, resourceId, userId)`: Enforces delete permissions (uploader or project owner/admin only), removes the database record, and deletes underlying storage file.
- **Event Bus Wiring & Cross-Module Sync**:
  - `DomainEvent.ResourceAdded` published on every resource creation and consumed by `ActivityFeedEntry` and `Notification` systems.
  - `DomainEvent.MemberLeft` handles attribution updates so past resources display as "Added by Former member".
- **Validation (`schema.ts`)**:
  - URL format validation with protocol requirement (`http://` or `https://`).
  - Max 25MB file size validation (`26,214,400` bytes).
  - Title and category string constraints.
- **Automated Tests (`module.test.ts`)**:
  - 10 automated unit/integration tests verifying auth guards, URL validations, 25MB limit rejection without partial records, signed download URLs, delete authorization, and former member attribution.

### 2. Design System Primitives (`apps/web/src/design-system/components/`)
- **`LinkCard.tsx`**: Rich URL card displaying derived domain icon (GitHub, Figma, Google Drive, Notion, YouTube, generic), hostname preview, category pill, uploader metadata, upload date, external launcher button, and delete control.
- **`FileCard.tsx`**: File attachment card with deterministic extension icons (PDF, Word, Excel, Images, Archives, Code, Text), formatted file size, animated upload progress bar (0-100%), inline retry for failed uploads, secure download action, and delete control.

### 3. Frontend Resources Module (`apps/web/src/modules/resources/`)
- **`ResourcesHub.tsx`**: Main interactive hub featuring:
  - Search box with instant title, filename, and tag filtering.
  - Category filter chips (`All`, `Links`, `Files`, `Repository`, `Design`, `Docs`, `Demo`, `Dataset`) with active counts.
  - Disabled "Connect GitHub for live sync (Coming Soon)" placeholder for Area 13.
  - Responsive shelf card grid layout with resting and lifted elevation shadows.
  - `SkeletonLoader` for loading state, empty state with illustration and CTA, and inline error states.
- **`FileUploadZone.tsx`**: Drag-and-drop zone with animated border highlight in Bleu ciel (`#93B2F8`) on drag-over, file picker button, and multi-file selection support.
- **`AddLinkModal.tsx`**: Modal for creating external links with category picker and client-side URL validation.

### 4. Application Integration
- **Project Room (`apps/web/src/modules/chat/ProjectRoom.tsx`)**: Replaced disabled tab stub with the live `'Resources'` tab rendering `<ResourcesHub />`.
- **Project Room Overview (`apps/web/src/modules/chat/ProjectOverviewTab.tsx`)**: Updated Pinned Links & Resources Hub card to "Active" with direct tab navigation button.
- **Project Detail (`apps/web/src/modules/projects/ProjectDetail.tsx`)**: Added `'Resources'` to tabs list `['Overview', 'Team', 'Tasks', 'Milestones', 'Resources']`.

---

## How to Test

### 1. Test External Links
1. Navigate to `/projects/:id` or `/chat/:id` and select the **Resources** tab.
2. Click **🔗 Add Link**.
3. Enter title (e.g. `SkillForge Frontend Repo`), URL (`https://github.com/organization/repo`), and select category `Repository`.
4. Verify the card renders with the GitHub icon, `github.com` hostname, `Repository` category pill, and "Added by" timestamp.

### 2. Test File Uploads & Drag-and-Drop
1. Drag and drop a file (PDF, image, ZIP, or document) into the dashed upload zone or click to browse.
2. Observe the animated upload progress bar inside the `FileCard` during in-flight upload.
3. Once completed, verify the card displays the proper extension icon and formatted file size (e.g., `2.4 MB`).
4. Click the download icon to verify signed URL generation and file retrieval.

### 3. Test File Size Limit Guard
1. Try uploading a file larger than 25MB.
2. Observe that an inline error appears immediately on the card stating the 25MB limit.
3. Confirm that no corrupted or partial file record is persisted in the database.

### 4. Test Search & Category Filters
1. Type a keyword into the search bar at the top of the hub; verify matching cards filter instantly.
2. Click category chips (e.g. `Links`, `Files`, `Repository`); verify the grid transitions smoothly.

### 5. Test Access & Deletion Control
1. As the uploader or project owner, click the trash icon on a card and confirm deletion.
2. Confirm that non-members cannot access `/api/v1/projects/:id/resources` (403 Forbidden).

---

## Scope Boundary & Flagged Gaps
- **Meeting Notes (PRD 9.7)**: Explicitly scoped out and recorded in `docs/DECISIONS.md` as an unassigned pending feature gap.
- **GitHub Live Sync (PRD Area 13)**: Handled as external link with "Repository" tag + disabled "Connect GitHub (Coming Soon)" button, preserving UI structure for Member 4's upcoming OAuth integration.
