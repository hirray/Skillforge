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
}

export const mockTeamService = new MockService();
export const mockService = mockTeamService;
