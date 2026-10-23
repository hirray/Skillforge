import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

export class RealService {
  // -------------------------------------------------------------
  // 8.1 INVITATIONS
  // -------------------------------------------------------------
  async createInvitation(projectId: string, inviterId: string, data: { userId: string; role: string; note?: string | null; expiresDays?: number }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { roles: true, members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== inviterId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can send invitations' };

    const targetUser = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!targetUser) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'User not found' };

    if (project.members.some(m => m.userId === data.userId)) {
      throw { status: 400, code: 'ALREADY_MEMBER', message: 'User is already an active member of this project' };
    }
    if (project.ownerId === data.userId) {
      throw { status: 400, code: 'INVALID_TARGET', message: 'Cannot invite project owner' };
    }

    // Role check
    const role = project.roles.find(r => r.title.toLowerCase() === data.role.toLowerCase());
    if (!role) {
      throw { status: 400, code: 'ROLE_NOT_FOUND', message: `Role "${data.role}" does not exist on this project` };
    }
    if (role.openings <= role.filled) {
      throw { status: 400, code: 'ROLE_FULL', message: `No open positions available for role "${data.role}"` };
    }

    // Check existing pending invitation
    const existing = await prisma.projectInvitation.findFirst({
      where: { projectId, inviteeId: data.userId, status: 'pending' }
    });
    if (existing) {
      throw { status: 400, code: 'DUPLICATE_INVITATION', message: 'A pending invitation already exists for this user' };
    }

    const expiresAt = new Date(Date.now() + (data.expiresDays || 7) * 24 * 60 * 60 * 1000);

    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        inviterId: inviterId,
        inviteeId: data.userId,
        role: role.title,
        status: 'pending',
        expiresAt
      }
    });

    eventBus.emitEvent(DomainEvent.InvitationSent, { invitationId: invitation.id, projectId, userId: data.userId });
    return { data: invitation };
  }

  async respondInvitation(invitationId: string, userId: string, data: { response: 'accept' | 'decline' }) {
    const invitation = await prisma.projectInvitation.findUnique({
      where: { id: invitationId },
      include: {
        project: {
          include: {
            roles: true,
            members: { where: { status: 'active' } }
          }
        }
      }
    });
    if (!invitation) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Invitation not found' };
    if (invitation.inviteeId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Cannot respond to another user\'s invitation' };
    if (invitation.status !== 'pending' && invitation.status !== 'Pending') {
      throw { status: 400, code: 'INVALID_ACTION', message: `Invitation is already ${invitation.status}` };
    }

    // Expiry check
    if (new Date() > new Date(invitation.expiresAt)) {
      await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: 'expired' }
      });
      eventBus.emitEvent(DomainEvent.InvitationResponded, { invitationId, status: 'expired' });
      throw { status: 400, code: 'INVITATION_EXPIRED', message: 'Invitation has expired' };
    }

    // Check if role still exists on the project
    const role = invitation.project.roles.find(r => r.title.toLowerCase() === invitation.role.toLowerCase());
    if (!role || role.openings <= role.filled) {
      await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: 'declined' }
      });
      eventBus.emitEvent(DomainEvent.InvitationResponded, { invitationId, status: 'declined' });
      throw { status: 400, code: 'ROLE_NO_LONGER_EXISTS', message: 'This role is no longer available' };
    }

    if (data.response === 'accept') {
      const updatedInv = await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: 'accepted' }
      });

      // Add to ProjectMember
      const member = await prisma.projectMember.create({
        data: {
          projectId: invitation.projectId,
          userId,
          role: invitation.role,
          status: 'active',
          joinedAt: new Date()
        }
      });

      // Update role filled count
      await prisma.projectRole.update({
        where: { id: role.id },
        data: { filled: { increment: 1 } }
      });

      eventBus.emitEvent(DomainEvent.InvitationResponded, { invitationId, status: 'accepted' });
      eventBus.emitEvent(DomainEvent.MemberJoined, { projectId: invitation.projectId, userId });

      return { data: { invitation: updatedInv, member } };
    } else {
      const updatedInv = await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: 'declined' }
      });

      eventBus.emitEvent(DomainEvent.InvitationResponded, { invitationId, status: 'declined' });
      return { data: updatedInv };
    }
  }

  async listUserInvitations(userId: string) {
    const invitations = await prisma.projectInvitation.findMany({
      where: { inviteeId: userId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            visibility: true,
            duration: true,
            targetDate: true,
            stage: true,
            status: true,
            ownerId: true,
            members: {
              where: { status: 'active' },
              include: { user: { select: { id: true, email: true } } }
            },
            roles: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Auto-update expired invitations in place
    const now = new Date();
    const processed = await Promise.all(invitations.map(async inv => {
      if ((inv.status === 'pending' || inv.status === 'Pending') && now > new Date(inv.expiresAt)) {
        await prisma.projectInvitation.update({
          where: { id: inv.id },
          data: { status: 'expired' }
        });
        return { ...inv, status: 'expired' };
      }
      return inv;
    }));

    return { data: processed };
  }

  async listProjectInvitations(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can view project invitations' };

    const invitations = await prisma.projectInvitation.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return { data: invitations };
  }

  // -------------------------------------------------------------
  // 8.2 JOIN REQUESTS
  // -------------------------------------------------------------
  async createJoinRequest(projectId: string, userId: string, data: { role: string; message?: string | null }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { roles: true, members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    // Check project settings
    if (project.joinMode === 'invite') {
      throw { status: 400, code: 'JOIN_NOT_PERMITTED', message: 'This project does not accept open join requests' };
    }

    if (project.ownerId === userId) {
      throw { status: 400, code: 'INVALID_REQUESTER', message: 'Project owner cannot request to join their own project' };
    }

    if (project.members.some(m => m.userId === userId)) {
      throw { status: 400, code: 'ALREADY_MEMBER', message: 'You are already an active member of this project' };
    }

    const role = project.roles.find(r => r.title.toLowerCase() === data.role.toLowerCase());
    if (!role) {
      throw { status: 400, code: 'ROLE_NOT_FOUND', message: `Role "${data.role}" does not exist on this project` };
    }

    const existing = await prisma.joinRequest.findFirst({
      where: { projectId, userId, status: 'Pending' }
    });
    if (existing) {
      throw { status: 400, code: 'DUPLICATE_REQUEST', message: 'You already have a pending join request for this project' };
    }

    const joinRequest = await prisma.joinRequest.create({
      data: {
        projectId,
        userId,
        role: role.title,
        message: data.message || null,
        status: 'Pending',
        version: 1
      }
    });

    return { data: joinRequest };
  }

  async respondJoinRequest(requestId: string, userId: string, data: { action: 'accept' | 'reject'; reason?: string | null; version?: number }) {
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        project: {
          include: { roles: true, members: { where: { status: 'active' } } }
        }
      }
    });
    if (!joinRequest) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Join request not found' };
    if (joinRequest.project.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can handle join requests' };

    // Optimistic locking & duplicate action guard
    if (joinRequest.status !== 'Pending' || (data.version !== undefined && joinRequest.version !== data.version)) {
      throw { status: 409, code: 'CONCURRENCY_CONFLICT', message: 'Join request has already been handled' };
    }

    if (data.action === 'accept') {
      const updatedReq = await prisma.joinRequest.update({
        where: { id: requestId },
        data: {
          status: 'Accepted',
          version: joinRequest.version + 1
        }
      });

      const member = await prisma.projectMember.create({
        data: {
          projectId: joinRequest.projectId,
          userId: joinRequest.userId,
          role: joinRequest.role,
          status: 'active',
          joinedAt: new Date()
        }
      });

      const role = joinRequest.project.roles.find(r => r.title.toLowerCase() === joinRequest.role.toLowerCase());
      if (role) {
        await prisma.projectRole.update({
          where: { id: role.id },
          data: { filled: { increment: 1 } }
        });
      }

      eventBus.emitEvent(DomainEvent.MemberJoined, { projectId: joinRequest.projectId, userId: joinRequest.userId });
      return { data: { joinRequest: updatedReq, member } };
    } else {
      const updatedReq = await prisma.joinRequest.update({
        where: { id: requestId },
        data: {
          status: 'Rejected',
          rejectionReason: data.reason || null,
          version: joinRequest.version + 1
        }
      });

      return { data: updatedReq };
    }
  }

  async listProjectJoinRequests(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can view join requests' };

    const requests = await prisma.joinRequest.findMany({
      where: { projectId },
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return { data: requests };
  }

  // -------------------------------------------------------------
  // 8.3 MEMBERS & ROLES
  // -------------------------------------------------------------
  async listMembers(projectId: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, email: true } }
      },
      orderBy: { joinedAt: 'asc' }
    });

    return { data: members };
  }

  async updateMemberRole(projectId: string, targetUserId: string, callerId: string, data: { role: string; responsibilities?: string | null }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== callerId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can change member roles' };

    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: targetUserId, status: 'active' }
    });
    if (!member) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Active member not found' };

    const updated = await prisma.projectMember.update({
      where: { id: member.id },
      data: {
        role: data.role
      },
      include: { user: { select: { id: true, email: true } } }
    });

    return { data: updated };
  }

  // -------------------------------------------------------------
  // 8.4 TEAM ADMINISTRATION (REMOVE, LEAVE, OWNERSHIP TRANSFER)
  // -------------------------------------------------------------
  async removeMember(projectId: string, targetUserId: string, callerId: string, data: { reason: string }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== callerId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can remove members' };
    if (targetUserId === project.ownerId) throw { status: 400, code: 'CANNOT_REMOVE_OWNER', message: 'Cannot remove project owner. Transfer ownership first.' };

    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: targetUserId, status: 'active' }
    });
    if (!member) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Active member not found' };

    // Soft delete / preserve history
    const updated = await prisma.projectMember.update({
      where: { id: member.id },
      data: {
        status: 'removed',
        leftAt: new Date(),
        reason: data.reason
      }
    });

    eventBus.emitEvent(DomainEvent.MemberLeft, { projectId, userId: targetUserId });
    return { data: { message: 'Member removed successfully', member: updated } };
  }

  async leaveProject(projectId: string, userId: string, data: { reason?: string | null }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId === userId) {
      throw { status: 400, code: 'OWNER_CANNOT_LEAVE', message: 'Project owner cannot leave without transferring ownership first' };
    }

    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId, status: 'active' }
    });
    if (!member) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'You are not an active member of this project' };

    // Soft delete / preserve history
    const updated = await prisma.projectMember.update({
      where: { id: member.id },
      data: {
        status: 'left',
        leftAt: new Date(),
        reason: data.reason || null
      }
    });

    eventBus.emitEvent(DomainEvent.MemberLeft, { projectId, userId });
    return { data: { message: 'Left project successfully', member: updated } };
  }

  private transfers: Record<string, any> = {};

  async initiateOwnershipTransfer(projectId: string, callerId: string, data: { newOwnerId: string }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== callerId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can initiate ownership transfer' };
    if (data.newOwnerId === callerId) throw { status: 400, code: 'INVALID_NEW_OWNER', message: 'Cannot transfer ownership to yourself' };

    const isMember = project.members.some(m => m.userId === data.newOwnerId);
    if (!isMember) {
      throw { status: 400, code: 'TARGET_NOT_MEMBER', message: 'Designated new owner must be an active member of the project' };
    }

    const transfer = {
      id: `trans-${Date.now()}`,
      projectId,
      currentOwnerId: callerId,
      newOwnerId: data.newOwnerId,
      status: 'Pending',
      createdAt: new Date()
    };
    this.transfers[projectId] = transfer;

    return { data: transfer };
  }

  async respondOwnershipTransfer(projectId: string, userId: string, data: { action: 'accept' | 'decline' }) {
    const transfer = this.transfers[projectId];
    if (!transfer || transfer.newOwnerId !== userId || transfer.status !== 'Pending') {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'No pending ownership transfer found for you' };
    }

    if (data.action === 'accept') {
      transfer.status = 'Accepted';

      // Transfer owner on Project
      await prisma.project.update({
        where: { id: projectId },
        data: { ownerId: userId }
      });

      // Ensure former owner has a member record
      const formerOwnerMember = await prisma.projectMember.findFirst({
        where: { projectId, userId: transfer.currentOwnerId, status: 'active' }
      });
      if (!formerOwnerMember) {
        await prisma.projectMember.create({
          data: {
            projectId,
            userId: transfer.currentOwnerId,
            role: 'Contributor',
            status: 'active',
            joinedAt: new Date()
          }
        });
      }

      eventBus.emitEvent(DomainEvent.ProjectUpdated, { projectId });
      return { data: { message: 'Ownership transfer accepted', transfer } };
    } else {
      transfer.status = 'Declined';
      return { data: { message: 'Ownership transfer declined', transfer } };
    }
  }

  async getPendingTransfer(projectId: string) {
    const transfer = this.transfers[projectId];
    return { data: transfer && transfer.status === 'Pending' ? transfer : null };
  }
}

export const realTeamService = new RealService();
export const realService = realTeamService;
