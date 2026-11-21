import React, { useState, useEffect } from 'react';
import { ContributionsTab } from './ContributionsTab';

export const ContributionsHubPage: React.FC = () => {
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/v1/projects');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.projects || [];
          setProjects(list);
          if (list.length > 0) {
            setSelectedProjectId(list[0].id);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#15151a] border border-[#282836]">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-[#93B2F8]">
            Project Evidence Hub
          </h2>
          <p className="text-xs text-zinc-400">
            Select an active or completed project to audit verified contributor ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-300">Target Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#1b1b22] border border-[#282836] text-white text-xs font-medium focus:outline-none focus:border-[#93B2F8]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 rounded-2xl bg-[#15151a] border border-[#282836] animate-pulse h-40" />
      ) : selectedProjectId ? (
        <ContributionsTab projectId={selectedProjectId} isOwner={true} />
      ) : (
        <div className="p-8 text-center rounded-2xl bg-[#15151a] border border-[#282836] text-xs text-zinc-400">
          No projects available. Create or join a project to begin tracking documented contributions.
        </div>
      )}
    </div>
  );
};
