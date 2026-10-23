export class MockService {
  async getProjectMessages(projectId: string, userId: string, query: any) {
    return {
      items: [
        {
          id: 'mock-msg-1',
          roomId: 'mock-room-1',
          senderId: 'user-001',
          senderName: 'student',
          isFormerMember: false,
          content: 'Hello team, welcome to the project room!',
          attachments: [],
          mentions: [],
          replyToId: null,
          edited: false,
          deleted: false,
          readBy: ['user-001'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      total: 1,
      page: 1,
      pageSize: 50,
      roomId: 'mock-room-1',
    };
  }

  async sendProjectMessage(projectId: string, userId: string, payload: any) {
    return {
      id: 'mock-msg-' + Date.now(),
      roomId: 'mock-room-1',
      senderId: userId,
      senderName: userId,
      isFormerMember: false,
      content: payload.content,
      attachments: payload.attachments || [],
      mentions: payload.mentions || [],
      replyToId: payload.replyToId || null,
      edited: false,
      deleted: false,
      readBy: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async editMessage(projectId: string, messageId: string, userId: string, payload: any) {
    return {
      id: messageId,
      roomId: 'mock-room-1',
      senderId: userId,
      senderName: userId,
      isFormerMember: false,
      content: payload.content,
      edited: true,
      editedAt: new Date().toISOString(),
      deleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteMessage(projectId: string, messageId: string, userId: string) {
    return {
      id: messageId,
      roomId: 'mock-room-1',
      senderId: userId,
      senderName: userId,
      isFormerMember: false,
      content: '(deleted)',
      deleted: true,
      deletedAt: new Date().toISOString(),
      edited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async reportMessage(projectId: string, messageId: string, userId: string, payload: any) {
    return { success: true, message: 'Message reported', reportId: 'mock-report-1' };
  }

  async markMessagesRead(projectId: string, roomId: string, userId: string) {
    return { success: true };
  }

  async getUserDirectChats(projectId: string, userId: string) {
    return [];
  }

  async getOrCreateDirectChat(projectId: string, userId: string, recipientId: string) {
    return {
      id: 'mock-direct-1',
      projectId,
      type: 'direct',
      otherUserId: recipientId,
      otherUserName: recipientId,
      createdAt: new Date().toISOString(),
    };
  }

  async getDirectChatMessages(chatId: string, userId: string, query: any) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      roomId: chatId,
    };
  }

  async sendDirectMessage(chatId: string, userId: string, payload: any) {
    return {
      id: 'mock-direct-msg-' + Date.now(),
      roomId: chatId,
      senderId: userId,
      senderName: userId,
      isFormerMember: false,
      content: payload.content,
      attachments: payload.attachments || [],
      mentions: payload.mentions || [],
      replyToId: payload.replyToId || null,
      edited: false,
      deleted: false,
      readBy: [userId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getActivityFeed(projectId: string, userId: string, query: any) {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 30,
    };
  }

  async getTeamDirectory(projectId: string, userId: string) {
    return {
      owner: null,
      members: [],
      totalMembers: 0,
    };
  }

  async getRoomOverview(projectId: string, userId: string) {
    return {
      project: { id: projectId, title: 'Mock Project' },
      stats: { totalMembers: 1, totalTasks: 0, doneTasks: 0, progressPercent: 0 },
      upcomingDeadlines: [],
    };
  }
}

export const mockChatService = new MockService();
export const mockService = mockChatService;
