import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

// Wire cross-module event listener once
let milestoneEventListenersRegistered = false;
export function registerMilestoneEventListeners() {
  if (milestoneEventListenersRegistered) return;
  milestoneEventListenersRegistered = true;

  // React to TaskCompleted to recalculate milestone progress and auto-complete if 100%
  eventBus.onEvent(DomainEvent.TaskCompleted, async ({ taskId, projectId }) => {
    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      if (task && task.milestoneId) {
        await recalculateMilestoneProgress(task.milestoneId);
      }
    } catch (err) {
      console.error('[Milestones] Error handling TaskCompleted event:', err);
    }
  });
}

registerMilestoneEventListeners();

export async function recalculateMilestoneProgress(milestoneId: string): Promise<number> {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { tasks: true }
  });
  if (!milestone) return 0;

  const totalTasks = milestone.tasks.length;
  const doneTasks = milestone.tasks.filter(t => t.status === 'Done').length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const updateData: any = { progressPercentage: progress };

  // If not manually completed and not already done, check auto completion
  if (totalTasks > 0 && doneTasks === totalTasks && milestone.status !== 'Done') {
    updateData.status = 'Done';
    updateData.completedAt = new Date();
    updateData.completedBy = 'system';
    
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    await prisma.milestoneHistory.create({
      data: {
        milestoneId,
        field: 'status',
        oldValue: milestone.status,
        newValue: 'Done (All tasks completed)',
        changedBy: 'system'
      }
    });

    eventBus.emitEvent(DomainEvent.MilestoneReached, { milestoneId, projectId: milestone.projectId });
  } else {
    // If milestone was already marked Done (auto or manual), snapshot rule: do NOT un-complete it!
    if (milestone.status !== 'Done') {
      updateData.status = doneTasks > 0 ? 'In Progress' : 'To Do';
    }
    await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });
  }

  return progress;
}

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
        message: 'Only active confirmed project members can access or modify milestones'
      };
    }

    return project;
  }

  async create(projectId: string, userId: string, data: any) {
    await this.ensureMember(projectId, userId);

    const linkedTaskIds: string[] = data.linkedTaskIds || [];
    if (linkedTaskIds.length > 0) {
      for (const tId of linkedTaskIds) {
        const task = await prisma.task.findUnique({ where: { id: tId } });
        if (!task || task.projectId !== projectId) {
          throw { status: 400, code: 'INVALID_TASK', message: `Task ${tId} not found in this project` };
        }
      }
    }

    // Determine initial task states
    let initialProgress = 0;
    let initialStatus = 'To Do';
    let isDone = false;

    if (linkedTaskIds.length > 0) {
      const tasks = await prisma.task.findMany({
        where: { id: { in: linkedTaskIds } }
      });
      const doneCount = tasks.filter(t => t.status === 'Done').length;
      initialProgress = Math.round((doneCount / tasks.length) * 100);
      if (doneCount === tasks.length) {
        initialStatus = 'Done';
        isDone = true;
      } else if (doneCount > 0) {
        initialStatus = 'In Progress';
      }
    }

    const milestone = await prisma.milestone.create({
      data: {
        projectId,
        title: data.title,
        description: data.description || null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: initialStatus,
        progressPercentage: initialProgress,
        completedAt: isDone ? new Date() : null,
        completedBy: isDone ? 'system' : null
      }
    });

    // Relink tasks to this milestone (one milestone per task constraint)
    if (linkedTaskIds.length > 0) {
      for (const tId of linkedTaskIds) {
        const prevTask = await prisma.task.findUnique({ where: { id: tId } });
        const oldMilestoneId = prevTask?.milestoneId;

        await prisma.task.update({
          where: { id: tId },
          data: { milestoneId: milestone.id }
        });

        if (oldMilestoneId && oldMilestoneId !== milestone.id) {
          await recalculateMilestoneProgress(oldMilestoneId);
        }
      }
    }

    // Create history record
    await prisma.milestoneHistory.create({
      data: {
        milestoneId: milestone.id,
        field: 'created',
        oldValue: null,
        newValue: milestone.title,
        changedBy: userId
      }
    });

    if (isDone) {
      eventBus.emitEvent(DomainEvent.MilestoneReached, { milestoneId: milestone.id, projectId });
    }

    return { data: await this.formatMilestone(milestone.id) };
  }

  async list(projectId: string, userId: string, filters: any = {}) {
    await this.ensureMember(projectId, userId);

    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, email: true } }
          }
        },
        history: {
          orderBy: { changedAt: 'desc' }
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return { data: milestones.map(m => this.transformMilestone(m)) };
  }

  async getById(projectId: string, milestoneId: string, userId: string) {
    await this.ensureMember(projectId, userId);
    const milestone = await this.formatMilestone(milestoneId);
    if (!milestone || milestone.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }
    return { data: milestone };
  }

  async getByIdDirect(milestoneId: string, userId: string) {
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }
    await this.ensureMember(milestone.projectId, userId);
    return { data: await this.formatMilestone(milestoneId) };
  }

  async update(projectId: string, milestoneId: string, userId: string, data: any) {
    await this.ensureMember(projectId, userId);
    const existing = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { tasks: true }
    });

    if (!existing || existing.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }

    // Business rule: A milestone cannot be marked complete while it has zero linked tasks AND no manual confirmation rationale
    if (data.status === 'Done' && existing.status !== 'Done') {
      const taskCount = data.linkedTaskIds ? data.linkedTaskIds.length : existing.tasks.length;
      if (taskCount === 0 && !existing.isManualCompletion && !data.rationale) {
        throw {
          status: 400,
          code: 'COMPLETION_RULE_VIOLATION',
          message: 'A milestone cannot be marked complete with zero linked tasks without a manual confirmation rationale'
        };
      }
    }

    const historyToInsert: any[] = [];
    const updateData: any = {};

    if (data.title !== undefined && data.title !== existing.title) {
      updateData.title = data.title;
      historyToInsert.push({
        milestoneId,
        field: 'title',
        oldValue: existing.title,
        newValue: data.title,
        changedBy: userId
      });
    }

    if (data.description !== undefined && data.description !== existing.description) {
      updateData.description = data.description || null;
      historyToInsert.push({
        milestoneId,
        field: 'description',
        oldValue: existing.description,
        newValue: data.description || null,
        changedBy: userId
      });
    }

    if (data.dueDate !== undefined) {
      const oldDue = existing.dueDate ? existing.dueDate.toISOString().split('T')[0] : null;
      const newDue = data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : null;
      if (oldDue !== newDue) {
        updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        historyToInsert.push({
          milestoneId,
          field: 'dueDate',
          oldValue: oldDue,
          newValue: newDue,
          changedBy: userId
        });
      }
    }

    if (data.status !== undefined && data.status !== existing.status) {
      updateData.status = data.status;
      if (data.status === 'Done') {
        updateData.completedAt = existing.completedAt || new Date();
        updateData.completedBy = userId;
      }
      historyToInsert.push({
        milestoneId,
        field: 'status',
        oldValue: existing.status,
        newValue: data.status,
        changedBy: userId
      });
    }

    // Handle relinking tasks if passed
    if (data.linkedTaskIds && Array.isArray(data.linkedTaskIds)) {
      const currentTaskIds = existing.tasks.map(t => t.id);
      const newTaskIds: string[] = data.linkedTaskIds;

      // Validate new tasks belong to this project
      for (const tId of newTaskIds) {
        const task = await prisma.task.findUnique({ where: { id: tId } });
        if (!task || task.projectId !== projectId) {
          throw { status: 400, code: 'INVALID_TASK', message: `Task ${tId} not found in this project` };
        }
      }

      // Unlink removed tasks
      const removedTaskIds = currentTaskIds.filter(id => !newTaskIds.includes(id));
      for (const rId of removedTaskIds) {
        await prisma.task.update({
          where: { id: rId },
          data: { milestoneId: null }
        });
      }

      // Link newly added tasks
      const addedTaskIds = newTaskIds.filter(id => !currentTaskIds.includes(id));
      for (const aId of addedTaskIds) {
        const prevTask = await prisma.task.findUnique({ where: { id: aId } });
        const oldMilestoneId = prevTask?.milestoneId;

        await prisma.task.update({
          where: { id: aId },
          data: { milestoneId }
        });

        if (oldMilestoneId && oldMilestoneId !== milestoneId) {
          await recalculateMilestoneProgress(oldMilestoneId);
        }
      }
    }

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    if (historyToInsert.length > 0) {
      await prisma.milestoneHistory.createMany({
        data: historyToInsert
      });
    }

    // Recalculate progress for this milestone
    await recalculateMilestoneProgress(milestoneId);

    if (data.status === 'Done' && existing.status !== 'Done') {
      eventBus.emitEvent(DomainEvent.MilestoneReached, { milestoneId, projectId });
    }

    return { data: await this.formatMilestone(milestoneId) };
  }

  async linkTask(projectId: string, milestoneId: string, userId: string, taskId: string) {
    await this.ensureMember(projectId, userId);
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found in this project' };
    }

    const oldMilestoneId = task.milestoneId;

    // One milestone per task: relink task
    await prisma.task.update({
      where: { id: taskId },
      data: { milestoneId }
    });

    // If previously in another milestone, update that one too
    if (oldMilestoneId && oldMilestoneId !== milestoneId) {
      await recalculateMilestoneProgress(oldMilestoneId);
    }

    // Recalculate this milestone
    await recalculateMilestoneProgress(milestoneId);

    await prisma.milestoneHistory.create({
      data: {
        milestoneId,
        field: 'linkedTask',
        oldValue: null,
        newValue: `Linked task: ${task.title} (${task.id})`,
        changedBy: userId
      }
    });

    return { data: await this.formatMilestone(milestoneId) };
  }

  async unlinkTask(projectId: string, milestoneId: string, userId: string, taskId: string) {
    await this.ensureMember(projectId, userId);
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Task not found in this project' };
    }

    if (task.milestoneId === milestoneId) {
      await prisma.task.update({
        where: { id: taskId },
        data: { milestoneId: null }
      });

      // Recalculate progress (snapshot rule: if already Done, status stays Done)
      await recalculateMilestoneProgress(milestoneId);

      await prisma.milestoneHistory.create({
        data: {
          milestoneId,
          field: 'unlinkedTask',
          oldValue: `Unlinked task: ${task.title} (${task.id})`,
          newValue: null,
          changedBy: userId
        }
      });
    }

    return { data: await this.formatMilestone(milestoneId) };
  }

  async manualComplete(projectId: string, milestoneId: string, userId: string, rationale: string) {
    await this.ensureMember(projectId, userId);
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { tasks: true }
    });

    if (!milestone || milestone.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }

    if (!rationale || !rationale.trim()) {
      throw {
        status: 400,
        code: 'RATIONALE_REQUIRED',
        message: 'Manual completion rationale is required'
      };
    }

    const totalTasks = milestone.tasks.length;
    const doneTasks = milestone.tasks.filter(t => t.status === 'Done').length;
    const currentProgress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'Done',
        isManualCompletion: true,
        completionRationale: rationale.trim(),
        completedBy: userId,
        completedAt: new Date(),
        progressPercentage: currentProgress // Stores real calculated progress without faking 100%
      }
    });

    await prisma.milestoneHistory.create({
      data: {
        milestoneId,
        field: 'status',
        oldValue: milestone.status,
        newValue: 'Done (Manually Confirmed)',
        changedBy: userId
      }
    });

    await prisma.milestoneHistory.create({
      data: {
        milestoneId,
        field: 'completionRationale',
        oldValue: null,
        newValue: rationale.trim(),
        changedBy: userId
      }
    });

    eventBus.emitEvent(DomainEvent.MilestoneReached, { milestoneId, projectId });

    return { data: await this.formatMilestone(milestoneId) };
  }

  async delete(projectId: string, milestoneId: string, userId: string) {
    await this.ensureMember(projectId, userId);
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }

    // Unlink any tasks linked to this milestone
    await prisma.task.updateMany({
      where: { milestoneId },
      data: { milestoneId: null }
    });

    await prisma.milestone.delete({ where: { id: milestoneId } });

    return { data: { success: true, id: milestoneId } };
  }

  async getHistory(milestoneId: string, userId: string) {
    const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Milestone not found' };
    }
    await this.ensureMember(milestone.projectId, userId);

    const history = await prisma.milestoneHistory.findMany({
      where: { milestoneId },
      orderBy: { changedAt: 'desc' }
    });

    return { data: history };
  }

  async formatMilestone(milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        tasks: {
          include: {
            assignee: { select: { id: true, email: true } }
          }
        },
        history: {
          orderBy: { changedAt: 'desc' }
        }
      }
    });

    if (!milestone) return null;
    return this.transformMilestone(milestone);
  }

  private transformMilestone(m: any) {
    const totalTasks = m.tasks ? m.tasks.length : 0;
    const doneTasks = m.tasks ? m.tasks.filter((t: any) => t.status === 'Done').length : 0;
    const calculatedProgress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

    const isOverdue = m.dueDate && m.status !== 'Done' ? new Date(m.dueDate) < new Date() : false;

    return {
      ...m,
      calculatedProgress,
      isOverdue,
      tasks: (m.tasks || []).map((t: any) => ({
        ...t,
        labels: t.labels ? (typeof t.labels === 'string' ? JSON.parse(t.labels) : t.labels) : [],
        attachments: t.attachments ? (typeof t.attachments === 'string' ? JSON.parse(t.attachments) : t.attachments) : []
      }))
    };
  }
}

export const realMilestonesService = new RealService();
export const realService = realMilestonesService;
