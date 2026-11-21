import React, { useState, useEffect } from 'react';
import {
  Button,
  IcoSpark,
  IcoCheck,
} from '../../design-system/components';
import { api, token } from '../ai/client';
import { MentorFeedback, MentorshipRequest } from '@skillforge/contract';
import { Link } from 'react-router-dom';

interface Props {
  projectId: string;
}

export const MentorAdvisorySection: React.FC<Props> = ({ projectId }) => {
  const [feedbacks, setFeedbacks] = useState<MentorFeedback[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [milestones, setMilestones] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Composer state
  const [newFeedbackText, setNewFeedbackText] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('');

  const currentUserId = token();

  const loadData = async () => {
    setLoading(true);
    try {
      const [fbRes, reqRes, msRes] = await Promise.all([
        api<MentorFeedback[]>(`/projects/${projectId}/mentor-feedback`),
        api<MentorshipRequest[]>(`/projects/${projectId}/mentor-requests`).catch(() => []),
        api<any>(`/projects/${projectId}/milestones`).catch(() => ({ milestones: [] })),
      ]);
      setFeedbacks(fbRes || []);
      setRequests(reqRes || []);
      setMilestones(msRes.milestones || msRes.data || msRes || []);
    } catch (err: any) {
      console.warn('Failed to load mentor section:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [projectId]);

  // Check if current user is an accepted mentor on this project
  const isAcceptedMentor = requests.some(
    (r) => r.mentorId === currentUserId && r.status === 'accepted'
  );

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText.trim() || newFeedbackText.length < 5) {
      setError('Feedback note must be at least 5 characters.');
      return;
    }

    setPosting(true);
    setError(null);

    try {
      await api(`/projects/${projectId}/mentor-feedback`, {
        method: 'POST',
        body: JSON.stringify({
          text: newFeedbackText.trim(),
          milestoneId: selectedMilestoneId || null,
        }),
      });
      setNewFeedbackText('');
      setSelectedMilestoneId('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit advisory feedback');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#15151a',
        border: '1px solid #282836',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(251, 237, 176, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FBEDB0',
            }}
          >
            <IcoSpark size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#f4f4f5' }}>
                Mentor & Advisory Insights
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#FBEDB0',
                  color: '#78350F',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Advisory Only
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#a1a1aa', margin: '2px 0 0 0' }}>
              Independent architectural feedback from verified mentors. Advisory guidance does not gate completion.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/mentors">
            <Button variant="secondary" size="sm">
              Explore Mentor Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Active Mentors on Project */}
      {requests.filter(r => r.status === 'accepted').length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 14px',
            backgroundColor: '#1b1b22',
            borderRadius: '10px',
            fontSize: '12px',
            color: '#d4d4d8',
          }}
        >
          <span style={{ fontWeight: 600, color: '#a1a1aa' }}>Advisory Mentors:</span>
          {requests.filter(r => r.status === 'accepted').map(r => (
            <span
              key={r.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                backgroundColor: 'rgba(147, 178, 248, 0.12)',
                color: '#93B2F8',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              <IcoCheck size={12} />
              {r.mentor?.email || r.mentorId}
            </span>
          ))}
        </div>
      )}

      {/* Inline Feedback Composer for accepted mentors */}
      {isAcceptedMentor && (
        <div
          style={{
            backgroundColor: '#1b1b22',
            border: '1px solid #2c2c3b',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f4f4f5' }}>
              Add Advisory Guidance (as Mentor)
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#FBEDB0',
                color: '#78350F',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              Advisory
            </span>
          </div>

          {error && (
            <div style={{ fontSize: '12px', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {milestones.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#a1a1aa' }}>Tag Milestone:</span>
                <select
                  value={selectedMilestoneId}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  style={{
                    backgroundColor: '#15151a',
                    border: '1px solid #282836',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                >
                  <option value="">General Project Architecture</option>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              rows={3}
              placeholder="Leave architectural feedback, recommendations, design critiques, or suggested resources..."
              value={newFeedbackText}
              onChange={(e) => setNewFeedbackText(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#15151a',
                border: '1px solid #282836',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '13px',
                color: '#fff',
                resize: 'vertical',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" size="sm" type="submit" disabled={posting}>
                {posting ? 'Posting...' : 'Post Advisory Feedback'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Feedbacks List */}
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#a1a1aa', fontSize: '13px' }}>
          Loading advisory feedback...
        </div>
      ) : feedbacks.length === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#a1a1aa',
            border: '1px dashed #282836',
            borderRadius: '12px',
            backgroundColor: '#181820',
          }}
        >
          <IcoSpark size={22} color="#FBEDB0" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', color: '#e4e4e7', fontWeight: 500 }}>No Advisory Notes Yet</div>
          <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>
            Project owners can request technical mentors to review the codebase and milestone delivery.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              style={{
                backgroundColor: '#1b1b22',
                border: '1px solid #282836',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: '#f4f4f5' }}>
                    {fb.mentor?.email || fb.mentorId}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: '#FBEDB0',
                      color: '#78350F',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Advisory
                  </span>
                  {fb.milestone?.title && (
                    <span
                      style={{
                        fontSize: '11px',
                        backgroundColor: 'rgba(147, 178, 248, 0.12)',
                        color: '#93B2F8',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Milestone: {fb.milestone.title}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                  {new Date(fb.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: '#d4d4d8',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {fb.text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
