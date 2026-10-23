import React from 'react';

interface TaskFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: string;
  onPriorityChange: (p: string) => void;
  selectedAssignee: string;
  onAssigneeChange: (a: string) => void;
  members: any[];
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssignee,
  onAssigneeChange,
  members,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded-2xl border border-uiBorder shadow-elevation-1">
      <input
        type="text"
        placeholder="Filter tasks by title..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="px-3.5 py-1.5 text-xs bg-bg border border-uiBorder rounded-xl outline-none focus:border-accent flex-1 min-w-[160px]"
      />

      <select
        value={selectedPriority}
        onChange={(e) => onPriorityChange(e.target.value)}
        className="px-3 py-1.5 text-xs bg-bg border border-uiBorder rounded-xl outline-none focus:border-accent"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </select>

      <select
        value={selectedAssignee}
        onChange={(e) => onAssigneeChange(e.target.value)}
        className="px-3 py-1.5 text-xs bg-bg border border-uiBorder rounded-xl outline-none focus:border-accent"
      >
        <option value="">All Assignees</option>
        <option value="unassigned">Unassigned</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.userId}
          </option>
        ))}
      </select>
    </div>
  );
};
