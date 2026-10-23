import React from 'react';
import { Card, ProgressRing } from '../../design-system/components';

interface MilestoneCardProps {
  milestone: any;
  onClick: () => void;
  onOpenCompleteModal?: () => void;
  canEdit?: boolean;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onClick,
  onOpenCompleteModal,
  canEdit = true,
}) => {
  const isDone = milestone.status === 'Done';
  const isOverdue = milestone.isOverdue && !isDone;
  const progress = milestone.calculatedProgress !== undefined ? milestone.calculatedProgress : (milestone.progress || 0);
  const totalTasks = milestone.tasks?.length || 0;
  const doneTasks = milestone.tasks?.filter((t: any) => t.status === 'Done').length || 0;

  // Left-edge accent bar color
  let accentBarColor = 'bg-uiBorder'; // gray = To Do
  if (isDone) {
    accentBarColor = 'bg-primary'; // Bleu océan = done
  } else if (isOverdue) {
    accentBarColor = 'bg-warning'; // Orange pastel = overdue
  } else if (progress > 0) {
    accentBarColor = 'bg-accent'; // Bleu ciel = in progress
  }

  return (
    <Card
      className="relative overflow-hidden transition-all duration-200 hover:shadow-elevation-2 cursor-pointer group bg-white border border-uiBorder/80 p-5"
      onClick={onClick}
    >
      {/* Left-edge accent bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${accentBarColor}`} />

      <div className="flex items-start justify-between gap-4 pl-2">
        {/* Left info column */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Status Pill */}
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
              {isDone ? '✓ Done' : isOverdue ? '⚠️ Overdue' : progress > 0 ? 'In Progress' : 'To Do'}
            </span>

            {/* Manually Confirmed Flag */}
            {milestone.isManualCompletion && (
              <span
                className="text-[11px] px-2 py-0.5 bg-yellow/40 border border-yellow text-mainText rounded-full font-semibold"
                title={milestone.completionRationale || 'Manually confirmed by team'}
              >
                Manually Confirmed
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors leading-snug truncate">
            {milestone.title}
          </h3>

          {milestone.description && (
            <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
              {milestone.description}
            </p>
          )}

          {/* Metadata Footer */}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <span>📅</span>
              <span className={isOverdue ? 'text-warning font-bold' : ''}>
                {milestone.dueDate
                  ? new Date(milestone.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'No due date'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span>📋</span>
              <span>
                {totalTasks === 0
                  ? '0 tasks linked'
                  : `${doneTasks}/${totalTasks} task${totalTasks > 1 ? 's' : ''} done`}
              </span>
            </div>
          </div>
        </div>

        {/* Right column: Circular Progress Ring & Actions */}
        <div className="flex flex-col items-center justify-between self-stretch shrink-0">
          <ProgressRing
            progress={progress}
            size={56}
            strokeWidth={5}
            status={milestone.status}
            isOverdue={isOverdue}
          />

          {!isDone && canEdit && onOpenCompleteModal && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenCompleteModal();
              }}
              className="mt-2 text-[11px] font-bold text-accent hover:text-primary hover:underline"
            >
              Mark Done
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MilestoneCard;
