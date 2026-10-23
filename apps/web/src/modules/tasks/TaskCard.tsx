import React from 'react';
import { Card, Badge, Avatar } from '../../design-system/components';

interface TaskCardProps {
  task: any;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDragStart }) => {
  return (
    <Card
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onClick={onClick}
      className="p-3.5 bg-surface rounded-xl border border-uiBorder hover:border-accent hover:shadow-elevation-2 transition-all duration-150 cursor-pointer space-y-2.5 active:scale-[0.99]"
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-bold text-xs text-mainText line-clamp-2">{task.title}</h4>
        <Badge status={task.priority?.toLowerCase() as any}>{task.priority}</Badge>
      </div>

      {task.description && (
        <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="pt-2 border-t border-uiBorder/60 flex items-center justify-between text-[11px]">
        {task.assigneeId ? (
          <div className="flex items-center gap-1.5 text-muted">
            <Avatar name={task.assigneeId} size="sm" />
            <span className="truncate max-w-[80px] font-medium">{task.assigneeId}</span>
          </div>
        ) : (
          <span className="text-muted italic text-[10px]">Unassigned</span>
        )}

        {task.dueDate && (
          <span className="text-muted font-medium">
            📅 {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Card>
  );
};
