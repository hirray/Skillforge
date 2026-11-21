import React, { useState, useEffect } from 'react';
import {
  Button,
  IcoClose,
  IcoUsers,
  IcoAlert,
} from '../../design-system/components';
import { api, getEffectiveUserId } from '../ai/client';

interface Props {
  isOpen: boolean;
  participant: {
    userId: string;
    user?: { email: string; name?: string };
    skillsSnapshot?: string[];
  } | null;
  eventProjects: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_ROLES = [
  'Fullstack Developer',
  'Frontend Developer',
  'Backend Developer',
  'AI / ML Engineer',
  'UI/UX Designer',
  'DevOps / Cloud Engineer',
];

export const InviteParticipantModal: React.FC<Props> = ({
  isOpen,
  participant,
  eventProjects,
  onClose,
  onSuccess,
}) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [role, setRole] = useState('Fullstack Developer');
  const [customRole, setCustomRole] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentUserId = getEffectiveUserId();

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccessMsg(null);
      return;
    }

    // Prioritize projects owned by the active user, then fallback to projects without this member
    const sortAndSelect = (list: any[]) => {
      // Find whether member is already on team
      const isAlreadyMember = (proj: any) =>
        proj.members?.some((m: any) => m.userId === participant?.userId && m.status === 'active');

      const sorted = [...list].sort((a, b) => {
        const aMine = a.ownerId === currentUserId ? -1 : 1;
        const bMine = b.ownerId === currentUserId ? -1 : 1;
        if (aMine !== bMine) return aMine - bMine;
        const aMem = isAlreadyMember(a) ? 1 : -1;
        const bMem = isAlreadyMember(b) ? 1 : -1;
        return aMem - bMem;
      });

      setProjects(sorted);
      const firstEligible = sorted.find((pr) => !isAlreadyMember(pr));
      if (firstEligible) {
        setSelectedProjectId(firstEligible.id);
      } else if (sorted.length > 0) {
        setSelectedProjectId(sorted[0].id);
      }
    };

    if (eventProjects && eventProjects.length > 0) {
      sortAndSelect(eventProjects);
    } else {
      api<{ data?: any[] } | any[]>('/projects')
        .then((res) => {
          const all = Array.isArray(res) ? res : res.data || [];
          sortAndSelect(all);
        })
        .catch(() => {
          setProjects([]);
        });
    }
  }, [isOpen, eventProjects, currentUserId, participant]);

  if (!isOpen || !participant) return null;

  let participantEmail = participant.user?.email || participant.userId;
  if (participantEmail.startsWith('eyJ') && participantEmail.includes('.')) {
    try {
      const parts = participantEmail.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      participantEmail =
        payload.email || (payload.nickname ? `${payload.nickname}@example.com` : `${payload.name || 'Developer'}@example.com`);
    } catch {
      participantEmail = 'developer@skillforge.io';
    }
  }
  const participantName = participantEmail.split('@')[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setError('Please select a project to invite this developer to.');
      return;
    }

    const assignedRole = role === 'Other' ? customRole.trim() : role;
    if (!assignedRole) {
      setError('Please specify a role for the invitation.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api(`/projects/${selectedProjectId}/invitations`, {
        method: 'POST',
        body: JSON.stringify({
          userId: participant.userId,
          role: assignedRole,
          note: note.trim() || undefined,
        }),
      });

      setSuccessMsg(`Invitation successfully sent to ${participantName}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
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
          maxWidth: '520px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
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
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(147, 178, 248, 0.12)',
                color: '#93B2F8',
              }}
            >
              <IcoUsers size={18} />
            </span>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
                Invite to Sprint Project
              </h2>
              <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                Send a direct team invitation to {participantName}
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

        {/* Form Body */}
        <div style={{ padding: '22px 24px' }}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <IcoAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                textAlign: 'center',
                fontWeight: 500,
              }}
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Target Candidate Brief */}
            <div
              style={{
                backgroundColor: '#1b1b22',
                border: '1px solid #282836',
                borderRadius: '10px',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: '0.05em' }}>
                Recipient Candidate
              </div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#f4f4f5', marginTop: '2px' }}>
                {participantName} ({participantEmail})
              </div>
              {participant.skillsSnapshot && participant.skillsSnapshot.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {participant.skillsSnapshot.map((sk) => (
                    <span
                      key={sk}
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#242430',
                        color: '#93B2F8',
                      }}
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Project Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Target Project *
              </label>
              {projects.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#F1B94C', padding: '8px', backgroundColor: 'rgba(241, 185, 76, 0.1)', borderRadius: '6px' }}>
                  No active projects found. You must register a project team first before inviting team members.
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
                    padding: '9px 12px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                >
                  {projects.map((pr) => {
                    const alreadyMember = pr.members?.some(
                      (m: any) => m.userId === participant.userId && m.status === 'active'
                    );
                    const isMine = pr.ownerId === currentUserId;
                    return (
                      <option key={pr.id} value={pr.id} disabled={alreadyMember}>
                        {pr.title} ({pr.id.slice(0, 6)}) {isMine ? '★ (Your Project)' : ''} {alreadyMember ? '— [Already on Team]' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Project Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1b1b22',
                  border: '1px solid #2c2c3b',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  fontSize: '13px',
                  color: '#fff',
                }}
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
                <option value="Other">Custom Role...</option>
              </select>

              {role === 'Other' && (
                <input
                  type="text"
                  required
                  placeholder="e.g. Prompt Engineer, QA Lead"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '8px',
                    backgroundColor: '#1b1b22',
                    border: '1px solid #2c2c3b',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '13px',
                    color: '#fff',
                  }}
                />
              )}
            </div>

            {/* Note / Pitch */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Invitation Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Hi, saw your profile in the sprint pool and your stack matches our hackathon goals perfectly!"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#1b1b22',
                  border: '1px solid #2c2c3b',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#fff',
                  resize: 'none',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={submitting || projects.length === 0}
              >
                {submitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
