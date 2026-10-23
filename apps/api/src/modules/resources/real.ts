import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';
import { storageProvider } from '../../core/storage';

const prisma = new PrismaClient();

export class RealService {
  async ensureMember(projectId: string, userId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          where: { status: 'active' }
        }
      }
    });

    if (!project) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };
    }

    const isOwner = project.ownerId === userId;
    const isConfirmedMember = project.members.some(m => m.userId === userId);

    if (!isOwner && !isConfirmedMember) {
      throw {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: 'Only active confirmed project members can access or modify resources'
      };
    }

    return project;
  }

  async list(projectId: string, userId: string, filters: any = {}) {
    const project = await this.ensureMember(projectId, userId);

    const where: any = { projectId };
    if (filters.type && (filters.type === 'link' || filters.type === 'file')) {
      where.type = filters.type;
    }
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    const resources = await prisma.projectResource.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Active members & owner map for attribution & former member detection
    const activeMemberIds = new Set(project.members.map(m => m.userId));
    activeMemberIds.add(project.ownerId);

    // Fetch user details for names/emails
    const userIds = Array.from(new Set(resources.map(r => r.addedBy)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true }
    });
    const userMap = new Map(users.map(u => [u.id, u.email]));

    const formatted = resources.map(r => {
      const isFormerMember = !activeMemberIds.has(r.addedBy);
      const email = userMap.get(r.addedBy) || r.addedBy;
      const uploaderName = isFormerMember ? 'Former member' : email.split('@')[0];

      return {
        ...r,
        uploaderName,
        uploaderEmail: email,
        isFormerMember
      };
    });

    if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      return {
        data: formatted.filter(r =>
          r.title.toLowerCase().includes(q) ||
          (r.fileName && r.fileName.toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.url && r.url.toLowerCase().includes(q))
        )
      };
    }

    return { data: formatted };
  }

  async createLink(projectId: string, userId: string, data: any) {
    await this.ensureMember(projectId, userId);

    const resource = await prisma.projectResource.create({
      data: {
        projectId,
        title: data.title,
        type: 'link',
        category: data.category || 'Other',
        url: data.url,
        addedBy: userId
      }
    });

    eventBus.emitEvent(DomainEvent.ResourceAdded, {
      resourceId: resource.id,
      projectId,
      addedBy: userId,
      title: resource.title,
      type: 'link'
    });

    return {
      data: {
        ...resource,
        uploaderName: userId,
        isFormerMember: false
      }
    };
  }

  async uploadFile(
    projectId: string,
    userId: string,
    fileData: {
      fileName: string;
      buffer: Buffer;
      mimeType?: string;
      title?: string;
      category?: string;
    }
  ) {
    await this.ensureMember(projectId, userId);

    if (!fileData.buffer || fileData.buffer.length === 0) {
      throw { status: 400, code: 'EMPTY_FILE', message: 'File is empty' };
    }

    const maxSize = 25 * 1024 * 1024; // 25MB
    if (fileData.buffer.length > maxSize) {
      throw {
        status: 400,
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds maximum allowed limit of 25MB'
      };
    }

    // Upload to storage provider
    let fileKey: string;
    try {
      fileKey = await storageProvider.upload(fileData.fileName, fileData.buffer, fileData.mimeType || 'application/octet-stream');
    } catch (err: any) {
      throw {
        status: 500,
        code: 'STORAGE_ERROR',
        message: err.message || 'Failed to upload file to storage'
      };
    }

    const resource = await prisma.projectResource.create({
      data: {
        projectId,
        title: fileData.title || fileData.fileName,
        type: 'file',
        category: fileData.category || 'Other',
        fileKey,
        fileName: fileData.fileName,
        fileSize: fileData.buffer.length,
        mimeType: fileData.mimeType || 'application/octet-stream',
        addedBy: userId
      }
    });

    eventBus.emitEvent(DomainEvent.ResourceAdded, {
      resourceId: resource.id,
      projectId,
      addedBy: userId,
      title: resource.title,
      type: 'file'
    });

    return {
      data: {
        ...resource,
        uploaderName: userId,
        isFormerMember: false
      }
    };
  }

  async createFileRecord(projectId: string, userId: string, data: any) {
    await this.ensureMember(projectId, userId);

    const resource = await prisma.projectResource.create({
      data: {
        projectId,
        title: data.title || data.fileName,
        type: 'file',
        category: data.category || 'Other',
        fileKey: data.fileKey,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType || 'application/octet-stream',
        addedBy: userId
      }
    });

    eventBus.emitEvent(DomainEvent.ResourceAdded, {
      resourceId: resource.id,
      projectId,
      addedBy: userId,
      title: resource.title,
      type: 'file'
    });

    return {
      data: {
        ...resource,
        uploaderName: userId,
        isFormerMember: false
      }
    };
  }

  async getDownloadUrl(projectId: string, resourceId: string, userId: string) {
    await this.ensureMember(projectId, userId);

    const resource = await prisma.projectResource.findUnique({
      where: { id: resourceId }
    });

    if (!resource || resource.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Resource not found' };
    }

    if (resource.type !== 'file' || !resource.fileKey) {
      throw { status: 400, code: 'NOT_A_FILE', message: 'Resource is not a downloadable file' };
    }

    const signedUrl = await storageProvider.getSignedUrl(resource.fileKey);

    return {
      data: {
        url: signedUrl,
        fileName: resource.fileName,
        fileSize: resource.fileSize,
        mimeType: resource.mimeType
      }
    };
  }

  async delete(projectId: string, resourceId: string, userId: string) {
    const project = await this.ensureMember(projectId, userId);

    const resource = await prisma.projectResource.findUnique({
      where: { id: resourceId }
    });

    if (!resource || resource.projectId !== projectId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Resource not found' };
    }

    const isAdder = resource.addedBy === userId;
    const isOwner = project.ownerId === userId;

    if (!isAdder && !isOwner) {
      throw {
        status: 403,
        code: ErrorCode.FORBIDDEN,
        message: 'Only the member who added this resource or the project owner can delete it'
      };
    }

    await prisma.projectResource.delete({
      where: { id: resourceId }
    });

    return { data: { success: true, id: resourceId } };
  }
}

export const realResourcesService = new RealService();
export const realService = realResourcesService;
