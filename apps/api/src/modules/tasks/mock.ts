export class MockService {
  async create(projectId: string, userId: string, data: any) {
    return {
      data: {
        id: 'task-mock-1',
        projectId,
        title: data.title,
        status: data.status || 'To Do',
        priority: data.priority || 'Medium',
        assigneeId: data.assigneeId || null,
        comments: [],
        history: [],
        blockedBy: [],
        blocks: []
      }
    };
  }

  async list(projectId: string, userId: string, filters: any = {}) {
    return {
      data: [
        {
          id: 'task-mock-1',
          projectId,
          title: 'Initial Mock Task',
          status: 'To Do',
          priority: 'Medium',
          assigneeId: userId,
          comments: [],
          history: [],
          blockedBy: [],
          blocks: []
        }
      ]
    };
  }

  async getById(projectId: string, taskId: string, userId: string) {
    return {
      data: {
        id: taskId,
        projectId,
        title: 'Mock Task',
        status: 'To Do',
        priority: 'Medium',
        assigneeId: userId,
        comments: [],
        history: [],
        blockedBy: [],
        blocks: []
      }
    };
  }

  async getByIdDirect(taskId: string, userId: string) {
    return {
      data: {
        id: taskId,
        projectId: 'project-mock-1',
        title: 'Mock Task',
        status: 'To Do',
        priority: 'Medium',
        assigneeId: userId,
        comments: [],
        history: [],
        blockedBy: [],
        blocks: []
      }
    };
  }

  async update(projectId: string, taskId: string, userId: string, data: any) {
    return {
      data: {
        id: taskId,
        projectId,
        title: data.title || 'Updated Task',
        status: data.status || 'In Progress',
        priority: data.priority || 'Medium',
        assigneeId: data.assigneeId,
        comments: [],
        history: [],
        blockedBy: [],
        blocks: []
      }
    };
  }

  async delete(projectId: string, taskId: string, userId: string) {
    return { data: { success: true, id: taskId } };
  }

  async addComment(projectId: string, taskId: string, userId: string, content: string) {
    return {
      data: {
        id: 'comment-mock-1',
        taskId,
        userId,
        content,
        createdAt: new Date().toISOString()
      }
    };
  }

  async getHistory(taskId: string, userId: string) {
    return {
      data: [
        {
          id: 'hist-mock-1',
          taskId,
          field: 'status',
          oldValue: 'To Do',
          newValue: 'In Progress',
          userId,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  async checkReminders() {
    return [];
  }
}

export const mockTasksService = new MockService();
export const mockService = mockTasksService;
