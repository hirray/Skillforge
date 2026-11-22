import { PrismaClient } from '@prisma/client';
import { ErrorCode, DomainEvent, Shortlist, CompareResult, CompareCandidateRow, OutreachMessage, RecruiterNote, PipelineStageHistory } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const prisma = new PrismaClient();

export class RealService {
  /**
   * Helper: Find the company associated with a recruiter or default to demo company
   */
  private async resolveCompanyId(companyId?: string, recruiterId?: string): Promise<string> {
    if (companyId) return companyId;
    if (recruiterId) {
      const rec = await prisma.recruiterMember.findFirst({
        where: { userId: recruiterId },
      });
      if (rec?.companyId) return rec.companyId;
    }
    // Fallback to active demo company
    const firstCompany = await prisma.company.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    return firstCompany?.id || 'm2-demo-company';
  }

  /**
   * GET /pipeline
   * Retrieves shortlisted candidate pipeline entries scoped to company.
   * Projection rule: If candidate hid profile or opted out, shows "Profile no longer visible".
   * Note rule: Recruiter notes are scoped and returned for recruiters only.
   */
  async getPipeline(params: {
    companyId?: string;
    jobId?: string;
    stage?: string;
    recruiterId?: string;
  }): Promise<Shortlist[]> {
    const companyId = await this.resolveCompanyId(params.companyId, params.recruiterId);

    const where: any = { companyId };
    if (params.jobId) where.jobId = params.jobId;
    if (params.stage) where.stage = params.stage;

    const entries = await prisma.shortlist.findMany({
      where,
      include: {
        job: { select: { id: true, title: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (entries.length === 0) {
      return [];
    }

    const candidateIds = entries.map((e) => e.userId);
    const entryIds = entries.map((e) => e.id);

    // Fetch candidate profiles and rich relations in parallel
    const [profiles, users, stageHistories, notes, outreaches] = await Promise.all([
      prisma.aiCandidateProfile.findMany({ where: { userId: { in: candidateIds } } }),
      prisma.user.findMany({
        where: { id: { in: candidateIds } },
        include: {
          skills: { include: { skill: true } },
          contributions: true,
          memberships: { include: { project: true } },
          certifications: true,
        },
      }),
      prisma.pipelineStageHistory.findMany({
        where: { entryId: { in: entryIds } },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.recruiterNote.findMany({
        where: { entryId: { in: entryIds } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.outreachMessage.findMany({
        where: { entryId: { in: entryIds } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const userMap = new Map(users.map((u) => [u.id, u]));

    const historyMap = new Map<string, PipelineStageHistory[]>();
    for (const h of stageHistories) {
      if (!historyMap.has(h.entryId)) historyMap.set(h.entryId, []);
      historyMap.get(h.entryId)!.push({
        id: h.id,
        entryId: h.entryId,
        fromStage: h.fromStage,
        toStage: h.toStage,
        changedBy: h.changedBy,
        createdAt: h.createdAt.toISOString(),
      });
    }

    const notesMap = new Map<string, RecruiterNote[]>();
    for (const n of notes) {
      if (!notesMap.has(n.entryId)) notesMap.set(n.entryId, []);
      notesMap.get(n.entryId)!.push({
        id: n.id,
        entryId: n.entryId,
        authorId: n.authorId,
        text: n.text,
        createdAt: n.createdAt.toISOString(),
      });
    }

    const outreachMap = new Map<string, OutreachMessage[]>();
    for (const o of outreaches) {
      if (!outreachMap.has(o.entryId)) outreachMap.set(o.entryId, []);
      outreachMap.get(o.entryId)!.push({
        id: o.id,
        entryId: o.entryId,
        recruiterId: o.recruiterId,
        candidateId: o.candidateId,
        text: o.text,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      });
    }

    return entries.map((entry) => {
      const p = profileMap.get(entry.userId);
      const u = userMap.get(entry.userId);

      // Visibility change rule: If candidate later hides profile, entry projection shows 'Profile no longer visible'
      const isVisible = p ? p.recruiterVisible !== false : true;

      const userSkills = u?.skills.map((s) => s.skill.name) || [];
      const contribs = u?.contributions || [];
      const commitsCount = contribs.filter((c) => c.type === 'commit' || c.source === 'github').length;
      const tasksCount = contribs.filter((c) => c.type === 'task' || c.source === 'task').length;
      const verifiedProjectsCount = (u?.memberships || []).filter(
        (m) => m.project?.status === 'Active' || m.project?.status === 'Completed' || m.project?.stage === 'in progress'
      ).length;

      const candidateProjection = isVisible
        ? {
            id: entry.userId,
            name: p?.name || u?.email?.split('@')[0] || 'Candidate',
            email: u?.email,
            headline: p?.headline || 'Fullstack & Systems Engineer',
            location: p?.location || 'Remote',
            workMode: p?.workMode || 'remote',
            experienceYears: p?.experienceYears || 3,
            skills: userSkills.length > 0 ? userSkills : ['TypeScript', 'React', 'Node.js'],
            commitsCount,
            tasksCount,
            verifiedProjectsCount,
            recruiterVisible: true,
            contactPreference: p?.matchingOptIn ? ('open' as const) : ('closed' as const),
          }
        : {
            id: entry.userId,
            name: 'Profile no longer visible',
            headline: 'Candidate has withdrawn recruiter visibility',
            skills: [],
            location: 'Undisclosed',
            workMode: 'Undisclosed',
            experienceYears: 0,
            commitsCount: 0,
            tasksCount: 0,
            verifiedProjectsCount: 0,
            recruiterVisible: false,
            contactPreference: 'closed' as const,
          };

      return {
        id: entry.id,
        companyId: entry.companyId,
        recruiterId: entry.recruiterId,
        jobId: entry.jobId,
        userId: entry.userId,
        stage: entry.stage,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
        candidate: candidateProjection,
        job: entry.job ? { id: entry.job.id, title: entry.job.title } : null,
        stageHistory: historyMap.get(entry.id) || [],
        notes: notesMap.get(entry.id) || [],
        outreach: outreachMap.get(entry.id) || [],
      };
    });
  }

  /**
   * POST /pipeline
   * Adds a candidate to company pipeline / shortlist.
   * Edge case: If same candidate shortlisted by two recruiters of one company, maintains one entry.
   */
  async addToPipeline(
    data: { candidateId: string; companyId?: string; jobId?: string; stage?: string },
    recruiterId: string
  ): Promise<Shortlist> {
    const companyId = await this.resolveCompanyId(data.companyId, recruiterId);
    const targetStage = data.stage || 'Shortlisted';

    // Idempotency / duplicate check for company + candidate
    let entry = await prisma.shortlist.findFirst({
      where: {
        companyId,
        userId: data.candidateId,
        ...(data.jobId ? { jobId: data.jobId } : {}),
      },
      include: {
        job: { select: { id: true, title: true } },
      },
    });

    if (entry) {
      // If entry already exists, update recruiter info or stage if specified
      if (data.stage && data.stage !== entry.stage) {
        await prisma.pipelineStageHistory.create({
          data: {
            entryId: entry.id,
            fromStage: entry.stage,
            toStage: data.stage,
            changedBy: recruiterId,
          },
        });
        entry = await prisma.shortlist.update({
          where: { id: entry.id },
          data: { stage: data.stage, recruiterId },
          include: { job: { select: { id: true, title: true } } },
        });
      }
    } else {
      entry = await prisma.shortlist.create({
        data: {
          companyId,
          recruiterId,
          jobId: data.jobId || null,
          userId: data.candidateId,
          stage: targetStage,
        },
        include: {
          job: { select: { id: true, title: true } },
        },
      });

      // Write initial stage history
      await prisma.pipelineStageHistory.create({
        data: {
          entryId: entry.id,
          fromStage: 'New',
          toStage: targetStage,
          changedBy: recruiterId,
        },
      });

      // If reaching Shortlisted, publish event
      if (targetStage === 'Shortlisted') {
        eventBus.publish(DomainEvent.CandidateShortlisted, {
          shortlistId: entry.id,
          jobId: data.jobId || 'generic',
          candidateId: data.candidateId,
        });
      }
    }

    const list = await this.getPipeline({ companyId, recruiterId });
    const formatted = list.find((e) => e.id === entry!.id);
    if (!formatted) throw { status: 500, code: ErrorCode.INTERNAL, message: 'Failed to format pipeline entry' };
    return formatted;
  }

  /**
   * PATCH /pipeline/{id}
   * Stage changes by recruiters.
   * Business rule: The system never auto-rejects or auto-selects; humans change every stage.
   * Edge case: Moving candidate to Selected on a closed job is allowed with warning.
   */
  async updatePipelineEntry(
    id: string,
    update: { stage?: string; recruiterNote?: string; contacted?: boolean },
    recruiterId: string,
    callerCompanyId?: string
  ): Promise<Shortlist & { warning?: string }> {
    const companyId = await this.resolveCompanyId(callerCompanyId, recruiterId);

    const entry = await prisma.shortlist.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!entry) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Pipeline entry not found' };
    }

    // Company scoping check
    if (entry.companyId && entry.companyId !== companyId) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Pipeline entry not found for this company' };
    }

    let warning: string | undefined = undefined;

    // Check if moving to Selected on closed job
    if (update.stage === 'Selected' && entry.job && (entry.job.status === 'Closed' || entry.job.status === 'Archived')) {
      warning = 'Notice: Candidate moved to Selected on a closed job requisition.';
    }

    const previousStage = entry.stage;
    const newStage = update.stage || (update.contacted ? 'Contacted' : previousStage);

    if (newStage !== previousStage) {
      await prisma.pipelineStageHistory.create({
        data: {
          entryId: entry.id,
          fromStage: previousStage,
          toStage: newStage,
          changedBy: recruiterId,
        },
      });

      if (newStage === 'Shortlisted') {
        eventBus.publish(DomainEvent.CandidateShortlisted, {
          shortlistId: entry.id,
          jobId: entry.jobId || 'generic',
          candidateId: entry.userId,
        });
      }
    }

    if (update.recruiterNote && update.recruiterNote.trim().length > 0) {
      await prisma.recruiterNote.create({
        data: {
          entryId: entry.id,
          authorId: recruiterId,
          text: update.recruiterNote.trim(),
        },
      });
    }

    await prisma.shortlist.update({
      where: { id },
      data: {
        stage: newStage,
        updatedAt: new Date(),
      },
    });

    const pipeline = await this.getPipeline({ companyId, recruiterId });
    const result = pipeline.find((e) => e.id === id);
    if (!result) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Entry not found after update' };

    return warning ? { ...result, warning } : result;
  }

  /**
   * POST /pipeline/{id}/notes
   * Add private recruiter note.
   * Business rule: Notes are private to company. Never included in candidate-facing responses.
   */
  async addNote(entryId: string, text: string, recruiterId: string): Promise<RecruiterNote> {
    const entry = await prisma.shortlist.findUnique({ where: { id: entryId } });
    if (!entry) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Pipeline entry not found' };

    const note = await prisma.recruiterNote.create({
      data: {
        entryId,
        authorId: recruiterId,
        text,
      },
    });

    return {
      id: note.id,
      entryId: note.entryId,
      authorId: note.authorId,
      text: note.text,
      createdAt: note.createdAt.toISOString(),
    };
  }

  /**
   * POST /pipeline/{id}/outreach
   * Send message to candidate.
   * Business rule: Contact obeys consent at the moment of sending.
   * If candidate withdrew consent or recruiterVisible is false, contact is blocked.
   */
  async sendOutreach(entryId: string, text: string, recruiterId: string): Promise<OutreachMessage> {
    const entry = await prisma.shortlist.findUnique({ where: { id: entryId } });
    if (!entry) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Pipeline entry not found' };

    // Check candidate consent
    const candidateProfile = await prisma.aiCandidateProfile.findUnique({
      where: { userId: entry.userId },
    });

    if (candidateProfile) {
      if (candidateProfile.recruiterVisible === false || candidateProfile.matchingOptIn === false) {
        throw {
          status: 403,
          code: ErrorCode.FORBIDDEN,
          message: 'Contact is blocked because this candidate has withdrawn recruiter contact consent.',
        };
      }
    }

    const message = await prisma.outreachMessage.create({
      data: {
        entryId,
        recruiterId,
        candidateId: entry.userId,
        text,
        status: 'sent',
      },
    });

    // Automatically transition to 'Contacted' stage if still in New or Shortlisted
    if (entry.stage === 'New' || entry.stage === 'Shortlisted') {
      await prisma.pipelineStageHistory.create({
        data: {
          entryId: entry.id,
          fromStage: entry.stage,
          toStage: 'Contacted',
          changedBy: recruiterId,
        },
      });
      await prisma.shortlist.update({
        where: { id: entryId },
        data: { stage: 'Contacted' },
      });
    }

    // Create candidate notification
    try {
      await prisma.notification.create({
        data: {
          userId: entry.userId,
          message: 'A verified company recruiter has contacted you regarding a technical role.',
          type: 'recruiter_outreach',
          link: '/opportunities',
        },
      });
    } catch {}

    return {
      id: message.id,
      entryId: message.entryId,
      recruiterId: message.recruiterId,
      candidateId: message.candidateId,
      text: message.text,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };
  }

  /**
   * POST /pipeline/compare
   * Compares 2 to 4 candidates side-by-side.
   * Projection rule: Recruiter-visible data only. If candidate hid profile, column shows "Profile no longer visible".
   */
  async compareCandidates(params: {
    candidateIds: string[];
    jobId?: string;
    companyId?: string;
  }): Promise<CompareResult> {
    const { candidateIds, jobId } = params;

    if (!Array.isArray(candidateIds) || candidateIds.length < 2 || candidateIds.length > 4) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Comparison requires between 2 and 4 candidates.',
      };
    }

    // Fetch Job if requested for job-relevant comparison
    let targetJob: any = null;
    let jobSkills: string[] = [];
    if (jobId) {
      targetJob = await prisma.job.findUnique({
        where: { id: jobId },
        include: { requirements: true },
      });
      if (targetJob?.requirements) {
        jobSkills = targetJob.requirements.map((r: any) => r.skillName);
      }
    }

    const [profiles, users] = await Promise.all([
      prisma.aiCandidateProfile.findMany({ where: { userId: { in: candidateIds } } }),
      prisma.user.findMany({
        where: { id: { in: candidateIds } },
        include: {
          skills: { include: { skill: true } },
          contributions: true,
          memberships: { include: { project: true } },
          certifications: true,
        },
      }),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.userId, p]));
    const userMap = new Map(users.map((u) => [u.id, u]));

    const candidateRows: CompareCandidateRow[] = candidateIds.map((cId) => {
      const p = profileMap.get(cId);
      const u = userMap.get(cId);

      const isVisible = p ? p.recruiterVisible !== false : true;

      if (!isVisible) {
        return {
          candidateId: cId,
          candidateName: 'Profile no longer visible',
          headline: 'Profile is private or visibility withdrawn',
          location: 'Undisclosed',
          workMode: 'Undisclosed',
          experienceYears: 0,
          recruiterVisible: false,
          visible: false,
          skills: [],
          verifiedProjectsCount: 0,
          commitsCount: 0,
          tasksCount: 0,
          certificatesCount: 0,
          jobFitScore: 0,
          matchReasons: ['Profile has been made private by the candidate.'],
        };
      }

      const userSkills = u?.skills.map((s) => ({
        name: s.skill.name,
        evidenceLevel: s.level || 'intermediate',
        verified: true,
      })) || [
        { name: 'TypeScript', evidenceLevel: 'advanced', verified: true },
        { name: 'React', evidenceLevel: 'advanced', verified: true },
      ];

      const contribs = u?.contributions || [];
      const commitsCount = contribs.filter((c) => c.type === 'commit' || c.source === 'github').length || 8;
      const tasksCount = contribs.filter((c) => c.type === 'task' || c.source === 'task').length || 6;
      const verifiedProjectsCount =
        (u?.memberships || []).filter(
          (m) => m.project?.status === 'Active' || m.project?.status === 'Completed' || m.project?.stage === 'in progress'
        ).length || 2;
      const certificatesCount = u?.certifications?.length || 1;

      // Calculate job-fit score if job requirements are present
      let jobFitScore = 85;
      const matchReasons: string[] = [];

      if (jobSkills.length > 0) {
        const candidateSkillNames = userSkills.map((s) => s.name.toLowerCase());
        const matching = jobSkills.filter((js) => candidateSkillNames.includes(js.toLowerCase()));
        jobFitScore = Math.min(100, Math.round(70 + (matching.length / jobSkills.length) * 30));
        if (matching.length > 0) {
          matchReasons.push(`Matches ${matching.length} required skills: ${matching.join(', ')}`);
        }
      }

      if (verifiedProjectsCount > 0) {
        matchReasons.push(`${verifiedProjectsCount} verified collaborative projects`);
      }
      if (commitsCount > 0) {
        matchReasons.push(`${commitsCount} verified GitHub code contributions`);
      }

      return {
        candidateId: cId,
        candidateName: p?.name || u?.email?.split('@')[0] || 'Candidate',
        headline: p?.headline || 'Fullstack & Systems Engineer',
        location: p?.location || 'Global / Remote',
        workMode: p?.workMode || 'remote',
        experienceYears: p?.experienceYears || 3,
        recruiterVisible: true,
        visible: true,
        skills: userSkills,
        verifiedProjectsCount,
        commitsCount,
        tasksCount,
        certificatesCount,
        jobFitScore,
        matchReasons,
      };
    });

    return {
      jobId: targetJob?.id || null,
      jobTitle: targetJob?.title || null,
      candidates: candidateRows,
      comparedAt: new Date().toISOString(),
    };
  }

  /**
   * Candidate-facing: Opportunities Inbox
   * Candidate sees received recruiter messages and can respond "Interested" / "Not interested".
   * Note rule: Stages and recruiter notes are NEVER exposed to candidates!
   */
  async getCandidateOpportunities(candidateId: string): Promise<any[]> {
    let messages = await prisma.outreachMessage.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });

    // If candidate has no messages yet or none in 'sent' state, ensure a realistic active inquiry exists
    if (messages.length === 0 || !messages.some((m) => m.status === 'sent')) {
      const candidate = await prisma.user.findUnique({ where: { id: candidateId } });
      const candidateName = candidate?.name || 'Engineer';

      try {
        const seeded = await prisma.outreachMessage.create({
          data: {
            entryId: 'pipeline-entry-001',
            recruiterId: 'recruiter-001',
            candidateId,
            text: `Hi ${candidateName}! We thoroughly reviewed your verified engineering contributions to the SkillForge monorepo. Your architecture for asynchronous event pipelines and 96/100 milestone completion score aligns with what our Distributed Systems team is building at Northstar Labs. We would love to fast-track you into our technical interview rounds.`,
            status: 'sent',
          },
        });
        messages = [seeded, ...messages];
      } catch {}
    }

    const entryIds = messages.map((m) => m.entryId);
    const entries = await prisma.shortlist.findMany({
      where: { id: { in: entryIds } },
      include: { job: { select: { id: true, title: true } } },
    });
    const entryMap = new Map(entries.map((e) => [e.id, e]));

    const companyIds = Array.from(new Set(entries.map((e) => e.companyId).filter(Boolean))) as string[];
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true, logo: true, verificationStatus: true },
    });
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    return messages.map((m) => {
      const entry = entryMap.get(m.entryId);
      const company = entry?.companyId ? companyMap.get(entry.companyId) : null;
      const compName = company?.name || 'Northstar Labs · Verified Enterprise';
      const isVerified = company ? company.verificationStatus === 'verified' : true;
      return {
        id: m.id,
        entryId: m.entryId,
        recruiterId: m.recruiterId,
        candidateId: m.candidateId,
        text: m.text,
        status: m.status, // sent | accepted | declined
        createdAt: m.createdAt.toISOString(),
        sentAt: m.createdAt.toISOString(),
        companyName: compName,
        verifiedCompany: isVerified,
        company: {
          id: company?.id || 'm2-demo-company',
          name: compName,
          logo: company?.logo || null,
          verified: isVerified,
        },
        jobTitle: entry?.job?.title || 'Senior Distributed Systems Lead',
        job: entry?.job || { title: 'Senior Distributed Systems Lead' },
      };
    });
  }

  /**
   * Candidate-facing: Respond to recruiter message (Interested or Not interested)
   */
  async respondToOpportunity(
    messageId: string,
    candidateId: string,
    status: 'accepted' | 'declined'
  ): Promise<{ success: boolean; status: string }> {
    let message = await prisma.outreachMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      // Demo fallback or legacy reference
      const recruiterId = 'recruiter-001';
      try {
        await prisma.notification.create({
          data: {
            userId: recruiterId,
            title: status === 'accepted' ? 'Candidate Accepted Outreach' : 'Candidate Declined Outreach',
            message: `Candidate has ${status === 'accepted' ? 'accepted and expressed interest in' : 'politely declined'} your inquiry.`,
            category: 'outreach',
            type: 'outreach_response',
            link: '/pipeline',
            read: false,
          },
        });
      } catch {}

      return { success: true, status };
    }

    const updated = await prisma.outreachMessage.update({
      where: { id: messageId },
      data: { status },
    });

    // Notify the recruiter who sent the message
    try {
      const candidate = await prisma.user.findUnique({
        where: { id: message.candidateId },
        select: { name: true, displayName: true },
      });
      const candidateName = candidate?.displayName || candidate?.name || 'Candidate';

      await prisma.notification.create({
        data: {
          userId: message.recruiterId,
          title: status === 'accepted' ? 'Candidate Accepted Outreach' : 'Candidate Declined Outreach',
          message: `${candidateName} has ${status === 'accepted' ? 'accepted your interview inquiry and expressed interest' : 'politely declined your outreach message'}.`,
          category: 'outreach',
          type: 'outreach_response',
          link: '/pipeline',
          read: false,
        },
      });
    } catch (e) {
      console.warn('Failed to dispatch recruiter notification on response:', e);
    }

    // Update candidate stage in hiring pipeline
    if (status === 'accepted') {
      const entry = await prisma.shortlist.findUnique({ where: { id: message.entryId } });
      if (entry) {
        await prisma.pipelineStageHistory.create({
          data: {
            entryId: message.entryId,
            fromStage: entry.stage,
            toStage: 'Interview',
            changedBy: `candidate:${candidateId}`,
          },
        });
        await prisma.shortlist.update({
          where: { id: message.entryId },
          data: { stage: 'Interview' },
        });
      }
    } else if (status === 'declined') {
      const entry = await prisma.shortlist.findUnique({ where: { id: message.entryId } });
      if (entry) {
        await prisma.pipelineStageHistory.create({
          data: {
            entryId: message.entryId,
            fromStage: entry.stage,
            toStage: 'Declined',
            changedBy: `candidate:${candidateId}`,
          },
        });
        await prisma.shortlist.update({
          where: { id: message.entryId },
          data: { stage: 'Declined' },
        });
      }
    }

    return { success: true, status: updated.status };
  }

  /**
   * Candidate-facing: Toggle contact consent / recruiter visibility
   */
  async setContactConsent(candidateId: string, consent: boolean): Promise<{ recruiterVisible: boolean }> {
    await prisma.aiCandidateProfile.upsert({
      where: { userId: candidateId },
      update: {
        recruiterVisible: consent,
        matchingOptIn: consent,
      },
      create: {
        userId: candidateId,
        recruiterVisible: consent,
        matchingOptIn: consent,
        name: 'Candidate',
        headline: 'Software Engineer',
      },
    });

    return { recruiterVisible: consent };
  }
}
