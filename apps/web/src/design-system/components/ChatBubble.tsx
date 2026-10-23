import React, { useState } from 'react';
import { Avatar } from './Avatar';

export interface ChatAttachment {
  fileId: string;
  name: string;
  url?: string;
  size?: number;
  mimeType?: string;
}

export interface ChatMessageItem {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  isFormerMember?: boolean;
  content: string;
  attachments?: ChatAttachment[];
  mentions?: string[];
  replyToId?: string | null;
  replyToMessage?: {
    id: string;
    senderName: string;
    content: string;
  } | null;
  edited?: boolean;
  editedAt?: string | null;
  deleted?: boolean;
  deletedAt?: string | null;
  readBy?: string[];
  createdAt: string;
}

export interface ChatBubbleProps {
  message: ChatMessageItem;
  currentUserId: string;
  isOwner?: boolean;
  isGroupedWithPrevious?: boolean;
  onReply?: (message: ChatMessageItem) => void;
  onEdit?: (message: ChatMessageItem) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (message: ChatMessageItem) => void;
}

export const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  currentUserId,
  isOwner = false,
  isGroupedWithPrevious = false,
  onReply,
  onEdit,
  onDelete,
  onReport,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isMe = message.senderId === currentUserId;

  // Check if message is editable (within 10 mins and not deleted)
  const isEditable = (() => {
    if (!isMe || message.deleted) return false;
    const createdTime = new Date(message.createdAt).getTime();
    const tenMinutes = 10 * 60 * 1000;
    return Date.now() - createdTime <= tenMinutes;
  })();

  const canDelete = !message.deleted && (isMe || isOwner);

  // Render text with @mention chips
  const renderContent = (content: string) => {
    if (message.deleted) {
      return <span className="italic text-muted/80">{content}</span>;
    }

    const words = content.split(/(\s+)/);
    return words.map((word, idx) => {
      if (word.startsWith('@') && word.length > 1) {
        return (
          <span
            key={idx}
            className={`inline-block px-1.5 py-0.5 mx-0.5 rounded text-xs font-bold ${
              isMe
                ? 'bg-accent/30 text-white border border-accent/40'
                : 'bg-accent/20 text-primary border border-accent/30'
            }`}
          >
            {word}
          </span>
        );
      }
      return word;
    });
  };

  const hasSeen = !isMe
    ? false
    : message.readBy && message.readBy.some((id) => id !== currentUserId);

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative flex items-start gap-2.5 transition-all duration-150 ${
        isMe ? 'flex-row-reverse' : 'flex-row'
      } ${isGroupedWithPrevious ? 'mt-1' : 'mt-3.5'}`}
    >
      {/* Avatar (only show if not grouped with previous) */}
      {!isMe ? (
        <div className="w-8 flex-shrink-0">
          {!isGroupedWithPrevious ? (
            <Avatar
              name={message.senderName}
              email={message.senderEmail}
              size="sm"
              className={message.isFormerMember ? 'opacity-60 grayscale' : ''}
            />
          ) : (
            <div className="w-8" />
          )}
        </div>
      ) : null}

      {/* Bubble + Header + Meta */}
      <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Sender Name & Timestamp (if not grouped) */}
        {!isGroupedWithPrevious && (
          <div className="flex items-center gap-2 mb-1 px-1 text-xs">
            <span
              className={`font-semibold ${
                message.isFormerMember
                  ? 'text-muted italic'
                  : isMe
                  ? 'text-primary'
                  : 'text-mainText'
              }`}
            >
              {isMe ? 'You' : message.senderName}
              {message.isFormerMember && ' (Former member)'}
            </span>
            <span className="text-[11px] text-muted">{formatTime(message.createdAt)}</span>
          </div>
        )}

        {/* Reply Preview if exists */}
        {message.replyToMessage && (
          <div
            className={`mb-1 p-2 rounded-lg text-xs border-l-2 bg-surface/80 max-w-full truncate ${
              isMe ? 'border-accent text-right' : 'border-primary text-left'
            } border-uiBorder`}
          >
            <span className="font-semibold block text-primary text-[11px]">
              ↳ Replying to {message.replyToMessage.senderName}
            </span>
            <span className="text-muted truncate block">{message.replyToMessage.content}</span>
          </div>
        )}

        {/* Main Message Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-elevation-1 transition-all ${
            isMe
              ? 'bg-gradient-to-br from-[#0A1680] to-[#14239E] text-white rounded-tr-sm'
              : 'bg-surface text-mainText border border-uiBorder rounded-tl-sm'
          } ${message.deleted ? 'bg-bg border-dashed border-uiBorder text-muted' : ''}`}
        >
          {/* Content */}
          <div className="break-words whitespace-pre-wrap">{renderContent(message.content)}</div>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2.5 space-y-1.5 pt-2 border-t border-white/20">
              {message.attachments.map((att, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-1.5 rounded-lg text-xs ${
                    isMe ? 'bg-white/10 text-white' : 'bg-bg text-mainText border border-uiBorder'
                  }`}
                >
                  <span>📎</span>
                  <span className="font-medium truncate flex-1">{att.name}</span>
                  {att.url && (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold ml-1 text-accent hover:opacity-80"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Edited tag */}
          {message.edited && !message.deleted && (
            <span
              className={`text-[10px] ml-1.5 italic ${
                isMe ? 'text-white/70' : 'text-muted'
              }`}
            >
              (edited)
            </span>
          )}
        </div>

        {/* Status / Read Receipt (for Me) */}
        {isMe && (
          <div className="flex items-center gap-1.5 mt-0.5 px-1 text-[10px] text-muted">
            {hasSeen ? (
              <span className="text-accent font-semibold flex items-center gap-0.5">
                ✓✓ Seen
              </span>
            ) : (
              <span>✓ Sent</span>
            )}
            {isGroupedWithPrevious && <span>• {formatTime(message.createdAt)}</span>}
          </div>
        )}
      </div>

      {/* Floating Hover Actions */}
      {showActions && !message.deleted && (
        <div
          className={`absolute top-0 flex items-center gap-1 bg-surface border border-uiBorder rounded-lg px-1.5 py-0.5 shadow-elevation-2 z-10 text-xs animate-fade-in ${
            isMe ? 'left-4' : 'right-4'
          }`}
        >
          {onReply && (
            <button
              onClick={() => onReply(message)}
              title="Reply"
              className="p-1 hover:bg-bg rounded text-muted hover:text-primary transition-colors"
            >
              ↩ Reply
            </button>
          )}
          {isEditable && onEdit && (
            <button
              onClick={() => onEdit(message)}
              title="Edit (within 10m)"
              className="p-1 hover:bg-bg rounded text-muted hover:text-primary transition-colors"
            >
              ✏️ Edit
            </button>
          )}
          {canDelete && onDelete && (
            <button
              onClick={() => onDelete(message.id)}
              title="Delete message"
              className="p-1 hover:bg-bg rounded text-muted hover:text-warning transition-colors"
            >
              🗑️ Delete
            </button>
          )}
          {!isMe && onReport && (
            <button
              onClick={() => onReport(message)}
              title="Report message"
              className="p-1 hover:bg-bg rounded text-muted hover:text-warning transition-colors"
            >
              🚩 Report
            </button>
          )}
        </div>
      )}
    </div>
  );
};
