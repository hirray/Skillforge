import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export interface ChallengeEntryItem {
  id: string;
  challengeId: string;
  projectId: string;
  summary: string;
  demoUrl?: string | null;
  repoUrl?: string | null;
  status: 'submitted' | 'under_review' | 'shortlisted' | 'declined';
  companyNote?: string | null;
  submittedAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    category?: string;
  } | null;
}

export const ChallengeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<any>(null);
  const [entries, setEntries] = useState<ChallengeEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  // Submit entry state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [myProjects, setMyProjects] = useState<{ id: string; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [summary, setSummary] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Recruiter review editing
  const [editingNoteEntryId, setEditingNoteEntryId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const currentUserToken = localStorage.getItem('token') || 'user-001';
  const isRecruiter = currentUserToken.startsWith('recruiter') || currentUserToken.startsWith('admin');

  const fetchChallengeAndEntries = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [chalRes, entriesRes] = await Promise.all([
        fetch(`/api/v1/challenges/${id}`),
        fetch(`/api/v1/challenges/${id}/entries`, {
          headers: {
            Authorization: `Bearer ${currentUserToken}`,
          },
        }),
      ]);

      if (!chalRes.ok) throw new Error('Challenge not found');
      const chalData = await chalRes.json();
      setChallenge(chalData);

      if (entriesRes.ok) {
        const entriesData = await entriesRes.json();
        setEntries(Array.isArray(entriesData) ? entriesData : []);
      }

      // Fetch user's active projects for submission dropdown
      try {
        const projRes = await fetch('/api/v1/projects');
        if (projRes.ok) {
          const projs = await projRes.json();
          const list = Array.isArray(projs) ? projs : projs.projects || [];
          setMyProjects(list);
          if (list.length > 0) setSelectedProjectId(list[0].id);
        }
      } catch (e) {
        // Fallback demo project
        setMyProjects([{ id: 'm2-demo-project', title: 'Pilot Project (Updated)' }]);
        setSelectedProjectId('m2-demo-project');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading challenge');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeAndEntries();
  }, [id]);

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedProjectId) return;

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const res = await fetch(`/api/v1/challenges/${id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserToken}`,
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          summary,
          demoUrl: demoUrl.trim() || undefined,
          repoUrl: repoUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit team entry');
      }

      setSubmitSuccess('Team project entry successfully submitted for enterprise review!');
      setEntries((prev) => [data, ...prev]);
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(null);
        setSummary('');
        setDemoUrl('');
        setRepoUrl('');
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async (entryId: string, status: string, companyNote?: string) => {
    try {
      setSavingReview(true);
      const res = await fetch(`/api/v1/challenge-entries/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserToken}`,
        },
        body: JSON.stringify({
          status,
          companyNote: companyNote !== undefined ? companyNote : undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, ...updated } : e)));
        setEditingNoteEntryId(null);
      }
    } catch (err) {
      console.error('Failed to review entry:', err);
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        <div className="h-8 bg-[#1b1b22] rounded-xl w-48" />
        <div className="h-64 bg-[#15151a] rounded-2xl border border-[#282836]" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-base font-bold text-white">Challenge Not Found</h2>
        <button
          onClick={() => navigate('/challenges')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8]"
        >
          ← Back to Challenges
        </button>
      </div>
    );
  }

  const isClosed = challenge.status === 'closed' || new Date(challenge.endsAt).getTime() < Date.now();
  const daysLeft = Math.max(0, Math.ceil((new Date(challenge.endsAt).getTime() - Date.now()) / 86400000));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/challenges')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#15151a] hover:bg-[#1b1b22] border border-[#282836] transition-all flex items-center gap-1.5"
        >
          <span>← Back to Challenges</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              isClosed
                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isClosed ? 'Submissions Closed' : `Active • ${daysLeft} Days Remaining`}
          </span>
        </div>
      </div>

      {/* Main Challenge Header Card */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-[#15151a] border border-[#282836] shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#93B2F8]">
                {challenge.company?.name || 'Enterprise Sponsor'}
              </span>
              {challenge.company?.verificationStatus === 'verified' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                  ✓ Verified Enterprise Sponsor
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">{challenge.title}</h1>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {challenge.skillIds?.map((sk: string) => (
                <span
                  key={sk}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1b1b22] text-zinc-200 border border-[#282836]"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(`/projects/create?challengeId=${challenge.id}`)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-200 bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] transition-all"
            >
              + Form Project Team
            </button>

            <button
              disabled={isClosed}
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-50 transition-all shadow-md shadow-[#93B2F8]/20"
            >
              {isClosed ? 'Submissions Closed' : 'Submit Team Solution →'}
            </button>
          </div>
        </div>

        {/* Detailed Brief & Specification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#282836]">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Problem Statement</h2>
              <p className="text-xs text-zinc-200 leading-relaxed bg-[#121217] p-4 rounded-xl border border-[#282836]">
                {challenge.problem}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Required Deliverables</h2>
              <p className="text-xs text-zinc-200 leading-relaxed bg-[#121217] p-4 rounded-xl border border-[#282836]">
                {challenge.deliverables}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Rules & Evaluation</h2>
              <div className="text-xs text-zinc-300 bg-[#121217] p-4 rounded-xl border border-[#282836] space-y-2">
                <p>{challenge.rules}</p>
                <div className="pt-2 border-t border-[#282836] text-[11px] text-zinc-400">
                  <p>• All milestone commits must pass verification</p>
                  <p>• Multi-disciplinary team collaboration expected</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0A1680]/20 border border-[#93B2F8]/30 text-xs text-[#93B2F8] space-y-1">
              <strong className="text-white flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#F1B94C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
                <span>Direct Recruiter Review</span>
              </strong>
              <p className="text-[11px] text-zinc-300">
                Shortlisted team entries are fast-tracked into the company's hiring pipeline with verified proof attestation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Submissions & Recruiter Review Console */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Submitted Team Solutions ({entries.length})</span>
            {isRecruiter && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                Enterprise Review Active
              </span>
            )}
          </h2>
        </div>

        {entries.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#15151a] border border-[#282836] text-xs text-zinc-400">
            No solutions submitted yet. Be the first team to submit deliverables for this challenge!
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] space-y-4 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282836]">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{entry.project?.title || 'Team Project Solution'}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1b1b22] text-zinc-400">
                        ID: {entry.projectId}
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Submitted on {new Date(entry.submittedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                        entry.status === 'shortlisted'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                          : entry.status === 'under_review'
                          ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30'
                          : entry.status === 'declined'
                          ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                          : 'bg-blue-950/60 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {entry.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Solution Summary */}
                <p className="text-xs text-zinc-200 leading-relaxed bg-[#121217] p-3.5 rounded-xl border border-[#282836]/60">
                  {entry.summary}
                </p>

                {/* Links */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  {entry.demoUrl && (
                    <a
                      href={entry.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-[#93B2F8] bg-[#0A1680]/30 border border-[#93B2F8]/30 hover:bg-[#0A1680]/50 transition-colors flex items-center gap-1 font-semibold"
                    >
                      <span>Live Demo ↗</span>
                    </a>
                  )}
                  {entry.repoUrl && (
                    <a
                      href={entry.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg text-zinc-300 bg-[#1b1b22] border border-[#282836] hover:text-white transition-colors flex items-center gap-1"
                    >
                      <span>GitHub Code Repository ↗</span>
                    </a>
                  )}
                </div>

                {/* Recruiter Private Review Console (Visible to recruiters/sponsors) */}
                {isRecruiter && (
                  <div className="pt-3 border-t border-[#282836] space-y-3 bg-[#171720] p-4 rounded-xl border border-[#282836]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Enterprise Evaluation Console</span>
                        <span className="text-[10px] text-zinc-400 font-normal">(Private to company recruiters)</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-400">Review Status:</span>
                        <select
                          aria-label="Update Review Status"
                          value={entry.status}
                          onChange={(e) => handleUpdateReview(entry.id, e.target.value)}
                          className="bg-[#121217] text-xs text-white font-semibold px-2.5 py-1 rounded-lg border border-[#282836] focus:outline-none"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted for Interview</option>
                          <option value="declined">Declined</option>
                        </select>
                      </div>
                    </div>

                    {/* Company Private Note */}
                    <div className="space-y-2">
                      {editingNoteEntryId === entry.id ? (
                        <div className="space-y-2">
                          <textarea
                            rows={2}
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            placeholder="Enter private company review feedback, architecture impressions..."
                            className="w-full bg-[#121217] text-xs text-white p-2.5 rounded-lg border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setEditingNoteEntryId(null)}
                              className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              disabled={savingReview}
                              onClick={() => handleUpdateReview(entry.id, entry.status, editingNoteText)}
                              className="px-3 py-1 rounded-lg text-xs font-bold text-[#0A1680] bg-[#93B2F8]"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <div>
                            <span className="text-zinc-500 font-medium">Internal Note: </span>
                            <span>{entry.companyNote || 'No private notes added yet.'}</span>
                          </div>
                          <button
                            onClick={() => {
                              setEditingNoteEntryId(entry.id);
                              setEditingNoteText(entry.companyNote || '');
                            }}
                            className="text-[11px] text-[#93B2F8] hover:underline"
                          >
                            Edit Note
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Solution Entry Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#282836]">
              <div>
                <h2 className="text-base font-bold text-white">Submit Team Solution</h2>
                <p className="text-xs text-zinc-400">Challenge: {challenge.title}</p>
              </div>
              <button onClick={() => setShowSubmitModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
                {submitSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitEntry} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Select Active Team Project</label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                >
                  {myProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Solution Summary & Approach</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Outline the architectural decisions, tech stack, and how your team satisfied all deliverables..."
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Live Demo / Deployed URL (Optional)</label>
                <input
                  type="url"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://challenge-demo.skillforge.app"
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">GitHub Code Repository URL (Optional)</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/team/challenge-solution"
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isClosed}
                  className="px-5 py-2.5 rounded-xl font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-50 transition-all shadow-md shadow-[#93B2F8]/20"
                >
                  {submitting ? 'Submitting...' : 'Submit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
