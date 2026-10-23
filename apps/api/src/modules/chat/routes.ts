import { Router } from 'express';
import { requireAuth } from '../../core/auth';
import { getService } from './service';
import {
  sendMessageSchema,
  editMessageSchema,
  reportMessageSchema,
  createDirectChatSchema,
  paginationQuerySchema,
} from './schema';

const router = Router();

// ==========================================
// 9.2 GROUP CHAT & PROJECT-SCOPED MESSAGES
// ==========================================

// GET /projects/:id/messages
router.get('/projects/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const query = paginationQuerySchema.parse(req.query);
    const result = await getService().getProjectMessages(req.params.id, userId, query);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// POST /projects/:id/messages
router.post('/projects/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const payload = sendMessageSchema.parse(req.body);
    const result = await getService().sendProjectMessage(req.params.id, userId, payload);
    res.status(201).json({ data: result });
  } catch (e) {
    next(e);
  }
});

// PATCH /projects/:id/messages/:messageId
router.patch('/projects/:id/messages/:messageId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const payload = editMessageSchema.parse(req.body);
    const result = await getService().editMessage(req.params.id, req.params.messageId, userId, payload);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// DELETE /projects/:id/messages/:messageId
router.delete('/projects/:id/messages/:messageId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().deleteMessage(req.params.id, req.params.messageId, userId);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// POST /projects/:id/messages/:messageId/report
router.post('/projects/:id/messages/:messageId/report', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const payload = reportMessageSchema.parse(req.body);
    const result = await getService().reportMessage(req.params.id, req.params.messageId, userId, payload);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// POST /projects/:id/messages/read
router.post('/projects/:id/messages/read', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const roomId = req.body.roomId;
    const result = await getService().markMessagesRead(req.params.id, roomId, userId);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// ==========================================
// 9.3 INDIVIDUAL (1:1) DIRECT CHATS
// ==========================================

// GET /projects/:id/chats
router.get('/projects/:id/chats', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getUserDirectChats(req.params.id, userId);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// POST /projects/:id/chats
router.post('/projects/:id/chats', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { recipientId } = req.body;
    const result = await getService().getOrCreateDirectChat(req.params.id, userId, recipientId);
    res.status(201).json({ data: result });
  } catch (e) {
    next(e);
  }
});

// GET /chats (query projectId)
router.get('/chats', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.query.projectId as string;
    if (!projectId) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' } });
    }
    const result = await getService().getUserDirectChats(projectId, userId);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// POST /chats
router.post('/chats', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const payload = createDirectChatSchema.parse(req.body);
    const result = await getService().getOrCreateDirectChat(payload.projectId, userId, payload.recipientId);
    res.status(201).json({ data: result });
  } catch (e) {
    next(e);
  }
});

// GET /chats/:id/messages
router.get('/chats/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const query = paginationQuerySchema.parse(req.query);
    const result = await getService().getDirectChatMessages(req.params.id, userId, query);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// POST /chats/:id/messages
router.post('/chats/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const payload = sendMessageSchema.parse(req.body);
    const result = await getService().sendDirectMessage(req.params.id, userId, payload);
    res.status(201).json({ data: result });
  } catch (e) {
    next(e);
  }
});

// ==========================================
// 9.5 ACTIVITY FEED
// ==========================================

// GET /projects/:id/activity
router.get('/projects/:id/activity', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const query = paginationQuerySchema.parse(req.query);
    const result = await getService().getActivityFeed(req.params.id, userId, query);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// ==========================================
// 9.4 TEAM DIRECTORY
// ==========================================

// GET /projects/:id/directory
router.get('/projects/:id/directory', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getTeamDirectory(req.params.id, userId);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

// ==========================================
// 9.1 ROOM OVERVIEW
// ==========================================

// GET /projects/:id/room-overview
router.get('/projects/:id/room-overview', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getRoomOverview(req.params.id, userId);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

export default router;
