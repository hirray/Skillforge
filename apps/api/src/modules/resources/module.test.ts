import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// @ts-ignore
import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Resources Module (Area 12)', () => {
  const ownerId = 'user-owner-res';
  const memberId = 'user-member-res';
  const otherMemberId = 'user-other-res';
  const nonMemberId = 'user-stranger-res';
  let projectId: string;

  beforeAll(async () => {
    // Create users if not exist
    for (const uid of [ownerId, memberId, otherMemberId, nonMemberId]) {
      await prisma.user.upsert({
        where: { id: uid },
        update: {},
        create: { id: uid, email: `${uid}@skillforge.io`, roles: 'user' }
      });
    }

    // Create test project
    const proj = await prisma.project.create({
      data: {
        title: 'Resources Test Project',
        ownerId,
        status: 'Active',
        visibility: 'Public',
        stage: 'Execution',
        minTeamSize: 1,
        maxTeamSize: 5,
        joinMode: 'both',
        memberApprovalMode: 'owner'
      }
    });
    projectId = proj.id;

    // Add active members
    await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberId,
        role: 'Designer',
        status: 'active'
      }
    });

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: otherMemberId,
        role: 'Developer',
        status: 'active'
      }
    });
  });

  afterAll(async () => {
    await prisma.projectResource.deleteMany({ where: { projectId } });
    await prisma.projectMember.deleteMany({ where: { projectId } });
    await prisma.project.deleteMany({ where: { id: projectId } });
  });

  describe('1. Authorization & Membership Rules', () => {
    it('should reject unauthenticated requests (401)', async () => {
      const res = await request(app).get(`/api/v1/projects/${projectId}/resources`);
      expect(res.status).toBe(401);
    });

    it('should reject non-project members (403)', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/resources`)
        .set('Authorization', `Bearer ${nonMemberId}`);
      expect(res.status).toBe(403);
    });

    it('should allow active members and project owner to list resources', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/resources`)
        .set('Authorization', `Bearer ${memberId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('2. External Links Creation & Validation', () => {
    it('should create an external link resource with category and metadata', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/resources/links`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({
          title: 'Design System Figma Library',
          url: 'https://www.figma.com/file/sample123/design-system',
          category: 'Design'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Design System Figma Library');
      expect(res.body.data.type).toBe('link');
      expect(res.body.data.category).toBe('Design');
      expect(res.body.data.url).toBe('https://www.figma.com/file/sample123/design-system');
      expect(res.body.data.addedBy).toBe(memberId);
    });

    it('should reject malformed or non-URL link strings with 400 validation error', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/resources/links`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({
          title: 'Invalid Link Test',
          url: 'not-a-valid-url-format',
          category: 'Docs'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('3. Platform File Uploads & Size Limits', () => {
    let uploadedFileResourceId: string;

    it('should upload a valid file under 25MB and support signed download URL', async () => {
      const sampleContent = Buffer.from('SkillForge Project Specs and Blueprint Document Content');
      const base64Data = sampleContent.toString('base64');

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/resources/files`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({
          title: 'Architecture Blueprint PDF',
          fileName: 'architecture_blueprint.pdf',
          dataBase64: base64Data,
          mimeType: 'application/pdf',
          category: 'Docs'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Architecture Blueprint PDF');
      expect(res.body.data.type).toBe('file');
      expect(res.body.data.fileKey).toBeDefined();
      expect(res.body.data.fileName).toBe('architecture_blueprint.pdf');
      expect(res.body.data.fileSize).toBe(sampleContent.length);
      uploadedFileResourceId = res.body.data.id;

      // Verify download URL endpoint
      const dlRes = await request(app)
        .get(`/api/v1/projects/${projectId}/resources/${uploadedFileResourceId}/download`)
        .set('Authorization', `Bearer ${memberId}`);

      expect(dlRes.status).toBe(200);
      expect(dlRes.body.data.url).toBeDefined();
      expect(dlRes.body.data.fileName).toBe('architecture_blueprint.pdf');
    });

    it('should reject file upload exceeding 25MB limit with 400 error and leave no partial record', async () => {
      // 26MB buffer (simulated size via byte length check or schema)
      const hugeBuffer = Buffer.alloc(26 * 1024 * 1024); // 26MB
      const hugeBase64 = hugeBuffer.toString('base64');

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/resources/files`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({
          title: 'Huge Dataset File',
          fileName: 'huge_dataset.zip',
          dataBase64: hugeBase64,
          mimeType: 'application/zip',
          category: 'Dataset'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('FILE_TOO_LARGE');

      // Verify no record with that title exists in DB
      const checkDb = await prisma.projectResource.findFirst({
        where: { projectId, title: 'Huge Dataset File' }
      });
      expect(checkDb).toBeNull();
    });
  });

  describe('4. Deletion Permissions & Former Member Attribution', () => {
    let memberResourceId: string;

    beforeAll(async () => {
      const res = await prisma.projectResource.create({
        data: {
          projectId,
          title: 'Member Created Resource',
          type: 'link',
          category: 'Docs',
          url: 'https://docs.skillforge.io',
          addedBy: memberId
        }
      });
      memberResourceId = res.id;
    });

    it('should reject deletion attempt by another non-owner member (403)', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}/resources/${memberResourceId}`)
        .set('Authorization', `Bearer ${otherMemberId}`);

      expect(res.status).toBe(403);
    });

    it('should allow resource creator or project owner to delete resource', async () => {
      // Delete by owner
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}/resources/${memberResourceId}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);
    });

    it('should show "Former member" attribution for resources added by removed members', async () => {
      // Create resource by otherMember
      const res = await prisma.projectResource.create({
        data: {
          projectId,
          title: 'Legacy API Specs',
          type: 'link',
          category: 'Repository',
          url: 'https://github.com/skillforge/specs',
          addedBy: otherMemberId
        }
      });

      // Remove otherMember from project
      await prisma.projectMember.updateMany({
        where: { projectId, userId: otherMemberId },
        data: { status: 'removed', leftAt: new Date() }
      });

      // List resources
      const listRes = await request(app)
        .get(`/api/v1/projects/${projectId}/resources`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(listRes.status).toBe(200);
      const target = listRes.body.data.find((r: any) => r.id === res.id);
      expect(target).toBeDefined();
      expect(target.isFormerMember).toBe(true);
      expect(target.uploaderName).toBe('Former member');
    });
  });
});
