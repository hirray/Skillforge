# Chapter 10: Professional Portfolio & Opportunity Discovery

## Who it is for
Individual Developers, Freelancers, Job Seekers, and Candidates.

## Time to complete
8 minutes

## What you will achieve
Customize your public engineering dossier, showcase verified project cards, generate a shareable vanity URL with embedded proof badges, and discover matching career opportunities.

## Before you start
Complete your profile details or have at least one verified experience card minted from a completed project.

---

## The Flow at a Glance
Refer to [FC-12 Individual Opportunity Discovery & Career Inbound](./flows/FC-12_Opportunities_for_Individuals.mmd) and [FC-16 Privacy Boundaries](./flows/FC-16_Who_Can_See_My_Data.mmd).

---

## Step by Step Guide

### Step 1: Open the Portfolio Editor
- **Where**: Under *My Portfolio* in the navigation bar or navigate to `/me/portfolio`.
- **You will see**: The interactive portfolio customizer with a live split-screen preview.

### Step 2: Organize Your Verified Project Cards
- **Action**:
  - Reorder project cards using drag handles to highlight your strongest engineering work.
  - Pin up to 3 *Featured Projects* to the top of your public showcase.
  - Toggle individual project visibility (e.g., hide early learning projects, showcase production MVPs).

### Step 3: Embed Verifiable Cryptographic Badges
- **You will see**: Verified cards display an attested green badge:
  - Total confirmed repository commits.
  - Specific technologies used in production (e.g. `Kafka (Advanced)`, `Docker`).
  - One-click link to the public verification certificate (`/verify/:certId`).

### Step 4: Share Your Public Vanity URL
- **Where**: Top right of `/me/portfolio`.
- **Action**: Copy your public URL (format: `https://skillforge.dev/u/:username` or `/portfolio/:username`).
- **Use case**: Paste this link into your resume, GitHub profile, LinkedIn, or send directly to hiring managers.

### Step 5: Discovering Career Opportunities
- **Where**: Navigate to the Discover hub at `/discover` or `/feed`.
- **Tabs**:
  - *Projects Seeking Skills*: Browse collaborative teams that have active gaps matching your exact verified technologies.
  - *Full-Time Jobs*: Corporate engineering openings posted by verified tech companies.
  - *Hackathons & Sprints*: Time-boxed weekend challenges with cash bounties.
- **Action**: Click *Save* to bookmark an opportunity, or *Express Interest* to share your verified dossier with the hiring team.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Vanity Username | Custom URL slug (`/u/username`) | Yes | 3-30 alphanumeric characters |
| Bio Headline | Professional engineering specialty | Yes | Max 100 characters |
| Featured Projects | Top highlighted projects | Optional | Max 3 pinned cards |
| Inbound Status | Open to recruiter discussions | Yes | Active / Paused |

---

## Common Problems & Fixes
- **Problem**: When recruiters visit my link, they see 'Profile Not Found'.
  - *Cause*: Your portfolio visibility is set to `Private` or `Registered Users Only`.
  - *Fix*: In `/settings/privacy`, change *Portfolio Visibility* to `Public`.
- **Problem**: A project I completed is not appearing in my portfolio editor.
  - *Cause*: The project completion checklist is still awaiting peer confirmation from teammates.
  - *Fix*: Check the project certification status at `/projects/:id` to verify all members have signed off.

---

## Related Chapters
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)
- [Chapter 12: Recruiter Radar & Hiring Pipeline](./12_recruiters_and_companies.md)

[Start Portfolio Tour](#tour-portfolio)
