import React, { useState } from 'react';
import {
  Button,
  IcoClose,
  IcoRocket,
  IcoAlert,
} from '../../design-system/components';
import { api } from '../ai/client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'Next.js',
  'TailwindCSS', 'PostgreSQL', 'Docker', 'GraphQL', 'PyTorch'
];

export const CreateHackathonModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [rules, setRules] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>(['React', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (sk: string) => {
    setSuggestedSkills(prev => prev.includes(sk) ? prev.filter(s => s !== sk) : [...prev, sk]);
  };

  const addCustomSkill = () => {
    if (skillInput.trim() && !suggestedSkills.includes(skillInput.trim())) {
      setSuggestedSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !theme.trim() || !startsAt || !endsAt) {
      setError('Please fill in all required event details.');
      return;
    }

    if (new Date(startsAt) >= new Date(endsAt)) {
      setError('Event start time must precede end time.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api('/hackathons', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          theme: theme.trim(),
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          rules: rules.trim() || undefined,
          suggestedSkillIds: suggestedSkills,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create hackathon event');
    } finally {
      setSubmitting(false);
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
                backgroundColor: 'rgba(241, 185, 76, 0.15)',
                color: '#F1B94C',
              }}
            >
              <IcoRocket size={18} />
            </span>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Host New Hackathon / Sprint</h2>
              <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                Configure a time-boxed sprint event with automatic scaled milestone templates.
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

          <form id="hackathon-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Event Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Event Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Autumn AI Agentic Sprint 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            {/* Theme */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Hackathon Theme / Domain *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Multi-Agent Systems, Web3 DeFi, or EdTech for Kids"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
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

            {/* Timestamps */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Starts At *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Ends At *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
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
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Event Description *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the challenge statement, target audience, and sprint objectives..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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

            {/* Suggested Skills */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Suggested Skills / Stacks
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {Array.from(new Set([...COMMON_SKILLS, ...suggestedSkills])).map((sk) => {
                  const selected = suggestedSkills.includes(sk);
                  const isCustom = !COMMON_SKILLS.includes(sk);
                  return (
                    <button
                      type="button"
                      key={sk}
                      onClick={() => toggleSkill(sk)}
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
                      <span>{sk}</span>
                      {selected && <span>✓</span>}
                      {isCustom && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setSuggestedSkills(prev => prev.filter(s => s !== sk));
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
                  placeholder="Add custom stack..."
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

            {/* Rules */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Submission Rules & Guidelines
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Teams of 1-5; open source submissions; demo video required."
                value={rules}
                onChange={(e) => setRules(e.target.value)}
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
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="hackathon-form" disabled={submitting}>
            {submitting ? 'Creating Event...' : 'Publish Hackathon'}
          </Button>
        </div>
      </div>
    </div>
  );
};
