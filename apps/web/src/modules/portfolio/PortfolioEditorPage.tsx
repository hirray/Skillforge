import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, token } from '../ai/client';
import { PortfolioSettings } from '@skillforge/contract';
import '../ai/studio.css';

export function PortfolioEditorPage() {
  const [headline, setHeadline] = useState<string>('');
  const [bioOverride, setBioOverride] = useState<string>('');
  const [visibility, setVisibility] = useState<string>('public');
  const [sectionOrder, setSectionOrder] = useState<string[]>(['skills', 'projects', 'certificates']);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({
    skills: true,
    projects: true,
    certificates: true,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api<any>('/users/me/portfolio');
      if (data?.settings) {
        setHeadline(data.settings.headline || '');
        setBioOverride(data.settings.bioOverride || '');
        setVisibility(data.settings.visibility || 'public');
        if (data.settings.sectionOrder && Array.isArray(data.settings.sectionOrder)) {
          setSectionOrder(data.settings.sectionOrder);
        }
        if (data.settings.sectionVisibility) {
          setSectionVisibility(data.settings.sectionVisibility);
        }
      }
      setPreviewData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load portfolio settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setSaveMessage(null);
      setError(null);
      await api<PortfolioSettings>('/users/me/portfolio', {
        method: 'PUT',
        body: JSON.stringify({
          headline,
          bioOverride,
          visibility,
          sectionOrder,
          sectionVisibility,
        }),
      });
      setSaveMessage('Portfolio updated successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
      // Refresh preview
      fetchPortfolioData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save portfolio settings');
    } finally {
      setSaving(false);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setSectionOrder(newOrder);
  };

  const toggleSection = (section: string) => {
    setSectionVisibility((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const username = token().includes('@') ? token().split('@')[0] : token();
  const shareUrl = `${window.location.origin}/u/${username}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(147, 178, 248, 0.12)', border: '1px solid rgba(147, 178, 248, 0.25)', color: '#93B2F8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Professional Portfolio
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FCFDFF', margin: '4px 0 8px 0', letterSpacing: '-0.02em' }}>
            Portfolio Settings & Live Preview
          </h1>
          <p style={{ color: 'rgba(252, 253, 255, 0.65)', fontSize: '15px', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
            Configure how your verified proof-of-work appears to recruiters, collaborators, and the public web. Control privacy visibility and section arrangement with instant live preview.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleCopyLink}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#1b1b22',
              color: copiedLink ? '#34D399' : '#FCFDFF',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {copiedLink ? 'Copied Public URL!' : 'Share Public Link'}
          </button>

          <Link
            to={`/u/${username}`}
            target="_blank"
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
            Open Live View ↗
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {loading && (
        <div style={{ padding: '14px 18px', borderRadius: '12px', background: '#15151a', border: '1px solid #282836', color: '#93B2F8', marginBottom: '24px', fontSize: '14px' }}>
          Loading your portfolio configuration...
        </div>
      )}
      {saveMessage && (
        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34D399', marginBottom: '24px', fontSize: '14px', fontWeight: 600 }}>
          {saveMessage}
        </div>
      )}
      {error && (
        <div style={{ padding: '14px 18px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', color: '#FCA5A5', marginBottom: '24px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* Grid: Editor Left (40%), Preview Right (60%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 420px) 1fr', gap: '28px', alignItems: 'start' }}>
        {/* Editor Form */}
        <div style={{ background: '#15151a', border: '1px solid #282836', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FCFDFF', margin: '0 0 20px 0' }}>
            Portfolio Controls
          </h2>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Visibility Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(252, 253, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Audience Visibility
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'public', title: 'Public (Recommended)', desc: 'Visible to everyone with your link or domain.' },
                  { id: 'platform', title: 'Platform Builders Only', desc: 'Restricted to logged-in SkillForge developers.' },
                  { id: 'recruiters', title: 'Verified Recruiters Only', desc: 'Restricted to authenticated hiring partners.' },
                  { id: 'private', title: 'Strictly Private', desc: 'Only visible to you when logged in.' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: visibility === opt.id ? 'rgba(10, 22, 128, 0.25)' : '#1b1b22',
                      border: visibility === opt.id ? '1px solid #93B2F8' : '1px solid #282836',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={opt.id}
                      checked={visibility === opt.id}
                      onChange={(e) => setVisibility(e.target.value)}
                      style={{ marginTop: '3px', accentColor: '#0A1680' }}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#FCFDFF' }}>{opt.title}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(252, 253, 255, 0.5)' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(252, 253, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Lead Systems Architect & Fullstack Engineer"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#1b1b22',
                  border: '1px solid #282836',
                  color: '#FCFDFF',
                  fontSize: '13px',
                }}
              />
            </div>

            {/* Bio Override */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(252, 253, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Professional Narrative / Bio
              </label>
              <textarea
                value={bioOverride}
                onChange={(e) => setBioOverride(e.target.value)}
                placeholder="Summarize your engineering focus, architectural specialties, and high-assurance delivery history..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: '#1b1b22',
                  border: '1px solid #282836',
                  color: '#FCFDFF',
                  fontSize: '13px',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Section Ordering & Visibility */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(252, 253, 255, 0.8)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Sections Arrangement & Visibility
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sectionOrder.map((section, idx) => (
                  <div
                    key={section}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      background: '#1b1b22',
                      border: '1px solid #282836',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={sectionVisibility[section] !== false}
                        onChange={() => toggleSection(section)}
                        style={{ accentColor: '#0A1680' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#FCFDFF', textTransform: 'capitalize' }}>
                        {section === 'skills' ? 'Verified Skills & Evidence' : section === 'projects' ? 'Attested Projects' : 'Completion Credentials'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: idx === 0 ? 'rgba(252, 253, 255, 0.2)' : '#FCFDFF',
                          cursor: idx === 0 ? 'default' : 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sectionOrder.length - 1}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: idx === sectionOrder.length - 1 ? 'rgba(252, 253, 255, 0.2)' : '#FCFDFF',
                          cursor: idx === sectionOrder.length - 1 ? 'default' : 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#0A1680',
                border: '1px solid #93B2F8',
                color: '#FCFDFF',
                fontWeight: 700,
                fontSize: '14px',
                cursor: saving ? 'wait' : 'pointer',
                marginTop: '10px',
              }}
            >
              {saving ? 'Saving Changes...' : 'Save Portfolio Settings'}
            </button>
          </form>
        </div>

        {/* Live Preview Column */}
        <div style={{ background: '#131318', border: '1px solid #282836', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #282836' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34D399', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#93B2F8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Live Portfolio Preview
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'rgba(252, 253, 255, 0.5)' }}>
              Visibility: <strong style={{ color: '#FCFDFF' }}>{visibility}</strong>
            </span>
          </div>

          {/* Preview Hero */}
          <div style={{ padding: '20px', borderRadius: '14px', background: '#181822', border: '1px solid #282836', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#0A1680', color: '#F1B94C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '18px' }}>
                {username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FCFDFF' }}>
                  @{username}
                </h3>
                <div style={{ fontSize: '13px', color: '#F1B94C', fontWeight: 600 }}>
                  {headline || 'Verified Fullstack Software Engineer'}
                </div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(252, 253, 255, 0.7)', lineHeight: 1.5 }}>
              {bioOverride || 'Demonstrating transparent, attested software execution evidence on SkillForge.'}
            </p>
          </div>

          {/* Preview Sections Rendered in Chosen Order */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sectionOrder.map((section) => {
              if (sectionVisibility[section] === false) return null;

              if (section === 'skills') {
                const skills = previewData?.skills || [
                  { name: 'TypeScript', level: 'advanced', evidenceCount: 16 },
                  { name: 'React', level: 'advanced', evidenceCount: 22 },
                  { name: 'Node.js', level: 'advanced', evidenceCount: 14 },
                ];
                return (
                  <div key="skills" style={{ padding: '16px', borderRadius: '12px', background: '#181822', border: '1px solid #282836' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#93B2F8', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Verified Technical Skills
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {skills.map((s: any, i: number) => (
                        <div
                          key={i}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: 'rgba(147, 178, 248, 0.1)',
                            border: '1px solid rgba(147, 178, 248, 0.25)',
                            fontSize: '12px',
                            color: '#FCFDFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>{s.name}</span>
                          <span style={{ fontSize: '10px', color: '#34D399', fontWeight: 700 }}>
                            {s.evidenceCount} proofs
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section === 'projects') {
                const projects = previewData?.projects || [
                  { title: 'SkillForge Monorepo & AI Intelligence Suite', role: 'Fullstack Lead' },
                ];
                return (
                  <div key="projects" style={{ padding: '16px', borderRadius: '12px', background: '#181822', border: '1px solid #282836' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#93B2F8', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Attested Projects ({projects.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {projects.map((p: any, i: number) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', background: '#131318', border: '1px solid #282836', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: '#FCFDFF' }}>{p.title}</span>
                          <span style={{ color: '#F1B94C' }}>{p.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (section === 'certificates') {
                const certs = previewData?.certificates || [
                  { certNumber: 'SF-2026-00001', projectName: 'SkillForge Monorepo' },
                ];
                return (
                  <div key="certificates" style={{ padding: '16px', borderRadius: '12px', background: '#181822', border: '1px solid #282836' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#93B2F8', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Completion Credentials ({certs.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {certs.map((c: any, i: number) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', background: '#131318', border: '1px solid #282836', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: '#FCFDFF' }}>{c.projectName}</span>
                          <span style={{ fontFamily: 'monospace', color: '#93B2F8' }}>{c.certNumber}</span>
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
      </div>
    </div>
  );
}
