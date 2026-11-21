# Phase 4 · Module 29: Hackathon / Sprint Mode Implementation Notes

**Member**: Member 3 (Collaboration Workspace)  
**Branch**: `member3/hackathons`  
**Feature Flag**: `HACKATHONS_SOURCE=real`  
**PRD Area**: 29 (Hackathon / Sprint Mode)  

---

## 1. Overview & Architecture

Module 29 introduces time-boxed sprint event execution configured directly over the standard SkillForge project and workspace pipeline, rather than duplicating a parallel project architecture.

Key features and workflows implemented:
1. **Event Configuration & Time-Boxed Windows (29.1)**:
   - Organizers create and manage events (`name`, `description`, `theme`, `startsAt`, `endsAt`, `rules`, `suggestedSkillIds`).
   - Time-window validations ensure event start precedes event end.
   - Dynamic lifecycle transitions: `draft` -> `open` (registration active) -> `running` (sprint active) -> `ended` (evaluation) -> `archived`.
2. **Participant Pool & Looking-for-Team Board (29.2)**:
   - Lone hackers can join the event participant pool (`POST /hackathons/:id/join`) with `lookingForTeam: true` and their skill snapshot.
   - Registered teams can browse the lone hacker pool and recruit talent directly to fill their rosters before sprint kickoff.
3. **Sprint Defaults & Auto-Created Scaled Milestones (29.3)**:
   - When registering a sprint team project (`POST /hackathons/:id/projects`), the backend links `eventId` to the normal Project model and automatically creates **3 scaled sprint milestones**:
     1. **Ideate & Technical Architecture** (scheduled at 25% of event duration).
     2. **Core Feature Build & Integration** (scheduled at 75% of event duration).
     3. **Sprint Demo & Final Polish** (scheduled at 100% of event duration deadline).
   - This equips teams instantly with realistic checkpoints without manual milestone configuration.
4. **Archive-Only Deletion Policy (29.4)**:
   - If an organizer attempts to delete an event that already has registered sprint projects/teams, hard deletion is strictly rejected to preserve student/contributor work history and certificates.
   - The event status is safely transitioned to `archived` instead (`DELETE /hackathons/:id` returns `{ archived: true }`).
   - Hard deletion is only permitted if 0 teams have registered.

---

## 2. API Contract & Database Models

### Contract Endpoints:
- `GET /hackathons`: List events with optional status filtering (`open`, `running`, `ended`, `archived`).
- `POST /hackathons`: Create a new sprint event.
- `GET /hackathons/:id`: Fetch event detail including participant pool and registered sprint teams.
- `DELETE /hackathons/:id`: Safely delete or archive event (archive-only once teams exist).
- `PATCH /hackathons/:id/status`: Transition event status.
- `POST /hackathons/:id/join`: Join participant pool with looking-for-team status and skill snapshot.
- `POST /hackathons/:id/projects`: Fast-track sprint project registration with 3 scaled milestones.

### Database Models (`schema.prisma`):
- `HackathonEvent` (`id`, `name`, `description`, `theme`, `startsAt`, `endsAt`, `rules`, `suggestedSkillIds`, `status`, `organizerId`).
- `EventParticipant` (`id`, `eventId`, `userId`, `lookingForTeam`, `skillsSnapshot`).
- `Project` relation: `eventId` pointing to `HackathonEvent`.

---

## 3. Verification & Test Evidence

- **Unit & Integration Tests**: `apps/api/src/modules/hackathons/module.test.ts` (9 tests passing).
  - Event creation with start/end time validation.
  - Event status lifecycle transitions and organizer authorization (`403 FORBIDDEN` for non-organizers).
  - Participant pool registration with `lookingForTeam: true` and skill snapshots.
  - Fast-track sprint project registration with 3 auto-created scaled milestones.
  - Guard: duplicate project registration rejection for same owner (`400 VALIDATION_ERROR`).
  - Archive-only deletion policy when teams exist.
- **Contract Check**: `npm run check:contract` passed with 0 drift.
- **Typechecks**:
  - `apps/api`: `npm run typecheck` passed cleanly (0 errors).
  - `apps/web`: `npm run typecheck` passed cleanly (0 errors).
- **Seed Data**: Pre-seeded `hackathon-001` ("Winter Global AI & Agentic Sprint 2026") with participants looking for teams.
