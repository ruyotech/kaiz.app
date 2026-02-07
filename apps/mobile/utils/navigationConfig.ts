import { AppContext } from '../store/navigationStore';

export interface NavIcon {
    nameKey: string;  // Translation key for the name
    icon: string;
    route: string;
}

export interface MoreMenuItem {
    nameKey: string;  // Translation key for the name
    icon: string;
    route: string;
}

export const NAV_CONFIGS: Record<AppContext, NavIcon[]> = {
    sprints: [
        { nameKey: 'navigation.tabs.sprint', icon: 'view-dashboard-outline', route: '/(tabs)/sprints/calendar' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    sensai: [
        { nameKey: 'navigation.tabs.coach', icon: 'robot', route: '/(tabs)/sensai' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    mindset: [
        { nameKey: 'navigation.tabs.mindset', icon: 'creation', route: '/(tabs)/motivation' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    essentia: [
        { nameKey: 'navigation.tabs.today', icon: 'book-open-page-variant', route: '/(tabs)/essentia' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    challenges: [
        { nameKey: 'navigation.tabs.active', icon: 'target', route: '/(tabs)/challenges' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    pomodoro: [
        { nameKey: 'navigation.tabs.focus', icon: 'circle-slice-8', route: '/(tabs)/pomodoro' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    bills: [
        { nameKey: 'navigation.tabs.bills', icon: 'currency-usd', route: '/(tabs)/bills' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    community: [
        { nameKey: 'navigation.tabs.hub', icon: 'account-group', route: '/(tabs)/community' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    family: [
        { nameKey: 'navigation.tabs.family', icon: 'account-heart', route: '/(tabs)/family' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    settings: [
        { nameKey: 'navigation.tabs.settings', icon: 'cog', route: '/(tabs)/settings' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    notifications: [
        { nameKey: 'navigation.tabs.inbox', icon: 'bell', route: '/(tabs)/notifications' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    templates: [
        { nameKey: 'navigation.sprints.templates', icon: 'file-document-multiple', route: '/(tabs)/sprints/templates' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    backlog: [
        { nameKey: 'navigation.sprints.backlog', icon: 'inbox', route: '/(tabs)/sprints/backlog' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    epics: [
        { nameKey: 'navigation.sprints.epics', icon: 'bookmark-multiple', route: '/(tabs)/sprints/epics' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
    taskSearch: [
        { nameKey: 'navigation.sprints.taskSearch', icon: 'magnify', route: '/(tabs)/sprints/search-tasks' },
        { nameKey: 'navigation.tabs.more', icon: 'dots-horizontal', route: 'more' },
    ],
};

export const MORE_MENUS: Record<AppContext, MoreMenuItem[]> = {
    sprints: [
        { nameKey: 'navigation.sprints.reports', icon: 'chart-line', route: '/(tabs)/sprints/reports' },
        { nameKey: 'navigation.sprints.velocity', icon: 'speedometer', route: '/(tabs)/sprints/velocity' },
        { nameKey: 'navigation.sprints.knowledgeHub', icon: 'school', route: '/(tabs)/sprints/wiki' },
    ],
    sensai: [
        { nameKey: 'navigation.moreMenu.dailyStandup', icon: 'coffee', route: '/(tabs)/sensai/standup' },
        { nameKey: 'navigation.moreMenu.sprintPlanning', icon: 'calendar-plus', route: '/(tabs)/sensai/planning' },
        { nameKey: 'navigation.moreMenu.sprintReview', icon: 'presentation', route: '/(tabs)/sensai/review' },
        { nameKey: 'navigation.sprints.retro', icon: 'comment-multiple-outline', route: '/(tabs)/sensai/retrospective' },
        { nameKey: 'navigation.moreMenu.interventions', icon: 'alert-decagram', route: '/(tabs)/sensai/interventions' },
        { nameKey: 'navigation.moreMenu.lifeWheel', icon: 'chart-donut', route: '/(tabs)/sensai/lifewheel' },
        { nameKey: 'navigation.sprints.velocity', icon: 'speedometer', route: '/(tabs)/sensai/velocity' },
        { nameKey: 'navigation.moreMenu.quickIntake', icon: 'plus-box', route: '/(tabs)/sensai/intake' },
        { nameKey: 'navigation.moreMenu.analytics', icon: 'chart-box-outline', route: '/(tabs)/sensai/analytics' },
        { nameKey: 'settings.title', icon: 'cog-outline', route: '/(tabs)/sensai/settings' },
    ],
    mindset: [
        { nameKey: 'navigation.moreMenu.favorites', icon: 'heart', route: '/(tabs)/motivation/favorites' },
        { nameKey: 'navigation.moreMenu.themes', icon: 'palette', route: '/(tabs)/motivation/themes' },
        { nameKey: 'navigation.moreMenu.analytics', icon: 'chart-box', route: '/(tabs)/motivation/analytics' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    essentia: [
        { nameKey: 'navigation.moreMenu.exploreBooks', icon: 'compass-outline', route: '/(tabs)/essentia/explore' },
        { nameKey: 'navigation.moreMenu.myLibrary', icon: 'bookshelf', route: '/(tabs)/essentia/library' },
        { nameKey: 'navigation.moreMenu.growthStats', icon: 'chart-line', route: '/(tabs)/essentia/growth' },
        { nameKey: 'navigation.moreMenu.highlights', icon: 'marker', route: '/(tabs)/essentia/highlights' },
        { nameKey: 'navigation.moreMenu.flashcards', icon: 'cards-outline', route: '/(tabs)/essentia/flashcards' },
        { nameKey: 'navigation.moreMenu.readingGoals', icon: 'flag-checkered', route: '/(tabs)/essentia/goals' },
        { nameKey: 'navigation.moreMenu.collections', icon: 'folder-multiple', route: '/(tabs)/essentia/collections' },
        { nameKey: 'settings.title', icon: 'cog-outline', route: '/(tabs)/settings' },
    ],
    challenges: [
        { nameKey: 'navigation.moreMenu.createChallenge', icon: 'plus-circle', route: '/(tabs)/challenges/create' },
        { nameKey: 'navigation.sprints.templates', icon: 'book-open-variant', route: '/(tabs)/challenges/templates' },
        { nameKey: 'navigation.moreMenu.completed', icon: 'trophy', route: '/(tabs)/challenges/completed' },
        { nameKey: 'navigation.tabs.community', icon: 'account-group', route: '/(tabs)/challenges/community' },
        { nameKey: 'navigation.moreMenu.leaderboard', icon: 'podium', route: '/(tabs)/challenges/leaderboard' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    pomodoro: [
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/pomodoro/settings' },
        { nameKey: 'navigation.moreMenu.history', icon: 'history', route: '/(tabs)/pomodoro/history' },
        { nameKey: 'navigation.moreMenu.focusAnalytics', icon: 'chart-line', route: '/(tabs)/pomodoro/analytics' },
    ],
    bills: [
        { nameKey: 'navigation.moreMenu.categories', icon: 'tag-multiple', route: '/(tabs)/bills/categories' },
        { nameKey: 'navigation.moreMenu.recurring', icon: 'calendar-repeat', route: '/(tabs)/bills/recurring' },
        { nameKey: 'navigation.sprints.reports', icon: 'chart-pie', route: '/(tabs)/bills/reports' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    community: [
        { nameKey: 'navigation.sprints.knowledgeHub', icon: 'school', route: '/(tabs)/community/knowledge' },
        { nameKey: 'navigation.moreMenu.qaForum', icon: 'help-circle', route: '/(tabs)/community/questions' },
        { nameKey: 'navigation.moreMenu.successStories', icon: 'party-popper', route: '/(tabs)/community/wins' },
        { nameKey: 'navigation.sprints.templates', icon: 'file-document-multiple', route: '/(tabs)/community/templates' },
        { nameKey: 'navigation.moreMenu.leaderboard', icon: 'podium-gold', route: '/(tabs)/community/leaderboard' },
        { nameKey: 'navigation.moreMenu.supportCircle', icon: 'account-heart', route: '/(tabs)/community/support' },
        { nameKey: 'navigation.moreMenu.myProfile', icon: 'account-circle', route: '/(tabs)/community/profile' },
    ],
    family: [
        { nameKey: 'navigation.moreMenu.members', icon: 'account-group', route: '/(tabs)/family/members' },
        { nameKey: 'navigation.moreMenu.sharedTasks', icon: 'clipboard-list', route: '/(tabs)/family/shared-tasks' },
        { nameKey: 'navigation.moreMenu.sharedCalendar', icon: 'calendar-account', route: '/(tabs)/family/shared-calendar' },
        { nameKey: 'navigation.moreMenu.familyStandup', icon: 'account-voice', route: '/(tabs)/family/family-standup' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    settings: [
        { nameKey: 'navigation.moreMenu.themeDisplay', icon: 'palette', route: '/(tabs)/settings/appearance' },
        { nameKey: 'navigation.moreMenu.language', icon: 'translate', route: '/(tabs)/settings/language' },
        { nameKey: 'navigation.moreMenu.privacy', icon: 'shield-lock', route: '/(tabs)/settings/privacy' },
        { nameKey: 'navigation.moreMenu.dataStorage', icon: 'database', route: '/(tabs)/settings/storage' },
        { nameKey: 'navigation.moreMenu.about', icon: 'information', route: '/(tabs)/settings/about' },
        { nameKey: 'navigation.moreMenu.signOut', icon: 'logout', route: 'logout' },
    ],
    notifications: [
        { nameKey: 'navigation.moreMenu.unread', icon: 'bell-badge', route: '/(tabs)/notifications/unread' },
        { nameKey: 'navigation.moreMenu.mentions', icon: 'at', route: '/(tabs)/notifications/mentions' },
        { nameKey: 'navigation.moreMenu.taskUpdates', icon: 'checkbox-marked', route: '/(tabs)/notifications/tasks' },
        { nameKey: 'navigation.moreMenu.challengeAlerts', icon: 'trophy', route: '/(tabs)/notifications/challenges' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/notifications/settings' },
        { nameKey: 'navigation.moreMenu.clearAll', icon: 'notification-clear-all', route: 'clear-notifications' },
    ],
    templates: [
        { nameKey: 'navigation.moreMenu.createTemplate', icon: 'plus-circle', route: '/(tabs)/sprints/create-template' },
        { nameKey: 'navigation.tabs.sprints', icon: 'view-dashboard-outline', route: '/(tabs)/sprints' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    backlog: [
        { nameKey: 'navigation.tabs.sprints', icon: 'view-dashboard-outline', route: '/(tabs)/sprints' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    epics: [
        { nameKey: 'navigation.tabs.sprints', icon: 'view-dashboard-outline', route: '/(tabs)/sprints' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
    taskSearch: [
        { nameKey: 'navigation.tabs.sprints', icon: 'view-dashboard-outline', route: '/(tabs)/sprints' },
        { nameKey: 'settings.title', icon: 'cog', route: '/(tabs)/settings' },
    ],
};

export interface App {
    id: AppContext;
    nameKey: string;  // Translation key for the name
    icon: string;
    color: string;
    route: string;
}

export const APPS: App[] = [
    { id: 'sprints', nameKey: 'navigation.tabs.sprints', icon: 'view-dashboard-outline', color: '#3B82F6', route: '/(tabs)/sprints' },
    { id: 'sensai', nameKey: 'navigation.tabs.sensai', icon: 'robot', color: '#10B981', route: '/(tabs)/sensai' },
    { id: 'backlog', nameKey: 'navigation.sprints.backlog', icon: 'inbox', color: '#6366F1', route: '/(tabs)/sprints/backlog' },
    { id: 'epics', nameKey: 'navigation.sprints.epics', icon: 'bookmark-multiple', color: '#8B5CF6', route: '/(tabs)/sprints/epics' },
    { id: 'taskSearch', nameKey: 'navigation.tabs.tasks', icon: 'format-list-checkbox', color: '#0EA5E9', route: '/(tabs)/sprints/search-tasks' },
    { id: 'templates', nameKey: 'navigation.sprints.templates', icon: 'file-document-multiple', color: '#14B8A6', route: '/(tabs)/sprints/templates' },
    { id: 'challenges', nameKey: 'navigation.tabs.challenges', icon: 'target', color: '#F59E0B', route: '/(tabs)/challenges' },
    { id: 'pomodoro', nameKey: 'navigation.tabs.focus', icon: 'circle-slice-8', color: '#EF4444', route: '/(tabs)/pomodoro' },
    { id: 'essentia', nameKey: 'navigation.tabs.essentia', icon: 'brain', color: '#8B5CF6', route: '/(tabs)/essentia' },
    { id: 'mindset', nameKey: 'navigation.tabs.mindset', icon: 'creation', color: '#EC4899', route: '/(tabs)/motivation' },
    { id: 'community', nameKey: 'navigation.tabs.community', icon: 'account-group', color: '#06B6D4', route: '/(tabs)/community' },
    { id: 'family', nameKey: 'navigation.tabs.family', icon: 'account-heart', color: '#EC4899', route: '/(tabs)/family' },
    { id: 'notifications', nameKey: 'navigation.tabs.notifications', icon: 'bell', color: '#F97316', route: '/(tabs)/notifications' },
    { id: 'settings', nameKey: 'navigation.tabs.settings', icon: 'cog', color: '#6B7280', route: '/(tabs)/settings' },
];
