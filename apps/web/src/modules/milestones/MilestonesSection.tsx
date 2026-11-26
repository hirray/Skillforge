import React, { useState, useEffect } from 'react';
import { Card, Button, SkeletonLoader, IcoLock, IcoClipboard, IcoMap, IcoTarget } from '../../design-system/components';
import { MilestoneCard } from './MilestoneCard';
import { MilestoneDetailModal } from './MilestoneDetailModal';
import { MilestoneCreateModal } from './MilestoneCreateModal';
import { MilestoneCompleteModal } from './MilestoneCompleteModal';
import { MilestoneTimelineView } from './MilestoneTimelineView';
import { getFallbackMilestones, getFallbackTasks } from '../projects/canonicalProjects';

interface MilestonesSectionProps {
  projectId: string;
  project: any;
  onProjectUpdated?: () => void;
}

export const MilestonesSection: React.FC<MilestonesSectionProps> = ({
  projectId,
  project,
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [milestones, setMilestones] = useState<any[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View & Filters
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [milestoneToComplete, setMilestoneToComplete] = useState<any | null>(null);

  const isOwner = project?.ownerId === currentUserId;
  const isMember =
    project?.members?.some((m: any) => m.userId === currentUserId && m.status === 'active') ||
    isOwner;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch milestones
      const msRes = await fetch(`/api/v1/projects/${projectId}/milestones`, {
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const msData = await msRes.json().catch(() => ({}));

      let loadedMilestones: any[] = [];
      if (msRes.ok && msData.data && msData.data.length > 0) {
        loadedMilestones = msData.data;
      } else {
        loadedMilestones = getFallbackMilestones(projectId, project?.title, project?.stage) || [];
      }

      // Merge with persisted status updates so completed milestones stay completed across reloads
      try {
        const savedRaw = localStorage.getItem(`sf_milestones_${projectId}`);
        if (savedRaw) {
          const savedList: any[] = JSON.parse(savedRaw);
          const savedMap = new Map(savedList.map((m: any) => [m.id, m]));
          loadedMilestones = loadedMilestones.map((m: any) => {
            const saved: any = savedMap.get(m.id);
            if (saved) {
              return {
                ...m,
                status: saved.status || m.status,
                progressPercentage: saved.status === 'Done' ? 100 : (saved.progressPercentage ?? m.progressPercentage),
                calculatedProgress: saved.status === 'Done' ? 100 : (saved.calculatedProgress ?? m.calculatedProgress),
                isManualCompletion: saved.isManualCompletion ?? m.isManualCompletion,
                completionRationale: saved.completionRationale ?? m.completionRationale,
                completedAt: saved.completedAt ?? m.completedAt,
              };
            }
            return m;
          });
        }
      } catch { }

      setMilestones(loadedMilestones);

      // Fetch project tasks for linking
      const tasksRes = await fetch(`/api/v1/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const tasksData = await tasksRes.json().catch(() => ({}));
      if (tasksRes.ok && tasksData.data && tasksData.data.length > 0) {
        setProjectTasks(tasksData.data);
      } else {
        const fallbackTasks = getFallbackTasks(projectId);
        setProjectTasks(fallbackTasks || []);
      }
    } catch (err: any) {
      let fallbacks = getFallbackMilestones(projectId, project?.title, project?.stage) || [];
      try {
        const savedRaw = localStorage.getItem(`sf_milestones_${projectId}`);
        if (savedRaw) {
          const savedList: any[] = JSON.parse(savedRaw);
          const savedMap = new Map(savedList.map((m: any) => [m.id, m]));
          fallbacks = fallbacks.map((m: any) => {
            const saved: any = savedMap.get(m.id);
            return saved ? { ...m, ...saved } : m;
          });
        }
      } catch { }
      setMilestones(fallbacks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId, currentUserId]);

  const handleCreateMilestone = async (data: {
    title: string;
    description?: string;
    dueDate?: string;
    linkedTaskIds?: string[];
  }) => {
    const res = await fetch(`/api/v1/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUserId}`,
      },
      body: JSON.stringify(data),
    });
    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error?.message || 'Failed to create milestone');
    }
    await fetchData();
  };

  const handleUpdateMilestone = async (data: any) => {
    if (!selectedMilestone) return;
    const isNowDone = data.status === 'Done';
    const payload = {
      ...data,
      rationale: data.rationale || data.completionRationale || 'Milestone verified and signed off.',
      completionRationale: data.completionRationale || data.rationale || 'Milestone verified and signed off.',
      isManualCompletion: isNowDone ? true : data.isManualCompletion,
      progressPercentage: isNowDone ? 100 : data.progressPercentage,
    };

    let updatedMs = {
      ...selectedMilestone,
      ...payload,
      status: data.status || selectedMilestone.status,
      progressPercentage: isNowDone ? 100 : (data.progressPercentage ?? selectedMilestone.progressPercentage),
      calculatedProgress: isNowDone ? 100 : (data.progressPercentage ?? selectedMilestone.calculatedProgress ?? 100),
      isManualCompletion: isNowDone ? true : selectedMilestone.isManualCompletion,
      completionRationale: payload.completionRationale,
      completedAt: isNowDone ? new Date().toISOString() : selectedMilestone.completedAt,
    };

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/milestones/${selectedMilestone.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify(payload),
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.data) {
        updatedMs = { ...updatedMs, ...resData.data };
      }
    } catch (e) {
      console.warn('Milestone patch network warning, persisting locally:', e);
    }

    setMilestones((prev) => {
      const list = prev.map((m) => (m.id === selectedMilestone.id ? updatedMs : m));
      try {
        localStorage.setItem(`sf_milestones_${projectId}`, JSON.stringify(list));
        window.dispatchEvent(new Event('sf_milestones_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch { }
      return list;
    });
    setSelectedMilestone(updatedMs);
  };

  const handleLinkTask = async (taskId: string) => {
    if (!selectedMilestone) return;
    const res = await fetch(
      `/api/v1/projects/${projectId}/milestones/${selectedMilestone.id}/tasks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({ taskId }),
      }
    );
    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error?.message || 'Failed to link task');
    }
    // Update local state
    setMilestones((prev) => {
      const list = prev.map((m) => (m.id === selectedMilestone.id ? resData.data : m));
      try {
        localStorage.setItem(`sf_milestones_${projectId}`, JSON.stringify(list));
        window.dispatchEvent(new Event('sf_milestones_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return list;
    });
    setSelectedMilestone(resData.data);
  };

  const handleUnlinkTask = async (taskId: string) => {
    if (!selectedMilestone) return;
    const res = await fetch(
      `/api/v1/projects/${projectId}/milestones/${selectedMilestone.id}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUserId}`,
        },
      }
    );
    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error?.message || 'Failed to unlink task');
    }
    setMilestones((prev) => {
      const list = prev.map((m) => (m.id === selectedMilestone.id ? resData.data : m));
      try {
        localStorage.setItem(`sf_milestones_${projectId}`, JSON.stringify(list));
        window.dispatchEvent(new Event('sf_milestones_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return list;
    });
    setSelectedMilestone(resData.data);
  };

  const handleManualComplete = async (rationale: string) => {
    const target = milestoneToComplete || selectedMilestone;
    if (!target) return;

    let updatedMs = {
      ...target,
      status: 'Done',
      isManualCompletion: true,
      completionRationale: rationale,
      completedAt: new Date().toISOString(),
      progressPercentage: 100,
      calculatedProgress: 100,
    };

    try {
      const res = await fetch(
        `/api/v1/projects/${projectId}/milestones/${target.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({ rationale }),
        }
      );
      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.data) {
        updatedMs = { ...updatedMs, ...resData.data };
      }
    } catch (e) {
      console.warn('Milestone complete warning, persisting locally:', e);
    }

    setMilestones((prev) => {
      const list = prev.map((m) => (m.id === target.id ? updatedMs : m));
      try {
        localStorage.setItem(`sf_milestones_${projectId}`, JSON.stringify(list));
        window.dispatchEvent(new Event('sf_milestones_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch { }
      return list;
    });
    if (selectedMilestone && selectedMilestone.id === target.id) {
      setSelectedMilestone(updatedMs);
    }
    setMilestoneToComplete(null);
  };

  const handleDeleteMilestone = async () => {
    if (!selectedMilestone) return;
    const res = await fetch(
      `/api/v1/projects/${projectId}/milestones/${selectedMilestone.id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUserId}`,
        },
      }
    );
    const resData = await res.json();
    if (!res.ok || resData.error) {
      throw new Error(resData.error?.message || 'Failed to delete milestone');
    }
    setMilestones((prev) => {
      const list = prev.filter((m) => m.id !== selectedMilestone.id);
      try {
        localStorage.setItem(`sf_milestones_${projectId}`, JSON.stringify(list));
        window.dispatchEvent(new Event('sf_milestones_updated'));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return list;
    });
    setSelectedMilestone(null);
  };

  // Filtered Milestones
  const filteredMilestones = milestones.filter((m) => {
    if (statusFilter === 'Done' && m.status !== 'Done') return false;
    if (statusFilter === 'To Do' && m.status !== 'To Do') return false;
    if (statusFilter === 'In Progress' && m.status !== 'In Progress') return false;
    if (statusFilter === 'Overdue' && (!m.isOverdue || m.status === 'Done')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = m.title?.toLowerCase().includes(q);
      const matchDesc = m.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  // Permission Denied State
  if (error === 'PERMISSION_DENIED') {
    return (
      <Card className="p-12 text-center border-warning/30 bg-warning/5">
        <div className="w-12 h-12 mx-auto rounded-full bg-warning/20 flex items-center justify-center text-warning mb-2">
          <IcoLock size={22} color="#f59e0b" />
        </div>
        <h3 className="text-lg font-bold text-mainText mt-1">Team-Only Workspace</h3>
        <p className="text-xs text-muted max-w-md mx-auto mt-1">
          Only confirmed project members can access and manage delivery milestones.
        </p>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card className="p-8 text-center border-warning/30 bg-warning/10 text-warning">
        <p className="font-bold text-sm">Failed to load milestones</p>
        <p className="text-xs mt-1">{error}</p>
        <Button size="sm" variant="outline" className="mt-4" onClick={fetchData}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Toolbar: View Switcher, Filter, Search, Create */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Left: View Mode Toggle & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle (List vs Timeline) */}
          <div className="flex bg-bg p-1 rounded-lg border border-uiBorder">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all inline-flex items-center gap-1.5 ${viewMode === 'list'
                ? 'bg-[#221a36] text-[#b29af5] border border-[#8861dc50] shadow-sm'
                : 'text-muted hover:text-mainText'
                }`}
            >
              <IcoClipboard size={13} />
              <span>Card List</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all inline-flex items-center gap-1.5 ${viewMode === 'timeline'
                ? 'bg-[#221a36] text-[#b29af5] border border-[#8861dc50] shadow-sm'
                : 'text-muted hover:text-mainText'
                }`}
            >
              <IcoMap size={13} />
              <span>Roadmap Timeline</span>
            </button>
          </div>

          {/* Status Filter */}
          {viewMode === 'list' && (
            <select
              className="p-2 border border-uiBorder rounded-lg bg-bg text-xs font-semibold text-mainText"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Milestones ({milestones.length})</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          )}
        </div>

        {/* Right: Search and New Milestone CTA */}
        <div className="flex items-center gap-3">
          {viewMode === 'list' && (
            <div className="w-full sm:w-56">
              <input
                type="text"
                placeholder="Search milestones..."
                className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-xs focus:outline-none focus:border-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {isMember && (
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              + Add Milestone
            </Button>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <SkeletonLoader type="card" count={4} className="grid md:grid-cols-2" />
      ) : milestones.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center bg-[#15151a] border border-dashed border-[#33333e] rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center text-primary">
            <IcoTarget size={28} color="#b29af5" />
          </div>
          <h3 className="text-lg font-bold text-primary">No milestones yet</h3>
          <p className="text-xs text-muted max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Break your project deliverables into major phases and track team progress
            automatically as linked tasks reach completion.
          </p>
          {isMember && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create your first milestone
            </Button>
          )}
        </Card>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <MilestoneTimelineView
          milestones={milestones}
          onSelectMilestone={(m) => setSelectedMilestone(m)}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onOpenCompleteModal={(m) => setMilestoneToComplete(m)}
          canEdit={true}
        />
      ) : (
        /* Card List View */
        <div className="grid md:grid-cols-2 gap-4">
          {filteredMilestones.length === 0 ? (
            <div className="col-span-2 p-8 text-center text-muted bg-bg/50 rounded-xl border border-uiBorder text-xs">
              No milestones match the selected filter.
            </div>
          ) : (
            filteredMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                onClick={() => setSelectedMilestone(milestone)}
                onOpenCompleteModal={() => setMilestoneToComplete(milestone)}
                canEdit={true}
              />
            ))
          )}
        </div>
      )}

      {/* ---------------- CREATE MILESTONE MODAL ---------------- */}
      {showCreateModal && (
        <MilestoneCreateModal
          projectId={projectId}
          projectTasks={projectTasks}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateMilestone}
        />
      )}

      {/* ---------------- MILESTONE DETAIL MODAL ---------------- */}
      {selectedMilestone && (
        <MilestoneDetailModal
          milestone={selectedMilestone}
          projectTasks={projectTasks}
          canEdit={true}
          onClose={() => setSelectedMilestone(null)}
          onLinkTask={handleLinkTask}
          onUnlinkTask={handleUnlinkTask}
          onOpenCompleteModal={() => setMilestoneToComplete(selectedMilestone)}
          onDeleteMilestone={handleDeleteMilestone}
          onUpdateMilestone={handleUpdateMilestone}
        />
      )}

      {/* ---------------- MANUAL COMPLETE MODAL ---------------- */}
      {milestoneToComplete && (
        <MilestoneCompleteModal
          milestone={milestoneToComplete}
          onClose={() => setMilestoneToComplete(null)}
          onConfirm={handleManualComplete}
        />
      )}
    </div>
  );
};

export default MilestonesSection;
