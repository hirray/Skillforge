import React, { useState, useEffect } from 'react';

interface ContributionEvent {
  id: string;
  userId: string;
  projectId: string;
  detail: string;
  type: string;
  source: string;
  externalId?: string | null;
  externalLogin?: string | null;
  referenceUrl?: string | null;
  occurredAt: string;
  metadataJson?: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    roles?: string;
  };
  disputes?: Array<{
    id: string;
    raisedBy: string;
    reason: string;
    status: string;
  }>;
  adjustments?: Array<{
    id: string;
    actorId: string;
    action: string;
    reason: string;
    after: string;
  }>;
}

interface ProfileData {
  projectId: string;
  userId: string;
  narrativeSummary: string;
  roles: string[];
  evidenceBreakdown: {
    commits: number;
    pullRequests: number;
    codeReviews: number;
    tasksCompleted: number;
    manualNotes: number;
  };
  events: ContributionEvent[];
}

interface ContributionsTabProps {
  projectId: string;
  isOwner?: boolean;
}

export const ContributionsTab: React.FC<ContributionsTabProps> = ({ projectId, isOwner = true }) => {
  const [events, setEvents] = useState<ContributionEvent[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualDetail, setManualDetail] = useState('');
  const [manualJustification, setManualJustification] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualTargetUser, setManualTargetUser] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  const [disputingEvent, setDisputingEvent] = useState<ContributionEvent | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'owner_resolved' | 'escalated' | 'closed'>('owner_resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [submittingResolution, setSubmittingResolution] = useState(false);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/projects/${projectId}/contributions`);
      if (!res.ok) throw new Error('Failed to load project contribution ledger');
      const data = await res.json();
      setEvents(data.contributions || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching contributions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/contributions/${userId}`);
      if (!res.ok) throw new Error('Failed to load contribution profile');
      const data = await res.json();
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching member profile:', err);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [projectId]);

  useEffect(() => {
    if (selectedUserId !== 'all') {
      fetchUserProfile(selectedUserId);
    } else {
      setProfile(null);
    }
  }, [selectedUserId, projectId]);

  // Unique contributors
  const contributors = Array.from(
    new Map(
      events
        .filter((e) => e.userId)
        .map((e) => [
          e.userId,
          {
            userId: e.userId,
            email: e.user?.email || e.externalLogin || e.userId,
          },
        ])
    ).values()
  );

  const handleCreateManualNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDetail.trim() || !manualJustification.trim()) return;

    try {
      setSubmittingManual(true);
      const res = await fetch(`/api/v1/projects/${projectId}/contributions/manual-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detail: manualDetail,
          justification: manualJustification,
          referenceUrl: manualUrl || undefined,
          targetUserId: manualTargetUser || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to record manual contribution note');
      }

      setShowManualModal(false);
      setManualDetail('');
      setManualJustification('');
      setManualUrl('');
      await fetchContributions();
      if (selectedUserId !== 'all') await fetchUserProfile(selectedUserId);
    } catch (err: any) {
      alert(err.message || 'Could not record manual note');
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputingEvent || !disputeReason.trim()) return;

    try {
      setSubmittingDispute(true);
      const res = await fetch(`/api/v1/contributions/${disputingEvent.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: disputeReason }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to submit dispute');
      }

      setDisputingEvent(null);
      setDisputeReason('');
      await fetchContributions();
      if (selectedUserId !== 'all') await fetchUserProfile(selectedUserId);
    } catch (err: any) {
      alert(err.message || 'Could not submit dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    try {
      setSubmittingResolution(true);
      const res = await fetch(`/api/v1/contributions/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: resolutionAction,
          note: resolutionNote || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update dispute');
      }

      setResolvingDisputeId(null);
      setResolutionNote('');
      await fetchContributions();
      if (selectedUserId !== 'all') await fetchUserProfile(selectedUserId);
    } catch (err: any) {
      alert(err.message || 'Could not resolve dispute');
    } finally {
      setSubmittingResolution(false);
    }
  };

  // Filtered ledger events
  const displayedEvents = events.filter((ev) => {
    const matchesUser = selectedUserId === 'all' || ev.userId === selectedUserId;
    const matchesType =
      filterType === 'all' ||
      (filterType === 'github' && (ev.source === 'github' || ['commit', 'pr', 'review'].includes(ev.type))) ||
      (filterType === 'tasks' && (ev.source === 'task' || ev.type === 'task')) ||
      (filterType === 'manual' && (ev.source === 'manual' || ev.type === 'manual'));
    return matchesUser && matchesType;
  });

  const getSourceIcon = (type: string, source: string) => {
    if (source === 'github' || type === 'commit') {
      return (
        <div className="w-7 h-7 rounded-lg bg-[#0A1680]/40 border border-[#93B2F8]/30 flex items-center justify-center text-[#93B2F8] shrink-0">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </div>
      );
    }
    if (type === 'pr') {
      return (
        <div className="w-7 h-7 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path fillRule="evenodd" d="M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.251 2.251 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v4.75a2.25 2.25 0 101.5 0V5A2.5 2.5 0 0011 2.5z" />
          </svg>
        </div>
      );
    }
    if (type === 'task') {
      return (
        <div className="w-7 h-7 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
          </svg>
        </div>
      );
    }
    if (source === 'manual') {
      return (
        <div className="w-7 h-7 rounded-lg bg-[#F1B94C]/15 border border-[#F1B94C]/40 flex items-center justify-center text-[#F1B94C] shrink-0">
          <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
            <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25a1.75 1.75 0 01.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM10.104 4.457L2.997 11.564a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.249.249 0 00.108-.064l7.107-7.107-1.439-1.44z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
        <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
          <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          <path fillRule="evenodd" d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z" />
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0A1680]/70 text-[#93B2F8] border border-[#93B2F8]/30">
              Audit-Ready Proof
            </span>
            <span className="text-xs text-zinc-400">• Append-Only Ledger</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Documented Contribution Tracking</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Source-attributed evidence of recorded project activity. Traces verified GitHub commits, pull requests,
            reviews, completed tasks, and owner-attested offline deliverables without measuring effort or hours.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchContributions}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1b1b22] hover:bg-[#282836] border border-[#282836] transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 01.908-.417A6 6 0 118 2v1z" />
            </svg>
            Refresh
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/15 flex items-center gap-1.5"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
              </svg>
              + Add Manual Note
            </button>
          )}
        </div>
      </div>

      {/* Member Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedUserId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
            selectedUserId === 'all'
              ? 'bg-[#93B2F8] text-[#0A1680] font-bold shadow-md shadow-[#93B2F8]/20'
              : 'bg-[#1b1b22] text-zinc-300 hover:text-white border border-[#282836]'
          }`}
        >
          <span>All Team Activity</span>
          <span className="text-[10px] opacity-75">({events.length})</span>
        </button>

        {contributors.map((c) => {
          const userEventCount = events.filter((e) => e.userId === c.userId).length;
          return (
            <button
              key={c.userId}
              type="button"
              onClick={() => setSelectedUserId(c.userId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-2 ${
                selectedUserId === c.userId
                  ? 'bg-[#93B2F8] text-[#0A1680] font-bold shadow-md shadow-[#93B2F8]/20'
                  : 'bg-[#1b1b22] text-zinc-300 hover:text-white border border-[#282836]'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-[#0A1680] text-[#93B2F8] text-[9px] flex items-center justify-center font-bold">
                {c.email[0].toUpperCase()}
              </span>
              <span>{c.email.split('@')[0]}</span>
              <span className="text-[10px] opacity-70">({userEventCount})</span>
            </button>
          );
        })}
      </div>

      {/* Narrative Profile Card (When member selected) */}
      {selectedUserId !== 'all' && profile && (
        <div className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-lg animate-fade-in space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#282836]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0A1680] border border-[#93B2F8]/40 flex items-center justify-center text-sm font-bold text-[#93B2F8]">
                {(contributors.find((c) => c.userId === selectedUserId)?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {contributors.find((c) => c.userId === selectedUserId)?.email.split('@')[0]}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {profile.roles.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]"
                    >
                      {r}
                    </span>
                  ))}
                  <span className="text-[11px] text-zinc-500">Documented Member Profile</span>
                </div>
              </div>
            </div>

            {/* Evidence Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
                {profile.evidenceBreakdown.commits} Commits
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1b1b22] text-emerald-400 border border-[#282836]">
                {profile.evidenceBreakdown.pullRequests} PRs
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1b1b22] text-blue-400 border border-[#282836]">
                {profile.evidenceBreakdown.tasksCompleted} Tasks
              </span>
              {profile.evidenceBreakdown.manualNotes > 0 && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1b1b22] text-[#F1B94C] border border-[#282836]">
                  {profile.evidenceBreakdown.manualNotes} Manual Notes
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1b1b22]/70 border border-[#282836]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#93B2F8] mb-1">
              Recorded Narrative Summary
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{profile.narrativeSummary}</p>
          </div>
        </div>
      )}

      {/* Activity Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1b1b22] border border-[#282836]">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'github', label: 'GitHub Activity' },
            { id: 'tasks', label: 'Tasks & Milestones' },
            { id: 'manual', label: 'Attested Notes' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === f.id ? 'bg-[#282836] text-white font-semibold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500">{displayedEvents.length} documented records</span>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchContributions} className="underline font-semibold ml-2">
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 rounded-xl bg-[#15151a] border border-[#282836] animate-pulse h-20" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayedEvents.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-[#15151a] border border-[#282836] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1b1b22] border border-[#282836] mx-auto flex items-center justify-center text-[#93B2F8]">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-white">No Documented Contributions Found</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Link a GitHub repository to automatically ingest commits and PRs, or record an attested manual note for
            offline work.
          </p>
          {isOwner && (
            <button
              onClick={() => setShowManualModal(true)}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all inline-block"
            >
              + Record First Manual Evidence
            </button>
          )}
        </div>
      )}

      {/* Ledger Feed */}
      {!loading && displayedEvents.length > 0 && (
        <div className="space-y-2.5">
          {displayedEvents.map((ev) => {
            const hasDisputes = ev.disputes && ev.disputes.length > 0;
            const openDispute = ev.disputes?.find((d) => d.status === 'open');
            const hasAdjustments = ev.adjustments && ev.adjustments.length > 0;

            let metaObj: any = {};
            try {
              metaObj = ev.metadataJson ? JSON.parse(ev.metadataJson) : {};
            } catch {}

            return (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-[#15151a] hover:bg-[#181822] border border-[#282836] transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {getSourceIcon(ev.type, ev.source)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[11px] font-semibold text-zinc-300">
                        {ev.user?.email ? ev.user.email.split('@')[0] : ev.externalLogin || 'Contributor'}
                      </span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-[11px] font-medium text-zinc-400">
                        {new Date(ev.occurredAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
                        {ev.type}
                      </span>
                      {ev.source === 'manual' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#F1B94C]/15 text-[#F1B94C] border border-[#F1B94C]/30">
                          Attested Manual
                        </span>
                      )}
                      {openDispute && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-500/30">
                          Under Dispute
                        </span>
                      )}
                      {hasAdjustments && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-500/30">
                          Adjusted
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white font-medium leading-relaxed break-words">{ev.detail}</p>

                    {metaObj.justification && (
                      <div className="mt-1.5 p-2 rounded-lg bg-[#1b1b22] border border-[#282836] text-[11px] text-zinc-300">
                        <span className="text-[#F1B94C] font-semibold">Attestation Justification: </span>
                        {metaObj.justification}
                      </div>
                    )}

                    {hasDisputes &&
                      ev.disputes!.map((d) => (
                        <div
                          key={d.id}
                          className="mt-1.5 p-2 rounded-lg bg-red-950/25 border border-red-500/20 text-[11px] text-red-200 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-semibold text-red-300">Flagged: </span>
                            {d.reason} <span className="opacity-70">({d.status})</span>
                          </div>
                          {isOwner && d.status === 'open' && (
                            <button
                              onClick={() => setResolvingDisputeId(d.id)}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#93B2F8] text-[#0A1680] shrink-0"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {ev.referenceUrl && (
                    <a
                      href={ev.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#93B2F8] hover:text-[#b0c7fa] bg-[#1b1b22] border border-[#282836] transition-all flex items-center gap-1"
                    >
                      <span>Proof</span>
                      <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                        <path fillRule="evenodd" d="M10.604 1h-4.104a.5.5 0 000 1h2.896L3.146 8.247a.5.5 0 00.708.708L10.104 2.707v2.897a.5.5 0 001 0V1.5a.5.5 0 00-.5-.5z" />
                      </svg>
                    </a>
                  )}

                  {!openDispute && (
                    <button
                      type="button"
                      onClick={() => setDisputingEvent(ev)}
                      className="px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-red-300 bg-transparent hover:bg-[#1b1b22] transition-all"
                      title="Flag or dispute this entry"
                    >
                      Flag
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Note Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Attested Manual Note</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Record verified offline work (e.g. system design meetings, architecture docs, whiteboards). Manual notes
              require an explicit justification and are flagged as attested.
            </p>

            <form onSubmit={handleCreateManualNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target Member</label>
                <select
                  value={manualTargetUser}
                  onChange={(e) => setManualTargetUser(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                >
                  <option value="">Myself (Owner)</option>
                  {contributors.map((c) => (
                    <option key={c.userId} value={c.userId}>
                      {c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Contribution Detail *</label>
                <textarea
                  required
                  rows={2}
                  value={manualDetail}
                  onChange={(e) => setManualDetail(e.target.value)}
                  placeholder="e.g. Led systems design workshop and drafted multi-region failover strategy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Attestation Justification *
                </label>
                <textarea
                  required
                  rows={2}
                  value={manualJustification}
                  onChange={(e) => setManualJustification(e.target.value)}
                  placeholder="Provide concrete context of how this deliverable was verified and approved"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Reference Document URL (Optional)</label>
                <input
                  type="url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://docs.google.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 disabled:opacity-50"
                >
                  {submittingManual ? 'Saving...' : 'Record Attested Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag / Dispute Modal */}
      {disputingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Flag Documented Entry</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              If this recorded contribution is inaccurate, misattributed, or represents uncredited joint work, raise a
              dispute for review.
            </p>

            <div className="p-3 rounded-xl bg-[#1b1b22] border border-[#282836] text-xs text-zinc-300 mb-4">
              <span className="font-semibold text-white">Target Entry: </span>
              {disputingEvent.detail}
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Reason for Dispute *</label>
                <textarea
                  required
                  rows={3}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Detail why this entry needs review or attribution adjustment..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputingEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal (Owner) */}
      {resolvingDisputeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Resolve Contribution Dispute</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              As project lead, resolve this dispute directly or escalate to platform moderation. All adjustments are
              append-only.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Resolution Action</label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                >
                  <option value="owner_resolved">Resolve and Clarify Attribution</option>
                  <option value="escalated">Escalate to Platform Moderation Report</option>
                  <option value="closed">Dismiss / Close Dispute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Resolution Note</label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explain the resolution terms or findings..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingDisputeId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingResolution}
                  onClick={() => handleResolveDispute(resolvingDisputeId)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 disabled:opacity-50"
                >
                  {submittingResolution ? 'Updating...' : 'Apply Resolution'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
