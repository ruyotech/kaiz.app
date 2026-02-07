/**
 * Mindset admin types — matches backend AdminMindsetDtos
 */

export interface MindsetContent {
  id: string;
  body: string;
  author: string;
  dimensionTag: string;
  secondaryTags: string[];
  themePreset: string;
  interventionWeight: number;
  emotionalTone: string;
  backgroundImageUrl: string | null;
  lifeWheelAreaId: string | null;
  lifeWheelAreaName: string | null;
  lifeWheelAreaColor: string | null;
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MindsetTheme {
  id: string;
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  gradientColors: string[];
  defaultAsset: string | null;
  createdAt: string;
}

export interface MindsetStats {
  totalQuotes: number;
  totalFavorites: number;
  quotesByDimension: Record<string, number>;
  quotesByTone: Record<string, number>;
  topFavorited: MindsetContent[];
}

export interface CreateMindsetContentRequest {
  body: string;
  author: string;
  dimensionTag?: string;
  secondaryTags?: string[];
  themePreset?: string;
  interventionWeight?: number;
  emotionalTone?: string;
  backgroundImageUrl?: string;
  lifeWheelAreaId?: string;
}

export interface UpdateMindsetContentRequest {
  body?: string;
  author?: string;
  dimensionTag?: string;
  secondaryTags?: string[];
  themePreset?: string;
  interventionWeight?: number;
  emotionalTone?: string;
  backgroundImageUrl?: string;
  lifeWheelAreaId?: string;
}

export interface BulkCreateRequest {
  quotes: CreateMindsetContentRequest[];
}

export interface BulkUploadResult {
  successCount: number;
  failedCount: number;
  errors: string[];
}

export interface CreateMindsetThemeRequest {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  gradientColors?: string[];
  defaultAsset?: string;
}

export interface UpdateMindsetThemeRequest {
  name?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  gradientColors?: string[];
  defaultAsset?: string;
}
