import fs from 'fs';
import path from 'path';

export interface StorageProvider {
  upload(fileName: string, buffer: Buffer): Promise<string>;
  getSignedUrl(fileId: string): Promise<string>;
}

export class LocalStorageProvider implements StorageProvider {
  private storageDir = path.join(__dirname, '../../../../storage');

  constructor() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  async upload(fileName: string, buffer: Buffer): Promise<string> {
    const id = Math.random().toString(36).substring(7) + '-' + fileName;
    fs.writeFileSync(path.join(this.storageDir, id), buffer);
    return id;
  }

  async getSignedUrl(fileId: string): Promise<string> {
    return \`http://localhost:\${process.env.PORT || 4000}/api/v1/storage/\${fileId}\`;
  }
}

export const storageProvider = new LocalStorageProvider();
