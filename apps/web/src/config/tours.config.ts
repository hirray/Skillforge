export interface TourStep {
  id: string;
  target: string; // CSS selector, typically [data-tour="..."]
  title: string;
  description: string;
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

export const welcomeTourSteps: TourStep[] = [
  {
    id: 'step-context',
    target: '[data-tour="topbar-context"]',
    title: 'Role Context Switcher',
    description: 'SkillForge adapts dynamically to your active role. Switch seamlessly between Individual Builder, Recruiter, Mentor, and Company Admin without reloading.',
    placement: 'bottom',
  },
  {
    id: 'step-nav',
    target: '[data-tour="sidebar-nav"]',
    title: 'Role-Aware Navigation',
    description: 'Your navigation displays strictly the relevant workspaces and tools for your active role, keeping your workflow clean and focused.',
    placement: 'right',
  },
  {
    id: 'step-profile',
    target: '[data-tour="home-profile-card"]',
    title: 'Executive Flight Deck',
    description: 'View your live identity, toggle your immediate availability for projects, inspect your proof readiness score, and create new projects.',
    placement: 'bottom',
  },
  {
    id: 'step-stats',
    target: '[data-tour="home-stats"]',
    title: 'Live Telemetry Runway',
    description: 'Track real-time active projects, verified skills, inbound recruiter signals, and autonomous AI synergy matches at a glance.',
    placement: 'bottom',
  },
  {
    id: 'step-shortcuts',
    target: '[data-tour="home-shortcuts"]',
    title: 'Workspace Capabilities Launchpad',
    description: 'Directly launch AI project blueprints, autonomous collaborator matching, resume intelligence parsing, and telemetry health monitors.',
    placement: 'top',
  },
  {
    id: 'step-help',
    target: '[data-tour="topbar-help"]',
    title: 'In-App Help Center',
    description: 'Need assistance? Click here anytime to open detailed flow manuals or restart this interactive guided tour.',
    placement: 'bottom',
  },
];
