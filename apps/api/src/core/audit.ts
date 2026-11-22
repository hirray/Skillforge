import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Writes an immutable audit trail record for sensitive actions (admin curation, role upgrades, account deletion).
 */
export async function writeAudit(
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  reason?: string,
  metadata?: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetType: targetType || null,
        targetId: targetId || null,
        reason: reason || null,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });
  } catch (err) {
    console.error('AuditLog write failure:', err);
  }
}
