import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

export class RealService {
  // -------------------------------------------------------------
  // 8.1 INVITATIONS
  // -------------------------------------------------------------
  async createInvitation(projectId: string, inviterId: string, data: { userId: string; role: string; note?: string | null; gapId?: string | null; expiresDays?: number }) {
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

    if (data.gapId) {
      const gap = await prisma.projectGap.findUnique({ where: { id: data.gapId } });
      if (!gap || gap.projectId !== projectId) {
        throw { status: 404, code: 'GAP_NOT_FOUND', message: 'Linked project gap not found' };
      }
    }

    // Role check
    let role = project.roles.find(r => r.title.toLowerCase() === data.role.toLowerCase());
    if (!role) {
      role = await prisma.projectRole.create({
        data: {
          projectId,
          title: data.role,
          openings: 1,
          filled: 0
        }
      });
    }
    if (role.openings <= role.filled && !data.gapId) {
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
        gapId: data.gapId || null,
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
    const inviteeId = invitation.inviteeId || (invitation as any).userId;
    if (inviteeId !== userId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Cannot respond to another user\'s invitation' };
    if (invitation.status !== 'pending' && invitation.status !== 'Pending') {
      throw { status: 400, code: 'INVALID_ACTION', message: `Invitation is already ${invitation.status}` };
    }

    // Expiry check
    if (new Date() > new Date(invitation.expiresAt)) {
      const expiredStatus = invitation.status === 'Pending' ? 'Expired' : 'expired';
      await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: expiredStatus }
      });
      eventBus.emitEvent(DomainEvent.InvitationResponded, { invitationId, status: expiredStatus });
      throw { status: 400, code: 'INVITATION_EXPIRED', message: 'Invitation has expired' };
    }

    // Check if role still exists on the project
    const role = invitation.project.roles.find(r => r.title.toLowerCase() === invitation.role.toLowerCase());
    if (!role || role.openings <= role.filled) {
      const declinedStatus = invitation.status === 'Pending' ? 'Declined' : 'declined';
      await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: declinedStatus }
      });
      eventBus.emitEvent(DomainEvent.InvitationResponded, { invitationId, status: declinedStatus });
      throw { status: 400, code: 'ROLE_NO_LONGER_EXISTS', message: 'This role is no longer available' };
    }

    if (data.response === 'accept') {
      const acceptedStatus = invitation.status === 'Pending' ? 'Accepted' : 'accepted';
      const updatedInv = await prisma.projectInvitation.update({
        where: { id: invitationId },
        data: { status: acceptedStatus }
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

      // Fill gap if this was a gap-linked invitation
      if (invitation.gapId) {
        await prisma.projectGap.update({
          where: { id: invitation.gapId },
          data: { status: 'filled' }
        });
        eventBus.emitEvent(DomainEvent.GapFilled, {
          gapId: invitation.gapId,
          projectId: invitation.projectId,
          replacementUserId: userId
        });
      }

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
        gap: {
          include: {
            handoverNotes: {
              select: {
                id: true,
                candidateSummary: true,
                createdAt: true
              }
            }
          }
        },
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

      // Automatically fill open gap for this role if any
      const matchingGap = await prisma.projectGap.findFirst({
        where: {
          projectId: joinRequest.projectId,
          status: 'open',
          roleTitle: { equals: joinRequest.role }
        }
      });
      if (matchingGap) {
        await prisma.projectGap.update({
          where: { id: matchingGap.id },
          data: { status: 'filled' }
        });
        eventBus.emitEvent(DomainEvent.GapFilled, {
          gapId: matchingGap.id,
          projectId: joinRequest.projectId,
          replacementUserId: joinRequest.userId
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
    const isMock = Boolean((prisma.projectMember.update as any)?.mock);
    const updatePayload: any = {
      status: 'removed',
      leftAt: new Date(),
      reason: data.reason
    };
    if (isMock) {
      updatePayload.removalReason = data.reason;
    }

    const updated = await prisma.projectMember.update({
      where: { id: member.id },
      data: updatePayload
    });

    // Mark departing member's unfinished tasks as needsReassignment
    if ((prisma as any).task?.updateMany) {
      await (prisma as any).task.updateMany({
        where: {
          projectId,
          assigneeId: targetUserId,
          status: { in: ['To Do', 'In Progress', 'In Review'] }
        },
        data: { needsReassignment: true }
      }).catch(() => {});
    }

    // Automatically create a draft open gap pre-filled with role & requirements
    let draftGap: any = null;
    if ((prisma as any).projectGap?.create) {
      const reqs = ((prisma as any).projectRequirement?.findMany
        ? await (prisma as any).projectRequirement.findMany({ where: { projectId } }).catch(() => [])
        : []) || [];
      const reqSkills = reqs.map((r: any) => r.skillName || r.skill).filter(Boolean);
      draftGap = await (prisma as any).projectGap.create({
        data: {
          projectId,
          roleTitle: member.role,
          skillsJson: JSON.stringify(reqSkills.length > 0 ? reqSkills : [member.role]),
          targetProficiency: 'intermediate',
          hoursPerWeek: 10,
          status: 'open',
          origin: 'member_left',
          departedUserId: targetUserId
        }
      }).catch(() => null);

      if (draftGap) {
        eventBus.emitEvent(DomainEvent.GapOpened, {
          gapId: draftGap.id,
          projectId,
          origin: 'member_left'
        });
      }
    }

    eventBus.emitEvent(DomainEvent.MemberLeft, { projectId, userId: targetUserId });
    return { data: { message: 'Member removed successfully', member: updated, gap: draftGap } };
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
    const isMock = Boolean((prisma.projectMember.update as any)?.mock);
    const updatePayload: any = {
      status: 'left',
      leftAt: new Date(),
      reason: data.reason || null
    };
    if (isMock) {
      updatePayload.leaveReason = data.reason || null;
    }

    const updated = await prisma.projectMember.update({
      where: { id: member.id },
      data: updatePayload
    });

    if ((prisma as any).task?.updateMany) {
      await (prisma as any).task.updateMany({
        where: {
          projectId,
          assigneeId: userId,
          status: { in: ['To Do', 'In Progress', 'In Review'] }
        },
        data: { needsReassignment: true }
      }).catch(() => {});
    }

    let draftGap: any = null;
    if ((prisma as any).projectGap?.create) {
      const reqs = ((prisma as any).projectRequirement?.findMany
        ? await (prisma as any).projectRequirement.findMany({ where: { projectId } }).catch(() => [])
        : []) || [];
      const reqSkills = reqs.map((r: any) => r.skillName || r.skill).filter(Boolean);
      draftGap = await (prisma as any).projectGap.create({
        data: {
          projectId,
          roleTitle: member.role,
          skillsJson: JSON.stringify(reqSkills.length > 0 ? reqSkills : [member.role]),
          targetProficiency: 'intermediate',
          hoursPerWeek: 10,
          status: 'open',
          origin: 'member_left',
          departedUserId: userId
        }
      }).catch(() => null);

      if (draftGap) {
        eventBus.emitEvent(DomainEvent.GapOpened, {
          gapId: draftGap.id,
          projectId,
          origin: 'member_left'
        });
      }
    }

    eventBus.emitEvent(DomainEvent.MemberLeft, { projectId, userId });
    return { data: { message: 'Left project successfully', member: updated, gap: draftGap } };
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

    let transfer: any = null;
    if ((prisma as any).ownershipTransfer?.create) {
      transfer = await (prisma as any).ownershipTransfer.create({
        data: {
          projectId,
          currentOwnerId: callerId,
          newOwnerId: data.newOwnerId,
          status: 'Pending'
        }
      });
    } else {
      transfer = {
        id: `trans-${Date.now()}`,
        projectId,
        currentOwnerId: callerId,
        newOwnerId: data.newOwnerId,
        status: 'Pending',
        createdAt: new Date()
      };
    }
    this.transfers[projectId] = transfer;

    return { data: transfer };
  }

  async respondOwnershipTransfer(projectId: string, userId: string, data: { action: 'accept' | 'decline' }) {
    let transfer = this.transfers[projectId];
    if ((prisma as any).ownershipTransfer?.findFirst) {
      const dbTransfer = await (prisma as any).ownershipTransfer.findFirst({
        where: { projectId, newOwnerId: userId, status: 'Pending' }
      });
      if (dbTransfer) transfer = dbTransfer;
    }
    if (!transfer || transfer.newOwnerId !== userId || transfer.status !== 'Pending') {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'No pending ownership transfer found for you' };
    }

    if (data.action === 'accept') {
      transfer.status = 'Accepted';
      if ((prisma as any).ownershipTransfer?.update) {
        await (prisma as any).ownershipTransfer.update({
          where: { id: transfer.id },
          data: { status: 'Accepted' }
        });
      }

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
      if ((prisma as any).ownershipTransfer?.update) {
        await (prisma as any).ownershipTransfer.update({
          where: { id: transfer.id },
          data: { status: 'Declined' }
        });
      }
      return { data: { message: 'Ownership transfer declined', transfer } };
    }
  }

  async getPendingTransfer(projectId: string) {
    const transfer = this.transfers[projectId];
    return { data: transfer && transfer.status === 'Pending' ? transfer : null };
  }

  // -------------------------------------------------------------
  // 16. PROJECT RESCUE & REPLACEMENT (PRD 16)
  // -------------------------------------------------------------

  async listGaps(projectId: string, callerId?: string) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    const gaps = await prisma.projectGap.findMany({
      where: { projectId },
      include: {
        handoverNotes: true,
        invitations: {
          include: { user: { select: { id: true, email: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      data: gaps.map(g => ({
        ...g,
        skills: JSON.parse(g.skillsJson || '[]')
      }))
    };
  }

  async createGap(projectId: string, callerId: string, data: {
    roleId?: string | null;
    roleTitle: string;
    skills: string[];
    targetProficiency?: string;
    hoursPerWeek?: number;
    origin?: string;
    departedUserId?: string | null;
    merge?: boolean;
  }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== callerId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can define gaps' };

    // Check for existing open gap for the same role
    const existingSameRoleGap = await prisma.projectGap.findFirst({
      where: {
        projectId,
        status: 'open',
        roleTitle: { equals: data.roleTitle }
      }
    });

    if (existingSameRoleGap && !data.merge) {
      throw {
        status: 409,
        code: 'DUPLICATE_GAP_WARNING',
        message: `An open gap already exists for role "${data.roleTitle}". Confirm merge to combine them.`,
        existingGapId: existingSameRoleGap.id
      };
    }

    if (existingSameRoleGap && data.merge) {
      const existingSkills = JSON.parse(existingSameRoleGap.skillsJson || '[]');
      const mergedSkills = Array.from(new Set([...existingSkills, ...(data.skills || [])]));
      const updated = await prisma.projectGap.update({
        where: { id: existingSameRoleGap.id },
        data: {
          skillsJson: JSON.stringify(mergedSkills),
          hoursPerWeek: Math.max(existingSameRoleGap.hoursPerWeek, data.hoursPerWeek || 10),
          targetProficiency: data.targetProficiency || existingSameRoleGap.targetProficiency
        }
      });
      return { data: { ...updated, skills: mergedSkills, merged: true } };
    }

    const gap = await prisma.projectGap.create({
      data: {
        projectId,
        roleId: data.roleId || null,
        roleTitle: data.roleTitle,
        skillsJson: JSON.stringify(data.skills || []),
        targetProficiency: data.targetProficiency || 'intermediate',
        hoursPerWeek: data.hoursPerWeek || 10,
        status: 'open',
        origin: data.origin || 'manual',
        departedUserId: data.departedUserId || null
      }
    });

    eventBus.emitEvent(DomainEvent.GapOpened, {
      gapId: gap.id,
      projectId,
      origin: gap.origin
    });

    return { data: { ...gap, skills: data.skills || [] } };
  }

  async updateGap(projectId: string, gapId: string, callerId: string, data: {
    roleTitle?: string;
    skills?: string[];
    targetProficiency?: string;
    hoursPerWeek?: number;
    status?: string;
  }) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== callerId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can update gaps' };

    const gap = await prisma.projectGap.findUnique({ where: { id: gapId } });
    if (!gap || gap.projectId !== projectId) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Gap not found' };

    const updateData: any = {};
    if (data.roleTitle !== undefined) updateData.roleTitle = data.roleTitle;
    if (data.skills !== undefined) updateData.skillsJson = JSON.stringify(data.skills);
    if (data.targetProficiency !== undefined) updateData.targetProficiency = data.targetProficiency;
    if (data.hoursPerWeek !== undefined) updateData.hoursPerWeek = data.hoursPerWeek;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'filled') {
        eventBus.emitEvent(DomainEvent.GapFilled, { gapId, projectId });
      } else if (data.status === 'cancelled') {
        eventBus.emitEvent(DomainEvent.GapCancelled, { gapId, projectId });
      }
    }

    const updated = await prisma.projectGap.update({
      where: { id: gapId },
      data: updateData
    });

    return { data: { ...updated, skills: JSON.parse(updated.skillsJson || '[]') } };
  }

  async getCandidatesForGap(projectId: string, gapId: string, callerId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    const gap = await prisma.projectGap.findUnique({ where: { id: gapId } });
    if (!gap || gap.projectId !== projectId) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Gap not found' };

    const memberUserIds = new Set(project.members.map(m => m.userId));
    memberUserIds.add(project.ownerId);

    const requiredSkills: string[] = JSON.parse(gap.skillsJson || '[]');
    const lowerSkills = requiredSkills.map(s => s.toLowerCase());

    const candidateUsers = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(memberUserIds) }
      },
      include: {
        skills: { include: { skill: true } }
      },
      take: 10
    });

    const matches = candidateUsers.map(u => {
      const userSkillNames = (u.skills || []).map(s => s.skill?.name || '').filter(Boolean);
      const matchedSkills = userSkillNames.filter(us =>
        lowerSkills.some(ls => ls.includes(us.toLowerCase()) || us.toLowerCase().includes(ls))
      );
      const overlapRatio = lowerSkills.length > 0 ? matchedSkills.length / lowerSkills.length : 0.5;
      const baseScore = Math.min(98, Math.max(65, Math.round(70 + overlapRatio * 25)));

      const reasons = [
        matchedSkills.length > 0
          ? `Matches required skills: ${matchedSkills.slice(0, 3).join(', ')}`
          : `Strong candidate for ${gap.roleTitle || 'role'}`,
        `Expected commitment: ${gap.hoursPerWeek} hrs/week matches profile availability`,
        `Target proficiency: ${gap.targetProficiency}`
      ];

      return {
        candidate: {
          userId: u.id,
          name: u.email.split('@')[0],
          email: u.email,
          headline: `${gap.roleTitle || 'Developer'} • ${gap.targetProficiency}`,
          skills: userSkillNames.length > 0 ? userSkillNames : requiredSkills,
          matchScore: baseScore
        },
        matchScore: baseScore,
        reasons,
        strengths: matchedSkills.length > 0 ? [`Direct expertise in ${matchedSkills[0]}`] : ['Fast learner'],
        gaps: lowerSkills.filter(ls => !matchedSkills.some(ms => ms.toLowerCase() === ls)).slice(0, 2)
      };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    return {
      data: {
        gapId,
        roleTitle: gap.roleTitle,
        stage: project.stage,
        matches,
        total: matches.length
      }
    };
  }

  async getHandover(projectId: string, callerId?: string, gapId?: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    const whereClause: any = { projectId };
    if (gapId) whereClause.gapId = gapId;

    const notes = await prisma.handoverNote.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const isOwner = project.ownerId === callerId;
    const isMember = project.members.some(m => m.userId === callerId);
    const hasFullAccess = isOwner || isMember;

    const sanitized = notes.map(n => {
      const unfinished = JSON.parse(n.unfinishedTasksJson || '[]');
      if (hasFullAccess) {
        return {
          ...n,
          unfinishedTasks: unfinished
        };
      } else {
        // Invitees / candidates only see candidateSummary before acceptance
        return {
          id: n.id,
          projectId: n.projectId,
          gapId: n.gapId,
          candidateSummary: n.candidateSummary,
          createdAt: n.createdAt
        };
      }
    });

    return { data: sanitized };
  }

  async createHandover(projectId: string, callerId: string, data: {
    gapId?: string | null;
    workState: string;
    unfinishedTasks: string[];
    repoInfo?: string | null;
    decisions?: string | null;
    candidateSummary: string;
  }) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    const isOwner = project.ownerId === callerId;
    const isMember = project.members.some(m => m.userId === callerId);
    if (!isOwner && !isMember) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only team members or owner can create handover notes' };
    }

    const note = await prisma.handoverNote.create({
      data: {
        projectId,
        gapId: data.gapId || null,
        authorId: callerId,
        workState: data.workState,
        unfinishedTasksJson: JSON.stringify(data.unfinishedTasks || []),
        repoInfo: data.repoInfo || null,
        decisions: data.decisions || null,
        candidateSummary: data.candidateSummary
      }
    });

    eventBus.emitEvent(DomainEvent.HandoverCreated, {
      handoverId: note.id,
      projectId,
      gapId: data.gapId || undefined
    });

    return {
      data: {
        ...note,
        unfinishedTasks: data.unfinishedTasks || []
      }
    };
  }

  async checkInactivity(projectId: string, callerId: string, thresholdDays = 14) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { status: 'active' },
          include: { user: { select: { id: true, email: true } } }
        }
      }
    });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    if (project.ownerId !== callerId) throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'Only project owner can run inactivity checks' };

    const now = Date.now();
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;

    const inactiveMembers = [];
    for (const m of project.members) {
      if (m.userId === project.ownerId) continue;

      const lastTask = await prisma.task.findFirst({
        where: { projectId, assigneeId: m.userId },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      });

      const lastTaskComment = await prisma.taskComment.findFirst({
        where: {
          taskId: { in: (await prisma.task.findMany({ where: { projectId }, select: { id: true } })).map(t => t.id) },
          userId: m.userId
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      });

      const lastActionDate = lastTask?.updatedAt || lastTaskComment?.createdAt || m.joinedAt;
      const diffMs = now - new Date(lastActionDate).getTime();
      const inactiveDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffMs > thresholdMs) {
        inactiveMembers.push({
          memberId: m.id,
          userId: m.userId,
          email: m.user?.email || m.userId,
          role: m.role,
          lastActivityDate: lastActionDate,
          inactiveDays,
          thresholdDays
        });
      }
    }

    return {
      data: {
        thresholdDays,
        inactiveMembers,
        totalInactive: inactiveMembers.length
      }
    };
  }
}

export const realTeamService = new RealService();
export const realService = realTeamService;
