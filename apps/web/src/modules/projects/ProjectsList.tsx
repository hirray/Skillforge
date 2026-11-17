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
      .then(async (r) => {
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
      .then((d) => {
        setProjects(d.data || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-xs text-[#aba6b6]">Loading projects...</div>;
  if (error) return <div className="p-6 text-xs text-amber-300">Error: {error}</div>;

  return (
    <div className="py-5 px-4 max-w-3xl mx-auto text-[#f0edf5]">
      <div className="flex justify-between items-center mb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#b29af5] font-bold block mb-0.5">
            Collaboration Hub
          </span>
          <h1 className="text-xl font-bold text-white">Active Projects</h1>
          <p className="text-xs text-[#aba6b6]">Explore, join, or launch projects across the community.</p>
        </div>
        <Button size="sm" onClick={() => navigate('/projects/create')}>+ Create Project</Button>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center p-8 bg-[#15151a] border border-[#33333e]">
          <p className="text-xs text-[#aba6b6] mb-3">No projects found.</p>
          <Button size="sm" onClick={() => navigate('/projects/create')}>Create your first project</Button>
        </Card>
      ) : (
        <div className="grid gap-2.5">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-3 px-4 bg-[#15151a] border border-[#33333e] rounded-xl hover:border-[#8861dc]/60 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#261c3b] text-[#b29af5] border border-[#8861dc]/40 flex items-center justify-center font-bold text-sm shrink-0">
                  {p.title.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3
                    className="font-semibold text-white text-sm hover:text-[#b29af5] cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-[#aba6b6] mt-0.5">
                    <span className="capitalize">{p.visibility || 'Public'}</span> • <span>{p.category || 'Web App'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Badge status={p.status.toLowerCase() as any}>{p.status}</Badge>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={() => navigate(`/projects/${p.id}`)}>
                  View →
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
