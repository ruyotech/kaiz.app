// ==========================================
// User & Authentication Types
// ==========================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  accountType: 'individual' | 'family_adult' | 'family_child' | 'corporate';
  subscriptionTier: 'free' | 'pro' | 'family' | 'corporate' | 'enterprise';
  timezone: string;
  avatarUrl: string | null;
  emailVerified?: boolean;
  role?: 'user' | 'admin' | 'super_admin';
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ==========================================
// Life Wheel Types
// ==========================================

export type LifeWheelDimensionTag = 
  | 'lw-1' | 'lw-2' | 'lw-3' | 'lw-4' | 'lw-5' 
  | 'lw-6' | 'lw-7' | 'lw-8' | 'generic' | 'q2_growth';

export interface LifeWheelArea {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const LIFE_WHEEL_AREAS: Record<string, { name: string; color: string; icon: string }> = {
  'lw-1': { name: 'Health & Fitness', color: '#22c55e', icon: '💪' },
  'lw-2': { name: 'Career & Work', color: '#3b82f6', icon: '💼' },
  'lw-3': { name: 'Spiritual & Mindfulness', color: '#eab308', icon: '🧘' },
  'lw-4': { name: 'Personal Growth', color: '#a855f7', icon: '🌱' },
  'lw-5': { name: 'Relationships', color: '#ec4899', icon: '❤️' },
  'lw-6': { name: 'Social Life', color: '#f97316', icon: '🎉' },
  'lw-7': { name: 'Fun & Recreation', color: '#14b8a6', icon: '🎮' },
  'lw-8': { name: 'Environment', color: '#84cc16', icon: '🏡' },
};

// ==========================================
// SDLC / Task Management Types
// ==========================================

export interface Sprint {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed';
  totalPoints: number;
  completedPoints: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  lifeWheelAreaId: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  totalPoints: number;
  completedPoints: number;
  color: string;
  startDate: string;
  endDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  epicId: string | null;
  lifeWheelAreaId: string;
  eisenhowerQuadrantId: string;
  sprintId: string | null;
  storyPoints: number;
  status: 'draft' | 'todo' | 'in_progress' | 'done' | 'blocked';
  createdAt: string;
  completedAt: string | null;
}

// ==========================================
// Challenge Types
// ==========================================

export type ChallengeStatus = 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';

export interface Challenge {
  id: string;
  name: string;
  description?: string;
  lifeWheelAreaId: string;
  duration: number;
  status: ChallengeStatus;
  startDate: string;
  endDate: string;
  challengeType: 'solo' | 'group';
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  participantCount?: number;
}

// ==========================================
// Community Types (Marketing Hook!)
// ==========================================

export type CommunityBadgeType = 
  | 'sprint_starter' | 'sprint_mentor' | 'velocity_master' | 'community_champion'
  | 'knowledge_keeper' | 'template_creator' | 'streak_legend' | 'first_post'
  | 'helpful_hero' | 'accountability_ace' | 'early_adopter' | 'bug_hunter';

export type CommunityRole = 'member' | 'contributor' | 'mentor' | 'moderator' | 'admin';

export interface CommunityMember {
  id: string;
  userId: string;
  displayName: string;
  avatar: string;
  bio?: string;
  level: number;
  levelTitle: string;
  reputationPoints: number;
  badges: CommunityBadgeType[];
  role: CommunityRole;
  joinedAt: string;
  isOnline: boolean;
  sprintsCompleted: number;
  currentStreak: number;
}

export interface SuccessStory {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  story: string;
  category: 'sprint_complete' | 'challenge_done' | 'habit_streak' | 'milestone' | 'transformation';
  imageUrls?: string[];
  lifeWheelAreaId?: string;
  metrics?: { label: string; value: string }[];
  likeCount: number;
  commentCount: number;
  celebrateCount: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  memberId: string;
  displayName: string;
  avatar: string;
  level: number;
  value: number;
  change: number;
  badges: CommunityBadgeType[];
}

export interface CommunityActivity {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'sprint_completed' | 'challenge_joined' | 'challenge_completed' | 'badge_earned' | 'streak_milestone' | 'level_up';
  title: string;
  description?: string;
  timestamp: string;
  celebrateCount: number;
}

export interface CommunityStats {
  totalMembers: number;
  activeToday: number;
  sprintsCompletedThisWeek: number;
  challengesActive: number;
  storiesSharedToday: number;
  totalStreakDays: number;
}

// ==========================================
// API Types
// ==========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PageMeta;
}

export interface PageMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}
