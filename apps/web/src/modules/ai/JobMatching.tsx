import { useEffect, useState } from 'react';
import {
  WorkspaceContext,
  Candidate,
  MatchResult,
  intelligence,
} from './client';
import { CandidateCard, Explanation } from './Matching';
import {
  PageHeader,
  Button,
  Icon,
  Pill,
  Empty,
  Loading,
  ErrorNotice,
} from './shared';
export function JobMatchResults({
  jobId,
  onShortlist,
}: {
  jobId: string;
  onShortlist?: (candidate: Candidate) => Promise<void>;
}) {
  const [result, setResult] = useState<MatchResult | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<unknown>(null),
    [location, setLocation] = useState('soft'),
    [workMode, setWorkMode] = useState('soft'),
    [why, setWhy] = useState<Candidate | null>(null),
    [compared, setCompared] = useState<string[]>([]);
  useEffect(() => {
    setResult(null);
    setCompared([]);
    setError(null);
  }, [jobId]);
  const run = async (override: Record<string, string> = {}) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setCompared([]);
    try {
      setResult(
        (
          await intelligence.jobMatch({
            jobId,
            constraints: { location, workMode, ...override },
          })
        ).data
      );
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="st-panel st-toolbar">
        <label className="st-field">
          Location constraint
          <select
            value={location}
            disabled={loading}
            onChange={(e) => {
              setLocation(e.target.value);
              if (result) void run({ location: e.target.value });
            }}
          >
            <option value="soft">Soft · show caveats</option>
            <option value="hard">Hard · must match</option>
          </select>
        </label>
        <label className="st-field">
          Work mode constraint
          <select
            value={workMode}
            disabled={loading}
            onChange={(e) => {
              setWorkMode(e.target.value);
              if (result) void run({ workMode: e.target.value });
            }}
          >
            <option value="soft">Soft · show caveats</option>
            <option value="hard">Hard · must match</option>
          </select>
        </label>
        <Button disabled={!jobId || loading} onClick={() => void run()}>
          <Icon name="job" />
          {loading ? 'Evaluating fit…' : 'Find talent'}
          <Icon name="arrow" />
        </Button>
      </div>
      <ErrorNotice error={error} />
      {loading ? (
        <Loading />
      ) : !result ? (
        <div className="st-panel">
          <Empty icon="job" title="Find evidence, not just keywords.">
            Only people who have opted into recruiter discovery are eligible.
            Your company controls its own jobs.
          </Empty>
        </div>
      ) : (
        <>
          <div className="st-results-bar">
            <span>
              {result.candidates.length} candidates · {result.sampleSize}{' '}
              visible profiles
            </span>
            <Pill tone="violet">
              {result.mode === 'mock' ? 'Sample mode' : 'Evidence-weighted'}
            </Pill>
          </div>
          {result.noStrongMatches ? (
            <div className="st-panel">
              <Empty title="No candidates meet these requirements.">
                {result.relaxationSuggestions.join(' ') ||
                  'Review the required skills and constraints.'}
              </Empty>
            </div>
          ) : (
            <div className="st-candidate-grid">
              {result.candidates.map((c) => (
                <CandidateCard
                  key={c.userId}
                  candidate={c}
                  onWhy={() => setWhy(c)}
                  action={
                    <div className="st-inline-controls">
                      <button
                        className="st-text-button"
                        onClick={() =>
                          setCompared(
                            compared.includes(c.userId)
                              ? compared.filter((id) => id !== c.userId)
                              : [...compared.slice(-2), c.userId]
                          )
                        }
                      >
                        {compared.includes(c.userId) ? 'Remove' : 'Compare'}
                      </button>
                      <Button
                        secondary
                        disabled={!onShortlist}
                        title={
                          !onShortlist
                            ? 'The Pipeline owner can connect this action through the exported callback.'
                            : 'Add to shortlist'
                        }
                        onClick={() => void onShortlist?.(c).catch(setError)}
                      >
                        Shortlist
                      </Button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
      {compared.length > 0 && (
        <section className="st-panel st-compare">
          <div className="st-panel-header">
            <h2>Compare the evidence</h2>
            <button className="st-text-button" onClick={() => setCompared([])}>
              Clear
            </button>
          </div>
          <div className="st-compare-grid">
            {result?.candidates
              .filter((c) => compared.includes(c.userId))
              .map((c) => (
                <div key={c.userId}>
                  <h3>{c.name}</h3>
                  <p>{c.matchedSkills.join(', ') || 'Skill details private'}</p>
                  <p>{c.verifiedProjects.length} verified projects</p>
                  {c.reasons.map((r) => (
                    <p className="st-muted" key={r}>
                      {r}
                    </p>
                  ))}
                </div>
              ))}
          </div>
        </section>
      )}
      {why && <Explanation candidate={why} close={() => setWhy(null)} />}
      <p className="st-footnote">
        Shortlisting connects through the hiring Pipeline integration. Matching
        never selects or rejects a person automatically.
      </p>
    </>
  );
}
export default function JobMatching({
  context,
}: {
  context: WorkspaceContext;
}) {
  const [jobId, setJobId] = useState(context.jobs[0]?.id || '');
  return (
    <>
      <PageHeader
        eyebrow="Recruiter intelligence"
        title="Let the work speak for itself."
      >
        Compare candidates through skills, evidence, and explicit job
        constraints.
      </PageHeader>
      {context.jobs.length ? (
        <>
          <div className="st-context-row">
            <label className="st-field">
              Your company’s job
              <select value={jobId} onChange={(e) => setJobId(e.target.value)}>
                {context.jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </label>
            {jobId.startsWith('m2-demo') && <Pill>Demo job</Pill>}
          </div>
          <JobMatchResults jobId={jobId} />
        </>
      ) : (
        <div className="st-panel">
          <Empty icon="shield" title="A recruiter workspace is required.">
            Only recruiters can match candidates to their company’s jobs. In the
            local demo, choose the Recruiter account from the account menu.
          </Empty>
        </div>
      )}
    </>
  );
}
