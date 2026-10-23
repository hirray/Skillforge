# Phase 2: Project Room & Chat Module (Area 9) Notes

## 1. Summary of Implemented Features

### 9.1 Overview Tab
- Comprehensive project summary (title, lifecycle stage pill, category, visibility, problem statement).
- Real-time project progress calculation (`% Done` based on real tasks).
- Active team capacity and headcount breakdown.
- Upcoming task deadlines list pulled directly from the `Task` model.
- Pinned links & Resources placeholder stub (disabled for Area 12 Resources).

### 9.2 Group Chat
- Team-wide real-time discussion channel scoped to each project (`ChatRoom` + `Message` models).
- Full Socket.IO integration with real broadcast and persistence (`message:new`, `message:edit`, `message:delete`, `message:read`).
- Rich consecutive message grouping (avatars and headers shown once for tight message stacks).
- Date dividers ("Today", "Yesterday", exact dates).
- Live typing indicators with animated bouncing dots.
- Interactive `@mention` picker restricted strictly to confirmed active project members.
- File attachment support with visual badges.
- Message editing within a 10-minute window with `(edited)` markers.
- Message soft deletion with `(deleted)` accountability markers.
- In-room report/flag modal creating `MessageReport` and moderation `Report` records.
- Floating `New messages ↓` accent pill when scrolled up.
- Automatic read state receipts ("✓ Sent" / "✓✓ Seen").

### 9.3 Individual (1:1) Direct Chat
- Private conversation stream between two project members.
- Strict server-side and Socket.IO privacy enforcement: third-party members and project owners cannot view or eavesdrop on 1:1 direct messages (returns `403 FORBIDDEN`).
- Instant direct chat creation from the Team Directory or Direct Messages list.
- Support for edit, soft delete, report, and typing indicators.

### 9.4 Team Directory
- Member cards with avatar, real-time online/offline presence indicator dot (`#22C55E` / `#9CA3AF`), assigned roles, responsibilities, and visible skill badges.
- Quick action to initiate private 1:1 direct chat with any teammate.

### 9.5 Activity Feed
- Real-time audit log subscribed to domain events on `core/eventBus.ts`:
  - `MemberJoined` (Team Formation)
  - `MemberLeft` (Team Formation)
  - `TaskCompleted` (Tasks)
  - `TaskCreated` (Tasks)
  - `ProjectUpdated` (Projects)
- Persisted to `ActivityFeedEntry` in Prisma.
- Zero leakage of private 1:1 or group chat content into the activity stream.

### 9.8 Project-Scoped Notifications
- Sends `Notification` records with appropriate `type` (`message`, `mention`, `task`, `team`) to teammate inboxes when new messages, mentions, or project milestones occur.

---

## 2. Reusable Design System Extensions

Recorded in [`docs/DECISIONS.md`](file:///c:/Users/hirra/OneDrive/Desktop/major/skillforge/docs/DECISIONS.md):
- **Elevation Tokens:**
  - `elevation-1`: `0 1px 3px 0 rgba(10, 22, 128, 0.05), 0 1px 2px 0 rgba(10, 22, 128, 0.03)`
  - `elevation-2`: `0 4px 8px -1px rgba(10, 22, 128, 0.08), 0 2px 4px -2px rgba(10, 22, 128, 0.04)`
  - `elevation-3`: `0 12px 20px -3px rgba(10, 22, 128, 0.12), 0 4px 6px -4px rgba(10, 22, 128, 0.06)`
- **Header Gradient:** `bg-gradient-to-r from-[#0A1680] to-[#16279E]`
- **Presence Dot Convention:** Online (`#22C55E`), Offline (`#9CA3AF`)
- **Primitives in `apps/web/src/design-system/components/`:**
  - `Avatar` (with presence indicator and initials fallback)
  - `SkeletonLoader` (shimmering placeholder for bubbles, cards, rows)
  - `ChatBubble` (my messages vs others, reply previews, mention chips, edit/delete markers)
  - `DateDivider` (chronological section dividers)
  - `TypingIndicator` (3-dot jumping wave)
  - `NewMessagesPill` (floating unread indicator)

---

## 3. How to Test Real-Time Behavior with Two Browser Sessions

1. Start the dev environment:
   ```bash
   npm run dev
   ```
2. Open **Browser Session 1** at `http://localhost:5173`:
   - Set the active user in the top bar to `user-001` (Student / Owner).
   - Navigate to `/projects` and select a project, or click **Chat** in the sidebar.
   - Enter the Project Room.
3. Open **Browser Session 2** (e.g. Incognito window or different browser) at `http://localhost:5173`:
   - Set the active user in the top bar to `user-002` (Freelancer / Member).
   - Enter the same Project Room.
4. **Group Chat Test:**
   - Type a message in Session 1. Notice the live typing indicator appear in Session 2.
   - Send the message. Notice instant delivery in Session 2 via Socket.IO without page reload.
   - Type `@` to open the member mention picker and select `user-002`.
   - In Session 1, edit or delete a message. Notice the `(edited)` or `(deleted)` badge update live across both sessions.
5. **Direct 1:1 Chat Test:**
   - In Session 1, go to the **Team Directory** tab and click **Direct Message** on `user-002`.
   - Send a private direct message. Verify Session 2 receives it.
   - Log in as a 3rd user (`user-003`). Try accessing the direct chat endpoint `GET /api/v1/chats/:id/messages` via API. Verify it returns `403 FORBIDDEN` (privacy enforcement).
6. **Activity Feed Test:**
   - In Session 1, switch to Tasks and mark a task as `Done`.
   - Return to the Project Room -> **Activity Feed** tab. Notice the `TaskCompleted` event logged.

---

## 4. What Future Modules Can Now Rely On

- **Milestones (Area 11):** Can publish `DomainEvent.MilestoneReached` on `eventBus` to automatically post activity entries and notify members.
- **Resources Hub & Meeting Notes (Area 12):** Can replace the stubbed "Resources (Coming Soon)" tab in `ProjectRoom.tsx` without changing the room layout or header.
- **Notifications (Area 30):** Full set of notification records are already being written to Prisma with correct types, links, and recipient IDs.
