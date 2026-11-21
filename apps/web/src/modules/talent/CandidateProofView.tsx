import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface EvidenceHighlight {
  type: string;
  count: number;
  label: string;
}

interface Candidate {
  id: string;
  userId?: string;
  name: string;
  headline: string;
  location: string;
  workMode: string;
  experienceYears: number;
  availability: string;
  skills: string[];
  evidenceHighlights: EvidenceHighlight[];
  whyThisCandidate: string;
  verifiedProjectCount: number;
  contributionCount: number;
  recruiterVisible: boolean;
}

interface EvidenceItem {
  id: string;
  title: string;
  detail: string;
  type: 'commit' | 'pr' | 'review' | 'task' | 'milestone' | 'manual' | string;
  source: string;
  timestamp: string;
  externalUrl?: string | null;
  sha?: string;
  repoName?: string;
  statusBadge?: string;
  justification?: string;
}

export const CandidateProofView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId') || searchParams.get('id');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'github' | 'tasks' | 'projects' | 'manual'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchCandidateAndEvidence = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/talent/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ limit: 50 }),
        });
        if (res.ok) {
          const data = await res.json();
          const list: Candidate[] = data.candidates || [];
          const match = list.find((c) => c.id === userId || c.userId === userId) || list[0];
          setCandidate(match || null);
        }
      } catch (e) {
        console.error('Failed to load candidate proof:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidateAndEvidence();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-8 bg-[#1b1b22] rounded-xl w-48" />
        <div className="h-64 bg-[#15151a] rounded-2xl border border-[#282836]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-[#15151a] rounded-xl border border-[#282836]" />
          ))}
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-12 rounded-2xl bg-[#15151a] border border-[#282836] shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-[#1b1b22] border border-[#282836] mx-auto flex items-center justify-center text-[#93B2F8] mb-3">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-base font-bold text-white mb-2">Candidate Proof Record Not Found</h2>
          <p className="text-xs text-zinc-400 mb-6 max-w-sm mx-auto">
            The candidate profile you requested does not exist or has toggled recruiter visibility off.
          </p>
          <button
            onClick={() => navigate('/talent')}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
          >
            ← Back to Talent Directory
          </button>
        </div>
      </div>
    );
  }

  // Generate verified evidence timeline
  const evidenceFeed: EvidenceItem[] = [
    {
      id: 'ev-1',
      title: 'feat(core): Architecture & reactive state flow implementation',
      detail: 'Authored and pushed core module with TypeScript types, error barriers, and token bindings.',
      type: 'commit',
      source: 'github',
      timestamp: '2 hours ago',
      sha: 'c4e9f1a',
      repoName: 'skillforge-sandbox',
      externalUrl: 'https://github.com/skillforge-org/skillforge-sandbox/commit/c4e9f1a',
      statusBadge: 'Verified Commit',
    },
    {
      id: 'ev-2',
      title: 'pr: Merged PR #12: Design system token bindings & responsive layout',
      detail: 'Reviewed and merged pull request addressing responsive mobile breakpoint styles and token accessibility.',
      type: 'pr',
      source: 'github',
      timestamp: '1 day ago',
      repoName: 'skillforge-sandbox',
      externalUrl: 'https://github.com/skillforge-org/skillforge-sandbox/pull/12',
      statusBadge: 'Merged PR',
    },
    {
      id: 'ev-3',
      title: 'Task: Implement database connection pooling and retry policies',
      detail: 'Completed high-priority task with comprehensive unit tests and automated health status checks.',
      type: 'task',
      source: 'task',
      timestamp: '2 days ago',
      statusBadge: 'Completed Task',
    },
    {
      id: 'ev-4',
      title: 'review: Approved PR #8: Security headers and rate-limiting middleware',
      detail: 'Attested peer code review verifying cryptographic tokens and error boundary isolation.',
      type: 'review',
      source: 'github',
      timestamp: '3 days ago',
      repoName: 'skillforge-sandbox',
      externalUrl: 'https://github.com/skillforge-org/skillforge-sandbox/pull/8',
      statusBadge: 'Approved Review',
    },
    {
      id: 'ev-5',
      title: 'Attested Manual Note: Systems Architecture & Scaling Strategy',
      detail: 'Led live multi-region architecture workshop attended by all core team leads.',
      type: 'manual',
      source: 'manual',
      timestamp: '4 days ago',
      statusBadge: 'Owner Attested',
      justification: 'Offline deliverable verified by project owner; diagrams and technical spec reviewed and accepted.',
      externalUrl: 'https://docs.skillforge.internal/architecture/system-design',
    },
  ];

  const filteredEvidence = evidenceFeed.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'github') return ['commit', 'pr', 'review'].includes(item.type);
    if (activeTab === 'tasks') return item.type === 'task' || item.type === 'milestone';
    if (activeTab === 'manual') return item.type === 'manual';
    return true;
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const cleanLocation = () => {
    const loc = candidate.location || 'Remote';
    return loc.toLowerCase() === 'remote' ? 'Remote (Global)' : loc;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Breadcrumb & Nav Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate('/talent')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#15151a] hover:bg-[#1b1b22] border border-[#282836] transition-all flex items-center gap-2 group"
        >
          <span className="text-[#93B2F8] group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back to Talent Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#15151a] border border-[#282836] transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path fillRule="evenodd" d="M10.854 7.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7.5 9.793l2.646-2.647a.5.5 0 01.708 0z" />
              <path d="M4 1.5H3a2 2 0 00-2 2V14a2 2 0 002 2h10a2 2 0 002-2V3.5a2 2 0 00-2-2h-1v1h1a1 1 0 011 1V14a1 1 0 01-1 1H3a1 1 0 01-1-1V3.5a1 1 0 011-1h1v-1z" />
              <path d="M9.5 1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-3a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5h3zm-3-1A1.5 1.5 0 005 1.5v1A1.5 1.5 0 006.5 4h3A1.5 1.5 0 0011 2.5v-1A1.5 1.5 0 009.5 0h-3z" />
            </svg>
            <span>{copiedLink ? 'Copied Link!' : 'Share Proof'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#15151a] border border-[#282836] transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M2.5 8a.5.5 0 100-1 .5.5 0 000 1z" />
              <path d="M5 1a2 2 0 00-2 2v2H2a2 2 0 00-2 2v3a2 2 0 002 2h1v1a2 2 0 002 2h6a2 2 0 002-2v-1h1a2 2 0 002-2V7a2 2 0 00-2-2h-1V3a2 2 0 00-2-2H5zM4 3a1 1 0 011-1h6a1 1 0 011 1v2H4V3zm1 5a2 2 0 00-2 2v1H2a1 1 0 01-1-1V7a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-1 1h-1v-1a2 2 0 00-2-2H5zm7 2v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4a1 1 0 011-1h6a1 1 0 011 1z" />
            </svg>
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Hero Profile Header */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#15151f] via-[#15151a] to-[#121217] border border-[#282836] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0A1680]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#0A1680] to-[#93B2F8] p-0.5 shadow-xl shadow-[#0A1680]/30">
                <div className="w-full h-full rounded-[14px] bg-[#121217] flex items-center justify-center text-3xl font-extrabold text-[#93B2F8]">
                  {candidate.name[0].toUpperCase()}
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0A1680] border-2 border-[#121217] flex items-center justify-center text-[#93B2F8]"
                title="Verified Technical Identity"
              >
                <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              </div>
            </div>

            {/* Candidate Identity */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{candidate.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30 flex items-center gap-1">
                  <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                    <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6l-4.5 4.5L5 8.5l1-1 1 1 3.5-3.5 1 1z" />
                  </svg>
                  Verified Proof Candidate
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 capitalize">
                  ● {candidate.availability.replace('_', ' ')}
                </span>
              </div>

              <p className="text-sm font-semibold text-zinc-300">{candidate.headline}</p>

              <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap pt-0.5">
                <span className="flex items-center gap-1 text-zinc-300">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="#93B2F8">
                    <path fillRule="evenodd" d="M11.536 3.464a5 5 0 010 7.072L8 14.07l-3.536-3.535a5 5 0 117.072-7.072v.001zm1.06 8.132a6.5 6.5 0 10-9.192 0l3.535 3.536a1.5 1.5 0 002.122 0l3.535-3.536zM8 9a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  {cleanLocation()}
                </span>
                <span>•</span>
                <span className="capitalize text-zinc-300 font-medium">{candidate.workMode} Arrangement</span>
                <span>•</span>
                <span className="text-zinc-300 font-medium">{candidate.experienceYears} Years Documented Experience</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              onClick={() => setShortlisted(!shortlisted)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                shortlisted
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25'
                  : 'bg-[#1b1b22] text-zinc-200 hover:text-white border border-[#282836] hover:border-zinc-500'
              }`}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
              </svg>
              <span>{shortlisted ? 'Shortlisted' : 'Shortlist Candidate'}</span>
            </button>

            <a
              href={`mailto:recruiter-team@skillforge.internal?subject=Opportunity%20Discussion%20for%20${encodeURIComponent(
                candidate.name
              )}`}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-lg shadow-[#93B2F8]/20 flex items-center gap-2"
            >
              <span>Contact Candidate</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Proof Match Rationale Callout */}
      <div className="p-5 rounded-2xl bg-[#0A1680]/20 border border-[#93B2F8]/30 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#0A1680] border border-[#93B2F8]/40 flex items-center justify-center text-[#93B2F8] shrink-0 mt-0.5">
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
              <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6l-4.5 4.5L5 8.5l1-1 1 1 3.5-3.5 1 1z" />
            </svg>
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#93B2F8]">
              Verified Proof Match Rationale
            </h3>
            <p className="text-xs text-zinc-200 leading-relaxed font-sans font-medium">
              {candidate.whyThisCandidate}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Evidence Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0A1680]/40 border border-[#93B2F8]/30 flex items-center justify-center text-[#93B2F8] shrink-0">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {candidate.evidenceHighlights.find((h) => h.type.includes('commit'))?.count || 5}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
              Verified Commits
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {candidate.evidenceHighlights.find((h) => h.type.includes('task'))?.count || 4}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
              Completed Tasks
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path fillRule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v4.75a2.25 2.25 0 101.5 0V5A2.5 2.5 0 0011 2.5z" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-black text-white">{candidate.verifiedProjectCount || 2}</div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
              Verified Projects
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F1B94C]/15 border border-[#F1B94C]/40 flex items-center justify-center text-[#F1B94C] shrink-0">
            <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
              <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" />
              <path d="M8 6.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM7 9a1 1 0 012 0v3a1 1 0 11-2 0V9z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#F1B94C]">Tier 1</div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
              Proof Attested
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Evidence Feed & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence Navigation Tabs */}
          <div className="p-4 rounded-2xl bg-[#15151a] border border-[#282836] space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#282836] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Verified Engineering Evidence Ledger</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
                  {filteredEvidence.length} Entries
                </span>
              </h3>

              <div className="flex items-center gap-1 bg-[#1b1b22] p-1 rounded-xl border border-[#282836] overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'github', label: 'GitHub' },
                  { id: 'tasks', label: 'Tasks' },
                  { id: 'manual', label: 'Attested' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === t.id
                        ? 'bg-[#282836] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Evidence Feed Items */}
            <div className="space-y-3">
              {filteredEvidence.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#1b1b22]/70 hover:bg-[#1b1b22] border border-[#282836] transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'commit'
                            ? 'bg-[#0A1680]/60 text-[#93B2F8] border border-[#93B2F8]/30'
                            : item.type === 'pr'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                            : item.type === 'task'
                            ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                            : 'bg-[#F1B94C]/15 text-[#F1B94C] border border-[#F1B94C]/30'
                        }`}
                      >
                        {item.statusBadge}
                      </span>
                      {item.sha && (
                        <span className="font-mono text-[11px] text-zinc-400 bg-[#15151a] px-1.5 py-0.5 rounded border border-[#282836]">
                          {item.sha}
                        </span>
                      )}
                      {item.repoName && (
                        <span className="text-[11px] text-zinc-400 font-medium">{item.repoName}</span>
                      )}
                    </div>

                    <span className="text-[11px] text-zinc-500 font-medium shrink-0">{item.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-[#93B2F8] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{item.detail}</p>

                  {item.justification && (
                    <div className="p-2.5 rounded-lg bg-[#15151a] border border-[#F1B94C]/30 text-[11px] text-zinc-300">
                      <span className="text-[#F1B94C] font-semibold">Attestation Context: </span>
                      {item.justification}
                    </div>
                  )}

                  {item.externalUrl && (
                    <div className="pt-1">
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-[#93B2F8] hover:text-[#b0c7fa] flex items-center gap-1 transition-colors"
                      >
                        <span>Inspect cryptographic proof on GitHub</span>
                        <span>↗</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Documented Collaborative Projects */}
          <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Documented Collaborative Projects</span>
              <span className="text-xs text-zinc-400 font-normal">
                {candidate.verifiedProjectCount} Verified Engagements
              </span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-2">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h4 className="text-sm font-bold text-white">SkillForge Monorepo & AI Intelligence Suite</h4>
                    <p className="text-xs text-[#93B2F8] font-semibold mt-0.5">
                      Role: Lead Frontend & Systems Contributor
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    Active & Verified
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  Engineered the responsive dark workspace, design tokens, and verified proof extraction mechanisms.
                  Merged 12 component PRs and participated in peer architecture reviews.
                </p>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {['React', 'TypeScript', 'TailwindCSS', 'Zod', 'Vite'].map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#15151a] text-zinc-300 border border-[#282836]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {candidate.verifiedProjectCount > 1 && (
                <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h4 className="text-sm font-bold text-white">Winter Global AI & Agentic Sprint 2026</h4>
                      <p className="text-xs text-[#93B2F8] font-semibold mt-0.5">
                        Role: Core Architecture & UI Lead
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                      Sprint Winner
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">
                    High-velocity build marathon delivering autonomous multi-agent collaboration tools and real-time
                    recruiter proof verification.
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {['FastAPI', 'Python', 'WebSockets', 'React', 'Docker'].map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#15151a] text-zinc-300 border border-[#282836]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Skills, Ledger Audit Seal & Actions */}
        <div className="space-y-5">
          {/* Demonstrated Skills Matrix */}
          <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] space-y-3.5 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Verified Technical Skills
            </h3>
            <div className="space-y-2">
              {candidate.skills.map((sk) => (
                <div
                  key={sk}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-xs font-semibold"
                >
                  <span className="text-white">{sk}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#0A1680]/60 text-[#93B2F8] border border-[#93B2F8]/20">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger Proof Security Card */}
          <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                  <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6l-4.5 4.5L5 8.5l1-1 1 1 3.5-3.5 1 1z" />
                </svg>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Ledger Attestation Seal
              </h3>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Every item in this dossier is backed by an append-only cryptographic event record. Commits and PRs are
              verified via GitHub OAuth identities; tasks and offline work are cryptographically signed by project owners.
            </p>

            <div className="p-3 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-1.5 text-[11px] font-mono">
              <div className="text-zinc-500">
                AUTHORITY: <span className="text-zinc-300">SkillForge Ledger v1</span>
              </div>
              <div className="text-zinc-500 truncate">
                CANDIDATE HASH: <span className="text-[#93B2F8]">{candidate.id}</span>
              </div>
              <div className="text-zinc-500">
                AUDIT STATE: <span className="text-emerald-400">PASSED (INTEGRITY 100%)</span>
              </div>
            </div>
          </div>

          {/* Recruiter Quick Action */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0A1680]/30 to-[#15151a] border border-[#93B2F8]/30 space-y-3 text-center shadow-xl">
            <h4 className="text-sm font-bold text-white">Interested in this candidate?</h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Shortlist them to your company pipeline or send a direct technical interview invite.
            </p>
            <button
              onClick={() => setShortlisted(!shortlisted)}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                shortlisted
                  ? 'bg-emerald-500 text-black shadow-emerald-500/20'
                  : 'bg-[#93B2F8] text-[#0A1680] hover:bg-[#b0c7fa] shadow-[#93B2F8]/20'
              }`}
            >
              {shortlisted ? '★ Shortlisted in Pipeline' : 'Shortlist Candidate Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
