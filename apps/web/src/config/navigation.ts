export type ContextType =
  | 'guest'
  | 'individual'
  | 'recruiter'
  | 'company_admin'
  | 'mentor'
  | 'platform_admin';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiredContext: ContextType[];
  requiredPermission?: string;
  badgeSource?: 'notifications' | 'pipeline' | 'invitations' | 'queue';
  dataTour: string; // e.g. nav-<id>
}

export interface ShortcutCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  route: string;
  permission?: string;
  badgeSource?: string;
  dataTour: string; // home-shortcut-<id>
}

export interface ContextNavConfig {
  context: ContextType;
  label: string;
  primaryItems: NavItem[]; // strictly max 6
  overflowItems: NavItem[];
  shortcuts: ShortcutCard[]; // 6 to 8 cards
}

export const navigationConfig: Record<ContextType, ContextNavConfig> = {
  guest: {
    context: 'guest',
    label: 'Guest',
    primaryItems: [
      {
        id: 'discover',
        label: 'Explore projects',
        icon: 'folder',
        route: '/discover?tab=projects',
        requiredContext: ['guest'],
        dataTour: 'nav-discover',
      },
      {
        id: 'talent',
        label: 'Explore talent',
        icon: 'people',
        route: '/discover?tab=people',
        requiredContext: ['guest'],
        dataTour: 'nav-talent',
      },
      {
        id: 'signin',
        label: 'Sign in',
        icon: 'shield',
        route: '/auth/login',
        requiredContext: ['guest'],
        dataTour: 'nav-signin',
      },
    ],
    overflowItems: [],
    shortcuts: [
      {
        id: 'browse-projects',
        icon: 'folder',
        title: 'Explore projects',
        description: 'Discover active engineering initiatives looking for members.',
        route: '/discover?tab=projects',
        dataTour: 'home-shortcut-browse-projects',
      },
      {
        id: 'browse-talent',
        icon: 'people',
        title: 'Explore verified talent',
        description: 'View public portfolios and attested skills.',
        route: '/discover?tab=people',
        dataTour: 'home-shortcut-browse-talent',
      },
      {
        id: 'register-now',
        icon: 'spark',
        title: 'Create an account',
        description: 'Join SkillForge as a candidate, recruiter, or mentor.',
        route: '/auth/register',
        dataTour: 'home-shortcut-register-now',
      },
    ],
  },

  individual: {
    context: 'individual',
    label: 'Individual',
    primaryItems: [
      {
        id: 'home',
        label: 'Home',
        icon: 'overview',
        route: '/home',
        requiredContext: ['individual'],
        dataTour: 'nav-home',
      },
      {
        id: 'discover',
        label: 'Discover',
        icon: 'search',
        route: '/discover',
        requiredContext: ['individual'],
        dataTour: 'nav-discover',
      },
      {
        id: 'my-projects',
        label: 'My Projects',
        icon: 'folder',
        route: '/projects',
        requiredContext: ['individual'],
        dataTour: 'nav-my-projects',
      },
      {
        id: 'challenges',
        label: 'Challenges & Hackathons',
        icon: 'spark',
        route: '/challenges',
        requiredContext: ['individual'],
        dataTour: 'nav-challenges',
      },
      {
        id: 'portfolio',
        label: 'Portfolio',
        icon: 'check',
        route: '/me/portfolio',
        requiredContext: ['individual'],
        dataTour: 'nav-portfolio',
      },
      {
        id: 'inbox',
        label: 'Inbox',
        icon: 'chat',
        route: '/notifications',
        requiredContext: ['individual'],
        badgeSource: 'notifications',
        dataTour: 'nav-inbox',
      },
    ],
    overflowItems: [
      {
        id: 'resume-ai',
        label: 'Resume intelligence',
        icon: 'resume',
        route: '/resumes',
        requiredContext: ['individual'],
        dataTour: 'nav-resume-ai',
      },
      {
        id: 'blueprint-ai',
        label: 'Project blueprint AI',
        icon: 'spark',
        route: '/ai/requirements',
        requiredContext: ['individual'],
        dataTour: 'nav-blueprint-ai',
      },
      {
        id: 'health',
        label: 'Project health',
        icon: 'health',
        route: '/ai/health',
        requiredContext: ['individual'],
        dataTour: 'nav-health',
      },
    ],
    shortcuts: [
      {
        id: 'find-projects',
        icon: 'search',
        title: 'Find projects',
        description: 'Discover active engineering initiatives needing your skills.',
        route: '/discover?tab=projects',
        dataTour: 'home-shortcut-find-projects',
      },
      {
        id: 'create-project',
        icon: 'folder',
        title: 'Create a project',
        description: 'Start a project and use AI to generate requirements and roles.',
        route: '/projects/create',
        dataTour: 'home-shortcut-create-project',
      },
      {
        id: 'find-collaborators',
        icon: 'people',
        title: 'Find collaborators',
        description: 'Match with engineers that fill your project skill gaps.',
        route: '/ai/match',
        dataTour: 'home-shortcut-find-collaborators',
      },
      {
        id: 'project-room',
        icon: 'chat',
        title: 'Open my Project Room',
        description: 'Jump into active project tasks, real-time chat, and milestones.',
        route: '/chat',
        dataTour: 'home-shortcut-project-room',
      },
      {
        id: 'upload-resume',
        icon: 'upload',
        title: 'Upload or update resume',
        description: 'Normalize your PDF resume into verified taxonomy skills.',
        route: '/resumes',
        dataTour: 'home-shortcut-upload-resume',
      },
      {
        id: 'view-portfolio',
        icon: 'check',
        title: 'View portfolio',
        description: 'Inspect your attested skills, certificates, and verified work.',
        route: '/me/portfolio',
        dataTour: 'home-shortcut-view-portfolio',
      },
      {
        id: 'join-hackathon',
        icon: 'spark',
        title: 'Join a hackathon',
        description: 'Compete in timed sprints with automated milestone checks.',
        route: '/challenges?tab=hackathons',
        dataTour: 'home-shortcut-join-hackathon',
      },
      {
        id: 'browse-challenges',
        icon: 'shield',
        title: 'Browse challenges',
        description: 'Solve real enterprise problems for verified certificates.',
        route: '/challenges',
        dataTour: 'home-shortcut-browse-challenges',
      },
    ],
  },

  recruiter: {
    context: 'recruiter',
    label: 'Recruiter',
    primaryItems: [
      {
        id: 'home',
        label: 'Home',
        icon: 'overview',
        route: '/home',
        requiredContext: ['recruiter'],
        dataTour: 'nav-home',
      },
      {
        id: 'jobs',
        label: 'Jobs',
        icon: 'job',
        route: '/jobs',
        requiredContext: ['recruiter'],
        dataTour: 'nav-jobs',
      },
      {
        id: 'talent',
        label: 'Talent',
        icon: 'search',
        route: '/talent',
        requiredContext: ['recruiter'],
        dataTour: 'nav-talent',
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: 'folder',
        route: '/pipeline',
        requiredContext: ['recruiter'],
        dataTour: 'nav-pipeline',
      },
      {
        id: 'challenges',
        label: 'Challenges',
        icon: 'spark',
        route: '/challenges',
        requiredContext: ['recruiter'],
        dataTour: 'nav-challenges',
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: 'chat',
        route: '/notifications',
        requiredContext: ['recruiter'],
        badgeSource: 'notifications',
        dataTour: 'nav-messages',
      },
    ],
    overflowItems: [],
    shortcuts: [
      {
        id: 'post-job',
        icon: 'job',
        title: 'Post a job',
        description: 'Create an opening with required skills and criteria.',
        route: '/jobs?action=new',
        dataTour: 'home-shortcut-post-job',
      },
      {
        id: 'find-talent',
        icon: 'search',
        title: 'Find talent',
        description: 'Filter candidates by verified skills and commit proof.',
        route: '/talent',
        dataTour: 'home-shortcut-find-talent',
      },
      {
        id: 'run-ai-match',
        icon: 'spark',
        title: 'Run AI match',
        description: 'Rank candidates against open jobs with transparent reasons.',
        route: '/ai/job-match',
        dataTour: 'home-shortcut-run-ai-match',
      },
      {
        id: 'open-pipeline',
        icon: 'folder',
        title: 'Open pipeline',
        description: 'Manage candidates across stages from New to Selected.',
        route: '/pipeline',
        dataTour: 'home-shortcut-open-pipeline',
      },
      {
        id: 'view-shortlists',
        icon: 'check',
        title: 'View shortlists',
        description: 'Review saved candidate lists for active hiring rounds.',
        route: '/pipeline?view=shortlists',
        dataTour: 'home-shortcut-view-shortlists',
      },
      {
        id: 'browse-challenges',
        icon: 'shield',
        title: 'Browse challenges',
        description: 'Inspect solutions submitted to company technical problems.',
        route: '/challenges',
        dataTour: 'home-shortcut-browse-challenges',
      },
    ],
  },

  company_admin: {
    context: 'company_admin',
    label: 'Company Admin',
    primaryItems: [
      {
        id: 'home',
        label: 'Home',
        icon: 'overview',
        route: '/home',
        requiredContext: ['company_admin'],
        dataTour: 'nav-home',
      },
      {
        id: 'jobs',
        label: 'Jobs',
        icon: 'job',
        route: '/jobs',
        requiredContext: ['company_admin'],
        dataTour: 'nav-jobs',
      },
      {
        id: 'talent',
        label: 'Talent',
        icon: 'search',
        route: '/talent',
        requiredContext: ['company_admin'],
        dataTour: 'nav-talent',
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        icon: 'folder',
        route: '/pipeline',
        requiredContext: ['company_admin'],
        dataTour: 'nav-pipeline',
      },
      {
        id: 'company',
        label: 'Company',
        icon: 'shield',
        route: '/companies',
        requiredContext: ['company_admin'],
        dataTour: 'nav-company',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart',
        route: '/analytics',
        requiredContext: ['company_admin'],
        dataTour: 'nav-analytics',
      },
    ],
    overflowItems: [
      {
        id: 'challenges',
        label: 'Challenges',
        icon: 'spark',
        route: '/challenges',
        requiredContext: ['company_admin'],
        dataTour: 'nav-challenges',
      },
    ],
    shortcuts: [
      {
        id: 'post-job',
        icon: 'job',
        title: 'Post a job',
        description: 'Publish a new role with skill requirements.',
        route: '/jobs?action=new',
        dataTour: 'home-shortcut-post-job',
      },
      {
        id: 'publish-challenge',
        icon: 'spark',
        title: 'Publish a challenge',
        description: 'Post a technical problem for student and pro teams.',
        route: '/challenges?action=create',
        dataTour: 'home-shortcut-publish-challenge',
      },
      {
        id: 'review-submissions',
        icon: 'check',
        title: 'Review submissions',
        description: 'Inspect verified project deliverables and invite candidates.',
        route: '/challenges?tab=submissions',
        dataTour: 'home-shortcut-review-submissions',
      },
      {
        id: 'invite-teammate',
        icon: 'people',
        title: 'Invite a teammate',
        description: 'Assign recruiter seats and company management permissions.',
        route: '/companies?tab=seats',
        dataTour: 'home-shortcut-invite-teammate',
      },
      {
        id: 'company-profile',
        icon: 'shield',
        title: 'Company profile',
        description: 'Update company overview, branding, and verification proof.',
        route: '/companies?tab=profile',
        dataTour: 'home-shortcut-company-profile',
      },
      {
        id: 'view-analytics',
        icon: 'chart',
        title: 'Analytics & evaluation',
        description: 'Examine candidate funnel conversion and model metrics.',
        route: '/analytics',
        dataTour: 'home-shortcut-view-analytics',
      },
    ],
  },

  mentor: {
    context: 'mentor',
    label: 'Mentor',
    primaryItems: [
      {
        id: 'home',
        label: 'Home',
        icon: 'overview',
        route: '/home',
        requiredContext: ['mentor'],
        dataTour: 'nav-home',
      },
      {
        id: 'requests',
        label: 'Requests',
        icon: 'chat',
        route: '/mentors?tab=requests',
        requiredContext: ['mentor'],
        dataTour: 'nav-requests',
      },
      {
        id: 'mentored-projects',
        label: 'Mentored Projects',
        icon: 'folder',
        route: '/mentors?tab=projects',
        requiredContext: ['mentor'],
        dataTour: 'nav-mentored-projects',
      },
      {
        id: 'feedback',
        label: 'Feedback',
        icon: 'check',
        route: '/mentors?tab=feedback',
        requiredContext: ['mentor'],
        dataTour: 'nav-feedback',
      },
      {
        id: 'availability',
        label: 'Availability',
        icon: 'shield',
        route: '/mentors?tab=availability',
        requiredContext: ['mentor'],
        dataTour: 'nav-availability',
      },
    ],
    overflowItems: [],
    shortcuts: [
      {
        id: 'set-availability',
        icon: 'shield',
        title: 'Set availability',
        description: 'Define your weekly mentorship capacity and office hours.',
        route: '/mentors?tab=availability',
        dataTour: 'home-shortcut-set-availability',
      },
      {
        id: 'review-requests',
        icon: 'chat',
        title: 'Review requests',
        description: 'Accept or decline pending technical mentorship inquiries.',
        route: '/mentors?tab=requests',
        dataTour: 'home-shortcut-review-requests',
      },
      {
        id: 'give-feedback',
        icon: 'check',
        title: 'Give feedback',
        description: 'Leave milestone and architectural review notes for teams.',
        route: '/mentors?tab=feedback',
        dataTour: 'home-shortcut-give-feedback',
      },
      {
        id: 'my-mentored-projects',
        icon: 'folder',
        title: 'My mentored projects',
        description: 'Inspect active project sprint velocity and code reviews.',
        route: '/mentors?tab=projects',
        dataTour: 'home-shortcut-my-mentored-projects',
      },
    ],
  },

  platform_admin: {
    context: 'platform_admin',
    label: 'Platform Admin',
    primaryItems: [
      {
        id: 'overview',
        label: 'Overview',
        icon: 'overview',
        route: '/overview',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-overview',
      },
      {
        id: 'moderation',
        label: 'Moderation',
        icon: 'shield',
        route: '/admin?tab=reports',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-moderation',
      },
      {
        id: 'verification',
        label: 'Verification',
        icon: 'check',
        route: '/admin?tab=verification',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-verification',
      },
      {
        id: 'certificates',
        label: 'Certificates',
        icon: 'spark',
        route: '/certificates',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-certificates',
      },
      {
        id: 'skills',
        label: 'Skills',
        icon: 'folder',
        route: '/admin/skills',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-skills',
      },
      {
        id: 'audit',
        label: 'Audit',
        icon: 'document',
        route: '/admin?tab=audit',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-audit',
      },
    ],
    overflowItems: [
      {
        id: 'ai-eval',
        label: 'AI evaluation',
        icon: 'chart',
        route: '/analytics',
        requiredContext: ['platform_admin'],
        dataTour: 'nav-ai-eval',
      },
    ],
    shortcuts: [
      {
        id: 'moderation-queue',
        icon: 'shield',
        title: 'Moderation queue',
        description: 'Review reported content, user disputes, and project holds.',
        route: '/admin?tab=reports',
        dataTour: 'home-shortcut-moderation-queue',
      },
      {
        id: 'verify-projects',
        icon: 'check',
        title: 'Verify projects',
        description: 'Review completed projects and authorize certificate generation.',
        route: '/admin?tab=verification',
        dataTour: 'home-shortcut-verify-projects',
      },
      {
        id: 'revoke-certificates',
        icon: 'spark',
        title: 'Revoke or review certificates',
        description: 'Inspect public certificates and revoke compromised credentials.',
        route: '/certificates',
        dataTour: 'home-shortcut-revoke-certificates',
      },
      {
        id: 'skill-taxonomy',
        icon: 'folder',
        title: 'Skill taxonomy',
        description: 'Curate canonical taxonomy skills and alias mappings.',
        route: '/admin/skills',
        dataTour: 'home-shortcut-skill-taxonomy',
      },
      {
        id: 'audit-log',
        icon: 'document',
        title: 'Audit log',
        description: 'Search immutable audit events across users and projects.',
        route: '/admin?tab=audit',
        dataTour: 'home-shortcut-audit-log',
      },
    ],
  },
};

export const topBarUtilities = [
  { id: 'search', icon: 'search', label: 'Search (Ctrl+K)', route: '/search', dataTour: 'topbar-search' },
  { id: 'context', icon: 'chevron', label: 'Switch context', route: '#context', dataTour: 'topbar-context' },
  { id: 'help', icon: 'spark', label: 'Help & Manuals', route: '/help', dataTour: 'topbar-help' },
  { id: 'bell', icon: 'chat', label: 'Alerts', route: '/notifications', dataTour: 'topbar-bell' },
  { id: 'avatar', icon: 'people', label: 'My Profile', route: '/me/profile', dataTour: 'topbar-avatar' },
];
