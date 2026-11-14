import { useEffect, useState } from 'react';
import {
  WorkspaceContext,
  Candidate,
  MatchResult,
  intelligence,
  api,
} from './client';
import {
  Button,
  Icon,
  Pill,
  Empty,
  Loading,
  ErrorNotice,
  PageHeader,
  ProjectPicker,
  useProject,
} from './shared';

export function CandidateCard({
  candidate,
  action,
  onWhy,
}: {
  candidate: Candidate;
  action?: React.ReactNode;
  onWhy: () => void;
}) {
  return (
    <article className="st-candidate">
      <div className="st-candidate-top">
        <div className="st-avatar">
          {candidate.name
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')}
        </div>
        <span className="st-rank">
          {String(candidate.rank).padStart(2, '0')}
        </span>
      </div>
      <h3>{candidate.name}</h3>
      <p className="st-muted">
        {candidate.headline || candidate.role || 'Project collaborator'}
      </p>
      <div className="st-chips">
        <Pill tone="violet">{candidate.matchType || 'Evidence match'}</Pill>
        {candidate.role && <Pill>{candidate.role}</Pill>}
        {candidate.verifiedProjects?.length > 0 && (
          <Pill tone="teal">
            {candidate.verifiedProjects.length} verified projects
          </Pill>
        )}
      </div>
      <div className="st-section-label">Why this person</div>
      <ul className="st-reasons">
        {candidate.reasons.map((reason) => (
          <li key={reason}>
            <Icon name="check" size={14} />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
      {candidate.caveats?.map((c) => (
        <p className="st-caveat" key={c}>
          {c}
        </p>
      ))}
      <footer>
        <button className="st-text-button" onClick={onWhy}>
          See why <Icon name="arrow" size={14} />
        </button>
        {action}
      </footer>
    </article>
  );
}
export function Explanation({
  candidate,
  close,
}: {
  candidate: Candidate;
  close: () => void;
}) {
  return (
    <div className="st-overlay" onClick={close}>
      <section
        className="st-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Match explanation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="st-panel-header">
          <h2>Behind the recommendation</h2>
          <button
            className="st-close"
            aria-label="Close explanation"
            onClick={close}
          >
            ×
          </button>
        </div>
        <div className="st-panel-body">
          <div className="st-eyebrow">{candidate.name}</div>
          <h2>A match you can inspect.</h2>
          <p className="st-muted">
            These are the signals used for this result. Recommendations support
            your decision.
          </p>
          {Object.entries(candidate.signals || {}).map(([key, value]) => (
            <div className="st-signal" key={key}>
              <div>
                <span>{key.replace(/_/g, ' ')}</span>
                <small>
                  Weight {Math.round((candidate.weights[key] || 0) * 100)}%
                </small>
              </div>
              <div className="st-meter">
                <span style={{ width: `${Math.min(value * 100, 100)}%` }} />
              </div>
              <span>{Math.round(value * 100)}%</span>
            </div>
          ))}
          <div className="st-section-label">Evidence behind the result</div>
          {candidate.reasons.map((r) => (
            <p className="st-evidence-text" key={r}>
              {r}
            </p>
          ))}
          {candidate.constraintResults?.map((c) => (
            <div className="st-role-row" key={c.field}>
              <Pill tone={c.passed ? 'teal' : 'amber'}>{c.mode}</Pill>
              <span>{c.reason}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
export function MatchResultsPanel({
  projectId,
  roles = [],
}: {
  projectId: string;
  roles?: string[];
}) {
  const [result, setResult] = useState<MatchResult | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<unknown>(null),
    [why, setWhy] = useState<Candidate | null>(null),
    [invite, setInvite] = useState<Candidate | null>(null),
    [role, setRole] = useState(''),
    [sent, setSent] = useState<string[]>([]),
    [sending, setSending] = useState(false),
    [minimumAvailability, setAvailability] = useState(0),
    [workMode, setWorkMode] = useState(''),
    [filterRole, setFilterRole] = useState('');
  useEffect(() => {
    setResult(null);
    setError(null);
    setInvite(null);
    setSent([]);
  }, [projectId]);
  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(
        (
          await intelligence.match({
            projectId,
            filters: {
              minimumAvailability,
              ...(workMode ? { workMode } : {}),
              ...(filterRole ? { role: filterRole } : {}),
            },
          })
        ).data
      );
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  const send = async () => {
    if (!invite) return;
    setSending(true);
    setError(null);
    try {
      await api(`/projects/${encodeURIComponent(projectId)}/invitations`, {
        method: 'POST',
        body: JSON.stringify({ userId: invite.userId, role }),
      });
      setSent([...sent, invite.userId]);
      setInvite(null);
    } catch (e) {
      setError(e);
    } finally {
      setSending(false);
    }
  };
  return (
    <>
      <div className="st-panel st-toolbar">
        {roles.length > 0 && (
          <label className="st-field">
            Open role
            <select
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setResult(null);
              }}
            >
              <option value="">Any role</option>
              {roles.map((title) => (
                <option key={title}>{title}</option>
              ))}
            </select>
          </label>
        )}
        <label className="st-field">
          Minimum hours / week
          <input
            type="number"
            min={0}
            max={168}
            value={minimumAvailability}
            onChange={(e) => setAvailability(Number(e.target.value))}
          />
        </label>
        <label className="st-field">
          Work mode
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
          >
            <option value="">Any work mode</option>
            {['remote', 'hybrid', 'on-site', 'flexible'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <Button disabled={!projectId || loading} onClick={() => void run()}>
          <Icon name="people" />
          {loading ? 'Finding collaborators…' : 'Find collaborators'}
          <Icon name="arrow" />
        </Button>
      </div>
      <ErrorNotice error={error} />
      {loading ? (
        <Loading />
      ) : !result ? (
        <div className="st-panel">
          <Empty icon="people" title="Your next teammate could be here.">
            Choose a project and find people who complement your team’s missing
            capabilities.
          </Empty>
        </div>
      ) : (
        <>
          <div className="st-results-bar">
            <span>
              {result.candidates.length} recommendations{' '}
              <span className="st-muted">
                from {result.sampleSize} eligible profiles
              </span>
            </span>
            <Pill tone={result.mode === 'mock' ? 'amber' : 'violet'}>
              {result.mode === 'mock'
                ? 'Sample mode'
                : result.ranker === 'hybrid'
                  ? 'Hybrid experiment'
                  : 'Evidence-based baseline'}
            </Pill>
          </div>
          {result.noStrongMatches ? (
            <div className="st-panel">
              <Empty title="No strong matches yet.">
                {result.relaxationSuggestions.join(' ')}
              </Empty>
              <div className="st-centered">
                <Button
                  secondary
                  onClick={() => {
                    setAvailability(0);
                    setWorkMode('');
                    setFilterRole('');
                  }}
                >
                  Reset filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="st-candidate-grid">
              {result.candidates.map((c) => (
                <CandidateCard
                  key={c.userId}
                  candidate={c}
                  onWhy={() => setWhy(c)}
                  action={
                    <Button
                      secondary
                      disabled={sent.includes(c.userId)}
                      onClick={() => {
                        setInvite(c);
                        setRole(c.role === 'Contributor' ? '' : c.role || '');
                      }}
                    >
                      {sent.includes(c.userId) ? 'Invitation sent' : 'Invite'}
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
      {why && <Explanation candidate={why} close={() => setWhy(null)} />}{' '}
      {invite && (
        <div className="st-overlay" onClick={() => setInvite(null)}>
          <section
            className="st-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Invite collaborator"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="st-panel-header">
              <h2>Invite {invite.name}</h2>
              <button
                className="st-close"
                onClick={() => setInvite(null)}
                aria-label="Close invitation"
              >
                ×
              </button>
            </div>
            <div className="st-panel-body">
              <p className="st-muted">
                An invitation is a choice, never an assignment. They can accept
                or decline.
              </p>
              <label className="st-field">
                Open project role
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="An existing role on this project"
                />
              </label>
              <Button
                disabled={sending || !role.trim()}
                onClick={() => void send()}
              >
                {sending ? 'Sending…' : 'Send invitation'}
              </Button>
              <ErrorNotice error={error} />
            </div>
          </section>
        </div>
      )}
    </>
  );
}
export default function Matching({ context }: { context: WorkspaceContext }) {
  const [projectId, setProjectId] = useProject(context, true);
  return (
    <>
      <PageHeader
        eyebrow="Collaborator matching"
        title="Great work starts with the right people."
      >
        Find complementary capabilities, shared availability, and room to grow.
      </PageHeader>
      <div className="st-context-row">
        <ProjectPicker
          ownerOnly
          context={context}
          value={projectId}
          onChange={setProjectId}
        />
        {projectId.startsWith('m2-demo') && <Pill>Demo project</Pill>}
      </div>
      <MatchResultsPanel
        projectId={projectId}
        roles={
          context.projects
            .find((p) => p.id === projectId)
            ?.roles?.map((r) => r.title) || []
        }
      />
    </>
  );
}
