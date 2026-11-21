import { CreateJobInput, UpdateJobInput, ApplyJobInput, ListJobsQueryInput } from './schema';

export class MockService {
  private jobs = new Map<string, any>();
  private applications = new Map<string, any[]>();

  constructor() {
    const demoJobId = 'm2-demo-job';
    this.jobs.set(demoJobId, {
      id: demoJobId,
      companyId: 'm2-demo-company',
      title: 'Machine Learning Engineer',
      department: 'Frontier AI Research',
      employmentType: 'Full-time',
      description: 'Join our core platform team to build production agentic workflows and evaluation pipelines.',
      responsibilities: 'Design and deploy LLM agents, optimize latency, write integration tests.',
      location: 'San Francisco, CA',
      workMode: 'remote',
      salaryMin: 140000,
      salaryMax: 185000,
      currency: 'USD',
      benefits: 'Full health, 401(k) matching, home office stipend.',
      status: 'Active',
      stale: false,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      company: {
        id: 'm2-demo-company',
        name: 'Northstar Labs · Demo',
        logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&h=200',
        industry: 'Software & Cloud Infrastructure',
        verificationStatus: 'verified',
      },
      requirements: [
        { id: 'req-1', jobId: demoJobId, skillName: 'Python', importance: 'required', minProficiency: 'advanced' },
        { id: 'req-2', jobId: demoJobId, skillName: 'FastAPI', importance: 'required', minProficiency: 'intermediate' },
        { id: 'req-3', jobId: demoJobId, skillName: 'PyTorch', importance: 'preferred', minProficiency: 'intermediate' },
      ],
      _count: { applications: 3, matches: 12 },
    });
  }

  async createJob(userId: string, data: CreateJobInput) {
    const id = `job-${Date.now()}`;
    const requirements = (data.requirements || []).map((r, idx) => ({
      id: `req-${id}-${idx}`,
      jobId: id,
      skillName: r.skillName,
      importance: r.importance,
      minProficiency: r.minProficiency,
    }));

    const job = {
      id,
      ...data,
      requirements,
      company: {
        id: data.companyId,
        name: 'Company',
      },
      _count: { applications: 0, matches: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(id, job);
    return job;
  }

  async getJob(jobId: string, viewerUserId?: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job not found' };
    }
    const apps = this.applications.get(jobId) || [];
    return {
      ...job,
      _count: {
        ...job._count,
        applications: apps.length,
      },
      userApplied: viewerUserId ? apps.some((a) => a.userId === viewerUserId) : false,
    };
  }

  async updateJob(jobId: string, userId: string, data: UpdateJobInput) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job not found' };
    }

    if (data.status === 'Active') {
      const reqs = data.requirements || job.requirements || [];
      const hasRequired = reqs.some((r: any) => r.importance === 'required');
      if (!hasRequired) {
        throw {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'A job posting cannot be published without at least one required skill requirement.',
        };
      }
    }

    const updated = {
      ...job,
      ...data,
      ...(data.requirements && {
        requirements: data.requirements.map((r, idx) => ({
          id: `req-${jobId}-${idx}`,
          jobId,
          ...r,
        })),
      }),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, updated);
    return updated;
  }

  async deleteJob(jobId: string, userId: string) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job not found' };
    }
    job.status = 'Archived';
    this.jobs.set(jobId, job);
    return { success: true, message: 'Job archived successfully' };
  }

  async applyJob(jobId: string, userId: string, data: ApplyJobInput) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job not found' };
    }

    const current = this.applications.get(jobId) || [];
    const existing = current.find((a) => a.userId === userId);
    if (existing) {
      return existing;
    }

    const application = {
      id: `app-${Date.now()}`,
      jobId,
      userId,
      status: 'submitted',
      coverLetter: data.coverLetter || null,
      resumeId: data.resumeId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    current.push(application);
    this.applications.set(jobId, current);

    return application;
  }

  async listJobs(filters: ListJobsQueryInput = {}, viewerUserId?: string) {
    let list = Array.from(this.jobs.values());

    if (filters.companyId) {
      list = list.filter((j) => j.companyId === filters.companyId);
    }
    if (filters.status) {
      list = list.filter((j) => j.status === filters.status);
    }
    if (filters.workMode) {
      list = list.filter((j) => j.workMode === filters.workMode);
    }
    if (filters.employmentType) {
      list = list.filter((j) => j.employmentType === filters.employmentType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q) ||
          j.company?.name?.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async handle() {
    return { message: 'Jobs service ready (Mock)' };
  }
}
