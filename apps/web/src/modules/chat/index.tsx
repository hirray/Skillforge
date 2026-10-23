import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, SkeletonLoader } from '../../design-system/components';
import { ProjectRoom } from './ProjectRoom';

export * from './ProjectRoom';
export * from './GroupChat';
export * from './DirectChat';
export * from './TeamDirectory';
export * from './ActivityFeed';
export * from './ProjectOverviewTab';
export * from './useSocket';

const ChatProjectPicker: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/projects', {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error.message);
        setProjects(d.data?.items || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto text-center text-warning text-sm">
        <p className="font-bold mb-1">Failed to load projects</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0A1680] to-[#16279E] text-white p-6 rounded-2xl shadow-elevation-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Project Rooms & Team Chat</h1>
          <p className="text-xs text-accent/90">
            Select a project to enter its real-time workspace, group discussions, and direct messages.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center bg-surface rounded-2xl border border-uiBorder shadow-elevation-1">
          <span className="text-4xl block mb-3">💬</span>
          <h3 className="font-bold text-base text-mainText mb-1">No Projects Found</h3>
          <p className="text-xs text-muted max-w-sm mx-auto mb-4">
            You are not part of any projects yet. Create a project or accept an invitation to enter a Project Room.
          </p>
          <Button onClick={() => navigate('/projects/new')}>Create a Project</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <Card
              key={p.id}
              className="p-5 flex flex-col justify-between bg-surface rounded-2xl border border-uiBorder shadow-elevation-1 hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all duration-175"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-bold text-base text-primary line-clamp-1">{p.title}</h3>
                  <Badge status={p.status.toLowerCase() as any}>{p.status}</Badge>
                </div>
                <p className="text-xs text-muted line-clamp-2 mb-4">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-uiBorder flex justify-between items-center">
                <span className="text-xs text-muted capitalize font-semibold">{p.stage}</span>
                <Button
                  size="sm"
                  onClick={() => navigate(`/chat/${p.id}`)}
                  className="text-xs font-bold"
                >
                  Enter Room ➔
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export const ChatModule: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ChatProjectPicker />} />
      <Route path="/:id" element={<ProjectRoom />} />
    </Routes>
  );
};

export default ChatModule;
