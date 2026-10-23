import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Tabs } from '../../design-system/components';

const rolePresets = [
  'Frontend Developer',
  'Backend Developer',
  'Fullstack Engineer',
  'UI/UX Designer',
  'ML Engineer',
  'Mobile Developer',
  'DevOps / Cloud',
  'Product Manager'
];

const skillPresets = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Next.js',
  'TailwindCSS',
  'GraphQL',
  'Docker',
  'Figma'
];

const CreateProject = () => {
  const [step, setStep] = useState('Basics');
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    problemStatement: '',
    category: 'Web App',
    duration: '',
    targetDate: '',
    minTeamSize: 1,
    maxTeamSize: 5,
    joinMode: 'both',
    memberApprovalMode: 'owner',
    requirements: [],
    roles: [
      { title: 'Frontend Developer', openings: 1 },
      { title: 'Backend Developer', openings: 1 }
    ]
  });

  // Local inputs for adding items
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customRoleOpenings, setCustomRoleOpenings] = useState(1);

  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillType, setCustomSkillType] = useState<'required' | 'preferred'>('required');
  const [customSkillProficiency, setCustomSkillProficiency] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 'Basics') {
      if (!formData.title.trim()) return setError('Title is required');
      setError(null);
      setStep('Scope & Timeline');
    }
    else if (step === 'Scope & Timeline') setStep('Required Capabilities');
    else if (step === 'Required Capabilities') {
      if (formData.roles.length === 0) {
        return setError('Please add at least one open project role.');
      }
      setError(null);
      setStep('Team & Access');
    }
    else if (step === 'Team & Access') setStep('Review');
  };

  const handleBack = () => {
    if (step === 'Scope & Timeline') setStep('Basics');
    else if (step === 'Required Capabilities') setStep('Scope & Timeline');
    else if (step === 'Team & Access') setStep('Required Capabilities');
    else if (step === 'Review') setStep('Team & Access');
  };

  const addRole = (title: string, openings = 1) => {
    if (!title.trim()) return;
    if (formData.roles.some((r: any) => r.title.toLowerCase() === title.trim().toLowerCase())) {
      return setError(`Role "${title}" is already in the list.`);
    }
    setError(null);
    setFormData({
      ...formData,
      roles: [...formData.roles, { title: title.trim(), openings: Math.max(1, openings) }]
    });
    setCustomRoleTitle('');
    setCustomRoleOpenings(1);
  };

  const removeRole = (index: number) => {
    const updated = formData.roles.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, roles: updated });
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (formData.requirements.some((s: any) => s.skill.toLowerCase() === skill.trim().toLowerCase())) {
      return setError(`Skill "${skill}" is already added.`);
    }
    setError(null);
    setFormData({
      ...formData,
      requirements: [
        ...formData.requirements,
        {
          skill: skill.trim(),
          type: customSkillType,
          proficiency: customSkillProficiency
        }
      ]
    });
    setCustomSkillName('');
  };

  const removeSkill = (index: number) => {
    const updated = formData.requirements.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, requirements: updated });
  };

  const handleSubmit = async () => {
    try {
      const payload: any = { ...formData };
      if (!payload.targetDate) delete payload.targetDate;
      if (!payload.description) delete payload.description;
      if (!payload.problemStatement) delete payload.problemStatement;
      if (!payload.duration) delete payload.duration;

      const token = localStorage.getItem('token') || 'user-001';

      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned HTTP ${res.status}: ${text.slice(0, 100)}`);
      }
      if (!res.ok || data.error) throw new Error(data.error?.message || 'Failed to create project');
      navigate(`/projects/${data.data.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-4">Create Project</h1>
        <Tabs 
          tabs={['Basics', 'Scope & Timeline', 'Required Capabilities', 'Team & Access', 'Review']} 
          activeTab={step} 
          onChange={() => {}} 
        />
      </div>
      
      <Card className="p-6">
        {error && <div className="mb-4 p-3 bg-warning/20 border border-warning/40 text-warning rounded-lg text-sm">{error}</div>}
        
        {/* Step 1: Basics */}
        {step === 'Basics' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Project Title"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. AI-Powered Portfolio Builder"
            />
            <Input
              label="One-line Description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="A brief overview of what this project does and aims to achieve"
            />
            <Input
              label="Problem Statement"
              value={formData.problemStatement}
              onChange={e => setFormData({...formData, problemStatement: e.target.value})}
              placeholder="What pain point does this project solve?"
            />
            <div>
              <label className="font-semibold block text-mainText text-sm mb-1">Category</label>
              <select
                className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {['Web App', 'ML', 'Mobile', 'Hardware', 'Research', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Scope & Timeline */}
        {step === 'Scope & Timeline' && (
          <div className="flex flex-col gap-4">
            <Input
              label="Expected Duration"
              value={formData.duration}
              onChange={e => setFormData({...formData, duration: e.target.value})}
              placeholder="e.g. 4 weeks, 2 months, 10 hrs/week"
            />
            <Input
              type="date"
              label="Target Completion Date"
              value={formData.targetDate}
              onChange={e => setFormData({...formData, targetDate: e.target.value})}
            />
            <div>
              <label className="font-semibold block text-mainText text-sm mb-1">Project Stage</label>
              <select
                className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
              >
                {['idea', 'planning', 'in progress', 'near completion'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Required Capabilities (Roles & Skills) */}
        {step === 'Required Capabilities' && (
          <div className="flex flex-col gap-6">
            {/* Roles Section */}
            <div>
              <h3 className="text-base font-bold text-primary mb-1">1. Open Roles Needed</h3>
              <p className="text-xs text-muted mb-3">Define the specific contributor roles you want to recruit for.</p>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                {rolePresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addRole(preset, 1)}
                    className="text-xs px-2.5 py-1 bg-bg border border-uiBorder hover:border-accent hover:text-primary rounded-full transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Custom Role Input */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  className="flex-1 p-2 border border-uiBorder rounded-lg text-sm bg-bg"
                  placeholder="Or enter a custom role name..."
                  value={customRoleTitle}
                  onChange={e => setCustomRoleTitle(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    className="w-20 p-2 border border-uiBorder rounded-lg text-sm bg-bg text-center"
                    title="Openings"
                    value={customRoleOpenings}
                    onChange={e => setCustomRoleOpenings(Number(e.target.value))}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addRole(customRoleTitle, customRoleOpenings)}
                    disabled={!customRoleTitle.trim()}
                  >
                    Add Role
                  </Button>
                </div>
              </div>

              {/* Added Roles List */}
              {formData.roles.length === 0 ? (
                <p className="text-xs text-warning bg-warning/10 p-3 rounded">No roles added yet. Please add at least one role.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {formData.roles.map((r: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-bg rounded-lg border border-uiBorder text-xs">
                      <div>
                        <span className="font-bold text-mainText">{r.title}</span>
                        <span className="text-muted ml-2">({r.openings} opening{r.openings > 1 ? 's' : ''})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRole(idx)}
                        className="text-warning hover:underline ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-uiBorder" />

            {/* Skills Section */}
            <div>
              <h3 className="text-base font-bold text-primary mb-1">2. Required & Preferred Skills</h3>
              <p className="text-xs text-muted mb-3">Add tech stacks or domain skills required for matching.</p>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2 mb-3">
                {skillPresets.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addSkill(preset)}
                    className="text-xs px-2.5 py-1 bg-bg border border-uiBorder hover:border-accent hover:text-primary rounded-full transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
                <input
                  type="text"
                  className="sm:col-span-2 p-2 border border-uiBorder rounded-lg text-sm bg-bg"
                  placeholder="Custom skill name (e.g. AWS, PyTorch)"
                  value={customSkillName}
                  onChange={e => setCustomSkillName(e.target.value)}
                />
                <select
                  className="p-2 border border-uiBorder rounded-lg text-sm bg-bg"
                  value={customSkillType}
                  onChange={(e: any) => setCustomSkillType(e.target.value)}
                >
                  <option value="required">Required</option>
                  <option value="preferred">Preferred</option>
                </select>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-2 border border-uiBorder rounded-lg text-sm bg-bg"
                    value={customSkillProficiency}
                    onChange={(e: any) => setCustomSkillProficiency(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addSkill(customSkillName)}
                    disabled={!customSkillName.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Added Skills List */}
              {formData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.requirements.map((s: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/20 text-primary border border-accent/40 rounded-full text-xs font-semibold">
                      {s.skill} ({s.proficiency}, {s.type})
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-primary hover:text-warning ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Team & Access */}
        {step === 'Team & Access' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min="1"
                label="Min Team Size"
                value={formData.minTeamSize}
                onChange={e => setFormData({...formData, minTeamSize: Number(e.target.value)})}
              />
              <Input
                type="number"
                min="1"
                label="Max Team Size"
                value={formData.maxTeamSize}
                onChange={e => setFormData({...formData, maxTeamSize: Number(e.target.value)})}
              />
            </div>

            <div>
              <label className="font-semibold block text-mainText text-sm mb-1">Join Mode</label>
              <select
                className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                value={formData.joinMode}
                onChange={e => setFormData({...formData, joinMode: e.target.value})}
              >
                <option value="both">Both (Open requests and Owner invites)</option>
                <option value="open">Open (Anyone can request to join)</option>
                <option value="invite">Invite-only (Owner must send invite)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block text-mainText text-sm mb-1">Visibility</label>
              <select
                className="w-full p-2 border border-uiBorder rounded-lg bg-bg text-sm"
                value={formData.visibility}
                onChange={e => setFormData({...formData, visibility: e.target.value})}
              >
                <option value="Public">Public</option>
                <option value="Platform-only">Platform-only</option>
                <option value="Invite-only">Invite-only</option>
                <option value="Private">Private</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 'Review' && (
          <div className="flex flex-col gap-4 text-sm">
            <h3 className="font-bold text-primary text-base">Review Project Configuration</h3>
            
            <div className="bg-bg p-4 rounded-lg border border-uiBorder flex flex-col gap-2">
              <div><strong className="text-primary">Title:</strong> {formData.title}</div>
              <div><strong className="text-primary">Description:</strong> {formData.description || 'None'}</div>
              <div><strong className="text-primary">Category:</strong> {formData.category}</div>
              <div><strong className="text-primary">Duration / Target:</strong> {formData.duration || 'Flexible'} / {formData.targetDate || 'None'}</div>
              <div><strong className="text-primary">Team Capacity:</strong> {formData.minTeamSize} - {formData.maxTeamSize} members</div>
              <div><strong className="text-primary">Join Mode:</strong> {formData.joinMode}</div>
              <div>
                <strong className="text-primary">Roles Defined ({formData.roles.length}):</strong>{' '}
                {formData.roles.map((r: any) => `${r.title} (${r.openings} opening)`).join(', ')}
              </div>
              {formData.requirements.length > 0 && (
                <div>
                  <strong className="text-primary">Skills ({formData.requirements.length}):</strong>{' '}
                  {formData.requirements.map((s: any) => `${s.skill} (${s.proficiency})`).join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between pt-4 border-t border-uiBorder">
          <Button variant="outline" onClick={handleBack} disabled={step === 'Basics'}>Back</Button>
          {step === 'Review' ? (
            <Button onClick={handleSubmit}>Create Project</Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreateProject;
