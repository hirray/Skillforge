import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '../tour/TourProvider';

export interface DemoItem {
  id: string;
  category: 'Engineering' | 'Talent & AI' | 'Competitions' | 'Advisory & Trust' | 'Manuals & Architecture';
  title: string;
  badge: string;
  badgeColor: 'violet' | 'emerald' | 'amber' | 'cyan' | 'rose';
  tagline: string;
  description: string;
  route: string;
  tourId?: string;
  highlights: string[];
}

export const DEMO_FEATURES: DemoItem[] = [
  {
    id: 'demo-canvas',
    category: 'Engineering',
    title: 'Collaborative Whiteboard & Realtime Canvas',
    badge: 'Hardware 60fps',
    badgeColor: 'cyan',
    tagline: 'Zero-latency vector drawing and architecture whiteboard powered by WebSockets & CRDTs.',
    description: 'Experience conflict-free simultaneous multi-cursor drawing, infinite canvas zoom/pan, and vector shape tools with zero latency lag.',
    route: '/projects/proj-whiteboard',
    tourId: 't-whiteboard',
    highlights: ['WebGL 2D Shaders', 'CRDT State Sync', 'Multiplayer Cursors', 'Full Milestones & Tasks'],
  },
  {
    id: 'demo-project-room',
    category: 'Engineering',
    title: 'Project Room & Agile Execution Hub',
    badge: 'Realtime Loop',
    badgeColor: 'emerald',
    tagline: 'Multi-column Kanban tasks, milestone progression, team chat, and repository synchronization.',
    description: 'Explore active milestone roadmaps, assign tasks with dependency safeguards, chat with team members in real-time, and view synced files.',
    route: '/projects/proj-consensus',
    tourId: 't-project-room',
    highlights: ['Kanban Board (To Do → Done)', 'Milestone Timeline', 'Real-Time WebSocket Chat', 'Resource Hub'],
  },
  {
    id: 'demo-blueprint-ai',
    category: 'Engineering',
    title: 'Project Creation & AI Blueprint Generator',
    badge: 'Decomposition AI',
    badgeColor: 'violet',
    tagline: 'Deconstruct ideas into required skill sets, role profiles, and delivery phases.',
    description: 'Input raw project specifications and watch SkillForge AI break down architectural dependencies, skill requirements, and team openings automatically.',
    route: '/projects/create',
    tourId: 't-project-create',
    highlights: ['AI Requirement Extraction', 'Skill Gap Detection', 'Role Openings Generator', 'Execution Roadmap'],
  },
  {
    id: 'demo-rescue',
    category: 'Engineering',
    title: 'Project Rescue & Abandonment Handler',
    badge: 'Zero Stall',
    badgeColor: 'rose',
    tagline: 'Diagnose stalled codebases, generate handover notes, and backfill vacant engineering roles.',
    description: 'Triggered when team members become inactive. Generates cryptographic handover summaries and publishes targeted recruitment calls to keep delivery on track.',
    route: '/projects/proj-monorepo',
    tourId: 't-rescue',
    highlights: ['Inactivity Check Engine', 'AI Handover Notes', 'Instant Vacancy Backfill', 'Consent Protections'],
  },
  {
    id: 'demo-resume-ai',
    category: 'Talent & AI',
    title: 'Resume Intelligence & Skill Normalization',
    badge: 'Human-in-Loop',
    badgeColor: 'violet',
    tagline: 'AI PDF extraction with side-by-side human review and canonical taxonomy mapping.',
    description: 'Upload PDF resumes, inspect AI-extracted technical experiences with confidence scores, approve or adjust skills in the diff viewer, and normalize credentials.',
    route: '/resumes',
    tourId: 't-resume-studio',
    highlights: ['Confidence Scoring', 'Side-by-Side Diff Review', 'Canonical Skill Taxonomy', 'Zero Silent Mutations'],
  },
  {
    id: 'demo-matching',
    category: 'Talent & AI',
    title: 'Collaborator Matching & Synergy Ranker',
    badge: 'Vector Cosine',
    badgeColor: 'cyan',
    tagline: 'Algorithmic matching pairing developers based on complementary skills and availability.',
    description: 'Match builders with open team vacancies using vector embeddings, filter by verified code proof, and send structured project invitations with 1-click accept.',
    route: '/ai/match',
    tourId: 't-team-matching',
    highlights: ['Multi-Dimensional Synergy Score', 'Complementary Skill Overlap', 'Direct Outreach', 'Dual-Consent Safeguards'],
  },
  {
    id: 'demo-portfolio',
    category: 'Talent & AI',
    title: 'Verified Dossier & Public Proof Portfolio',
    badge: '100% Attested',
    badgeColor: 'emerald',
    tagline: 'Tamper-proof portfolio backed by real Git commits, peer reviews, and milestone sign-offs.',
    description: 'Showcase your engineering accomplishments to technical recruiters with verified commit hashes, repository diffs, and cryptographic attestation seals.',
    route: '/me/portfolio',
    tourId: 't-portfolio',
    highlights: ['Audited Git Commit Trail', 'Cryptographic Proof Hash', 'Interactive Skill Radar', 'Recruiter Fast-Track'],
  },
  {
    id: 'demo-hackathon',
    category: 'Competitions',
    title: '48-Hour Sprint & Hackathon Arena',
    badge: 'Live Countdown',
    badgeColor: 'amber',
    tagline: 'High-velocity build marathons with rapid teammate matching and sprint countdown rooms.',
    description: 'Join fast-paced engineering sprints with automated 3-milestone checklists, live countdown timers, GitHub release submission, and community judging.',
    route: '/hackathons',
    tourId: 't-hackathons',
    highlights: ['Live Countdown Timer', 'Rapid Teammate Matcher', 'Sprint Project Room', 'Digital Sprint Badge'],
  },
  {
    id: 'demo-challenges',
    category: 'Competitions',
    title: 'Sponsored Company Challenges & Bounties',
    badge: 'Cash Bounties',
    badgeColor: 'amber',
    tagline: 'Solve real enterprise engineering challenges for cash prizes and direct interview fast-tracks.',
    description: 'Tackle real-world problems published by verified enterprises (e.g., Northstar Labs) with predefined test suites, evaluation rubrics, and hiring rewards.',
    route: '/challenges',
    tourId: 't-challenges',
    highlights: ['Enterprise Architectural Bounds', 'Cash Bounty Payouts', 'Automated Test Suites', 'Direct Interview Track'],
  },
  {
    id: 'demo-pipeline',
    category: 'Talent & AI',
    title: 'Recruiter Radar & Hiring Pipeline Kanban',
    badge: 'Enterprise ATS',
    badgeColor: 'emerald',
    tagline: 'Discover verified talent, compare technical dossiers, and manage multi-stage candidate pipelines.',
    description: 'Filter talent by real repository proof, compare candidates side-by-side on skill mastery, and drag-and-drop candidates through Screen, Tech Review, Offer, and Hired.',
    route: '/pipeline',
    tourId: 't-hiring-pipeline',
    highlights: ['Visual Stage Kanban', 'Proof-Based Filtering', 'Candidate Dossier Comparison', 'One-Click Outreach'],
  },
  {
    id: 'demo-certificates',
    category: 'Advisory & Trust',
    title: 'Digital Certificates & QR Verification',
    badge: 'SHA-256 Signed',
    badgeColor: 'emerald',
    tagline: 'Cryptographically signed completion certificates with public verification portals and QR codes.',
    description: 'Upon multi-member project completion, SkillForge issues a cryptographic certificate seal with an immutable SHA-256 hash verifiable by any employer.',
    route: '/certificates',
    tourId: 't-certification',
    highlights: ['SHA-256 Signature Seal', 'Multi-Member Sign-Off', 'Instant QR Verification', 'Revocation Registry'],
  },
  {
    id: 'demo-mentors',
    category: 'Advisory & Trust',
    title: 'Mentor Directory & Milestone Advisory',
    badge: 'Staff Engineers',
    badgeColor: 'cyan',
    tagline: 'Book advisory sessions with verified staff engineers and receive formative milestone code critiques.',
    description: 'Browse expert mentors by domain, schedule asynchronous or live architecture reviews, and attach formative feedback directly to project milestones.',
    route: '/mentors',
    tourId: 't-mentorship',
    highlights: ['Expertise Domain Filter', 'Advisory Session Booking', 'Milestone Code Critique', 'Direct Feedback Trail'],
  },
  {
    id: 'demo-admin',
    category: 'Advisory & Trust',
    title: 'Platform Administration & Taxonomy Governance',
    badge: 'Governance',
    badgeColor: 'rose',
    tagline: 'Content moderation triage, certificate revocation, and canonical skill synonym merging.',
    description: 'Platform admin control center for resolving flagged abuse reports, auditing certificate authenticity, and merging redundant skill taxonomy tags.',
    route: '/admin',
    tourId: 't-moderation',
    highlights: ['Triage Queue', 'Certificate Revoke Tool', 'Skill Synonym Merging', 'Audit Activity Logs'],
  },
  {
    id: 'demo-flowcharts',
    category: 'Manuals & Architecture',
    title: 'Workflow Pipelines & 17-Chapter Manual',
    badge: '16 Flowcharts',
    badgeColor: 'violet',
    tagline: 'Interactive SVG swimlane diagrams, pan/zoom controls, and complete product user manuals.',
    description: 'Explore visual end-to-end architectures (FC-01 through FC-16) with decision diamonds, accessible step-by-step word explanations, and searchable user manual.',
    route: '/help',
    highlights: ['16 Swimlane Flowcharts', 'Interactive Pan & Zoom', 'Words Alternative Tab', '17 Feature Chapters'],
  },
];

interface FeatureDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeatureDemoModal: React.FC<FeatureDemoModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { startTour } = useTour();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const categories = ['All', 'Engineering', 'Talent & AI', 'Competitions', 'Advisory & Trust', 'Manuals & Architecture'];

  const filteredDemos = DEMO_FEATURES.filter((demo) => {
    if (selectedCategory !== 'All' && demo.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        demo.title.toLowerCase().includes(q) ||
        demo.tagline.toLowerCase().includes(q) ||
        demo.description.toLowerCase().includes(q) ||
        demo.highlights.some((h) => h.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleLaunch = (demo: DemoItem) => {
    onClose();
    navigate(demo.route);
    if (demo.tourId) {
      setTimeout(() => {
        startTour(demo.tourId);
      }, 350);
    }
  };

  const getBadgeStyle = (color: string) => {
    switch (color) {
      case 'cyan':
        return 'bg-[#0284c7]/20 text-[#38bdf8] border-[#0284c7]/40';
      case 'emerald':
        return 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/40';
      case 'amber':
        return 'bg-[#d97706]/20 text-[#fbbf24] border-[#d97706]/40';
      case 'rose':
        return 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40';
      case 'violet':
      default:
        return 'bg-[#7c3aed]/20 text-[#c4b5fd] border-[#7c3aed]/40';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0f0e18] border border-[#2c2b42] shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-[#252438] bg-gradient-to-r from-[#171626] via-[#121120] to-[#0f0e18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] flex items-center justify-center text-white text-lg shadow-md shadow-[#7c3aed]/30">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  SkillForge Live Feature Demos
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/20 text-[#34d399] border border-[#10b981]/30">
                  14 Interactive Scenarios
                </span>
              </div>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Click any module feature below to immediately launch it pre-loaded with live, verifiable data.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1c1b2c] hover:bg-[#28273d] text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-[#2f2e46]"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="px-6 py-3.5 border-b border-[#201f30] bg-[#12111d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#7c3aed] text-white shadow-sm'
                    : 'bg-[#181726] text-zinc-400 hover:text-white hover:bg-[#201f33]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Filter demo features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181728] border border-[#2c2b42] text-xs text-white rounded-xl pl-8 pr-3 py-1.5 focus:border-[#7c3aed] focus:outline-none placeholder-zinc-500"
            />
            <span className="absolute left-2.5 top-2 text-zinc-500 text-xs">🔍</span>
          </div>
        </div>

        {/* Scrollable Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4 max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDemos.map((demo) => (
              <div
                key={demo.id}
                className="group relative rounded-xl bg-gradient-to-b from-[#161524] via-[#12111d] to-[#0e0d17] border border-[#29283e] hover:border-[#7c3aed]/70 p-4 transition-all duration-200 flex flex-col justify-between space-y-3 shadow-md hover:shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getBadgeStyle(demo.badgeColor)}`}>
                          {demo.badge}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                          {demo.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white group-hover:text-[#c4b5fd] transition-colors leading-snug">
                        {demo.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#a1a1aa] leading-relaxed">
                    {demo.tagline}
                  </p>

                  {/* Feature Highlights Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {demo.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#1a192b] border border-[#2b2a40] text-zinc-300 font-medium"
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Launch Bar */}
                <div className="pt-2 border-t border-[#222135] flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {demo.route}
                  </span>
                  <button
                    onClick={() => handleLaunch(demo)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white text-xs font-bold transition-all shadow-md shadow-[#7c3aed]/25 flex items-center gap-1.5"
                  >
                    <span>Launch Live Demo</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
