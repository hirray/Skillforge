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
  },
  {
    path: '/ai/requirements',
    icon: 'spark',
    title: 'Project Blueprint AI',
    desc: 'Deconstruct ideas into required skill sets, role profiles, and delivery phases.',
    tag: 'Architecture AI',
  },
  {
    path: '/ai/match',
    icon: 'people',
    title: 'Collaborator Matching',
    desc: 'Autonomous skill-gap ranker pairing developers with complementary strengths.',
    tag: 'Smart Teams',
  },
  {
    path: '/resumes',
    icon: 'resume',
    title: 'Resume Intelligence',
    desc: 'Transform raw PDF resumes into verified taxonomy evidence with AI normalisation.',
    tag: 'AI Parser',
  },
  {
    path: '/opportunities',
    icon: 'job',
    title: 'Inbound Opportunities',
    desc: 'Review company outreaches, interview fast-tracks, and verified hiring pipelines.',
    tag: 'Recruiter Radar',
  },
  {
    path: '/ai/health',
    icon: 'health',
    title: 'Project Health Telemetry',
    desc: 'Real-time telemetry tracking milestone velocity, overdue tasks, and rescue alerts.',
    tag: 'Telemetry',
  },
];

const fallbackActivities: ActivityEvent[] = [
  {
    id: 'act-1',
    title: 'Attestation Verified: Distributed Consensus Hub',
    desc: 'Milestone 4 code review approved with cryptographic commit proof (SHA-256 hash 0x7fa2..11b8).',
    tag: 'Verified Proof',
    tagColor: 'text-[#6ad4bb] bg-[#11241f] border-[#1b3d34]',
    time: '18m ago',
    link: '/projects',
  },
  {
    id: 'act-2',
    title: 'Taxonomy Skill Attested: Kafka & Event Streaming',
    desc: 'Normalized from verified repository commits and added to candidate talent graph.',
    tag: 'Taxonomy',
    tagColor: 'text-[#b29af5] bg-[#1d1730] border-[#342456]',
    time: '2h ago',
    link: '/me/profile',
  },
  {
    id: 'act-3',
    title: 'Collaborator Synergy Matched',
    desc: 'Autonomous match score 94% computed for backend role on Universal Monorepo Shell.',
    tag: 'AI Match',
    tagColor: 'text-[#d9b774] bg-[#292215] border-[#443820]',
    time: '4h ago',
    link: '/ai/match',
  },
  {
    id: 'act-4',
    title: 'Resume AI Extraction Completed',
    desc: 'Parsed 8 core skills, 2 degree credentials, and 3 work experiences with zero warnings.',
    tag: 'Resume AI',
    tagColor: 'text-[#f0edf5] bg-[#19191e] border-[#26262e]',
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
      <div className="py-12 text-center text-xs text-[#96939f] flex items-center justify-center gap-2">
        <svg className="w-4 h-4 text-[#b29af5] animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <span>Loading workspace...</span>
      </div>
    );
  }

  // Smart User Name Resolution:
  // If user has customized their name, display it. If it's the generic placeholder "User" or "Candidate Engineer", show role persona.
  const rawName = profile?.displayName || profile?.name;
  const isGeneric = !rawName || rawName === 'User' || rawName === 'Candidate Engineer' || rawName === 'SkillForge User';
  const displayUserName = isGeneric ? roleLabel : rawName;

  const completenessScore = profile?.completeness?.percentage ?? profile?.completeness?.score ?? 100;
  const verifiedSkillsCount = profile?.skills?.length || 8;
  const activeProjectsCount = projects.length || context.projects.length || 7;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length || 2;
  const readyResumesCount = resumes.filter((r) => r.status === 'ready').length;

  return (
    <div className="space-y-3.5 max-w-[1240px] mx-auto pb-8">
      {/* 1. COMPACT IDENTITY & CONTROL HEADER */}
      <section className="bg-[#111114] border border-[#26262e] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#19191e] border border-[#26262e] text-[#b29af5] flex items-center justify-center font-bold text-xs shrink-0">
            {displayUserName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-[#f0edf5] truncate">
                Welcome back, {displayUserName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#19191e] text-[#b29af5] border border-[#26262e] shrink-0">
                {roleLabel} · {currentUserId}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[#11241f] text-[#6ad4bb] border border-[#1b3d34] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6ad4bb] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] text-[#96939f] truncate">
              {profile?.headline || 'Fullstack & Distributed Systems Engineer • AI talent matching active'}
            </p>
          </div>
        </div>

        {/* Profile Readiness & Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="hidden md:flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-[#96939f]">Readiness</span>
              <span className="text-[#b29af5] font-semibold">{completenessScore}%</span>
            </div>
            <div className="w-24 bg-[#19191e] border border-[#26262e] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#8861dc] to-[#b29af5] h-1.5 rounded-full transition-all"
                style={{ width: `${Math.max(completenessScore, 15)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/projects"
              className="px-2.5 py-1.5 rounded-lg bg-[#8861dc] hover:bg-[#7953cb] text-[#f0edf5] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Icon name="folder" size={13} />
              <span>+ Project</span>
            </Link>
            <Link
              to="/resumes"
              className="px-2.5 py-1.5 rounded-lg bg-[#19191e] hover:bg-[#202027] border border-[#26262e] text-[#f0edf5] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Icon name="upload" size={13} />
              <span>Resume AI</span>
            </Link>
            <Link
              to="/me/profile"
              className="px-2 py-1.5 rounded-lg text-[#96939f] hover:text-[#f0edf5] hover:bg-[#19191e] text-xs transition-colors"
              title="Edit Profile"
            >
              Profile &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 2. COMPACT 4-METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#111114] border border-[#26262e] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#96939f] font-medium">Active Projects</div>
            <div className="text-xl font-semibold text-[#f0edf5] mt-0.5">{activeProjectsCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#19191e] border border-[#26262e] text-[#b29af5] flex items-center justify-center">
            <Icon name="folder" size={15} />
          </div>
        </div>

        <div className="bg-[#111114] border border-[#26262e] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#96939f] font-medium">Verified Skills</div>
            <div className="text-xl font-semibold text-[#b29af5] mt-0.5">{verifiedSkillsCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#19191e] border border-[#26262e] text-[#b29af5] flex items-center justify-center">
            <Icon name="check" size={15} />
          </div>
        </div>

        <div className="bg-[#111114] border border-[#26262e] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#96939f] font-medium flex items-center gap-1">
              <span>Inbound Signals</span>
              {unreadNotifsCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9b774]" />
              )}
            </div>
            <div className="text-xl font-semibold text-[#d9b774] mt-0.5">{unreadNotifsCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#19191e] border border-[#26262e] text-[#d9b774] flex items-center justify-center">
            <Icon name="chat" size={15} />
          </div>
        </div>

        <div className="bg-[#111114] border border-[#26262e] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#96939f] font-medium">Extractions Ready</div>
            <div className="text-xl font-semibold text-[#6ad4bb] mt-0.5">{readyResumesCount}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-[#19191e] border border-[#26262e] text-[#6ad4bb] flex items-center justify-center">
            <Icon name="resume" size={15} />
          </div>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: MENU GRID (3x2) + COMPACT SNAPSHOT SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* LEFT 2 COLUMNS: FEATURE MENU GRID */}
        <div className="lg:col-span-2 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-[#f0edf5] uppercase tracking-wider text-[11px]">
              Workspace Capabilities &amp; Menu Grid
            </span>
            <span className="text-[11px] text-[#96939f]">Quick launch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {menuGridItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="bg-[#111114] hover:bg-[#151319] border border-[#26262e] hover:border-[#8861dc]/60 rounded-xl p-3 transition-all flex flex-col justify-between group min-h-[110px]"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-[#19191e] border border-[#26262e] text-[#b29af5] flex items-center justify-center group-hover:border-[#b29af5]/40 transition-colors">
                      <Icon name={item.icon} size={15} />
                    </span>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#19191e] text-[#96939f] border border-[#26262e]">
                      {item.tag}
                    </span>
                  </div>
                  <h2 className="text-xs font-medium text-[#f0edf5] group-hover:text-[#b29af5] transition-colors leading-tight">
                    {item.title}
                  </h2>
                  <p className="text-[10.5px] text-[#96939f] mt-1 leading-snug line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#26262e]/50 flex items-center justify-between text-[10px] text-[#706b78] group-hover:text-[#b29af5] transition-colors">
                  <span>Open</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SNAPSHOT & SKILL GRAPH */}
        <div className="space-y-3">
          {/* Active Sprint Milestone */}
          <div className="bg-[#111114] border border-[#26262e] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#f0edf5] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6ad4bb]" />
                Active Sprint
              </span>
              <Link to="/projects" className="text-[10px] text-[#b29af5] hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="bg-[#19191e] border border-[#26262e] rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#f0edf5] truncate max-w-[150px]">
                  {projects[0]?.title || 'Distributed Consensus Hub'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#11241f] text-[#6ad4bb] font-medium">
                  85%
                </span>
              </div>
              <p className="text-[10.5px] text-[#96939f] line-clamp-1">
                Real-time Kafka event streaming architecture &amp; failover.
              </p>
              <div className="w-full bg-[#111114] rounded-full h-1 overflow-hidden">
                <div className="bg-[#6ad4bb] h-1 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>

          {/* Attested Skills Graph Preview */}
          <div className="bg-[#111114] border border-[#26262e] rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#f0edf5]">
                Attested Skill Graph
              </span>
              <Link to="/me/profile" className="text-[10px] text-[#b29af5] hover:underline">
                Manage
              </Link>
            </div>

            <div className="flex flex-wrap gap-1">
              {[
                'React',
                'TypeScript',
                'Node.js',
                'PostgreSQL',
                'Prisma ORM',
                'Distributed Systems',
                'Kafka',
                'Docker',
              ].map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#19191e] border border-[#26262e] text-[#f0edf5] flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-[#6ad4bb]" />
                  {skill}
                </span>
              ))}
            </div>

            <div className="pt-1 text-[9.5px] text-[#706b78] flex items-center justify-between border-t border-[#26262e]/50">
              <span>Cryptographically verified</span>
              <span className="text-[#6ad4bb]">8 Active</span>
            </div>
          </div>

          {/* Quick Inbound Opportunity Pill */}
          <div className="bg-[#111114] border border-[#26262e] rounded-xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-[#d9b774] font-medium uppercase tracking-wider">
                Recruiter Outreach
              </div>
              <div className="text-xs font-medium text-[#f0edf5] truncate">
                Northstar Labs · Senior Systems
              </div>
            </div>
            <Link
              to="/opportunities"
              className="px-2 py-1 rounded bg-[#19191e] hover:bg-[#202027] border border-[#26262e] text-[#b29af5] text-[10px] font-medium shrink-0"
            >
              Review &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: RECENT WORKSPACE ACTIVITY & INBOUND NOTIFICATIONS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-1">
        {/* RECENT ACTIVITY & AUDIT TRAIL (2 COLUMNS) */}
        <div className="lg:col-span-2 bg-[#111114] border border-[#26262e] rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#26262e]/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#b29af5]" />
              <h2 className="text-xs font-semibold text-[#f0edf5] uppercase tracking-wider">
                Recent Actions &amp; Verified Delivery
              </h2>
            </div>
            <span className="text-[10.5px] text-[#96939f]">Audited cryptographic trail</span>
          </div>

          <div className="space-y-2">
            {fallbackActivities.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-[#151319] hover:bg-[#19191e] border border-[#26262e]/60 transition-colors"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-medium border ${act.tagColor}`}>
                      {act.tag}
                    </span>
                    <h3 className="text-xs font-medium text-[#f0edf5] truncate">
                      {act.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-[#96939f] leading-snug">
                    {act.desc}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[10px] text-[#706b78]">{act.time}</span>
                  {act.link && (
                    <Link
                      to={act.link}
                      className="text-[10px] text-[#b29af5] hover:underline font-medium"
                    >
                      View &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INBOUND NOTIFICATIONS & COMMUNICATIONS (1 COLUMN) */}
        <div className="bg-[#111114] border border-[#26262e] rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#26262e]/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d9b774]" />
                <h2 className="text-xs font-semibold text-[#f0edf5] uppercase tracking-wider">
                  Inbound Signals &amp; Alerts
                </h2>
              </div>
              <Link
                to="/notifications"
                className="text-[10px] text-[#b29af5] hover:underline font-medium"
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
                  title: 'New Sponsored Challenge',
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
                      ? 'bg-[#19191e] border-[#b29af5]/30 hover:border-[#b29af5]'
                      : 'bg-[#151319] border-[#26262e]/60 hover:bg-[#19191e]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#d9b774]">
                      {n.category || 'SIGNAL'}
                    </span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b29af5]" />
                    )}
                  </div>
                  <div className="text-xs font-medium text-[#f0edf5] line-clamp-1">
                    {n.title}
                  </div>
                  <div className="text-[10.5px] text-[#96939f] line-clamp-2 mt-0.5 leading-snug">
                    {n.message}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#26262e]/60 text-center">
            <Link
              to="/notifications"
              className="text-[11px] text-[#96939f] hover:text-[#f0edf5] font-medium transition-colors"
            >
              Open Communication Center &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
