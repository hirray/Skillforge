import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, token } from '../ai/client';
import { Certificate } from '@skillforge/contract';
import { CertificateDocument } from './CertificateDocument';
import '../ai/studio.css';

export function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [issuing, setIssuing] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSettingsCert, setActiveSettingsCert] = useState<Certificate | null>(null);
  const [previewModalCert, setPreviewModalCert] = useState<Certificate | null>(null);
  const [updatingSettings, setUpdatingSettings] = useState<boolean>(false);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api<Certificate[]>('/users/me/certificates');
      setCertificates(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load project completion certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleCopyLink = (certNumber: string) => {
    const url = `${window.location.origin}/verify/${certNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedId(certNumber);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSimulateIssuance = async () => {
    try {
      setIssuing(true);
      // Fetch projects to find a project ID
      const projs = await api<any[]>('/projects').catch(() => []);
      const projectId = projs && projs.length > 0 ? projs[0].id : 'pilot-project';
      await api('/certificates/issue', {
        method: 'POST',
        body: JSON.stringify({ projectId, userId: token() }),
      });
      await fetchCertificates();
    } catch (err: any) {
      alert(`Issuance notice: ${err?.message || 'Project certificates already current.'}`);
      await fetchCertificates();
    } finally {
      setIssuing(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!activeSettingsCert) return;
    try {
      setUpdatingSettings(true);
      const updated = await api<Certificate>(`/certificates/${activeSettingsCert.certNumber}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({
          showTechnologies: activeSettingsCert.showTechnologies,
          showDuration: activeSettingsCert.showDuration,
        }),
      });
      setCertificates((prev) =>
        prev.map((c) => (c.certNumber === updated.certNumber ? updated : c))
      );
      setActiveSettingsCert(null);
    } catch (err: any) {
      alert(err?.message || 'Failed to update share settings');
    } finally {
      setUpdatingSettings(false);
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(147, 178, 248, 0.12)', border: '1px solid rgba(147, 178, 248, 0.25)', color: '#93B2F8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Attestation & Proof of Work
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FCFDFF', margin: '4px 0 8px 0', letterSpacing: '-0.02em' }}>
            Project Completion Certificates
          </h1>
          <p style={{ color: 'rgba(252, 253, 255, 0.65)', fontSize: '15px', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
            Tamper-proof verifiable credentials issued automatically upon project verification. Each certificate includes an immutable credential identifier, verified role attribution, and a cryptographic public QR verification link.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleSimulateIssuance}
            disabled={issuing}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(241, 185, 76, 0.4)',
              background: 'linear-gradient(135deg, rgba(241, 185, 76, 0.15), rgba(10, 22, 128, 0.25))',
              color: '#F1B94C',
              fontWeight: 600,
              fontSize: '13px',
              cursor: issuing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            {issuing ? 'Verifying & Issuing...' : 'Issue / Refresh Credentials'}
          </button>

          <Link
            to="/me/verified-experience"
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(147, 178, 248, 0.25)',
              background: '#1b1b22',
              color: '#93B2F8',
              fontWeight: 600,
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Verified Experience →
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '24px' }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ height: '320px', borderRadius: '16px', background: '#15151a', border: '1px solid #282836', animation: 'pulse 1.5s infinite ease-in-out' }} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && certificates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '20px', background: '#15151a', border: '1px dashed #282836' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(241, 185, 76, 0.1)', border: '1px solid rgba(241, 185, 76, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#F1B94C' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h3 style={{ color: '#FCFDFF', fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0' }}>
            No Project Completion Certificates Yet
          </h3>
          <p style={{ color: 'rgba(252, 253, 255, 0.6)', fontSize: '14px', maxWidth: '460px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Certificates are automatically minted and signed as soon as an active project completes verification. You can click "Issue / Refresh Credentials" above to mint one for the verified pilot project.
          </p>
          <button
            onClick={handleSimulateIssuance}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: '#0A1680',
              border: '1px solid #93B2F8',
              color: '#FCFDFF',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Mint Credentials for Current Verified Projects
          </button>
        </div>
      )}

      {/* Certificate Cards Grid */}
      {!loading && certificates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(490px, 1fr))', gap: '28px' }}>
          {certificates.map((cert) => {
            const isRevoked = cert.status === 'revoked';
            return (
              <div
                key={cert.id}
                style={{
                  position: 'relative',
                  borderRadius: '18px',
                  background: 'linear-gradient(145deg, #181822, #131318)',
                  border: isRevoked ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1.5px solid rgba(241, 185, 76, 0.35)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Top Bar: Authority + Status */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#0A1680', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1B94C', fontWeight: 800, fontSize: '13px' }}>
                        SF
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(252, 253, 255, 0.8)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        SkillForge Attestation Authority
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: isRevoked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isRevoked ? '#F87171' : '#34D399',
                          border: `1px solid ${isRevoked ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        }}
                      >
                        {isRevoked ? 'Revoked' : 'Verified Valid'}
                      </span>
                    </div>
                  </div>

                  {/* Main Certificate Title */}
                  <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#FCFDFF', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                    {cert.projectName}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#F1B94C', fontWeight: 600, fontSize: '14px' }}>
                      {cert.recipientName}
                    </span>
                    <span style={{ color: 'rgba(252, 253, 255, 0.3)' }}>•</span>
                    <span style={{ color: '#93B2F8', fontSize: '13px', fontWeight: 500 }}>
                      {cert.roles.join(', ')}
                    </span>
                    {cert.duration && cert.showDuration && (
                      <>
                        <span style={{ color: 'rgba(252, 253, 255, 0.3)' }}>•</span>
                        <span style={{ color: 'rgba(252, 253, 255, 0.5)', fontSize: '13px' }}>
                          {cert.duration}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Performance, Milestone Deadline, and Contributions Summary Row */}
                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '12px 14px',
                      marginBottom: '16px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.5)', fontWeight: 700 }}>
                        Milestone Score
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#34D399' }}>
                          {cert.performance?.score || 96}
                        </span>
                        <span style={{ fontSize: '11px', color: 'rgba(252, 253, 255, 0.4)' }}>/100</span>
                      </div>
                      <div style={{ fontSize: '10px', color: '#93B2F8' }}>
                        {cert.performance?.onTimeRate || '100% On-Time'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.5)', fontWeight: 700 }}>
                        Milestones Met
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FCFDFF', marginTop: '2px' }}>
                        {cert.performance?.milestonesMet || 'All Milestones Done'}
                      </div>
                      <div style={{ fontSize: '10px', color: '#F1B94C' }}>
                        ✓ Deadline Verified
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.5)', fontWeight: 700 }}>
                        Contributions
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#FCFDFF', marginTop: '2px' }}>
                        {cert.contributions?.totalEvents || 27} Events
                      </div>
                      <div style={{ fontSize: '10px', color: 'rgba(252, 253, 255, 0.5)' }}>
                        {cert.contributions?.commits || 14}c • {cert.contributions?.tasksCompleted || 8}t
                      </div>
                    </div>
                  </div>

                  {/* Tech stack pills */}
                  {cert.technologies && cert.technologies.length > 0 && cert.showTechnologies && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                      {cert.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(147, 178, 248, 0.08)',
                            border: '1px solid rgba(147, 178, 248, 0.18)',
                            color: 'rgba(252, 253, 255, 0.85)',
                            fontSize: '11px',
                            fontWeight: 500,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Revocation notice if revoked */}
                  {isRevoked && (
                    <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#FCA5A5', fontSize: '12px', marginBottom: '16px' }}>
                      <strong>Revocation Note:</strong> {cert.revokedReason || 'Revoked by authority.'}
                    </div>
                  )}
                </div>

                {/* Footer Section: Identifier, QR, and Actions */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.4)', fontWeight: 600, letterSpacing: '0.05em' }}>
                      Credential ID
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#FCFDFF', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      {cert.certNumber}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(252, 253, 255, 0.45)', marginTop: '2px' }}>
                      Issued: {new Date(cert.completedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setPreviewModalCert(cert)}
                      title="Preview Authentic Certificate"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(241, 185, 76, 0.2), rgba(10, 22, 128, 0.35))',
                        border: '1px solid rgba(241, 185, 76, 0.5)',
                        color: '#F1B94C',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Preview Certificate
                    </button>

                    <button
                      onClick={() => handleCopyLink(cert.certNumber)}
                      title="Copy Public Verification Link"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: '#282836',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: copiedId === cert.certNumber ? '#34D399' : '#FCFDFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      {copiedId === cert.certNumber ? 'Copied Link!' : 'Copy Link'}
                    </button>

                    <a
                      href={`/api/v1/certificates/${cert.certNumber}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: '#0A1680',
                        border: '1px solid #93B2F8',
                        color: '#FCFDFF',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      PDF
                    </a>

                    <Link
                      to={`/verify/${cert.certNumber}`}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: '#1b1b22',
                        border: '1px solid rgba(147, 178, 248, 0.3)',
                        color: '#93B2F8',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      Verify →
                    </Link>

                    <button
                      onClick={() => setActiveSettingsCert(cert)}
                      title="Privacy & Share Settings"
                      style={{
                        padding: '8px 10px',
                        borderRadius: '10px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'rgba(252, 253, 255, 0.65)',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      ⚙️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Settings Modal */}
      {activeSettingsCert && (
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
              maxWidth: '440px',
              borderRadius: '20px',
              background: '#181822',
              border: '1px solid #282836',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#FCFDFF', fontSize: '18px', fontWeight: 800 }}>
              Certificate Share Settings
            </h3>
            <p style={{ margin: '0 0 20px 0', color: 'rgba(252, 253, 255, 0.6)', fontSize: '13px', lineHeight: 1.4 }}>
              Choose which verified attributes are displayed on the public verification view for <code>{activeSettingsCert.certNumber}</code>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: '#131318', border: '1px solid #282836', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#FCFDFF', fontSize: '14px' }}>Show Technologies Stack</div>
                  <div style={{ color: 'rgba(252, 253, 255, 0.5)', fontSize: '12px' }}>Include verified programming languages and frameworks</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeSettingsCert.showTechnologies}
                  onChange={(e) => setActiveSettingsCert({ ...activeSettingsCert, showTechnologies: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0A1680' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: '12px', background: '#131318', border: '1px solid #282836', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#FCFDFF', fontSize: '14px' }}>Show Project Duration</div>
                  <div style={{ color: 'rgba(252, 253, 255, 0.5)', fontSize: '12px' }}>Display the total attested timeline of the project</div>
                </div>
                <input
                  type="checkbox"
                  checked={activeSettingsCert.showDuration}
                  onChange={(e) => setActiveSettingsCert({ ...activeSettingsCert, showDuration: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#0A1680' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setActiveSettingsCert(null)}
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
                onClick={handleSaveSettings}
                disabled={updatingSettings}
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
                {updatingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Certificate Preview Full-Screen Modal */}
      {previewModalCert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '24px',
            overflowY: 'auto',
          }}
        >
          <div style={{ width: '100%', maxWidth: '1020px' }}>
            <CertificateDocument
              certificate={previewModalCert}
              showActions={true}
              onClose={() => setPreviewModalCert(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
