import { describe, it, expect, beforeEach } from 'vitest';
import { RealAuthService } from './real';
import { RealUserService } from '../users/real';
import { RealSkillsService } from '../skills/real';
import { realNotificationsService } from '../notifications/real';
import { realSearchService } from '../search/real';

describe('Member 1 Phase 1 & 2 Unit Suite', () => {
  const authService = new RealAuthService();
  const userService = new RealUserService();
  const skillsService = new RealSkillsService();
  const notifService = realNotificationsService;
  const searchService = realSearchService;

  const testEmail = `test.eng.${Date.now()}@example.com`;
  let testUserId = '';

  it('Module 1: RealAuthService registers a new candidate user', async () => {
    const reg = await authService.register({
      name: 'Test Engineer',
      email: testEmail,
      password: 'SecurePassword123!',
      intendedUse: 'individual',
      consentAccepted: true,
    });

    expect(reg.user).toBeDefined();
    expect(reg.user.email).toBe(testEmail);
    expect(reg.tokens.accessToken).toBeDefined();
    expect(reg.tokens.refreshToken).toBeDefined();
    testUserId = reg.user.id;
  });

  it('Module 1: Rejects duplicate email registration', async () => {
    await expect(
      authService.register({
        name: 'Duplicate Engineer',
        email: testEmail,
        password: 'AnotherPassword123!',
        consentAccepted: true,
      })
    ).rejects.toThrow();
  });

  it('Module 1: Authenticates user with valid credentials', async () => {
    const login = await authService.login({
      email: testEmail,
      password: 'SecurePassword123!',
    });
    expect(login.tokens.accessToken).toBeDefined();
    expect(login.user.id).toBe(testUserId);
  });

  it('Module 2: Computes profile completeness score and retrieves profile', async () => {
    const me = await userService.getMe(testUserId);
    expect(me.user.id).toBe(testUserId);
    expect(me.completeness.percentage).toBeGreaterThanOrEqual(10);
    expect(Array.isArray(me.completeness.checks)).toBe(true);
  });

  it('Module 2: Updates profile headline, bio, and workMode', async () => {
    const updated = await userService.updateMe(testUserId, {
      headline: 'Principal Distributed Systems Architect',
      bio: 'Building hyper-scalable resilient event-driven architectures with Raft and Kafka.',
      workMode: 'remote',
      city: 'Seattle',
      country: 'USA',
    });
    expect(updated.user.headline).toBe('Principal Distributed Systems Architect');
    expect(updated.user.workMode).toBe('remote');
  });

  it('Module 2: Updates availability status', async () => {
    const avail = await userService.updateAvailability(testUserId, {
      status: 'immediate',
      hoursPerWeek: 40,
    });
    expect(avail.success).toBe(true);
    expect(avail.availability).toBe('immediate');
  });

  it('Module 2: Granular visibility control hides private sections from unauthorized viewers', async () => {
    await userService.updateVisibility(testUserId, {
      contact: false,
      experience: false,
    });

    const publicView = await userService.getPublicProfile(testUserId, {
      id: 'viewer-anonymous',
      roles: ['individual'],
    });

    expect(publicView.user.id).toBe(testUserId);
    expect(publicView.user.experiences).toBeUndefined();
  });

  it('Module 4: Searches canonical skills taxonomy with ranking', async () => {
    const search = await skillsService.searchSkills({ q: 'react' });
    expect(search.data).toBeDefined();
    expect(Array.isArray(search.data)).toBe(true);
  });

  it('Module 4: Proposes a new skill and increments proposal count on re-proposal', async () => {
    const uniqueSkill = `Skill-${Date.now()}`;
    const p1 = await skillsService.proposeSkill(testUserId, {
      name: uniqueSkill,
      category: 'Distributed Systems',
      reason: 'Standard asynchronous messaging framework',
    });
    expect(p1.status).toBe('submitted');

    const p2 = await skillsService.proposeSkill(testUserId, {
      name: uniqueSkill,
      category: 'Distributed Systems',
    });
    expect(p2.status).toBe('proposal_updated');
  });

  it('Module 30: Dispatches and dedupes real-time notifications', async () => {
    const notif = await notifService.dispatchNotification({
      userId: testUserId,
      title: 'Interview Invitation',
      message: 'A company has requested an interview for Senior Backend Lead.',
      category: 'outreach',
      dedupeKey: `interview-${testUserId}-1`,
    });
    expect(notif).toBeDefined();
    expect(notif?.title).toBe('Interview Invitation');

    // Duplicate check
    const dupe = await notifService.dispatchNotification({
      userId: testUserId,
      title: 'Interview Invitation',
      message: 'A company has requested an interview for Senior Backend Lead.',
      category: 'outreach',
      dedupeKey: `interview-${testUserId}-1`,
    });
    expect(dupe?.id).toBe(notif?.id);
  });

  it('Module 30: Marks notification as read and lists notifications', async () => {
    const list = await notifService.listNotifications(testUserId, {});
    expect(list.total).toBeGreaterThan(0);

    const firstId = list.data[0].id;
    const readResult = await notifService.markAsRead(firstId, testUserId);
    expect(readResult.read).toBe(true);
  });

  it('Module 31: Universal search returns multi-faceted results', async () => {
    const res = await searchService.universalSearch({ q: 'engineer', type: 'all' });
    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('Module 31: Bookmarks CRUD allows saving and unsaving target records', async () => {
    const bm = await searchService.addBookmark(testUserId, 'project', 'm2-demo-project');
    expect(bm.targetId).toBe('m2-demo-project');

    const list = await searchService.listBookmarks(testUserId);
    expect(list.data.some((b: any) => b.targetId === 'm2-demo-project')).toBe(true);

    const rm = await searchService.removeBookmark(testUserId, 'm2-demo-project');
    expect(rm.success).toBe(true);
  });

  it('Module 26: Returns personalized Opportunity Discovery Feed', async () => {
    const feed = await searchService.getOpportunityFeed(testUserId);
    expect(feed.feed).toBeDefined();
    expect(Array.isArray(feed.feed)).toBe(true);
    if (feed.feed.length > 0) {
      expect(feed.feed[0].matchScore).toBeGreaterThanOrEqual(70);
      expect(Array.isArray(feed.feed[0].reasons)).toBe(true);
    }
  });

  it('Module 30 & 25: Recruiter notifications auto-seed and candidate declining outreach notifies recruiter', async () => {
    // 1. Recruiter auto-seeding
    const recruiterNotifs = await notifService.listNotifications('recruiter-001', {});
    expect(recruiterNotifs.total).toBeGreaterThan(0);
    expect(recruiterNotifs.data.length).toBeGreaterThan(0);

    // 2. Candidate politely declining an opportunity
    const { RealService: RealPipelineService } = await import('../pipeline/real');
    const pipelineService = new RealPipelineService();
    const declineRes = await pipelineService.respondToOpportunity('outreach-demo-001', testUserId, 'declined');
    expect(declineRes.success).toBe(true);
    expect(declineRes.status).toBe('declined');

    // 3. Recruiter received notification about the decline
    const updatedRecruiterNotifs = await notifService.listNotifications('recruiter-001', { category: 'outreach' });
    expect(updatedRecruiterNotifs.data.some((n: any) => n.title.includes('Declined'))).toBe(true);
  });
});
