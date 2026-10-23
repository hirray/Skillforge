import React, { useState } from 'react';
import { Card, Button, ProgressRing, Input } from '../../design-system/components';

interface MilestoneDetailModalProps {
  milestone: any;
  projectTasks: any[];
  canEdit: boolean;
  onClose: () => void;
  onLinkTask: (taskId: string) => Promise<void>;
  onUnlinkTask: (taskId: string) => Promise<void>;
  onOpenCompleteModal: () => void;
  onDeleteMilestone: () => Promise<void>;
  onUpdateMilestone: (data: any) => Promise<void>;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  projectTasks,
  canEdit,
  onClose,
  onLinkTask,
  onUnlinkTask,
  onOpenCompleteModal,
  onDeleteMilestone,
  onUpdateMilestone,
}) => {
  const [selectedTaskToLink, setSelectedTaskToLink] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(milestone.title);
  const [editDescription, setEditDescription] = useState(milestone.description || '');
  const [editDueDate, setEditDueDate] = useState(
    milestone.dueDate ? milestone.dueDate.split('T')[0] : ''
  );
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isDone = milestone.status === 'Done';
  const isOverdue = milestone.isOverdue && !isDone;
  const progress = milestone.calculatedProgress !== undefined ? milestone.calculatedProgress : (milestone.progress || 0);

  const linkedTasks = milestone.tasks || [];
  const linkedTaskIds = linkedTasks.map((t: any) => t.id);

  // Tasks available to be linked (not yet in this milestone)
  const availableTasks = projectTasks.filter((t: any) => !linkedTaskIds.includes(t.id));

  const handleLink = async () => {
    if (!selectedTaskToLink) return;
    setIsLinking(true);
    setError(null);
    try {
      await onLinkTask(selectedTaskToLink);
      setSelectedTaskToLink('');
    } catch (err: any) {
      setError(err.message || 'Failed to link task');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async (taskId: string) => {
    setIsUnlinking(taskId);
    setError(null);
    try {
      await onUnlinkTask(taskId);
    } catch (err: any) {
      setError(err.message || 'Failed to unlink task');
    } finally {
      setIsUnlinking(null);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete milestone "${milestone.title}"? Linked tasks will not be deleted.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await onDeleteMilestone();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete milestone');
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setIsSavingEdit(true);
    setError(null);
    try {
      await onUpdateMilestone({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        dueDate: editDueDate || null,
      });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone');
    } finally {
      setIsSavingEdit(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-2xl p-6 bg-white my-8 max-h-[90vh] overflow-y-auto shadow-elevation-3">
        {/* Top Header */}
        <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-uiBorder">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                  isDone
                    ? 'bg-primary text-white'
                    : isOverdue
                    ? 'bg-warning/20 text-warning border border-warning/30'
                    : progress > 0
                    ? 'bg-accent/20 text-primary border border-accent/40'
                    : 'bg-uiBorder text-muted'
                }`}
              >
                {isDone ? '✓ Completed' : isOverdue ? '⚠️ Overdue' : progress > 0 ? 'In Progress' : 'To Do'}
              </span>

              {milestone.isManualCompletion && (
                <span className="text-[11px] px-2 py-0.5 bg-yellow/40 border border-yellow text-mainText rounded-full font-semibold">
                  Manually Confirmed
                </span>
              )}
            </div>

            {!isEditing ? (
              <h2 className="text-2xl font-bold text-primary leading-tight">
                {milestone.title}
              </h2>
            ) : (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Milestone title"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && canEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs text-accent hover:text-primary font-bold px-2 py-1 rounded hover:bg-bg"
              >
                ✏️ Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="text-muted hover:text-mainText text-lg font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Content Layout */}
        <div className="grid md:grid-cols-3 gap-6 text-sm">
          {/* Left 2 Cols: Details & Linked Tasks & History */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h4 className="font-bold text-mainText text-xs uppercase tracking-wider mb-1">
                Objective & Description
              </h4>
              {!isEditing ? (
                <p className="text-mainText text-xs leading-relaxed whitespace-pre-wrap bg-bg p-3 rounded-lg border border-uiBorder">
                  {milestone.description || <span className="text-muted italic">No description provided.</span>}
                </p>
              ) : (
                <div className="space-y-2">
                  <textarea
                    className="w-full p-2.5 border border-uiBorder rounded-lg bg-bg text-xs text-mainText focus:outline-none focus:border-accent"
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Milestone description..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditTitle(milestone.title);
                        setEditDescription(milestone.description || '');
                        setEditDueDate(milestone.dueDate ? milestone.dueDate.split('T')[0] : '');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSavingEdit || !editTitle.trim()}
                    >
                      {isSavingEdit ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Completion Rationale Note */}
            {milestone.isManualCompletion && milestone.completionRationale && (
              <div className="p-3 bg-yellow/20 border border-yellow/40 rounded-lg text-xs">
                <p className="font-bold text-mainText mb-0.5">📝 Manual Completion Rationale:</p>
                <p className="text-muted italic leading-relaxed">
                  "{milestone.completionRationale}"
                </p>
                {milestone.completedBy && (
                  <p className="text-[10px] text-muted mt-1">
                    Confirmed by: <strong className="text-primary">{milestone.completedBy}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Linked Tasks Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-mainText text-xs uppercase tracking-wider">
                  Linked Tasks ({linkedTasks.length})
                </h4>
                <span className="text-xs font-semibold text-muted">
                  {linkedTasks.filter((t: any) => t.status === 'Done').length}/{linkedTasks.length} Completed
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {linkedTasks.length === 0 ? (
                  <p className="text-xs text-muted italic bg-bg p-3 rounded-lg border border-uiBorder text-center">
                    No tasks linked yet. Link existing tasks below to track automated progress.
                  </p>
                ) : (
                  linkedTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2.5 bg-bg rounded-lg border border-uiBorder text-xs gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            task.status === 'Done'
                              ? 'bg-primary'
                              : task.status === 'In Progress'
                              ? 'bg-accent'
                              : 'bg-muted'
                          }`}
                        />
                        <span className={`truncate font-medium ${task.status === 'Done' ? 'line-through text-muted' : 'text-mainText'}`}>
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            task.status === 'Done'
                              ? 'bg-primary text-white'
                              : 'bg-uiBorder text-muted'
                          }`}
                        >
                          {task.status}
                        </span>

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleUnlink(task.id)}
                            disabled={isUnlinking === task.id}
                            className="text-muted hover:text-warning text-xs font-bold px-1.5 py-0.5 rounded hover:bg-warning/10 transition-colors"
                            title="Unlink task from milestone"
                          >
                            {isUnlinking === task.id ? '...' : 'Unlink'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Link New Task Dropdown Control */}
              {canEdit && availableTasks.length > 0 && (
                <div className="mt-3 flex gap-2">
                  <select
                    className="flex-1 p-2 border border-uiBorder rounded-lg bg-bg text-xs text-mainText focus:outline-none focus:border-accent"
                    value={selectedTaskToLink}
                    onChange={(e) => setSelectedTaskToLink(e.target.value)}
                    disabled={isLinking}
                  >
                    <option value="">-- Select a project task to link --</option>
                    {availableTasks.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.status})
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    onClick={handleLink}
                    disabled={!selectedTaskToLink || isLinking}
                  >
                    {isLinking ? 'Linking...' : '+ Link Task'}
                  </Button>
                </div>
              )}
            </div>

            {/* Audit & History Log */}
            <div>
              <h4 className="font-bold text-mainText text-xs uppercase tracking-wider mb-2">
                Milestone History & Audit Trail
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {(!milestone.history || milestone.history.length === 0) ? (
                  <p className="text-[11px] text-muted italic">No history events recorded yet.</p>
                ) : (
                  milestone.history.map((h: any) => (
                    <div key={h.id} className="p-2 bg-bg/60 rounded border border-uiBorder text-[11px]">
                      <div className="flex justify-between items-center text-muted">
                        <span className="font-semibold text-mainText">{h.changedBy}</span>
                        <span>{new Date(h.changedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-muted mt-0.5">
                        <strong className="text-primary">{h.field}</strong>: {h.newValue || h.oldValue}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Progress Ring, Dates & Controls */}
          <div className="flex flex-col items-center gap-5 border-l border-uiBorder pl-4 text-xs">
            {/* Circular Progress Ring */}
            <div className="flex flex-col items-center p-3 bg-bg/50 rounded-xl border border-uiBorder w-full">
              <ProgressRing
                progress={progress}
                size={84}
                strokeWidth={7}
                status={milestone.status}
                isOverdue={isOverdue}
              />
              <span className="mt-2 font-bold text-xs text-primary">
                {progress}% Complete
              </span>
              <span className="text-[11px] text-muted">
                {linkedTasks.filter((t: any) => t.status === 'Done').length} of {linkedTasks.length} tasks done
              </span>
            </div>

            {/* Metadata Card */}
            <div className="w-full space-y-3 bg-white p-3 rounded-xl border border-uiBorder">
              <div>
                <label className="font-bold block text-muted text-[10px] uppercase">Target Due Date</label>
                {!isEditing ? (
                  <span className={`font-semibold text-xs ${isOverdue ? 'text-warning' : 'text-mainText'}`}>
                    {milestone.dueDate
                      ? new Date(milestone.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Not set'}
                  </span>
                ) : (
                  <input
                    type="date"
                    className="w-full p-1 border border-uiBorder rounded bg-bg text-xs mt-0.5"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                  />
                )}
              </div>

              {milestone.completedAt && (
                <div>
                  <label className="font-bold block text-muted text-[10px] uppercase">Completed Date</label>
                  <span className="font-semibold text-xs text-primary">
                    {new Date(milestone.completedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {milestone.completedBy && (
                <div>
                  <label className="font-bold block text-muted text-[10px] uppercase">Completed By</label>
                  <span className="font-semibold text-xs text-mainText">
                    {milestone.completedBy}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2 pt-2 border-t border-uiBorder">
              {!isDone && canEdit && (
                <Button
                  size="sm"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  onClick={onOpenCompleteModal}
                >
                  🎯 Mark Milestone Complete
                </Button>
              )}

              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-warning border-warning/30 hover:bg-warning/10"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Milestone'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MilestoneDetailModal;
