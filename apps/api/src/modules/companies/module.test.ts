import { describe, it, expect } from 'vitest';
import { createCompanySchema, addRecruiterSchema } from './schema';
import { MockService } from './mock';
import { RealService } from './real';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Module 21: Company & Recruiter Accounts', () => {
  describe('Schema Validation', () => {
    it('validates company creation input', () => {
      const valid = createCompanySchema.safeParse({
        name: 'Acme Robotics Corp',
        industry: 'Robotics & Hardware',
        sizeBand: '51-200',
        website: 'https://acmerobotics.example.com',
      });
      expect(valid.success).toBe(true);

      const invalid = createCompanySchema.safeParse({
        name: '',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates recruiter invite schema', () => {
      const valid = addRecruiterSchema.safeParse({
        email: 'recruiter.sarah@acme.example.com',
        role: 'recruiter_member',
      });
      expect(valid.success).toBe(true);

      const invalidEmail = addRecruiterSchema.safeParse({
        email: 'not-an-email',
      });
      expect(invalidEmail.success).toBe(false);
    });
  });

  describe('MockService (Phase 0 Compatibility)', () => {
    const mock = new MockService();

    it('creates company and sets creator as recruiter_admin', async () => {
      const company = await mock.createCompany('user-004', {
        name: 'Mock Venture Labs',
        industry: 'AI Research',
        sizeBand: '11-50',
      });
      expect(company.name).toBe('Mock Venture Labs');
      expect(company.recruiters[0].role).toBe('recruiter_admin');
    });

    it('retrieves company with recruiters', async () => {
      const company = await mock.getCompany('m2-demo-company');
      expect(company.name).toContain('Northstar Labs');
      expect(company.recruiters.length).toBeGreaterThan(0);
    });

    it('allows recruiter_admin to update company', async () => {
      const updated = await mock.updateCompany('m2-demo-company', 'recruiter-001', {
        overview: 'Updated company mission statement',
      });
      expect(updated.overview).toBe('Updated company mission statement');
    });

    it('blocks non-admin from updating company', async () => {
      await expect(
        mock.updateCompany('m2-demo-company', 'unauthorized-user', {
          overview: 'Malicious update',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('invites a recruiter member', async () => {
      const recruiter = await mock.addRecruiter('m2-demo-company', 'recruiter-001', {
        email: 'newrecruiter@example.com',
        role: 'recruiter_member',
      });
      expect(recruiter.user.email).toBe('newrecruiter@example.com');
      expect(recruiter.role).toBe('recruiter_member');
    });
  });

  describe('RealService (Prisma Backed)', () => {
    const real = new RealService();
    const adminUser = 'user-004';
    let testCompanyId = '';

    it('creates company in database and sets creator as recruiter_admin', async () => {
      const company = await real.createCompany(adminUser, {
        name: 'Horizon Deeptech Labs',
        industry: 'Autonomous Systems',
        sizeBand: '11-50',
        website: 'https://horizon.example.com',
        hiringFocus: 'C++, Rust, ROS2, SLAM',
      });

      expect(company.id).toBeDefined();
      expect(company.name).toBe('Horizon Deeptech Labs');
      expect(company.recruiters).toHaveLength(1);
      expect(company.recruiters[0].userId).toBe(adminUser);
      expect(company.recruiters[0].role).toBe('recruiter_admin');

      testCompanyId = company.id;
    });

    it('fetches company details with recruiters', async () => {
      const company = await real.getCompany(testCompanyId);
      expect(company.name).toBe('Horizon Deeptech Labs');
      expect(company.recruiters[0].role).toBe('recruiter_admin');
    });

    it('allows recruiter_admin to update company details', async () => {
      const updated = await real.updateCompany(testCompanyId, adminUser, {
        overview: 'Pioneering frontier robotics and physical AI agents.',
        locations: 'Boston, MA & Zurich, Switzerland',
      });
      expect(updated.overview).toContain('physical AI agents');
      expect(updated.locations).toContain('Boston');
    });

    it('forbids unauthorized users from updating company', async () => {
      await expect(
        real.updateCompany(testCompanyId, 'random-user-id', {
          name: 'Hacked Company',
        })
      ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    });

    it('adds a new recruiter member and supports context listing', async () => {
      const newRecruiter = await real.addRecruiter(testCompanyId, adminUser, {
        email: 'talent.scout@horizon.example.com',
        role: 'recruiter_member',
      });

      expect(newRecruiter.role).toBe('recruiter_member');
      expect(newRecruiter.user.email).toBe('talent.scout@horizon.example.com');

      // Verify user companies listing
      const adminCompanies = await real.listUserCompanies(adminUser);
      expect(adminCompanies.some((c) => c.id === testCompanyId)).toBe(true);
    });
  });
});
