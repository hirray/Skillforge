import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent, HackathonEvent, EventParticipant } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

function formatEvent(e: any): HackathonEvent {
  let suggestedSkills: string[] = [];
  try {
    suggestedSkills = typeof e.suggestedSkillIds === 'string'
      ? JSON.parse(e.suggestedSkillIds)
      : (e.suggestedSkillIds || []);
  } catch {
    suggestedSkills = [];
  }

  return {
    id: e.id,
    name: e.name,
    description: e.description,
    theme: e.theme,
    startsAt: e.startsAt instanceof Date ? e.startsAt.toISOString() : String(e.startsAt),
    endsAt: e.endsAt instanceof Date ? e.endsAt.toISOString() : String(e.endsAt),
    rules: e.rules || null,
    suggestedSkillIds: suggestedSkills,
    status: e.status,
    organizerId: e.organizerId,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : String(e.updatedAt),
    organizer: e.organizer ? {
      id: e.organizer.id,
      email: e.organizer.email,
    } : undefined,
    participants: e.participants ? e.participants.map((p: any) => formatParticipant(p)) : undefined,
    projects: e.projects || undefined,
    _count: e._count,
  };
}

function formatParticipant(p: any): EventParticipant {
  let skills: string[] = [];
  try {
    skills = typeof p.skillsSnapshot === 'string'
      ? JSON.parse(p.skillsSnapshot)
      : (p.skillsSnapshot || []);
  } catch {
    skills = [];
  }

  return {
    id: p.id,
    eventId: p.eventId,
    userId: p.userId,
    lookingForTeam: Boolean(p.lookingForTeam),
    skillsSnapshot: skills,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
    user: p.user ? {
      id: p.user.id,
      email: p.user.email,
    } : undefined,
  };
}

export class RealService {
  /**
   * List hackathon sprint events with optional status filter.
   */
  async listEvents(filters?: { status?: string }) {
    const now = new Date();

    // Auto-advance running/ended status for active events
    const runningEvents = await prisma.hackathonEvent.findMany({
      where: { status: 'running', endsAt: { lt: now } }
    });
    for (const re of runningEvents) {
      await prisma.hackathonEvent.update({
        where: { id: re.id },
        data: { status: 'ended' }
      });
    }

    const openEvents = await prisma.hackathonEvent.findMany({
      where: { status: 'open', startsAt: { lte: now }, endsAt: { gte: now } }
    });
    for (const oe of openEvents) {
      await prisma.hackathonEvent.update({
        where: { id: oe.id },
        data: { status: 'running' }
      });
    }

    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }

    const events = await prisma.hackathonEvent.findMany({
      where,
      include: {
        organizer: { select: { id: true, email: true } },
        _count: {
          select: {
            participants: true,
            projects: true,
          }
        }
      },
      orderBy: { startsAt: 'desc' }
    });

    return events.map(formatEvent);
  }

  /**
   * Get event detail with participant pool ("looking for team") and registered teams.
   */
  async getEvent(id: string) {
    const event = await prisma.hackathonEvent.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, email: true } },
        participants: {
          include: {
            user: { select: { id: true, email: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        projects: {
          include: {
            owner: { select: { id: true, email: true } },
            members: {
              include: {
                user: { select: { id: true, email: true } }
              }
            },
            milestones: {
              orderBy: { dueDate: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            participants: true,
            projects: true,
          }
        }
      }
    });

    if (!event) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Hackathon event not found' };
    }

    return formatEvent(event);
  }

  /**
   * Create a new hackathon sprint event.
   */
  async createEvent(organizerId: string, data: {
    name: string;
    description: string;
    theme: string;
    startsAt: string;
    endsAt: string;
    rules?: string | null;
    suggestedSkillIds?: string[];
  }) {
    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(data.endsAt);

    if (startsAt >= endsAt) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Event start time must precede end time'
      };
    }

    const suggestedSkillIdsJson = JSON.stringify(data.suggestedSkillIds || []);
    const now = new Date();
    const initialStatus = startsAt <= now && endsAt >= now ? 'running' : 'open';

    const event = await prisma.hackathonEvent.create({
      data: {
        name: data.name,
        description: data.description,
        theme: data.theme,
        startsAt,
        endsAt,
        rules: data.rules || null,
        suggestedSkillIds: suggestedSkillIdsJson,
        status: initialStatus,
        organizerId,
      },
      include: {
        organizer: { select: { id: true, email: true } }
      }
    });

    eventBus.emitEvent(DomainEvent.HackathonCreated, {
      eventId: event.id,
      organizerId,
    });

    return formatEvent(event);
  }

  /**
   * Update event status (draft -> open -> running -> ended -> archived).
   */
  async updateStatus(id: string, callerId: string, status: string) {
    const event = await prisma.hackathonEvent.findUnique({ where: { id } });
    if (!event) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Hackathon event not found' };
    }

    if (event.organizerId !== callerId) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only the event organizer can update status' };
    }

    const updated = await prisma.hackathonEvent.update({
      where: { id },
      data: { status },
      include: {
        organizer: { select: { id: true, email: true } }
      }
    });

    eventBus.emitEvent(DomainEvent.HackathonStatusUpdated, {
      eventId: updated.id,
      status: updated.status,
    });

    return formatEvent(updated);
  }

  /**
   * Join event as participant with lookingForTeam flag and skills.
   */
  async joinEvent(eventId: string, userId: string, data: { lookingForTeam?: boolean; skillsSnapshot?: string[] }) {
    const event = await prisma.hackathonEvent.findUnique({ where: { id: eventId } });
    if (!event) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Hackathon event not found' };
    }

    const skillsJson = JSON.stringify(data.skillsSnapshot || []);

    const participant = await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId,
        }
      },
      create: {
        eventId,
        userId,
        lookingForTeam: data.lookingForTeam ?? true,
        skillsSnapshot: skillsJson,
      },
      update: {
        ...(data.lookingForTeam !== undefined ? { lookingForTeam: data.lookingForTeam } : {}),
        ...(data.skillsSnapshot ? { skillsSnapshot: skillsJson } : {}),
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    eventBus.emitEvent(DomainEvent.HackathonParticipantJoined, {
      eventId,
      userId,
      lookingForTeam: participant.lookingForTeam,
    });

    return formatParticipant(participant);
  }

  /**
   * Register a project for the hackathon sprint.
   * Auto-scaffolds 3 sprint milestones (Ideate, Build, Demo) scaled to the event time window.
   */
  async registerProject(eventId: string, callerId: string, data: {
    title: string;
    description: string;
    category?: string;
    skills?: string[];
  }) {
    const event = await prisma.hackathonEvent.findUnique({ where: { id: eventId } });
    if (!event) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Hackathon event not found' };
    }

    if (event.status === 'ended' || event.status === 'archived') {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Cannot register a sprint project for an ended or archived hackathon'
      };
    }

    // Check duplicate project registration by caller in this event
    const existing = await prisma.project.findFirst({
      where: { eventId, ownerId: callerId }
    });
    if (existing) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'You have already registered a team project in this hackathon'
      };
    }

    // Scale sprint milestones across event time window
    const startsAtMs = event.startsAt.getTime();
    const endsAtMs = event.endsAt.getTime();
    const duration = Math.max(endsAtMs - startsAtMs, 1000 * 60 * 60 * 24); // at least 24h fallback

    const milestone1Date = new Date(startsAtMs + duration * 0.25);
    const milestone2Date = new Date(startsAtMs + duration * 0.75);
    const milestone3Date = new Date(endsAtMs);

    const project = await prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: callerId,
        eventId,
        status: 'active',
        stage: 'Execution',
        duration: 'Hackathon Sprint',
        minTeamSize: 1,
        maxTeamSize: 5,
        requirements: {
          create: (data.skills || []).map((skill) => ({
            skillName: skill,
            level: 'intermediate',
            source: 'sprint',
          }))
        },
        milestones: {
          create: [
            {
              title: 'Ideate & Technical Architecture',
              description: 'Clarify MVP scope, agree on tech stack, scaffold repo, and lock API contracts.',
              status: 'To Do',
              dueDate: milestone1Date,
            },
            {
              title: 'Core Feature Build & Integration',
              description: 'Implement core functionality, wire UI with backend APIs, and verify database flows.',
              status: 'To Do',
              dueDate: milestone2Date,
            },
            {
              title: 'Sprint Demo & Final Polish',
              description: 'Prepare presentation deck, record 2-minute demo video, and publish deployed URL.',
              status: 'To Do',
              dueDate: milestone3Date,
            },
          ]
        }
      },
      include: {
        milestones: true,
        requirements: true,
      }
    });

    // Automatically mark caller as not looking for team now that they have a registered project
    await prisma.eventParticipant.upsert({
      where: {
        eventId_userId: {
          eventId,
          userId: callerId,
        }
      },
      create: {
        eventId,
        userId: callerId,
        lookingForTeam: false,
        skillsSnapshot: JSON.stringify(data.skills || []),
      },
      update: {
        lookingForTeam: false,
      }
    });

    eventBus.emitEvent(DomainEvent.HackathonTeamRegistered, {
      eventId,
      projectId: project.id,
    });

    return project;
  }

  /**
   * Delete hackathon event.
   * Archive-only rule: if teams exist, safely transitions to 'archived' instead of deleting.
   */
  async deleteEvent(id: string, callerId: string) {
    const event = await prisma.hackathonEvent.findUnique({ where: { id } });
    if (!event) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Hackathon event not found' };
    }

    if (event.organizerId !== callerId) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only the event organizer can delete or archive the event' };
    }

    const teamCount = await prisma.project.count({ where: { eventId: id } });
    if (teamCount > 0) {
      // Archive-only deletion once teams exist
      const archived = await prisma.hackathonEvent.update({
        where: { id },
        data: { status: 'archived' }
      });
      return {
        archived: true,
        message: 'Event contains registered sprint teams. Safely archived to preserve team history.',
        event: formatEvent(archived),
      };
    }

    await prisma.hackathonEvent.delete({ where: { id } });
    return {
      deleted: true,
      message: 'Event deleted successfully.',
    };
  }
}
