import React, { useState, useEffect } from 'react';
import { Card, Button, SkeletonLoader } from '../../design-system/components';

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
        icon: '👋',
        badgeBg: 'bg-accent/20 text-primary border-accent/40',
        dotColor: 'bg-accent',
      };
    case 'MemberLeft':
      return {
        icon: '🚪',
        badgeBg: 'bg-muted/20 text-mainText border-uiBorder',
        dotColor: 'bg-muted',
      };
    case 'TaskCompleted':
      return {
        icon: '✅',
        badgeBg: 'bg-primary text-white border-primary',
        dotColor: 'bg-primary',
      };
    case 'TaskCreated':
      return {
        icon: '📌',
        badgeBg: 'bg-yellow/30 text-mainText border-yellow/50',
        dotColor: 'bg-warning',
      };
    case 'ProjectUpdated':
      return {
        icon: '⚙️',
        badgeBg: 'bg-surface text-primary border-uiBorder',
        dotColor: 'bg-primary',
      };
    default:
      return {
        icon: '⚡',
        badgeBg: 'bg-bg text-mainText border-uiBorder',
        dotColor: 'bg-accent',
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

          <Button size="sm" variant="outline" onClick={fetchActivity} className="text-xs">
            ↻ Refresh
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
            <span className="text-3xl block mb-2">📜</span>
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
                    className={`absolute -left-6 top-1 w-5 h-5 rounded-full ${cfg.dotColor} flex items-center justify-center text-[10px] text-white border-2 border-white shadow-sm flex-shrink-0`}
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
