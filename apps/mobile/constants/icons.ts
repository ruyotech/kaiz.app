/**
 * Centralized Icon Registry
 *
 * ALL icon references in the app go through this registry.
 * Currently maps to MaterialCommunityIcons names.
 * To swap in custom SVG/image assets later, update this file — no screen changes needed.
 */

export type IconSource = 'material-community';

export interface IconDef {
  /** MaterialCommunityIcons name (current implementation) */
  name: string;
  /** Source library — reserved for future custom icon support */
  source: IconSource;
}

function mci(name: string): IconDef {
  return { name, source: 'material-community' };
}

// ============================================================================
// Navigation Icons
// ============================================================================

export const navIcons = {
  apps: mci('view-grid'),
  more: mci('dots-horizontal'),
  create: mci('plus-circle'),
  back: mci('arrow-left'),
  close: mci('close'),
  chevronRight: mci('chevron-right'),
  chevronLeft: mci('chevron-left'),
  chevronDown: mci('chevron-down'),
  search: mci('magnify'),
  filter: mci('filter-variant'),
  sort: mci('sort'),
  menu: mci('menu'),
} as const;

// ============================================================================
// Module Icons (tab bar, app switcher)
// ============================================================================

export const moduleIcons = {
  sprints: mci('view-dashboard-outline'),
  sensai: mci('robot'),
  challenges: mci('target'),
  essentia: mci('brain'),
  mindset: mci('creation'),
  pomodoro: mci('circle-slice-8'),
  community: mci('account-group'),
  family: mci('account-heart'),
  notifications: mci('bell'),
  settings: mci('cog'),
  commandCenter: mci('plus-circle'),
  backlog: mci('inbox'),
  epics: mci('bookmark-multiple'),
  taskSearch: mci('format-list-checkbox'),
  templates: mci('file-document-multiple'),
} as const;

// ============================================================================
// Action Icons
// ============================================================================

export const actionIcons = {
  add: mci('plus'),
  addCircle: mci('plus-circle'),
  edit: mci('pencil'),
  delete: mci('delete'),
  trash: mci('trash-can-outline'),
  save: mci('content-save'),
  send: mci('send'),
  share: mci('share-variant'),
  copy: mci('content-copy'),
  check: mci('check'),
  checkCircle: mci('check-circle'),
  checkboxMarked: mci('checkbox-marked-circle-outline'),
  cancel: mci('close-circle'),
  refresh: mci('refresh'),
  upload: mci('upload'),
  download: mci('download'),
  camera: mci('camera'),
  image: mci('image'),
  file: mci('file-document'),
  microphone: mci('microphone'),
  attachment: mci('paperclip'),
  link: mci('link'),
  pin: mci('pin'),
  bookmark: mci('bookmark'),
  heart: mci('heart'),
  heartOutline: mci('heart-outline'),
  star: mci('star'),
  starOutline: mci('star-outline'),
  flag: mci('flag'),
  archive: mci('archive'),
  logout: mci('logout'),
} as const;

// ============================================================================
// Status / Feedback Icons
// ============================================================================

export const statusIcons = {
  success: mci('check-circle'),
  error: mci('alert-circle'),
  warning: mci('alert'),
  info: mci('information'),
  loading: mci('loading'),
  empty: mci('inbox'),
  notFound: mci('file-search'),
  noConnection: mci('wifi-off'),
  lock: mci('lock'),
  unlock: mci('lock-open'),
  eye: mci('eye'),
  eyeOff: mci('eye-off'),
} as const;

// ============================================================================
// Domain-Specific Icons
// ============================================================================

export const sprintIcons = {
  calendar: mci('calendar'),
  calendarPlus: mci('calendar-plus'),
  calendarAccount: mci('calendar-account'),
  calendarRepeat: mci('calendar-repeat'),
  task: mci('checkbox-marked-circle-outline'),
  epic: mci('bookmark-multiple'),
  velocity: mci('speedometer'),
  report: mci('chart-line'),
  retro: mci('comment-multiple-outline'),
  wiki: mci('school'),
  standup: mci('coffee'),
  planning: mci('calendar-plus'),
  review: mci('presentation'),
  intervention: mci('alert-decagram'),
  lifeWheel: mci('chart-donut'),
  intake: mci('plus-box'),
  analytics: mci('chart-box-outline'),
} as const;

export const challengeIcons = {
  trophy: mci('trophy'),
  trophyGold: mci('podium-gold'),
  podium: mci('podium'),
  streak: mci('fire'),
  completed: mci('trophy'),
  leaderboard: mci('podium'),
  community: mci('account-group'),
} as const;

export const essentiaIcons = {
  book: mci('book-open-page-variant'),
  explore: mci('compass-outline'),
  library: mci('bookshelf'),
  growth: mci('chart-line'),
  highlights: mci('marker'),
  flashcards: mci('cards-outline'),
  goals: mci('flag-checkered'),
  collections: mci('folder-multiple'),
} as const;

export const socialIcons = {
  profile: mci('account-circle'),
  group: mci('account-group'),
  knowledge: mci('school'),
  qa: mci('help-circle'),
  wins: mci('party-popper'),
  support: mci('account-heart'),
} as const;

export const settingsIcons = {
  theme: mci('palette'),
  language: mci('translate'),
  privacy: mci('shield-lock'),
  storage: mci('database'),
  about: mci('information'),
  notification: mci('bell'),
  notificationBadge: mci('bell-badge'),
  subscription: mci('credit-card'),
  integrations: mci('puzzle'),
  cogOutline: mci('cog-outline'),
} as const;

export const familyIcons = {
  members: mci('account-group'),
  sharedTasks: mci('clipboard-list'),
  sharedCalendar: mci('calendar-account'),
  standup: mci('account-voice'),
} as const;

// Combined export for quick access
export const icons = {
  nav: navIcons,
  module: moduleIcons,
  action: actionIcons,
  status: statusIcons,
  sprint: sprintIcons,
  challenge: challengeIcons,
  essentia: essentiaIcons,
  social: socialIcons,
  settings: settingsIcons,
  family: familyIcons,
} as const;
