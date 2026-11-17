export class MockService {
  async createInvitation(projectId: string, inviterId: string, data: any) {
    return { data: { id: 'mock-inv-1', projectId, userId: data.userId, role: data.role, status: 'Pending' } };
  }
  async respondInvitation(invitationId: string, userId: string, data: any) {
    return { data: { id: invitationId, status: data.response === 'accept' ? 'Accepted' : 'Declined' } };
  }
  async listUserInvitations(userId: string) {
    return { data: [] };
  }
  async listProjectInvitations(projectId: string, userId: string) {
    return { data: [] };
  }
  async createJoinRequest(projectId: string, userId: string, data: any) {
    return { data: { id: 'mock-req-1', projectId, userId, role: data.role, status: 'Pending' } };
  }
  async respondJoinRequest(requestId: string, userId: string, data: any) {
    return { data: { id: requestId, status: data.action === 'accept' ? 'Accepted' : 'Rejected' } };
  }
  async listProjectJoinRequests(projectId: string, userId: string) {
    return { data: [] };
  }
  async listMembers(projectId: string) {
    return { data: [] };
  }
  async updateMemberRole(projectId: string, targetUserId: string, callerId: string, data: any) {
    return { data: { id: 'mock-member-1', projectId, userId: targetUserId, role: data.role } };
  }
  async removeMember(projectId: string, targetUserId: string, callerId: string, data: any) {
    return { data: { message: 'Member removed successfully' } };
  }
  async leaveProject(projectId: string, userId: string, data: any) {
    return { data: { message: 'Left project successfully' } };
  }
  async initiateOwnershipTransfer(projectId: string, callerId: string, data: any) {
    return { data: { id: 'mock-transfer-1', projectId, currentOwnerId: callerId, newOwnerId: data.newOwnerId, status: 'Pending' } };
  }
  async respondOwnershipTransfer(projectId: string, userId: string, data: any) {
    return { data: { message: 'Ownership transfer handled' } };
  }
  async getPendingTransfer(projectId: string) {
    return { data: null };
  }
  async listGaps(projectId: string, callerId?: string) {
    return {
      data: [
        {
          id: 'mock-gap-1',
          projectId,
          roleTitle: 'ML Engineer',
          skills: ['Python', 'PyTorch', 'FastAPI'],
          targetProficiency: 'intermediate',
          hoursPerWeek: 15,
          status: 'open',
          origin: 'member_left',
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
  async createGap(projectId: string, callerId: string, data: any) {
    return {
      data: {
        id: 'mock-gap-created',
        projectId,
        roleTitle: data.roleTitle,
        skills: data.skills || [],
        targetProficiency: data.targetProficiency || 'intermediate',
        hoursPerWeek: data.hoursPerWeek || 10,
        status: 'open',
        origin: data.origin || 'manual',
        createdAt: new Date().toISOString()
      }
    };
  }
  async updateGap(projectId: string, gapId: string, callerId: string, data: any) {
    return {
      data: {
        id: gapId,
        projectId,
        ...data,
        updatedAt: new Date().toISOString()
      }
    };
  }
  async getCandidatesForGap(projectId: string, gapId: string, callerId: string) {
    return {
      data: {
        gapId,
        matches: [
          {
            candidate: {
              userId: 'user-002',
              name: 'Sarah Connor',
              email: 'sarah@example.com',
              headline: 'ML Engineer • Advanced',
              skills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI'],
              matchScore: 94
            },
            matchScore: 94,
            reasons: [
              'Matches required skill: Python and PyTorch',
              'Available 15+ hrs/week',
              'Verified experience in machine learning pipelines'
            ],
            strengths: ['Direct skill overlap', 'High availability'],
            gaps: []
          },
          {
            candidate: {
              userId: 'user-003',
              name: 'Alex Rivera',
              email: 'alex@example.com',
              headline: 'Fullstack AI Engineer • Intermediate',
              skills: ['Python', 'React', 'FastAPI', 'Docker'],
              matchScore: 82
            },
            matchScore: 82,
            reasons: [
              'Matches Python and FastAPI',
              'Committed to 10-15 hrs/week'
            ],
            strengths: ['Cross-functional skillset'],
            gaps: ['PyTorch']
          }
        ],
        total: 2
      }
    };
  }
  async getHandover(projectId: string, callerId?: string, gapId?: string) {
    return {
      data: [
        {
          id: 'mock-handover-1',
          projectId,
          gapId,
          workState: 'Model architecture completed and dataset preprocessed. API routes require completion.',
          unfinishedTasks: ['task-002', 'task-003'],
          repoInfo: 'Branch: feature/ml-pipeline; Run train.py with GPU flag',
          decisions: 'Adopted PyTorch over TensorFlow for easier dynamic batching.',
          candidateSummary: 'Takes over the ML pipeline implementation; dataset is cleaned and ready for training.',
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
  async createHandover(projectId: string, callerId: string, data: any) {
    return {
      data: {
        id: 'mock-handover-created',
        projectId,
        ...data,
        createdAt: new Date().toISOString()
      }
    };
  }
  async checkInactivity(projectId: string, callerId: string, thresholdDays = 14) {
    return {
      data: {
        thresholdDays,
        inactiveMembers: [],
        totalInactive: 0
      }
    };
  }
}

export const mockTeamService = new MockService();
export const mockService = mockTeamService;
