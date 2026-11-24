export type AdvanceOnType = 'next' | 'click-target' | 'route-change' | 'event';

export interface TourStep {
  id: string;
  route?: string; // route to navigate to if user is elsewhere
  target: string; // CSS selector, typically [data-tour="..."]
  title: string;
  description: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  advanceOn?: AdvanceOnType;
  allowSkip?: boolean;
  learnMore?: {
    chapter?: string;
    flowchart?: string;
  };
}

export interface TourDefinition {
  tourId: string;
  title: string;
  version: number;
  audience: string[]; // ['individual', 'recruiter', 'company_admin', 'mentor', 'platform_admin']
  trigger: 'first-login' | 'first-visit-to-route' | 'manual';
  estimatedSeconds: number;
  steps: TourStep[];
}

// ── 1. WELCOME TOURS (Role-Aware) ──────────────────────────────────────────

export const welcomeIndividualTour: TourDefinition = {
  tourId: 'welcome-individual',
  title: 'Welcome to SkillForge for Builders',
  version: 1,
  audience: ['individual'],
  trigger: 'first-login',
  estimatedSeconds: 45,
  steps: [
    {
      id: 'step-context',
      route: '/home',
      target: '[data-tour="topbar-context"]',
      title: 'Your Active Role Context',
      description: 'SkillForge adapts to you. Switch anytime between builder, recruiter, or mentor roles without reloading.',
      placement: 'bottom',
      learnMore: { chapter: '02_getting_started.md', flowchart: 'FC-15_Roles_and_Contexts_Map.mmd' }
    },
    {
      id: 'step-nav',
      route: '/home',
      target: '[data-tour="sidebar-nav"]',
      title: 'Your Personal Workspace',
      description: 'Access your active projects, tasks, team invites, and verified portfolio from this role-focused sidebar.',
      placement: 'right'
    },
    {
      id: 'step-profile',
      route: '/home',
      target: '[data-tour="home-profile-card"]',
      title: 'Your Profile & Availability',
      description: 'Keep your status updated so collaborative teams and recruiters know when you can build.',
      placement: 'bottom',
      learnMore: { chapter: '03_profile_and_resume.md' }
    },
    {
      id: 'step-stats',
      route: '/home',
      target: '[data-tour="home-stats"]',
      title: 'Your Numbers at a Glance',
      description: 'Click any tile to open your active projects, verified skills, or inbound recruiter signals.',
      placement: 'bottom'
    },
    {
      id: 'step-shortcuts',
      route: '/home',
      target: '[data-tour="home-shortcuts"]',
      title: 'Shortcuts to Key Actions',
      description: 'Quickly start a project, parse your resume with AI, or find complementary collaborators.',
      placement: 'top'
    },
    {
      id: 'step-help',
      route: '/home',
      target: '[data-tour="topbar-help"]',
      title: 'Help Center & Visual Workflows',
      description: 'Click here anytime to explore interactive flowcharts, read user manuals, or replay guided tours.',
      placement: 'bottom',
      learnMore: { chapter: '15_workflow_catalog.md', flowchart: 'FC-01_Platform_Master.mmd' }
    }
  ]
};

export const welcomeRecruiterTour: TourDefinition = {
  tourId: 'welcome-recruiter',
  title: 'Welcome to SkillForge for Recruiters',
  version: 1,
  audience: ['recruiter'],
  trigger: 'first-login',
  estimatedSeconds: 40,
  steps: [
    {
      id: 'rec-context',
      route: '/home',
      target: '[data-tour="topbar-context"]',
      title: 'Recruiter Context Active',
      description: 'You are in Recruiter mode, tailored for talent discovery, candidate shortlists, and hiring pipelines.',
      placement: 'bottom'
    },
    {
      id: 'rec-nav',
      route: '/home',
      target: '[data-tour="sidebar-nav"]',
      title: 'Hiring Navigation',
      description: 'Manage your active job postings, talent radar filters, candidate pipelines, and challenges.',
      placement: 'right'
    },
    {
      id: 'rec-stats',
      route: '/home',
      target: '[data-tour="home-stats"]',
      title: 'Recruiting Metrics',
      description: 'Track open jobs, candidates in review, new AI matches, and outreach responses.',
      placement: 'bottom'
    },
    {
      id: 'rec-shortcuts',
      route: '/home',
      target: '[data-tour="home-shortcuts"]',
      title: 'Quick Hiring Actions',
      description: 'Post a new job opening, search candidate proof, or review your active pipeline stages.',
      placement: 'top',
      learnMore: { chapter: '12_recruiters_and_companies.md', flowchart: 'FC-11_Hiring_Pipeline.mmd' }
    }
  ]
};

export const welcomeCompanyAdminTour: TourDefinition = {
  tourId: 'welcome-company-admin',
  title: 'Welcome Company Admin',
  version: 1,
  audience: ['company_admin'],
  trigger: 'first-login',
  estimatedSeconds: 40,
  steps: [
    {
      id: 'comp-context',
      route: '/home',
      target: '[data-tour="topbar-context"]',
      title: 'Company Administration',
      description: 'Manage company branding, corporate verification, recruiter seats, and sponsored challenges.',
      placement: 'bottom'
    },
    {
      id: 'comp-nav',
      route: '/home',
      target: '[data-tour="sidebar-nav"]',
      title: 'Enterprise Management',
      description: 'Access company profile, seat management, hiring pipelines, and challenge submissions.',
      placement: 'right'
    },
    {
      id: 'comp-shortcuts',
      route: '/home',
      target: '[data-tour="home-shortcuts"]',
      title: 'Company Admin Tools',
      description: 'Publish sponsored challenges, invite recruiting teammates, and review hiring analytics.',
      placement: 'top',
      learnMore: { chapter: '12_recruiters_and_companies.md' }
    }
  ]
};

export const welcomeMentorTour: TourDefinition = {
  tourId: 'welcome-mentor',
  title: 'Welcome Mentor',
  version: 1,
  audience: ['mentor'],
  trigger: 'first-login',
  estimatedSeconds: 35,
  steps: [
    {
      id: 'mentor-context',
      route: '/home',
      target: '[data-tour="topbar-context"]',
      title: 'Mentor Context Active',
      description: 'Advise student and professional engineering teams to help them reach production quality.',
      placement: 'bottom'
    },
    {
      id: 'mentor-nav',
      route: '/home',
      target: '[data-tour="sidebar-nav"]',
      title: 'Advisory Navigation',
      description: 'Review project mentorship requests, track mentored teams, and set weekly availability.',
      placement: 'right'
    },
    {
      id: 'mentor-shortcuts',
      route: '/home',
      target: '[data-tour="home-shortcuts"]',
      title: 'Mentor Actions',
      description: 'Set your advisory specialties and review architectural questions submitted by teams.',
      placement: 'top',
      learnMore: { chapter: '13_mentorship.md', flowchart: 'FC-10_Mentorship.mmd' }
    }
  ]
};

export const welcomeAdminTour: TourDefinition = {
  tourId: 'welcome-admin',
  title: 'Welcome Platform Administrator',
  version: 1,
  audience: ['platform_admin'],
  trigger: 'first-login',
  estimatedSeconds: 35,
  steps: [
    {
      id: 'adm-context',
      route: '/home',
      target: '[data-tour="topbar-context"]',
      title: 'Platform Administration Active',
      description: 'Oversee platform compliance, dispute resolution, certificate audit, and taxonomy curation.',
      placement: 'bottom'
    },
    {
      id: 'adm-nav',
      route: '/home',
      target: '[data-tour="sidebar-nav"]',
      title: 'Governance Navigation',
      description: 'Access the moderation queue, verification requests, skill taxonomy, and system audit logs.',
      placement: 'right'
    },
    {
      id: 'adm-shortcuts',
      route: '/home',
      target: '[data-tour="home-shortcuts"]',
      title: 'Governance Queues',
      description: 'Audit project completion submissions and review community skill taxonomy merge proposals.',
      placement: 'top',
      learnMore: { chapter: '14_administrators.md', flowchart: 'FC-14_Admin_and_Moderation.mmd' }
    }
  ]
};

// ── 2. FEATURE TOURS (T1 to T20) ──────────────────────────────────────────

export const featureTours: TourDefinition[] = [
  {
    tourId: 't1-profile-skills',
    title: 'Profile & Skills Tour',
    version: 1,
    audience: ['individual', 'mentor', 'recruiter'],
    trigger: 'manual',
    estimatedSeconds: 40,
    steps: [
      {
        id: 't1-profile-header',
        route: '/me/profile',
        target: '[data-tour="profile-header"]',
        title: 'Your Engineering Identity',
        description: 'Edit your headline, bio, and working availability to showcase your primary technical focus.',
        placement: 'bottom',
        learnMore: { chapter: '03_profile_and_resume.md' }
      },
      {
        id: 't1-skills-list',
        route: '/me/profile',
        target: '[data-tour="profile-skills"]',
        title: 'Attested Skill Graph',
        description: 'Add skills with proficiency levels. Verified skills link directly to your real codebase commits.',
        placement: 'top'
      },
      {
        id: 't1-visibility',
        route: '/me/profile',
        target: '[data-tour="profile-visibility"]',
        title: 'Privacy & Visibility Choices',
        description: 'Control who can discover you: Public, Registered Members, Verified Recruiters, or Private.',
        placement: 'left',
        learnMore: { chapter: '03_profile_and_resume.md', flowchart: 'FC-16_Who_Can_See_My_Data.mmd' }
      }
    ]
  },
  {
    tourId: 't2-resume-upload',
    title: 'Resume AI Extraction Tour',
    version: 1,
    audience: ['individual'],
    trigger: 'manual',
    estimatedSeconds: 35,
    steps: [
      {
        id: 't2-upload-dropzone',
        route: '/resumes',
        target: '[data-tour="resume-dropzone"]',
        title: 'Upload Your Resume File',
        description: 'Drop your PDF or DOCX file here for automatic AI extraction and taxonomy normalization.',
        placement: 'bottom',
        learnMore: { chapter: '03_profile_and_resume.md', flowchart: 'FC-03_Resume_and_Profile.mmd' }
      },
      {
        id: 't2-review-notice',
        route: '/resumes',
        target: '[data-tour="resume-quarantine"]',
        title: 'Mandatory Human Review',
        description: 'Extracted skills are kept in quarantine until you review and confirm them. Nothing is written blindly.',
        placement: 'top'
      }
    ]
  },
  {
    tourId: 't3-create-project',
    title: 'Create Project & AI Scaffolding Tour',
    version: 1,
    audience: ['individual', 'company_admin'],
    trigger: 'manual',
    estimatedSeconds: 50,
    steps: [
      {
        id: 't3-problem-field',
        route: '/projects/create',
        target: '[data-tour="project-problem-input"]',
        title: 'Describe Your Concept',
        description: 'Enter your project idea in plain words. Detail the core engineering challenge you aim to solve.',
        placement: 'bottom',
        learnMore: { chapter: '04_project_creation.md', flowchart: 'FC-02_Project_Creation_to_Certification.mmd' }
      },
      {
        id: 't3-ai-btn',
        route: '/projects/create',
        target: '[data-tour="project-ai-deconstruct"]',
        title: 'AI Requirement Scaffolding',
        description: 'Click to automatically extract required technical roles, core technologies, and delivery phases.',
        placement: 'right'
      },
      {
        id: 't3-gap-strip',
        route: '/projects/create',
        target: '[data-tour="project-skillgap-strip"]',
        title: 'Skill-Gap Breakdown',
        description: 'See which requirements are covered by your skills and which require recruiting new teammates.',
        placement: 'top'
      }
    ]
  },
  {
    tourId: 't4-collaborators',
    title: 'Find Collaborators & Invite Tour',
    version: 1,
    audience: ['individual'],
    trigger: 'manual',
    estimatedSeconds: 45,
    steps: [
      {
        id: 't4-team-tab',
        route: '/projects/proj-monorepo',
        target: '[data-tour="project-team-tab"]',
        title: 'Team & Role Openings',
        description: 'Inspect open roles, filled seats, and active collaborators on this project.',
        placement: 'bottom',
        learnMore: { chapter: '05_team_matching_and_invitations.md', flowchart: 'FC-04_Matching_and_Team_Formation.mmd' }
      },
      {
        id: 't4-matches-grid',
        route: '/projects/proj-monorepo',
        target: '[data-tour="project-match-grid"]',
        title: 'AI Synergy Matches',
        description: 'Review candidate recommendations with clear explanations showing exactly which missing skill gaps they cover.',
        placement: 'top'
      }
    ]
  },
  {
    tourId: 't6-project-room',
    title: 'Project Room Execution Tour',
    version: 1,
    audience: ['individual'],
    trigger: 'manual',
    estimatedSeconds: 50,
    steps: [
      {
        id: 't6-kanban',
        route: '/projects/proj-monorepo',
        target: '[data-tour="project-tasks-tab"]',
        title: 'Kanban Tasks & Commit Proof',
        description: 'Organize tasks from To Do to Done. Moving cards to Review lets you attach real GitHub commit hashes.',
        placement: 'bottom',
        learnMore: { chapter: '06_project_room_execution.md', flowchart: 'FC-05_Project_Room_Loop.mmd' }
      },
      {
        id: 't6-milestones',
        route: '/projects/proj-monorepo',
        target: '[data-tour="project-milestones-tab"]',
        title: 'Milestone Velocity',
        description: 'Track overall delivery progress automatically calculated from completed sprint tasks.',
        placement: 'bottom'
      },
      {
        id: 't6-chat',
        route: '/projects/proj-monorepo',
        target: '[data-tour="project-discussions-tab"]',
        title: 'Group & Direct Chat',
        description: 'Collaborate with teammates in real-time, share code snippets, and record meeting decisions.',
        placement: 'top'
      }
    ]
  },
  {
    tourId: 't9-completion-verify',
    title: 'Complete and Verify Project Tour',
    version: 1,
    audience: ['individual'],
    trigger: 'manual',
    estimatedSeconds: 45,
    steps: [
      {
        id: 't9-cert-tab',
        route: '/projects/proj-monorepo',
        target: '[data-tour="project-cert-tab"]',
        title: 'Certification Hub',
        description: 'Submit your completion checklist, live deployment URL, and request unanimous peer sign-off.',
        placement: 'bottom',
        learnMore: { chapter: '09_completion_and_certification.md', flowchart: 'FC-07_Completion_Verification_and_Certificate.mmd' }
      },
      {
        id: 't9-qr-preview',
        route: '/certificates',
        target: '[data-tour="cert-card-qr"]',
        title: 'Verifiable Digital Credentials',
        description: 'Every verified member receives a unique SHA-256 certificate with a scannable public QR code.',
        placement: 'left'
      }
    ]
  },
  {
    tourId: 't11-discover',
    title: 'Discover Opportunities Tour',
    version: 1,
    audience: ['individual'],
    trigger: 'manual',
    estimatedSeconds: 35,
    steps: [
      {
        id: 't11-tabs',
        route: '/discover',
        target: '[data-tour="discover-tabs"]',
        title: 'Explore Projects, People & Jobs',
        description: 'Switch between engineering teams seeking your skills, tech talent, and verified corporate job openings.',
        placement: 'bottom',
        learnMore: { chapter: '10_portfolio_and_discovery.md', flowchart: 'FC-12_Opportunities_for_Individuals.mmd' }
      }
    ]
  },
  {
    tourId: 't16-recruiter-hiring',
    title: 'Recruiter Hiring & Talent Radar Tour',
    version: 1,
    audience: ['recruiter', 'company_admin'],
    trigger: 'manual',
    estimatedSeconds: 50,
    steps: [
      {
        id: 't16-job-create',
        route: '/jobs',
        target: '[data-tour="jobs-create-btn"]',
        title: 'Post Engineering Opening',
        description: 'Define technical expectations, location modes, compensation, and required taxonomy skills.',
        placement: 'bottom',
        learnMore: { chapter: '12_recruiters_and_companies.md', flowchart: 'FC-11_Hiring_Pipeline.mmd' }
      },
      {
        id: 't16-talent-radar',
        route: '/talent',
        target: '[data-tour="talent-radar-filters"]',
        title: 'Evidence-Based Talent Filters',
        description: 'Filter candidates by verified git commit volume and proven project delivery rather than resume text.',
        placement: 'right'
      }
    ]
  },
  {
    tourId: 't20-help-center',
    title: 'Help Center & Manuals Tour',
    version: 1,
    audience: ['individual', 'recruiter', 'company_admin', 'mentor', 'platform_admin'],
    trigger: 'manual',
    estimatedSeconds: 30,
    steps: [
      {
        id: 't20-flowcharts',
        route: '/help',
        target: '[data-tour="help-flowcharts-grid"]',
        title: 'Interactive Pipeline Flowcharts',
        description: 'Explore visual end-to-end workflows for project creation, hiring, hackathons, and mentorship.',
        placement: 'bottom',
        learnMore: { chapter: '15_workflow_catalog.md', flowchart: 'FC-01_Platform_Master.mmd' }
      },
      {
        id: 't20-manuals',
        route: '/help',
        target: '[data-tour="help-manuals-list"]',
        title: 'Product User Manuals',
        description: 'Browse step-by-step documentation covering every feature and troubleshooting scenario.',
        placement: 'top'
      }
    ]
  }
];

// Helper to get all registered tours
export const allToursCatalog: TourDefinition[] = [
  welcomeIndividualTour,
  welcomeRecruiterTour,
  welcomeCompanyAdminTour,
  welcomeMentorTour,
  welcomeAdminTour,
  ...featureTours
];

export const getWelcomeTourForContext = (context: string): TourDefinition => {
  switch (context) {
    case 'recruiter':
      return welcomeRecruiterTour;
    case 'company_admin':
      return welcomeCompanyAdminTour;
    case 'mentor':
      return welcomeMentorTour;
    case 'platform_admin':
      return welcomeAdminTour;
    case 'individual':
    default:
      return welcomeIndividualTour;
  }
};

// Default backwards compatibility
export const welcomeTourSteps: TourStep[] = welcomeIndividualTour.steps;
