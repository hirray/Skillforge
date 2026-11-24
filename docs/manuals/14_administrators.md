# Chapter 14: Platform Administration, Governance & Security Audit

## Who it is for
Platform Administrators, Compliance Officers, and Security Stewards.

## Time to complete
12 minutes

## What you will achieve
Administer the SkillForge platform: review moderation queues, arbitrate project disputes, audit verification submissions, revoke compromised certificates, curate the skill taxonomy, and inspect immutable audit logs.

## Before you start
Ensure your account has Platform Administrator privileges and switch to the **Platform Admin** context.

---

## The Flow at a Glance
Refer to [FC-14 Platform Governance, Moderation & Audit Architecture](./flows/FC-14_Admin_and_Moderation.mmd).

---

## Step by Step Guide

### Step 1: Access the Admin Console
- **Where**: Navigate to `/admin` or click *Admin Console* in the sidebar.
- **You will see**: The central administrative HUD showing:
  - Open moderation reports queue.
  - Project verification review queue.
  - Pending corporate verification requests.
  - Skill taxonomy alias proposals.

### Step 2: Processing Content & Abuse Reports
- **Action**: Click on an open report in the Moderation Queue.
- **Inspect**: Review reported chat messages, project problem statements, or offensive material alongside reporter notes.
- **Enforcement Options**:
  - `Dismiss`: Clear false alarm with justification.
  - `Issue Warning`: Notify user with remediation required.
  - `Remove Content`: Redact offending message or description.
  - `Suspend User`: Revoke user authentication sessions.

### Step 3: Arbitrating Project Attribution Disputes
- **Where**: Under *Project Verifications* -> *Disputed*.
- **Context**: If collaborators disagree on who authored code, the administrator inspects:
  - Git commit SHAs and author emails.
  - Pull request review approvals.
  - Task board assignment history.
- **Decision**: Adjust member percentage attributions or reassign role titles before releasing the final certificate.

### Step 4: Certificate Revocation
- **Action**: If academic dishonesty, code plagiarism, or corporate IP infringement is proven after certificate issuance:
  1. Search certificate UUID in `/admin/certificates`.
  2. Click *Revoke Certificate*.
  3. Enter mandatory audit reason and link incident ticket.
- **Public Impact**: The public verification page (`/verify/:certId`) immediately turns red and displays `REVOKED: This credential was invalidated by platform security`.

### Step 5: Curating Canonical Skill Taxonomy
- **Where**: Navigate to `/admin/skills`.
- **Action**:
  - Review community-submitted skills.
  - Merge redundant aliases (e.g. merge `ReactJS`, `React.js` into canonical `React`).
  - Assign skill categories and proficiency level criteria.

### Step 6: Inspecting the Immutable Audit Log
- **Where**: Navigate to `/admin` under the *Audit Log* tab.
- **You will see**: An append-only ledger of every critical system action:
  - Timestamp, Actor ID, Target Entity, Action Type, and Resulting Delta.
  - Export audit logs in JSON format for external compliance audits.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Revocation Reason | Justification for invalidating certificate | Yes | Minimum 10 characters |
| Skill Alias | Synonym mapped to canonical taxonomy ID | Yes | Unique per alias |
| Moderation Action | Enforced sanction | Yes | warn, suspend, redact, dismiss |

---

## Common Problems & Fixes
- **Problem**: Can an administrator edit code inside a team's repository?
  - *Answer*: **No**. SkillForge strictly maintains non-custodial code separation. Administrators can adjust platform attributions, but cannot alter git repositories directly.

---

## Related Chapters
- [Chapter 9: Project Completion & Certification](./09_completion_and_certification.md)
- [Chapter 16: System Reference & Privacy](./16_system_reference.md)

[Start Admin Tour](#tour-admin)
