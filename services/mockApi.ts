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
import billsData from '../data/mock/bills.json';
import quoteCategoriesData from '../data/mock/quoteCategories.json';
import quotesData from '../data/mock/quotes.json';
import booksData from '../data/mock/bookSummaries.json';
import challengesData from '../data/mock/challenges.json';
import participantsData from '../data/mock/challengeParticipants.json';
import entriesData from '../data/mock/challengeEntries.json';
import notificationsData from '../data/mock/notifications.json';
import familiesData from '../data/mock/families.json';

// Simulate API delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    // Auth
    async login(email: string, password: string) {
        await delay();
        return usersData.currentUser;
    },

    // Users
    async getCurrentUser() {
        await delay();
        return usersData.currentUser;
    },

    async getFamilyMembers() {
        await delay();
        return usersData.familyMembers;
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
        return sprintsData.sprints;
    },

    async getCurrentSprint() {
        await delay();
        return sprintsData.sprints.find(s => s.status === 'active');
    },

    async getSprintById(id: string) {
        await delay();
        return sprintsData.sprints.find(s => s.id === id);
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
        let filtered = tasksData;

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
        return tasksData.find(t => t.id === id);
    },

    async getDraftTasks() {
        await delay();
        return tasksData.filter(t => t.isDraft);
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

    // Quotes
    async getDailyQuote() {
        await delay();
        // Return random quote for demo
        return quotesData[Math.floor(Math.random() * quotesData.length)];
    },

    async getQuotes(categoryId?: string) {
        await delay();
        if (categoryId) {
            return quotesData.filter(q => q.categoryId === categoryId);
        }
        return quotesData;
    },

    async getQuoteCategories() {
        await delay();
        return quoteCategoriesData;
    },

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
    async getChallenges(userId?: string) {
        await delay();
        if (userId) {
            // Return challenges where user is participant
            const userChallengeIds = participantsData
                .filter(p => p.userId === userId)
                .map(p => p.challengeId);
            return challengesData.filter(c => userChallengeIds.includes(c.id));
        }
        return challengesData;
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
};
