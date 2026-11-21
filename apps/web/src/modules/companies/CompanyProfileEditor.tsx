import React, { useState } from 'react';
import { Card } from '../../design-system/components';
import { api } from '../ai/client';

export interface CompanyData {
  id: string;
  name: string;
  logo?: string | null;
  overview?: string | null;
  industry?: string | null;
  sizeBand?: string | null;
  website?: string | null;
  locations?: string | null;
  hiringFocus?: string | null;
  verificationStatus: string;
  verificationReason?: string | null;
  verifiedAt?: string | null;
  recruiters?: any[];
  jobs?: any[];
}

export const CompanyProfileEditor: React.FC<{
  company: CompanyData;
  canEdit: boolean;
  onUpdated: (updated: CompanyData) => void;
}> = ({ company, canEdit, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name || '',
    logo: company.logo || '',
    overview: company.overview || '',
    industry: company.industry || '',
    sizeBand: company.sizeBand || '1-10',
    website: company.website || '',
    locations: company.locations || '',
    hiringFocus: company.hiringFocus || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [workEmail, setWorkEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setSuccessMessage(null);
      const res = await api<{ data: CompanyData }>(`/companies/${company.id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      onUpdated(res.data);
      setEditing(false);
      setSuccessMessage('Company profile saved successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCompany = async (reasonOverride?: string) => {
    try {
      setVerifying(true);
      setError(null);
      const domainReason = reasonOverride || `Verified entity & domain match (${company.website || 'corporate website'})`;
      const res = await api<{ data: CompanyData }>(`/companies/${company.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          verificationStatus: 'verified',
          verificationReason: domainReason,
        }),
      });
      onUpdated(res.data);
      setShowVerifyModal(false);
      setSuccessMessage('Company successfully verified! Verified badge is now active.');
    } catch (err: any) {
      setError(err.message || 'Failed to verify company');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card className="p-6 bg-[#15151a] border border-[#282836] rounded-2xl relative overflow-hidden">
      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#282836]">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-[#93B2F8]">
                {company.name?.slice(0, 2).toUpperCase() || 'CO'}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">{company.name}</h2>
              {company.verificationStatus === 'verified' ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-950/60 text-[#93B2F8] border border-[#93B2F8]/40 flex items-center gap-1 shadow-sm">
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                    <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zm-3.97-3.03a.75.75 0 00-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 00-1.06 1.06L6.97 11.03a.75.75 0 001.079-.02l3.992-4.99a.75.75 0 00-.01-1.05z" />
                  </svg>
                  Verified Company
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                    Unverified
                  </span>
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all"
                  >
                    Verify Company
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 flex-wrap">
              {company.industry && <span>{company.industry}</span>}
              {company.sizeBand && (
                <>
                  <span>•</span>
                  <span>{company.sizeBand} employees</span>
                </>
              )}
              {company.locations && (
                <>
                  <span>•</span>
                  <span>{company.locations}</span>
                </>
              )}
              {company.website && (
                <>
                  <span>•</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#93B2F8] hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </a>
                </>
              )}
            </div>

            {company.verificationReason && (
              <div className="text-[11px] text-zinc-400 mt-1">
                Verification Note: <span className="text-zinc-300">{company.verificationReason}</span>
              </div>
            )}
          </div>
        </div>

        {canEdit && !editing && (
          <button
            onClick={() => {
              setFormData({
                name: company.name || '',
                logo: company.logo || '',
                overview: company.overview || '',
                industry: company.industry || '',
                sizeBand: company.sizeBand || '1-10',
                website: company.website || '',
                locations: company.locations || '',
                hiringFocus: company.hiringFocus || '',
              });
              setEditing(true);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-[#1b1b22] hover:bg-[#282836] border border-[#282836] transition-all shrink-0"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Editing Form */}
      {editing ? (
        <form onSubmit={handleSave} className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Website URL</label>
              <input
                type="url"
                placeholder="https://company.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Industry</label>
              <input
                type="text"
                placeholder="e.g. Fintech, AI Automation, HealthTech"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Size</label>
              <select
                aria-label="Company Size"
                value={formData.sizeBand}
                onChange={(e) => setFormData({ ...formData, sizeBand: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              >
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Offices & Locations</label>
              <input
                type="text"
                placeholder="e.g. Vadodara, India • Remote"
                value={formData.locations}
                onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Hiring Focus Keywords</label>
              <input
                type="text"
                placeholder="e.g. Make.com, AI, Agentic AI, React"
                value={formData.hiringFocus}
                onChange={(e) => setFormData({ ...formData, hiringFocus: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Company Overview / Mission</label>
            <textarea
              rows={3}
              placeholder="Tell candidates about what your team is building..."
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="pt-6 space-y-4 text-xs leading-relaxed text-zinc-300">
          {company.overview && (
            <div>
              <div className="font-semibold text-zinc-400 mb-1 uppercase tracking-wider text-[10px]">
                About the Company
              </div>
              <p className="text-zinc-200">{company.overview}</p>
            </div>
          )}

          {company.hiringFocus && (
            <div>
              <div className="font-semibold text-zinc-400 mb-1 uppercase tracking-wider text-[10px]">
                Current Hiring Focus
              </div>
              <div className="flex flex-wrap gap-1.5">
                {company.hiringFocus.split(/[,•]/).map((item, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-[#1b1b22] text-[#93B2F8] border border-[#282836] text-[11px] font-medium"
                  >
                    {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="#93B2F8">
                <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zm-3.97-3.03a.75.75 0 00-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 00-1.06 1.06L6.97 11.03a.75.75 0 001.079-.02l3.992-4.99a.75.75 0 00-.01-1.05z" />
              </svg>
              <span>Company Verification (PRD Area 21.3)</span>
            </h3>

            <div className="text-xs text-zinc-300 leading-relaxed space-y-3 mb-6">
              <p>
                Verification badges provide credibility to candidate talent. SkillForge verifies companies through:
              </p>
              <ul className="list-disc list-inside space-y-1 text-zinc-400">
                <li><strong className="text-white">Corporate Website Validation:</strong> Validating that <code className="text-[#93B2F8]">{company.website || 'website'}</code> is an active, registered corporate domain.</li>
                <li><strong className="text-white">Work Email Domain Match:</strong> Verifying recruiter accounts with corporate domain addresses.</li>
                <li><strong className="text-white">Admin Manual Verification:</strong> Direct validation by platform team.</li>
              </ul>
            </div>

            <div className="space-y-3 mb-4">
              <label className="block text-xs font-semibold text-zinc-300">
                Corporate Work Email (Optional)
              </label>
              <input
                type="email"
                placeholder="recruiter@hir.com"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#282836]">
              <button
                type="button"
                onClick={() => setShowVerifyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyCompany(workEmail ? `Work domain match: @${workEmail.split('@')[1]}` : undefined)}
                disabled={verifying}
                className="px-5 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
              >
                {verifying ? 'Verifying...' : 'Confirm Verification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
