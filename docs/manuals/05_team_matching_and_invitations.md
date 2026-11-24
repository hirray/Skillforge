# Chapter 5: Collaborator Matching, Invitations & Team Assembly

## Who it is for
Project Owners looking for builders, and Individual Contributors seeking projects to join.

## Time to complete
10 minutes

## What you will achieve
Find complementary collaborators using SkillForge's explainable AI matching engine, issue role-specific invitations, handle inbound join requests, and establish mutual consent before work begins.

## Before you start
Publish an engineering project (status: `Recruiting`) or have a completed profile ready for discovery.

---

## The Flow at a Glance
Refer to [FC-04 AI Collaborator Matching & Team Assembly Flow](./flows/FC-04_Matching_and_Team_Formation.mmd).

---

## Step by Step Guide

### Step 1: Open Collaborator Matching
- **Where**: Inside your project under the *Team* tab, or visit `/ai/match`.
- **You will see**: Candidate cards ranked by a percentage synergy score (0-100%).

### Step 2: Understand the Synergy Breakdown (Explainability)
- **Action**: Click *Why this match?* on any candidate card.
- **You will see**: An explainable breakdown rather than a black-box number:
  - *Skill Overlap*: Identifies which of your project's missing gaps this candidate covers.
  - *Timezone Compatibility*: Evaluates working hour overlap.
  - *Past Evidence*: Cites verified commit history or completion certificates.

### Step 3: Issue a Role-Specific Invitation
- **Action**: Click *Invite to Project*.
- **Where**: The invitation modal.
- **You will see**: Options to select the specific role opening (e.g. "Distributed Systems Engineer") and append a personalized orientation note.
- **Dispatch**: The candidate immediately receives an alert in their notifications and inbox.

### Step 4: The Candidate Experience (Responding to Invites)
- **Where**: In `/notifications` or `/team` under *My Invitations*.
- **You will see**: The project title, problem statement, required role, and owner's note.
- **Action**: Click *Accept* or *Decline*.
- **Expiry Rule**: Invitations automatically expire after 7 days if unresponded to ensure teams do not remain stalled.

### Step 5: Handling Inbound Join Requests
- **Where**: Project *Team* tab under *Join Requests*.
- **Action**: Review incoming requests submitted by developers who found your project on the Discover feed.
- **Decision**: Click *Approve* to assign their role, or *Decline* with optional feedback.

### Step 6: Team Formation & Activation
- **Outcome**: Once minimum team size is satisfied and mutual consent is recorded, the project status automatically transitions to `Active`.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Role Title | Title assigned to collaborator | Yes | E.g. Frontend Lead, ML Ops |
| Invitation Note | Personal message from project owner | Optional | Max 500 characters |
| Invitation Status | Lifecycle state of the invitation | System | pending, accepted, declined, expired |

---

## Common Problems & Fixes
- **Problem**: Candidate cannot see my project invitation.
  - *Cause*: Candidate has muted project notifications or invitation expired.
  - *Fix*: Check `/team` in your project to see if the invitation is marked `expired`. If so, re-send the invite.
- **Problem**: The project remains in 'Recruiting' even though members joined.
  - *Cause*: The number of confirmed members is below your configured `Min Team Size`.
  - *Fix*: Invite additional collaborators or lower the minimum team size in Project Details.

---

## Related Chapters
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)
- [Chapter 8: Project Rescue & Emergency Handover](./08_project_rescue.md)

[Start Team Matching Tour](#tour-find-collaborators)
