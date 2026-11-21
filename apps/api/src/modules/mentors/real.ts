import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent, MentorProfile } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

function formatProfile(p: any): MentorProfile {
  let skills: string[] = [];
  try {
    skills = typeof p.expertiseSkillIds === 'string' ? JSON.parse(p.expertiseSkillIds) : (p.expertiseSkillIds || []);
  } catch {
    skills = [];
  }

  let domains: string[] = [];
  try {
    domains = typeof p.domains === 'string' ? JSON.parse(p.domains) : (p.domains || []);
  } catch {
    domains = [];
  }

  let formats: string[] = [];
  try {
    formats = typeof p.formats === 'string' ? JSON.parse(p.formats) : (p.formats || []);
  } catch {
    formats = [];
  }

  return {
    id: p.id,
    userId: p.userId,
    expertiseSkillIds: skills,
    domains,
    availability: p.availability,
    formats,
    bio: p.bio || null,
    active: Boolean(p.active),
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
    updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
    user: p.user ? {
      id: p.user.id,
      email: p.user.email,
      name: p.user.email?.split('@')[0],
    } : undefined
  };
}

export class RealService {
  /**
   * List active mentors with optional filtering by skill, domain, format, or search query.
   */
  async listMentors(filters?: { skill?: string; domain?: string; format?: string; search?: string }) {
    // 1. Fetch active profiles
    const profiles = await prisma.mentorProfile.findMany({
      where: { active: true },
      include: {
        user: {
          select: { id: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = profiles.map(formatProfile);

    return formatted.filter(item => {
      if (filters?.skill) {
        const needle = filters.skill.toLowerCase();
        const hasSkill = item.expertiseSkillIds.some(s => s.toLowerCase().includes(needle));
        if (!hasSkill) return false;
      }

      if (filters?.domain) {
        const needle = filters.domain.toLowerCase();
        const hasDomain = item.domains.some(d => d.toLowerCase().includes(needle));
        if (!hasDomain) return false;
      }

      if (filters?.format) {
        const needle = filters.format.toLowerCase();
        const hasFormat = item.formats.some(f => f.toLowerCase() === needle);
        if (!hasFormat) return false;
      }

      if (filters?.search) {
        const needle = filters.search.toLowerCase();
        const inSkills = item.expertiseSkillIds.some(s => s.toLowerCase().includes(needle));
        const inDomains = item.domains.some(d => d.toLowerCase().includes(needle));
        const inBio = item.bio ? item.bio.toLowerCase().includes(needle) : false;
        const inEmail = item.user?.email ? item.user.email.toLowerCase().includes(needle) : false;
        const inName = item.user?.name ? item.user.name.toLowerCase().includes(needle) : false;
        if (!inSkills && !inDomains && !inBio && !inEmail && !inName) return false;
      }

      return true;
    });
  }

  /**
   * Get mentor profile by user ID.
   */
  async getProfile(userId: string) {
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    if (!profile) {
      return null;
    }

    return formatProfile(profile);
  }

  /**
   * Upsert a user's mentor profile (opt-in / update).
   */
  async upsertProfile(userId: string, data: {
    expertiseSkillIds?: string[];
    domains?: string[];
    availability?: string;
    formats?: string[];
    bio?: string | null;
    active?: boolean;
  }) {
    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'User not found' };
    }

    const expertiseSkillIdsJson = JSON.stringify(data.expertiseSkillIds || []);
    const domainsJson = JSON.stringify(data.domains || []);
    const formatsJson = JSON.stringify(data.formats || ['async_review']);

    const profile = await prisma.mentorProfile.upsert({
      where: { userId },
      create: {
        userId,
        expertiseSkillIds: expertiseSkillIdsJson,
        domains: domainsJson,
        availability: data.availability || '5 hrs/week',
        formats: formatsJson,
        bio: data.bio || null,
        active: data.active ?? true,
      },
      update: {
        ...(data.expertiseSkillIds ? { expertiseSkillIds: expertiseSkillIdsJson } : {}),
        ...(data.domains ? { domains: domainsJson } : {}),
        ...(data.availability ? { availability: data.availability } : {}),
        ...(data.formats ? { formats: formatsJson } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    return formatProfile(profile);
  }

  /**
   * Request mentorship from a mentor for a project.
   * Auto-expires in 7 days. Enforces project membership / duplicate checks.
   */
  async requestMentorship(callerId: string, data: {
    projectId: string;
    mentorId: string;
    scope?: string;
    milestoneId?: string | null;
    message: string;
    proposedTime?: string | null;
  }) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { members: true }
    });

    if (!project) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    }

    // Must be owner or active member of project
    const isOwner = project.ownerId === callerId;
    const isMember = project.members.some(m => m.userId === callerId && m.status === 'active');
    if (!isOwner && !isMember) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owners or active team members can request mentorship' };
    }

    // Cannot request project owner
    if (project.ownerId === data.mentorId) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Cannot request project owner as mentor' };
    }

    // Cannot request someone who is already a project member
    const isTargetAlreadyMember = project.members.some(m => m.userId === data.mentorId && m.status === 'active');
    if (isTargetAlreadyMember) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'User is already an active member of this project' };
    }

    // Verify mentor profile exists & is active
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: data.mentorId }
    });
    if (!mentorProfile || !mentorProfile.active) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Active mentor profile not found' };
    }

    // Auto-expire past pending requests
    await prisma.mentorshipRequest.updateMany({
      where: {
        projectId: data.projectId,
        mentorId: data.mentorId,
        status: 'pending',
        expiresAt: { lt: new Date() }
      },
      data: { status: 'expired' }
    });

    // Guard against duplicate active request
    const existingActive = await prisma.mentorshipRequest.findFirst({
      where: {
        projectId: data.projectId,
        mentorId: data.mentorId,
        status: 'pending',
        expiresAt: { gt: new Date() }
      }
    });

    if (existingActive) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'An active mentorship request is already pending for this mentor' };
    }

    // 7-day auto-expiry window
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const messageContent = data.proposedTime 
      ? `${data.message}\n\n[Proposed Time/Availability: ${data.proposedTime}]`
      : data.message;

    const request = await prisma.mentorshipRequest.create({
      data: {
        projectId: data.projectId,
        mentorId: data.mentorId,
        scope: data.scope || 'general',
        milestoneId: data.milestoneId || null,
        message: messageContent,
        status: 'pending',
        expiresAt,
      },
      include: {
        project: { select: { id: true, title: true, stage: true } },
        mentor: { select: { id: true, email: true } }
      }
    });

    eventBus.emitEvent(DomainEvent.MentorshipRequested, {
      requestId: request.id,
      projectId: request.projectId,
      mentorId: request.mentorId,
    });

    return request;
  }

  /**
   * List mentorship requests (inbox for mentors, sent requests for owners/projects).
   */
  async listRequests(userId: string, filters?: { role?: string; projectId?: string; status?: string }) {
    // 1. Auto-expire pending requests that passed their 7-day window
    await prisma.mentorshipRequest.updateMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() }
      },
      data: { status: 'expired' }
    });

    const where: any = {};

    if (filters?.projectId) {
      where.projectId = filters.projectId;
    } else if (filters?.role === 'owner') {
      where.project = { ownerId: userId };
    } else {
      // Default: mentor inbox
      where.mentorId = userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where,
      include: {
        project: { select: { id: true, title: true, stage: true } },
        mentor: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests;
  }

  /**
   * Respond to a mentorship request (accept / decline).
   */
  async respondRequest(requestId: string, mentorUserId: string, data: { response: 'accept' | 'decline'; note?: string }) {
    // Auto-expire overdue
    await prisma.mentorshipRequest.updateMany({
      where: {
        id: requestId,
        status: 'pending',
        expiresAt: { lt: new Date() }
      },
      data: { status: 'expired' }
    });

    const request = await prisma.mentorshipRequest.findUnique({
      where: { id: requestId },
      include: { project: true }
    });

    if (!request) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Mentorship request not found' };
    }

    // Only the target mentor may respond
    if (request.mentorId !== mentorUserId) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only the requested mentor can respond to this request' };
    }

    if (request.status === 'expired' || request.expiresAt < new Date()) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Request has expired (7-day window passed)' };
    }

    if (request.status !== 'pending') {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: `Request is already ${request.status}` };
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: {
        status: data.response === 'accept' ? 'accepted' : 'declined',
      },
      include: {
        project: { select: { id: true, title: true, stage: true } },
        mentor: { select: { id: true, email: true } }
      }
    });

    eventBus.emitEvent(DomainEvent.MentorshipRequestResponded, {
      requestId: updated.id,
      projectId: updated.projectId,
      status: updated.status,
    });

    return updated;
  }

  /**
   * Submit advisory feedback for a project.
   * Mentor must have an accepted mentorship request for the project.
   */
  async createFeedback(projectId: string, mentorUserId: string, data: { text: string; milestoneId?: string | null }) {
    // Verify accepted mentorship request
    const acceptedRequest = await prisma.mentorshipRequest.findFirst({
      where: {
        projectId,
        mentorId: mentorUserId,
        status: 'accepted'
      }
    });

    if (!acceptedRequest) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only mentors with accepted mentorship on this project can provide feedback' };
    }

    if (data.milestoneId) {
      const milestone = await prisma.milestone.findUnique({
        where: { id: data.milestoneId }
      });
      if (!milestone || milestone.projectId !== projectId) {
        throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Invalid milestone for this project' };
      }
    }

    const feedback = await prisma.mentorFeedback.create({
      data: {
        projectId,
        mentorId: mentorUserId,
        milestoneId: data.milestoneId || null,
        text: data.text,
        isAdvisory: true,
      },
      include: {
        mentor: { select: { id: true, email: true } }
      }
    });

    eventBus.emitEvent(DomainEvent.MentorFeedbackCreated, {
      feedbackId: feedback.id,
      projectId: feedback.projectId,
      mentorId: feedback.mentorId,
    });

    return feedback;
  }

  /**
   * List advisory feedback for a project, optionally filtered by milestone.
   */
  async listFeedback(projectId: string, milestoneId?: string | null) {
    const where: any = { projectId };
    if (milestoneId) {
      where.milestoneId = milestoneId;
    }

    const feedbacks = await prisma.mentorFeedback.findMany({
      where,
      include: {
        mentor: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return feedbacks;
  }

  /**
   * List all mentorship requests for a project.
   */
  async listProjectRequests(projectId: string) {
    // Auto-expire overdue
    await prisma.mentorshipRequest.updateMany({
      where: {
        projectId,
        status: 'pending',
        expiresAt: { lt: new Date() }
      },
      data: { status: 'expired' }
    });

    const requests = await prisma.mentorshipRequest.findMany({
      where: { projectId },
      include: {
        mentor: { select: { id: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return requests;
  }
}
