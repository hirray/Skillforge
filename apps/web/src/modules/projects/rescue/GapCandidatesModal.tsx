import React, { useState, useEffect } from 'react';
import { Card, Avatar, SkeletonLoader, IcoClose, IcoUsers, IcoCheck, IcoAlert, IcoMail, IcoFlash } from '../../../design-system/components';
import { ProjectGapItem } from './RescueBanner';

interface GapCandidatesModalProps {
  projectId: string;
  project: any;
  gap: ProjectGapItem;
  onClose: () => void;
  onInvitationSent: () => void;
}

export const GapCandidatesModal: React.FC<GapCandidatesModalProps> = ({
  projectId,
  project,
  gap,
  onClose,
  onInvitationSent
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invite with Context state
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [inviteNote, setInviteNote] = useState('');
  const [candidateSummary, setCandidateSummary] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Fetch candidates from gap candidate discovery endpoint
  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const [candRes, handoverRes] = await Promise.all([
        fetch(`/api/v1/projects/${projectId}/gaps/${gap.id}/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
          body: JSON.stringify({})
        }).then(r => r.json()),
        fetch(`/api/v1/projects/${projectId}/handover?gapId=${gap.id}`, {
          headers: { Authorization: `Bearer ${currentUserId}` }
        }).then(r => r.json()).catch(() => ({ data: [] }))
      ]);

      if (candRes.error) throw new Error(candRes.error.message || 'Failed to fetch candidates');
      const matches = candRes.data?.matches || [];
      setCandidates(matches);

      // Pre-fill candidate summary from handover notes if available
      const notes = handoverRes.data || [];
      if (notes.length > 0 && notes[0].candidateSummary) {
        setCandidateSummary(notes[0].candidateSummary);
      } else {
        setCandidateSummary(`We are looking for a ${gap.roleTitle} with ${gap.targetProficiency} proficiency to join our team for ${gap.hoursPerWeek} hrs/week.`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [projectId, gap.id]);

  const handleSendGapInvitation = async () => {
    if (!selectedCandidate) return;
    setSendingInvite(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
        body: JSON.stringify({
          userId: selectedCandidate.candidate.userId,
          role: gap.roleTitle,
          gapId: gap.id,
          note: inviteNote.trim() || `Rescue replacement for ${gap.roleTitle}: ${candidateSummary}`,
          expiresDays: 7
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to send invitation');

      setInviteSuccess(`Context-rich invitation sent to ${selectedCandidate.candidate.name}!`);
      setTimeout(() => {
        setSelectedCandidate(null);
        setInviteSuccess(null);
        onInvitationSent();
      }, 1500);
    } catch (e: any) {
      alert(`Invitation error: ${e.message}`);
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 60, padding: 20
    }}>
      <Card style={{
        width: '100%', maxWidth: 720, background: '#15151a', border: '1px solid #33333e',
        color: '#f0edf5', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #26262e',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Replacement Candidates: {gap.roleTitle}
              </h2>
              <span style={{
                background: '#221a36', color: '#b29af5', border: '1px solid #8861dc50',
                padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600
              }}>
                Target: {gap.targetProficiency}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aba6b6' }}>
              Ranked talent matching required skills ({gap.skills.join(', ') || 'General'}). Invitations carry verified context.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#aba6b6', cursor: 'pointer', padding: 4 }}
          >
            <IcoClose size={16} />
          </button>
        </div>

        {/* Content list */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SkeletonLoader type="card" count={3} />
            </div>
          ) : error ? (
            <div style={{
              background: '#2c1518', border: '1px solid #fb718550', color: '#fb7185',
              padding: '14px 18px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <IcoAlert size={16} color="#fb7185" />
              <span>Failed to find matching candidates: {error}</span>
            </div>
          ) : candidates.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: '#aba6b6' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#221a36', border: '1px solid #8861dc40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#b29af5' }}>
                <IcoUsers size={22} color="#b29af5" />
              </div>
              <h4 style={{ color: '#ffffff', fontSize: 14, margin: '0 0 6px', fontWeight: 600 }}>No Matching Candidates Found</h4>
              <p style={{ fontSize: 12.5, margin: 0, maxWidth: 360, marginInline: 'auto' }}>
                Try relaxing the proficiency requirement or adding broader skills in the Gap Editor.
              </p>
            </div>
          ) : (
            candidates.map((matchItem, idx) => {
              const c = matchItem.candidate;
              const isSelected = selectedCandidate?.candidate?.userId === c.userId;

              return (
                <div
                  key={c.userId || idx}
                  style={{
                    background: isSelected ? '#221a36' : '#19191e',
                    border: `1px solid ${isSelected ? '#8861dc' : '#33333e'}`,
                    borderRadius: 12,
                    padding: 16,
                    transition: 'all .15s ease',
                    boxShadow: isSelected ? '0 4px 18px rgba(136, 97, 220, 0.25)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 10 }}>
                    {/* User profile info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar name={c.name} email={c.email} size="md" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#ffffff' }}>{c.name}</span>
                          <span style={{ fontSize: 11.5, color: '#aba6b6' }}>({c.email})</span>
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#b29af5', fontWeight: 500 }}>
                          {c.headline || `${gap.roleTitle} Candidate`}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)',
                      padding: '4px 10px', borderRadius: 20
                    }}>
                      <IcoFlash size={13} color="#10B981" />
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#10B981' }}>{matchItem.matchScore}% Match</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {(c.skills || []).map((sk: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        style={{
                          background: '#15151a', color: '#f0edf5', border: '1px solid #3a3a48',
                          padding: '2px 8px', borderRadius: 4, fontSize: 11
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Reasons list */}
                  {matchItem.reasons && matchItem.reasons.length > 0 && (
                    <div style={{ background: '#121216', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#aba6b6', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                        Why this candidate fits:
                      </span>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#f0edf5', lineHeight: 1.6 }}>
                        {matchItem.reasons.map((r: string, rIdx: number) => (
                          <li key={rIdx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 6, borderTop: '1px solid #26262e' }}>
                    <button
                      onClick={() => setSelectedCandidate(matchItem)}
                      style={{
                        padding: '6px 14px',
                        background: isSelected ? '#8861dc' : '#b29af5',
                        color: '#0b0b0e',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <IcoMail size={13} color="#0b0b0e" />
                      {isSelected ? 'Inviting…' : 'Invite with Context'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ----------------- CONTEXT INVITATION DRAWER / CONFIRMATION ----------------- */}
        {selectedCandidate && (
          <div style={{
            padding: '16px 24px', background: '#111114', borderTop: '1px solid #33333e',
            display: 'flex', flexDirection: 'column', gap: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: 13, color: '#ffffff' }}>
                  Context-First Invitation for {selectedCandidate.candidate.name}
                </strong>
                <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#aba6b6' }}>
                  The candidate will see project stage, team composition, expectations, and the summary below before accepting.
                </p>
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
                style={{ background: 'none', border: 'none', color: '#aba6b6', cursor: 'pointer' }}
              >
                <IcoClose size={14} />
              </button>
            </div>

            {inviteSuccess ? (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', color: '#10B981',
                padding: '10px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8
              }}>
                <IcoCheck size={16} color="#10B981" />
                <span>{inviteSuccess}</span>
              </div>
            ) : (
              <>
                <div style={{ background: '#19191e', padding: '10px 14px', borderRadius: 8, border: '1px solid #26262e', fontSize: 12 }}>
                  <div style={{ display: 'flex', gap: 14, marginBottom: 6 }}>
                    <span>Project Stage: <strong style={{ color: '#b29af5' }}>{project.stage || 'Active'}</strong></span>
                    <span>Role: <strong style={{ color: '#ffffff' }}>{gap.roleTitle}</strong></span>
                    <span>Time Commitment: <strong style={{ color: '#ffffff' }}>{gap.hoursPerWeek} hrs/week</strong></span>
                  </div>
                  <div>
                    <span style={{ color: '#aba6b6' }}>Candidate Summary: </span>
                    <span style={{ color: '#f0edf5' }}>{candidateSummary}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={inviteNote}
                    onChange={(e) => setInviteNote(e.target.value)}
                    placeholder="Add personal note to invitation (optional)..."
                    style={{
                      flex: 1, padding: '8px 12px', background: '#1a1922', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleSendGapInvitation}
                    disabled={sendingInvite}
                    style={{
                      padding: '8px 18px', background: '#b29af5', color: '#0b0b0e', border: 'none',
                      borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {sendingInvite ? 'Sending…' : 'Confirm & Send Invitation'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};
