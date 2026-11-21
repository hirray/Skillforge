import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../ai/client';
import { VerifiedProjectExperience, CorrectionRequest } from '@skillforge/contract';
import '../ai/studio.css';

export function VerifiedExperiencePage() {
  const [experiences, setExperiences] = useState<VerifiedProjectExperience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Correction request modal state
  const [modalExp, setModalExp] = useState<VerifiedProjectExperience | null>(null);
  const [correctionField, setCorrectionField] = useState<string>('role');
  const [correctionValue, setCorrectionValue] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [submittingCorrection, setSubmittingCorrection] = useState<boolean>(false);
  const [correctionsMap, setCorrectionsMap] = useState<Record<string, CorrectionRequest[]>>({});

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api<VerifiedProjectExperience[]>('/users/me/verified-experience');
      const list = Array.isArray(data) ? data : [];
      setExperiences(list);

      // Fetch correction requests for each experience
      for (const exp of list) {
        api<CorrectionRequest[]>(`/verified-experience/${exp.id}/corrections`)
          .then((reqs) => {
            if (Array.isArray(reqs)) {
              setCorrectionsMap((prev) => ({ ...prev, [exp.id]: reqs }));
            }
          })
          .catch(() => {});
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load verified project experience');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, []);

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalExp || !correctionValue.trim() || correctionReason.trim().length < 5) {
      alert('Please fill in the new value and provide a reason of at least 5 characters.');
      return;
    }

    try {
      setSubmittingCorrection(true);
      const res = await api<CorrectionRequest>(`/verified-experience/${modalExp.id}/corrections`, {
        method: 'POST',
        body: JSON.stringify({
          field: correctionField,
          newValue: correctionValue.trim(),
          reason: correctionReason.trim(),
        }),
      });

      setCorrectionsMap((prev) => ({
        ...prev,
        [modalExp.id]: [res, ...(prev[modalExp.id] || [])],
      }));

      setModalExp(null);
      setCorrectionValue('');
      setCorrectionReason('');
      alert('Correction request submitted successfully for peer/owner review.');
    } catch (err: any) {
      alert(err?.message || 'Failed to submit correction request.');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(241, 185, 76, 0.12)', border: '1px solid rgba(241, 185, 76, 0.25)', color: '#F1B94C', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Attested Engineering History
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FCFDFF', margin: '4px 0 8px 0', letterSpacing: '-0.02em' }}>
            Verified Project Experience
          </h1>
          <p style={{ color: 'rgba(252, 253, 255, 0.65)', fontSize: '15px', maxWidth: '680px', margin: 0, lineHeight: 1.5 }}>
            Career-defining collaborative work attested through verified completion. Unlike unverified bullet points on a resume, every entry below is linked directly to raw contribution commits, peer reviews, and public completion credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            to="/certificates"
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(241, 185, 76, 0.35)',
              background: '#1b1b22',
              color: '#F1B94C',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            My Certificates →
          </Link>
          <Link
            to="/me/portfolio"
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid #93B2F8',
              background: '#0A1680',
              color: '#FCFDFF',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Portfolio Editor →
          </Link>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: '220px', borderRadius: '16px', background: '#15151a', border: '1px solid #282836', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && experiences.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '20px', background: '#15151a', border: '1px dashed #282836' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(147, 178, 248, 0.1)', color: '#93B2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 style={{ color: '#FCFDFF', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>
            No Verified Experiences Recorded Yet
          </h3>
          <p style={{ color: 'rgba(252, 253, 255, 0.6)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
            Participate in and complete collaborative projects to have your roles, contributions, and technical skills automatically minted into verified experience.
          </p>
          <Link
            to="/projects"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#0A1680',
              color: '#FCFDFF',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Explore Active Projects
          </Link>
        </div>
      )}

      {/* Experience Cards List */}
      {!loading && experiences.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {experiences.map((exp) => {
            const expCorrections = correctionsMap[exp.id] || [];
            return (
              <div
                key={exp.id}
                style={{
                  borderRadius: '18px',
                  background: '#15151a',
                  border: '1px solid #282836',
                  padding: '24px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#FCFDFF', margin: 0 }}>
                        {exp.title}
                      </h3>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#34D399',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        Verified
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(252, 253, 255, 0.7)', fontSize: '14px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#93B2F8', fontWeight: 600 }}>{exp.role}</span>
                      {exp.duration && (
                        <>
                          <span>•</span>
                          <span>{exp.duration}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Completed {new Date(exp.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setModalExp(exp);
                      setCorrectionValue(exp.role);
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: 'rgba(252, 253, 255, 0.8)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"/>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                    Request Correction
                  </button>
                </div>

                <p style={{ color: 'rgba(252, 253, 255, 0.75)', fontSize: '14px', margin: '0 0 18px 0', lineHeight: 1.5 }}>
                  {exp.description}
                </p>

                {/* Technologies */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                    {exp.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          background: 'rgba(147, 178, 248, 0.08)',
                          border: '1px solid rgba(147, 178, 248, 0.18)',
                          color: '#93B2F8',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Deep Evidence Links Row */}
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: '#1b1b22', border: '1px solid #282836', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Evidence Chain:
                    </span>

                    <Link
                      to={exp.evidenceLinks.contributionsUrl}
                      style={{
                        fontSize: '13px',
                        color: '#93B2F8',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Contribution Ledger
                    </Link>

                    {exp.evidenceLinks.certificateUrl && (
                      <Link
                        to={exp.evidenceLinks.certificateUrl}
                        style={{
                          fontSize: '13px',
                          color: '#F1B94C',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        Certificate ({exp.evidenceLinks.certNumber})
                      </Link>
                    )}

                    {exp.evidenceLinks.repositoryUrl && (
                      <a
                        href={exp.evidenceLinks.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '13px',
                          color: 'rgba(252, 253, 255, 0.75)',
                          textDecoration: 'none',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                        </svg>
                        Repository
                      </a>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)' }}>
                    Attestation Hash: <code>{exp.id.substring(0, 8)}</code>
                  </div>
                </div>

                {/* Correction requests history if present */}
                {expCorrections.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#F1B94C', marginBottom: '8px' }}>
                      Correction Requests ({expCorrections.length}):
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {expCorrections.map((corr) => (
                        <div
                          key={corr.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#181822',
                            border: '1px solid #282836',
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <strong>Requested change on {corr.field}:</strong> "{corr.newValue}"
                            <span style={{ color: 'rgba(252, 253, 255, 0.5)', marginLeft: '6px' }}>
                              ({corr.reason})
                            </span>
                          </div>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background:
                                corr.status === 'approved'
                                  ? 'rgba(16, 185, 129, 0.15)'
                                  : corr.status === 'rejected'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(241, 185, 76, 0.15)',
                              color:
                                corr.status === 'approved'
                                  ? '#34D399'
                                  : corr.status === 'rejected'
                                  ? '#F87171'
                                  : '#F1B94C',
                            }}
                          >
                            {corr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Correction Request Modal */}
      {modalExp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '20px',
              background: '#181822',
              border: '1px solid #282836',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#FCFDFF', fontSize: '18px', fontWeight: 800 }}>
              Request Correction for {modalExp.title}
            </h3>
            <p style={{ margin: '0 0 20px 0', color: 'rgba(252, 253, 255, 0.6)', fontSize: '13px', lineHeight: 1.4 }}>
              Dispute or correct an inaccurate title, role attribution, or technology listing. Requests are reviewed and audited for integrity.
            </p>

            <form onSubmit={handleSubmitCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(252, 253, 255, 0.7)', marginBottom: '6px' }}>
                  Field to Correct
                </label>
                <select
                  value={correctionField}
                  onChange={(e) => setCorrectionField(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#131318',
                    border: '1px solid #282836',
                    color: '#FCFDFF',
                    fontSize: '13px',
                  }}
                >
                  <option value="role">Attested Role</option>
                  <option value="title">Project Title</option>
                  <option value="technologies">Technologies</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(252, 253, 255, 0.7)', marginBottom: '6px' }}>
                  Proposed New Value
                </label>
                <input
                  type="text"
                  value={correctionValue}
                  onChange={(e) => setCorrectionValue(e.target.value)}
                  placeholder="e.g. Principal Systems Architect"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#131318',
                    border: '1px solid #282836',
                    color: '#FCFDFF',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(252, 253, 255, 0.7)', marginBottom: '6px' }}>
                  Reason & Evidence
                </label>
                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="Explain why this correction is warranted and reference the relevant pull requests or milestone tasks..."
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: '#131318',
                    border: '1px solid #282836',
                    color: '#FCFDFF',
                    fontSize: '13px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setModalExp(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FCFDFF',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: '#0A1680',
                    border: '1px solid #93B2F8',
                    color: '#FCFDFF',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {submittingCorrection ? 'Submitting...' : 'Submit Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
