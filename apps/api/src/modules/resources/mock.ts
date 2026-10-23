export class MockService {
  private resources: any[] = [
    {
      id: 'res-001',
      projectId: 'proj-001',
      title: 'Project UI Prototype (Figma)',
      type: 'link',
      category: 'Design',
      url: 'https://figma.com/file/sample-prototype',
      fileKey: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      addedBy: 'user-001',
      uploaderName: 'user-001',
      isFormerMember: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  async list(projectId: string, userId: string, filters: any = {}) {
    return { data: this.resources.filter(r => r.projectId === projectId) };
  }

  async createLink(projectId: string, userId: string, data: any) {
    const res = {
      id: `res-${Date.now()}`,
      projectId,
      title: data.title,
      type: 'link',
      category: data.category || 'Other',
      url: data.url,
      fileKey: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      addedBy: userId,
      uploaderName: userId,
      isFormerMember: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.resources.push(res);
    return { data: res };
  }

  async uploadFile(projectId: string, userId: string, fileData: any) {
    const res = {
      id: `res-${Date.now()}`,
      projectId,
      title: fileData.title || fileData.fileName,
      type: 'file',
      category: fileData.category || 'Other',
      fileKey: `mock-key-${Date.now()}`,
      fileName: fileData.fileName,
      fileSize: fileData.buffer?.length || 1024,
      mimeType: fileData.mimeType || 'application/pdf',
      addedBy: userId,
      uploaderName: userId,
      isFormerMember: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.resources.push(res);
    return { data: res };
  }

  async createFileRecord(projectId: string, userId: string, data: any) {
    const res = {
      id: `res-${Date.now()}`,
      projectId,
      title: data.title || data.fileName,
      type: 'file',
      category: data.category || 'Other',
      fileKey: data.fileKey,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType || 'application/octet-stream',
      addedBy: userId,
      uploaderName: userId,
      isFormerMember: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.resources.push(res);
    return { data: res };
  }

  async getDownloadUrl(projectId: string, resourceId: string, userId: string) {
    const res = this.resources.find(r => r.id === resourceId);
    if (!res) throw { status: 404, message: 'Resource not found' };
    return {
      data: {
        url: `http://localhost:4000/api/v1/storage/${res.fileKey}`,
        fileName: res.fileName,
        fileSize: res.fileSize
      }
    };
  }

  async delete(projectId: string, resourceId: string, userId: string) {
    this.resources = this.resources.filter(r => r.id !== resourceId);
    return { data: { success: true, id: resourceId } };
  }
}

export const mockResourcesService = new MockService();
export const mockService = mockResourcesService;
