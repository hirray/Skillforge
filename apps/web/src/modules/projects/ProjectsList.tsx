import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../design-system/components';

const ProjectsList = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/v1/projects')
      .then(async r => {
        const text = await r.text();
        try {
          const d = JSON.parse(text);
          if (!r.ok || d.error) {
            throw new Error(d.error?.message || `HTTP error ${r.status}`);
          }
          return d;
        } catch (err: any) {
          if (err.message && !err.message.includes('JSON')) throw err;
          throw new Error(`Server returned HTTP ${r.status} (${r.statusText || 'Non-JSON response'})`);
        }
      })
      .then(d => {
        setProjects(d.data || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-muted">Loading projects...</div>;
  if (error) return <div className="p-8 text-warning">Error: {error}</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Projects</h1>
        <Button onClick={() => navigate('/projects/create')}>Create Project</Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-12">
          <p className="text-muted mb-4">No projects found.</p>
          <Button onClick={() => navigate('/projects/create')}>Create your first project</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map(p => (
            <Card key={p.id} className="flex justify-between items-center hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                  {p.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-mainText">{p.title}</h3>
                  <p className="text-sm text-muted">{p.visibility} • {p.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={p.status.toLowerCase() as any}>{p.status}</Badge>
                <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${p.id}`)}>View</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
