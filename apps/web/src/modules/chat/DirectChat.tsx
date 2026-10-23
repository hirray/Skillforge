import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Card,
  Button,
  Avatar,
  ChatBubble,
  DateDivider,
  TypingIndicator,
  SkeletonLoader,
  ChatMessageItem,
} from '../../design-system/components';
import { formatDateDivider } from '../../design-system/components/DateDivider';
import { useSocket } from './useSocket';

export interface DirectChatProps {
  projectId: string;
  initialRecipientId?: string;
}

export interface DirectRoomItem {
  id: string;
  projectId: string;
  type: string;
  otherUserId: string;
  otherUserName: string;
  otherUserEmail?: string;
  isOtherFormerMember?: boolean;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

export const DirectChat: React.FC<DirectChatProps> = ({
  projectId,
  initialRecipientId,
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [directRooms, setDirectRooms] = useState<DirectRoomItem[]>([]);
  const [activeRoom, setActiveRoom] = useState<DirectRoomItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Directory for starting new 1:1 chats
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Composer state
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());

  // Edit / Delete / Report state
  const [editingMessage, setEditingMessage] = useState<ChatMessageItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reportingMessage, setReportingMessage] = useState<ChatMessageItem | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch direct chats & team directory
  const fetchDirectRooms = async () => {
    try {
      setLoadingRooms(true);
      const [roomsRes, dirRes] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/chats`, {
          headers: { Authorization: `Bearer ${currentUserId}` },
        }),
        fetch(`/api/v1/projects/${projectId}/directory`, {
          headers: { Authorization: `Bearer ${currentUserId}` },
        }),
      ]);

      const roomsData = await roomsRes.json();
      const dirData = await dirRes.json();

      if (roomsData.error) throw new Error(roomsData.error.message);
      setDirectRooms(roomsData.data || []);

      if (dirData.data) {
        const list: any[] = [];
        if (dirData.data.owner && dirData.data.owner.id !== currentUserId) {
          list.push(dirData.data.owner);
        }
        if (dirData.data.members) {
          dirData.data.members.forEach((m: any) => {
            if (m.id !== currentUserId && !list.some((u) => u.id === m.id)) {
              list.push(m);
            }
          });
        }
        setTeamMembers(list);
      }

      setLoadingRooms(false);

      // Auto-open initial recipient or first room
      if (initialRecipientId) {
        handleStartDirectChat(initialRecipientId);
      } else if (roomsData.data && roomsData.data.length > 0 && !activeRoom) {
        setActiveRoom(roomsData.data[0]);
      }
    } catch (e: any) {
      setError(e.message);
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchDirectRooms();
  }, [projectId, currentUserId]);

  // Fetch messages for active 1:1 room
  const fetchRoomMessages = async (roomId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/v1/chats/${roomId}/messages?limit=100`, {
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to load messages');
      setMessages(data.data.items || []);
      setLoadingMessages(false);
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      setError(err.message);
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeRoom) {
      fetchRoomMessages(activeRoom.id);
    } else {
      setMessages([]);
    }
  }, [activeRoom?.id]);

  // Socket.IO hook scoped to active 1:1 room
  const { emitTypingStart, emitTypingStop } = useSocket({
    chatId: activeRoom?.id,
    onNewMessage: (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setTimeout(scrollToBottom, 50);
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

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  };

  // Start new direct chat
  const handleStartDirectChat = async (recipientId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({ recipientId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to start chat');

      setShowNewChatModal(false);
      const newRoom = data.data;
      setDirectRooms((prev) => {
        if (prev.some((r) => r.id === newRoom.id)) return prev;
        return [newRoom, ...prev];
      });
      setActiveRoom(newRoom);
    } catch (e: any) {
      alert(e.message || 'Error creating chat');
    }
  };

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    emitTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 2000);
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom || !inputValue.trim()) return;

    setIsSending(true);
    emitTypingStop();

    try {
      const res = await fetch(`/api/v1/chats/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserId}`,
        },
        body: JSON.stringify({ content: inputValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to send message');

      setInputValue('');
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
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to edit');
      setEditingMessage(null);
      setEditContent('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/messages/${messageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${currentUserId}` },
      });
      const d = await res.json();
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to delete');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Report message
  const handleReportMessage = async () => {
    if (!reportingMessage || !reportReason.trim()) return;
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
      if (!res.ok || d.error) throw new Error(d.error?.message || 'Failed to report');
      setReportSubmitted(true);
      setTimeout(() => {
        setReportingMessage(null);
        setReportReason('');
        setReportSubmitted(false);
      }, 1500);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Process message stream with date dividers
  const processedMessages = useMemo(() => {
    const list: {
      message: ChatMessageItem;
      showDateDivider: boolean;
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
        !showDateDivider && msg.senderId === lastSenderId && isWithinFiveMins;

      lastSenderId = msg.senderId;
      lastTimestamp = currentTimestamp;

      list.push({
        message: msg,
        showDateDivider,
        isGroupedWithPrevious,
      });
    });

    return list;
  }, [messages]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[700px]">
      {/* Left Column: Direct Conversations List */}
      <Card className="flex flex-col bg-surface rounded-2xl border border-uiBorder shadow-elevation-1 overflow-hidden">
        <div className="p-4 border-b border-uiBorder flex justify-between items-center bg-bg/50">
          <div>
            <h3 className="font-bold text-sm text-primary">Direct Messages (1:1)</h3>
            <p className="text-[11px] text-muted">Private teammate conversations</p>
          </div>
          <Button size="sm" onClick={() => setShowNewChatModal(true)} className="text-xs">
            + New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-uiBorder/50">
          {loadingRooms ? (
            <div className="p-4">
              <SkeletonLoader type="row" count={4} />
            </div>
          ) : directRooms.length === 0 ? (
            <div className="p-8 text-center text-muted text-xs">
              <span className="text-2xl block mb-2">👤</span>
              <p className="font-semibold text-mainText mb-1">No direct chats yet</p>
              <p className="mb-3">Start a private 1:1 conversation with any team member.</p>
              <Button size="sm" variant="outline" onClick={() => setShowNewChatModal(true)}>
                Start Direct Chat
              </Button>
            </div>
          ) : (
            directRooms.map((room) => {
              const isSelected = activeRoom?.id === room.id;
              return (
                <button
                  key={room.id}
                  onClick={() => setActiveRoom(room)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-accent/20 border-l-4 border-primary' : 'hover:bg-bg'
                  }`}
                >
                  <Avatar
                    name={room.otherUserName}
                    email={room.otherUserEmail}
                    size="sm"
                    className={room.isOtherFormerMember ? 'opacity-60' : ''}
                  />
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs text-mainText truncate">
                        {room.otherUserName}
                        {room.isOtherFormerMember && ' (Former)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {room.lastMessage ? room.lastMessage.content : 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* Right 2 Columns: Active Direct Conversation Stream */}
      <Card className="md:col-span-2 flex flex-col bg-surface rounded-2xl border border-uiBorder shadow-elevation-2 overflow-hidden">
        {activeRoom ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A1680] to-[#16279E] text-white px-6 py-3.5 flex justify-between items-center shadow-elevation-1">
              <div className="flex items-center gap-3">
                <Avatar
                  name={activeRoom.otherUserName}
                  email={activeRoom.otherUserEmail}
                  size="sm"
                  className="border-2 border-white/40"
                />
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                    {activeRoom.otherUserName}
                    {activeRoom.isOtherFormerMember && (
                      <span className="text-[10px] font-normal text-white/70 italic">
                        (Former member)
                      </span>
                    )}
                  </h3>
                  <span className="text-[11px] text-accent flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Private 1:1 Conversation
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Scroll View */}
            <div
              ref={scrollContainerRef}
              className="flex-1 p-6 overflow-y-auto bg-[#FCFDFF] relative divide-y-0"
            >
              {loadingMessages ? (
                <SkeletonLoader type="bubble" count={4} />
              ) : error ? (
                <div className="p-8 text-center text-warning text-sm">
                  <p className="font-bold mb-1">Error</p>
                  <p className="text-xs">{error}</p>
                </div>
              ) : processedMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted">
                  <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-2xl text-primary mb-2">
                    🔒
                  </div>
                  <h4 className="font-bold text-mainText text-sm mb-1">
                    Private Conversation with {activeRoom.otherUserName}
                  </h4>
                  <p className="text-xs text-muted max-w-xs">
                    Messages in this chat are strictly private between the two of you and are never visible to other team members or the owner.
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
                        isGroupedWithPrevious={item.isGroupedWithPrevious}
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
            </div>

            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="px-6 py-1 bg-surface border-t border-uiBorder/40">
                <TypingIndicator names={Array.from(typingUsers.values())} />
              </div>
            )}

            {/* Editing Bar */}
            {editingMessage && (
              <div className="px-6 py-2.5 bg-yellow/20 border-t border-yellow/40 flex items-center gap-2 text-xs">
                <span className="font-bold text-primary">Editing:</span>
                <input
                  type="text"
                  className="flex-1 px-2.5 py-1 border border-uiBorder rounded bg-white text-xs"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <Button size="sm" onClick={handleSaveEdit}>
                  Save
                </Button>
                <button
                  onClick={() => setEditingMessage(null)}
                  className="text-muted hover:text-mainText"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Input Composer */}
            <div className="p-4 bg-surface border-t border-uiBorder">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Send a private message to ${activeRoom.otherUserName}...`}
                  value={inputValue}
                  onChange={handleInputChange}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 bg-bg border border-uiBorder rounded-xl text-sm text-mainText placeholder-muted focus:outline-none focus:border-accent focus:bg-white shadow-inner"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="rounded-xl px-5 py-2.5"
                >
                  {isSending ? 'Sending...' : 'Send ➔'}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted">
            <span className="text-4xl block mb-2">💬</span>
            <h3 className="font-bold text-mainText text-base mb-1">Select a Direct Message</h3>
            <p className="text-xs text-muted max-w-sm mb-4">
              Choose an existing teammate conversation from the left, or start a new 1:1 chat.
            </p>
            <Button size="sm" onClick={() => setShowNewChatModal(true)}>
              Start New 1:1 Chat
            </Button>
          </div>
        )}
      </Card>

      {/* ----------------- NEW 1:1 CHAT MODAL ----------------- */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-white shadow-elevation-3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-primary">Start Direct 1:1 Chat</h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-muted hover:text-mainText text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted mb-4">
              Select a confirmed active team member to begin a private 1:1 discussion.
            </p>

            <div className="max-h-60 overflow-y-auto divide-y divide-uiBorder">
              {teamMembers.length === 0 ? (
                <p className="text-xs text-muted p-4 text-center">No other confirmed team members found.</p>
              ) : (
                teamMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleStartDirectChat(member.id)}
                    className="w-full p-3 flex items-center justify-between hover:bg-accent/15 transition-colors rounded-lg text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} email={member.email} size="sm" />
                      <div>
                        <span className="font-bold text-xs text-mainText block">{member.name}</span>
                        <span className="text-[10px] text-muted block">{member.role || 'Member'}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent">Chat ➔</span>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-uiBorder">
              <Button variant="outline" size="sm" onClick={() => setShowNewChatModal(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ----------------- REPORT MODAL ----------------- */}
      {reportingMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <Card className="w-full max-w-md p-6 bg-white shadow-elevation-3">
            <h3 className="font-bold text-lg text-primary mb-2">Report Message</h3>
            {reportSubmitted ? (
              <div className="p-3 bg-accent/20 text-primary text-center text-xs font-bold rounded-lg">
                ✓ Report submitted to moderators.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <textarea
                  rows={3}
                  className="w-full p-2.5 border border-uiBorder rounded-lg bg-bg text-xs"
                  placeholder="Reason for report..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setReportingMessage(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleReportMessage} disabled={!reportReason.trim()}>
                    Submit
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
