import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';
import { broadcastToProject, broadcastToChat, removeUserFromProjectRoom } from '../../core/socket';

const prisma = new PrismaClient();

// Wire cross-module event listeners once
let chatEventListenersRegistered = false;

export function registerChatEventListeners() {
  if (chatEventListenersRegistered) return;
  chatEventListenersRegistered = true;

  // 1. MemberJoined event
  eventBus.onEvent(DomainEvent.MemberJoined, async ({ projectId, userId }) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userName = user?.email?.split('@')[0] || userId;

      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId,
          action: 'MemberJoined',
          details: JSON.stringify({
            title: 'Member Joined Team',
            detail: `${userName} joined the project team.`,
            userId,
            userName,
          }),
        },
      });

      // Write notification to other members
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: { where: { status: 'active' } } },
      });

      if (project) {
        const recipients = new Set([project.ownerId, ...project.members.map((m) => m.userId)]);
        recipients.delete(userId);

        for (const recipientId of recipients) {
          await prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'team',
              message: `${userName} has joined ${project.title}.`,
              link: `/projects/${projectId}`,
            },
          });
        }
      }
    } catch (err) {
      console.error('[Chat/Activity] Error handling MemberJoined event:', err);
    }
  });

  // 2. MemberLeft event
  eventBus.onEvent(DomainEvent.MemberLeft, async ({ projectId, userId }) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const userName = user?.email?.split('@')[0] || userId;

      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId,
          action: 'MemberLeft',
          details: JSON.stringify({
            title: 'Member Left Team',
            detail: `${userName} left the project team.`,
            userId,
            userName,
          }),
        },
      });

      // Disconnect socket from real-time project room
      removeUserFromProjectRoom(projectId, userId);

      // Write notification
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (project && project.ownerId !== userId) {
        await prisma.notification.create({
          data: {
            userId: project.ownerId,
            type: 'team',
            message: `${userName} has left ${project.title}.`,
            link: `/projects/${projectId}`,
          },
        });
      }
    } catch (err) {
      console.error('[Chat/Activity] Error handling MemberLeft event:', err);
    }
  });

  // 3. TaskCompleted event
  eventBus.onEvent(DomainEvent.TaskCompleted, async ({ taskId, projectId }) => {
    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      const taskTitle = task?.title || 'A task';
      const actorId = task?.assigneeId || 'system';

      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId: actorId,
          action: 'TaskCompleted',
          details: JSON.stringify({
            title: 'Task Completed',
            detail: `Task "${taskTitle}" was marked as completed.`,
            taskId,
            taskTitle,
          }),
        },
      });

      // Write notifications to project owner and team
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: { where: { status: 'active' } } },
      });

      if (project) {
        const recipients = new Set([project.ownerId, ...project.members.map((m) => m.userId)]);
        if (task?.assigneeId) recipients.delete(task.assigneeId);

        for (const recipientId of recipients) {
          await prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'task',
              message: `Task "${taskTitle}" was completed in ${project.title}.`,
              link: `/projects/${projectId}`,
            },
          });
        }
      }
    } catch (err) {
      console.error('[Chat/Activity] Error handling TaskCompleted event:', err);
    }
  });

  // 4. TaskCreated event
  eventBus.onEvent(DomainEvent.TaskCreated, async ({ taskId, projectId }) => {
    try {
      const task = await prisma.task.findUnique({ where: { id: taskId } });
      const taskTitle = task?.title || 'A task';
      const actorId = task?.assigneeId || 'system';

      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId: actorId,
          action: 'TaskCreated',
          details: JSON.stringify({
            title: 'New Task Created',
            detail: `Task "${taskTitle}" was created.`,
            taskId,
            taskTitle,
          }),
        },
      });
    } catch (err) {
      console.error('[Chat/Activity] Error handling TaskCreated event:', err);
    }
  });

  // 5. ProjectUpdated event
  eventBus.onEvent(DomainEvent.ProjectUpdated, async ({ projectId }) => {
    try {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) return;

      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId: project.ownerId,
          action: 'ProjectUpdated',
          details: JSON.stringify({
            title: 'Project Updated',
            detail: `Project "${project.title}" details were updated.`,
            projectId,
            stage: project.stage,
          }),
        },
      });
    } catch (err) {
      console.error('[Chat/Activity] Error handling ProjectUpdated event:', err);
    }
  });

  // 6. MilestoneReached event
  eventBus.onEvent(DomainEvent.MilestoneReached, async ({ milestoneId, projectId }) => {
    try {
      const milestone = await prisma.milestone.findUnique({ where: { id: milestoneId } });
      const milestoneTitle = milestone?.title || 'A milestone';
      const actorId = milestone?.completedBy || 'system';

      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId: actorId,
          action: 'MilestoneReached',
          details: JSON.stringify({
            title: 'Milestone Completed 🎯',
            detail: `Milestone "${milestoneTitle}" has been reached!`,
            milestoneId,
            milestoneTitle,
            isManualCompletion: milestone?.isManualCompletion || false,
            rationale: milestone?.completionRationale || null,
          }),
        },
      });

      // Write notifications to project team
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: { where: { status: 'active' } } },
      });

      if (project) {
        const recipients = new Set([project.ownerId, ...project.members.map((m) => m.userId)]);
        if (actorId && actorId !== 'system') recipients.delete(actorId);

        for (const recipientId of recipients) {
          await prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'milestone',
              message: `Milestone "${milestoneTitle}" was reached in ${project.title}!`,
              link: `/projects/${projectId}`,
            },
          });
        }
      }
    } catch (err) {
      console.error('[Chat/Activity] Error handling MilestoneReached event:', err);
    }
  });

  // 7. ResourceAdded event
  eventBus.onEvent(DomainEvent.ResourceAdded, async ({ resourceId, projectId, addedBy, title, type }) => {
    try {
      const typeLabel = type === 'file' ? 'a file' : 'an external link';
      await prisma.activityFeedEntry.create({
        data: {
          projectId,
          userId: addedBy || 'system',
          action: 'ResourceAdded',
          details: JSON.stringify({
            title: 'Resource Shared 📎',
            detail: `Shared ${typeLabel}: "${title}".`,
            resourceId,
            resourceTitle: title,
            type,
            addedBy,
          }),
        },
      });

      // Write notifications to project team
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: { where: { status: 'active' } } },
      });

      if (project) {
        const recipients = new Set([project.ownerId, ...project.members.map((m) => m.userId)]);
        if (addedBy && addedBy !== 'system') recipients.delete(addedBy);

        for (const recipientId of recipients) {
          await prisma.notification.create({
            data: {
              userId: recipientId,
              type: 'resource',
              message: `New resource "${title}" added to ${project.title}.`,
              link: `/projects/${projectId}`,
            },
          });
        }
      }
    } catch (err) {
      console.error('[Chat/Activity] Error handling ResourceAdded event:', err);
    }
  });
}

registerChatEventListeners();

export class RealService {
  /**
   * Helper: Ensure caller is an active confirmed member or owner of the project.
   */
  async ensureProjectMember(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { status: 'active' },
          include: { user: true },
        },
        owner: true,
      },
    });

    if (!project) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    }

    const isOwner = project.ownerId === userId;
    const isMember = project.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) {
      throw {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: 'Only confirmed active project members can access this project room',
      };
    }

    return project;
  }

  /**
   * Helper: Get or create default group ChatRoom for project.
   */
  async getOrCreateGroupRoom(projectId: string) {
    let room = await prisma.chatRoom.findFirst({
      where: { projectId, type: 'group' },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          projectId,
          type: 'group',
          name: 'Main Room',
        },
      });
    }

    return room;
  }

  /**
   * Format message payload with sender info and "Former member" label if no longer active.
   */
  formatMessage(message: any, activeMemberIds: Set<string>, ownerId: string, usersMap: Map<string, any>) {
    const isSenderActive = activeMemberIds.has(message.senderId) || message.senderId === ownerId;
    const user = usersMap.get(message.senderId);
    const rawName = user?.email?.split('@')[0] || message.senderId;

    let senderName = rawName;
    let isFormerMember = false;

    if (!isSenderActive) {
      senderName = 'Former member';
      isFormerMember = true;
    }

    let attachments = [];
    if (message.attachments) {
      try {
        attachments = typeof message.attachments === 'string' ? JSON.parse(message.attachments) : message.attachments;
      } catch {
        attachments = [];
      }
    }

    let mentions = [];
    if (message.mentions) {
      try {
        mentions = typeof message.mentions === 'string' ? JSON.parse(message.mentions) : message.mentions;
      } catch {
        mentions = [];
      }
    }

    const isDeleted = Boolean(message.isDeleted || message.deleted);
    const isEdited = Boolean(message.isEdited || message.edited);
    const parentId = message.parentId || message.replyToId || null;

    return {
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      senderName,
      isFormerMember,
      senderEmail: isFormerMember ? undefined : user?.email,
      content: isDeleted ? '(deleted)' : message.content,
      attachments,
      mentions,
      replyToId: parentId,
      parentId,
      edited: isEdited,
      isEdited,
      deleted: isDeleted,
      isDeleted,
      createdAt: message.createdAt instanceof Date ? message.createdAt.toISOString() : String(message.createdAt),
      updatedAt: message.updatedAt instanceof Date ? message.updatedAt.toISOString() : String(message.updatedAt),
    };
  }

  // ==========================================
  // 9.2 GROUP CHAT
  // ==========================================

  async getProjectMessages(projectId: string, userId: string, query: { page?: number; limit?: number; before?: string }) {
    const project = await this.ensureProjectMember(projectId, userId);
    const room = await this.getOrCreateGroupRoom(projectId);

    const activeMemberIds = new Set(project.members.map((m) => m.userId));
    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const whereClause: any = { roomId: room.id };
    if (query.before) {
      whereClause.createdAt = { lt: new Date(query.before) };
    }

    const [rawMessages, total] = await Promise.all([
      prisma.message.findMany({
        where: whereClause,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: whereClause }),
    ]);

    const messages = rawMessages.map((m) => this.formatMessage(m, activeMemberIds, project.ownerId, usersMap));

    return {
      items: messages,
      total,
      page,
      pageSize: limit,
      roomId: room.id,
    };
  }

  async sendProjectMessage(
    projectId: string,
    userId: string,
    payload: { content: string; attachments?: any[]; replyToId?: string | null; mentions?: string[] }
  ) {
    const project = await this.ensureProjectMember(projectId, userId);
    const room = await this.getOrCreateGroupRoom(projectId);

    const activeMemberIds = new Set(project.members.map((m) => m.userId));
    activeMemberIds.add(project.ownerId);

    // Validate mentions: only active members/owner
    let validMentions: string[] = [];
    if (payload.mentions && Array.isArray(payload.mentions)) {
      validMentions = payload.mentions.filter((mId) => activeMemberIds.has(mId));
    }

    const message = await prisma.message.create({
      data: {
        roomId: room.id,
        senderId: userId,
        content: payload.content,
        attachments: payload.attachments ? JSON.stringify(payload.attachments) : null,
        mentions: validMentions.length > 0 ? JSON.stringify(validMentions) : null,
        parentId: payload.replyToId || null,
        isEdited: false,
        isDeleted: false,
      },
    });

    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));
    const formatted = this.formatMessage(message, activeMemberIds, project.ownerId, usersMap);

    // Publish domain event
    eventBus.emitEvent(DomainEvent.MessageSent, { messageId: message.id, roomId: room.id });

    // Broadcast via Socket.IO
    broadcastToProject(projectId, 'message:new', { ...formatted, projectId });

    // Create notifications for mentions & other members
    const senderName = usersMap.get(userId)?.email?.split('@')[0] || userId;

    // 1. Mentions
    for (const mentionedId of validMentions) {
      if (mentionedId !== userId) {
        await prisma.notification.create({
          data: {
            userId: mentionedId,
            type: 'mention',
            message: `${senderName} mentioned you in ${project.title}: "${payload.content.slice(0, 80)}"`,
            link: `/projects/${projectId}`,
          },
        });
      }
    }

    // 2. Regular message notifications for team members
    for (const memberId of activeMemberIds) {
      if (memberId !== userId && !validMentions.includes(memberId)) {
        await prisma.notification.create({
          data: {
            userId: memberId,
            type: 'message',
            message: `New message from ${senderName} in ${project.title}`,
            link: `/projects/${projectId}`,
          },
        });
      }
    }

    return formatted;
  }

  async editMessage(projectId: string, messageId: string, userId: string, payload: { content: string }) {
    await this.ensureProjectMember(projectId, userId);

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { room: true },
    });

    if (!message) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Message not found' };
    }

    if (message.senderId !== userId) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'You can only edit your own messages' };
    }

    if (message.isDeleted) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Cannot edit a deleted message' };
    }

    // Check 10 minute edit window
    const now = Date.now();
    const createdTime = new Date(message.createdAt).getTime();
    const tenMinutes = 10 * 60 * 1000;
    if (now - createdTime > tenMinutes) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Message edit window expired. Messages can only be edited within 10 minutes.',
      };
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: payload.content,
        isEdited: true,
      },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } },
    });
    const activeMemberIds = new Set((project?.members || []).map((m) => m.userId));
    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const formatted = this.formatMessage(updated, activeMemberIds, project?.ownerId || '', usersMap);

    // Broadcast edit
    if (message.room.type === 'direct') {
      broadcastToChat(message.roomId, 'message:edit', formatted);
    } else {
      broadcastToProject(projectId, 'message:edit', { ...formatted, projectId });
    }

    return formatted;
  }

  async deleteMessage(projectId: string, messageId: string, userId: string) {
    const project = await this.ensureProjectMember(projectId, userId);

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { room: true },
    });

    if (!message) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Message not found' };
    }

    const isOwner = project.ownerId === userId;
    const isSender = message.senderId === userId;

    if (!isSender && !isOwner) {
      throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'You can only delete your own messages' };
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        content: '(deleted)',
      },
    });

    const activeMemberIds = new Set(project.members.map((m) => m.userId));
    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const formatted = this.formatMessage(updated, activeMemberIds, project.ownerId, usersMap);

    // Broadcast delete
    if (message.room.type === 'direct') {
      broadcastToChat(message.roomId, 'message:delete', formatted);
    } else {
      broadcastToProject(projectId, 'message:delete', { ...formatted, projectId });
    }

    return formatted;
  }

  async reportMessage(projectId: string, messageId: string, userId: string, payload: { reason: string }) {
    await this.ensureProjectMember(projectId, userId);

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Message not found' };
    }

    const report = await prisma.report.create({
      data: {
        type: 'message',
        status: 'pending',
      },
    });

    return { success: true, message: 'Message reported to moderators', reportId: report?.id || 'report-1' };
  }

  async markMessagesRead(projectId: string, roomId: string, userId: string) {
    await this.ensureProjectMember(projectId, userId);
    broadcastToProject(projectId, 'message:read', { roomId, userId });
    return { success: true };
  }

  // ==========================================
  // 9.3 INDIVIDUAL (1:1) CHAT
  // ==========================================

  async getUserDirectChats(projectId: string, userId: string) {
    const project = await this.ensureProjectMember(projectId, userId);

    const rooms = await prisma.chatRoom.findMany({
      where: {
        projectId,
        type: 'direct',
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    return rooms.map((room) => {
      const otherUserId = room.participant1Id === userId ? room.participant2Id : room.participant1Id;
      const otherUser = otherUserId ? usersMap.get(otherUserId) : null;
      const isOtherActive = project.members.some((m) => m.userId === otherUserId) || project.ownerId === otherUserId;

      const lastMsg = room.messages[0] || null;

      return {
        id: room.id,
        projectId: room.projectId,
        type: 'direct',
        otherUserId,
        otherUserName: isOtherActive ? (otherUser?.email?.split('@')[0] || otherUserId) : 'Former member',
        otherUserEmail: isOtherActive ? otherUser?.email : undefined,
        isOtherFormerMember: !isOtherActive,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.isDeleted ? '(deleted)' : lastMsg.content,
              senderId: lastMsg.senderId,
              createdAt: lastMsg.createdAt.toISOString(),
            }
          : null,
        updatedAt: room.updatedAt.toISOString(),
      };
    });
  }

  async getOrCreateDirectChat(projectId: string, userId: string, recipientId: string) {
    await this.ensureProjectMember(projectId, userId);

    if (userId === recipientId) {
      throw { status: 400, code: ErrorCode.VALIDATION_ERROR, message: 'Cannot start a 1:1 chat with yourself' };
    }

    // Verify recipient is also an active member or owner
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: 'active' } } }
    });

    const isRecipientActive = (project?.members || []).some((m) => m.userId === recipientId) || project?.ownerId === recipientId;
    if (!isRecipientActive) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Recipient is not an active confirmed member of this project',
      };
    }

    let room = await prisma.chatRoom.findFirst({
      where: {
        projectId,
        type: 'direct',
        OR: [
          { participant1Id: userId, participant2Id: recipientId },
          { participant1Id: recipientId, participant2Id: userId },
        ],
      },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          projectId,
          type: 'direct',
          participant1Id: userId,
          participant2Id: recipientId,
        },
      });
    }

    const otherUser = await prisma.user.findUnique({ where: { id: recipientId } });

    return {
      id: room.id,
      projectId: room.projectId,
      type: 'direct',
      otherUserId: recipientId,
      otherUserName: otherUser?.email?.split('@')[0] || recipientId,
      otherUserEmail: otherUser?.email,
      createdAt: room.createdAt.toISOString(),
    };
  }

  async getDirectChatMessages(chatId: string, userId: string, query: { page?: number; limit?: number }) {
    const room = await prisma.chatRoom.findUnique({
      where: { id: chatId },
    });

    if (!room) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Chat room not found' };
    }

    // HARD PRIVACY ENFORCEMENT: Only participant1 or participant2 can access
    if (room.type === 'direct') {
      if (room.participant1Id !== userId && room.participant2Id !== userId) {
        throw {
          status: 403,
          code: ErrorCode.FORBIDDEN,
          message: 'Access Denied: You are not a participant in this private conversation',
        };
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: room.projectId },
      include: { members: { where: { status: 'active' } } },
    });

    const activeMemberIds = new Set((project?.members || []).map((m) => m.userId));
    if (project?.ownerId) activeMemberIds.add(project.ownerId);

    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const [rawMessages, total] = await Promise.all([
      prisma.message.findMany({
        where: { roomId: chatId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.message.count({ where: { roomId: chatId } }),
    ]);

    const messages = rawMessages.map((m) => this.formatMessage(m, activeMemberIds, project?.ownerId || '', usersMap));

    return {
      items: messages,
      total,
      page,
      pageSize: limit,
      roomId: room.id,
    };
  }

  async sendDirectMessage(
    chatId: string,
    userId: string,
    payload: { content: string; attachments?: any[]; replyToId?: string | null; mentions?: string[] }
  ) {
    const room = await prisma.chatRoom.findUnique({
      where: { id: chatId },
    });

    if (!room) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Chat room not found' };
    }

    // Privacy enforcement
    if (room.type === 'direct') {
      if (room.participant1Id !== userId && room.participant2Id !== userId) {
        throw {
          status: 403,
          code: ErrorCode.FORBIDDEN,
          message: 'Access Denied: You are not a participant in this private conversation',
        };
      }
    }

    const otherParticipantId = room.participant1Id === userId ? room.participant2Id : room.participant1Id;

    const message = await prisma.message.create({
      data: {
        roomId: room.id,
        senderId: userId,
        content: payload.content,
        attachments: payload.attachments ? JSON.stringify(payload.attachments) : null,
        mentions: payload.mentions ? JSON.stringify(payload.mentions) : null,
        parentId: payload.replyToId || null,
        isEdited: false,
        isDeleted: false,
      },
    });

    // Update room updatedAt
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: { updatedAt: new Date() },
    });

    const project = await prisma.project.findUnique({
      where: { id: room.projectId },
      include: { members: { where: { status: 'active' } } },
    });

    const activeMemberIds = new Set((project?.members || []).map((m) => m.userId));
    if (project?.ownerId) activeMemberIds.add(project.ownerId);

    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const formatted = this.formatMessage(message, activeMemberIds, project?.ownerId || '', usersMap);

    // Broadcast to 1:1 room
    broadcastToChat(chatId, 'message:new', formatted);

    // Notification to recipient
    if (otherParticipantId) {
      const senderName = usersMap.get(userId)?.email?.split('@')[0] || userId;
      await prisma.notification.create({
        data: {
          userId: otherParticipantId,
          type: 'message',
          message: `Direct message from ${senderName}: "${payload.content.slice(0, 60)}"`,
          link: `/projects/${room.projectId}`,
        },
      });
    }

    return formatted;
  }

  // ==========================================
  // 9.5 ACTIVITY FEED
  // ==========================================

  async getActivityFeed(projectId: string, userId: string, query: { page?: number; limit?: number }) {
    await this.ensureProjectMember(projectId, userId);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 30;
    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      prisma.activityFeedEntry.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityFeedEntry.count({ where: { projectId } }),
    ]);

    const allUsers = await prisma.user.findMany();
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));

    const items = entries.map((entry) => {
      const actor = usersMap.get(entry.userId);
      let detailsObj: any = {};
      try {
        detailsObj = entry.details ? JSON.parse(entry.details) : {};
      } catch {
        detailsObj = { detail: entry.details };
      }

      return {
        id: entry.id,
        projectId: entry.projectId,
        eventType: entry.action,
        actorId: entry.userId,
        actorName: actor?.email?.split('@')[0] || entry.userId,
        title: detailsObj.title || entry.action,
        detail: detailsObj.detail || '',
        metadata: detailsObj,
        createdAt: entry.createdAt.toISOString(),
      };
    });

    return {
      items,
      total,
      page,
      pageSize: limit,
    };
  }

  // ==========================================
  // 9.4 TEAM DIRECTORY & MEMBERS
  // ==========================================

  async getTeamDirectory(projectId: string, userId: string) {
    const project = await this.ensureProjectMember(projectId, userId);

    const allMembers: any[] = await prisma.projectMember.findMany({
      where: { projectId, status: 'active' },
      include: {
        user: {
          include: {
            skills: { include: { skill: true } },
            experience: true,
            education: true,
          },
        },
      },
    });

    const owner: any = await prisma.user.findUnique({
      where: { id: project.ownerId },
      include: {
        skills: { include: { skill: true } },
        experience: true,
        education: true,
      },
    });

    return {
      owner: owner
        ? {
            id: owner.id,
            email: owner.email,
            name: owner.email.split('@')[0],
            role: 'Project Owner / Lead',
            skills: (owner.skills || []).map((s: any) => s.skill?.name || s.skillId || 'Skill'),
            isOwner: true,
          }
        : null,
      members: allMembers.map((m) => ({
        id: m.userId,
        memberRecordId: m.id,
        email: m.user?.email || m.userId,
        name: m.user?.email?.split('@')[0] || m.userId,
        role: m.role,
        responsibilities: m.responsibilities,
        joinedAt: m.joinedAt.toISOString(),
        skills: (m.user?.skills || []).map((s: any) => s.skill?.name || s.skillId || 'Skill'),
        status: m.status,
      })),
      totalMembers: allMembers.length + (owner ? 1 : 0),
    };
  }

  // ==========================================
  // 9.1 PROJECT ROOM OVERVIEW
  // ==========================================

  async getRoomOverview(projectId: string, userId: string) {
    const project = await this.ensureProjectMember(projectId, userId);

    const [tasks, membersCount] = await Promise.all([
      prisma.task.findMany({
        where: { projectId },
        select: { id: true, title: true, status: true, priority: true, dueDate: true },
      }),
      prisma.projectMember.count({
        where: { projectId, status: 'active' },
      }),
    ]);

    const totalTasks = tasks.length;
    const doneTasks = tasks.filter((t) => t.status === 'Done').length;
    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    // Nearest upcoming deadlines
    const upcomingDeadlines = tasks
      .filter((t) => t.dueDate && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate!.toISOString(),
      }));

    return {
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        problemStatement: project.problemStatement,
        category: project.category,
        stage: project.stage,
        status: project.status,
        visibility: project.visibility,
        targetDate: project.targetDate?.toISOString() || null,
        duration: project.duration,
      },
      stats: {
        totalMembers: membersCount + 1, // + owner
        totalTasks,
        doneTasks,
        progressPercent,
      },
      upcomingDeadlines,
    };
  }
}

export const realChatService = new RealService();
export const realService = realChatService;
