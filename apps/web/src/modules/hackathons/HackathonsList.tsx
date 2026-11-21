import React, { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  IcoRocket,
  IcoClock,
  IcoUsers,
} from '../../design-system/components';
import { api } from '../ai/client';
import { HackathonEvent } from '@skillforge/contract';
import { useNavigate } from 'react-router-dom';
import { CreateHackathonModal } from './CreateHackathonModal';

export const HackathonsList: React.FC = () => {
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter === 'all' ? '/hackathons' : `/hackathons?status=${statusFilter}`;
      const res = await api<HackathonEvent[]>(url);
      setEvents(res || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load hackathon events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge status="active">Active Sprint</Badge>;
      case 'open':
        return <Badge status="recruiting">Registration Open</Badge>;
      case 'ended':
        return <Badge status="completed">Ended</Badge>;
      case 'archived':
        return <Badge status="archived">Archived</Badge>;
      default:
        return <Badge status="draft">Draft</Badge>;
    }
  };

  const calculateCountdown = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Sprint Concluded';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: 'rgba(241, 185, 76, 0.15)',
                color: '#F1B94C',
              }}
            >
              <IcoRocket size={16} />
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#F1B94C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hackathon & Sprint Mode
            </span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: '#f4f4f5' }}>
            Time-Boxed Sprints & Team Finding
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '6px 0 0 0', maxWidth: '650px' }}>
            Rapid build events over standard project pipelines. Auto-scaffolded scaled sprint milestones (Ideate &bull; Build &bull; Demo), talent pool, and archive-protected team history.
          </p>
        </div>

        <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
          Host New Hackathon / Sprint
        </Button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #282836',
          paddingBottom: '12px',
        }}
      >
        {[
          { id: 'all', label: 'All Sprints' },
          { id: 'running', label: 'Active Now' },
          { id: 'open', label: 'Upcoming / Open' },
          { id: 'ended', label: 'Past Sprints' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: statusFilter === tab.id ? '1px solid #F1B94C' : '1px solid #282836',
              backgroundColor: statusFilter === tab.id ? 'rgba(241, 185, 76, 0.15)' : '#15151a',
              color: statusFilter === tab.id ? '#F1B94C' : '#a1a1aa',
              transition: 'all 150ms ease-out',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '14px 18px',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#a1a1aa' }}>
          Loading sprint events...
        </div>
      ) : events.length === 0 ? (
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
          <IcoRocket size={32} color="#F1B94C" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '17px', color: '#f4f4f5', margin: '0 0 8px 0' }}>No Sprints Found</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>
            Host your own event or check back soon for upcoming hackathons.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                backgroundColor: '#15151a',
                border: '1px solid #282836',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '18px',
                transition: 'transform 150ms ease-out, border-color 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#3c3c52';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#282836';
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(241, 185, 76, 0.12)',
                      color: '#F1B94C',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(241, 185, 76, 0.25)',
                    }}
                  >
                    {ev.theme}
                  </span>
                  {getStatusBadge(ev.status)}
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#f4f4f5', margin: '0 0 8px 0' }}>
                  {ev.name}
                </h3>

                <p style={{ fontSize: '13px', color: '#a1a1aa', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                  {ev.description}
                </p>

                {/* Timing & Metrics */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 14px',
                    backgroundColor: '#1b1b22',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93B2F8' }}>
                    <IcoClock size={13} />
                    <span>{calculateCountdown(ev.endsAt)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#d4d4d8' }}>
                    <IcoUsers size={13} />
                    <span>{ev._count?.participants || 0} participants</span>
                  </div>
                  <div style={{ color: '#a1a1aa' }}>
                    &bull; {ev._count?.projects || 0} teams
                  </div>
                </div>

                {/* Stacks */}
                {ev.suggestedSkillIds && ev.suggestedSkillIds.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {ev.suggestedSkillIds.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#181820',
                          color: '#d4d4d8',
                          border: '1px solid #282836',
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div style={{ borderTop: '1px solid #22222e', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/hackathons/${ev.id}`)}
                >
                  View Sprint Board & Teams
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateHackathonModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadEvents}
      />
    </div>
  );
};
