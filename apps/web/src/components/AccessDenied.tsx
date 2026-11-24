import React from 'react';
import { Link } from 'react-router-dom';
import { useActiveContext } from '../context/ContextModel';
import { ContextType, navigationConfig } from '../config/navigation';

interface AccessDeniedProps {
  requiredContext: ContextType;
  title?: string;
  reason?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredContext,
  title = 'Context Switch Required',
  reason = 'This section is restricted to the specific role context to protect data integrity and prevent clutter.',
}) => {
  const { setContext } = useActiveContext();
  const targetLabel = navigationConfig[requiredContext]?.label || requiredContext;

  return (
    <div className="max-w-xl mx-auto py-20 px-6 text-center font-sans">
      <div className="relative inline-flex p-4 rounded-3xl bg-[#1c1424] border border-[#3b244d] text-[#c084fc] mb-6 shadow-[0_0_32px_rgba(192,132,252,0.25)]">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>

      <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
        {title}
      </h1>
      <p className="text-xs md:text-sm text-[#9ca3af] mt-2 max-w-md mx-auto leading-relaxed">
        {reason} You are currently browsing in a different context.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setContext(requiredContext)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8861dc] to-[#6d44c4] hover:from-[#976eed] hover:to-[#7c51db] text-white text-xs font-bold transition-all shadow-[0_0_24px_rgba(136,97,220,0.45)] border border-[#a78bfa]/40"
        >
          Switch to {targetLabel} Context
        </button>
        <Link
          to="/home"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#181822] hover:bg-[#20202d] border border-[#2b2a3a] text-xs font-medium text-[#d1d5db] transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};
