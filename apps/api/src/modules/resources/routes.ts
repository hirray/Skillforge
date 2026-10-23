import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import { createLinkSchema, createFileSchema } from './schema';

const router = Router();

// 1. List project resources
router.get('/projects/:id/resources', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().list(req.params.id, userId, req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 2. Add external link to project resources
router.post('/projects/:id/resources/links', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = createLinkSchema.parse(req.body);
    const result = await getService().createLink(req.params.id, userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 3. Upload file resource (base64 payload or multipart)
router.post('/projects/:id/resources/files', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { fileName, dataBase64, mimeType, title, category } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: { code: 'INVALID_FILE', message: 'fileName is required' } });
    }

    if (!dataBase64) {
      return res.status(400).json({ error: { code: 'EMPTY_FILE', message: 'dataBase64 content is required' } });
    }

    const buffer = Buffer.from(dataBase64, 'base64');
    const result = await getService().uploadFile(req.params.id, userId, {
      fileName,
      buffer,
      mimeType,
      title: title || fileName,
      category: category || 'Other'
    });

    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 4. General create resource endpoint (supports link and file record)
router.post('/projects/:id/resources', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const body = req.body;

    if (body.type === 'file' || body.fileKey) {
      const data = createFileSchema.parse(body);
      const result = await getService().createFileRecord(req.params.id, userId, data);
      return res.json(result);
    } else {
      const data = createLinkSchema.parse(body);
      const result = await getService().createLink(req.params.id, userId, data);
      return res.json(result);
    }
  } catch (e) {
    next(e);
  }
});

// 5. Get download URL for a file resource
router.get('/projects/:id/resources/:resourceId/download', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getDownloadUrl(req.params.id, req.params.resourceId, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 6. Delete a resource
router.delete('/projects/:id/resources/:resourceId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().delete(req.params.id, req.params.resourceId, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 7. Direct storage download handler
router.get('/storage/:fileId', (req, res) => {
  try {
    const storageDir = path.join(__dirname, '../../../../../storage');
    const filePath = path.join(storageDir, req.params.fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'File not found in storage' } });
    }
    res.download(filePath);
  } catch (e: any) {
    res.status(500).json({ error: { code: 'STORAGE_ERROR', message: e.message } });
  }
});

export default router;
