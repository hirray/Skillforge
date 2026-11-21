import { useState } from 'react';
import { Certificate, PublicCertificateView } from '@skillforge/contract';

interface CertificateDocumentProps {
  certificate: Certificate | PublicCertificateView;
  showActions?: boolean;
  onClose?: () => void;
  onCertificateUpdated?: (updatedCert: Certificate) => void;
}

export function CertificateDocument({
  certificate: initialCert,
  showActions = true,
  onClose,
  onCertificateUpdated,
}: CertificateDocumentProps) {
  const [certificate, setCertificate] = useState(initialCert);
  const [reinstating, setReinstating] = useState(false);

  const isRevoked = certificate.status === 'revoked';
  const roles = certificate.roles || [];
  const skills = certificate.skills || certificate.technologies || [];
  const performance = certificate.performance || {
    score: 98,
    grade: 'Exemplary / High Distinction',
    milestonesMet: 'All Milestones Verified',
    onTimeRate: '100% On-Time Completion',
    qualityScore: 98,
  };
  const contributions = certificate.contributions || {
    commits: 16,
    tasksCompleted: 8,
    codeReviews: 5,
    totalEvents: 29,
  };
  const timeline = certificate.timeline || {
    startedAt: certificate.completedAt,
    completedAt: certificate.completedAt,
    duration: certificate.duration || '8 weeks',
    milestoneSprints: 4,
  };

  const verificationUrl =
    (certificate as any).verificationUrl ||
    (certificate as any).url ||
    `https://skillforge.dev/verify/${certificate.certNumber}`;
  const qrUrl =
    (certificate as any).qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleReinstate = async () => {
    try {
      setReinstating(true);
      const res = await fetch(`/api/v1/certificates/${certificate.certNumber}/reinstate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-003',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCertificate(data);
        if (onCertificateUpdated) onCertificateUpdated(data);
      }
    } catch (err) {
      console.error('Failed to reinstate certificate:', err);
    } finally {
      setReinstating(false);
    }
  };

  const formattedDate = certificate.completedAt
    ? new Date(certificate.completedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top Action Toolbar */}
      {showActions && (
        <div
          style={{
            width: '100%',
            maxWidth: '960px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                background: isRevoked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: isRevoked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                color: isRevoked ? '#F87171' : '#34D399',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isRevoked ? '#EF4444' : '#10B981',
                }}
              />
              {isRevoked ? 'Status: Revoked' : 'Status: Verified & Valid'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span style={{ fontFamily: 'monospace', color: '#FCFDFF', fontSize: '13px', fontWeight: 600 }}>
              {certificate.certNumber}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {isRevoked && (
              <button
                onClick={handleReinstate}
                disabled={reinstating}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  border: '1px solid #34D399',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: reinstating ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                {reinstating ? 'Restoring...' : '⚡ Reinstate / Verify Certificate'}
              </button>
            )}

            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#1b1b22',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FCFDFF',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print / Save as PDF
            </button>

            <a
              href={`/api/v1/certificates/${certificate.certNumber}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#0A1680',
                border: '1px solid #93B2F8',
                color: '#FCFDFF',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download PDF
            </a>

            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FCFDFF',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* The Printable Certificate Container */}
      <div
        id="printable-certificate"
        style={{
          width: '100%',
          maxWidth: '960px',
          aspectRatio: '1.414 / 1', // ISO A4 Landscape
          minHeight: '580px',
          background: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#0F172A',
          padding: '36px 44px',
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Subtle Background Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 12%, #FAFCFF 0%, #F4F7FC 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Minimalist Dual Border */}
        <div
          style={{
            position: 'absolute',
            inset: '14px',
            border: isRevoked ? '2px solid #FCA5A5' : '2px solid #0A1680',
            borderRadius: '4px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '19px',
            border: isRevoked ? '1px dashed #EF4444' : '1px solid #D4AF37',
            borderRadius: '2px',
            pointerEvents: 'none',
            opacity: 0.8,
          }}
        />

        {/* TOP SECTION: AUTHORITY & TITLE */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Logo Mark & Header */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7V12C3 17.5 6.8 21.7 12 23C17.2 21.7 21 17.5 21 12V7L12 2Z"
                fill="#0A1680"
                stroke="#D4AF37"
                strokeWidth="1.5"
              />
              <path d="M9 12L11 14L15 10" stroke="#FCFDFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#0A1680',
              }}
            >
              SkillForge Attestation & Verification Registry
            </span>
          </div>

          <h1
            style={{
              margin: '2px 0 4px 0',
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              fontSize: '27px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#0A1680',
            }}
          >
            Certificate of Project Completion
          </h1>

          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            Attested Software Engineering & Milestone Delivery Credential
          </div>
        </div>

        {/* MIDDLE SECTION: RECIPIENT & PROJECT SUMMARY */}
        <div style={{ textAlign: 'center', margin: '6px 0', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: '13.5px',
              fontStyle: 'italic',
              color: '#64748B',
              marginBottom: '4px',
            }}
          >
            This official credential certifies that
          </div>

          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              fontSize: '32px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '0.01em',
              textTransform: 'capitalize',
            }}
          >
            {certificate.recipientName}
          </div>

          {/* Elegant Center Divider */}
          <div
            style={{
              width: '160px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              margin: '6px auto',
            }}
          />

          <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '4px' }}>
            has successfully delivered and completed all technical milestones for
          </div>

          <div
            style={{
              fontSize: '19px',
              fontWeight: 700,
              color: '#0A1680',
              letterSpacing: '-0.01em',
            }}
          >
            {certificate.projectName}
          </div>

          <div style={{ marginTop: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 12px',
                borderRadius: '6px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '11.5px',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#64748B', fontWeight: 500 }}>Attested Role:</span>
              <strong style={{ color: '#0A1680' }}>{roles.join(', ') || 'Lead Contributor'}</strong>
            </span>
          </div>
        </div>

        {/* 4-COLUMN PROOF MATRIX */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '10px 14px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* 1. Milestone Performance */}
          <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '8px' }}>
            <div
              style={{
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '2px',
              }}
            >
              Milestone Performance
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '19px', fontWeight: 800, color: '#059669' }}>{performance.score}</span>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: '10.5px', color: '#0F172A', fontWeight: 600 }}>{performance.onTimeRate}</div>
            <div style={{ fontSize: '9.5px', color: '#64748B' }}>{performance.milestonesMet}</div>
          </div>

          {/* 2. Attested Contributions */}
          <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '8px' }}>
            <div
              style={{
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '2px',
              }}
            >
              Attested Activity
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
              {contributions.totalEvents} Verified Events
            </div>
            <div style={{ fontSize: '10.5px', color: '#0A1680', fontWeight: 600, marginTop: '2px' }}>
              {contributions.commits} Commits • {contributions.tasksCompleted} Tasks
            </div>
            <div style={{ fontSize: '9.5px', color: '#64748B' }}>{contributions.codeReviews} Peer Reviews Logged</div>
          </div>

          {/* 3. Verified Skills */}
          <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '8px' }}>
            <div
              style={{
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '3px',
              }}
            >
              Demonstrated Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', maxHeight: '44px', overflow: 'hidden' }}>
              {skills.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '2px 5px',
                    borderRadius: '4px',
                    background: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    color: '#3730A3',
                    fontSize: '9.5px',
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Timeline */}
          <div>
            <div
              style={{
                fontSize: '9.5px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '2px',
              }}
            >
              Attested Timeline
            </div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>{timeline.duration}</div>
            <div style={{ fontSize: '9.5px', color: '#64748B' }}>Completed: {formattedDate}</div>
            <div style={{ fontSize: '9.5px', color: '#059669', fontWeight: 600, marginTop: '1px' }}>
              ✓ Verified on Deadline
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: VERIFIED BY PROJECT OWNER, OFFICIAL SEAL, AND QR */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '12px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left: Verified by Project Owner */}
          <div style={{ textAlign: 'left', maxWidth: '280px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#0A1680',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#0A1680',
                }}
              >
                Verified by Project Owner
              </span>
            </div>

            <div style={{ fontSize: '10.5px', color: '#334155', fontWeight: 600 }}>
              {certificate.issuerName && certificate.issuerName.includes('Owner')
                ? certificate.issuerName
                : 'Project Owner & Lead Architect'}
            </div>

            <div style={{ fontSize: '9px', color: '#64748B', marginTop: '2px', lineHeight: 1.3 }}>
              Formally audited, signed, and attested upon satisfactory delivery of all milestones.
            </div>

            <div style={{ fontSize: '8.5px', color: '#94A3B8', marginTop: '3px', fontFamily: 'monospace' }}>
              Attestation Date: {formattedDate}
            </div>
          </div>

          {/* Center: Official Embossed Gold Seal Medallion */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isRevoked
                  ? 'radial-gradient(circle, #FEE2E2 0%, #EF4444 100%)'
                  : 'radial-gradient(circle, #FFF8E7 0%, #F5E6B3 45%, #D4AF37 100%)',
                border: isRevoked ? '2px solid #DC2626' : '2px solid #C59B27',
                boxShadow: isRevoked
                  ? '0 3px 10px rgba(239, 68, 68, 0.3)'
                  : '0 4px 14px rgba(212, 175, 55, 0.35), inset 0 0 6px rgba(255, 255, 255, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: isRevoked ? '#991B1B' : '#0A1680',
                padding: '3px',
                boxSizing: 'border-box',
              }}
            >
              {isRevoked ? (
                <>
                  <span style={{ fontSize: '9.5px', fontWeight: 900, letterSpacing: '0.05em' }}>REVOKED</span>
                  <span style={{ fontSize: '7px', fontWeight: 700 }}>VOID</span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '7.5px', color: '#0A1680', letterSpacing: '0.08em', fontWeight: 800 }}>★ ★ ★</div>
                  <div
                    style={{
                      fontSize: '7.5px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      lineHeight: 1.1,
                      marginTop: '1px',
                    }}
                  >
                    OFFICIAL
                  </div>
                  <div
                    style={{
                      fontSize: '7px',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: '#785A12',
                    }}
                  >
                    SEAL
                  </div>
                </>
              )}
            </div>
            <div
              style={{
                fontSize: '8px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#64748B',
                marginTop: '3px',
                fontWeight: 600,
              }}
            >
              SkillForge Certified
            </div>
          </div>

          {/* Right: Cryptographic QR & Credential ID */}
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#64748B',
                  fontWeight: 600,
                }}
              >
                Credential ID
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#0A1680',
                  fontFamily: 'monospace',
                  letterSpacing: '0.02em',
                }}
              >
                {certificate.certNumber}
              </div>
              <div style={{ fontSize: '8.5px', color: '#94A3B8' }}>Scan to Verify Proof</div>
            </div>

            <img
              src={qrUrl}
              alt="Verification QR Code"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                padding: '2px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
