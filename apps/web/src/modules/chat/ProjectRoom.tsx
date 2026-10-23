import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Tabs, Avatar } from '../../design-system/components';
import { GroupChat } from './GroupChat';
import { DirectChat } from './DirectChat';
import { TeamDirectory } from './TeamDirectory';
import { ActivityFeed } from './ActivityFeed';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import { ResourcesHub } from '../resources';
import { useSocket } from './useSocket';

export const ProjectRoom: React.FC<{ projectId?: string }> = ({ projectId: propProjectId }) => {
  const { id } = useParams<{ id: string }>();
  const projectId = propProjectId || id;
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Group Chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct chat recipient override if opened from directory
  const [selectedDirectUserId, setSelectedDirectUserId] = useState<string | undefined>(undefined);

  const fetchProject = () => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error.message);
        setProject(d.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProject();
  }, [id, currentUserId]);

  // Real-time socket for presence
  const { isConnected, onlineUserIds } = useSocket({
    projectId: id,
    onProjectKicked: ({ message }) => {
      alert(message || 'You are no longer a member of this project.');
      navigate('/projects');
    },
  });

  const handleStartDirectChat = (targetUserId: string) => {
    setSelectedDirectUserId(targetUserId);
    setActiveTab('Direct Messages');
  };

  if (loading) {
    return (
      <div className="p-8 max-w-6xl mx-auto text-muted">
        <div className="h-20 bg-surface rounded-2xl animate-shimmer mb-6" />
        <div className="h-96 bg-surface rounded-2xl animate-shimmer" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="p-8 bg-surface rounded-2xl border border-uiBorder text-center shadow-elevation-1">
          <span className="text-3xl block mb-2">🔒</span>
          <h2 className="text-xl font-bold text-primary mb-2">Access Denied or Not Found</h2>
          <p className="text-xs text-muted max-w-md mx-auto mb-4">
            {error || 'You must be a confirmed member or the owner of this project to enter the Project Room.'}
          </p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  const isOwner = project.ownerId === currentUserId;

  const tabs = [
    'Overview',
    'Group Chat',
    'Direct Messages',
    'Team Directory',
    'Activity Feed',
    'Resources',
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Master Room Header Bar */}
      <div className="bg-gradient-to-r from-[#0A1680] to-[#16279E] text-white p-6 rounded-2xl shadow-elevation-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className="text-2xl">🚀</span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{project.title}</h1>
            <Badge status={project.status.toLowerCase() as any}>{project.status}</Badge>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isConnected ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40' : 'bg-white/10 text-white/70'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'}`}
              />
              {isConnected ? 'Room Live' : 'Connecting...'}
            </span>
          </div>

          <p className="text-xs text-accent/90 max-w-2xl line-clamp-1">
            {project.description || 'Collaborative workspace and real-time team chat.'}
          </p>
        </div>

        {/* Presence Avatars & Navigation Buttons */}
        <div className="flex items-center gap-3">
          {/* Online Avatars Stack */}
          <div className="hidden sm:flex items-center -space-x-2 mr-2">
            {onlineUserIds.slice(0, 4).map((uid) => (
              <Avatar
                key={uid}
                name={uid}
                presence="online"
                size="sm"
                className="border-2 border-[#0A1680] shadow-sm"
              />
            ))}
            {onlineUserIds.length > 4 && (
              <span className="w-8 h-8 rounded-full bg-accent text-primary text-xs font-bold flex items-center justify-center border-2 border-[#0A1680]">
                +{onlineUserIds.length - 4}
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/projects/${id}`)}
            className="!text-white !border-white/30 hover:!bg-white/10 text-xs"
          >
            Project Settings
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/projects')}
            className="!bg-white !text-primary hover:!bg-white/90 text-xs font-bold"
          >
            All Projects
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-surface p-1.5 rounded-xl border border-uiBorder shadow-elevation-1">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Tab Panels */}
      {activeTab === 'Overview' && (
        <ProjectOverviewTab projectId={id!} onNavigateTab={setActiveTab} />
      )}

      {activeTab === 'Group Chat' && (
        <GroupChat
          projectId={id!}
          projectTitle={project.title}
          isOwner={isOwner}
        />
      )}

      {activeTab === 'Direct Messages' && (
        <DirectChat
          projectId={id!}
          initialRecipientId={selectedDirectUserId}
        />
      )}

      {activeTab === 'Team Directory' && (
        <TeamDirectory
          projectId={id!}
          onlineUserIds={onlineUserIds}
          onStartDirectChat={handleStartDirectChat}
        />
      )}

      {activeTab === 'Activity Feed' && (
        <ActivityFeed projectId={id!} />
      )}

      {activeTab === 'Resources' && (
        <ResourcesHub projectId={id!} isOwner={isOwner} />
      )}
    </div>
  );
};

