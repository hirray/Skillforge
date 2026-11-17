import React, { useState, useEffect } from 'react';
import { Card, Button, SkeletonLoader, IcoClose, IcoFile, IcoCheck, IcoAlert } from '../../../design-system/components';
import { ProjectGapItem } from './RescueBanner';

interface HandoverModalProps {
  projectId: string;
  project?: any;
  gap?: ProjectGapItem | null;
  isOwner?: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  projectId,
  project: _project,
  gap,
  isOwner: _isOwner,
  onClose,
  onUpdated
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';

  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Note Mode
  const [showAddForm, setShowAddForm] = useState(false);
  const [workState, setWorkState] = useState('');
  const [repoInfo, setRepoInfo] = useState('');
  const [decisions, setDecisions] = useState('');
  const [candidateSummary, setCandidateSummary] = useState('');
  const [unfinishedTasks, setUnfinishedTasks] = useState<string[]>([]);
  const [projectTasks, setProjectTasks] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHandoverNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = gap
        ? `/api/v1/projects/${projectId}/handover?gapId=${gap.id}`
        : `/api/v1/projects/${projectId}/handover`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${currentUserId}` }
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to load handover notes');
      setNotes(data.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${currentUserId}` }
      });
      const data = await res.json();
      const list = data.data || [];
      setProjectTasks(list);
      // Auto-preselect tasks that need reassignment
      const needed = list.filter((t: any) => t.needsReassignment).map((t: any) => t.id || t.title);
      setUnfinishedTasks(needed);
    } catch {}
  };

  useEffect(() => {
    fetchHandoverNotes();
    fetchTasks();
  }, [projectId, gap?.id]);

  const handleSaveNote = async () => {
    if (!workState.trim() || !candidateSummary.trim()) {
      alert('Please fill out both the Work State and the Candidate Summary.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
        body: JSON.stringify({
          gapId: gap?.id || null,
          workState: workState.trim(),
          unfinishedTasks,
          repoInfo: repoInfo.trim() || null,
          decisions: decisions.trim() || null,
          candidateSummary: candidateSummary.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to save handover note');

      setShowAddForm(false);
      setWorkState('');
      setRepoInfo('');
      setDecisions('');
      setCandidateSummary('');
      fetchHandoverNotes();
      if (onUpdated) onUpdated();
    } catch (e: any) {
      alert(`Error saving handover note: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = (taskId: string) => {
    if (unfinishedTasks.includes(taskId)) {
      setUnfinishedTasks(unfinishedTasks.filter(id => id !== taskId));
    } else {
      setUnfinishedTasks([...unfinishedTasks, taskId]);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 60, padding: 20
    }}>
      <Card style={{
        width: '100%', maxWidth: 740, background: '#15151a', border: '1px solid #33333e',
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
                Handover Notes {gap ? `• ${gap.roleTitle}` : ''}
              </h2>
              <span style={{
                background: '#221a36', color: '#b29af5', border: '1px solid #8861dc50',
                padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600
              }}>
                Project Knowledge Base
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#aba6b6' }}>
              Preserves project state, pending tasks, repository instructions, and architectural decisions.
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
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              background: '#2c1518', border: '1px solid #fb718550', color: '#fb7185',
              padding: '12px 16px', borderRadius: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <IcoAlert size={16} color="#fb7185" />
              <span>{error}</span>
            </div>
          )}

          {showAddForm ? (
            /* Add Handover Note Form */
            <div style={{ background: '#19191e', border: '1px solid #33333e', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#ffffff' }}>Document Handover</h3>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                  Candidate Summary (Visible before invitation acceptance) *
                </label>
                <textarea
                  rows={2}
                  value={candidateSummary}
                  onChange={(e) => setCandidateSummary(e.target.value)}
                  placeholder="Summary of responsibilities and scope shown to candidates at invitation time..."
                  style={{
                    width: '100%', padding: '9px 12px', background: '#111114', border: '1px solid #33333e',
                    borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                  Current Work State (Detailed status and next steps) *
                </label>
                <textarea
                  rows={3}
                  value={workState}
                  onChange={(e) => setWorkState(e.target.value)}
                  placeholder="What is completed, what is in flight, what blockers exist..."
                  style={{
                    width: '100%', padding: '9px 12px', background: '#111114', border: '1px solid #33333e',
                    borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                  Unfinished Tasks (Select tasks requiring handover)
                </label>
                <div style={{
                  maxHeight: 120, overflowY: 'auto', background: '#111114',
                  border: '1px solid #26262e', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  {projectTasks.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#aba6b6', padding: '4px 6px' }}>No project tasks found.</span>
                  ) : (
                    projectTasks.map(t => {
                      const isSelected = unfinishedTasks.includes(t.id || t.title);
                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleTask(t.id || t.title)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '5px 8px', borderRadius: 6, cursor: 'pointer',
                            background: isSelected ? '#221a36' : 'transparent',
                            color: isSelected ? '#ffffff' : '#aba6b6', fontSize: 12
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                              width: 14, height: 14, borderRadius: 4,
                              border: isSelected ? '1px solid #b29af5' : '1px solid #3a3a48',
                              background: isSelected ? '#b29af5' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {isSelected && <IcoCheck size={10} color="#0b0b0e" />}
                            </div>
                            <span>{t.title}</span>
                          </div>
                          <span style={{ fontSize: 11, opacity: 0.6 }}>{t.status || 'To Do'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                    Repository & Branch Info
                  </label>
                  <input
                    type="text"
                    value={repoInfo}
                    onChange={(e) => setRepoInfo(e.target.value)}
                    placeholder="e.g. branch: feature/pipeline, use dev DB"
                    style={{
                      width: '100%', padding: '8px 12px', background: '#111114', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                    Key Architecture Decisions
                  </label>
                  <input
                    type="text"
                    value={decisions}
                    onChange={(e) => setDecisions(e.target.value)}
                    placeholder="e.g. Chose FastAPI for WebSocket support"
                    style={{
                      width: '100%', padding: '8px 12px', background: '#111114', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <button
                  onClick={handleSaveNote}
                  disabled={isSubmitting}
                  style={{
                    padding: '6px 16px', background: '#b29af5', color: '#0b0b0e', border: 'none',
                    borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  {isSubmitting ? 'Saving…' : 'Save Handover Note'}
                </button>
              </div>
            </div>
          ) : null}

          {/* List of notes */}
          {loading ? (
            <SkeletonLoader type="card" count={2} />
          ) : notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#aba6b6' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#221a36', border: '1px solid #8861dc40', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#b29af5' }}>
                <IcoFile size={22} color="#b29af5" />
              </div>
              <h4 style={{ color: '#ffffff', fontSize: 14, margin: '0 0 6px', fontWeight: 600 }}>No Handover Notes Yet</h4>
              <p style={{ fontSize: 12.5, margin: '0 0 16px', maxWidth: 380, marginInline: 'auto' }}>
                Capture progress, pending tasks, and instructions so incoming teammates or replacements can step in smoothly.
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '7px 16px', background: '#b29af5', color: '#0b0b0e', border: 'none',
                  borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Create Handover Note
              </button>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: '#19191e', border: '1px solid #33333e', borderRadius: 12,
                  padding: 18, display: 'flex', flexDirection: 'column', gap: 12
                }}
              >
                {/* Note Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>
                      Handover Documentation
                    </span>
                    <span style={{ fontSize: 11, color: '#aba6b6' }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11, background: '#221a36', color: '#b29af5',
                    padding: '2px 8px', borderRadius: 10, border: '1px solid #8861dc40'
                  }}>
                    {note.gapId ? 'Gap Linked' : 'General'}
                  </span>
                </div>

                {/* Candidate Summary */}
                <div style={{ background: '#121216', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#b29af5', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 3 }}>
                    Candidate Summary (Invitation Preview)
                  </span>
                  <p style={{ margin: 0, fontSize: 12.5, color: '#f0edf5', lineHeight: 1.5 }}>
                    {note.candidateSummary}
                  </p>
                </div>

                {/* Full Details (if authorized) */}
                {note.workState && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#aba6b6', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 4 }}>
                      Current Work State
                    </span>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#aba6b6', lineHeight: 1.6 }}>
                      {note.workState}
                    </p>
                  </div>
                )}

                {/* Unfinished tasks */}
                {note.unfinishedTasks && note.unfinishedTasks.length > 0 && (
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#aba6b6', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>
                      Unfinished Tasks
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {note.unfinishedTasks.map((tId: string, idx: number) => (
                        <span
                          key={idx}
                          style={{
                            background: '#221a36', color: '#b29af5', border: '1px solid #8861dc50',
                            padding: '3px 9px', borderRadius: 6, fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5
                          }}
                        >
                          <IcoCheck size={11} color="#b29af5" />
                          <span>{tId}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Repo info & Architecture Decisions */}
                {(note.repoInfo || note.decisions) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 6, borderTop: '1px solid #26262e' }}>
                    {note.repoInfo && (
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#aba6b6', display: 'block', marginBottom: 2 }}>
                          Repository Instructions
                        </span>
                        <code style={{ fontSize: 11.5, color: '#6ad4bb', background: '#111114', padding: '3px 6px', borderRadius: 4, display: 'block' }}>
                          {note.repoInfo}
                        </code>
                      </div>
                    )}
                    {note.decisions && (
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#aba6b6', display: 'block', marginBottom: 2 }}>
                          Architectural Decisions
                        </span>
                        <span style={{ fontSize: 12, color: '#f0edf5' }}>
                          {note.decisions}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #26262e', background: '#111114',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '6px 14px', background: '#1a1922', color: '#b29af5', border: '1px solid #8861dc50',
                  borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer'
                }}
              >
                + Add Handover Note
              </button>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};
