import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

export function getInitials(name?: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '👑';
  if (streak >= 100) return '🔥';
  if (streak >= 30) return '⚡';
  if (streak >= 7) return '🌟';
  return '✨';
}

export function getLevelTitle(level: number): string {
  if (level >= 50) return 'Legend';
  if (level >= 30) return 'Master';
  if (level >= 20) return 'Expert';
  if (level >= 10) return 'Achiever';
  if (level >= 5) return 'Rising Star';
  return 'Newcomer';
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    sprint_completed: '🏁',
    challenge_joined: '🎯',
    challenge_completed: '🏆',
    badge_earned: '🎖️',
    streak_milestone: '🔥',
    level_up: '⬆️',
  };
  return icons[type] || '✨';
}
