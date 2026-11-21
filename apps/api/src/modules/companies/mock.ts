import { CreateCompanyInput, UpdateCompanyInput, AddRecruiterInput } from './schema';

export class MockService {
  private companies = new Map<string, any>();
  private recruiters = new Map<string, any[]>();
  private invites = new Map<string, any[]>();

  constructor() {
    const demoId = 'm2-demo-company';
    this.companies.set(demoId, {
      id: demoId,
      name: 'Northstar Labs · Demo',
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&h=200',
      overview: 'Building next-generation collaborative AI infrastructure and distributed team tooling.',
      industry: 'Software & Cloud Infrastructure',
      sizeBand: '51-200',
      website: 'https://northstarlabs.example.com',
      locations: 'San Francisco, CA • Remote',
      hiringFocus: 'Machine Learning, Fullstack TypeScript, Distributed Systems',
      verificationStatus: 'verified',
      verificationReason: 'Work domain verified: @northstarlabs.example.com',
      verifiedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    });

    this.recruiters.set(demoId, [
      {
        id: 'recruiter-mbr-001',
        companyId: demoId,
        userId: 'recruiter-001',
        role: 'recruiter_admin',
        joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        user: { id: 'recruiter-001', email: 'recruiter@northstarlabs.example.com' },
      },
    ]);
  }

  async createCompany(userId: string, data: CreateCompanyInput) {
    const id = `company-${Date.now()}`;
    const company = {
      id,
      ...data,
      verificationStatus: 'unverified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.companies.set(id, company);

    const recruiter = {
      id: `recruiter-${Date.now()}`,
      companyId: id,
      userId,
      role: 'recruiter_admin',
      joinedAt: new Date().toISOString(),
      user: { id: userId, email: `${userId}@example.com` },
    };
    this.recruiters.set(id, [recruiter]);

    return { ...company, recruiters: [recruiter] };
  }

  async getCompany(companyId: string, viewerUserId?: string) {
    const company = this.companies.get(companyId);
    if (!company) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Company not found' };
    }
    const recruiters = this.recruiters.get(companyId) || [];
    return { ...company, recruiters, jobs: [] };
  }

  async updateCompany(companyId: string, userId: string, data: UpdateCompanyInput) {
    const company = this.companies.get(companyId);
    if (!company) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Company not found' };
    }

    const recruiters = this.recruiters.get(companyId) || [];
    const isRecruiterAdmin = recruiters.some((r) => r.userId === userId && r.role === 'recruiter_admin');
    if (!isRecruiterAdmin && userId !== 'admin-001') {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only Recruiter Admin can update company details' };
    }

    const updated = {
      ...company,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.companies.set(companyId, updated);
    return { ...updated, recruiters };
  }

  async addRecruiter(companyId: string, requesterUserId: string, data: AddRecruiterInput) {
    const company = this.companies.get(companyId);
    if (!company) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Company not found' };
    }

    const recruiters = this.recruiters.get(companyId) || [];
    const isRecruiterAdmin = recruiters.some((r) => r.userId === requesterUserId && r.role === 'recruiter_admin');
    if (!isRecruiterAdmin && requesterUserId !== 'admin-001') {
      throw { status: 403, code: 'FORBIDDEN', message: 'Only Recruiter Admin can invite recruiter members' };
    }

    const newRecruiter = {
      id: `recruiter-${Date.now()}`,
      companyId,
      userId: data.userId || `user-${Date.now().toString(36)}`,
      role: data.role || 'recruiter_member',
      joinedAt: new Date().toISOString(),
      user: { id: data.userId || 'invited', email: data.email },
    };

    recruiters.push(newRecruiter);
    this.recruiters.set(companyId, recruiters);
    return newRecruiter;
  }

  async listCompanies() {
    return Array.from(this.companies.values());
  }

  async listUserCompanies(userId: string) {
    const results: any[] = [];
    for (const [companyId, recList] of this.recruiters.entries()) {
      const match = recList.find((r) => r.userId === userId);
      if (match) {
        const company = this.companies.get(companyId);
        if (company) {
          results.push({ ...company, myRole: match.role });
        }
      }
    }
    return results;
  }

  async handle() {
    return { message: 'Companies service ready (Mock)' };
  }
}
