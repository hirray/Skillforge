import { Shortlist, CompareResult, RecruiterNote, OutreachMessage } from '@skillforge/contract';

export class MockService {
  private mockPipeline: Shortlist[] = [
    {
      id: 'pipeline-001',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-001',
      stage: 'Shortlisted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      candidate: {
        id: 'user-001',
        name: 'Arjun Rao',
        email: 'student@example.com',
        headline: 'Fullstack Systems Engineer',
        location: 'Remote',
        workMode: 'remote',
        experienceYears: 2,
        skills: ['TypeScript', 'React', 'Node.js', 'Prisma'],
        commitsCount: 14,
        tasksCount: 8,
        verifiedProjectsCount: 1,
        recruiterVisible: true,
        contactPreference: 'open',
      },
      job: {
        id: 'm2-demo-job',
        title: 'Machine Learning Engineer',
      },
      stageHistory: [
        {
          id: 'hist-001',
          entryId: 'pipeline-001',
          fromStage: 'New',
          toStage: 'Shortlisted',
          changedBy: 'recruiter-001',
          createdAt: new Date().toISOString(),
        },
      ],
      notes: [
        {
          id: 'note-001',
          entryId: 'pipeline-001',
          authorId: 'recruiter-001',
          text: 'Strong GitHub commits and solid performance on verified project.',
          createdAt: new Date().toISOString(),
        },
      ],
      outreach: [],
    },
    {
      id: 'pipeline-002',
      companyId: 'm2-demo-company',
      recruiterId: 'recruiter-001',
      jobId: 'm2-demo-job',
      userId: 'user-002',
      stage: 'Reviewed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      candidate: {
        id: 'user-002',
        name: 'Maya Chen',
        email: 'freelancer@example.com',
        headline: 'Systems & Backend Architect',
        location: 'Remote',
        workMode: 'remote',
        experienceYears: 3,
        skills: ['Python', 'FastAPI', 'Redis', 'Docker', 'Async Architecture'],
        commitsCount: 28,
        tasksCount: 14,
        verifiedProjectsCount: 2,
        recruiterVisible: true,
        contactPreference: 'open',
      },
      job: {
        id: 'm2-demo-job',
        title: 'Machine Learning Engineer',
      },
      stageHistory: [
        {
          id: 'hist-002',
          entryId: 'pipeline-002',
          fromStage: 'New',
          toStage: 'Reviewed',
          changedBy: 'recruiter-001',
          createdAt: new Date().toISOString(),
        },
      ],
      notes: [],
      outreach: [],
    },
  ];

  async getPipeline(params: { companyId?: string; jobId?: string; stage?: string }): Promise<Shortlist[]> {
    return this.mockPipeline.filter((p) => {
      if (params.jobId && p.jobId !== params.jobId) return false;
      if (params.stage && p.stage !== params.stage) return false;
      return true;
    });
  }

  async addToPipeline(data: { candidateId: string; companyId?: string; jobId?: string; stage?: string }, recruiterId: string): Promise<Shortlist> {
    const newEntry: Shortlist = {
      id: `pipeline-${Date.now()}`,
      companyId: data.companyId || 'm2-demo-company',
      recruiterId,
      jobId: data.jobId || null,
      userId: data.candidateId,
      stage: data.stage || 'Shortlisted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      candidate: {
        id: data.candidateId,
        name: 'Candidate',
        headline: 'Software Engineer',
        skills: ['TypeScript', 'Node.js'],
        location: 'Remote',
        workMode: 'remote',
        experienceYears: 2,
        commitsCount: 10,
        tasksCount: 5,
        verifiedProjectsCount: 1,
        recruiterVisible: true,
        contactPreference: 'open',
      },
      stageHistory: [
        {
          id: `hist-${Date.now()}`,
          entryId: `pipeline-${Date.now()}`,
          fromStage: 'New',
          toStage: data.stage || 'Shortlisted',
          changedBy: recruiterId,
          createdAt: new Date().toISOString(),
        },
      ],
      notes: [],
      outreach: [],
    };
    this.mockPipeline.push(newEntry);
    return newEntry;
  }

  async updatePipelineEntry(id: string, update: { stage?: string; recruiterNote?: string; contacted?: boolean }, recruiterId: string): Promise<Shortlist> {
    const entry = this.mockPipeline.find((p) => p.id === id);
    if (!entry) throw new Error('Not found');
    if (update.stage && update.stage !== entry.stage) {
      entry.stageHistory?.push({
        id: `hist-${Date.now()}`,
        entryId: id,
        fromStage: entry.stage,
        toStage: update.stage,
        changedBy: recruiterId,
        createdAt: new Date().toISOString(),
      });
      entry.stage = update.stage;
    }
    if (update.recruiterNote) {
      entry.notes?.push({
        id: `note-${Date.now()}`,
        entryId: id,
        authorId: recruiterId,
        text: update.recruiterNote,
        createdAt: new Date().toISOString(),
      });
    }
    return entry;
  }

  async addNote(entryId: string, text: string, recruiterId: string): Promise<RecruiterNote> {
    const note: RecruiterNote = {
      id: `note-${Date.now()}`,
      entryId,
      authorId: recruiterId,
      text,
      createdAt: new Date().toISOString(),
    };
    const entry = this.mockPipeline.find((p) => p.id === entryId);
    entry?.notes?.push(note);
    return note;
  }

  async sendOutreach(entryId: string, text: string, recruiterId: string): Promise<OutreachMessage> {
    const msg: OutreachMessage = {
      id: `outreach-${Date.now()}`,
      entryId,
      recruiterId,
      candidateId: 'user-001',
      text,
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const entry = this.mockPipeline.find((p) => p.id === entryId);
    entry?.outreach?.push(msg);
    if (entry && (entry.stage === 'New' || entry.stage === 'Shortlisted')) {
      entry.stage = 'Contacted';
    }
    return msg;
  }

  async compareCandidates(params: { candidateIds: string[]; jobId?: string }): Promise<CompareResult> {
    return {
      jobId: params.jobId || 'm2-demo-job',
      jobTitle: 'Machine Learning Engineer',
      comparedAt: new Date().toISOString(),
      candidates: params.candidateIds.map((cId) => ({
        candidateId: cId,
        candidateName: cId === 'user-001' ? 'Arjun Rao' : 'Maya Chen',
        headline: 'Fullstack Systems Engineer',
        location: 'Remote',
        workMode: 'remote',
        experienceYears: 3,
        recruiterVisible: true,
        visible: true,
        skills: [
          { name: 'TypeScript', evidenceLevel: 'advanced', verified: true },
          { name: 'React', evidenceLevel: 'intermediate', verified: true },
        ],
        verifiedProjectsCount: 2,
        commitsCount: 15,
        tasksCount: 8,
        certificatesCount: 1,
        jobFitScore: 92,
        matchReasons: ['Verified collaborative project activity', '15 verified code commits'],
      })),
    };
  }

  async getCandidateOpportunities(_candidateId: string): Promise<any[]> {
    return [];
  }

  async respondToOpportunity(_messageId: string, _candidateId: string, status: 'accepted' | 'declined'): Promise<{ success: boolean; status: string }> {
    return { success: true, status };
  }

  async setContactConsent(_candidateId: string, consent: boolean): Promise<{ recruiterVisible: boolean }> {
    return { recruiterVisible: consent };
  }
}
