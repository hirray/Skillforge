import React from 'react';

export interface TypingIndicatorProps {
  names: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ names, className = '' }) => {
  if (!names || names.length === 0) return null;

  let label = '';
  if (names.length === 1) {
    label = `${names[0]} is typing`;
  } else if (names.length === 2) {
    label = `${names[0]} and ${names[1]} are typing`;
  } else {
    label = `${names[0]} and ${names.length - 1} others are typing`;
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-muted py-1 px-3 animate-fade-in ${className}`}>
      <div className="flex items-center gap-1 bg-surface border border-uiBorder/80 rounded-full px-2.5 py-1 shadow-elevation-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-typing-dot-1" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-typing-dot-2" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-typing-dot-3" />
      </div>
      <span className="font-medium italic">{label}...</span>
    </div>
  );
};
