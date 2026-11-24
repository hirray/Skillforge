# Chapter 9: Project Completion, Verification & Certificates

## Who it is for
Project Creators, Team Collaborators, Technical Evaluators, and Verifiers.

## Time to complete
12 minutes

## What you will achieve
Guide your finished project through formal completion: verify deliverables, collect unanimous peer confirmations, submit for cryptographic verification, and receive an immutable digital certificate with a public QR code.

## Before you start
Ensure all planned milestones are completed and all code is merged into your linked GitHub repository.

---

## The Flow at a Glance
Refer to [FC-07 Project Completion, Cryptographic Verification & Public Credentials](./flows/FC-07_Completion_Verification_and_Certificate.mmd).

---

## Step by Step Guide

### Step 1: Submit the Completion Checklist
- **Where**: Project *Overview* or the *Certification* tab.
- **Action**: Click *Request Project Completion*.
- **You will see**: The formal completion checklist modal prompting for:
  - Live Demo URL (e.g. Vercel, Railway, or Docker repository).
  - Final Production GitHub Release / Commit SHA.
  - Final Architecture Summary & Outcomes achieved.
- **Locking**: Submitting the checklist temporarily locks the Project Room to capture a frozen snapshot of evidence.

### Step 2: Unanimous Peer Confirmation
- **Where**: Every confirmed member receives an urgent confirmation alert in Zone E of their Home dashboard.
- **Action**: Each collaborator reviews the final deliverable summary and clicks *Confirm My Contributions & Role*.
- **Consensus Rule**: 100% of confirmed active members must vote to approve before the project advances.

### Step 3: Handling Attribution Disputes
- **Action**: If any collaborator clicks *Dispute Attributions*:
  1. The project state transitions to `Disputed`.
  2. The issue routes automatically to the Platform Admin Mediation Queue (see Chapter 14).
  3. An administrator inspects commit logs and mediates role adjustments.

### Step 4: Verification Engine (Automated vs Admin)
- **Fast-Track Auto-Verification**: If a project has:
  - More than 10 verified git commits.
  - All milestones marked complete with task history.
  - Unanimous peer approval.
  The platform auto-approves verification in seconds.
- **Admin Review**: Flagged projects, sponsored challenges, and high-value bounty projects route to an admin for code audit.

### Step 5: Cryptographic Certificate Minting
- **Outcome**: The moment verification passes:
  - An immutable SHA-256 certificate is minted for **EVERY** confirmed member.
  - A unique scannable QR code and public URL are generated (`/verify/:certId`).
  - The project automatically becomes a *Verified Project Experience* card on each member's portfolio.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Live Demo URL | Publicly accessible production link | Yes | Valid HTTPS URL |
| Final Commit SHA | Git commit hash of final release | Yes | 40-char hex string |
| Certificate UUID | Unique credential identifier | System | Immutable UUID |
| Public Verify URL | Public link for recruiters to audit proof | System | `https://skillforge.dev/verify/:certId` |

---

## Common Problems & Fixes
- **Problem**: One team member is unreachable and cannot click 'Confirm'.
  - *Cause*: Unresponsive member blocks the 100% consensus requirement.
  - *Fix*: If a member has been inactive for >14 days, the owner can initiate an inactivity removal request, which routes to admin resolution.
- **Problem**: Can a certificate be revoked?
  - *Answer*: **Yes**. If plagiarism, code tampering, or academic fraud is subsequently proven, an administrator can revoke the certificate, which immediately marks the public QR page as `Revoked` (see Chapter 14).

---

## Related Chapters
- [Chapter 7: GitHub & Contribution Evidence](./07_github_and_contributions.md)
- [Chapter 10: Portfolio & Opportunity Discovery](./10_portfolio_and_discovery.md)

[Start Completion & Verification Tour](#tour-complete-verify)
