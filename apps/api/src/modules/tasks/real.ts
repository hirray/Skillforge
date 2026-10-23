import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';
import { recalculateMilestoneProgress } from '../milestones/real';

const prisma = new PrismaClient();

// Wire cross-module event listener once
let memberLeftRegistered = false;
export function registerTaskEventListeners() {
  if (memberLeftRegistered) return;
  memberLeftRegistered = true;

  eventBus.onEvent(DomainEvent.MemberLeft, async ({ projectId, userId }) => {
    try {
      const activeTasks = await prisma.task.findMany({
        where: {
          projectId,
          assigneeId: userId,
          status: { not: 'Done' }
        }
      });

      for (const t of activeTasks) {
        await prisma.task.update({
          where: { id: t.id },
          data: {
            assigneeId: null,
            needsReassignment: true
          }
        });

        await prisma.taskHistory.create({
          data: {
            taskId: t.id,
            field: 'assigneeId',
            oldValue: userId,
            newValue: 'unassigned (member left)',
            userId: 'system'
          }
        });
      }
    } catch (err) {
      console.error('[Tasks] Error reacting to MemberLeft event:', err);
    }
  });
}

registerTaskEventListeners();

export class RealService {
  async ensureMember(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { status: 'active' }
        }
      }
    });

    if (!project) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    }

    const isOwner = project.ownerId === userId;
    const isConfirmedMember = project.members.some(m => m.userId === userId);

    if (!isOwner && !isConfirmedMember) {
      throw {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: 'Only active confirmed project members can access or modify tasks'
      };
    }

    return project;
  }

  async ensureAssigneeIsActiveMember(projectId: string, assigneeId: string) {
    if (!assigneeId) return;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { status: 'active' }
        }
      }
    });

    if (!project) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    }

    const isOwner = project.ownerId === assigneeId;
    const isActiveMember = project.members.some(m => m.userId === assigneeId);

    if (!isOwner && !isActiveMember) {
      throw {
        status: 422,
        code: 'INVALID_ASSIGNEE',
        message: 'Task assignee must be a confirmed active project member or project owner'
      };
    }
  }

  async detectDependencyCycle(taskId: string, candidateDepId: string): Promise<boolean> {
    if (taskId === candidateDepId) return true;

    // Follow dependency chain from candidateDepId: who does candidateDepId depend on?
    const visited = new Set<string>();
    const queue = [candidateDepId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === taskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const t = await prisma.task.findUnique({
        where: { id: current },
        select: { dependsOn: true }
      });

      if (t && t.dependsOn) {
        try {
          const deps: string[] = typeof t.dependsOn === 'string' ? JSON.parse(t.dependsOn) : t.dependsOn;
          if (Array.isArray(deps)) {
            for (const dep of deps) {
              if (!visited.has(dep)) {
                queue.push(dep);
              }
            }
          }
        } catch {}
      }
    }

    return false;
  }

  async create(projectId: string, userId: string, data: any) {
    await this.ensureMember(projectId, userId);
    if (data.assigneeId) {
      await this.ensureAssigneeIsActiveMember(projectId, data.assigneeId);
    }

    const deps = Array.isArray(data.dependsOn) 
      ? data.dependsOn 
      : (Array.isArray(data.dependsOnTaskIds) ? data.dependsOnTaskIds : []);

    if (deps.length > 0) {
      for (const depId of deps) {
        const depTask = await prisma.task.findUnique({ where: { id: depId } });
        if (!depTask || depTask.projectId !== projectId) {
          throw { status: 400, code: 'INVALID_DEPENDENCY', message: `Dependency task ${depId} not found in this project` };
        }
      }
    }

    const isDone = data.status === 'Done';
    const task = await prisma.task.create({
      data: {
        projectId,
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'Medium',
        status: data.status || 'To Do',
        assigneeId: data.assigneeId || null,
        creatorId: userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : null,
        needsReassignment: false,
        milestoneId: data.milestoneId || null,
        dependsOn: JSON.stringify(deps),
        completedAt: isDone ? new Date() : null
      },
      include: {
        assignee: { select: { id: true, email: true } },
        comments: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Record initial history
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        field: 'status',
        oldValue: null,
        newValue: task.status,
        userId
      }
    });

    if (task.assigneeId) {
      await prisma.taskHistory.create({
        data: {
          taskId: task.id,
          field: 'assigneeId',
          oldValue: null,
          newValue: task.assigneeId,
          userId
        }
      });
    }

    if (task.milestoneId) {
      await recalculateMilestoneProgress(task.milestoneId);
    }

    eventBus.emitEvent(DomainEvent.TaskCreated, { taskId: task.id, projectId });
    if (isDone) {
      eventBus.emitEvent(DomainEvent.TaskCompleted, { taskId: task.id, projectId });
    }

    return { data: await this.formatTask(task.id) };
  }

  async list(projectId: string, userId: string, filters: any = {}) {
    await this.ensureMember(projectId, userId);

    const where: any = { projectId };
    if (filters.status) where.status = filters.status;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.needsReassignment !== undefined) {
      where.needsReassignment = filters.needsReassignment === 'true' || filters.needsReassignment === true;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, email: true } },
        comments: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = tasks.map(t => ({
      ...t,
      dependsOn: t.dependsOn ? (typeof t.dependsOn === 'string' ? JSON.parse(t.dependsOn) : t.dependsOn) : []
    }));

    return { data: parsed };
  }

  async getById(projectId: string, taskId: string, userId: string) {
    await this.ensureMember(projectId, userId);
    const task = await this.formatTask(taskId);
    if (!task || task.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found' };
    }
    return { data: task };
  }

  async getByIdDirect(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found' };
    }
    await this.ensureMember(task.projectId, userId);
    return { data: await this.formatTask(taskId) };
  }

  async update(projectId: string, taskId: string, userId: string, data: any) {
    await this.ensureMember(projectId, userId);
    const existing = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!existing || existing.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found' };
    }

    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      await this.ensureAssigneeIsActiveMember(projectId, data.assigneeId);
    }

    const newDeps = data.dependsOn !== undefined 
      ? data.dependsOn 
      : (data.dependsOnTaskIds !== undefined ? data.dependsOnTaskIds : undefined);

    if (newDeps !== undefined && Array.isArray(newDeps)) {
      for (const depId of newDeps) {
        if (depId === taskId) {
          throw { status: 400, code: 'DEPENDENCY_CYCLE', message: `Task cannot depend on itself: ${taskId}` };
        }
        const hasCycle = await this.detectDependencyCycle(taskId, depId);
        if (hasCycle) {
          throw {
            status: 400,
            code: 'DEPENDENCY_CYCLE',
            message: `Dependency cycle detected between task ${taskId} and task ${depId}`
          };
        }
      }
    }

    const historyToInsert: any[] = [];
    const updateData: any = {};

    if (newDeps !== undefined && Array.isArray(newDeps)) {
      updateData.dependsOn = JSON.stringify(newDeps);
    }

    if (data.title !== undefined && data.title !== existing.title) {
      updateData.title = data.title;
      historyToInsert.push({
        taskId,
        field: 'title',
        oldValue: existing.title,
        newValue: data.title,
        userId
      });
    }

    if (data.description !== undefined && data.description !== existing.description) {
      updateData.description = data.description || null;
      historyToInsert.push({
        taskId,
        field: 'description',
        oldValue: existing.description,
        newValue: data.description || null,
        userId
      });
    }

    if (data.priority !== undefined && data.priority !== existing.priority) {
      updateData.priority = data.priority;
      historyToInsert.push({
        taskId,
        field: 'priority',
        oldValue: existing.priority,
        newValue: data.priority,
        userId
      });
    }

    let isBecomingDone = false;
    if (data.status !== undefined && data.status !== existing.status) {
      updateData.status = data.status;
      if (data.status === 'Done') {
        isBecomingDone = true;
        updateData.completedAt = existing.completedAt || new Date();
      }
      historyToInsert.push({
        taskId,
        field: 'status',
        oldValue: existing.status,
        newValue: data.status,
        userId
      });
    }

    if (data.assigneeId !== undefined && data.assigneeId !== existing.assigneeId) {
      updateData.assigneeId = data.assigneeId || null;
      updateData.needsReassignment = false;
      historyToInsert.push({
        taskId,
        field: 'assigneeId',
        oldValue: existing.assigneeId || 'unassigned',
        newValue: data.assigneeId || 'unassigned',
        userId
      });
    } else if (data.needsReassignment !== undefined && data.needsReassignment !== existing.needsReassignment) {
      updateData.needsReassignment = data.needsReassignment;
      historyToInsert.push({
        taskId,
        field: 'needsReassignment',
        oldValue: String(existing.needsReassignment),
        newValue: String(data.needsReassignment),
        userId
      });
    }

    if (data.dueDate !== undefined) {
      const oldDue = existing.dueDate ? existing.dueDate.toISOString().split('T')[0] : null;
      const newDue = data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null;
      if (oldDue !== newDue) {
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        historyToInsert.push({
          taskId,
          field: 'dueDate',
          oldValue: oldDue,
          newValue: newDue,
          userId
        });
      }
    }

    if (data.estimatedHours !== undefined) {
      updateData.estimatedHours = data.estimatedHours ? Number(data.estimatedHours) : null;
    }

    if (data.milestoneId !== undefined) {
      updateData.milestoneId = data.milestoneId || null;
    }

    await prisma.task.update({
      where: { id: taskId },
      data: updateData
    });

    if (historyToInsert.length > 0) {
      await prisma.taskHistory.createMany({
        data: historyToInsert
      });
    }

    // Recalculate milestone progress if milestone link or status changed
    const finalMilestoneId = data.milestoneId !== undefined ? data.milestoneId : existing.milestoneId;
    if (existing.milestoneId && existing.milestoneId !== finalMilestoneId) {
      await recalculateMilestoneProgress(existing.milestoneId);
    }
    if (finalMilestoneId) {
      await recalculateMilestoneProgress(finalMilestoneId);
    }

    if (isBecomingDone) {
      eventBus.emitEvent(DomainEvent.TaskCompleted, { taskId, projectId });
    }

    return { data: await this.formatTask(taskId) };
  }

  async delete(projectId: string, taskId: string, userId: string) {
    await this.ensureMember(projectId, userId);
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found' };
    }

    const previousMilestoneId = existing.milestoneId;
    await prisma.task.delete({ where: { id: taskId } });

    if (previousMilestoneId) {
      await recalculateMilestoneProgress(previousMilestoneId);
    }

    return { data: { success: true, id: taskId } };
  }

  async addComment(projectId: string, taskId: string, userId: string, content: string) {
    await this.ensureMember(projectId, userId);
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing || existing.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found' };
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        userId,
        content
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    await prisma.taskHistory.create({
      data: {
        taskId,
        field: 'comment',
        oldValue: null,
        newValue: content.slice(0, 100),
        userId
      }
    });

    return { data: comment };
  }

  async getHistory(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found' };
    }
    await this.ensureMember(task.projectId, userId);

    const history = await prisma.taskHistory.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' }
    });

    return { data: history };
  }

  async formatTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, email: true } },
        comments: {
          include: { user: { select: { id: true, email: true } } },
          orderBy: { createdAt: 'asc' }
        },
        history: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) return null;

    return {
      ...task,
      dependsOn: task.dependsOn ? (typeof task.dependsOn === 'string' ? JSON.parse(task.dependsOn) : task.dependsOn) : []
    };
  }

  async checkReminders() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const approachingOrOverdue = await prisma.task.findMany({
      where: {
        status: { not: 'Done' },
        dueDate: { lte: in24Hours }
      },
      include: {
        assignee: true,
        project: true
      }
    });

    return approachingOrOverdue.map(t => ({
      taskId: t.id,
      title: t.title,
      dueDate: t.dueDate,
      assigneeEmail: t.assignee?.email,
      isOverdue: t.dueDate ? t.dueDate < now : false
    }));
  }
}

export const realTasksService = new RealService();
export const realService = realTasksService;
