import React, { useState } from 'react';
import { Timeline, Card, Button } from '../../design-system/components';
import { MilestoneCard } from './MilestoneCard';

interface MilestoneTimelineViewProps {
  milestones: any[];
  onSelectMilestone: (milestone: any) => void;
  onOpenCreateModal: () => void;
  onOpenCompleteModal: (milestone: any) => void;
  canEdit: boolean;
}

export const MilestoneTimelineView: React.FC<MilestoneTimelineViewProps> = ({
  milestones,
  onSelectMilestone,
  onOpenCreateModal,
  onOpenCompleteModal,
  canEdit,
}) => {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    milestones.length > 0 ? milestones[0].id : null
  );

  const selectedMilestone = milestones.find((m) => m.id === activeMilestoneId) || milestones[0];

  const total = milestones.length;
  const completed = milestones.filter((m) => m.status === 'Done').length;
  const overdue = milestones.filter((m) => m.isOverdue && m.status !== 'Done').length;
  const inProgress = milestones.filter(
    (m) => m.status !== 'Done' && (m.calculatedProgress > 0 || m.progress > 0)
  ).length;

  return (
    <div className="space-y-6">
      {/* Milestone Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center border-uiBorder">
          <p className="text-muted text-xs font-semibold">Total Milestones</p>
          <p className="text-xl font-bold text-primary mt-1">{total}</p>
        </Card>
        <Card className="p-3 text-center border-uiBorder">
          <p className="text-muted text-xs font-semibold">Completed</p>
          <p className="text-xl font-bold text-primary mt-1">{completed}</p>
        </Card>
        <Card className="p-3 text-center border-uiBorder">
          <p className="text-muted text-xs font-semibold">In Progress</p>
          <p className="text-xl font-bold text-accent mt-1">{inProgress}</p>
        </Card>
        <Card className="p-3 text-center border-uiBorder">
          <p className="text-muted text-xs font-semibold">Overdue</p>
          <p className="text-xl font-bold text-warning mt-1">{overdue}</p>
        </Card>
      </div>

      {/* Horizontal Roadmap Timeline */}
      <Card className="p-4 bg-white border border-uiBorder">
        <div className="flex justify-between items-center mb-2 px-2">
          <div>
            <h3 className="font-bold text-primary text-sm">Delivery Roadmap</h3>
            <p className="text-[11px] text-muted">Chronological milestone path ordered by target due dates</p>
          </div>
          {canEdit && (
            <Button size="sm" onClick={onOpenCreateModal}>
              + New Milestone
            </Button>
          )}
        </div>

        <Timeline
          milestones={milestones.map((m) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate,
            status: m.status,
            progress: m.progress,
            calculatedProgress: m.calculatedProgress,
            isOverdue: m.isOverdue,
            isManualCompletion: m.isManualCompletion,
            tasksCount: m.tasks?.length || 0,
          }))}
          selectedMilestoneId={activeMilestoneId}
          onSelectMilestone={(node) => {
            setActiveMilestoneId(node.id);
            const found = milestones.find((m) => m.id === node.id);
            if (found) onSelectMilestone(found);
          }}
        />
      </Card>

      {/* Selected Milestone Active Spotlight */}
      {selectedMilestone && (
        <div>
          <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-2">
            Selected Milestone Spotlight
          </h4>
          <MilestoneCard
            milestone={selectedMilestone}
            onClick={() => onSelectMilestone(selectedMilestone)}
            onOpenCompleteModal={() => onOpenCompleteModal(selectedMilestone)}
            canEdit={canEdit}
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneTimelineView;
