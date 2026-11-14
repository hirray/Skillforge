# Member 2 validation

Reviewed against upstream main commit `f4b762990f7bcbdabc9f737899947c921ad927ed` on 14 November 2026. Local runtime: Node 22.22.1, Python 3.14.0. The added CI workflow targets Node 20 and Python 3.11; remote CI has not been claimed as executed.

| Check | Result |
| --- | --- |
| TypeScript, all workspaces | Pass |
| Configured ESLint checks, all workspaces | Pass |
| Web production build | Pass |
| API TypeScript build | Pass |
| Owned route/contract registration checks | 12 registered routes verified; input validation checks pass |
| Migration compatibility | Original columns/rows preserved across all 42 baseline tables; fresh schema and upgrade both apply; foreign-key check passes |
| Member 2 API integration | 21 passed |
| Python service tests | 43 passed |
| Existing frontend test | 1 passed; it only checks test setup |
| Full API suite | 84 passed, 13 failed; exactly the same 13 original failure cases |
| Shared contract/domain regression comparison | Zero newly failing cases; no existing tests weakened, skipped or changed |
| Offline evaluation | 6 labelled synthetic scenarios; report generated; baseline remains default |

## Browser verification

- Desktop (1440px) and narrow (375px) layouts checked; no horizontal document overflow observed. The browser viewport was reset afterwards.
- Actual PDF upload through the browser, Python extraction, evidence rendering, accept/edit/discard, and explicit confirmation succeeded using a synthetic fixture.
- Requirement generation returned reasoned skills, roles and team gaps; reviewed requirements saved successfully.
- Collaborator matching returned ML/cloud candidates first; the explanation drawer displayed the actual signals.
- Recruiter matching worked for the owning company; a hard location constraint returned a reasoned empty state.
- Project health displayed the deliberately overdue/unassigned demo work.
- Non-admin analytics access displayed a restriction; Admin viewed aggregate metrics, synthetic labels, chart controls and evaluation.
- The existing ProjectDetail Tasks tab still renders and the health-action deep link opens it.

## Inherited failures

These failures were reproduced in the original review copy before implementation and compared by exact test name with the final run. The Team and Milestone implementations/tests were not rewritten. Several failures are stale response/fixture expectations, with cascading milestone tests after an early assertion; they still require their owners to reconcile them.

- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 2. Milestone CRUD & Task Linking > should auto-complete milestone when all linked tasks reach Done
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 2. Milestone CRUD & Task Linking > should create a milestone with linked tasks and initial 0% progress
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 2. Milestone CRUD & Task Linking > should recalculate progress when a linked task is marked Done
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 2. Milestone CRUD & Task Linking > snapshot rule: unlinking a task after completion does not un-complete the milestone
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 3. Zero Linked Tasks & Manual Completion Rules > should allow manual complete with valid rationale without faking 100% tasks
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 3. Zero Linked Tasks & Manual Completion Rules > should create an empty milestone (zero tasks)
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 3. Zero Linked Tasks & Manual Completion Rules > should reject marking empty milestone complete directly without rationale
- src/modules/milestones/module.test.ts > Milestones Module (Area 11) > 4. Edge Cases: One Milestone per Task & Deleted Task > should handle deleted linked task without divide-by-zero or crash
- src/modules/team/module.test.ts > Team RealService Unit Tests > Invitation Expiry Guard > should reject response to expired invitation and update status to Expired
- src/modules/team/module.test.ts > Team RealService Unit Tests > Leave and Remove preserves history > leaveProject marks member status as left without calling prisma delete
- src/modules/team/module.test.ts > Team RealService Unit Tests > Leave and Remove preserves history > removeMember marks member status as removed without calling prisma delete
- src/modules/team/module.test.ts > Team RealService Unit Tests > Ownership Transfer > transfers ownership only when new owner explicitly accepts
- src/modules/team/module.test.ts > Team RealService Unit Tests > Role No Longer Available Edge Case > should auto-invalidate invitation if role was deleted before acceptance

Because the API workspace exits nonzero, root `npm test` does not reach its trailing Python command. Python tests were run separately and passed. The Member 2 CI job runs the owned API/Python suite strictly; the existing CI workflow was not weakened.

## Integration boundaries

- The existing development bearer-token user switcher is inherited. These modules are not a substitute for Member 1 authentication.
- Shared contract additions remain a documented proposal. Local utility routes require MEMBER2_EXTENSIONS=true; the committed server default is false.
- Profile/job adapters await Members 1/4 integration; shortlisted-candidate writes use an exported callback and stay disabled until Pipeline is connected.
- Resume links/project excerpts remain in the private review, explicitly labelled. PDF text-layer parsing is heuristic; OCR/DOCX are optional and not implemented.
- No automatic invitation, selection, assignment, or unreviewed profile merge was added.
- All teammate domain services and shared design-system files are unchanged. ProjectDetail has one query-initialization line for tab links; the app shell only mounts the new routes.
