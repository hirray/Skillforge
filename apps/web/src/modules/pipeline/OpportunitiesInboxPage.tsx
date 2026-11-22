import React, { useState, useEffect } from 'react';

export interface OpportunityItem {
  id: string;
  entryId: string;
  recruiterId: string;
  candidateId: string;
  text: string;
  status: 'sent' | 'accepted' | 'declined';
  createdAt: string;
  companyName: string;
  jobTitle?: string;
  verifiedCompany: boolean;
}

export const OpportunitiesInboxPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Consent settings
  const [recruiterVisible, setRecruiterVisible] = useState(true);
  const [matchingOptIn, setMatchingOptIn] = useState(true);
  const [savingConsent, setSavingConsent] = useState(false);
  const [consentSavedNotice, setConsentSavedNotice] = useState(false);

  // Responding to opportunity
  const [actioningId, setActioningId] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/pipeline/opportunities/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || 'user-001'}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load candidate opportunities');
      }

      const data = await res.json();
      setOpportunities(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleRespond = async (messageId: string, status: 'accepted' | 'declined') => {
    try {
      setActioningId(messageId);
      const res = await fetch(`/api/v1/pipeline/opportunities/${messageId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'user-001'}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((o) => (o.id === messageId ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.error('Failed to respond to opportunity:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleSaveConsent = async () => {
    try {
      setSavingConsent(true);
      const res = await fetch('/api/v1/pipeline/candidate/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || 'user-001'}`,
        },
        body: JSON.stringify({
          recruiterVisible,
          matchingOptIn,
        }),
      });

      if (res.ok) {
        setConsentSavedNotice(true);
        setTimeout(() => setConsentSavedNotice(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update discovery consent:', err);
    } finally {
      setSavingConsent(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#15151a] p-6 rounded-2xl border border-[#282836] shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-xl font-bold text-white tracking-tight">Opportunities Inbox</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
              Candidate Portal
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Messages and inbound engineering roles sent by verified enterprise recruiters who reviewed your verified proof.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-300 bg-[#1b1b22] px-3.5 py-2 rounded-xl border border-[#282836]">
          <span className="font-semibold text-white">{opportunities.length}</span> Inbound Messages
        </div>
      </div>

      {/* Recruiter Contact Consent & Privacy Card */}
      <div className="p-5 rounded-2xl bg-[#171722] border border-[#282836] shadow-lg space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🛡️ Recruiter Contact Consent & Visibility Control</span>
              {consentSavedNotice && (
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  Saved successfully
                </span>
              )}
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              You maintain full sovereignty over your verified data. When active, verified employers can discover your attested engineering contributions and message you. Turning this off immediately blocks recruiter outreach and hides your profile from talent discovery boards.
            </p>
          </div>

          <button
            onClick={handleSaveConsent}
            disabled={savingConsent}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-50 transition-all shadow-md shadow-[#93B2F8]/20 shrink-0"
          >
            {savingConsent ? 'Saving...' : 'Update Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#282836]/60">
          <label className="flex items-center gap-3 p-3 rounded-xl bg-[#121217] border border-[#282836] cursor-pointer hover:border-zinc-500 transition-colors">
            <input
              type="checkbox"
              checked={recruiterVisible}
              onChange={(e) => setRecruiterVisible(e.target.checked)}
              className="w-4 h-4 rounded text-[#0A1680] focus:ring-0 bg-zinc-900 border-zinc-700"
            />
            <div>
              <span className="text-xs font-bold text-white block">Allow Recruiter Discovery & Direct Outreach</span>
              <span className="text-[10px] text-zinc-400 block">
                Permit verified companies to review your proof portfolio and send inbound messages.
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-[#121217] border border-[#282836] cursor-pointer hover:border-zinc-500 transition-colors">
            <input
              type="checkbox"
              checked={matchingOptIn}
              onChange={(e) => setMatchingOptIn(e.target.checked)}
              className="w-4 h-4 rounded text-[#0A1680] focus:ring-0 bg-zinc-900 border-zinc-700"
            />
            <div>
              <span className="text-xs font-bold text-white block">Participate in Automated AI Job Matching</span>
              <span className="text-[10px] text-zinc-400 block">
                Allow matching models to evaluate your verified skills for high-fit engineering openings.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white">Inbound Messages ({opportunities.length})</h2>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-[#15151a] rounded-2xl border border-[#282836]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-center text-xs text-rose-300">
            {error}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#15151a] border border-[#282836] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1b1b22] border border-[#282836] mx-auto flex items-center justify-center text-[#93B2F8]">
              ✉
            </div>
            <h3 className="text-sm font-bold text-white">No outreach messages yet</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              As your verified project deliverables and milestone scores accumulate, verified companies browsing the talent registry will be able to send you direct opportunities here.
            </p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] hover:border-zinc-600 transition-all space-y-4 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#282836]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0A1680] to-[#93B2F8] flex items-center justify-center text-sm font-bold text-white shadow-md">
                    {opp.companyName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{opp.companyName}</h3>
                      {opp.verifiedCompany && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                          ✓ Verified Enterprise
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">
                      From Recruiter ({opp.recruiterId}) • {new Date(opp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  {opp.status === 'accepted' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30">
                      ✓ Accepted / Interested
                    </span>
                  ) : opp.status === 'declined' ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
                      ✕ Declined Politely
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30">
                      ● Action Required
                    </span>
                  )}
                </div>
              </div>

              {/* Message Body */}
              <div className="p-4 rounded-xl bg-[#121217] border border-[#282836]/60 text-xs text-zinc-200 leading-relaxed">
                {opp.text}
              </div>

              {/* Candidate Action Buttons */}
              {opp.status === 'sent' && (
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    disabled={actioningId === opp.id}
                    onClick={() => handleRespond(opp.id, 'declined')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] transition-colors disabled:opacity-50"
                  >
                    Decline Politely
                  </button>
                  <button
                    disabled={actioningId === opp.id}
                    onClick={() => handleRespond(opp.id, 'accepted')}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 disabled:opacity-50"
                  >
                    Accept & Express Interest →
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
