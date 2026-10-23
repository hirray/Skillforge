# Phase 1: Team Formation Notes

## What's Done
- **Real Backend (`apps/api/src/modules/team/`)**:
  - Implemented `RealService` with Prisma-backed operations for invitations, responses, join requests, member management, role updates with history, soft removal/leave, and multi-step ownership transfers.
  - Enforced all PRD rules: no forced membership, invitation expiry windows, role availability guards, optimistic locking concurrency protection, and owner-only authorization.
  - Domain events (`InvitationSent`, `InvitationResponded`, `MemberJoined`, `MemberLeft`) wired to `eventBus`.
  - Comprehensive unit test suite in `apps/api/src/modules/team/module.test.ts` verifying expiry, missing roles, optimistic locking, and authorization.

- **Real Frontend (`apps/web/src/modules/team/` and `apps/web/src/modules/projects/`)**:
  - Integrated "Team" tab in `ProjectDetail.tsx` with member listing, role histories, owner controls (Invite, Change Role, Remove, Transfer Ownership), pending invitations, and join requests.
  - Built `MyInvitations.tsx` page displaying full project context before accepting or declining.
  - Added an active Dev User Switcher header to test multi-user scenarios seamlessly.
  - Extended status pill visual styling (`Pending`, `Accepted`, `Declined`, `Expired`) aligned with the design system.

## How to Test
1. Set `TEAM_SOURCE=real` (default in `config.ts`).
2. Run `npm run dev` to start the frontend and API servers.
3. Open `http://localhost:5173/projects` as `user-001` (Project Owner).
4. Navigate to a project -> switch to the **Team** tab -> click **"Invite Member"** to invite `user-002` to an open role.
5. In the top bar User Switcher, switch to `user-002` -> click **"Team"** in the sidebar (or visit `http://localhost:5173/team`).
6. Confirm `user-002` sees the full project context (title, description, duration, stage, team) -> click **"Accept Invitation"**.
7. Switch back to the project page -> confirm `user-002` is now an active team member.
8. Switch to `user-003` -> open the project -> click **"Request to Join"** -> submit request.
9. Switch back to `user-001` -> review join request -> Accept or Reject with a reason.
10. Test member removal / leaving and ownership transfer acceptance.

## What Tasks (PRD Area 10) Can Rely On
- Real `ProjectMember` records in the database with `status: 'active'`, assigned `role`, and `responsibilities`.
- Task assignees can now be validated against actual active project members (`/api/v1/projects/:id/members`) rather than static fixtures.
- When members leave or are removed, their historical records remain intact with `status: 'left'` / `status: 'removed'`, preserving task history continuity.
