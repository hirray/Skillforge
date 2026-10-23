import React from 'react';

export interface DateDividerProps {
  date: string | Date;
}

export const formatDateDivider = (dateInput: string | Date): string => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const DateDivider: React.FC<DateDividerProps> = ({ date }) => {
  const label = formatDateDivider(date);

  return (
    <div className="flex items-center my-4 select-none">
      <div className="flex-grow border-t border-uiBorder/80" />
      <span className="flex-shrink mx-4 text-[11px] font-semibold tracking-wider uppercase text-muted px-2.5 py-0.5 rounded-full bg-surface border border-uiBorder shadow-sm">
        {label}
      </span>
      <div className="flex-grow border-t border-uiBorder/80" />
    </div>
  );
};
