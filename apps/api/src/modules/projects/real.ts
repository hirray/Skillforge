import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

export class RealService {
  async create(userId: string, data: any) {
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        status: 'Draft',
        title: data.title,
        description: data.description,
        problemStatement: data.problemStatement,
        category: data.category,
        type: data.type,
        outcome: data.outcome,
        coverImage: data.coverImage,
        visibility: data.visibility || 'Public',
        duration: data.duration,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        stage: data.stage || 'idea',
        minTeamSize: data.minTeamSize || 1,
        maxTeamSize: data.maxTeamSize || 5,
        budget: data.budget,
        paid: data.paid || false,
        joinMode: data.joinMode || 'both',
        memberApprovalMode: data.memberApprovalMode || 'owner',
        requirements: {
          create: (data.requirements || []).map((req: any) => ({
            skillName: req.skill || req.skillName,
            level: req.proficiency || req.level || 'intermediate',
            isOptional: req.type === 'preferred' || req.isOptional === true
          }))
        },
        roles: {
          create: (data.roles || []).map((r: any) => ({
            title: r.title,
            openings: Number(r.openings) || 1,
            filled: Number(r.filled) || 0
          }))
        }
      },
      include: {
        requirements: true,
        roles: true
      }
    });

    eventBus.emitEvent(DomainEvent.ProjectCreated, { projectId: project.id, ownerId: userId });
    return { data: this.formatProject(project) };
  }

  private formatProject(project: any) {
    if (!project) return project;
    return {
      ...project,
      requirements: (project.requirements || []).map((req: any) => ({
        ...req,
        skill: req.skillName || req.skill,
        proficiency: req.level || req.proficiency || 'intermediate',
        type: req.isOptional ? 'preferred' : (req.type || 'required')
      }))
    };
  }

  async list(filters: any) {
    const where: any = {};
    if (filters.visibility) where.visibility = filters.visibility;
    if (filters.stage) where.stage = filters.stage;
    if (filters.category) where.category = filters.category;
    
    const projects = await prisma.project.findMany({ where, include: { requirements: true, roles: true } });
    return { data: projects.map(p => this.formatProject(p)) };
  }

  async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { requirements: true, roles: true, members: true }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    return { data: this.formatProject(project) };
  }

  async update(id: string, userId: string, data: any) {
    const existing = await prisma.project.findUnique({ where: { id }, include: { members: true } });
    if (!existing) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (existing.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Forbidden' };

    if (data.maxTeamSize !== undefined && data.maxTeamSize < existing.members.length) {
       throw { status: 422, code: 'VALIDATION_ERROR', message: 'maxTeamSize cannot be below current member count' };
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      problemStatement: data.problemStatement,
      category: data.category,
      type: data.type,
      outcome: data.outcome,
      coverImage: data.coverImage,
      visibility: data.visibility,
      duration: data.duration,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      stage: data.stage,
      minTeamSize: data.minTeamSize,
      maxTeamSize: data.maxTeamSize,
      budget: data.budget,
      paid: data.paid,
      joinMode: data.joinMode,
      memberApprovalMode: data.memberApprovalMode,
    };

    if (data.roles && Array.isArray(data.roles)) {
      await prisma.projectRole.deleteMany({ where: { projectId: id } });
      updateData.roles = {
        create: data.roles.map((r: any) => ({
          title: r.title,
          openings: Number(r.openings) || 1,
          filled: Number(r.filled) || 0
        }))
      };
    }

    if (data.requirements && Array.isArray(data.requirements)) {
      await prisma.projectRequirement.deleteMany({ where: { projectId: id } });
      updateData.requirements = {
        create: data.requirements.map((req: any) => ({
          skillName: req.skill || req.skillName,
          level: req.proficiency || req.level || 'intermediate',
          isOptional: req.type === 'preferred' || req.isOptional === true
        }))
      };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: updateData,
      include: { requirements: true, roles: true }
    });

    eventBus.emitEvent(DomainEvent.ProjectUpdated, { projectId: updated.id });
    return { data: this.formatProject(updated) };
  }

  async transition(id: string, userId: string, newStatus: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (existing.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Forbidden' };

    const validTransitions: Record<string, string[]> = {
      'Draft': ['Recruiting'],
      'Recruiting': ['Active'],
      'Active': ['Paused', 'Completed', 'Verified'],
      'Paused': ['Active'],
      'Completed': ['Archived'],
      'Verified': ['Archived']
    };

    if (existing.status === 'Completed' || existing.status === 'Verified') {
      if (newStatus !== 'Archived') {
         throw { status: 400, code: 'INVALID_TRANSITION', message: `Cannot transition from ${existing.status} to ${newStatus}. Only Archived is allowed.` };
      }
    }

    const allowedNext = validTransitions[existing.status] || [];
    if (!allowedNext.includes(newStatus)) {
       throw { status: 400, code: 'INVALID_TRANSITION', message: `Invalid transition from ${existing.status} to ${newStatus}. Allowed: ${allowedNext.join(', ')}` };
    }

    const updated = await prisma.project.update({
      where: { id },
      data: { status: newStatus },
      include: { requirements: true, roles: true }
    });

    eventBus.emitEvent(DomainEvent.ProjectUpdated, { projectId: updated.id });
    return { data: updated };
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (existing.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can delete this project' };

    await prisma.project.delete({ where: { id } });
    eventBus.emitEvent(DomainEvent.ProjectDeleted, { projectId: id });
    return { data: { success: true, id } };
  }
}

export const realProjectsService = new RealService();
export const realService = realProjectsService;
