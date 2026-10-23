import fs from 'fs/promises';
import path from 'path';

export interface StorageProvider {
  upload(fileKey: string, data: Buffer | string, mimeType: string): Promise<string>;
  getSignedUrl(fileKey: string, expiresInMinutes?: number): Promise<string>;
  delete(fileKey: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch {}
  }

  async upload(fileKey: string, data: Buffer | string, mimeType: string): Promise<string> {
    await this.ensureDir();
    const filePath = path.join(this.baseDir, fileKey);
    const buffer = typeof data === 'string' ? Buffer.from(data, 'base64') : data;
    await fs.writeFile(filePath, buffer);
    return fileKey;
  }

  async getSignedUrl(fileKey: string, expiresInMinutes: number = 60): Promise<string> {
    const token = Math.random().toString(36).substring(7);
    return `/api/v1/storage/${fileKey}?token=${token}`;
  }

  async delete(fileKey: string): Promise<void> {
    const filePath = path.join(this.baseDir, fileKey);
    try {
      await fs.unlink(filePath);
    } catch {}
  }
}

export const storageProvider = new LocalStorageProvider();
