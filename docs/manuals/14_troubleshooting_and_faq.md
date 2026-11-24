# SkillForge Manual 14: Troubleshooting & Frequently Asked Questions

## 1. Overview
This manual provides immediate solutions for common questions, permission boundaries, cryptographic commit validation, and account state inquiries.

---

## 2. Frequently Asked Questions

### Q1: Why can't I access the Recruiter Pipeline or Talent Search?
**Answer**: You are likely in the **Individual** or **Mentor** context. Click the **Context Switcher** in the top navigation bar and select **"Recruiter"** or **"Company Admin"**. Your workspace will update immediately.

### Q2: How are skills verified on SkillForge?
**Answer**: Skills are verified through evidence, not claims. You can attest a taxonomy skill by:
1. Attaching a verified GitHub commit SHA to a completed project milestone.
2. Obtaining a milestone sign-off from a verified mentor.
3. Successfully finishing a sponsored challenge or hackathon.

### Q3: How do I verify a certificate authenticity without logging in?
**Answer**: Every certificate emitted by SkillForge contains a public verification URL: `http://localhost:5173/verify/:certId`. This page audits the Ed25519 root signature and commit tree hash publicly with zero login required.

### Q4: How do I restart the guided tour?
**Answer**: Click the **"✨ Tour"** button in the top navigation bar, or click **"✨ Replay Guided Tour"** on the [Help Center](/help) page.

---

## 3. Error Codes Reference

| Error Code | Meaning | Immediate Resolution |
| :--- | :--- | :--- |
| `401_UNAUTHORIZED` | Token expired or invalid session | Log out and sign in through `/auth/login` |
| `403_FORBIDDEN` | Route requires a different active context | Switch context using top-bar Context Switcher |
| `404_NOT_FOUND` | Project, job, or certificate does not exist | Check URL spelling or verify in respective workspace |
| `422_VALIDATION` | Form field constraints violated | Ensure required fields are completed and valid |

---

## 4. Related Flows & Next Steps
- [Manual 00: Getting Started & The Six Contexts](./00_getting_started.md)
- [In-App Help Center](/help)
