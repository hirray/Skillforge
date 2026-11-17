import React from 'react';

type StatusType = 'draft' | 'recruiting' | 'active' | 'paused' | 'completed' | 'verified' | 'archived' | string;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: StatusType;
  children: React.ReactNode;
}

export const Badge = ({ status = 'draft', className = '', children, ...props }: BadgeProps) => {
  const normalizedStatus = (status || 'draft').toLowerCase();

  const statusStyles: Record<string, string> = {
    draft: 'bg-[#19191e] text-[#96939f] border border-[#26262e]',
    recruiting: 'bg-[#2a2215] text-[#d9b774] border border-[#d9b774]/30',
    active: 'bg-[#221a36] text-[#b29af5] border border-[#8861dc]/40',
    paused: 'bg-[#2a2215] text-[#d9b774] border border-[#d9b774]/30',
    completed: 'bg-[#132822] text-[#6ad4bb] border border-[#6ad4bb]/30',
    verified: 'bg-[#221a36] text-[#b29af5] border border-[#b29af5]/40',
    archived: 'bg-[#19191e] text-[#96939f] border border-[#26262e]',
    todo: 'bg-[#19191e] text-[#96939f] border border-[#26262e]',
    inprogress: 'bg-[#221a36] text-[#b29af5] border border-[#8861dc]/40',
    inreview: 'bg-[#2a2215] text-[#d9b774] border border-[#d9b774]/30',
    done: 'bg-[#132822] text-[#6ad4bb] border border-[#6ad4bb]/30',
  };

  const styleClass = statusStyles[normalizedStatus] || 'bg-[#19191e] text-[#96939f] border border-[#26262e]';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${styleClass} ${className}`}
      {...props}
    >
      {normalizedStatus === 'verified' && (
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {children}
    </span>
  );
};
