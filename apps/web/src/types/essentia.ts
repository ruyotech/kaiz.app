// ── Essentia Admin Types ─────────────────────────────────────────────────────
// Matches backend AdminEssentiaDtos.java records

export type CardType = 'INTRO' | 'CONCEPT' | 'QUOTE' | 'SUMMARY' | 'ACTION';
export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface EssentiaBook {
  id: string;
  title: string;
  author: string;
  lifeWheelAreaId: string;
  category: string;
  duration: number;
  cardCount: number;
  difficulty: Difficulty;
  tags: string[];
  description: string;
  summaryText: string | null;
  coreMethodology: string | null;
  appApplication: string | null;
  coverImageUrl: string | null;
  isbn: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  keyTakeaways: string[];
  publicationYear: number | null;
  rating: number | null;
  completionCount: number;
  createdAt: string;
  updatedAt: string;
  cards: EssentiaCard[];
}

export interface EssentiaCard {
  id: string;
  type: CardType;
  sortOrder: number;
  title: string;
  text: string;
  imageUrl: string | null;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  lifeWheelAreaId: string;
  category: string;
  duration?: number;
  difficulty?: Difficulty;
  tags?: string[];
  description?: string;
  summaryText?: string;
  coreMethodology?: string;
  appApplication?: string;
  coverImageUrl?: string;
  isbn?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  keyTakeaways?: string[];
  publicationYear?: number;
  rating?: number;
  cards?: CreateCardRequest[];
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  lifeWheelAreaId?: string;
  category?: string;
  duration?: number;
  difficulty?: Difficulty;
  tags?: string[];
  description?: string;
  summaryText?: string;
  coreMethodology?: string;
  appApplication?: string;
  coverImageUrl?: string;
  isbn?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  keyTakeaways?: string[];
  publicationYear?: number;
  rating?: number;
}

export interface CreateCardRequest {
  type: CardType;
  sortOrder: number;
  title: string;
  text: string;
  imageUrl?: string;
}

export interface UpdateCardRequest {
  type?: CardType;
  sortOrder?: number;
  title?: string;
  text?: string;
  imageUrl?: string;
}

export interface BulkImportRequest {
  books: CreateBookRequest[];
}

export interface BulkUpdateRequest {
  updates: BulkUpdateItem[];
}

export interface BulkUpdateItem {
  bookId: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  category?: string;
  difficulty?: Difficulty;
}

export interface BookStats {
  totalBooks: number;
  publishedBooks: number;
  featuredBooks: number;
  totalCards: number;
  booksByCategory: CategoryCount[];
  booksByLifeWheelArea: AreaCount[];
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface AreaCount {
  lifeWheelAreaId: string;
  count: number;
}

// ── Life Wheel Area helpers ─────────────────────────────────────────────────

export const LIFE_WHEEL_AREAS: Record<string, { name: string; color: string; emoji: string }> = {
  'lw-1': { name: 'Health & Fitness', color: '#10B981', emoji: '💪' },
  'lw-2': { name: 'Career & Work', color: '#3B82F6', emoji: '💼' },
  'lw-3': { name: 'Finance', color: '#F59E0B', emoji: '💰' },
  'lw-4': { name: 'Personal Growth', color: '#8B5CF6', emoji: '🌱' },
  'lw-5': { name: 'Relationships', color: '#EC4899', emoji: '❤️' },
  'lw-6': { name: 'Social Life', color: '#F97316', emoji: '🤝' },
  'lw-7': { name: 'Fun & Recreation', color: '#06B6D4', emoji: '🎮' },
  'lw-8': { name: 'Environment & Home', color: '#84CC16', emoji: '🏠' },
};

export function getAreaName(areaId: string): string {
  return LIFE_WHEEL_AREAS[areaId]?.name ?? areaId;
}

export function getAreaColor(areaId: string): string {
  return LIFE_WHEEL_AREAS[areaId]?.color ?? '#6B7280';
}

export function getAreaEmoji(areaId: string): string {
  return LIFE_WHEEL_AREAS[areaId]?.emoji ?? '📚';
}
