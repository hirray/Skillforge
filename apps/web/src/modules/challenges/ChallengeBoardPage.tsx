import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface ChallengeCompany {
  id: string;
  name: string;
  industry?: string;
  verificationStatus: string;
}

export interface ChallengeItem {
  id: string;
  companyId: string;
  title: string;
  problem: string;
  deliverables: string;
  skillIds: string[];
  startsAt: string;
  endsAt: string;
  rules: string;
  visibility: string;
  status: 'draft' | 'open' | 'closed';
  createdAt: string;
  company?: ChallengeCompany | null;
  entriesCount?: number;
}

export const ChallengeBoardPage: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Post Challenge Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newDeliverables, setNewDeliverables] = useState('');
  const [newSkills, setNewSkills] = useState('TypeScript, React, Node.js');
  const [newDays, setNewDays] = useState(30);
  const [newRules, setNewRules] = useState('Multi-member teams eligible. Standard verification required.');
  const [newCompanyId, setNewCompanyId] = useState('m2-demo-company');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/v1/challenges';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load sponsored challenges');
      const data = await res.json();
      setChallenges(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [statusFilter]);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateError(null);
      const endsAt = new Date(Date.now() + newDays * 86400000).toISOString();
      const skillIds = newSkills.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await fetch('/api/v1/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'recruiter-001'}`,
        },
        body: JSON.stringify({
          companyId: newCompanyId,
          title: newTitle,
          problem: newProblem,
          deliverables: newDeliverables,
          skillIds,
          endsAt,
          rules: newRules,
          visibility: 'public',
          status: 'open',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create sponsored challenge');
      }

      setChallenges((prev) => [data, ...prev]);
      setShowPostModal(false);
      setNewTitle('');
      setNewProblem('');
      setNewDeliverables('');
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filtered = challenges.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.problem.toLowerCase().includes(q) ||
      c.company?.name.toLowerCase().includes(q) ||
      c.skillIds.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#15151a] p-6 rounded-2xl border border-[#282836] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-tight">Company-Sponsored Real-World Projects</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
              Module 28
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real enterprise briefs sponsored by verified companies. Build solutions, submit verifiable code, and compete for hiring fast-tracks and prize bounties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center gap-1.5"
          >
            <span>+ Post Sponsored Challenge</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-[#171720] rounded-2xl border border-[#282836]">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search challenges by title, skills, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#121217] text-xs text-white px-3.5 py-2 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none w-full sm:w-72"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-zinc-400">Status:</span>
          {(['all', 'open', 'closed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 shadow-sm'
                  : 'bg-[#121217] text-zinc-400 hover:text-white border border-[#282836]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-[#15151a] rounded-2xl border border-[#282836]" />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-center text-xs text-rose-300">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#15151a] border border-[#282836] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1b1b22] border border-[#282836] mx-auto flex items-center justify-center text-amber-400">
            🎯
          </div>
          <h3 className="text-sm font-bold text-white">No challenges matching filters</h3>
          <p className="text-xs text-zinc-400">Check back soon or post a new sponsored enterprise challenge.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((c) => {
            const isClosed = c.status === 'closed' || new Date(c.endsAt).getTime() < Date.now();
            const daysLeft = Math.max(0, Math.ceil((new Date(c.endsAt).getTime() - Date.now()) / 86400000));

            return (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-[#15151a] border border-[#282836] hover:border-zinc-500 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div className="space-y-3">
                  {/* Company Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0A1680] to-[#93B2F8] flex items-center justify-center text-xs font-bold text-white">
                        {c.company?.name ? c.company.name[0] : 'C'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          {c.company?.name || 'Enterprise Sponsor'}
                          {c.company?.verificationStatus === 'verified' && (
                            <span className="text-[#93B2F8]" title="Verified Enterprise Sponsor">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-zinc-400">{c.company?.industry || 'Technology'}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isClosed
                          ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                          : 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {isClosed ? 'Closed' : `${daysLeft} Days Left`}
                    </span>
                  </div>

                  {/* Title & Problem */}
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-[#93B2F8] transition-colors leading-snug">
                      {c.title}
                    </h2>
                    <p className="text-xs text-zinc-400 line-clamp-3 mt-1.5 leading-relaxed">{c.problem}</p>
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.skillIds.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1b1b22] text-zinc-300 border border-[#282836]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="pt-4 border-t border-[#282836]/60 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                    <span className="font-bold text-white">{c.entriesCount || 0}</span>
                    <span>Teams Submitted</span>
                  </div>

                  <button
                    onClick={() => navigate(`/challenges/${c.id}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center gap-1"
                  >
                    <span>View Challenge & Compete</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Sponsored Challenge Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-xl max-h-[90vh] bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-[#282836]">
              <div>
                <h2 className="text-base font-bold text-white">Post Sponsored Enterprise Challenge</h2>
                <p className="text-xs text-zinc-400">
                  Broadcast a technical problem to attract high-performing multi-disciplinary engineering teams.
                </p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateChallenge} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Challenge Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Zero-Trust Automated Identity Verification Agent"
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Company Sponsor</label>
                <select
                  aria-label="Select Company Sponsor"
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                >
                  <option value="m2-demo-company">Acme Cloud Inc. (Verified Enterprise)</option>
                  <option value="company-002">NextGen Robotics</option>
                  <option value="company-003">Vector AI Systems</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Problem Statement</label>
                <textarea
                  rows={3}
                  required
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="Describe the real-world technical architecture bottleneck, customer friction, or optimization challenge..."
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Required Deliverables</label>
                <input
                  type="text"
                  required
                  value={newDeliverables}
                  onChange={(e) => setNewDeliverables(e.target.value)}
                  placeholder="e.g. Open-source GitHub repo, live deployed frontend, integration test report"
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Required Skills (comma separated)</label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="TypeScript, React, Node.js, Docker"
                    className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={newDays}
                    onChange={(e) => setNewDays(parseInt(e.target.value) || 30)}
                    className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-300 mb-1">Rules & Evaluation Criteria</label>
                <input
                  type="text"
                  value={newRules}
                  onChange={(e) => setNewRules(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-3 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-50 transition-all shadow-md shadow-[#93B2F8]/20"
                >
                  {creating ? 'Publishing...' : 'Publish Challenge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
