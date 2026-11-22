import React, { useState, useEffect } from 'react';

export const AdminSkillsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'taxonomy' | 'proposals' | 'merge'>('taxonomy');
  const [skills, setSkills] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [_loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Merge form
  const [fromSkillId, setFromSkillId] = useState('');
  const [toSkillId, setToSkillId] = useState('');
  const [mergeReason, setMergeReason] = useState('');
  const [merging, setMerging] = useState(false);

  // Propose skill
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Software Engineering');
  const [newSkillReason, setNewSkillReason] = useState('');

  const token = localStorage.getItem('token') || 'admin-001';

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/skills?limit=100&q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setSkills(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/skills/admin/proposals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProposals(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'taxonomy') fetchSkills();
    if (activeTab === 'proposals') fetchProposals();
  }, [activeTab, search]);

  const handleApproveProposal = async (id: string) => {
    try {
      setStatus(null);
      const res = await fetch(`/api/v1/skills/admin/proposals/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Approval failed');
      setStatus({ success: `Skill "${data.skill?.name}" added to canonical taxonomy!` });
      fetchProposals();
    } catch (err: any) {
      setStatus({ error: err.message });
    }
  };

  const handleRejectProposal = async (id: string) => {
    try {
      setStatus(null);
      const res = await fetch(`/api/v1/skills/admin/proposals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Does not meet taxonomy inclusion criteria' }),
      });
      if (res.ok) {
        setStatus({ success: 'Proposal rejected.' });
        fetchProposals();
      }
    } catch (err: any) {
      setStatus({ error: err.message });
    }
  };

  const handleMergeSkills = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromSkillId || !toSkillId) return;
    try {
      setMerging(true);
      setStatus(null);
      const res = await fetch('/api/v1/skills/admin/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromSkillId,
          toSkillId,
          reason: mergeReason.trim() || 'Taxonomy canonical deduplication',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Merge failed');
      setStatus({ success: data.message });
      setFromSkillId('');
      setToSkillId('');
      setMergeReason('');
      fetchSkills();
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setMerging(false);
    }
  };

  const handleProposeSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/skills/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newSkillName,
          category: newSkillCategory,
          reason: newSkillReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');
      setStatus({ success: data.message });
      setShowProposeModal(false);
      setNewSkillName('');
      setNewSkillReason('');
      if (activeTab === 'proposals') fetchProposals();
    } catch (err: any) {
      setStatus({ error: err.message });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#282836] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Canonical Skill Taxonomy & Governance</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
              Taxonomy Authority
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Govern canonical engineering capabilities, review community proposals, and merge redundant skill synonyms.
          </p>
        </div>
        <button
          onClick={() => setShowProposeModal(true)}
          className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors shadow-md shadow-[#93B2F8]/20"
        >
          + Propose Skill
        </button>
      </div>

      {status?.error && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
          {status.error}
        </div>
      )}
      {status?.success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          {status.success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#282836] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('taxonomy')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'taxonomy'
              ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Canonical Skills Directory ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'proposals'
              ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Proposals Review Queue ({proposals.length})
        </button>
        <button
          onClick={() => setActiveTab('merge')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'merge'
              ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Skill Merge & Deduplication
        </button>
      </div>

      {/* Tab 1: Taxonomy Directory */}
      {activeTab === 'taxonomy' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search canonical taxonomy by skill or alias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1b1b22] text-xs text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {skills.map((s) => (
              <div key={s.id} className="p-4 bg-[#15151a] border border-[#282836] rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{s.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'active'
                        ? 'bg-emerald-950/60 text-emerald-300'
                        : s.status === 'merged'
                        ? 'bg-amber-950/60 text-amber-300'
                        : 'bg-rose-950/60 text-rose-300'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px]">{s.category}</p>
                {s.aliases && s.aliases.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {s.aliases.map((a: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[#1b1b22] border border-[#282836] text-[10px] text-zinc-300">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                {s.mergedIntoId && (
                  <p className="text-[10px] text-amber-400">
                    Merged into canonical: <span className="font-mono">{s.mergedIntoId}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Proposals Queue */}
      {activeTab === 'proposals' && (
        <div className="space-y-3">
          {proposals.map((p) => (
            <div key={p.id} className="p-4 bg-[#15151a] border border-[#282836] rounded-xl flex items-center justify-between text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">
                    {p.proposalCount} vote(s)
                  </span>
                  <span className="text-zinc-500 text-[11px]">Category: {p.category}</span>
                </div>
                {p.reason && <p className="text-zinc-400 text-[11px]">{p.reason}</p>}
                <p className="text-[10px] text-zinc-500">Proposed by: {p.proposedBy} on {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>

              {p.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveProposal(p.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectProposal(p.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs transition-colors"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-bold uppercase text-zinc-500">{p.status}</span>
              )}
            </div>
          ))}
          {proposals.length === 0 && (
            <div className="p-8 text-center text-zinc-500 text-xs bg-[#15151a] rounded-xl border border-[#282836]">
              No pending skill proposals in review queue.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Merge Skills */}
      {activeTab === 'merge' && (
        <div className="max-w-xl bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 text-xs">
          <div>
            <h2 className="text-sm font-bold text-white">Merge Duplicate Skill Into Canonical Target</h2>
            <p className="text-[11px] text-zinc-400 mt-1">
              Reassigns candidate UserSkill proficiencies, registers the old name as an alias, and preserves an auditable rollback record.
            </p>
          </div>

          <form onSubmit={handleMergeSkills} className="space-y-4">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Source Duplicate Skill (To be retired)</label>
              <select
                required
                value={fromSkillId}
                onChange={(e) => setFromSkillId(e.target.value)}
                className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8]"
              >
                <option value="">Select source skill...</option>
                {skills.filter((s) => s.status === 'active').map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Canonical Target Skill (Will absorb proficiencies)</label>
              <select
                required
                value={toSkillId}
                onChange={(e) => setToSkillId(e.target.value)}
                className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8]"
              >
                <option value="">Select target skill...</option>
                {skills.filter((s) => s.status === 'active' && s.id !== fromSkillId).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Reason for Merge</label>
              <input
                type="text"
                placeholder="e.g. Standardizing 'Node' into 'Node.js'"
                value={mergeReason}
                onChange={(e) => setMergeReason(e.target.value)}
                className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8]"
              />
            </div>

            <button
              type="submit"
              disabled={merging || !fromSkillId || !toSkillId}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-40 transition-colors shadow-md shadow-[#93B2F8]/20"
            >
              {merging ? 'Executing Merge Transaction...' : 'Execute Canonical Merge'}
            </button>
          </form>
        </div>
      )}

      {/* Propose Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <h2 className="text-base font-bold text-white">Propose New Skill to Taxonomy</h2>
              <button onClick={() => setShowProposeModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleProposeSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Temporal Workflow Engine"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                >
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Distributed Systems">Distributed Systems</option>
                  <option value="Machine Learning & AI">Machine Learning & AI</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Security & Cryptography">Security & Cryptography</option>
                  <option value="Frontend & UI Systems">Frontend & UI Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Inclusion Justification</label>
                <textarea
                  rows={3}
                  value={newSkillReason}
                  onChange={(e) => setNewSkillReason(e.target.value)}
                  placeholder="Why this capability represents an independent verifiable technical discipline..."
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowProposeModal(false)} className="px-4 py-2 text-zinc-400">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8]">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
