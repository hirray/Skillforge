import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../../design-system/components';

interface TaskDetailModalProps {
  task: any;
  onClose: () => void;
  onUpdate: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  members: any[];
  milestones: any[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  members,
  milestones,
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>(task.comments || []);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    await onUpdate(task.id, { status: newStatus });
    setIsUpdating(false);
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    setIsUpdating(true);
    await onUpdate(task.id, { assigneeId: newAssigneeId || null });
    setIsUpdating(false);
  };

  const handleMilestoneChange = async (newMilestoneId: string) => {
    setIsUpdating(true);
    await onUpdate(task.id, { milestoneId: newMilestoneId || null });
    setIsUpdating(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/v1/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      const data = await res.json();
      if (data.data) {
        setComments([...comments, data.data]);
        setCommentText('');
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-2xl bg-surface border border-uiBorder shadow-elevation-3 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start pb-3 border-b border-uiBorder">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge status={task.status?.toLowerCase() as any}>{task.status}</Badge>
              <Badge status={task.priority?.toLowerCase() as any}>{task.priority}</Badge>
            </div>
            <h2 className="text-xl font-bold text-primary">{task.title}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-mainText font-bold text-lg">
            ✕
          </button>
        </div>

        {task.description && (
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-mainText leading-relaxed bg-bg p-3 rounded-xl border border-uiBorder">
              {task.description}
            </p>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">Status</label>
            <select
              className="w-full px-3 py-1.5 text-xs bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent font-semibold"
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">Assignee</label>
            <select
              className="w-full px-3 py-1.5 text-xs bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent"
              value={task.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.userId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-mainText mb-1">Milestone</label>
            <select
              className="w-full px-3 py-1.5 text-xs bg-surface border border-uiBorder rounded-xl outline-none focus:border-accent"
              value={task.milestoneId || ''}
              onChange={(e) => handleMilestoneChange(e.target.value)}
              disabled={isUpdating}
            >
              <option value="">None (Independent)</option>
              {milestones.map((ms) => (
                <option key={ms.id} value={ms.id}>
                  {ms.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments Stream */}
        <div className="space-y-3 pt-3 border-t border-uiBorder">
          <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">Comments</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-muted italic">No comments yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl bg-bg border border-uiBorder text-xs">
                  <div className="flex justify-between items-center mb-1 text-[10px] text-muted">
                    <span className="font-bold text-mainText">{c.userId}</span>
                    <span>{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-mainText">{c.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 text-xs"
            />
            <Button size="sm" type="submit">
              Send
            </Button>
          </form>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-uiBorder">
          <button
            onClick={() => onDelete(task.id)}
            className="text-xs text-red-500 hover:underline font-bold"
          >
            🗑️ Delete Task
          </button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
