/**
 * React Query — centralised query-key factories.
 *
 * Every domain has a "keys" object whose methods return a readonly tuple.
 * Using factories guarantees that invalidation is surgical and type-safe.
 */

// ── Auth / Profile ──────────────────────────────────────────────────────────
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

// ── Tasks ───────────────────────────────────────────────────────────────────
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...taskKeys.lists(), filters ?? {}] as const,
  bySprint: (sprintId: string) => [...taskKeys.all, 'sprint', sprintId] as const,
  byEpic: (epicId: string) => [...taskKeys.all, 'epic', epicId] as const,
  byStatus: (status: string) => [...taskKeys.all, 'status', status] as const,
  backlog: () => [...taskKeys.all, 'backlog'] as const,
  drafts: () => [...taskKeys.all, 'drafts'] as const,
  detail: (id: string) => [...taskKeys.all, 'detail', id] as const,
  history: (id: string) => [...taskKeys.all, 'history', id] as const,
  comments: (id: string) => [...taskKeys.all, 'comments', id] as const,
};

// ── Sprints ─────────────────────────────────────────────────────────────────
export const sprintKeys = {
  all: ['sprints'] as const,
  lists: () => [...sprintKeys.all, 'list'] as const,
  list: (year?: number) => [...sprintKeys.lists(), { year }] as const,
  current: () => [...sprintKeys.all, 'current'] as const,
  upcoming: (limit?: number) => [...sprintKeys.all, 'upcoming', limit] as const,
  detail: (id: string) => [...sprintKeys.all, 'detail', id] as const,
};

// ── Epics ───────────────────────────────────────────────────────────────────
export const epicKeys = {
  all: ['epics'] as const,
  lists: () => [...epicKeys.all, 'list'] as const,
  list: (status?: string) => [...epicKeys.lists(), { status }] as const,
  detail: (id: string) => [...epicKeys.all, 'detail', id] as const,
};

// ── Challenges ──────────────────────────────────────────────────────────────
export const challengeKeys = {
  all: ['challenges'] as const,
  lists: () => [...challengeKeys.all, 'list'] as const,
  list: (status?: string) => [...challengeKeys.lists(), { status }] as const,
  active: () => [...challengeKeys.all, 'active'] as const,
  detail: (id: string) => [...challengeKeys.all, 'detail', id] as const,
  entries: (id: string) => [...challengeKeys.all, 'entries', id] as const,
  templates: (areaId?: string) => [...challengeKeys.all, 'templates', { areaId }] as const,
};

// ── Notifications ───────────────────────────────────────────────────────────
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page?: number) => [...notificationKeys.all, 'list', { page }] as const,
  grouped: () => [...notificationKeys.all, 'grouped'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

// ── Sprint Ceremonies (backed by /api/v1/sensai/* endpoints) ────────────────
export const sprintCeremonyKeys = {
  all: ['sensai'] as const,
  velocity: () => [...sprintCeremonyKeys.all, 'velocity'] as const,
  sprintHealth: (sprintId: string) => [...sprintCeremonyKeys.all, 'sprintHealth', sprintId] as const,
  currentHealth: () => [...sprintCeremonyKeys.all, 'currentHealth'] as const,
  capacity: () => [...sprintCeremonyKeys.all, 'capacity'] as const,
  standup: () => [...sprintCeremonyKeys.all, 'standup'] as const,
  standupHistory: (start: string, end: string) => [...sprintCeremonyKeys.all, 'standupHistory', start, end] as const,
  interventions: () => [...sprintCeremonyKeys.all, 'interventions'] as const,
  ceremonies: () => [...sprintCeremonyKeys.all, 'ceremonies'] as const,
  lifeWheel: () => [...sprintCeremonyKeys.all, 'lifeWheel'] as const,
  dimensionHistory: (dim: string) => [...sprintCeremonyKeys.all, 'dimension', dim] as const,
  messages: (unreadOnly?: boolean) => [...sprintCeremonyKeys.all, 'messages', { unreadOnly }] as const,
  settings: () => [...sprintCeremonyKeys.all, 'settings'] as const,
  analytics: (period: string) => [...sprintCeremonyKeys.all, 'analytics', period] as const,
  patterns: () => [...sprintCeremonyKeys.all, 'patterns'] as const,
  motivation: () => [...sprintCeremonyKeys.all, 'motivation'] as const,
  microChallenges: () => [...sprintCeremonyKeys.all, 'microChallenges'] as const,
};

// ── Community ───────────────────────────────────────────────────────────────
export const communityKeys = {
  all: ['community'] as const,
  home: () => [...communityKeys.all, 'home'] as const,
  me: () => [...communityKeys.all, 'me'] as const,
  articles: (params?: Record<string, unknown>) => [...communityKeys.all, 'articles', params] as const,
  articleDetail: (id: string) => [...communityKeys.all, 'article', id] as const,
  questions: (params?: Record<string, unknown>) => [...communityKeys.all, 'questions', params] as const,
  questionDetail: (id: string) => [...communityKeys.all, 'question', id] as const,
  stories: (params?: Record<string, unknown>) => [...communityKeys.all, 'stories', params] as const,
  storyDetail: (id: string) => [...communityKeys.all, 'story', id] as const,
  templates: (params?: Record<string, unknown>) => [...communityKeys.all, 'templates', params] as const,
  leaderboard: (period: string, cat: string) => [...communityKeys.all, 'leaderboard', period, cat] as const,
  partners: () => [...communityKeys.all, 'partners'] as const,
  groups: (params?: Record<string, unknown>) => [...communityKeys.all, 'groups', params] as const,
  activity: (page?: number) => [...communityKeys.all, 'activity', { page }] as const,
  knowledge: (params?: Record<string, unknown>) => [...communityKeys.all, 'knowledge', params] as const,
  knowledgeItem: (slug: string) => [...communityKeys.all, 'knowledgeItem', slug] as const,
};

// ── Essentia (Books) ────────────────────────────────────────────────────────
export const essentiaKeys = {
  all: ['essentia'] as const,
  books: () => [...essentiaKeys.all, 'books'] as const,
  bookDetail: (id: string) => [...essentiaKeys.all, 'book', id] as const,
  booksByCategory: (cat: string) => [...essentiaKeys.all, 'category', cat] as const,
  topRated: () => [...essentiaKeys.all, 'topRated'] as const,
  popular: () => [...essentiaKeys.all, 'popular'] as const,
  categories: () => [...essentiaKeys.all, 'categories'] as const,
  progress: () => [...essentiaKeys.all, 'progress'] as const,
  progressForBook: (bookId: string) => [...essentiaKeys.all, 'progress', bookId] as const,
  completed: () => [...essentiaKeys.all, 'completed'] as const,
  favorites: () => [...essentiaKeys.all, 'favorites'] as const,
  inProgress: () => [...essentiaKeys.all, 'inProgress'] as const,
};

// ── Mindset ─────────────────────────────────────────────────────────────────
export const mindsetKeys = {
  all: ['mindset'] as const,
  feed: () => [...mindsetKeys.all, 'feed'] as const,
  content: () => [...mindsetKeys.all, 'content'] as const,
  contentDetail: (id: string) => [...mindsetKeys.all, 'content', id] as const,
  byDimension: (tag: string) => [...mindsetKeys.all, 'dimension', tag] as const,
  favorites: () => [...mindsetKeys.all, 'favorites'] as const,
  themes: () => [...mindsetKeys.all, 'themes'] as const,
  themeDetail: (id: string) => [...mindsetKeys.all, 'theme', id] as const,
};

// ── Family ──────────────────────────────────────────────────────────────────
export const familyKeys = {
  all: ['family'] as const,
  myFamily: () => [...familyKeys.all, 'me'] as const,
  membership: () => [...familyKeys.all, 'membership'] as const,
  detail: (id: string) => [...familyKeys.all, 'detail', id] as const,
  members: (familyId: string) => [...familyKeys.all, 'members', familyId] as const,
  invites: (familyId: string) => [...familyKeys.all, 'invites', familyId] as const,
};

// ── Templates ───────────────────────────────────────────────────────────────
export const templateKeys = {
  all: ['templates'] as const,
  lists: () => [...templateKeys.all, 'list'] as const,
  global: () => [...templateKeys.all, 'global'] as const,
  user: () => [...templateKeys.all, 'user'] as const,
  favorites: () => [...templateKeys.all, 'favorites'] as const,
  detail: (id: string) => [...templateKeys.all, 'detail', id] as const,
  search: (q: string) => [...templateKeys.all, 'search', q] as const,
};

// ── Life Wheel ──────────────────────────────────────────────────────────────
export const lifeWheelKeys = {
  all: ['lifeWheel'] as const,
  areas: () => [...lifeWheelKeys.all, 'areas'] as const,
  quadrants: () => [...lifeWheelKeys.all, 'quadrants'] as const,
};

// ── Command Center ──────────────────────────────────────────────────────────
export const commandCenterKeys = {
  all: ['commandCenter'] as const,
  pendingDrafts: () => [...commandCenterKeys.all, 'pendingDrafts'] as const,
  pendingTasks: () => [...commandCenterKeys.all, 'pendingTasks'] as const,
  testAttachments: (type?: string) => [...commandCenterKeys.all, 'testAttachments', { type }] as const,
};
