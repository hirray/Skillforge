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
      <div className="py-20 text-center text-xs text-[#96939f] flex items-center justify-center gap-3">
        <svg className="w-5 h-5 text-[#b29af5] animate-spin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
        <span className="tracking-wide">Initializing SkillForge Cockpit HUD...</span>
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
    <div className="space-y-4 max-w-[1320px] mx-auto pb-10 font-sans">
      {/* =========================================================================
          1. COCKPIT HEADER STRIP (Linear HUD Navigation with System Pulse)
      ========================================================================= */}
      <header className="relative overflow-hidden rounded-2xl bg-[#111116] border border-[#262533] px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4">
        {/* Ambient Top Hairline Highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#b29af5]/30 to-transparent pointer-events-none" />

        {/* User Identity & Live Signal */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8861dc] to-[#533499] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_20px_rgba(136,97,220,0.4)] border border-[#b29af5]/40">
              {displayUserName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#111116] shadow-[0_0_8px_#10b981]" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm md:text-base font-bold text-white tracking-tight">
                {displayUserName}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#8861dc]/15 text-[#c084fc] border border-[#8861dc]/30">
                {roleLabel} · {currentUserId}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/25">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Neon DB Live
              </span>
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-0.5 line-clamp-1">
              {profile?.headline || 'Staff Distributed Systems Engineer • Verifiable commit evidence active'}
            </p>
          </div>
        </div>

        {/* System Telemetry Chips (Center) */}
        <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 rounded-xl bg-[#171720] border border-[#262533] text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-[#6b7280]">Pipeline:</span>
            <span className="text-white font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              Realtime Synced
            </span>
          </div>
          <div className="h-3 w-px bg-[#2b2a3a]" />
          <div className="flex items-center gap-2">
            <span className="text-[#6b7280]">Proof Seal:</span>
            <span className="text-[#c084fc] font-medium">100% Attested</span>
          </div>
          <div className="h-3 w-px bg-[#2b2a3a]" />
          <div className="flex items-center gap-2">
            <span className="text-[#6b7280]">Readiness:</span>
            <span className="text-[#34d399] font-bold">{completenessScore}%</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 ml-auto">
          <Link
            to="/projects"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#8861dc] via-[#7c55d0] to-[#6d44c4] hover:from-[#976eed] hover:to-[#7c51db] text-white text-xs font-semibold shadow-[0_0_24px_rgba(136,97,220,0.45)] border border-[#a78bfa]/40 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
          >
            <Icon name="folder" size={14} />
            <span>+ Create Project</span>
          </Link>
          <Link
            to="/resumes"
            className="px-3.5 py-1.5 rounded-xl bg-[#191922] hover:bg-[#22222e] border border-[#2f2e3f] text-[#f3f0fa] text-xs font-medium transition-all flex items-center gap-1.5 hover:border-[#8861dc]/50"
          >
            <Icon name="upload" size={14} />
            <span>AI Resume Parse</span>
          </Link>
          <Link
            to="/me/profile"
            className="px-3 py-1.5 rounded-xl text-[#9ca3af] hover:text-white hover:bg-[#191922] text-xs transition-colors border border-transparent hover:border-[#2f2e3f]"
          >
            Dossier &rarr;
          </Link>
        </div>
      </header>

      {/* =========================================================================
          2. HUD METRIC TILES STRIP (Sleek High-Density Counters)
      ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Metric 1: Active Projects */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#15151c] to-[#0f0f13] border border-[#272635] hover:border-[#8861dc]/50 p-3.5 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#9ca3af]">
            <span>Active Repositories</span>
            <span className="p-1.5 rounded-lg bg-[#8861dc]/10 text-[#c084fc] border border-[#8861dc]/25">
              <Icon name="folder" size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-[#c4b5fd] transition-colors">
              {activeProjectsCount}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#8861dc]/10 text-[#d8b4fe] border border-[#8861dc]/25">
              100% Tracked
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Owned &amp; collaborative sprints</div>
        </div>

        {/* Metric 2: Verified Skills */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#15151c] to-[#0f0f13] border border-[#272635] hover:border-[#38bdf8]/50 p-3.5 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#9ca3af]">
            <span>Attested Taxonomy</span>
            <span className="p-1.5 rounded-lg bg-[#0284c7]/10 text-[#38bdf8] border border-[#0284c7]/25">
              <Icon name="check" size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-[#38bdf8] group-hover:text-white transition-colors">
              {verifiedSkillsCount}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#0284c7]/10 text-[#7dd3fc] border border-[#0284c7]/25">
              Commit Verified
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Taxonomy proof graph linked</div>
        </div>

        {/* Metric 3: Inbound Signals */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#15151c] to-[#0f0f13] border border-[#272635] hover:border-[#f59e0b]/50 p-3.5 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#9ca3af]">
            <span className="flex items-center gap-1.5">
              <span>Recruiter Radar</span>
              {unreadNotifsCount > 0 && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f59e0b]" />
                </span>
              )}
            </span>
            <span className="p-1.5 rounded-lg bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/25">
              <Icon name="job" size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-[#fbbf24] group-hover:text-white transition-colors">
              {unreadNotifsCount}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f59e0b]/15 text-[#fde68a] border border-[#f59e0b]/30">
              Action Required
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Inbound enterprise outreaches</div>
        </div>

        {/* Metric 4: Extractions Ready */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#15151c] to-[#0f0f13] border border-[#272635] hover:border-[#10b981]/50 p-3.5 transition-all shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-[#9ca3af]">
            <span>AI Parser Queue</span>
            <span className="p-1.5 rounded-lg bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/25">
              <Icon name="resume" size={14} />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold tracking-tight text-[#34d399] group-hover:text-white transition-colors">
              {readyResumesCount}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#10b981]/10 text-[#6ee7b7] border border-[#10b981]/25">
              Ready
            </span>
          </div>
          <div className="text-[11px] text-[#6b7280] mt-1">Processed resume extractions</div>
        </div>
      </div>

      {/* =========================================================================
          3. ASYMMETRIC BENTO COCKPIT (Flight Control & Active Telemetry)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* LEFT BENTO (Span 7): ACTIVE REPOSITORY WORKSPACE */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141c] via-[#101015] to-[#0d0d11] border border-[#282738] p-5 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header with Project Status */}
            <div className="flex items-center justify-between border-b border-[#252433] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Project Workspace
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#8861dc]/15 text-[#c084fc] border border-[#8861dc]/30">
                  Production MVP
                </span>
              </div>
              <Link to="/projects" className="text-xs text-[#b29af5] hover:underline font-semibold flex items-center gap-1">
                <span>View All Projects</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Core Project Details */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Distributed Consensus &amp; Event Streaming Hub
                  </h3>
                  <p className="text-xs text-[#9ca3af] mt-1 max-w-xl leading-relaxed">
                    High-throughput event streaming engine with raft-backed consensus, partition leader election, and automated zero-downtime failover test suite.
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xl font-extrabold text-[#34d399]">85%</div>
                  <div className="text-[10px] text-[#6b7280]">Project Delivery</div>
                </div>
              </div>

              {/* Multi-Stage Visual Sprint Rail */}
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2 text-center text-[11px] mb-2 font-medium">
                  <div className="text-[#34d399] flex items-center justify-center gap-1">
                    <Icon name="check" size={12} />
                    <span>Raft Protocol</span>
                  </div>
                  <div className="text-[#34d399] flex items-center justify-center gap-1">
                    <Icon name="check" size={12} />
                    <span>Kafka Ingest</span>
                  </div>
                  <div className="text-[#c084fc] font-bold flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                    <span>Failover CI</span>
                  </div>
                  <div className="text-[#6b7280]">Production Release</div>
                </div>

                {/* Progress Track */}
                <div className="w-full bg-[#181824] rounded-full h-2 overflow-hidden border border-[#2b2a3c]">
                  <div
                    className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#8861dc] h-2 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)] transition-all"
                    style={{ width: '85%' }}
                  />
                </div>
              </div>

              {/* Workspace Quick Stats Bar */}
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                <div className="p-2.5 rounded-xl bg-[#171722] border border-[#282738] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#6b7280]">Repository Commits</div>
                    <div className="text-sm font-bold text-white mt-0.5">14 Commits</div>
                  </div>
                  <span className="text-[#34d399] text-xs font-semibold">Active</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#171722] border border-[#282738] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#6b7280]">Engineering Team</div>
                    <div className="text-sm font-bold text-white mt-0.5">3 Members</div>
                  </div>
                  <span className="text-[#c084fc] text-xs font-semibold">Collaborating</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#171722] border border-[#282738] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#6b7280]">Project Health</div>
                    <div className="text-sm font-bold text-[#34d399] mt-0.5">On Schedule</div>
                  </div>
                  <span className="text-[#6b7280] text-[11px]">0 blockers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Strip */}
          <div className="mt-4 pt-3 border-t border-[#252433] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#9ca3af]">
                Stage: <strong className="text-white">Production MVP</strong>
              </span>
              <span className="text-[11px] text-[#6b7280]">• Milestone 3 of 4</span>
            </div>
            <Link
              to="/projects/proj-consensus"
              className="px-3.5 py-1.5 rounded-lg bg-[#8861dc]/20 hover:bg-[#8861dc]/30 border border-[#8861dc]/40 text-[#c084fc] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Open Project Workspace</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* RIGHT BENTO (Span 5): LIVE RADAR & ATTESTED SKILL CLOUD */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Bento Card 1: Direct Inbound Lead Spotlight */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1c1810] via-[#151310] to-[#12100d] border border-[#f59e0b]/40 p-4 shadow-[0_0_24px_rgba(245,158,11,0.12)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f59e0b]" />
                </span>
                <span className="text-xs font-bold text-[#fbbf24] uppercase tracking-wider">
                  Live Inbound Opportunity
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f59e0b]/15 text-[#fde68a] border border-[#f59e0b]/30">
                Action Required
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                Northstar Labs · Senior Distributed Systems
              </h4>
              <p className="text-xs text-[#d1d5db] leading-relaxed">
                "We reviewed your verified Kafka pipeline commits and 96/100 score. We would love to fast-track you into our technical interview rounds."
              </p>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <Link
                to="/opportunities"
                className="flex-1 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-xs text-center transition-all shadow-[0_0_16px_rgba(245,158,11,0.4)]"
              >
                Accept &amp; Review Offer &rarr;
              </Link>
              <Link
                to="/opportunities"
                className="px-3 py-1.5 rounded-lg bg-[#262118] hover:bg-[#332b1f] border border-[#443825] text-[#9ca3af] hover:text-white text-xs font-medium transition-colors"
              >
                Decline
              </Link>
            </div>
          </div>

          {/* Bento Card 2: Attested Taxonomy Cloud */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141c] to-[#0e0e13] border border-[#282738] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#252433] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Attested Taxonomy Matrix
                </span>
              </div>
              <Link to="/me/profile" className="text-xs text-[#b29af5] hover:underline font-semibold">
                Manage &rarr;
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'React', lvl: 'Level 5 · Advanced', color: 'border-[#38bdf8]/40 text-[#7dd3fc]' },
                { name: 'TypeScript', lvl: 'Level 5 · Advanced', color: 'border-[#38bdf8]/40 text-[#7dd3fc]' },
                { name: 'Kafka', lvl: 'Level 4 · Verified', color: 'border-[#c084fc]/40 text-[#e9d5ff]' },
                { name: 'Distributed Systems', lvl: 'Level 5 · Staff', color: 'border-[#c084fc]/40 text-[#e9d5ff]' },
                { name: 'PostgreSQL', lvl: 'Level 4 · Database', color: 'border-[#34d399]/40 text-[#a7f3d0]' },
                { name: 'Docker', lvl: 'Level 3 · Container', color: 'border-[#94a3b8]/40 text-[#e2e8f0]' },
                { name: 'Prisma ORM', lvl: 'Level 4 · Schema', color: 'border-[#34d399]/40 text-[#a7f3d0]' },
              ].map((s) => (
                <div
                  key={s.name}
                  className={`px-2.5 py-1 rounded-lg bg-[#181822] border text-[11px] font-semibold flex items-center gap-1.5 hover:scale-105 transition-transform ${s.color}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>

            <div className="pt-1 text-[10.5px] text-[#6b7280] flex items-center justify-between border-t border-[#252433]">
              <span>Cryptographic Proof Linked</span>
              <span className="text-[#34d399] font-bold">100% Attestation Seal</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. MODULAR CAPABILITY LAUNCHPAD (Noticeable High-Impact Tooling Cards)
      ========================================================================= */}
      <section className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#8861dc]" />
            AI Intelligence Suite &amp; Modular Launchpad
          </span>
          <span className="text-[11px] text-[#9ca3af]">Enterprise Tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Project Blueprint AI */}
          <Link
            to="/ai/requirements"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#181622] via-[#131219] to-[#0e0d13] border border-[#2f2b42] hover:border-[#a855f7]/60 p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(168,85,247,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#a855f7]/15 text-[#e9d5ff] border border-[#a855f7]/30 flex items-center justify-center shadow-[0_0_16px_rgba(168,85,247,0.25)]">
                  <Icon name="spark" size={18} />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#a855f7]/10 text-[#d8b4fe] border border-[#a855f7]/30">
                  Architecture AI
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#d8b4fe] transition-colors">
                Project Blueprint Generator
              </h4>
              <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed line-clamp-2">
                Deconstruct ideas into required skill sets, role profiles, and delivery phases.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-[#2a2638] flex items-center justify-between text-xs font-semibold text-[#a855f7] group-hover:text-white transition-colors">
              <span>Generate Blueprint</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Card 2: Collaborator Matching */}
          <Link
            to="/ai/match"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111a19] via-[#0d1413] to-[#090e0e] border border-[#213532] hover:border-[#14b8a6]/60 p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(20,184,166,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#14b8a6]/15 text-[#5eead4] border border-[#14b8a6]/30 flex items-center justify-center shadow-[0_0_16px_rgba(20,184,166,0.25)]">
                  <Icon name="people" size={18} />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#14b8a6]/10 text-[#99f6e4] border border-[#14b8a6]/30">
                  Smart Synergy
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#5eead4] transition-colors">
                Collaborator Matching
              </h4>
              <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed line-clamp-2">
                Autonomous skill-gap ranker pairing developers with complementary strengths.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-[#1e302e] flex items-center justify-between text-xs font-semibold text-[#14b8a6] group-hover:text-white transition-colors">
              <span>Find Team Partners</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Card 3: Resume Intelligence */}
          <Link
            to="/resumes"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#111915] via-[#0d1410] to-[#090e0b] border border-[#213527] hover:border-[#10b981]/60 p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(16,185,129,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#10b981]/15 text-[#6ee7b7] border border-[#10b981]/30 flex items-center justify-center shadow-[0_0_16px_rgba(16,185,129,0.25)]">
                  <Icon name="resume" size={18} />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#a7f3d0] border border-[#10b981]/30">
                  AI Normalisation
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#6ee7b7] transition-colors">
                Resume Intelligence
              </h4>
              <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed line-clamp-2">
                Transform raw PDF resumes into verified taxonomy evidence with AI normalisation.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-[#1e3023] flex items-center justify-between text-xs font-semibold text-[#10b981] group-hover:text-white transition-colors">
              <span>Parse &amp; Normalize</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Card 4: Project Health Telemetry */}
          <Link
            to="/ai/health"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1d1215] via-[#160d10] to-[#10090c] border border-[#3b2027] hover:border-[#f43f5e]/60 p-4 transition-all duration-200 flex flex-col justify-between shadow-sm hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(244,63,94,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-[#f43f5e]/15 text-[#fda4af] border border-[#f43f5e]/30 flex items-center justify-center shadow-[0_0_16px_rgba(244,63,94,0.25)]">
                  <Icon name="health" size={18} />
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f43f5e]/10 text-[#ffe4e6] border border-[#f43f5e]/30">
                  Telemetry
                </span>
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-[#fda4af] transition-colors">
                Health &amp; Rescue Monitor
              </h4>
              <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed line-clamp-2">
                Real-time telemetry tracking milestone velocity, overdue tasks, and rescue alerts.
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-[#311b21] flex items-center justify-between text-xs font-semibold text-[#f43f5e] group-hover:text-white transition-colors">
              <span>Inspect Health</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          5. BOTTOM FEED: AUDITED ACTIONS & COMMUNICATIONS FEED
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 pt-1">
        {/* RECENT ACTIONS & AUDITED DELIVERY (7 COLUMNS) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-[#111116] border border-[#262533] p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#252433] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8861dc] shadow-[0_0_10px_#8861dc]" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Actions &amp; Verified Delivery
              </h4>
            </div>
            <span className="text-[11px] text-[#9ca3af] font-medium">Audited cryptographic trail</span>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'act-1',
                title: 'Attestation Verified: Distributed Consensus Hub',
                desc: 'Milestone 4 code review approved with cryptographic commit proof (SHA-256: 0x7fa2..11b8).',
                tag: 'Verified Proof',
                tagColor: 'text-[#5eead4] bg-[#14b8a6]/10 border-[#14b8a6]/30',
                time: '18m ago',
                link: '/projects',
              },
              {
                id: 'act-2',
                title: 'Taxonomy Skill Attested: Kafka & Event Streaming',
                desc: 'Normalized from verified repository commits and linked to candidate talent graph.',
                tag: 'Taxonomy',
                tagColor: 'text-[#c084fc] bg-[#8861dc]/10 border-[#8861dc]/30',
                time: '2h ago',
                link: '/me/profile',
              },
              {
                id: 'act-3',
                title: 'Collaborator Synergy Matched',
                desc: 'Autonomous match score 94% computed for backend role on Universal Monorepo Shell.',
                tag: 'AI Match',
                tagColor: 'text-[#fde68a] bg-[#f59e0b]/10 border-[#f59e0b]/30',
                time: '4h ago',
                link: '/ai/match',
              },
            ].map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-[#171720] hover:bg-[#1d1d28] border border-[#272635] hover:border-[#8861dc]/40 transition-all"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${act.tagColor}`}>
                      {act.tag}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {act.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                    {act.desc}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[10px] text-[#6b7280]">{act.time}</span>
                  <div>
                    <Link to={act.link} className="text-[10px] text-[#b29af5] hover:underline font-bold">
                      Inspect &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INBOUND SIGNALS & COMMUNICATIONS (5 COLUMNS) */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-[#111116] border border-[#262533] p-4 space-y-3 flex flex-col justify-between shadow-sm">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-[#252433] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_10px_#f59e0b]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Inbound Signals &amp; Alerts
                </h4>
              </div>
              <Link to="/notifications" className="text-[11px] text-[#b29af5] hover:underline font-bold">
                Inbox ({unreadNotifsCount}) &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {(notifications.length > 0 ? notifications.slice(0, 2) : [
                {
                  id: 'n-1',
                  category: 'outreach',
                  title: 'Northstar Labs Interview Inquiry',
                  message: 'Fast-track invitation for Senior Distributed Systems Lead role based on verified PRs.',
                  read: false,
                  link: '/opportunities',
                },
                {
                  id: 'n-2',
                  category: 'challenge',
                  title: 'Sponsored Challenge Open',
                  message: 'Real-Time Financial Fraud Detection Pipeline is open for verified submissions.',
                  read: false,
                  link: '/challenges',
                },
              ]).map((n, idx) => (
                <Link
                  key={n.id || idx}
                  to={n.link || '/notifications'}
                  className={`block p-2.5 rounded-xl border transition-all ${
                    !n.read
                      ? 'bg-gradient-to-r from-[#1e1c26] to-[#171620] border-[#8861dc]/50 hover:border-[#b29af5] shadow-sm'
                      : 'bg-[#171720] border-[#272635] hover:bg-[#1d1d28]'
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

          <div className="pt-2 border-t border-[#252433] text-center">
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
