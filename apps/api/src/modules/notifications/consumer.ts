import { eventBus } from '../../core/eventBus';
import { DomainEvent } from '@skillforge/contract';
import { realNotificationsService } from './real';

/**
 * Subscribe to domain events and map to in-app & email notifications
 */
export function initNotificationConsumer() {
  // Candidate shortlisted
  eventBus.subscribe(DomainEvent.CandidateShortlisted, async (payload: any) => {
    try {
      const { candidateId, jobId, shortlistId } = payload;
      if (candidateId) {
        await realNotificationsService.dispatchNotification({
          userId: candidateId,
          title: 'Direct Recruiter Outreach Received',
          message: 'An enterprise technical team has reviewed your verified proof and shortlisted your candidate profile.',
          category: 'outreach',
          link: '/opportunities',
          type: 'recruiter_outreach',
          dedupeKey: `outreach-${shortlistId || candidateId}`,
          payload: { jobId, shortlistId },
        });
      }
    } catch (e) {
      console.error('[NotificationConsumer] Failed handling CandidateShortlisted:', e);
    }
  });

  // Certificate issued
  eventBus.subscribe(DomainEvent.CertificateIssued, async (payload: any) => {
    try {
      const { userId, certificateId } = payload;
      if (userId) {
        await realNotificationsService.dispatchNotification({
          userId,
          title: 'Completion Certificate Issued',
          message: 'Your production contribution has been verified on the attestation graph! Your verifiable credential is now available.',
          category: 'system',
          link: '/certificates',
          type: 'certificate_issued',
          dedupeKey: `cert-${certificateId}`,
          payload: { certificateId },
        });
      }
    } catch (e) {
      console.error('[NotificationConsumer] Failed handling CertificateIssued:', e);
    }
  });

  // Mentorship requested
  eventBus.subscribe(DomainEvent.MentorshipRequested, async (payload: any) => {
    try {
      const { mentorId, projectId } = payload;
      if (mentorId) {
        await realNotificationsService.dispatchNotification({
          userId: mentorId,
          title: 'New Mentorship Request',
          message: 'An active project team has requested your architectural guidance.',
          category: 'mentorship',
          link: `/projects/${projectId}`,
          type: 'mentorship_requested',
          dedupeKey: `mentor-req-${projectId}-${Date.now()}`,
          payload: { projectId },
        });
      }
    } catch (e) {
      console.error('[NotificationConsumer] Failed handling MentorshipRequested:', e);
    }
  });

  console.log('[NotificationConsumer] Domain event subscribers initialized.');
}
