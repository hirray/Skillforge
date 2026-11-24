# Chapter 3: Profile Setup, Skills & Resume Intelligence

## Who it is for
Individual Builders, Students, Freelancers, and Technical Candidates.

## Time to complete
10 minutes

## What you will achieve
Upload your existing resume, let SkillForge AI normalize your skills into canonical taxonomy entities, perform mandatory human review before writing to your profile, and configure your privacy visibility.

## Before you start
Prepare your resume file in PDF or DOCX format. Keep it under 10MB.

---

## The Flow at a Glance
Refer to [FC-03 Resume Ingestion, AI Parsing & Profile Normalization](./flows/FC-03_Resume_and_Profile.mmd).

---

## Step by Step Guide

### Step 1: Access Resume Intelligence
- **Where**: Click *Resume Intelligence* in the Zone D home shortcuts or navigate to `/resumes`.
- **You will see**: The Resume Studio upload container with drag-and-drop support.
- **Tip**: You can upload updated versions at any time without losing previous verified skills.

### Step 2: Upload Your Resume File
- **Action**: Drag your resume into the drop zone or click *Browse Files*.
- **You will see**: The extraction pipeline status move from `uploaded` to `parsing` and then `review_ready`.
- **Core Rule**: SkillForge **NEVER** automatically writes extracted information to your public profile without your explicit review.

### Step 3: Mandatory Human-in-the-Loop Review
- **Where**: The side-by-side extraction review drawer.
- **You will see**: Extracted skills, work experience dates, and degrees mapped against canonical taxonomy items.
- **Action**:
  - Adjust proficiency levels (`beginner`, `intermediate`, `expert`).
  - Delete any skill misidentified by the AI parser.
  - Add any missing technologies.
- **Confirmation**: Click the purple *Confirm & Write to Profile* button.

### Step 4: Link Codebase Skill Evidence
- **Where**: Navigate to `/me/profile` under the *Skills* tab.
- **Action**: Next to each skill, click *Attach Evidence* to link a GitHub commit hash, pull request URL, or completed SkillForge project.
- **You will see**: An `Attested` badge appear next to verified skills on your talent graph.

### Step 5: Configure Profile Visibility
- **Where**: In `/settings/privacy` or the top of `/me/profile`.
- **Options**:
  - `Public`: Anyone on the web can view your profile and verified proof.
  - `Registered Users`: Only authenticated SkillForge members can view.
  - `Recruiters Only`: Public cannot see your profile, but verified corporate recruiters can discover you on the Talent Radar.
  - `Private`: Completely hidden from discovery; only members of your active projects can see your details.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Resume File | PDF or DOCX resume document | Yes | Max 10MB |
| Skill Name | Canonical technology name (e.g. React, Kafka) | Yes | Validated against taxonomy |
| Proficiency | Self-assessed technical depth | Yes | beginner, intermediate, expert |
| Availability | Current weekly commitment capacity | Yes | available, busy, not_available |
| Visibility | Public discovery policy | Yes | public, registered, recruiters_only, private |

---

## Common Problems & Fixes
- **Problem**: The AI parser mapped my custom framework incorrectly.
  - *Cause*: The technology is an alias or proprietary library not in the canonical taxonomy.
  - *Fix*: Edit the skill name manually during Step 3, or propose a new skill in `/admin/skills`.
- **Problem**: Recruiters are not finding my profile in search.
  - *Cause*: Your profile visibility is set to `Private` or `Registered Users`.
  - *Fix*: Change visibility to `Recruiters Only` or `Public` in `/settings/privacy`.

---

## Related Chapters
- [Chapter 4: Project Creation & Scaffolding](./04_project_creation.md)
- [Chapter 10: Portfolio & Opportunity Discovery](./10_portfolio_and_discovery.md)

[Start Resume Upload Tour](#tour-resume-upload)
