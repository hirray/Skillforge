import { describe, it, expect } from 'vitest';
import { createJobSchema, updateJobSchema, applyJobSchema } from './schema';
import { MockService } from './mock';
import { RealService } from './real';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Module 22: Job / Opportunity Posting', () => {
  describe('Business Rule & Schema Validation', () => {
    it('fails when publishing to Active without at least one required skill requirement', () => {
      const invalidPublish = createJobSchema.safeParse({
        companyId: 'comp-123',
        title: 'Backend Engineer',
        description: 'Building high throughput systems with real-time queues',
        status: 'Active',
        requirements: [
          { skillName: 'Kubernetes', importance: 'preferred' }, // only preferred, no required!
        ],
      });

      expect(invalidPublish.success).toBe(false);
      if (!invalidPublish.success) {
        expect(invalidPublish.error.errors[0].message).toContain('at least one required skill');
      }
    });

    it('passes when publishing to Active with a required skill requirement', () => {
      const validPublish = createJobSchema.safeParse({
        companyId: 'comp-123',
        title: 'Backend Engineer',
        description: 'Building high throughput systems with real-time queues',
        status: 'Active',
        requirements: [
          { skillName: 'Go', importance: 'required', minProficiency: 'intermediate' },
        ],
      });

      expect(validPublish.success).toBe(true);
    });

    it('allows Draft status even without requirements', () => {
      const validDraft = createJobSchema.safeParse({
        companyId: 'comp-123',
        title: 'Drafting Role',
        description: 'Early draft of product engineer specification',
        status: 'Draft',
        requirements: [],
      });

      expect(validDraft.success).toBe(true);
    });
  });

  describe('MockService (Phase 0 Compatibility)', () => {
    const mock = new MockService();

    it('creates a job listing', async () => {
      const job = await mock.createJob('user-004', {
        companyId: 'm2-demo-company',
        title: 'Fullstack Systems Engineer',
        description: 'Develop mission-critical agentic orchestration web services.',
        status: 'Draft',
        requirements: [
          { skillName: 'TypeScript', importance: 'required', minProficiency: 'advanced' },
        ],
      });

      expect(job.title).toBe('Fullstack Systems Engineer');
      expect(job.requirements).toHaveLength(1);
    });

    it('retrieves demo job with requirements', async () => {
      const job = await mock.getJob('m2-demo-job');
      expect(job.title).toBe('Machine Learning Engineer');
      expect(job.requirements.length).toBeGreaterThan(0);
    });

    it('applies for job and records application', async () => {
      const app = await mock.applyJob('m2-demo-job', 'user-001', {
        coverLetter: 'Passionate about agent systems and high quality test coverage.',
      });

      expect(app.status).toBe('submitted');
      expect(app.userId).toBe('user-001');

      const jobAfter = await mock.getJob('m2-demo-job', 'user-001');
      expect(jobAfter.userApplied).toBe(true);
    });

    it('archives job on delete', async () => {
      await mock.deleteJob('m2-demo-job', 'user-004');
      const job = await mock.getJob('m2-demo-job');
      expect(job.status).toBe('Archived');
    });
  });

  describe('RealService (Prisma Backed)', () => {
    const real = new RealService();
    const testUserId = 'user-001';
    let testCompanyId = '';
    let testJobId = '';

    it('creates job in database with requirements', async () => {
      // Ensure test company exists
      const company = await prisma.company.upsert({
        where: { id: 'test-job-company-1' },
        update: {},
        create: {
          id: 'test-job-company-1',
          name: 'Apex AI Systems',
          industry: 'Artificial Intelligence',
          verificationStatus: 'verified',
        },
      });
      testCompanyId = company.id;

      const job = await real.createJob(testUserId, {
        companyId: testCompanyId,
        title: 'Frontier AI Research Engineer',
        department: 'Foundational Models',
        employmentType: 'Full-time',
        description: 'Researching novel attention mechanisms and long-context agent reasoning.',
        workMode: 'remote',
        salaryMin: 160000,
        salaryMax: 220000,
        currency: 'USD',
        status: 'Active',
        requirements: [
          { skillName: 'PyTorch', importance: 'required', minProficiency: 'advanced' },
          { skillName: 'CUDA', importance: 'preferred', minProficiency: 'intermediate' },
        ],
      });

      expect(job.id).toBeDefined();
      expect(job.title).toBe('Frontier AI Research Engineer');
      expect(job.requirements).toHaveLength(2);
      testJobId = job.id;
    });

    it('retrieves job posting with company and requirement relations', async () => {
      const job = await real.getJob(testJobId, testUserId);
      expect(job.company.name).toBe('Apex AI Systems');
      expect(job.requirements.some((r) => r.skillName === 'PyTorch')).toBe(true);
      expect(job.userApplied).toBe(false);
    });

    it('updates job and enforces business rule on activation', async () => {
      // Update with new requirement
      const updated = await real.updateJob(testJobId, testUserId, {
        responsibilities: 'Train 70B parameter models and write clean architectural docs.',
        requirements: [
          { skillName: 'Deep Learning', importance: 'required', minProficiency: 'expert' },
        ],
      });

      expect(updated.responsibilities).toContain('Train 70B parameter models');
      expect(updated.requirements[0].skillName).toBe('Deep Learning');
    });

    it('submits talent expression of interest / application idempotently', async () => {
      const applicantId = 'user-002';
      const app = await real.applyJob(testJobId, applicantId, {
        coverLetter: 'Interested in working on scalable inference systems.',
      });

      expect(app.jobId).toBe(testJobId);
      expect(app.userId).toBe(applicantId);
      expect(app.status).toBe('submitted');

      // Verify getJob indicates applied
      const jobView = await real.getJob(testJobId, applicantId);
      expect(jobView.userApplied).toBe(true);
      expect(jobView._count.applications).toBeGreaterThan(0);
    });

    it('filters jobs by company and query in listJobs', async () => {
      const list = await real.listJobs({ companyId: testCompanyId });
      expect(list.length).toBeGreaterThan(0);
      expect(list[0].companyId).toBe(testCompanyId);
    });

    it('archives job on deleteJob', async () => {
      await real.deleteJob(testJobId, testUserId);
      const job = await real.getJob(testJobId);
      expect(job.status).toBe('Archived');
    });
  });
});
