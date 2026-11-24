# Chapter 12: Recruiter Radar, AI Candidate Matching & Hiring Pipeline

## Who it is for
Technical Recruiters, Engineering Hiring Managers, and Company Administrators.

## Time to complete
15 minutes

## What you will achieve
Set up your company profile, post jobs with required taxonomy skills, search verified engineers using commit-based evidence, compare candidates side-by-side, and manage prospects across an 8-stage hiring pipeline.

## Before you start
Switch your active role context to **Recruiter** or **Company Admin** using the top-bar Context Switcher.

---

## The Flow at a Glance
Refer to [FC-11 Recruiter Talent Radar, AI Matching & Hiring Pipeline](./flows/FC-11_Hiring_Pipeline.mmd).

---

## Step by Step Guide

### Step 1: Set Up & Verify Your Company Profile
- **Where**: Switch to *Company Admin* and navigate to `/companies`.
- **Action**:
  - Fill in Company Name, Logo, Website, and Engineering Overview.
  - Upload corporate verification proof (e.g. corporate email domain, business registration).
  - Invite technical recruiters to team seats.

### Step 2: Post a Job Opening
- **Where**: Under *Jobs* in the navigation bar or navigate to `/jobs`.
- **Action**: Click `+ Post New Job`.
- **Fill Details**:
  - *Job Title*: E.g., "Senior Distributed Systems Engineer".
  - *Location & Work Mode*: `remote`, `hybrid`, `onsite`.
  - *Required Skills*: Select from canonical taxonomy (e.g. `Kafka`, `Go`, `Docker`).
  - *Compensation Range*: Base salary range and equity options.
- **Publish**: State moves to `Active`. Candidates can now discover the role in their opportunity feeds.

### Step 3: Search the Talent Radar with Evidence Filters
- **Where**: Navigate to `/talent`.
- **Action**: Filter candidates based on actual verified work rather than resume text:
  - Minimum number of verified git commits (e.g., >20 commits).
  - Completed verified project certificates in specific domains.
  - Availability status (`available_immediate`, `open_to_offers`).

### Step 4: Run AI Job-to-Talent Matching
- **Where**: In `/ai/job-match` or click *Run AI Match* on your job card.
- **You will see**: Candidates ranked into match tiers:
  - `Strong Match` (85-100%): Covers all required skills with proven commit logs.
  - `Good Match` (70-84%): Strong core skills, adjacent secondary technologies.
  - `Adjacent Skills`: High architectural fundamentals, rapid learning trajectory.
- **Explainability**: Every match card cites explicit reasons (e.g. "Contributed 14 verified commits to proj-consensus covering Raft leader election").

### Step 5: Side-by-Side Candidate Comparison
- **Action**: Select up to 3 candidate checkboxes and click *Compare Candidates*.
- **You will see**: A side-by-side comparison matrix evaluating:
  - Verified codebase commits across production repos.
  - Skill depth and taxonomy proficiency.
  - Real project delivery completion rates.

### Step 6: Manage Candidates in the 8-Stage Pipeline
- **Where**: Navigate to `/pipeline`.
- **You will see**: The standardized Kanban pipeline across 8 stages:
  `New` -> `Reviewed` -> `Shortlisted` -> `Contacted` -> `Interview` -> `Selected` -> `Rejected` -> `Closed`
- **Private Team Notes**: Add internal feedback visible only to teammates on your company account.

### Step 7: Consent-Gated Candidate Contact
- **Core Rule**: To prevent spam, direct outreach messages can only be dispatched if the candidate has enabled recruiter outreach in their privacy settings.
- **Action**: Click *Send Outreach Message*. The candidate receives a high-priority inquiry detailing role parameters and compensation.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Job Title | Official title of role | Yes | 5-100 characters |
| Work Mode | Remote, hybrid, or onsite | Yes | Enum |
| Required Skills | Mandatory taxonomy capabilities | Yes | 1 to 10 skills |
| Pipeline Stage | Candidate stage in hiring funnel | System | 8 standardized stages |

---

## Common Problems & Fixes
- **Problem**: I cannot message a strong candidate on the Talent Radar.
  - *Cause*: The candidate has disabled inbound recruiter outreach in `/settings/privacy`.
  - *Fix*: You can bookmark their profile to your private shortlist. If they later express interest in your job posting, messaging will unlock.
- **Problem**: Candidate match scores show 0%.
  - *Cause*: The job posting has no skills tagged from the canonical taxonomy.
  - *Fix*: Edit the job at `/jobs` and select skills from the taxonomy auto-complete dropdown.

---

## Related Chapters
- [Chapter 10: Portfolio & Opportunity Discovery](./10_portfolio_and_discovery.md)
- [Chapter 14: Platform Governance & Admin Tools](./14_administrators.md)

[Start Recruiter Hiring Tour](#tour-recruiter-hiring)
