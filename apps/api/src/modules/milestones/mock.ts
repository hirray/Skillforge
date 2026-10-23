export class MockService {
  private milestones: any[] = [
    {
      id: 'ms-001',
      projectId: 'proj-001',
      title: 'Phase 1: Architecture & API Scaffolding',
      description: 'Setup initial contract, express modules, and database schema.',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      status: 'In Progress',
      progress: 50,
      isManualCompletion: false,
      completionRationale: null,
      completedBy: null,
      completedAt: null,
      calculatedProgress: 50,
      isOverdue: false,
      tasks: [],
      history: []
    }
  ];

  async create(projectId: string, userId: string, data: any) {
    const ms = {
      id: `ms-${Date.now()}`,
      projectId,
      title: data.title,
      description: data.description || null,
      dueDate: data.dueDate || null,
      status: 'To Do',
      progress: 0,
      isManualCompletion: false,
      completionRationale: null,
      completedBy: null,
      completedAt: null,
      calculatedProgress: 0,
      isOverdue: false,
      tasks: [],
      history: []
    };
    this.milestones.push(ms);
    return { data: ms };
  }

  async list(projectId: string, userId: string, filters: any = {}) {
    return { data: this.milestones.filter(m => m.projectId === projectId) };
  }

  async getById(projectId: string, milestoneId: string, userId: string) {
    const ms = this.milestones.find(m => m.id === milestoneId);
    if (!ms) throw { status: 404, message: 'Milestone not found' };
    return { data: ms };
  }

  async getByIdDirect(milestoneId: string, userId: string) {
    const ms = this.milestones.find(m => m.id === milestoneId);
    if (!ms) throw { status: 404, message: 'Milestone not found' };
    return { data: ms };
  }

  async update(projectId: string, milestoneId: string, userId: string, data: any) {
    const ms = this.milestones.find(m => m.id === milestoneId);
    if (!ms) throw { status: 404, message: 'Milestone not found' };
    Object.assign(ms, data);
    return { data: ms };
  }

  async linkTask(projectId: string, milestoneId: string, userId: string, taskId: string) {
    const ms = this.milestones.find(m => m.id === milestoneId);
    if (!ms) throw { status: 404, message: 'Milestone not found' };
    return { data: ms };
  }

  async unlinkTask(projectId: string, milestoneId: string, userId: string, taskId: string) {
    const ms = this.milestones.find(m => m.id === milestoneId);
    if (!ms) throw { status: 404, message: 'Milestone not found' };
    return { data: ms };
  }

  async manualComplete(projectId: string, milestoneId: string, userId: string, rationale: string) {
    const ms = this.milestones.find(m => m.id === milestoneId);
    if (!ms) throw { status: 404, message: 'Milestone not found' };
    ms.status = 'Done';
    ms.isManualCompletion = true;
    ms.completionRationale = rationale;
    ms.completedBy = userId;
    ms.completedAt = new Date().toISOString();
    return { data: ms };
  }

  async delete(projectId: string, milestoneId: string, userId: string) {
    this.milestones = this.milestones.filter(m => m.id !== milestoneId);
    return { data: { success: true, id: milestoneId } };
  }

  async getHistory(milestoneId: string, userId: string) {
    return { data: [] };
  }
}

export const mockMilestonesService = new MockService();
export const mockService = mockMilestonesService;
