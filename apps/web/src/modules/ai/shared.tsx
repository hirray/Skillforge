import React, { useEffect, useState } from 'react';
import { ApiError, WorkspaceContext } from './client';

const paths: Record<string, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  resume: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      <path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M19 21v-3a6 6 0 0 0-3-5" />
    </>
  ),
  health: (
    <>
      <path d="M3 12h4l3-8 4 16 3-8h4" />
    </>
  ),
  job: (
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M8 7V3h8v4M3 12a23 23 0 0 0 18 0M10 12h4" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18M7 14l4-5 4 3 5-7" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  folder: (
    <>
      <path d="M3 7V4h6l3 3h9v13H3Z" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  shield: (
    <>
      <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  chat: (
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </>
  ),
  menu: (
    <>
      <path d="M3 12h18M3 6h18M3 18h18" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10M6 10h10" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a3 3 0 0 0 3 3h6" />
    </>
  ),
  chevronDown: (
    <path d="m6 9 6 6 6-6" />
  ),
  play: (
    <polygon points="5 3 19 12 5 21 5 3" />
  ),
  gamepad: (
    <>
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="4" />
    </>
  ),
  sparkles: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
      <path d="m20 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
    </>
  ),
};
export const Icon = ({ name, size = 18 }: { name: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths[name] || paths.spark}
  </svg>
);
export const Brand = () => (
  <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
    <path
      d="M7 25 16 5l9 20M11 17h10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
    />
    <path d="M4 10h8M20 22h8" stroke="currentColor" strokeWidth="2" />
  </svg>
);
export const Button = ({
  children,
  secondary,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { secondary?: boolean }) => (
  <button className={`st-button ${secondary ? 'secondary' : ''}`} {...props}>
    {children}
  </button>
);
export const Pill = ({
  children,
  tone = '',
}: {
  children: React.ReactNode;
  tone?: string;
}) => <span className={`st-pill ${tone}`}>{children}</span>;
export const Loading = () => (
  <div className="st-loading" role="status" aria-label="Loading">
    <div />
    <div />
    <div />
  </div>
);
export const ErrorNotice = ({ error }: { error: unknown }) =>
  !error ? null : (
    <div className="st-notice error" role="alert">
      <Icon name="shield" />
      <div>
        <strong>
          {error instanceof ApiError && error.status === 403
            ? 'Access restricted'
            : 'Something needs attention'}
        </strong>
        <p>{error instanceof Error ? error.message : String(error)}</p>
      </div>
    </div>
  );
export const Empty = ({
  icon = 'spark',
  title,
  children,
}: {
  icon?: string;
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="st-empty">
    <div className="st-empty-icon">
      <Icon name={icon} size={26} />
    </div>
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);
export const PageHeader = ({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <header className="st-page-heading">
    <div>
      <div className="st-eyebrow">
        <span />
        {eyebrow}
      </div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
    {action}
  </header>
);
export function ProjectPicker({
  context,
  value,
  onChange,
  ownerOnly = false,
}: {
  context: WorkspaceContext;
  value: string;
  onChange: (id: string) => void;
  ownerOnly?: boolean;
}) {
  const projects = context.projects.filter(
    (p) => !ownerOnly || p.ownerId === context.user.id
  );
  return (
    <label className="st-field">
      Project
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select a project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
    </label>
  );
}
export function useProject(context: WorkspaceContext, ownerOnly = false) {
  const [id, setId] = useState(
    () =>
      context.projects.find((p) => !ownerOnly || p.ownerId === context.user.id)
        ?.id || ''
  );
  useEffect(() => {
    if (!context.projects.some((p) => p.id === id))
      setId(
        context.projects.find(
          (p) => !ownerOnly || p.ownerId === context.user.id
        )?.id || ''
      );
  }, [context, id, ownerOnly]);
  return [id, setId] as const;
}
