import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components';
import { JobDetailModal } from './JobDetailModal';
import { JobPostModal } from './JobPostModal';
import { api } from '../ai/client';

export const JobsBoardPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (workModeFilter) params.append('workMode', workModeFilter);
      if (typeFilter) params.append('employmentType', typeFilter);

      const res = await api<{ data: any[] }>(`/jobs?${params.toString()}`);
      setJobs(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api<{ data: any[] }>('/companies');
      const list = res.data || [];
      setCompanies(list);
      if (list.length > 0) {
        setTargetCompanyId(list[0].id);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCompanies();
  }, [search, workModeFilter, typeFilter]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#0A1680]/30 text-[#93B2F8] border border-[#93B2F8]/30">
              Talent Marketplace
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Job & Internship Opportunities
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Discover roles with transparent skill requirements and evidence-driven matching.
          </p>
        </div>

        {companies.length > 0 && (
          <button
            data-tour="jobs-create-btn"
            onClick={() => setShowPostModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all flex items-center gap-1.5 shadow-md shadow-[#93B2F8]/10 shrink-0"
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            <span>Post Opportunity</span>
          </button>
        )}
      </div>

      {/* Mini Job & Hiring Pipeline Progress Bar (Requirement A2.6) */}
      <div className="p-3 bg-[#161522] rounded-xl border border-[#2b2a3c] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
            Hiring Pipeline:
          </span>
          {['Draft', 'Active', 'Interview', 'Selected', 'Closed'].map((stage, idx) => (
            <React.Fragment key={stage}>
              {idx > 0 && <span className="text-zinc-600 font-bold">&rarr;</span>}
              <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                stage === 'Active'
                  ? 'bg-[#8861dc] text-white border border-[#a855f7]'
                  : stage === 'Draft'
                  ? 'bg-[#8861dc]/20 text-[#c4b5fd]'
                  : 'bg-[#1e1d2b] text-zinc-400'
              }`}>
                {stage}
              </span>
            </React.Fragment>
          ))}
        </div>
        <a
          href="/help#FC-11"
          className="text-[#93b2f8] hover:text-white font-semibold text-[11px] flex items-center gap-1"
        >
          <span>See hiring pipeline (FC-11)</span>
          <span>&rarr;</span>
        </a>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search roles, skills, or companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
          />
        </div>

        <select
          aria-label="Filter by Work Mode"
          value={workModeFilter}
          onChange={(e) => setWorkModeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
        >
          <option value="">All Work Modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="on-site">On-site</option>
        </select>

        <select
          aria-label="Filter by Employment Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Internship">Internship</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 bg-[#15151a] border border-[#282836] rounded-2xl animate-pulse">
              <div className="h-5 w-48 bg-[#1b1b22] rounded mb-2" />
              <div className="h-4 w-32 bg-[#1b1b22] rounded mb-4" />
              <div className="h-8 w-full bg-[#1b1b22] rounded" />
            </Card>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 bg-[#15151a] border border-[#282836] rounded-2xl text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center mb-3 text-zinc-400">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Opportunities Found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-5 leading-relaxed">
            There are currently no job postings matching your filter criteria. Try adjusting keywords or clear filters.
          </p>
          {companies.length > 0 && (
            <button
              onClick={() => setShowPostModal(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all"
            >
              Post the First Role
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const reqs = job.requirements || [];
            const requiredSkills = reqs.filter((r: any) => r.importance === 'required');

            return (
              <Card
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="p-5 bg-[#15151a] border border-[#282836] hover:border-[#93B2F8]/40 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1b1b22] border border-[#282836] flex items-center justify-center shrink-0 overflow-hidden">
                        {job.company?.logo ? (
                          <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#93B2F8]">
                            {job.company?.name?.slice(0, 2).toUpperCase() || 'SF'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#93B2F8] transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                          <span className="font-semibold text-zinc-300">{job.company?.name || 'Company'}</span>
                          {job.company?.verificationStatus === 'verified' && (
                            <span className="text-blue-400 font-bold" title="Verified Company">
                              ✓
                            </span>
                          )}
                          {job.location && <span>• {job.location}</span>}
                        </div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1b1b22] text-[#93B2F8] border border-[#282836] shrink-0">
                      {job.workMode ? job.workMode.toUpperCase() : 'REMOTE'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required skills */}
                  {requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {requiredSkills.slice(0, 4).map((r: any) => (
                        <span
                          key={r.id}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#0A1680]/30 text-[#93B2F8] border border-[#93B2F8]/30"
                        >
                          {r.skillName}
                        </span>
                      ))}
                      {requiredSkills.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-zinc-500">
                          +{requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-[#282836]/60 flex items-center justify-between text-xs text-zinc-400">
                  <span>
                    {job.salaryMin && job.salaryMax ? (
                      <strong className="text-emerald-400 font-bold">
                        ${(job.salaryMin / 1000).toFixed(0)}k–${(job.salaryMax / 1000).toFixed(0)}k
                      </strong>
                    ) : (
                      <span>{job.employmentType || 'Full-time'}</span>
                    )}
                  </span>
                  <span className="text-[#93B2F8] font-bold group-hover:translate-x-0.5 transition-transform">
                    View & Apply →
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onApplied={() => {
            fetchJobs();
          }}
        />
      )}

      {/* Post Modal */}
      {showPostModal && targetCompanyId && (
        <JobPostModal
          companyId={targetCompanyId}
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          onCreated={() => {
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};
