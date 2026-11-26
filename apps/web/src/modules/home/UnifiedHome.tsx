import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActiveContext, getActivePersona } from '../../context/ContextModel';
import { navigationConfig } from '../../config/navigation';
import { api, token } from '../ai/client';
import { Icon } from '../ai/shared';
import { canonicalProjectsList, ProjectItemData } from '../projects/canonicalProjects';

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
  const [projects, setProjects] = useState<ProjectItemData[]>(canonicalProjectsList);
  const [availability, setAvailability] = useState<'immediate' | 'two_weeks' | 'one_month' | 'unavailable'>('immediate');
  const [copiedHash, setCopiedHash] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [meRes, notifRes, projRes] = await Promise.allSettled([
          api('/users/me'),
          api('/notifications?limit=6'),
          fetch('/api/v1/projects').then(async (r) => {
            if (!r.ok) return null;
            const text = await r.text();
            try {
              return JSON.parse(text);
            } catch {
              return null;
            }
          }),
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

          if (projRes.status === 'fulfilled' && projRes.value) {
            const apiProjects: any[] = projRes.value?.data || [];
            if (apiProjects.length > 0) {
              const merged = [...canonicalProjectsList];
              apiProjects.forEach((apiProj) => {
                const existingIdx = merged.findIndex(
                  (p) => p.id === apiProj.id || p.title.toLowerCase() === apiProj.title.toLowerCase()
                );
                const mapped: ProjectItemData = {
                  id: apiProj.id,
                  ownerId: apiProj.ownerId || 'user-001',
                  title: apiProj.title,
                  description: apiProj.description || 'Collaborative engineering project registered on SkillForge.',
                  visibility: apiProj.visibility || 'Public',
                  category: apiProj.category || 'Systems & Backend',
                  status: apiProj.status || 'Active',
                  stage: apiProj.stage || 'Production MVP',
                  progress: apiProj.progress || 85,
                  membersCount: apiProj.members?.length || 3,
                  commitsCount: 14,
                  isOwner: true,
                  members: apiProj.members,
                  roles: apiProj.roles,
                  requirements: apiProj.requirements,
                };
                if (existingIdx >= 0) {
                  merged[existingIdx] = { ...merged[existingIdx], ...mapped };
                } else {
                  merged.unshift(mapped);
                }
              });
              setProjects(merged);
            }
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

  // Determine user identity
  const currentPersona = getActivePersona(currentToken);
  const userName = profile?.displayName || profile?.name || currentPersona.name;
  const completeness = profile?.completeness?.percentage ?? profile?.completeness?.score ?? 100;

  // Active Project Focus (Dynamically taken from real database projects)
  const activeProjects = projects.filter((p) => p.status === 'Active');
  const focusProject = activeProjects[0] || projects[0] || canonicalProjectsList[0];
  const totalProjectsCount = projects.length;

  // Real or rich skills for Attested Skill Graph
  const skillList = profile?.skills && profile.skills.length > 0
    ? profile.skills.map((s) => ({ name: s.name, level: s.level || 'ADV' }))
    : [
        { name: 'React', level: 'ADV' },
        { name: 'TypeScript', level: 'ADV' },
        { name: 'Node.js', level: 'ADV' },
        { name: 'PostgreSQL', level: 'INT' },
        { name: 'Prisma ORM', level: 'ADV' },
        { name: 'Kafka', level: 'PRO' },
        { name: 'Docker', level: 'INT' },
        { name: 'System Design', level: 'ADV' },
      ];

  // Context-specific KPI Horizon Cards (Cider Press full-surface colors)
  const getContextKPIs = () => {
    switch (activeContext) {
      case 'recruiter':
        return [
          {
            label: 'Open Positions',
            value: 4,
            trend: '2 Active Sprints',
            subline: 'Across 2 engineering teams',
            cardBg: 'bg-[#F0E2D0]',
            borderColor: 'border-[#E5D6C8]',
            icon: 'briefcase',
            route: '/jobs',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Talent Pipeline',
            value: 12,
            trend: '+3 New Candidates',
            subline: '4 in Technical Review',
            cardBg: 'bg-[#E9C5B5]',
            borderColor: 'border-[#DFB6A4]',
            icon: 'users',
            route: '/pipeline',
            dataTour: 'home-stat-2',
          },
          {
            label: 'AI Synergy Matches',
            value: 8,
            trend: '85%+ Match Score',
            subline: 'Autonomous talent ranker',
            cardBg: 'bg-[#F2D79E]',
            borderColor: 'border-[#E2C384]',
            icon: 'sparkles',
            route: '/ai/job-match',
            dataTour: 'home-stat-3',
          },
          {
            label: 'Awaiting Outreach',
            value: notifications.length || 2,
            trend: 'Action Required',
            subline: 'Candidate responded to ping',
            cardBg: 'bg-[#D9C5B7]',
            borderColor: 'border-[#CBB5A5]',
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
            cardBg: 'bg-[#F0E2D0]',
            borderColor: 'border-[#E5D6C8]',
            icon: 'briefcase',
            route: '/jobs',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Challenge Submissions',
            value: 7,
            trend: '3 Need Review',
            subline: 'Sponsored hackathon entries',
            cardBg: 'bg-[#E9C5B5]',
            borderColor: 'border-[#DFB6A4]',
            icon: 'trophy',
            route: '/challenges?tab=submissions',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Recruiter Seats',
            value: '4 / 10',
            trend: '6 Available',
            subline: 'Enterprise workspace plan',
            cardBg: 'bg-[#F2D79E]',
            borderColor: 'border-[#E2C384]',
            icon: 'users',
            route: '/companies?tab=seats',
            dataTour: 'home-stat-3',
          },
          {
            label: 'Company Verification',
            value: 'Verified',
            trend: 'Enterprise Seal',
            subline: 'Cryptographic company identity',
            cardBg: 'bg-[#D9C5B7]',
            borderColor: 'border-[#CBB5A5]',
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
            cardBg: 'bg-[#F0E2D0]',
            borderColor: 'border-[#E5D6C8]',
            icon: 'users',
            route: '/mentors?tab=requests',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Mentored Projects',
            value: 5,
            trend: 'Active Guidance',
            subline: 'Distributed Systems & ML',
            cardBg: 'bg-[#E9C5B5]',
            borderColor: 'border-[#DFB6A4]',
            icon: 'folder',
            route: '/mentors?tab=projects',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Feedback Deliverables',
            value: 2,
            trend: 'Due Milestone 4',
            subline: 'Architectural sign-off needed',
            cardBg: 'bg-[#F2D79E]',
            borderColor: 'border-[#E2C384]',
            icon: 'check',
            route: '/mentors?tab=feedback',
            dataTour: 'home-stat-3',
          },
          {
            label: 'Weekly Office Hours',
            value: '6 hrs',
            trend: 'Open Capacity',
            subline: 'Calendar sync active',
            cardBg: 'bg-[#D9C5B7]',
            borderColor: 'border-[#CBB5A5]',
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
            cardBg: 'bg-[#F0E2D0]',
            borderColor: 'border-[#E5D6C8]',
            icon: 'shield',
            route: '/admin?tab=reports',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Identity Verifications',
            value: 2,
            trend: 'Pending Review',
            subline: 'Employer and mentor seals',
            cardBg: 'bg-[#E9C5B5]',
            borderColor: 'border-[#DFB6A4]',
            icon: 'users',
            route: '/admin?tab=verification',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Certificates Emitted',
            value: 124,
            trend: '+12 This Week',
            subline: 'Signed with Ed25519 root key',
            cardBg: 'bg-[#F2D79E]',
            borderColor: 'border-[#E2C384]',
            icon: 'file-text',
            route: '/certificates',
            dataTour: 'home-stat-3',
          },
          {
            label: 'System Audit Integrity',
            value: '100%',
            trend: 'Zero Drift',
            subline: 'Immutable ledger synced',
            cardBg: 'bg-[#D9C5B7]',
            borderColor: 'border-[#CBB5A5]',
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
            value: activeProjects.length || 7,
            trend: '1 Production Sprint',
            subline: focusProject.title,
            cardBg: 'bg-[#F0E2D0]',
            borderColor: 'border-[#E5D6C8]',
            icon: 'folder',
            route: '/projects',
            dataTour: 'home-stat-1',
          },
          {
            label: 'Attested Skills',
            value: skillList.length || 8,
            trend: '100% Attested',
            subline: 'Cryptographic commit proofs',
            cardBg: 'bg-[#E9C5B5]',
            borderColor: 'border-[#DFB6A4]',
            icon: 'check',
            route: '/me/profile',
            dataTour: 'home-stat-2',
          },
          {
            label: 'Inbound Signals',
            value: notifications.length || 2,
            trend: 'Fast-Track Outreach',
            subline: 'Northstar Labs & TechScale pings',
            cardBg: 'bg-[#F2D79E]',
            borderColor: 'border-[#E2C384]',
            icon: 'chat',
            route: '/notifications',
            dataTour: 'home-stat-3',
          },
          {
            label: 'AI Synergy Match',
            value: '94%',
            trend: 'Top 5% Candidate',
            subline: 'Senior Distributed Systems role',
            cardBg: 'bg-[#D9C5B7]',
            borderColor: 'border-[#CBB5A5]',
            icon: 'sparkles',
            route: '/ai/job-match',
            dataTour: 'home-stat-4',
          },
        ];
    }
  };

  // Next Best Actions for current role
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
            text: `${focusProject.title} requested architectural feedback on Raft leader failover.`,
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
            text: `Milestone 3 review ready for ${focusProject.title}. Review pull request with your team.`,
            action: 'Enter Project Room',
            route: `/projects/${focusProject.id}`,
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

  const handleCopyHash = () => {
    navigator.clipboard?.writeText('0x7fa28941bc4d9e03fa211b8');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-xs text-[#786458]">
        <div className="w-8 h-8 rounded-full border-2 border-[#B5462A] border-t-transparent animate-spin" />
        <span className="font-semibold tracking-wide text-[#281A12]">Loading SkillForge Cockpit...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1360px] mx-auto pb-12 font-sans animate-fadeIn text-[#281A12]">
      {/* =========================================================================
          ZONE A: THE EXECUTIVE COMMAND HEADER (FLIGHT DECK) - CIDER PRESS
      ========================================================================= */}
      <header
        className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-md border border-[#E5D6C8] p-5 lg:p-6 shadow-[0_3px_12px_rgba(40,26,18,0.05)] flex flex-wrap items-center justify-between gap-4"
        data-tour="home-profile-card"
      >
        {/* User Identity Block */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-[#B5462A] text-white flex items-center justify-center font-black text-lg shadow-sm border border-[#963A24]">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#36543A] border-2 border-white"
              title="Identity Attested"
            />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-[#281A12] tracking-tight truncate">
                Welcome back, {userName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F0E2D0] text-[#281A12] border border-[#E5D6C8] tracking-wide uppercase">
                {config.label}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E4EBDD] text-[#36543A] border border-[#C8DAC0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#36543A] animate-pulse" />
                Live Attestation Active
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#69554A] mt-1 truncate max-w-xl">
              {profile?.headline || 'Staff Distributed Systems Engineer • Verifiable commit evidence active'}
            </p>
          </div>
        </div>

        {/* Right Cockpit HUD: Attestation Ring & Quick Actions */}
        <div className="flex items-center gap-3 shrink-0 ml-auto flex-wrap">
          {/* Availability Switch Pill */}
          <button
            onClick={() => setAvailability(availability === 'immediate' ? 'unavailable' : 'immediate')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              availability === 'immediate'
                ? 'bg-[#E4EBDD] text-[#36543A] border-[#C8DAC0] hover:bg-[#D5E2CC]'
                : 'bg-[#F7EEE4] text-[#786458] border-[#E5D6C8] hover:text-[#281A12]'
            }`}
            title="Click to toggle availability status"
          >
            <span className={`w-2 h-2 rounded-full ${availability === 'immediate' ? 'bg-[#36543A]' : 'bg-[#786458]'}`} />
            <span>{availability === 'immediate' ? 'Available Immediate' : 'Busy / On Sprint'}</span>
          </button>

          {/* Attestation Score Pill */}
          <div className="flex items-center gap-2 bg-[#F7EEE4] border border-[#E5D6C8] px-3.5 py-1.5 rounded-xl">
            <div className="text-right">
              <div className="text-[10px] text-[#786458] font-bold uppercase tracking-wider">Proof Score</div>
              <div className="text-xs font-black text-[#36543A]">{completeness}% Complete</div>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#E4EBDD] border border-[#C8DAC0] flex items-center justify-center text-[10px] font-bold text-[#36543A]">
              ✓
            </div>
          </div>

          {/* Primary High-Impact CTA Button (Rust #B5462A) */}
          <Link
            to={activeContext === 'recruiter' ? '/jobs' : '/projects/create'}
            className="px-4 py-2.5 rounded-xl bg-[#B5462A] hover:bg-[#963A24] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 hover:shadow-md active:scale-[0.98]"
          >
            <Icon name="folder" size={14} />
            <span>{activeContext === 'recruiter' ? '+ Post New Job' : '+ Create Project'}</span>
          </Link>
        </div>
      </header>

      {/* =========================================================================
          ZONE B: METRICS HORIZON (4 FULL-SURFACE MUTED EARTHY TILES)
      ========================================================================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="home-stats">
        {getContextKPIs().map((kpi) => (
          <Link
            key={kpi.label}
            to={kpi.route}
            data-tour={kpi.dataTour}
            className={`group relative overflow-hidden rounded-2xl ${kpi.cardBg} border ${kpi.borderColor} p-5 transition-all duration-200 flex flex-col justify-between min-h-[140px] shadow-[0_3px_12px_rgba(40,26,18,0.05)] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(40,26,18,0.09)]`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between text-xs font-bold text-[#281A12]">
              <span className="truncate">{kpi.label}</span>
              <span className="w-7 h-7 rounded-lg bg-white/70 border border-[#E5D6C8] flex items-center justify-center shrink-0 text-[#281A12]">
                <Icon name={kpi.icon} size={15} />
              </span>
            </div>

            {/* Bold Stat Number & Trend Badge */}
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-extrabold tracking-tight text-[#281A12] tabular-nums">
                {kpi.value}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-white/80 border border-[#E5D6C8] text-[#281A12] truncate max-w-[130px]">
                {kpi.trend}
              </span>
            </div>

            {/* Subline Context */}
            <div className="text-xs text-[#69554A] font-medium mt-2 truncate">
              {kpi.subline}
            </div>
          </Link>
        ))}
      </section>

      {/* =========================================================================
          ZONE C & D: THE ASYMMETRIC INTELLIGENCE BENTO (65% / 35%)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT BENTO (Span 8 ~65%): CURRENT PROJECT FOCUS (WHITE MAIN PANEL) */}
        <div className="lg:col-span-8 rounded-2xl bg-white border border-[#E5D6C8] p-6 shadow-[0_3px_12px_rgba(40,26,18,0.05)] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Header with Project Status & Deep Links */}
            <div className="flex items-center justify-between border-b border-[#E5D6C8] pb-3.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B5462A]" />
                <span className="text-xs font-extrabold text-[#281A12] uppercase tracking-wider">
                  Current Project Focus
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E4EBDD] text-[#36543A] border border-[#C8DAC0]">
                  Active • In Progress
                </span>
                <span className="text-[11px] text-[#786458] hidden sm:inline font-medium">
                  {focusProject.category}
                </span>
              </div>
              <Link
                to="/projects"
                className="text-xs text-[#B5462A] hover:text-[#963A24] font-bold flex items-center gap-1 transition-colors"
              >
                <span>All Projects ({totalProjectsCount})</span>
                <span>&rarr;</span>
              </Link>
            </div>

            {/* Core Project Details */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-[#281A12] tracking-tight">
                  {focusProject.title}
                </h2>
                <p className="text-xs md:text-sm text-[#69554A] mt-1.5 max-w-xl leading-relaxed">
                  {focusProject.description}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-3xl font-black text-[#B5462A] tabular-nums">
                  {focusProject.progress || 75}%
                </div>
                <div className="text-[10px] text-[#786458] font-bold uppercase tracking-wider">Completed</div>
              </div>
            </div>

            {/* Clear Roadmap / Milestone Steps */}
            <div className="pt-1">
              <div className="flex items-center justify-between text-xs mb-2 font-medium text-[#69554A]">
                <span>Project Milestones (3 of 4 in progress)</span>
                <span className="text-xs text-[#B5462A] font-bold">Target: Dec 15</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mb-3 font-medium">
                <div className="text-[#36543A] flex items-center justify-center gap-1.5 bg-[#E4EBDD] py-2 px-2.5 rounded-xl border border-[#C8DAC0]">
                  <Icon name="check" size={13} />
                  <span className="truncate">1. Architecture</span>
                </div>
                <div className="text-[#36543A] flex items-center justify-center gap-1.5 bg-[#E4EBDD] py-2 px-2.5 rounded-xl border border-[#C8DAC0]">
                  <Icon name="check" size={13} />
                  <span className="truncate">2. Core APIs</span>
                </div>
                <div className="text-white flex items-center justify-center gap-1.5 bg-[#B5462A] py-2 px-2.5 rounded-xl font-bold shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="truncate">3. Testing &amp; Polish</span>
                </div>
                <div className="text-[#786458] flex items-center justify-center gap-1.5 bg-[#F7EEE4] py-2 px-2.5 rounded-xl border border-[#E5D6C8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#786458]" />
                  <span className="truncate">4. Verification</span>
                </div>
              </div>

              {/* Progress Track (Warm neutral track with Rust fill) */}
              <div className="w-full bg-[#E5D6C8] rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-[#B5462A] h-full rounded-full transition-all duration-500"
                  style={{ width: `${focusProject.progress || 75}%` }}
                />
              </div>
            </div>

            {/* 3 Subcards on #F7EEE4 (--surface-subtle) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#F7EEE4] border border-[#E5D6C8] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#786458] font-medium">Team Collaborators</div>
                  <div className="text-sm font-bold text-[#281A12] mt-0.5">
                    {focusProject.members?.length || focusProject.membersCount || 3} Collaborators
                  </div>
                </div>
                <span className="text-[#36543A] text-[10px] font-bold bg-[#E4EBDD] px-2 py-0.5 rounded border border-[#C8DAC0]">
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7EEE4] border border-[#E5D6C8] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#786458] font-medium">Tasks Progress</div>
                  <div className="text-sm font-bold text-[#281A12] mt-0.5">12 Done, 3 Open</div>
                </div>
                <span className="text-[#281A12] text-[10px] font-bold bg-[#F2D79E] px-2 py-0.5 rounded border border-[#E2C384]">
                  On Track
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7EEE4] border border-[#E5D6C8] flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-[#786458] font-medium">Codebase Commits</div>
                  <div className="text-sm font-bold text-[#281A12] mt-0.5">
                    {focusProject.commitsCount || 14} Commits
                  </div>
                </div>
                <span className="text-[#36543A] text-[10px] font-bold bg-[#E4EBDD] px-2 py-0.5 rounded border border-[#C8DAC0]">
                  Synced
                </span>
              </div>
            </div>
          </div>

          {/* ZONE C: NEXT BEST ACTIONS */}
          <div className="pt-3 border-t border-[#E5D6C8]">
            <div className="space-y-2.5">
              {getNextBestActions().map((nba) => (
                <div
                  key={nba.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#FBF3E8] border border-[#E5D6C8] hover:border-[#B5462A] transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider bg-[#F0E2D0] text-[#281A12] border border-[#E5D6C8] shrink-0">
                      {nba.tag}
                    </span>
                    <p className="text-xs text-[#281A12] font-medium truncate">
                      {nba.text}
                    </p>
                  </div>
                  <Link
                    to={nba.route}
                    className="px-3.5 py-1.5 rounded-xl bg-[#B5462A] hover:bg-[#963A24] text-white text-xs font-bold transition-all shrink-0 text-center"
                  >
                    {nba.action} &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT BENTO (Span 4 ~35%): DISTINCT SURFACES STACK */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* 1. ATTESTED SKILL GRAPH (Warm Sand #F0E2D0) */}
          <div className="rounded-2xl bg-[#F0E2D0] border border-[#E5D6C8] p-5 shadow-[0_3px_12px_rgba(40,26,18,0.05)] space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E5D6C8] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B5462A]" />
                <span className="text-xs font-extrabold text-[#281A12] uppercase tracking-wider">
                  Attested Skill Graph
                </span>
              </div>
              <Link to="/me/profile" className="text-xs text-[#B5462A] hover:underline font-bold">
                Taxonomy &rarr;
              </Link>
            </div>

            {/* Interactive Attested Skill Pills in White on Sand */}
            <div className="flex flex-wrap gap-2">
              {skillList.map((sk) => (
                <span
                  key={sk.name}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-[#E5D6C8] text-[#281A12] flex items-center gap-1.5 shadow-xs"
                >
                  <span className="text-[#B5462A] font-black text-xs">✓</span>
                  <span>{sk.name}</span>
                  <span className="text-[9px] font-bold text-[#786458] bg-[#F7EEE4] px-1.5 py-0.5 rounded">
                    {sk.level}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* 2. ATTESTATION SEAL (Mustard #F2D79E) */}
          <div className="rounded-2xl bg-[#F2D79E] border border-[#E2C384] p-5 shadow-[0_3px_12px_rgba(40,26,18,0.05)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#281A12] uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="shield" size={15} />
                <span>Attestation Seal</span>
              </span>
              <button
                onClick={handleCopyHash}
                className="text-[11px] text-[#281A12] font-mono bg-white/70 hover:bg-white px-2 py-0.5 rounded border border-[#E2C384] cursor-pointer font-bold flex items-center gap-1 transition-all"
                title="Click to copy commit hash"
              >
                <span>{copiedHash ? 'Copied!' : '0x7fa2...11b8'}</span>
                <Icon name="copy" size={11} />
              </button>
            </div>
            <p className="text-xs text-[#281A12] leading-relaxed">
              All skills attested against verified Git commit signatures and milestone sign-offs.
            </p>
          </div>

          {/* 3. RECRUITER OUTREACH SPOTLIGHT (Terracotta #E9C5B5) */}
          <div className="rounded-2xl bg-[#E9C5B5] border border-[#DFB6A4] p-5 shadow-[0_3px_12px_rgba(40,26,18,0.05)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#281A12] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B5462A] animate-ping" />
                Recruiter Outreach
              </span>
              <span className="text-[11px] font-medium text-[#69554A]">2h ago</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#281A12]">
                Northstar Labs — Senior Systems Lead
              </h4>
              <p className="text-xs text-[#69554A] mt-1 leading-relaxed">
                Fast-track interview inquiry based on verified raft consensus PRs.
              </p>
            </div>
            <div className="pt-1">
              <Link
                to="/opportunities"
                className="w-full block py-2 rounded-xl bg-[#B5462A] hover:bg-[#963A24] text-white text-center text-xs font-bold transition-all shadow-xs"
              >
                Review Terms &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ZONE D: WORKSPACE CAPABILITIES LAUNCHPAD - CIDER PRESS
      ========================================================================= */}
      <section className="space-y-4 pt-2" data-tour="home-shortcuts">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B5462A]" />
            <h3 className="text-xs font-black text-[#281A12] uppercase tracking-wider">
              Workspace Capabilities &amp; Launchpad
            </h3>
          </div>
          <Link
            to="/demos"
            className="text-xs text-[#B5462A] hover:text-[#963A24] font-bold flex items-center gap-1.5 transition-colors bg-[#F0E2D0] hover:bg-[#E9C5B5] px-3 py-1.5 rounded-full border border-[#E5D6C8] shadow-xs"
          >
            <Icon name="gamepad" size={13} />
            <span>Live Feature Demos</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: 'launch-blueprint',
              title: 'Project Blueprint AI',
              description: 'Deconstruct ideas into required skill sets, role profiles, and delivery phases.',
              badge: 'Architecture AI',
              badgeBg: 'bg-[#F0E2D0]',
              icon: 'sparkles',
              route: '/ai/requirements',
            },
            {
              id: 'launch-collab',
              title: 'Collaborator Matching',
              description: 'Autonomous skill-gap ranker pairing developers with complementary strengths.',
              badge: 'Smart Teams',
              badgeBg: 'bg-[#E9C5B5]',
              icon: 'users',
              route: '/ai/match',
            },
            {
              id: 'launch-resume',
              title: 'Resume Intelligence',
              description: 'Transform raw PDF resumes into verified taxonomy evidence with AI normalisation.',
              badge: 'AI Parser',
              badgeBg: 'bg-[#F2D79E]',
              icon: 'file-text',
              route: '/resumes',
            },
            {
              id: 'launch-inbound',
              title: 'Inbound Opportunities',
              description: 'Review company outreaches, interview fast-tracks, and verified hiring pipelines.',
              badge: 'Recruiter Radar',
              badgeBg: 'bg-[#D9C5B7]',
              icon: 'chat',
              route: '/opportunities',
            },
            {
              id: 'launch-telemetry',
              title: 'Project Health Telemetry',
              description: 'Real-time telemetry tracking milestone velocity, overdue tasks, and rescue alerts.',
              badge: 'Telemetry AI',
              badgeBg: 'bg-[#F0E2D0]',
              icon: 'activity',
              route: '/ai/health',
            },
            {
              id: 'launch-hackathons',
              title: 'Hackathons & Bounties',
              description: 'Compete in high-stakes architectural sprints and earn cryptographically verified credentials.',
              badge: 'Active Bounties',
              badgeBg: 'bg-[#E9C5B5]',
              icon: 'trophy',
              route: '/challenges',
            },
          ].map((card) => (
            <Link
              key={card.id}
              to={card.route}
              className="group relative overflow-hidden rounded-2xl bg-white border border-[#E5D6C8] hover:border-[#B5462A] p-5 transition-all duration-200 flex flex-col justify-between min-h-[145px] shadow-[0_3px_12px_rgba(40,26,18,0.05)] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(40,26,18,0.09)]"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="w-8 h-8 rounded-xl bg-[#F7EEE4] border border-[#E5D6C8] flex items-center justify-center text-[#281A12]">
                    <Icon name={card.icon} size={16} />
                  </span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#E5D6C8] ${card.badgeBg} text-[#281A12]`}>
                    {card.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#281A12] group-hover:text-[#B5462A] transition-colors leading-tight">
                  {card.title}
                </h4>
                <p className="text-xs text-[#69554A] mt-1.5 leading-relaxed line-clamp-2">
                  {card.description}
                </p>
              </div>
              <div className="mt-3.5 pt-2.5 border-t border-[#E5D6C8] flex items-center justify-between text-xs font-bold text-[#786458] group-hover:text-[#B5462A] transition-colors">
                <span>Launch Workspace</span>
                <span>&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          ZONE E: VERIFIED LEDGER & INBOUND SIGNALS (BOTTOM DUAL STREAM)
      ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2" data-tour="home-notifications">
        {/* LEFT COLUMN (Span 7): RECENT ACTIONS & VERIFIED DELIVERY */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-[#E5D6C8] p-5 shadow-[0_3px_12px_rgba(40,26,18,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5D6C8] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#36543A]" />
              <h3 className="text-xs font-black text-[#281A12] uppercase tracking-wider">
                Recent Actions &amp; Verified Delivery
              </h3>
            </div>
            <span className="text-[11px] text-[#786458] font-mono">Audited cryptographic trail</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'act-1',
                badge: 'Verified Proof',
                title: `Attestation Verified: ${focusProject.title}`,
                desc: 'Milestone 4 code review approved with cryptographic commit proof (SHA-256 hash 0x7fa2...11b8).',
                time: '18m ago',
                link: `/projects/${focusProject.id}`,
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
                className="p-3.5 rounded-xl bg-[#F7EEE4] border border-[#E5D6C8] hover:border-[#B5462A] transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#E4EBDD] text-[#36543A] border border-[#C8DAC0]">
                      {item.badge}
                    </span>
                    <h4 className="text-xs font-bold text-[#281A12] truncate">{item.title}</h4>
                  </div>
                  <p className="text-xs text-[#69554A] leading-relaxed line-clamp-1">{item.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[#786458]">{item.time}</div>
                  <Link to={item.link} className="text-xs text-[#B5462A] hover:underline font-bold block mt-1">
                    View &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN (Span 5): INBOUND SIGNALS & NOTIFICATION RADAR */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-[#E5D6C8] p-5 shadow-[0_3px_12px_rgba(40,26,18,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5D6C8] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E3A33B] animate-pulse" />
              <h3 className="text-xs font-black text-[#281A12] uppercase tracking-wider">
                Inbound Signals &amp; Alerts
              </h3>
            </div>
            <Link to="/notifications" className="text-xs text-[#B5462A] hover:underline font-bold">
              Inbox ({notifications.length || 2}) &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#F2D79E] border border-[#E2C384] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#281A12] uppercase tracking-wider">Outreach</span>
                <span className="text-[11px] text-[#67430D]">2h ago</span>
              </div>
              <h4 className="text-xs font-bold text-[#281A12]">Northstar Labs Interview Inquiry</h4>
              <p className="text-xs text-[#67430D] leading-relaxed">
                Fast-track invitation for Senior Distributed Systems Lead role based on verified PRs.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <Link to="/opportunities" className="text-xs text-[#281A12] font-black hover:underline">
                  Review Invitation &rarr;
                </Link>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7EEE4] border border-[#E5D6C8] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#281A12] uppercase tracking-wider">Challenge</span>
                <span className="text-[11px] text-[#786458]">1d ago</span>
              </div>
              <h4 className="text-xs font-bold text-[#281A12]">New Sponsored Challenge</h4>
              <p className="text-xs text-[#69554A] leading-relaxed">
                Real-Time Financial Fraud Detection Pipeline is open for verified submissions.
              </p>
              <div className="pt-1 flex items-center justify-end">
                <Link to="/challenges" className="text-xs text-[#B5462A] hover:underline font-bold">
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
