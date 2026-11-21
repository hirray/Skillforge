import React, { useState, useEffect } from 'react';
import {
  Button,
  IcoClose,
  IcoSpark,
  IcoAlert,
} from '../../design-system/components';
import { api } from '../ai/client';
import { MentorProfile } from '@skillforge/contract';

interface ProjectOption {
  id: string;
  title: string;
  stage?: string;
  ownerId: string;
}

interface MilestoneOption {
  id: string;
  title: string;
}

interface Props {
  isOpen: boolean;
  mentor: MentorProfile | null;
  defaultProjectId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const MentorshipRequestModal: React.FC<Props> = ({
  isOpen,
  mentor,
  defaultProjectId,
  onClose,
  onSuccess,
}) => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '');
  const [milestones, setMilestones] = useState<MilestoneOption[]>([]);
  const [scope, setScope] = useState<'general' | 'milestone'>('general');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    api<any>('/projects')
      .then((res) => {
        const list = res.data || res.projects || res || [];
        setProjects(list);
        if (defaultProjectId) {
          setSelectedProjectId(defaultProjectId);
        } else if (list.length > 0 && !selectedProjectId) {
          setSelectedProjectId(list[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not load user projects:', err);
      });
  }, [isOpen, defaultProjectId]);

  useEffect(() => {
    if (!selectedProjectId || scope !== 'milestone') return;
    api<any>(`/projects/${selectedProjectId}/milestones`)
      .then((res) => {
        const ms = res.milestones || res.data || res || [];
        setMilestones(ms);
        if (ms.length > 0) {
          setSelectedMilestoneId(ms[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not load milestones:', err);
        setMilestones([]);
      });
  }, [selectedProjectId, scope]);

  if (!isOpen || !mentor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project to request mentorship for.');
      return;
    }
    if (!message.trim() || message.length < 5) {
      setError('Please provide a message with at least 5 characters detailing your request.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api('/mentors/requests', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          mentorId: mentor.userId,
          scope,
          milestoneId: scope === 'milestone' ? selectedMilestoneId || null : null,
          message,
          proposedTime: proposedTime.trim() || undefined,
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit mentorship request');
    } finally {
      setSubmitting(false);
    }
  };

  const mentorName = mentor.user?.name || mentor.user?.email?.split('@')[0] || 'Expert';

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
              Request Mentorship from {mentorName}
            </h2>
            <p style={{ fontSize: '13px', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Requests auto-expire after 7 days if unconfirmed. Mentors provide advisory guidance.
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

          <form id="req-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Target Project */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Select Your Project
              </label>
              {projects.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#a1a1aa', padding: '10px 0' }}>
                  No active projects found. You must be an owner or member of a project to request mentorship.
                </div>
              ) : (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#1b1b22',
                    border: '1px solid #2c2c3b',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.stage || 'In progress'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Scope Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Mentorship Scope
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setScope('general')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: scope === 'general' ? '1px solid #93B2F8' : '1px solid #2c2c3b',
                    backgroundColor: scope === 'general' ? 'rgba(147, 178, 248, 0.12)' : '#1b1b22',
                    color: scope === 'general' ? '#93B2F8' : '#d4d4d8',
                    transition: 'all 150ms ease-out',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>General Guidance</div>
                  <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                    System design, high-level architecture & tech stack advice.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('milestone')}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: scope === 'milestone' ? '1px solid #93B2F8' : '1px solid #2c2c3b',
                    backgroundColor: scope === 'milestone' ? 'rgba(147, 178, 248, 0.12)' : '#1b1b22',
                    color: scope === 'milestone' ? '#93B2F8' : '#d4d4d8',
                    transition: 'all 150ms ease-out',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>Specific Milestone</div>
                  <div style={{ fontSize: '11px', color: '#a1a1aa', marginTop: '2px' }}>
                    Targeted guidance for completing an upcoming milestone.
                  </div>
                </button>
              </div>
            </div>

            {/* Milestone picker if milestone scope */}
            {scope === 'milestone' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Target Milestone
                </label>
                {milestones.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                    No milestones found in this project. General scope will be used.
                  </div>
                ) : (
                  <select
                    value={selectedMilestoneId}
                    onChange={(e) => setSelectedMilestoneId(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#1b1b22',
                      border: '1px solid #2c2c3b',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '13px',
                      color: '#fff',
                    }}
                  >
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Message */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Request Message / What You Need Guidance On
              </label>
              <textarea
                rows={4}
                required
                placeholder="Describe your current blocker, architectural dilemma, or what feedback would help your team most..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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

            {/* Proposed Time / Availability */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Proposed Time / Schedule Preference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Async feedback anytime this week, or 30-min call Thursday 4 PM"
                value={proposedTime}
                onChange={(e) => setProposedTime(e.target.value)}
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

            <div
              style={{
                backgroundColor: 'rgba(251, 237, 176, 0.08)',
                border: '1px solid rgba(251, 237, 176, 0.2)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: '#FBEDB0',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <IcoSpark size={15} />
              <span>
                Mentors are advisory-only and do not replace team members or gate milestone verification.
              </span>
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
          <Button
            variant="primary"
            type="submit"
            form="req-form"
            disabled={submitting || projects.length === 0}
          >
            {submitting ? 'Sending Request...' : 'Send Mentorship Request'}
          </Button>
        </div>
      </div>
    </div>
  );
};
