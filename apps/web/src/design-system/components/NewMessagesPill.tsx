import React from 'react';

export interface NewMessagesPillProps {
  count?: number;
  onClick: () => void;
  className?: string;
}

export const NewMessagesPill: React.FC<NewMessagesPillProps> = ({
  count,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-primary font-bold text-xs shadow-elevation-3 hover:bg-accent/90 active:scale-95 transition-all transform duration-175 cursor-pointer border border-primary/20 ${className}`}
    >
      <span>New messages {count && count > 1 ? `(${count})` : ''}</span>
      <span className="text-sm leading-none animate-bounce">↓</span>
    </button>
  );
};
