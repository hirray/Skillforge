import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  Button,
  ChatBubble,
  DateDivider,
  TypingIndicator,
  NewMessagesPill,
  SkeletonLoader,
  ChatMessageItem,
} from '../../design-system/components';
import { formatDateDivider } from '../../design-system/components/DateDivider';
import { useSocket } from './useSocket';
import { MentionPicker, MentionMember } from './MentionPicker';

export interface GroupChatProps {
  projectId: string;
  projectTitle: string;
  isOwner?: boolean;
}

export const GroupChat: React.FC<GroupChatProps> = ({
  projectId,
  projectTitle,
  isOwner = false,
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Input & composer state
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessageItem | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessageItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [attachments, setAttachments] = useState<{ fileId: string; name: string; url?: string }[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Mention state
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionMembers, setMentionMembers] = useState<MentionMember[]>([]);

  // Report modal state
  const [reportingMessage, setReportingMessage] = useState<ChatMessageItem | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Typing state
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()); // userId -> name
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll & New Messages pill state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unreadNewCount, setUnreadNewCount] = useState(0);

  // Fetch team directory for mention suggestions
  useEffect(() => {
    fetch(`/api/v1/projects/${projectId}/directory`, {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          const list: MentionMember[] = [];
          if (d.data.owner) {
            list.push({
              id: d.data.owner.id,
              name: d.data.owner.name,
              email: d.data.owner.email,
              role: d.data.owner.role,
            });
          }
          if (d.data.members) {
            d.data.members.forEach((m: any) => {
              if (!list.some((existing) => existing.id === m.id)) {
                list.push({ id: m.id, name: m.name, email: m.email, role: m.role });
              }
            });
          }
          setMentionMembers(list);
        }
      })
      .catch((err) => console.error('Failed to load members for mentions:', err));
  }, [projectId, currentUserId]);

  // Fetch initial messages
  const fetchMessages = () => {
    setLoading(true);
    fetch(`/api/v1/projects/${projectId}/messages?limit=100`, {
      headers: { Authorization: `Bearer ${currentUserId}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error.message);
        setMessages(d.data.items || []);
        setLoading(false);
        // Mark as read
        if (d.data.roomId) {
          fetch(`/api/v1/projects/${projectId}/messages/read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUserId}`,
            },
            body: JSON.stringify({ roomId: d.data.roomId }),
          }).catch(() => {});
        }
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, [projectId, currentUserId]);

  // Socket.IO hook
  const { isConnected, emitTypingStart, emitTypingStop } = useSocket({
    projectId,
    onNewMessage: (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      if (!isAtBottom) {
        setUnreadNewCount((prev) => prev + 1);
      } else {
        setTimeout(scrollToBottom, 50);
      }
    },
    onEditMessage: (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
      );
    },
    onDeleteMessage: (deletedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === deletedMsg.id ? { ...m, ...deletedMsg } : m))
      );
    },
    onReadMessage: ({ userId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.readBy?.includes(userId)) {
            return { ...m, readBy: [...(m.readBy || []), userId] };
          }
          return m;
        })
      );
    },
    onTypingStart: ({ userId, name }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.set(userId, name || userId);
        return next;
      });
    },
    onTypingStop: ({ userId }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    },
  });

  // Auto scroll handling
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      setIsAtBottom(true);
      setUnreadNewCount(0);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 40;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadNewCount(0);
    }
  };

  useEffect(() => {
    if (!loading && messages.length > 0 && isAtBottom) {
      scrollToBottom();
    }
  }, [loading, messages.length]);

  // Input change & mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Emit typing indicator
    const currentUserName = mentionMembers.find((m) => m.id === currentUserId)?.name || currentUserId;
    emitTypingStart(currentUserName);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 2000);

    // Check for @mention trigger
    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9_-]*)$/);

    if (atMatch) {
      setShowMentionPicker(true);
      setMentionFilter(atMatch[1]);
    } else {
      setShowMentionPicker(false);
    }
  };

  const handleSelectMention = (member: MentionMember) => {
    const cursor = inputValue.lastIndexOf('@');
    if (cursor !== -1) {
      const before = inputValue.slice(0, cursor);
      const replacement = `@${member.name} `;
      setInputValue(before + replacement);
    } else {
      setInputValue((prev) => prev + `@${member.name} `);
    }
    setShowMentionPicker(false);
  };

  // Add dummy file attachment
  const handleAddAttachment = () => {
    const fileName = prompt('Enter document / image attachment name:', 'specification-doc.pdf');
    if (fileName && fileName.trim()) {
      setAttachments((prev) => [
        ...prev,
        {
          fileId: 'file-' + Math.random().toString(36).slice(2, 8),
          name: fileName.trim(),
          url: '#',
        },
      ]);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const content = inputValue.trim();
    if (!content && attachments.length === 0) return;

    // Detect mentioned IDs
    const mentions: string[] = [];
    mentionMembers.forEach((m) => {
      if (content.includes(`@${m.name}`) || content.includes(`@${m.id}`)) {
        mentions.push(m.id);
      }
    });

    setIsSending(true);
    emitTypingStop();

    try {
      const res = await fetch(`/api/v1/projects/${projectId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({
          content: content || '(Attachment sent)',
          attachments: attachments.length > 0 ? attachments : undefined,
          replyToId: replyingTo ? replyingTo.id : undefined,
          mentions: mentions.length > 0 ? mentions : undefined,
        }),
      });

      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to send message');

      setInputValue('');
      setAttachments([]);
      setReplyingTo(null);
      setShowMentionPicker(false);
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      alert(err.message || 'Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  // Edit message
  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/messages/${editingMessage.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to edit message');
      setEditingMessage(null);
      setEditContent('');
    } catch (err: any) {
      alert(err.message || 'Error editing message');
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Are you sure you want to delete this message? A (deleted) marker will remain.')) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to delete message');
    } catch (err: any) {
      alert(err.message || 'Error deleting message');
    }
  };

  // Report message
  const handleReportMessage = async () => {
    if (!reportingMessage || !reportReason.trim()) return;
    setIsReporting(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/messages/${reportingMessage.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to submit report');
      setReportSubmitted(true);
      setTimeout(() => {
        setReportingMessage(null);
        setReportReason('');
        setReportSubmitted(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Error submitting report');
    } finally {
      setIsReporting(false);
    }
  };

  // Group messages & calculate date dividers
  const processedMessages = useMemo(() => {
    const list: {
      message: ChatMessageItem;
      showDateDivider: boolean;
      dateLabel: string;
      isGroupedWithPrevious: boolean;
    }[] = [];

    let lastDateStr = '';
    let lastSenderId = '';
    let lastTimestamp = 0;

    messages.forEach((msg) => {
      const dateLabel = formatDateDivider(msg.createdAt);
      const showDateDivider = dateLabel !== lastDateStr;
      lastDateStr = dateLabel;

      const currentTimestamp = new Date(msg.createdAt).getTime();
      const isWithinFiveMins = currentTimestamp - lastTimestamp < 5 * 60 * 1000;
      const isGroupedWithPrevious =
        !showDateDivider && msg.senderId === lastSenderId && isWithinFiveMins && !msg.replyToId;

      lastSenderId = msg.senderId;
      lastTimestamp = currentTimestamp;

      list.push({
        message: msg,
        showDateDivider,
        dateLabel,
        isGroupedWithPrevious,
      });
    });

    return list;
  }, [messages]);

  return (
    <Card className="flex flex-col h-[700px] bg-surface rounded-2xl border border-uiBorder shadow-elevation-2 overflow-hidden">
      {/* Header bar */}
      <div className="bg-gradient-to-r from-[#0A1680] to-[#16279E] text-white px-6 py-4 flex justify-between items-center shadow-elevation-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl font-bold border border-white/20 shadow-sm">
            💬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">{projectTitle} Team Chat</h2>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected ? 'bg-[#22C55E]' : 'bg-[#9CA3AF]'
                } border-2 border-white`}
                title={isConnected ? 'Connected to live room' : 'Connecting...'}
              />
            </div>
            <p className="text-xs text-accent/90">
              {isConnected ? 'Real-time sync active' : 'Connecting to room...'} •{' '}
              {mentionMembers.length} team members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchMessages}
            className="!text-white !border-white/30 hover:!bg-white/10 text-xs"
          >
            ↻ Refresh
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 p-6 overflow-y-auto bg-[#FCFDFF] divide-y-0 relative"
      >
        {loading ? (
          <SkeletonLoader type="bubble" count={6} />
        ) : error ? (
          <div className="p-8 text-center text-warning text-sm">
            <p className="font-bold mb-1">Failed to load chat</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : processedMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-2xl text-primary mb-3">
              💬
            </div>
            <h3 className="font-bold text-mainText text-base mb-1">Welcome to the Project Room!</h3>
            <p className="text-xs text-muted max-w-sm">
              No messages have been sent yet. Say hello to your teammates or share your first project update.
            </p>
          </div>
        ) : (
          <div>
            {processedMessages.map((item) => (
              <React.Fragment key={item.message.id}>
                {item.showDateDivider && <DateDivider date={item.message.createdAt} />}
                <ChatBubble
                  message={item.message}
                  currentUserId={currentUserId}
                  isOwner={isOwner}
                  isGroupedWithPrevious={item.isGroupedWithPrevious}
                  onReply={(msg) => setReplyingTo(msg)}
                  onEdit={(msg) => {
                    setEditingMessage(msg);
                    setEditContent(msg.content);
                  }}
                  onDelete={handleDeleteMessage}
                  onReport={(msg) => setReportingMessage(msg)}
                />
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Floating New Messages Pill */}
        {!isAtBottom && unreadNewCount > 0 && (
          <div className="sticky bottom-3 flex justify-center z-20">
            <NewMessagesPill count={unreadNewCount} onClick={scrollToBottom} />
          </div>
        )}
      </div>

      {/* Typing Indicator Bar */}
      {typingUsers.size > 0 && (
        <div className="px-6 py-1 bg-surface border-t border-uiBorder/40">
          <TypingIndicator names={Array.from(typingUsers.values())} />
        </div>
      )}

      {/* Reply / Edit Banner */}
      {replyingTo && (
        <div className="px-6 py-2 bg-accent/15 border-t border-accent/30 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-primary">Replying to {replyingTo.senderName}:</span>
            <span className="text-muted truncate max-w-md">{replyingTo.content}</span>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-muted hover:text-mainText font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {editingMessage && (
        <div className="px-6 py-3 bg-yellow/20 border-t border-yellow/40 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-primary">Editing Message (within 10-minute window)</span>
            <button
              onClick={() => setEditingMessage(null)}
              className="text-muted hover:text-mainText font-bold"
            >
              ✕ Cancel
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-1.5 border border-uiBorder rounded-lg text-sm bg-white"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
              }}
            />
            <Button size="sm" onClick={handleSaveEdit}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Attachments Preview Bar */}
      {attachments.length > 0 && (
        <div className="px-6 py-2 bg-bg border-t border-uiBorder flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-muted">Attachments:</span>
          {attachments.map((att, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-uiBorder rounded-lg text-xs"
            >
              <span>📎</span>
              <span className="font-medium text-mainText truncate max-w-xs">{att.name}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                className="text-warning hover:opacity-80 font-bold ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Composer Input Area */}
      <div className="p-4 bg-surface border-t border-uiBorder relative">
        {/* Mention Picker Popup */}
        {showMentionPicker && (
          <MentionPicker
            members={mentionMembers}
            filter={mentionFilter}
            onSelect={handleSelectMention}
            onClose={() => setShowMentionPicker(false)}
          />
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddAttachment}
            title="Attach file"
            className="p-2.5 text-muted hover:text-primary hover:bg-bg rounded-xl border border-uiBorder/60 transition-colors flex-shrink-0"
          >
            📎
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Message #${projectTitle.toLowerCase().replace(/\s+/g, '-')} (Type @ to mention teammates)...`}
              value={inputValue}
              onChange={handleInputChange}
              disabled={isSending}
              className="w-full px-4 py-2.5 bg-bg border border-uiBorder rounded-xl text-sm text-mainText placeholder-muted focus:outline-none focus:border-accent focus:bg-white transition-all shadow-inner"
            />
          </div>

          <Button
            type="submit"
            disabled={(!inputValue.trim() && attachments.length === 0) || isSending}
            className="rounded-xl px-5 py-2.5 flex-shrink-0"
          >
            {isSending ? 'Sending...' : 'Send ➔'}
          </Button>
        </form>
      </div>

      {/* ----------------- REPORT MESSAGE MODAL ----------------- */}
      {reportingMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-white shadow-elevation-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg text-primary">Report Message</h3>
              <button
                onClick={() => setReportingMessage(null)}
                className="text-muted hover:text-mainText text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-4 bg-accent/20 border border-accent/40 rounded-xl text-primary text-center text-sm font-bold">
                ✓ Report submitted to moderators. Thank you for keeping our community safe.
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-bg rounded-lg border border-uiBorder text-xs text-muted">
                  <span className="font-bold block text-mainText mb-1">
                    Message from {reportingMessage.senderName}:
                  </span>
                  <p className="italic">{reportingMessage.content}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-mainText mb-1">
                    Reason for report (harassment, spam, inappropriate conduct):
                  </label>
                  <textarea
                    rows={3}
                    className="w-full p-2.5 border border-uiBorder rounded-lg bg-bg text-xs focus:bg-white focus:outline-none focus:border-accent"
                    placeholder="Describe why this message violates project guidelines..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-uiBorder">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReportingMessage(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReportMessage}
                    disabled={!reportReason.trim() || isReporting}
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </Card>
  );
};
