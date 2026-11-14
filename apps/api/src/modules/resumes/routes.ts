import { Router, RequestHandler } from 'express';
import multer from 'multer';
import { config } from '../../config';
import { requireAuth } from '../../core/auth';
import { realService } from './real';
const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 2 },
});
router.use(requireAuth);
router.use((_req, _res, next) =>
  config.RESUMES_SOURCE === 'real'
    ? next()
    : next({
        status: 503,
        code: 'RESUMES_DISABLED',
        message:
          'Enable RESUMES_SOURCE=real; AI_RESUME_SOURCE can still be mock.',
      })
);
const uid = (req: any) => req.user.id as string;
const extensions: RequestHandler = (_req, _res, next) =>
  config.MEMBER2_EXTENSIONS === 'true'
    ? next()
    : next({
        status: 404,
        code: 'EXTENSION_DISABLED',
        message:
          'Proposed resume utilities are disabled pending contract review.',
      });
router.get('/', extensions, async (req, res, next) => {
  try {
    res.json(await realService.list(uid(req)));
  } catch (e) {
    next(e);
  }
});
router.post('/', (req, res, next) =>
  upload.single('file')(req, res, (err) => {
    if (err)
      return next({
        status: 400,
        code:
          err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: 'Upload one PDF of at most 10 MB.',
      });
    if (!req.file)
      return next({
        status: 400,
        code: 'INVALID_FILE',
        message: 'Attach a PDF in the file field.',
      });
    void realService
      .upload(uid(req), req.file)
      .then((result) => res.status(202).json(result))
      .catch(next);
  })
);
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await realService.get(req.params.id, uid(req)));
  } catch (e) {
    next(e);
  }
});
router.get('/:id/extraction', async (req, res, next) => {
  try {
    res.json(await realService.extraction(req.params.id, uid(req)));
  } catch (e) {
    next(e);
  }
});
router.post('/:id/confirm', async (req, res, next) => {
  try {
    res.json(await realService.confirm(req.params.id, uid(req), req.body));
  } catch (e) {
    next(e);
  }
});
router.use((_req, _res, next) =>
  config.MEMBER2_EXTENSIONS === 'true'
    ? next()
    : next({
        status: 404,
        code: 'EXTENSION_DISABLED',
        message:
          'Proposed resume utilities are disabled pending contract review.',
      })
);
router.post('/:id/retry', async (req, res, next) => {
  try {
    res.json(await realService.retry(req.params.id, uid(req)));
  } catch (e) {
    next(e);
  }
});
router.get('/:id/download', async (req, res, next) => {
  try {
    res.json(await realService.downloadUrl(req.params.id, uid(req)));
  } catch (e) {
    next(e);
  }
});
router.get('/:id/file', async (req, res, next) => {
  try {
    const file = await realService.download(
      req.params.id,
      uid(req),
      String(req.query.expires || ''),
      String(req.query.token || '')
    );
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`
    );
    res.send(file.buffer);
  } catch (e) {
    next(e);
  }
});
router.delete('/:id', async (req, res, next) => {
  try {
    res.json(await realService.delete(req.params.id, uid(req)));
  } catch (e) {
    next(e);
  }
});
export default router;
