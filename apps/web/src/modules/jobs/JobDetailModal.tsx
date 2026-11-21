import React, { useState } from 'react';
import { api } from '../ai/client';

export interface JobDetailModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onApplied?: () => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplied,
}) => {
  const [showApplyBox, setShowApplyBox] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(job?.userApplied || false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !job) return null;

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setApplying(true);
      setError(null);
      await api(`/jobs/${job.id}/interest`, {
        method: 'POST',
        body: JSON.stringify({ coverLetter }),
      });
      setHasApplied(true);
      setShowApplyBox(false);
      if (onApplied) onApplied();
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const reqs = job.requirements || [];
  const requiredSkills = reqs.filter((r: any) => r.importance === 'required');
  const preferredSkills = reqs.filter((r: any) => r.importance === 'preferred');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Top Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-[#282836]">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center shrink-0 overflow-hidden">
              {job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-base font-black text-[#93B2F8]">
                  {job.company?.name?.slice(0, 2).toUpperCase() || 'SF'}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-white">{job.title}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680]/30 text-[#93B2F8] border border-[#93B2F8]/30">
                  {job.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                <span className="font-semibold text-zinc-300">{job.company?.name || 'Company'}</span>
                {job.department && <span>• {job.department}</span>}
                {job.location && <span>• {job.location}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1b1b22] border border-[#282836] flex items-center justify-center text-zinc-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Badges strip */}
        <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-semibold">
          <span className="px-2.5 py-1 rounded-xl bg-[#1b1b22] text-zinc-300 border border-[#282836]">
            {job.employmentType || 'Full-time'}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
            {job.workMode ? `${job.workMode.toUpperCase()}` : 'REMOTE'}
          </span>
          {job.salaryMin && job.salaryMax && (
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
              ${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k {job.currency}
            </span>
          )}
        </div>

        {/* Skill Requirements */}
        <div className="mt-5 space-y-3">
          {requiredSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Required Technical Evidence:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {requiredSkills.map((r: any) => (
                  <span
                    key={r.id}
                    className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#0A1680]/40 text-[#93B2F8] border border-[#93B2F8]/40"
                  >
                    {r.skillName} • {r.minProficiency}
                  </span>
                ))}
              </div>
            </div>
          )}

          {preferredSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Preferred Qualifications:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {preferredSkills.map((r: any) => (
                  <span
                    key={r.id}
                    className="px-2.5 py-1 rounded-xl text-xs font-medium bg-[#1b1b22] text-zinc-300 border border-[#282836]"
                  >
                    {r.skillName} • {r.minProficiency}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Description & Responsibilities */}
        <div className="mt-5 space-y-4 text-xs leading-relaxed text-zinc-300 border-t border-[#282836] pt-4">
          <div>
            <h4 className="font-bold text-white text-xs mb-1.5 uppercase tracking-wider text-[11px]">
              About the Role
            </h4>
            <p className="whitespace-pre-line text-zinc-300">{job.description}</p>
          </div>

          {job.responsibilities && (
            <div>
              <h4 className="font-bold text-white text-xs mb-1.5 uppercase tracking-wider text-[11px]">
                Key Responsibilities
              </h4>
              <p className="whitespace-pre-line text-zinc-300">{job.responsibilities}</p>
            </div>
          )}

          {job.benefits && (
            <div>
              <h4 className="font-bold text-white text-xs mb-1.5 uppercase tracking-wider text-[11px]">
                Perks & Benefits
              </h4>
              <p className="text-zinc-300">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Application Action Area */}
        <div className="mt-6 pt-4 border-t border-[#282836]">
          {hasApplied ? (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                ✓ You have expressed interest in this opportunity
              </span>
              <span className="text-[11px] text-emerald-400 opacity-80">Application Submitted</span>
            </div>
          ) : showApplyBox ? (
            <form onSubmit={handleApply} className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Brief Introduction / Note to Hiring Team (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share why you're excited about this role and mention your relevant project proof..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyBox(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] shadow-md shadow-[#93B2F8]/20"
                >
                  {applying ? 'Submitting...' : 'Confirm Expression of Interest'}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                {job._count?.applications || 0} candidates have applied
              </span>
              <button
                onClick={() => setShowApplyBox(true)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center gap-2"
              >
                <span>Express Interest / Apply</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
