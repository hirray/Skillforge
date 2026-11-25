import React, { useState } from 'react';
import { Card, Button, IcoClose } from '../../design-system/components';

interface MilestoneCompleteModalProps {
  milestone: any;
  onClose: () => void;
  onConfirm: (rationale: string) => Promise<void>;
}

export const MilestoneCompleteModal: React.FC<MilestoneCompleteModalProps> = ({
  milestone,
  onClose,
  onConfirm,
}) => {
  const [rationale, setRationale] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalTasks = milestone.tasks?.length || 0;
  const doneTasks = milestone.tasks?.filter((t: any) => t.status === 'Done').length || 0;
  const progress = milestone.calculatedProgress !== undefined ? milestone.calculatedProgress : (milestone.progress || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rationale.trim()) {
      setError('Please provide a rationale explaining why this milestone is being marked complete.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(rationale.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to complete milestone');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <Card className="w-full max-w-md p-6 bg-[#15151a] border border-[#33333e] text-[#f0edf5] my-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-uiBorder">
          <div>
            <h3 className="text-lg font-bold text-primary">Manual Milestone Completion</h3>
            <p className="text-xs text-muted mt-0.5">{milestone.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-mainText p-1 rounded-lg"
          >
            <IcoClose size={16} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-xs">
            {error}
          </div>
        )}

        {/* Informational callout */}
        <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg text-xs text-mainText leading-relaxed">
          <p className="font-semibold text-primary mb-1 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Completion Override</span>
          </p>
          <p>
            Current task completion is <strong>{progress}%</strong> ({doneTasks}/{totalTasks} tasks done).
            Manual completion will record this milestone as completed without faking 100% task progress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mainText mb-1">
              Completion Rationale *
            </label>
            <textarea
              className="w-full p-2.5 border border-uiBorder rounded-lg bg-bg text-xs text-mainText focus:outline-none focus:border-accent"
              rows={4}
              placeholder="e.g. Stakeholders signed off in sprint review; remaining items moved to next release."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              disabled={submitting}
              autoFocus
            />
            <p className="text-[11px] text-muted mt-1">
              This rationale will be recorded in the audit history and displayed on the milestone.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-uiBorder">
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
              disabled={!rationale.trim() || submitting}
            >
              {submitting ? 'Confirming...' : 'Confirm Completion'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MilestoneCompleteModal;
