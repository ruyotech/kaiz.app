import { format, parseISO, startOfWeek, endOfWeek, addDays, differenceInDays } from 'date-fns';
import { formatLocalized, getMonthShort } from './localizedDate';

export function formatDate(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
    return format(parseISO(dateString), formatStr);
}

export function formatDateLocale(dateString: string, formatStr: string = 'PP'): string {
    return formatLocalized(parseISO(dateString), formatStr);
}

export function formatTime(dateString: string): string {
    return format(parseISO(dateString), 'h:mm a');
}

export function formatDateTime(dateString: string): string {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
}

export function getRelativeDate(dateString: string): string {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInDays = differenceInDays(now, date);

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays === -1) return 'Tomorrow';
    if (diffInDays > 0 && diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 0 && diffInDays > -7) return `In ${Math.abs(diffInDays)} days`;

    return formatDate(dateString);
}

export function getWeekNumber(date: Date = new Date()): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

export function getSprintDates(weekNumber: number, year: number = 2026) {
    const startOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    const sprintStart = addDays(startOfYear, daysToAdd);
    const sprintEnd = addDays(sprintStart, 6);

    return {
        startDate: format(sprintStart, 'yyyy-MM-dd'),
        endDate: format(sprintEnd, 'yyyy-MM-dd'),
    };
}

export function isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
}

export function daysUntilDue(dueDate: string): number {
    return differenceInDays(parseISO(dueDate), new Date());
}

export const isDueSoon = (dueDate: string): boolean => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffInDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays > 0 && diffInDays < 7;
};

// Sprint helpers
export const getSprintName = (date: Date): string => {
    const year = date.getFullYear();
    const weekNum = getWeekNumber(date);
    return `S${weekNum}-${year}`;
};

export const getWeekStartDate = (date: Date): Date => {
    const day = date.getDay();
    const diff = date.getDate() - day; // Sunday is 0
    const startDate = new Date(date);
    startDate.setDate(diff);
    return startDate;
};

export const getWeekEndDate = (date: Date): Date => {
    const startDate = getWeekStartDate(new Date(date));
    return addDays(startDate, 6); // Saturday
};

export const isSameWeek = (date1: Date, date2: Date): boolean => {
    const week1Start = getWeekStartDate(new Date(date1));
    const week2Start = getWeekStartDate(new Date(date2));
    return week1Start.getTime() === week2Start.getTime();
};

export const getSprintColor = (date: Date): 'red' | 'yellow' | 'green' => {
    const today = new Date();
    if (isSameWeek(date, today)) return 'yellow';
    if (date < today) return 'red';
    return 'green';
};

// Get first day of month
export const getMonthStartDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
};

// Get total days in a month
export const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

// Get all days to display in month grid (including padding from prev/next month)
export const getMonthCalendarDays = (date: Date): Date[] => {
    const monthStart = getMonthStartDate(date);
    const daysInMonth = getDaysInMonth(date);

    // Get day of week for first day (0 = Sunday)
    const startDayOfWeek = monthStart.getDay();

    // Calculate how many days from previous month to show
    const prevMonthDays: Date[] = [];
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push(addDays(monthStart, -i - 1));
    }

    // Current month days
    const currentMonthDays: Date[] = [];
    for (let i = 0; i < daysInMonth; i++) {
        currentMonthDays.push(addDays(monthStart, i));
    }

    // Calculate total days (should be multiple of 7)
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);

    // Next month days
    const nextMonthDays: Date[] = [];
    const lastDayOfMonth = addDays(monthStart, daysInMonth - 1);
    for (let i = 1; i <= remainingDays; i++) {
        nextMonthDays.push(addDays(lastDayOfMonth, i));
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
};

// Determine sprint timing status
export const getSprintStatus = (startDate: string, endDate: string): 'past' | 'current' | 'future' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (today > end) return 'past';
    if (today >= start && today <= end) return 'current';
    return 'future';
};

// Generate list of months for selector
export interface MonthItem {
    date: Date;
    label: string;
    year: number;
    month: number;
}

export const generateMonthList = (centerDate: Date, monthsBeforeAfter: number = 12): MonthItem[] => {
    const months: MonthItem[] = [];

    for (let i = -monthsBeforeAfter; i <= monthsBeforeAfter; i++) {
        const monthDate = new Date(centerDate.getFullYear(), centerDate.getMonth() + i, 1);
        months.push({
            date: monthDate,
            label: getMonthShort(monthDate), // Now uses localized month name
            year: monthDate.getFullYear(),
            month: monthDate.getMonth(),
        });
    }

    return months;
};
