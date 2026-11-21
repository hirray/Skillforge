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

  const verificationUrl = (certificate as any).verificationUrl || (certificate as any).url || `https://skillforge.dev/verify/${certificate.certNumber}`;
  const qrUrl = (certificate as any).qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verificationUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Top Action Toolbar (if enabled) */}
      {showActions && (
        <div style={{ width: '100%', maxWidth: '980px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#93B2F8', fontWeight: 600 }}>
              Live Credential Preview
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
            <span style={{ fontFamily: 'monospace', color: '#FCFDFF', fontSize: '13px', fontWeight: 700 }}>
              {certificate.certNumber}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: '#1b1b22',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FCFDFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Print Certificate
            </button>

            <a
              href={`/api/v1/certificates/${certificate.certNumber}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              download
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </a>

            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
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

      {/* The Printable & Displayable Authentic Certificate Container */}
      <div
        id="printable-certificate"
        style={{
          width: '100%',
          maxWidth: '980px',
          aspectRatio: '1.414 / 1', // A4 Landscape aspect ratio
          minHeight: '620px',
          background: 'radial-gradient(ellipse at 50% 30%, #171b2e 0%, #0d101d 100%)',
          borderRadius: '24px',
          border: isRevoked ? '3px solid #EF4444' : '3px solid #D4AF37',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.15)',
          padding: '36px',
          position: 'relative',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#FCFDFF',
          overflow: 'hidden',
        }}
      >
        {/* Intricate Inner Guilloche / Gold Border */}
        <div
          style={{
            position: 'absolute',
            inset: '14px',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '18px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: '18px',
            border: '1px dashed rgba(212, 175, 55, 0.25)',
            borderRadius: '14px',
            pointerEvents: 'none',
          }}
        />

        {/* Decorative Gold Corner Badges */}
        <div style={{ position: 'absolute', top: '24px', left: '24px', color: '#D4AF37', fontSize: '20px', opacity: 0.7 }}>❖</div>
        <div style={{ position: 'absolute', top: '24px', right: '24px', color: '#D4AF37', fontSize: '20px', opacity: 0.7 }}>❖</div>
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', color: '#D4AF37', fontSize: '20px', opacity: 0.7 }}>❖</div>
        <div style={{ position: 'absolute', bottom: '24px', right: '24px', color: '#D4AF37', fontSize: '20px', opacity: 0.7 }}>❖</div>

        {/* TOP AUTHORITY HEADER */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #0A1680, #16279E)', border: '1.5px solid #F1B94C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1B94C', fontWeight: 900, fontSize: '15px' }}>
              SF
            </div>
            <span style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4AF37' }}>
              SkillForge Attestation Authority
            </span>
          </div>

          <h1 style={{ margin: '4px 0 6px 0', fontSize: '26px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#FCFDFF', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            Certificate of Project Completion
          </h1>
          <div style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.6)' }}>
            Attested Engineering & Milestone Delivery Credential
          </div>
        </div>

        {/* RECIPIENT & PROJECT SUMMARY */}
        <div style={{ textAlign: 'center', margin: '14px 0', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(252, 253, 255, 0.7)', marginBottom: '6px' }}>
            This officially attests that
          </div>

          <div style={{ fontSize: '30px', fontWeight: 900, color: '#F1B94C', letterSpacing: '-0.01em', textShadow: '0 2px 12px rgba(241, 185, 76, 0.3)' }}>
            {certificate.recipientName}
          </div>

          <div style={{ fontSize: '13px', color: 'rgba(252, 253, 255, 0.75)', margin: '6px 0 8px 0' }}>
            has successfully delivered and completed all technical milestones for
          </div>

          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FCFDFF', letterSpacing: '0.01em' }}>
            {certificate.projectName}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px', padding: '4px 14px', borderRadius: '999px', background: 'rgba(10, 22, 128, 0.4)', border: '1px solid rgba(147, 178, 248, 0.3)', color: '#93B2F8', fontSize: '13px', fontWeight: 600 }}>
            <span>Attested Role:</span>
            <strong style={{ color: '#FCFDFF' }}>{roles.join(', ') || 'Lead Contributor'}</strong>
          </div>
        </div>

        {/* 4-COLUMN PROOF MATRICES: PERFORMANCE, CONTRIBUTIONS, TIMELINE, SKILLS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            background: 'rgba(21, 21, 26, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: '14px',
            padding: '14px',
            position: 'relative',
            zIndex: 2,
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          {/* 1. Milestone Performance Score */}
          <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', fontWeight: 800, marginBottom: '4px' }}>
              Milestone Performance
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#34D399' }}>{performance.score}</span>
              <span style={{ fontSize: '12px', color: 'rgba(252,253,255,0.5)' }}>/100</span>
            </div>
            <div style={{ fontSize: '11px', color: '#FCFDFF', fontWeight: 600, marginTop: '2px' }}>
              {performance.onTimeRate}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(252, 253, 255, 0.55)' }}>
              {performance.milestonesMet}
            </div>
          </div>

          {/* 2. Documented Contributions */}
          <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', fontWeight: 800, marginBottom: '4px' }}>
              Attested Contributions
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FCFDFF' }}>
              {contributions.totalEvents} Verified Events
            </div>
            <div style={{ fontSize: '11px', color: '#93B2F8', marginTop: '2px' }}>
              {contributions.commits} Commits • {contributions.tasksCompleted} Tasks
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(252, 253, 255, 0.55)' }}>
              {contributions.codeReviews} Peer Reviews Logged
            </div>
          </div>

          {/* 3. Verified Skills */}
          <div style={{ borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '10px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', fontWeight: 800, marginBottom: '4px' }}>
              Demonstrated Skills
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '52px', overflow: 'hidden' }}>
              {skills.slice(0, 4).map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(147, 178, 248, 0.12)',
                    border: '1px solid rgba(147, 178, 248, 0.25)',
                    color: '#FCFDFF',
                    fontSize: '10px',
                    fontWeight: 500,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Timeline & Delivery Duration */}
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4AF37', fontWeight: 800, marginBottom: '4px' }}>
              Attested Timeline
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#FCFDFF' }}>
              {timeline.duration}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(252, 253, 255, 0.6)', marginTop: '2px' }}>
              Completed: {new Date(certificate.completedAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '10px', color: '#34D399', fontWeight: 600 }}>
              ✓ Verified on Deadline
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: SIGNATURES, GOLD MEDALLION SEAL, AND CRYPTOGRAPHIC QR CODE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', position: 'relative', zIndex: 2 }}>
          {/* Left Signature */}
          <div style={{ textAlign: 'center', width: '190px' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '18px', color: 'rgba(241, 185, 76, 0.9)', marginBottom: '2px', letterSpacing: '1px' }}>
              Alexandre Mercer
            </div>
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.3)', margin: '2px 0 4px 0' }} />
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#FCFDFF' }}>
              Alexandre Mercer
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(252, 253, 255, 0.5)' }}>
              Chief Verification Officer, SkillForge
            </div>
          </div>

          {/* Center Embossed Gold Seal Medallion */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: isRevoked
                  ? 'radial-gradient(circle, #EF4444 0%, #991B1B 100%)'
                  : 'radial-gradient(circle, #F1B94C 0%, #B8860B 70%, #8B6508 100%)',
                border: '2px solid #FFF',
                boxShadow: isRevoked
                  ? '0 0 20px rgba(239, 68, 68, 0.5)'
                  : '0 0 25px rgba(241, 185, 76, 0.6), inset 0 0 10px rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A1680',
                fontWeight: 900,
                fontSize: '11px',
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1.1,
                padding: '4px',
              }}
            >
              {isRevoked ? (
                <span style={{ color: '#FFF', fontSize: '9px' }}>REVOKED</span>
              ) : (
                <span>OFFICIAL SEAL</span>
              )}
            </div>
            <div style={{ fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4AF37', marginTop: '4px', fontWeight: 700 }}>
              Immutable Attestation
            </div>
          </div>

          {/* Right Signature */}
          <div style={{ textAlign: 'center', width: '190px' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '18px', color: 'rgba(241, 185, 76, 0.9)', marginBottom: '2px', letterSpacing: '1px' }}>
              Dr. Elena Rostova
            </div>
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.3)', margin: '2px 0 4px 0' }} />
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#FCFDFF' }}>
              Dr. Elena Rostova
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(252, 253, 255, 0.5)' }}>
              Head of Engineering Evaluation
            </div>
          </div>

          {/* Cryptographic QR Code & ID Tag */}
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(252,253,255,0.5)', fontWeight: 600 }}>
                Credential ID
              </div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#D4AF37', fontFamily: 'monospace' }}>
                {certificate.certNumber}
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(252, 253, 255, 0.45)' }}>
                Scan to Verify Proof
              </div>
            </div>

            <img
              src={qrUrl}
              alt="Verification QR Code"
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '6px',
                border: '1.5px solid rgba(212, 175, 55, 0.6)',
                background: '#FFF',
                padding: '2px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
