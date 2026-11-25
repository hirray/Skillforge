import { useEffect, useState } from 'react';
import { NavLink, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { api, token, WorkspaceContext } from './client';
import {
  Brand,
  Icon,
  Loading,
} from './shared';
import { useActiveContext, ContextSwitcher } from '../../context/ContextModel';
import { useTour } from '../../components/tour/TourProvider';
import { navigationConfig } from '../../config/navigation';
import { UnifiedHome } from '../home/UnifiedHome';
import { DiscoverPage } from '../discover/DiscoverPage';
import { HelpCenterPage } from '../help/HelpCenterPage';
import { AccessDenied } from '../../components/AccessDenied';

import Requirements from './Requirements';
import Matching from './Matching';
import Health from './Health';
import JobMatching from './JobMatching';
import Analytics from './Analytics';
import ResumeStudio from '../resumes/ResumeStudio';
import ProjectsModule from '../projects';
import TasksModule from '../tasks';
import MyInvitations from '../team/MyInvitations';
import ChatModule from '../chat';
import MentorsModule from '../mentors';
import HackathonsModule from '../hackathons';
import { GitHubIntegrationPage } from '../github';
import { CompanyWorkspacePage } from '../companies';
import { JobsBoardPage } from '../jobs';
import { ContributionsHubPage } from '../contribution';
import { TalentSearchPage, CandidateProofView } from '../talent';
import { MyCertificatesPage, PublicVerifyPage } from '../certificates';
import { VerifiedExperiencePage, PortfolioEditorPage, PublicPortfolioPage } from '../portfolio';
import { PipelineBoardPage, OpportunitiesInboxPage } from '../pipeline';
import { ChallengeBoardPage, ChallengeDetailPage } from '../challenges';
import { SignInPage, RegisterPage, AccountSettingsPage } from '../auth/AuthPages';
import { ProfileEditorPage } from '../users/ProfileEditorPage';
import { PublicProfilePage } from '../users/PublicProfilePage';
import { AdminSkillsPage } from '../skills/AdminSkillsPage';
import { NotificationBell, NotificationsInboxPage } from '../notifications/NotificationBell';
import { GlobalSearchPage, OpportunityFeedPage } from '../search/GlobalSearchPage';
import { AdminConsolePage } from '../admin/AdminConsolePage';
import { PrivacyCentrePage } from '../settings/PrivacyCentrePage';
import { FeatureDemoModal } from '../../components/demos/FeatureDemoModal';
import { FeatureDemosPage } from '../demos/FeatureDemosPage';
import './studio.css';

const fallbackContext: WorkspaceContext = {
  user: { id: token(), name: 'SkillForge User', roles: ['owner'] },
  projects: [],
  jobs: [],
  preference: {
    matchingOptIn: true,
    recruiterVisible: true,
    publicSkills: true,
  },
  extensionsEnabled: true,
  ranker: 'standard',
};

export default function Member2Workspace() {
  const { activeContext } = useActiveContext();
  const { startTour, allTours, isTourCompleted, resetAllTours } = useTour();
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [showTourMenu, setShowTourMenu] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const location = useLocation();

  const getContextualHelp = (pathname: string) => {
    if (pathname.startsWith('/projects') || pathname.startsWith('/tasks')) {
      return {
        title: 'Project Delivery & Milestones',
        chapter: '04_project_creation.md',
        flowchart: 'FC-02_Project_Creation_to_Certification.mmd',
        flowchartId: 'FC-02',
        summary: 'Track engineering tasks on Kanban boards, stream GitHub commit hashes, and monitor project health telemetry.',
        tourId: 't6-project-room',
        tourTitle: 'Project Room Tour',
      };
    }
    if (pathname.startsWith('/jobs') || pathname.startsWith('/talent') || pathname.startsWith('/pipeline')) {
      return {
        title: 'Recruiter Radar & Hiring Pipeline',
        chapter: '12_recruiters_and_companies.md',
        flowchart: 'FC-11_Hiring_Pipeline.mmd',
        flowchartId: 'FC-11',
        summary: 'Search verified engineers by commit evidence, evaluate explainable AI candidate matches, and manage shortlists.',
        tourId: 't16-recruiter-hiring',
        tourTitle: 'Recruiter Hiring Tour',
      };
    }
    if (pathname.startsWith('/resumes') || pathname.startsWith('/me/profile')) {
      return {
        title: 'Profile & Resume Intelligence',
        chapter: '03_profile_and_resume.md',
        flowchart: 'FC-03_Resume_and_Profile.mmd',
        flowchartId: 'FC-03',
        summary: 'Parse PDF resumes with AI, review skills in quarantine, and configure granular recruiter visibility.',
        tourId: 't2-resume-upload',
        tourTitle: 'Resume AI Extraction Tour',
      };
    }
    if (pathname.startsWith('/hackathons') || pathname.startsWith('/challenges')) {
      return {
        title: 'Hackathons & Company Challenges',
        chapter: '11_hackathons_and_challenges.md',
        flowchart: 'FC-08_Hackathon_or_Sprint.mmd',
        flowchartId: 'FC-08',
        summary: 'Participate in time-boxed 48-hour sprints with live clocks or solve enterprise challenges for bounties.',
        tourId: 't12-hackathons',
        tourTitle: 'Hackathons Tour',
      };
    }
    if (pathname.startsWith('/mentors')) {
      return {
        title: 'Mentorship & Milestone Advisory',
        chapter: '13_mentorship.md',
        flowchart: 'FC-10_Mentorship.mmd',
        flowchartId: 'FC-10',
        summary: 'Review incoming project inquiries, review milestone deliverables, and provide structured critique.',
        tourId: 't14-mentor',
        tourTitle: 'Mentor Tour',
      };
    }
    if (pathname.startsWith('/admin')) {
      return {
        title: 'Platform Governance & Audit',
        chapter: '14_administrators.md',
        flowchart: 'FC-14_Admin_and_Moderation.mmd',
        flowchartId: 'FC-14',
        summary: 'Process moderation queues, arbitrate project disputes, and curate the canonical skill taxonomy.',
        tourId: 't19-admin',
        tourTitle: 'Admin Tour',
      };
    }
    return {
      title: 'Workspace Navigation & Cockpit HUD',
      chapter: '02_getting_started.md',
      flowchart: 'FC-01_Platform_Master.mmd',
      flowchartId: 'FC-01',
      summary: 'Navigate your 5-zone cockpit HUD, switch between the 6 contexts, and trigger universal search.',
      tourId: 'welcome-individual',
      tourTitle: 'Welcome Tour',
    };
  };

  const navCfg = navigationConfig[activeContext] || navigationConfig.individual;

  const load = () => {
    setLoading(true);
    api<{ data: WorkspaceContext }>('/ai/context')
      .then((r) => {
        setContext(r.data);
      })
      .catch((err) => {
        console.warn('AI context load warning:', err);
        setContext(fallbackContext);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/home') || pathname === '/') return 'Home';
    if (pathname.startsWith('/discover')) return 'Discover';
    if (pathname.startsWith('/pipeline')) return 'Pipeline';
    if (pathname.startsWith('/opportunities')) return 'Opportunities';
    if (pathname.startsWith('/challenges')) return 'Challenges & Hackathons';
    if (pathname.startsWith('/certificates')) return 'Certificates';
    if (pathname.startsWith('/verify')) return 'Verification';
    if (pathname.startsWith('/me/verified-experience')) return 'Verified Experience';
    if (pathname.startsWith('/me/portfolio')) return 'Portfolio';
    if (pathname.startsWith('/u/') || pathname.startsWith('/portfolio')) return 'Portfolio';
    if (pathname.startsWith('/projects/create') || pathname.startsWith('/projects/new')) return 'Create Project';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/team')) return 'Team Invitations';
    if (pathname.startsWith('/chat')) return 'Project Rooms';
    if (pathname.startsWith('/mentors')) return 'Mentors & Advisors';
    if (pathname.startsWith('/hackathons')) return 'Hackathons';
    if (pathname.startsWith('/resumes')) return 'Resume Intelligence';
    if (pathname.startsWith('/companies')) return 'Company Workspace';
    if (pathname.startsWith('/jobs')) return 'Jobs';
    if (pathname.startsWith('/talent')) return 'Talent Search';
    if (pathname.startsWith('/admin')) return 'Admin Console';
    if (pathname.startsWith('/me/profile')) return 'Profile';
    if (pathname.startsWith('/notifications')) return 'Inbox';
    if (pathname.startsWith('/help')) return 'Help Center';
    return 'SkillForge';
  };

  const activeUserContext = context || fallbackContext;

  return (
    <div className="studio">
      {/* =========================================================================
          DESKTOP SIDEBAR: Renders strictly from navigationConfig[activeContext]
          Max 6 primary items per context. Zero hardcoded links.
      ========================================================================= */}
      <aside className={`st-sidebar ${mobileNav ? 'open' : ''}`}>
        <Link to="/home" className="st-brand">
          <Brand />
          <span>
            skillforge<span className="st-brand-dot">.</span>
          </span>
        </Link>

        {/* Workspace Context Tag */}
        <div className="st-workspace-tag">
          <span className="st-workspace-avatar">
            {navCfg.label.charAt(0).toUpperCase()}
          </span>
          <div>
            <strong>{navCfg.label}</strong>
            <small>Context Active</small>
          </div>
        </div>

        {/* Dynamic Navigation rendered strictly from navigationConfig */}
        <nav aria-label="Main navigation" data-tour="sidebar-nav">
          <span className="st-nav-label">Navigation ({navCfg.primaryItems.length})</span>
          {navCfg.primaryItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              data-tour={item.dataTour}
              onClick={() => setMobileNav(false)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Optional Overflow Items if defined */}
          {navCfg.overflowItems.length > 0 && (
            <>
              <span className="st-nav-label mt-4">Tools &amp; Capabilities</span>
              {navCfg.overflowItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.route}
                  data-tour={item.dataTour}
                  onClick={() => setMobileNav(false)}
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Bottom Utilities */}
        <div className="st-sidebar-bottom">
          <NavLink to="/help" data-tour="topbar-help">
            <Icon name="spark" />
            <span>Help Center &amp; Manuals</span>
          </NavLink>
          <NavLink to="/auth/settings">
            <Icon name="shield" />
            <span>Settings</span>
          </NavLink>
          <div className="st-sidebar-note">
            <span className="st-dot" />
            Made for the work ahead.
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN APPLICATION VIEWPORT
      ========================================================================= */}
      <div className="st-main">
        {/* Top bar with Breadcrumbs, Context Switcher, Alerts, Help */}
        <header className="st-topbar">
          <button
            className="st-mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setMobileNav(!mobileNav)}
          >
            <Icon name="menu" size={18} />
          </button>
          <div className="st-breadcrumb">
            <span>Workspace</span>
            <Icon name="chevron" size={13} />
            <strong>{getPageTitle(location.pathname)}</strong>
          </div>

          <div className="st-topbar-right flex items-center gap-3">
            {/* Role Context Switcher */}
            <ContextSwitcher />

            {/* Quick Search */}
            <Link
              to="/discover"
              data-tour="topbar-search"
              className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202d] border border-[#2b2a3a] text-[#9ca3af] hover:text-white transition-colors"
              title="Search (Ctrl+K)"
            >
              <Icon name="search" size={15} />
            </Link>

            {/* In-App Notifications Bell */}
            <div data-tour="topbar-bell">
              <NotificationBell />
            </div>

            {/* Interactive Feature Demos Hub */}
            <button
              onClick={() => setShowDemoModal(true)}
              data-tour="topbar-demos"
              className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7c3aed]/20 to-[#38bdf8]/20 hover:from-[#7c3aed]/35 hover:to-[#38bdf8]/35 border border-[#7c3aed]/45 text-white hover:text-[#c4b5fd] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02]"
              title="One-click live interactive demos for all 34 modules"
            >
              <span>🎮</span>
              <span className="hidden sm:inline">Live Demos</span>
            </button>

            {/* Tour Dropdown Menu (Requirement B4.2) */}
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowTourMenu(!showTourMenu)}
                className="px-2.5 py-1 rounded-full bg-[#8861dc]/15 hover:bg-[#8861dc]/30 border border-[#8861dc]/35 text-[#c4b5fd] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Guided tours menu"
              >
                <span>✨ Tour</span>
                <span className="text-[10px] text-[#c4b5fd]">▾</span>
              </button>

              {showTourMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTourMenu(false)} />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#14141c] border border-[#2c2b3e] shadow-[0_12px_32px_rgba(0,0,0,0.8)] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-b border-[#242332]">
                      Guided Product Tours
                    </div>
                    <button
                      onClick={() => {
                        setShowTourMenu(false);
                        startTour();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-white hover:bg-[#1f1e2c] flex items-center justify-between transition-colors"
                    >
                      <span>🔄 Replay Welcome Tour</span>
                      <span className="text-[10px] text-zinc-400">~45s</span>
                    </button>
                    {(() => {
                      const cHelp = getContextualHelp(location.pathname);
                      return (
                        <button
                          onClick={() => {
                            setShowTourMenu(false);
                            startTour(cHelp.tourId);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-[#c4b5fd] hover:bg-[#1f1e2c] font-semibold flex items-center justify-between transition-colors"
                        >
                          <span>🎯 {cHelp.tourTitle}</span>
                          <span className="text-[10px] text-[#a855f7]">Current</span>
                        </button>
                      );
                    })()}
                    <div className="px-3.5 pt-2 pb-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-t border-[#242332]">
                      Feature Tours Catalog
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {allTours.map((t) => {
                        const done = isTourCompleted(t.tourId);
                        return (
                          <button
                            key={t.tourId}
                            onClick={() => {
                              setShowTourMenu(false);
                              startTour(t.tourId);
                            }}
                            className="w-full text-left px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-[#1f1e2c] flex items-center justify-between transition-colors"
                          >
                            <span className="truncate pr-2">{t.title}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-zinc-400">~{t.estimatedSeconds}s</span>
                              {done ? (
                                <span className="text-emerald-400 text-xs font-bold">✓</span>
                              ) : (
                                <span className="text-zinc-600 text-xs">•</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="pt-1.5 border-t border-[#242332] px-2">
                      <button
                        onClick={() => {
                          setShowTourMenu(false);
                          resetAllTours();
                        }}
                        className="w-full py-1 text-center text-[11px] text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Reset All Tour Progress
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Contextual Help Button (Requirement A4.4) */}
            <button
              onClick={() => setShowHelpDrawer(true)}
              data-tour="topbar-help"
              className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202d] border border-[#2b2a3a] text-[#c084fc] hover:text-white transition-colors text-xs font-bold"
              title="Help & Guides (?)"
            >
              ?
            </button>

            {/* Avatar Pill */}
            <Link
              to="/me/profile"
              data-tour="topbar-avatar"
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#181822] border border-[#2b2a3a] text-xs text-white hover:border-[#8861dc]/50 transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-[#8861dc] text-white flex items-center justify-center font-bold text-[10px]">
                {activeUserContext.user.name?.charAt(0) || 'U'}
              </span>
              <span className="hidden sm:inline font-medium text-[11px] max-w-[80px] truncate">
                {activeUserContext.user.name || 'User'}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="st-content">
          {loading && !context ? (
            <Loading />
          ) : (
            <Routes>
              {/* Core Home Redirection to 5-Zone Home */}
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<UnifiedHome />} />
              <Route path="/overview" element={<UnifiedHome />} />
              <Route path="/discover" element={<DiscoverPage />} />

              {/* Individual / Candidate Routes */}
              <Route path="/projects/*" element={<ProjectsModule />} />
              <Route path="/tasks/*" element={<TasksModule />} />
              <Route path="/team/*" element={<MyInvitations />} />
              <Route path="/chat/*" element={<ChatModule />} />
              <Route path="/mentors/*" element={<MentorsModule />} />
              <Route path="/hackathons/*" element={<HackathonsModule />} />
              <Route path="/contributions/*" element={<ContributionsHubPage />} />
              <Route path="/certificates/*" element={<MyCertificatesPage />} />
              <Route path="/verify/:certId" element={<PublicVerifyPage />} />
              <Route path="/verify" element={<PublicVerifyPage />} />
              <Route path="/me/verified-experience/*" element={<VerifiedExperiencePage />} />
              <Route path="/me/portfolio/*" element={<PortfolioEditorPage />} />
              <Route path="/u/:username" element={<PublicPortfolioPage />} />
              <Route path="/portfolio/:username" element={<PublicPortfolioPage />} />
              <Route path="/integrations/github/*" element={<GitHubIntegrationPage />} />
              <Route path="/resumes/*" element={<ResumeStudio />} />

              {/* Recruiter & Company Routes with Route Guards */}
              <Route path="/companies/*" element={<CompanyWorkspacePage />} />
              <Route path="/jobs/*" element={<JobsBoardPage />} />
              <Route
                path="/talent/*"
                element={
                  activeContext === 'individual' || activeContext === 'mentor' ? (
                    <AccessDenied requiredContext="recruiter" title="Recruiter Access Required" />
                  ) : (
                    <TalentSearchPage />
                  )
                }
              />
              <Route path="/portfolio/candidate/*" element={<CandidateProofView />} />
              <Route
                path="/pipeline/*"
                element={
                  activeContext === 'individual' || activeContext === 'mentor' ? (
                    <AccessDenied requiredContext="recruiter" title="Recruiter Pipeline Required" />
                  ) : (
                    <PipelineBoardPage />
                  )
                }
              />
              <Route path="/opportunities/*" element={<OpportunitiesInboxPage />} />
              <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
              <Route path="/challenges/*" element={<ChallengeBoardPage />} />

              {/* Platform Admin Routes with Strict Guards */}
              <Route
                path="/admin"
                element={
                  activeContext !== 'platform_admin' ? (
                    <AccessDenied requiredContext="platform_admin" title="Platform Admin Required" />
                  ) : (
                    <AdminConsolePage />
                  )
                }
              />
              <Route
                path="/admin/*"
                element={
                  activeContext !== 'platform_admin' ? (
                    <AccessDenied requiredContext="platform_admin" title="Platform Admin Required" />
                  ) : (
                    <AdminConsolePage />
                  )
                }
              />
              <Route
                path="/admin/skills/*"
                element={
                  activeContext !== 'platform_admin' ? (
                    <AccessDenied requiredContext="platform_admin" title="Platform Admin Required" />
                  ) : (
                    <AdminSkillsPage />
                  )
                }
              />

              {/* Help Center & Product Manuals */}
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/help/*" element={<HelpCenterPage />} />
              <Route path="/demos" element={<FeatureDemosPage />} />

              {/* Profile, Auth & Settings */}
              <Route path="/auth/login" element={<SignInPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/settings" element={<AccountSettingsPage />} />
              <Route path="/me/profile/*" element={<ProfileEditorPage />} />
              <Route path="/users/:id" element={<PublicProfilePage />} />
              <Route path="/settings/privacy/*" element={<PrivacyCentrePage />} />
              <Route path="/notifications/*" element={<NotificationsInboxPage />} />
              <Route path="/search/*" element={<GlobalSearchPage />} />
              <Route path="/feed/*" element={<OpportunityFeedPage />} />

              {/* Intelligence Tooling */}
              <Route path="/ai" element={<Navigate to="/home" replace />} />
              <Route path="/ai/requirements" element={<Requirements context={activeUserContext} />} />
              <Route path="/ai/match/*" element={<Matching context={activeUserContext} />} />
              <Route path="/ai/health" element={<Health context={activeUserContext} />} />
              <Route path="/ai/job-match/*" element={<JobMatching context={activeUserContext} />} />
              <Route path="/analytics/*" element={<Analytics context={activeUserContext} />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          )}
        </main>

        <footer className="st-footer">
          <span>SkillForge Unified Intelligence</span>
          <span>Human judgment, supported by evidence.</span>
        </footer>

        {/* Contextual Help Side Drawer (Requirement A4.4) */}
        {showHelpDrawer && (
          <div className="fixed inset-0 z-[99980] flex justify-end">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setShowHelpDrawer(false)}
            />
            <div className="relative w-full max-w-md h-full bg-[#12111c] border-l border-[#2e2d42] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-200">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#252436] mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] animate-pulse" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                      Contextual Help & Guides
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowHelpDrawer(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252436] transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const cHelp = getContextualHelp(location.pathname);
                  return (
                    <div className="space-y-5">
                      <div className="p-4 rounded-xl bg-[#191826] border border-[#323048]">
                        <span className="text-[10px] uppercase font-bold text-[#a855f7] tracking-wider">
                          Active Screen Guide
                        </span>
                        <h4 className="text-base font-bold text-white mt-1 mb-2">
                          {cHelp.title}
                        </h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {cHelp.summary}
                        </p>
                        <div className="mt-4 pt-3 border-t border-[#2a293d] flex gap-2">
                          <button
                            onClick={() => {
                              setShowHelpDrawer(false);
                              startTour(cHelp.tourId);
                            }}
                            className="px-3.5 py-1.5 rounded-lg bg-[#8861dc] hover:bg-[#784fce] text-xs font-bold text-white transition-all shadow-md flex items-center gap-1.5"
                          >
                            <span>✨ Start Tour</span>
                          </button>
                          <Link
                            to={`/help#${cHelp.flowchartId}`}
                            onClick={() => setShowHelpDrawer(false)}
                            className="px-3 py-1.5 rounded-lg bg-[#252436] hover:bg-[#302f44] text-xs font-semibold text-zinc-300 hover:text-white transition-all"
                          >
                            <span>Flowchart ({cHelp.flowchartId})</span>
                          </Link>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#151422] border border-[#262538] space-y-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          Quick Actions
                        </span>
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          <Link
                            to="/help"
                            onClick={() => setShowHelpDrawer(false)}
                            className="p-2.5 rounded-lg bg-[#1e1d2c] hover:bg-[#28273a] text-xs font-medium text-white flex items-center justify-between transition-colors"
                          >
                            <span>📖 Open Full User Manual (17 Chapters)</span>
                            <span>&rarr;</span>
                          </Link>
                          <button
                            onClick={() => {
                              setShowHelpDrawer(false);
                              startTour();
                            }}
                            className="p-2.5 rounded-lg bg-[#1e1d2c] hover:bg-[#28273a] text-xs font-medium text-white flex items-center justify-between text-left transition-colors"
                          >
                            <span>✨ Replay Role Welcome Tour</span>
                            <span>&rarr;</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-[#252436] text-[11px] text-zinc-500 text-center">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[#201f2e] border border-[#323145] text-zinc-300">Esc</kbd> anytime to dismiss.
              </div>
            </div>
          </div>
        )}
        {/* Feature-Wise Interactive Demos Modal */}
        <FeatureDemoModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
      </div>
    </div>
  );
}
