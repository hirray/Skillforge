# SkillForge Dataset & Entity Architecture Mapping (DATA_MAPPING.md)

This document formalizes the canonical mapping between the connected dataset entities and SkillForge's 34 modular domains across API contracts, Prisma schemas, and frontend presentation models.

---

## 1. Core Identity & Skill Taxonomy

| Dataset Entity | SkillForge Target Model | Primary Key | Key Attributes Mapped | Business Rules & Invariants |
|---|---|---|---|---|
| `users` | `User`, `UserProfile` | `id` (e.g. `user-001` .. `user-007`) | `email`, `name`, `headline`, `bio`, `city`, `workMode`, `intendedUse`, `companyName`, `jobTitle` | Never use a dedicated `Student` model. Roles are stored in `roles[]`. Authorized via JWT and session tokens. |
| `skills` | `UserSkill`, `SkillTaxonomy` | `id` | `skillName`, `level` (`beginner`, `intermediate`, `expert`), `yearsOfExperience`, `verified` | Skills normalize against canonical 240+ taxonomy nodes. Levels determine AI skill-gap matching. |
| `resumes` | `ResumeExtraction`, `Evidence` | `id` | `fileName`, `fileUrl`, `parsedSkills[]`, `confidenceScore`, `reviewedByHuman` | Human review gate required before extracted skills become verified. |

---

## 2. Collaborative Workspace & Project Room

| Dataset Entity | SkillForge Target Model | Primary Key | Key Attributes Mapped | Business Rules & Invariants |
|---|---|---|---|---|
| `projects` | `Project`, `ProjectRole`, `ProjectRequirement` | `id` (e.g. `proj-monorepo`, `proj-consensus`, `proj-swarm`) | `title`, `description`, `problemStatement`, `category`, `stage` (`idea`, `planning`, `in progress`, `completed`), `status` (`Draft`, `Recruiting`, `Active`, `Completed`, `Verified`, `Archived`), `visibility` (`Public`, `Private`) | Project Room execution requires active membership or owner role. Canonical projects persist in memory when database is offline. |
| `tasks` | `Task`, `TaskHistory`, `TaskComment` | `id` (e.g. `task-proj-monorepo-1`) | `title`, `description`, `priority` (`Low`, `Medium`, `High`, `Critical`), `status` (`To Do`, `In Progress`, `In Review`, `Done`), `assigneeId`, `milestoneId`, `dependsOn` | Moving tasks auto-recalculates linked milestone progress. Audit history is append-only. |
| `milestones` | `Milestone`, `MilestoneHistory` | `id` (e.g. `ms-proj-monorepo-1`) | `title`, `description`, `dueDate`, `status` (`To Do`, `In Progress`, `Done`), `progressPercentage`, `isManualCompletion`, `completionRationale` | Zero fake progress. Manual completion requires an auditable rationale. Completed milestones lock in history. |
| `resources` | `ProjectResource` | `id` | `title`, `type` (`link`, `file`), `category` (`Documentation`, `Repository`, `Design`, `Demo`), `url`, `fileKey` | Resources provide verifiable documentation and link out to GitHub repositories. |

---

## 3. Proof, Attestation & Credentials

| Dataset Entity | SkillForge Target Model | Primary Key | Key Attributes Mapped | Business Rules & Invariants |
|---|---|---|---|---|
| `contributions` | `ProjectContribution`, `CommitEvidence` | `id` | `commitHash`, `authorEmail`, `linesAdded`, `linesDeleted`, `verified`, `message` | Commits sync from GitHub and cryptographic attestation logs. Attestation requires confirmed team membership. |
| `certificates` | `Certificate`, `VerificationRegistry` | `id` (e.g. `cert-proj-monorepo-1`) | `certificateNumber`, `recipientId`, `projectId`, `issueDate`, `status` (`active`, `revoked`), `qrCodeUrl`, `signatureHash` | Minted upon project completion verification. Public verification route `/verify/:id` validates signature. |
| `portfolio` | `PortfolioItem`, `VerifiedExperience` | `id` | `title`, `role`, `projectSummary`, `evidenceLinks[]`, `verifiedAt`, `skillsAcquired[]` | Displays authenticated achievements, attested certificates, and code evidence to prospective employers. |

---

## 4. Market & Hiring Pipelines

| Dataset Entity | SkillForge Target Model | Primary Key | Key Attributes Mapped | Business Rules & Invariants |
|---|---|---|---|---|
| `jobs` | `JobPosting`, `JobRequirement` | `id` | `title`, `description`, `department`, `location`, `salaryRange`, `status` (`Draft`, `Active`, `Paused`, `Closed`) | Owned by company admins and recruiters. Visible in talent job board. |
| `pipeline` | `JobApplication`, `PipelineCandidate` | `id` | `jobId`, `candidateId`, `stage` (`applied`, `screen`, `technical`, `offer`, `hired`, `rejected`), `aiMatchScore`, `aiExplanation` | Candidate consent required before un-masking full contact records. Explanations must provide human-readable skill alignment. |
| `mentorship` | `MentorProfile`, `MentorSession` | `id` | `mentorId`, `expertise[]`, `availabilityHours`, `status`, `reviewNotes` | Advisors critique architectures and validate milestones without needing full repository write membership. |
| `hackathons` | `HackathonEvent`, `ChallengeBounty` | `id` | `title`, `sponsorName`, `prizePool`, `startDate`, `endDate`, `status` (`Upcoming`, `Active`, `Judging`, `Ended`) | Rapid-sprint team matching and automated milestone submission. |
