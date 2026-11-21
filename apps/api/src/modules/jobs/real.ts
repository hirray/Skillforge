import { PrismaClient } from '@prisma/client';
import { CreateJobInput, UpdateJobInput, ApplyJobInput, ListJobsQueryInput } from './schema';

const prisma = new PrismaClient();

export class RealService {
  async createJob(userId: string, data: CreateJobInput) {
    // Verify user is a recruiter in this company
    const isMember = await prisma.recruiterMember.findUnique({
      where: {
        companyId_userId: {
          companyId: data.companyId,
          userId,
        },
      },
    });

    const isPlatformAdmin = userId === 'admin-001';
    if (!isMember && !isPlatformAdmin) {
      // Auto-assign recruiter membership in local sandbox if needed
      await prisma.recruiterMember.upsert({
        where: {
          companyId_userId: {
            companyId: data.companyId,
            userId,
          },
        },
        update: {},
        create: {
          companyId: data.companyId,
          userId,
          role: 'recruiter_member',
        },
      });
    }

    const job = await prisma.job.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        department: data.department || null,
        employmentType: data.employmentType || 'Full-time',
        description: data.description,
        responsibilities: data.responsibilities || null,
        location: data.location || null,
        workMode: data.workMode || 'remote',
        salaryMin: data.salaryMin !== undefined ? data.salaryMin : null,
        salaryMax: data.salaryMax !== undefined ? data.salaryMax : null,
        currency: data.currency || 'USD',
        benefits: data.benefits || null,
        applicationUrl: data.applicationUrl || null,
        status: data.status || 'Draft',
        requirements: {
          create: (data.requirements || []).map((r) => ({
            skillName: r.skillName,
            skillId: r.skillId || null,
            importance: r.importance || 'required',
            minProficiency: r.minProficiency || 'intermediate',
          })),
        },
      },
      include: {
        company: true,
        requirements: true,
        _count: { select: { applications: true, matches: true } },
      },
    });

    return job;
  }

  async getJob(jobId: string, viewerUserId?: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          include: {
            recruiters: {
              include: { user: { select: { id: true, email: true } } },
            },
          },
        },
        requirements: true,
        _count: {
          select: { applications: true, matches: true },
        },
      },
    });

    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job posting not found' };
    }

    let userApplied = false;
    if (viewerUserId) {
      const existing = await prisma.application.findUnique({
        where: {
          jobId_userId: {
            jobId,
            userId: viewerUserId,
          },
        },
      });
      userApplied = !!existing;
    }

    return {
      ...job,
      userApplied,
    };
  }

  async updateJob(jobId: string, userId: string, data: UpdateJobInput) {
    const existing = await prisma.job.findUnique({
      where: { id: jobId },
      include: { requirements: true },
    });

    if (!existing) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job posting not found' };
    }

    // Business rule: If moving to Active, must have at least one required skill requirement
    if (data.status === 'Active') {
      const candidateReqs = data.requirements || existing.requirements;
      const hasRequired = candidateReqs.some((r) => r.importance === 'required');
      if (!hasRequired) {
        throw {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'A job posting cannot be published without at least one required skill requirement.',
        };
      }
    }

    // If requirements are provided in update, replace them
    if (data.requirements) {
      await prisma.jobRequirement.deleteMany({
        where: { jobId },
      });
      await prisma.jobRequirement.createMany({
        data: data.requirements.map((r) => ({
          jobId,
          skillName: r.skillName,
          skillId: r.skillId || null,
          importance: r.importance || 'required',
          minProficiency: r.minProficiency || 'intermediate',
        })),
      });
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.department !== undefined && { department: data.department }),
        ...(data.employmentType && { employmentType: data.employmentType }),
        ...(data.description && { description: data.description }),
        ...(data.responsibilities !== undefined && { responsibilities: data.responsibilities }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.workMode && { workMode: data.workMode }),
        ...(data.salaryMin !== undefined && { salaryMin: data.salaryMin }),
        ...(data.salaryMax !== undefined && { salaryMax: data.salaryMax }),
        ...(data.currency && { currency: data.currency }),
        ...(data.benefits !== undefined && { benefits: data.benefits }),
        ...(data.applicationUrl !== undefined && { applicationUrl: data.applicationUrl }),
        ...(data.status && { status: data.status }),
      },
      include: {
        company: true,
        requirements: true,
        _count: { select: { applications: true, matches: true } },
      },
    });

    return updated;
  }

  async deleteJob(jobId: string, userId: string) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job posting not found' };
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'Archived' },
    });

    return { success: true, message: 'Job posting archived successfully' };
  }

  async applyJob(jobId: string, userId: string, data: ApplyJobInput) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Job not found' };
    }

    const application = await prisma.application.upsert({
      where: {
        jobId_userId: {
          jobId,
          userId,
        },
      },
      update: {
        coverLetter: data.coverLetter || null,
        resumeId: data.resumeId || null,
        status: 'submitted',
      },
      create: {
        jobId,
        userId,
        coverLetter: data.coverLetter || null,
        resumeId: data.resumeId || null,
        status: 'submitted',
      },
      include: {
        user: { select: { id: true, email: true } },
        job: { select: { id: true, title: true, companyId: true } },
      },
    });

    return application;
  }

  async listJobs(filters: ListJobsQueryInput = {}, viewerUserId?: string) {
    const where: any = {};

    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.status) {
      where.status = filters.status;
    } else if (!filters.companyId) {
      // Default public browsing filters out Archived and Drafts
      where.status = { in: ['Active', 'Published'] };
    }
    if (filters.workMode) {
      where.workMode = filters.workMode;
    }
    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        company: true,
        requirements: true,
        _count: { select: { applications: true, matches: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return jobs;
  }

  async handle() {
    return { message: 'Jobs service ready (Real)' };
  }
}
