import { useState, useEffect } from 'react';
import { api, token } from '../ai/client';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingReports: number;
  pendingVerifications: number;
  activeHolds: number;
  certificates: { valid: number; revoked: number };
}

interface ReportItem {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  reason: string;
  reporterId: string;
  status: 'pending' | 'open' | 'resolved' | 'dismissed' | 'escalated';
  actionTaken?: string | null;
  notes?: string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  reporter?: { id: string; name: string; email: string } | null;
}

interface VerificationItem {
  id: string;
  projectId: string;
  projectTitle: string;
  category: string;
  stage: string;
  status: string;
  confidenceScore: number;
  isLowConfidence: boolean;
  discrepancies: string[];
  notes?: string | null;
  createdAt: string;
  metrics: { members: number; tasks: number; milestones: number };
}

interface ProjectHoldItem {
  id: string;
  projectId: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  releasedAt?: string | null;
  releasedBy?: string | null;
  isActive: boolean;
  project?: { id: string; title: string; ownerId: string; status: string } | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  roles: string[];
  status: string;
  suspensionReason?: string | null;
  emailVerified: boolean;
  createdAt: string;
  counts: { skills: number; projectsOwned: number; memberships: number; certifications: number };
}

interface CertificateItem {
  id: string;
  certNumber: string;
  recipientName: string;
  projectName: string;
  status: string;
  revokedReason?: string | null;
  revokedAt?: string | null;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  actorId?: string | null;
  actor?: { id: string; name: string; email: string } | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  reason?: string | null;
  metadata?: any;
  createdAt: string;
}

export function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'verification' | 'holds' | 'users' | 'certificates' | 'audit'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Data states
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [reportsFilter, setReportsFilter] = useState<string>('all');
  const [verificationQueue, setVerificationQueue] = useState<VerificationItem[]>([]);
  const [holds, setHolds] = useState<ProjectHoldItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [certSearch, setCertSearch] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  // Modal / Action states
  const [activeActionModal, setActiveActionModal] = useState<{
    type: 'resolveReport' | 'suspendUser' | 'restoreUser' | 'verifyApprove' | 'verifyReject' | 'placeHold' | 'releaseHold' | 'revokeCert';
    id: string;
    targetName?: string;
  } | null>(null);

  const [modalReason, setModalReason] = useState('');
  const [modalActionTaken, setModalActionTaken] = useState('warned');
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserId = token() || 'admin-001';

  const fetchStats = async () => {
    try {
      const res = await api<{ success: boolean; data: AdminStats }>('/admin/stats');
      if (res.data) setStats(res.data);
    } catch (e: any) {
      console.warn('Could not load stats:', e);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api<{ success: boolean; data: ReportItem[] }>('/admin/reports');
      if (res.data) setReports(res.data);
    } catch (e: any) {
      console.warn('Could not load reports:', e);
    }
  };

  const fetchVerificationQueue = async () => {
    try {
      const res = await api<{ success: boolean; data: VerificationItem[] }>('/admin/verification-queue');
      if (res.data) setVerificationQueue(res.data);
    } catch (e: any) {
      console.warn('Could not load verification queue:', e);
    }
  };

  const fetchHolds = async () => {
    try {
      const res = await api<{ success: boolean; data: ProjectHoldItem[] }>('/admin/holds');
      if (res.data) setHolds(res.data);
    } catch (e: any) {
      console.warn('Could not load holds:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api<{ success: boolean; data: { items: UserItem[] } }>('/admin/users');
      if (res.data?.items) setUsers(res.data.items);
    } catch (e: any) {
      console.warn('Could not load users:', e);
    }
  };

  const fetchCertificates = async () => {
    try {
      const res = await api<{ success: boolean; data: CertificateItem[] }>('/admin/certificates');
      if (res.data) setCertificates(res.data);
    } catch (e: any) {
      console.warn('Could not load certificates:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api<{ success: boolean; data: AuditLogItem[] }>('/admin/audit-logs');
      if (res.data) setAuditLogs(res.data);
    } catch (e: any) {
      console.warn('Could not load audit logs:', e);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchReports(),
        fetchVerificationQueue(),
        fetchHolds(),
        fetchUsers(),
        fetchCertificates(),
        fetchAuditLogs(),
      ]);
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to administrative console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleExecuteModalAction = async () => {
    if (!activeActionModal) return;
    setActionLoading(true);
    setError(null);

    try {
      const { type, id } = activeActionModal;

      if (type === 'resolveReport') {
        await api(`/admin/reports/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'resolved',
            actionTaken: modalActionTaken,
            notes: modalReason,
          }),
        });
        setSuccessNotice('Report successfully marked resolved and action logged to immutable audit trail.');
        await fetchReports();
      } else if (type === 'suspendUser') {
        if (!modalReason.trim()) {
          setError('Mandatory suspension reason required for compliance audit.');
          setActionLoading(false);
          return;
        }
        await api(`/admin/users/${id}/suspend`, {
          method: 'POST',
          body: JSON.stringify({ reason: modalReason }),
        });
        setSuccessNotice('User account suspended and active sessions terminated.');
        await fetchUsers();
      } else if (type === 'restoreUser') {
        await api(`/admin/users/${id}/restore`, {
          method: 'POST',
          body: JSON.stringify({ reason: modalReason || 'Restored by administrator' }),
        });
        setSuccessNotice('User account restored to active standing.');
        await fetchUsers();
      } else if (type === 'verifyApprove') {
        await api(`/admin/verification-queue/${id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ notes: modalReason || 'Approved by administrator' }),
        });
        setSuccessNotice('Project verified and marked completed on-platform.');
        await fetchVerificationQueue();
      } else if (type === 'verifyReject') {
        if (!modalReason.trim()) {
          setError('Mandatory rejection reason required.');
          setActionLoading(false);
          return;
        }
        await api(`/admin/verification-queue/${id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason: modalReason }),
        });
        setSuccessNotice('Project verification rejected and reason dispatched.');
        await fetchVerificationQueue();
      } else if (type === 'placeHold') {
        if (!modalReason.trim()) {
          setError('Reason for placing project hold is required.');
          setActionLoading(false);
          return;
        }
        await api(`/admin/projects/${id}/hold`, {
          method: 'POST',
          body: JSON.stringify({ reason: modalReason }),
        });
        setSuccessNotice('Project placed on administrative hold. Verification & completion blocked.');
        await fetchHolds();
      } else if (type === 'releaseHold') {
        await api(`/admin/projects/${id}/hold`, {
          method: 'DELETE',
          body: JSON.stringify({ reason: modalReason || 'Hold cleared by moderator' }),
        });
        setSuccessNotice('Project hold released.');
        await fetchHolds();
      } else if (type === 'revokeCert') {
        if (!modalReason.trim()) {
          setError('Reason for certificate revocation is required.');
          setActionLoading(false);
          return;
        }
        await api(`/admin/certificates/${id}/revoke`, {
          method: 'POST',
          body: JSON.stringify({ reason: modalReason }),
        });
        setSuccessNotice('Certificate permanently revoked. Public verification will show revoked badge.');
        await fetchCertificates();
      }

      await fetchStats();
      await fetchAuditLogs();
      setActiveActionModal(null);
      setModalReason('');
    } catch (err: any) {
      if (err?.status === 409) {
        setError('409 Conflict: Another moderator has already resolved or updated this item. Your queue has been refreshed.');
        await fetchReports();
      } else {
        setError(err?.message || 'Administrative action could not be completed.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (reportsFilter === 'all') return true;
    return r.status === reportsFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const term = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.roles?.some((r) => r.toLowerCase().includes(term))
    );
  });

  const filteredCertificates = certificates.filter((c) => {
    if (!certSearch) return true;
    const term = certSearch.toLowerCase();
    return (
      c.certNumber?.toLowerCase().includes(term) ||
      c.recipientName?.toLowerCase().includes(term) ||
      c.projectName?.toLowerCase().includes(term)
    );
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (!auditSearch) return true;
    const term = auditSearch.toLowerCase();
    return (
      l.action?.toLowerCase().includes(term) ||
      l.targetType?.toLowerCase().includes(term) ||
      l.reason?.toLowerCase().includes(term) ||
      l.actor?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-[#FCFDFF] px-4 py-8 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-[#FCFDFF]">Platform Trust & Administrative Console</h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#0A1680] text-[#93B2F8] border border-[#1E293B]">
              PRD Area 32 & 33
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Real-time auditable governance: user management, content moderation, project verifications, holds, and signed certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadAll()}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-[#111827] border border-[#1E293B] hover:bg-[#1E293B] transition-colors flex items-center gap-2"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh System State
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successNotice && (
        <div className="p-4 rounded-lg bg-[#064E3B]/40 border border-[#059669] text-[#A7F3D0] text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice(null)} className="text-xs hover:text-white">&times;</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-[#7F1D1D]/40 border border-[#DC2626] text-[#FCA5A5] text-sm flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs hover:text-white">&times;</button>
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium">Pending Reports</div>
          <div className="text-3xl font-bold mt-2 text-[#FCFDFF] flex items-baseline gap-2">
            {stats?.pendingReports ?? 0}
            <span className="text-xs text-[#F1B94C] font-normal">Active review</span>
          </div>
          <div className="absolute right-3 top-3 opacity-10">
            <svg className="w-12 h-12 text-[#F1B94C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium">Verification Queue</div>
          <div className="text-3xl font-bold mt-2 text-[#93B2F8] flex items-baseline gap-2">
            {stats?.pendingVerifications ?? 0}
            <span className="text-xs text-[#94A3B8] font-normal">Projects waiting</span>
          </div>
          <div className="absolute right-3 top-3 opacity-10">
            <svg className="w-12 h-12 text-[#93B2F8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium">Active Moderation Holds</div>
          <div className="text-3xl font-bold mt-2 text-[#FBEDB0] flex items-baseline gap-2">
            {stats?.activeHolds ?? 0}
            <span className="text-xs text-[#94A3B8] font-normal">Delivery blocked</span>
          </div>
          <div className="absolute right-3 top-3 opacity-10">
            <svg className="w-12 h-12 text-[#FBEDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0D1527] border border-[#1E293B] relative overflow-hidden">
          <div className="text-xs uppercase tracking-wider text-[#94A3B8] font-medium">Suspended Accounts</div>
          <div className="text-3xl font-bold mt-2 text-[#EF4444] flex items-baseline gap-2">
            {stats?.suspendedUsers ?? 0}
            <span className="text-xs text-[#94A3B8] font-normal">of {stats?.totalUsers ?? 0} users</span>
          </div>
          <div className="absolute right-3 top-3 opacity-10">
            <svg className="w-12 h-12 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Tabbed Interface */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-2xl overflow-hidden shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1E293B] bg-[#090D1A] overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Executive Dashboard', badge: null },
            { id: 'reports', label: 'Reports Queue', badge: reports.filter((r) => r.status === 'pending').length },
            { id: 'verification', label: 'Verification Queue', badge: verificationQueue.filter((v) => v.status === 'pending').length },
            { id: 'holds', label: 'Project Holds', badge: holds.filter((h) => h.isActive).length },
            { id: 'users', label: 'User Governance', badge: users.filter((u) => u.status === 'suspended').length },
            { id: 'certificates', label: 'Certificates & Revocation', badge: null },
            { id: 'audit', label: 'Immutable Audit Trail', badge: auditLogs.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[#93B2F8] text-[#FCFDFF] bg-[#0E1626]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#FCFDFF] hover:bg-[#0E1626]/50'
              }`}
            >
              {tab.label}
              {tab.badge !== null && tab.badge > 0 && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  activeTab === tab.id ? 'bg-[#93B2F8] text-[#0A1680]' : 'bg-[#1E293B] text-[#93B2F8]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Container */}
        <div className="p-6">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-xl bg-[#090E1D] border border-[#1E293B] space-y-4">
                  <h3 className="text-sm font-semibold text-[#FCFDFF] flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#93B2F8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Platform Health & Moderation Integrity
                  </h3>
                  <div className="space-y-3 text-xs text-[#94A3B8]">
                    <div className="flex justify-between py-2 border-b border-[#1E293B]">
                      <span>Active Verified Accounts</span>
                      <span className="font-semibold text-[#FCFDFF]">{stats?.activeUsers ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1E293B]">
                      <span>Accounts Under Suspension</span>
                      <span className="font-semibold text-[#EF4444]">{stats?.suspendedUsers ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1E293B]">
                      <span>Projects Blocked Under Active Hold</span>
                      <span className="font-semibold text-[#F1B94C]">{stats?.activeHolds ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#1E293B]">
                      <span>Attested Credentials Valid</span>
                      <span className="font-semibold text-[#10B981]">{stats?.certificates.valid ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Revoked Certificates (Tainted Proof)</span>
                      <span className="font-semibold text-[#EF4444]">{stats?.certificates.revoked ?? 0}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-[#090E1D] border border-[#1E293B] space-y-4">
                  <h3 className="text-sm font-semibold text-[#FCFDFF] flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#FBEDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Compliance Rules & Safe Operating Invariants
                  </h3>
                  <ul className="text-xs text-[#94A3B8] space-y-2.5 list-disc pl-4">
                    <li><strong className="text-[#FCFDFF]">Immutable Audit Logging:</strong> Every suspension, release, hold, or verification decision permanently appends to the audit trail with the actor's ID and mandatory justification.</li>
                    <li><strong className="text-[#FCFDFF]">Self-Suspension Protection:</strong> Administrators cannot suspend their own account or lock out the sole remaining administrator.</li>
                    <li><strong className="text-[#FCFDFF]">Conflict Detection (409):</strong> Concurrent moderator decisions on the same report resolve gracefully without state collisions.</li>
                    <li><strong className="text-[#FCFDFF]">14-Day Deletion Grace Period:</strong> User deletions are held for 14 days before execution, allowing instantaneous user-initiated cancellations.</li>
                    <li><strong className="text-[#FCFDFF]">Multi-Party Anonymization:</strong> Deletion anonymizes shared contributions to &quot;Former member&quot; while protecting team milestone integrity.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. REPORTS QUEUE TAB */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {['all', 'pending', 'resolved', 'dismissed', 'escalated'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setReportsFilter(st)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                        reportsFilter === st
                          ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30 font-semibold'
                          : 'bg-[#090E1D] text-[#94A3B8] border border-[#1E293B] hover:text-white'
                      }`}
                    >
                      {st} ({reports.filter((r) => st === 'all' || r.status === st).length})
                    </button>
                  ))}
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="p-12 text-center text-[#94A3B8] text-sm bg-[#090E1D] rounded-xl border border-[#1E293B]">
                  No reports in this view.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#334155] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            report.status === 'pending'
                              ? 'bg-[#F1B94C]/20 text-[#F1B94C] border border-[#F1B94C]/40'
                              : report.status === 'resolved'
                              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                              : 'bg-[#334155] text-[#94A3B8]'
                          }`}>
                            {report.status}
                          </span>
                          <span className="text-xs font-semibold text-[#93B2F8] uppercase tracking-wide">
                            {report.targetType}
                          </span>
                          <span className="text-xs text-[#94A3B8]">Target ID: {report.targetId}</span>
                        </div>
                        <div className="text-sm font-medium text-[#FCFDFF]">{report.reason}</div>
                        {report.notes && (
                          <div className="text-xs text-[#94A3B8] bg-[#070B14] p-2 rounded border border-[#1E293B]">
                            {report.notes}
                          </div>
                        )}
                        <div className="text-[11px] text-[#64748B]">
                          Reported by {report.reporter?.name || report.reporterId || 'System'} • {new Date(report.createdAt).toLocaleString()}
                          {report.resolvedBy && ` • Acted upon by ${report.resolvedBy}`}
                        </div>
                      </div>

                      {report.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveActionModal({
                                type: 'resolveReport',
                                id: report.id,
                                targetName: report.reason,
                              });
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30 hover:bg-[#0A1680]/80 transition-colors"
                          >
                            Resolve Report
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. VERIFICATION QUEUE TAB */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <p className="text-xs text-[#94A3B8]">
                Projects awaiting administrative attestation. Low-confidence submissions (&lt; 70%) with repository anomalies are flagged in amber.
              </p>

              {verificationQueue.length === 0 ? (
                <div className="p-12 text-center text-[#94A3B8] text-sm bg-[#090E1D] rounded-xl border border-[#1E293B]">
                  No projects currently in the verification queue.
                </div>
              ) : (
                <div className="space-y-3">
                  {verificationQueue.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl bg-[#090E1D] border transition-all ${
                        item.isLowConfidence ? 'border-[#F1B94C]/60 bg-[#16120B]/40' : 'border-[#1E293B]'
                      } flex flex-col md:flex-row md:items-center justify-between gap-4`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'verified'
                              ? 'bg-[#10B981]/20 text-[#10B981]'
                              : item.status === 'rejected'
                              ? 'bg-[#EF4444]/20 text-[#EF4444]'
                              : 'bg-[#0A1680] text-[#93B2F8]'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-xs font-semibold text-[#FCFDFF]">{item.projectTitle}</span>
                          <span className="text-xs text-[#94A3B8]">({item.category})</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            item.isLowConfidence
                              ? 'bg-[#F1B94C]/10 text-[#F1B94C] border-[#F1B94C]/30'
                              : 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                          }`}>
                            Confidence Score: {item.confidenceScore.toFixed(1)}%
                          </div>
                          <span className="text-xs text-[#94A3B8]">
                            {item.metrics.members} Members • {item.metrics.tasks} Tasks • {item.metrics.milestones} Milestones
                          </span>
                        </div>

                        {item.discrepancies.length > 0 && (
                          <div className="space-y-1 bg-[#1A1208] p-2.5 rounded border border-[#F1B94C]/30">
                            <div className="text-[11px] font-semibold text-[#F1B94C] flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Audit Warnings & Discrepancies Flagged:
                            </div>
                            <ul className="list-disc pl-4 text-[11px] text-[#F3F4F6] space-y-0.5">
                              {item.discrepancies.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-xs text-[#94A3B8] italic">&quot;{item.notes}&quot;</div>
                        )}
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActiveActionModal({
                                type: 'verifyApprove',
                                id: item.id,
                                targetName: item.projectTitle,
                              });
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#064E3B] text-[#A7F3D0] border border-[#059669] hover:bg-[#065F46] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setActiveActionModal({
                                type: 'verifyReject',
                                id: item.id,
                                targetName: item.projectTitle,
                              });
                            }}
                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#7F1D1D] text-[#FCA5A5] border border-[#DC2626] hover:bg-[#991B1B] transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. PROJECT HOLDS TAB */}
          {activeTab === 'holds' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#94A3B8]">
                  Projects placed on hold cannot transition to Completed status, cannot issue certificates, and cannot receive verification badges.
                </p>
                <button
                  onClick={() => {
                    const pid = prompt('Enter Project ID to place on hold:');
                    if (pid) {
                      setActiveActionModal({
                        type: 'placeHold',
                        id: pid,
                        targetName: `Project ${pid}`,
                      });
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30 hover:bg-[#0A1680]/80"
                >
                  + Place Project on Hold
                </button>
              </div>

              {holds.length === 0 ? (
                <div className="p-12 text-center text-[#94A3B8] text-sm bg-[#090E1D] rounded-xl border border-[#1E293B]">
                  No projects currently on hold.
                </div>
              ) : (
                <div className="space-y-3">
                  {holds.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            h.isActive ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#10B981]/20 text-[#10B981]'
                          }`}>
                            {h.isActive ? 'Active Hold' : 'Released'}
                          </span>
                          <span className="text-xs font-semibold text-[#FCFDFF]">
                            {h.project?.title || `Project ID: ${h.projectId}`}
                          </span>
                        </div>
                        <div className="text-xs text-[#F1B94C] font-medium">Reason: {h.reason}</div>
                        <div className="text-[11px] text-[#64748B]">
                          Placed by {h.createdBy} on {new Date(h.createdAt).toLocaleString()}
                          {h.releasedAt && ` • Released by ${h.releasedBy || 'Admin'} on ${new Date(h.releasedAt).toLocaleString()}`}
                        </div>
                      </div>

                      {h.isActive && (
                        <button
                          onClick={() => {
                            setActiveActionModal({
                              type: 'releaseHold',
                              id: h.projectId,
                              targetName: h.project?.title || h.projectId,
                            });
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#111827] text-[#93B2F8] border border-[#1E293B] hover:bg-[#1E293B]"
                        >
                          Release Hold
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. USER GOVERNANCE TAB */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search user by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="flex-1 bg-[#090E1D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs text-[#FCFDFF] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#94A3B8]">
                  <thead className="bg-[#090E1D] border-b border-[#1E293B] uppercase text-[10px] tracking-wider text-[#64748B]">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Roles</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Activity Counts</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === currentUserId;
                      return (
                        <tr key={u.id} className="hover:bg-[#0E1626]/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#FCFDFF]">{u.name}</div>
                            <div className="text-[11px] text-[#64748B]">{u.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {u.roles.map((r, i) => (
                                <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-[#1E293B] text-[#93B2F8]">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.status === 'active'
                                ? 'bg-[#10B981]/20 text-[#10B981]'
                                : u.status === 'suspended'
                                ? 'bg-[#EF4444]/20 text-[#EF4444]'
                                : 'bg-[#F1B94C]/20 text-[#F1B94C]'
                            }`}>
                              {u.status}
                            </span>
                            {u.suspensionReason && (
                              <div className="text-[10px] text-[#FCA5A5] mt-1 max-w-xs truncate">
                                {u.suspensionReason}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-[11px] space-x-2">
                              <span>{u.counts.skills} Skills</span>
                              <span>•</span>
                              <span>{u.counts.projectsOwned} Projects</span>
                              <span>•</span>
                              <span>{u.counts.certifications} Certs</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isSelf ? (
                              <span className="text-[10px] text-[#64748B] italic">Self (Protected)</span>
                            ) : u.status === 'suspended' ? (
                              <button
                                onClick={() => {
                                  setActiveActionModal({
                                    type: 'restoreUser',
                                    id: u.id,
                                    targetName: u.name,
                                  });
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#064E3B] text-[#A7F3D0] border border-[#059669] hover:bg-[#065F46]"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setActiveActionModal({
                                    type: 'suspendUser',
                                    id: u.id,
                                    targetName: u.name,
                                  });
                                }}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#7F1D1D] text-[#FCA5A5] border border-[#DC2626] hover:bg-[#991B1B]"
                              >
                                Suspend
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. CERTIFICATES & REVOCATION TAB */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Search by certificate number, recipient, or project..."
                  value={certSearch}
                  onChange={(e) => setCertSearch(e.target.value)}
                  className="flex-1 bg-[#090E1D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs text-[#FCFDFF] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#94A3B8]">
                  <thead className="bg-[#090E1D] border-b border-[#1E293B] uppercase text-[10px] tracking-wider text-[#64748B]">
                    <tr>
                      <th className="py-3 px-4">Cert Number</th>
                      <th className="py-3 px-4">Recipient</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]">
                    {filteredCertificates.map((c) => (
                      <tr key={c.id} className="hover:bg-[#0E1626]/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-[#93B2F8]">{c.certNumber}</td>
                        <td className="py-3 px-4 font-semibold text-[#FCFDFF]">{c.recipientName}</td>
                        <td className="py-3 px-4 text-[#E2E8F0]">{c.projectName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'valid' ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#EF4444]/20 text-[#EF4444]'
                          }`}>
                            {c.status}
                          </span>
                          {c.revokedReason && (
                            <div className="text-[10px] text-[#FCA5A5] mt-1">{c.revokedReason}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {c.status === 'valid' && (
                            <button
                              onClick={() => {
                                setActiveActionModal({
                                  type: 'revokeCert',
                                  id: c.id,
                                  targetName: `${c.certNumber} (${c.recipientName})`,
                                });
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-[#7F1D1D] text-[#FCA5A5] border border-[#DC2626] hover:bg-[#991B1B]"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. IMMUTABLE AUDIT TRAIL TAB */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Filter logs by action, target, actor, or justification..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="flex-1 bg-[#090E1D] border border-[#1E293B] rounded-lg px-3.5 py-2 text-xs text-[#FCFDFF] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#94A3B8]">
                  <thead className="bg-[#090E1D] border-b border-[#1E293B] uppercase text-[10px] tracking-wider text-[#64748B]">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Target</th>
                      <th className="py-3 px-4">Justification & Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B] font-mono">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#0E1626]/40 transition-colors">
                        <td className="py-3 px-4 text-[11px] text-[#64748B]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1680] text-[#93B2F8]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#FCFDFF] font-sans">
                          {log.actor?.name || log.actorId || 'System'}
                        </td>
                        <td className="py-3 px-4 text-[#93B2F8]">
                          {log.targetType}:{log.targetId}
                        </td>
                        <td className="py-3 px-4 text-xs font-sans text-[#E2E8F0]">
                          <div>{log.reason || 'None specified'}</div>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <pre className="text-[10px] text-[#64748B] font-mono mt-1">
                              {JSON.stringify(log.metadata)}
                            </pre>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal with Mandatory Reason */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-base font-bold text-[#FCFDFF] capitalize">
                Confirm {activeActionModal.type.replace(/([A-Z])/g, ' $1')}
              </h3>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-[#94A3B8] hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-[#94A3B8]">
                Target: <strong className="text-[#FCFDFF]">{activeActionModal.targetName || activeActionModal.id}</strong>
              </p>

              {activeActionModal.type === 'resolveReport' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#FCFDFF]">Action Taken</label>
                  <select
                    value={modalActionTaken}
                    onChange={(e) => setModalActionTaken(e.target.value)}
                    className="w-full bg-[#090E1D] border border-[#1E293B] rounded-lg p-2.5 text-xs text-[#FCFDFF]"
                  >
                    <option value="warned">Account Warned & Content Flagged</option>
                    <option value="content_removed">Content Removed</option>
                    <option value="project_hold">Project Placed Under Investigation Hold</option>
                    <option value="account_suspended">Account Suspended</option>
                    <option value="no_action">Report Reviewed — No Violation Detected</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#FCFDFF]">
                  Mandatory Justification / Compliance Reason <span className="text-[#EF4444]">*</span>
                </label>
                <textarea
                  rows={3}
                  value={modalReason}
                  onChange={(e) => setModalReason(e.target.value)}
                  placeholder="Enter detailed reason to be recorded in the immutable audit trail..."
                  className="w-full bg-[#090E1D] border border-[#1E293B] rounded-lg p-3 text-xs text-[#FCFDFF] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveActionModal(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[#1E293B] text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteModalAction}
                disabled={actionLoading}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 hover:bg-[#0A1680]/80 transition-colors flex items-center gap-2"
              >
                {actionLoading && <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/></svg>}
                Confirm & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminConsolePage;
