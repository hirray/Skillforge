import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components';
import { api } from '../ai/client';

export interface GitHubStatus {
  connected: boolean;
  username: string | null;
  scopes: string | null;
  lastSyncedAt: string | null;
}

export const GitHubConnectCard: React.FC<{ onStatusChange?: (status: GitHubStatus) => void }> = ({
  onStatusChange,
}) => {
  const [status, setStatus] = useState<GitHubStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api<{ data: GitHubStatus }>('/integrations/github/status');
      setStatus(res.data);
      if (onStatusChange) onStatusChange(res.data);
    } catch (err: any) {
      setStatus({ connected: false, username: null, scopes: null, lastSyncedAt: null });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleOpenConnect = async () => {
    setError(null);
    setShowConnectModal(true);
  };

  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;

    try {
      setActionLoading(true);
      setError(null);

      // Verify and link GitHub account
      const cleanUsername = githubUsername
        .trim()
        .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
        .replace(/^@/, '')
        .split('/')[0]
        .trim();
      const codePayload = accessToken.trim() ? `${cleanUsername}::${accessToken.trim()}` : cleanUsername;
      await api(`/integrations/github/callback?code=${encodeURIComponent(codePayload)}`);

      setShowConnectModal(false);
      setGithubUsername('');
      setAccessToken('');
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to connect GitHub account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await api('/integrations/github', { method: 'DELETE' });
      setShowDisconnectModal(false);
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect GitHub account');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-[#15151a] border border-[#282836] rounded-2xl animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1b1b22]" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-32 bg-[#1b1b22] rounded" />
            <div className="h-3 w-48 bg-[#1b1b22] rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[#15151a] border border-[#282836] rounded-2xl shadow-lg relative overflow-hidden transition-all duration-200">
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#0A1680]/10 rounded-full blur-3xl pointer-events-none" />

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center shrink-0 shadow-inner">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="#93B2F8">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">GitHub Integration</h3>
              {status?.connected ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  Connected
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Not Connected
                </span>
              )}
            </div>

            {status?.connected ? (
              <div>
                <p className="text-xs text-zinc-400 mt-1">
                  Linked GitHub account:{' '}
                  <strong className="text-[#93B2F8]">
                    @{status.username?.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split('/')[0]}
                  </strong>
                  {status.lastSyncedAt && (
                    <span className="ml-2 text-zinc-500">
                      • Active since {new Date(status.lastSyncedAt).toLocaleDateString()}
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Identity linked. Select a target project below to link specific repositories and track verified proof.
                </p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                Link your GitHub account or handle to ingest live commits, pull requests, and code reviews as verified evidence for your projects.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {status?.connected ? (
            <button
              onClick={() => setShowDisconnectModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-500/30 transition-all duration-150"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={handleOpenConnect}
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] shadow-md shadow-[#93B2F8]/20 transition-all duration-150 flex items-center gap-2"
            >
              {actionLoading ? 'Connecting...' : 'Connect GitHub'}
            </button>
          )}
        </div>
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836] mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#93B2F8">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Connect GitHub Account</span>
              </h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Enter your GitHub handle to link your identity for commit attribution, or provide a Personal Access Token to sync private activity.
            </p>

            <form onSubmit={handleSubmitConnect} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  GitHub Username / Handle *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-zinc-500 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. torvalds, octocat or your GitHub username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Personal Access Token (Optional)
                </label>
                <input
                  type="password"
                  placeholder="ghp_... (Optional, for private repos or 5000 req/hr)"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Public repositories can be synced without a token. Tokens are encrypted using AES-256-GCM.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
                >
                  {actionLoading ? 'Connecting...' : 'Authorize & Connect'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disconnect confirmation modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Disconnect GitHub Account?</h3>
            <p className="text-xs text-zinc-300 leading-relaxed mb-6">
              Revoking integration will stop background repository syncing immediately. Historical contribution
              events already recorded will remain preserved in your project history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-900/30"
              >
                {actionLoading ? 'Revoking...' : 'Confirm Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
