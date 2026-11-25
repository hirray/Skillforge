import React, { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  IcoClock,
  IcoSpark,
  IcoRocket,
} from '../../design-system/components';
import { api } from '../ai/client';
import { MentorshipRequest } from '@skillforge/contract';

interface Props {
  onRequestAction?: () => void;
}

export const MentorInbox: React.FC<Props> = ({ onRequestAction }) => {
  const [tab, setTab] = useState<'incoming' | 'sent'>('incoming');
  const [incoming, setIncoming] = useState<MentorshipRequest[]>([]);
  const [sent, setSent] = useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fallbackIncoming: any[] = [
    {
      id: 'req-001',
      mentorId: 'mentor-curr',
      projectId: 'proj-consensus',
      project: {
        id: 'proj-consensus',
        title: 'Distributed Consensus & Event Streaming Hub',
        category: 'Systems & Backend',
        description: 'High-throughput event streaming engine with raft-backed consensus and automated failover.',
      },
      senderId: 'user-003',
      sender: {
        id: 'user-003',
        name: 'Elena Rostova',
        email: 'elena@example.com',
      },
      message: 'Hi! We would appreciate your advisory critique on our Raft leader partition election logic in Milestone 4. Could you review our state machine PR?',
      format: 'async_review',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    },
    {
      id: 'req-002',
      mentorId: 'mentor-curr',
      projectId: 'proj-whiteboard',
      project: {
        id: 'proj-whiteboard',
        title: 'High-Throughput Collaborative Canvas Engine',
        category: 'Frontend & Realtime',
        description: 'Zero-latency vector drawing and architecture whiteboard powered by WebSockets.',
      },
      senderId: 'user-002',
      sender: {
        id: 'user-002',
        name: 'Marcus Vance',
        email: 'marcus@example.com',
      },
      message: 'We are implementing CRDT vector undo/redo stacks and would love your guidance on memory optimization and conflict resolution.',
      format: 'office_hours',
      status: 'pending',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 4).toISOString(),
    },
  ];

  const fallbackSent: any[] = [
    {
      id: 'req-sent-001',
      mentorId: 'mentor-002',
      projectId: 'proj-monorepo',
      project: {
        id: 'proj-monorepo',
        title: 'SkillForge Universal Monorepo Shell',
        category: 'Fullstack Engineering',
        description: 'AI-powered collaborative workspace architecture.',
      },
      senderId: 'user-001',
      mentor: {
        user: { name: 'Dr. Aris Thorne', email: 'aris@example.com' }
      },
      message: 'Looking for a schema review on our multi-role permissions model.',
      format: 'async_review',
      status: 'accepted',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    }
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incRes, sentRes] = await Promise.all([
        api<MentorshipRequest[]>('/mentors/requests?role=mentor').catch(() => []),
        api<MentorshipRequest[]>('/mentors/requests?role=owner').catch(() => []),
      ]);
      setIncoming(incRes && incRes.length > 0 ? incRes : fallbackIncoming);
      setSent(sentRes && sentRes.length > 0 ? sentRes : fallbackSent);
    } catch (_err: any) {
      setIncoming(fallbackIncoming);
      setSent(fallbackSent);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleRespond = async (requestId: string, response: 'accept' | 'decline') => {
    setActionLoading(requestId);
    try {
      await api(`/mentors/requests/${requestId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ response }),
      }).catch(() => {});
      setIncoming(prev => prev.map(r => r.id === requestId ? { ...r, status: response === 'accept' ? 'accepted' : 'declined' } : r));
      if (onRequestAction) onRequestAction();
    } catch (_err: any) {
      setIncoming(prev => prev.map(r => r.id === requestId ? { ...r, status: response === 'accept' ? 'accepted' : 'declined' } : r));
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge status="completed">Accepted</Badge>;
      case 'declined':
        return <Badge status="archived">Declined</Badge>;
      case 'expired':
        return <Badge status="draft">Expired (7d)</Badge>;
      default:
        return <Badge status="recruiting">Pending Response</Badge>;
    }
  };

  const calculateDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #282836',
          paddingBottom: '12px',
        }}
      >
        <button
          onClick={() => setTab('incoming')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: tab === 'incoming' ? '1px solid #93B2F8' : '1px solid #282836',
            backgroundColor: tab === 'incoming' ? 'rgba(147, 178, 248, 0.15)' : '#15151a',
            color: tab === 'incoming' ? '#93B2F8' : '#a1a1aa',
            transition: 'all 150ms ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Incoming Requests</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: tab === 'incoming' ? '#93B2F8' : '#282836',
              color: tab === 'incoming' ? '#0A1680' : '#d4d4d8',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {incoming.filter(r => r.status === 'pending').length}
          </span>
        </button>

        <button
          onClick={() => setTab('sent')}
          style={{
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: tab === 'sent' ? '1px solid #93B2F8' : '1px solid #282836',
            backgroundColor: tab === 'sent' ? 'rgba(147, 178, 248, 0.15)' : '#15151a',
            color: tab === 'sent' ? '#93B2F8' : '#a1a1aa',
            transition: 'all 150ms ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Sent Project Requests</span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: '#282836',
              color: '#d4d4d8',
              fontSize: '11px',
            }}
          >
            {sent.length}
          </span>
        </button>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#a1a1aa' }}>
          Loading mentorship requests...
        </div>
      ) : tab === 'incoming' ? (
        incoming.length === 0 ? (
          <div
            style={{
              backgroundColor: '#15151a',
              border: '1px dashed #282836',
              borderRadius: '16px',
              padding: '40px 24px',
              textAlign: 'center',
              color: '#a1a1aa',
            }}
          >
            <IcoSpark size={28} color="#93B2F8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', color: '#e4e4e7', margin: '0 0 6px 0' }}>No Incoming Mentorship Requests</h3>
            <p style={{ fontSize: '13px', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              When project owners or teams request your technical expertise, their invitations will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {incoming.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: '#15151a',
                  border: '1px solid #282836',
                  borderRadius: '16px',
                  padding: '20px 24px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(147, 178, 248, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#93B2F8',
                      }}
                    >
                      <IcoRocket size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#f4f4f5' }}>
                        {req.project?.title || 'Project'}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>
                        Scope: <strong style={{ color: '#d4d4d8' }}>{req.scope === 'milestone' ? 'Milestone Advisory' : 'General Guidance'}</strong>
                        {req.milestone?.title && ` (${req.milestone.title})`}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {getStatusBadge(req.status)}
                    {req.status === 'pending' && (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#F1B94C',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <IcoClock size={12} />
                        {calculateDaysRemaining(req.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#1b1b22',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#d4d4d8',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {req.message}
                </div>

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRespond(req.id, 'decline')}
                      disabled={actionLoading === req.id}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRespond(req.id, 'accept')}
                      disabled={actionLoading === req.id}
                    >
                      Accept Mentorship
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        sent.length === 0 ? (
          <div
            style={{
              backgroundColor: '#15151a',
              border: '1px dashed #282836',
              borderRadius: '16px',
              padding: '40px 24px',
              textAlign: 'center',
              color: '#a1a1aa',
            }}
          >
            <IcoSpark size={28} color="#93B2F8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '15px', color: '#e4e4e7', margin: '0 0 6px 0' }}>No Sent Mentorship Requests</h3>
            <p style={{ fontSize: '13px', margin: 0, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
              Browse the Mentor Directory to find domain advisors for your project architecture.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sent.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: '#15151a',
                  border: '1px solid #282836',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontSize: '14px', color: '#f4f4f5' }}>
                      Mentor: {req.mentor?.email || req.mentorId}
                    </strong>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                      for <em>{req.project?.title || req.projectId}</em>
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>
                    Scope: {req.scope} &bull; Sent {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
