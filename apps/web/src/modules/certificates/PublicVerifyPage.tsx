import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicCertificateView } from '@skillforge/contract';
import '../ai/studio.css';

export function PublicVerifyPage() {
  const { certId: paramCertId } = useParams<{ certId: string }>();
  const [queryId, setQueryId] = useState<string>(paramCertId || '');
  const [data, setData] = useState<{
    valid: boolean;
    status: string;
    certificate: PublicCertificateView | null;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const performVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/verify/${encodeURIComponent(idToVerify.trim())}`);
      const json = await res.json();
      if (!res.ok && res.status === 404) {
        setData({ valid: false, status: 'not_found', certificate: null });
        return;
      }
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Verification service temporarily unreachable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (paramCertId) {
      performVerification(paramCertId);
    } else {
      setLoading(false);
    }
  }, [paramCertId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryId) performVerification(queryId);
  };

  const cert = data?.certificate;
  const isRevoked = data?.status === 'revoked' || cert?.status === 'revoked';

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e13', color: '#FCFDFF', padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#FCFDFF', marginBottom: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0A1680', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1B94C', fontWeight: 800, fontSize: '15px' }}>
            SF
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            skillforge<span style={{ color: '#F1B94C' }}>.</span>
          </span>
        </Link>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#93B2F8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Public Credential Verification Service
        </div>
      </div>

      {/* Main Verification Card */}
      <div style={{ width: '100%', maxWidth: '720px' }}>
        {/* Verification Lookup Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Enter Credential ID (e.g. SF-2026-00001)"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#15151a',
              border: '1px solid #282836',
              color: '#FCFDFF',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              background: '#0A1680',
              border: '1px solid #93B2F8',
              color: '#FCFDFF',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Verify Credential
          </button>
        </form>

        {/* Loading state */}
        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', borderRadius: '18px', background: '#15151a', border: '1px solid #282836' }}>
            <div style={{ fontSize: '15px', color: '#93B2F8', fontWeight: 600 }}>Querying immutable credential ledger...</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Not Found */}
        {!loading && data?.status === 'not_found' && (
          <div style={{ padding: '40px 24px', textAlign: 'center', borderRadius: '18px', background: '#181822', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#FCFDFF' }}>
              Credential Not Found
            </h3>
            <p style={{ margin: 0, color: 'rgba(252, 253, 255, 0.6)', fontSize: '14px' }}>
              No attested project certificate exists with the identifier <code>{queryId}</code>. Please confirm the exact certificate ID and retry.
            </p>
          </div>
        )}

        {/* Certificate Found: Valid or Revoked */}
        {!loading && cert && (
          <div
            style={{
              borderRadius: '22px',
              background: 'linear-gradient(155deg, #181824, #121217)',
              border: isRevoked ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(241, 185, 76, 0.45)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Verification Status Header */}
            <div
              style={{
                padding: '20px 28px',
                background: isRevoked
                  ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.2), transparent)'
                  : 'linear-gradient(90deg, rgba(16, 185, 129, 0.18), transparent)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: isRevoked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: isRevoked ? '#F87171' : '#34D399',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isRevoked ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: isRevoked ? '#F87171' : '#34D399' }}>
                    {isRevoked ? 'CERTIFICATE REVOKED' : 'OFFICIALLY VERIFIED CREDENTIAL'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.6)' }}>
                    {isRevoked ? 'This credential has been permanently revoked by authority.' : 'Attested by SkillForge cryptographic ledger.'}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.4)', fontWeight: 600 }}>
                  Credential ID
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '14px', color: '#FCFDFF' }}>
                  {cert.certNumber}
                </div>
              </div>
            </div>

            {/* Certificate Details Body */}
            <div style={{ padding: '32px 28px' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#F1B94C', fontWeight: 700, marginBottom: '6px' }}>
                Recipient
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#FCFDFF', marginBottom: '24px' }}>
                {cert.recipientName}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                    Project Delivered
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#93B2F8' }}>
                    {cert.projectName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                    Attested Role(s)
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#FCFDFF' }}>
                    {cert.roles.join(', ')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                    Completion Date
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#FCFDFF' }}>
                    {new Date(cert.completedAt).toLocaleDateString()}
                  </div>
                </div>

                {cert.duration && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Attested Duration
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#FCFDFF' }}>
                      {cert.duration}
                    </div>
                  </div>
                )}
              </div>

              {/* Technologies if visible */}
              {cert.technologies && cert.technologies.length > 0 && (
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.45)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
                    Verified Technical Capabilities
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {cert.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(147, 178, 248, 0.1)',
                          border: '1px solid rgba(147, 178, 248, 0.25)',
                          color: '#FCFDFF',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Revocation notice */}
              {isRevoked && (
                <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#FCA5A5', marginBottom: '24px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Official Revocation Record:</div>
                  <div style={{ fontSize: '14px' }}>{cert.revokedReason || 'Revoked by administration.'}</div>
                  {cert.revokedAt && (
                    <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.5)', marginTop: '4px' }}>
                      Revoked on {new Date(cert.revokedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Download / Action Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: 'rgba(252, 253, 255, 0.5)' }}>
                  Issuer: <strong>{cert.issuerName}</strong>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href={`/api/v1/certificates/${cert.certNumber}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    style={{
                      padding: '10px 18px',
                      borderRadius: '10px',
                      background: '#0A1680',
                      border: '1px solid #93B2F8',
                      color: '#FCFDFF',
                      fontWeight: 600,
                      fontSize: '13px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Official PDF Credential
                  </a>

                  <Link
                    to="/projects"
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      background: '#1b1b22',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#FCFDFF',
                      fontWeight: 600,
                      fontSize: '13px',
                      textDecoration: 'none',
                    }}
                  >
                    Return to Workspace
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
