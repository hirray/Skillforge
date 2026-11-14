import { useEffect, useRef, useState } from 'react';
import {
  api,
  token,
  ResumeRecord,
  Extraction,
  ExtractionItem,
} from '../ai/client';
import {
  Button,
  Icon,
  Pill,
  PageHeader,
  Empty,
  Loading,
  ErrorNotice,
} from '../ai/shared';

type Decision = {
  id: string;
  action: 'accepted' | 'edited' | 'discarded';
  value?: Record<string, string>;
};
const sections = [
  'skills',
  'experience',
  'education',
  'certifications',
  'links',
  'projects',
] as const;
export default function ResumeStudio() {
  const [records, setRecords] = useState<ResumeRecord[]>([]),
    [active, setActive] = useState(''),
    [record, setRecord] = useState<ResumeRecord | null>(null),
    [extraction, setExtraction] = useState<Extraction | null>(null),
    [decisions, setDecisions] = useState<Record<string, Decision>>({}),
    [loading, setLoading] = useState(true),
    [uploading, setUploading] = useState(false),
    [progress, setProgress] = useState(0),
    [dragging, setDragging] = useState(false),
    [error, setError] = useState<unknown>(null),
    [saving, setSaving] = useState(false),
    [saved, setSaved] = useState(false),
    [confirm, setConfirm] = useState(false),
    [remove, setRemove] = useState(false),
    [editing, setEditing] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const refresh = async () => {
    const list = (await api<{ data: ResumeRecord[] }>('/resumes')).data;
    setRecords(list);
    return list;
  };
  useEffect(() => {
    let current = true;
    void refresh()
      .then((rows) => {
        if (current && rows.length) setActive(rows[0].id);
      })
      .catch(setError)
      .finally(() => setLoading(false));
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    let current = true,
      timer: ReturnType<typeof setTimeout>;
    setExtraction(null);
    setDecisions({});
    setSaved(false);
    setError(null);
    setRecord(null);
    if (!active) return;
    const poll = async () => {
      try {
        const r = (await api<{ data: ResumeRecord }>(`/resumes/${active}`))
          .data;
        if (!current) return;
        setRecord(r);
        setRecords((rows) =>
          rows.map((row) => (row.id === r.id ? { ...row, ...r } : row))
        );
        if (['ready', 'confirmed'].includes(r.status)) {
          const data = (
            await api<{ data: Extraction }>(`/resumes/${active}/extraction`)
          ).data;
          if (current) {
            setExtraction(data);
            setDecisions(
              Object.fromEntries((data?.decisions || []).map((d) => [d.id, d]))
            );
            setSaved(Boolean(data?.confirmedAt));
          }
        } else if (['pending', 'parsing', 'retrying'].includes(r.status))
          timer = setTimeout(() => void poll(), 1300);
      } catch (e) {
        if (current) setError(e);
      }
    };
    void poll();
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [active]);
  const upload = (file?: File) => {
    if (!file) return;
    if (
      !/\.pdf$/i.test(file.name) ||
      file.size > 10 * 1024 * 1024 ||
      file.size === 0
    ) {
      setError(new Error('Choose a non-empty PDF of up to 10 MB.'));
      return;
    }
    setError(null);
    setUploading(true);
    setProgress(0);
    const data = new FormData();
    data.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/v1/resumes');
    xhr.setRequestHeader('Authorization', `Bearer ${token()}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable)
        setProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onerror = () => {
      setUploading(false);
      setError(
        new Error(
          'Upload interrupted. Your previous resume is unchanged. Please retry.'
        )
      );
    };
    xhr.onload = () => {
      setUploading(false);
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 400)
          throw new Error(body.error?.message || 'Upload failed.');
        setActive(body.data.id);
        void refresh().catch(setError);
      } catch (e) {
        setError(e);
      }
    };
    xhr.send(data);
  };
  const items = extraction
    ? sections.flatMap((section) => extraction[section] || [])
    : [];
  const accepted = Object.values(decisions).filter(
    (d) => d.action !== 'discarded'
  );
  const displayValue = (item: ExtractionItem) => {
    const value = { ...item.value, ...decisions[item.id]?.value };
    return (
      value.name ||
      value.company ||
      value.institution ||
      value.url ||
      value.text
    );
  };
  const decide = (
    item: ExtractionItem,
    action: Decision['action'],
    value?: Record<string, string>
  ) =>
    setDecisions((current) => ({
      ...current,
      [item.id]: { id: item.id, action, ...(value ? { value } : {}) },
    }));
  const save = async () => {
    if (!extraction) return;
    setConfirm(false);
    setSaving(true);
    setError(null);
    try {
      await api(`/resumes/${active}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          extractionId: extraction.id,
          decisions: items.map(
            (item) => decisions[item.id] || { id: item.id, action: 'discarded' }
          ),
        }),
      });
      setSaved(true);
      void refresh().catch(setError);
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };
  const download = async () => {
    try {
      const signed = await api<{ data: { url: string } }>(
        `/resumes/${active}/download`
      );
      const response = await fetch(signed.data.url, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!response.ok)
        throw new Error('The download link has expired. Please try again.');
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = record?.fileName || 'resume.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e);
    }
  };
  return (
    <>
      <PageHeader
        eyebrow="Resume intelligence"
        title="Your experience. Clearly understood."
      >
        Turn your resume into structured evidence. Review every detail before it
        reaches your profile.
      </PageHeader>
      <ErrorNotice error={error} />
      <div className="st-resume-layout">
        <aside className="st-resume-left">
          <section
            className={`st-upload ${dragging ? 'dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              upload(e.dataTransfer.files[0]);
            }}
          >
            <div className="st-upload-symbol">
              <Icon name="upload" size={30} />
            </div>
            <h2>A story worth building on.</h2>
            <p>Drop your resume here, or choose a file to get started.</p>
            <input
              ref={input}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => {
                upload(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <Button disabled={uploading} onClick={() => input.current?.click()}>
              {uploading ? `Uploading · ${progress}%` : 'Choose PDF'}
              <Icon name="arrow" />
            </Button>
            {uploading && (
              <progress
                max="100"
                value={progress}
                aria-label="Upload progress"
              />
            )}
            <span className="st-footnote">
              PDF · Up to 10 MB · Private to your account
            </span>
          </section>
          <div className="st-section-label">
            Your documents <span>{records.length}</span>
          </div>
          {loading ? (
            <Loading />
          ) : (
            records.map((r) => (
              <button
                key={r.id}
                className={`st-document ${active === r.id ? 'active' : ''}`}
                onClick={() => setActive(r.id)}
              >
                <Icon name="resume" />
                <span>
                  <strong>{r.fileName}</strong>
                  <small>
                    {new Date(r.createdAt).toLocaleDateString()} · {r.status}
                  </small>
                </span>
                <Icon name="chevron" size={14} />
              </button>
            ))
          )}
          <div className="st-privacy-note">
            <Icon name="shield" />
            <div>
              <strong>You control the final version.</strong>
              <p>
                No extracted information is published automatically. Uploading
                another resume preserves previously confirmed profile data.
              </p>
            </div>
          </div>
        </aside>
        <section className="st-panel st-review">
          <div className="st-panel-header">
            <h2>
              {extraction
                ? 'Review your experience'
                : 'A clearer picture starts here'}
            </h2>
            {record && (
              <Pill tone={saved ? 'teal' : 'violet'}>
                {saved ? 'Confirmed' : record.status}
              </Pill>
            )}
          </div>
          {!active ? (
            <Empty icon="resume" title="Your next chapter, in focus.">
              Upload a resume to see skills, experience, education, and the
              evidence behind each extracted field.
            </Empty>
          ) : !record ? (
            <Loading />
          ) : ['pending', 'parsing', 'retrying'].includes(record.status) ? (
            <div className="st-panel-body">
              <Loading />
              <h3>
                {record.status === 'retrying'
                  ? 'Parsing is taking longer than usual.'
                  : 'Reading between the lines…'}
              </h3>
              <p className="st-muted">
                Extracting the text, identifying sections, and matching skills.
                Attempt {record.attempts || 1} of 3.
              </p>
            </div>
          ) : record.status === 'failed' ? (
            <div className="st-panel-body">
              <Empty title="We couldn’t read this resume.">
                {record.lastError} You can retry or continue manually.
              </Empty>
              <div className="st-centered">
                <Button
                  onClick={async () => {
                    try {
                      await api(`/resumes/${active}/retry`, { method: 'POST' });
                      const id = active;
                      setActive('');
                      setTimeout(() => setActive(id), 0);
                    } catch (e) {
                      setError(e);
                    }
                  }}
                >
                  Retry parsing
                </Button>
                <a className="st-text-button" href="/users">
                  Continue manually <Icon name="arrow" size={14} />
                </a>
              </div>
            </div>
          ) : extraction ? (
            <>
              <div className="st-review-intro">
                <div>
                  <span className="st-eyebrow">
                    Extracted identity · please verify
                  </span>
                  <h2>
                    {extraction.contact?.name || 'Name could not be identified'}
                  </h2>
                  <p className="st-muted">
                    {extraction.contact?.email ||
                      'Contact details stay in this private review.'}
                  </p>
                </div>
                {!saved && (
                  <Button
                    secondary
                    onClick={() =>
                      setDecisions((current) => ({
                        ...current,
                        ...Object.fromEntries(
                          items
                            .filter((item) => item.confidence >= 0.85)
                            .map((item) => [
                              item.id,
                              { id: item.id, action: 'accepted' },
                            ])
                        ),
                      }))
                    }
                  >
                    Accept high confidence
                  </Button>
                )}
              </div>
              {extraction.warnings?.map((w) => (
                <div className="st-notice" key={w}>
                  {w}
                </div>
              ))}
              {sections.map(
                (section) =>
                  extraction[section]?.length > 0 && (
                    <div className="st-review-section" key={section}>
                      <div className="st-section-label">
                        {section}
                        <span>{extraction[section].length}</span>
                      </div>
                      {extraction[section].map((item) => (
                        <div
                          className={`st-extraction-item ${decisions[item.id]?.action === 'discarded' ? 'muted' : ''}`}
                          key={item.id}
                        >
                          <div className="st-item-heading">
                            <strong>{displayValue(item)}</strong>
                            <Pill
                              tone={item.confidence >= 0.85 ? 'teal' : 'amber'}
                            >
                              {item.confidenceLabel} confidence
                            </Pill>
                          </div>
                          {editing === item.id ? (
                            <div className="st-edit-fields">
                              {Object.entries(item.value)
                                .filter(
                                  ([key]) => !['canonicalSkillId'].includes(key)
                                )
                                .map(([key, value]) => (
                                  <label className="st-field" key={key}>
                                    {key}
                                    <input
                                      value={
                                        decisions[item.id]?.value?.[key] ??
                                        value
                                      }
                                      onChange={(e) =>
                                        decide(item, 'edited', {
                                          ...item.value,
                                          ...decisions[item.id]?.value,
                                          [key]: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                ))}
                              <Button
                                secondary
                                onClick={() => setEditing(null)}
                              >
                                Keep changes
                              </Button>
                            </div>
                          ) : (
                            <>
                              <p className="st-muted">{item.reason}</p>
                              <blockquote>{item.evidence}</blockquote>
                            </>
                          )}
                          {['links', 'projects'].includes(section) && (
                            <p className="st-footnote">
                              Kept in the review record; profile integration for
                              this section is pending.
                            </p>
                          )}
                          {!saved && (
                            <div className="st-review-actions">
                              <button
                                className={
                                  decisions[item.id]?.action === 'accepted'
                                    ? 'selected'
                                    : ''
                                }
                                onClick={() => decide(item, 'accepted')}
                              >
                                <Icon name="check" size={14} />
                                Accept
                              </button>
                              <button
                                className={
                                  decisions[item.id]?.action === 'edited'
                                    ? 'selected'
                                    : ''
                                }
                                onClick={() => {
                                  setEditing(item.id);
                                  decide(item, 'edited', {
                                    ...item.value,
                                    ...decisions[item.id]?.value,
                                  });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className={
                                  decisions[item.id]?.action === 'discarded'
                                    ? 'selected'
                                    : ''
                                }
                                onClick={() => decide(item, 'discarded')}
                              >
                                Discard
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
              )}
              {extraction.proposals?.length > 0 && (
                <div className="st-review-section">
                  <div className="st-section-label">
                    Unmatched skill proposals
                  </div>
                  {extraction.proposals.map((p, i) => (
                    <p className="st-muted" key={i}>
                      {p.name} — {p.reason}
                    </p>
                  ))}
                </div>
              )}
              {items.length === 0 && (
                <Empty title="No structured fields found.">
                  This document may have no text layer or use an unsupported
                  layout. Continue manually or upload a clearer version.
                </Empty>
              )}
              <div className="st-review-footer">
                <span>
                  {saved
                    ? 'Your confirmed profile entries are saved.'
                    : `${accepted.length} items selected · unreviewed items won’t be saved`}
                </span>
                <Button
                  disabled={saved || saving || accepted.length === 0}
                  onClick={() => setConfirm(true)}
                >
                  {saved ? (
                    <>
                      <Icon name="check" />
                      Saved to profile
                    </>
                  ) : saving ? (
                    'Saving…'
                  ) : (
                    'Save reviewed items'
                  )}
                </Button>
              </div>
              <div className="st-file-actions">
                <button
                  className="st-text-button"
                  onClick={() => void download()}
                >
                  Download original
                </button>
                <button
                  className="st-text-button"
                  onClick={() => setRemove(true)}
                >
                  Delete original
                </button>
                <a className="st-text-button" href="/users">
                  Continue manually <Icon name="arrow" size={14} />
                </a>
              </div>
            </>
          ) : null}
        </section>
      </div>
      {confirm && (
        <div className="st-overlay">
          <section
            className="st-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm profile updates"
          >
            <div className="st-panel-body">
              <Icon name="shield" size={28} />
              <h2>Save the details you reviewed?</h2>
              <p className="st-muted">
                Only the {accepted.length} selected items will be confirmed.
                Skills, education, work experience, and certifications merge
                into your profile. Links and project excerpts remain in the
                private review.
              </p>
              <div className="st-inline-controls">
                <Button secondary onClick={() => setConfirm(false)}>
                  Back to review
                </Button>
                <Button onClick={() => void save()}>Confirm and save</Button>
              </div>
            </div>
          </section>
        </div>
      )}
      {remove && (
        <div className="st-overlay">
          <section
            className="st-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Delete resume"
          >
            <div className="st-panel-body">
              <h2>Delete the original resume?</h2>
              <p className="st-muted">
                The file and extraction review will be removed. Previously
                confirmed profile entries will remain.
              </p>
              <div className="st-inline-controls">
                <Button secondary onClick={() => setRemove(false)}>
                  Keep resume
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      await api(`/resumes/${active}`, { method: 'DELETE' });
                      setRemove(false);
                      setActive('');
                      setRecord(null);
                      await refresh();
                    } catch (e) {
                      setRemove(false);
                      setError(e);
                    }
                  }}
                >
                  Delete original
                </Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
