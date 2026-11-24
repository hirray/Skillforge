# Chapter 17: Troubleshooting & Frequently Asked Questions (FAQ)

This guide provides causes and actionable solutions for the most common user questions and technical scenarios encountered on SkillForge.

---

## 1. Frequently Asked Questions (FAQ)

### What makes a SkillForge certificate different from other certificates?
Traditional course certificates only verify that someone watched videos or completed quizzes. A SkillForge certificate proves that an individual actually built and delivered working software with a real team. It is backed by immutable cryptographic commit hashes (SHA-256), peer reviews, and live production URLs.

### Can an AI automatically edit my profile without my knowledge?
**Never**. SkillForge strictly adheres to the Human-in-the-Loop mandate. When AI parses your resume or suggests skills, it creates a quarantine draft. No data is ever added to your talent graph until you explicitly review, edit, and click *Confirm & Write to Profile*.

### How do I switch roles?
Look at the top navigation bar. Click the role chip (e.g. `Context: Individual`) and choose another role (such as `Recruiter` or `Mentor`). The interface re-renders instantly without reloading the page.

### Are my private project chats visible to recruiters or companies?
**No**. Recruiter accounts and corporate sponsors can only see verified proof artifacts: certificates, public project cards, and commit metrics. Internal team discussions, 1:1 messages, meeting notes, and internal disputes are strictly confidential and locked behind project membership authorization.

---

## 2. Troubleshooting Guide

### Blocker 1: "I cannot see a project or page when I click a link."
- **Possible Cause**: Your active role context does not have permission to view that page (e.g., trying to access Recruiter Pipeline while in the Individual context).
- **Fix**: Open the Context Switcher in the top bar and switch to the role with matching permissions (e.g. Recruiter or Company Admin).

### Blocker 2: "My project shows 'Error: Project not found'."
- **Possible Cause**: The requested project ID was not seeded in the database or network timed out.
- **Fix**: The platform now includes an automatic canonical fallback that renders canonical projects immediately. If the error persists, click `← View All Projects` to return to the active project catalog.

### Blocker 3: "My resume upload failed or skills were misidentified."
- **Possible Cause**: The file was an image-only scanned PDF or password-protected.
- **Fix**: Export your resume as a standard text-based PDF or DOCX file under 10MB. During the review step, you can manually type any technology that the parser missed.

### Blocker 4: "My GitHub commits are not showing up in my project."
- **Possible Cause**: Your local git email address does not match your SkillForge account email.
- **Fix**: Check `git config user.email` in your terminal. Add that email address as an alias under `/auth/settings`.

### Blocker 5: "My project health displays 'At Risk'."
- **Possible Cause**: No commits have been pushed in the last 7 days or a task is overdue.
- **Fix**: Push an active commit to your linked repository or update the due dates on overdue tasks in the Kanban board.

### Blocker 6: "I cannot contact a candidate on the Talent Radar."
- **Possible Cause**: The candidate has set their inbound recruiter contact preference to `Disabled` or `Shortlist Only`.
- **Fix**: Bookmark the candidate to your pipeline. When the candidate expresses interest in your public job openings, direct messaging will unlock.

---

## 3. How to Report Content or Abuse
If you discover offensive content, plagiarized code, or inappropriate conduct:
1. Click the `...` menu on any project, comment, or candidate card.
2. Select **Report Content**.
3. Choose the violation type (`Plagiarism`, `Harassment`, `Spam`, `Academic Fraud`).
4. Enter supporting notes and click **Submit Report**.
5. Your report immediately routes to the Platform Admin Moderation Queue for review.
