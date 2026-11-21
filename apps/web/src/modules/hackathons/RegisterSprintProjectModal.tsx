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
  eventId: string;
  eventName: string;
  onClose: () => void;
  onSuccess: (newProjectId: string) => void;
}

const COMMON_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'Next.js',
  'TailwindCSS', 'PostgreSQL', 'Docker', 'GraphQL', 'PyTorch'
];

export const RegisterSprintProjectModal: React.FC<Props> = ({
  isOpen,
  eventId,
  eventName,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript']);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSkill = (sk: string) => {
    setSkills(prev => prev.includes(sk) ? prev.filter(s => s !== sk) : [...prev, sk]);
  };

  const addCustomSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.length < 3) {
      setError('Project title must be at least 3 characters.');
      return;
    }
    if (!description.trim() || description.length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await api<any>(`/hackathons/${eventId}/projects`, {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: 'Hackathon Sprint',
          skills,
        }),
      });
      onSuccess(res.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to register sprint project');
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
          maxWidth: '580px',
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
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
              Register Team Project
            </h2>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Linking to sprint event: <strong style={{ color: '#F1B94C' }}>{eventName}</strong>
            </p>
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

          {/* Auto-Scaffold Callout */}
          <div
            style={{
              backgroundColor: 'rgba(147, 178, 248, 0.1)',
              border: '1px solid rgba(147, 178, 248, 0.25)',
              borderRadius: '10px',
              padding: '14px 16px',
              marginBottom: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#93B2F8', fontWeight: 600, fontSize: '13px' }}>
              <IcoRocket size={16} />
              <span>Sprint Defaults Pre-Configured</span>
            </div>
            <div style={{ fontSize: '12px', color: '#d4d4d8', lineHeight: 1.5 }}>
              Registration automatically scales and creates 3 sprint milestones for your team:
              <br />
              <strong>1. Ideate & Architecture (25%)</strong> &bull; <strong>2. Core Feature Build (75%)</strong> &bull; <strong>3. Sprint Demo (100%)</strong>.
            </div>
          </div>

          <form id="sprint-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Nexus Agentic Copilot"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                Project Pitch / Problem Statement *
              </label>
              <textarea
                rows={3}
                required
                placeholder="What are you building during this hackathon and what makes it unique?"
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Tech Stack
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {COMMON_SKILLS.map((sk) => {
                  const selected = skills.includes(sk);
                  return (
                    <button
                      type="button"
                      key={sk}
                      onClick={() => toggleSkill(sk)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        border: selected ? '1px solid #93B2F8' : '1px solid #2c2c3b',
                        backgroundColor: selected ? 'rgba(147, 178, 248, 0.15)' : '#1b1b22',
                        color: selected ? '#93B2F8' : '#d4d4d8',
                        transition: 'all 150ms ease-out',
                      }}
                    >
                      {sk} {selected && '✓'}
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
          <Button variant="primary" type="submit" form="sprint-form" disabled={submitting}>
            {submitting ? 'Registering Project...' : 'Launch Sprint Team'}
          </Button>
        </div>
      </div>
    </div>
  );
};
