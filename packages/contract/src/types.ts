export * from './errors';
export * from './events';

// Basic types
export interface User {
  id: string;
  email: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ProjectRequirement {
  id?: string;
  projectId?: string;
  skill?: string;
  skillName?: string;
  type?: string;
  proficiency?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
  isOptional?: boolean;
}

export interface ProjectRole {
  id?: string;
  projectId?: string;
  title: string;
  openings: number;
  filled?: number;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  responsibilities?: string;
  status: 'active' | 'left' | 'removed' | string;
  joinedAt: string;
  leftAt?: string | null;
  leaveReason?: string | null;
  removalReason?: string | null;
  user?: User;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  inviterId?: string;
  inviteeId?: string;
  userId?: string;
  role: string;
  note?: string;
  gapId?: string | null;
  status: 'Pending' | 'Accepted' | 'Declined' | 'Expired' | 'pending' | 'accepted' | 'declined' | 'expired' | string;
  createdAt: string;
  expiresAt: string;
  respondedAt?: string;
  project?: Project;
  user?: User;
}

export interface JoinRequest {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  message?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'pending' | 'approved' | 'rejected' | 'withdrawn' | string;
  rejectionReason?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  user?: User;
}

export interface OwnershipTransfer {
  id: string;
  projectId: string;
  currentOwnerId: string;
  newOwnerId: string;
  status: 'Pending' | 'Accepted' | 'Declined' | string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  status: 'Draft' | 'Recruiting' | 'Active' | 'Paused' | 'Completed' | 'Archived' | string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  problemStatement?: string;
  category?: string;
  type?: string;
  outcome?: string;
  coverImage?: string;
  visibility?: 'Public' | 'Private' | 'Platform-only' | 'Invite-only' | string;
  duration?: string;
  targetDate?: string;
  stage?: 'Idea' | 'Prototype' | 'MVP' | 'Production' | string;
  minTeamSize?: number;
  maxTeamSize?: number;
  budget?: number;
  paid?: boolean;
  joinMode?: 'invite_only' | 'apply' | 'both' | string;
  memberApprovalMode?: 'owner' | 'consensus' | string;
  requirements?: ProjectRequirement[];
  roles?: ProjectRole[];
  members?: ProjectMember[];
  invitations?: ProjectInvitation[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done' | string;
  assigneeId?: string;
  creatorId: string;
  dueDate?: string;
  estimatedHours?: number;
  needsReassignment?: boolean;
  milestoneId?: string;
  dependsOn?: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Overdue' | string;
  progressPercentage: number;
  isManualCompletion?: boolean;
  completedBy?: string;
  completedAt?: string;
  completionRationale?: string;
  tasks?: any[];
  history?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  id: string;
  projectId: string;
  name?: string;
  type: 'group' | 'direct' | string;
  participant1Id?: string;
  participant2Id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  parentId?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  attachments?: any;
  mentions?: string[];
  createdAt: string;
  updatedAt: string;
  senderName?: string;
  isFormerMember?: boolean;
}

export interface ProjectResource {
  id: string;
  projectId: string;
  title: string;
  type: 'link' | 'file';
  category?: 'Repository' | 'Design' | 'Docs' | 'Demo' | 'Dataset' | 'Other' | string;
  url?: string | null;
  fileKey?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  addedBy: string;
  uploaderName?: string;
  isFormerMember?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectGap {
  id: string;
  projectId: string;
  roleId?: string | null;
  roleTitle?: string | null;
  skillsJson: string;
  skills?: string[];
  targetProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
  hoursPerWeek: number;
  status: 'open' | 'filled' | 'cancelled' | string;
  origin: 'member_left' | 'inactive' | 'manual' | string;
  departedUserId?: string | null;
  createdAt: string;
  updatedAt: string;
  handoverNote?: HandoverNote | null;
  project?: Project;
}

export interface HandoverNote {
  id: string;
  projectId: string;
  gapId?: string | null;
  authorId: string;
  workState: string;
  unfinishedTasksJson: string;
  unfinishedTasks?: string[];
  repoInfo?: string | null;
  decisions?: string | null;
  candidateSummary: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface MentorProfile {
  id: string;
  userId: string;
  expertiseSkillIds: string[];
  domains: string[];
  availability: string;
  formats: string[];
  bio?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface MentorshipRequest {
  id: string;
  projectId: string;
  mentorId: string;
  scope: 'general' | 'milestone' | string;
  milestoneId?: string | null;
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    title: string;
    stage?: string;
  };
  mentor?: {
    id: string;
    email: string;
  };
  milestone?: {
    id: string;
    title: string;
  };
}

export interface MentorFeedback {
  id: string;
  projectId: string;
  mentorId: string;
  milestoneId?: string | null;
  text: string;
  isAdvisory: boolean;
  createdAt: string;
  updatedAt: string;
  mentor?: {
    id: string;
    email: string;
  };
  milestone?: {
    id: string;
    title: string;
  };
}

export interface HackathonEvent {
  id: string;
  name: string;
  description: string;
  theme: string;
  startsAt: string;
  endsAt: string;
  rules?: string | null;
  suggestedSkillIds: string[];
  status: 'draft' | 'open' | 'running' | 'ended' | 'archived' | string;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  organizer?: {
    id: string;
    email: string;
  };
  participants?: EventParticipant[];
  projects?: any[];
  _count?: {
    participants?: number;
    projects?: number;
  };
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  lookingForTeam: boolean;
  skillsSnapshot: string[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
  };
}

// Module 13: GitHub Integration
export interface GitHubIntegration {
  id: string;
  userId: string;
  username?: string | null;
  scopes?: string | null;
  status: 'connected' | 'revoked' | string;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRepo {
  id: string;
  projectId: string;
  owner: string;
  name: string;
  githubRepoId?: string | null;
  lastSyncedAt?: string | null;
  status: 'active' | 'syncing' | 'error' | string;
  createdAt: string;
  updatedAt: string;
}

export interface ContributionEvent {
  id: string;
  userId: string;
  projectId: string;
  detail: string;
  type: 'commit' | 'pr' | 'review' | 'issue' | 'task' | string;
  source: 'github' | 'manual' | 'task' | string;
  externalId?: string | null;
  externalLogin?: string | null;
  referenceUrl?: string | null;
  occurredAt: string;
  metadataJson?: string | null;
  createdAt: string;
  user?: User;
  project?: Project;
}

// Module 21: Company & Recruiter Accounts
export interface Company {
  id: string;
  name: string;
  logo?: string | null;
  overview?: string | null;
  industry?: string | null;
  sizeBand?: string | null;
  website?: string | null;
  locations?: string | null;
  hiringFocus?: string | null;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected' | string;
  verificationReason?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  recruiters?: RecruiterMember[];
  jobs?: Job[];
}

export interface RecruiterMember {
  id: string;
  companyId: string;
  userId: string;
  role: 'recruiter_admin' | 'recruiter_member' | string;
  joinedAt: string;
  company?: Company;
  user?: User;
}

export interface RecruiterInvite {
  id: string;
  companyId: string;
  email: string;
  role: 'recruiter_admin' | 'recruiter_member' | string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked' | string;
  expiresAt: string;
  createdAt: string;
}

// Module 22: Job / Opportunity Posting
export interface JobRequirement {
  id: string;
  jobId?: string;
  skillName: string;
  skillId?: string | null;
  importance: 'required' | 'preferred' | string;
  minProficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  department?: string | null;
  employmentType?: 'Full-time' | 'Internship' | 'Contract' | 'Freelance' | string | null;
  description?: string | null;
  responsibilities?: string | null;
  location?: string | null;
  workMode: 'remote' | 'hybrid' | 'on-site' | string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  benefits?: string | null;
  applicationUrl?: string | null;
  status: 'Draft' | 'Active' | 'Paused' | 'Closed' | 'Archived' | string;
  stale?: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  requirements?: JobRequirement[];
  applications?: JobApplication[];
  _count?: {
    applications?: number;
    matches?: number;
  };
}

export interface JobApplication {
  id: string;
  jobId: string;
  userId: string;
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | string;
  resumeId?: string | null;
  coverLetter?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  job?: Job;
}



