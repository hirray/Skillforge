export class MockService {
  async create(userId: string, data: any) { return { data: { id: 'mock-id', ...data } }; }
  async list(filters: any) { return { data: [] }; }
  async getById(id: string) { return { data: { id } }; }
  async update(id: string, userId: string, data: any) { return { data: { id, ...data } }; }
  async transition(id: string, userId: string, newStatus: string) { return { data: { id, status: newStatus } }; }
  async delete(id: string, userId: string) { return { data: { success: true, id } }; }
}

export const mockProjectsService = new MockService();
export const mockService = mockProjectsService;
