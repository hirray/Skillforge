import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  SkeletonLoader,
  IcoUsers,
  IcoCheck,
  IcoClose,
  IcoFile,
  IcoServer,
  IcoFlash,
  IcoRefresh,
} from '../../design-system/components';

export interface ActivityFeedProps {
  projectId: string;
}

export interface ActivityItem {
  id: string;
  projectId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  title: string;
  detail?: string;
  metadata?: any;
  createdAt: string;
}

const getEventConfig = (eventType: string) => {
  switch (eventType) {
    case 'MemberJoined':
      return {
        icon: <IcoUsers size={14} color="#6ad4bb" />,
        badgeBg: 'bg-[#132822] text-[#6ad4bb] border-[#6ad4bb50]',
        dotColor: 'bg-[#6ad4bb]',
      };
    case 'MemberLeft':
      return {
        icon: <IcoClose size={14} color="#fb7185" />,
        badgeBg: 'bg-[#2c1518] text-[#fb7185] border-[#fb718550]',
        dotColor: 'bg-[#fb7185]',
      };
    case 'TaskCompleted':
      return {
        icon: <IcoCheck size={14} color="#10B981" />,
        badgeBg: 'bg-[#132822] text-[#10B981] border-[#10B98150]',
        dotColor: 'bg-[#10B981]',
      };
    case 'TaskCreated':
      return {
        icon: <IcoFile size={14} color="#f59e0b" />,
        badgeBg: 'bg-[#2a1e12] text-[#f59e0b] border-[#f59e0b50]',
        dotColor: 'bg-[#f59e0b]',
      };
    case 'ProjectUpdated':
      return {
        icon: <IcoServer size={14} color="#b29af5" />,
        badgeBg: 'bg-[#221a36] text-[#b29af5] border-[#8861dc50]',
        dotColor: 'bg-[#b29af5]',
      };
    default:
      return {
        icon: <IcoFlash size={14} color="#b29af5" />,
        badgeBg: 'bg-[#19191e] text-[#b29af5] border-[#3a3a48]',
        dotColor: 'bg-[#b29af5]',
      };
  }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ projectId }) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchActivity = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/activity?limit=50`, {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error.message);
        setActivities(d.data.items || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchActivity();
  }, [projectId, currentUserId]);

  const filtered = activities.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'team') return a.eventType.includes('Member');
    if (filter === 'tasks') return a.eventType.includes('Task');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Feed Filters & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface p-4 rounded-xl border border-uiBorder shadow-elevation-1">
        <div>
          <h3 className="font-bold text-sm text-primary">Project Activity Feed</h3>
          <p className="text-xs text-muted">Real-time audit log of team & project progress</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-bg p-1 border border-uiBorder text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'all' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-mainText'
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('tasks')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'tasks' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-mainText'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setFilter('team')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'team' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-mainText'
              }`}
            >
              Team
            </button>
          </div>

          <Button size="sm" variant="outline" onClick={fetchActivity} className="text-xs flex items-center gap-1.5">
            <IcoRefresh size={12} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Timeline Stream */}
      <Card className="p-6 bg-surface rounded-2xl border border-uiBorder shadow-elevation-1">
        {loading ? (
          <SkeletonLoader type="row" count={5} />
        ) : error ? (
          <div className="p-8 text-center text-warning text-sm">
            <p className="font-bold mb-1">Failed to load activity feed</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <div className="w-12 h-12 rounded-xl bg-[#221a36] border border-[#8861dc40] flex items-center justify-center mx-auto mb-3 text-[#b29af5]">
              <IcoFile size={22} color="#b29af5" />
            </div>
            <h4 className="font-bold text-mainText text-sm mb-1">No Activity Logged Yet</h4>
            <p className="text-xs max-w-sm mx-auto">
              Project events such as members joining or tasks completing will automatically stream here.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-uiBorder">
            {filtered.map((entry) => {
              const cfg = getEventConfig(entry.eventType);
              const dateStr = new Date(entry.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={entry.id} className="relative flex items-start gap-4 text-xs group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${cfg.dotColor} flex items-center justify-center text-[10px] text-white border border-[#15151a] shadow-sm flex-shrink-0`}
                  >
                    {cfg.icon}
                  </div>

                  {/* Main Event Card */}
                  <div className="flex-1 bg-bg p-3.5 rounded-xl border border-uiBorder group-hover:border-accent/50 group-hover:bg-accent/5 transition-all">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.badgeBg}`}>
                          {entry.title}
                        </span>
                        <span className="font-semibold text-mainText">{entry.actorName}</span>
                      </div>
                      <span className="text-[11px] text-muted flex-shrink-0">{dateStr}</span>
                    </div>

                    {entry.detail && (
                      <p className="text-xs text-muted mt-1 leading-relaxed">{entry.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
