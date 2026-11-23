import { PrismaClient } from '@prisma/client';
import { writeAudit } from './audit';

const prisma = new PrismaClient();

/**
 * Checks whether a given project is currently under active moderation hold.
 * Per PRD 32.3 / 32.6 & Edge Cases:
 * A project on hold cannot be completed, verified, or receive certificates.
 */
export async function isOnHold(projectId: string): Promise<boolean> {
  try {
    const hold = await prisma.projectModerationHold.findUnique({
      where: { projectId },
    });
    return Boolean(hold && !hold.releasedAt);
  } catch (err) {
    console.error(`Error checking hold status for project ${projectId}:`, err);
    return false;
  }
}

/**
 * Retrieves the active hold details if project is on hold.
 */
export async function getActiveHold(projectId: string) {
  try {
    const hold = await prisma.projectModerationHold.findUnique({
      where: { projectId },
    });
    if (hold && !hold.releasedAt) {
      return hold;
    }
    return null;
  } catch (err) {
    console.error(`Error retrieving hold for project ${projectId}:`, err);
    return null;
  }
}

/**
 * Places an administrative moderation hold on a project.
 */
export async function placeHold(projectId: string, reason: string, actorId: string) {
  const existing = await prisma.projectModerationHold.findUnique({
    where: { projectId },
  });

  let hold;
  if (existing) {
    hold = await prisma.projectModerationHold.update({
      where: { projectId },
      data: {
        reason,
        createdBy: actorId,
        createdAt: new Date(),
        releasedAt: null,
        releasedBy: null,
      },
    });
  } else {
    hold = await prisma.projectModerationHold.create({
      data: {
        projectId,
        reason,
        createdBy: actorId,
      },
    });
  }

  await writeAudit(
    actorId,
    'PROJECT_HOLD_PLACED',
    'project',
    projectId,
    reason,
    { holdId: hold.id }
  );

  return hold;
}

/**
 * Releases an administrative moderation hold on a project.
 */
export async function releaseHold(projectId: string, reason: string, actorId: string) {
  const existing = await prisma.projectModerationHold.findUnique({
    where: { projectId },
  });

  if (!existing || existing.releasedAt) {
    throw new Error('Project is not currently on hold');
  }

  const updated = await prisma.projectModerationHold.update({
    where: { projectId },
    data: {
      releasedAt: new Date(),
      releasedBy: actorId,
    },
  });

  await writeAudit(
    actorId,
    'PROJECT_HOLD_RELEASED',
    'project',
    projectId,
    reason,
    { holdId: updated.id }
  );

  return updated;
}
