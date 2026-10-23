import { useState, useEffect } from 'react';
import { Card, Button, Input } from '../../design-system/components';

interface TasksSectionProps {
  projectId: string;
  project: any;
  onProjectUpdated?: () => void;
}

const statusColumns = ['To Do', 'In Progress', 'In Review', 'Done'] as const;

export const TasksSection = ({ projectId, project }: TasksSectionProps) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [tasks, setTasks] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Create Form
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'To Do',
    assigneeId: '',
    dueDate: '',
    labels: '',
    milestoneId: ''
  });

  // Check if current user is confirmed member or owner
  const isOwner = project?.ownerId === currentUserId;
  const isMember = project?.members?.some((m: any) => m.userId === currentUserId && m.status === 'active') || isOwner;

  const fetchTasksAndMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch tasks
      const tasksRes = await fetch(`/api/v1/projects/${projectId}/tasks`, {
        headers: { 'Authorization': `Bearer ${currentUserId}` }
      });
      const tasksData = await tasksRes.json();

      if (!tasksRes.ok || tasksData.error) {
        if (tasksRes.status === 403) {
          setError('PERMISSION_DENIED');
        } else {
          setError(tasksData.error?.message || 'Failed to load tasks');
        }
        setLoading(false);
        return;
      }

      setTasks(tasksData.data || []);

      // 2. Fetch active members for assignee picker
      const membersRes = await fetch(`/api/v1/projects/${projectId}/members`);
      const membersData = await membersRes.json();
      const confirmed = (membersData.data || []).filter((m: any) => m.status === 'active');
      
      // Ensure owner is included in assignee list
      const ownerExists = confirmed.some((m: any) => m.userId === project.ownerId);
      if (!ownerExists && project?.ownerId) {
        confirmed.unshift({
          id: 'owner-member',
          userId: project.ownerId,
          role: 'Owner',
          status: 'active',
          user: { id: project.ownerId, email: project.ownerId }
        });
      }
      setActiveMembers(confirmed);

      // 3. Fetch project milestones
      try {
        const msRes = await fetch(`/api/v1/projects/${projectId}/milestones`, {
          headers: { Authorization: `Bearer ${currentUserId}` }
        });
        const msData = await msRes.json();
        if (msRes.ok && msData.data) {
          setMilestones(msData.data);
        }
      } catch (err) {
        console.error('Failed to fetch milestones for tasks:', err);
      }

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksAndMembers();
  }, [projectId, currentUserId]);

  const handleCreateTask = async () => {
    if (!createForm.title.trim()) {
      return setActionError('Task title is required');
    }
    setActionError(null);
    try {
      const payload: any = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        priority: createForm.priority,
        status: createForm.status,
        assigneeId: createForm.assigneeId || undefined,
        dueDate: createForm.dueDate || undefined,
        labels: createForm.labels ? createForm.labels.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        milestoneId: createForm.milestoneId || undefined
      };

      const res = await fetch(`/api/v1/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to create task');

      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
        assigneeId: '',
        dueDate: '',
        labels: '',
        milestoneId: ''
      });
      fetchTasksAndMembers();
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Status update failed');

      // Update state locally and refresh task details if open
      setTasks(prev => prev.map(t => t.id === taskId ? data.data : t));
      if (selectedTask?.id === taskId) {
        setSelectedTask(data.data);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateTaskField = async (taskId: string, fields: any) => {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify(fields)
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Update failed');

      setTasks(prev => prev.map(t => t.id === taskId ? data.data : t));
      setSelectedTask(data.data);
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUserId}` }
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Delete failed');

      setSelectedTask(null);
      fetchTasksAndMembers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim() || !selectedTask) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUserId}`
        },
        body: JSON.stringify({ content: newCommentText.trim() })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to post comment');

      setNewCommentText('');
      // Reload task details to fetch updated comments and history
      const updatedRes = await fetch(`/api/v1/projects/${projectId}/tasks/${selectedTask.id}`, {
        headers: { 'Authorization': `Bearer ${currentUserId}` }
      });
      const updatedData = await updatedRes.json();
      setSelectedTask(updatedData.data);
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedData.data : t));
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Helper pills styling following frozen palette
  const getPriorityPill = (priority: string) => {
    switch (priority) {
      case 'Low':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#E7EAF3] text-[#6B7685]">Low</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-primary">Medium</span>;
      case 'High':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-warning text-mainText">High</span>;
      case 'Critical':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-white">Critical</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#E7EAF3] text-[#6B7685]">{priority}</span>;
    }
  };

  const getStatusColumnPill = (status: string) => {
    switch (status) {
      case 'To Do':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#E7EAF3] text-[#6B7685]">To Do</span>;
      case 'In Progress':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-accent text-primary">In Progress</span>;
      case 'In Review':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow text-mainText">In Review</span>;
      case 'Done':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-white">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Done
          </span>
        );
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#E7EAF3] text-[#6B7685]">{status}</span>;
    }
  };

  const isDueSoonOrOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffHours = (due - now) / (1000 * 60 * 60);
    return diffHours <= 24; // overdue or within 24 hours
  };

  if (loading) {
    return (
      <Card className="p-8 text-center text-muted text-sm">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
        <p>Loading project tasks & Kanban board...</p>
      </Card>
    );
  }

  if (error === 'PERMISSION_DENIED' || (!isMember && error)) {
    return (
      <Card className="p-8 text-center border-l-4 border-warning bg-warning/5">
        <h3 className="font-bold text-primary text-lg mb-2">🔒 Member-Only Task Board</h3>
        <p className="text-sm text-mainText max-w-md mx-auto mb-4">
          Task tracking, Kanban boards, and assignment are restricted to confirmed active team members of this project.
        </p>
        <p className="text-xs text-muted">
          Visit the <strong>Team</strong> tab to request to join or accept an invitation.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-warning/20 border-warning/40 text-warning text-sm">
        Error loading tasks: {error}
      </Card>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (assigneeFilter === 'me' && t.assigneeId !== currentUserId) return false;
    if (assigneeFilter === 'unassigned' && t.assigneeId) return false;
    if (assigneeFilter !== 'all' && assigneeFilter !== 'me' && assigneeFilter !== 'unassigned' && t.assigneeId !== assigneeFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-mainText">Project Tasks Board</h2>
          <p className="text-xs text-muted">
            Track, assign, and coordinate deliverables across workflow states.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => { setActionError(null); setShowCreateModal(true); }}>
            + New Task
          </Button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <Card className="p-3 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-muted">Assignee:</span>
            <select
              className="p-1.5 border border-uiBorder rounded bg-bg text-mainText font-medium"
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
            >
              <option value="all">All Assignees</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
              {activeMembers.map(m => (
                <option key={m.userId} value={m.userId}>
                  {m.user?.email || m.userId} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-muted">Priority:</span>
            <select
              className="p-1.5 border border-uiBorder rounded bg-bg text-mainText font-medium"
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            className="w-full p-1.5 border border-uiBorder rounded bg-bg text-xs"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Kanban Board Grid: 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {statusColumns.map(column => {
          const colTasks = filteredTasks.filter(t => t.status === column);
          const isOver = dragOverColumn === column;

          return (
            <div
              key={column}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverColumn !== column) setDragOverColumn(column);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverColumn(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                if (taskId) {
                  handleUpdateTaskStatus(taskId, column);
                }
                setDraggedTaskId(null);
                setDragOverColumn(null);
              }}
              className={`flex flex-col gap-3 p-3 rounded-xl border min-h-[500px] transition-all duration-150 ${
                isOver
                  ? 'bg-accent/10 border-accent ring-2 ring-accent shadow-sm'
                  : 'bg-bg/50 border-uiBorder'
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center pb-2 border-b border-uiBorder">
                <div className="flex items-center gap-2">
                  {getStatusColumnPill(column)}
                  <span className="text-xs font-bold text-muted">({colTasks.length})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm({ ...createForm, status: column });
                    setShowCreateModal(true);
                  }}
                  className="text-muted hover:text-primary text-sm font-bold px-1"
                  title="Add task to this column"
                >
                  +
                </button>
              </div>

              {/* Drop Target Indicator when dragging over empty or non-empty column */}
              {isOver && (
                <div className="p-3 text-center border-2 border-dashed border-accent rounded-lg bg-accent/20 text-xs font-bold text-primary animate-pulse">
                  Drop to move to {column}
                </div>
              )}

              {/* Task Cards List */}
              <div className="flex flex-col gap-3 flex-1">
                {colTasks.length === 0 && !isOver ? (
                  <div className="p-6 text-center text-muted/60 text-xs border border-dashed border-uiBorder rounded-lg my-auto">
                    No tasks in {column}
                  </div>
                ) : (
                  colTasks.map(task => {
                    const dueSoon = isDueSoonOrOverdue(task.dueDate);
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <Card
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', task.id);
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedTaskId(task.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTaskId(null);
                          setDragOverColumn(null);
                        }}
                        className={`p-3.5 bg-white cursor-grab active:cursor-grabbing hover:shadow-md transition-all border select-none ${
                          isBeingDragged
                            ? 'opacity-40 scale-95 border-accent'
                            : task.needsReassignment
                            ? 'border-warning/80 ring-1 ring-warning/30'
                            : dueSoon && task.status !== 'Done'
                            ? 'border-warning/60 bg-warning/[0.02]'
                            : 'border-uiBorder'
                        }`}
                        onClick={() => setSelectedTask(task)}
                      >
                        {/* Reassignment Attention Banner */}
                        {task.needsReassignment && (
                          <div className="mb-2 px-2 py-1 bg-warning/20 border border-warning/40 text-mainText text-[11px] font-bold rounded flex items-center gap-1">
                            <span>⚠️ Needs Reassignment</span>
                          </div>
                        )}

                        {/* Top: Priority & Due Date */}
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted/60 text-xs font-mono select-none" title="Drag card to move between columns">⠿</span>
                            {getPriorityPill(task.priority)}
                          </div>

                          {task.dueDate && (
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                                dueSoon && task.status !== 'Done'
                                  ? 'bg-warning/20 text-mainText font-bold'
                                  : 'text-muted bg-bg'
                              }`}
                              title={new Date(task.dueDate).toLocaleString()}
                            >
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Milestone Badge */}
                        {task.milestoneId && (
                          <div className="mb-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 truncate max-w-full">
                              🎯 {milestones.find(m => m.id === task.milestoneId)?.title || 'Milestone'}
                            </span>
                          </div>
                        )}

                        {/* Task Title */}
                        <h4 className="font-bold text-mainText text-sm mb-1 leading-snug">
                          {task.title}
                        </h4>

                        {/* Task Description Snippet */}
                        {task.description && (
                          <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.labels.map((lbl: string, idx: number) => (
                              <span key={idx} className="px-1.5 py-0.5 bg-bg border border-uiBorder rounded text-[10px] text-muted font-medium">
                                #{lbl}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bottom Row: Assignee & Column Mover */}
                        <div className="flex justify-between items-center pt-2 border-t border-uiBorder/60 mt-auto text-xs" onClick={e => e.stopPropagation()}>
                          {/* Assignee Avatar */}
                          <div className="flex items-center gap-1.5" title={task.assignee?.email || 'Unassigned'}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              task.assigneeId ? 'bg-accent text-primary' : 'bg-bg text-muted border border-uiBorder'
                            }`}>
                              {task.assignee ? task.assignee.email.charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-[11px] text-muted truncate max-w-[90px]">
                              {task.assignee ? task.assignee.email.split('@')[0] : 'Unassigned'}
                            </span>
                          </div>

                          {/* Quick Workflow Move Controls */}
                          <div className="flex items-center gap-1">
                            {column !== 'To Do' && (
                              <button
                                type="button"
                                className="px-1.5 py-0.5 text-[10px] bg-bg hover:bg-uiBorder rounded text-muted"
                                title={`Move backward`}
                                onClick={() => {
                                  const prevIdx = statusColumns.indexOf(column) - 1;
                                  handleUpdateTaskStatus(task.id, statusColumns[prevIdx]);
                                }}
                              >
                                ←
                              </button>
                            )}
                            {column !== 'Done' && (
                              <button
                                type="button"
                                className="px-1.5 py-0.5 text-[10px] bg-accent/30 hover:bg-accent text-primary rounded font-bold"
                                title={`Move to next stage`}
                                onClick={() => {
                                  const nextIdx = statusColumns.indexOf(column) + 1;
                                  handleUpdateTaskStatus(task.id, statusColumns[nextIdx]);
                                }}
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ----------------- CREATE TASK MODAL ----------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-lg p-6 bg-white my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary">Create New Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-mainText text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-xs">
                {actionError}
              </div>
            )}

            <div className="flex flex-col gap-4 text-sm">
              <Input
                label="Task Title *"
                value={createForm.title}
                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="e.g. Implement authentication middleware"
              />

              <div>
                <label className="font-semibold block text-mainText text-xs mb-1">Description</label>
                <textarea
                  className="w-full p-2.5 border border-uiBorder rounded-lg bg-bg text-sm focus:outline-none focus:border-accent"
                  rows={3}
                  value={createForm.description}
                  onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Details, technical criteria, or acceptance notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-mainText text-xs mb-1">Priority</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm font-medium"
                    value={createForm.priority}
                    onChange={e => setCreateForm({ ...createForm, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-mainText text-xs mb-1">Initial Status</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm font-medium"
                    value={createForm.status}
                    onChange={e => setCreateForm({ ...createForm, status: e.target.value })}
                  >
                    {statusColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-mainText text-xs mb-1">Assignee (Active Members Only)</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                    value={createForm.assigneeId}
                    onChange={e => setCreateForm({ ...createForm, assigneeId: e.target.value })}
                  >
                    <option value="">-- Unassigned --</option>
                    {activeMembers.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.email || m.userId} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    type="date"
                    label="Due Date"
                    value={createForm.dueDate}
                    onChange={e => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block text-mainText text-xs mb-1">Link to Milestone (Optional)</label>
                <select
                  className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                  value={createForm.milestoneId}
                  onChange={e => setCreateForm({ ...createForm, milestoneId: e.target.value })}
                >
                  <option value="">-- None / Backlog --</option>
                  {milestones.map(ms => (
                    <option key={ms.id} value={ms.id}>
                      🎯 {ms.title} ({ms.status})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tags / Labels (comma separated)"
                value={createForm.labels}
                onChange={e => setCreateForm({ ...createForm, labels: e.target.value })}
                placeholder="frontend, auth, bug"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-uiBorder">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateTask} disabled={!createForm.title.trim()}>Create Task</Button>
            </div>
          </Card>
        </div>
      )}

      {/* ----------------- TASK DETAIL & HISTORY MODAL ----------------- */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 bg-white my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-uiBorder">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusColumnPill(selectedTask.status)}
                  {getPriorityPill(selectedTask.priority)}
                  {selectedTask.needsReassignment && (
                    <span className="px-2 py-0.5 bg-warning/20 border border-warning/40 text-mainText text-xs font-bold rounded">
                      ⚠️ Needs Reassignment
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-primary leading-snug">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-muted hover:text-mainText text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-xs">
                {actionError}
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              {/* Left 2 Cols: Details, Comments, History */}
              <div className="md:col-span-2 flex flex-col gap-6">
                {/* Description */}
                <div>
                  <h4 className="font-bold text-mainText text-xs uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-mainText text-sm leading-relaxed whitespace-pre-wrap bg-bg p-3 rounded-lg border border-uiBorder">
                    {selectedTask.description || <span className="text-muted italic">No description provided.</span>}
                  </p>
                </div>

                {/* Comment Thread */}
                <div>
                  <h4 className="font-bold text-mainText text-xs uppercase tracking-wider mb-2">
                    Comments ({selectedTask.comments?.length || 0})
                  </h4>

                  <div className="space-y-3 mb-3 max-h-52 overflow-y-auto pr-1">
                    {(!selectedTask.comments || selectedTask.comments.length === 0) ? (
                      <p className="text-xs text-muted italic">No comments yet. Start the conversation below.</p>
                    ) : (
                      selectedTask.comments.map((c: any) => (
                        <div key={c.id} className="p-3 bg-bg rounded-lg border border-uiBorder text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-primary">{c.user?.email || c.userId}</span>
                            <span className="text-muted text-[10px]">{new Date(c.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-mainText leading-relaxed">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-uiBorder rounded-lg text-xs bg-bg focus:outline-none focus:border-accent"
                      placeholder="Write a comment..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                    />
                    <Button size="sm" onClick={handleAddComment} disabled={!newCommentText.trim()}>
                      Send
                    </Button>
                  </div>
                </div>

                {/* Audit & History Log */}
                <div>
                  <h4 className="font-bold text-mainText text-xs uppercase tracking-wider mb-2">
                    Activity & History Log
                  </h4>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(!selectedTask.history || selectedTask.history.length === 0) ? (
                      <p className="text-xs text-muted italic">No activity recorded yet.</p>
                    ) : (
                      selectedTask.history.map((h: any) => (
                        <div key={h.id} className="p-2 bg-bg/60 rounded border border-uiBorder/80 text-[11px]">
                          <div className="flex justify-between items-center text-muted">
                            <span className="font-semibold text-mainText">{h.changedBy}</span>
                            <span>{new Date(h.changedAt).toLocaleString()}</span>
                          </div>
                          <p className="text-muted mt-0.5">
                            Changed <strong className="text-primary">{h.field}</strong>
                            {h.oldValue ? <span> from <em>{h.oldValue}</em></span> : ''} to <strong>{h.newValue}</strong>
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Col: Metadata & Quick Controls */}
              <div className="flex flex-col gap-4 border-l border-uiBorder pl-4 text-xs">
                <div>
                  <label className="font-semibold block text-muted mb-1">Status</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded bg-bg font-bold text-primary"
                    value={selectedTask.status}
                    onChange={e => handleUpdateTaskStatus(selectedTask.id, e.target.value)}
                  >
                    {statusColumns.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-muted mb-1">Priority</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded bg-bg font-medium"
                    value={selectedTask.priority}
                    onChange={e => handleUpdateTaskField(selectedTask.id, { priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-muted mb-1">Assignee</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded bg-bg font-medium"
                    value={selectedTask.assigneeId || ''}
                    onChange={e => handleUpdateTaskField(selectedTask.id, { assigneeId: e.target.value || null })}
                  >
                    <option value="">-- Unassigned --</option>
                    {activeMembers.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.user?.email || m.userId} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full p-1.5 border border-uiBorder rounded bg-bg text-xs"
                    value={selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''}
                    onChange={e => handleUpdateTaskField(selectedTask.id, { dueDate: e.target.value || null })}
                  />
                </div>

                <div>
                  <label className="font-semibold block text-muted mb-1">Linked Milestone</label>
                  <select
                    className="w-full p-2 border border-uiBorder rounded bg-bg font-medium text-xs text-primary"
                    value={selectedTask.milestoneId || ''}
                    onChange={e => handleUpdateTaskField(selectedTask.id, { milestoneId: e.target.value || null })}
                  >
                    <option value="">-- No Milestone Linked --</option>
                    {milestones.map(ms => (
                      <option key={ms.id} value={ms.id}>
                        🎯 {ms.title} ({ms.status})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedTask.completedAt && (
                  <div className="p-2 bg-primary/10 border border-primary/20 rounded text-[11px] text-primary">
                    <strong>Completed At:</strong> {new Date(selectedTask.completedAt).toLocaleString()}
                  </div>
                )}

                <hr className="border-uiBorder my-1" />

                <Button
                  variant="outline"
                  size="sm"
                  className="text-warning border-warning/30 hover:bg-warning/10 w-full"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                >
                  Delete Task
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TasksSection;
