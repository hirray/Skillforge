import React, { useState, useEffect } from 'react';
import {
  Button,
  IcoClose,
  IcoSpark,
  IcoAlert,
} from '../../design-system/components';
import { api } from '../ai/client';
import { MentorProfile } from '@skillforge/contract';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const COMMON_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'System Design',
  'Frontend Architecture', 'PostgreSQL', 'Go', 'Docker', 'GraphQL',
  'UI/UX', 'Cloud / AWS', 'Machine Learning', 'Next.js'
];

const COMMON_DOMAINS = [
  'Web Applications', 'SaaS', 'Fintech', 'AI/ML',
  'Distributed Systems', 'Mobile', 'EdTech', 'DevOps & Infra'
];

const FORMAT_OPTIONS = [
  { id: 'async_review', label: 'Async Code & Architecture Review' },
  { id: 'live_call', label: '1:1 Video Advisory Call' },
  { id: 'office_hours', label: 'Weekly Office Hours' },
  { id: 'code_review', label: 'PR & Schema Reviews' },
];

export const MentorProfileModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [domains, setDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState('');
  const [availability, setAvailability] = useState('3-5 hrs/week');
  const [formats, setFormats] = useState<string[]>(['async_review']);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    // load profile
    setError(null);
    api<MentorProfile | null>('/mentors/profile')
      .then((profile) => {
        if (profile) {
          setActive(profile.active);
          setSkills(profile.expertiseSkillIds || []);
          setDomains(profile.domains || []);
          setAvailability(profile.availability || '3-5 hrs/week');
          setFormats(profile.formats || ['async_review']);
          setBio(profile.bio || '');
        }
      })
      .catch((err) => {
        console.warn('Could not load profile:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    setSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const addCustomSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const toggleDomain = (domain: string) => {
    setDomains(prev => prev.includes(domain) ? prev.filter(d => d !== domain) : [...prev, domain]);
  };

  const addCustomDomain = () => {
    if (domainInput.trim() && !domains.includes(domainInput.trim())) {
      setDomains(prev => [...prev, domainInput.trim()]);
      setDomainInput('');
    }
  };

  const toggleFormat = (fmt: string) => {
    setFormats(prev => prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (skills.length === 0) {
      setError('Please select at least one area of technical expertise.');
      return;
    }
    if (domains.length === 0) {
      setError('Please select at least one domain.');
      return;
    }
    if (formats.length === 0) {
      setError('Please select at least one mentoring format.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api('/mentors/profile', {
        method: 'POST',
        body: JSON.stringify({
          expertiseSkillIds: skills,
          domains,
          availability,
          formats,
          bio,
          active,
        }),
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update mentor profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#15151a',
          border: '1px solid #282836',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          color: '#e4e4e7',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #22222e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(147, 178, 248, 0.12)',
                color: '#93B2F8',
              }}
            >
              <IcoSpark size={18} />
            </span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Mentor Profile & Expert Settings</h2>
              <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                Offer technical advisory and async reviews to active projects.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a1a1aa',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <IcoClose size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IcoAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <form id="mentor-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Active Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                backgroundColor: '#1b1b22',
                borderRadius: '10px',
                border: '1px solid #282836',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>Available for Project Mentorship</div>
                <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                  Show your profile in the Expert Directory and receive incoming requests.
                </div>
              </div>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#93B2F8' }}
              />
            </div>

            {/* Expertise Skills */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Skills & Technologies You Mentor
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {Array.from(new Set([...COMMON_SKILLS, ...skills])).map((skill) => {
                  const selected = skills.includes(skill);
                  const isCustom = !COMMON_SKILLS.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        border: selected ? '1px solid #93B2F8' : '1px solid #2c2c3b',
                        backgroundColor: selected ? 'rgba(147, 178, 248, 0.15)' : '#1b1b22',
                        color: selected ? '#93B2F8' : '#d4d4d8',
                        transition: 'all 150ms ease-out',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{skill}</span>
                      {selected && <span>✓</span>}
                      {isCustom && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSkills(prev => prev.filter(s => s !== skill));
                          }}
                          style={{
                            marginLeft: '4px',
                            fontSize: '12px',
                            opacity: 0.7,
                            cursor: 'pointer',
                          }}
                          title="Remove custom skill"
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add custom skill (e.g. Rust, WebGL)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                  style={{
                    flex: 1,
                    backgroundColor: '#1b1b22',
                    border: '1px solid #2c2c3b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                />
                <Button variant="secondary" size="sm" type="button" onClick={addCustomSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* Domains */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Industry & Engineering Domains
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {Array.from(new Set([...COMMON_DOMAINS, ...domains])).map((dom) => {
                  const selected = domains.includes(dom);
                  const isCustom = !COMMON_DOMAINS.includes(dom);
                  return (
                    <button
                      type="button"
                      key={dom}
                      onClick={() => toggleDomain(dom)}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        border: selected ? '1px solid #F1B94C' : '1px solid #2c2c3b',
                        backgroundColor: selected ? 'rgba(241, 185, 76, 0.15)' : '#1b1b22',
                        color: selected ? '#F1B94C' : '#d4d4d8',
                        transition: 'all 150ms ease-out',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{dom}</span>
                      {selected && <span>✓</span>}
                      {isCustom && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setDomains(prev => prev.filter(d => d !== dom));
                          }}
                          style={{
                            marginLeft: '4px',
                            fontSize: '12px',
                            opacity: 0.7,
                            cursor: 'pointer',
                          }}
                          title="Remove custom domain"
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add custom domain (e.g. BioTech, Cryptography)..."
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomDomain(); } }}
                  style={{
                    flex: 1,
                    backgroundColor: '#1b1b22',
                    border: '1px solid #2c2c3b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                />
                <Button variant="secondary" size="sm" type="button" onClick={addCustomDomain}>
                  Add
                </Button>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Estimated Availability
              </label>
              <input
                type="text"
                placeholder="e.g. 2-4 hrs/week, or Weekends only"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1b1b22',
                  border: '1px solid #2c2c3b',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#fff',
                }}
              />
            </div>

            {/* Mentoring Formats */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Preferred Formats
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {FORMAT_OPTIONS.map((f) => (
                  <label
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#1b1b22',
                      border: '1px solid #282836',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formats.includes(f.id)}
                      onChange={() => toggleFormat(f.id)}
                      style={{ accentColor: '#93B2F8' }}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Short Bio / Expertise Background
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe your background, tech stacks you have scaled, or architectural patterns you specialize in..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1b1b22',
                  border: '1px solid #2c2c3b',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  color: '#fff',
                  resize: 'vertical',
                }}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #22222e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}
        >
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="mentor-form" disabled={saving}>
            {saving ? 'Saving Profile...' : 'Save Mentor Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};
