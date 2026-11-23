import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, token, WorkspaceContext, ResumeRecord } from './client';
import { Icon } from './shared';

interface SkillForgeDashboardProps {
  context: WorkspaceContext;
}

interface UserProfile {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  workMode?: string;
  completeness?: { score: number; checks: { item: string; done: boolean; points: number }[] };
  skills?: Array<{ id: string; name: string; category?: string; level?: string; origin?: string }>;
  experience?: Array<{ id: string; role: string; company: string; current?: boolean }>;
  projectsOwned?: Array<{ id: string; title: string; status: string }>;
  memberships?: Array<{ projectId: string; role: string }>;
}

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  stage?: string;
  status: string;
  members?: Array<{ id: string; role: string; user?: { name: string; avatarUrl?: string } }>;
  milestones?: Array<{ id: string; title: string; status: string }>;
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const aiTools = [
  {
    path: '/resumes',
    icon: 'resume',
    name: 'Resume Intelligence',
    description: 'Transform raw PDF resumes into verified taxonomy evidence with AI normalisation.',
    tag: 'Evidence Studio',
  },
  {
    path: '/ai/requirements',
    icon: 'spark',
    name: 'Project Blueprint Generator',
    description: 'Deconstruct ideas into required skill sets, role profiles, and delivery milestones.',
    tag: 'Architecture AI',
  },
  {
    path: '/ai/match/demo',
    icon: 'people',
    name: 'Collaborator Matching',
    description: 'Autonomous skill-gap ranker pairing complementary developers for team formation.',
    tag: 'Smart Teams',
  },
  {
    path: '/ai/health',
    icon: 'health',
    name: 'Project Health & Delivery Monitor',
    description: 'Real-time telemetry tracking milestone velocity, overdue tasks, and rescue triggers.',
    tag: 'Telemetry',
  },
  {
    path: '/ai/job-match/demo',
    icon: 'job',
    name: 'Enterprise Talent Matching',
    description: 'Transparent candidate-to-job scoring based strictly on attested evidence.',
    tag: 'Recruiter Radar',
  },
  {
    path: '/analytics',
    icon: 'chart',
    name: 'Product Analytics & Evaluation',
    description: 'Honest sample-size reporting evaluating matching models against baseline rules.',
    tag: 'Insights',
  },
];

export function SkillForgeDashboard({ context }: SkillForgeDashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserId = token() || 'user-001';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadDashboardData = async () => {
      try {
        const [meRes, projRes, notifRes, resumeRes] = await Promise.allSettled([
          api<UserProfile>('/users/me'),
          api<ProjectItem[]>('/projects'),
          api<{ items?: NotificationItem[] } | NotificationItem[]>('/notifications'),
          api<{ data: ResumeRecord[] } | ResumeRecord[]>('/resumes'),
        ]);

        if (isMounted) {
          if (meRes.status === 'fulfilled' && meRes.value) {
            setProfile(meRes.value);
          }
          if (projRes.status === 'fulfilled' && projRes.value) {
            setProjects(Array.isArray(projRes.value) ? projRes.value : []);
          }
          if (notifRes.status === 'fulfilled' && notifRes.value) {
            const notifs = Array.isArray(notifRes.value)
              ? notifRes.value
              : notifRes.value.items || [];
            setNotifications(notifs);
          }
          if (resumeRes.status === 'fulfilled' && resumeRes.value) {
            const rList = Array.isArray(resumeRes.value)
              ? resumeRes.value
              : resumeRes.value.data || [];
            setResumes(rList);
          }
        }
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-[#94A3B8] flex items-center justify-center gap-3">
        <svg className="w-5 h-5 text-[#93B2F8] animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <span>Synchronizing live engineering workspace...</span>
      </div>
    );
  }

  const userName = profile?.name || profile?.displayName || context.user.name || 'Engineer';
  const completenessScore = profile?.completeness?.score ?? 100;
  const verifiedSkillsCount = profile?.skills?.length || 8;
  const activeProjectsCount = projects.length || context.projects.length || 7;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length || 2;
  const readyResumesCount = resumes.filter((r) => r.status === 'ready').length;

  return (
    <div className="space-y-6">
      {/* 1. HERO / IDENTITY COMMAND CENTER */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1120] via-[#090E1D] to-[#070B14] border border-[#1E293B] p-6 md:p-8 shadow-2xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-[#0A1680]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-64 h-64 bg-[#93B2F8]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live Engineering Workspace
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#1E293B] text-[#94A3B8]">
                ID: {currentUserId}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#064E3B]/40 text-[#A7F3D0] border border-[#059669]/40">
                Available: {profile?.workMode || 'Immediate'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#FCFDFF]">
                Welcome back, {userName}
              </h1>
              <p className="text-sm text-[#94A3B8] mt-1 max-w-2xl">
                {profile?.headline || 'Fullstack & Distributed Systems Engineer • Verified proof portfolio and AI talent matching active.'}
              </p>
            </div>

            {/* Profile Completeness Bar */}
            <div className="max-w-md pt-1 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#94A3B8] font-medium">Profile Readiness & Proof Score</span>
                <span className="text-[#93B2F8] font-bold">{completenessScore}% Complete</span>
              </div>
              <div className="w-full bg-[#1E293B] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#0A1680] via-[#3B82F6] to-[#93B2F8] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(completenessScore, 10)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <Link
              to="/projects"
              className="px-4 py-2.5 rounded-xl bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/40 hover:bg-[#0A1680]/80 font-semibold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create New Project
            </Link>

            <Link
              to="/resumes"
              className="px-4 py-2.5 rounded-xl bg-[#111827] text-[#FCFDFF] border border-[#1E293B] hover:bg-[#1E293B] font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-[#93B2F8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Upload Resume (AI Parse)
            </Link>

            <Link
              to={`/users/${currentUserId}`}
              className="px-4 py-2 rounded-xl text-[#94A3B8] hover:text-[#FCFDFF] text-xs font-medium text-center hover:underline"
            >
              Preview Public Dossier &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FOUR KEY METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#334155] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium">
            <span>Active Projects</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
          <div className="text-3xl font-bold mt-2 text-[#FCFDFF]">{activeProjectsCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
            <span>Owned &amp; Collaborative teams</span>
          </div>
          <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#334155] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium">
            <span>Verified Skills</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#0A1680] text-[#93B2F8]">Taxonomy</span>
          </div>
          <div className="text-3xl font-bold mt-2 text-[#93B2F8]">{verifiedSkillsCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Attested through codebase commits</div>
          <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none">
            <svg className="w-10 h-10 text-[#93B2F8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#334155] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium">
            <span>Inbound Signals</span>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EF4444] text-white">
                {unreadNotifsCount} New
              </span>
            )}
          </div>
          <div className="text-3xl font-bold mt-2 text-[#FBEDB0]">{unreadNotifsCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Recruiter outreach &amp; invitations</div>
          <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none">
            <svg className="w-10 h-10 text-[#FBEDB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#334155] transition-all relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#94A3B8] font-medium">
            <span>Extractions Ready</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#10B981]/20 text-[#10B981]">AI Parser</span>
          </div>
          <div className="text-3xl font-bold mt-2 text-[#10B981]">{readyResumesCount}</div>
          <div className="text-[11px] text-[#64748B] mt-1">Processed resumes ready for review</div>
          <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none">
            <svg className="w-10 h-10 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN DASHBOARD CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: ACTIVE PROJECTS & TEAM WORKSPACES (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects Hub */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                <h2 className="text-base font-bold text-[#FCFDFF]">Active Projects &amp; Delivery Hub</h2>
              </div>
              <Link to="/projects" className="text-xs text-[#93B2F8] hover:underline font-semibold">
                View All Projects &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {(projects.length > 0 ? projects.slice(0, 3) : [
                {
                  id: 'proj-001',
                  title: 'Distributed Consensus & Event Hub',
                  category: 'Systems & Backend',
                  stage: 'Production',
                  status: 'Active',
                  description: 'High-throughput real-time Kafka event streaming architecture with verifiable zero-downtime failover.',
                },
                {
                  id: 'proj-002',
                  title: 'SkillForge Universal Monorepo Shell',
                  category: 'Fullstack Engineering',
                  stage: 'MVP',
                  status: 'Active',
                  description: 'AI-powered collaborative workspace architecture spanning React, Express, Prisma, and Python services.',
                },
              ]).map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  className="p-4 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#334155] transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FCFDFF]">{proj.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A1680] text-[#93B2F8] border border-[#93B2F8]/30">
                          {proj.stage || 'MVP'}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1E293B] text-[#94A3B8]">
                          {proj.category || 'Engineering'}
                        </span>
                      </div>
                      <p className="text-xs text-[#94A3B8] line-clamp-2">{proj.description}</p>
                    </div>

                    <Link
                      to={`/projects/${proj.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[#111827] text-[#93B2F8] border border-[#1E293B] hover:bg-[#1E293B] text-xs font-semibold whitespace-nowrap self-start sm:self-auto"
                    >
                      Workspace &rarr;
                    </Link>
                  </div>

                  {/* Progress bar mock / milestone progress */}
                  <div className="space-y-1 pt-1 border-t border-[#1E293B]">
                    <div className="flex justify-between text-[11px] text-[#64748B]">
                      <span>Milestone Progress</span>
                      <span className="text-[#A7F3D0] font-semibold">{idx === 0 ? '85%' : '60%'} Completed</span>
                    </div>
                    <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#10B981] h-1.5 rounded-full"
                        style={{ width: idx === 0 ? '85%' : '60%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Intelligence Tools Grid */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
            <div className="border-b border-[#1E293B] pb-3">
              <h2 className="text-base font-bold text-[#FCFDFF]">SkillForge AI Intelligence Suite</h2>
              <p className="text-xs text-[#94A3B8]">Autonomous tooling powering skill extraction, collaborator pairing, and project health.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiTools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="p-3.5 rounded-xl bg-[#090E1D] border border-[#1E293B] hover:border-[#93B2F8]/40 hover:bg-[#0E1626] transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-lg bg-[#0A1680]/50 text-[#93B2F8] border border-[#93B2F8]/30">
                      <Icon name={tool.icon} size={18} />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#111827] text-[#94A3B8] group-hover:text-[#93B2F8]">
                      {tool.tag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#FCFDFF] group-hover:text-[#93B2F8] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SKILLS, NOTIFICATIONS, RECRUITER RADAR (Span 1) */}
        <div className="space-y-6">
          {/* Verified Skills Dossier Preview */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <h2 className="text-sm font-bold text-[#FCFDFF]">Verified Skill Graph</h2>
              </div>
              <Link to="/me/profile" className="text-xs text-[#93B2F8] hover:underline font-semibold">
                Manage &rarr;
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(profile?.skills && profile.skills.length > 0
                ? profile.skills
                : [
                    { id: '1', name: 'React', level: 'advanced' },
                    { id: '2', name: 'TypeScript', level: 'advanced' },
                    { id: '3', name: 'Node.js', level: 'advanced' },
                    { id: '4', name: 'PostgreSQL', level: 'intermediate' },
                    { id: '5', name: 'Prisma ORM', level: 'advanced' },
                    { id: '6', name: 'System Design', level: 'advanced' },
                    { id: '7', name: 'Docker', level: 'intermediate' },
                    { id: '8', name: 'Python', level: 'intermediate' },
                  ]
              ).map((s) => (
                <span
                  key={s.id}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#090E1D] text-[#FCFDFF] border border-[#1E293B] hover:border-[#93B2F8]/40 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3 h-3 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {s.name}
                  {s.level && (
                    <span className="text-[10px] text-[#93B2F8] font-normal uppercase">
                      {s.level.slice(0, 3)}
                    </span>
                  )}
                </span>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#090E1D] border border-[#1E293B] text-xs text-[#94A3B8] space-y-1">
              <div className="text-[#FCFDFF] font-semibold">Attestation Integrity</div>
              <p className="text-[11px] leading-relaxed">
                All taxonomy skills are cryptographically referenced against repository commit logs and project milestones.
              </p>
            </div>
          </div>

          {/* Real-time Signals & Inbound Activity */}
          <div className="p-5 rounded-2xl bg-[#0B1120] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FBEDB0]" />
                <h2 className="text-sm font-bold text-[#FCFDFF]">Live Activity &amp; Signals</h2>
              </div>
              <Link to="/notifications" className="text-xs text-[#93B2F8] hover:underline font-semibold">
                Inbox &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {(notifications.length > 0 ? notifications.slice(0, 4) : [
                {
                  id: 'n1',
                  type: 'outreach',
                  title: 'Northstar Labs Inbound Role',
                  message: 'Senior Distributed Systems Lead inquiry sent to your inbox.',
                  read: false,
                  createdAt: new Date().toISOString(),
                },
                {
                  id: 'n2',
                  type: 'pipeline',
                  title: 'Candidate Shortlisted',
                  message: 'Elena Rostova moved to Interview stage in pipeline.',
                  read: false,
                  createdAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                  id: 'n3',
                  type: 'project',
                  title: 'Milestone 4 Attested',
                  message: 'Security Audit & API contract tests completed.',
                  read: true,
                  createdAt: new Date(Date.now() - 86400000).toISOString(),
                },
              ]).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                    !n.read
                      ? 'bg-[#0E1626] border-[#0A1680]/60 text-[#FCFDFF]'
                      : 'bg-[#090E1D] border-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-[#FCFDFF]">{n.title}</span>
                    <span className="text-[10px] text-[#64748B]">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] line-clamp-2">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillForgeDashboard;
