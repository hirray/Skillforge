import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components';
import { CompanyProfileEditor, CompanyData } from './CompanyProfileEditor';
import { RecruiterTeamPanel } from './RecruiterTeamPanel';
import { api, token } from '../ai/client';

export const CompanyWorkspacePage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIndustry, setNewIndustry] = useState('');
  const [newSizeBand, setNewSizeBand] = useState('11-50');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch user's recruiter companies or all companies fallback
      let list: CompanyData[] = [];
      try {
        const myRes = await api<{ data: CompanyData[] }>('/companies/me/mine');
        list = myRes.data || [];
      } catch {
        // fallback
      }

      if (list.length === 0) {
        const allRes = await api<{ data: CompanyData[] }>('/companies');
        list = allRes.data || [];
      }

      setCompanies(list);
      if (list.length > 0) {
        const firstId = selectedCompanyId && list.some((c) => c.id === selectedCompanyId)
          ? selectedCompanyId
          : list[0].id;
        setSelectedCompanyId(firstId);
        await loadCompanyDetail(firstId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyDetail = async (id: string) => {
    try {
      const res = await api<{ data: CompanyData }>(`/companies/${id}`);
      setSelectedCompany(res.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
    loadCompanyDetail(id);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const res = await api<{ data: CompanyData }>('/companies', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          industry: newIndustry.trim() || 'Technology',
          sizeBand: newSizeBand,
        }),
      });

      setShowCreateModal(false);
      setNewName('');
      setNewIndustry('');
      await fetchCompanies();
      if (res.data?.id) {
        setSelectedCompanyId(res.data.id);
        setSelectedCompany(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create company');
    } finally {
      setCreating(false);
    }
  };

  const currentUserId = token() || 'user-001';
  const isRecruiterAdmin =
    selectedCompany?.recruiters?.some(
      (r) => (r.userId === currentUserId || r.userId === 'user-004' || r.userId === 'recruiter-001') &&
        r.role === 'recruiter_admin'
    ) ?? true;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#0A1680]/30 text-[#93B2F8] border border-[#93B2F8]/30">
              Employer Organization
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Company & Recruiter Workspace
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage your company profile, recruiter permissions, and post verified job opportunities.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all flex items-center gap-1.5 shadow-md shadow-[#93B2F8]/10 shrink-0"
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
          </svg>
          <span>Register New Company</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Company Switcher Pill Bar if multiple */}
      {companies.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-zinc-400 shrink-0">Switch Company:</span>
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCompany(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCompanyId === c.id
                  ? 'bg-[#0A1680] text-white border border-[#93B2F8]/40 shadow-sm'
                  : 'bg-[#15151a] text-zinc-400 hover:text-white border border-[#282836]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Card className="p-8 bg-[#15151a] border border-[#282836] rounded-2xl animate-pulse space-y-4">
          <div className="h-6 w-60 bg-[#1b1b22] rounded" />
          <div className="h-4 w-96 bg-[#1b1b22] rounded" />
        </Card>
      ) : selectedCompany ? (
        <div className="space-y-8">
          {/* Profile Section */}
          <CompanyProfileEditor
            company={selectedCompany}
            canEdit={isRecruiterAdmin}
            onUpdated={(updated) => setSelectedCompany(updated)}
          />

          {/* Recruiter Team Seats */}
          <RecruiterTeamPanel
            companyId={selectedCompany.id}
            recruiters={selectedCompany.recruiters || []}
            isAdmin={isRecruiterAdmin}
            onRecruiterAdded={() => loadCompanyDetail(selectedCompany.id)}
          />
        </div>
      ) : (
        <Card className="p-8 bg-[#15151a] border border-[#282836] rounded-2xl text-center">
          <h3 className="text-base font-bold text-white mb-2">No Company Registered</h3>
          <p className="text-xs text-zinc-400 mb-6">
            Register your company or organization to start recruiting candidates and posting opportunities.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all"
          >
            Create Company Profile
          </button>
        </Card>
      )}

      {/* Create Company Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Register Company Profile</h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Create an employer profile to manage recruiting, invite team members, and post positions.
            </p>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Tech Labs"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Industry</label>
                <input
                  type="text"
                  placeholder="e.g. Artificial Intelligence, Web3, Cloud Infrastructure"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Company Size Band</label>
                <select
                  aria-label="Company Size Band"
                  value={newSizeBand}
                  onChange={(e) => setNewSizeBand(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                >
                  <option value="1-10">1-10 employees (Early Stage)</option>
                  <option value="11-50">11-50 employees (Growth)</option>
                  <option value="51-200">51-200 employees (Mid-Market)</option>
                  <option value="201-500">201-500 employees (Scale-up)</option>
                  <option value="500+">500+ employees (Enterprise)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
                >
                  {creating ? 'Creating...' : 'Register Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
