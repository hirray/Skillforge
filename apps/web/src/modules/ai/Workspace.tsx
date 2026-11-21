import { useEffect, useState } from 'react';
import { NavLink, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { api, token, WorkspaceContext, ResumeRecord } from './client';
import {
  Brand,
  Icon,
  Loading,
  ErrorNotice,
  PageHeader,
  Pill,
} from './shared';
import Requirements from './Requirements';
import Matching from './Matching';
import Health from './Health';
import JobMatching from './JobMatching';
import Analytics from './Analytics';
import ResumeStudio from '../resumes/ResumeStudio';
import ProjectsModule from '../projects';
import TasksModule from '../tasks';
import MyInvitations from '../team/MyInvitations';
import ChatModule from '../chat';
import MentorsModule from '../mentors';
import HackathonsModule from '../hackathons';
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
  ['user-001', 'Student (user-001)'],
  ['user-002', 'Freelancer (user-002)'],
  ['user-003', 'Pro Dev (user-003)'],
  ['user-004', 'Founder (user-004)'],
  ['user-005', 'Designer (user-005)'],
  ['user-006', 'ML Engineer (user-006)'],
  ['user-007', 'Cloud Arch (user-007)'],
  ['user-008', 'Job Seeker (user-008)'],
  ['recruiter-001', 'Recruiter (recruiter-001)'],
  ['admin-001', 'Admin (admin-001)'],
];

const fallbackContext: WorkspaceContext = {
  user: { id: token(), name: 'SkillForge User', roles: ['owner'] },
  projects: [],
  jobs: [],
  preference: {
    matchingOptIn: true,
    recruiterVisible: true,
    publicSkills: true,
  },
  extensionsEnabled: true,
  ranker: 'standard',
};

function Overview({ context }: { context: WorkspaceContext }) {
  const [records, setRecords] = useState<ResumeRecord[]>([]);
  const [error, setError] = useState<unknown>(null);

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
          <Link className="st-button" to="/projects/create">
            Create project
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
        {tools.map((tool) => (
          <Link to={tool.path} className="st-tool-card" key={tool.path}>
            <div className="st-tool-head">
              <span className="st-tool-icon">
                <Icon name={tool.icon} />
              </span>
              <span className="st-tool-tag">{tool.label}</span>
            </div>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            <span className="st-tool-link">
              Open <Icon name="arrow" size={12} />
            </span>
          </Link>
        ))}
      </div>
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
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();

  const load = () => {
    setLoading(true);
    api<{ data: WorkspaceContext }>('/ai/context')
      .then((r) => {
        setContext(r.data);
      })
      .catch((err) => {
        console.warn('AI context load warning:', err);
        setContext(fallbackContext);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/projects/create') || pathname.startsWith('/projects/new')) return 'Create Project';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/team')) return 'Team Invitations';
    if (pathname.startsWith('/chat')) return 'Project Rooms';
    if (pathname.startsWith('/mentors')) return 'Mentors & Technical Advisors';
    if (pathname.startsWith('/hackathons')) return 'Hackathons & Sprints';
    if (pathname.startsWith('/resumes')) return 'Resume Intelligence';
    if (pathname.startsWith('/ai/requirements')) return 'Project Blueprint';
    if (pathname.startsWith('/ai/match')) return 'Find Collaborators';
    if (pathname.startsWith('/ai/health')) return 'Project Health';
    if (pathname.startsWith('/ai/job-match')) return 'Talent Matching';
    if (pathname.startsWith('/ai/preferences')) return 'Discovery Settings';
    if (pathname.startsWith('/analytics')) return 'Analytics & Evaluation';
    if (pathname.startsWith('/ai')) return 'Intelligence Overview';
    return 'SkillForge';
  };

  const activeContext = context || fallbackContext;

  return (
    <div className="studio">
      <aside className={`st-sidebar ${mobileNav ? 'open' : ''}`}>
        <Link to="/projects" className="st-brand">
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

        <nav aria-label="Main navigation">
          <span className="st-nav-label">Build together</span>
          <NavLink to="/projects" onClick={() => setMobileNav(false)}>
            <Icon name="folder" />
            Projects
          </NavLink>
          <NavLink to="/tasks" onClick={() => setMobileNav(false)}>
            <Icon name="check" />
            Tasks
          </NavLink>
          <NavLink to="/team" onClick={() => setMobileNav(false)}>
            <Icon name="people" />
            Team invitations
          </NavLink>
          <NavLink to="/chat" onClick={() => setMobileNav(false)}>
            <Icon name="chat" />
            Project rooms
          </NavLink>
          <NavLink to="/mentors" onClick={() => setMobileNav(false)}>
            <Icon name="spark" />
            Mentors & Advisors
          </NavLink>
          <NavLink to="/hackathons" onClick={() => setMobileNav(false)}>
            <Icon name="rocket" />
            Hackathons & Sprints
          </NavLink>

          <span className="st-nav-label">Intelligence</span>
          <NavLink end to="/ai" onClick={() => setMobileNav(false)}>
            <Icon name="overview" />
            Overview
          </NavLink>
          <NavLink to="/resumes" onClick={() => setMobileNav(false)}>
            <Icon name="resume" />
            Resume intelligence
          </NavLink>
          <NavLink to="/ai/requirements" onClick={() => setMobileNav(false)}>
            <Icon name="spark" />
            Project blueprint
            <span className="st-nav-new">AI</span>
          </NavLink>
          <NavLink to="/ai/match/demo" onClick={() => setMobileNav(false)}>
            <Icon name="people" />
            Find collaborators
          </NavLink>
          <NavLink to="/ai/health" onClick={() => setMobileNav(false)}>
            <Icon name="health" />
            Project health
          </NavLink>
          <NavLink to="/ai/job-match/demo" onClick={() => setMobileNav(false)}>
            <Icon name="job" />
            Talent matching
          </NavLink>
          <NavLink to="/analytics" onClick={() => setMobileNav(false)}>
            <Icon name="chart" />
            Analytics & evaluation
          </NavLink>
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
            <Icon name="menu" size={18} />
          </button>
          <div className="st-breadcrumb">
            <span>Workspace</span>
            <Icon name="chevron" size={13} />
            <strong>{getPageTitle(location.pathname)}</strong>
          </div>
          <div className="st-topbar-right">
            <span className="st-preview-tag">Local preview</span>
            <label className="st-account">
              <span className="st-user-avatar">
                {activeContext.user.name
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
          {loading && !context ? (
            <Loading />
          ) : (
            <Routes>
              <Route path="/" element={<Navigate to="/projects" replace />} />
              <Route path="/projects/*" element={<ProjectsModule />} />
              <Route path="/tasks/*" element={<TasksModule />} />
              <Route path="/team/*" element={<MyInvitations />} />
              <Route path="/chat/*" element={<ChatModule />} />
              <Route path="/mentors/*" element={<MentorsModule />} />
              <Route path="/hackathons/*" element={<HackathonsModule />} />
              
              <Route path="/ai" element={<Overview context={activeContext} />} />
              <Route
                path="/ai/requirements"
                element={<Requirements context={activeContext} />}
              />
              <Route
                path="/ai/match/*"
                element={<Matching context={activeContext} />}
              />
              <Route
                path="/ai/health"
                element={<Health context={activeContext} />}
              />
              <Route
                path="/ai/job-match/*"
                element={<JobMatching context={activeContext} />}
              />
              <Route
                path="/ai/preferences"
                element={
                  <Preferences
                    context={activeContext}
                    onUpdate={() => void load()}
                  />
                }
              />
              <Route path="/resumes/*" element={<ResumeStudio />} />
              <Route
                path="/analytics/*"
                element={<Analytics context={activeContext} />}
              />
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
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
