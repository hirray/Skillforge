import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../design-system/components';

export const TasksModule = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch projects
    fetch('/api/v1/projects')
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-muted">Loading tasks workspace...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tasks & Kanban Boards</h1>
          <p className="text-sm text-muted">
            Manage deliverables, sprint tasks, and work coordination across active projects.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted text-sm mb-4">No active projects found. Create or join a project to begin managing tasks.</p>
          <Button onClick={() => navigate('/projects/create')}>Create Project</Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="p-4 bg-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-primary text-sm">Select Project:</span>
              <select
                className="p-2 border border-uiBorder rounded-lg bg-bg text-sm font-semibold text-mainText focus:outline-none focus:border-accent"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.status} - {p.stage})
                  </option>
                ))}
              </select>
            </div>

            {selectedProjectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
              >
                Open Project Details ↗
              </Button>
            )}
          </Card>

          {/* Project Tasks Kanban Board */}
          {selectedProjectId && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-primary text-lg">
                  {projects.find(p => p.id === selectedProjectId)?.title} Task Board
                </h3>
                <Button
                  size="sm"
                  onClick={() => navigate(`/projects/${selectedProjectId}`)}
                >
                  Manage in Project Room
                </Button>
              </div>

              {/* Import dynamically or direct route */}
              <Card className="p-6 text-center bg-bg/50 border-dashed">
                <p className="text-sm text-mainText mb-3">
                  Open the full interactive Kanban board inside the project space with real-time comments, audit logs, and member assignment.
                </p>
                <Button onClick={() => navigate(`/projects/${selectedProjectId}`)}>
                  Go to Kanban Board
                </Button>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksModule;
