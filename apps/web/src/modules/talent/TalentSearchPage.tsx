import React, { useState, useEffect } from 'react';

interface EvidenceHighlight {
  type: string;
  count: number;
  label: string;
}

interface Candidate {
  id: string;
  userId?: string;
  name: string;
  headline: string;
  location: string;
  workMode: string;
  experienceYears: number;
  availability: string;
  skills: string[];
  evidenceHighlights: EvidenceHighlight[];
  whyThisCandidate: string;
  verifiedProjectCount: number;
  contributionCount: number;
  recruiterVisible: boolean;
}

interface SavedSearch {
  id: string;
  name: string;
  companyId?: string;
  filters: any;
  createdAt: string;
}

const COMMON_SKILLS = [
  'TypeScript',
  'React',
  'Python',
  'Node.js',
  'FastAPI',
  'PostgreSQL',
  'Docker',
  'TailwindCSS',
  'Figma',
  'Go',
];

export const TalentSearchPage: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedEvidenceTypes, setSelectedEvidenceTypes] = useState<string[]>([]);
  const [minExpYears, setMinExpYears] = useState<number>(0);
  const [workMode, setWorkMode] = useState<string>('flexible');
  const [availability, setAvailability] = useState<string>('flexible');

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [savingSearch, setSavingSearch] = useState(false);

  // Shortlisted tracking
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/v1/talent/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery || undefined,
          skills: selectedSkills.length > 0 ? selectedSkills : undefined,
          evidenceTypes: selectedEvidenceTypes.length > 0 ? selectedEvidenceTypes : undefined,
          minExperienceYears: minExpYears > 0 ? minExpYears : undefined,
          workMode: workMode !== 'flexible' ? workMode : undefined,
          availability: availability !== 'flexible' ? availability : undefined,
          limit: 30,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to query candidate talent directory');
      }

      const data = await res.json();
      setCandidates(data.candidates || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Error searching candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch('/api/v1/talent/saved-searches?companyId=m2-demo-company');
      if (res.ok) {
        const data = await res.json();
        setSavedSearches(data.searches || []);
      }
    } catch (e) {
      console.error('Failed to load saved searches:', e);
    }
  };

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [selectedSkills, selectedEvidenceTypes, minExpYears, workMode, availability]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCandidates();
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleEvidenceType = (evType: string) => {
    setSelectedEvidenceTypes((prev) =>
      prev.includes(evType) ? prev.filter((t) => t !== evType) : [...prev, evType]
    );
  };

  const handleSaveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveSearchName.trim()) return;

    try {
      setSavingSearch(true);
      const payload = {
        name: saveSearchName,
        companyId: 'm2-demo-company',
        filters: {
          query: searchQuery,
          skills: selectedSkills,
          evidenceTypes: selectedEvidenceTypes,
          minExperienceYears: minExpYears,
          workMode,
          availability,
        },
      };

      const res = await fetch('/api/v1/talent/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save search preset');
      }

      setShowSaveModal(false);
      setSaveSearchName('');
      await fetchSavedSearches();
    } catch (err: any) {
      alert(err.message || 'Error saving search');
    } finally {
      setSavingSearch(false);
    }
  };

  const applySavedSearch = (s: SavedSearch) => {
    const f = s.filters || {};
    setSearchQuery(f.query || '');
    setSelectedSkills(f.skills || []);
    setSelectedEvidenceTypes(f.evidenceTypes || []);
    setMinExpYears(f.minExperienceYears || 0);
    setWorkMode(f.workMode || 'flexible');
    setAvailability(f.availability || 'flexible');
  };

  const toggleShortlist = (candidateId: string) => {
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[#15151a] border border-[#282836] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0A1680]/70 text-[#93B2F8] border border-[#93B2F8]/30">
              Recruiter Talent Market
            </span>
            <span className="text-xs text-zinc-400">• Verified Proof Search</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recruiter Talent Search & Filtering</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Search candidates strictly by verified evidence: GitHub code commits, completed tasks, collaborative
            projects, and accredited credentials. Only recruiter-visible candidates are displayed.
          </p>
        </div>

        {/* Saved Searches Dropdown & Save Button */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {savedSearches.length > 0 && (
            <select
              onChange={(e) => {
                const found = savedSearches.find((s) => s.id === e.target.value);
                if (found) applySavedSearch(found);
              }}
              defaultValue=""
              className="px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs font-semibold focus:outline-none focus:border-[#93B2F8]"
            >
              <option value="" disabled>
                Load Saved Search...
              </option>
              {savedSearches.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-[#1b1b22] hover:bg-[#282836] border border-[#282836] transition-all flex items-center gap-1.5"
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
              <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v13.5a.5.5 0 01-.777.416L8 12.673l-5.223 3.243A.5.5 0 012 15.5V2z" />
            </svg>
            Save Search
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Candidate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-5 p-5 rounded-2xl bg-[#15151a] border border-[#282836] h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Filter Proof Criteria</h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSkills([]);
                setSelectedEvidenceTypes([]);
                setMinExpYears(0);
                setWorkMode('flexible');
                setAvailability('flexible');
              }}
              className="text-[11px] font-semibold text-[#93B2F8] hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit}>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Keyword / Role</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search engineer or skill..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
              />
              <svg
                className="absolute left-2.5 top-2.5 text-zinc-500"
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="currentColor"
              >
                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
              </svg>
            </div>
          </form>

          {/* Evidence Types */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Verified Evidence Types</label>
            <div className="space-y-1.5 text-xs text-zinc-300">
              {[
                { id: 'github_commits', label: 'GitHub Code Commits' },
                { id: 'tasks', label: 'Completed Tasks' },
                { id: 'verified_projects', label: 'Verified Team Projects' },
                { id: 'certificates', label: 'Verified Certifications' },
              ].map((ev) => (
                <label
                  key={ev.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1b1b22] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvidenceTypes.includes(ev.id)}
                    onChange={() => toggleEvidenceType(ev.id)}
                    className="rounded border-[#282836] bg-[#1b1b22] text-[#93B2F8] focus:ring-0"
                  />
                  <span>{ev.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2">Technical Skills</label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.map((sk) => {
                const active = selectedSkills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      active
                        ? 'bg-[#93B2F8] text-[#0A1680] shadow-sm'
                        : 'bg-[#1b1b22] text-zinc-400 hover:text-white border border-[#282836]'
                    }`}
                  >
                    {sk}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Work Arrangement</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
            >
              <option value="flexible">Any Mode</option>
              <option value="remote">Remote Only</option>
              <option value="hybrid">Hybrid</option>
              <option value="on-site">On-site</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Candidate Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs focus:outline-none focus:border-[#93B2F8]"
            >
              <option value="flexible">Any Availability</option>
              <option value="immediate">Immediate Availability</option>
              <option value="2_weeks">Within 2 Weeks</option>
              <option value="1_month">Within 1 Month</option>
            </select>
          </div>

          {/* Minimum Experience */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
              <span className="font-semibold">Min Experience:</span>
              <span className="text-white font-bold">{minExpYears === 0 ? 'Any' : `${minExpYears}+ yrs`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={minExpYears}
              onChange={(e) => setMinExpYears(Number(e.target.value))}
              className="w-full accent-[#93B2F8]"
            />
          </div>
        </div>

        {/* Right Candidate Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-zinc-400">
              Showing <span className="text-white font-bold">{candidates.length}</span> of{' '}
              <span className="text-white font-bold">{total}</span> matching recruiter-visible candidates
            </span>
            {shortlistedIds.size > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                {shortlistedIds.size} Shortlisted
              </span>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="p-5 rounded-2xl bg-[#15151a] border border-[#282836] animate-pulse h-64" />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && candidates.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-[#15151a] border border-[#282836] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b22] border border-[#282836] mx-auto flex items-center justify-center text-[#93B2F8]">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-white">No Matching Candidates Found</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Try widening your skill filters or adjusting availability parameters. Candidates with visibility toggled
                off are excluded.
              </p>
            </div>
          )}

          {/* Candidate Cards Grid */}
          {!loading && candidates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand) => {
                const isShortlisted = shortlistedIds.has(cand.id);

                return (
                  <div
                    key={cand.id}
                    className="p-5 rounded-2xl bg-[#15151a] hover:bg-[#181822] border border-[#282836] transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#0A1680] border border-[#93B2F8]/30 flex items-center justify-center text-base font-bold text-[#93B2F8]">
                            {cand.name[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white group-hover:text-[#93B2F8] transition-colors">
                              {cand.name}
                            </h3>
                            <p className="text-xs text-zinc-400 leading-snug line-clamp-1">{cand.headline}</p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                            cand.availability === 'immediate'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#1b1b22] text-zinc-400 border border-[#282836]'
                          }`}
                        >
                          {cand.availability.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Location & Meta Chips */}
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor">
                            <path fillRule="evenodd" d="M11.536 3.464a5 5 0 010 7.072L8 14.07l-3.536-3.535a5 5 0 117.072-7.072v.001zm1.06 8.132a6.5 6.5 0 10-9.192 0l3.535 3.536a1.5 1.5 0 002.122 0l3.535-3.536zM8 9a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                          {cand.location}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{cand.workMode}</span>
                        <span>•</span>
                        <span>{cand.experienceYears} yrs exp</span>
                      </div>

                      {/* Skills Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cand.skills.slice(0, 5).map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1b1b22] text-[#93B2F8] border border-[#282836]"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>

                      {/* Evidence Highlights */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cand.evidenceHighlights.map((h, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/30 text-emerald-300 border border-emerald-500/20"
                          >
                            {h.label}
                          </span>
                        ))}
                      </div>

                      {/* Why this candidate rationale box */}
                      <div className="p-3 rounded-xl bg-[#1b1b22]/70 border border-[#282836] text-[11px] text-zinc-300 leading-relaxed font-sans">
                        <span className="text-[#93B2F8] font-bold">Proof Match Rationale: </span>
                        {cand.whyThisCandidate}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#282836]">
                      <button
                        type="button"
                        onClick={() => toggleShortlist(cand.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                          isShortlisted
                            ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                            : 'bg-[#1b1b22] text-zinc-300 hover:text-white border border-[#282836]'
                        }`}
                      >
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                          <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v13.5a.5.5 0 01-.777.416L8 12.673l-5.223 3.243A.5.5 0 012 15.5V2z" />
                        </svg>
                        {isShortlisted ? 'Shortlisted' : 'Shortlist Candidate'}
                      </button>

                      <a
                        href={`/portfolio?userId=${cand.userId || cand.id}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#93B2F8] hover:text-white hover:bg-[#1b1b22] transition-all"
                      >
                        View Full Proof →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Save Search Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Save Search Preset</h3>
            <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
              Store this combination of verified evidence types, skills, and work arrangements for quick access.
            </p>

            <form onSubmit={handleSaveSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Preset Name *</label>
                <input
                  type="text"
                  required
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="e.g. Remote Senior React + TS Leads"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-[#93B2F8]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#1b1b22] border border-[#282836] text-xs text-zinc-400 space-y-1">
                <div>
                  <span className="text-white font-medium">Selected Skills: </span>
                  {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'Any'}
                </div>
                <div>
                  <span className="text-white font-medium">Evidence Types: </span>
                  {selectedEvidenceTypes.length > 0 ? selectedEvidenceTypes.join(', ') : 'All'}
                </div>
                <div>
                  <span className="text-white font-medium">Work Mode: </span>
                  {workMode}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-[#1b1b22] border border-[#282836]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSearch}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 disabled:opacity-50"
                >
                  {savingSearch ? 'Saving...' : 'Save Preset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
