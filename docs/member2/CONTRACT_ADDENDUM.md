# Member 2 contract proposal

Status: proposed for review by all four members. The frozen `packages/contract` files are unchanged. The local `MEMBER2_EXTENSIONS=true` flag enables the proposed utility endpoints while the team reviews them; its committed default is false. This document does not constitute team approval.

The existing OpenAPI lists routes but supplies no request or response schemas. Member 2's validated request schemas live in `apps/api/src/modules/ai/schema.ts`, internal Python schemas in `services/ai/app/schemas.py`, and the typed UI client in `apps/web/src/modules/ai/client.ts`. `npm run check:member2-contract` verifies actual Express registrations against the existing route list rather than printing an unconditional success.

| Existing route | Proposed concrete payload |
| --- | --- |
| POST /resumes | Multipart `file`: PDF, at most 10 MB; 202 `{data:{id,status,reused}}` |
| GET /resumes/{id} | Owner-only `{data:{id,fileName,fileSize,status,attempts,lastError,statusHistory,createdAt}}` |
| GET /resumes/{id}/extraction | Owner-only `{data:{id,contact,skills,education,experience,certifications,links,projects,proposals,warnings,mode,confirmedAt},status}` |
| POST /resumes/{id}/confirm | `{extractionId, decisions:[{id,action:accepted|edited|discarded,value?}]}`; idempotent confirmation |
| POST /ai/requirements | `{description,projectId?,teamSize?,timeline?}`; editable suggestions, rationales, warnings, clarifications and **gap:{covered,partial,missing}** |
| GET/PUT /projects/{id}/requirements | Member read / owner write; write `{requirements:[{name,proficiency,type,source}]}` |
| POST /ai/match | Owner-only `{projectId,filters?:{role,minimumAvailability,workMode}}`; candidates with rank, reasons, signals, weights, caveats, runId |
| POST /ai/job-match | Company recruiter-only `{jobId,constraints?:{location:hard|soft,workMode:hard|soft}}`; structured explanation snapshot |
| GET /projects/{id}/health | Active member/owner only; status, nullable index, reasons, actions, task sample count |
| GET /analytics/summary | Admin only; optional ISO `from`, `to`, max 366 days; aggregate metrics, sample sizes, suppression and evaluation |

The gap field and richer shapes above need team review before promotion into the shared contract. They are implemented against this local proposal so the six modules can be reviewed and tested without rewriting another member's interfaces.

## Proposed utility endpoints

- GET /ai/context: current actor, accessible project IDs, company jobs, safe discovery preferences.
- PATCH /ai/preferences: only the actor's `matchingOptIn`, `recruiterVisible`, `publicSkills`.
- GET /ai/job-match/{jobId}: stored explanations, stale-input detection, current consent recheck.
- GET /resumes: own resume list.
- POST /resumes/{id}/retry: failed jobs only.
- GET /resumes/{id}/download: five-minute user-bound HMAC download URL.
- GET /resumes/{id}/file: authentication plus HMAC, expiry and ownership required.
- DELETE /resumes/{id}: remove own original and review; preserve previously confirmed profile entries.

Utility routes are for the local review workflow and require explicit extension enablement. Resume utilities are additionally protected by `RESUMES_SOURCE=real`.

## Shared-model seams

`AiCandidateProfile` provides explicit opt-in and visibility until Member 1 supplies the professional profile. It defaults to opt-out. `AiJobRequirements` provides structured job requirements until Member 4's full job editor is merged. `SkillEvidence` is additive and source-attributed. Collaborator snapshots use owned `AiMatchRun`; recruiter explanations extend the existing `CandidateMatch` with additive fields. The existing User/Job API shapes remain unchanged.

Exports for integration: `AiRequirementPanel`, `useRequirementSuggestions`, `MatchResultsPanel`, `HealthTab`, `HealthBadge`, `JobMatchResults`. `JobMatchResults` accepts an `onShortlist(candidate)` callback. Standalone comparison works now; shortlisting remains disabled until Member 4 supplies the real Pipeline callback. No endpoint silently claims a shortlist was created.
