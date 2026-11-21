import { Router } from 'express';
import { getService } from './service';
import { callbackQuerySchema, connectQuerySchema, linkRepoSchema } from './schema';
import { requireAuth } from '../../core/auth';

const router = Router();

// Helper to extract active user ID safely
const getUserId = (req: any): string => {
  return req.user?.id || req.headers['x-user-id'] || 'user-001';
};

/* ====================================================================
 * OAUTH INTEGRATION ENDPOINTS
 * Frozen Contract: GET /integrations/github/connect, GET /integrations/github/callback, DELETE /integrations/github
 * ==================================================================== */

// Connect URL generator
const handleConnect = async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    const query = connectQuerySchema.parse(req.query);
    const result = await getService().getConnectUrl(userId, query.redirect_uri);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.get('/integrations/github/connect', requireAuth, handleConnect);
router.get('/connect', requireAuth, handleConnect);

// Callback handler
const handleCallback = async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    const query = callbackQuerySchema.parse(req.query);
    const result = await getService().handleCallback(userId, query.code, query.state);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.get('/integrations/github/callback', requireAuth, handleCallback);
router.get('/callback', requireAuth, handleCallback);

// Disconnect
const handleDisconnect = async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    const result = await getService().disconnect(userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.delete('/integrations/github', requireAuth, handleDisconnect);
router.delete('/', requireAuth, handleDisconnect);

// Integration Status
const handleStatus = async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    const result = await getService().getStatus(userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.get('/integrations/github/status', requireAuth, handleStatus);
router.get('/status', requireAuth, handleStatus);

// List user's available repositories from their connected GitHub account
const handleGetUserRepos = async (req: any, res: any, next: any) => {
  try {
    const userId = getUserId(req);
    const result = await getService().getUserRepos(userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.get('/integrations/github/user-repos', requireAuth, handleGetUserRepos);
router.get('/user-repos', requireAuth, handleGetUserRepos);

/* ====================================================================
 * PROJECT REPOSITORY ENDPOINTS
 * Frozen Contract: GET and POST /projects/{id}/repos
 * ==================================================================== */

// List project repositories
const handleGetProjectRepos = async (req: any, res: any, next: any) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const result = await getService().getProjectRepos(projectId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.get('/projects/:id/repos', handleGetProjectRepos);
router.get('/:projectId/repos', handleGetProjectRepos);

// Link repository to project
const handleLinkProjectRepo = async (req: any, res: any, next: any) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const body = linkRepoSchema.parse(req.body);
    const result = await getService().linkRepo(projectId, body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.post('/projects/:id/repos', requireAuth, handleLinkProjectRepo);
router.post('/:projectId/repos', requireAuth, handleLinkProjectRepo);

// Trigger manual repository sync
const handleSyncProjectRepo = async (req: any, res: any, next: any) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const repoId = req.params.repoId;
    const result = await getService().syncRepo(projectId, repoId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};
router.post('/projects/:id/repos/:repoId/sync', requireAuth, handleSyncProjectRepo);
router.post('/:projectId/repos/:repoId/sync', requireAuth, handleSyncProjectRepo);

export default router;
