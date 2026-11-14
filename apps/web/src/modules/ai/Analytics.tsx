import { useEffect, useState } from 'react';
import { api, WorkspaceContext } from './client';
import { PageHeader, Pill, Empty, Loading, ErrorNotice, Icon } from './shared';
type Metric = {
  label: string;
  value: number | null;
  sampleSize: number;
  suppressed: boolean;
  live: boolean;
};
export default function Analytics({ context }: { context: WorkspaceContext }) {
  const [tab, setTab] = useState('platform'),
    [days, setDays] = useState(30),
    [result, setResult] = useState<any>(null),
    [error, setError] = useState<unknown>(null),
    [loading, setLoading] = useState(false),
    [eventType, setEventType] = useState('ProjectCreated'),
    [chartType, setChartType] = useState('line');
  const allowed = context.user.roles.includes('admin');
  useEffect(() => {
    if (!allowed) return;
    let current = true;
    setLoading(true);
    setError(null);
    const to = new Date(),
      from = new Date(to.getTime() - days * 86400000);
    void api(
      `/analytics/summary?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`
    )
      .then((r) => {
        if (current) setResult(r.data);
      })
      .catch((e) => {
        if (current) setError(e);
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [days, allowed]);
  if (!allowed)
    return (
      <>
        <PageHeader eyebrow="Analytics" title="A clear view of what’s working.">
          Aggregate product signals and an honest evaluation of the matching
          baseline.
        </PageHeader>
        <div className="st-panel">
          <Empty icon="shield" title="Administrator access required.">
            This dashboard is restricted on both the client and the server.
            Choose the Admin account for the local demo.
          </Empty>
        </div>
      </>
    );
  const metrics: Metric[] = result?.[tab] || [];
  const series = (result?.series || []).filter(
    (s: any) => s.type === eventType
  );
  const visible = series.filter((s: any) => !s.suppressed && s.value !== null);
  const max = Math.max(1, ...visible.map((s: any) => s.value));
  const points = series
    .map((s: any, i: number) =>
      !s.suppressed && s.value !== null
        ? `${50 + (i * 900) / Math.max(series.length - 1, 1)},${210 - (s.value / max) * 160}`
        : ''
    )
    .filter(Boolean)
    .join(' ');
  return (
    <>
      <PageHeader
        eyebrow="Analytics & evaluation"
        title="Understand the outcome."
      >
        Aggregate signals, visible sample sizes, and evidence before bigger
        claims.
      </PageHeader>
      <div className="st-analytics-controls">
        <div className="st-tabs">
          {['platform', 'matching', 'projects', 'recruiters', 'evaluation'].map(
            (v) => (
              <button
                className={tab === v ? 'active' : ''}
                key={v}
                onClick={() => setTab(v)}
              >
                {v}
              </button>
            )
          )}
        </div>
        <label className="st-field">
          <span className="st-sr-only">Date range</span>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </label>
      </div>
      <ErrorNotice error={error} />
      {loading ? (
        <Loading />
      ) : (
        result && (
          <>
            {result.syntheticEvents > 0 && (
              <div className="st-notice">
                Demo history includes {result.syntheticEvents} explicitly
                synthetic events. These are not real product outcomes.
              </div>
            )}
            {tab !== 'evaluation' ? (
              <>
                <div className="st-kpi-grid">
                  {metrics.map((m) => (
                    <div className="st-kpi" key={m.label}>
                      <span>{m.label}</span>
                      <strong>
                        {m.value === null
                          ? '—'
                          : /rate/i.test(m.label)
                            ? `${Math.round(m.value * 100)}%`
                            : m.value.toLocaleString()}
                      </strong>
                      <small>
                        {!m.live
                          ? 'Not yet live'
                          : m.suppressed
                            ? 'Not enough data · cohort below 5'
                            : `Sample size ${m.sampleSize}`}
                      </small>
                    </div>
                  ))}
                </div>
                <section className="st-panel">
                  <div className="st-panel-header">
                    <div>
                      <h2>Activity over time</h2>
                      <p className="st-muted">
                        Daily event counts · breakdowns require at least 5
                        people
                      </p>
                    </div>
                    <select
                      aria-label="Chart event type"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      {[
                        'ProjectCreated',
                        'InvitationSent',
                        'MemberJoined',
                        'TaskCompleted',
                        'MilestoneReached',
                        'CandidateShortlisted',
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  {visible.length ? (
                    <div className="st-chart">
                      <div className="st-tabs" aria-label="Chart display">
                        <button
                          className={chartType === 'line' ? 'active' : ''}
                          onClick={() => setChartType('line')}
                        >
                          Trend
                        </button>
                        <button
                          className={chartType === 'bar' ? 'active' : ''}
                          onClick={() => setChartType('bar')}
                        >
                          Daily bars
                        </button>
                      </div>
                      <svg
                        viewBox="0 0 1000 260"
                        role="img"
                        aria-label={`${eventType} daily event counts`}
                      >
                        <title>
                          {eventType}: {visible.length} reportable daily cohorts
                        </title>
                        {[0, 1, 2, 3, 4].map((i) => (
                          <g key={i}>
                            <line
                              x1="50"
                              x2="950"
                              y1={50 + i * 40}
                              y2={50 + i * 40}
                              stroke="currentColor"
                              strokeOpacity=".12"
                              strokeDasharray="3 6"
                            />
                            <text
                              x="10"
                              y={55 + i * 40}
                              fill="currentColor"
                              opacity=".5"
                              fontSize="11"
                            >
                              {Math.round(max * (1 - i / 4))}
                            </text>
                          </g>
                        ))}
                        {chartType === 'line' && (
                          <polyline
                            points={points}
                            fill="none"
                            stroke="var(--st-violet)"
                            strokeWidth="2.5"
                          />
                        )}
                        {chartType === 'bar' &&
                          series.map(
                            (s: any, i: number) =>
                              !s.suppressed &&
                              s.value !== null && (
                                <rect
                                  key={s.day}
                                  x={
                                    50 + (i * 900) / Math.max(series.length, 1)
                                  }
                                  y={210 - (s.value / max) * 160}
                                  width={Math.max(
                                    3,
                                    900 / Math.max(series.length, 1) - 8
                                  )}
                                  height={(s.value / max) * 160}
                                  rx="3"
                                  fill="var(--st-violet)"
                                  opacity=".8"
                                >
                                  <title>
                                    {s.day}: {s.value}, sample {s.sampleSize}
                                  </title>
                                </rect>
                              )
                          )}
                        {series.map(
                          (s: any, i: number) =>
                            chartType === 'line' &&
                            !s.suppressed && (
                              <circle
                                key={s.day}
                                cx={
                                  50 +
                                  (i * 900) / Math.max(series.length - 1, 1)
                                }
                                cy={210 - ((s.value || 0) / max) * 160}
                                r="3"
                                fill="var(--st-violet)"
                              >
                                <title>
                                  {s.day}: {s.value}, sample {s.sampleSize}
                                </title>
                              </circle>
                            )
                        )}
                        <text
                          x="50"
                          y="245"
                          fill="currentColor"
                          opacity=".5"
                          fontSize="11"
                        >
                          {series[0]?.day}
                        </text>
                        <text
                          x="950"
                          y="245"
                          textAnchor="end"
                          fill="currentColor"
                          opacity=".5"
                          fontSize="11"
                        >
                          {series[series.length - 1]?.day}
                        </text>
                      </svg>
                      <div className="st-chart-caption">
                        <Pill tone="violet">{eventType}</Pill>
                        <span>
                          {result.sampleSize} distinct participants in this
                          range
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Empty icon="chart" title="Not enough data yet.">
                      Breakdowns with fewer than five people are suppressed.
                      Sample size: {result.sampleSize}.
                    </Empty>
                  )}
                </section>
              </>
            ) : (
              <section className="st-panel">
                <div className="st-panel-header">
                  <h2>Baseline vs. hybrid</h2>
                  <Pill tone="violet">Baseline remains the default</Pill>
                </div>
                <div className="st-panel-body">
                  <div className="st-eval-verdict">
                    <Icon name="chart" size={28} />
                    <div>
                      <h3>{result.evaluation.verdict}</h3>
                      <p>
                        {result.evaluation.scenarios || 0} labelled synthetic
                        scenarios · offline evaluation, not a real-world hiring
                        outcome
                      </p>
                    </div>
                  </div>
                  {result.evaluation.baseline && (
                    <table className="st-table">
                      <thead>
                        <tr>
                          <th>Ranker</th>
                          <th>Precision @ 5</th>
                          <th>NDCG</th>
                          <th>Scenarios</th>
                        </tr>
                      </thead>
                      <tbody>
                        {['baseline', 'hybrid'].map((key) => (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>
                              {(
                                result.evaluation[key].precisionAt5 * 100
                              ).toFixed(1)}
                              %
                            </td>
                            <td>
                              {result.evaluation[key].ndcg?.toFixed(3) ?? '—'}
                            </td>
                            <td>{result.evaluation.scenarios}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  <p className="st-footnote">
                    Acceptance and join rates require recorded,
                    recommendation-attributed outcomes. Small samples are not
                    evidence that a ranker is better.
                  </p>
                </div>
              </section>
            )}
          </>
        )
      )}
    </>
  );
}
