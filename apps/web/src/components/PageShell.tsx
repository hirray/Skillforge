import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface PageShellProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  primaryAction?: React.ReactNode; // Strictly max ONE primary action
  secondaryActions?: React.ReactNode;
  tabs?: TabItem[]; // Max 5 tabs
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
  maxWidth?: string;
  dataTour?: string;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  description,
  breadcrumb = [{ label: 'Workspace', href: '/home' }],
  primaryAction,
  secondaryActions,
  tabs,
  activeTab,
  onTabChange,
  children,
  maxWidth = 'max-w-[1320px]',
  dataTour,
}) => {
  return (
    <div className={`space-y-4 ${maxWidth} mx-auto pb-12 font-sans`} data-tour={dataTour}>
      {/* 1. Header Surface */}
      <header className="relative overflow-hidden rounded-2xl bg-[#111116] border border-[#262533] px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Specular Top Edge Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b29af5]/30 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {/* Breadcrumb Trail */}
            {breadcrumb && breadcrumb.length > 0 && (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                {breadcrumb.map((b, idx) => (
                  <React.Fragment key={b.label}>
                    {idx > 0 && <span className="text-[#4b5563]">/</span>}
                    {b.href ? (
                      <Link to={b.href} className="hover:text-white hover:underline transition-colors">
                        {b.label}
                      </Link>
                    ) : (
                      <span className="text-[#d1d5db] font-medium">{b.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {title}
              </h1>
              {description && (
                <p className="text-xs md:text-sm text-[#9ca3af] mt-0.5 max-w-3xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Actions: Max One Primary Action + Optional Secondary */}
          {(primaryAction || secondaryActions) && (
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              {secondaryActions}
              {primaryAction}
            </div>
          )}
        </div>

        {/* Optional Tabs Strip (Max 5 tabs) */}
        {tabs && tabs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#252433] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.slice(0, 5).map((t) => {
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTabChange?.(t.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-[#8861dc]/20 text-[#c084fc] border border-[#8861dc]/40 shadow-sm'
                      : 'text-[#9ca3af] hover:text-white hover:bg-[#181822] border border-transparent'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-[#8861dc] text-white' : 'bg-[#262533] text-[#9ca3af]'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* 2. Main Page Content */}
      <main className="space-y-4">{children}</main>
    </div>
  );
};
