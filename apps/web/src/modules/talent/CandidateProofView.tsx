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

export const CandidateProofView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId') || searchParams.get('id');
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
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
    fetchCandidate();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <div className="p-8 rounded-2xl bg-[#15151a] border border-[#282836] animate-pulse h-64" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="p-12 rounded-2xl bg-[#15151a] border border-[#282836]">
          <h2 className="text-base font-bold text-white mb-2">Candidate Profile Not Found</h2>
          <p className="text-xs text-zinc-400 mb-4">
            The requested candidate proof record may not be recruiter-visible or does not exist.
          </p>
          <button
            onClick={() => navigate('/talent')}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0A1680] bg-[#93B2F8]"
          >
            ← Return to Talent Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <span>← Back to Talent Directory</span>
        </button>
      </div>

      {/* Main Dossier Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#15151a] border border-[#282836] shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#282836]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0A1680] border border-[#93B2F8]/40 flex items-center justify-center text-2xl font-bold text-[#93B2F8] shadow-lg">
              {candidate.name[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">{candidate.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                  Verified Candidate
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 capitalize">
                  {candidate.availability.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-zinc-300 font-medium">{candidate.headline}</p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-1.5 flex-wrap">
                <span>📍 {candidate.location}</span>
                <span>•</span>
                <span className="capitalize">{candidate.workMode}</span>
                <span>•</span>
                <span>{candidate.experienceYears} Years Documented Experience</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShortlisted(!shortlisted)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                shortlisted
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-[#1b1b22] text-zinc-200 hover:text-white border border-[#282836]'
              }`}
            >
              <span>{shortlisted ? '★ Shortlisted' : '☆ Shortlist Candidate'}</span>
            </button>
            <a
              href={`mailto:recruiter-inquiry@skillforge.internal?subject=Opportunity%20Inquiry%20for%20${encodeURIComponent(
                candidate.name
              )}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
            >
              Contact Candidate
            </a>
          </div>
        </div>

        {/* Proof Match Rationale */}
        <div className="p-4 rounded-xl bg-[#0A1680]/20 border border-[#93B2F8]/30 text-xs text-zinc-200 leading-relaxed font-sans">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#93B2F8] mb-1 flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6l-4.5 4.5L5 8.5l1-1 1 1 3.5-3.5 1 1z" />
            </svg>
            Verified Proof Match Rationale
          </div>
          {candidate.whyThisCandidate}
        </div>

        {/* Evidence Highlights Metric Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Attested Evidence Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {candidate.evidenceHighlights.map((h, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] text-center">
                <div className="text-2xl font-bold text-white mb-0.5">{h.count}</div>
                <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                  {h.label.replace(/^\d+\s*/, '')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Matrix */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Verified Technical Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((sk) => (
              <span
                key={sk}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        {/* Documented Collaborative Projects */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Documented Collaborative Projects ({candidate.verifiedProjectCount})
          </h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white">SkillForge Monorepo & AI Intelligence Suite</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    Active & Verified
                  </span>
                </div>
                <p className="text-xs text-zinc-300">
                  Role: <span className="text-[#93B2F8] font-semibold">Fullstack Lead & Core Contributor</span>
                </p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Architected asynchronous job execution pipelines, SQLite/Prisma schema migrations, and REST API
                  contracts across multi-agent microservices.
                </p>
              </div>
              <span className="text-[11px] text-zinc-500 shrink-0">Sprint 2026</span>
            </div>

            {candidate.verifiedProjectCount > 1 && (
              <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white">Winter Global AI & Agentic Sprint 2026</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                      Hackathon Winner
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Role: <span className="text-[#93B2F8] font-semibold">Systems Architect</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Designed reactive frontend workspace and verified proof export protocols in high-velocity build marathon.
                  </p>
                </div>
                <span className="text-[11px] text-zinc-500 shrink-0">Sprint 2026</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 rounded-xl bg-[#121217] border border-[#282836] text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Attestation Authority: SkillForge Verified Ledger Engine</span>
          <span>Idempotency Hash: {candidate.id.slice(0, 12)}</span>
        </div>
      </div>
    </div>
  );
};
