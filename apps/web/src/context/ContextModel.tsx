import React, { createContext, useContext, useState, useEffect } from 'react';
import { ContextType, navigationConfig } from '../config/navigation';
import { token } from '../modules/ai/client';

export interface DemoPersona {
  id: string;
  name: string;
  role: string;
  context: ContextType;
  token: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  { id: 'alex-rivera', name: 'Alex Rivera', role: 'Student Builder', context: 'individual', token: 'user-001' },
  { id: 'samira-khan', name: 'Samira Khan', role: 'Senior Pro / Freelancer', context: 'individual', token: 'user-002' },
  { id: 'marcus-vance', name: 'Marcus Vance', role: 'Startup Founder', context: 'individual', token: 'user-007' },
  { id: 'elena-rostova', name: 'Elena Rostova', role: 'Technical Recruiter', context: 'recruiter', token: 'user-003' },
  { id: 'david-chen', name: 'David Chen', role: 'VP Engineering', context: 'company_admin', token: 'user-004' },
  { id: 'dr-aris-thorne', name: 'Dr. Aris Thorne', role: 'Research Advisor', context: 'mentor', token: 'user-005' },
  { id: 'sarah-lin', name: 'Sarah Lin', role: 'Platform Lead', context: 'platform_admin', token: 'user-006' },
];

export const getActivePersona = (tokenId: string): DemoPersona => {
  return DEMO_PERSONAS.find((p) => p.token === tokenId || p.id === tokenId) || DEMO_PERSONAS[0];
};

interface ContextState {
  activeContext: ContextType;
  setContext: (ctx: ContextType) => void;
  availableContexts: ContextType[];
}

const ContextContext = createContext<ContextState>({
  activeContext: 'individual',
  setContext: () => {},
  availableContexts: ['individual'],
});

export const determineDefaultContext = (tokenId: string): ContextType => {
  const saved = localStorage.getItem('skillforge_active_context') as ContextType;
  if (saved && navigationConfig[saved]) {
    return saved;
  }
  if (tokenId.includes('admin')) return 'platform_admin';
  if (tokenId.includes('recruiter')) return 'recruiter';
  if (tokenId.includes('mentor')) return 'mentor';
  if (tokenId === 'user-004') return 'company_admin'; // Founder / Company Admin
  return 'individual';
};

export const determineAvailableContexts = (tokenId: string): ContextType[] => {
  if (tokenId.includes('admin')) {
    return ['platform_admin', 'individual'];
  }
  if (tokenId.includes('recruiter')) {
    return ['recruiter', 'company_admin', 'individual'];
  }
  if (tokenId.includes('mentor')) {
    return ['mentor', 'individual'];
  }
  if (tokenId === 'user-004') {
    return ['company_admin', 'recruiter', 'individual'];
  }
  return ['individual', 'mentor', 'recruiter'];
};

export const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentToken = token();
  const [activeContext, setActiveContextState] = useState<ContextType>(() =>
    determineDefaultContext(currentToken)
  );

  const availableContexts = determineAvailableContexts(currentToken);

  const setContext = (ctx: ContextType) => {
    setActiveContextState(ctx);
    localStorage.setItem('skillforge_active_context', ctx);
  };

  useEffect(() => {
    const defaultCtx = determineDefaultContext(currentToken);
    setActiveContextState(defaultCtx);
  }, [currentToken]);

  return (
    <ContextContext.Provider value={{ activeContext, setContext, availableContexts }}>
      {children}
    </ContextContext.Provider>
  );
};

export const useActiveContext = () => useContext(ContextContext);

export const ContextSwitcher: React.FC = () => {
  const { activeContext, setContext, availableContexts } = useActiveContext();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left" data-tour="topbar-context">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#181822] hover:bg-[#20202d] border border-[#2b2a3b] text-white text-xs font-semibold transition-all shadow-sm"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="w-2 h-2 rounded-full bg-[#8861dc] animate-pulse" />
        <span>Context: {navigationConfig[activeContext]?.label || 'Individual'}</span>
        <svg className={`w-3.5 h-3.5 text-[#9ca3af] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#14141c] border border-[#2c2b3e] shadow-[0_12px_32px_rgba(0,0,0,0.7)] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-[#6b7280] border-b border-[#252433]">
              Switch Role Context
            </div>
            {availableContexts.map((ctx) => {
              const cfg = navigationConfig[ctx];
              const isSelected = ctx === activeContext;
              return (
                <button
                  key={ctx}
                  type="button"
                  onClick={() => {
                    setContext(ctx);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-[#8861dc]/20 text-[#c084fc] font-bold' : 'text-[#d1d5db] hover:bg-[#1a1924] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#c084fc]' : 'bg-[#4b5563]'}`} />
                    <span>{cfg?.label || ctx}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] text-[#34d399] font-semibold">Active</span>
                  )}
                </button>
              );
            })}

            {/* Fast Persona Switcher (Dev & Demo) */}
            <div className="px-3 pt-3 pb-1.5 text-[10px] uppercase tracking-wider font-bold text-[#8861dc] border-t border-[#252433] mt-1.5 flex items-center justify-between">
              <span>Demo Persona Switcher</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#8861dc]/20 text-[#c4b5fd] rounded">Dev</span>
            </div>
            {DEMO_PERSONAS.map((persona) => {
              const isCurrent = localStorage.getItem('token') === persona.token;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => {
                    localStorage.setItem('token', persona.token);
                    localStorage.setItem('skillforge_active_context', persona.context);
                    setContext(persona.context);
                    setOpen(false);
                    window.location.reload();
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs transition-colors border-l-2 ${
                    isCurrent
                      ? 'border-[#8861dc] bg-[#8861dc]/15 text-white font-bold'
                      : 'border-transparent text-[#9ca3af] hover:bg-[#181822] hover:text-[#e5e7eb]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{persona.name}</span>
                    <span className="text-[10px] uppercase font-bold text-[#b29af5] bg-[#221c32] px-1.5 py-0.5 rounded border border-[#8861dc]/30">
                      {persona.context}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#6b7280] mt-0.5 truncate">{persona.role}</div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
