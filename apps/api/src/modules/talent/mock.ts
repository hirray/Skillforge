export class MockService {
  private candidates = [
    {
      id: 'cand-001',
      name: 'Alex Rivera',
      headline: 'Senior Fullstack Engineer & Distributed Systems Lead',
      location: 'San Francisco, CA',
      workMode: 'remote',
      experienceYears: 6,
      availability: 'immediate',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker'],
      evidenceHighlights: [
        { type: 'github_commits', count: 18, label: '18 Verified Commits' },
        { type: 'tasks', count: 7, label: '7 Completed Tasks' },
        { type: 'verified_projects', count: 2, label: '2 Verified Projects' },
      ],
      whyThisCandidate:
        'Proven fullstack track record with 2 verified pilot projects, 18 GitHub commits, and direct API architecture ownership.',
      verifiedProjectCount: 2,
      contributionCount: 25,
      recruiterVisible: true,
    },
    {
      id: 'cand-002',
      name: 'Elena Rostova',
      headline: 'Product Designer & Frontend UI/UX Engineer',
      location: 'New York, NY',
      workMode: 'hybrid',
      experienceYears: 4,
      availability: '2_weeks',
      skills: ['Figma', 'React', 'TailwindCSS', 'Design Systems', 'CSS'],
      evidenceHighlights: [
        { type: 'verified_projects', count: 1, label: '1 Verified Project' },
        { type: 'github_commits', count: 12, label: '12 Component PRs/Commits' },
      ],
      whyThisCandidate:
        'Strong design systems portfolio with 12 attested components and verified team leadership on project design tokens.',
      verifiedProjectCount: 1,
      contributionCount: 14,
      recruiterVisible: true,
    },
    {
      id: 'cand-003',
      name: 'Marcus Chen',
      headline: 'AI/ML Systems Specialist & Python Backend Architect',
      location: 'Seattle, WA',
      workMode: 'remote',
      experienceYears: 5,
      availability: '1_month',
      skills: ['Python', 'FastAPI', 'PyTorch', 'PostgreSQL', 'Docker'],
      evidenceHighlights: [
        { type: 'tasks', count: 9, label: '9 Completed Tasks' },
        { type: 'certificates', count: 1, label: 'Verified Proof Certificate' },
      ],
      whyThisCandidate:
        'Extensive Python backend execution with verified certificates and 9 completed complex system tasks.',
      verifiedProjectCount: 1,
      contributionCount: 11,
      recruiterVisible: true,
    },
  ];

  private savedSearches: any[] = [
    {
      id: 'saved-001',
      name: 'Senior Remote Fullstack (React + TS)',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      filters: { skills: ['React', 'TypeScript'], workMode: 'remote' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  async searchTalent(filters: any) {
    let results = this.candidates.filter((c) => c.recruiterVisible);

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.headline.toLowerCase().includes(q) ||
          c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      results = results.filter((c) =>
        filters.skills.some((reqSkill: string) =>
          c.skills.some((s) => s.toLowerCase().includes(reqSkill.toLowerCase()))
        )
      );
    }

    if (filters.minExperienceYears) {
      results = results.filter((c) => c.experienceYears >= filters.minExperienceYears);
    }

    if (filters.workMode && filters.workMode !== 'flexible') {
      results = results.filter((c) => c.workMode === filters.workMode || c.workMode === 'flexible');
    }

    if (filters.availability && filters.availability !== 'flexible') {
      results = results.filter((c) => c.availability === filters.availability || c.availability === 'flexible');
    }

    if (filters.evidenceTypes && filters.evidenceTypes.length > 0) {
      results = results.filter((c) =>
        filters.evidenceTypes.some((evType: string) =>
          c.evidenceHighlights.some((h) => h.type === evType)
        )
      );
    }

    const total = results.length;
    const paginated = results.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20));

    return {
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      candidates: paginated,
    };
  }

  async listSavedSearches(companyId?: string, recruiterId?: string) {
    const list = this.savedSearches.filter(
      (s) => (!companyId || s.companyId === companyId) && (!recruiterId || s.recruiterId === recruiterId)
    );
    return { searches: list.length > 0 ? list : this.savedSearches };
  }

  async createSavedSearch(data: any, recruiterId: string) {
    const newSearch = {
      id: `saved-${Date.now()}`,
      name: data.name,
      companyId: data.companyId || 'm2-demo-company',
      recruiterId: recruiterId || 'recruiter-001',
      filters: data.filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.savedSearches.unshift(newSearch);
    return newSearch;
  }
}
