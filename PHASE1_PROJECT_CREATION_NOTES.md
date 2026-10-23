# Phase 1: Project Creation Notes

## What's Done
- Updated design tokens and base components (`Button`, `Card`, `Badge`, `Sidebar`, `Input`, `Tabs`) in `apps/web/src/design-system` according to the new color palette.
- Implemented real Prisma-backed logic for the Projects module (`apps/api/src/modules/projects/real.ts`).
- Created API endpoints for `create`, `list`, `get-by-id`, `update`, and `lifecycle-transition` conforming to the specified business rules and validations.
- Built the frontend `ProjectsList`, `CreateProject` wizard, and `ProjectDetail` views inside `apps/web/src/modules/projects/`.


- Updated `Prisma` schema to persist the full structure of the Project domain.
- Wired domain events `ProjectCreated` and `ProjectUpdated` on the event bus.

## How to Test
1. Set `PROJECTS_SOURCE=real` in `apps/api/.env`.
2. Run `npm run dev` to start the frontend and API servers.
3. Use the dev-login to authenticate.
4. Navigate to the Projects module and step through the full "Create Project" wizard.
5. In the Project Detail page, try the owner-only transitions (e.g., Draft -> Recruiting -> Active).
6. Verify edge cases (e.g., non-owner transitions, invalid transitions) by logging in as another seeded user.

## What Team Formation (Area 8) Can Rely On
- Real `Project`, `ProjectRequirement`, and `ProjectRole` records in the database instead of static fixtures.
- Valid `status` lifecycle transitions are strictly enforced.
- The `ProjectCreated` and `ProjectUpdated` events are emitted and can be listened to in `eventBus.ts`.
- Max team sizes are validated correctly against current member counts during updates.