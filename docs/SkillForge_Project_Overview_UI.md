# SkillForge --- Project Overview Dashboard

## Overview

This document defines the redesigned **SkillForge Project Overview**
interface shown in the reference design.

The screen is a professional SaaS dashboard for managing academic,
freelance, or collaborative projects. It provides a clear view of
project information, team requirements, skills, tasks, milestones,
resources, discussions, and project analytics.

------------------------------------------------------------------------

## 1. Application Layout

The application uses a two-part desktop layout:

-   **Left:** Fixed dark navy sidebar
-   **Right:** Main dashboard workspace
-   **Top:** Breadcrumbs, search, notifications, and user profile
-   **Content:** Project header followed by navigation tabs and
    information cards

### Visual Style

-   Modern SaaS / enterprise dashboard
-   Clean white and very-light background
-   Dark navy primary text
-   Blue and purple accent colors
-   Rounded cards
-   Soft shadows
-   Generous spacing
-   Compact but readable typography
-   Consistent iconography

------------------------------------------------------------------------

# 2. Sidebar Navigation

The sidebar contains the SkillForge brand at the top and the primary
application navigation.

### Branding

**SkillForge**

Logo: - Stylized `S` icon - Purple/blue gradient - White brand text

### Navigation Items

1.  Dashboard
2.  Users
3.  Skills
4.  Resources
5.  Projects
6.  Teams
7.  Tasks
8.  Milestones
9.  Chat
10. Announcements
11. Notifications
12. Search
13. AI Assistant
14. GitHub
15. Contributions
16. Settings

### Active State

The selected navigation item should have:

-   Purple/blue background
-   White text
-   Rounded container
-   Slight visual elevation

In the reference screen, **Projects** is active.

------------------------------------------------------------------------

# 3. Top Header

The top header contains project navigation and account controls.

### Left Side

Breadcrumb:

`IITAN Dev Labs > Final Year June 2023 > Web & Mobile Development`

Each breadcrumb item should be clickable.

### Search

Search field:

`Search projects, teams, skills...`

The search should support global application search.

### Right Side

-   Notification bell
-   Notification indicator
-   User avatar
-   User name
-   User role
-   Account dropdown

Example:

**Tarun Patel**

`Team Foundation`

Avatar:

`TR`

------------------------------------------------------------------------

# 4. Project Header

The project header appears below the top navigation.

### Back Navigation

`← Back to Projects`

### Project Identity

Project icon + title:

**Pilot Project (Updated)**

Status:

**Active**

The active status is represented using a green status pill.

### Project Metadata

Display the following information:

  Property               Value
  ---------------------- -----------------
  Project Type           Web App
  Platform               Mobile App
  Owner / Organization   Team Foundation
  Project Date           June 2023
  Stage                  Planning

### Header Actions

Primary action:

**Edit Project Room**

Secondary action:

**More (...)**

Additional action:

**Favorite / Star**

------------------------------------------------------------------------

# 5. Project Navigation Tabs

The project navigation should contain:

-   Overview
-   Team
-   Tasks
-   Milestones
-   Resources
-   Discussions
-   Analytics

The active tab is:

**Overview**

The active tab should have:

-   Blue/purple text
-   Bottom border
-   Stronger font weight

------------------------------------------------------------------------

# 6. Project Description Card

The first major content card contains the project description.

### Section

**Project Description**

Example content:

> Updated description here for your project. This project focuses on
> building a web and mobile application to solve the identified problem
> with a scalable and user-friendly solution.

### Edit Action

An **Edit** button should appear on the right side.

------------------------------------------------------------------------

# 7. Problem Statement

The description card also contains a problem statement section.

### Label

**Problem Statement**

### Example

> Solving problem XYZ efficiently through innovative web and mobile
> solutions.

A target icon can be used to visually differentiate the problem
statement.

------------------------------------------------------------------------

# 8. Project Roles

The Project Roles card displays the roles required to form the project
team.

### Header

**Project Roles**

Action:

**View All**

### Roles

#### Frontend Developer

`1 / 2 filled`

Status: - Partially filled

Icon: - Code icon

------------------------------------------------------------------------

#### Backend Developer

`1 / 2 filled`

Status: - Partially filled

Icon: - Server/database icon

------------------------------------------------------------------------

#### Product Manager

`0 / 1 filled`

Status: - Open

Icon: - User/profile icon

------------------------------------------------------------------------

### Interaction

Each role row should be clickable.

Clicking a role can open:

-   Role details
-   Required skills
-   Current members
-   Available applicants
-   Join/apply option

------------------------------------------------------------------------

# 9. Required Capabilities & Skills

This card displays the technical and professional capabilities required
for the project.

### Header

**Required Capabilities & Skills**

Use a lightning/skill icon.

### Skills

Recommended skills shown as tags:

-   React --- Required
-   TypeScript --- Preferable
-   Node.js --- Preferable
-   Figma --- Recommended
-   UI/UX Design
-   API Integration
-   Database Management
-   Version Control (Git)
-   Problem Solving

### Tag Types

Use different visual states for skill priority:

#### Required

Blue tag

Example:

`React (required)`

#### Preferable

Yellow/orange tag

Example:

`TypeScript (preferable)`

#### Recommended

Purple/green tag

Example:

`Figma (recommended)`

------------------------------------------------------------------------

# 10. Scope & Logistics

The bottom card provides high-level project logistics.

### Metrics

#### Duration

**1 month**

Icon: Calendar

------------------------------------------------------------------------

#### Target User

**Finalists**

Icon: Target

------------------------------------------------------------------------

#### Team Capacity

**1--5 members**

Icon: Users

------------------------------------------------------------------------

#### Work Mode

**Both (Online/Offline)**

Icon: Location / workspace

------------------------------------------------------------------------

## 11. Recommended Component Structure

A frontend implementation can be structured as:

``` text
ProjectOverview
│
├── Sidebar
│   ├── Logo
│   └── Navigation
│
├── TopHeader
│   ├── Breadcrumbs
│   ├── Search
│   ├── Notifications
│   └── UserProfile
│
└── MainContent
    │
    ├── ProjectHeader
    │   ├── BackButton
    │   ├── ProjectTitle
    │   ├── StatusBadge
    │   ├── ProjectMetadata
    │   └── HeaderActions
    │
    ├── ProjectTabs
    │
    ├── ProjectDescriptionCard
    │   ├── Description
    │   └── ProblemStatement
    │
    ├── ProjectRolesCard
    │   ├── FrontendDeveloper
    │   ├── BackendDeveloper
    │   └── ProductManager
    │
    ├── SkillsCard
    │   └── SkillTags
    │
    └── ScopeLogisticsCard
        ├── Duration
        ├── TargetUser
        ├── TeamCapacity
        └── WorkMode
```

------------------------------------------------------------------------

# 12. Suggested Design Tokens

## Colors

``` text
Primary Navy:       #172554
Primary Blue:       #4F46E5
Purple Accent:      #6D28D9
Background:         #F8FAFC
Card Background:    #FFFFFF
Primary Text:       #172033
Secondary Text:     #64748B
Border:             #E2E8F0
Success:            #16A34A
Warning:            #F59E0B
Danger:             #EF4444
```

## Border Radius

``` text
Small:   8px
Medium:  12px
Large:   16px
XL:      20px
```

## Shadows

Use subtle shadows only:

``` text
0 2px 10px rgba(15, 23, 42, 0.05)
```

------------------------------------------------------------------------

# 13. Typography

Recommended font hierarchy:

### Page Title

-   32px
-   Bold / 700
-   Dark navy

### Section Heading

-   18--20px
-   Semibold / 600

### Body

-   14--16px
-   Regular / 400

### Metadata

-   12--14px
-   Medium / 500
-   Secondary gray

Recommended fonts:

-   Inter
-   Poppins
-   Plus Jakarta Sans

------------------------------------------------------------------------

# 14. Responsive Behaviour

### Desktop

-   Sidebar remains visible
-   Content uses a wide two-column layout
-   Roles and Skills cards appear side by side

### Tablet

-   Sidebar can collapse
-   Two-column cards may become stacked

### Mobile

Use:

``` text
Header
↓
Project Header
↓
Tabs (horizontal scroll)
↓
Description
↓
Roles
↓
Skills
↓
Scope & Logistics
```

The sidebar should transform into a mobile drawer.

------------------------------------------------------------------------

# 15. UX Improvements

Compared with the original interface, the redesign should emphasize:

-   Stronger visual hierarchy
-   More readable project metadata
-   Better separation between project information and team requirements
-   Clear role vacancy indicators
-   Color-coded skill priority
-   More discoverable actions
-   Consistent spacing
-   Better navigation
-   Modern SaaS visual language
-   Responsive layout

------------------------------------------------------------------------

# 16. Future Enhancements

Potential future functionality:

-   Team member recommendations
-   AI-powered skill matching
-   Applicant comparison
-   Project progress percentage
-   Real-time project activity
-   Team chat
-   Task completion charts
-   Milestone timeline
-   GitHub contribution statistics
-   AI project assistant
-   Skill-gap analysis
-   Automated project recommendations

------------------------------------------------------------------------

## Final UI Goal

The final SkillForge project page should feel like a **professional
project-management and skill-matching platform**, combining the clarity
of a modern SaaS dashboard with academic/project collaboration features.

The interface should prioritize:

**Clarity → Discoverability → Team Formation → Skill Matching → Project
Execution**
