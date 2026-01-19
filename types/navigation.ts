export type RootStackParamList = {
    '(tabs)': undefined;
    '(onboarding)/welcome': undefined;
    '(onboarding)/setup': undefined;
    '(auth)/login': undefined;
    '(auth)/register': undefined;
    'notifications': undefined;
    'profile': undefined;
    'family': undefined;
};

export type TabsParamList = {
    'index': undefined;
    'sdlc': undefined;
    'command-center': undefined;
    'bills': undefined;
    'motivation': undefined;
    'books': undefined;
    'challenges': undefined;
};

export type SDLCStackParamList = {
    'index': undefined;
    'calendar': undefined;
    'reports': undefined;
    'task/[id]': { id: string };
    'epic/[id]': { id: string };
    'create-task': undefined;
};

export type BillsStackParamList = {
    'index': undefined;
    'categories': undefined;
    'reports': undefined;
    'bill/[id]': { id: string };
};

export type ChallengesStackParamList = {
    'index': undefined;
    'challenge/[id]': { id: string };
    'create-challenge': undefined;
};
