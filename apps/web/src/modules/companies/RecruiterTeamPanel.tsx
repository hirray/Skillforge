import React, { useState } from 'react';
import { Card } from '../../design-system/components';
import { api } from '../ai/client';

export const RecruiterTeamPanel: React.FC<{
  companyId: string;
  recruiters: any[];
  isAdmin: boolean;
  onRecruiterAdded: (recruiter: any) => void;
}> = ({ companyId, recruiters, isAdmin, onRecruiterAdded }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'recruiter_admin' | 'recruiter_member'>('recruiter_member');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await api<{ data: any }>(`/companies/${companyId}/recruiters`, {
        method: 'POST',
        body: JSON.stringify({
          email: emailInput.trim(),
          role: roleInput,
        }),
      });
      onRecruiterAdded(res.data);
      setShowInviteModal(false);
      setEmailInput('');
      setRoleInput('recruiter_member');
    } catch (err: any) {
      setError(err.message || 'Failed to invite recruiter');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-[#15151a] border border-[#282836] rounded-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#282836]">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Recruiter Team Seats</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]">
              {recruiters.length}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Recruiter seats have access to post jobs, search candidate proof, and manage shortlists.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all flex items-center gap-1.5 shadow-md shadow-[#93B2F8]/10"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            <span>Invite Recruiter</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Recruiters List */}
      <div className="mt-4 divide-y divide-[#282836]/60">
        {recruiters.map((rec) => {
          const userEmail = rec.user?.email || rec.userId;
          const isAdminRole = rec.role === 'recruiter_admin';

          return (
            <div key={rec.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1b1b22] border border-[#282836] flex items-center justify-center text-xs font-bold text-[#93B2F8]">
                  {userEmail[0]?.toUpperCase() || 'R'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{userEmail}</span>
                    {isAdminRole ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1680]/40 text-[#93B2F8] border border-[#93B2F8]/30">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        Member
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Joined {new Date(rec.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-xs text-zinc-500">Active seat</div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Invite Recruiter Member</h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Add a team member to collaborate on hiring, job requirements, and candidate matching.
            </p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Work Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@company.example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Role Permission</label>
                <select
                  aria-label="Role Permission"
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                >
                  <option value="recruiter_member">Recruiter Member (Post jobs, search talent, shortlist)</option>
                  <option value="recruiter_admin">Recruiter Admin (Manage company profile & seats)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
                >
                  {submitting ? 'Sending Invite...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
