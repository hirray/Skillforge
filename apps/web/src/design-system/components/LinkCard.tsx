import React from 'react';
import { Card } from './Card';

export interface LinkCardProps {
  id: string;
  title: string;
  url: string;
  category?: string;
  addedBy: string;
  uploaderName?: string;
  isFormerMember?: boolean;
  createdAt: string;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
  className?: string;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  id,
  title,
  url,
  category = 'Other',
  uploaderName = 'Unknown',
  isFormerMember = false,
  createdAt,
  canDelete = false,
  onDelete,
  className = '',
}) => {
  // Extract hostname for display
  let host = '';
  try {
    const parsed = new URL(url);
    host = parsed.hostname.replace(/^www\./, '');
  } catch {
    host = url;
  }

  // Derive specialized icon by domain
  const getDomainIcon = (h: string) => {
    const lower = h.toLowerCase();
    if (lower.includes('github.com') || lower.includes('gitlab.com')) return '🐙';
    if (lower.includes('figma.com')) return '🎨';
    if (lower.includes('drive.google.com') || lower.includes('docs.google.com')) return '📁';
    if (lower.includes('notion.so') || lower.includes('notion.site')) return '📓';
    if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('loom.com')) return '🎥';
    if (lower.includes('miro.com') || lower.includes('whimsical.com')) return '🗺️';
    if (lower.includes('slack.com') || lower.includes('discord.gg') || lower.includes('discord.com')) return '💬';
    if (lower.includes('kaggle.com') || lower.includes('huggingface.co')) return '📊';
    return '🔗';
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Repository':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'Design':
        return 'bg-accent/20 text-primary border-accent/40';
      case 'Docs':
        return 'bg-yellow/30 text-mainText border-yellow/50';
      case 'Demo':
        return 'bg-warning/20 text-mainText border-warning/40';
      case 'Dataset':
        return 'bg-primary/15 text-primary border-primary/30';
      default:
        return 'bg-uiBorder text-muted border-uiBorder';
    }
  };

  return (
    <Card
      className={`p-4 bg-white border border-uiBorder/80 rounded-xl hover:shadow-elevation-2 transition-all duration-200 flex flex-col justify-between group ${className}`}
    >
      <div>
        {/* Top Header: Category Badge, Domain & External Action */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getCategoryColor(
                category
              )}`}
            >
              {category}
            </span>
            <span className="text-[11px] text-muted font-medium flex items-center gap-1">
              <span>{getDomainIcon(host)}</span>
              <span className="truncate max-w-[120px]">{host}</span>
            </span>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted hover:text-primary p-1 rounded hover:bg-bg transition-colors"
            title="Open link in new tab"
          >
            <span className="text-xs">↗</span>
          </a>
        </div>

        {/* Title */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-sm text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug block"
        >
          {title}
        </a>
      </div>

      {/* Footer: Metadata & Delete */}
      <div className="mt-4 pt-3 border-t border-uiBorder/60 flex items-center justify-between text-[11px] text-muted">
        <div className="flex items-center gap-1.5 truncate">
          <span>Added by</span>
          <span className={`font-semibold ${isFormerMember ? 'text-muted italic' : 'text-mainText'}`}>
            {isFormerMember ? 'Former member' : uploaderName}
          </span>
          <span>•</span>
          <span>{new Date(createdAt).toLocaleDateString()}</span>
        </div>

        {canDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="text-muted hover:text-warning text-xs px-1.5 py-0.5 rounded hover:bg-warning/10 transition-colors ml-2 shrink-0 font-medium"
            title="Delete link resource"
          >
            Delete
          </button>
        )}
      </div>
    </Card>
  );
};

export default LinkCard;
