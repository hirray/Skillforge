import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const PublicProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token') || 'recruiter-001';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const targetId = id || 'user-001';
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

    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-zinc-400">Loading verified engineer profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-[#15151a] border border-[#282836] rounded-2xl text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-full bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-300">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-white">Profile Restricted</h2>
        <p className="text-xs text-zinc-400">{error || 'This user has configured their profile to be private.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fadeIn">
      {/* Dossier Header */}
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0A1680]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0A1680] to-[#93B2F8] flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-[#0A1680]/30 border border-[#93B2F8]/30">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{user.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.5 8.5l3 3 6-6" />
                  </svg>
                  <span>Verified Identity</span>
                </span>
              </h1>
              <p className="text-xs text-[#93B2F8] font-medium">{user.headline || 'Software Engineer'}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
                {user.city && <span>Location: {user.city}, {user.country || ''}</span>}
                {user.workMode && <span>Mode: {user.workMode}</span>}
                {user.availability && (
                  <span className="text-[#F1B94C] font-semibold">Availability: {user.availability}</span>
                )}
              </div>
            </div>
          </div>

          <a
            href={`/pipeline`}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A1680] bg-[#93B2F8] hover:bg-[#b0c7fa] transition-colors shadow-md shadow-[#93B2F8]/20 flex items-center gap-1.5"
          >
            <span>Shortlist in Pipeline</span>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </a>
        </div>

        {user.bio && (
          <div className="mt-5 pt-4 border-t border-[#282836] text-xs text-zinc-300 leading-relaxed">
            {user.bio}
          </div>
        )}
      </div>

      {/* Skills Dossier */}
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Attested Capabilities & Taxonomy Skills
        </h2>

        {user.skills ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {user.skills.map((sk: any, i: number) => (
              <div key={i} className="p-3 bg-[#1b1b22] border border-[#282836] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{sk.name || sk.skill?.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                    Lvl {sk.level || 3}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">{sk.category || sk.skill?.category || 'General'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-[#1b1b22] rounded-xl border border-[#282836] text-xs text-zinc-500 text-center">
            Skills section has been marked private by the candidate.
          </div>
        )}
      </div>

      {/* Experience Timeline */}
      <div className="bg-[#15151a] border border-[#282836] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Work Experience
        </h2>

        {user.experiences ? (
          <div className="space-y-3">
            {user.experiences.map((exp: any, i: number) => (
              <div key={i} className="p-3.5 bg-[#1b1b22] border border-[#282836] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">{exp.title}</h3>
                  <span className="text-zinc-500 text-[11px]">{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p className="text-[#93B2F8] font-medium">{exp.company}</p>
                {exp.description && <p className="text-zinc-300 pt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-[#1b1b22] rounded-xl border border-[#282836] text-xs text-zinc-500 text-center">
            Work experience section is private.
          </div>
        )}
      </div>
    </div>
  );
};
