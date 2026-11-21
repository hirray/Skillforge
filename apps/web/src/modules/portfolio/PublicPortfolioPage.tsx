import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicPortfolioView } from '@skillforge/contract';
import { token } from '../ai/client';
import '../ai/studio.css';

export function PublicPortfolioPage() {
  const { username } = useParams<{ username: string }>();
  const [portfolio, setPortfolio] = useState<PublicPortfolioView | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicPortfolio = async () => {
    if (!username) return;
    try {
      setLoading(true);
      setError(null);
      const headers: Record<string, string> = {};
      const t = token();
      if (t) headers['Authorization'] = `Bearer ${t}`;

      const res = await fetch(`/api/v1/portfolio/${encodeURIComponent(username)}`, { headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || data?.message || `User @${username} not found.`);
      }
      setPortfolio(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load public portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicPortfolio();
  }, [username]);

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e13', color: '#FCFDFF', padding: '40px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Top SkillForge Brand Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#FCFDFF' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#0A1680', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1B94C', fontWeight: 800, fontSize: '15px' }}>
              SF
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              skillforge<span style={{ color: '#F1B94C' }}>.</span>
            </span>
          </Link>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/projects"
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                background: '#15151a',
                border: '1px solid #282836',
                color: '#FCFDFF',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore SkillForge
            </Link>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px', borderRadius: '20px', background: '#15151a', border: '1px solid #282836' }}>
            <div style={{ color: '#93B2F8', fontWeight: 600, fontSize: '16px' }}>Loading verified portfolio...</div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Portfolio Unavailable</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{error}</p>
          </div>
        )}

        {/* Visibility Restricted State */}
        {!loading && portfolio && !portfolio.canView && (
          <div style={{ textAlign: 'center', padding: '64px 24px', borderRadius: '22px', background: '#15151a', border: '1px solid #282836', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(147, 178, 248, 0.12)', border: '1px solid rgba(147, 178, 248, 0.3)', color: '#93B2F8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FCFDFF', margin: '0 0 10px 0' }}>
              Profile Access Restricted
            </h2>
            <p style={{ color: 'rgba(252, 253, 255, 0.65)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
              {portfolio.privateReason || 'This developer has configured their portfolio with strict audience visibility controls.'}
            </p>
            <div style={{ display: 'inline-flex', padding: '6px 14px', borderRadius: '999px', background: '#1b1b22', border: '1px solid #282836', fontSize: '12px', color: '#F1B94C', fontWeight: 600 }}>
              Audience Mode: {portfolio.visibility.toUpperCase()}
            </div>
          </div>
        )}

        {/* Public Portfolio Full View */}
        {!loading && portfolio && portfolio.canView && (
          <div>
            {/* Hero Header */}
            <div
              style={{
                borderRadius: '24px',
                background: 'linear-gradient(145deg, #181824, #121218)',
                border: '1px solid rgba(147, 178, 248, 0.25)',
                padding: '36px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
                marginBottom: '32px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: '#0A1680',
                    border: '2px solid #93B2F8',
                    color: '#F1B94C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '24px',
                  }}
                >
                  {portfolio.name ? portfolio.name.substring(0, 2).toUpperCase() : 'SF'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800, color: '#FCFDFF' }}>
                      {portfolio.name}
                    </h1>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34D399',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      ✓ Verified Builder
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#93B2F8', fontWeight: 600, marginTop: '2px' }}>
                    @{portfolio.username}
                  </div>
                </div>
              </div>

              {portfolio.headline && (
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#F1B94C', marginBottom: '12px', lineHeight: 1.4 }}>
                  {portfolio.headline}
                </div>
              )}

              <p style={{ margin: 0, fontSize: '15px', color: 'rgba(252, 253, 255, 0.75)', lineHeight: 1.6, maxWidth: '760px' }}>
                {portfolio.bio}
              </p>
            </div>

            {/* Sections arranged by recipient configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {(portfolio.settings?.sectionOrder || ['skills', 'projects', 'certificates']).map((sectionKey) => {
                if (portfolio.settings?.sectionVisibility?.[sectionKey] === false) return null;

                if (sectionKey === 'skills') {
                  return (
                    <div
                      key="skills"
                      style={{
                        borderRadius: '20px',
                        background: '#15151a',
                        border: '1px solid #282836',
                        padding: '28px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '6px', height: '18px', borderRadius: '3px', background: '#F1B94C' }} />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FCFDFF' }}>
                          Verified Technical Capabilities & Proof
                        </h2>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                        {portfolio.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '12px',
                              background: '#1b1b22',
                              border: '1px solid #282836',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, color: '#FCFDFF', fontSize: '14px' }}>
                                {skill.name}
                              </div>
                              <div style={{ fontSize: '11px', color: '#93B2F8', textTransform: 'capitalize' }}>
                                {skill.level} proficiency
                              </div>
                            </div>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#34D399',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              {skill.evidenceCount} proofs
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'projects') {
                  return (
                    <div
                      key="projects"
                      style={{
                        borderRadius: '20px',
                        background: '#15151a',
                        border: '1px solid #282836',
                        padding: '28px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '6px', height: '18px', borderRadius: '3px', background: '#93B2F8' }} />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FCFDFF' }}>
                          Attested Project Deliveries ({portfolio.projects.length})
                        </h2>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {portfolio.projects.map((proj) => (
                          <div
                            key={proj.id}
                            style={{
                              padding: '20px',
                              borderRadius: '14px',
                              background: '#1b1b22',
                              border: '1px solid #282836',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#FCFDFF' }}>
                                {proj.title}
                              </h3>
                              <span style={{ fontSize: '12px', color: '#F1B94C', fontWeight: 600 }}>
                                {proj.role}
                              </span>
                            </div>

                            <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: 'rgba(252, 253, 255, 0.7)', lineHeight: 1.5 }}>
                              {proj.description}
                            </p>

                            {proj.technologies && proj.technologies.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                                {proj.technologies.map((t, tidx) => (
                                  <span
                                    key={tidx}
                                    style={{
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      background: 'rgba(147, 178, 248, 0.08)',
                                      border: '1px solid rgba(147, 178, 248, 0.18)',
                                      color: '#93B2F8',
                                      fontSize: '11px',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', fontSize: '12px' }}>
                              <Link
                                to={proj.evidenceLinks.contributionsUrl}
                                style={{ color: '#93B2F8', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                View Evidence Ledger →
                              </Link>
                              {proj.evidenceLinks.certificateUrl && (
                                <Link
                                  to={proj.evidenceLinks.certificateUrl}
                                  style={{ color: '#F1B94C', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  Public Credential ({proj.evidenceLinks.certNumber}) →
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (sectionKey === 'certificates') {
                  return (
                    <div
                      key="certificates"
                      style={{
                        borderRadius: '20px',
                        background: '#15151a',
                        border: '1px solid #282836',
                        padding: '28px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '6px', height: '18px', borderRadius: '3px', background: '#34D399' }} />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FCFDFF' }}>
                          Verified Completion Credentials ({portfolio.certificates.length})
                        </h2>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                        {portfolio.certificates.map((cert, cidx) => (
                          <div
                            key={cidx}
                            style={{
                              padding: '16px',
                              borderRadius: '12px',
                              background: '#1b1b22',
                              border: '1px solid #282836',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(252, 253, 255, 0.45)', fontWeight: 600 }}>
                                Credential ID: {cert.certNumber}
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 700, color: '#FCFDFF', margin: '4px 0 6px 0' }}>
                                {cert.projectName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#93B2F8' }}>
                                Role: {cert.roles.join(', ')}
                              </div>
                            </div>

                            <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'rgba(252, 253, 255, 0.45)' }}>
                                {new Date(cert.completedAt).toLocaleDateString()}
                              </span>
                              <Link
                                to={cert.verificationUrl}
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#F1B94C',
                                  textDecoration: 'none',
                                }}
                              >
                                Verify Proof →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
