import { describe, it, expect, beforeAll, afterAll } from 'vitest';
// @ts-ignore
import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import { eventBus } from '../../core/eventBus';
import { DomainEvent } from '@skillforge/contract';

const prisma = new PrismaClient();

describe('Milestones Module (Area 11)', () => {
  const ownerId = 'user-owner-ms';
  const memberId = 'user-member-ms';
  const nonMemberId = 'user-stranger-ms';
  let projectId: string;

  beforeAll(async () => {
    // Create users if not exist
    await prisma.user.upsert({
      where: { id: ownerId },
      update: {},
      create: { id: ownerId, email: 'owner@skillforge.io', roles: 'user' }
    });
    await prisma.user.upsert({
      where: { id: memberId },
      update: {},
      create: { id: memberId, email: 'member@skillforge.io', roles: 'user' }
    });
    await prisma.user.upsert({
      where: { id: nonMemberId },
      update: {},
      create: { id: nonMemberId, email: 'stranger@skillforge.io', roles: 'user' }
    });

    // Create test project
    const proj = await prisma.project.create({
      data: {
        title: 'Milestones Test Project',
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

    // Add active member
    await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberId,
        role: 'Developer',
        status: 'active'
      }
    });
  });

  afterAll(async () => {
    await prisma.taskHistory.deleteMany({ where: { task: { projectId } } });
    await prisma.task.deleteMany({ where: { projectId } });
    await prisma.milestoneHistory.deleteMany({ where: { milestone: { projectId } } });
    await prisma.milestone.deleteMany({ where: { projectId } });
    await prisma.projectMember.deleteMany({ where: { projectId } });
    await prisma.project.deleteMany({ where: { id: projectId } });
  });

  describe('1. Authorization & Membership', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get(`/api/v1/projects/${projectId}/milestones`);
      expect(res.status).toBe(401);
    });

    it('should reject non-project members (403)', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${nonMemberId}`);
      expect(res.status).toBe(403);
    });

    it('should allow active members and owner', async () => {
      const res1 = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${ownerId}`);
      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${memberId}`);
      expect(res2.status).toBe(200);
    });
  });

  describe('2. Milestone CRUD & Task Linking', () => {
    let task1Id: string;
    let task2Id: string;
    let task3Id: string;
    let milestoneId: string;

    beforeAll(async () => {
      // Create 3 real tasks
      const t1 = await prisma.task.create({
        data: { projectId, creatorId: ownerId, title: 'Task 1', status: 'To Do', priority: 'Medium' }
      });
      const t2 = await prisma.task.create({
        data: { projectId, creatorId: ownerId, title: 'Task 2', status: 'To Do', priority: 'Medium' }
      });
      const t3 = await prisma.task.create({
        data: { projectId, creatorId: ownerId, title: 'Task 3', status: 'To Do', priority: 'High' }
      });
      task1Id = t1.id;
      task2Id = t2.id;
      task3Id = t3.id;
    });

    it('should create a milestone with linked tasks and initial 0% progress', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({
          title: 'Sprint 1 Alpha Release',
          description: 'Ship initial feature set',
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          linkedTaskIds: [task1Id, task2Id, task3Id]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Sprint 1 Alpha Release');
      expect(res.body.data.progress).toBe(0);
      expect(res.body.data.status).toBe('To Do');
      expect(res.body.data.tasks.length).toBe(3);
      milestoneId = res.body.data.id;
    });

    it('should recalculate progress when a linked task is marked Done', async () => {
      // Complete Task 1 (1 out of 3 = 33%)
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({ status: 'Done' });

      expect(res.status).toBe(200);

      // Check milestone
      const msRes = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(msRes.status).toBe(200);
      expect(msRes.body.data.calculatedProgress).toBe(33);
      expect(msRes.body.data.status).toBe('In Progress');
    });

    it('should auto-complete milestone when all linked tasks reach Done', async () => {
      // Complete Task 2
      await request(app)
        .patch(`/api/v1/projects/${projectId}/tasks/${task2Id}`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({ status: 'Done' });

      // Complete Task 3
      await request(app)
        .patch(`/api/v1/projects/${projectId}/tasks/${task3Id}`)
        .set('Authorization', `Bearer ${memberId}`)
        .send({ status: 'Done' });

      // Check milestone status and progress
      const msRes = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(msRes.status).toBe(200);
      expect(msRes.body.data.calculatedProgress).toBe(100);
      expect(msRes.body.data.status).toBe('Done');
      expect(msRes.body.data.completedAt).toBeDefined();
    });

    it('snapshot rule: unlinking a task after completion does not un-complete the milestone', async () => {
      const res = await request(app)
        .delete(`/api/v1/projects/${projectId}/milestones/${milestoneId}/tasks/${task1Id}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(res.status).toBe(200);

      const msRes = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(msRes.body.data.status).toBe('Done');
    });
  });

  describe('3. Zero Linked Tasks & Manual Completion Rules', () => {
    let emptyMilestoneId: string;

    it('should create an empty milestone (zero tasks)', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({
          title: 'Design Review & Signoff',
          description: 'Executive design signoff'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.progress).toBe(0);
      emptyMilestoneId = res.body.data.id;
    });

    it('should reject marking empty milestone complete directly without rationale', async () => {
      const res = await request(app)
        .patch(`/api/v1/projects/${projectId}/milestones/${emptyMilestoneId}`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ status: 'Done' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('COMPLETION_RULE_VIOLATION');
    });

    it('should reject manual completion if rationale is blank', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${emptyMilestoneId}/complete`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ rationale: '   ' });

      expect(res.status).toBe(400);
    });

    it('should allow manual complete with valid rationale without faking 100% tasks', async () => {
      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${emptyMilestoneId}/complete`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ rationale: 'Stakeholders approved design system in meeting' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Done');
      expect(res.body.data.isManualCompletion).toBe(true);
      expect(res.body.data.completionRationale).toBe('Stakeholders approved design system in meeting');
      expect(res.body.data.completedBy).toBe(ownerId);
      expect(res.body.data.progress).toBe(0); // real task percentage preserved
    });
  });

  describe('4. Edge Cases: One Milestone per Task & Deleted Task', () => {
    it('should enforce one milestone per task when moving between milestones', async () => {
      // Create Milestone A and B
      const msA = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ title: 'Milestone Alpha' });
      const msB = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ title: 'Milestone Beta' });

      // Create a task
      const t = await prisma.task.create({
        data: { projectId, creatorId: ownerId, title: 'Floating Task', status: 'Done' }
      });

      // Link to Milestone A (Progress should be 100%)
      await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${msA.body.data.id}/tasks`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ taskId: t.id });

      const getA1 = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${msA.body.data.id}`)
        .set('Authorization', `Bearer ${ownerId}`);
      expect(getA1.body.data.tasks.length).toBe(1);

      // Relink to Milestone B
      await request(app)
        .post(`/api/v1/projects/${projectId}/milestones/${msB.body.data.id}/tasks`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ taskId: t.id });

      // Check Milestone A has 0 tasks, Milestone B has 1 task
      const getA2 = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${msA.body.data.id}`)
        .set('Authorization', `Bearer ${ownerId}`);
      const getB2 = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${msB.body.data.id}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(getA2.body.data.tasks.length).toBe(0);
      expect(getB2.body.data.tasks.length).toBe(1);
    });

    it('should handle deleted linked task without divide-by-zero or crash', async () => {
      const ms = await request(app)
        .post(`/api/v1/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${ownerId}`)
        .send({ title: 'Delete Task Test' });

      const t = await prisma.task.create({
        data: { projectId, creatorId: ownerId, title: 'Temporary Task', status: 'To Do', milestoneId: ms.body.data.id }
      });

      // Delete task directly via tasks API
      const delRes = await request(app)
        .delete(`/api/v1/projects/${projectId}/tasks/${t.id}`)
        .set('Authorization', `Bearer ${ownerId}`);
      expect(delRes.status).toBe(200);

      // Verify milestone progress recalculates cleanly to 0
      const msRes = await request(app)
        .get(`/api/v1/projects/${projectId}/milestones/${ms.body.data.id}`)
        .set('Authorization', `Bearer ${ownerId}`);

      expect(msRes.status).toBe(200);
      expect(msRes.body.data.progress).toBe(0);
      expect(msRes.body.data.tasks.length).toBe(0);
    });
  });
});
