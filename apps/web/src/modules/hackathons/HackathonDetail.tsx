import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Button,
  Badge,
  IcoClock,
  IcoRocket,
  IcoUsers,
} from '../../design-system/components';
import { api, token } from '../ai/client';
import { HackathonEvent } from '@skillforge/contract';
import { RegisterSprintProjectModal } from './RegisterSprintProjectModal';
import { InviteParticipantModal } from './InviteParticipantModal';

export const HackathonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<HackathonEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'participants' | 'rules'>('teams');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [invitingParticipant, setInvitingParticipant] = useState<any | null>(null);
  const [joining, setJoining] = useState(false);

  const currentUserId = token();

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api<HackathonEvent>(`/hackathons/${id}`);
      setEvent(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load hackathon details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvent();
  }, [id]);

  const handleJoinPool = async () => {
    if (!id) return;
    setJoining(true);
    try {
      await api(`/hackathons/${id}/join`, {
        method: 'POST',
        body: JSON.stringify({ lookingForTeam: true }),
      });
      await loadEvent();
    } catch (err: any) {
      alert(err.message || 'Failed to join participant pool');
    } finally {
      setJoining(false);
    }
  };

  const isUserParticipant = event?.participants?.some(p => p.userId === currentUserId);

  const calculateRemaining = () => {
    if (!event) return '';
    const diff = new Date(event.endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Sprint has concluded';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hours, ${mins} minutes remaining`;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '24px', textAlign: 'center', color: '#a1a1aa' }}>
        Loading sprint board...
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '24px' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '16px', borderRadius: '12px' }}>
          {error || 'Event not found'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/hackathons" style={{ color: '#93B2F8', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          &larr; Back to all Hackathons
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {!isUserParticipant ? (
            <Button variant="secondary" size="sm" onClick={handleJoinPool} disabled={joining}>
              {joining ? 'Joining...' : 'Join as Lone Hacker (Find Team)'}
            </Button>
          ) : (
            <span
              style={{
                fontSize: '12px',
                color: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ✓ In Participant Pool
            </span>
          )}

          <Button variant="primary" size="sm" onClick={() => setRegisterModalOpen(true)}>
            Register Team Project
          </Button>
        </div>
      </div>

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #15151a 0%, #1c1c28 100%)',
          border: '1px solid #282836',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'rgba(241, 185, 76, 0.15)',
                color: '#F1B94C',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(241, 185, 76, 0.3)',
                textTransform: 'uppercase',
              }}
            >
              Theme: {event.theme}
            </span>
            <Badge status={event.status === 'running' ? 'active' : event.status === 'ended' ? 'completed' : 'recruiting'}>
              {event.status.toUpperCase()}
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(147, 178, 248, 0.1)',
              padding: '6px 14px',
              borderRadius: '9999px',
              color: '#93B2F8',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            <IcoClock size={15} />
            <span>{calculateRemaining()}</span>
          </div>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, color: '#f4f4f5' }}>
          {event.name}
        </h1>

        <p style={{ fontSize: '14px', color: '#d4d4d8', lineHeight: 1.6, margin: 0, maxWidth: '850px' }}>
          {event.description}
        </p>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '20px', paddingTop: '8px', borderTop: '1px solid #282836' }}>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Teams: <strong style={{ color: '#fff' }}>{event.projects?.length || 0}</strong>
          </div>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Participants: <strong style={{ color: '#fff' }}>{event.participants?.length || 0}</strong>
          </div>
          <div style={{ fontSize: '13px', color: '#a1a1aa' }}>
            Looking for Team: <strong style={{ color: '#F1B94C' }}>{event.participants?.filter(p => p.lookingForTeam).length || 0}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #282836',
          paddingBottom: '12px',
        }}
      >
        <button
          onClick={() => setActiveTab('teams')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: activeTab === 'teams' ? '1px solid #F1B94C' : '1px solid #282836',
            backgroundColor: activeTab === 'teams' ? 'rgba(241, 185, 76, 0.15)' : '#15151a',
            color: activeTab === 'teams' ? '#F1B94C' : '#a1a1aa',
            transition: 'all 150ms ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Sprint Teams Board</span>
          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '9999px', backgroundColor: '#282836', color: '#d4d4d8' }}>
            {event.projects?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: activeTab === 'participants' ? '1px solid #93B2F8' : '1px solid #282836',
            backgroundColor: activeTab === 'participants' ? 'rgba(147, 178, 248, 0.15)' : '#15151a',
            color: activeTab === 'participants' ? '#93B2F8' : '#a1a1aa',
            transition: 'all 150ms ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Looking for Team Pool</span>
          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '9999px', backgroundColor: '#282836', color: '#d4d4d8' }}>
            {event.participants?.filter(p => p.lookingForTeam).length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: activeTab === 'rules' ? '1px solid #93B2F8' : '1px solid #282836',
            backgroundColor: activeTab === 'rules' ? 'rgba(147, 178, 248, 0.15)' : '#15151a',
            color: activeTab === 'rules' ? '#93B2F8' : '#a1a1aa',
            transition: 'all 150ms ease-out',
          }}
        >
          Rules & Submission Brief
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'teams' ? (
        !event.projects || event.projects.length === 0 ? (
          <div
            style={{
              backgroundColor: '#15151a',
              border: '1px dashed #282836',
              borderRadius: '16px',
              padding: '60px 24px',
              textAlign: 'center',
              color: '#a1a1aa',
            }}
          >
            <IcoRocket size={32} color="#F1B94C" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '16px', color: '#f4f4f5', margin: '0 0 6px 0' }}>No Sprint Teams Registered Yet</h3>
            <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
              Be the first team to launch a project for this hackathon sprint!
            </p>
            <Button variant="primary" size="sm" onClick={() => setRegisterModalOpen(true)}>
              Register Team Project
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
            {event.projects.map((proj: any) => (
              <div
                key={proj.id}
                style={{
                  backgroundColor: '#15151a',
                  border: '1px solid #282836',
                  borderRadius: '16px',
                  padding: '22px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(241, 185, 76, 0.12)',
                        color: '#F1B94C',
                        fontWeight: 600,
                      }}
                    >
                      Sprint Team
                    </span>
                    <Badge status="active">{proj.stage || 'Execution'}</Badge>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f4f4f5', margin: '0 0 8px 0' }}>
                    {proj.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    {proj.description}
                  </p>

                  {/* Scaled Sprint Milestones */}
                  <div
                    style={{
                      backgroundColor: '#1b1b22',
                      borderRadius: '10px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase' }}>
                      Scaled Sprint Milestones (3 Defaults):
                    </div>
                    {proj.milestones && proj.milestones.map((m: any, idx: number) => (
                      <div
                        key={m.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                          color: '#d4d4d8',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              backgroundColor: m.status === 'Done' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(241, 185, 76, 0.2)',
                              color: m.status === 'Done' ? '#10B981' : '#F1B94C',
                              fontSize: '10px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span>{m.title}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: m.status === 'Done' ? '#10B981' : '#a1a1aa' }}>
                          {m.status || 'To Do'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #22222e', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/projects/${proj.id}`)}
                  >
                    Open Project Workspace &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'participants' ? (
        !event.participants || event.participants.length === 0 ? (
          <div
            style={{
              backgroundColor: '#15151a',
              border: '1px dashed #282836',
              borderRadius: '16px',
              padding: '60px 24px',
              textAlign: 'center',
              color: '#a1a1aa',
            }}
          >
            <IcoUsers size={32} color="#93B2F8" style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '16px', color: '#f4f4f5', margin: '0 0 6px 0' }}>Participant Pool is Empty</h3>
            <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
              Join the pool to signal you are looking to team up with other developers.
            </p>
            <Button variant="secondary" size="sm" onClick={handleJoinPool}>
              Join Participant Pool
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {event.participants.map((p) => {
              let email = p.user?.email || p.userId || '';
              // If email or userId happens to be an unparsed raw JWT token, parse or sanitize it
              if (email.startsWith('eyJ') && email.includes('.')) {
                try {
                  const parts = email.split('.');
                  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                  email = payload.email || (payload.nickname ? `${payload.nickname}@example.com` : `${payload.name || 'Developer'}@example.com`);
                } catch {
                  email = 'developer@skillforge.io';
                }
              }
              const name = email.split('@')[0];
              return (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: '#15151a',
                    border: '1px solid #282836',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '14px', color: '#f4f4f5' }}>{name}</strong>
                      {p.lookingForTeam ? (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(241, 185, 76, 0.15)',
                            color: '#F1B94C',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          Looking for Team
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            color: '#10B981',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          Matched / In Team
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>{email}</div>

                    {p.skillsSnapshot && p.skillsSnapshot.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '10px' }}>
                        {p.skillsSnapshot.map((sk) => (
                          <span
                            key={sk}
                            style={{
                              fontSize: '11px',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: '#1b1b22',
                              color: '#93B2F8',
                              border: '1px solid #2c2c3b',
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {p.lookingForTeam && (
                    <div style={{ borderTop: '1px solid #22222e', paddingTop: '10px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        style={{ width: '100%' }}
                        onClick={() => setInvitingParticipant(p)}
                      >
                        Invite to Project Team
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div
          style={{
            backgroundColor: '#15151a',
            border: '1px solid #282836',
            borderRadius: '16px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            color: '#d4d4d8',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f4f4f5', margin: 0 }}>
            Hackathon Sprint Rules & Submission Requirements
          </h3>

          <p style={{ margin: 0 }}>
            {event.rules || 'Teams can consist of 1 to 5 members. All codebase commits and project milestones must be completed and tagged before the countdown expires.'}
          </p>

          <div
            style={{
              backgroundColor: '#1b1b22',
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '10px',
            }}
          >
            <div style={{ fontWeight: 600, color: '#F1B94C' }}>
              Submission Checkpoints:
            </div>
            <div>&bull; Milestone 1 (Ideate): Technical specification & repo setup locked by 25% sprint time.</div>
            <div>&bull; Milestone 2 (Build): Core working functionality & API integrations by 75% sprint time.</div>
            <div>&bull; Milestone 3 (Demo): Live deployment link and 2-minute Loom/video presentation by 100% sprint deadline.</div>
          </div>
        </div>
      )}

      <RegisterSprintProjectModal
        isOpen={registerModalOpen}
        eventId={event.id}
        eventName={event.name}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={(newProjId) => {
          navigate(`/projects/${newProjId}`);
        }}
      />

      <InviteParticipantModal
        isOpen={!!invitingParticipant}
        participant={invitingParticipant}
        eventProjects={event.projects || []}
        onClose={() => setInvitingParticipant(null)}
        onSuccess={() => void loadEvent()}
      />
    </div>
  );
};
