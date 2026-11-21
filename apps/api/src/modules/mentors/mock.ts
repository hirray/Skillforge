import { MentorProfile } from '@skillforge/contract';

export class MockService {
  private mockMentors: MentorProfile[] = [
    {
      id: 'mentor-profile-001',
      userId: 'user-003',
      expertiseSkillIds: ['React', 'TypeScript', 'Frontend Architecture'],
      domains: ['Web', 'SaaS', 'EdTech'],
      availability: '5 hrs/week',
      formats: ['async_review', 'live_call'],
      bio: 'Staff frontend engineer with 8+ years building enterprise web applications.',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user-003',
        email: 'pro@example.com',
        name: 'pro'
      }
    },
    {
      id: 'mentor-profile-002',
      userId: 'user-004',
      expertiseSkillIds: ['Node.js', 'System Design', 'PostgreSQL', 'Go'],
      domains: ['Backend', 'Fintech', 'Cloud Infrastructure'],
      availability: '3 hrs/week',
      formats: ['async_review'],
      bio: 'Technical founder & distributed systems architect. Happy to review database schemas and PRs.',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'user-004',
        email: 'founder@example.com',
        name: 'founder'
      }
    }
  ];

  private mockRequests: any[] = [];
  private mockFeedback: any[] = [];

  async listMentors(filters?: { skill?: string; domain?: string; format?: string; search?: string }) {
    return this.mockMentors.filter(m => {
      if (filters?.skill && !m.expertiseSkillIds.some(s => s.toLowerCase().includes(filters.skill!.toLowerCase()))) {
        return false;
      }
      if (filters?.domain && !m.domains.some(d => d.toLowerCase().includes(filters.domain!.toLowerCase()))) {
        return false;
      }
      return true;
    });
  }

  async getProfile(userId: string) {
    return this.mockMentors.find(m => m.userId === userId) || null;
  }

  async upsertProfile(userId: string, data: any) {
    const existing = this.mockMentors.find(m => m.userId === userId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: new Date().toISOString() });
      return existing;
    }
    const created: MentorProfile = {
      id: `mentor-profile-${Date.now()}`,
      userId,
      expertiseSkillIds: data.expertiseSkillIds || [],
      domains: data.domains || [],
      availability: data.availability || '5 hrs/week',
      formats: data.formats || ['async_review'],
      bio: data.bio || null,
      active: data.active ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: { id: userId, email: `${userId}@example.com`, name: userId }
    };
    this.mockMentors.push(created);
    return created;
  }

  async requestMentorship(callerId: string, data: any) {
    const req = {
      id: `req-${Date.now()}`,
      projectId: data.projectId,
      mentorId: data.mentorId,
      scope: data.scope || 'general',
      milestoneId: data.milestoneId || null,
      message: data.message,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockRequests.push(req);
    return req;
  }

  async listRequests(userId: string, filters?: any) {
    return this.mockRequests.filter(r => r.mentorId === userId || r.projectId === filters?.projectId);
  }

  async respondRequest(requestId: string, mentorUserId: string, data: any) {
    const req = this.mockRequests.find(r => r.id === requestId);
    if (req) {
      req.status = data.response === 'accept' ? 'accepted' : 'declined';
      req.updatedAt = new Date().toISOString();
    }
    return req;
  }

  async createFeedback(projectId: string, mentorUserId: string, data: any) {
    const feedback = {
      id: `feedback-${Date.now()}`,
      projectId,
      mentorId: mentorUserId,
      milestoneId: data.milestoneId || null,
      text: data.text,
      isAdvisory: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockFeedback.push(feedback);
    return feedback;
  }

  async listFeedback(projectId: string, milestoneId?: string | null) {
    return this.mockFeedback.filter(f => f.projectId === projectId);
  }

  async listProjectRequests(projectId: string) {
    return this.mockRequests.filter(r => r.projectId === projectId);
  }
}
