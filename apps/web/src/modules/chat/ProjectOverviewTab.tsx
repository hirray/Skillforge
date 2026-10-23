import React, { useState, useEffect } from 'react';
import { Card, Badge, SkeletonLoader, Button } from '../../design-system/components';

export interface ProjectOverviewTabProps {
  projectId: string;
  onNavigateTab?: (tabName: string) => void;
}

export const ProjectOverviewTab: React.FC<ProjectOverviewTabProps> = ({
  projectId,
  onNavigateTab,
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/room-overview`, {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error.message);
        setData(d.data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, [projectId, currentUserId]);

  if (loading) {
    return <SkeletonLoader type="card" count={3} />;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-warning text-sm bg-surface rounded-2xl border border-uiBorder">
        <p className="font-bold mb-1">Failed to load Project Overview</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  const { project, stats, upcomingDeadlines } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner Summary */}
      <Card className="p-6 bg-surface rounded-2xl border border-uiBorder shadow-elevation-1">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h2 className="text-2xl font-bold text-primary">{project.title}</h2>
              <Badge status={project.status.toLowerCase() as any}>{project.status}</Badge>
            </div>
            <p className="text-xs text-muted">
              Stage: <span className="font-semibold text-mainText capitalize">{project.stage}</span> • Category:{' '}
              <span className="font-semibold text-mainText">{project.category || 'General'}</span> • Visibility:{' '}
              <span className="font-semibold text-mainText">{project.visibility}</span>
            </p>
          </div>

          <div className="flex gap-2">
            {onNavigateTab && (
              <Button size="sm" onClick={() => onNavigateTab('Group Chat')}>
                Open Team Chat ➔
              </Button>
            )}
          </div>
        </div>

        <p className="text-sm text-mainText leading-relaxed mb-4">
          {project.description || 'No description provided.'}
        </p>

        {project.problemStatement && (
          <div className="p-3 bg-bg rounded-xl border border-uiBorder text-xs text-mainText">
            <span className="font-bold block text-primary mb-1 uppercase tracking-wider text-[10px]">
              Problem Statement
            </span>
            <p>{project.problemStatement}</p>
          </div>
        )}
      </Card>

      {/* Progress & Deadlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progress Card */}
        <Card className="p-5 bg-surface rounded-2xl border border-uiBorder shadow-elevation-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-primary mb-3">Overall Progress</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-primary">{stats.progressPercent}%</span>
              <span className="text-xs text-muted">tasks completed</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-bg rounded-full overflow-hidden border border-uiBorder mb-3">
              <div
                className="h-full bg-gradient-to-r from-accent to-primary transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, stats.progressPercent))}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted">
              <span>{stats.doneTasks} Completed</span>
              <span>{stats.totalTasks} Total Tasks</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-uiBorder/60 flex justify-between items-center text-xs">
            <span className="text-muted">Active Team Size</span>
            <span className="font-bold text-mainText">{stats.totalMembers} Members</span>
          </div>
        </Card>

        {/* Nearest Deadlines */}
        <Card className="md:col-span-2 p-5 bg-surface rounded-2xl border border-uiBorder shadow-elevation-1">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-primary">Upcoming Task Deadlines</h3>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('Tasks')}
                className="text-xs text-accent hover:underline font-semibold"
              >
                View Kanban Board ➔
              </button>
            )}
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="p-6 text-center text-muted text-xs bg-bg rounded-xl border border-uiBorder">
              <p>No active tasks with due dates found.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-bg border border-uiBorder text-xs hover:bg-accent/10 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate flex-1">
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                    <span className="font-semibold text-mainText truncate">{task.title}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'Critical'
                          ? 'bg-primary text-white'
                          : task.priority === 'High'
                          ? 'bg-warning/20 text-mainText'
                          : 'bg-accent/20 text-primary'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-muted font-medium">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Pinned Links & Resources Hub */}
      <Card className="p-5 bg-surface rounded-2xl border border-uiBorder shadow-elevation-1">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-primary">📌 Pinned Links & Resources Hub</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
              Active
            </span>
          </div>
          {onNavigateTab && (
            <Button size="sm" variant="outline" onClick={() => onNavigateTab('Resources')}>
              Open Resources Hub ➔
            </Button>
          )}
        </div>
        <p className="text-xs text-muted leading-relaxed">
          Access shared repository links, Figma design specs, dataset files, and platform attachments uploaded for this project.
        </p>
      </Card>

    </div>
  );
};
