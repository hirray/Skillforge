import { PrismaClient } from '@prisma/client';
import { getSocketServer } from '../../core/socket';

const prisma = new PrismaClient();

export interface DispatchNotificationOptions {
  userId: string;
  title?: string;
  message: string;
  category?: string; // outreach | challenge | pipeline | mentorship | system
  link?: string;
  type?: string;
  dedupeKey?: string;
  payload?: any;
}

export class RealNotificationsService {
  /**
   * Send a notification respecting preferences, dedupe, and real-time socket
   */
  async dispatchNotification(options: DispatchNotificationOptions) {
    const { userId, title, message, category = 'system', link, type = 'general', dedupeKey, payload } = options;

    // Check preferences for this specific category
    const pref = await prisma.notificationPreference.findUnique({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
    });

    if (pref && pref.inApp === false) {
      return null;
    }

    // Deduplication check
    if (dedupeKey) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          dedupeKey,
        },
      });
      if (existing) {
        return existing;
      }
    }

    const notif = await prisma.notification.create({
      data: {
        userId,
        title: title || 'New Notification',
        message,
        category,
        type,
        link,
        dedupeKey,
        payloadJson: payload ? JSON.stringify(payload) : null,
        read: false,
      },
    });

    // Real-time socket dispatch
    try {
      const io = getSocketServer();
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', notif);
      }
    } catch {}

    // Simulated email dispatch if enabled
    if (!pref || pref.email) {
      console.log(`[EMAIL DISPATCH] To User ${userId}: [${category.toUpperCase()}] ${title || message}`);
    }

    return notif;
  }

  /**
   * GET /notifications
   */
  async listNotifications(userId: string, filters: { unreadOnly?: boolean; category?: string; limit?: number }) {
    const where: any = { userId };
    if (filters.unreadOnly) {
      where.read = false;
    }
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    const [items, unreadCount, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
      }),
      prisma.notification.count({
        where: { userId, read: false },
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      data: items.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category || 'system',
        type: n.type,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
        payload: n.payloadJson ? JSON.parse(n.payloadJson) : null,
      })),
      unreadCount,
      total,
    };
  }

  /**
   * PATCH /notifications/:id/read
   */
  async markAsRead(id: string, userId: string) {
    const notif = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notif) throw { status: 404, message: 'Notification not found' };

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    return updated;
  }

  /**
   * POST /notifications/read-all
   */
  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  /**
   * GET /notifications/preferences
   */
  async getPreferences(userId: string) {
    const prefs = await prisma.notificationPreference.findMany({
      where: { userId },
    });

    const prefMap: Record<string, { inApp: boolean; email: boolean }> = {
      outreach: { inApp: true, email: true },
      pipeline: { inApp: true, email: true },
      challenge: { inApp: true, email: true },
      mentorship: { inApp: true, email: true },
      system: { inApp: true, email: true },
    };

    prefs.forEach((p) => {
      prefMap[p.category] = { inApp: p.inApp, email: p.email };
    });

    return {
      userId,
      inAppOutreach: prefMap.outreach.inApp,
      emailOutreach: prefMap.outreach.email,
      inAppPipeline: prefMap.pipeline.inApp,
      emailPipeline: prefMap.pipeline.email,
      inAppChallenges: prefMap.challenge.inApp,
      emailChallenges: prefMap.challenge.email,
      inAppMentorship: prefMap.mentorship.inApp,
      emailMentorship: prefMap.mentorship.email,
      inAppSystem: prefMap.system.inApp,
      emailSystem: prefMap.system.email,
    };
  }

  /**
   * PUT /notifications/preferences
   */
  async updatePreferences(userId: string, data: any) {
    const categories: { name: string; inApp?: boolean; email?: boolean }[] = [
      { name: 'outreach', inApp: data.inAppOutreach, email: data.emailOutreach },
      { name: 'pipeline', inApp: data.inAppPipeline, email: data.emailPipeline },
      { name: 'challenge', inApp: data.inAppChallenges, email: data.emailChallenges },
      { name: 'mentorship', inApp: data.inAppMentorship, email: data.emailMentorship },
      { name: 'system', inApp: data.inAppSystem, email: data.emailSystem },
    ];

    for (const cat of categories) {
      if (cat.inApp !== undefined || cat.email !== undefined) {
        await prisma.notificationPreference.upsert({
          where: {
            userId_category: {
              userId,
              category: cat.name,
            },
          },
          create: {
            userId,
            category: cat.name,
            inApp: cat.inApp ?? true,
            email: cat.email ?? true,
          },
          update: {
            inApp: cat.inApp,
            email: cat.email,
          },
        });
      }
    }

    return this.getPreferences(userId);
  }
}

export const realNotificationsService = new RealNotificationsService();
