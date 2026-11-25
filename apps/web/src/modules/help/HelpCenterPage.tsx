import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { useTour } from '../../components/tour/TourProvider';
import { allToursCatalog } from '../../config/tours.config';

interface FlowchartNode {
  id: string;
  phase: string;
  title: string;
  desc: string;
  actor: string;
  badge: string;
  badgeColor: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
  route?: string;
  uiAction: string;
  prerequisites: string[];
  outputArtifact: string;
}

interface WorkflowPipeline {
  id: string;
  chartCode: string;
  name: string;
  category: string;
  description: string;
  targetRole: string;
  nodes: FlowchartNode[];
  plainWordsSteps: string[];
  mermaidSrc: string;
}

interface ManualChapter {
  id: string;
  chapterNumber: number;
  filename: string;
  title: string;
  category: 'intro' | 'individual' | 'recruiting' | 'mentor' | 'admin' | 'reference';
  readTime: string;
  summary: string;
  tourId?: string;
  relatedFlowId?: string;
  sections: Array<{ heading: string; content: string }>;
}

// ── 16 COMPREHENSIVE WORKFLOW PIPELINES (FC-01 to FC-16) ─────────────────────

const flowchartsCatalog: WorkflowPipeline[] = [
  {
    id: 'FC-01',
    chartCode: 'FC-01',
    name: 'Platform Master Architecture & Holistic User Journey',
    category: 'Universal System Architecture',
    description: 'High-level overview of the complete SkillForge collaboration and talent lifecycle, linking to each specialized flow.',
    targetRole: 'All Platform Personas',
    plainWordsSteps: [
      '1. Start: The user visits SkillForge, registers an account, and selects their active role context.',
      '2. Profile Setup: User optionally uploads a resume for AI extraction (FC-03) or fills in their skills manually.',
      '3. Project Initiation: User either starts a new project by typing a concept in plain English (FC-02) or discovers existing teams seeking collaborators.',
      '4. AI Team Assembly: The system evaluates required skills, identifies missing capabilities, and matches complementary builders with mutual consent (FC-04).',
      '5. Project Execution: Team enters the Project Room to track tasks, chat, link GitHub commits, and monitor real-time health telemetry (FC-05).',
      '6. Rescue Mechanism: If a member leaves or falls inactive, the owner triggers an emergency project rescue handover (FC-06).',
      '7. Verification: Upon milestone completion, the team confirms attributions, and SkillForge issues a cryptographic certificate and verified dossier (FC-07).',
      '8. Career Opportunities: The verified dossier powers the candidate portfolio, matching them with verified recruiter job pipelines (FC-11, FC-12).'
    ],
    mermaidSrc: `graph TD
  A1([Start: Land on SkillForge]) --> A2[Create Account & Select Role]
  A2 --> A3{Upload Resume?}
  A3 -- Yes --> A4[AI Parses Resume - FC-03] --> A5[Complete Profile]
  A3 -- No --> A5
  A5 --> B1{Create or Join Project?}
  B1 -- Create --> B2[Describe Idea - FC-02] --> B3[AI Scaffolds Requirements] --> B4[Match Collaborators - FC-04]
  B1 -- Join --> B4
  B4 --> C1[Project Room Execution - FC-05]
  C1 --> C2{Project Stalled?}
  C2 -- Yes --> C3[Emergency Rescue - FC-06] --> C1
  C2 -- No --> D1[Completion & Peer Sign-Off - FC-07]
  D1 --> D2[System Issues Certificate & Dossier]
  D2 --> E1[Recruiter Talent Radar - FC-11] --> E2([Verified Hire Closed])`,
    nodes: [
      { id: 'fc1-1', phase: 'Stage 01', title: 'Onboarding & Role Context', desc: 'User registers and selects from Individual, Recruiter, Company Admin, or Mentor.', actor: 'New User', badge: 'Identity', badgeColor: 'violet', route: '/me/profile', uiAction: 'Register at /auth/register and pick role.', prerequisites: ['Valid email address'], outputArtifact: 'Active JWT session with role context' },
      { id: 'fc1-2', phase: 'Stage 02', title: 'Skill Ingestion & Parsing', desc: 'Upload PDF resume for AI parsing and quarantine review.', actor: 'Candidate', badge: 'AI Extraction', badgeColor: 'cyan', route: '/resumes', uiAction: 'Upload file in Resume Studio and confirm skills.', prerequisites: ['PDF/DOCX file'], outputArtifact: 'Attested Skill Graph' },
      { id: 'fc1-3', phase: 'Stage 03', title: 'Project Creation & Scaffolding', desc: 'Deconstruct ideas into required skill sets and delivery phases.', actor: 'Project Owner', badge: 'AI Architecture', badgeColor: 'emerald', route: '/projects/create', uiAction: 'Fill problem statement and click Deconstruct.', prerequisites: ['Project idea'], outputArtifact: 'Published Project in Recruiting state' },
      { id: 'fc1-4', phase: 'Stage 04', title: 'Project Room Sprint Delivery', desc: 'Collaborate with Kanban tasks, chat, and GitHub commit tracking.', actor: 'Team Collaborators', badge: 'Sprint Execution', badgeColor: 'amber', route: '/projects', uiAction: 'Complete tasks and link commit SHAs.', prerequisites: ['Active team'], outputArtifact: 'Cryptographic commit evidence trail' },
      { id: 'fc1-5', phase: 'Stage 05', title: 'Verification & Credentialing', desc: 'Unanimous peer sign-off and SHA-256 certificate issuance with QR.', actor: 'System & Verifiers', badge: 'Credential Minting', badgeColor: 'violet', route: '/certificates', uiAction: 'Submit completion checklist and verify proof.', prerequisites: ['100% peer consensus'], outputArtifact: 'Public QR Certificate URL' },
    ]
  },
  {
    id: 'FC-02',
    chartCode: 'FC-02',
    name: 'Project Creation to Verified Certification',
    category: 'Core Engineering Pipeline',
    description: 'Flagship end-to-end pipeline tracing ideation, AI scaffolding, recruitment, execution, peer confirmation, and certificate minting.',
    targetRole: 'Project Creators & Collaborators',
    plainWordsSteps: [
      '1. Ideation: Project owner defines project title and problem statement in natural language.',
      '2. AI Scaffolding: AI evaluates the description and extracts required roles, technologies, and target dates.',
      '3. Team-Gap Analysis: Owner reviews recommendations and marks skills as covered, partially covered, or missing.',
      '4. Recruitment: Owner publishes project to Recruiting. AI matches available talent with explainable synergy scores.',
      '5. Mutual Consent: Candidate reviews project brief and accepts or declines role invitation.',
      '6. Active Execution: Team enters Project Room, links GitHub repository, and moves tasks across Kanban board.',
      '7. Telemetry & Rescue: If a member drops out, owner initiates emergency replacement handover via FC-06.',
      '8. Completion Sign-Off: Once deliverables are met, owner initiates completion checklist.',
      '9. Peer Review: Every collaborator independently signs off on their contributions and peer attributions.',
      '10. Certification: Platform mints unique SHA-256 certificate for each confirmed contributor with QR code.'
    ],
    mermaidSrc: `flowchart TD
  A1([Start: Project Idea]) --> A2[Describe in Natural Language]
  A2 --> A3[AI Requirement Extraction] --> A4[Skill-Gap Analysis]
  A4 --> A5[Publish: State Transitions to Recruiting]
  A5 --> B1[AI Synergy Matching] --> B2[Role Invitation Dispatched]
  B2 --> B3{Candidate Accepts?}
  B3 -- No --> B1
  B3 -- Yes --> B4[Team Formed: State Transitions to Active]
  B4 --> C1[Project Room Execution Loop]
  C1 --> C2{Milestones Met?}
  C2 -- No --> C1
  C2 -- Yes --> D1[Owner Submits Completion Checklist]
  D1 --> D2[Every Member Signs Off on Attributions]
  D2 --> D3{Any Disputes?}
  D3 -- Yes --> D4[Admin Mediation Queue] --> D5[Cryptographic SHA-256 Snapshot]
  D3 -- No --> D5
  D5 --> D6([Issued: Verifiable QR Certificate])`,
    nodes: [
      { id: 'fc2-1', phase: 'Stage 01', title: 'Problem Definition', desc: 'Owner inputs project idea in natural language.', actor: 'Owner', badge: 'Ideation', badgeColor: 'violet', route: '/projects/create', uiAction: 'Fill problem statement on creation form.', prerequisites: ['Account active'], outputArtifact: 'Draft Project Object' },
      { id: 'fc2-2', phase: 'Stage 02', title: 'AI Scaffolding', desc: 'AI suggests roles and skill-gap breakdown.', actor: 'AI Engine', badge: 'Analysis', badgeColor: 'cyan', route: '/ai/requirements', uiAction: 'Click Deconstruct Requirements.', prerequisites: ['Problem statement'], outputArtifact: 'Requirement Matrix' },
      { id: 'fc2-3', phase: 'Stage 03', title: 'Talent Sourcing', desc: 'Match complementary talent and send invites.', actor: 'Owner & Candidates', badge: 'Matching', badgeColor: 'emerald', route: '/ai/match', uiAction: 'Send role-specific invites with mutual consent.', prerequisites: ['Published project'], outputArtifact: 'Confirmed Team Members' },
      { id: 'fc2-4', phase: 'Stage 04', title: 'Delivery & GitHub Proof', desc: 'Push code, link task IDs, and pass tests.', actor: 'Collaborators', badge: 'Execution', badgeColor: 'amber', route: '/projects', uiAction: 'Move Kanban tasks to Done with commit SHAs.', prerequisites: ['Linked GitHub repo'], outputArtifact: 'Verified Commit Ledger' },
      { id: 'fc2-5', phase: 'Stage 05', title: 'Peer Confirmation & Cert', desc: 'Unanimous sign-off and certificate issuance.', actor: 'All Members & System', badge: 'Certification', badgeColor: 'violet', route: '/certificates', uiAction: 'Submit completion checklist and confirm roles.', prerequisites: ['All tasks Done'], outputArtifact: 'Verifiable SHA-256 Credential' },
    ]
  },
  {
    id: 'FC-03',
    chartCode: 'FC-03',
    name: 'Resume Ingestion, AI Parsing & Profile Normalization',
    category: 'Talent Identity & Skill Taxonomy',
    description: 'Quarantine review architecture ensuring no unvetted AI extraction is written to user profiles without explicit human sign-off.',
    targetRole: 'Individual Candidates',
    plainWordsSteps: [
      '1. Upload: User uploads resume file (PDF or DOCX) in Resume Intelligence.',
      '2. AI Parsing: System parses work history, educational degrees, and technical skills.',
      '3. Taxonomy Normalization: Raw skill variants (e.g. React.js, ReactJS) are mapped to canonical taxonomy IDs (React).',
      '4. Mandatory Human Review: Extracted data is presented in a quarantine review screen; no data is written to profile automatically.',
      '5. User Confirmation: User reviews, edits, or deletes any incorrect entity, then confirms.',
      '6. Profile Activation: Normalized skills appear on user profile, activating AI project and recruiter matching.'
    ],
    mermaidSrc: `flowchart TD
  A1([Upload PDF/DOCX]) --> A2[Text Extraction Pipeline]
  A2 --> A3[Named Entity Recognition] --> A4[Taxonomy Normalization]
  A4 --> B1[Quarantine Draft Record]
  B1 --> B2{User Reviews Extracted Entities}
  B2 -- Edits Required --> B3[User Adjusts Proficiency / Deletes Errors]
  B2 -- Accurate --> B4[User Clicks Confirm & Write]
  B3 --> B4
  B4 --> C1([Skills Published to Talent Graph])`,
    nodes: [
      { id: 'fc3-1', phase: 'Stage 01', title: 'Document Upload', desc: 'Upload PDF or DOCX file under 10MB.', actor: 'Candidate', badge: 'Upload', badgeColor: 'violet', route: '/resumes', uiAction: 'Drop resume into upload container.', prerequisites: ['PDF/DOCX file'], outputArtifact: 'Raw Resume Document' },
      { id: 'fc3-2', phase: 'Stage 02', title: 'Taxonomy Normalization', desc: 'Map informal skill variants to canonical nodes.', actor: 'AI Parser', badge: 'Normalization', badgeColor: 'cyan', route: '/resumes', uiAction: 'System maps aliases to canonical taxonomy.', prerequisites: ['Parsed text'], outputArtifact: 'Canonical Skill Draft' },
      { id: 'fc3-3', phase: 'Stage 03', title: 'Human Review & Write', desc: 'Candidate inspects draft and confirms accuracy.', actor: 'Candidate', badge: 'Human Sign-off', badgeColor: 'emerald', route: '/resumes', uiAction: 'Click Confirm & Write to Profile.', prerequisites: ['Quarantine draft'], outputArtifact: 'Attested Talent Profile' },
    ]
  },
  {
    id: 'FC-11',
    chartCode: 'FC-11',
    name: 'Recruiter Talent Radar, AI Matching & Hiring Pipeline',
    category: 'Recruiting & Talent Acquisition',
    description: 'Evidence-first recruiter talent acquisition, candidate comparison, and consent-gated outreach pipeline.',
    targetRole: 'Recruiters & Hiring Managers',
    plainWordsSteps: [
      '1. Job Posting: Recruiter defines role expectations, compensation, and required taxonomy skills.',
      '2. Radar Filtering: Recruiter searches talent based on actual verified project commits, not self-reported text.',
      '3. AI Evidence Matching: Candidates receive compatibility ratings with explicit explanations.',
      '4. Shortlisting: Recruiter adds candidates to Kanban pipeline across 8 standardized stages.',
      '5. Consent Enforcement: Inbound messages can only be sent if candidate has enabled recruiter outreach.',
      '6. Pipeline Progression: Candidate moves through Interview to Selected or Closed with audit history.'
    ],
    mermaidSrc: `flowchart TD
  A1([Recruiter Posts Job]) --> A2[Define Taxonomy Skills & Compensation]
  A2 --> A3[Search Talent Radar with Commit Filters]
  A3 --> B1[AI Ranks Candidates by Code Proof]
  B1 --> B2[Compare Up to 3 Candidates Side-by-Side]
  B2 --> B3[Add to Pipeline Shortlist]
  B3 --> C1{Candidate Consents to Outreach?}
  C1 -- No --> C2[Outreach Blocked by Privacy Policy]
  C1 -- Yes --> C3[Send Inbound Opportunity Note]
  C3 --> C4{Interview Progress?}
  C4 -- Pass --> C5([Candidate Selected & Hired])
  C4 -- Fail --> C6[Stage Set to Rejected/Closed]`,
    nodes: [
      { id: 'fc11-1', phase: 'Stage 01', title: 'Job Specification', desc: 'Post role with required taxonomy skills.', actor: 'Recruiter', badge: 'Posting', badgeColor: 'violet', route: '/jobs', uiAction: 'Click + Post New Job and define requirements.', prerequisites: ['Recruiter account'], outputArtifact: 'Active Job Requisition' },
      { id: 'fc11-2', phase: 'Stage 02', title: 'Radar & AI Matching', desc: 'Filter candidates by verified git commit metrics.', actor: 'AI Radar', badge: 'Proof Sourcing', badgeColor: 'cyan', route: '/talent', uiAction: 'Apply filters for commits >20 and required skills.', prerequisites: ['Active job'], outputArtifact: 'Ranked Candidate Shortlist' },
      { id: 'fc11-3', phase: 'Stage 03', title: 'Consent-Gated Outreach', desc: 'Send direct inquiry if candidate allows contact.', actor: 'Recruiter', badge: 'Outreach', badgeColor: 'amber', route: '/pipeline', uiAction: 'Dispatch fast-track interview message.', prerequisites: ['Candidate consent enabled'], outputArtifact: 'Active Pipeline Engagement' },
    ]
  }
];

// ── 17 USER MANUAL CHAPTERS ────────────────────────────────────────────────

const manualChapters: ManualChapter[] = [
  {
    id: 'ch-01',
    chapterNumber: 1,
    filename: '01_introduction.md',
    title: 'Introduction to SkillForge & Core Philosophy',
    category: 'intro',
    readTime: '5 min',
    summary: 'The founding vision: proof over claims, human-in-the-loop AI, the 6 role contexts, and platform terminology.',
    tourId: 'welcome-individual',
    relatedFlowId: 'FC-01',
    sections: [
      { heading: '1. Proof Over Claims', content: 'Traditional resumes rely on self-reported bullet points. SkillForge binds every declared skill to verified git commits, pull requests, and peer-reviewed project delivery.' },
      { heading: '2. The Six Contexts', content: 'One user identity can hold multiple roles simultaneously: Guest, Individual, Recruiter, Company Admin, Mentor, and Platform Admin. Switch dynamically using the top-bar Context Switcher.' },
      { heading: '3. Human-in-the-Loop', content: 'AI accelerates requirements generation and candidate matching, but never makes unilateral decisions. You retain 100% authority over profile writes and team acceptance.' }
    ]
  },
  {
    id: 'ch-02',
    chapterNumber: 2,
    filename: '02_getting_started.md',
    title: 'Getting Started: The 5-Zone Cockpit HUD & Switcher',
    category: 'intro',
    readTime: '8 min',
    summary: 'Master the standardized 5-zone Home Cockpit layout, switch roles instantly, use universal search (Ctrl+K), and replay spotlight tours.',
    tourId: 'welcome-individual',
    relatedFlowId: 'FC-15',
    sections: [
      { heading: 'Zone A: Profile & Readiness', content: 'View your live identity, profile completeness score, availability toggle, and quick project launch buttons.' },
      { heading: 'Zone B: Mini Dashboard', content: 'Four clickable metric tiles displaying active projects, verified skills, inbound recruiter signals, and parsed resumes.' },
      { heading: 'Zone C: Next Best Action', content: 'Contextual AI banner highlighting urgent blockers, pending milestone reviews, or teammate invites.' },
      { heading: 'Zone D: Capabilities Grid', content: 'Six primary shortcuts to core workflows: Projects, Blueprints, Collaborators, Resumes, Opportunities, and Health Telemetry.' },
      { heading: 'Zone E: Audit Trail & Alerts', content: 'Live cryptographic commit proof trail on the left; inbound inquiries and system notifications on the right.' }
    ]
  },
  {
    id: 'ch-03',
    chapterNumber: 3,
    filename: '03_profile_and_resume.md',
    title: 'Profile Setup, Skills & Resume Intelligence',
    category: 'individual',
    readTime: '10 min',
    summary: 'Upload PDF resumes, normalize skills to canonical taxonomy nodes, review in quarantine before writing, and configure visibility.',
    tourId: 't2-resume-upload',
    relatedFlowId: 'FC-03',
    sections: [
      { heading: 'Resume Ingestion', content: 'Drag-and-drop your PDF/DOCX resume file into Resume Studio at /resumes.' },
      { heading: 'Quarantine Review', content: 'Extracted skills are held in a quarantine screen. You review proficiencies and delete errors before confirming.' },
      { heading: 'Visibility Controls', content: 'Choose who can discover your dossier: Public, Community Members, Verified Recruiters Only, or Private.' }
    ]
  },
  {
    id: 'ch-04',
    chapterNumber: 4,
    filename: '04_project_creation.md',
    title: 'Project Creation & AI Scaffolding',
    category: 'individual',
    readTime: '12 min',
    summary: 'Describe your concept in natural language, scaffold architecture requirements with AI, inspect skill gaps, and publish for recruiting.',
    tourId: 't3-create-project',
    relatedFlowId: 'FC-02',
    sections: [
      { heading: 'Natural Language Input', content: 'Type your project concept and core engineering challenge into the problem statement field.' },
      { heading: 'AI Requirement Scaffolding', content: 'Click Deconstruct Requirements to extract technical roles, core libraries, and delivery phases.' },
      { heading: 'Skill-Gap Analysis', content: 'Inspect the skill gap breakdown showing which capabilities you cover and which require recruiting teammates.' }
    ]
  },
  {
    id: 'ch-05',
    chapterNumber: 5,
    filename: '05_team_matching_and_invitations.md',
    title: 'Collaborator Matching, Invitations & Team Assembly',
    category: 'individual',
    readTime: '10 min',
    summary: 'Find complementary builders with explainable AI synergy scores, send role-specific invitations, handle join requests, and establish mutual consent.',
    tourId: 't4-collaborators',
    relatedFlowId: 'FC-04',
    sections: [
      { heading: 'Synergy Explainability', content: 'Click "Why this match?" to understand candidate scores based on skill gaps, timezone, and past proof.' },
      { heading: 'Role-Specific Invites', content: 'Dispatch invites tied to specific roles. Invitations automatically expire after 7 days if unresponded.' },
      { heading: 'Mutual Consent', content: 'Teams form only when candidates accept invitations or owners approve inbound join requests.' }
    ]
  },
  {
    id: 'ch-06',
    chapterNumber: 6,
    filename: '06_project_room_execution.md',
    title: 'Project Room Collaboration & Delivery Execution',
    category: 'individual',
    readTime: '15 min',
    summary: 'Manage Kanban sprint boards, attach commit proof hashes to tasks, track milestone velocity, chat in real time, and monitor health telemetry.',
    tourId: 't6-project-room',
    relatedFlowId: 'FC-05',
    sections: [
      { heading: 'Kanban Tasks & Commit Proof', content: 'Drag cards from To Do to Done. Moving cards to Review prompts for GitHub commit hashes or PR links.' },
      { heading: 'Milestone Progress', content: 'Delivery progress calculates automatically from completed tasks linked to each milestone.' },
      { heading: 'Health Telemetry', content: 'System monitors task age and commit cadence. Overdue tasks trigger At Risk warnings.' }
    ]
  },
  {
    id: 'ch-09',
    chapterNumber: 9,
    filename: '09_completion_and_certification.md',
    title: 'Project Completion, Verification & Certificates',
    category: 'individual',
    readTime: '12 min',
    summary: 'Submit the completion checklist, collect unanimous peer confirmations, mint SHA-256 digital certificates, and share public verification QR codes.',
    tourId: 't9-completion-verify',
    relatedFlowId: 'FC-07',
    sections: [
      { heading: 'Completion Checklist', content: 'Provide live demo URL, final git commit SHA, and release summary to lock project room.' },
      { heading: 'Unanimous Peer Sign-off', content: '100% of confirmed active members must vote to approve role attributions before certification.' },
      { heading: 'Verifiable Credentials', content: 'Unique SHA-256 certificate minted with public QR code verifiable by third parties at /verify/:certId.' }
    ]
  },
  {
    id: 'ch-12',
    chapterNumber: 12,
    filename: '12_recruiters_and_companies.md',
    title: 'Recruiter Radar, AI Matching & Hiring Pipeline',
    category: 'recruiting',
    readTime: '15 min',
    summary: 'Post engineering jobs, filter talent by verified git commit volume, compare candidates side-by-side, and manage 8 pipeline stages.',
    tourId: 't16-recruiter-hiring',
    relatedFlowId: 'FC-11',
    sections: [
      { heading: 'Evidence-Based Radar', content: 'Search engineers by verified codebase commits (>20 commits) rather than resume claims.' },
      { heading: 'AI Match Tiers', content: 'Candidates ranked into Strong Match, Good Match, and Adjacent Skills with explicit reasons cited.' },
      { heading: '8-Stage Pipeline', content: 'Move candidates from New to Reviewed, Shortlisted, Contacted, Interview, Selected, or Closed.' }
    ]
  }
];

export const HelpCenterPage: React.FC = () => {
  const { startTour } = useTour();
  const [activeTab, setActiveTab] = useState<'flowcharts' | 'manuals' | 'tours' | 'faq'>('flowcharts');
  const [selectedFlow, setSelectedFlow] = useState<WorkflowPipeline>(flowchartsCatalog[0]);
  const [selectedChapter, setSelectedChapter] = useState<ManualChapter>(manualChapters[0]);
  const [flowViewMode, setFlowViewMode] = useState<'diagram' | 'plainWords' | 'mermaidSrc'>('diagram');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle hash deep-links (e.g. /help#FC-02)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const matchFlow = flowchartsCatalog.find((f) => f.id === hash || f.chartCode === hash);
      if (matchFlow) {
        setSelectedFlow(matchFlow);
        setActiveTab('flowcharts');
        return;
      }
      const matchChap = manualChapters.find((c) => c.filename === hash || c.id === hash);
      if (matchChap) {
        setSelectedChapter(matchChap);
        setActiveTab('manuals');
      }
    }
  }, []);

  return (
    <PageShell
      breadcrumb={[{ label: 'Workspace', href: '/home' }, { label: 'Help Center' }]}
      title="Help Center, User Manual & Workflows"
      description="Visual workflow pipelines, interactive flowcharts, full product manual, and guided feature tours."
      primaryAction={
        <button
          onClick={() => startTour()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8861dc] to-[#6366f1] hover:from-[#9d7cf7] hover:to-[#7478f7] text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-[#8861dc]/25 transition-all"
        >
          <span>✨ Replay Guided Tour</span>
        </button>
      }
    >
      {/* ── TOP NAV PILL BAR ────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#262538] pb-4 mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2 p-1 bg-[#12111c] border border-[#27263b] rounded-xl">
          <button
            onClick={() => setActiveTab('flowcharts')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'flowcharts'
                ? 'bg-[#8861dc] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1928]'
            }`}
          >
            <span>⚡ Visual Flowcharts (FC-01–16)</span>
          </button>
          <button
            onClick={() => setActiveTab('manuals')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'manuals'
                ? 'bg-[#8861dc] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1928]'
            }`}
          >
            <span>📖 Product User Manual</span>
          </button>
          <button
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'tours'
                ? 'bg-[#8861dc] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1928]'
            }`}
          >
            <span>🎯 Interactive Tour Library</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
              activeTab === 'faq'
                ? 'bg-[#8861dc] text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1928]'
            }`}
          >
            <span>❓ FAQ & Troubleshooting</span>
          </button>
        </div>

        {/* Universal Manual Search */}
        <div className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Search guides, nodes, or statuses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-1.5 pl-9 rounded-xl bg-[#141320] border border-[#2b293f] text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-[#8861dc]"
          />
          <span className="absolute left-3 top-2 text-zinc-500 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-zinc-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: VISUAL FLOWCHARTS (FC-01 to FC-16)
      ========================================================================= */}
      {activeTab === 'flowcharts' && (
        <div className="space-y-6">
          {/* Flowchart Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {flowchartsCatalog.map((flow) => {
              const isSelected = selectedFlow.id === flow.id;
              return (
                <button
                  key={flow.id}
                  onClick={() => {
                    setSelectedFlow(flow);
                    setZoomLevel(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-[#8861dc]/20 text-[#c4b5fd] border-[#8861dc] shadow-md shadow-[#8861dc]/10'
                      : 'bg-[#13121e] text-zinc-400 hover:text-white border-[#27263b] hover:bg-[#1c1b2c]'
                  }`}
                >
                  <span className="font-mono text-[10px] text-[#a855f7] mr-1.5">{flow.chartCode}</span>
                  <span>{flow.name.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active Flowchart Card */}
          <div className="bg-[#12111c] border border-[#28273d] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#252438] gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-[#8861dc]/25 border border-[#8861dc]/40 text-[#c4b5fd] font-mono text-[11px] font-bold">
                    {selectedFlow.chartCode}
                  </span>
                  <span className="text-xs font-bold text-zinc-400">{selectedFlow.category}</span>
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {selectedFlow.name}
                </h2>
                <p className="text-xs text-zinc-300 mt-1 max-w-3xl leading-relaxed">
                  {selectedFlow.description}
                </p>
              </div>

              {/* View Mode Switcher & Controls */}
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-[#181726] border border-[#2c2b42] flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFlowViewMode('diagram')}
                    className={`px-2.5 py-1 rounded font-bold transition-colors ${
                      flowViewMode === 'diagram' ? 'bg-[#8861dc] text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Interactive Diagram
                  </button>
                  <button
                    onClick={() => setFlowViewMode('plainWords')}
                    className={`px-2.5 py-1 rounded font-bold transition-colors ${
                      flowViewMode === 'plainWords' ? 'bg-[#8861dc] text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Words Alternative
                  </button>
                  <button
                    onClick={() => setFlowViewMode('mermaidSrc')}
                    className={`px-2.5 py-1 rounded font-bold transition-colors ${
                      flowViewMode === 'mermaidSrc' ? 'bg-[#8861dc] text-white' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Mermaid Source
                  </button>
                </div>

                {flowViewMode === 'diagram' && (
                  <div className="flex items-center gap-1 bg-[#181726] border border-[#2c2b42] rounded-lg p-1 text-xs text-zinc-400">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
                      className="px-2 py-0.5 rounded hover:bg-[#252438] hover:text-white font-bold"
                      title="Zoom Out"
                    >
                      -
                    </button>
                    <span className="font-mono text-[11px] px-1 text-zinc-300">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(1.8, z + 0.15))}
                      className="px-2 py-0.5 rounded hover:bg-[#252438] hover:text-white font-bold"
                      title="Zoom In"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      className="px-1.5 py-0.5 rounded hover:bg-[#252438] hover:text-white text-[10px]"
                      title="Reset Zoom"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* View Mode 1: Interactive Diagram & Stages */}
            {flowViewMode === 'diagram' && (
              <div
                className="transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {selectedFlow.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="relative p-4 rounded-xl bg-[#171624] border border-[#2d2c44] hover:border-[#8861dc] transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono text-[#a855f7] font-bold">{node.phase}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#8861dc]/20 text-[#c4b5fd] font-bold">
                            {node.actor}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1.5">{node.title}</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">{node.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-[#262538] space-y-2">
                        <div className="text-[10px] text-zinc-400">
                          <strong className="text-zinc-300">Action:</strong> {node.uiAction}
                        </div>
                        {node.route && (
                          <Link
                            to={node.route}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#93b2f8] hover:text-white mt-1"
                          >
                            <span>Open in app</span>
                            <span>&rarr;</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View Mode 2: Accessible Plain Words Steps */}
            {flowViewMode === 'plainWords' && (
              <div className="p-6 rounded-xl bg-[#171624] border border-[#2d2c44] space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Same Steps in Words (Screen Reader & Plain Text Alternative)
                </h3>
                <ol className="space-y-3 text-xs text-zinc-200 leading-relaxed list-none pl-0">
                  {selectedFlow.plainWordsSteps.map((step, idx) => (
                    <li key={idx} className="p-3 rounded-lg bg-[#11101a] border border-[#242336] flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#8861dc]/30 text-[#c4b5fd] font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span>{step.replace(/^\d+\.\s*/, '')}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* View Mode 3: Raw Mermaid Source */}
            {flowViewMode === 'mermaidSrc' && (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-[#0e0d16] border border-[#28273d] text-xs font-mono text-[#c4b5fd] overflow-x-auto leading-relaxed">
                  {selectedFlow.mermaidSrc}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFlow.mermaidSrc);
                    alert('Mermaid source code copied to clipboard!');
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-[#222135] hover:bg-[#2d2c44] text-xs font-bold text-white transition-colors"
                >
                  Copy Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: PRODUCT USER MANUAL (17 Chapters)
      ========================================================================= */}
      {activeTab === 'manuals' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Table of Contents */}
          <div className="lg:col-span-1 bg-[#12111c] border border-[#28273d] rounded-2xl p-4 space-y-2 h-fit">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 px-2 pb-2 border-b border-[#242336]">
              Manual Chapters (17)
            </h3>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {manualChapters.map((ch) => {
                const isSelected = selectedChapter.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChapter(ch)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#8861dc] text-white font-bold shadow-md'
                        : 'text-zinc-300 hover:text-white hover:bg-[#1c1b2c]'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-mono text-[10px] opacity-70 mr-1.5">Ch {ch.chapterNumber}</span>
                      <span>{ch.title.split(':')[0]}</span>
                    </div>
                    <span className="text-[10px] opacity-75 shrink-0">{ch.readTime}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Chapter Content Viewer */}
          <div className="lg:col-span-3 bg-[#12111c] border border-[#28273d] rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252438] gap-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#a855f7] uppercase tracking-wider">
                  Chapter {selectedChapter.chapterNumber} • {selectedChapter.readTime} Read
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                  {selectedChapter.title}
                </h2>
              </div>
              {selectedChapter.tourId && (
                <button
                  onClick={() => startTour(selectedChapter.tourId)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#8861dc] hover:bg-[#784fce] text-xs font-bold text-white transition-all shadow-md shrink-0 flex items-center gap-1.5"
                >
                  <span>✨ Start Chapter Tour</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-[#171624] border border-[#2d2c44] text-xs text-zinc-300 leading-relaxed">
              <strong className="text-white block mb-1">Chapter Summary:</strong>
              {selectedChapter.summary}
            </div>

            <div className="space-y-6">
              {selectedChapter.sections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-base font-bold text-white border-b border-[#252438] pb-1.5">
                    {sec.heading}
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: INTERACTIVE TOUR LIBRARY
      ========================================================================= */}
      {activeTab === 'tours' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1b1730] to-[#12111c] border border-[#393254] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4b5fd]">
                Role-Aware Guided Guidance
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                Spotlight Feature Tour Library
              </h2>
              <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                SkillForge includes click-by-click spotlight tours teaching every real feature across all 6 contexts.
              </p>
            </div>
            <button
              onClick={() => startTour()}
              className="px-4 py-2 rounded-xl bg-[#8861dc] hover:bg-[#784fce] text-xs font-bold text-white transition-all shadow-lg shrink-0"
            >
              🚀 Launch Role Welcome Tour
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allToursCatalog.map((t) => (
              <div
                key={t.tourId}
                className="p-5 rounded-2xl bg-[#12111c] border border-[#28273d] hover:border-[#8861dc]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-[#a855f7] font-bold uppercase tracking-wider">
                      ~{t.estimatedSeconds}s Walkthrough
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#1e1d2c] text-zinc-400 font-semibold">
                      {t.steps.length} Steps
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1.5">{t.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {t.steps[0]?.description || 'Interactive feature walkthrough.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#252438] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-medium capitalize">
                    {t.audience.join(', ')}
                  </span>
                  <button
                    onClick={() => startTour(t.tourId)}
                    className="px-3 py-1.5 rounded-lg bg-[#8861dc]/20 hover:bg-[#8861dc] text-[#c4b5fd] hover:text-white text-xs font-bold transition-all border border-[#8861dc]/30"
                  >
                    Start Tour &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FAQ & TROUBLESHOOTING
      ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            {
              q: 'How does SkillForge prove my skills without relying on a resume?',
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
              a: 'Project Health Telemetry monitors milestone burndown velocity. If a project stalls for 10+ days, the Project Rescue engine activates, generating a rescue scope so replacement contributors can be matched in hours.',
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
