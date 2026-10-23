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
