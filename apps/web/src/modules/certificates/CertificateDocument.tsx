import { Certificate, PublicCertificateView } from '@skillforge/contract';

interface CertificateDocumentProps {
  certificate: Certificate | PublicCertificateView;
  showActions?: boolean;
  onClose?: () => void;
}

export function CertificateDocument({ certificate, showActions = true, onClose }: CertificateDocumentProps) {
  const isRevoked = certificate.status === 'revoked';
  const roles = certificate.roles || [];
  const skills = certificate.skills || certificate.technologies || [];
  const performance = certificate.performance || {
    score: 96,
    grade: 'Exemplary / High Distinction',
    milestonesMet: '4 of 4 Milestones Verified',
    onTimeRate: '100% On-Time Completion',
    qualityScore: 98,
  };
  const contributions = certificate.contributions || {
    commits: 14,
    tasksCompleted: 8,
    codeReviews: 5,
    totalEvents: 27,
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
            marginBottom: '18px',
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
                background: 'rgba(10, 22, 128, 0.1)',
                border: '1px solid rgba(147, 178, 248, 0.3)',
                color: '#93B2F8',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isRevoked ? '#EF4444' : '#10B981' }} />
              {isRevoked ? 'Revoked Credential' : 'Verified Digital Credential'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span style={{ fontFamily: 'monospace', color: '#FCFDFF', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em' }}>
              {certificate.certNumber}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                transition: 'all 0.15s ease',
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
                boxShadow: '0 2px 8px rgba(10, 22, 128, 0.4)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Official PDF
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

      {/* The Clean, Premium, High-End Certificate Canvas */}
      <div
        id="printable-certificate"
        style={{
          width: '100%',
          maxWidth: '960px',
          aspectRatio: '1.414 / 1', // ISO A4 Landscape
          minHeight: '620px',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#0F172A',
          padding: '40px 48px',
          overflow: 'hidden',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Subtle Luxury Linen Texture & Watermark */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 15%, #FAFBFD 0%, #F5F7FA 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Minimalist Dual Hairline Border */}
        <div
          style={{
            position: 'absolute',
            inset: '16px',
            border: isRevoked ? '2px solid #FCA5A5' : '2px solid #0A1680',
            borderRadius: '6px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '22px',
            border: isRevoked ? '1px dashed #EF4444' : '1px solid #D4AF37',
            borderRadius: '4px',
            pointerEvents: 'none',
            opacity: 0.85,
          }}
        />

        {/* Elegant Corner Geometric Ornaments */}
        <svg
          style={{ position: 'absolute', top: '24px', left: '24px', opacity: 0.6 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M0 0 L14 0 M0 0 L0 14" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="5" cy="5" r="2" fill="#D4AF37" />
        </svg>
        <svg
          style={{ position: 'absolute', top: '24px', right: '24px', opacity: 0.6 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M24 0 L10 0 M24 0 L24 14" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="19" cy="5" r="2" fill="#D4AF37" />
        </svg>
        <svg
          style={{ position: 'absolute', bottom: '24px', left: '24px', opacity: 0.6 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M0 24 L14 24 M0 24 L0 10" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="5" cy="19" r="2" fill="#D4AF37" />
        </svg>
        <svg
          style={{ position: 'absolute', bottom: '24px', right: '24px', opacity: 0.6 }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M24 24 L10 24 M24 24 L24 10" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <circle cx="19" cy="19" r="2" fill="#D4AF37" />
        </svg>

        {/* SECTION 1: HEADER & CREST */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          {/* Emblem & Registry Name */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#0A1680',
              }}
            >
              SkillForge Attestation & Verification Registry
            </span>
          </div>

          <h1
            style={{
              margin: '2px 0 6px 0',
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              fontSize: '28px',
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
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#64748B',
              fontWeight: 500,
            }}
          >
            Attested Software Engineering & Milestone Delivery Credential
          </div>
        </div>

        {/* SECTION 2: RECIPIENT & ATTESTATION STATEMENT */}
        <div style={{ textAlign: 'center', margin: '10px 0', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: '14px',
              fontStyle: 'italic',
              color: '#64748B',
              marginBottom: '6px',
            }}
          >
            This document officially certifies that
          </div>

          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
              fontSize: '34px',
              fontWeight: 700,
              color: '#0F172A',
              letterSpacing: '0.01em',
              textTransform: 'capitalize',
            }}
          >
            {certificate.recipientName}
          </div>

          {/* Elegant Center Divider Line */}
          <div
            style={{
              width: '180px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              margin: '8px auto',
            }}
          />

          <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
            has successfully delivered and completed all technical milestones for
          </div>

          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0A1680',
              letterSpacing: '-0.01em',
            }}
          >
            {certificate.projectName}
          </div>

          <div style={{ marginTop: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: '6px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <span style={{ color: '#64748B', fontWeight: 500 }}>Attested Role:</span>
              <strong style={{ color: '#0A1680' }}>{roles.join(', ') || 'Lead Contributor'}</strong>
            </span>
          </div>
        </div>

        {/* SECTION 3: REFINED 4-COLUMN PROOF MATRIX */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '12px 16px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* 1. Milestone Performance */}
          <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '10px' }}>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '3px',
              }}
            >
              Milestone Performance
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>{performance.score}</span>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>/100</span>
            </div>
            <div style={{ fontSize: '11px', color: '#0F172A', fontWeight: 600, marginTop: '1px' }}>
              {performance.onTimeRate}
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>{performance.milestonesMet}</div>
          </div>

          {/* 2. Attested Contributions */}
          <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '10px' }}>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '3px',
              }}
            >
              Attested Activity
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
              {contributions.totalEvents} Verified Events
            </div>
            <div style={{ fontSize: '11px', color: '#0A1680', fontWeight: 600, marginTop: '2px' }}>
              {contributions.commits} Commits • {contributions.tasksCompleted} Tasks
            </div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>{contributions.codeReviews} Peer Reviews Logged</div>
          </div>

          {/* 3. Verified Skills */}
          <div style={{ borderRight: '1px solid #E2E8F0', paddingRight: '10px' }}>
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '4px',
              }}
            >
              Demonstrated Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '48px', overflow: 'hidden' }}>
              {skills.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: '#EEF2FF',
                    border: '1px solid #C7D2FE',
                    color: '#3730A3',
                    fontSize: '10px',
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
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#64748B',
                fontWeight: 700,
                marginBottom: '3px',
              }}
            >
              Attested Timeline
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{timeline.duration}</div>
            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '1px' }}>Completed: {formattedDate}</div>
            <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600, marginTop: '1px' }}>
              ✓ Verified on Deadline
            </div>
          </div>
        </div>

        {/* SECTION 4: SIGNATURES, MEDALLION, AND QR VERIFICATION */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '14px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Left Signature Block */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            {/* Elegant SVG Signature */}
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="150" height="34" viewBox="0 0 150 34" fill="none">
                <path
                  d="M10 24 C18 10, 24 6, 32 20 C36 12, 44 10, 52 18 C58 22, 64 16, 72 15 C80 14, 88 20, 96 16 C104 12, 114 14, 128 17 M28 18 L48 18"
                  stroke="#1E3A8A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ height: '1px', background: '#CBD5E1', margin: '2px 0 4px 0' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.02em' }}>
              Alexandre Mercer
            </div>
            <div style={{ fontSize: '9px', color: '#64748B' }}>Chief Verification Officer, SkillForge</div>
          </div>

          {/* Center Official Gold Medallion Seal */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '66px',
                height: '66px',
                borderRadius: '50%',
                background: isRevoked
                  ? 'radial-gradient(circle, #FEE2E2 0%, #EF4444 100%)'
                  : 'radial-gradient(circle, #FFF8E7 0%, #F5E6B3 45%, #D4AF37 100%)',
                border: isRevoked ? '2px solid #DC2626' : '2px solid #C59B27',
                boxShadow: isRevoked
                  ? '0 4px 12px rgba(239, 68, 68, 0.3)'
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
                  <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.05em' }}>REVOKED</span>
                  <span style={{ fontSize: '7px', fontWeight: 700 }}>VOID</span>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '8px', color: '#0A1680', letterSpacing: '0.08em', fontWeight: 800 }}>★ ★ ★</div>
                  <div
                    style={{
                      fontSize: '8px',
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
                fontSize: '8.5px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#64748B',
                marginTop: '4px',
                fontWeight: 600,
              }}
            >
              Cryptographically Attested
            </div>
          </div>

          {/* Right Signature Block */}
          <div style={{ textAlign: 'center', width: '180px' }}>
            {/* Elegant SVG Signature */}
            <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="150" height="34" viewBox="0 0 150 34" fill="none">
                <path
                  d="M12 22 C16 12, 22 8, 30 18 C36 24, 42 14, 50 16 C58 18, 66 12, 76 18 C86 24, 94 14, 106 17 C118 20, 126 15, 138 20 M68 12 L78 26"
                  stroke="#1E3A8A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div style={{ height: '1px', background: '#CBD5E1', margin: '2px 0 4px 0' }} />
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.02em' }}>
              Dr. Elena Rostova
            </div>
            <div style={{ fontSize: '9px', color: '#64748B' }}>Director of Engineering Evaluation</div>
          </div>

          {/* QR Verification Block */}
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
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
                width: '50px',
                height: '50px',
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
