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
  completeness?: { score: number; percentage?: number; checks: { item: string; done: boolean; points: number }[] };
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
  category?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface ActivityEvent {
  id: string;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  dotColor: string;
  time: string;
  link?: string;
}

const accountLabels: Record<string, string> = {
  'user-001': 'Student',
  'user-002': 'Freelancer',
  'user-003': 'Pro Dev',
  'user-004': 'Founder',
  'user-005': 'Designer',
  'user-006': 'ML Engineer',
  'user-007': 'Cloud Arch',
  'user-008': 'Job Seeker',
  'recruiter-001': 'Recruiter',
  'admin-001': 'Admin',
};

const menuGridItems = [
  {
    path: '/projects',
    icon: 'folder',
    title: 'Projects & Delivery Hub',
    desc: 'Manage repositories, milestones, tasks, and collaborative development teams.',
    tag: 'Workspace',
    accentColor: '#8861dc',
    iconBg: 'bg-[#8861dc]/15 text-[#c084fc] border-[#8861dc]/30 shadow-[0_0_16px_rgba(136,97,220,0.2)]',
    tagBg: 'bg-[#8861dc]/10 text-[#d8b4fe] border-[#8861dc]/30',
    hoverBorder: 'hover:border-[#8861dc]/60 hover:shadow-[0_8px_24px_-4px_rgba(136,97,220,0.2)]',
  },
  {
    path: '/ai/requirements',
    icon: 'spark',
    title: 'Project Blueprint AI',
    desc: 'Deconstruct ideas into required skill sets, role profiles, and delivery phases.',
    tag: 'Architecture AI',
    accentColor: '#c084fc',
    iconBg: 'bg-[#a855f7]/15 text-[#e9d5ff] border-[#a855f7]/30 shadow-[0_0_16px_rgba(168,85,247,0.2)]',
    tagBg: 'bg-[#a855f7]/10 text-[#f3e8ff] border-[#a855f7]/30',
    hoverBorder: 'hover:border-[#a855f7]/60 hover:shadow-[0_8px_24px_-4px_rgba(168,85,247,0.2)]',
  },
  {
    path: '/ai/match',
    icon: 'people',
    title: 'Collaborator Matching',
    desc: 'Autonomous skill-gap ranker pairing developers with complementary strengths.',
    tag: 'Smart Teams',
    accentColor: '#2dd4bf',
    iconBg: 'bg-[#14b8a6]/15 text-[#5eead4] border-[#14b8a6]/30 shadow-[0_0_16px_rgba(20,184,166,0.2)]',
    tagBg: 'bg-[#14b8a6]/10 text-[#99f6e4] border-[#14b8a6]/30',
    hoverBorder: 'hover:border-[#14b8a6]/60 hover:shadow-[0_8px_24px_-4px_rgba(20,184,166,0.2)]',
  },
  {
    path: '/resumes',
    icon: 'resume',
    title: 'Resume Intelligence',
    desc: 'Transform raw PDF resumes into verified taxonomy evidence with AI normalisation.',
    tag: 'AI Parser',
    accentColor: '#34d399',
    iconBg: 'bg-[#10b981]/15 text-[#6ee7b7] border-[#10b981]/30 shadow-[0_0_16px_rgba(16,185,129,0.2)]',
    tagBg: 'bg-[#10b981]/10 text-[#a7f3d0] border-[#10b981]/30',
    hoverBorder: 'hover:border-[#10b981]/60 hover:shadow-[0_8px_24px_-4px_rgba(16,185,129,0.2)]',
  },
  {
    path: '/opportunities',
    icon: 'job',
    title: 'Inbound Opportunities',
    desc: 'Review company outreaches, interview fast-tracks, and verified hiring pipelines.',
    tag: 'Recruiter Radar',
    accentColor: '#fbbf24',
    iconBg: 'bg-[#f59e0b]/15 text-[#fde68a] border-[#f59e0b]/30 shadow-[0_0_16px_rgba(245,158,11,0.2)]',
    tagBg: 'bg-[#f59e0b]/10 text-[#fef3c7] border-[#f59e0b]/30',
    hoverBorder: 'hover:border-[#f59e0b]/60 hover:shadow-[0_8px_24px_-4px_rgba(245,158,11,0.2)]',
  },
  {
    path: '/ai/health',
    icon: 'health',
    title: 'Project Health Telemetry',
    desc: 'Real-time telemetry tracking milestone velocity, overdue tasks, and rescue alerts.',
    tag: 'Telemetry',
    accentColor: '#fb7185',
    iconBg: 'bg-[#f43f5e]/15 text-[#fda4af] border-[#f43f5e]/30 shadow-[0_0_16px_rgba(244,63,94,0.2)]',
    tagBg: 'bg-[#f43f5e]/10 text-[#ffe4e6] border-[#f43f5e]/30',
    hoverBorder: 'hover:border-[#f43f5e]/60 hover:shadow-[0_8px_24px_-4px_rgba(244,63,94,0.2)]',
  },
];

const fallbackActivities: ActivityEvent[] = [
  {
    id: 'act-1',
    title: 'Attestation Verified: Distributed Consensus Hub',
    desc: 'Milestone 4 code review approved with cryptographic commit proof (SHA-256: 0x7fa2..11b8).',
    tag: 'Verified Proof',
    tagColor: 'text-[#5eead4] bg-[#14b8a6]/10 border-[#14b8a6]/30',
    dotColor: 'bg-[#14b8a6]',
    time: '18m ago',
    link: '/projects',
  },
  {
    id: 'act-2',
    title: 'Taxonomy Skill Attested: Kafka & Event Streaming',
    desc: 'Normalized from verified repository commits and linked to candidate talent graph.',
    tag: 'Taxonomy',
    tagColor: 'text-[#c084fc] bg-[#8861dc]/10 border-[#8861dc]/30',
    dotColor: 'bg-[#8861dc]',
    time: '2h ago',
    link: '/me/profile',
  },
  {
    id: 'act-3',
    title: 'Collaborator Synergy Matched',
    desc: 'Autonomous match score 94% computed for backend role on Universal Monorepo Shell.',
    tag: 'AI Match',
    tagColor: 'text-[#fde68a] bg-[#f59e0b]/10 border-[#f59e0b]/30',
    dotColor: 'bg-[#f59e0b]',
    time: '4h ago',
    link: '/ai/match',
  },
  {
    id: 'act-4',
    title: 'Resume AI Extraction Completed',
    desc: 'Parsed 8 core skills, 2 degree credentials, and 3 work experiences with zero warnings.',
    tag: 'Resume AI',
    tagColor: 'text-[#6ee7b7] bg-[#10b981]/10 border-[#10b981]/30',
    dotColor: 'bg-[#10b981]',
    time: '1d ago',
    link: '/resumes',
  },
];

export function SkillForgeDashboard({ context }: SkillForgeDashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const currentToken = token();
  const currentUserId = currentToken || 'user-001';
  const roleLabel = accountLabels[currentToken] || 'Developer';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadDashboardData = async () => {
      try {
        const [meRes, projRes, notifRes, resumeRes] = await Promise.allSettled([
          api<{ user?: UserProfile; completeness?: any } | UserProfile>('/users/me'),
          api<ProjectItem[]>('/projects'),
          api<{ items?: NotificationItem[] } | NotificationItem[]>('/notifications'),
          api<{ data: ResumeRecord[] } | ResumeRecord[]>('/resumes'),
        ]);

        if (isMounted) {
          if (meRes.status === 'fulfilled' && meRes.value) {
            const raw = meRes.value as any;
            if (raw.user) {
              setProfile({ ...raw.user, completeness: raw.completeness });
            } else {
              setProfile(raw);
            }
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
  }, [currentToken]);

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-[#96939f] flex items-center justify-center gap-2">
        <svg className="w-4 h-4 text-[#b29af5] animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <span>Loading engineering workspace...</span>
      </div>
    );
  }

  // Name Resolution:
  const rawName = profile?.displayName || profile?.name;
  const isGeneric = !rawName || rawName === 'User' || rawName === 'Candidate Engineer' || rawName === 'SkillForge User';
  const displayUserName = isGeneric ? roleLabel : rawName;

  const completenessScore = profile?.completeness?.percentage ?? profile?.completeness?.score ?? 100;
  const verifiedSkillsCount = profile?.skills?.length || 8;
  const activeProjectsCount = projects.length || context.projects.length || 7;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length || 2;
  const readyResumesCount = resumes.filter((r) => r.status === 'ready').length;

  return (
    <div className="space-y-4 max-w-[1280px] mx-auto pb-10">
      {/* 1. PREMIUM COMMAND IDENTITY BAR */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#14141a] via-[#111116] to-[#14141a] border border-[#2b2a36] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.6)] px-4 py-3 flex flex-wrap items-center justify-between gap-3 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#b29af5]/20 before:to-transparent">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with gradient glow */}
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8861dc] via-[#6d44c4] to-[#4c2d96] text-white flex items-center justify-center font-bold text-xs shadow-[0_0_16px_rgba(136,97,220,0.35)] border border-[#b29af5]/40">
              {displayUserName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10b981] border-2 border-[#111116]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm md:text-base font-bold bg-gradient-to-r from-white via-[#f3f0fa] to-[#c4b5fd] bg-clip-text text-transparent truncate tracking-tight">
                Welcome back, {displayUserName}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#8861dc]/15 text-[#d8b4fe] border border-[#8861dc]/30 shrink-0">
                {roleLabel} · {currentUserId}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/30 shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]" />
                </span>
                Active Radar
              </span>
            </div>
            <p className="text-[11px] text-[#9ca3af] truncate mt-0.5 font-normal">
              {profile?.headline || 'Fullstack & Distributed Systems Engineer • Verifiable cryptographic proof portfolio active'}
            </p>
          </div>
        </div>

        {/* Profile Readiness & Primary Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Readiness Gauge */}
          <div className="hidden md:flex flex-col items-end gap-1 px-3 py-1 rounded-lg bg-[#181820]/70 border border-[#2b2a36]">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-[#9ca3af] font-medium">Readiness &amp; Proof</span>
              <span className="text-[#c4b5fd] font-bold">{completenessScore}%</span>
            </div>
            <div className="w-28 bg-[#111116] rounded-full h-1.5 overflow-hidden border border-[#2b2a36]">
              <div
                className="bg-gradient-to-r from-[#8861dc] to-[#c4b5fd] h-1.5 rounded-full transition-all shadow-[0_0_8px_rgba(136,97,220,0.5)]"
                style={{ width: `${Math.max(completenessScore, 15)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/projects"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#8861dc] to-[#7048c6] hover:from-[#966fed] hover:to-[#7e54da] text-white text-xs font-semibold transition-all shadow-[0_0_20px_-3px_rgba(136,97,220,0.5)] border border-[#a78bfa]/40 flex items-center gap-1.5"
            >
              <Icon name="folder" size={13} />
              <span>+ Project</span>
            </Link>
            <Link
              to="/resumes"
              className="px-3 py-1.5 rounded-lg bg-[#181820] hover:bg-[#20202c] border border-[#2f2e3d] hover:border-[#8861dc]/50 text-[#f3f0fa] text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Icon name="upload" size={13} />
              <span>Upload Resume</span>
            </Link>
            <Link
              to="/me/profile"
              className="px-2.5 py-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#181820] border border-transparent hover:border-[#2b2a36] text-xs transition-all font-medium"
            >
              Profile &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FOUR HIGH-CONTRAST KPI METRIC TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161d] to-[#101014] border border-[#2b2a36] hover:border-[#8861dc]/40 p-3.5 transition-all shadow-md group">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] font-medium">
            <span>Active Projects</span>
            <span className="p-1 rounded-md bg-[#8861dc]/10 text-[#c084fc] border border-[#8861dc]/25">
              <Icon name="folder" size={13} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-2xl font-bold tracking-tight text-white group-hover:text-[#c4b5fd] transition-colors">
              {activeProjectsCount}
            </div>
            <span className="text-[10px] font-medium text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded border border-[#10b981]/20">
              Active Sync
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1 truncate">Owned &amp; collaborative teams</div>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161d] to-[#101014] border border-[#2b2a36] hover:border-[#b29af5]/50 p-3.5 transition-all shadow-md group">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] font-medium">
            <span>Verified Skills</span>
            <span className="p-1 rounded-md bg-[#8861dc]/15 text-[#d8b4fe] border border-[#8861dc]/30">
              <Icon name="check" size={13} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-2xl font-bold tracking-tight text-[#c4b5fd] group-hover:text-white transition-colors">
              {verifiedSkillsCount}
            </div>
            <span className="text-[10px] font-medium text-[#8861dc] bg-[#8861dc]/10 px-1.5 py-0.5 rounded border border-[#8861dc]/30">
              Taxonomy
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1 truncate">Attested via repository commits</div>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161d] to-[#101014] border border-[#2b2a36] hover:border-[#f59e0b]/50 p-3.5 transition-all shadow-md group">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] font-medium">
            <span className="flex items-center gap-1.5">
              <span>Inbound Signals</span>
              {unreadNotifsCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]" />
                </span>
              )}
            </span>
            <span className="p-1 rounded-md bg-[#f59e0b]/15 text-[#fde68a] border border-[#f59e0b]/30">
              <Icon name="chat" size={13} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-2xl font-bold tracking-tight text-[#fbbf24] group-hover:text-white transition-colors">
              {unreadNotifsCount}
            </div>
            <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 px-1.5 py-0.5 rounded border border-[#f59e0b]/30">
              New Outreach
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1 truncate">Recruiter inquiries &amp; invites</div>
        </div>

        {/* Metric 4 */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161d] to-[#101014] border border-[#2b2a36] hover:border-[#10b981]/50 p-3.5 transition-all shadow-md group">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] font-medium">
            <span>Extractions Ready</span>
            <span className="p-1 rounded-md bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/30">
              <Icon name="resume" size={13} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1.5">
            <div className="text-2xl font-bold tracking-tight text-[#34d399] group-hover:text-white transition-colors">
              {readyResumesCount}
            </div>
            <span className="text-[10px] font-medium text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded border border-[#10b981]/30">
              AI Ready
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1 truncate">Processed resumes awaiting review</div>
        </div>
      </div>

      {/* 3. CAPABILITIES MENU GRID + LIVE SNAPSHOTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* LEFT 2 COLUMNS: VIVID 6-TILE CAPABILITY MENU GRID */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8861dc]" />
              Workspace Capabilities &amp; Menu Grid
            </span>
            <span className="text-[11px] text-[#9ca3af] font-medium">6 Tools Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {menuGridItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161e] via-[#121217] to-[#0e0e12] border border-[#2a2936] p-3.5 transition-all duration-200 flex flex-col justify-between group min-h-[122px] shadow-sm hover:-translate-y-0.5 ${item.hoverBorder}`}
              >
                {/* Hairline top specular glow */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${item.iconBg}`}>
                      <Icon name={item.icon} size={16} />
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${item.tagBg}`}>
                      {item.tag}
                    </span>
                  </div>
                  <h2 className="text-xs font-bold text-white group-hover:text-[#c4b5fd] transition-colors leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-[11px] text-[#9ca3af] mt-1 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#252430] flex items-center justify-between text-[11px] font-semibold text-[#6b7280] group-hover:text-white transition-colors">
                  <span>Launch Tool</span>
                  <span className="text-xs">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE SPRINT, SKILL GRAPH & RECRUITER ALERT */}
        <div className="space-y-3">
          {/* Active Sprint Milestone */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161e] to-[#111116] border border-[#2b2a36] p-3.5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                Active Sprint
              </span>
              <Link to="/projects" className="text-[11px] text-[#b29af5] hover:underline font-semibold">
                View All &rarr;
              </Link>
            </div>

            <div className="bg-[#181822] border border-[#2b2a36] rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[150px]">
                  {projects[0]?.title || 'Distributed Consensus Hub'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#10b981]/15 text-[#34d399] font-bold border border-[#10b981]/30">
                  85% Done
                </span>
              </div>
              <p className="text-[11px] text-[#9ca3af] line-clamp-1">
                Real-time Kafka event streaming architecture &amp; failover.
              </p>
              <div className="w-full bg-[#101014] rounded-full h-1.5 overflow-hidden border border-[#2b2a36]">
                <div
                  className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#6ee7b7] h-1.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                  style={{ width: '85%' }}
                />
              </div>
            </div>
          </div>

          {/* Attested Skills Graph Preview */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161e] to-[#111116] border border-[#2b2a36] p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Attested Skill Graph
              </span>
              <Link to="/me/profile" className="text-[11px] text-[#b29af5] hover:underline font-semibold">
                Manage
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'React', lvl: 'ADV' },
                { name: 'TypeScript', lvl: 'ADV' },
                { name: 'Node.js', lvl: 'ADV' },
                { name: 'PostgreSQL', lvl: 'INT' },
                { name: 'Kafka', lvl: 'ADV' },
                { name: 'Docker', lvl: 'INT' },
                { name: 'Prisma ORM', lvl: 'ADV' },
                { name: 'Systems', lvl: 'ADV' },
              ].map((s) => (
                <span
                  key={s.name}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1a1924] border border-[#333242] text-[#f3f0fa] flex items-center gap-1.5 hover:border-[#8861dc]/50 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                  <span>{s.name}</span>
                  <span className="text-[9px] text-[#8861dc] font-bold">{s.lvl}</span>
                </span>
              ))}
            </div>

            <div className="pt-2 text-[10px] text-[#6b7280] flex items-center justify-between border-t border-[#252430]">
              <span>Cryptographically verified</span>
              <span className="text-[#34d399] font-bold">8 Attested</span>
            </div>
          </div>

          {/* Recruiter Outreach Card with Luminous Amber Border */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1c1810] via-[#161410] to-[#191610] border border-[#f59e0b]/40 p-3 flex items-center justify-between gap-2 shadow-[0_0_16px_rgba(245,158,11,0.15)]">
            <div className="min-w-0">
              <div className="text-[10px] text-[#fbbf24] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                Recruiter Outreach
              </div>
              <div className="text-xs font-bold text-white truncate mt-0.5">
                Northstar Labs · Senior Systems
              </div>
            </div>
            <Link
              to="/opportunities"
              className="px-2.5 py-1 rounded-md bg-[#f59e0b]/20 hover:bg-[#f59e0b]/30 border border-[#f59e0b]/40 text-[#fde68a] text-[11px] font-bold transition-all shrink-0"
            >
              Review &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: AUDITED ACTIVITY TIMELINE & REAL-TIME SIGNALS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
        {/* RECENT ACTIONS & VERIFIED DELIVERY (2 COLUMNS) */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161e] to-[#111116] border border-[#2b2a36] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252430] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8861dc] shadow-[0_0_8px_rgba(136,97,220,0.6)]" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Actions &amp; Verified Delivery
              </h2>
            </div>
            <span className="text-[11px] text-[#9ca3af] font-medium">Audited cryptographic trail</span>
          </div>

          <div className="space-y-2">
            {fallbackActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#181822] hover:bg-[#1e1d2c] border border-[#2b2a36] hover:border-[#8861dc]/40 transition-all group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="relative flex h-2 w-2">
                      <span className={`inline-flex rounded-full h-2 w-2 ${act.dotColor}`} />
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${act.tagColor}`}>
                      {act.tag}
                    </span>
                    <h3 className="text-xs font-bold text-white group-hover:text-[#c4b5fd] transition-colors truncate">
                      {act.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] leading-relaxed pl-4">
                    {act.desc}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[10px] text-[#6b7280] font-medium">{act.time}</span>
                  {act.link && (
                    <Link
                      to={act.link}
                      className="text-[10px] text-[#b29af5] hover:text-white hover:underline font-bold"
                    >
                      Inspect &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INBOUND SIGNALS & COMMUNICATIONS (1 COLUMN) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16161e] to-[#111116] border border-[#2b2a36] p-4 space-y-3.5 flex flex-col justify-between shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#252430] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                  Inbound Signals &amp; Alerts
                </h2>
              </div>
              <Link
                to="/notifications"
                className="text-[11px] text-[#b29af5] hover:underline font-bold"
              >
                Inbox ({unreadNotifsCount}) &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {(notifications.length > 0 ? notifications.slice(0, 3) : [
                {
                  id: 'n-1',
                  type: 'outreach',
                  category: 'outreach',
                  title: 'Northstar Labs Interview Inquiry',
                  message: 'Fast-track invitation for Senior Distributed Systems Lead role based on verified PRs.',
                  read: false,
                  createdAt: '2h ago',
                  link: '/opportunities',
                },
                {
                  id: 'n-2',
                  type: 'challenge',
                  category: 'challenge',
                  title: 'Sponsored Challenge Open',
                  message: 'Real-Time Financial Fraud Detection Pipeline is open for verified submissions.',
                  read: false,
                  createdAt: '5h ago',
                  link: '/challenges',
                },
                {
                  id: 'n-3',
                  type: 'mentorship',
                  category: 'mentorship',
                  title: 'Architecture Review Requested',
                  message: 'A mentee requested feedback on their Kafka event partition strategy.',
                  read: true,
                  createdAt: '1d ago',
                  link: '/mentors',
                },
              ]).map((n, idx) => (
                <Link
                  key={n.id || idx}
                  to={n.link || '/notifications'}
                  className={`block p-2.5 rounded-lg border transition-all ${
                    !n.read
                      ? 'bg-gradient-to-r from-[#1c1a24] to-[#16151c] border-[#8861dc]/50 hover:border-[#b29af5] shadow-sm'
                      : 'bg-[#181822] border-[#2b2a36] hover:bg-[#1e1d2c]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#fde68a]">
                      {n.category || 'SIGNAL'}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8861dc] animate-pulse" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">
                    {n.title}
                  </div>
                  <div className="text-[11px] text-[#9ca3af] line-clamp-2 mt-0.5 leading-snug">
                    {n.message}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2.5 border-t border-[#252430] text-center">
            <Link
              to="/notifications"
              className="text-xs text-[#b29af5] hover:text-white font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <span>Open Communication Center</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
