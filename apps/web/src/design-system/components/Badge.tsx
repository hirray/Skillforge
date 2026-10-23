import React from 'react';

type StatusType = 'draft' | 'recruiting' | 'active' | 'paused' | 'completed' | 'verified' | 'archived' | string;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: StatusType;
  children: React.ReactNode;
}

export const Badge = ({ status = 'draft', className = '', children, ...props }: BadgeProps) => {
  const normalizedStatus = (status || 'draft').toLowerCase();

  const statusStyles: Record<string, string> = {
    draft: 'bg-[#E7EAF3] text-[#6B7685] border border-[#E7EAF3]',
    recruiting: 'bg-[#F1B94C]/20 text-[#9E6B0A] border border-[#F1B94C]/40',
    active: 'bg-[#93B2F8]/30 text-[#0A1680] border border-[#93B2F8]/60',
    paused: 'bg-[#FBEDB0] text-[#8C6B14] border border-[#FBEDB0]',
    completed: 'bg-[#0A1680] text-white border border-[#0A1680]',
    verified: 'bg-[#0A1680] text-white border border-[#0A1680]',
    archived: 'bg-[#E7EAF3] text-[#6B7685] border border-[#E7EAF3]',
    todo: 'bg-slate-100 text-slate-700 border border-slate-200',
    inprogress: 'bg-blue-100 text-blue-800 border border-blue-200',
    inreview: 'bg-amber-100 text-amber-800 border border-amber-200',
    done: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  };

  const styleClass = statusStyles[normalizedStatus] || 'bg-[#E7EAF3] text-[#6B7685] border border-[#E7EAF3]';

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
