import { HackathonEvent } from '@skillforge/contract';

export class MockService {
  private mockEvents: HackathonEvent[] = [
    {
      id: 'event-001',
      name: 'Agentic AI & Fullstack Innovation Hackathon',
      description: '48-hour sprint to build autonomous AI systems, collaborative tools, or developer infrastructure.',
      theme: 'Autonomous Multi-Agent Platforms',
      startsAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
      rules: 'All code must be written during the sprint window. Pre-trained open weights and public APIs are permitted.',
      suggestedSkillIds: ['TypeScript', 'Python', 'FastAPI', 'React', 'Docker'],
      status: 'running',
      organizerId: 'admin-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizer: { id: 'admin-001', email: 'admin@example.com' },
      _count: { participants: 14, projects: 4 }
    }
  ];

  async listEvents(filters?: { status?: string }) {
    if (filters?.status) {
      return this.mockEvents.filter(e => e.status === filters.status);
    }
    return this.mockEvents;
  }

  async getEvent(id: string) {
    const e = this.mockEvents.find(ev => ev.id === id);
    if (!e) return null;
    return e;
  }

  async createEvent(organizerId: string, data: any) {
    const ev: HackathonEvent = {
      id: `event-${Date.now()}`,
      name: data.name,
      description: data.description,
      theme: data.theme,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      rules: data.rules || null,
      suggestedSkillIds: data.suggestedSkillIds || [],
      status: 'open',
      organizerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      organizer: { id: organizerId, email: `${organizerId}@example.com` },
      _count: { participants: 0, projects: 0 }
    };
    this.mockEvents.push(ev);
    return ev;
  }

  async updateStatus(id: string, callerId: string, status: string) {
    const ev = this.mockEvents.find(e => e.id === id);
    if (ev) ev.status = status;
    return ev;
  }

  async joinEvent(eventId: string, userId: string, data: any) {
    return {
      id: `part-${Date.now()}`,
      eventId,
      userId,
      lookingForTeam: data.lookingForTeam ?? true,
      skillsSnapshot: data.skillsSnapshot || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async registerProject(eventId: string, callerId: string, data: any) {
    return {
      id: `proj-${Date.now()}`,
      title: data.title,
      description: data.description,
      ownerId: callerId,
      eventId,
      status: 'active',
      stage: 'Execution',
      duration: 'Hackathon Sprint',
      milestones: [
        { title: 'Ideate & Technical Architecture', order: 1, status: 'todo' },
        { title: 'Core Feature Build & Integration', order: 2, status: 'todo' },
        { title: 'Sprint Demo & Final Polish', order: 3, status: 'todo' }
      ]
    };
  }

  async deleteEvent(id: string, callerId: string) {
    return { deleted: true };
  }
}
