import { PrismaClient } from '@prisma/client';
import { DomainEvent } from '@skillforge/contract';
import { eventBus } from '../src/core/eventBus';
import { RealService as CertificateService } from '../src/modules/certificates/real';
import { RealService as PortfolioService } from '../src/modules/portfolio/real';

const prisma = new PrismaClient();

async function main() {
  const eventName = process.argv[2] || 'ProjectVerified';
  const rawPayload = process.argv[3];
  let payload: any = {};

  if (rawPayload) {
    try {
      payload = JSON.parse(rawPayload);
    } catch {
      payload = { projectId: rawPayload };
    }
  }

  console.log(`[Event Emitter] Emitting domain event: ${eventName}`, payload);

  if (eventName === 'ProjectVerified') {
    // Determine projectId or fallback to existing project
    let projectId = payload.projectId;
    if (!projectId) {
      const p = await (prisma as any).project.findFirst();
      projectId = p?.id || 'pilot-project';
    }

    console.log(`[Event Emitter] Triggering ProjectVerified for project: ${projectId}`);
    
    // 1. Issue certificates
    const certService = new CertificateService();
    try {
      const certs = await certService.issueCertificatesForProject(projectId);
      console.log(`[Event Emitter] Issued ${certs.length} certificates for project ${projectId}:`, certs.map(c => c.certNumber));
    } catch (e: any) {
      console.warn(`[Event Emitter] Cert issuance:`, e?.message || e);
    }

    // 2. Populate portfolio experience
    const portService = new PortfolioService();
    try {
      await portService.populateExperienceForProject(projectId);
      console.log(`[Event Emitter] Populated portfolio experience for project ${projectId}`);
    } catch (e: any) {
      console.warn(`[Event Emitter] Portfolio populate:`, e?.message || e);
    }

    // 3. Emit on bus
    eventBus.emitEvent(DomainEvent.ProjectVerified, { projectId });
  } else {
    eventBus.emit(eventName, payload);
  }

  console.log(`[Event Emitter] Finished processing event.`);
}

main().catch(err => {
  console.error('[Event Emitter] Error:', err);
  process.exit(1);
});
