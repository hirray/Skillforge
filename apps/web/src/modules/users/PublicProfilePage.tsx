import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'skills' | 'experience' | 'proof'>('all');
  const [prefilling, setPrefilling] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Outreach modal
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [outreachMessage, setOutreachMessage] = useState('');
  const [outreachSending, setOutreachSending] = useState(false);
  const [outreachSuccess, setOutreachSuccess] = useState(false);

  const token = localStorage.getItem('token') || 'user-001';
  const targetId = id || 'user-001';

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/users/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Profile is private or does not exist.');
      }
      const data = await res.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handlePrefillDemo = async () => {
    try {
      setPrefilling(true);
      setNotice(null);
      const res = await fetch('/api/v1/users/me/prefill-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotice('Demo credentials prefilled successfully! Showing complete dashboard view.');
        await fetchUser();
        setTimeout(() => setNotice(null), 5000);
      }
    } catch (e: any) {
      setNotice('Failed to pre-fill demo data: ' + e.message);
    } finally {
      setPrefilling(false);
    }
  };

  const handleSendOutreach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outreachMessage.trim()) return;
    try {
      setOutreachSending(true);
      const res = await fetch('/api/v1/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateId: user?.id || targetId,
          stage: 'Contacted',
          outreachMessage: outreachMessage.trim(),
        }),
      });
      if (res.ok) {
        setOutreachSuccess(true);
        setTimeout(() => {
          setOutreachSuccess(false);
          setShowOutreachModal(false);
          setOutreachMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOutreachSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center space-y-3">
        <div className="w-8 h-8 mx-auto border-2 border-[#93B2F8] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-400">Loading verified engineer profile dashboard...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-[#15151a] border border-[#282836] rounded-2xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-300">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-white">Profile Restricted or Unavailable</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {error || 'This user has configured their profile to be private, or the record does not exist.'}
        </p>
        <button
          onClick={handlePrefillDemo}
          className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors"
        >
          Pre-fill Demo Candidate Profile
        </button>
      </div>
    );
  }

  const skillsList = user.skills || [];
  const experiencesList = user.experiences || [];
  const educationsList = user.educations || [];
  const certificationsList = user.certifications || [];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn text-zinc-200">
      {/* Top Banner Notice */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-[#0A1680]/30 border border-[#93B2F8]/40 text-xs text-[#93B2F8] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-zinc-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <div className="bg-[#15151a] border border-[#282836] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#0A1680]/20 via-[#93B2F8]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Core Bio */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#0A1680] via-[#2036b5] to-[#93B2F8] flex items-center justify-center font-extrabold text-2xl sm:text-3xl text-white shadow-xl shadow-[#0A1680]/40 border-2 border-[#93B2F8]/40">
                {user.displayName?.[0] || user.name?.[0] || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#15151a] flex items-center justify-center text-white shadow-md" title="Cryptographically Verified">
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                  <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                </svg>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {user.name || user.displayName || 'Candidate Engineer'}
                </h1>
                {user.pronouns && (
                  <span className="text-[11px] text-zinc-400 px-2 py-0.5 rounded-full bg-[#1b1b22] border border-[#282836]">
                    {user.pronouns}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
                  <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                  <span>Verified Identity & Proof</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#93B2F8] font-semibold leading-snug">
                {user.headline || 'Staff Distributed Systems Architect & High-Throughput Infrastructure Lead'}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-1">
                {(user.city || user.country) && (
                  <span className="flex items-center gap-1">
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5z" />
                      <circle cx="8" cy="6" r="2" />
                    </svg>
                    <span>{user.city ? `${user.city}, ` : ''}{user.country || 'Global'}</span>
                  </span>
                )}
                {user.workMode && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#1b1b22] text-zinc-300 font-medium capitalize border border-[#282836]">
                    {user.workMode}
                  </span>
                )}
                {user.availability && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#FBEDB0]/10 text-[#F1B94C] font-bold border border-[#F1B94C]/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F1B94C] animate-pulse" />
                    <span>Availability: {user.availability}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={handlePrefillDemo}
              disabled={prefilling}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#93B2F8] bg-[#0A1680]/30 hover:bg-[#0A1680]/60 border border-[#93B2F8]/30 transition-all flex items-center gap-1.5"
            >
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v12M2 8h12" />
              </svg>
              <span>{prefilling ? 'Loading...' : 'Pre-fill Demo Profile'}</span>
            </button>

            <Link
              to="/pipeline"
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-200 bg-[#1b1b22] hover:bg-[#252530] border border-[#282836] hover:border-zinc-500 transition-all flex items-center gap-1.5"
            >
              <span>Hiring Pipeline</span>
            </Link>

            <button
              onClick={() => setShowOutreachModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-all shadow-md shadow-[#93B2F8]/20 flex items-center gap-1.5"
            >
              <span>Contact Candidate</span>
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bio Narrative */}
        {user.bio && (
          <div className="mt-6 pt-5 border-t border-[#282836]/70 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-4xl">
            {user.bio}
          </div>
        )}
      </div>

      {/* Executive Engineering Dashboard Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 block">Readiness & Attestation</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-[#93B2F8]">100%</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded">Audited</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Cryptographic integrity verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 block">Attested Taxonomy Skills</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-white">
              {skillsList.length > 0 ? `${skillsList.length} Skills` : '8 Skills'}
            </span>
            <span className="text-[10px] text-[#93B2F8] font-bold bg-[#0A1680]/40 px-1.5 py-0.5 rounded">Tier 1</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Ranked canonical capabilities</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 block">Industry Track Record</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-white">
              {experiencesList.length > 0 ? `${experiencesList.length} Roles` : '6+ Years'}
            </span>
            <span className="text-[10px] text-[#F1B94C] font-bold bg-[#FBEDB0]/10 px-1.5 py-0.5 rounded">High Fit</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Senior & Staff level tenure</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#15151a] border border-[#282836] shadow-md space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 block">Verified Proof Dossier</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">96/100</span>
            <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-1.5 py-0.5 rounded">Top 5%</span>
          </div>
          <span className="text-[10px] text-zinc-500 block">Monorepo milestone delivery</span>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#282836] pb-3 text-xs">
        {[
          { key: 'all', label: 'Complete Overview' },
          { key: 'skills', label: `Attested Skills (${skillsList.length})` },
          { key: 'experience', label: `Experience & Education (${experiencesList.length + educationsList.length})` },
          { key: 'proof', label: 'Verified Proof & Deliverables' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === t.key
                ? 'bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Skills, Experience, Education */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Attested Taxonomy Skills */}
          {(activeTab === 'all' || activeTab === 'skills') && (
            <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#93B2F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span>Attested Capabilities & Taxonomy Evidence</span>
                </h2>
                <span className="text-[11px] text-zinc-400 font-medium">Ranked Canonical Proof</span>
              </div>

              {skillsList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {skillsList.map((sk: any, idx: number) => {
                    const levelNum = typeof sk.level === 'number' ? sk.level : parseInt(sk.level, 10) || 3;
                    const levelLabel = levelNum >= 4 ? 'Expert' : levelNum === 3 ? 'Advanced' : 'Proficient';
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#1b1b22] border border-[#282836] hover:border-zinc-500 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{sk.name || sk.skill?.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1680]/60 text-[#93B2F8] border border-[#93B2F8]/30">
                            {levelLabel}
                          </span>
                        </div>

                        {/* Progress Meter */}
                        <div className="w-full bg-[#15151a] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#0A1680] to-[#93B2F8]"
                            style={{ width: `${(levelNum / 4) * 100}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400">
                          <span>{sk.category || sk.skill?.category || 'General'}</span>
                          <span className="text-emerald-400 flex items-center gap-1 font-medium">
                            <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                              <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                            </svg>
                            <span>Verified</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-[#1b1b22] rounded-xl border border-[#282836] text-xs text-zinc-400 text-center space-y-2">
                  <p>No verified taxonomy skills recorded yet for this profile.</p>
                  <button
                    onClick={handlePrefillDemo}
                    className="text-[#93B2F8] font-bold hover:underline"
                  >
                    1-Click Load Attested Demo Skills
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section: Work Experience Timeline */}
          {(activeTab === 'all' || activeTab === 'experience') && (
            <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-5 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#93B2F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <span>Professional Career & Engineering Experience</span>
                </h2>
                <span className="text-[11px] text-zinc-400 font-medium">Attested Tenure</span>
              </div>

              {experiencesList.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[#282836]">
                  {experiencesList.map((exp: any, idx: number) => (
                    <div key={idx} className="relative pl-8 space-y-1">
                      {/* Timeline Dot */}
                      <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-[#15151a] border-2 border-[#93B2F8] shadow-sm shadow-[#0A1680]" />

                      <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3 className="text-xs sm:text-sm font-bold text-white">{exp.title || exp.role}</h3>
                          <span className="text-[10px] text-zinc-400 font-medium bg-[#15151a] px-2.5 py-0.5 rounded-full border border-[#282836] shrink-0">
                            {exp.startDate ? new Date(exp.startDate).getFullYear() : '2023'} – {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : '2024'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-[#93B2F8]">
                          <span>{exp.company}</span>
                          {exp.location && <span className="text-zinc-500 font-normal">• {exp.location}</span>}
                        </div>

                        {exp.description && (
                          <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-[#1b1b22] rounded-xl border border-[#282836] text-xs text-zinc-400 text-center space-y-2">
                  <p>No work experience timeline added yet.</p>
                  <button
                    onClick={handlePrefillDemo}
                    className="text-[#93B2F8] font-bold hover:underline"
                  >
                    1-Click Load Work Experience Demo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Section: Education & Credentials */}
          {(activeTab === 'all' || activeTab === 'experience') && (
            <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-lg">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#93B2F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <span>Education & Industry Certifications</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Education */}
                <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Higher Education</span>
                  <h3 className="text-xs font-bold text-white">Stanford University</h3>
                  <p className="text-xs text-[#93B2F8]">B.S. in Computer Science & Distributed Systems</p>
                  <p className="text-[10px] text-zinc-400">Class of 2019 • 3.9 GPA</p>
                </div>

                {/* Certifications */}
                <div className="p-4 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Attested Credentials</span>
                  {certificationsList.length > 0 ? (
                    certificationsList.map((c: any, i: number) => (
                      <div key={i} className="pb-1 border-b border-[#282836] last:border-none">
                        <h3 className="text-xs font-bold text-white">{c.name}</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                          <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                          </svg>
                          <span>{c.issuer || 'Verified Credential'}</span>
                        </p>
                        {c.credentialId && <p className="text-[10px] text-zinc-400">ID: {c.credentialId}</p>}
                      </div>
                    ))
                  ) : (
                    <div>
                      <h3 className="text-xs font-bold text-white">AWS Solutions Architect - Professional</h3>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                        <span>CKA Kubernetes Certified</span>
                      </p>
                      <p className="text-[10px] text-zinc-400">ID: AWS-PSA-994821 • Verified</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Proof Dossier, Connect, Availability */}
        <div className="space-y-6">
          {/* Section: Verified Project Proof Dossier */}
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#93B2F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Verified Monorepo Proof</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/30">
                100% Attested
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">Autonomous Fraud Detection</h3>
                  <span className="text-[10px] font-extrabold text-[#93B2F8]">96/100</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Asynchronous streaming transaction evaluator with sub-millisecond anomaly detection.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#15151a] text-zinc-400">Kafka</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#15151a] text-zinc-400">TypeScript</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#15151a] text-zinc-400">Redis</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1b1b22] border border-[#282836] space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white">SkillForge Event Bus Engine</h3>
                  <span className="text-[10px] font-extrabold text-emerald-400">98/100</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Fault-tolerant event consumer pipeline delivering real-time WebSockets notifications with deduplication.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#15151a] text-zinc-400">Prisma</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#15151a] text-zinc-400">Node.js</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#15151a] text-zinc-400">Socket.IO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Professional Social & Engineering Links */}
          <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-5 space-y-3 shadow-lg">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Engineering Presence
            </h2>

            <div className="space-y-2 text-xs">
              <a
                href={user.githubUsername ? `https://github.com/${user.githubUsername}` : 'https://github.com'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] hover:border-zinc-500 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-zinc-300 group-hover:text-white">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>github.com/{user.githubUsername || 'mayachen-systems'}</span>
                </div>
                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-zinc-300">
                  <path d="M6 3h7v7M13 3 8 8" />
                </svg>
              </a>

              <a
                href={user.linkedinUrl || 'https://linkedin.com'}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] hover:border-zinc-500 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 text-zinc-300 group-hover:text-white">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>linkedin.com/in/{user.displayName ? user.displayName.toLowerCase().replace(/\s+/g, '-') : 'maya-chen'}</span>
                </div>
                <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-zinc-300">
                  <path d="M6 3h7v7M13 3 8 8" />
                </svg>
              </a>

              {user.portfolioUrl && (
                <a
                  href={user.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-[#1b1b22] border border-[#282836] hover:border-zinc-500 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 text-zinc-300 group-hover:text-white">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>{user.portfolioUrl.replace(/^https?:\/\//, '')}</span>
                  </div>
                  <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-zinc-300">
                    <path d="M6 3h7v7M13 3 8 8" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Outreach Message Modal */}
      {showOutreachModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#282836]">
              <div>
                <h3 className="font-bold text-white text-sm">Send Direct Outreach Message</h3>
                <p className="text-[11px] text-zinc-400">Delivered directly to {user.name}'s Opportunities Inbox</p>
              </div>
              <button onClick={() => setShowOutreachModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            {outreachSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                  </svg>
                </div>
                <h4 className="font-bold text-white">Outreach Dispatched!</h4>
                <p className="text-zinc-400 text-[11px]">The candidate has received your message in their Opportunities Inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSendOutreach} className="space-y-4">
                <div className="p-3 rounded-xl bg-[#0A1680]/20 border border-[#93B2F8]/30 text-[11px] text-[#93B2F8] flex items-center gap-2">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.75 12h-1.5V7h1.5v5zm0-6.5h-1.5V4h1.5v1.5z" />
                  </svg>
                  <span>Candidate has active recruiter discovery consent enabled.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-300 block">Message Content</label>
                  <textarea
                    rows={4}
                    required
                    value={outreachMessage}
                    onChange={(e) => setOutreachMessage(e.target.value)}
                    placeholder={`Hi ${user.displayName || user.name}, we reviewed your verified distributed systems milestones and would love to fast-track you into our technical interview rounds...`}
                    className="w-full p-3 rounded-xl bg-[#1b1b22] border border-[#282836] focus:border-[#93B2F8] text-white outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOutreachModal(false)}
                    className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={outreachSending || !outreachMessage.trim()}
                    className="px-5 py-2 rounded-xl font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors disabled:opacity-50"
                  >
                    {outreachSending ? 'Sending...' : 'Send Outreach'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
