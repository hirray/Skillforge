import React from 'react';
import { Card, Button, IcoClose, IcoCheck, IcoAlert, IcoUsers, IcoMail } from '../../../design-system/components';
import { ProjectGapItem } from './RescueBanner';

interface GapTimelineModalProps {
  gap: ProjectGapItem;
  onClose: () => void;
}

export const GapTimelineModal: React.FC<GapTimelineModalProps> = ({ gap, onClose }) => {
  const isFilled = gap.status === 'filled';
  const isCancelled = gap.status === 'cancelled';
  const isOpen = gap.status === 'open';

  const stages = [
    {
      id: 'opened',
      title: 'Gap Opened',
      desc: gap.origin === 'member_left'
        ? 'Automatic gap triggered when outgoing member departed.'
        : gap.origin === 'inactive'
        ? 'Inactivity detection prompted creation of rescue gap.'
        : 'Gap declared manually by project owner.',
      date: new Date(gap.createdAt).toLocaleString(),
      isDone: true,
      current: false,
      icon: <IcoAlert size={14} color="#ffffff" />
    },
    {
      id: 'reviewed',
      title: 'Candidates Evaluated',
      desc: `Talent pool searched for ${gap.skills.join(', ') || 'skills'} at ${gap.targetProficiency} proficiency.`,
      date: 'Available on platform',
      isDone: true,
      current: false,
      icon: <IcoUsers size={14} color="#ffffff" />
    },
    {
      id: 'invited',
      title: 'Context-First Invitations',
      desc: 'Invitations carry verified candidate summary and project expectations before acceptance.',
      date: isOpen ? 'Active recruiting' : 'Completed',
      isDone: isFilled,
      current: isOpen,
      icon: <IcoMail size={14} color={isFilled ? '#ffffff' : '#0b0b0e'} />
    },
    {
      id: 'filled',
      title: isCancelled ? 'Gap Cancelled' : 'Replacement Onboarded',
      desc: isCancelled
        ? 'The gap was cancelled by project owner.'
        : isFilled
        ? 'Invitation accepted or role filled. Full handover notes unlocked.'
        : 'Awaiting candidate acceptance to complete team recovery.',
      date: isFilled ? 'Filled' : isCancelled ? 'Cancelled' : 'Pending response',
      isDone: isFilled,
      current: isFilled,
      icon: <IcoCheck size={14} color="#ffffff" />
    }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 60, padding: 20
    }}>
      <Card style={{
        width: '100%', maxWidth: 580, background: '#15151a', border: '1px solid #33333e',
        color: '#f0edf5', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #26262e',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Gap Recovery Lifecycle: {gap.roleTitle}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aba6b6' }}>
              Track the rescue workflow from initial trigger to candidate onboarding.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#aba6b6', cursor: 'pointer', padding: 4 }}
          >
            <IcoClose size={16} />
          </button>
        </div>

        {/* Timeline body */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {/* Timeline vertical bar */}
            <div style={{
              position: 'absolute', left: 13, top: 12, bottom: 24, width: 2,
              background: '#26262e'
            }} />

            {stages.map((stage, idx) => (
              <div key={stage.id} style={{ position: 'relative', marginBottom: idx === stages.length - 1 ? 0 : 28 }}>
                {/* Node icon */}
                <div style={{
                  position: 'absolute', left: -32, top: 0, width: 28, height: 28, borderRadius: '50%',
                  background: stage.isDone
                    ? '#10B981'
                    : stage.current
                    ? '#b29af5'
                    : '#1a1922',
                  border: stage.isDone || stage.current
                    ? '2px solid #15151a'
                    : '2px solid #33333e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: stage.current ? '0 0 12px rgba(178, 154, 245, 0.4)' : 'none',
                  zIndex: 2
                }}>
                  {stage.icon}
                </div>

                {/* Content card */}
                <div style={{
                  background: stage.current ? '#1c1b26' : '#19191e',
                  border: `1px solid ${stage.current ? '#8861dc50' : '#33333e'}`,
                  borderRadius: 10, padding: '12px 16px',
                  boxShadow: stage.current ? '0 4px 16px rgba(0,0,0,0.3)' : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: stage.current ? '#b29af5' : '#ffffff' }}>
                      {stage.title}
                    </span>
                    <span style={{ fontSize: 11, color: '#aba6b6' }}>
                      {stage.date}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#aba6b6', lineHeight: 1.5 }}>
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #26262e', background: '#111114',
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
