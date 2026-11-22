/**
 * Core Visibility & Privacy Engine
 * PRD Area 2 & Area 31
 *
 * Single source of truth for section-level profile visibility and recruiter access controls.
 */

export type VisibilityLevel = 'public' | 'platform' | 'recruiters' | 'private';

export interface ViewerContext {
  id?: string;
  roles?: string[];
  companyId?: string;
}

export const DEFAULT_VISIBILITY: Record<string, VisibilityLevel> = {
  bio: 'public',
  skills: 'public',
  experience: 'platform',
  education: 'platform',
  certifications: 'public',
  links: 'public',
  availability: 'recruiters',
};

/**
 * Checks if a given viewer is allowed to view a specific profile section of the owner.
 */
export function canView(
  viewer: ViewerContext | null | undefined,
  ownerId: string,
  section: string,
  visibilitySettingsJson?: string | Record<string, any> | null
): boolean {
  // 1. Owner always has full access to their own data
  if (viewer && viewer.id === ownerId) {
    return true;
  }

  // 2. Platform administrators have administrative visibility for moderation
  if (viewer?.roles?.includes('admin') || viewer?.roles?.includes('moderator')) {
    return true;
  }

  // Parse section visibility setting
  let settings: Record<string, any> = { ...DEFAULT_VISIBILITY };
  if (typeof visibilitySettingsJson === 'string') {
    try {
      settings = { ...settings, ...JSON.parse(visibilitySettingsJson) };
    } catch {}
  } else if (visibilitySettingsJson && typeof visibilitySettingsJson === 'object') {
    settings = { ...settings, ...visibilitySettingsJson };
  }

  const settingVal = settings[section];
  if (settingVal === false || settingVal === 'private') {
    return false;
  }
  if (settingVal === true) {
    return true;
  }

  const level: VisibilityLevel = (settingVal as VisibilityLevel) || DEFAULT_VISIBILITY[section] || 'platform';

  // 3. Evaluate visibility rule
  switch (level) {
    case 'public':
      return true;

    case 'platform':
      // Any authenticated user on the platform
      return Boolean(viewer && viewer.id);

    case 'recruiters':
      // Verified recruiters or company members
      if (!viewer || !viewer.id) return false;
      return (
        Boolean(viewer.companyId) ||
        viewer.roles?.includes('recruiter') ||
        viewer.roles?.includes('recruiter_member') ||
        viewer.roles?.includes('recruiter_admin') ||
        false
      );

    case 'private':
    default:
      return false;
  }
}

/**
 * Filters a raw user profile object so it only contains sections permitted for the viewer.
 */
export function projectForViewer(user: any, viewer: ViewerContext | null | undefined): any {
  if (!user) return null;
  const isOwner = viewer && viewer.id === user.id;

  if (isOwner) {
    return user;
  }

  const visible: any = {
    id: user.id,
    name: user.name || user.displayName || 'Community Member',
    displayName: user.displayName || user.name || 'Community Member',
    username: user.username,
    avatarUrl: user.avatarUrl,
    headline: user.headline,
    workMode: user.workMode,
    createdAt: user.createdAt,
  };

  // Section: bio
  if (canView(viewer, user.id, 'bio', user.visibilitySettings)) {
    visible.bio = user.bio;
    visible.pronouns = user.pronouns;
    visible.city = user.city;
    visible.region = user.region;
    visible.country = user.country;
  }

  // Section: skills
  if (canView(viewer, user.id, 'skills', user.visibilitySettings)) {
    visible.skills = user.skills;
  }

  // Section: experience
  if (canView(viewer, user.id, 'experience', user.visibilitySettings)) {
    visible.experience = user.experience;
  }

  // Section: education
  if (canView(viewer, user.id, 'education', user.visibilitySettings)) {
    visible.education = user.education;
  }

  // Section: certifications
  if (canView(viewer, user.id, 'certifications', user.visibilitySettings)) {
    visible.certifications = user.certifications;
  }

  // Section: availability
  if (canView(viewer, user.id, 'availability', user.visibilitySettings)) {
    visible.availabilities = user.availabilities;
    visible.learningGoals = user.learningGoals;
  }

  // Verified portfolio / proof projects are public by design
  if (user.portfolio) {
    visible.portfolio = user.portfolio;
  }

  return visible;
}
