# Chapter 11: Hackathons, Sprints & Sponsored Company Challenges

## Who it is for
Individual Developers, Competitive Hackathon Teams, and Enterprise Challenge Sponsors.

## Time to complete
10 minutes

## What you will achieve
Participate in rapid 48-hour engineering hackathons with live sprint countdowns, solve sponsored enterprise challenges, and earn company-endorsed verified credentials.

## Before you start
Ensure your profile has at least 3 declared skills and that you have connected your GitHub account.

---

## The Flow at a Glance
Refer to [FC-08 Hackathon & Rapid 48-Hour Sprint Lifecycle](./flows/FC-08_Hackathon_or_Sprint.mmd) and [FC-09 Company-Sponsored Real-World Challenge Architecture](./flows/FC-09_Company_Challenge.mmd).

---

## Step by Step

### Part 1: Hackathons & Sprint Mode

### Step 1: Browse Upcoming Hackathons
- **Where**: Under *Challenges & Hackathons* in the sidebar or navigate to `/hackathons`.
- **You will see**: Event cards listing theme, countdown timer, prize pool, and registration deadline.

### Step 2: Register & Rapid Teammate Matching
- **Action**: Click *Register for Hackathon*.
- **Solo vs Team**:
  - If you already have a team, enter your team name.
  - If you are solo, select *Find Me Teammates*. SkillForge's rapid matcher groups you with complementary builders based on backend, frontend, and design skill overlap.

### Step 3: 48-Hour Sprint Room Execution
- **You will see**: The specialized Sprint Room with:
  - Live clock counting down to the hard deadline.
  - Expedited 3-milestone structure: `Architecture MVP`, `Core Logic & API`, `Polish & Demo`.
  - Automated continuous GitHub commit tracking.

### Step 4: Final Submission & Judging
- **Action**: Before the timer expires, submit your GitHub release tag, live deployment link, and 2-minute video walkthrough.
- **Outcome**: Submissions are scored by technical judges; valid projects receive official Hackathon Sprint Certificates.

---

## Part 2: Sponsored Company Challenges

### Step 1: Browse Enterprise Challenges
- **Where**: Navigate to `/challenges`.
- **You will see**: Verified company challenges (e.g., "Build a Low-Latency Fraud Detection Pipeline", "Zero-Knowledge Proof Verifier").
- **Rewards**: Cash bounties, enterprise software grants, or direct interview fast-tracks.

### Step 2: Launch Challenge Workspace
- **Action**: Click *Take on Challenge*.
- **You will see**: A dedicated challenge workspace initialized with the company's architectural constraints and test suites.

### Step 3: Company Review & Hiring Fast-Track
- **Action**: The sponsoring company's engineering team audits your code, test coverage, and architecture.
- **Outcome**: Teams with high scores receive:
  - Cash prize payout.
  - Company-endorsed Verified Experience badge on their portfolio.
  - Direct fast-track into the company's senior engineering interview pipeline.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Hackathon Team Name | Unique team identifier | Yes | 3-30 characters |
| Demo Video URL | Loom, YouTube, or MP4 link | Yes | Max 3 minutes |
| Submission Repo | Linked GitHub repository | Yes | Must contain public commits |

---

## Common Problems & Fixes
- **Problem**: I missed the 48-hour submission deadline.
  - *Cause*: Hackathon countdown timers strictly lock submissions at `00:00:00`.
  - *Fix*: You can still convert the workspace into a standard public project at `/projects/create` and complete it via the normal certification pipeline.

---

## Related Chapters
- [Chapter 4: Project Creation & Scaffolding](./04_project_creation.md)
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)

[Start Hackathons Tour](#tour-hackathons)
