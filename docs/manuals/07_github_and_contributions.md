# Chapter 7: GitHub Integration & Contribution Evidence

## Who it is for
Individual Contributors, Team Leads, and Project Owners.

## Time to complete
8 minutes

## What you will achieve
Link your project to a GitHub repository, automatically stream commit logs and pull requests into your contribution ledger, and generate verifiable cryptographic evidence for each team member.

## Before you start
Ensure you have a GitHub account and administrative or contributor access to the repository you want to link.

---

## The Flow at a Glance
Refer to [FC-05 Project Room Execution & Contribution Loop](./flows/FC-05_Project_Room_Loop.mmd).

---

## Step by Step Guide

### Step 1: Connect GitHub via OAuth
- **Where**: Navigate to `/integrations/github` or the *GitHub* tab inside your project.
- **Action**: Click *Connect GitHub Account*.
- **You will see**: The standard GitHub authorization dialog requesting read access to repositories and commit metadata.
- **Safety**: SkillForge requests minimal read permissions; it never requests write access or personal repository deletion rights.

### Step 2: Link Repository to Your SkillForge Project
- **Where**: In the Project Room *GitHub* panel.
- **Action**: Select the target repository from the dropdown menu (or enter the repository full path `owner/repo-name`).
- **Confirmation**: Click *Link Repository*.
- **Sync**: The integration immediately indexes repository commit history, branches, and merged pull requests.

### Step 3: Automated Contribution Evidence Extraction
- **Action**: When team members push commits or merge pull requests, SkillForge matches the git author email to confirmed team member profiles.
- **You will see**: Real-time commits appear under the *Contributions* tab:
  - Commit SHA-256 hash.
  - Number of lines added / deleted.
  - Linked task ID (if the commit message included `#task-id`).

### Step 4: Reviewing Your Contribution Profile
- **Where**: Inside the project *Contributions* tab.
- **You will see**: A breakdown per member:
  - Total commits contributed.
  - Core technologies touched (e.g. TypeScript, Kafka, Docker).
  - Peer-attested review score.

### Step 5: Handling Wrong Attributions & Disputes
- **Action**: If a commit is attributed to the wrong member or missing:
  1. Click *Contest Attribution* next to the commit entry.
  2. Provide the correct git author email or co-author metadata.
  3. The project owner or team consensus reviews and confirms the correction.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Repository Name | Full GitHub repo identifier (`org/repo`) | Yes | Valid public or authorized private repo |
| Commit Hash | SHA-1 or SHA-256 commit identifier | System | 40-character hex string |
| Linked Task | Associated Kanban task ID | Optional | Must exist in current project |

---

## Common Problems & Fixes
- **Problem**: My commits are not showing up under my name.
  - *Cause*: The email address configured in your local git client (`git config user.email`) does not match your SkillForge account email.
  - *Fix*: Add your git email as an alias in `/auth/settings`, or link the commits manually with task IDs.
- **Problem**: Synchronization appears paused.
  - *Cause*: GitHub OAuth token expired or rate limit reached.
  - *Fix*: Click *Re-sync Repository* in the GitHub panel to refresh the OAuth token.

---

## Related Chapters
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)

[Start GitHub Integration Tour](#tour-github-evidence)
