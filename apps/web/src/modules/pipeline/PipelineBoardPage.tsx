import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface PipelineStageHistory {
  id: string;
  entryId: string;
  fromStage: string | null;
  toStage: string;
  changedBy: string;
  createdAt: string;
}

export interface RecruiterNote {
  id: string;
  entryId: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface ShortlistCandidate {
  id: string;
  name: string;
  headline: string;
  location?: string;
  workMode?: string;
  experienceYears?: number;
  availability?: string;
  skills: string[];
  recruiterVisible: boolean;
  verifiedProjectCount?: number;
  contributionCount?: number;
}

export interface PipelineEntry {
  id: string;
  companyId: string;
  recruiterId: string;
  jobId?: string | null;
  userId: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
  candidate?: ShortlistCandidate | null;
  stageHistory?: PipelineStageHistory[];
  notes?: RecruiterNote[];
}

export interface CompareCandidateRow {
  candidateId: string;
  name: string;
  headline: string;
  location: string;
  workMode: string;
  experienceYears: number;
  availability: string;
  verifiedProjectCount: number;
  contributionCount: number;
  skills: {
    skill: string;
    evidenceLevel: 'verified' | 'unverified' | 'missing';
    projectCount: number;
  }[];
  collaborativeProjects: {
    id: string;
    title: string;
    role: string;
    completionScore: number;
  }[];
  matchScore: number;
  matchReasons: string[];
}

const STAGES = [
  { id: 'New', label: 'New Discoveries', color: 'bg-blue-900/30 text-blue-300 border-blue-500/30' },
  { id: 'Reviewed', label: 'Reviewed', color: 'bg-purple-900/30 text-purple-300 border-purple-500/30' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'bg-amber-900/30 text-amber-300 border-amber-500/30' },
  { id: 'Contacted', label: 'Contacted', color: 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30' },
  { id: 'Interview', label: 'Interview', color: 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30' },
  { id: 'Selected', label: 'Selected / Offer', color: 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30' },
  { id: 'Rejected', label: 'Declined', color: 'bg-rose-900/30 text-rose-300 border-rose-500/30' },
  { id: 'Closed', label: 'Closed / Hired', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
];

export const PipelineBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [companyId, setCompanyId] = useState(searchParams.get('companyId') || 'm2-demo-company');
  const [jobId, setJobId] = useState(searchParams.get('jobId') || '');
  const [entries, setEntries] = useState<PipelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drawer & Modals
  const [selectedEntry, setSelectedEntry] = useState<PipelineEntry | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Outreach Modal
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [outreachEntry, setOutreachEntry] = useState<PipelineEntry | null>(null);
  const [outreachText, setOutreachText] = useState('');
  const [sendingOutreach, setSendingOutreach] = useState(false);
  const [outreachStatus, setOutreachStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Comparison State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<any>(null);

  // Drag-and-Drop Kanban State
  const [draggingEntryId, setDraggingEntryId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/v1/pipeline?companyId=${encodeURIComponent(companyId)}`;
      if (jobId) url += `&jobId=${encodeURIComponent(jobId)}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'recruiter-001'}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load candidate pipeline');
      }

      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading pipeline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, [companyId, jobId]);

  const handleStageChange = async (entryId: string, newStage: string) => {
    // Optimistic UI update so drag-and-drop moves immediately
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, stage: newStage } : e))
    );
    if (selectedEntry?.id === entryId) {
      setSelectedEntry((prev) => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      const res = await fetch(`/api/v1/pipeline/${entryId}?companyId=${encodeURIComponent(companyId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'recruiter-001'}`,
        },
        body: JSON.stringify({ stage: newStage }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, ...updated } : e)));
        if (selectedEntry?.id === entryId) {
          setSelectedEntry((prev) => (prev ? { ...prev, ...updated } : null));
        }
      } else {
        fetchPipeline();
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchPipeline();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry || !newNoteText.trim()) return;

    try {
      setSavingNote(true);
      const res = await fetch(`/api/v1/pipeline/${selectedEntry.id}/notes?companyId=${encodeURIComponent(companyId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'recruiter-001'}`,
        },
        body: JSON.stringify({ text: newNoteText.trim() }),
      });

      if (res.ok) {
        const note = await res.json();
        const updatedNotes = [note, ...(selectedEntry.notes || [])];
        const updatedEntry = { ...selectedEntry, notes: updatedNotes };
        setSelectedEntry(updatedEntry);
        setEntries((prev) => prev.map((e) => (e.id === selectedEntry.id ? updatedEntry : e)));
        setNewNoteText('');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleSendOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachEntry || !outreachText.trim()) return;

    try {
      setSendingOutreach(true);
      setOutreachStatus(null);
      const res = await fetch(`/api/v1/pipeline/outreach`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'recruiter-001'}`,
        },
        body: JSON.stringify({
          entryId: outreachEntry.id,
          companyId,
          text: outreachText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setOutreachStatus({ error: data.message || 'Outreach could not be delivered.' });
      } else {
        setOutreachStatus({ success: 'Outreach message successfully sent to candidate opportunities inbox!' });
        setOutreachText('');
        // Automatically advance to 'Contacted' stage if currently below that
        if (['New', 'Reviewed', 'Shortlisted'].includes(outreachEntry.stage)) {
          handleStageChange(outreachEntry.id, 'Contacted');
        }
        setTimeout(() => {
          setShowOutreachModal(false);
          setOutreachStatus(null);
        }, 1800);
      }
    } catch (err: any) {
      setOutreachStatus({ error: err.message || 'Network error sending outreach message.' });
    } finally {
      setSendingOutreach(false);
    }
  };

  const toggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      } else {
        if (prev.length >= 4) {
          alert('You can select a maximum of 4 candidates to compare side-by-side.');
          return prev;
        }
        return [...prev, candidateId];
      }
    });
  };

  const openCompareModal = async () => {
    if (selectedCandidateIds.length < 2) return;
    try {
      setShowCompareModal(true);
      setCompareLoading(true);
      const res = await fetch('/api/v1/pipeline/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'recruiter-001'}`,
        },
        body: JSON.stringify({
          candidateIds: selectedCandidateIds,
          companyId,
          jobId: jobId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompareResult(data);
      }
    } catch (err) {
      console.error('Error comparing candidates:', err);
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#15151a] p-6 rounded-2xl border border-[#282836] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#93B2F8] animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-tight">Recruiter Hiring Pipeline</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
              Module 25
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Track verified candidate progressions, inspect auditable proof dossiers, log private recruiter notes, and send consent-aware outreach.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Company Selector */}
          <div className="flex items-center gap-2 bg-[#1b1b22] px-3 py-1.5 rounded-xl border border-[#282836]">
            <span className="text-xs text-zinc-400 font-medium">Company:</span>
            <select
              aria-label="Filter by Company"
              value={companyId}
              onChange={(e) => {
                setCompanyId(e.target.value);
                setSearchParams({ companyId: e.target.value, jobId });
              }}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="m2-demo-company" className="bg-[#1b1b22]">Acme Cloud Inc.</option>
              <option value="company-002" className="bg-[#1b1b22]">NextGen Robotics</option>
              <option value="company-003" className="bg-[#1b1b22]">Vector AI Systems</option>
            </select>
          </div>

          {/* Job Filter */}
          <div className="flex items-center gap-2 bg-[#1b1b22] px-3 py-1.5 rounded-xl border border-[#282836]">
            <span className="text-xs text-zinc-400 font-medium">Role:</span>
            <select
              aria-label="Filter by Job Opening"
              value={jobId}
              onChange={(e) => {
                setJobId(e.target.value);
                setSearchParams({ companyId, jobId: e.target.value });
              }}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#1b1b22]">All Openings / General</option>
              <option value="m2-demo-job" className="bg-[#1b1b22]">Senior Distributed Systems Lead</option>
              <option value="job-frontend-01" className="bg-[#1b1b22]">Fullstack UI Architect</option>
            </select>
          </div>

          {/* Compare Button */}
          {selectedCandidateIds.length >= 2 && (
            <button
              onClick={openCompareModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center gap-1.5 animate-bounce"
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
                <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v11A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-11zM9 2.5A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v11a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-11z" />
              </svg>
              <span>Compare Selected ({selectedCandidateIds.length})</span>
            </button>
          )}

          <button
            onClick={() => navigate('/talent')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] transition-all flex items-center gap-1.5"
          >
            <span>+ Find Candidates</span>
          </button>
        </div>
      </div>

      {/* Selected Candidates Bar if < 2 */}
      {selectedCandidateIds.length > 0 && selectedCandidateIds.length < 2 && (
        <div className="p-3 bg-[#0A1680]/20 border border-[#93B2F8]/30 rounded-xl text-xs text-[#93B2F8] flex items-center justify-between">
          <span>
            <strong>1 candidate selected</strong>. Select at least 1 more (up to 4) to activate side-by-side comparison.
          </span>
          <button
            onClick={() => setSelectedCandidateIds([])}
            className="text-xs text-zinc-400 hover:text-white underline"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Loading & Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-96 bg-[#15151a] rounded-2xl border border-[#282836]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-center text-xs text-rose-300">
          {error}
        </div>
      ) : (
        /* Kanban Board Grid with Drag & Drop */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {STAGES.map((col) => {
            const colEntries = entries.filter((e) => e.stage === col.id);
            const isColumnOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverCol !== col.id) {
                    setDragOverCol(col.id);
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if (dragOverCol === col.id) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverCol(null);
                  setDraggingEntryId(null);
                  const dataStr = e.dataTransfer.getData('text/plain');
                  if (dataStr) {
                    try {
                      const { entryId, fromStage } = JSON.parse(dataStr);
                      if (entryId && fromStage !== col.id) {
                        handleStageChange(entryId, col.id);
                      }
                    } catch (err) {
                      console.error('Failed to parse drag payload:', err);
                    }
                  }
                }}
                className={`bg-[#121217] rounded-2xl border transition-all duration-200 p-4 flex flex-col min-w-[270px] shadow-lg ${
                  isColumnOver
                    ? 'border-[#93B2F8] bg-[#171b30] ring-2 ring-[#93B2F8]/40 shadow-xl'
                    : 'border-[#282836]'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#282836]/60">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${col.color}`}>
                      {col.label}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-400 px-2 py-0.5 bg-[#1b1b22] rounded-full">
                    {colEntries.length}
                  </span>
                </div>

                {/* Drop Highlight Indicator */}
                {isColumnOver && (
                  <div className="mb-3 py-2 px-3 rounded-xl bg-[#0A1680]/30 border border-[#93B2F8]/60 text-[#93B2F8] text-[11px] font-semibold text-center animate-pulse flex items-center justify-center gap-2 shadow-inner">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                    <span>Drop here to move to {col.label}</span>
                  </div>
                )}

                {/* Candidate Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {colEntries.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-zinc-500 italic border border-dashed border-[#282836] rounded-xl">
                      No candidates in {col.label}
                    </div>
                  ) : (
                    colEntries.map((entry) => {
                      const candidate = entry.candidate;
                      const candidateId = candidate?.id || entry.userId;
                      const isSelectedForCompare = selectedCandidateIds.includes(candidateId);
                      const isWithdrawn = candidate && !candidate.recruiterVisible;
                      const isDraggingThis = draggingEntryId === entry.id;

                      return (
                        <div
                          key={entry.id}
                          draggable={true}
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              'text/plain',
                              JSON.stringify({ entryId: entry.id, fromStage: entry.stage })
                            );
                            e.dataTransfer.effectAllowed = 'move';
                            setDraggingEntryId(entry.id);
                          }}
                          onDragEnd={() => {
                            setDraggingEntryId(null);
                            setDragOverCol(null);
                          }}
                          className={`p-3.5 rounded-xl bg-[#171720] border transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                            isDraggingThis
                              ? 'opacity-40 border-dashed border-[#93B2F8] scale-[0.98]'
                              : isSelectedForCompare
                              ? 'border-[#93B2F8] shadow-md shadow-[#93B2F8]/10'
                              : 'border-[#282836] hover:border-zinc-500 hover:-translate-y-0.5 hover:shadow-md'
                          }`}
                          onClick={() => setSelectedEntry(entry)}
                        >
                          {/* Card Top Row: Drag Grip, Checkbox, Name, & Info */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {/* 6-dot drag handle indicator */}
                              <div
                                className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing shrink-0"
                                title="Drag to reorder or move stage"
                              >
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                  <circle cx="8" cy="6" r="1.5" />
                                  <circle cx="16" cy="6" r="1.5" />
                                  <circle cx="8" cy="12" r="1.5" />
                                  <circle cx="16" cy="12" r="1.5" />
                                  <circle cx="8" cy="18" r="1.5" />
                                  <circle cx="16" cy="18" r="1.5" />
                                </svg>
                              </div>
                              <input
                                type="checkbox"
                                aria-label={`Select ${candidate?.name || 'candidate'} for comparison`}
                                checked={isSelectedForCompare}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelectCandidate(candidateId);
                                }}
                                className="rounded border-zinc-700 bg-zinc-900 text-[#0A1680] focus:ring-0 cursor-pointer"
                              />
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#0A1680] to-[#93B2F8] flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {candidate?.name ? candidate.name[0].toUpperCase() : 'U'}
                              </div>
                              <div>
                                <h3 className="text-xs font-bold text-white hover:text-[#93B2F8] transition-colors leading-tight">
                                  {candidate?.name || 'Verified Engineer'}
                                </h3>
                                <p className="text-[10px] text-zinc-400 line-clamp-1">{candidate?.headline || 'Core Contributor'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Visibility Changed Notice (GDPR/Consent protection) */}
                          {isWithdrawn && (
                            <div className="mb-2 p-1.5 rounded-lg bg-rose-950/60 border border-rose-500/30 text-[10px] text-rose-300 font-semibold flex items-center gap-1.5">
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              <span>Profile no longer visible</span>
                            </div>
                          )}

                          {/* Verified Proof Badges */}
                          <div className="flex items-center gap-2 mb-2 text-[10px]">
                            <span className="px-2 py-0.5 rounded-md bg-[#0A1680]/30 text-[#93B2F8] border border-[#93B2F8]/20 font-bold flex items-center gap-1">
                              <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                              </svg>
                              <span>{candidate?.verifiedProjectCount || 1} Verified Projects</span>
                            </span>
                            <span className="text-zinc-400 font-medium">
                              {candidate?.experienceYears || 1}y exp
                            </span>
                          </div>

                          {/* Skills Pills */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {(candidate?.skills || ['TypeScript', 'React']).slice(0, 3).map((sk) => (
                              <span
                                key={sk}
                                className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#21212c] text-zinc-300 border border-[#2e2e3f]"
                              >
                                {sk}
                              </span>
                            ))}
                            {(candidate?.skills?.length || 0) > 3 && (
                              <span className="text-[9px] text-zinc-500 font-bold">
                                +{(candidate?.skills?.length || 0) - 3}
                              </span>
                            )}
                          </div>

                          {/* Card Footer: Quick Move Stage & Action */}
                          <div
                            className="pt-2 border-t border-[#282836]/60 flex items-center justify-between gap-1 text-[11px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              aria-label="Move candidate stage"
                              value={entry.stage}
                              onChange={(e) => handleStageChange(entry.id, e.target.value)}
                              className="bg-[#121217] text-[10px] text-zinc-300 font-semibold px-2 py-1 rounded-lg border border-[#282836] focus:outline-none cursor-pointer"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Move to {s.label}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => {
                                setOutreachEntry(entry);
                                setShowOutreachModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors flex items-center gap-1"
                            >
                              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                              </svg>
                              <span>Contact</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Detail Drawer */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl h-full bg-[#15151a] border-l border-[#282836] p-6 flex flex-col overflow-y-auto space-y-6 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#282836]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0A1680] to-[#93B2F8] flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-[#0A1680]/30">
                  {selectedEntry.candidate?.name ? selectedEntry.candidate.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white leading-snug">
                    {selectedEntry.candidate?.name || 'Candidate Details'}
                  </h2>
                  <p className="text-xs text-zinc-400">{selectedEntry.candidate?.headline || 'Core Contributor'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="w-8 h-8 rounded-lg bg-[#1b1b22] text-zinc-400 hover:text-white flex items-center justify-center border border-[#282836]"
              >
                ✕
              </button>
            </div>

            {/* Quick Actions & Links */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setOutreachEntry(selectedEntry);
                  setShowOutreachModal(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all flex items-center gap-1.5 shadow-md shadow-[#93B2F8]/20"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span>Send Direct Outreach</span>
              </button>

              <button
                onClick={() => navigate(`/portfolio/candidate?userId=${selectedEntry.userId}`)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-200 bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] transition-all flex items-center gap-1.5"
              >
                <span>View Full Proof Dossier ↗</span>
              </button>

              {/* Stage Selector */}
              <div className="flex items-center gap-2 bg-[#1b1b22] px-3 py-1.5 rounded-xl border border-[#282836] ml-auto">
                <span className="text-[11px] text-zinc-400 font-medium">Stage:</span>
                <select
                  value={selectedEntry.stage}
                  onChange={(e) => handleStageChange(selectedEntry.id, e.target.value)}
                  className="bg-transparent text-xs text-[#93B2F8] font-bold focus:outline-none cursor-pointer"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#1b1b22] text-white">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Candidate Overview Card */}
            <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Verified Projects:</span>
                <span className="font-bold text-white">{selectedEntry.candidate?.verifiedProjectCount || 1} Projects</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Documented Experience:</span>
                <span className="font-bold text-white">{selectedEntry.candidate?.experienceYears || 1} Years</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Recruiter Consent Status:</span>
                <span
                  className={`font-bold ${
                    selectedEntry.candidate?.recruiterVisible ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedEntry.candidate?.recruiterVisible ? 'Consent Granted' : 'Withdrawn / Hidden'}
                </span>
              </div>
            </div>

            {/* Private Recruiter Notes (Internal only, never visible to candidate) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#F1B94C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Private Recruiter Notes</span>
                  <span className="text-[10px] text-zinc-400 font-normal">(Never shown to candidate)</span>
                </h3>
              </div>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Log interview feedback, technical assessment notes, compensation expectations..."
                  className="w-full bg-[#1b1b22] text-xs text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={savingNote || !newNoteText.trim()}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-zinc-200 bg-[#252535] hover:bg-[#313145] disabled:opacity-50 transition-colors"
                >
                  {savingNote ? 'Saving note...' : '+ Add Internal Note'}
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-2 pt-2">
                {(selectedEntry.notes || []).length === 0 ? (
                  <p className="text-[11px] text-zinc-500 italic">No notes logged yet.</p>
                ) : (
                  (selectedEntry.notes || []).map((note) => (
                    <div key={note.id} className="p-3 bg-[#171720] rounded-xl border border-[#282836] space-y-1">
                      <p className="text-xs text-zinc-200">{note.text}</p>
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                        <span>By {note.authorId}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stage Transition History Timeline */}
            <div className="space-y-3 pt-3 border-t border-[#282836]">
              <h3 className="text-xs font-bold text-white">Pipeline Stage History</h3>
              <div className="space-y-2">
                {(selectedEntry.stageHistory || []).map((h) => (
                  <div key={h.id} className="flex items-start gap-2.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#93B2F8] mt-1.5 shrink-0" />
                    <div>
                      <p className="text-zinc-300 font-medium">
                        {h.fromStage ? `Moved from ${h.fromStage} to ` : 'Initial stage: '}
                        <strong className="text-white">{h.toStage}</strong>
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        By {h.changedBy} • {new Date(h.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Message Composer Modal (Consent-Enforced) */}
      {showOutreachModal && outreachEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#282836]">
              <div>
                <h2 className="text-base font-bold text-white">Send Direct Outreach Message</h2>
                <p className="text-xs text-zinc-400">
                  To: <strong className="text-white">{outreachEntry.candidate?.name || 'Candidate'}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOutreachModal(false);
                  setOutreachStatus(null);
                }}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Consent Notice */}
            {outreachEntry.candidate && !outreachEntry.candidate.recruiterVisible ? (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Recruiter Contact Consent Withdrawn</span>
                </p>
                <p className="text-[11px] text-rose-400">
                  This candidate has toggled off recruiter contact consent in their discovery settings. Sending messages to this candidate is blocked.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                <svg viewBox="0 0 16 16" width="13" height="13" fill="#93B2F8">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
                <span>Candidate has active discovery consent enabled for verified recruiters.</span>
              </div>
            )}

            {outreachStatus?.error && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {outreachStatus.error}
              </div>
            )}
            {outreachStatus?.success && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
                {outreachStatus.success}
              </div>
            )}

            <form onSubmit={handleSendOutreach} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Message Content (Delivered to candidate's Opportunities Inbox)
                </label>
                <textarea
                  rows={4}
                  disabled={Boolean(outreachEntry.candidate && !outreachEntry.candidate.recruiterVisible)}
                  value={outreachText}
                  onChange={(e) => setOutreachText(e.target.value)}
                  placeholder={`Hi ${outreachEntry.candidate?.name || 'there'}, we were impressed by your verified contributions on SkillForge and would love to discuss an engineering role with our team...`}
                  className="w-full bg-[#1b1b22] text-xs text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none transition-colors disabled:opacity-50"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOutreachModal(false);
                    setOutreachStatus(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    sendingOutreach ||
                    !outreachText.trim() ||
                    Boolean(outreachEntry.candidate && !outreachEntry.candidate.recruiterVisible)
                  }
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-50 transition-all shadow-md shadow-[#93B2F8]/20 flex items-center gap-1.5"
                >
                  <span>{sendingOutreach ? 'Sending...' : 'Send Message'}</span>
                  {!sendingOutreach && (
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Modal (2 to 4 candidates) */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#15151a] border border-[#282836] rounded-2xl p-6 flex flex-col space-y-4 shadow-2xl overflow-y-auto">
            {/* Compare Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#282836]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Candidate Side-by-Side Comparison</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                    {selectedCandidateIds.length} Candidates
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Compare verified deliverables, evidence levels, collaborative projects, and role suitability.
                </p>
              </div>
              <button
                onClick={() => setShowCompareModal(false)}
                className="w-8 h-8 rounded-lg bg-[#1b1b22] text-zinc-400 hover:text-white flex items-center justify-center border border-[#282836]"
              >
                ✕
              </button>
            </div>

            {compareLoading ? (
              <div className="py-20 text-center text-xs text-zinc-400 animate-pulse space-y-2">
                <div className="w-8 h-8 border-2 border-[#93B2F8] border-t-transparent rounded-full animate-spin mx-auto" />
                <p>Synthesizing verified engineering metrics & evidence matrix...</p>
              </div>
            ) : compareResult?.candidates ? (
              /* Side-by-Side Comparison Matrix Table */
              <div className="overflow-x-auto pb-4">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#282836]">
                      <th className="p-3 text-xs font-bold text-zinc-400 w-44">Attribute</th>
                      {compareResult.candidates.map((c: CompareCandidateRow) => (
                        <th key={c.candidateId} className="p-3 min-w-[200px]">
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white">{c.name}</h4>
                            <p className="text-[11px] text-zinc-400 line-clamp-1">{c.headline}</p>
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1680] text-[#93B2F8]">
                              Match: {c.matchScore}%
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282836]/60 text-xs">
                    {/* Experience & Location */}
                    <tr>
                      <td className="p-3 font-semibold text-zinc-400">Experience & Location</td>
                      {compareResult.candidates.map((c: CompareCandidateRow) => (
                        <td key={c.candidateId} className="p-3 text-zinc-200">
                          {c.experienceYears} Years • {c.location} ({c.workMode})
                        </td>
                      ))}
                    </tr>

                    {/* Verified Metrics */}
                    <tr>
                      <td className="p-3 font-semibold text-zinc-400">Verified Evidence</td>
                      {compareResult.candidates.map((c: CompareCandidateRow) => (
                        <td key={c.candidateId} className="p-3 text-zinc-200">
                          <span className="font-bold text-emerald-400">{c.verifiedProjectCount} Projects</span>
                          <span className="text-zinc-400"> • {c.contributionCount} Commits</span>
                        </td>
                      ))}
                    </tr>

                    {/* Verified Skills Matrix */}
                    <tr>
                      <td className="p-3 font-semibold text-zinc-400">Demonstrated Skills</td>
                      {compareResult.candidates.map((c: CompareCandidateRow) => (
                        <td key={c.candidateId} className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {c.skills.map((s) => (
                              <span
                                key={s.skill}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 w-fit ${
                                  s.evidenceLevel === 'verified'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}
                              >
                                {s.evidenceLevel === 'verified' && (
                                  <svg viewBox="0 0 16 16" width="9" height="9" fill="currentColor">
                                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                                  </svg>
                                )}
                                <span>{s.skill}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Collaborative Projects */}
                    <tr>
                      <td className="p-3 font-semibold text-zinc-400">Collaborative Projects</td>
                      {compareResult.candidates.map((c: CompareCandidateRow) => (
                        <td key={c.candidateId} className="p-3 space-y-1">
                          {c.collaborativeProjects.map((p) => (
                            <div key={p.id} className="text-[11px] text-zinc-300">
                              <strong>{p.title}</strong>
                              <span className="text-zinc-500"> ({p.role})</span>
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>

                    {/* Match Rationale */}
                    <tr>
                      <td className="p-3 font-semibold text-zinc-400">Verification Rationale</td>
                      {compareResult.candidates.map((c: CompareCandidateRow) => (
                        <td key={c.candidateId} className="p-3 text-[11px] text-zinc-300">
                          <ul className="list-disc pl-4 space-y-0.5 text-zinc-400">
                            {c.matchReasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>

                    {/* Decision Action Row */}
                    <tr>
                      <td className="p-3 font-semibold text-zinc-400">Action</td>
                      {compareResult.candidates.map((c: CompareCandidateRow) => {
                        const candidateEntry = entries.find((e) => e.userId === c.candidateId || e.candidate?.id === c.candidateId);
                        return (
                          <td key={c.candidateId} className="p-3">
                            <button
                              onClick={() => {
                                setShowCompareModal(false);
                                if (candidateEntry) {
                                  setSelectedEntry(candidateEntry);
                                } else {
                                  navigate(`/portfolio/candidate?userId=${c.candidateId}`);
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors flex items-center gap-1"
                            >
                              <span>Open Profile</span>
                              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 8h10M9 4l4 4-4 4" />
                              </svg>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
