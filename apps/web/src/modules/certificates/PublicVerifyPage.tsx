import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicCertificateView } from '@skillforge/contract';
import { CertificateDocument } from './CertificateDocument';
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

        {/* Certificate Found: Authentic Certificate Presentation */}
        {!loading && cert && (
          <CertificateDocument certificate={cert} showActions={true} />
        )}
      </div>
    </div>
  );
}
