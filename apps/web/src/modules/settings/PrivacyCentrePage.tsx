import { useState, useEffect } from 'react';
import { api } from '../ai/client';

interface ConsentItem {
  id: string;
  type: string;
  version: string;
  acceptedAt: string;
  ip?: string | null;
}

interface PrivacyStatus {
  consents: ConsentItem[];
  matchingOptIn: boolean;
  visibilitySettings: Record<string, string>;
  accountStatus: string;
  pendingDeletion?: {
    scheduledFor: string;
    requestedAt: string;
  } | null;
}

export function PrivacyCentrePage() {
  const [privacy, setPrivacy] = useState<PrivacyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingConsent, setSavingConsent] = useState(false);
  const [downloadingExport, setDownloadingExport] = useState(false);
  const [deletionStep, setDeletionStep] = useState<number>(0); // 0 = closed, 1..4 = active stepper
  const [deletionReason, setDeletionReason] = useState('switching_platform');
  const [deletionConfirmText, setDeletionConfirmText] = useState('');
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrivacy = async () => {
    try {
      const res = await api<PrivacyStatus>('/users/me/consents');
      setPrivacy(res);
    } catch (err: any) {
      console.warn('Failed to load privacy settings:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    void fetchPrivacy().finally(() => setLoading(false));
  }, []);

  const handleToggleMatchingOptIn = async (val: boolean) => {
    if (!privacy) return;
    setSavingConsent(true);
    try {
      await api('/users/me/consents', {
        method: 'POST',
        body: JSON.stringify({
          type: 'ai_job_matching',
          accepted: val,
        }),
      });
      setPrivacy({ ...privacy, matchingOptIn: val });
      setNotice(`AI Job Matching has been ${val ? 'enabled' : 'disabled'}.`);
    } catch (err: any) {
      setError(err?.message || 'Could not update matching preference');
    } finally {
      setSavingConsent(false);
    }
  };

  const handleDownloadExport = async () => {
    setDownloadingExport(true);
    setError(null);
    try {
      const res = await api<{ success: boolean; downloadUrl: string; data: any }>('/users/me/export');
      if (res?.data) {
        // Trigger direct JSON file download in browser
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillforge-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setNotice('Your personal data archive was generated and downloaded successfully.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate data export');
    } finally {
      setDownloadingExport(false);
    }
  };

  const handleScheduleDeletion = async () => {
    if (deletionConfirmText !== 'DELETE') {
      setError('Please type DELETE to confirm scheduled account deletion.');
      return;
    }
    setDeletionLoading(true);
    setError(null);
    try {
      await api<{ success: boolean; scheduledFor: string }>('/users/me/deletion', {
        method: 'POST',
        body: JSON.stringify({ reason: deletionReason }),
      });
      setNotice('Your account deletion is scheduled. A 14-day grace period is now active.');
      setDeletionStep(0);
      setDeletionConfirmText('');
      await fetchPrivacy();
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule deletion');
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setDeletionLoading(true);
    setError(null);
    try {
      await api('/users/me/deletion', { method: 'DELETE' });
      setNotice('Account deletion cancelled. Your profile and verified credentials remain active.');
      await fetchPrivacy();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel deletion');
    } finally {
      setDeletionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] text-[#94A3B8] flex items-center justify-center text-sm">
        Loading privacy governance controls...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-[#FCFDFF] px-4 py-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="border-b border-[#1E293B] pb-6">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#93B2F8]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#FCFDFF]">Privacy & Data Governance Centre</h1>
          <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#0A1680] text-[#93B2F8] border border-[#1E293B]">
            PRD Area 33
          </span>
        </div>
        <p className="text-sm text-[#94A3B8] mt-1">
          Zero-knowledge defaults, GDPR data sovereignty, audience visibility controls, and auditable consent management.
        </p>
      </div>

      {/* Status Notice */}
      {notice && (
        <div className="p-4 rounded-lg bg-[#064E3B]/40 border border-[#059669] text-[#A7F3D0] text-sm flex items-center justify-between animate-fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-xs hover:text-white">&times;</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-[#7F1D1D]/40 border border-[#DC2626] text-[#FCA5A5] text-sm flex items-center justify-between animate-fade-in">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs hover:text-white">&times;</button>
        </div>
      )}

      {/* Active Deletion Grace Period Banner */}
      {privacy?.pendingDeletion && (
        <div className="p-5 rounded-xl bg-[#7F1D1D]/30 border-2 border-[#EF4444] text-[#FCFDFF] flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <strong className="text-sm text-[#FCA5A5] uppercase tracking-wider">Account Deletion Scheduled</strong>
            </div>
            <p className="text-xs text-[#E2E8F0]">
              Your account is in a 14-day grace period. Final purge is scheduled for{' '}
              <strong className="text-white">{new Date(privacy.pendingDeletion.scheduledFor).toLocaleDateString()}</strong>.
              All data remains recoverable until then.
            </p>
          </div>
          <button
            onClick={handleCancelDeletion}
            disabled={deletionLoading}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-[#10B981] text-[#064E3B] hover:bg-[#34D399] transition-all whitespace-nowrap"
          >
            Cancel Deletion &amp; Keep Account
          </button>
        </div>
      )}

      {/* 1. Audience Visibility Overview Matrix */}
      <div className="p-6 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#FCFDFF]">Audience Visibility Matrix</h2>
            <p className="text-xs text-[#94A3B8]">Controls who is permitted to view each section of your verified engineering dossier.</p>
          </div>
          <a
            href="/me/profile"
            className="text-xs text-[#93B2F8] hover:underline flex items-center gap-1 font-semibold"
          >
            Edit Visibility Settings &rarr;
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Public Bio & Identity', val: privacy?.visibilitySettings?.bio || 'public', badge: 'Public' },
            { label: 'Verified Taxonomy Skills', val: privacy?.visibilitySettings?.skills || 'public', badge: 'Public' },
            { label: 'Work Experience', val: privacy?.visibilitySettings?.experience || 'platform', badge: 'Platform-only' },
            { label: 'Education History', val: privacy?.visibilitySettings?.education || 'platform', badge: 'Platform-only' },
            { label: 'Attested Certifications', val: privacy?.visibilitySettings?.certifications || 'public', badge: 'Public' },
            { label: 'Availability & Notice Period', val: privacy?.visibilitySettings?.availability || 'recruiters', badge: 'Recruiters-only' },
          ].map((sec, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#090E1D] border border-[#1E293B] space-y-1">
              <div className="text-[#94A3B8] text-[11px]">{sec.label}</div>
              <div className="font-semibold text-[#FCFDFF] capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                {sec.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Recruiter & AI Sovereignty Controls */}
      <div className="p-6 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#FCFDFF]">Recruiter Outreach &amp; AI Matching Sovereignty</h2>
          <p className="text-xs text-[#94A3B8]">
            PRD Area 33.4: Explicit, revocable consent controls for employer discoverability and matching heuristics.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[#FCFDFF]">Automated AI Job Matching</div>
              <p className="text-xs text-[#94A3B8]">
                Allow SkillForge algorithms to compute high-fit match scores between verified credentials and enterprise openings.
              </p>
            </div>
            <button
              onClick={() => handleToggleMatchingOptIn(!privacy?.matchingOptIn)}
              disabled={savingConsent}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                privacy?.matchingOptIn
                  ? 'bg-[#064E3B] text-[#A7F3D0] border-[#059669]'
                  : 'bg-[#1E293B] text-[#94A3B8] border-[#334155]'
              }`}
            >
              {privacy?.matchingOptIn ? 'Opted In' : 'Opted Out'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Consent Records History */}
      <div className="p-6 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#FCFDFF]">Auditable Consent History</h2>
          <p className="text-xs text-[#94A3B8]">
            Timestamped record of all terms, policies, and privacy consents accepted under your account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#94A3B8]">
            <thead className="bg-[#090E1D] border-b border-[#1E293B] uppercase text-[10px] tracking-wider text-[#64748B]">
              <tr>
                <th className="py-2.5 px-4">Consent Category</th>
                <th className="py-2.5 px-4">Specification Version</th>
                <th className="py-2.5 px-4">Accepted Timestamp</th>
                <th className="py-2.5 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {privacy?.consents.map((c) => (
                <tr key={c.id}>
                  <td className="py-2.5 px-4 font-semibold text-[#FCFDFF] capitalize">
                    {c.type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[#93B2F8]">{c.version}</td>
                  <td className="py-2.5 px-4">{new Date(c.acceptedAt).toLocaleString()}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B]/40 text-[#A7F3D0] border border-[#059669]/50">
                      Active &amp; Recorded
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. GDPR Data Takeout */}
      <div className="p-6 rounded-2xl bg-[#0B1120] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#FCFDFF]">Download Your Personal Data (GDPR Takeout)</h2>
          <p className="text-xs text-[#94A3B8]">
            Generate a full, portable JSON archive of your profile, verified skills, contributions, projects, and consent audit logs.
          </p>
        </div>
        <button
          onClick={handleDownloadExport}
          disabled={downloadingExport}
          className="px-5 py-2.5 text-xs font-bold rounded-lg bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 hover:bg-[#0A1680]/80 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          {downloadingExport ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          Download JSON Archive
        </button>
      </div>

      {/* 5. 14-Day Deletion Stepper */}
      <div className="p-6 rounded-2xl bg-[#0B1120] border border-[#EF4444]/30 space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#FCA5A5]">Account Deletion &amp; Right to Be Forgotten</h2>
            <p className="text-xs text-[#94A3B8]">
              Initiate a permanent account purge with a mandatory 14-day grace period. Multi-party contributions are anonymized to &quot;Former member&quot;.
            </p>
          </div>
          {deletionStep === 0 && !privacy?.pendingDeletion && (
            <button
              onClick={() => setDeletionStep(1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#7F1D1D] text-[#FCA5A5] border border-[#DC2626] hover:bg-[#991B1B]"
            >
              Start Deletion Process
            </button>
          )}
        </div>

        {deletionStep > 0 && (
          <div className="space-y-5 p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] animate-fade-in">
            {/* Stepper Progress Indicator */}
            <div className="flex items-center justify-between text-xs font-semibold text-[#94A3B8] border-b border-[#1E293B] pb-3">
              <span className={deletionStep >= 1 ? 'text-[#93B2F8]' : ''}>1. Data Impact</span>
              <span>&rarr;</span>
              <span className={deletionStep >= 2 ? 'text-[#93B2F8]' : ''}>2. Reason</span>
              <span>&rarr;</span>
              <span className={deletionStep >= 3 ? 'text-[#EF4444]' : ''}>3. Confirmation</span>
            </div>

            {/* Step 1 */}
            {deletionStep === 1 && (
              <div className="space-y-3 text-xs text-[#94A3B8]">
                <h3 className="text-sm font-bold text-white">What happens when your account is deleted:</h3>
                <ul className="list-disc pl-4 space-y-1.5">
                  <li>Your login credentials, email address, password hashes, and direct sessions are permanently deleted.</li>
                  <li>Your private resumes and contact details are purged from disk.</li>
                  <li>Multi-party team milestones and GitHub contribution commits remain intact for teammates, displayed as &quot;Former member&quot;.</li>
                  <li>You will enter a <strong className="text-white">14-day grace period</strong> during which you can cancel at any time.</li>
                </ul>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setDeletionStep(0)} className="px-3 py-1.5 text-xs text-gray-400">Cancel</button>
                  <button onClick={() => setDeletionStep(2)} className="px-4 py-1.5 text-xs font-bold bg-[#0A1680] text-[#93B2F8] rounded-lg">Next &rarr;</button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {deletionStep === 2 && (
              <div className="space-y-3 text-xs">
                <label className="text-sm font-bold text-white">Why are you leaving SkillForge? (Optional feedback)</label>
                <select
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  className="w-full bg-[#070B14] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white"
                >
                  <option value="switching_platform">Found another platform</option>
                  <option value="privacy_concerns">Privacy or data concerns</option>
                  <option value="too_many_notifications">Too many communications</option>
                  <option value="other">Other reason</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setDeletionStep(1)} className="px-3 py-1.5 text-xs text-gray-400">&larr; Back</button>
                  <button onClick={() => setDeletionStep(3)} className="px-4 py-1.5 text-xs font-bold bg-[#0A1680] text-[#93B2F8] rounded-lg">Next &rarr;</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {deletionStep === 3 && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#7F1D1D]/40 border border-[#DC2626] text-[#FCA5A5]">
                  Type <strong className="text-white">DELETE</strong> below to schedule your account purge with 14-day grace period.
                </div>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={deletionConfirmText}
                  onChange={(e) => setDeletionConfirmText(e.target.value)}
                  className="w-full bg-[#070B14] border border-[#1E293B] rounded-lg p-2.5 text-xs text-white font-mono"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setDeletionStep(2)} className="px-3 py-1.5 text-xs text-gray-400">&larr; Back</button>
                  <button
                    onClick={handleScheduleDeletion}
                    disabled={deletionLoading || deletionConfirmText !== 'DELETE'}
                    className="px-4 py-1.5 text-xs font-bold bg-[#DC2626] text-white rounded-lg disabled:opacity-40"
                  >
                    Confirm &amp; Schedule Deletion
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrivacyCentrePage;
