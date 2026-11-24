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
  const { startTour } = useTour();
  const [context, setContext] = useState<WorkspaceContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const location = useLocation();

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

            {/* Guided Feature Tour Button */}
            <button
              onClick={() => startTour()}
              className="px-2.5 py-1 rounded-full bg-[#8861dc]/15 hover:bg-[#8861dc]/30 border border-[#8861dc]/35 text-[#c4b5fd] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Start feature tour"
            >
              <span>✨ Tour</span>
            </button>

            {/* Help Button */}
            <Link
              to="/help"
              data-tour="topbar-help"
              className="p-1.5 rounded-lg bg-[#181822] hover:bg-[#20202d] border border-[#2b2a3a] text-[#c084fc] hover:text-white transition-colors text-xs font-bold"
              title="Help & Guides"
            >
              ?
            </Link>

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
      </div>
    </div>
  );
}
