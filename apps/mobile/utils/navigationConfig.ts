import { AppContext } from '../store/navigationStore';
import {
    type IconDef,
    moduleIcons,
    sprintIcons,
    challengeIcons,
    essentiaIcons,
    socialIcons,
    familyIcons,
    settingsIcons,
    actionIcons,
} from '../constants/icons';

// ============================================================================
// Types
// ============================================================================

export interface NavIcon {
    nameKey: string;
    icon: IconDef;
    route: string;
}

export interface SubApp {
    id: string;
    nameKey: string;
    icon: IconDef;
    color: string;
    route: string;
}

export interface App {
    id: AppContext;
    nameKey: string;
    icon: IconDef;
    color: string;
    route: string;
}

// ============================================================================
// NAV_CONFIGS — Main icon per app context (used by CustomTabBar slot #2)
// ============================================================================

export const NAV_CONFIGS: Record<AppContext, NavIcon> = {
    sprints:       { nameKey: 'navigation.tabs.sprint',    icon: moduleIcons.sprints,    route: '/(tabs)/sprints/calendar' },
    mindset:       { nameKey: 'navigation.tabs.mindset',   icon: moduleIcons.mindset,    route: '/(tabs)/motivation' },
    essentia:      { nameKey: 'navigation.tabs.today',     icon: moduleIcons.essentia,   route: '/(tabs)/essentia' },
    challenges:    { nameKey: 'navigation.tabs.active',    icon: moduleIcons.challenges, route: '/(tabs)/challenges' },
    pomodoro:      { nameKey: 'navigation.tabs.focus',     icon: moduleIcons.pomodoro,   route: '/(tabs)/pomodoro' },
    bills:         { nameKey: 'navigation.tabs.bills',     icon: moduleIcons.settings,   route: '/(tabs)/bills' },
    community:     { nameKey: 'navigation.tabs.hub',       icon: moduleIcons.community,  route: '/(tabs)/community' },
    family:        { nameKey: 'navigation.tabs.family',    icon: moduleIcons.family,     route: '/(tabs)/family' },
    settings:      { nameKey: 'navigation.tabs.settings',  icon: moduleIcons.settings,   route: '/(tabs)/settings' },
    notifications: { nameKey: 'navigation.tabs.inbox',     icon: moduleIcons.notifications, route: '/(tabs)/notifications' },
    dashboard:     { nameKey: 'navigation.tabs.dashboard', icon: moduleIcons.dashboard,  route: '/(tabs)/dashboard' },
    templates:     { nameKey: 'navigation.sprints.templates',  icon: moduleIcons.templates,  route: '/(tabs)/sprints/templates' },
    backlog:       { nameKey: 'navigation.sprints.backlog',    icon: moduleIcons.backlog,    route: '/(tabs)/sprints/backlog' },
    epics:         { nameKey: 'navigation.sprints.epics',      icon: moduleIcons.epics,      route: '/(tabs)/sprints/epics' },
    taskSearch:    { nameKey: 'navigation.sprints.taskSearch', icon: moduleIcons.taskSearch,  route: '/(tabs)/sprints/search-tasks' },
};

// ============================================================================
// APPS — Main apps shown in AppSwitcher (no settings/notifications — they
//        have dedicated access via Dashboard tab and settings gear)
// ============================================================================

export const APPS: App[] = [
    { id: 'sprints',    nameKey: 'navigation.tabs.sprints',    icon: moduleIcons.sprints,    color: '#3B82F6', route: '/(tabs)/sprints' },
    { id: 'backlog',    nameKey: 'navigation.sprints.backlog',  icon: moduleIcons.backlog,    color: '#6366F1', route: '/(tabs)/sprints/backlog' },
    { id: 'epics',      nameKey: 'navigation.sprints.epics',    icon: moduleIcons.epics,      color: '#8B5CF6', route: '/(tabs)/sprints/epics' },
    { id: 'taskSearch', nameKey: 'navigation.tabs.tasks',       icon: moduleIcons.taskSearch,  color: '#0EA5E9', route: '/(tabs)/sprints/search-tasks' },
    { id: 'templates',  nameKey: 'navigation.sprints.templates', icon: moduleIcons.templates,  color: '#14B8A6', route: '/(tabs)/sprints/templates' },
    { id: 'challenges', nameKey: 'navigation.tabs.challenges',  icon: moduleIcons.challenges, color: '#F59E0B', route: '/(tabs)/challenges' },
    { id: 'pomodoro',   nameKey: 'navigation.tabs.focus',       icon: moduleIcons.pomodoro,   color: '#EF4444', route: '/(tabs)/pomodoro' },
    { id: 'essentia',   nameKey: 'navigation.tabs.essentia',    icon: moduleIcons.essentia,   color: '#8B5CF6', route: '/(tabs)/essentia' },
    { id: 'mindset',    nameKey: 'navigation.tabs.mindset',     icon: moduleIcons.mindset,    color: '#EC4899', route: '/(tabs)/motivation' },
    { id: 'community',  nameKey: 'navigation.tabs.community',   icon: moduleIcons.community,  color: '#06B6D4', route: '/(tabs)/community' },
    { id: 'family',     nameKey: 'navigation.tabs.family',      icon: moduleIcons.family,     color: '#EC4899', route: '/(tabs)/family' },
];

// ============================================================================
// SUB_APPS — Sub-app grids shown beneath parent apps in AppSwitcher
// Only routes whose screen files actually exist are included.
// Max 12 items per parent (4 columns × 3 rows).
// ============================================================================

export const SUB_APPS: Partial<Record<AppContext, SubApp[]>> = {
    // Sprints sub-apps are handled separately in AppSwitcher (SPRINT_SUB_APPS)



    challenges: [
        { id: 'challenges-create',      nameKey: 'navigation.moreMenu.createChallenge', icon: actionIcons.addCircle,       color: '#F59E0B', route: '/(tabs)/challenges/create' },
        { id: 'challenges-templates',   nameKey: 'navigation.sprints.templates',          icon: moduleIcons.templates,       color: '#F59E0B', route: '/(tabs)/challenges/templates' },
        { id: 'challenges-completed',   nameKey: 'navigation.moreMenu.completed',         icon: challengeIcons.completed,    color: '#F59E0B', route: '/(tabs)/challenges/completed' },
        { id: 'challenges-community',   nameKey: 'navigation.tabs.community',             icon: challengeIcons.community,    color: '#F59E0B', route: '/(tabs)/challenges/community' },
        { id: 'challenges-leaderboard', nameKey: 'navigation.moreMenu.leaderboard',       icon: challengeIcons.leaderboard,  color: '#F59E0B', route: '/(tabs)/challenges/leaderboard' },
    ],

    essentia: [
        { id: 'essentia-explore',     nameKey: 'navigation.moreMenu.exploreBooks', icon: essentiaIcons.explore,     color: '#8B5CF6', route: '/(tabs)/essentia/explore' },
        { id: 'essentia-library',     nameKey: 'navigation.moreMenu.myLibrary',    icon: essentiaIcons.library,     color: '#8B5CF6', route: '/(tabs)/essentia/library' },
        { id: 'essentia-growth',      nameKey: 'navigation.moreMenu.growthStats',  icon: essentiaIcons.growth,      color: '#8B5CF6', route: '/(tabs)/essentia/growth' },
        { id: 'essentia-highlights',  nameKey: 'navigation.moreMenu.highlights',   icon: essentiaIcons.highlights,  color: '#8B5CF6', route: '/(tabs)/essentia/highlights' },
        { id: 'essentia-flashcards',  nameKey: 'navigation.moreMenu.flashcards',   icon: essentiaIcons.flashcards,  color: '#8B5CF6', route: '/(tabs)/essentia/flashcards' },
        { id: 'essentia-goals',       nameKey: 'navigation.moreMenu.readingGoals', icon: essentiaIcons.goals,       color: '#8B5CF6', route: '/(tabs)/essentia/goals' },
        { id: 'essentia-collections', nameKey: 'navigation.moreMenu.collections',  icon: essentiaIcons.collections, color: '#8B5CF6', route: '/(tabs)/essentia/collections' },
    ],

    community: [
        { id: 'community-knowledge',   nameKey: 'navigation.sprints.knowledgeHub',     icon: socialIcons.knowledge, color: '#06B6D4', route: '/(tabs)/community/knowledge' },
        { id: 'community-questions',    nameKey: 'navigation.moreMenu.qaForum',         icon: socialIcons.qa,        color: '#06B6D4', route: '/(tabs)/community/questions' },
        { id: 'community-wins',         nameKey: 'navigation.moreMenu.successStories',  icon: socialIcons.wins,      color: '#06B6D4', route: '/(tabs)/community/wins' },
        { id: 'community-templates',    nameKey: 'navigation.sprints.templates',          icon: moduleIcons.templates, color: '#06B6D4', route: '/(tabs)/community/templates' },
        { id: 'community-leaderboard',  nameKey: 'navigation.moreMenu.leaderboard',     icon: challengeIcons.trophyGold, color: '#06B6D4', route: '/(tabs)/community/leaderboard' },
        { id: 'community-support',      nameKey: 'navigation.moreMenu.supportCircle',   icon: socialIcons.support,   color: '#06B6D4', route: '/(tabs)/community/support' },
        { id: 'community-profile',      nameKey: 'navigation.moreMenu.myProfile',       icon: socialIcons.profile,   color: '#06B6D4', route: '/(tabs)/community/profile' },
    ],

    family: [
        { id: 'family-members',        nameKey: 'navigation.moreMenu.members',        icon: familyIcons.members,        color: '#EC4899', route: '/(tabs)/family/members' },
        { id: 'family-shared-tasks',   nameKey: 'navigation.moreMenu.sharedTasks',    icon: familyIcons.sharedTasks,    color: '#EC4899', route: '/(tabs)/family/shared-tasks' },
        { id: 'family-shared-calendar', nameKey: 'navigation.moreMenu.sharedCalendar', icon: familyIcons.sharedCalendar, color: '#EC4899', route: '/(tabs)/family/shared-calendar' },
        { id: 'family-standup',        nameKey: 'navigation.moreMenu.familyStandup',  icon: familyIcons.standup,        color: '#EC4899', route: '/(tabs)/family/family-standup' },
    ],

    pomodoro: [
        { id: 'pomodoro-settings',  nameKey: 'settings.title',                      icon: settingsIcons.cogOutline,  color: '#EF4444', route: '/(tabs)/pomodoro/settings' },
        { id: 'pomodoro-history',   nameKey: 'navigation.moreMenu.history',          icon: actionIcons.refresh,       color: '#EF4444', route: '/(tabs)/pomodoro/history' },
        { id: 'pomodoro-analytics', nameKey: 'navigation.moreMenu.focusAnalytics',   icon: sprintIcons.report,        color: '#EF4444', route: '/(tabs)/pomodoro/analytics' },
    ],

    mindset: [
        { id: 'mindset-favorites', nameKey: 'navigation.moreMenu.favorites', icon: actionIcons.heart,   color: '#EC4899', route: '/(tabs)/motivation/favorites' },
        { id: 'mindset-themes',    nameKey: 'navigation.moreMenu.themes',    icon: settingsIcons.theme, color: '#EC4899', route: '/(tabs)/motivation/themes' },
    ],

    sprints: [
        { id: 'sprints-standup',       nameKey: 'navigation.moreMenu.dailyStandup',   icon: sprintIcons.standup,      color: '#3B82F6', route: '/(tabs)/sprints/standup' },
        { id: 'sprints-planning',      nameKey: 'navigation.moreMenu.sprintPlanning', icon: sprintIcons.planning,     color: '#3B82F6', route: '/(tabs)/sprints/planning' },
        { id: 'sprints-review',        nameKey: 'navigation.moreMenu.sprintReview',   icon: sprintIcons.review,       color: '#3B82F6', route: '/(tabs)/sprints/review' },
        { id: 'sprints-retro',         nameKey: 'navigation.sprints.retro',            icon: sprintIcons.retro,        color: '#3B82F6', route: '/(tabs)/sprints/retrospective' },
        { id: 'sprints-velocity',      nameKey: 'navigation.sprints.velocity',         icon: sprintIcons.velocity,     color: '#3B82F6', route: '/(tabs)/sprints/velocity' },
        { id: 'sprints-intake',        nameKey: 'navigation.moreMenu.quickIntake',     icon: sprintIcons.intake,       color: '#3B82F6', route: '/(tabs)/sprints/intake' },
        { id: 'sprints-insights',      nameKey: 'navigation.moreMenu.analytics',       icon: sprintIcons.analytics,    color: '#3B82F6', route: '/(tabs)/sprints/insights' },
        { id: 'sprints-preferences',   nameKey: 'settings.title',                      icon: settingsIcons.cogOutline, color: '#3B82F6', route: '/(tabs)/sprints/preferences' },
    ],
};
