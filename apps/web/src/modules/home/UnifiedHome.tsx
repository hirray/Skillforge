import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useActiveContext } from '../../context/ContextModel';
import { navigationConfig, ShortcutCard } from '../../config/navigation';
import { api, token } from '../ai/client';
import { Icon } from '../ai/shared';

interface UnifiedHomeProps {
  onCompleteChecklist?: (itemId: string) => void;
}

export const UnifiedHome: React.FC<UnifiedHomeProps> = () => {
  const { activeContext } = useActiveContext();
  const currentToken = token();
  const config = navigationConfig[activeContext] || navigationConfig.individual;

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [availability, setAvailability] = useState<'immediate' | 'two_weeks' | 'one_month' | 'unavailable'>('immediate');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [meRes, notifRes, projRes] = await Promise.allSettled([
          api('/users/me'),
          api('/notifications?limit=5'),
          api('/projects'),
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

  // Context-specific Stats (Zone B)
  const getContextStats = () => {
    switch (activeContext) {
      case 'recruiter':
        return [
          { label: 'Open Jobs', value: 4, trend: '2 Active', route: '/jobs', dataTour: 'home-stat-1' },
          { label: 'Candidates in Pipeline', value: 12, trend: '+3 New', route: '/pipeline', dataTour: 'home-stat-2' },
          { label: 'New AI Matches', value: 8, trend: '85%+ Synergy', route: '/ai/job-match', dataTour: 'home-stat-3' },
          { label: 'Awaiting Contact', value: 2, trend: 'Requires outreach', route: '/pipeline?stage=new', dataTour: 'home-stat-4' },
        ];
      case 'company_admin':
        return [
          { label: 'Active Jobs', value: 4, trend: 'Across 2 teams', route: '/jobs', dataTour: 'home-stat-1' },
          { label: 'Challenge Submissions', value: 7, trend: '3 to review', route: '/challenges?tab=submissions', dataTour: 'home-stat-2' },
          { label: 'Team Seats Used', value: '4 / 10', trend: 'Standard tier', route: '/companies?tab=seats', dataTour: 'home-stat-3' },
          { label: 'Verification Status', value: 'Verified', trend: 'Enterprise seal', route: '/companies', dataTour: 'home-stat-4' },
        ];
      case 'mentor':
        return [
          { label: 'Pending Requests', value: 3, trend: '2 new today', route: '/mentors?tab=requests', dataTour: 'home-stat-1' },
          { label: 'Projects Mentored', value: 5, trend: 'Active teams', route: '/mentors?tab=projects', dataTour: 'home-stat-2' },
          { label: 'Feedback Due', value: 2, trend: 'Sprint milestone', route: '/mentors?tab=feedback', dataTour: 'home-stat-3' },
          { label: 'Weekly Capacity', value: '6 hrs', trend: 'Office hours open', route: '/mentors?tab=availability', dataTour: 'home-stat-4' },
        ];
      case 'platform_admin':
        return [
          { label: 'Moderation Queue', value: 3, trend: 'Oldest: 4h', route: '/admin?tab=reports', dataTour: 'home-stat-1' },
          { label: 'Verification Queue', value: 2, trend: 'Pending review', route: '/admin?tab=verification', dataTour: 'home-stat-2' },
          { label: 'Certificates to Review', value: 5, trend: 'Issued today', route: '/certificates', dataTour: 'home-stat-3' },
          { label: 'Oldest Item Age', value: '4.2 hrs', trend: 'Within SLA', route: '/admin?tab=audit', dataTour: 'home-stat-4' },
        ];
      case 'individual':
      default:
        return [
          { label: 'Active Projects', value: 3, trend: '1 at risk', route: '/projects', dataTour: 'home-stat-1' },
          { label: 'Open Tasks', value: 8, trend: '2 overdue', route: '/tasks', dataTour: 'home-stat-2' },
          { label: 'Pending Invitations', value: 2, trend: 'Requires response', route: '/notifications', dataTour: 'home-stat-3' },
          { label: 'Verified Certificates', value: 4, trend: '100% Attested', route: '/me/portfolio', dataTour: 'home-stat-4' },
        ];
    }
  };

  // Next Best Action Engine (Zone C)
  const getNextBestActions = () => {
    switch (activeContext) {
      case 'recruiter':
        return [
          { id: 'nba-1', text: '3 high-synergy candidates matched for Senior Distributed Systems Lead.', action: 'Review Candidates', route: '/ai/job-match' },
          { id: 'nba-2', text: 'Candidate Jordan Lee responded to your interview invitation.', action: 'Open Pipeline', route: '/pipeline' },
        ];
      case 'company_admin':
        return [
          { id: 'nba-1', text: 'Complete your company verification profile to unlock the trusted employer badge.', action: 'Verify Now', route: '/companies' },
          { id: 'nba-2', text: 'You have 6 unused recruiter seats on your enterprise plan.', action: 'Invite Teammates', route: '/companies?tab=seats' },
        ];
      case 'mentor':
        return [
          { id: 'nba-1', text: 'Distributed Consensus Hub requested architectural feedback on Milestone 4.', action: 'Leave Feedback', route: '/mentors?tab=feedback' },
          { id: 'nba-2', text: 'Update your office hours availability for next week.', action: 'Set Hours', route: '/mentors?tab=availability' },
        ];
      case 'platform_admin':
        return [
          { id: 'nba-1', text: '2 reported projects awaiting moderation hold decision.', action: 'Review Queue', route: '/admin?tab=reports' },
          { id: 'nba-2', text: '3 newly suggested skills pending taxonomy alias mapping.', action: 'Curate Taxonomy', route: '/admin/skills' },
        ];
      case 'individual':
      default:
        return [
          { id: 'nba-1', text: 'Your profile is 85% complete. Add 2 more verified skills to rank higher in recruiter searches.', action: 'Add Skills', route: '/me/profile' },
          { id: 'nba-2', text: 'Northstar Labs sent you an interview invitation for Senior Systems Lead.', action: 'Respond Now', route: '/opportunities' },
        ];
    }
  };

  const completeness = profile?.completeness?.percentage || 85;
  const userName = profile?.displayName || profile?.name || 'Engineer';

  return (
    <div className="space-y-4 max-w-[1320px] mx-auto pb-12 font-sans" data-tour="home-container">
      {/* =========================================================================
          DESKTOP 2-COLUMN GRID:
          Left Column (Span 8): Zone A (Profile), Zone B (Stats), Zone C (Next Actions), Zone D (Shortcuts)
          Right Column (Span 4): Zone E (Notifications Panel & Getting Started Checklist)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ==================== LEFT MAIN COLUMN (Span 8) ==================== */}
        <div className="lg:col-span-8 space-y-4">
          {/* ---------------- ZONE A: PROFILE CARD ---------------- */}
          <section
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14141c] via-[#101015] to-[#14141c] border border-[#262535] p-5 shadow-md before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#b29af5]/30 before:to-transparent"
            data-tour="home-profile-card"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {/* Avatar with Ring */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8861dc] to-[#533499] text-white flex items-center justify-center font-bold text-base shadow-[0_0_20px_rgba(136,97,220,0.4)] border border-[#b29af5]/40">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-[#111116] shadow-[0_0_8px_#10b981]" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base md:text-lg font-bold text-white tracking-tight truncate">
                      {userName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8861dc]/15 text-[#c084fc] border border-[#8861dc]/30">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-[#34d399] bg-[#10b981]/10 px-2 py-0.5 rounded-full font-semibold border border-[#10b981]/20">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-0.5 truncate">
                    {profile?.headline || 'Fullstack & Distributed Systems Engineer • Verified proof active'}
                  </p>
                </div>
              </div>

              {/* Right Side: Profile Completeness Ring & Quick Action */}
              <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                {activeContext !== 'platform_admin' && (
                  <div className="flex items-center gap-2.5 bg-[#171722] border border-[#282738] px-3 py-1.5 rounded-xl">
                    <div className="text-right">
                      <div className="text-[10px] text-[#6b7280]">Profile Strength</div>
                      <div className="text-xs font-bold text-[#c084fc]">{completeness}% Complete</div>
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-[#8861dc] border-t-transparent flex items-center justify-center text-[10px] text-white font-bold animate-spin-slow">
                      ✓
                    </div>
                  </div>
                )}

                <Link
                  to="/me/profile"
                  className="px-3 py-1.5 rounded-xl bg-[#1c1c28] hover:bg-[#252536] border border-[#302f42] text-xs font-medium text-white transition-all shadow-sm"
                >
                  Edit profile &rarr;
                </Link>
              </div>
            </div>
          </section>

          {/* ---------------- ZONE B: MINI DASHBOARD (3-4 Stat Tiles) ---------------- */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tour="home-stats">
            {getContextStats().map((st) => (
              <Link
                key={st.label}
                to={st.route}
                data-tour={st.dataTour}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#15151c] to-[#0f0f13] border border-[#272635] hover:border-[#8861dc]/50 p-3.5 transition-all shadow-sm flex flex-col justify-between min-h-[96px] hover:-translate-y-0.5"
              >
                <div className="text-xs font-medium text-[#9ca3af] truncate">
                  {st.label}
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold tracking-tight text-white group-hover:text-[#c4b5fd] transition-colors">
                    {st.value}
                  </span>
                  <span className="text-[10px] font-semibold text-[#8861dc] bg-[#8861dc]/10 px-2 py-0.5 rounded-md border border-[#8861dc]/25 truncate max-w-[90px]">
                    {st.trend}
                  </span>
                </div>
              </Link>
            ))}
          </section>

          {/* ---------------- ZONE C: NEXT BEST ACTION STRIP ---------------- */}
          <section className="space-y-2" data-tour="home-next-actions">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc]" />
                Recommended Next Actions
              </span>
            </div>

            <div className="space-y-2">
              {getNextBestActions().map((nba) => (
                <div
                  key={nba.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#14141c] border border-[#262535] hover:border-[#8861dc]/40 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-[#8861dc] shrink-0" />
                    <p className="text-xs text-[#d1d5db] truncate font-medium">
                      {nba.text}
                    </p>
                  </div>
                  <Link
                    to={nba.route}
                    className="px-3 py-1 rounded-lg bg-[#8861dc]/15 hover:bg-[#8861dc]/25 text-[#c084fc] hover:text-white border border-[#8861dc]/30 text-xs font-bold transition-all shrink-0"
                  >
                    {nba.action} &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------- ZONE D: SHORTCUT CARDS ("What do you want to do?") ---------------- */}
          <section className="space-y-2.5 pt-1" data-tour="home-shortcuts">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                What do you want to do?
              </h3>
              <span className="text-[11px] text-[#6b7280]">Quick shortcuts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {config.shortcuts.map((sc) => (
                <Link
                  key={sc.id}
                  to={sc.route}
                  data-tour={sc.dataTour}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#15151e] via-[#111116] to-[#0e0e12] border border-[#272635] hover:border-[#8861dc]/60 p-3.5 transition-all duration-200 flex flex-col justify-between min-h-[118px] shadow-sm hover:-translate-y-0.5"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-lg bg-[#191924] border border-[#2b2a3c] text-[#c084fc] flex items-center justify-center group-hover:border-[#c084fc]/40 transition-colors">
                        <Icon name={sc.icon} size={16} />
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#c4b5fd] transition-colors leading-tight">
                      {sc.title}
                    </h4>
                    <p className="text-[11px] text-[#9ca3af] mt-1 leading-relaxed line-clamp-2">
                      {sc.description}
                    </p>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-[#252433] flex items-center justify-between text-[11px] font-semibold text-[#6b7280] group-hover:text-white transition-colors">
                    <span>Start</span>
                    <span>&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* ==================== RIGHT COLUMN (Span 4) ==================== */}
        <div className="lg:col-span-4 space-y-4">
          {/* ---------------- ZONE E: NOTIFICATIONS & INLINE ACTIONS ---------------- */}
          <section
            className="relative overflow-hidden rounded-2xl bg-[#111116] border border-[#262533] p-4 shadow-md space-y-3 flex flex-col justify-between"
            data-tour="home-notifications"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#252433] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Updates &amp; Signals
                  </h3>
                </div>
                <Link to="/notifications" className="text-xs text-[#b29af5] hover:underline font-bold">
                  View all &rarr;
                </Link>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6b7280]">
                  <p>You are all caught up!</p>
                  <p className="text-[11px] text-[#4b5563] mt-1">No pending invitations or actionable alerts.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n, idx) => (
                    <div
                      key={n.id || idx}
                      className="p-3 rounded-xl bg-[#171722] border border-[#272635] hover:border-[#8861dc]/40 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#fde68a] uppercase tracking-wider">
                          {n.category || 'Signal'}
                        </span>
                        <span className="text-[10px] text-[#6b7280]">{n.createdAt ? 'Recently' : '2h ago'}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{n.title}</h4>
                      <p className="text-[11px] text-[#9ca3af] line-clamp-2 leading-relaxed">{n.message}</p>

                      {/* Inline Actions for invitations & requests */}
                      {(n.category === 'invitation' || n.category === 'outreach') && (
                        <div className="pt-2 flex items-center gap-2">
                          <Link
                            to="/opportunities"
                            className="flex-1 py-1 rounded-lg bg-[#8861dc] hover:bg-[#7851cb] text-white text-center text-[10px] font-bold transition-all shadow-sm"
                          >
                            Accept
                          </Link>
                          <Link
                            to="/opportunities"
                            className="px-2.5 py-1 rounded-lg bg-[#22212d] hover:bg-[#2b2a3a] text-[#9ca3af] hover:text-white text-[10px] font-medium transition-colors"
                          >
                            Decline
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2.5 border-t border-[#252433] text-center">
              <Link
                to="/notifications"
                className="text-xs text-[#b29af5] hover:text-white font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <span>Notification Center</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </section>

          {/* ---------------- GETTING STARTED CHECKLIST (Right Side Below Notifs) ---------------- */}
          <section
            className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#14141c] to-[#0e0e13] border border-[#282738] p-4 shadow-md space-y-3"
            data-tour="panel-checklist"
          >
            <div className="flex items-center justify-between border-b border-[#252433] pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                Getting-Started Guide
              </span>
              <span className="text-[10px] font-bold text-[#34d399] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/25">
                4 / 5 Complete
              </span>
            </div>

            <div className="space-y-2">
              {[
                { id: 'c-1', label: 'Verify your account email', done: true },
                { id: 'c-2', label: 'Complete profile headline & bio', done: true },
                { id: 'c-3', label: 'Attest at least 3 taxonomy skills', done: true },
                { id: 'c-4', label: 'Join or start a team project', done: true },
                { id: 'c-5', label: 'Publish public verified portfolio', done: false, link: '/me/portfolio' },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#171722] border border-[#272635] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${item.done ? 'bg-[#10b981] text-black' : 'border border-[#4b5563] text-transparent'}`}>
                      {item.done && '✓'}
                    </span>
                    <span className={item.done ? 'text-[#9ca3af] line-through' : 'text-white font-medium'}>
                      {item.label}
                    </span>
                  </div>
                  {!item.done && item.link && (
                    <Link to={item.link} className="text-[11px] text-[#c084fc] hover:underline font-bold">
                      Start &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

