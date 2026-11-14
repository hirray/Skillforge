import { useEffect, useState } from 'react';
import { WorkspaceContext, HealthResult, intelligence } from './client';
import {
  PageHeader,
  ProjectPicker,
  useProject,
  Icon,
  Pill,
  Loading,
  ErrorNotice,
  Empty,
} from './shared';
export const HealthBadge = ({ status }: { status: string }) => (
  <Pill
    tone={
      status === 'Healthy'
        ? 'teal'
        : status === 'At Risk' || status === 'Needs Attention'
          ? 'amber'
          : ''
    }
  >
    {status}
  </Pill>
);
export function HealthTab({ projectId }: { projectId: string }) {
  const [result, setResult] = useState<HealthResult | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<unknown>(null),
    [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let current = true;
    setResult(null);
    setError(null);
    if (projectId) {
      setLoading(true);
      void intelligence
        .health(projectId)
        .then((r) => {
          if (current) setResult(r.data);
        })
        .catch((e) => {
          if (current) setError(e);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }
    return () => {
      current = false;
    };
  }, [projectId]);
  if (!projectId)
    return (
      <div className="st-panel">
        <Empty title="Choose a project to see its pulse.">
          Health checks use tasks, milestones, dependencies, and recent
          activity.
        </Empty>
      </div>
    );
  if (loading) return <Loading />;
  if (error) return <ErrorNotice error={error} />;
  if (!result) return null;
  const percentage =
    result.score === null ? null : Math.round(result.score * 100);
  return (
    <>
      <div className="st-health-grid">
        <section className="st-panel st-health-summary">
          <div className="st-panel-header">
            <h2>Project pulse</h2>
            <Pill>
              {result.mode === 'mock' ? 'Sample mode' : 'Live signals'}
            </Pill>
          </div>
          <div className="st-health-ring">
            <svg
              viewBox="0 0 180 180"
              role="img"
              aria-label={
                percentage === null
                  ? result.status
                  : `${percentage} health index`
              }
            >
              <circle cx="90" cy="90" r="75" className="track" />
              <circle
                cx="90"
                cy="90"
                r="75"
                className={result.status === 'Healthy' ? 'healthy' : 'risk'}
                strokeDasharray={`${(percentage || 0) * 4.712} 471.2`}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div>
              <strong>{percentage === null ? '—' : percentage}</strong>
              <span>{percentage === null ? 'Not scored' : 'Health index'}</span>
            </div>
          </div>
          <HealthBadge status={result.status} />
          <p className="st-muted">{result.sampleSize} tasks considered</p>
          <p className="st-footnote">
            Advisory signals. Your team stays in control.
          </p>
        </section>
        <section className="st-panel">
          <div className="st-panel-header">
            <h2>What needs attention</h2>
            <span className="st-muted">{result.signals.length} signals</span>
          </div>
          <div className="st-panel-body">
            {result.signals.length ? (
              (expanded ? result.signals : result.signals.slice(0, 5)).map(
                (s, i) => (
                  <div className="st-health-signal" key={`${s.code}-${i}`}>
                    <span className="st-signal-number">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <Pill tone="amber">{s.severity}</Pill>
                      <p>{s.reason}</p>
                    </div>
                  </div>
                )
              )
            ) : (
              <Empty icon="health" title={result.status}>
                {result.reasons[0]}
              </Empty>
            )}
            {result.signals.length > 5 && (
              <button
                className="st-text-button"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded
                  ? 'Show fewer'
                  : `View all ${result.signals.length} signals`}
              </button>
            )}
          </div>
        </section>
      </div>
      {result.recommendedActions.length > 0 && (
        <section className="st-panel">
          <div className="st-panel-header">
            <h2>A practical next step</h2>
            <Icon name="arrow" />
          </div>
          <div className="st-action-grid">
            {result.recommendedActions.map((a) => (
              <a key={a.label} href={a.href}>
                <Icon name="health" />
                <strong>{a.label}</strong>
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </section>
      )}
      <p className="st-footnote">
        Computed {new Date(result.computedAt).toLocaleString()} · cached for up
        to five minutes; project events invalidate the cache.
      </p>
    </>
  );
}
export default function Health({ context }: { context: WorkspaceContext }) {
  const [projectId, setProjectId] = useProject(context);
  return (
    <>
      <PageHeader
        eyebrow="Project health"
        title="See the signals. Find a way forward."
      >
        A grounded view of delivery risks, with a practical action for each.
      </PageHeader>
      <div className="st-context-row">
        <ProjectPicker
          context={context}
          value={projectId}
          onChange={setProjectId}
        />
        {projectId.startsWith('m2-demo') && <Pill>Demo project</Pill>}
      </div>
      <HealthTab projectId={projectId} />
    </>
  );
}
