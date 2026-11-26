import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActiveContext, getActivePersona } from '../../context/ContextModel';
import { navigationConfig } from '../../config/navigation';
import { api, token } from '../ai/client';
import { Icon } from '../ai/shared';

interface UserProfile {
  id: string;
  name?: string;
  displayName?: string;
  headline?: string;
  avatarUrl?: string;
  workMode?: 'immediate' | 'two_weeks' | 'one_month' | 'unavailable';
  completeness?: { score?: number; percentage?: number };
  skills?: Array<{ id: string; name: string; level?: string }>;
}

export const UnifiedHome: React.FC = () => {
  const { activeContext } = useActiveContext();
  const currentToken = token();
  const config = navigationConfig[activeContext] || navigationConfig.individual;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [availability, setAvailability] = useState<'immediate' | 'two_weeks' | 'one_month' | 'unavailable'>('immediate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [meRes, notifRes] = await Promise.allSettled([
          api('/users/me'),
          api('/notifications?limit=6'),
        ]);

        if (isMounted) {
          if (meRes.status === 'fulfilled' && meRes.value) {
            const raw = meRes.value as any;
            const u = raw.user || raw;
            setProfile(u);
            if (u.workMode) setAvailability(u.workMode);
          }
          if (notifRes.status === 'fulfilled' && notifRes.value) {
            const items = Array.isArray(notifRes.value)
              ? notifRes.value
              : (notifRes.value as any).items || [];
            setNotifications(items);
          }
        }
      } catch (err) {
        console.warn('Home data load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, [currentToken, activeContext]);

  // Context-specific Stats (Zone B) with rich color styling
  const getContextStats = () => {
    switch (activeContext) {
      case 'recruiter':
        return [
          {
            label: 'Open Positions',
            value: 4,
            trend: '2 Active Sprints',
            subline: 'Across 2 engineering teams',
            color: 'violet',
            icon: 'briefcase',
            route: '/jobs',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Talent Pipeline',
            value: 12,
            trend: '+3 New Candidates',
            subline: '4 in Technical Review',
            color: 'cyan',
            icon: 'users',
            route: '/pipeline',
            dataTour: 'home-stat-2',
          },
          {
            label: 'AI Synergy Matches',
            value: 8,
            trend: '85%+ Match Score',
            subline: 'Autonomous talent ranker',
            color: 'emerald',
            icon: 'sparkles',
            route: '/ai/job-match',
            dataTour: 'home-stat-3',
          },
          {
            label: 'Awaiting Outreach',
            value: 2,
            trend: 'Action Required',
            subline: 'Candidate responded to ping',
            color: 'amber',
            icon: 'chat',
            route: '/pipeline?stage=new',
            dataTour: 'home-stat-4',
          },
        ];
      case 'company_admin':
        return [
          {
            label: 'Active Job Postings',
            value: 4,
            trend: 'Standard Tier',
            subline: '2 distributed systems roles',
            color: 'violet',
            icon: 'briefcase',
            route: '/jobs',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Challenge Submissions',
            value: 7,
            trend: '3 Need Review',
            subline: 'Sponsored hackathon entries',
            color: 'cyan',
            icon: 'trophy',
            route: '/challenges?tab=submissions',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Recruiter Seats',
            value: '4 / 10',
            trend: '6 Available',
            subline: 'Enterprise workspace plan',
            color: 'emerald',
            icon: 'users',
            route: '/companies?tab=seats',
            dataTour: 'home-stat-3',
          },
          {
            label: 'Company Verification',
            value: 'Verified',
            trend: 'Enterprise Seal',
            subline: 'Cryptographic company identity',
            color: 'amber',
            icon: 'shield',
            route: '/companies',
            dataTour: 'home-stat-4',
          },
        ];
      case 'mentor':
        return [
          {
            label: 'Pending Requests',
            value: 3,
            trend: '2 New Today',
            subline: 'Student & freelancer teams',
            color: 'violet',
            icon: 'users',
            route: '/mentors?tab=requests',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Mentored Projects',
            value: 5,
            trend: 'Active Guidance',
            subline: 'Distributed Systems & ML',
            color: 'cyan',
            icon: 'folder',
            route: '/mentors?tab=projects',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Feedback Deliverables',
            value: 2,
            trend: 'Due Milestone 4',
            subline: 'Architectural sign-off needed',
            color: 'emerald',
            icon: 'check',
            route: '/mentors?tab=feedback',
            dataTour: 'home-stat-3',
          },
          {
            label: 'Weekly Office Hours',
            value: '6 hrs',
            trend: 'Open Capacity',
            subline: 'Calendar sync active',
            color: 'amber',
            icon: 'activity',
            route: '/mentors?tab=availability',
            dataTour: 'home-stat-4',
          },
        ];
      case 'platform_admin':
        return [
          {
            label: 'Moderation Queue',
            value: 3,
            trend: 'SLA: 4.2h',
            subline: 'Reported projects & messages',
            color: 'violet',
            icon: 'shield',
            route: '/admin?tab=reports',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Identity Verifications',
            value: 2,
            trend: 'Pending Review',
            subline: 'Employer and mentor seals',
            color: 'cyan',
            icon: 'users',
            route: '/admin?tab=verification',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Certificates Emitted',
            value: 124,
            trend: '+12 This Week',
            subline: 'Signed with Ed25519 root key',
            color: 'emerald',
            icon: 'file-text',
            route: '/certificates',
            dataTour: 'home-stat-3',
          },
          {
            label: 'System Audit Integrity',
            value: '100%',
            trend: 'Zero Drift',
            subline: 'Immutable ledger synced',
            color: 'amber',
            icon: 'activity',
            route: '/admin?tab=audit',
            dataTour: 'home-stat-4',
          },
        ];
      case 'individual':
      default:
        return [
          {
            label: 'Active Projects',
            value: 7,
            trend: '1 Production Sprint',
            subline: 'Distributed Consensus & Event Hub',
            color: 'violet',
            icon: 'folder',
            route: '/projects',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Attested Skills',
            value: 8,
            trend: '100% Attested',
            subline: 'Cryptographic commit proofs',
            color: 'cyan',
            icon: 'check',
            route: '/me/profile',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Inbound Signals',
            value: 2,
            trend: 'Fast-Track Outreach',
            subline: 'Northstar Labs & TechScale pings',
            color: 'amber',
            icon: 'chat',
            route: '/notifications',
            dataTour: 'home-stat-3',
          },
          {
            label: 'AI Synergy Match',
            value: '94%',
            trend: 'Top 5% Candidate',
            subline: 'Senior Distributed Systems role',
            color: 'emerald',
            icon: 'sparkles',
            route: '/ai/job-match',
            dataTour: 'home-stat-4',
          },
        ];
    }
  };

  // Next Best Actions (Zone C)
  const getNextBestActions = () => {
    switch (activeContext) {
      case 'recruiter':
        return [
          {
            id: 'nba-1',
            tag: 'AI SYNERGY',
            text: '3 high-synergy candidates (94%+ match) matched for Senior Distributed Systems Lead.',
            action: 'Review Candidates',
            route: '/ai/job-match',
          },
          {
            id: 'nba-2',
            tag: 'OUTREACH',
            text: 'Elena Rostova accepted your interview invitation. Schedule technical architecture round.',
            action: 'Open Pipeline',
            route: '/pipeline',
          },
        ];
      case 'company_admin':
        return [
          {
            id: 'nba-1',
            tag: 'VERIFICATION',
            text: 'Upload business registration document to unlock the gold verified company badge.',
            action: 'Verify Company',
            route: '/companies',
          },
          {
            id: 'nba-2',
            tag: 'SEATS',
            text: 'You have 6 unused recruiter seats on your enterprise subscription.',
            action: 'Invite Teammates',
            route: '/companies?tab=seats',
          },
        ];
      case 'mentor':
        return [
          {
            id: 'nba-1',
            tag: 'REVIEW',
            text: 'Distributed Consensus Hub requested architectural feedback on Raft leader failover.',
            action: 'Give Feedback',
            route: '/mentors?tab=feedback',
          },
          {
            id: 'nba-2',
            tag: 'CALENDAR',
            text: 'Confirm your office hours for next Tuesday (2 pending student bookings).',
            action: 'Set Availability',
            route: '/mentors?tab=availability',
          },
        ];
      case 'platform_admin':
        return [
          {
            id: 'nba-1',
            tag: 'MODERATION',
            text: '3 community project reports waiting for review (oldest ticket: 4.2h).',
            action: 'Inspect Reports',
            route: '/admin?tab=reports',
          },
          {
            id: 'nba-2',
            tag: 'CERTIFICATES',
            text: 'Batch of 5 completion certificates pending automated cryptographic signature verification.',
            action: 'Audit Signatures',
            route: '/certificates',
          },
        ];
      case 'individual':
      default:
        return [
          {
            id: 'nba-1',
            tag: 'NEXT ACTION',
            text: 'Milestone 3 review ready for Distributed Consensus Hub. Review pull request with your team.',
            action: 'Enter Project Room',
            route: '/projects/proj-consensus',
          },
          {
            id: 'nba-2',
            tag: 'RECRUITER INQUIRY',
            text: 'Northstar Labs sent a direct interview inquiry for Senior Systems Engineer.',
            action: 'Review Inquiry',
            route: '/opportunities',
          },
        ];
    }
  };

  const completeness = profile?.completeness?.percentage ?? profile?.completeness?.score ?? 100;
  const currentPersona = getActivePersona(currentToken);
  const userName = profile?.displayName || profile?.name || currentPersona.name;

  const colorVariants: Record<string, { bg: string; border: string; text: string; glow: string; badgeBg: string }> = {
    violet: {
      bg: 'from-[#19152b] via-[#131122] to-[#0d0c17]',
      border: 'border-[#7c3aed]/40 hover:border-[#a78bfa]',
      text: 'text-[#c4b5fd]',
      glow: 'shadow-[0_0_24px_rgba(124,58,237,0.2)]',
      badgeBg: 'bg-[#7c3aed]/15 text-[#c4b5fd] border-[#7c3aed]/30',
    },
    cyan: {
      bg: 'from-[#101d2d] via-[#0d1622] to-[#0a0f18]',
      border: 'border-[#0284c7]/40 hover:border-[#38bdf8]',
      text: 'text-[#38bdf8]',
      glow: 'shadow-[0_0_24px_rgba(56,189,248,0.2)]',
      badgeBg: 'bg-[#0284c7]/15 text-[#38bdf8] border-[#0284c7]/30',
    },
    emerald: {
      bg: 'from-[#0e241e] via-[#0b1b16] to-[#091310]',
      border: 'border-[#059669]/40 hover:border-[#34d399]',
      text: 'text-[#34d399]',
      glow: 'shadow-[0_0_24px_rgba(52,211,153,0.2)]',
      badgeBg: 'bg-[#059669]/15 text-[#34d399] border-[#059669]/30',
    },
    amber: {
      bg: 'from-[#291e10] via-[#1d160c] to-[#120d07]',
      border: 'border-[#d97706]/40 hover:border-[#fbbf24]',
      text: 'text-[#fbbf24]',
      glow: 'shadow-[0_0_24px_rgba(251,191,36,0.2)]',
      badgeBg: 'bg-[#d97706]/15 text-[#fbbf24] border-[#d97706]/30',
    },
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs text-[#96939f]">
        <div className="w-8 h-8 rounded-full border-2 border-[#8861dc] border-t-transparent animate-spin" />
        <span className="font-medium tracking-wide text-white">Loading SkillForge Cockpit...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-[1360px] mx-auto pb-12 font-sans animate-fadeIn">
      {/* =========================================================================
          ZONE A: THE EXECUTIVE COMMAND HEADER (FLIGHT DECK)
      ========================================================================= */}
      <header
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141420] via-[#101018] to-[#12121e] border border-[#2d2c3e] p-4 lg:p-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-wrap items-center justify-between gap-4"
        data-tour="home-profile-card"
      >
        {/* Subtle Ambient Light Glow at Top Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8861dc]/60 to-transparent pointer-events-none" />

        {/* User Identity Block */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8861dc] via-[#6366f1] to-[#3b82f6] text-white flex items-center justify-center font-black text-base shadow-[0_0_24px_rgba(136,97,220,0.5)] border border-[#c4b5fd]/40">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-[#101018] shadow-[0_0_10px_#10b981]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base md:text-lg font-black text-white tracking-tight truncate">
                Welcome back, {userName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8861dc]/20 text-[#c4b5fd] border border-[#8861dc]/40 tracking-wide uppercase">
                {config.label}
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Live Attestation Active
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-0.5 truncate max-w-xl">
              {profile?.headline || 'Staff Distributed Systems Engineer • Verifiable commit evidence active'}
            </p>
          </div>
        </div>

        {/* Right Cockpit HUD: Attestation Ring & Quick Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* Availability Switch Pill */}
          <button
            onClick={() => setAvailability(availability === 'immediate' ? 'unavailable' : 'immediate')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              availability === 'immediate'
                ? 'bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30 hover:bg-[#10b981]/25'
                : 'bg-[#1f1e29] text-[#9ca3af] border-[#2d2c3e] hover:text-white'
            }`}
            title="Click to toggle availability state"
          >
            <span className={`w-2 h-2 rounded-full ${availability === 'immediate' ? 'bg-[#10b981]' : 'bg-[#6b7280]'}`} />
            <span>{availability === 'immediate' ? 'Available Immediate' : 'Busy / On Sprint'}</span>
          </button>

          {/* Attestation Score Pill */}
          <div className="flex items-center gap-2 bg-[#171724] border border-[#2b2a3d] px-3 py-1.5 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] text-[#6b7280] font-medium uppercase tracking-wider">Proof Score</div>
              <div className="text-xs font-extrabold text-[#34d399]">{completeness}% Complete</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#10b981]/20 border border-[#10b981] flex items-center justify-center text-[10px] font-bold text-[#34d399]">
              ✓
            </div>
          </div>

          {/* Primary High-Impact CTA Button */}
          <Link
            to={activeContext === 'recruiter' ? '/jobs' : '/projects'}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#4f46e5] hover:from-[#8b5cf6] hover:to-[#6366f1] text-white text-xs font-bold shadow-[0_0_24px_rgba(124,58,237,0.5)] border border-[#c4b5fd]/30 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="folder" size={14} />
            <span>{activeContext === 'recruiter' ? '+ Post New Job' : '+ Create Project'}</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          ZONE B: METRICS HORIZON (4 NOTICEABLE, HIGH-CONTRAST KPI TILES)
      ========================================================================= */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" data-tour="home-stats">
        {getContextStats().map((st) => {
          const style = colorVariants[st.color] || colorVariants.violet;
          return (
            <Link
              key={st.label}
              to={st.route}
              data-tour={st.dataTour}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.bg} border ${style.border} p-4 transition-all duration-200 flex flex-col justify-between min-h-[110px] ${style.glow} hover:-translate-y-0.5`}
            >
              {/* Top ambient highlight */}
              <div className="flex items-center justify-between text-xs font-semibold text-[#9ca3af]">
                <span className="truncate">{st.label}</span>
                <span className={`p-1.5 rounded-lg ${style.badgeBg} flex items-center justify-center shrink-0`}>
                  <Icon name={st.icon} size={14} />
                </span>
              </div>

              {/* Bold Stat Number & Trend Badge */}
              <div className="flex items-baseline justify-between mt-2.5">
                <span className="text-3xl font-black tracking-tight text-white group-hover:scale-105 transition-transform duration-200">
                  {st.value}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${style.badgeBg} truncate max-w-[120px]`}>
                  {st.trend}
                </span>
              </div>

              {/* Subline Context */}
              <div className="text-[11px] text-[#6b7280] font-medium mt-1 truncate">
                {st.subline}
              </div>
            </Link>
          );
        })}
      </section>

      {/* =========================================================================
          ZONE C & D: THE ASYMMETRIC INTELLIGENCE BENTO (COCKPIT)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* LEFT BENTO (Span 8): CURRENT PROJECT FOCUS & ACTIVE WORKSPACE */}
        <div className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141e] via-[#101017] to-[#0c0c12] border border-[#2b2a3c] p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header with Project Status & Deep Links */}
            <div className="flex items-center justify-between border-b border-[#252435] pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Current Project Focus
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                  Active • In Progress
                </span>
                <span className="text-[10px] text-[#9ca3af] hidden sm:inline">
                  Fullstack Systems
                </span>
              </div>
              <Link to="/projects" className="text-xs text-[#b29af5] hover:text-white font-bold flex items-center gap-1 transition-colors">
                <span>All Projects (6)</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Core Project Details */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Distributed Consensus &amp; Event Streaming Hub
                </h2>
                <p className="text-xs text-[#9ca3af] mt-1 max-w-xl leading-relaxed">
                  Real-time event streaming platform with automatic failover, cluster leader election, and distributed testing suite.
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-2xl font-black text-[#34d399]">75%</div>
                <div className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider">Completed</div>
              </div>
            </div>

            {/* Clear Roadmap / Milestone Steps */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium text-[#9ca3af]">
                <span>Project Milestones (3 of 4 in progress)</span>
                <span className="text-xs text-[#c4b5fd] font-bold">Target: Dec 15</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] mb-2 font-medium">
                <div className="text-[#34d399] flex items-center justify-center gap-1.5 bg-[#10b981]/10 py-1.5 px-2 rounded-lg border border-[#10b981]/20">
                  <Icon name="check" size={12} />
                  <span className="truncate">1. Architecture</span>
                </div>
                <div className="text-[#34d399] flex items-center justify-center gap-1.5 bg-[#10b981]/10 py-1.5 px-2 rounded-lg border border-[#10b981]/20">
                  <Icon name="check" size={12} />
                  <span className="truncate">2. Core APIs</span>
                </div>
                <div className="text-[#c4b5fd] flex items-center justify-center gap-1.5 bg-[#7c3aed]/20 py-1.5 px-2 rounded-lg border border-[#7c3aed]/40 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c4b5fd] animate-pulse" />
                  <span className="truncate">3. Testing &amp; Polish</span>
                </div>
                <div className="text-[#6b7280] flex items-center justify-center gap-1.5 bg-[#181824] py-1.5 px-2 rounded-lg border border-[#262535]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4b5563]" />
                  <span className="truncate">4. Verification</span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-[#181824] rounded-full h-2 overflow-hidden border border-[#2b2a3c]">
                <div
                  className="bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#8861dc] h-full rounded-full transition-all"
                  style={{ width: '75%' }}
                />
              </div>
            </div>

            {/* Simple Human-Friendly Stats Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-[#171724] border border-[#272638] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#6b7280] font-medium">Team Members</div>
                  <div className="text-xs font-bold text-white mt-0.5">3 Collaborators</div>
                </div>
                <span className="text-[#34d399] text-[10px] font-bold bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                  Active
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#171724] border border-[#272638] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#6b7280] font-medium">Tasks Progress</div>
                  <div className="text-xs font-bold text-white mt-0.5">12 Done, 3 Open</div>
                </div>
                <span className="text-[#c4b5fd] text-[10px] font-bold bg-[#7c3aed]/15 px-2 py-0.5 rounded border border-[#7c3aed]/30">
                  On Track
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#171724] border border-[#272638] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#6b7280] font-medium">Codebase Commits</div>
                  <div className="text-xs font-bold text-white mt-0.5">14 Commits</div>
                </div>
                <span className="text-[#34d399] text-[10px] font-bold bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                  Synced
                </span>
              </div>
            </div>
          </div>

          {/* ZONE C: NEXT BEST ACTION (INTEGRATED INTO CURRENT WORKSPACE) */}
          <div className="pt-2 border-t border-[#252435]">
            <div className="space-y-2">
              {getNextBestActions().map((nba) => (
                <div
                  key={nba.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-[#181827] via-[#141420] to-[#12121c] border border-[#2f2e42] hover:border-[#8861dc]/60 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider bg-[#8861dc]/25 text-[#c4b5fd] border border-[#8861dc]/40 shrink-0">
                      {nba.tag}
                    </span>
                    <p className="text-xs text-[#e2e8f0] font-medium truncate">
                      {nba.text}
                    </p>
                  </div>
                  <Link
                    to={nba.route}
                    className="px-3.5 py-1.5 rounded-xl bg-[#8861dc]/20 hover:bg-[#8861dc] text-[#c4b5fd] hover:text-white border border-[#8861dc]/40 text-xs font-bold transition-all shrink-0 hover:shadow-[0_0_16px_rgba(136,97,220,0.4)]"
                  >
                    {nba.action} &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT BENTO (Span 4): ATTESTED PROOF GRAPH & TALENT RADAR */}
        <div className="lg:col-span-4 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141e] via-[#101017] to-[#0c0c12] border border-[#2b2a3c] p-5 shadow-lg flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#252435] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Attested Skill Graph
                </span>
              </div>
              <Link to="/me/profile" className="text-xs text-[#38bdf8] hover:underline font-bold">
                Taxonomy &rarr;
              </Link>
            </div>

            {/* Interactive Attested Skill Pills */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'React', level: 'ADV' },
                { name: 'TypeScript', level: 'ADV' },
                { name: 'Node.js', level: 'ADV' },
                { name: 'PostgreSQL', level: 'INT' },
                { name: 'Prisma ORM', level: 'ADV' },
                { name: 'Kafka', level: 'PRO' },
                { name: 'Docker', level: 'INT' },
                { name: 'System Design', level: 'ADV' },
              ].map((sk) => (
                <span
                  key={sk.name}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#171724] border border-[#2d2c3e] text-[#f1f5f9] flex items-center gap-1.5 hover:border-[#8861dc]/50 transition-colors"
                >
                  <span className="text-[#10b981] font-bold text-[10px]">✓</span>
                  <span>{sk.name}</span>
                  <span className="text-[9px] font-bold text-[#9ca3af] bg-[#222132] px-1.5 py-0.2 rounded">
                    {sk.level}
                  </span>
                </span>
              ))}
            </div>

            {/* Cryptographic Attestation Seal Card */}
            <div className="p-3 rounded-xl bg-[#111827]/60 border border-[#1e293b] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1">
                  <Icon name="shield" size={12} />
                  <span>Attestation Seal</span>
                </span>
                <span className="text-[10px] text-[#9ca3af] font-mono">0x7fa2...11b8</span>
              </div>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                All skills attested against verified Git commit signatures and milestone sign-offs.
              </p>
            </div>
          </div>

          {/* Recruiter Outreach Spotlight */}
          <div className="pt-2 border-t border-[#252435]">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#291e10] via-[#1f160b] to-[#140e07] border border-[#d97706]/35 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#fbbf24] animate-ping" />
                  Recruiter Outreach
                </span>
                <span className="text-[10px] text-[#9ca3af]">2h ago</span>
              </div>
              <h4 className="text-xs font-bold text-white">
                Northstar Labs — Senior Systems Lead
              </h4>
              <p className="text-[11px] text-[#d1d5db]">
                Fast-track interview inquiry based on verified raft consensus PRs.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Link
                  to="/opportunities"
                  className="flex-1 py-1 rounded-lg bg-[#fbbf24] hover:bg-[#f59e0b] text-black text-center text-xs font-extrabold transition-all"
                >
                  Review Terms &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ZONE D: WORKSPACE CAPABILITIES LAUNCHPAD (VIBRANT & NOTICEABLE)
      ========================================================================= */}
      <section className="space-y-3 pt-2" data-tour="home-shortcuts">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8861dc]" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Workspace Capabilities &amp; Launchpad
            </h3>
          </div>
          <Link
            to="/demos"
            className="text-xs text-[#c4b5fd] hover:text-white font-bold flex items-center gap-1.5 transition-colors bg-[#7c3aed]/15 hover:bg-[#7c3aed]/30 px-2.5 py-1 rounded-full border border-[#7c3aed]/30 shadow-xs"
          >
            <Icon name="gamepad" size={13} />
            <span>Live Feature Demos</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            {
              id: 'launch-blueprint',
              title: 'Project Blueprint AI',
              description: 'Deconstruct ideas into required skill sets, role profiles, and delivery phases.',
              badge: 'Architecture AI',
              icon: 'sparkles',
              color: 'violet',
              route: '/ai/requirements',
            },
            {
              id: 'launch-collab',
              title: 'Collaborator Matching',
              description: 'Autonomous skill-gap ranker pairing developers with complementary strengths.',
              badge: 'Smart Teams',
              icon: 'users',
              color: 'cyan',
              route: '/ai/match',
            },
            {
              id: 'launch-resume',
              title: 'Resume Intelligence',
              description: 'Transform raw PDF resumes into verified taxonomy evidence with AI normalisation.',
              badge: 'AI Parser',
              icon: 'file-text',
              color: 'emerald',
              route: '/resumes',
            },
            {
              id: 'launch-inbound',
              title: 'Inbound Opportunities',
              description: 'Review company outreaches, interview fast-tracks, and verified hiring pipelines.',
              badge: 'Recruiter Radar',
              icon: 'chat',
              color: 'amber',
              route: '/opportunities',
            },
            {
              id: 'launch-telemetry',
              title: 'Project Health Telemetry',
              description: 'Real-time telemetry tracking milestone velocity, overdue tasks, and rescue alerts.',
              badge: 'Telemetry AI',
              icon: 'activity',
              color: 'violet',
              route: '/ai/health',
            },
            {
              id: 'launch-hackathons',
              title: 'Hackathons & Bounties',
              description: 'Compete in high-stakes architectural sprints and earn cryptographically verified credentials.',
              badge: 'Active Bounties',
              icon: 'trophy',
              color: 'cyan',
              route: '/challenges',
            },
          ].map((card) => {
            const style = colorVariants[card.color] || colorVariants.violet;
            return (
              <Link
                key={card.id}
                to={card.route}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#151522] via-[#111118] to-[#0d0d14] border border-[#2b2a3d] hover:border-[#8861dc]/60 p-4 transition-all duration-200 flex flex-col justify-between min-h-[135px] shadow-sm hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-8 h-8 rounded-xl ${style.badgeBg} flex items-center justify-center`}>
                      <Icon name={card.icon} size={16} />
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-[#c4b5fd] transition-colors leading-tight">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#9ca3af] mt-1.5 leading-relaxed line-clamp-2">
                    {card.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#252435] flex items-center justify-between text-xs font-bold text-[#6b7280] group-hover:text-white transition-colors">
                  <span>Launch Workspace</span>
                  <span>&rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          ZONE E: VERIFIED LEDGER & INBOUND SIGNALS (BOTTOM DUAL STREAM)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 pt-2" data-tour="home-notifications">
        {/* LEFT COLUMN (Span 7): RECENT ACTIONS & VERIFIED DELIVERY */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141e] to-[#0e0e15] border border-[#2b2a3c] p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#252435] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Recent Actions &amp; Verified Delivery
              </h3>
            </div>
            <span className="text-[11px] text-[#6b7280] font-mono">Audited cryptographic trail</span>
          </div>

          <div className="space-y-2">
            {[
              {
                id: 'act-1',
                badge: 'Verified Proof',
                title: 'Attestation Verified: Distributed Consensus Hub',
                desc: 'Milestone 4 code review approved with cryptographic commit proof (SHA-256 hash 0x7fa2...11b8).',
                time: '18m ago',
                link: '/projects',
              },
              {
                id: 'act-2',
                badge: 'Taxonomy',
                title: 'Taxonomy Skill Attested: Kafka & Event Streaming',
                desc: 'Normalized from verified repository commits and added to candidate talent graph.',
                time: '2h ago',
                link: '/me/profile',
              },
              {
                id: 'act-3',
                badge: 'AI Match',
                title: 'Collaborator Synergy Matched',
                desc: 'Autonomous match score 94% computed for backend role on Universal Monorepo Shell.',
                time: '4h ago',
                link: '/ai/match',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#171724] border border-[#272638] hover:border-[#8861dc]/50 transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#10b981]/15 text-[#34d399] border border-[#10b981]/30">
                      {item.badge}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] leading-relaxed line-clamp-1">{item.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-[#6b7280]">{item.time}</div>
                  <Link to={item.link} className="text-xs text-[#b29af5] hover:text-white font-bold block mt-1">
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (Span 5): INBOUND SIGNALS & NOTIFICATION RADAR */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141e] to-[#0e0e15] border border-[#2b2a3c] p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#252435] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Inbound Signals &amp; Alerts
              </h3>
            </div>
            <Link to="/notifications" className="text-xs text-[#b29af5] hover:underline font-bold">
              Inbox ({notifications.length || 2}) &rarr;
            </Link>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#291e10] to-[#17130c] border border-[#d97706]/35 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#fbbf24] uppercase tracking-wider">Outreach</span>
                <span className="text-[10px] text-[#6b7280]">2h ago</span>
              </div>
              <h4 className="text-xs font-bold text-white">Northstar Labs Interview Inquiry</h4>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Fast-track invitation for Senior Distributed Systems Lead role based on verified PRs.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <Link to="/opportunities" className="text-xs text-[#fbbf24] hover:underline font-bold">
                  Review Invitation &rarr;
                </Link>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#171724] border border-[#272638] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#c4b5fd] uppercase tracking-wider">Challenge</span>
                <span className="text-[10px] text-[#6b7280]">1d ago</span>
              </div>
              <h4 className="text-xs font-bold text-white">New Sponsored Challenge</h4>
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Real-Time Financial Fraud Detection Pipeline is open for verified submissions.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <Link to="/challenges" className="text-xs text-[#b29af5] hover:underline font-bold">
                  Inspect Challenge &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
