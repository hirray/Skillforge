import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import {
  inviteSchema,
  respondInvitationSchema,
  createJoinRequestSchema,
  respondJoinRequestSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  leaveProjectSchema,
  transferOwnershipSchema,
  respondTransferSchema,
  createGapSchema,
  updateGapSchema,
  createHandoverSchema
} from './schema';

const router = Router();

// -------------------------------------------------------------
// INVITATIONS
// -------------------------------------------------------------

// POST /projects/:id/invitations (also supports /team/projects/:id/invitations)
router.post('/projects/:id/invitations', requireAuth, async (req, res, next) => {
  try {
    const data = inviteSchema.parse(req.body);
    const result = await getService().createInvitation(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// GET /projects/:id/invitations
router.get('/projects/:id/invitations', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().listProjectInvitations(req.params.id, (req as any).user.id);
    res.json(result);
  } catch (e) { next(e); }
});

// POST /invitations/:id/respond
router.post('/invitations/:id/respond', requireAuth, async (req, res, next) => {
  try {
    const data = respondInvitationSchema.parse(req.body);
    const result = await getService().respondInvitation(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// GET /users/me/invitations
router.get('/users/me/invitations', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().listUserInvitations((req as any).user.id);
    res.json(result);
  } catch (e) { next(e); }
});

// -------------------------------------------------------------
// JOIN REQUESTS
// -------------------------------------------------------------

// POST /projects/:id/join-requests
router.post('/projects/:id/join-requests', requireAuth, async (req, res, next) => {
  try {
    const data = createJoinRequestSchema.parse(req.body);
    const result = await getService().createJoinRequest(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// GET /projects/:id/join-requests
router.get('/projects/:id/join-requests', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().listProjectJoinRequests(req.params.id, (req as any).user.id);
    res.json(result);
  } catch (e) { next(e); }
});

// PATCH /join-requests/:id
router.patch('/join-requests/:id', requireAuth, async (req, res, next) => {
  try {
    const data = respondJoinRequestSchema.parse(req.body);
    const result = await getService().respondJoinRequest(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// -------------------------------------------------------------
// MEMBERS & ROLES
// -------------------------------------------------------------

// GET /projects/:id/members
router.get('/projects/:id/members', async (req, res, next) => {
  try {
    const result = await getService().listMembers(req.params.id);
    res.json(result);
  } catch (e) { next(e); }
});

// PATCH /projects/:id/members/:userId
router.patch('/projects/:id/members/:userId', requireAuth, async (req, res, next) => {
  try {
    const data = updateMemberRoleSchema.parse(req.body);
    const result = await getService().updateMemberRole(req.params.id, req.params.userId, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// DELETE /projects/:id/members/:userId
router.delete('/projects/:id/members/:userId', requireAuth, async (req, res, next) => {
  try {
    const data = removeMemberSchema.parse(req.body);
    const result = await getService().removeMember(req.params.id, req.params.userId, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// POST /projects/:id/leave
router.post('/projects/:id/leave', requireAuth, async (req, res, next) => {
  try {
    const data = leaveProjectSchema.parse(req.body);
    const result = await getService().leaveProject(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// -------------------------------------------------------------
// OWNERSHIP TRANSFER
// -------------------------------------------------------------

// POST /projects/:id/transfer-ownership
router.post('/projects/:id/transfer-ownership', requireAuth, async (req, res, next) => {
  try {
    const data = transferOwnershipSchema.parse(req.body);
    const result = await getService().initiateOwnershipTransfer(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// POST /projects/:id/transfer-ownership/respond
router.post('/projects/:id/transfer-ownership/respond', requireAuth, async (req, res, next) => {
  try {
    const data = respondTransferSchema.parse(req.body);
    const result = await getService().respondOwnershipTransfer(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// GET /projects/:id/transfer-ownership
router.get('/projects/:id/transfer-ownership', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().getPendingTransfer(req.params.id);
    res.json(result);
  } catch (e) { next(e); }
});

// -------------------------------------------------------------
// GAPS (PROJECT RESCUE & REPLACEMENT - PRD 16)
// -------------------------------------------------------------

// GET /projects/:id/gaps
router.get('/projects/:id/gaps', async (req, res, next) => {
  try {
    const result = await getService().listGaps(req.params.id, (req as any).user?.id);
    res.json(result);
  } catch (e) { next(e); }
});

// POST /projects/:id/gaps
router.post('/projects/:id/gaps', requireAuth, async (req, res, next) => {
  try {
    const data = createGapSchema.parse(req.body);
    const result = await getService().createGap(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// PATCH /projects/:id/gaps/:gapId
router.patch('/projects/:id/gaps/:gapId', requireAuth, async (req, res, next) => {
  try {
    const data = updateGapSchema.parse(req.body);
    const result = await getService().updateGap(req.params.id, req.params.gapId, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// POST /projects/:id/gaps/:gapId/candidates
router.post('/projects/:id/gaps/:gapId/candidates', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().getCandidatesForGap(req.params.id, req.params.gapId, (req as any).user.id);
    res.json(result);
  } catch (e) { next(e); }
});

// -------------------------------------------------------------
// HANDOVER NOTES (PRD 16)
// -------------------------------------------------------------

// GET /projects/:id/handover
router.get('/projects/:id/handover', async (req, res, next) => {
  try {
    const result = await getService().getHandover(req.params.id, (req as any).user?.id, req.query.gapId as string);
    res.json(result);
  } catch (e) { next(e); }
});

// POST /projects/:id/handover
router.post('/projects/:id/handover', requireAuth, async (req, res, next) => {
  try {
    const data = createHandoverSchema.parse(req.body);
    const result = await getService().createHandover(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch (e) { next(e); }
});

// GET /projects/:id/inactivity-check
router.get('/projects/:id/inactivity-check', requireAuth, async (req, res, next) => {
  try {
    const thresholdDays = req.query.days ? parseInt(req.query.days as string, 10) : 14;
    const result = await getService().checkInactivity(req.params.id, (req as any).user.id, thresholdDays);
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
