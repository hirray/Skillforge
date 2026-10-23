export enum DomainEvent {
  UserRegistered = 'UserRegistered',
  ProfileUpdated = 'ProfileUpdated',
  ResumeUploaded = 'ResumeUploaded',
  ResumeParsed = 'ResumeParsed',
  ProjectCreated = 'ProjectCreated',
  ProjectUpdated = 'ProjectUpdated',
  InvitationSent = 'InvitationSent',
  InvitationResponded = 'InvitationResponded',
  MemberJoined = 'MemberJoined',
  MemberLeft = 'MemberLeft',
  TaskCreated = 'TaskCreated',
  TaskCompleted = 'TaskCompleted',
  MilestoneReached = 'MilestoneReached',
  ResourceAdded = 'ResourceAdded',
  ProjectCompletionRequested = 'ProjectCompletionRequested',
  ProjectVerified = 'ProjectVerified',
  CertificateIssued = 'CertificateIssued',
  CertificateRevoked = 'CertificateRevoked',
  JobPosted = 'JobPosted',
  JobClosed = 'JobClosed',
  CandidateShortlisted = 'CandidateShortlisted',
  MessageSent = 'MessageSent',
  ProjectDeleted = 'ProjectDeleted'
}

export type EventPayloads = {
  [DomainEvent.UserRegistered]: { userId: string };
  [DomainEvent.ProfileUpdated]: { userId: string };
  [DomainEvent.ResumeUploaded]: { userId: string; resumeId: string };
  [DomainEvent.ResumeParsed]: { resumeId: string; extractionId: string };
  [DomainEvent.ProjectCreated]: { projectId: string; ownerId: string };
  [DomainEvent.ProjectUpdated]: { projectId: string };
  [DomainEvent.ProjectDeleted]: { projectId: string };
  [DomainEvent.InvitationSent]: { invitationId: string; projectId: string; userId: string };
  [DomainEvent.InvitationResponded]: { invitationId: string; status: string };
  [DomainEvent.MemberJoined]: { projectId: string; userId: string };
  [DomainEvent.MemberLeft]: { projectId: string; userId: string };
  [DomainEvent.TaskCreated]: { taskId: string; projectId: string };
  [DomainEvent.TaskCompleted]: { taskId: string; projectId: string };
  [DomainEvent.MilestoneReached]: { milestoneId: string; projectId: string };
  [DomainEvent.ResourceAdded]: { resourceId: string; projectId: string; addedBy: string; title: string; type: string };
  [DomainEvent.ProjectCompletionRequested]: { projectId: string };
  [DomainEvent.ProjectVerified]: { projectId: string };
  [DomainEvent.CertificateIssued]: { certificateId: string; userId: string; projectId: string };
  [DomainEvent.CertificateRevoked]: { certificateId: string };
  [DomainEvent.JobPosted]: { jobId: string; companyId: string };
  [DomainEvent.JobClosed]: { jobId: string };
  [DomainEvent.CandidateShortlisted]: { shortlistId: string; jobId: string; candidateId: string };
  [DomainEvent.MessageSent]: { messageId: string; roomId: string };
};
