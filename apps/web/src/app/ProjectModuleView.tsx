import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, SkeletonLoader } from '../design-system/components';
import { TeamSection } from '../modules/projects/TeamSection';
import { TasksSection } from '../modules/tasks/TasksSection';
import { MilestonesSection } from '../modules/milestones/MilestonesSection';
import { ResourcesHub } from '../modules/resources';
import { ProjectRoom } from '../modules/chat';

interface ProjectModuleViewProps {
  moduleName: 'team' | 'tasks' | 'milestones' | 'chat' | 'resources';
  title: string;
}

export const ProjectModuleView: React.FC<ProjectModuleViewProps> = ({ moduleName, title }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectData, setProjectData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/projects');
      const data = await res.json();
      const list = data.data || [];
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedProject = async (id: string) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/v1/projects/${id}`);
      const data = await res.json();
      if (data.data) {
        setProjectData(data.data);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchSelectedProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  if (loading && projects.length === 0) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-4">
        <SkeletonLoader type="text" count={2} />
        <SkeletonLoader type="card" count={2} />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <Card className="p-8">
          <span className="text-4xl mb-3 block">📁</span>
          <h2 className="text-xl font-bold text-primary mb-2">No Projects Found</h2>
          <p className="text-sm text-muted mb-6">
            Create your first project to start managing {title.toLowerCase()}.
          </p>
          <Button onClick={() => navigate('/projects/new')}>Create Project</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {error && (
        <div className="p-4 bg-red-100/60 border border-red-200 rounded-2xl text-xs text-red-600 font-semibold">
          ⚠️ {error}
        </div>
      )}
      {/* Header with Project Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-uiBorder">
        <div>
          <h1 className="text-2xl font-black text-primary tracking-tight">{title}</h1>
          <p className="text-xs text-muted">
            Viewing {title.toLowerCase()} for project:{' '}
            <span className="font-bold text-mainText">{projectData?.title || 'Selected Project'}</span>
          </p>
        </div>

        {/* Project Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-muted whitespace-nowrap">Project:</label>
          <select
            className="px-3 py-1.5 text-xs font-bold bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent text-primary shadow-sm"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.status})
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${selectedProjectId}`)}
            title="Open Project Details"
          >
            View Project ↗
          </Button>
        </div>
      </div>

      {/* Real Module View */}
      {selectedProjectId && projectData && (
        <div className="transition-all duration-200">
          {moduleName === 'team' && (
            <TeamSection
              projectId={selectedProjectId}
              project={projectData}
              onProjectUpdated={() => fetchSelectedProject(selectedProjectId)}
            />
          )}

          {moduleName === 'tasks' && (
            <TasksSection
              projectId={selectedProjectId}
              project={projectData}
              onProjectUpdated={() => fetchSelectedProject(selectedProjectId)}
            />
          )}

          {moduleName === 'milestones' && (
            <MilestonesSection
              projectId={selectedProjectId}
              project={projectData}
              onProjectUpdated={() => fetchSelectedProject(selectedProjectId)}
            />
          )}

          {moduleName === 'resources' && (
            <ResourcesHub
              projectId={selectedProjectId}
              isOwner={projectData.ownerId === (localStorage.getItem('token') || 'user-001')}
            />
          )}

          {moduleName === 'chat' && (
            <ProjectRoom projectId={selectedProjectId} />
          )}
        </div>
      )}
    </div>
  );
};
