import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { useTour } from '../../components/tour/TourProvider';
import { Icon } from '../ai/shared';

interface FlowchartNode {
  id: string;
  phase: string;
  title: string;
  desc: string;
  badge: string;
  badgeColor: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
  route?: string;
  uiAction: string;
  prerequisites: string[];
  outputArtifact: string;
  icon: string;
}

interface WorkflowPipeline {
  id: string;
  name: string;
  category: string;
  description: string;
  timeEstimate: string;
  targetRole: string;
  nodes: FlowchartNode[];
}

interface ManualArticle {
  id: string;
  slug: string;
  title: string;
  category: 'onboarding' | 'projects' | 'recruiting' | 'mentorship' | 'admin';
  readTime: string;
  summary: string;
  prerequisites: string[];
  steps: Array<{ title: string; action: string; buttonName: string; note?: string }>;
  edgeCases: string[];
  relatedFlows: Array<{ title: string; route: string }>;
}

const workflowPipelines: WorkflowPipeline[] = [
  {
    id: 'pipe-project-to-cert',
    name: 'Project Creation to Verified Certification',
    category: 'Individual & Team Delivery',
    description: 'Complete lifecycle from AI requirements scaffolding to verifiable cryptographic commit evidence and non-fungible certificate emission.',
    timeEstimate: '2–6 Weeks Sprint',
    targetRole: 'Individual Builder / Team Lead',
    nodes: [
      {
        id: 'p1-idea',
        phase: 'Stage 01',
        title: 'AI Blueprint & Requirements',
        desc: 'Deconstruct raw project ideas into architecture specs, skill matrices, and milestone delivery targets.',
        badge: 'AI Synthesis',
        badgeColor: 'violet',
        route: '/ai/requirements',
        uiAction: 'Click "+ Create Project" or navigate to "Project Blueprint AI". Enter problem statement and click "Synthesize Blueprint".',
        prerequisites: ['Active Individual account', 'Brief concept or problem statement'],
        outputArtifact: 'Architecture Spec & Required Skill Taxonomy Matrix',
        icon: 'sparkles',
      },
      {
        id: 'p1-matching',
        phase: 'Stage 02',
        title: 'Collaborator Matching & Invites',
        desc: 'Autonomous skill-gap ranker matches developers with complementary verified skills for team invitations.',
        badge: 'Team Formation',
        badgeColor: 'cyan',
        route: '/ai/match',
        uiAction: 'Open "Collaborator Matching" tab in project settings. Review synergy match percentage and click "Send Invitation".',
        prerequisites: ['Completed Project Blueprint with defined role openings'],
        outputArtifact: 'Cryptographically bound Team Membership & Project Room Access',
        icon: 'users',
      },
      {
        id: 'p1-execution',
        phase: 'Stage 03',
        title: 'Project Room Sprint Execution',
        desc: 'Collaborate in real-time with Kanban tasks, file sharing, architectural chat, and verified Git commit hashing.',
        badge: 'Sprint Delivery',
        badgeColor: 'emerald',
        route: '/chat',
        uiAction: 'Enter the "Project Room". Assign tasks, post milestone deliverables, and link repository commit SHAs.',
        prerequisites: ['Team formed with at least 1 verified collaborator'],
        outputArtifact: 'Signed Git Commit Trail & Task Completion Ledger',
        icon: 'folder',
      },
      {
        id: 'p1-milestones',
        phase: 'Stage 04',
        title: 'Milestone Review & Consensus',
        desc: 'Peer engineers and optional mentors audit milestone criteria and sign off on completion proof.',
        badge: 'Verification Gate',
        badgeColor: 'amber',
        route: '/projects',
        uiAction: 'Click "Submit Milestone for Review". Collaborators and assigned mentor review diffs and click "Approve Milestone".',
        prerequisites: ['All milestone tasks marked complete with passing test suites'],
        outputArtifact: 'Cryptographic Milestone Signature on immutable audit log',
        icon: 'check',
      },
      {
        id: 'p1-certification',
        phase: 'Stage 05',
        title: 'Attestation & Certificate Emission',
        desc: 'Project is sealed. Non-fungible verification certificate is minted with cryptographic SHA-256 commit hash.',
        badge: 'Credential Minting',
        badgeColor: 'violet',
        route: '/certificates',
        uiAction: 'Owner clicks "Complete Project & Issue Certificates". System validates integrity and mints verifiable credential.',
        prerequisites: ['100% of required milestones approved', 'Zero unresolved security flags'],
        outputArtifact: 'Public Verifiable Certificate URL + Updated Public Dossier',
        icon: 'shield',
      },
    ],
  },
  {
    id: 'pipe-recruiter-hiring',
    name: 'Recruiter Hiring & Proof-Based Sourcing',
    category: 'Recruiting & Talent Acquisition',
    description: 'Autonomous AI matching against verified commit evidence, candidate dossier auditing, and fast-track interview pipelines.',
    timeEstimate: '3–7 Days Turnaround',
    targetRole: 'Recruiter / Hiring Manager',
    nodes: [
      {
        id: 'p2-job-spec',
        phase: 'Stage 01',
        title: 'Job Opening Specification',
        desc: 'Post an engineering opening with explicit taxonomy skill requirements, experience levels, and work mode.',
        badge: 'Role Definition',
        badgeColor: 'violet',
        route: '/jobs',
        uiAction: 'Navigate to "Jobs" workspace. Click "+ Post New Job", select taxonomy skills, salary budget, and click "Publish".',
        prerequisites: ['Recruiter or Company Admin context active'],
        outputArtifact: 'Active Job Listing on SkillForge Opportunity Feed',
        icon: 'briefcase',
      },
      {
        id: 'p2-ai-match',
        phase: 'Stage 02',
        title: 'Autonomous AI Skill Synergy',
        desc: 'AI ranker scans candidate pool using verified commit evidence and project history rather than keyword resumes.',
        badge: 'Proof Synergy',
        badgeColor: 'cyan',
        route: '/ai/job-match',
        uiAction: 'Open "AI Match" on the job card. Review top candidates ranked by verified commit match score (e.g. 94% Synergy).',
        prerequisites: ['Published job posting with required skill criteria'],
        outputArtifact: 'Ranked Candidate Shortlist with Evidence Confidence Scores',
        icon: 'sparkles',
      },
      {
        id: 'p2-audit',
        phase: 'Stage 03',
        title: 'Audit Cryptographic Dossier',
        desc: 'Inspect candidate verified PRs, commit hashes, milestone reviews, and peer ratings before reaching out.',
        badge: 'Evidence Audit',
        badgeColor: 'emerald',
        route: '/talent',
        uiAction: 'Click "View Dossier" on candidate profile. Audit commit history, project repositories, and certificate signatures.',
        prerequisites: ['Candidate has opted in to Recruiter Discovery'],
        outputArtifact: 'Verified Technical Competency Audit Report',
        icon: 'shield',
      },
      {
        id: 'p2-outreach',
        phase: 'Stage 04',
        title: 'Fast-Track Outreach & Pipeline',
        desc: 'Send an instant fast-track interview inquiry directly to the candidate inbox with salary terms and role expectations.',
        badge: 'Interview Offer',
        badgeColor: 'amber',
        route: '/pipeline',
        uiAction: 'Click "Fast-Track Outreach", enter customized compensation note, and submit to candidate notification inbox.',
        prerequisites: ['Positive audit sign-off from hiring team'],
        outputArtifact: 'Candidate Inbound Signal Alert & Active Pipeline Card',
        icon: 'chat',
      },
      {
        id: 'p2-hire',
        phase: 'Stage 05',
        title: 'Candidate Acceptance & Offer',
        desc: 'Candidate accepts invitation. Direct communication unlocked, trial sprint started, or final employment contract executed.',
        badge: 'Verified Hire',
        badgeColor: 'emerald',
        route: '/pipeline',
        uiAction: 'Move candidate card to "Hired" stage in Pipeline Kanban. Emit cryptographic employment verification seal.',
        prerequisites: ['Candidate clicks "Accept Invitation"', 'Contract terms agreed'],
        outputArtifact: 'Closed Pipeline Stage + Employer Attestation Record',
        icon: 'check',
      },
    ],
  },
  {
    id: 'pipe-hackathons',
    name: 'Hackathon & Sponsored Bounties Workflow',
    category: 'Competitive Sprints',
    description: 'Participate in high-stakes architectural challenges, build real-world solutions under deadlines, and earn verified credentials.',
    timeEstimate: '48h – 1 Week',
    targetRole: 'Individual / Competitive Teams',
    nodes: [
      {
        id: 'p3-browse',
        phase: 'Stage 01',
        title: 'Discover Sponsored Challenges',
        desc: 'Browse live bounties and hackathons sponsored by enterprise partners with cash prizes and hiring fast-tracks.',
        badge: 'Challenge Discovery',
        badgeColor: 'cyan',
        route: '/challenges',
        uiAction: 'Navigate to "Challenges & Hackathons". Filter by prize pool or technology stack and click "View Challenge".',
        prerequisites: ['Active Individual account with at least 1 attested skill'],
        outputArtifact: 'Challenge Brief & Rubric Acceptance',
        icon: 'trophy',
      },
      {
        id: 'p3-team',
        phase: 'Stage 02',
        title: 'Register Team or Solo Slot',
        desc: 'Enroll your team or match with solo engineers needing your specialized skills to tackle the challenge.',
        badge: 'Team Formation',
        badgeColor: 'violet',
        route: '/challenges',
        uiAction: 'Click "Register Team", invite team members by handle, and lock in registration before challenge start time.',
        prerequisites: ['Team size within challenge limits (1–4 engineers)'],
        outputArtifact: 'Dedicated Challenge Workspace & Repository',
        icon: 'users',
      },
      {
        id: 'p3-sprint',
        phase: 'Stage 03',
        title: 'Timed Architectural Sprint',
        desc: 'Implement the prototype, push verified commits, and validate against automated test fixtures and benchmarks.',
        badge: 'Code Sprint',
        badgeColor: 'emerald',
        route: '/chat',
        uiAction: 'Collaborate inside the challenge Project Room. Push code to linked Git repository before deadline countdown expires.',
        prerequisites: ['Active Challenge Sprint window open'],
        outputArtifact: 'Final Codebase Submission & Automated Benchmark Telemetry',
        icon: 'folder',
      },
      {
        id: 'p3-judging',
        phase: 'Stage 04',
        title: 'Automated CI & Jury Scoring',
        desc: 'Submissions are evaluated against automated test coverage, performance benchmarks, and sponsor panel review.',
        badge: 'Evaluation',
        badgeColor: 'amber',
        route: '/challenges',
        uiAction: 'Jury and automated evaluators run code benchmarks, score against rubric, and finalize leaderboard rankings.',
        prerequisites: ['Submission submitted before deadline lock'],
        outputArtifact: 'Public Score Breakdown & Leaderboard Placement',
        icon: 'activity',
      },
      {
        id: 'p3-rewards',
        phase: 'Stage 05',
        title: 'Bounty Payout & Credential Award',
        desc: 'Prize pool disbursed, verifiable hackathon achievement badges minted, and top candidates fast-tracked to sponsor interviews.',
        badge: 'Award Emitted',
        badgeColor: 'emerald',
        route: '/certificates',
        uiAction: 'Winners receive payout notification. Verified hackathon credential auto-published to public profile.',
        prerequisites: ['Official sponsor sign-off and leaderboard publish'],
        outputArtifact: 'Cryptographic Hackathon Credential + Recruiter Radar Boost',
        icon: 'shield',
      },
    ],
  },
  {
    id: 'pipe-mentorship',
    name: 'Mentorship & Architectural Advisory Flow',
    category: 'Guidance & Growth',
    description: 'Connect with staff-level engineers, schedule office hours, obtain architecture reviews, and unlock milestone endorsements.',
    timeEstimate: 'Ongoing Sprint Support',
    targetRole: 'Students, Freelancers & Mentors',
    nodes: [
      {
        id: 'p4-find',
        phase: 'Stage 01',
        title: 'Discover Verified Mentors',
        desc: 'Browse mentors by domain expertise (Distributed Systems, ML, Security, Cloud) and verified industry track record.',
        badge: 'Mentor Matching',
        badgeColor: 'cyan',
        route: '/mentors',
        uiAction: 'Navigate to "Mentors & Advisors". Filter by domain tag, inspect mentor dossiers, and click "Request Mentorship".',
        prerequisites: ['Active project with defined architecture scope'],
        outputArtifact: 'Pending Mentorship Inquiry in Mentor Queue',
        icon: 'users',
      },
      {
        id: 'p4-request',
        phase: 'Stage 02',
        title: 'Scope Advisory Deliverable',
        desc: 'Submit specific architectural questions or milestone pull requests for mentor review rather than generic chats.',
        badge: 'Targeted Review',
        badgeColor: 'violet',
        route: '/mentors',
        uiAction: 'Specify project milestone, link design doc or PR diff, and submit request with clear success criteria.',
        prerequisites: ['Milestone code ready for inspection'],
        outputArtifact: 'Advisory Review Ticket with linked PR diff',
        icon: 'file-text',
      },
      {
        id: 'p4-session',
        phase: 'Stage 03',
        title: 'Office Hours & Code Review',
        desc: 'Conduct 1-on-1 architecture review session or asynchronous PR walkthrough directly inside the Project Room.',
        badge: 'Advisory Session',
        badgeColor: 'amber',
        route: '/chat',
        uiAction: 'Join scheduled office hours or review line-by-line feedback annotations in the Project Room.',
        prerequisites: ['Mentor accepts review ticket and sets office hour slot'],
        outputArtifact: 'Architectural Action Items & PR Review Notes',
        icon: 'chat',
      },
      {
        id: 'p4-endorse',
        phase: 'Stage 04',
        title: 'Mentor Milestone Endorsement',
        desc: 'Mentor validates that architectural standards have been achieved and signs off on the milestone attestation.',
        badge: 'Endorsement',
        badgeColor: 'emerald',
        route: '/projects',
        uiAction: 'Mentor clicks "Approve & Endorse Milestone", applying mentor cryptographic signature to team audit log.',
        prerequisites: ['Team addresses all critical review comments'],
        outputArtifact: 'Mentor Endorsement Seal on Milestone Ledger',
        icon: 'shield',
      },
    ],
  },
];

const manualArticles: ManualArticle[] = [
  {
    id: 'man-00',
    slug: '00_getting_started',
    title: 'Getting Started & The Six Contexts',
    category: 'onboarding',
    readTime: '3 min read',
    summary: 'Master the unified SkillForge architecture: switching contexts, vocabulary standards, and navigation rules.',
    prerequisites: ['Modern web browser (Chrome, Firefox, Edge, Safari)', 'Active SkillForge session'],
    steps: [
      {
        title: 'Context Model Understanding',
        action: 'Locate the top-bar "Context: [Role]" pill. Click to open the context dropdown.',
        buttonName: '"Context Switcher"',
        note: 'SkillForge features 6 distinct contexts: Guest, Individual, Recruiter, Company Admin, Mentor, and Platform Admin.',
      },
      {
        title: 'Switching Personas without Reloading',
        action: 'Select a different context (e.g. "Recruiter"). The navigation and dashboard re-render instantly without page reload.',
        buttonName: '"Switch to [Context]"',
      },
      {
        title: 'Navigating Workspaces',
        action: 'Use the left sidebar navigation (strictly $\\le 6$ primary workspaces per role) to access your projects and tools.',
        buttonName: '"Navigation Item"',
      },
    ],
    edgeCases: [
      'If you visit a route belonging to another role (e.g. /pipeline as Individual), a friendly Access Denied guard will offer a 1-click context switch.',
      'Context state persists in localStorage across browser sessions.',
    ],
    relatedFlows: [
      { title: 'Onboarding & Profile Setup', route: '/me/profile' },
      { title: 'Global Discovery', route: '/discover' },
    ],
  },
  {
    id: 'man-01',
    slug: '01_onboarding_and_profile',
    title: 'Onboarding, Profile & Resume Intelligence',
    category: 'onboarding',
    readTime: '4 min read',
    summary: 'Configure your verified developer identity, attest taxonomy skills from Git commits, and parse PDF resumes.',
    prerequisites: ['Valid email address', 'Developer experience or portfolio link'],
    steps: [
      {
        title: 'Profile Headline & Bio',
        action: 'Navigate to "Profile". Enter your technical specialization, primary languages, and work availability status.',
        buttonName: '"Save Profile"',
      },
      {
        title: 'Resume AI Extraction',
        action: 'Open "Resume Intelligence" from the launchpad. Upload a PDF resume. AI extracts normalized taxonomy skills.',
        buttonName: '"Upload Resume (AI Parse)"',
        note: 'Extracted skills are queued for your verification before being committed to your public talent graph.',
      },
      {
        title: 'Attesting Taxonomy Skills',
        action: 'Review extracted skills. Click "Attest Skill" to link each skill against a repository commit hash or project evidence.',
        buttonName: '"Attest to Profile"',
      },
    ],
    edgeCases: [
      'Unverified skills remain marked as "Self-Reported" until verified by a project milestone sign-off or commit proof.',
      'PDF parser handles multi-column layouts and technical tables automatically.',
    ],
    relatedFlows: [
      { title: 'Resume Intelligence Studio', route: '/resumes' },
      { title: 'Public Portfolio Editor', route: '/me/portfolio' },
    ],
  },
  {
    id: 'man-02',
    slug: '02_create_project_and_ai_scaffolding',
    title: 'Project Blueprint AI & Skill-Gap Scaffolding',
    category: 'projects',
    readTime: '5 min read',
    summary: 'Turn high-level project concepts into production specifications with automated role profiles and skill matrices.',
    prerequisites: ['Clear project goal or problem statement'],
    steps: [
      {
        title: 'Initiate Project Creation',
        action: 'Click "+ Create Project" in the top bar or header of My Projects.',
        buttonName: '"+ Create Project"',
      },
      {
        title: 'Generate AI Blueprint',
        action: 'Enter title, category, and problem statement. Click "Deconstruct into Skill Tree".',
        buttonName: '"Generate AI Blueprint"',
        note: 'AI analyzes technical scope, suggests team size, breaks down delivery milestones, and lists required skills.',
      },
      {
        title: 'Confirm Roles & Milestones',
        action: 'Review the generated roles and milestone gates. Adjust open positions and click "Publish Project".',
        buttonName: '"Publish Project"',
      },
    ],
    edgeCases: [
      'If your project is private, collaborator matching can still occur with anonymous candidate previews.',
      'Milestone gates can be adjusted until the first task is committed.',
    ],
    relatedFlows: [
      { title: 'Collaborator Matching', route: '/ai/match' },
      { title: 'Active Projects List', route: '/projects' },
    ],
  },
  {
    id: 'man-03',
    slug: '03_project_room_execution',
    title: 'Project Room Execution & Milestone Proof',
    category: 'projects',
    readTime: '6 min read',
    summary: 'Coordinate team sprints, track Kanban velocity, share architectural resources, and record immutable commit evidence.',
    prerequisites: ['Active team membership in an existing project'],
    steps: [
      {
        title: 'Entering the Project Room',
        action: 'Navigate to "My Projects", locate your active sprint card, and click "Room" or "Open Workspace".',
        buttonName: '"Open Workspace"',
      },
      {
        title: 'Task Assignment & Progress',
        action: 'Drag tasks across the Kanban board (Backlog -> In Progress -> Code Review -> Done).',
        buttonName: '"Update Task Status"',
      },
      {
        title: 'Committing Proof Evidence',
        action: 'When completing a milestone task, paste the Git commit SHA-256 hash to seal the proof ledger.',
        buttonName: '"Attach Commit Proof"',
        note: 'Commit SHAs are cross-referenced with your verified profile to unlock skill attestations.',
      },
    ],
    edgeCases: [
      'Tasks cannot be moved to "Done" unless marked with an assignee and passing check.',
      'Overdue tasks automatically trigger a velocity risk signal in Project Health Telemetry.',
    ],
    relatedFlows: [
      { title: 'Project Health Telemetry', route: '/ai/health' },
      { title: 'Verification & Certificates', route: '/certificates' },
    ],
  },
  {
    id: 'man-04',
    slug: '04_recruiter_hiring_and_pipeline',
    title: 'Recruiter Hiring & Cryptographic Talent Matching',
    category: 'recruiting',
    readTime: '5 min read',
    summary: 'Discover verified engineering talent using commit evidence, compare AI synergy match scores, and manage pipelines.',
    prerequisites: ['Recruiter or Company Admin account with active seats'],
    steps: [
      {
        title: 'Posting an Opening',
        action: 'Navigate to "Jobs" workspace. Click "+ Post New Job". Define role title, required taxonomy skills, and compensation range.',
        buttonName: '"Publish Job"',
      },
      {
        title: 'AI Proof Synergy Ranking',
        action: 'Open the job details and switch to "AI Match". System ranks candidate profiles based on verified commits.',
        buttonName: '"Run AI Synergy Match"',
      },
      {
        title: 'Auditing Verified Dossiers',
        action: 'Click "Inspect Evidence" on any top candidate to review their signed PRs, milestone approvals, and certificates.',
        buttonName: '"View Dossier"',
      },
      {
        title: 'Sending Fast-Track Inbound Ping',
        action: 'Click "Fast-Track Outreach" to send an interview invitation directly to the candidate inbox with one click.',
        buttonName: '"Send Fast-Track Inquiry"',
      },
    ],
    edgeCases: [
      'Candidates who set availability to "Unavailable" or "Busy" are flagged with availability status.',
      'Company verification seal is required to send unlimited outreach pings.',
    ],
    relatedFlows: [
      { title: 'Talent Sourcing Board', route: '/talent' },
      { title: 'Hiring Pipeline Kanban', route: '/pipeline' },
    ],
  },
];

export const HelpCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flowcharts' | 'manuals' | 'faq'>('flowcharts');
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('pipe-project-to-cert');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('p1-idea');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string>('00_getting_started');

  const { startTour } = useTour();
  const navigate = useNavigate();

  const selectedPipeline = workflowPipelines.find((p) => p.id === selectedPipelineId) || workflowPipelines[0];
  const selectedNode = selectedPipeline.nodes.find((n) => n.id === selectedNodeId) || selectedPipeline.nodes[0];
  const activeArticle = manualArticles.find((a) => a.slug === activeArticleSlug) || manualArticles[0];

  const colorVariants: Record<string, { bg: string; border: string; text: string; glow: string; badge: string }> = {
    violet: {
      bg: 'from-[#19152b] to-[#110f1c]',
      border: 'border-[#7c3aed]/50',
      text: 'text-[#c4b5fd]',
      glow: 'shadow-[0_0_20px_rgba(124,58,237,0.3)]',
      badge: 'bg-[#7c3aed]/20 text-[#c4b5fd] border-[#7c3aed]/40',
    },
    cyan: {
      bg: 'from-[#101e2c] to-[#0c141d]',
      border: 'border-[#0284c7]/50',
      text: 'text-[#38bdf8]',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)]',
      badge: 'bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40',
    },
    emerald: {
      bg: 'from-[#0e241e] to-[#0a1814]',
      border: 'border-[#059669]/50',
      text: 'text-[#34d399]',
      glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
      badge: 'bg-[#059669]/20 text-[#34d399] border-[#059669]/40',
    },
    amber: {
      bg: 'from-[#271d0e] to-[#18130a]',
      border: 'border-[#d97706]/50',
      text: 'text-[#fbbf24]',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
      badge: 'bg-[#d97706]/20 text-[#fbbf24] border-[#d97706]/40',
    },
    rose: {
      bg: 'from-[#281318] to-[#180a0e]',
      border: 'border-[#e11d48]/50',
      text: 'text-[#fb7185]',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.3)]',
      badge: 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40',
    },
  };

  const filteredArticles = manualArticles.filter((art) => {
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageShell
      title="Help Center &amp; Product Manuals"
      description="Visual workflow pipeline flowcharts, click-by-click product guides, and architectural reference manuals."
      breadcrumb={[
        { label: 'Workspace', href: '/home' },
        { label: 'Help Center & Manuals' },
      ]}
      tabs={[
        { id: 'flowcharts', label: 'Workflow Pipeline Flowcharts' },
        { id: 'manuals', label: 'Product User Manuals' },
        { id: 'faq', label: 'FAQ & Troubleshooting' },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as any)}
      primaryAction={
        <button
          onClick={() => startTour()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-xs font-bold shadow-[0_0_20px_rgba(124,58,237,0.45)] hover:scale-[1.02] transition-all flex items-center gap-1.5"
        >
          <span>✨ Replay Guided Tour</span>
        </button>
      }
    >
      {/* =========================================================================
          TAB 1: INTERACTIVE WORKFLOW PIPELINE FLOWCHARTS
      ========================================================================= */}
      {activeTab === 'flowcharts' && (
        <div className="space-y-6">
          {/* Pipeline Selector Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {workflowPipelines.map((pipe) => {
              const isSelected = pipe.id === selectedPipelineId;
              return (
                <button
                  key={pipe.id}
                  onClick={() => {
                    setSelectedPipelineId(pipe.id);
                    setSelectedNodeId(pipe.nodes[0].id);
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#1b192e] to-[#131221] border-[#8861dc] shadow-[0_0_24px_rgba(136,97,220,0.3)] ring-1 ring-[#8861dc]/60'
                      : 'bg-[#12121a] border-[#262535] hover:border-[#8861dc]/40 hover:bg-[#161622]'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#8861dc] uppercase tracking-wider block mb-1">
                      {pipe.category}
                    </span>
                    <h3 className="text-sm font-extrabold text-white leading-tight">
                      {pipe.name}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9ca3af] mt-2 pt-2 border-t border-[#252435]">
                    <span>{pipe.timeEstimate}</span>
                    <span className="text-[#c4b5fd] font-semibold">{pipe.nodes.length} Stages &rarr;</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pipeline Header */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#151522] via-[#12121b] to-[#161624] border border-[#2e2d40] flex flex-wrap items-center justify-between gap-4 shadow-md">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#7c3aed]/20 text-[#c4b5fd] border border-[#7c3aed]/40">
                  {selectedPipeline.category}
                </span>
                <span className="text-xs text-[#9ca3af]">Role: <strong className="text-white">{selectedPipeline.targetRole}</strong></span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
                {selectedPipeline.name}
              </h2>
              <p className="text-xs text-[#9ca3af] mt-1 max-w-2xl leading-relaxed">
                {selectedPipeline.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-[#9ca3af] block">Estimated Duration</span>
              <span className="text-sm font-extrabold text-[#34d399]">{selectedPipeline.timeEstimate}</span>
            </div>
          </div>

          {/* Visual Interactive Flowchart Horizon */}
          <div className="relative overflow-x-auto pb-4 pt-2">
            <div className="flex items-center gap-3 min-w-[880px]">
              {selectedPipeline.nodes.map((node, index) => {
                const isSelected = node.id === selectedNode.id;
                const style = colorVariants[node.badgeColor] || colorVariants.violet;
                return (
                  <React.Fragment key={node.id}>
                    {/* Flowchart Node Card */}
                    <div
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`cursor-pointer group flex-1 p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[140px] relative ${
                        isSelected
                          ? `bg-gradient-to-b ${style.bg} ${style.border} ${style.glow} ring-2 ring-[#a855f7]`
                          : 'bg-[#12121a] border-[#28273a] hover:border-[#8861dc]/50 hover:bg-[#161622]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-[#6b7280] font-bold">
                            {node.phase}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${style.badge}`}>
                            {node.badge}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white group-hover:text-[#c4b5fd] transition-colors leading-snug">
                          {node.title}
                        </h4>
                        <p className="text-[11px] text-[#9ca3af] mt-1.5 line-clamp-2 leading-relaxed">
                          {node.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#252435] flex items-center justify-between text-[10px] font-bold">
                        <span className={isSelected ? 'text-[#c4b5fd]' : 'text-[#6b7280]'}>
                          {isSelected ? '● Inspecting' : 'Click to inspect'}
                        </span>
                        <span className="text-[#a855f7]">&rarr;</span>
                      </div>
                    </div>

                    {/* Connecting Animated Arrow Connector */}
                    {index < selectedPipeline.nodes.length - 1 && (
                      <div className="flex items-center justify-center shrink-0 w-6">
                        <div className="w-6 h-0.5 bg-gradient-to-r from-[#8861dc] to-[#c4b5fd] relative">
                          <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-[#c4b5fd] transform rotate-45" />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Node Deep Dive Inspector (Selected Stage Details) */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#161524] via-[#12121c] to-[#0f0e18] border border-[#38364d] shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#2a293c] pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#221f35] border border-[#8861dc]/40 text-[#c4b5fd] flex items-center justify-center font-bold text-sm">
                  <Icon name={selectedNode.icon} size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8861dc] font-bold uppercase">{selectedNode.phase}</span>
                    <span className="text-xs text-[#6b7280]">•</span>
                    <span className="text-xs font-semibold text-[#34d399]">{selectedNode.badge}</span>
                  </div>
                  <h3 className="text-lg font-black text-white">{selectedNode.title}</h3>
                </div>
              </div>

              {selectedNode.route && (
                <button
                  onClick={() => navigate(selectedNode.route!)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
                >
                  <span>Launch This Stage</span>
                  <span>&rarr;</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Box 1: UI Actions */}
              <div className="p-4 rounded-xl bg-[#14141f] border border-[#262538] space-y-2">
                <span className="text-[10px] font-extrabold text-[#c4b5fd] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="chevron" size={12} />
                  Exact Click-by-Click Action
                </span>
                <p className="text-xs text-white leading-relaxed font-medium">
                  {selectedNode.uiAction}
                </p>
              </div>

              {/* Box 2: Prerequisites */}
              <div className="p-4 rounded-xl bg-[#14141f] border border-[#262538] space-y-2">
                <span className="text-[10px] font-extrabold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="check" size={12} />
                  Required Prerequisites
                </span>
                <ul className="text-xs text-[#9ca3af] space-y-1">
                  {selectedNode.prerequisites.map((req, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#38bdf8] font-bold">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Box 3: Output Artifact */}
              <div className="p-4 rounded-xl bg-[#14141f] border border-[#262538] space-y-2">
                <span className="text-[10px] font-extrabold text-[#34d399] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="shield" size={12} />
                  Emitted Output Artifact
                </span>
                <p className="text-xs text-white leading-relaxed font-mono">
                  {selectedNode.outputArtifact}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: COMPREHENSIVE PRODUCT USER MANUALS
      ========================================================================= */}
      {activeTab === 'manuals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Manuals Index & Search */}
          <div className="lg:col-span-4 space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search manual guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#14141e] border border-[#2c2b3e] text-xs text-white rounded-xl pl-8 pr-3 py-2 focus:border-[#8861dc] focus:outline-none placeholder-[#6b7280]"
              />
              <span className="absolute left-2.5 top-2.5 text-[#6b7280]">
                <Icon name="search" size={14} />
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Manuals' },
                { id: 'onboarding', label: 'Onboarding' },
                { id: 'projects', label: 'Projects' },
                { id: 'recruiting', label: 'Recruiting' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategory === c.id
                      ? 'bg-[#8861dc]/20 text-[#c4b5fd] border-[#8861dc]/50'
                      : 'bg-[#14141e] text-[#9ca3af] border-[#272635] hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Articles List */}
            <div className="space-y-2">
              {filteredArticles.map((art) => {
                const isSelected = art.slug === activeArticle.slug;
                return (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticleSlug(art.slug)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#1f1d32] to-[#161525] border-[#8861dc] shadow-md ring-1 ring-[#8861dc]/40'
                        : 'bg-[#12121a] border-[#252435] hover:border-[#8861dc]/40 hover:bg-[#161622]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-[#8861dc] font-bold uppercase">
                        Manual #{art.slug.split('_')[0]}
                      </span>
                      <span className="text-[10px] text-[#6b7280]">{art.readTime}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-[#9ca3af] mt-1 line-clamp-2 leading-relaxed">
                      {art.summary}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Full Manual Reader */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-gradient-to-b from-[#151522] via-[#12121c] to-[#0f0e17] border border-[#2d2c3e] shadow-xl space-y-6">
            {/* Header */}
            <div className="border-b border-[#252435] pb-4 space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8861dc]/20 text-[#c4b5fd] border border-[#8861dc]/40 uppercase tracking-wider">
                  Official User Manual
                </span>
                <span className="text-xs text-[#6b7280]">{activeArticle.readTime}</span>
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {activeArticle.title}
              </h2>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                {activeArticle.summary}
              </p>
            </div>

            {/* Section 1: Prerequisites */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                1. Overview &amp; Prerequisites
              </h3>
              <div className="p-3.5 rounded-xl bg-[#151520] border border-[#262535] space-y-1.5">
                {activeArticle.prerequisites.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#d1d5db]">
                    <span className="text-[#38bdf8] font-bold">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Click-by-Click Instructions */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                2. Click-by-Click Instructions
              </h3>
              <div className="space-y-2.5">
                {activeArticle.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#161623] border border-[#28273a] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#7c3aed]/25 text-[#c4b5fd] border border-[#7c3aed]/40 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[#201f30] text-[#c4b5fd] text-[10px] font-bold border border-[#34324d]">
                        {step.buttonName}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] leading-relaxed pl-7">
                      {step.action}
                    </p>
                    {step.note && (
                      <p className="text-[11px] text-[#fbbf24] bg-[#271d0e]/60 border border-[#d97706]/30 p-2 rounded-lg mt-2 ml-7">
                        💡 {step.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Edge Cases & Error Handling */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                3. Edge Cases &amp; Error Handling
              </h3>
              <div className="p-3.5 rounded-xl bg-[#181611]/80 border border-[#45341a]/60 space-y-1.5">
                {activeArticle.edgeCases.map((ec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#fde68a]">
                    <span className="text-[#fbbf24] font-bold">•</span>
                    <span>{ec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 4: Related Flows */}
            <div className="pt-2 border-t border-[#252435] flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-[#6b7280] font-semibold">Related System Flows:</span>
              <div className="flex items-center gap-2">
                {activeArticle.relatedFlows.map((rf, idx) => (
                  <Link
                    key={idx}
                    to={rf.route}
                    className="px-3 py-1 rounded-lg bg-[#1f1d2e] hover:bg-[#28263c] border border-[#302e46] text-xs font-bold text-[#c4b5fd] hover:text-white transition-all"
                  >
                    {rf.title} &rarr;
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: FAQ & QUICK TROUBLESHOOTING
      ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            {
              q: 'How does SkillForge prove my skills without a resume?',
              a: 'SkillForge normalizes skills into an objective taxonomy and cryptographically binds each skill to verified repository pull requests, signed commit hashes, and peer milestone approvals. Recruiters audit actual working code, not self-written bullet points.',
            },
            {
              q: 'Can I be both a Project Owner and a Mentor or Recruiter?',
              a: 'Yes. SkillForge is role-aware. You can switch your active context in 1 click using the top-bar Context Switcher. Your projects, tasks, and candidate pipeline remain isolated and clean under each respective workspace.',
            },
            {
              q: 'How are milestone completion certificates verified?',
              a: 'Each certificate is cryptographically signed with an Ed25519 root key and references the project commit tree SHA-256 hash. Anyone can verify authenticity at /verify/:certId without needing an account.',
            },
            {
              q: 'What happens if a project team member becomes inactive?',
              a: 'Project Health Telemetry monitors milestone burndown velocity. If a project stalls for 14+ days, the Project Rescue engine activates, generating a rescue scope so replacement contributors can be matched in hours.',
            },
            {
              q: 'How do I restart the guided feature tour?',
              a: 'You can click the "✨ Replay Guided Tour" button at the top of this Help Center page, or click the "✨ Tour" button in the top navigation bar at any time.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#12121a] border border-[#252435] hover:border-[#8861dc]/50 transition-all space-y-2"
            >
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span className="text-[#8861dc]">Q:</span>
                <span>{item.q}</span>
              </h3>
              <p className="text-xs text-[#9ca3af] leading-relaxed pl-5">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default HelpCenterPage;
