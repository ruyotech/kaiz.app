import usersData from '../data/mock/users.json';
import lifeWheelData from '../data/mock/lifeWheelAreas.json';
import eisenhowerData from '../data/mock/eisenhowerQuadrants.json';
import sprintsData from '../data/mock/sprints.json';
import epicsData from '../data/mock/epics.json';
import tasksData from '../data/mock/tasks.json';
import taskHistoryData from '../data/mock/taskHistory.json';
import taskCommentsData from '../data/mock/taskComments.json';
import templatesData from '../data/mock/templates.json';
import billCategoriesData from '../data/mock/billCategories.json';
import { User, Sprint, Task } from '../types/models';
import billsData from '../data/mock/bills.json';
import booksData from '../data/mock/bookSummaries.json';
import challengesData from '../data/mock/challenges.json';
import challengeTemplatesData from '../data/mock/challengeTemplates.json';
import participantsData from '../data/mock/challengeParticipants.json';
import entriesData from '../data/mock/challengeEntries.json';
import notificationsData from '../data/mock/notifications.json';
import familiesData from '../data/mock/families.json';
import mindsetContentData from '../data/mock/mindsetContent.json';
import mindsetThemesData from '../data/mock/mindsetThemes.json';
import essentiaBooksData from '../data/mock/essentiaBooks.json';
import essentiaChallengesData from '../data/mock/essentiaChallenges.json';
import { Challenge, ChallengeEntry, ChallengeTemplate, MindsetContent, MindsetTheme, LifeWheelDimensionTag, EssentiaBook, EssentiaChallenge } from '../types/models';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    // Auth
    async login(email: string, password: string) {
        await delay();
        return usersData.currentUser as User;
    },

    // Users
    async getCurrentUser() {
        await delay();
        return usersData.currentUser as User;
    },

    async getFamilyMembers() {
        await delay();
        return usersData.familyMembers as User[];
    },

    // Life Wheel
    async getLifeWheelAreas() {
        await delay();
        return lifeWheelData;
    },

    // Eisenhower Matrix
    async getEisenhowerQuadrants() {
        await delay();
        return eisenhowerData;
    },

    // Sprints
    async getSprints(year: number = 2026) {
        await delay();
        return sprintsData.sprints as Sprint[];
    },

    async getCurrentSprint() {
        await delay();
        return (sprintsData.sprints as Sprint[]).find(s => s.status === 'active');
    },

    async getSprintById(id: string) {
        await delay();
        return (sprintsData.sprints as Sprint[]).find(s => s.id === id);
    },

    // Epics
    async getEpics() {
        await delay();
        return epicsData;
    },

    async getEpicById(id: string) {
        await delay();
        return epicsData.find(e => e.id === id);
    },

    // Tasks
    async getTasks(filters?: { sprintId?: string | null; status?: string; epicId?: string; userId?: string; backlog?: boolean }) {
        await delay();
        let filtered = tasksData as Task[];

        // Filter for backlog items (no sprint assigned, not draft)
        if (filters?.backlog) {
            filtered = filtered.filter(t => t.sprintId === null && !t.isDraft);
        } else if (filters?.sprintId !== undefined) {
            filtered = filtered.filter(t => t.sprintId === filters.sprintId);
        }
        
        if (filters?.status) {
            filtered = filtered.filter(t => t.status === filters.status);
        }
        if (filters?.epicId) {
            filtered = filtered.filter(t => t.epicId === filters.epicId);
        }
        if (filters?.userId) {
            filtered = filtered.filter(t => t.userId === filters.userId);
        }

        return filtered;
    },

    async getTaskById(id: string) {
        await delay();
        return (tasksData as Task[]).find(t => t.id === id);
    },

    async getDraftTasks() {
        await delay();
        return (tasksData as Task[]).filter(t => t.isDraft);
    },

    async getTaskHistory(taskId: string) {
        await delay();
        return taskHistoryData.filter(h => h.taskId === taskId);
    },

    async getTaskComments(taskId: string) {
        await delay();
        return taskCommentsData.filter(c => c.taskId === taskId);
    },

    async getTemplates() {
        await delay();
        return templatesData;
    },

    // Bills
    async getBills(filters?: { categoryId?: string; paymentStatus?: string }) {
        await delay();
        let filtered = billsData;

        if (filters?.categoryId) {
            filtered = filtered.filter(b => b.categoryId === filters.categoryId);
        }
        if (filters?.paymentStatus) {
            filtered = filtered.filter(b => b.paymentStatus === filters.paymentStatus);
        }

        return filtered;
    },

    async getBillById(id: string) {
        await delay();
        return billsData.find(b => b.id === id);
    },

    async getDraftBills() {
        await delay();
        return billsData.filter(b => b.isDraft);
    },

    async getBillCategories() {
        await delay();
        return billCategoriesData;
    },

    // Legacy quote methods removed - use getMindsetContent() instead

    // Books
    async getBookSummaries(lifeWheelAreaId?: string) {
        await delay();
        if (lifeWheelAreaId) {
            return booksData.filter(b => b.lifeWheelAreaId === lifeWheelAreaId);
        }
        return booksData;
    },

    async getBookById(id: string) {
        await delay();
        return booksData.find(b => b.id === id);
    },

    // Challenges
    async getChallenges(userId?: string, status?: string) {
        await delay();
        let filtered: any[] = challengesData;
        
        if (userId) {
            // Return challenges where user is participant
            const userChallengeIds = participantsData
                .filter(p => p.userId === userId)
                .map(p => p.challengeId);
            filtered = challengesData.filter(c => userChallengeIds.includes(c.id));
        }
        
        if (status) {
            filtered = filtered.filter(c => (c as any).status === status);
        }
        
        return filtered;
    },
    
    async getChallengeTemplates(lifeWheelAreaId?: string) {
        await delay();
        if (lifeWheelAreaId) {
            return (challengeTemplatesData as ChallengeTemplate[]).filter(t => t.lifeWheelAreaId === lifeWheelAreaId);
        }
        return challengeTemplatesData as ChallengeTemplate[];
    },
    
    async createChallenge(challengeData: Partial<Challenge>) {
        await delay();
        const newChallenge: Challenge = {
            id: `challenge-${Date.now()}`,
            name: challengeData.name || 'New Challenge',
            description: challengeData.description,
            lifeWheelAreaId: challengeData.lifeWheelAreaId || 'life-health',
            metricType: challengeData.metricType || 'count',
            targetValue: challengeData.targetValue,
            unit: challengeData.unit,
            duration: challengeData.duration || 30,
            recurrence: challengeData.recurrence || 'daily',
            customRecurrencePattern: challengeData.customRecurrencePattern,
            status: challengeData.status || 'active',
            startDate: challengeData.startDate || new Date().toISOString(),
            endDate: challengeData.endDate || new Date(Date.now() + (challengeData.duration || 30) * 24 * 60 * 60 * 1000).toISOString(),
            whyStatement: challengeData.whyStatement,
            rewardDescription: challengeData.rewardDescription,
            graceDays: challengeData.graceDays || 0,
            sprintIntegration: challengeData.sprintIntegration || false,
            pointValue: challengeData.pointValue,
            linkedTaskIds: challengeData.linkedTaskIds,
            challengeType: challengeData.challengeType || 'solo',
            visibility: challengeData.visibility || 'private',
            createdByUserId: challengeData.createdByUserId || 'user-1',
            accountabilityPartnerIds: challengeData.accountabilityPartnerIds,
            reminderEnabled: challengeData.reminderEnabled !== undefined ? challengeData.reminderEnabled : true,
            reminderTime: challengeData.reminderTime,
            currentStreak: challengeData.currentStreak || 0,
            bestStreak: challengeData.bestStreak || 0,
            totalCompletions: challengeData.totalCompletions || 0,
            totalMissed: challengeData.totalMissed || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: challengeData.completedAt,
        };
        
        (challengesData as any).push(newChallenge);
        return newChallenge;
    },
    
    async updateChallenge(challengeId: string, updates: Partial<Challenge>) {
        await delay();
        const index = challengesData.findIndex(c => c.id === challengeId);
        if (index !== -1) {
            (challengesData as any)[index] = {
                ...challengesData[index],
                ...updates,
                updatedAt: new Date().toISOString(),
            };
        }
    },
    
    async deleteChallenge(challengeId: string) {
        await delay();
        const index = challengesData.findIndex(c => c.id === challengeId);
        if (index !== -1) {
            (challengesData as any).splice(index, 1);
        }
    },
    
    async logChallengeEntry(entryData: {
        challengeId: string;
        value: number | boolean;
        note?: string;
        date: string;
    }) {
        await delay();
        const newEntry: ChallengeEntry = {
            id: `entry-${Date.now()}`,
            challengeId: entryData.challengeId,
            userId: 'user-1', // TODO: get from auth
            date: entryData.date,
            value: entryData.value,
            note: entryData.note,
            timestamp: new Date().toISOString(),
            synced: true,
            reactions: [],
        };
        
        (entriesData as any).push(newEntry);
        return newEntry;
    },
    
    async inviteAccountabilityPartner(challengeId: string, userId: string) {
        await delay();
        // Add participant
        const newParticipant = {
            id: `participant-${Date.now()}`,
            challengeId,
            userId,
            joinedAt: new Date().toISOString(),
            currentProgress: 0,
            lastUpdated: new Date().toISOString(),
            streakDays: 0,
            isAccountabilityPartner: true,
        };
        (participantsData as any).push(newParticipant);
    },

    async getChallengeById(id: string) {
        await delay();
        const challenge = challengesData.find(c => c.id === id);
        const participants = participantsData.filter(p => p.challengeId === id);

        // Sort participants by progress
        const sortedParticipants = participants.sort((a, b) => b.currentProgress - a.currentProgress);

        return {
            ...challenge,
            participants: sortedParticipants
        };
    },

    async getChallengeParticipants(challengeId: string) {
        await delay();
        return participantsData.filter(p => p.challengeId === challengeId);
    },

    async getChallengeEntries(challengeId: string, userId?: string) {
        await delay();
        let filtered = entriesData.filter(e => e.challengeId === challengeId);

        if (userId) {
            filtered = filtered.filter(e => e.userId === userId);
        }

        return filtered;
    },

    // Notifications
    async getNotifications(userId: string) {
        await delay();
        return notificationsData.filter(n => n.userId === userId);
    },

    async getUnreadCount(userId: string) {
        await delay();
        return notificationsData.filter(n => n.userId === userId && !n.isRead).length;
    },

    // Families
    async getFamilyById(id: string) {
        await delay();
        return familiesData.find(f => f.id === id);
    },

    async getUserFamily(userId: string) {
        await delay();
        return familiesData.find(f => f.memberIds.includes(userId));
    },

    // Mindset Content
    async getMindsetContent(filters?: { dimensionTag?: LifeWheelDimensionTag; interventionOnly?: boolean }) {
        await delay();
        let filtered = mindsetContentData as MindsetContent[];

        if (filters?.dimensionTag) {
            filtered = filtered.filter(c => c.dimensionTag === filters.dimensionTag);
        }
        if (filters?.interventionOnly) {
            filtered = filtered.filter(c => c.interventionWeight >= 50);
        }

        return filtered;
    },

    async getMindsetContentById(id: string) {
        await delay();
        return (mindsetContentData as MindsetContent[]).find(c => c.id === id);
    },

    async getMindsetThemes() {
        await delay();
        return mindsetThemesData as MindsetTheme[];
    },

    async getRandomMindsetContent(count: number = 1) {
        await delay();
        const shuffled = [...mindsetContentData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count) as MindsetContent[];
    },

    async getMindsetContentForDimensions(dimensions: LifeWheelDimensionTag[]) {
        await delay();
        return (mindsetContentData as MindsetContent[]).filter(c => 
            dimensions.includes(c.dimensionTag) && c.interventionWeight >= 70
        );
    },

    // Essentia - Micro-Learning
    async getEssentiaBooks(filters?: { lifeWheelAreaId?: LifeWheelDimensionTag; difficulty?: string; search?: string }) {
        await delay();
        let filtered = essentiaBooksData as EssentiaBook[];

        if (filters?.lifeWheelAreaId) {
            filtered = filtered.filter(b => b.lifeWheelAreaId === filters.lifeWheelAreaId);
        }
        if (filters?.difficulty) {
            filtered = filtered.filter(b => b.difficulty === filters.difficulty);
        }
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(b => 
                b.title.toLowerCase().includes(searchLower) ||
                b.author.toLowerCase().includes(searchLower) ||
                b.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
        }

        return filtered;
    },

    async getEssentiaBookById(id: string) {
        await delay();
        return (essentiaBooksData as EssentiaBook[]).find(b => b.id === id);
    },

    async getEssentiaChallenges(filters?: { lifeWheelAreaId?: LifeWheelDimensionTag }) {
        await delay();
        let filtered = essentiaChallengesData as EssentiaChallenge[];

        if (filters?.lifeWheelAreaId) {
            filtered = filtered.filter(c => c.lifeWheelAreaId === filters.lifeWheelAreaId);
        }

        return filtered;
    },

    async getEssentiaChallengeById(id: string) {
        await delay();
        return (essentiaChallengesData as EssentiaChallenge[]).find(c => c.id === id);
    },

    // AI Input Parsing (Mock)
    async parseAIInput(input: { 
        type: 'text' | 'image' | 'voice' | 'file'; 
        content: string; 
        source?: string;
        fileName?: string;
    }) {
        await delay(1000); // Simulate AI processing time
        
        // Mock AI parsing logic - randomly detect type based on input
        const detectedTypes = ['task', 'challenge', 'book', 'event'];
        
        // Simple heuristics for demo purposes
        let detectedType = 'task';
        const contentLower = input.content.toLowerCase();
        
        if (contentLower.includes('challenge') || contentLower.includes('streak') || contentLower.includes('habit')) {
            detectedType = 'challenge';
        } else if (contentLower.includes('book') || contentLower.includes('read') || contentLower.includes('reading')) {
            detectedType = 'book';
        } else if (contentLower.includes('event') || contentLower.includes('meeting') || contentLower.includes('appointment')) {
            detectedType = 'event';
        }
        
        // Generate mock parsed data based on input type
        let title = '';
        let description = '';
        
        switch (input.type) {
            case 'text':
                // Extract title from text (simplified)
                title = input.content.slice(0, 50).replace(/^(add|create|new)\s+(a\s+)?(task|challenge|book|event)?\s*/i, '');
                title = title.charAt(0).toUpperCase() + title.slice(1);
                description = input.content.length > 50 ? input.content : '';
                break;
            case 'image':
                title = `Task from ${input.source === 'camera' ? 'photo' : 'image'}`;
                description = 'AI detected content from image. Review and edit as needed.';
                break;
            case 'file':
                title = `Task from ${input.fileName || 'document'}`;
                description = `Extracted from file: ${input.fileName}. AI parsed key action items.`;
                break;
            case 'voice':
                title = 'Review project designs by Friday';
                description = 'Voice transcription: Add a new task to review the project designs by Friday';
                break;
        }
        
        return {
            success: true,
            detectedType,
            confidence: 0.85 + Math.random() * 0.1,
            parsedData: {
                title,
                description,
                suggestedPriority: 'medium',
                suggestedDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
        };
    },
};
