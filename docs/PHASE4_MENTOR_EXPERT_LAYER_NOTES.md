# Phase 4 · Module 27: Mentor / Expert Layer Implementation Notes

**Member**: Member 3 (Collaboration Workspace)  
**Branch**: `member3/mentors`  
**Feature Flag**: `MENTORS_SOURCE=real`  
**PRD Area**: 27 (Mentor / Expert Layer)  

---

## 1. Overview & Architecture

Module 27 enables experienced software professionals and domain specialists to advise, critique, and guide project teams without being full project members or distorting member contributions.

Key design principles enforced:
1. **Opt-in Mentor Profiles**: Users can activate their mentor status, configure skills, engineering domains, format preferences (async code review, 1:1 live call, office hours), availability, and an expert bio.
2. **Directory & Multi-Filter Search**: Instant filtering by technical skills (React, TypeScript, Node.js, Python, System Design, etc.) and domains (Web, Fintech, AI/ML, Distributed Systems, SaaS).
3. **Formal Mentorship Requests**:
   - Scope: `general` (overall project guidance) or `milestone` (targeted to an active milestone).
   - Auto-expiry: Requests auto-expire after 7 days if unconfirmed.
   - Server guards: Project members cannot be requested as mentors; duplicate pending requests are rejected (400); only project owners or active team members can request mentorship.
4. **Scoped Read-Only Access (27.3)**:
   - Mentors with `accepted` requests have scoped read-only visibility into project overview and milestones.
   - Mentors are **not** project members (`ProjectMember`). Server-side authorization in `/chat` (project room, 1:1 direct chat) and `/tasks` strictly denies mentors with `403 FORBIDDEN`.
   - Mentors are purely advisory and never gate verification or project completion.
5. **Advisory Feedback (27.4)**:
   - Accepted mentors can submit advisory feedback (`POST /projects/:id/mentor-feedback`).
   - Distinct `#FBEDB0` **Advisory** badge tag ensures teams and portfolio viewers immediately recognize mentor guidance vs mandatory deliverables.

---

## 2. API Contract & Database Models

### Contract Endpoints:
- `GET /mentors`: List active mentors with optional filters (`skill`, `domain`, `format`, `search`).
- `GET /mentors/profile`: Get authenticated user's mentor profile.
- `POST /mentors/profile` / `PUT /mentors/profile`: Opt in or update mentor profile.
- `GET /mentors/requests`: Mentor inbox (`?role=mentor`) or sent requests (`?role=owner`).
- `POST /mentors/requests`: Create a new mentorship request.
- `POST /mentors/requests/:id/respond`: Accept or decline request.
- `GET /projects/:id/mentor-feedback`: List advisory feedback on project.
- `POST /projects/:id/mentor-feedback`: Submit advisory feedback (mentor only).
- `GET /projects/:id/mentor-requests`: List mentorship requests for project.

### Database Models (`schema.prisma`):
- `MentorProfile` (`userId`, `expertiseSkillIds`, `domains`, `availability`, `formats`, `bio`, `active`).
- `MentorshipRequest` (`projectId`, `mentorId`, `scope`, `milestoneId`, `message`, `status`, `expiresAt`).
- `MentorFeedback` (`projectId`, `mentorId`, `milestoneId`, `text`, `isAdvisory`).

---

## 3. Verification & Test Evidence

- **Unit & Integration Tests**: `apps/api/src/modules/mentors/module.test.ts` (9 tests passing).
  - Profile creation and directory filtering by skill & domain chips.
  - 7-day auto-expiry calculation and request creation.
  - Guard: Active project members rejected from mentor requests (`400 VALIDATION_ERROR`).
  - Guard: Duplicate pending requests rejected (`400 VALIDATION_ERROR`).
  - Guard: Non-target users forbidden from responding (`403 FORBIDDEN`).
  - Advisory feedback creation with `isAdvisory: true`.
  - Guard: Non-accepted mentors rejected from submitting feedback (`403 FORBIDDEN`).
- **Contract Check**: `npm run check:contract` passed with 0 drift.
- **Typechecks**:
  - `apps/api`: `npm run typecheck` passed cleanly (0 errors).
  - `apps/web`: `npm run typecheck` passed cleanly (0 errors).
- **Seed Data**: Pre-seeded `user-003` (`pro@example.com`) and `user-004` (`founder@example.com`) as active mentors.
