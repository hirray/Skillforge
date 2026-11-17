import React, { useState, useEffect } from 'react';
import { Card, Button, Input, IcoClose, IcoCheck, IcoAlert, IcoPlus } from '../../../design-system/components';
import { ProjectGapItem } from './RescueBanner';

interface GapWizardModalProps {
  projectId: string;
  project?: any;
  gap?: ProjectGapItem | null;
  initialRole?: string;
  initialOrigin?: 'member_left' | 'inactive' | 'manual';
  departedUserId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const GapWizardModal: React.FC<GapWizardModalProps> = ({
  projectId,
  project: _project,
  gap,
  initialRole = '',
  initialOrigin = 'manual',
  departedUserId,
  onClose,
  onSuccess
}) => {
  const currentUserId = localStorage.getItem('token') || 'user-001';
  const isEditing = Boolean(gap && gap.id);

  // Step 1: Gap Definition
  const [roleTitle, setRoleTitle] = useState(gap?.roleTitle || initialRole || '');
  const [targetProficiency, setTargetProficiency] = useState(gap?.targetProficiency || 'intermediate');
  const [hoursPerWeek, setHoursPerWeek] = useState(gap?.hoursPerWeek || 15);
  const [skills, setSkills] = useState<string[]>(gap?.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // Step 2: Handover Notes
  const [workState, setWorkState] = useState('');
  const [repoInfo, setRepoInfo] = useState('');
  const [decisions, setDecisions] = useState('');
  const [candidateSummary, setCandidateSummary] = useState('');
  const [unfinishedTasks, setUnfinishedTasks] = useState<string[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);

  // States
  const [activeStep, setActiveStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Fetch project tasks to auto-list unfinished tasks
  useEffect(() => {
    fetch(`/api/v1/projects/${projectId}/tasks`, {
      headers: { Authorization: `Bearer ${currentUserId}` }
    })
      .then(r => r.json())
      .then(d => {
        const tasks = d.data || [];
        setAvailableTasks(tasks);
        // Auto-select tasks flagged with needsReassignment or assigned to departed member
        const autoSelected = tasks
          .filter((t: any) => t.needsReassignment || (departedUserId && t.assigneeId === departedUserId))
          .map((t: any) => t.id || t.title);
        if (autoSelected.length > 0) {
          setUnfinishedTasks(autoSelected);
        }
      })
      .catch(() => {});
  }, [projectId, currentUserId, departedUserId]);

  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (!val) return;
    if (!skills.includes(val)) {
      setSkills([...skills, val]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const toggleTaskSelection = (taskId: string) => {
    if (unfinishedTasks.includes(taskId)) {
      setUnfinishedTasks(unfinishedTasks.filter(id => id !== taskId));
    } else {
      setUnfinishedTasks([...unfinishedTasks, taskId]);
    }
  };

  const handleSubmit = async (merge = false) => {
    if (!roleTitle.trim()) {
      setError('Role title is required');
      return;
    }

    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      if (isEditing && gap) {
        // Update gap
        const res = await fetch(`/api/v1/projects/${projectId}/gaps/${gap.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
          body: JSON.stringify({
            roleTitle,
            skills,
            targetProficiency,
            hoursPerWeek
          })
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to update gap');

        // If handover was provided in step 2, save handover
        if (workState.trim() || candidateSummary.trim()) {
          await fetch(`/api/v1/projects/${projectId}/handover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
            body: JSON.stringify({
              gapId: gap.id,
              workState: workState || 'Work in progress',
              unfinishedTasks,
              repoInfo: repoInfo || null,
              decisions: decisions || null,
              candidateSummary: candidateSummary || `${roleTitle} replacement required`
            })
          });
        }
      } else {
        // Create new gap
        const res = await fetch(`/api/v1/projects/${projectId}/gaps`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
          body: JSON.stringify({
            roleTitle,
            skills,
            targetProficiency,
            hoursPerWeek,
            origin: initialOrigin,
            departedUserId: departedUserId || null,
            merge
          })
        });

        const data = await res.json();
        if (!res.ok || data.error) {
          if (data.error?.code === 'DUPLICATE_GAP_WARNING') {
            setDuplicateWarning(data.error.message);
            setLoading(false);
            return;
          }
          throw new Error(data.error?.message || 'Failed to create gap');
        }

        const createdGap = data.data;

        // If handover was provided in step 2, attach handover note
        if (createdGap?.id && (workState.trim() || candidateSummary.trim())) {
          await fetch(`/api/v1/projects/${projectId}/handover`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUserId}` },
            body: JSON.stringify({
              gapId: createdGap.id,
              workState: workState || 'Work in progress',
              unfinishedTasks,
              repoInfo: repoInfo || null,
              decisions: decisions || null,
              candidateSummary: candidateSummary || `${roleTitle} replacement required`
            })
          });
        }
      }

      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 60, padding: 20
    }}>
      <Card style={{
        width: '100%', maxWidth: 640, background: '#15151a', border: '1px solid #33333e',
        color: '#f0edf5', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #26262e',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#ffffff' }}>
              {isEditing ? 'Edit Rescue Gap' : 'Project Rescue: Define Critical Gap'}
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#aba6b6' }}>
              Define the open position and capture essential handover context for potential replacements.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#aba6b6', cursor: 'pointer', padding: 4 }}
          >
            <IcoClose size={16} />
          </button>
        </div>

        {/* Step Indicator Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #26262e', background: '#111114' }}>
          <button
            onClick={() => setActiveStep(1)}
            style={{
              flex: 1, padding: '11px 16px', border: 'none', background: 'none',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              color: activeStep === 1 ? '#b29af5' : '#aba6b6',
              borderBottom: activeStep === 1 ? '2px solid #b29af5' : '2px solid transparent',
              transition: 'all .15s'
            }}
          >
            1. Gap Requirements
          </button>
          <button
            onClick={() => setActiveStep(2)}
            style={{
              flex: 1, padding: '11px 16px', border: 'none', background: 'none',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              color: activeStep === 2 ? '#b29af5' : '#aba6b6',
              borderBottom: activeStep === 2 ? '2px solid #b29af5' : '2px solid transparent',
              transition: 'all .15s'
            }}
          >
            2. Handover & Context
          </button>
        </div>

        {/* Body content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{
              background: '#2c1518', border: '1px solid #fb718550', color: '#fb7185',
              padding: '10px 14px', borderRadius: 8, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8
            }}>
              <IcoAlert size={15} color="#fb7185" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div style={{
              background: '#2a1e12', border: '1px solid #f59e0b50', color: '#f59e0b',
              padding: '12px 16px', borderRadius: 10, fontSize: 12.5
            }}>
              <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{duplicateWarning}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button size="sm" onClick={() => handleSubmit(true)} disabled={loading}>
                  Merge with Existing Gap
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDuplicateWarning(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* STEP 1: Gap Definition */}
          {activeStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 5 }}>
                  Role Title *
                </label>
                <Input
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. ML Engineer, Backend Lead, UI/UX Designer"
                  className="w-full"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 5 }}>
                    Target Proficiency
                  </label>
                  <select
                    value={targetProficiency}
                    onChange={(e) => setTargetProficiency(e.target.value)}
                    style={{
                      width: '100%', padding: '9px 12px', background: '#1a1922', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 13, outline: 'none'
                    }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 5 }}>
                    Expected Time (Hours / Week)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(parseInt(e.target.value, 10) || 10)}
                    style={{
                      width: '100%', padding: '9px 12px', background: '#1a1922', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 13, outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 5 }}>
                  Required Skills & Technologies
                </label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                    placeholder="Add skill (e.g. PyTorch, React, Docker)..."
                    className="flex-1"
                  />
                  <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                    <IcoPlus size={13} /> Add
                  </Button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 34 }}>
                  {skills.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#aba6b6', fontStyle: 'italic' }}>
                      No skills added yet. Candidate matcher uses these to find replacements.
                    </span>
                  ) : (
                    skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          background: '#221a36', color: '#b29af5', border: '1px solid #8861dc50',
                          padding: '3px 9px', borderRadius: 16, fontSize: 11.5, fontWeight: 600,
                          display: 'inline-flex', alignItems: 'center', gap: 6
                        }}
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(s)}
                          style={{ background: 'none', border: 'none', color: '#b29af5', cursor: 'pointer', padding: 0 }}
                        >
                          <IcoClose size={11} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Handover & Context */}
          {activeStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                  Summary for Candidates (Public at invitation time) *
                </label>
                <textarea
                  rows={2}
                  value={candidateSummary}
                  onChange={(e) => setCandidateSummary(e.target.value)}
                  placeholder="Short, inviting overview shown to candidates before they decide to accept (e.g. Taking ownership of the core ML inference pipeline with preprocessed dataset ready)."
                  style={{
                    width: '100%', padding: '9px 12px', background: '#1a1922', border: '1px solid #33333e',
                    borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                  Current Work State (Full handover - unlocked after acceptance)
                </label>
                <textarea
                  rows={3}
                  value={workState}
                  onChange={(e) => setWorkState(e.target.value)}
                  placeholder="Document current status, what has been finished, what is currently blocking, and immediate next steps."
                  style={{
                    width: '100%', padding: '9px 12px', background: '#1a1922', border: '1px solid #33333e',
                    borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none', resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 6 }}>
                  Unfinished Tasks (Select tasks requiring reassignment)
                </label>
                <div style={{
                  maxHeight: 140, overflowY: 'auto', background: '#111114',
                  border: '1px solid #26262e', borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  {availableTasks.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#aba6b6', padding: '6px 8px' }}>No project tasks found.</span>
                  ) : (
                    availableTasks.map(t => {
                      const isSelected = unfinishedTasks.includes(t.id || t.title);
                      return (
                        <div
                          key={t.id}
                          onClick={() => toggleTaskSelection(t.id || t.title)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                            background: isSelected ? '#221a36' : 'transparent',
                            border: isSelected ? '1px solid #8861dc50' : '1px solid transparent',
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
                            <span style={{ fontWeight: isSelected ? 600 : 400 }}>{t.title}</span>
                          </div>
                          <span style={{ fontSize: 10.5, opacity: 0.7 }}>{t.status || 'To Do'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                    Repository & Branch Info
                  </label>
                  <input
                    type="text"
                    value={repoInfo}
                    onChange={(e) => setRepoInfo(e.target.value)}
                    placeholder="e.g. branch: feature/ml-pipeline, run scripts/setup"
                    style={{
                      width: '100%', padding: '9px 12px', background: '#1a1922', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#f0edf5', marginBottom: 4 }}>
                    Key Architectural Decisions
                  </label>
                  <input
                    type="text"
                    value={decisions}
                    onChange={(e) => setDecisions(e.target.value)}
                    placeholder="e.g. Decided on PyTorch for dynamic batching"
                    style={{
                      width: '100%', padding: '9px 12px', background: '#1a1922', border: '1px solid #33333e',
                      borderRadius: 8, color: '#f0edf5', fontSize: 12.5, outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #26262e', background: '#111114',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            {activeStep === 2 && (
              <Button size="sm" variant="outline" onClick={() => setActiveStep(1)}>
                Back to Gap Definition
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {activeStep === 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                style={{
                  padding: '7px 16px', background: '#b29af5', color: '#0b0b0e', border: 'none',
                  borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer'
                }}
              >
                Next: Handover Notes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                style={{
                  padding: '7px 18px', background: '#b29af5', color: '#0b0b0e', border: 'none',
                  borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Saving…' : isEditing ? 'Save Changes' : 'Open Rescue Gap'}
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
