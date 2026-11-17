import React from 'react';
import { Badge, IcoAlert, IcoUsers, IcoEdit, IcoClock, IcoFile } from '../../../design-system/components';

export interface ProjectGapItem {
  id: string;
  projectId: string;
  roleTitle: string;
  skills: string[];
  targetProficiency: string;
  hoursPerWeek: number;
  status: 'open' | 'filled' | 'cancelled';
  origin: 'member_left' | 'inactive' | 'manual';
  departedUserId?: string | null;
  createdAt: string;
}

export interface InactiveMemberItem {
  memberId: string;
  userId: string;
  email: string;
  role: string;
  inactiveDays: number;
  thresholdDays: number;
}

interface RescueBannerProps {
  gaps: ProjectGapItem[];
  inactiveMembers?: InactiveMemberItem[];
  isOwner: boolean;
  onFindReplacement: (gap: ProjectGapItem) => void;
  onEditGap: (gap: ProjectGapItem) => void;
  onOpenHandover: (gap: ProjectGapItem) => void;
  onOpenTimeline: (gap: ProjectGapItem) => void;
  onDeclareGapForInactive?: (member: InactiveMemberItem) => void;
}

export const RescueBanner: React.FC<RescueBannerProps> = ({
  gaps,
  inactiveMembers = [],
  isOwner,
  onFindReplacement,
  onEditGap,
  onOpenHandover,
  onOpenTimeline,
  onDeclareGapForInactive
}) => {
  const openGaps = gaps.filter(g => g.status === 'open');

  if (openGaps.length === 0 && inactiveMembers.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
      {/* Inactive Member Warning Alert (if any detected) */}
      {isOwner && inactiveMembers.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(180, 83, 9, 0.08))',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#2a1e12',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
              flexShrink: 0
            }}>
              <IcoAlert size={16} color="#f59e0b" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <strong style={{ color: '#ffffff', fontSize: 13.5 }}>
                  Inactivity Alert: Team Stall Risk Detected
                </strong>
                <Badge className="bg-[#2a1e12] text-[#f59e0b] border-amber-600/40">
                  {inactiveMembers.length} Inactive Member{inactiveMembers.length > 1 ? 's' : ''}
                </Badge>
              </div>
              <p style={{ margin: 0, fontSize: 12.5, color: '#aba6b6' }}>
                {inactiveMembers.map(m => `${m.email} (${m.role}) - ${m.inactiveDays} days inactive`).join(', ')}.
                Propose a replacement to avoid project delay.
              </p>
            </div>
          </div>

          {onDeclareGapForInactive && (
            <button
              onClick={() => onDeclareGapForInactive(inactiveMembers[0])}
              style={{
                padding: '6px 14px',
                background: '#f59e0b',
                color: '#0b0b0e',
                border: 'none',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all .15s'
              }}
            >
              Propose Replacement Gap
            </button>
          )}
        </div>
      )}

      {/* Open Gap Banners */}
      {openGaps.map(gap => (
        <div
          key={gap.id}
          style={{
            background: 'linear-gradient(135deg, rgba(136, 97, 220, 0.18), rgba(21, 21, 26, 0.95))',
            border: '1px solid rgba(136, 97, 220, 0.4)',
            borderRadius: 14,
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            {/* Left side: Icon, title, badges */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#221a36',
                border: '1px solid rgba(136, 97, 220, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b29af5',
                flexShrink: 0
              }}>
                <IcoAlert size={18} color="#b29af5" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
                    Open Gap: {gap.roleTitle} Needed
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    background: '#221a36',
                    color: '#b29af5',
                    border: '1px solid rgba(136, 97, 220, 0.4)'
                  }}>
                    Active Rescue
                  </span>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: gap.origin === 'member_left' ? '#2c1518' : '#19191e',
                    color: gap.origin === 'member_left' ? '#fb7185' : '#aba6b6',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {gap.origin === 'member_left' ? 'Departed Member' : gap.origin === 'inactive' ? 'Inactivity' : 'Manual Gap'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, fontSize: 12, color: '#aba6b6' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IcoClock size={13} color="#b29af5" /> {gap.hoursPerWeek} hrs/week
                  </span>
                  <span>
                    Proficiency: <strong style={{ color: '#f0edf5' }}>{gap.targetProficiency}</strong>
                  </span>
                  {gap.skills && gap.skills.length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      Skills:
                      {gap.skills.slice(0, 4).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#19191e',
                            color: '#b29af5',
                            border: '1px solid rgba(136, 97, 220, 0.3)',
                            padding: '1px 6px',
                            borderRadius: 4,
                            fontSize: 10.5
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <button
                onClick={() => onFindReplacement(gap)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  background: '#b29af5',
                  color: '#0b0b0e',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                <IcoUsers size={14} color="#0b0b0e" />
                Find Replacement
              </button>

              {isOwner && (
                <button
                  onClick={() => onEditGap(gap)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '7px 12px',
                    background: '#1a1922',
                    color: '#f0edf5',
                    border: '1px solid #3a3a48',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all .15s'
                  }}
                >
                  <IcoEdit size={13} color="#b29af5" />
                  Edit Gap
                </button>
              )}

              <button
                onClick={() => onOpenHandover(gap)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  background: '#1a1922',
                  color: '#f0edf5',
                  border: '1px solid #3a3a48',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                <IcoFile size={13} color="#b29af5" />
                Handover Notes
              </button>

              <button
                onClick={() => onOpenTimeline(gap)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  background: '#1a1922',
                  color: '#aba6b6',
                  border: '1px solid #3a3a48',
                  borderRadius: 8,
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all .15s'
                }}
              >
                Lifecycle
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
