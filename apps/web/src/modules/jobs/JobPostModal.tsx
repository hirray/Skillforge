import React, { useState } from 'react';
import { api } from '../ai/client';

export interface JobPostModalProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (job: any) => void;
}

export const JobPostModal: React.FC<JobPostModalProps> = ({
  companyId,
  isOpen,
  onClose,
  onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workMode, setWorkMode] = useState<'remote' | 'hybrid' | 'on-site'>('remote');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const currency = 'USD';
  const [benefits, setBenefits] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Active'>('Active');

  // Dynamic Skill Requirements
  const [requirements, setRequirements] = useState<
    Array<{ skillName: string; importance: 'required' | 'preferred'; minProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>
  >([
    { skillName: 'React', importance: 'required', minProficiency: 'intermediate' },
  ]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillImportance, setNewSkillImportance] = useState<'required' | 'preferred'>('required');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setRequirements([
      ...requirements,
      {
        skillName: newSkillName.trim(),
        importance: newSkillImportance,
        minProficiency: newSkillLevel,
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Check PRD business rule
    if (status === 'Active' && !requirements.some((r) => r.importance === 'required')) {
      setError('Active job listings require at least one required skill requirement.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await api<{ data: any }>('/jobs', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          title: title.trim(),
          department: department.trim() || null,
          employmentType,
          workMode,
          location: location.trim() || null,
          description: description.trim(),
          responsibilities: responsibilities.trim() || null,
          salaryMin: salaryMin === '' ? null : Number(salaryMin),
          salaryMax: salaryMax === '' ? null : Number(salaryMax),
          currency,
          benefits: benefits.trim() || null,
          applicationUrl: applicationUrl.trim() || null,
          status,
          requirements,
        }),
      });

      onCreated(res.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to post job opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-2xl w-full shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#282836]">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">Post New Opportunity</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Specify clear role responsibilities and verified skill requirements.
            </p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Section 1: Role Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Machine Learning Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Department / Team</label>
              <input
                type="text"
                placeholder="e.g. Autonomous Agents & Platform"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Employment Type</label>
              <select
                aria-label="Employment Type"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Work Mode</label>
              <select
                aria-label="Work Mode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              >
                <option value="remote">Fully Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Location / Timezones</label>
              <input
                type="text"
                placeholder="e.g. San Francisco or Remote (US/EU)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>
          </div>

          {/* Section 2: Requirements */}
          <div className="p-4 bg-[#1b1b22] border border-[#282836] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white uppercase tracking-wider text-[11px]">
                Skill Requirements (Must have at least 1 required) *
              </label>
              <span className="text-[11px] text-zinc-400">{requirements.length} configured</span>
            </div>

            {/* List of current skills */}
            <div className="flex flex-wrap gap-2">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 border ${
                    req.importance === 'required'
                      ? 'bg-[#0A1680]/40 text-[#93B2F8] border-[#93B2F8]/40'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  }`}
                >
                  <span className="font-bold">{req.skillName}</span>
                  <span className="text-[10px] opacity-75">({req.minProficiency})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="hover:text-red-400 font-bold ml-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Add new skill inline row */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#282836]">
              <input
                type="text"
                placeholder="Skill name (e.g. TypeScript, PyTorch)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
              <select
                aria-label="Skill Importance"
                value={newSkillImportance}
                onChange={(e) => setNewSkillImportance(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs"
              >
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
              </select>
              <select
                aria-label="Skill Proficiency"
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-xl bg-[#93B2F8] text-[#0A1680] text-xs font-bold hover:bg-[#b0c7fa]"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Section 3: Descriptions */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Role Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the opportunity, core challenges, and day-to-day impact..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Key Responsibilities</label>
              <textarea
                rows={2}
                placeholder="Bullet points or summary of what the engineer owns..."
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Benefits / Perks</label>
                <input
                  type="text"
                  placeholder="e.g. Health coverage, 401k match, remote stipend"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">External Application URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://jobs.lever.co/company/role"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Compensation & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Salary Min (Annual)</label>
              <input
                type="number"
                placeholder="120000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Salary Max (Annual)</label>
              <input
                type="number"
                placeholder="160000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Publish Status</label>
              <select
                aria-label="Publish Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
              >
                <option value="Active">Active (Published to matching)</option>
                <option value="Draft">Draft (Private)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#282836]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20"
            >
              {submitting ? 'Publishing...' : status === 'Active' ? 'Publish Opportunity' : 'Save Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
