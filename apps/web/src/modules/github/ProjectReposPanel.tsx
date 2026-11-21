import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components';
import { api } from '../ai/client';

export interface ProjectRepoItem {
  id: string;
  projectId: string;
  owner: string;
  name: string;
  githubRepoId?: string | null;
  lastSyncedAt?: string | null;
  status: string;
  eventsCount?: number;
  recentEvents?: Array<{
    id: string;
    type: string;
    detail: string;
    externalLogin?: string;
    referenceUrl?: string;
    occurredAt: string;
  }>;
}

export interface AvailableUserRepo {
  name: string;
  fullName: string;
  owner: string;
  description?: string | null;
  stars?: number;
  language?: string | null;
  isPrivate?: boolean;
  updatedAt?: string;
  htmlUrl?: string;
}

export const ProjectReposPanel: React.FC<{ projectId: string; isOwner?: boolean }> = ({
  projectId,
  isOwner = true,
}) => {
  const [repos, setRepos] = useState<ProjectRepoItem[]>([]);
  const [availableUserRepos, setAvailableUserRepos] = useState<AvailableUserRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingRepoId, setSyncingRepoId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ownerInput, setOwnerInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api<{ data: ProjectRepoItem[] }>(`/projects/${projectId}/repos`);
      setRepos(res.data || []);
    } catch (err: any) {
      console.warn('Could not load project repos:', err);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUserRepos = async () => {
    try {
      const res = await api<{ data: AvailableUserRepo[] }>('/integrations/github/user-repos');
      setAvailableUserRepos(res.data || []);
    } catch {
      setAvailableUserRepos([]);
    }
  };

  useEffect(() => {
    fetchRepos();
    fetchAvailableUserRepos();
  }, [projectId]);

  const handleQuickLink = async (owner: string, name: string) => {
    try {
      setSubmitting(true);
      setError(null);
      await api(`/projects/${projectId}/repos`, {
        method: 'POST',
        body: JSON.stringify({ owner, name }),
      });
      await fetchRepos();
    } catch (err: any) {
      setError(err.message || 'Failed to link repository');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLinkRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerInput.trim() || !nameInput.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await api(`/projects/${projectId}/repos`, {
        method: 'POST',
        body: JSON.stringify({
          owner: ownerInput.trim(),
          name: nameInput.trim(),
        }),
      });
      setShowAddModal(false);
      setOwnerInput('');
      setNameInput('');
      await fetchRepos();
    } catch (err: any) {
      setError(err.message || 'Failed to link repository');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncNow = async (repoId: string) => {
    try {
      setSyncingRepoId(repoId);
      await api(`/projects/${projectId}/repos/${repoId}/sync`, {
        method: 'POST',
      });
      // Brief pause to simulate background sync ingestion completion
      setTimeout(async () => {
        await fetchRepos();
        setSyncingRepoId(null);
      }, 1200);
    } catch (err: any) {
      console.error(err);
      setSyncingRepoId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Linked Repositories</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
              {repos.length}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ingest commits, PRs, and reviews into documented project evidence.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchRepos();
              fetchAvailableUserRepos();
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1b1b22] hover:bg-[#282836] border border-[#282836] transition-all flex items-center gap-1.5"
            title="Refresh repositories"
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? 'animate-spin text-[#93B2F8]' : ''}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>

          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all duration-150 flex items-center gap-1.5 shadow-md shadow-[#93B2F8]/10"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              <span>Link Repository</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Available Repositories from Connected GitHub Account */}
      {availableUserRepos.length > 0 && (
        <div className="p-4 rounded-xl bg-[#1b1b22]/70 border border-[#282836]">
          <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#93B2F8">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Available Repositories from Your GitHub (@{availableUserRepos[0]?.owner})</span>
            </div>
            <span className="text-[11px] text-zinc-400">One-click link to project</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {availableUserRepos.map((r) => {
              const isAlreadyLinked = repos.some(
                (rp) =>
                  rp.owner.toLowerCase() === r.owner.toLowerCase() &&
                  rp.name.toLowerCase() === r.name.toLowerCase()
              );
              return (
                <div
                  key={r.fullName}
                  className="p-3 rounded-xl bg-[#15151a] border border-[#282836] flex flex-col justify-between gap-2 hover:border-[#93B2F8]/30 transition-all"
                >
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{r.name}</span>
                      {r.isPrivate && (
                        <span className="text-[10px] px-1 py-0.2 bg-zinc-800 text-zinc-400 rounded">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {r.description || (r.language ? `Stack: ${r.language}` : 'GitHub repository')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#282836]/60">
                    <span className="text-[10px] text-zinc-500">
                      {r.language || 'Code'} • ★ {r.stars || 0}
                    </span>
                    {isAlreadyLinked ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30">
                        Linked ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQuickLink(r.owner, r.name)}
                        disabled={submitting}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-sm"
                      >
                        + Link to Project
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="p-5 bg-[#15151a] border border-[#282836] rounded-2xl animate-pulse">
              <div className="h-4 w-40 bg-[#1b1b22] rounded mb-2" />
              <div className="h-3 w-64 bg-[#1b1b22] rounded" />
            </Card>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <Card className="p-8 bg-[#15151a] border border-[#282836] rounded-2xl text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center mb-3 text-zinc-400">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-white mb-1">No Repositories Linked Yet</h4>
          <p className="text-xs text-zinc-400 max-w-sm mb-4 leading-relaxed">
            Link a GitHub repository to track pull requests, code reviews, and commit activity automatically.
          </p>
          {isOwner && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0A1680] hover:bg-[#1223b5] border border-[#93B2F8]/30 transition-all shadow-md"
            >
              + Link First Repository
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {repos.map((repo) => {
            const isSyncing = syncingRepoId === repo.id || repo.status === 'syncing';
            return (
              <Card
                key={repo.id}
                className="p-5 bg-[#15151a] border border-[#282836] hover:border-[#93B2F8]/40 rounded-2xl transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="#93B2F8">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {repo.owner} / <strong className="text-[#93B2F8]">{repo.name}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                          {repo.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span>
                          Events ingested: <strong className="text-zinc-200">{repo.eventsCount || 0}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Last synced:{' '}
                          <span className="text-zinc-300">
                            {repo.lastSyncedAt
                              ? new Date(repo.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Pending initial sync'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleSyncNow(repo.id)}
                      disabled={isSyncing}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1b1b22] hover:bg-[#282836] border border-[#282836] transition-all flex items-center gap-1.5"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="13"
                        height="13"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={isSyncing ? 'animate-spin text-[#93B2F8]' : ''}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>{isSyncing ? 'Syncing...' : 'Sync now'}</span>
                    </button>
                  </div>
                </div>

                {/* Recent events strip */}
                {repo.recentEvents && repo.recentEvents.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#282836]/60 space-y-1.5">
                    <div className="text-[11px] font-semibold text-zinc-400">Recent Ingested Activity:</div>
                    {repo.recentEvents.map((ev) => (
                      <div key={ev.id} className="text-xs text-zinc-300 flex items-center justify-between gap-2 py-0.5">
                        <div className="flex items-center gap-2 truncate">
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
                            {ev.type}
                          </span>
                          <span className="truncate">{ev.detail}</span>
                        </div>
                        {ev.referenceUrl && (
                          <a
                            href={ev.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#93B2F8] hover:underline shrink-0"
                          >
                            view →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Link Repository Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Link GitHub Repository</h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Connect a repository owned by you or an organization to sync project contributions.
            </p>

            <form onSubmit={handleLinkRepo} className="space-y-4">
              {availableUserRepos.length > 0 && (
                <div className="p-3 rounded-xl bg-[#1b1b22] border border-[#282836]">
                  <label className="block text-xs font-semibold text-[#93B2F8] mb-1.5">
                    Select from your GitHub Repositories:
                  </label>
                  <select
                    aria-label="Select from your GitHub Repositories"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const [o, n] = val.split('/');
                        setOwnerInput(o);
                        setNameInput(n);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#15151a] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                  >
                    <option value="">-- Choose a repository --</option>
                    {availableUserRepos.map((r) => (
                      <option key={r.fullName} value={`${r.owner}/${r.name}`}>
                        {r.name} {r.language ? `(${r.language})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Owner / Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. facebook or octocat"
                  value={ownerInput}
                  onChange={(e) => setOwnerInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Repository Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. react or skillforge"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
                >
                  {submitting ? 'Linking...' : 'Link Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
