import { useEffect, useState } from 'react';
import { NavLink, Routes, Route, Link, useLocation } from 'react-router-dom';
import { api, token, WorkspaceContext, ResumeRecord } from './client';
import {
  Brand,
  Icon,
  Loading,
  ErrorNotice,
  PageHeader,
  Pill,
  Button,
} from './shared';
import Requirements from './Requirements';
import Matching from './Matching';
import Health from './Health';
import JobMatching from './JobMatching';
import Analytics from './Analytics';
import ResumeStudio from '../resumes/ResumeStudio';
import './studio.css';

const tools = [
  {
    path: '/resumes',
    icon: 'resume',
    name: 'Resume intelligence',
    description: 'Turn experience into structured evidence.',
    label: 'Understand your story',
  },
  {
    path: '/ai/requirements',
    icon: 'spark',
    name: 'Project blueprint',
    description: 'Find the skills and roles your idea needs.',
    label: 'Shape the next idea',
  },
  {
    path: '/ai/match/demo',
    icon: 'people',
    name: 'Find collaborators',
    description: 'Build a team around complementary skills.',
    label: 'Find your people',
  },
  {
    path: '/ai/health',
    icon: 'health',
    name: 'Project health',
    description: 'Spot delivery risks and practical next steps.',
    label: 'Keep things moving',
  },
  {
    path: '/ai/job-match/demo',
    icon: 'job',
    name: 'Talent matching',
    description: 'Match job requirements to visible evidence.',
    label: 'See the right fit',
  },
  {
    path: '/analytics',
    icon: 'chart',
    name: 'Analytics & evaluation',
    description: 'Measure outcomes with honest sample sizes.',
    label: 'Understand the outcome',
  },
];
const accounts = [
  ['user-001', 'Project owner'],
  ['user-002', 'Frontend engineer'],
  ['user-003', 'Backend developer'],
  ['user-004', 'Product engineer'],
  ['user-005', 'Designer'],
  ['user-006', 'ML engineer'],
  ['user-007', 'Cloud engineer'],
  ['user-008', 'Developer'],
  ['recruiter-001', 'Recruiter'],
  ['admin-001', 'Admin'],
];
function Overview({ context }: { context: WorkspaceContext }) {
  const [records, setRecords] = useState<ResumeRecord[]>([]),
    [error, setError] = useState<unknown>(null);
  useEffect(() => {
    void api<{ data: ResumeRecord[] }>('/resumes')
      .then((r) => setRecords(r.data))
      .catch(setError);
  }, []);
  return (
    <>
      <section className="st-hero">
        <div className="st-eyebrow">
          <span />A workspace for what comes next
        </div>
        <Pill tone="violet">
          <Icon name="spark" size={12} />
          SkillForge Intelligence
        </Pill>
        <h1>
          Find your people.
          <br />
          <span>Build what’s next.</span>
        </h1>
        <p>
          Connect your experience to the right work.
          <br />
          Turn an idea into a team that can bring it to life.
        </p>
        <div className="st-hero-actions">
          <Link className="st-button" to="/ai/requirements">
            Start with an idea
            <Icon name="arrow" />
          </Link>
          <Link className="st-text-button" to="/resumes">
            Explore your experience
            <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="st-hero-orbit" aria-hidden="true">
          <div />
          <div />
          <div />
          <span>
            <Brand />
          </span>
        </div>
      </section>
      <div className="st-overview-metrics">
        <div>
          <span>Your projects</span>
          <strong>{context.projects.length.toString().padStart(2, '0')}</strong>
          <small>Owned or active membership</small>
        </div>
        <div>
          <span>Ready for review</span>
          <strong>
            {records
              .filter((r) => r.status === 'ready')
              .length.toString()
              .padStart(2, '0')}
          </strong>
          <small>Resume extractions awaiting you</small>
        </div>
        <div>
          <span>Your discovery settings</span>
          <strong className="st-metric-word">
            {context.preference.matchingOptIn
              ? 'Open to collaborate'
              : 'Private by default'}
          </strong>
          <small>You choose when to be discoverable</small>
        </div>
      </div>
      <ErrorNotice error={error} />
      <div className="st-section-heading">
        <div>
          <div className="st-eyebrow">Your next move</div>
          <h2>A little clarity goes a long way.</h2>
        </div>
        <span className="st-muted">Six tools. One connected journey.</span>
      </div>
      <div className="st-tool-grid">
        {tools.map((tool, i) => (
          <Link to={tool.path} className="st-tool-card" key={tool.path}>
            <div className="st-tool-top">
              <span className="st-tool-icon">
                <Icon name={tool.icon} size={23} />
              </span>
              <span className="st-tool-number">0{i + 1}</span>
            </div>
            <span className="st-tool-label">{tool.label}</span>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <span className="st-tool-link">
              Explore
              <Icon name="arrow" size={16} />
            </span>
          </Link>
        ))}
      </div>
      <section className="st-journey">
        <div>
          <Icon name="shield" />
          <strong>Evidence you can inspect. Decisions you own.</strong>
          <p>
            Every suggestion comes with its reasoning. Nothing joins a team,
            edits a profile, or selects a candidate automatically.
          </p>
        </div>
        <div className="st-journey-steps">
          <span>Discover</span>
          <i />
          <span>Understand</span>
          <i />
          <span>Build together</span>
        </div>
      </section>
    </>
  );
}
function Preferences({
  context,
  onUpdate,
}: {
  context: WorkspaceContext;
  onUpdate: () => void;
}) {
  const [error, setError] = useState<unknown>(null),
    [saving, setSaving] = useState(false),
    [message, setMessage] = useState('');
  const update = async (key: string, value: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await api('/ai/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ [key]: value }),
      });
      setMessage('Discovery settings saved.');
      onUpdate();
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Your preferences"
        title="Be discovered on your terms."
      >
        These controls determine whether you can appear in recommendations.
      </PageHeader>
      <section className="st-panel">
        <div className="st-panel-body">
          {(
            [
              [
                'matchingOptIn',
                'Collaborator recommendations',
                'Allow project owners to discover your profile for relevant collaboration.',
              ],
              [
                'recruiterVisible',
                'Recruiter discovery',
                'Allow your profile to appear in company job-matching results.',
              ],
              [
                'publicSkills',
                'Share skill details',
                'Display skill names in match explanations. Private details stay out of results.',
              ],
            ] as const
          ).map(([key, title, description]) => (
            <label className="st-preference" key={key}>
              <div>
                <strong>{title}</strong>
                <p>{description}</p>
              </div>
              <input
                type="checkbox"
                checked={context.preference[key]}
                disabled={saving}
                onChange={(e) => void update(key, e.target.checked)}
              />
            </label>
          ))}
          {message && (
            <div className="st-notice success" role="status">
              {message}
            </div>
          )}
          <ErrorNotice error={error} />
        </div>
      </section>
    </>
  );
}
export default function Member2Workspace() {
  const [context, setContext] = useState<WorkspaceContext | null>(null),
    [error, setError] = useState<unknown>(null),
    [loading, setLoading] = useState(true),
    [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();
  const load = () =>
    api<{ data: WorkspaceContext }>('/ai/context')
      .then((r) => setContext(r.data))
      .catch(setError)
      .finally(() => setLoading(false));
  useEffect(() => {
    void load();
  }, []);
  const current = tools.find((t) =>
    location.pathname.startsWith(t.path.replace('/demo', ''))
  ) || { name: 'Overview' };
  return (
    <div className="studio">
      <aside className={`st-sidebar ${mobileNav ? 'open' : ''}`}>
        <Link to="/ai" className="st-brand">
          <Brand />
          <span>
            skillforge<span className="st-brand-dot">.</span>
          </span>
        </Link>
        <div className="st-workspace-tag">
          <span className="st-workspace-avatar">S</span>
          <div>
            <strong>Your workspace</strong>
            <small>Build together</small>
          </div>
          <Icon name="chevron" size={14} />
        </div>
        <nav aria-label="Intelligence navigation">
          <span className="st-nav-label">Workspace</span>
          <NavLink end to="/ai" onClick={() => setMobileNav(false)}>
            <Icon name="overview" />
            Overview
          </NavLink>
          {tools.map((t) => (
            <NavLink
              key={t.path}
              to={t.path}
              onClick={() => setMobileNav(false)}
            >
              <Icon name={t.icon} />
              {t.name}
              {t.icon === 'spark' && <span className="st-nav-new">NEW</span>}
            </NavLink>
          ))}
          <span className="st-nav-label">Build together</span>
          <a href="/projects">
            <Icon name="folder" />
            Projects
            <Icon name="arrow" size={13} />
          </a>
          <a href="/tasks">
            <Icon name="check" />
            Tasks
            <Icon name="arrow" size={13} />
          </a>
          <a href="/chat">
            <Icon name="people" />
            Project rooms
            <Icon name="arrow" size={13} />
          </a>
        </nav>
        <div className="st-sidebar-bottom">
          <NavLink to="/ai/preferences">
            <Icon name="shield" />
            Discovery settings
          </NavLink>
          <div className="st-sidebar-note">
            <span className="st-dot" />
            Made for the work ahead.
          </div>
        </div>
      </aside>
      <div className="st-main">
        <header className="st-topbar">
          <button
            className="st-mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setMobileNav(!mobileNav)}
          >
            ☰
          </button>
          <div className="st-breadcrumb">
            <span>Workspace</span>
            <Icon name="chevron" size={13} />
            <strong>{current.name}</strong>
          </div>
          <div className="st-topbar-right">
            <span className="st-preview-tag">Local preview</span>
            <label className="st-account">
              <span className="st-user-avatar">
                {context?.user.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('') || 'SF'}
              </span>
              <select
                aria-label="Preview account"
                value={token()}
                onChange={(e) => {
                  localStorage.setItem('token', e.target.value);
                  window.location.reload();
                }}
              >
                {accounts.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>
        <main className="st-content">
          {loading ? (
            <Loading />
          ) : error ? (
            <>
              <PageHeader
                eyebrow="Workspace setup"
                title="Let’s get connected."
              >
                The intelligence workspace needs the Member 2 local
                configuration.
              </PageHeader>
              <ErrorNotice error={error} />
              <p className="st-muted">
                Run the documented Member 2 setup, then restart the API.
              </p>
              <Button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  void load();
                }}
              >
                Try again
              </Button>
            </>
          ) : (
            context && (
              <Routes>
                <Route path="/ai" element={<Overview context={context} />} />
                <Route
                  path="/ai/requirements"
                  element={<Requirements context={context} />}
                />
                <Route
                  path="/ai/match/*"
                  element={<Matching context={context} />}
                />
                <Route
                  path="/ai/health"
                  element={<Health context={context} />}
                />
                <Route
                  path="/ai/job-match/*"
                  element={<JobMatching context={context} />}
                />
                <Route
                  path="/ai/preferences"
                  element={
                    <Preferences
                      context={context}
                      onUpdate={() => void load()}
                    />
                  }
                />
                <Route path="/resumes/*" element={<ResumeStudio />} />
                <Route
                  path="/analytics/*"
                  element={<Analytics context={context} />}
                />
                <Route path="*" element={<Overview context={context} />} />
              </Routes>
            )
          )}
        </main>
        <footer className="st-footer">
          <span>SkillForge Intelligence</span>
          <span>Human judgment, supported by evidence.</span>
        </footer>
      </div>
    </div>
  );
}
