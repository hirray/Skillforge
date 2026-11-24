import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { api } from '../ai/client';
import { Icon } from '../ai/shared';

interface ProjectItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  stage?: string;
  status: string;
}

interface PersonItem {
  id: string;
  name: string;
  headline?: string;
  city?: string;
  skills?: Array<{ name: string; level?: string }>;
}

interface JobItem {
  id: string;
  title: string;
  company?: string;
  location?: string;
  type?: string;
  skills?: string[];
}

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'projects';
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [people, setPeople] = useState<PersonItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const [projRes, usersRes, jobsRes] = await Promise.allSettled([
          api('/projects'),
          api('/users'),
          api('/jobs'),
        ]);

        if (isMounted) {
          if (projRes.status === 'fulfilled' && projRes.value) {
            setProjects(Array.isArray(projRes.value) ? projRes.value : (projRes.value as any).data || []);
          }
          if (usersRes.status === 'fulfilled' && usersRes.value) {
            setPeople(Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value as any).items || []);
          }
          if (jobsRes.status === 'fulfilled' && jobsRes.value) {
            setJobs(Array.isArray(jobsRes.value) ? jobsRes.value : (jobsRes.value as any).jobs || []);
          }
        }
      } catch (e) {
        console.warn('Discover load error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    void loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId, ...(query ? { q: query } : {}) });
  };

  const filteredProjects = projects.filter((p) =>
    !query || p.title?.toLowerCase().includes(query.toLowerCase()) || p.description?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPeople = people.filter((peep) =>
    !query || peep.name?.toLowerCase().includes(query.toLowerCase()) || peep.headline?.toLowerCase().includes(query.toLowerCase())
  );

  const filteredJobs = jobs.filter((j) =>
    !query || j.title?.toLowerCase().includes(query.toLowerCase()) || j.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageShell
      title="Universal Discovery Engine"
      description="Explore active collaborative projects, verified engineering talent, and company opportunities across the SkillForge network."
      breadcrumb={[
        { label: 'Workspace', href: '/home' },
        { label: 'Discover' },
      ]}
      tabs={[
        { id: 'projects', label: 'Projects', count: filteredProjects.length },
        { id: 'people', label: 'People', count: filteredPeople.length },
        { id: 'jobs', label: 'Jobs', count: filteredJobs.length },
      ]}
      activeTab={currentTab}
      onTabChange={handleTabChange}
      dataTour="tabs-discover"
      primaryAction={
        <div className="relative w-72">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${currentTab}...`}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#171720] border border-[#2b2a3a] text-xs text-white placeholder-[#6b7280] focus:outline-none focus:border-[#8861dc]"
          />
          <span className="absolute left-3 top-2 text-[#6b7280]">
            <Icon name="search" size={13} />
          </span>
        </div>
      }
    >
      {/* Tab 1: Projects List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#96939f]">Loading discovery feed...</div>
      ) : (
        <>
          {currentTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-[#6b7280] bg-[#111116] border border-[#262533] rounded-2xl">
              No projects found matching your search.
            </div>
          ) : (
            filteredProjects.map((p) => (
              <div
                key={p.id}
                className="group p-4 rounded-2xl bg-[#111116] hover:bg-[#15151e] border border-[#262533] hover:border-[#8861dc]/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#8861dc]/15 text-[#c084fc] border border-[#8861dc]/30">
                      {p.stage || 'Active'}
                    </span>
                    <span className="text-[10px] text-[#6b7280]">{p.category || 'Engineering'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#c4b5fd] transition-colors line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-[#9ca3af] line-clamp-2 leading-relaxed">
                    {p.description || 'Collaborative engineering initiative solving real problems on SkillForge.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#252433] flex items-center justify-between">
                  <span className="text-[11px] text-[#34d399] font-semibold">Open for team requests</span>
                  <Link
                    to={`/projects/${p.id}`}
                    className="text-xs text-[#b29af5] hover:underline font-bold"
                  >
                    View Project &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: People List */}
      {currentTab === 'people' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredPeople.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-[#6b7280] bg-[#111116] border border-[#262533] rounded-2xl">
              No verified talent found matching your criteria.
            </div>
          ) : (
            filteredPeople.map((peep) => (
              <div
                key={peep.id}
                className="group p-4 rounded-2xl bg-[#111116] hover:bg-[#15151e] border border-[#262533] hover:border-[#38bdf8]/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1a1926] border border-[#2e2d40] text-[#c084fc] flex items-center justify-center font-bold text-sm shrink-0">
                    {peep.name ? peep.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{peep.name || 'Candidate Engineer'}</h3>
                    <p className="text-xs text-[#9ca3af] truncate mt-0.5">{peep.headline || 'Fullstack Engineer'}</p>
                    <span className="text-[10px] text-[#6b7280]">{peep.city || 'Remote Available'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#252433] flex items-center justify-between">
                  <span className="text-[10px] text-[#38bdf8] font-bold">100% Attested</span>
                  <Link
                    to={`/users/${peep.id}`}
                    className="text-xs text-[#38bdf8] hover:underline font-bold"
                  >
                    View Dossier &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Jobs List */}
      {currentTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredJobs.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-[#6b7280] bg-[#111116] border border-[#262533] rounded-2xl">
              No active jobs posted at this time.
            </div>
          ) : (
            filteredJobs.map((j) => (
              <div
                key={j.id}
                className="group p-4 rounded-2xl bg-[#111116] hover:bg-[#15151e] border border-[#262533] hover:border-[#f59e0b]/50 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#f59e0b]/15 text-[#fde68a] border border-[#f59e0b]/30">
                      {j.type || 'Full-time'}
                    </span>
                    <span className="text-[10px] text-[#6b7280]">{j.location || 'Remote'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#fde68a] transition-colors line-clamp-1">
                    {j.title}
                  </h3>
                  <p className="text-xs text-[#9ca3af]">
                    {j.company || 'Enterprise Partner'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#252433] flex items-center justify-between">
                  <span className="text-[10px] text-[#34d399] font-bold">Verified Opening</span>
                  <Link
                    to="/opportunities"
                    className="text-xs text-[#f59e0b] hover:underline font-bold"
                  >
                    Apply with Proof &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
        </>
      )}
    </PageShell>
  );
};

