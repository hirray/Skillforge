import React, { useState, useEffect } from 'react';

interface UserProfile {
  id: string;
  name: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  pronouns?: string;
  city?: string;
  region?: string;
  country?: string;
  workMode?: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  availability?: string;
  matchingOptIn?: boolean;
  visibilitySettings?: {
    profile?: boolean;
    skills?: boolean;
    proof?: boolean;
    experience?: boolean;
    education?: boolean;
    contact?: boolean;
  };
  skills?: any[];
  experiences?: any[];
  educations?: any[];
  certifications?: any[];
}

export const ProfileEditorPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  // Skill Add Modal
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [skillSearchResults, setSkillSearchResults] = useState<any[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillLevel, setSkillLevel] = useState(3);
  const [skillYoe, setSkillYoe] = useState(2);
  const [skillEvidenceLink, setSkillEvidenceLink] = useState('');

  // Experience Modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expCurrent, setExpCurrent] = useState(false);
  const [expDesc, setExpDesc] = useState('');

  const token = localStorage.getItem('token') || 'user-001';

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data.user);
      setCompleteness(data.completeness);
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      setSaving(true);
      setStatus(null);
      const res = await fetch('/api/v1/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          displayName: profile.displayName,
          headline: profile.headline,
          bio: profile.bio,
          pronouns: profile.pronouns,
          city: profile.city,
          country: profile.country,
          workMode: profile.workMode,
          githubUsername: profile.githubUsername,
          linkedinUrl: profile.linkedinUrl,
          portfolioUrl: profile.portfolioUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      setProfile(data.user);
      setCompleteness(data.completeness);
      setStatus({ success: 'Profile successfully updated.' });
    } catch (err: any) {
      setStatus({ error: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAvailability = async (newStatus: string) => {
    try {
      const res = await fetch('/api/v1/users/me/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, availability: newStatus } : null));
        setStatus({ success: `Availability updated to ${newStatus}` });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVisibility = async (key: string, val: boolean) => {
    if (!profile) return;
    const newSettings = { ...profile.visibilitySettings, [key]: val };
    try {
      const res = await fetch('/api/v1/users/me/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        setProfile((prev) => (prev ? { ...prev, visibilitySettings: newSettings } : null));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSkills = async (val: string) => {
    setSkillSearch(val);
    if (!val.trim()) {
      setSkillSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/v1/skills?q=${encodeURIComponent(val)}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setSkillSearchResults(data.data || []);
      }
    } catch (e) {}
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;
    try {
      const res = await fetch('/api/v1/users/me/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          skillId: selectedSkillId,
          level: skillLevel,
          yearsOfExperience: skillYoe,
          evidenceLinks: skillEvidenceLink.trim() ? [skillEvidenceLink.trim()] : [],
        }),
      });
      if (res.ok) {
        setShowSkillModal(false);
        setSkillSearch('');
        setSelectedSkillId('');
        setSkillEvidenceLink('');
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/v1/users/me/skills/${skillId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/users/me/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company: expCompany,
          title: expTitle,
          startDate: expStartDate,
          endDate: expCurrent ? undefined : expEndDate,
          current: expCurrent,
          description: expDesc,
        }),
      });
      if (res.ok) {
        setShowExpModal(false);
        setExpCompany('');
        setExpTitle('');
        setExpStartDate('');
        setExpEndDate('');
        setExpDesc('');
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/users/me/experience/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchProfile();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400 text-xs">
        Loading profile credentials...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-[#282836] pb-5">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Professional Profile & Visibility</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
              Auditable Proof
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Universal engineer profile powering your talent discovery dossier, AI job-matching, and team reputation.
          </p>
        </div>
        <a
          href={`/users/${profile?.id || 'user-001'}`}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 rounded-xl border border-[#282836] hover:border-[#93B2F8] text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>Preview Public View</span>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h7v7M13 3 8 8" />
          </svg>
        </a>
      </div>

      {status?.error && (
        <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
          {status.error}
        </div>
      )}
      {status?.success && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
          {status.success}
        </div>
      )}

      {/* Completeness Meter */}
      {completeness && (
        <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-white">Profile Readiness Score</p>
              <p className="text-[11px] text-zinc-400">Complete profiles rank higher in recruiter searches and AI talent matching</p>
            </div>
            <span className="text-base font-extrabold text-[#93B2F8]">{completeness.percentage}%</span>
          </div>
          <div className="w-full bg-[#1b1b22] h-2.5 rounded-full overflow-hidden border border-[#282836]">
            <div
              className="h-full bg-gradient-to-r from-[#0A1680] to-[#93B2F8] transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            {completeness.checks.map((chk: any, idx: number) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
                  chk.done
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#1b1b22] border-[#282836] text-zinc-400'
                }`}
              >
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {chk.done ? (
                    <path d="M3.5 8.5l3 3 6-6" />
                  ) : (
                    <circle cx="8" cy="8" r="6" />
                  )}
                </svg>
                <span className="truncate">{chk.item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability Bar */}
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-white">Current Availability Status</p>
          <p className="text-[11px] text-zinc-400">Signals your immediate willingness to engage with engineering teams</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'immediate', label: 'Immediate' },
            { id: 'two_weeks', label: '2 Weeks Notice' },
            { id: 'one_month', label: '1 Month Notice' },
            { id: 'not_looking', label: 'Not Looking' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => handleUpdateAvailability(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                profile?.availability === st.id
                  ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 shadow-sm shadow-[#0A1680]/50'
                  : 'bg-[#1b1b22] text-zinc-400 border border-[#282836] hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Basic Info & Social */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateBasic} className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white pb-2 border-b border-[#282836]">Basic Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, name: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Display / Preferred Name</label>
                <input
                  type="text"
                  value={profile?.displayName || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, displayName: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Professional Headline</label>
              <input
                type="text"
                placeholder="Senior Distributed Systems & Go Engineer"
                value={profile?.headline || ''}
                onChange={(e) => setProfile((p) => p && { ...p, headline: e.target.value })}
                className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Bio / Engineering Philosophy</label>
              <textarea
                rows={4}
                placeholder="Describe your technical architecture focus and what problems you love solving..."
                value={profile?.bio || ''}
                onChange={(e) => setProfile((p) => p && { ...p, bio: e.target.value })}
                className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">City</label>
                <input
                  type="text"
                  value={profile?.city || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, city: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={profile?.country || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, country: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Work Mode</label>
                <select
                  value={profile?.workMode || 'remote'}
                  onChange={(e) => setProfile((p) => p && { ...p, workMode: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none cursor-pointer"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">GitHub Username</label>
                <input
                  type="text"
                  placeholder="octocat"
                  value={profile?.githubUsername || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, githubUsername: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={profile?.linkedinUrl || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, linkedinUrl: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Personal Portfolio</label>
                <input
                  type="url"
                  placeholder="https://myportfolio.dev"
                  value={profile?.portfolioUrl || ''}
                  onChange={(e) => setProfile((p) => p && { ...p, portfolioUrl: e.target.value })}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors shadow-md shadow-[#93B2F8]/20"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>

          {/* Verified Skills Section */}
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <div>
                <h2 className="text-sm font-bold text-white">Skills & Evidence Proof</h2>
                <p className="text-[11px] text-zinc-400">Canonical taxonomy skills attached to your candidate profile</p>
              </div>
              <button
                onClick={() => setShowSkillModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0A1680] hover:bg-[#1222a0] text-[#93B2F8] border border-[#93B2F8]/30 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>+ Add Skill</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(profile?.skills || []).map((sk) => (
                <div
                  key={sk.id}
                  className="p-3 bg-[#1b1b22] border border-[#282836] rounded-xl flex items-start justify-between text-xs"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span>{sk.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        Lvl {sk.level} · {sk.yearsOfExperience}y
                      </span>
                    </p>
                    <p className="text-[11px] text-zinc-400">{sk.category}</p>
                    {sk.evidenceLinks && sk.evidenceLinks.length > 0 && (
                      <p className="text-[10px] text-[#93B2F8] flex items-center gap-1">
                        <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 3h7v7M13 3 8 8" />
                        </svg>
                        <span>{sk.evidenceLinks.length} auditable proof link(s)</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(sk.skillId)}
                    className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {(!profile?.skills || profile.skills.length === 0) && (
                <p className="col-span-2 text-xs text-zinc-500 py-3 text-center">
                  No skills added yet. Click "+ Add Skill" to attach verified capabilities.
                </p>
              )}
            </div>
          </div>

          {/* Work Experience Section */}
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <div>
                <h2 className="text-sm font-bold text-white">Work Experience</h2>
                <p className="text-[11px] text-zinc-400">Chronological software engineering history</p>
              </div>
              <button
                onClick={() => setShowExpModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0A1680] hover:bg-[#1222a0] text-[#93B2F8] border border-[#93B2F8]/30 text-xs font-bold transition-colors"
              >
                + Add Experience
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {(profile?.experiences || []).map((exp) => (
                <div key={exp.id} className="p-3 bg-[#1b1b22] border border-[#282836] rounded-xl flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white">{exp.title}</h3>
                    <p className="text-zinc-400">{exp.company} · {exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                    {exp.description && <p className="text-zinc-300 mt-1.5 leading-relaxed">{exp.description}</p>}
                  </div>
                  <button onClick={() => handleDeleteExperience(exp.id)} className="text-zinc-500 hover:text-rose-400 p-1">✕</button>
                </div>
              ))}
              {(!profile?.experiences || profile.experiences.length === 0) && (
                <p className="text-zinc-500 text-center py-2">No work experience logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Privacy & Visibility Settings */}
        <div className="space-y-6">
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-5 text-xs">
            <div className="pb-3 border-b border-[#282836]">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Visibility & Privacy Gates
              </h2>
              <p className="text-[11px] text-zinc-400 mt-1">
                Zero-knowledge default: only exposed to verified parties with your explicit consent.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { key: 'profile', label: 'Public Profile Visibility', desc: 'Visible in global developer directory' },
                { key: 'skills', label: 'Skills & Proficiency', desc: 'Allow recruiters to view your skill levels' },
                { key: 'proof', label: 'Verified Proof Dossier', desc: 'Expose code attestation and benchmark scores' },
                { key: 'experience', label: 'Work Experience', desc: 'Share past companies and job titles' },
                { key: 'education', label: 'Education & Certifications', desc: 'Allow viewing academic credentials' },
                { key: 'contact', label: 'Direct Recruiter Outreach', desc: 'Permit inbound messages from hiring managers' },
              ].map((item) => {
                const currentVal = profile?.visibilitySettings?.[item.key as keyof typeof profile.visibilitySettings] ?? true;
                return (
                  <div key={item.key} className="p-3 bg-[#1b1b22] rounded-xl border border-[#282836] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-[10px] text-zinc-400">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item.key, !currentVal)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        currentVal ? 'bg-[#0A1680] border border-[#93B2F8]/40' : 'bg-zinc-800 border border-zinc-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                          currentVal ? 'left-5 bg-[#93B2F8]' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 bg-[#0A1680]/20 border border-[#93B2F8]/30 rounded-xl space-y-2">
              <p className="font-bold text-white flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 1v14M1 8h14" />
                </svg>
                <span>Automated AI Job Matching</span>
              </p>
              <p className="text-[11px] text-zinc-300">
                Participate in anonymized AI model evaluations for high-fit engineering openings without revealing your identity until you accept outreach.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <h2 className="text-base font-bold text-white">Add Canonical Skill</h2>
              <button onClick={() => setShowSkillModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Search Taxonomy</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, React, Go, Kafka..."
                  value={skillSearch}
                  onChange={(e) => handleSearchSkills(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
                {skillSearchResults.length > 0 && (
                  <div className="mt-2 max-h-36 overflow-y-auto space-y-1 bg-[#1b1b22] border border-[#282836] rounded-xl p-2">
                    {skillSearchResults.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedSkillId(s.id);
                          setSkillSearch(s.name);
                          setSkillSearchResults([]);
                        }}
                        className={`p-2 rounded-lg cursor-pointer flex items-center justify-between hover:bg-[#252530] ${
                          selectedSkillId === s.id ? 'bg-[#0A1680] text-[#93B2F8]' : 'text-zinc-300'
                        }`}
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[10px] text-zinc-400">{s.category}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Proficiency Level (1-5)</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(parseInt(e.target.value, 10))}
                    className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8]"
                  >
                    <option value={1}>1 - Novice</option>
                    <option value={2}>2 - Intermediate</option>
                    <option value={3}>3 - Competent</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Principal Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Years of Exp</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={skillYoe}
                    onChange={(e) => setSkillYoe(parseInt(e.target.value, 10))}
                    className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Evidence URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/my-repo or demo url"
                  value={skillEvidenceLink}
                  onChange={(e) => setSkillEvidenceLink(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] focus:border-[#93B2F8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedSkillId}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] disabled:opacity-40"
                >
                  Attach Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <h2 className="text-base font-bold text-white">Add Work Experience</h2>
              <button onClick={() => setShowExpModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddExperience} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Northstar Labs"
                  value={expCompany}
                  onChange={(e) => setExpCompany(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                />
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Title / Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="text"
                    required
                    placeholder="YYYY-MM"
                    value={expStartDate}
                    onChange={(e) => setExpStartDate(e.target.value)}
                    className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">End Date</label>
                  <input
                    type="text"
                    disabled={expCurrent}
                    placeholder="YYYY-MM"
                    value={expEndDate}
                    onChange={(e) => setExpEndDate(e.target.value)}
                    className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836] disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={expCurrent}
                    onChange={(e) => setExpCurrent(e.target.checked)}
                    className="rounded border-[#282836] bg-[#1b1b22]"
                  />
                  <span>I currently work here</span>
                </label>
              </div>
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Key Engineering Deliverables</label>
                <textarea
                  rows={3}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Architected microservices that handled 50k RPS..."
                  className="w-full bg-[#1b1b22] text-white p-2.5 rounded-xl border border-[#282836]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowExpModal(false)} className="px-4 py-2 text-zinc-400">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold text-xs text-[#0A1680] bg-[#93B2F8]">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
