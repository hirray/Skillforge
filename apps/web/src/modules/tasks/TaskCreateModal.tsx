import React, { useState } from 'react';
import { Card, Button, Input } from '../../design-system/components';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  members: any[];
  milestones: any[];
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  milestones,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : undefined,
        milestoneId: milestoneId || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-lg bg-surface border border-uiBorder shadow-elevation-3 p-6 space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-uiBorder">
          <h2 className="text-lg font-bold text-primary">Create New Task</h2>
          <button onClick={onClose} className="text-muted hover:text-mainText font-bold text-lg">
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100/60 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">Title *</label>
            <Input
              placeholder="e.g. Implement user authentication UI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 text-sm bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent min-h-[70px]"
              placeholder="Detailed task criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">Priority</label>
              <select
                className="w-full px-4 py-2 text-sm bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={submitting}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">Assignee</label>
              <select
                className="w-full px-4 py-2 text-sm bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.userId} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mainText mb-1">Est. Hours</label>
              <Input
                type="number"
                placeholder="e.g. 10"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">Milestone</label>
            <select
              className="w-full px-4 py-2 text-sm bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent"
              value={milestoneId}
              onChange={(e) => setMilestoneId(e.target.value)}
              disabled={submitting}
            >
              <option value="">None (Independent)</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-uiBorder">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
