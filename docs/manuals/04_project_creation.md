# Chapter 4: Launching an Engineering Project & AI Scaffolding

## Who it is for
Project Creators, Team Leads, Technical Founders, and Individual Builders.

## Time to complete
12 minutes

## What you will achieve
Create a collaborative engineering project by describing your concept in plain English, using SkillForge AI to scaffold technical requirements and identify team skill gaps before publishing.

## Before you start
Have a rough problem statement or technical objective in mind. You do not need a fully structured specification—the AI will help deconstruct it.

---

## The Flow at a Glance
Refer to [FC-02 Project Creation to Certification Full Pipeline](./flows/FC-02_Project_Creation_to_Certification.mmd).

---

## Step by Step Guide

### Step 1: Click '+ Create Project'
- **Where**: Top right of Home or Projects page, or navigate to `/projects/create`.
- **You will see**: The Project Creation Wizard form.

### Step 2: Describe Your Idea in Natural Language
- **Action**: Fill in the *Project Title*, select a *Category* (e.g. Systems & Backend, Machine Learning, Fullstack), and describe the problem in the *Problem Statement* field.
- **Tip**: Be specific about the engineering challenge (e.g. "Real-time payment fraud detector with sub-10ms latency using Kafka and graph neural networks").

### Step 3: Trigger AI Requirement Scaffolding
- **Action**: Click the purple *AI Deconstruct Requirements* button (or visit `/ai/requirements`).
- **You will see**:
  - Suggested technical roles (e.g., Lead Architect, Streaming Engineer, ML Ops).
  - Recommended core technologies and proficiency levels.
  - Delivery phase timeline suggestions.

### Step 4: Review and Edit Recommendations (Human Override)
- **Action**: You have complete authority to override AI suggestions:
  - Add or remove specific skills.
  - Change requirement weight from `required` to `preferred`.
  - Set *Min Team Size* (default 1) and *Max Team Size* (default 5).

### Step 5: Inspect the Skill-Gap Analysis
- **Where**: The Skill Gap strip at the bottom of the creation form.
- **You will see**: A clear breakdown of skills:
  - `Covered`: Skills you already possess based on your verified profile.
  - `Partial`: Skills you possess at a lower proficiency than required.
  - `Missing`: Skills your project needs where no current member has verified experience.

### Step 6: Save Draft or Publish for Recruiting
- **Action**: Click *Publish Project*.
- **You will see**: The project status transitions from `Draft` to `Recruiting`, and AI collaborator matching is immediately activated.

---

## Field Reference
| Field | Description | Required | Limits |
|---|---|---|---|
| Title | Public project name | Yes | 5-100 characters |
| Problem Statement | Detailed description of the technical problem | Yes | 20-2000 characters |
| Category | Technical domain | Yes | Select from preset domains |
| Min / Max Team Size | Minimum and maximum collaborator headcount | Yes | 1 to 10 members |
| Target Date | Target milestone completion date | Optional | Future date |
| Visibility | Discovery policy | Yes | Public or Private |

---

## Common Problems & Fixes
- **Problem**: The AI suggested technologies I do not want to use.
  - *Cause*: AI provides generalized recommendations based on typical architectures.
  - *Fix*: Click the trash can icon next to any unwanted requirement and manually add your preferred stack.
- **Problem**: I cannot publish my project.
  - *Cause*: Minimum team size exceeds maximum team size, or required fields are missing.
  - *Fix*: Check that Title, Problem Statement, and valid team bounds are filled.

---

## Related Chapters
- [Chapter 5: Collaborator Matching & Team Formation](./05_team_matching_and_invitations.md)
- [Chapter 6: Project Room Collaboration](./06_project_room_execution.md)

[Start Project Creation Tour](#tour-create-project)
