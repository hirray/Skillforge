import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { Icon } from '../ai/shared';
import { canonicalProjectsList, ProjectItemData } from './canonicalProjects';

type ProjectItem = ProjectItemData;
const canonicalProjects = canonicalProjectsList;

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(canonicalProjects);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'owned' | 'collaborations'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch('/api/v1/projects')
      .then(async (r) => {
        if (!r.ok) return null;
        const text = await r.text();
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      })
      .then((d) => {
        if (isMounted) {
          const apiProjects: any[] = d?.data || [];
          if (apiProjects.length > 0) {
            // Merge database projects with canonical ones so user never sees an empty screen
            const merged = [...canonicalProjects];
            apiProjects.forEach((apiProj) => {
              const existingIdx = merged.findIndex(
                (p) => p.id === apiProj.id || p.title.toLowerCase() === apiProj.title.toLowerCase()
              );
              const mapped: ProjectItem = {
                id: apiProj.id,
                ownerId: apiProj.ownerId || 'user-001',
                title: apiProj.title,
                description: apiProj.description || 'Collaborative engineering project registered on SkillForge.',
                visibility: apiProj.visibility || 'Public',
                category: apiProj.category || 'Web App',
                status: apiProj.status || 'Active',
                stage: apiProj.stage || 'Active',
                progress: 75,
                membersCount: apiProj.members?.length || 2,
                commitsCount: 12,
                isOwner: true,
              };
              if (existingIdx >= 0) {
                merged[existingIdx] = mapped;
              } else {
                merged.unshift(mapped);
              }
            });
            setProjects(merged);
          }
        }
      })
      .catch((err) => {
        console.warn('Projects API fetch notice:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = projects.filter((p) => {
    // Filter by tab
    if (activeTab === 'active' && p.status !== 'Active') return false;
    if (activeTab === 'owned' && !p.isOwner) return false;
    if (activeTab === 'collaborations' && p.isOwner) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageShell
      title="My Projects"
      description="Manage, build, and deliver your team repositories, active sprints, and collaborative codebases."
      breadcrumb={[
        { label: 'Workspace', href: '/home' },
        { label: 'My Projects' },
      ]}
      tabs={[
        { id: 'all', label: `All Projects (${projects.length})`, count: projects.length },
        { id: 'active', label: 'Active Sprints' },
        { id: 'owned', label: 'Created by Me' },
        { id: 'collaborations', label: 'Collaborative Teams' },
      ]}
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as any)}
      primaryAction={
        <button
          onClick={() => navigate('/projects/create')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
        >
          + Create Project
        </button>
      }
      secondaryActions={
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#171722] border border-[#2b2a3a] text-xs text-white rounded-xl pl-8 pr-3 py-1.5 focus:border-[#8861dc] focus:outline-none placeholder-[#6b7280]"
          />
          <span className="absolute left-2.5 top-2 text-[#6b7280]">
            <Icon name="search" size={13} />
          </span>
        </div>
      }
    >
      {loading ? (
        <div className="py-16 text-center text-xs text-[#96939f] flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#8861dc] border-t-transparent animate-spin" />
          <span>Synchronizing project repository telemetry...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-[#111116] border border-[#262533] rounded-2xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1f1e2c] border border-[#2e2c40] text-[#c4b5fd] flex items-center justify-center mx-auto text-xl">
            📁
          </div>
          <h3 className="text-base font-bold text-white">No projects found in this filter</h3>
          <p className="text-xs text-[#9ca3af] max-w-sm mx-auto">
            Try adjusting your search criteria or create a brand new team project to get started.
          </p>
          <button
            onClick={() => navigate('/projects/create')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6366f1] text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all"
          >
            + Create New Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#151522] via-[#111118] to-[#0e0e14] border border-[#2b2a3d] hover:border-[#8861dc]/60 p-5 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)] hover:-translate-y-0.5"
            >
              {/* Top ambient highlight */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed]/30 to-[#4f46e5]/20 text-[#c4b5fd] border border-[#7c3aed]/40 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                      {p.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#7c3aed]/15 text-[#c4b5fd] border border-[#7c3aed]/30">
                          {p.stage || 'Active Sprint'}
                        </span>
                        <span className="text-[10px] font-medium text-[#9ca3af]">
                          {p.category || 'Engineering'}
                        </span>
                        {p.isOwner && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                            Owner
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="text-sm md:text-base font-extrabold text-white group-hover:text-[#c4b5fd] transition-colors truncate mt-1 cursor-pointer"
                      >
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  <span className="shrink-0 text-right">
                    <div className="text-sm font-black text-[#34d399]">{p.progress || 75}%</div>
                    <div className="text-[9px] text-[#6b7280] font-bold uppercase tracking-wider">Velocity</div>
                  </span>
                </div>

                <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-[#191924] rounded-full h-1.5 overflow-hidden border border-[#2b2a3c]">
                  <div
                    className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#8861dc] h-full rounded-full"
                    style={{ width: `${p.progress || 75}%` }}
                  />
                </div>
              </div>

              {/* Bottom Telemetry & Quick Action */}
              <div className="pt-3 border-t border-[#252435] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-[#9ca3af] text-[11px] font-medium">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>{p.commitsCount || 14} Commits</span>
                  </span>
                  <span>•</span>
                  <span>{p.membersCount || 3} Members</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/chat"
                    className="px-2.5 py-1 rounded-lg bg-[#1e1d2c] hover:bg-[#28273b] text-[#c4b5fd] text-xs font-semibold border border-[#343247] transition-all"
                  >
                    Room
                  </Link>
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6366f1] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Open Workspace &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default ProjectsList;
