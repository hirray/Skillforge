import React, { useState } from 'react';
import { Card, Button, Input } from '../../design-system/components';

interface MilestoneCreateModalProps {
  projectId: string;
  projectTasks: any[];
  onClose: () => void;
  onCreate: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    linkedTaskIds?: string[];
  }) => Promise<void>;
}

export const MilestoneCreateModal: React.FC<MilestoneCreateModalProps> = ({
  projectTasks,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Milestone title is required');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        linkedTaskIds: selectedTaskIds,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-lg p-6 bg-white my-8 shadow-elevation-3">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-uiBorder">
          <div>
            <h2 className="text-xl font-bold text-primary">Create Milestone</h2>
            <p className="text-xs text-muted mt-0.5">Define a major project deliverable or phase.</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-mainText text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Milestone Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. MVP Launch / Beta Signoff"
            autoFocus
          />

          <div>
            <label className="block text-xs font-bold text-mainText mb-1">
              Objective & Description
            </label>
            <textarea
              className="w-full p-2.5 border border-uiBorder rounded-lg bg-bg text-xs text-mainText focus:outline-none focus:border-accent"
              rows={3}
              placeholder="Key deliverable criteria, objectives, and success benchmarks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input
            type="date"
            label="Target Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          {/* Link Existing Tasks */}
          <div>
            <label className="block text-xs font-bold text-mainText mb-1.5">
              Link Existing Tasks ({selectedTaskIds.length} selected)
            </label>
            <div className="border border-uiBorder rounded-lg p-2 max-h-44 overflow-y-auto bg-bg/50 space-y-1.5">
              {projectTasks.length === 0 ? (
                <p className="text-xs text-muted italic p-2 text-center">
                  No tasks exist in this project yet. You can create tasks later and link them.
                </p>
              ) : (
                projectTasks.map((t) => {
                  const isChecked = selectedTaskIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-accent/15 border-accent text-primary font-semibold'
                          : 'bg-white border-uiBorder text-mainText hover:bg-bg'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTaskSelection(t.id)}
                        className="rounded border-uiBorder text-primary focus:ring-accent"
                      />
                      <span className="flex-1 truncate">{t.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          t.status === 'Done'
                            ? 'bg-primary text-white'
                            : 'bg-uiBorder text-muted'
                        }`}
                      >
                        {t.status}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-uiBorder">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim() || submitting}
            >
              {submitting ? 'Creating...' : 'Create Milestone'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MilestoneCreateModal;
