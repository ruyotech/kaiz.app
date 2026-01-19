import { format, parseISO, startOfWeek, endOfWeek, addDays, differenceInDays } from 'date-fns';

export function formatDate(dateString: string, formatStr: string = 'MMM d, yyyy'): string {
    return format(parseISO(dateString), formatStr);
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
