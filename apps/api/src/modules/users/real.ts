import { PrismaClient } from '@prisma/client';
import { projectForViewer, canView } from '../../core/visibility';
import { writeAudit } from '../../core/audit';
import { storageProvider } from '../../core/storage';

const prisma = new PrismaClient();

export class RealUserService {
  /**
   * Calculate profile completeness percentage and breakdown
   */
  private calculateCompleteness(user: any) {
    let score = 0;
    const checks: { item: string; done: boolean; points: number }[] = [
      { item: 'Full Name', done: Boolean(user.name), points: 10 },
      { item: 'Professional Headline', done: Boolean(user.headline), points: 15 },
      { item: 'Bio Summary', done: Boolean(user.bio && user.bio.length >= 20), points: 15 },
      { item: 'Location & Work Mode', done: Boolean(user.city && user.workMode), points: 10 },
      { item: 'At least 3 Verified Skills', done: Boolean(user.skills && user.skills.length >= 3), points: 20 },
      { item: 'Work Experience', done: Boolean(user.experience && user.experience.length > 0), points: 15 },
      { item: 'Education or Certifications', done: Boolean((user.education && user.education.length > 0) || (user.certifications && user.certifications.length > 0)), points: 10 },
      { item: 'Company or Job Title', done: Boolean(user.companyName || user.jobTitle), points: 5 },
    ];

    checks.forEach((c) => {
      if (c.done) score += c.points;
    });

    return {
      percentage: Math.min(100, score),
      checks,
    };
  }

  /**
   * Format experience item from DB
   */
  private formatExperience(exp: any) {
    let details: any = {};
    if (exp.detailsJson) {
      try {
        details = JSON.parse(exp.detailsJson);
      } catch {}
    }
    return {
      id: exp.id,
      company: exp.company,
      title: exp.role,
      role: exp.role,
      location: details.location,
      startDate: details.startDate || '2024-01',
      endDate: details.endDate,
      current: details.current ?? !details.endDate,
      description: details.description,
    };
  }

  /**
   * Format education item from DB
   */
  private formatEducation(edu: any) {
    let details: any = {};
    if (edu.detailsJson) {
      try {
        details = JSON.parse(edu.detailsJson);
      } catch {}
    }
    return {
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: details.fieldOfStudy,
      startDate: details.startDate || '2020-09',
      endDate: details.endDate,
      current: details.current ?? false,
    };
  }

  /**
   * Format certification item from DB
   */
  private formatCertification(cert: any) {
    let details: any = {};
    if (cert.detailsJson) {
      try {
        details = JSON.parse(cert.detailsJson);
      } catch {}
    }
    return {
      id: cert.id,
      name: cert.name,
      issuer: details.issuer || 'SkillForge Authority',
      issueDate: details.issueDate || '2024-01',
      expiryDate: details.expiryDate,
      credentialId: details.credentialId,
      credentialUrl: details.credentialUrl,
    };
  }

  /**
   * GET /users/me
   */
  async getMe(userId: string) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experience: true,
        education: true,
        certifications: true,
        availabilities: true,
      },
    });

    // If user doesn't exist yet, bootstrap
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@skillforge.local`,
          name: userId === 'recruiter-001' ? 'Enterprise Recruiter' : userId === 'admin-001' ? 'System Administrator' : 'Candidate Engineer',
          roles: userId.includes('recruiter') ? '["recruiter"]' : userId.includes('admin') ? '["admin"]' : '["individual"]',
          emailVerified: true,
          workMode: 'remote',
        },
        include: {
          skills: { include: { skill: true } },
          experience: true,
          education: true,
          certifications: true,
          availabilities: true,
        },
      });
    }

    const completeness = this.calculateCompleteness(user);

    let parsedVisibility: any = {
      profile: true,
      skills: true,
      proof: true,
      experience: true,
      education: true,
      contact: true,
    };
    if (user.visibilitySettings) {
      try {
        parsedVisibility = JSON.parse(user.visibilitySettings);
      } catch {}
    }

    const currentAvailability = user.availabilities?.[0]?.status || 'immediate';

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName || user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        headline: user.headline,
        bio: user.bio,
        pronouns: user.pronouns,
        city: user.city,
        region: user.region,
        country: user.country,
        workMode: user.workMode,
        emailVerified: user.emailVerified,
        intendedUse: user.intendedUse,
        companyName: user.companyName,
        jobTitle: user.jobTitle,
        roles: typeof user.roles === 'string' ? JSON.parse(user.roles || '[]') : user.roles,
        availability: currentAvailability,
        matchingOptIn: user.matchingOptIn,
        visibilitySettings: parsedVisibility,
        skills: (user.skills || []).map((us: any) => ({
          id: us.id,
          skillId: us.skillId,
          name: us.skill?.name || us.skillId,
          category: us.skill?.category || 'General',
          level: parseInt(us.level, 10) || 3,
          yearsOfExperience: 2,
          origin: us.origin || 'manual',
        })),
        experiences: (user.experience || []).map((e: any) => this.formatExperience(e)),
        educations: (user.education || []).map((e: any) => this.formatEducation(e)),
        certifications: (user.certifications || []).map((c: any) => this.formatCertification(c)),
      },
      completeness,
    };
  }

  /**
   * PATCH /users/me
   */
  async updateMe(userId: string, data: any) {
    let existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      await this.getMe(userId);
      existing = await prisma.user.findUnique({ where: { id: userId } });
    }

    const cleanData: Record<string, any> = {};
    const allowedFields = [
      'name',
      'displayName',
      'username',
      'avatarUrl',
      'headline',
      'bio',
      'pronouns',
      'city',
      'region',
      'country',
      'workMode',
      'intendedUse',
      'companyName',
      'workEmailDomain',
      'jobTitle',
      'githubUsername',
      'linkedinUrl',
      'portfolioUrl',
    ];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        cleanData[key] = data[key];
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...cleanData,
        updatedAt: new Date(),
      },
    });

    await writeAudit(userId, 'UPDATE_PROFILE', 'User', userId, undefined, { fields: Object.keys(cleanData) });

    try {
      await prisma.aiCandidateProfile.upsert({
        where: { userId },
        create: {
          userId,
          name: cleanData.name || existing?.name || 'Engineer',
          headline: cleanData.headline || existing?.headline || 'Software Engineer',
        },
        update: {
          ...(cleanData.name ? { name: cleanData.name } : {}),
          ...(cleanData.headline ? { headline: cleanData.headline } : {}),
        },
      });
    } catch {}

    return this.getMe(userId);
  }

  /**
   * POST /users/me/prefill-demo
   * Prefills complete, impressive profile data for demo & testing (100% readiness score)
   */
  async prefillDemoProfile(userId: string) {
    let existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      await this.getMe(userId);
      existing = await prisma.user.findUnique({ where: { id: userId } });
    }

    const userName = existing?.name && existing.name !== 'User' && existing.name !== 'Candidate Engineer'
      ? existing.name
      : 'Maya Chen';
    const displayName = existing?.displayName || userName.split(' ')[0] || 'Maya';

    // 1. Update User basic info
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: userName,
        displayName,
        headline: 'Staff Distributed Systems Architect & High-Throughput Infrastructure Lead',
        bio: 'Specializing in event-driven microservices, real-time streaming architectures, fault-tolerant consensus systems, and high-performance database indexing. 6+ years building cloud-native infrastructure powering millions of events per second with 99.99% uptime.',
        pronouns: 'she/her',
        city: 'San Francisco',
        region: 'CA',
        country: 'United States',
        workMode: 'remote',
        companyName: 'Northstar Labs',
        jobTitle: 'Staff Distributed Systems Architect',
        githubUsername: 'mayachen-systems',
        linkedinUrl: 'https://linkedin.com/in/maya-chen-engineer',
        portfolioUrl: 'https://mayachen.engineering',
        intendedUse: 'seeking_work',
        matchingOptIn: true,
        updatedAt: new Date(),
      },
    });

    // 2. Clear existing entries to avoid duplicates
    await prisma.userSkill.deleteMany({ where: { userId } });
    await prisma.workExperience.deleteMany({ where: { userId } });
    await prisma.education.deleteMany({ where: { userId } });
    await prisma.certification.deleteMany({ where: { userId } });
    await prisma.availability.deleteMany({ where: { userId } });

    // 3. Ensure canonical skills exist and add UserSkills
    const demoSkills = [
      { name: 'React', category: 'Frontend', level: '4' },
      { name: 'TypeScript', category: 'Language', level: '4' },
      { name: 'Node.js', category: 'Backend', level: '4' },
      { name: 'Distributed Systems', category: 'Architecture', level: '4' },
      { name: 'PostgreSQL', category: 'Database', level: '4' },
      { name: 'Kubernetes', category: 'DevOps', level: '3' },
      { name: 'GraphQL', category: 'API', level: '3' },
      { name: 'Prisma', category: 'Database', level: '4' },
    ];

    for (const sk of demoSkills) {
      let canonical = await prisma.skill.findFirst({
        where: { name: { equals: sk.name } },
      });
      if (!canonical) {
        canonical = await prisma.skill.create({
          data: {
            name: sk.name,
            category: sk.category,
            status: 'approved',
          },
        });
      }
      await prisma.userSkill.create({
        data: {
          userId,
          skillId: canonical.id,
          level: sk.level,
          origin: 'manual',
        },
      });
    }

    // 4. Work Experience
    await prisma.workExperience.createMany({
      data: [
        {
          userId,
          company: 'Northstar Distributed Labs',
          role: 'Staff Infrastructure Architect',
          origin: 'manual',
          detailsJson: JSON.stringify({
            location: 'San Francisco, CA (Remote)',
            startDate: '2023-01',
            endDate: null,
            current: true,
            description: 'Architected sub-50ms event-driven pipelines processing 12M+ records daily. Spearheaded zero-downtime database schema migration pipelines with automated shadow traffic evaluation.',
          }),
        },
        {
          userId,
          company: 'Vercel & Next.js Ecosystem',
          role: 'Senior Backend Engineer',
          origin: 'manual',
          detailsJson: JSON.stringify({
            location: 'Remote',
            startDate: '2021-03',
            endDate: '2022-12',
            current: false,
            description: 'Built edge runtime caching, global KV stores, and multi-region deployment automation. Optimized API latency by 42% across serverless container clusters.',
          }),
        },
        {
          userId,
          company: 'Stripe Core Infrastructure',
          role: 'Systems Engineer',
          origin: 'manual',
          detailsJson: JSON.stringify({
            location: 'Seattle, WA',
            startDate: '2019-06',
            endDate: '2021-02',
            current: false,
            description: 'Maintained high-throughput ledger transactions with strict idempotency and cryptographic audit trails.',
          }),
        },
      ],
    });

    // 5. Education
    await prisma.education.create({
      data: {
        userId,
        institution: 'Stanford University',
        degree: 'Bachelor of Science (B.S.) in Computer Science',
        origin: 'manual',
        detailsJson: JSON.stringify({
          fieldOfStudy: 'Distributed Systems & Cloud Architecture',
          startDate: '2015-09',
          endDate: '2019-06',
          grade: '3.9 GPA',
        }),
      },
    });

    // 6. Certifications
    await prisma.certification.createMany({
      data: [
        {
          userId,
          name: 'AWS Certified Solutions Architect - Professional',
          origin: 'manual',
          detailsJson: JSON.stringify({
            issuer: 'Amazon Web Services',
            issueDate: '2023-04',
            credentialId: 'AWS-PSA-994821',
            credentialUrl: 'https://aws.amazon.com/verification',
          }),
        },
        {
          userId,
          name: 'Certified Kubernetes Administrator (CKA)',
          origin: 'manual',
          detailsJson: JSON.stringify({
            issuer: 'Linux Foundation / Cloud Native Computing Foundation',
            issueDate: '2022-08',
            credentialId: 'CKA-8839201',
            credentialUrl: 'https://cncf.io/certification',
          }),
        },
      ],
    });

    // 7. Availability
    await prisma.availability.create({
      data: {
        userId,
        status: 'immediate',
      },
    });

    // 8. Update AI Candidate Profile for Member 2 matching
    try {
      await prisma.aiCandidateProfile.upsert({
        where: { userId },
        create: {
          userId,
          name: userName,
          headline: 'Staff Distributed Systems Architect',
          hoursPerWeek: 40,
          recruiterVisible: true,
          matchingOptIn: true,
        },
        update: {
          name: userName,
          headline: 'Staff Distributed Systems Architect',
          hoursPerWeek: 40,
          recruiterVisible: true,
          matchingOptIn: true,
        },
      });
    } catch {}

    return this.getMe(userId);
  }

  /**
   * GET /users/:id
   */
  async getPublicProfile(targetUserId: string, viewer?: { id: string; roles: string[] }) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        experience: true,
        education: true,
        certifications: true,
        availabilities: true,
      },
    });

    if (!user || user.deactivated) {
      throw { status: 404, message: 'Profile not found or deactivated.' };
    }

    const projected = projectForViewer(user, viewer);
    return {
      user: {
        ...projected,
        availability: canView(viewer, user.id, 'availability', user.visibilitySettings)
          ? user.availabilities?.[0]?.status || 'immediate'
          : undefined,
        experiences: projected.experience ? (projected.experience as any[]).map((e: any) => this.formatExperience(e)) : undefined,
        educations: projected.education ? (projected.education as any[]).map((e: any) => this.formatEducation(e)) : undefined,
        certifications: projected.certifications ? (projected.certifications as any[]).map((c: any) => this.formatCertification(c)) : undefined,
      },
    };
  }

  /**
   * PUT /users/me/availability
   */
  async updateAvailability(userId: string, data: { status: string; hoursPerWeek?: number; desiredRoles?: string[]; minHourlyRate?: number }) {
    await prisma.availability.deleteMany({ where: { userId } });
    await prisma.availability.create({
      data: {
        userId,
        status: data.status,
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    try {
      await prisma.aiCandidateProfile.upsert({
        where: { userId },
        create: {
          userId,
          name: user?.name || 'Engineer',
          hoursPerWeek: data.hoursPerWeek || 40,
        },
        update: {
          hoursPerWeek: data.hoursPerWeek || 40,
        },
      });
    } catch {}

    return { success: true, availability: data.status };
  }

  /**
   * PUT /users/me/visibility
   */
  async updateVisibility(userId: string, data: any) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    let currentSettings: any = {};
    if (existing?.visibilitySettings) {
      try {
        currentSettings = JSON.parse(existing.visibilitySettings);
      } catch {}
    }

    const merged = {
      ...currentSettings,
      ...data,
    };

    const updateData: any = {
      visibilitySettings: JSON.stringify(merged),
    };
    if (data.matchingOptIn !== undefined) {
      updateData.matchingOptIn = data.matchingOptIn;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    try {
      await prisma.aiCandidateProfile.upsert({
        where: { userId },
        create: {
          userId,
          name: existing?.name || 'Engineer',
          recruiterVisible: merged.contact !== false,
          matchingOptIn: data.matchingOptIn ?? true,
        },
        update: {
          recruiterVisible: merged.contact !== false,
          matchingOptIn: data.matchingOptIn,
        },
      });
    } catch {}

    return { success: true, visibilitySettings: merged };
  }

  /**
   * POST /users/me/skills
   */
  async addSkill(userId: string, data: { skillId: string; level?: number; yearsOfExperience?: number; evidenceLinks?: string[] }) {
    const skill = await prisma.skill.findUnique({ where: { id: data.skillId } });
    if (!skill) {
      throw { status: 404, message: 'Skill not found in taxonomy.' };
    }

    const existing = await prisma.userSkill.findFirst({
      where: {
        userId,
        skillId: data.skillId,
      },
    });

    let userSkill;
    if (existing) {
      userSkill = await prisma.userSkill.update({
        where: { id: existing.id },
        data: {
          level: String(data.level || 3),
          origin: 'manual',
        },
        include: { skill: true },
      });
    } else {
      userSkill = await prisma.userSkill.create({
        data: {
          userId,
          skillId: data.skillId,
          level: String(data.level || 3),
          origin: 'manual',
        },
        include: { skill: true },
      });
    }

    return {
      id: userSkill.id,
      skillId: userSkill.skillId,
      name: userSkill.skill?.name,
      category: userSkill.skill?.category,
      level: parseInt(userSkill.level, 10) || 3,
      origin: userSkill.origin,
    };
  }

  /**
   * DELETE /users/me/skills/:id
   */
  async removeSkill(userId: string, userSkillIdOrSkillId: string) {
    await prisma.userSkill.deleteMany({
      where: {
        userId,
        OR: [{ id: userSkillIdOrSkillId }, { skillId: userSkillIdOrSkillId }],
      },
    });
    return { success: true };
  }

  /**
   * POST /users/me/education
   */
  async addEducation(userId: string, data: any) {
    const edu = await prisma.education.create({
      data: {
        userId,
        institution: data.institution,
        degree: data.degree,
        detailsJson: JSON.stringify({
          fieldOfStudy: data.fieldOfStudy,
          startDate: data.startDate,
          endDate: data.endDate,
          current: data.current || false,
        }),
      },
    });
    return this.formatEducation(edu);
  }

  /**
   * DELETE /users/me/education/:id
   */
  async removeEducation(userId: string, id: string) {
    await prisma.education.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }

  /**
   * POST /users/me/experience
   */
  async addExperience(userId: string, data: any) {
    const exp = await prisma.workExperience.create({
      data: {
        userId,
        company: data.company,
        role: data.title || data.role,
        detailsJson: JSON.stringify({
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          current: data.current || false,
          description: data.description,
        }),
      },
    });
    return this.formatExperience(exp);
  }

  /**
   * DELETE /users/me/experience/:id
   */
  async removeExperience(userId: string, id: string) {
    await prisma.workExperience.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }

  /**
   * POST /users/me/certifications
   */
  async addCertification(userId: string, data: any) {
    const cert = await prisma.certification.create({
      data: {
        userId,
        name: data.name,
        detailsJson: JSON.stringify({
          issuer: data.issuer,
          issueDate: data.issueDate,
          expiryDate: data.expiryDate,
          credentialId: data.credentialId,
          credentialUrl: data.credentialUrl,
        }),
      },
    });
    return this.formatCertification(cert);
  }

  /**
   * DELETE /users/me/certifications/:id
   */
  async removeCertification(userId: string, id: string) {
    await prisma.certification.deleteMany({
      where: { id, userId },
    });
    return { success: true };
  }

  /**
   * PUT /users/me/learning-goals
   */
  async updateLearningGoals(userId: string, goals: string[]) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        intendedUse: 'learning',
      },
    });
    return { success: true, goals };
  }

  /**
   * GET /users/me/export - GDPR Data Takeout
   */
  async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
        education: true,
        experience: true,
        certifications: true,
        resumes: true,
        projectsOwned: true,
        memberships: { include: { project: true } },
        contributions: true,
        consentRecords: true,
        deletionRequests: true,
      },
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const exportPayload = {
      version: '1.0',
      system: 'SkillForge Platform',
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        displayName: user.displayName,
        username: user.username,
        headline: user.headline,
        bio: user.bio,
        workMode: user.workMode,
        visibilitySettings: user.visibilitySettings,
        matchingOptIn: user.matchingOptIn,
        createdAt: user.createdAt,
      },
      skills: user.skills.map((s) => ({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level,
        origin: s.origin,
      })),
      education: user.education.map((e) => this.formatEducation(e)),
      experience: user.experience.map((e) => this.formatExperience(e)),
      certifications: user.certifications.map((c) => this.formatCertification(c)),
      resumes: user.resumes.map((r) => ({ id: r.id, fileName: r.fileName, status: r.status, createdAt: r.createdAt })),
      projects: {
        owned: user.projectsOwned.map((p) => ({ id: p.id, title: p.title, status: p.status, createdAt: p.createdAt })),
        memberships: user.memberships.map((m) => ({
          projectId: m.projectId,
          projectTitle: m.project?.title,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
        })),
      },
      contributionsCount: user.contributions.length,
      consents: user.consentRecords.map((c) => ({ type: c.type, version: c.version, acceptedAt: c.acceptedAt })),
    };

    const fileKey = `exports/data-export-${userId}-${Date.now()}.json`;
    await storageProvider.upload(fileKey, Buffer.from(JSON.stringify(exportPayload, null, 2)), 'application/json');
    const downloadUrl = await storageProvider.getSignedUrl(fileKey, 1440); // 24 hours

    await prisma.dataExportJob.create({
      data: {
        userId,
        status: 'completed',
        fileKey,
        downloadUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await writeAudit(userId, 'USER_DATA_EXPORTED', 'user', userId, 'GDPR Data Takeout Request', {
      fileKey,
    });

    return {
      success: true,
      downloadUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      data: exportPayload,
    };
  }

  /**
   * POST /users/me/deletion - 14-Day Grace Period Account Deletion Request
   */
  async requestAccountDeletion(userId: string, reason?: string) {
    const scheduledFor = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const deletion = await prisma.deletionRequest.create({
      data: {
        userId,
        scheduledFor,
        reason: reason || 'User requested account closure',
        status: 'pending',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'pending_deletion',
      },
    });

    await writeAudit(userId, 'ACCOUNT_DELETION_REQUESTED', 'user', userId, reason || 'User initiated account deletion', {
      scheduledFor: scheduledFor.toISOString(),
      gracePeriodDays: 14,
    });

    return {
      success: true,
      message: 'Account deletion scheduled. You have a 14-day grace period to cancel.',
      scheduledFor: scheduledFor.toISOString(),
      gracePeriodDays: 14,
      deletionId: deletion.id,
    };
  }

  /**
   * DELETE /users/me/deletion - Cancel Scheduled Account Deletion
   */
  async cancelAccountDeletion(userId: string) {
    const active = await prisma.deletionRequest.findFirst({
      where: { userId, status: 'pending' },
      orderBy: { requestedAt: 'desc' },
    });

    if (active) {
      await prisma.deletionRequest.update({
        where: { id: active.id },
        data: { status: 'cancelled' },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'active',
      },
    });

    await writeAudit(userId, 'ACCOUNT_DELETION_CANCELLED', 'user', userId, 'User restored account during grace period');

    return {
      success: true,
      message: 'Account deletion cancelled. Your profile and access remain fully active.',
    };
  }

  /**
   * GET /users/me/consents - Retrieve Consent History
   */
  async getConsents(userId: string) {
    let consents = await prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { acceptedAt: 'desc' },
    });

    if (consents.length === 0) {
      await prisma.consentRecord.createMany({
        data: [
          { userId, type: 'terms_of_service', version: '2026.1', ip: '127.0.0.1' },
          { userId, type: 'privacy_policy', version: '2026.1', ip: '127.0.0.1' },
          { userId, type: 'recruiter_discovery', version: '2026.1', ip: '127.0.0.1' },
          { userId, type: 'ai_job_matching', version: '2026.1', ip: '127.0.0.1' },
        ],
      });
      consents = await prisma.consentRecord.findMany({
        where: { userId },
        orderBy: { acceptedAt: 'desc' },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { matchingOptIn: true, visibilitySettings: true, status: true },
    });

    const activeDeletion = await prisma.deletionRequest.findFirst({
      where: { userId, status: 'pending' },
      orderBy: { requestedAt: 'desc' },
    });

    return {
      consents,
      matchingOptIn: user?.matchingOptIn ?? true,
      visibilitySettings: user?.visibilitySettings ? JSON.parse(user.visibilitySettings) : {},
      accountStatus: user?.status || 'active',
      pendingDeletion: activeDeletion
        ? {
            scheduledFor: activeDeletion.scheduledFor,
            requestedAt: activeDeletion.requestedAt,
          }
        : null,
    };
  }

  /**
   * POST /users/me/consents - Record New Consent Decision
   */
  async recordConsent(userId: string, data: { type: string; version?: string; accepted: boolean }) {
    await prisma.consentRecord.create({
      data: {
        userId,
        type: data.type,
        version: data.version || '2026.1',
        ip: '127.0.0.1',
      },
    });

    if (data.type === 'ai_job_matching') {
      await prisma.user.update({
        where: { id: userId },
        data: { matchingOptIn: data.accepted },
      });
    }

    await writeAudit(
      userId,
      'CONSENT_UPDATED',
      'user',
      userId,
      `Consent ${data.type} set to ${data.accepted ? 'accepted' : 'revoked'}`
    );

    return { success: true };
  }
}
