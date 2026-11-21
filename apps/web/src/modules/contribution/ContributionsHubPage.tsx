import React, { useState, useEffect } from 'react';
import { ContributionsTab } from './ContributionsTab';

interface ProjectOption {
  id: string;
  title: string;
}

const DEFAULT_DEMO_PROJECTS: ProjectOption[] = [
  { id: 'all', title: '🌐 All Projects (Consolidated Ledger)' },
  { id: 'cfa8f3a1-c4fa-48c3-adc8-ee5952cf2cad', title: 'Pilot Project (Updated)' },
  { id: 'pilot-project', title: 'SkillForge Platform Core (Verified Showcase)' },
];

export const ContributionsHubPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectOption[]>(DEFAULT_DEMO_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/v1/projects');
        if (res.ok) {
          const data = await res.json();
          // RealService returns { data: [...] }
          const rawList = Array.isArray(data) ? data : data.data || data.projects || [];
          if (rawList && rawList.length > 0) {
            const formatted: ProjectOption[] = [
              { id: 'all', title: '🌐 All Projects (Consolidated Ledger)' },
              ...rawList.map((p: any) => ({
                id: p.id,
                title: p.title || `Project ${p.id.slice(0, 8)}`,
              })),
            ];
            setProjects(formatted);
            // Default to the first real project if available
            setSelectedProjectId(rawList[0].id);
          }
        }
      } catch (e) {
        console.error('Failed to load projects list:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top project selector bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#15151a] border border-[#282836] shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0A1680]/70 text-[#93B2F8] border border-[#93B2F8]/30">
              Interactive Demo & Audit
            </span>
            <span className="text-xs text-zinc-400">• Source-Attributed Ledger</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Project Evidence Hub</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Select a project or view the consolidated monorepo ledger with verified GitHub, task, and attested evidence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-zinc-300 shrink-0">
            Target Project {loading && <span className="text-[#93B2F8] text-[10px] animate-pulse">(updating...)</span>}:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#1b1b22] border border-[#282836] text-white text-xs font-semibold focus:outline-none focus:border-[#93B2F8] max-w-[280px]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Contribution Ledger */}
      {selectedProjectId && (
        <ContributionsTab
          key={selectedProjectId}
          projectId={selectedProjectId}
          isOwner={true}
        />
      )}
    </div>
  );
};
