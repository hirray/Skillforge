import React, { useState, useEffect } from 'react';
import { Card } from '../../design-system/components';
import { GitHubConnectCard } from './GitHubConnectCard';
import { ProjectReposPanel } from './ProjectReposPanel';
import { api } from '../ai/client';

export const GitHubIntegrationPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await api<{ data: any[] }>('/projects');
        const list = res.data || [];
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load user projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#0A1680]/30 text-[#93B2F8] border border-[#93B2F8]/30">
            Source Control & Evidence
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          GitHub Integration & Activity Sync
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          Connect your GitHub account to automatically attribute commits, pull requests, issues, and code
          reviews as verified evidence for technical portfolio projects.
        </p>
      </div>

      {/* Primary Account Connection Card */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
          1. Your Developer Account Identity
        </h2>
        <GitHubConnectCard />
      </section>

      {/* Project Repository Linker */}
      <section className="space-y-4 pt-4 border-t border-[#282836]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
              2. Project Repository Linking
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Select a project to inspect or link associated GitHub repositories.
            </p>
          </div>

          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-zinc-400">Target Project:</label>
              <select
                aria-label="Target Project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#15151a] border border-[#282836] text-white text-xs font-semibold focus:outline-none focus:border-[#93B2F8]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loadingProjects ? (
          <Card className="p-6 bg-[#15151a] border border-[#282836] rounded-2xl animate-pulse">
            <div className="h-4 w-48 bg-[#1b1b22] rounded mb-3" />
            <div className="h-10 w-full bg-[#1b1b22] rounded" />
          </Card>
        ) : selectedProjectId ? (
          <ProjectReposPanel projectId={selectedProjectId} isOwner={true} />
        ) : (
          <Card className="p-6 bg-[#15151a] border border-[#282836] rounded-2xl text-center text-zinc-400 text-xs">
            No projects found. Create or join a project first to link repositories.
          </Card>
        )}
      </section>
    </div>
  );
};
