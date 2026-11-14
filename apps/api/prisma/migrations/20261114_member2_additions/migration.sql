-- CreateTable
CREATE TABLE "AiCandidateProfile" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "matchingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "recruiterVisible" BOOLEAN NOT NULL DEFAULT false,
    "publicSkills" BOOLEAN NOT NULL DEFAULT true,
    "hoursPerWeek" REAL NOT NULL DEFAULT 0,
    "workMode" TEXT NOT NULL DEFAULT 'flexible',
    "duration" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "experienceYears" REAL NOT NULL DEFAULT 0,
    "profileText" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SkillEvidence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AiJobRequirements" (
    "jobId" TEXT NOT NULL PRIMARY KEY,
    "requirementsJson" TEXT NOT NULL DEFAULT '[]',
    "minimumExperience" REAL NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL DEFAULT '',
    "workMode" TEXT NOT NULL DEFAULT 'flexible',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AiMatchRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "ranker" TEXT NOT NULL DEFAULT 'baseline',
    "inputsSnapshot" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MatchOutcome" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT,
    "event" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "sourceRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MetricEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "actorId" TEXT,
    "projectId" TEXT,
    "payloadJson" TEXT NOT NULL DEFAULT '{}',
    "synthetic" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ResumeAccessLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    CONSTRAINT "UserSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserSkill" ("id", "level", "skillId", "userId") SELECT "id", "level", "skillId", "userId" FROM "UserSkill";
DROP TABLE "UserSkill";
ALTER TABLE "new_UserSkill" RENAME TO "UserSkill";
CREATE TABLE "new_Education" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "detailsJson" TEXT,
    CONSTRAINT "Education_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Education" ("degree", "id", "institution", "userId") SELECT "degree", "id", "institution", "userId" FROM "Education";
DROP TABLE "Education";
ALTER TABLE "new_Education" RENAME TO "Education";
CREATE TABLE "new_WorkExperience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "detailsJson" TEXT,
    CONSTRAINT "WorkExperience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkExperience" ("company", "id", "role", "userId") SELECT "company", "id", "role", "userId" FROM "WorkExperience";
DROP TABLE "WorkExperience";
ALTER TABLE "new_WorkExperience" RENAME TO "WorkExperience";
CREATE TABLE "new_Certification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT,
    "detailsJson" TEXT,
    CONSTRAINT "Certification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Certification" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Certification";
DROP TABLE "Certification";
ALTER TABLE "new_Certification" RENAME TO "Certification";
CREATE TABLE "new_Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fileKey" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "hash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "statusHistory" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Resume" ("createdAt", "id", "url", "userId") SELECT "createdAt", "id", "url", "userId" FROM "Resume";
DROP TABLE "Resume";
ALTER TABLE "new_Resume" RENAME TO "Resume";
CREATE UNIQUE INDEX "Resume_userId_hash_key" ON "Resume"("userId", "hash");
CREATE TABLE "new_ResumeExtraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "confirmedAt" DATETIME,
    "decisionsHash" TEXT,
    "decisionsJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResumeExtraction_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ResumeExtraction" ("data", "id", "resumeId") SELECT "data", "id", "resumeId" FROM "ResumeExtraction";
DROP TABLE "ResumeExtraction";
ALTER TABLE "new_ResumeExtraction" RENAME TO "ResumeExtraction";
CREATE TABLE "new_ProjectRequirement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'intermediate',
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL DEFAULT 'manual',
    CONSTRAINT "ProjectRequirement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProjectRequirement" ("id", "isOptional", "level", "projectId", "skillName") SELECT "id", "isOptional", "level", "projectId", "skillName" FROM "ProjectRequirement";
DROP TABLE "ProjectRequirement";
ALTER TABLE "new_ProjectRequirement" RENAME TO "ProjectRequirement";
CREATE TABLE "new_CandidateMatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "explanationJson" TEXT NOT NULL DEFAULT '{}',
    "runId" TEXT,
    "inputsSnapshot" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CandidateMatch" ("id", "jobId", "score", "userId") SELECT "id", "jobId", "score", "userId" FROM "CandidateMatch";
DROP TABLE "CandidateMatch";
ALTER TABLE "new_CandidateMatch" RENAME TO "CandidateMatch";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "SkillEvidence_userId_skillId_idx" ON "SkillEvidence"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "SkillEvidence_userId_skillId_sourceType_sourceId_key" ON "SkillEvidence"("userId", "skillId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "AiMatchRun_projectId_createdAt_idx" ON "AiMatchRun"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MatchOutcome_eventKey_key" ON "MatchOutcome"("eventKey");

-- CreateIndex
CREATE INDEX "MatchOutcome_projectId_userId_idx" ON "MatchOutcome"("projectId", "userId");

-- CreateIndex
CREATE INDEX "MetricEvent_type_occurredAt_idx" ON "MetricEvent"("type", "occurredAt");
