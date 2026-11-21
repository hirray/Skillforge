import React, { useState, useEffect } from 'react';
import {
  Button,
  IcoClose,
  IcoRocket,
  IcoAlert,
} from '../../design-system/components';
import { api } from '../ai/client';

interface Props {
  isOpen: boolean;
  project: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const RequestJoinSprintModal: React.FC<Props> = ({
  isOpen,
  project,
  onClose,
  onSuccess,
}) => {
  const [role, setRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !project) {
      setError(null);
      setSuccessMsg(null);
      return;
    }

    if (project.roles && project.roles.length > 0) {
      // Pick the first open role
      const openRole = project.roles.find((r: any) => (r.openings || 1) > (r.filled || 0));
      setRole(openRole ? openRole.title : project.roles[0].title);
    } else {
      setRole('Fullstack Developer');
    }
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalRole = role === 'Other' ? customRole.trim() : role;
    if (!finalRole) {
      setError('Please select or specify a role you are applying for.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api(`/projects/${project.id}/join-requests`, {
        method: 'POST',
        body: JSON.stringify({
          role: finalRole,
          message: message.trim() || undefined,
        }),
      });

      setSuccessMsg('Your join request has been sent to the team lead!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to submit join request');
    } finally {
      setSubmitting(false);
    }
  };

  const projectRoles: any[] = project.roles || [];

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
          maxWidth: '500px',
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
                backgroundColor: 'rgba(241, 185, 76, 0.15)',
                color: '#F1B94C',
              }}
            >
              <IcoRocket size={18} />
            </span>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
                Request to Join Team
              </h2>
              <p style={{ fontSize: '13px', color: '#a1a1aa', margin: 0 }}>
                Project: {project.title}
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Project Summary */}
            <div
              style={{
                backgroundColor: '#1b1b22',
                border: '1px solid #282836',
                borderRadius: '10px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#f4f4f5' }}>
                {project.title}
              </div>
              <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                {project.description}
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Position / Role You Want to Join As *
              </label>
              {projectRoles.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {projectRoles.map((r: any) => {
                    const isSelected = role === r.title;
                    const openCount = (r.openings || 1) - (r.filled || 0);
                    return (
                      <button
                        type="button"
                        key={r.id || r.title}
                        onClick={() => setRole(r.title)}
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          border: isSelected ? '1px solid #F1B94C' : '1px solid #2c2c3b',
                          backgroundColor: isSelected ? 'rgba(241, 185, 76, 0.15)' : '#1b1b22',
                          color: isSelected ? '#F1B94C' : '#d4d4d8',
                          transition: 'all 150ms ease-out',
                        }}
                      >
                        {r.title} {openCount > 0 && `(${openCount} open)`} {isSelected && '✓'}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setRole('Other')}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      border: role === 'Other' ? '1px solid #93B2F8' : '1px solid #2c2c3b',
                      backgroundColor: role === 'Other' ? 'rgba(147, 178, 248, 0.15)' : '#1b1b22',
                      color: role === 'Other' ? '#93B2F8' : '#a1a1aa',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    Custom Role...
                  </button>
                </div>
              ) : null}

              {(role === 'Other' || projectRoles.length === 0) && (
                <input
                  type="text"
                  required
                  placeholder="e.g. Frontend Developer, AI Engineer, UI Designer"
                  value={role === 'Other' ? customRole : role}
                  onChange={(e) => {
                    if (role === 'Other') setCustomRole(e.target.value);
                    else setRole(e.target.value);
                  }}
                  style={{
                    width: '100%',
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
                Why do you want to join this sprint? (Message to Lead)
              </label>
              <textarea
                rows={3}
                placeholder="Hi, I saw your project on the sprint board and have experience in this stack. Would love to build this with you!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Join Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
