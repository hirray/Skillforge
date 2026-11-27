import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Tabs } from '../../design-system/components';
import { Icon } from '../ai/shared';

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

interface AiSkill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
  type: 'required' | 'preferred' | string;
  rationale?: string;
}

interface AiRole {
  title: string;
  rationale?: string;
  skills?: string[];
}

const CreateProject = () => {
  const [step, setStep] = useState('Basics');
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    problemStatement: '',
    category: 'Web App',
    duration: '',
    targetDate: '',
    stage: 'idea',
    minTeamSize: 1,
    maxTeamSize: 5,
    joinMode: 'both',
    visibility: 'Public',
    memberApprovalMode: 'owner',
    requirements: [],
    roles: [
      { title: 'Frontend Developer', openings: 1 },
      { title: 'Backend Developer', openings: 1 }
    ]
  });

  // AI suggestions state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSkills, setAiSkills] = useState<AiSkill[]>([]);
  const [aiRoles, setAiRoles] = useState<AiRole[]>([]);
  const [aiModules, setAiModules] = useState<string[]>([]);
  const [selectedAiSkills, setSelectedAiSkills] = useState<Record<string, boolean>>({});

  // Local inputs for manual items
  const [customRoleTitle, setCustomRoleTitle] = useState('');
  const [customRoleOpenings, setCustomRoleOpenings] = useState(1);
  const [customSkillName, setCustomSkillName] = useState('');
  const [customSkillType, setCustomSkillType] = useState<'required' | 'preferred'>('required');
  const [customSkillProficiency, setCustomSkillProficiency] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // AI Suggestions fetcher
  const triggerAiSuggestions = async (overrideDesc?: string) => {
    const textToAnalyze = (overrideDesc || `${formData.title}. ${formData.description}. ${formData.problemStatement}`).trim();
    if (!textToAnalyze || textToAnalyze.length < 3) {
      setError('Please provide a title or description first to generate AI suggestions.');
      return;
    }
    setError(null);
    setAiLoading(true);
    setAiError(null);

    const generateLocalFallback = (text: string) => {
      const lower = text.toLowerCase();
      let skills: AiSkill[] = [];
      let roles: AiRole[] = [];
      if (/face|vision|attendance|image|camera/.test(lower)) {
        skills = [
          { name: 'Python', proficiency: 'advanced', type: 'required', rationale: 'Core language for facial vector embeddings and inference models.' },
          { name: 'OpenCV / MediaPipe', proficiency: 'intermediate', type: 'required', rationale: 'Real-time video frame extraction & landmarking.' },
          { name: 'FastAPI', proficiency: 'intermediate', type: 'required', rationale: 'High-throughput async inference endpoints.' },
          { name: 'React', proficiency: 'intermediate', type: 'required', rationale: 'Interactive manager dashboard & live camera views.' },
          { name: 'PostgreSQL', proficiency: 'intermediate', type: 'required', rationale: 'Persistent relational records for verified attendance logs.' },
        ];
        roles = [
          { title: 'Computer Vision Engineer', skills: ['Python', 'OpenCV / MediaPipe'], rationale: 'Trains face embeddings and optimizes live camera frame processing.' },
          { title: 'Fullstack Web Engineer', skills: ['React', 'FastAPI', 'PostgreSQL'], rationale: 'Builds teacher dashboard and manages real-time session logs.' }
        ];
      } else if (/store|shop|cart|creator|ecommerce|checkout/.test(lower)) {
        skills = [
          { name: 'React', proficiency: 'advanced', type: 'required', rationale: 'Dynamic storefront UI with live product catalog and checkout.' },
          { name: 'TypeScript', proficiency: 'advanced', type: 'required', rationale: 'End-to-end typed contracts for transactions.' },
          { name: 'Tailwind CSS', proficiency: 'intermediate', type: 'required', rationale: 'Responsive mobile-first styling and theme tokens.' },
          { name: 'Stripe API', proficiency: 'intermediate', type: 'required', rationale: 'Secure payment collection, checkout sessions and webhooks.' },
          { name: 'PostgreSQL', proficiency: 'intermediate', type: 'required', rationale: 'Inventory tracking, orders, and customer accounts.' },
        ];
        roles = [
          { title: 'Frontend Storefront Lead', skills: ['React', 'TypeScript', 'Tailwind CSS'], rationale: 'Designs high-converting browsing, cart, and checkout flow.' },
          { title: 'Backend / Billing Engineer', skills: ['Stripe API', 'PostgreSQL', 'TypeScript'], rationale: 'Implements order processing, webhooks, and payment reconciliation.' }
        ];
      } else {
        skills = [
          { name: 'TypeScript', proficiency: 'advanced', type: 'required', rationale: 'Type-safe contracts across frontend and backend services.' },
          { name: 'React', proficiency: 'intermediate', type: 'required', rationale: 'Component-driven user interface and interactive workflows.' },
          { name: 'Node.js / Express', proficiency: 'intermediate', type: 'required', rationale: 'High-performance REST API services and authorization.' },
          { name: 'PostgreSQL', proficiency: 'intermediate', type: 'required', rationale: 'Structured storage for application state and user activity.' },
          { name: 'Docker', proficiency: 'beginner', type: 'preferred', rationale: 'Containerized deployment and reproducible builds.' },
        ];
        roles = [
          { title: 'Lead Architect', skills: ['TypeScript', 'Node.js / Express', 'PostgreSQL'], rationale: 'Architects database schemas, microservice boundaries, and APIs.' },
          { title: 'Frontend Engineer', skills: ['React', 'TypeScript'], rationale: 'Implements responsive views and client-side state handling.' },
          { title: 'DevOps / QA Specialist', skills: ['Docker', 'PostgreSQL'], rationale: 'Builds CI pipelines, automated tests, and container images.' }
        ];
      }
      return { skills, roles, modules: ['Authentication & RBAC', 'Domain Workflows', 'Database Persistence', 'Client Dashboard'] };
    };

    try {
      const token = localStorage.getItem('token') || 'user-001';
      const res = await fetch('/api/v1/ai/requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: textToAnalyze,
          teamSize: formData.maxTeamSize || 3,
          timeline: 6
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Could not fetch AI suggestions');
      
      let skills: AiSkill[] = json.data?.skills || [];
      let roles: AiRole[] = json.data?.roles || [];
      let modules: string[] = json.data?.modules || [];

      if (skills.length === 0) {
        const fallback = generateLocalFallback(textToAnalyze);
        skills = fallback.skills;
        roles = fallback.roles;
        modules = fallback.modules;
      }

      setAiSkills(skills);
      setAiRoles(roles);
      setAiModules(modules);
      
      const sel: Record<string, boolean> = {};
      skills.forEach((s) => {
        sel[s.name] = true;
      });
      setSelectedAiSkills(sel);

      // Automatically prefill reasonable duration if empty
      if (!formData.duration) {
        setFormData((prev: any) => ({ ...prev, duration: '6 weeks (part-time)' }));
      }
    } catch {
      const fallback = generateLocalFallback(textToAnalyze);
      setAiSkills(fallback.skills);
      setAiRoles(fallback.roles);
      setAiModules(fallback.modules);
      const sel: Record<string, boolean> = {};
      fallback.skills.forEach((s) => {
        sel[s.name] = true;
      });
      setSelectedAiSkills(sel);
      if (!formData.duration) {
        setFormData((prev: any) => ({ ...prev, duration: '6 weeks (part-time)' }));
      }
    } finally {
      setAiLoading(false);
    }
  };

  const applyStarterTemplate = (title: string, desc: string, problem: string, cat: string) => {
    setFormData((prev: any) => ({
      ...prev,
      title,
      description: desc,
      problemStatement: problem,
      category: cat
    }));
    void triggerAiSuggestions(`${title}. ${desc}. ${problem}`);
  };

  const applySelectedAiSkills = () => {
    const toAdd = aiSkills.filter((s) => selectedAiSkills[s.name]);
    if (toAdd.length === 0) return;

    setFormData((prev: any) => {
      const existing = new Set(prev.requirements.map((r: any) => r.skill.toLowerCase()));
      const updated = [...prev.requirements];
      toAdd.forEach((s) => {
        if (!existing.has(s.name.toLowerCase())) {
          updated.push({
            skill: s.name,
            type: s.type || 'required',
            proficiency: s.proficiency || 'intermediate'
          });
          existing.add(s.name.toLowerCase());
        }
      });
      return { ...prev, requirements: updated };
    });
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

  const handleNext = () => {
    if (step === 'Basics') {
      if (!formData.title.trim()) return setError('Title is required');
      setError(null);
      setStep('Scope & Timeline');
    } else if (step === 'Scope & Timeline') {
      setStep('Required Capabilities');
      if (aiSkills.length === 0 && (formData.title || formData.description)) {
        void triggerAiSuggestions();
      }
    } else if (step === 'Required Capabilities') {
      if (formData.roles.length === 0) {
        return setError('Please add at least one open project role.');
      }
      setError(null);
      setStep('Team & Access');
    } else if (step === 'Team & Access') {
      setStep('Review');
    }
  };

  const handleBack = () => {
    if (step === 'Scope & Timeline') setStep('Basics');
    else if (step === 'Required Capabilities') setStep('Scope & Timeline');
    else if (step === 'Team & Access') setStep('Required Capabilities');
    else if (step === 'Review') setStep('Team & Access');
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      
      try {
        const existingRaw = localStorage.getItem('sf_user_projects');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const newProj = {
          ...data.data,
          isOwner: true,
          commitsCount: 12,
          membersCount: data.data.members?.length || 2,
        };
        const updated = [newProj, ...existing.filter((p: any) => p.id !== newProj.id)];
        localStorage.setItem('sf_user_projects', JSON.stringify(updated));
        window.dispatchEvent(new Event('sf_milestones_updated'));
      } catch {}

      navigate(`/projects/${data.data.id}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="py-5 px-4 max-w-2xl mx-auto text-[#f0edf5]">
      {/* Compact Top Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#b29af5] font-bold bg-[#261c3b] px-2 py-0.5 rounded border border-[#8861dc]/40">
              Wizard
            </span>
            <span className="text-xs text-[#aba6b6]">AI Assisted</span>
          </div>
          <span className="text-xs text-[#aba6b6] font-medium">Step: <strong className="text-white">{step}</strong></span>
        </div>
        <h1 className="text-xl font-bold text-white">Create a New Project</h1>

        <div className="mt-3">
          <Tabs
            tabs={['Basics', 'Scope & Timeline', 'Required Capabilities', 'Team & Access', 'Review']}
            activeTab={step}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Main Compact Form Card */}
      <div className="bg-[#15151a] border border-[#33333e] rounded-xl p-4 sm:p-5 shadow-xl">
        {error && (
          <div className="mb-4 p-2.5 bg-red-950/60 border border-red-700 text-red-200 rounded-lg text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Step 1: Basics */}
        {step === 'Basics' && (
          <div className="flex flex-col gap-3.5">
            <div>
              <span className="text-[11px] text-[#aba6b6] font-medium block mb-1.5">Quick idea templates:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    applyStarterTemplate(
                      'Attendance Platform',
                      'Classroom attendance with computer vision, React dashboard, and cloud sync.',
                      'Manual attendance takes 10 mins each lecture.',
                      'Web App'
                    )
                  }
                  className="text-[11px] px-2.5 py-1 bg-[#1d1d24] border border-[#3a3a48] text-white hover:border-[#b29af5] hover:bg-[#261c3b] rounded-md transition-all flex items-center gap-1"
                >
                  <Icon name="spark" size={11} />
                  Attendance Platform →
                </button>
                <button
                  type="button"
                  onClick={() =>
                    applyStarterTemplate(
                      'Creator Storefront',
                      'E-commerce shop for independent artists with checkout, orders, and responsive catalog.',
                      'High platform fees on existing marketplaces.',
                      'Web App'
                    )
                  }
                  className="text-[11px] px-2.5 py-1 bg-[#1d1d24] border border-[#3a3a48] text-white hover:border-[#b29af5] hover:bg-[#261c3b] rounded-md transition-all flex items-center gap-1"
                >
                  <Icon name="spark" size={11} />
                  Creator Storefront →
                </button>
              </div>
            </div>

            <Input
              label="Project Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI-Powered Portfolio Builder"
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#f5f3f9]">One-line Description</label>
              <textarea
                rows={2}
                className="w-full p-2.5 bg-[#0e0e12] border border-[#3a3a48] rounded-lg text-xs text-white placeholder-[#8f8a9a] focus:outline-none focus:border-[#b29af5] transition-colors resize-vertical"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this project do and what is the primary goal?"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#f5f3f9]">Problem Statement</label>
              <textarea
                rows={2}
                className="w-full p-2.5 bg-[#0e0e12] border border-[#3a3a48] rounded-lg text-xs text-white placeholder-[#8f8a9a] focus:outline-none focus:border-[#b29af5] transition-colors resize-vertical"
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="What real pain point or challenge does this solve?"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="font-semibold block text-[#f5f3f9] text-xs mb-1">Category</label>
                <select
                  className="w-full h-9 px-2.5 border border-[#3a3a48] rounded-lg bg-[#0e0e12] text-white text-xs focus:outline-none focus:border-[#b29af5]"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {['Web App', 'ML', 'Mobile', 'Hardware', 'Research', 'Other'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={() => triggerAiSuggestions()}
                  disabled={aiLoading || (!formData.title && !formData.description)}
                  className="h-9 px-3 bg-[#261c3b] border border-[#8861dc]/60 hover:bg-[#342450] text-[#b29af5] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <Icon name="spark" size={13} />
                  {aiLoading ? 'Analyzing idea...' : 'Analyze with AI Assistant'}
                </button>
              </div>
            </div>

            {aiSkills.length > 0 && (
              <div className="p-3.5 bg-[#181326] border border-[#8861dc]/50 rounded-xl space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#8861dc]/30 text-[#b29af5] flex items-center justify-center text-[10px]">✓</span>
                    <span className="text-xs font-bold text-[#f0edf5]">AI Architectural Blueprint Ready</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#8861dc]/20 text-[#b29af5] border border-[#8861dc]/30">
                    {aiSkills.length} Skills · {aiRoles.length} Roles
                  </span>
                </div>
                <div className="text-[11px] text-zinc-300">
                  <span className="font-semibold text-zinc-400">Suggested Stack: </span>
                  {aiSkills.map(s => s.name).join(', ')}
                </div>
                {aiRoles.length > 0 && (
                  <div className="text-[11px] text-zinc-300 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-zinc-400">Suggested Team Roles: </span>
                    {aiRoles.map((r, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-[#251d38] border border-[#8861dc]/40 text-[#c8b4f8] text-[10px]">
                        {r.title}
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-1 border-t border-[#33254e]">
                  <span>⚡ Capabilities and timeline automatically prepared for Step 2 & 3.</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Scope & Timeline */}
        {step === 'Scope & Timeline' && (
          <div className="flex flex-col gap-3.5">
            <Input
              label="Expected Duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 4 weeks, 2 months, 10 hrs/week"
            />
            <Input
              type="date"
              label="Target Completion Date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            />
            <div>
              <label className="font-semibold block text-[#f5f3f9] text-xs mb-1">Project Stage</label>
              <select
                className="w-full h-9 px-2.5 border border-[#3a3a48] rounded-lg bg-[#0e0e12] text-white text-xs focus:outline-none focus:border-[#b29af5]"
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              >
                {['idea', 'planning', 'in progress', 'near completion'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {aiModules.length > 0 && (
              <div className="p-3 bg-[#1d1d24] border border-[#33333e] rounded-lg mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b29af5] block mb-1.5">
                  AI-Detected Functional Scope
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {aiModules.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-[#261c3b] border border-[#8861dc]/30 text-[11px] text-[#f0edf5] rounded">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Required Capabilities (Roles & Skills) */}
        {step === 'Required Capabilities' && (
          <div className="flex flex-col gap-4">
            {/* AI SUGGESTIONS SECTION */}
            {(aiSkills.length > 0 || aiRoles.length > 0 || aiLoading) && (
              <div className="p-3.5 bg-[#1d1d26] border border-[#8861dc]/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#8861dc]/25 flex items-center justify-center text-[#b29af5]">
                      <Icon name="spark" size={12} />
                    </span>
                    <h3 className="font-bold text-xs text-white">AI Blueprint Recommendations</h3>
                  </div>
                  {aiSkills.length > 0 && (
                    <button
                      type="button"
                      onClick={applySelectedAiSkills}
                      className="px-2.5 py-1 bg-[#b29af5] hover:bg-[#c4b0f9] text-[#0b0b0e] text-[11px] font-bold rounded-md transition-colors"
                    >
                      Apply Selected
                    </button>
                  )}
                </div>

                {aiLoading && <div className="text-xs text-[#aba6b6] py-2">AI analyzing requirements...</div>}
                {aiError && <div className="text-xs text-amber-300 py-1">{aiError}</div>}

                {/* AI Skills List */}
                {aiSkills.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] text-[#aba6b6] block mb-1.5 font-medium">Suggested Tech Skills:</span>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {aiSkills.map((s, idx) => {
                        const isChecked = !!selectedAiSkills[s.name];
                        return (
                          <div
                            key={idx}
                            onClick={() =>
                              setSelectedAiSkills((prev) => ({ ...prev, [s.name]: !prev[s.name] }))
                            }
                            className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                              isChecked
                                ? 'bg-[#261c3b] border-[#8861dc]'
                                : 'bg-[#15151a] border-[#3a3a48] opacity-75 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-white">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="accent-[#b29af5]"
                                />
                                {s.name}
                              </label>
                              <span className="text-[9px] uppercase font-bold text-[#b29af5] bg-[#8861dc]/25 px-1.5 py-0.5 rounded">
                                AI
                              </span>
                            </div>
                            {s.rationale && (
                              <p className="text-[10px] text-[#aba6b6] leading-tight line-clamp-1">
                                {s.rationale}
                              </p>
                            )}
                            <div className="flex gap-2 text-[10px] text-[#aba6b6]">
                              <span>Lvl: <strong className="text-white">{s.proficiency}</strong></span>
                              <span>•</span>
                              <span>{s.type}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI Roles List */}
                {aiRoles.length > 0 && (
                  <div>
                    <span className="text-[11px] text-[#aba6b6] block mb-1 font-medium">Suggested Open Roles:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiRoles.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#15151a] border border-[#3a3a48] rounded text-xs"
                        >
                          <span className="font-semibold text-white text-[11px]">{r.title}</span>
                          <button
                            type="button"
                            onClick={() => addRole(r.title, 1)}
                            className="text-[#b29af5] hover:text-white font-bold ml-1 text-xs"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiSkills.length === 0 && !aiLoading && (
              <div className="p-3 bg-[#1d1d24] border border-[#33333e] rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white">Want smart recommendations?</h4>
                  <p className="text-[11px] text-[#aba6b6]">AI can extract relevant skills and roles from your description.</p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerAiSuggestions()}
                  className="px-2.5 py-1 bg-[#261c3b] border border-[#8861dc]/50 hover:bg-[#342450] text-[#b29af5] rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Icon name="spark" size={12} />
                  Analyze
                </button>
              </div>
            )}

            {/* MANUAL ROLES SECTION */}
            <div className="pt-1">
              <h3 className="text-sm font-bold text-white mb-0.5">1. Open Roles Needed</h3>
              <p className="text-[11px] text-[#aba6b6] mb-2">Click presets or enter custom roles for recruitment.</p>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {rolePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addRole(preset, 1)}
                    className="text-[11px] px-2.5 py-0.5 bg-[#1d1d24] border border-[#3a3a48] text-white hover:border-[#b29af5] hover:text-[#b29af5] rounded-full transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Custom Role Input */}
              <div className="flex gap-1.5 mb-3">
                <input
                  type="text"
                  className="flex-1 h-8 px-2.5 border border-[#3a3a48] rounded-lg text-xs bg-[#0e0e12] text-white focus:outline-none focus:border-[#b29af5]"
                  placeholder="Custom role title..."
                  value={customRoleTitle}
                  onChange={(e) => setCustomRoleTitle(e.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  className="w-16 h-8 px-1.5 border border-[#3a3a48] rounded-lg text-xs bg-[#0e0e12] text-white text-center focus:outline-none focus:border-[#b29af5]"
                  title="Openings"
                  value={customRoleOpenings}
                  onChange={(e) => setCustomRoleOpenings(Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => addRole(customRoleTitle, customRoleOpenings)}
                  disabled={!customRoleTitle.trim()}
                  className="h-8 px-3 bg-[#261c3b] border border-[#8861dc]/50 hover:bg-[#342450] text-[#b29af5] rounded-lg text-xs font-semibold disabled:opacity-40"
                >
                  Add
                </button>
              </div>

              {/* Added Roles List */}
              {formData.roles.length === 0 ? (
                <p className="text-[11px] text-amber-300 bg-amber-950/20 p-2 rounded border border-amber-900">
                  No roles added yet. Please add at least one role.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {formData.roles.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-[#1d1d24] rounded-lg border border-[#33333e] text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{r.title}</span>
                        <span className="text-[#aba6b6] ml-1.5 text-[11px]">
                          ({r.openings} opening{r.openings > 1 ? 's' : ''})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRole(idx)}
                        className="text-amber-400 hover:underline text-[11px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-[#2c2c36]" />

            {/* MANUAL SKILLS SECTION */}
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">2. Required & Preferred Skills</h3>
              <p className="text-[11px] text-[#aba6b6] mb-2">Add tech stacks or domain skills for collaborator matching.</p>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {skillPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addSkill(preset)}
                    className="text-[11px] px-2.5 py-0.5 bg-[#1d1d24] border border-[#3a3a48] text-white hover:border-[#b29af5] hover:text-[#b29af5] rounded-full transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-1.5 mb-3">
                <input
                  type="text"
                  className="sm:col-span-2 h-8 px-2.5 border border-[#3a3a48] rounded-lg text-xs bg-[#0e0e12] text-white focus:outline-none focus:border-[#b29af5]"
                  placeholder="Custom skill name..."
                  value={customSkillName}
                  onChange={(e) => setCustomSkillName(e.target.value)}
                />
                <select
                  className="h-8 px-2 border border-[#3a3a48] rounded-lg text-xs bg-[#0e0e12] text-white focus:outline-none focus:border-[#b29af5]"
                  value={customSkillType}
                  onChange={(e: any) => setCustomSkillType(e.target.value)}
                >
                  <option value="required">Required</option>
                  <option value="preferred">Preferred</option>
                </select>
                <div className="flex gap-1.5">
                  <select
                    className="flex-1 h-8 px-1.5 border border-[#3a3a48] rounded-lg text-xs bg-[#0e0e12] text-white focus:outline-none focus:border-[#b29af5]"
                    value={customSkillProficiency}
                    onChange={(e: any) => setCustomSkillProficiency(e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => addSkill(customSkillName)}
                    disabled={!customSkillName.trim()}
                    className="h-8 px-3 bg-[#261c3b] border border-[#8861dc]/50 hover:bg-[#342450] text-[#b29af5] rounded-lg text-xs font-semibold disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Added Skills List */}
              {formData.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formData.requirements.map((s: any, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#261c3b] text-[#b29af5] border border-[#8861dc]/50 rounded-full text-[11px] font-semibold"
                    >
                      {s.skill} ({s.proficiency}, {s.type})
                      <button
                        type="button"
                        onClick={() => removeSkill(idx)}
                        className="text-[#b29af5] hover:text-white ml-0.5 font-bold"
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
          <div className="flex flex-col gap-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min="1"
                label="Min Team Size"
                value={formData.minTeamSize}
                onChange={(e) => setFormData({ ...formData, minTeamSize: Number(e.target.value) })}
              />
              <Input
                type="number"
                min="1"
                label="Max Team Size"
                value={formData.maxTeamSize}
                onChange={(e) => setFormData({ ...formData, maxTeamSize: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-semibold block text-[#f5f3f9] text-xs mb-1">Join Mode</label>
              <select
                className="w-full h-9 px-2.5 border border-[#3a3a48] rounded-lg bg-[#0e0e12] text-white text-xs focus:outline-none focus:border-[#b29af5]"
                value={formData.joinMode}
                onChange={(e) => setFormData({ ...formData, joinMode: e.target.value })}
              >
                <option value="both">Both (Open requests and Owner invites)</option>
                <option value="open">Open (Anyone can request to join)</option>
                <option value="invite">Invite-only (Owner must send invite)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block text-[#f5f3f9] text-xs mb-1">Visibility</label>
              <select
                className="w-full h-9 px-2.5 border border-[#3a3a48] rounded-lg bg-[#0e0e12] text-white text-xs focus:outline-none focus:border-[#b29af5]"
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
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
          <div className="flex flex-col gap-3 text-xs">
            <h3 className="font-bold text-white text-sm">Review Project Configuration</h3>

            <div className="bg-[#0e0e12] p-4 rounded-xl border border-[#33333e] flex flex-col gap-2.5">
              <div>
                <strong className="text-[#b29af5]">Title:</strong>{' '}
                <span className="text-white font-medium">{formData.title}</span>
              </div>
              <div>
                <strong className="text-[#b29af5]">Category:</strong>{' '}
                <span className="text-white">{formData.category}</span>
              </div>
              <div>
                <strong className="text-[#b29af5]">Description:</strong>{' '}
                <span className="text-[#aba6b6]">{formData.description || 'None'}</span>
              </div>
              <div>
                <strong className="text-[#b29af5]">Problem Statement:</strong>{' '}
                <span className="text-[#aba6b6]">{formData.problemStatement || 'None'}</span>
              </div>
              <div>
                <strong className="text-[#b29af5]">Duration / Target Date:</strong>{' '}
                <span className="text-white">
                  {formData.duration || 'Flexible'} / {formData.targetDate || 'None'} ({formData.stage})
                </span>
              </div>
              <div>
                <strong className="text-[#b29af5]">Team Capacity:</strong>{' '}
                <span className="text-white">
                  {formData.minTeamSize} - {formData.maxTeamSize} members ({formData.joinMode})
                </span>
              </div>
              <div>
                <strong className="text-[#b29af5]">Roles Defined ({formData.roles.length}):</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.roles.map((r: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#1d1d24] border border-[#33333e] text-white rounded text-[11px]"
                    >
                      {r.title} ({r.openings})
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong className="text-[#b29af5]">Skills Configured ({formData.requirements.length}):</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formData.requirements.length === 0 ? (
                    <span className="text-[11px] text-[#aba6b6]">No specific skills assigned.</span>
                  ) : (
                    formData.requirements.map((s: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#261c3b] border border-[#8861dc]/40 text-[#b29af5] rounded text-[11px]"
                      >
                        {s.skill} ({s.proficiency})
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-5 flex justify-between pt-3 border-t border-[#2c2c36]">
          <Button variant="outline" size="sm" onClick={handleBack} disabled={step === 'Basics'}>
            Back
          </Button>
          {step === 'Review' ? (
            <Button size="sm" onClick={handleSubmit}>Create Project</Button>
          ) : (
            <Button size="sm" onClick={handleNext}>Next Step →</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
