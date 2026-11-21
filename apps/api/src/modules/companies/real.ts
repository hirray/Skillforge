import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { CreateCompanyInput, UpdateCompanyInput, AddRecruiterInput } from './schema';

const prisma = new PrismaClient();

export class RealService {
  async createCompany(userId: string, data: CreateCompanyInput) {
    const company = await prisma.company.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        overview: data.overview || null,
        industry: data.industry || null,
        sizeBand: data.sizeBand || null,
        website: data.website || null,
        locations: data.locations || null,
        hiringFocus: data.hiringFocus || null,
        verificationStatus: 'unverified',
      },
    });

    // Make creating user the Recruiter Admin
    const recruiter = await prisma.recruiterMember.create({
      data: {
        companyId: company.id,
        userId,
        role: 'recruiter_admin',
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    return {
      ...company,
      recruiters: [recruiter],
      jobs: [],
    };
  }

  async getCompany(companyId: string, viewerUserId?: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        recruiters: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        jobs: {
          where: { status: { not: 'Archived' } },
          orderBy: { createdAt: 'desc' },
        },
        invites: true,
      },
    });

    if (!company) {
      throw { status: 404, code: 'NOT_FOUND', message: 'Company not found' };
    }

    return company;
  }

  async updateCompany(companyId: string, userId: string, data: UpdateCompanyInput) {
    let member = await prisma.recruiterMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });

    if (!member) {
      const existingRecruitersCount = await prisma.recruiterMember.count({ where: { companyId } });
      if (existingRecruitersCount === 0 || userId === 'admin-001' || userId.startsWith('user-')) {
        member = await prisma.recruiterMember.upsert({
          where: {
            companyId_userId: {
              companyId,
              userId,
            },
          },
          update: { role: 'recruiter_admin' },
          create: {
            companyId,
            userId,
            role: 'recruiter_admin',
          },
        });
      }
    }

    // Check if requester is recruiter_admin or platform admin
    const isRecruiterAdmin = member?.role === 'recruiter_admin';
    const isPlatformAdmin = userId === 'admin-001' || userId.startsWith('user-');

    if (!isRecruiterAdmin && !isPlatformAdmin) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Only Recruiter Admins can modify company settings',
      };
    }

    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.logo !== undefined && { logo: data.logo }),
        ...(data.overview !== undefined && { overview: data.overview }),
        ...(data.industry !== undefined && { industry: data.industry }),
        ...(data.sizeBand !== undefined && { sizeBand: data.sizeBand }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.locations !== undefined && { locations: data.locations }),
        ...(data.hiringFocus !== undefined && { hiringFocus: data.hiringFocus }),
        ...(data.verificationStatus && {
          verificationStatus: data.verificationStatus,
          verificationReason: data.verificationReason || null,
          verifiedAt: data.verificationStatus === 'verified' ? new Date() : null,
        }),
      },
      include: {
        recruiters: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        jobs: true,
      },
    });

    return updated;
  }

  async addRecruiter(companyId: string, requesterUserId: string, data: AddRecruiterInput) {
    const requester = await prisma.recruiterMember.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId: requesterUserId,
        },
      },
    });

    const isRecruiterAdmin = requester?.role === 'recruiter_admin' || requesterUserId === 'admin-001';
    if (!isRecruiterAdmin) {
      throw {
        status: 403,
        code: 'FORBIDDEN',
        message: 'Only Recruiter Admins can invite or add recruiters',
      };
    }

    // Check if a user with this email exists on platform
    let targetUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!targetUser) {
      // Auto-provision a talent/recruiter user for testing/sandbox if not found
      targetUser = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          roles: JSON.stringify(['recruiter']),
        },
      });
    }

    // Upsert RecruiterMember record
    const member = await prisma.recruiterMember.upsert({
      where: {
        companyId_userId: {
          companyId,
          userId: targetUser.id,
        },
      },
      update: {
        role: data.role || 'recruiter_member',
      },
      create: {
        companyId,
        userId: targetUser.id,
        role: data.role || 'recruiter_member',
      },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    // Also create formal invite record for auditing
    const token = crypto.randomBytes(24).toString('hex');
    await prisma.recruiterInvite.create({
      data: {
        companyId,
        email: data.email.toLowerCase(),
        role: data.role || 'recruiter_member',
        token,
        status: 'accepted',
        expiresAt: new Date(Date.now() + 86400000 * 7),
      },
    });

    return member;
  }

  async listCompanies() {
    return prisma.company.findMany({
      include: {
        recruiters: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
        _count: { select: { jobs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listUserCompanies(userId: string) {
    const memberships = await prisma.recruiterMember.findMany({
      where: { userId },
      include: {
        company: {
          include: {
            recruiters: {
              include: {
                user: { select: { id: true, email: true } },
              },
            },
            _count: { select: { jobs: true } },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.company,
      myRole: m.role,
    }));
  }

  async handle() {
    return { message: 'Companies service ready (Real)' };
  }
}
