export class MockService {
  async getStats() {
    return {
      totalUsers: 10,
      activeUsers: 9,
      suspendedUsers: 1,
      pendingReports: 2,
      pendingVerifications: 1,
      activeHolds: 0,
      certificates: { valid: 5, revoked: 0 },
    };
  }

  async getUsers() {
    return {
      items: [
        {
          id: 'user-001',
          name: 'Maya Chen',
          email: 'student@example.com',
          roles: ['user'],
          status: 'active',
          createdAt: new Date().toISOString(),
          counts: { skills: 5, projectsOwned: 1, memberships: 2, certifications: 1 },
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    };
  }

  async suspendUser(id: string, actorId: string, reason: string) {
    return { success: true, user: { id, status: 'suspended', suspensionReason: reason } };
  }

  async restoreUser(id: string) {
    return { success: true, user: { id, status: 'active' } };
  }

  async getReports() {
    return [];
  }

  async createReport() {
    return { id: 'mock-report-1', status: 'pending' };
  }

  async patchReport(id: string, actorId: string, data: any) {
    return { id, ...data };
  }

  async getVerificationQueue() {
    return [];
  }

  async approveVerification(id: string) {
    return { id, status: 'verified' };
  }

  async rejectVerification(id: string) {
    return { id, status: 'rejected' };
  }

  async getHolds() {
    return [];
  }

  async placeProjectHold(projectId: string, actorId: string, reason: string) {
    return { id: 'mock-hold-1', projectId, reason, isActive: true };
  }

  async releaseProjectHold(projectId: string) {
    return { projectId, isActive: false };
  }

  async getCertificates() {
    return [];
  }

  async revokeCertificate(id: string, actorId: string, reason: string) {
    return { id, status: 'revoked', reason };
  }

  async getAuditLogs() {
    return [];
  }

  async handle() {
    return this.getStats();
  }
}
