import { useState } from 'react';
import {
  WorkspaceContext,
  RequirementResult,
  intelligence,
  api,
} from './client';
import {
  Button,
  PageHeader,
  Icon,
  Pill,
  Empty,
  Loading,
  ErrorNotice,
  ProjectPicker,
  useProject,
} from './shared';

export function useRequirementSuggestions() {
  const [result, setResult] = useState<RequirementResult | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState<unknown>(null);
  const suggest = async (input: object) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult((await intelligence.requirements(input)).data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  return { result, setResult, loading, error, suggest };
}
export function AiRequirementPanel({
  projectId,
  context,
}: {
  projectId?: string;
  context?: WorkspaceContext;
}) {
  const [selectedProject, setSelectedProject] = useState(projectId || ''),
    [description, setDescription] = useState(''),
    [teamSize, setTeamSize] = useState(3),
    [timeline, setTimeline] = useState(6),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [saveError, setSaveError] = useState<unknown>(null),
    [excluded, setExcluded] = useState<number[]>([]);
  const { result, setResult, loading, error, suggest } =
    useRequirementSuggestions();
  const update = (i: number, key: string, value: string) => {
    setSaved(false);
    if (result)
      setResult({
        ...result,
        skills: result.skills.map((s, j) =>
          j === i ? { ...s, [key]: value, source: 'ai_edited' } : s
        ),
      });
  };
  const save = async () => {
    if (!result || !selectedProject) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api(
        `/projects/${encodeURIComponent(selectedProject)}/requirements`,
        {
          method: 'PUT',
          body: JSON.stringify({
            requirements: result.skills
              .filter((_s, i) => !excluded.includes(i))
              .map((s) => ({
                name: s.name,
                proficiency: s.proficiency,
                type: s.type,
                source: s.source || 'ai_accepted',
              })),
          }),
        }
      );
      setSaved(true);
    } catch (e) {
      setSaveError(e);
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <div className="st-two-col">
        <section className="st-panel">
          <div className="st-panel-header">
            <h2>Start with an idea</h2>
            <Pill>01 / Describe</Pill>
          </div>
          <div className="st-panel-body">
            <label className="st-field">
              What are you building?
              <textarea
                rows={8}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSaved(false);
                }}
                placeholder="Describe the people, workflows, and capabilities your project needs…"
                maxLength={50000}
              />
            </label>
            <div className="st-chips">
              <button
                onClick={() =>
                  setDescription(
                    'Build a classroom attendance platform using face recognition and Python computer vision, with a React web dashboard for teachers and secure cloud deployment.'
                  )
                }
              >
                Attendance platform <Icon name="arrow" size={13} />
              </button>
              <button
                onClick={() =>
                  setDescription(
                    'Create an online store for independent creators with product catalog browsing, a shopping cart, checkout, order management, and an accessible responsive web interface.'
                  )
                }
              >
                Creator storefront <Icon name="arrow" size={13} />
              </button>
            </div>
            <div className="st-form-grid">
              <label className="st-field">
                Team size
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                />
              </label>
              <label className="st-field">
                Timeline · weeks
                <input
                  type="number"
                  min={1}
                  max={520}
                  value={timeline}
                  onChange={(e) => setTimeline(Number(e.target.value))}
                />
              </label>
            </div>
            {context && (
              <ProjectPicker
                context={context}
                ownerOnly
                value={selectedProject}
                onChange={setSelectedProject}
              />
            )}
            <Button
              disabled={loading || !description.trim()}
              onClick={() => {
                setExcluded([]);
                setSaved(false);
                void suggest({
                  description,
                  teamSize,
                  timeline,
                  ...(selectedProject ? { projectId: selectedProject } : {}),
                });
              }}
            >
              <Icon name="spark" />
              {loading ? 'Analyzing your idea…' : 'Find the building blocks'}
              <Icon name="arrow" />
            </Button>
            <p className="st-footnote">
              Suggestions stay editable. You decide what belongs in the project.
            </p>
            <ErrorNotice error={error} />
          </div>
        </section>
        <section className="st-panel">
          <div className="st-panel-header">
            <h2>Your project blueprint</h2>
            {result && (
              <Pill tone={result.mode === 'mock' ? 'amber' : 'violet'}>
                {result.mode === 'mock' ? 'Sample results' : 'Ready to review'}
              </Pill>
            )}
          </div>
          <div className="st-panel-body">
            {loading ? (
              <Loading />
            ) : !result ? (
              <Empty title="Make the idea concrete">
                Your suggested skills, roles, and modules will appear here, with
                a reason for each.
              </Empty>
            ) : result.needsClarification ? (
              <div className="st-question-list">
                <Icon name="spark" size={30} />
                <h3>A little more context will help.</h3>
                {result.questions.map((q, i) => (
                  <p key={q}>
                    <span>0{i + 1}</span>
                    {q}
                  </p>
                ))}
              </div>
            ) : (
              <>
                <div className="st-section-label">
                  Skills <span>{result.skills.length}</span>
                </div>
                {result.skills.map((skill, i) => (
                  <div
                    className={`st-suggestion ${excluded.includes(i) ? 'muted' : ''}`}
                    key={`${i}`}
                  >
                    <div className="st-suggestion-top">
                      <label className="st-check-label">
                        <input
                          type="checkbox"
                          aria-label={`Include ${skill.name}`}
                          checked={!excluded.includes(i)}
                          onChange={(e) =>
                            setExcluded(
                              e.target.checked
                                ? excluded.filter((n) => n !== i)
                                : [...excluded, i]
                            )
                          }
                        />
                        <input
                          aria-label={`Skill ${i + 1}`}
                          className="st-inline-input"
                          value={skill.name}
                          onChange={(e) => update(i, 'name', e.target.value)}
                        />
                      </label>
                      <Pill tone="violet">Suggested</Pill>
                    </div>
                    <p>{skill.rationale}</p>
                    <div className="st-inline-controls">
                      <select
                        aria-label={`Proficiency for ${skill.name}`}
                        value={skill.proficiency}
                        onChange={(e) =>
                          update(i, 'proficiency', e.target.value)
                        }
                      >
                        {['beginner', 'intermediate', 'advanced', 'expert'].map(
                          (v) => (
                            <option key={v}>{v}</option>
                          )
                        )}
                      </select>
                      <select
                        aria-label={`Priority for ${skill.name}`}
                        value={skill.type}
                        onChange={(e) => update(i, 'type', e.target.value)}
                      >
                        <option value="required">Required</option>
                        <option value="preferred">Preferred</option>
                      </select>
                      {skill.unmatched && (
                        <span className="st-muted">Taxonomy proposal</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="st-section-label">Suggested roles</div>
                {result.roles.map((role) => (
                  <div className="st-role-row" key={role.title}>
                    <Icon name="people" />
                    <div>
                      <strong>{role.title}</strong>
                      <p>{role.rationale}</p>
                    </div>
                  </div>
                ))}
                <div className="st-section-label">Functional modules</div>
                <div className="st-chips">
                  {result.modules.map((name) => (
                    <Pill key={name}>{name}</Pill>
                  ))}
                </div>
                {result.warnings.map((w) => (
                  <div className="st-notice" key={w}>
                    {w}
                  </div>
                ))}
                <div className="st-save-row">
                  <Button
                    disabled={!selectedProject || saving || saved}
                    onClick={() => void save()}
                  >
                    {saved ? (
                      <>
                        <Icon name="check" />
                        Saved to project
                      </>
                    ) : saving ? (
                      'Saving…'
                    ) : (
                      'Save selected requirements'
                    )}
                  </Button>
                  {!selectedProject && (
                    <span className="st-muted">Choose a project to save.</span>
                  )}
                </div>
                <ErrorNotice error={saveError} />
              </>
            )}
          </div>
        </section>
      </div>
      {result && !result.needsClarification && (
        <section className="st-panel st-gap">
          <div className="st-panel-header">
            <h2>Where your team stands</h2>
            <span className="st-muted">Confirmed members · shared skills</span>
          </div>
          <div className="st-gap-grid">
            {(['covered', 'partial', 'missing'] as const).map((bucket, i) => (
              <div key={bucket}>
                <div className="st-gap-title">
                  <span className={`st-dot tone-${i}`} />
                  {bucket === 'partial' ? 'Partially covered' : bucket}
                  <strong>{result.gap[bucket]?.length || 0}</strong>
                </div>
                {(result.gap[bucket] || []).map((s) => (
                  <div className="st-gap-item" key={s.skill}>
                    <strong>{s.skill}</strong>
                    <p>{s.people.length ? s.people.join(', ') : s.reason}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
export default function Requirements({
  context,
}: {
  context: WorkspaceContext;
}) {
  const [projectId] = useProject(context, true);
  return (
    <>
      <PageHeader
        eyebrow="Project intelligence"
        title="From idea to a clear plan."
      >
        Discover the skills and people your next project needs.
      </PageHeader>
      <AiRequirementPanel context={context} projectId={projectId} />
    </>
  );
}
