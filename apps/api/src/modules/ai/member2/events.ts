import { DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../../core/eventBus';
import { prisma, parseJson } from './db';

let registered = false;
export const healthCache = new Map<string, { expires: number; data: any }>();
export const analyticsCache = new Map<string, { expires: number; data: any }>();
export function registerMember2Events() {
  if (registered) return;
  registered = true;
  for (const event of Object.values(DomainEvent)) {
    eventBus.onEvent(event, (payload: any) => {
      if (payload.projectId) healthCache.delete(payload.projectId);
      void recordEvent(event, payload).catch(() =>
        console.error(
          'Member 2 event recording failed; the original operation was preserved.'
        )
      );
    });
  }
}

export async function recordEvent(event: string, payload: any) {
  analyticsCache.clear();
  let projectId = payload.projectId,
    userId = payload.userId,
    roleId = payload.roleId;
  if (
    ['InvitationSent', 'InvitationResponded'].includes(event) &&
    payload.invitationId
  ) {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: payload.invitationId },
    });
    if (invitation) {
      projectId = invitation.projectId;
      userId = invitation.inviteeId;
      roleId = invitation.role;
    }
  }
  if (
    ['InvitationSent', 'InvitationResponded', 'MemberJoined'].includes(event) &&
    projectId &&
    userId
  ) {
    const status = payload.status ? String(payload.status).toLowerCase() : '';
    const type =
      event === 'InvitationResponded'
        ? `invitation_${status}`
        : event === 'InvitationSent'
          ? 'invitation_sent'
          : 'member_joined';
    const eventKey = `${type}:${payload.invitationId || projectId}:${userId}`;
    const run = await prisma.aiMatchRun.findFirst({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    let sourceRunId =
      run &&
      parseJson<any>(run.resultJson, {}).candidates?.some(
        (c: any) => c.userId === userId
      )
        ? run.id
        : null;
    if (event !== 'InvitationSent') {
      const sent = await prisma.matchOutcome.findFirst({
        where: {
          projectId,
          userId,
          event: 'invitation_sent',
          sourceRunId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
      });
      sourceRunId = sent?.sourceRunId || sourceRunId;
    }
    await prisma.matchOutcome.upsert({
      where: { eventKey },
      update: {},
      create: { eventKey, event: type, projectId, userId, roleId, sourceRunId },
    });
  }
  // Do not persist event payloads: they may contain private conversation content.
  await prisma.metricEvent.create({
    data: {
      type: event,
      actorId: userId || payload.ownerId || null,
      projectId: projectId || null,
    },
  });
}
