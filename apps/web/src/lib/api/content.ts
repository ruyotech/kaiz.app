import type {
  AboutFeature,
  Testimonial,
  FAQ,
  PricingTier,
  SiteSettings,
  KnowledgeCategory,
  KnowledgeItem,
} from '@/types/content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const result: ApiResponse<T> = await response.json();
  return result.data;
}

// ============ Public Content API ============

export async function getAboutFeatures(): Promise<AboutFeature[]> {
  try {
    const data = await fetchApi<any[]>('/api/v1/public/content/features');
    return data.map(mapApiFeatureToAboutFeature);
  } catch (error) {
    console.error('Failed to fetch about features:', error);
    // Return empty array for SSG fallback
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await fetchApi<any[]>('/api/v1/public/content/testimonials');
    return data.map(mapApiTestimonialToTestimonial);
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    return [];
  }
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await fetchApi<any[]>('/api/v1/public/content/testimonials/featured');
    return data.map(mapApiTestimonialToTestimonial);
  } catch (error) {
    console.error('Failed to fetch featured testimonials:', error);
    return [];
  }
}

export async function getFaqs(): Promise<FAQ[]> {
  try {
    const data = await fetchApi<any[]>('/api/v1/public/content/faqs');
    return data.map(mapApiFaqToFaq);
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    return [];
  }
}

export async function getFaqsByCategory(category: string): Promise<FAQ[]> {
  try {
    const data = await fetchApi<any[]>(`/api/v1/public/content/faqs/category/${category}`);
    return data.map(mapApiFaqToFaq);
  } catch (error) {
    console.error('Failed to fetch FAQs by category:', error);
    return [];
  }
}

export async function getPricingTiers(): Promise<PricingTier[]> {
  try {
    const data = await fetchApi<any[]>('/api/v1/public/content/pricing');
    return data.map(mapApiPricingToPricingTier);
  } catch (error) {
    console.error('Failed to fetch pricing tiers:', error);
    return [];
  }
}

export async function getSiteContent(key: string): Promise<string | null> {
  try {
    const data = await fetchApi<{ content: string }>(`/api/v1/public/content/site/${key}`);
    return data.content;
  } catch (error) {
    console.error(`Failed to fetch site content (${key}):`, error);
    return null;
  }
}

// ============ Admin Content API ============

export async function adminGetAllFeatures(token: string): Promise<AboutFeature[]> {
  const data = await fetchApi<any[]>('/api/v1/admin/content/features', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.map(mapApiFeatureToAboutFeature);
}

export async function adminCreateFeature(
  token: string,
  feature: Partial<AboutFeature>
): Promise<AboutFeature> {
  const data = await fetchApi<any>('/api/v1/admin/content/features', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapAboutFeatureToApiFeature(feature)),
  });
  return mapApiFeatureToAboutFeature(data);
}

export async function adminUpdateFeature(
  token: string,
  id: string,
  feature: Partial<AboutFeature>
): Promise<AboutFeature> {
  const data = await fetchApi<any>(`/api/v1/admin/content/features/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapAboutFeatureToApiFeature(feature)),
  });
  return mapApiFeatureToAboutFeature(data);
}

export async function adminDeleteFeature(token: string, id: string): Promise<void> {
  await fetchApi<void>(`/api/v1/admin/content/features/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminReorderFeatures(token: string, featureIds: string[]): Promise<void> {
  await fetchApi<void>('/api/v1/admin/content/features/reorder', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ featureIds }),
  });
}

export async function adminGetAllTestimonials(token: string): Promise<Testimonial[]> {
  const data = await fetchApi<any[]>('/api/v1/admin/content/testimonials', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.map(mapApiTestimonialToTestimonial);
}

export async function adminCreateTestimonial(
  token: string,
  testimonial: Partial<Testimonial>
): Promise<Testimonial> {
  const data = await fetchApi<any>('/api/v1/admin/content/testimonials', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapTestimonialToApiTestimonial(testimonial)),
  });
  return mapApiTestimonialToTestimonial(data);
}

export async function adminUpdateTestimonial(
  token: string,
  id: string,
  testimonial: Partial<Testimonial>
): Promise<Testimonial> {
  const data = await fetchApi<any>(`/api/v1/admin/content/testimonials/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapTestimonialToApiTestimonial(testimonial)),
  });
  return mapApiTestimonialToTestimonial(data);
}

export async function adminDeleteTestimonial(token: string, id: string): Promise<void> {
  await fetchApi<void>(`/api/v1/admin/content/testimonials/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminGetAllFaqs(token: string): Promise<FAQ[]> {
  const data = await fetchApi<any[]>('/api/v1/admin/content/faqs', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.map(mapApiFaqToFaq);
}

export async function adminCreateFaq(token: string, faq: Partial<FAQ>): Promise<FAQ> {
  const data = await fetchApi<any>('/api/v1/admin/content/faqs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapFaqToApiFaq(faq)),
  });
  return mapApiFaqToFaq(data);
}

export async function adminUpdateFaq(
  token: string,
  id: string,
  faq: Partial<FAQ>
): Promise<FAQ> {
  const data = await fetchApi<any>(`/api/v1/admin/content/faqs/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapFaqToApiFaq(faq)),
  });
  return mapApiFaqToFaq(data);
}

export async function adminDeleteFaq(token: string, id: string): Promise<void> {
  await fetchApi<void>(`/api/v1/admin/content/faqs/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminGetAllPricingTiers(token: string): Promise<PricingTier[]> {
  const data = await fetchApi<any[]>('/api/v1/admin/content/pricing', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.map(mapApiPricingToPricingTier);
}

export async function adminCreatePricingTier(
  token: string,
  tier: Partial<PricingTier>
): Promise<PricingTier> {
  const data = await fetchApi<any>('/api/v1/admin/content/pricing', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapPricingTierToApiPricing(tier)),
  });
  return mapApiPricingToPricingTier(data);
}

export async function adminUpdatePricingTier(
  token: string,
  id: string,
  tier: Partial<PricingTier>
): Promise<PricingTier> {
  const data = await fetchApi<any>(`/api/v1/admin/content/pricing/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(mapPricingTierToApiPricing(tier)),
  });
  return mapApiPricingToPricingTier(data);
}

export async function adminDeletePricingTier(token: string, id: string): Promise<void> {
  await fetchApi<void>(`/api/v1/admin/content/pricing/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ============ Type Mappers ============

function mapApiFeatureToAboutFeature(api: any): AboutFeature {
  return {
    id: api.id,
    slug: api.slug,
    title: api.title,
    subtitle: api.subtitle,
    description: api.description,
    bulletPoints: api.bulletPoints || [],
    example: api.example,
    icon: api.icon,
    color: api.color,
    order: api.displayOrder,
    isActive: api.active,
    updatedAt: api.updatedAt || new Date().toISOString(),
  };
}

function mapAboutFeatureToApiFeature(feature: Partial<AboutFeature>): any {
  return {
    slug: feature.slug,
    title: feature.title,
    subtitle: feature.subtitle,
    description: feature.description,
    bulletPoints: feature.bulletPoints,
    example: feature.example,
    icon: feature.icon,
    color: feature.color,
    displayOrder: feature.order,
    active: feature.isActive ?? true,
  };
}

function mapApiTestimonialToTestimonial(api: any): Testimonial {
  return {
    id: api.id,
    name: api.name,
    role: api.role,
    company: api.company,
    avatarUrl: api.avatarUrl,
    quote: api.quote,
    rating: api.rating,
    metrics: api.metrics,
    featured: api.featured,
    order: api.displayOrder || 0,
    isActive: api.active ?? true,
    createdAt: api.createdAt || new Date().toISOString(),
  };
}

function mapTestimonialToApiTestimonial(testimonial: Partial<Testimonial>): any {
  return {
    name: testimonial.name,
    role: testimonial.role,
    company: testimonial.company,
    avatarUrl: testimonial.avatarUrl,
    quote: testimonial.quote,
    rating: testimonial.rating,
    metrics: testimonial.metrics,
    featured: testimonial.featured ?? false,
    displayOrder: testimonial.order || 0,
    active: testimonial.isActive ?? true,
  };
}

function mapApiFaqToFaq(api: any): FAQ {
  return {
    id: api.id.toString(),
    question: api.question,
    answer: api.answer,
    category: api.category,
    order: api.displayOrder || 0,
    isActive: api.active ?? true,
  };
}

function mapFaqToApiFaq(faq: Partial<FAQ>): any {
  return {
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    displayOrder: faq.order || 0,
    active: faq.isActive ?? true,
  };
}

function mapApiPricingToPricingTier(api: any): PricingTier {
  return {
    id: api.id.toString(),
    name: api.name,
    price: parseFloat(api.price),
    billingCycle: api.billingPeriod as 'monthly' | 'yearly',
    description: api.description,
    features: api.features || [],
    highlighted: api.popular ?? false,
    ctaText: api.ctaText || 'Get Started',
    order: api.displayOrder || 0,
    isActive: api.active ?? true,
  };
}

function mapPricingTierToApiPricing(tier: Partial<PricingTier>): any {
  return {
    name: tier.name,
    price: tier.price,
    billingPeriod: tier.billingCycle === 'yearly' ? 'year' : 'month',
    description: tier.description,
    features: tier.features,
    ctaText: tier.ctaText || 'Get Started',
    ctaLink: '/signup',
    popular: tier.highlighted ?? false,
    displayOrder: tier.order || 0,
    active: tier.isActive ?? true,
  };
}

// ============ Knowledge Hub API ============

// Admin Knowledge Hub API
export async function getAdminKnowledgeCategories(token: string): Promise<KnowledgeCategory[]> {
  return fetchApi<KnowledgeCategory[]>('/api/v1/admin/knowledge/categories', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createKnowledgeCategory(
  token: string,
  category: Partial<KnowledgeCategory>
): Promise<KnowledgeCategory> {
  return fetchApi<KnowledgeCategory>('/api/v1/admin/knowledge/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(category),
  });
}

export async function updateKnowledgeCategory(
  token: string,
  id: string,
  category: Partial<KnowledgeCategory>
): Promise<KnowledgeCategory> {
  return fetchApi<KnowledgeCategory>(`/api/v1/admin/knowledge/categories/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(category),
  });
}

export async function deleteKnowledgeCategory(token: string, id: string): Promise<void> {
  await fetchApi(`/api/v1/admin/knowledge/categories/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getAdminKnowledgeItems(
  token: string,
  options?: { search?: string; categoryId?: string }
): Promise<KnowledgeItem[]> {
  const params = new URLSearchParams();
  if (options?.search) params.append('search', options.search);
  if (options?.categoryId) params.append('categoryId', options.categoryId);
  const query = params.toString() ? `?${params.toString()}` : '';

  const items = await fetchApi<any[]>(`/api/v1/admin/knowledge/items${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return items.map(mapApiKnowledgeItemToItem);
}

export async function getAdminKnowledgeItem(token: string, id: string): Promise<KnowledgeItem> {
  const item = await fetchApi<any>(`/api/v1/admin/knowledge/items/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return mapApiKnowledgeItemToItem(item);
}

export async function createKnowledgeItem(
  token: string,
  item: Partial<KnowledgeItem>
): Promise<KnowledgeItem> {
  const apiItem = mapKnowledgeItemToApi(item);
  const created = await fetchApi<any>('/api/v1/admin/knowledge/items', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(apiItem),
  });
  return mapApiKnowledgeItemToItem(created);
}

export async function updateKnowledgeItem(
  token: string,
  id: string,
  item: Partial<KnowledgeItem>
): Promise<KnowledgeItem> {
  const apiItem = mapKnowledgeItemToApi(item);
  const updated = await fetchApi<any>(`/api/v1/admin/knowledge/items/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(apiItem),
  });
  return mapApiKnowledgeItemToItem(updated);
}

export async function deleteKnowledgeItem(token: string, id: string): Promise<void> {
  await fetchApi(`/api/v1/admin/knowledge/items/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateKnowledgeItemStatus(
  token: string,
  id: string,
  status: string
): Promise<void> {
  await fetchApi(`/api/v1/admin/knowledge/items/${id}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
}

export async function bulkImportKnowledgeItems(
  token: string,
  items: Partial<KnowledgeItem>[]
): Promise<KnowledgeItem[]> {
  const apiItems = items.map(mapKnowledgeItemToApi);
  const imported = await fetchApi<any[]>('/api/v1/admin/knowledge/items/bulk', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(apiItems),
  });
  return imported.map(mapApiKnowledgeItemToItem);
}

// Public Knowledge Hub API
export async function getPublicKnowledgeCategories(): Promise<KnowledgeCategory[]> {
  try {
    return await fetchApi<KnowledgeCategory[]>('/api/v1/public/knowledge/categories');
  } catch (error) {
    console.error('Failed to fetch knowledge categories:', error);
    return [];
  }
}

export async function getPublicKnowledgeItems(
  options?: { search?: string; categoryId?: string }
): Promise<KnowledgeItem[]> {
  try {
    const params = new URLSearchParams();
    if (options?.search) params.append('search', options.search);
    if (options?.categoryId) params.append('categoryId', options.categoryId);
    const query = params.toString() ? `?${params.toString()}` : '';

    const items = await fetchApi<any[]>(`/api/v1/public/knowledge/items${query}`);
    return items.map(mapApiKnowledgeItemToItem);
  } catch (error) {
    console.error('Failed to fetch knowledge items:', error);
    return [];
  }
}

export async function getFeaturedKnowledgeItems(): Promise<KnowledgeItem[]> {
  try {
    const items = await fetchApi<any[]>('/api/v1/public/knowledge/items/featured');
    return items.map(mapApiKnowledgeItemToItem);
  } catch (error) {
    console.error('Failed to fetch featured knowledge items:', error);
    return [];
  }
}

export async function recordKnowledgeItemView(id: string): Promise<void> {
  try {
    await fetchApi(`/api/v1/public/knowledge/items/${id}/view`, { method: 'POST' });
  } catch (error) {
    console.error('Failed to record view:', error);
  }
}

export async function recordKnowledgeItemHelpful(id: string): Promise<void> {
  try {
    await fetchApi(`/api/v1/public/knowledge/items/${id}/helpful`, { method: 'POST' });
  } catch (error) {
    console.error('Failed to record helpful:', error);
  }
}

// Knowledge Hub mappers
function mapApiKnowledgeItemToItem(api: any): KnowledgeItem {
  return {
    id: api.id,
    categoryId: api.categoryId,
    categoryName: api.categoryName,
    slug: api.slug,
    title: api.title,
    summary: api.summary || '',
    content: api.content || '',
    difficulty: api.difficulty || 'BEGINNER',
    readTimeMinutes: api.readTimeMinutes || 2,
    tags: typeof api.tags === 'string' ? JSON.parse(api.tags || '[]') : (api.tags || []),
    icon: api.icon || '📚',
    status: api.status || 'DRAFT',
    featured: api.featured ?? false,
    viewCount: api.viewCount || 0,
    helpfulCount: api.helpfulCount || 0,
    displayOrder: api.displayOrder || 0,
    searchKeywords: api.searchKeywords,
    createdAt: api.createdAt || new Date().toISOString(),
    updatedAt: api.updatedAt || new Date().toISOString(),
    createdBy: api.createdBy,
    updatedBy: api.updatedBy,
  };
}

function mapKnowledgeItemToApi(item: Partial<KnowledgeItem>): any {
  return {
    categoryId: item.categoryId,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    content: item.content,
    difficulty: item.difficulty || 'BEGINNER',
    readTimeMinutes: item.readTimeMinutes || 2,
    tags: Array.isArray(item.tags) ? JSON.stringify(item.tags) : item.tags,
    icon: item.icon || '📚',
    status: item.status || 'DRAFT',
    featured: item.featured ?? false,
    displayOrder: item.displayOrder || 0,
    searchKeywords: item.searchKeywords,
  };
}
