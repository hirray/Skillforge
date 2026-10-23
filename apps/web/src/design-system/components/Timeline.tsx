import React from 'react';

export interface TimelineMilestone {
  id: string;
  title: string;
  dueDate?: string | null;
  status: string;
  progress?: number;
  calculatedProgress?: number;
  isOverdue?: boolean;
  isManualCompletion?: boolean;
  tasksCount?: number;
}

export interface TimelineProps {
  milestones: TimelineMilestone[];
  selectedMilestoneId?: string | null;
  onSelectMilestone?: (milestone: TimelineMilestone) => void;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  milestones,
  selectedMilestoneId,
  onSelectMilestone,
  className = '',
}) => {
  // Sort milestones chronologically by due date (items without dueDate at the end)
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  if (sortedMilestones.length === 0) {
    return (
      <div className={`p-8 text-center text-muted bg-bg/40 rounded-xl border border-uiBorder ${className}`}>
        No milestones scheduled on the roadmap yet.
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto py-6 px-2 select-none scrollbar-thin ${className}`}>
      <div className="flex items-start min-w-max relative px-8">
        {/* Continuous background connecting line */}
        <div className="absolute top-[22px] left-12 right-12 h-1 bg-uiBorder z-0" />

        {sortedMilestones.map((item) => {
          const isSelected = selectedMilestoneId === item.id;
          const isDone = item.status === 'Done';
          const isOverdue = item.isOverdue && !isDone;
          const effectiveProgress = item.calculatedProgress !== undefined ? item.calculatedProgress : (item.progress || 0);

          return (
            <div
              key={item.id}
              onClick={() => onSelectMilestone?.(item)}
              className={`relative z-10 flex flex-col items-center cursor-pointer group px-6 transition-all duration-200 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
              style={{ minWidth: '180px', maxWidth: '240px' }}
            >
              {/* Milestone Node */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-elevation-1 ${
                  isDone
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : isOverdue
                    ? 'bg-white border-2 border-warning text-warning ring-4 ring-warning/30 animate-pulse'
                    : 'bg-white border-2 border-accent text-primary ring-4 ring-accent/20'
                } ${isSelected ? 'ring-primary shadow-elevation-2' : ''}`}
              >
                {isDone ? (
                  <span className="font-bold text-base">✓</span>
                ) : (
                  <span className="text-xs font-bold">{effectiveProgress}%</span>
                )}
              </div>

              {/* Node Card / Label */}
              <div
                className={`mt-3 p-3 rounded-xl border text-center transition-all duration-200 w-full ${
                  isSelected
                    ? 'bg-white border-primary shadow-elevation-2'
                    : 'bg-white/90 border-uiBorder group-hover:border-accent shadow-elevation-1'
                }`}
              >
                <p className="font-bold text-xs text-primary line-clamp-2 leading-snug">
                  {item.title}
                </p>

                <div className="mt-1.5 flex flex-col items-center gap-0.5">
                  <span
                    className={`text-[11px] font-medium ${
                      isOverdue ? 'text-warning font-semibold' : 'text-muted'
                    }`}
                  >
                    {item.dueDate
                      ? new Date(item.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'No due date'}
                  </span>

                  {/* Status Indicator Tag */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1 ${
                      isDone
                        ? 'bg-primary text-white'
                        : isOverdue
                        ? 'bg-warning/20 text-warning border border-warning/30'
                        : effectiveProgress > 0
                        ? 'bg-accent/20 text-primary border border-accent/40'
                        : 'bg-uiBorder text-muted'
                    }`}
                  >
                    {isDone
                      ? item.isManualCompletion
                        ? 'Done (Manual)'
                        : 'Completed'
                      : isOverdue
                      ? 'Overdue'
                      : effectiveProgress > 0
                      ? 'In Progress'
                      : 'Upcoming'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
