/**
 * React Query hooks — Community
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  communityApi,
  type CommunityMemberResponse,
  type CommunityHomeResponse,
  type PaginatedResponse,
  type CreateQuestionRequest,
  type CreateStoryRequest,
  type CreateTemplateRequest,
  type CreateGroupRequest,
  type FeatureRequestPayload,
  type PartnerRequestPayload,
  type SendComplimentRequest,
  type CreateAnswerRequest,
} from '../../services/api';
import { communityKeys } from './keys';
import { STALE_TIMES } from '../../providers/QueryProvider';

// ── Member / Home ───────────────────────────────────────────────────────────

export function useCommunityHome() {
  return useQuery({
    queryKey: communityKeys.home(),
    queryFn: () => communityApi.getCommunityHome() as Promise<CommunityHomeResponse>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCommunityMe() {
  return useQuery({
    queryKey: communityKeys.me(),
    queryFn: () => communityApi.getCurrentMember() as Promise<CommunityMemberResponse>,
    staleTime: STALE_TIMES.profile,
  });
}

// ── Knowledge Hub ───────────────────────────────────────────────────────────

export function useKnowledgeItems(params?: { search?: string; categoryId?: string }) {
  return useQuery({
    queryKey: communityKeys.knowledge(params as Record<string, unknown>),
    queryFn: () => communityApi.getKnowledgeItems(params),
    staleTime: STALE_TIMES.static,
  });
}

export function useKnowledgeItem(slug: string) {
  return useQuery({
    queryKey: communityKeys.knowledgeItem(slug),
    queryFn: () => communityApi.getKnowledgeItemBySlug(slug),
    enabled: !!slug,
    staleTime: STALE_TIMES.static,
  });
}

// ── Articles ────────────────────────────────────────────────────────────────

export function useArticles(params?: { category?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: communityKeys.articles(params as Record<string, unknown>),
    queryFn: () => communityApi.getArticles(params) as Promise<PaginatedResponse<unknown>>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: communityKeys.articleDetail(id),
    queryFn: () => communityApi.getArticleById(id),
    enabled: !!id,
  });
}

// ── Q&A ─────────────────────────────────────────────────────────────────────

export function useQuestions(params?: { status?: string; tag?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: communityKeys.questions(params as Record<string, unknown>),
    queryFn: () => communityApi.getQuestions(params) as Promise<PaginatedResponse<unknown>>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: communityKeys.questionDetail(id),
    queryFn: () => communityApi.getQuestionById(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => communityApi.createQuestion(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.questions() }); },
  });
}

export function useCreateAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: CreateAnswerRequest }) =>
      communityApi.createAnswer(questionId, data),
    onSuccess: (_d, { questionId }) => {
      qc.invalidateQueries({ queryKey: communityKeys.questionDetail(questionId) });
    },
  });
}

// ── Stories ──────────────────────────────────────────────────────────────────

export function useStories(params?: { category?: string; lifeWheelAreaId?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: communityKeys.stories(params as Record<string, unknown>),
    queryFn: () => communityApi.getStories(params) as Promise<PaginatedResponse<unknown>>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useStory(id: string) {
  return useQuery({
    queryKey: communityKeys.storyDetail(id),
    queryFn: () => communityApi.getStoryById(id),
    enabled: !!id,
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStoryRequest) => communityApi.createStory(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.stories() }); },
  });
}

// ── Templates ───────────────────────────────────────────────────────────────

export function useCommunityTemplates(params?: { type?: string; lifeWheelAreaId?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: communityKeys.templates(params as Record<string, unknown>),
    queryFn: () => communityApi.getTemplates(params) as Promise<PaginatedResponse<unknown>>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCreateCommunityTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateRequest) => communityApi.createTemplate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.templates() }); },
  });
}

// ── Leaderboard ─────────────────────────────────────────────────────────────

export function useLeaderboard(period: string, category: string) {
  return useQuery({
    queryKey: communityKeys.leaderboard(period, category),
    queryFn: () => communityApi.getLeaderboard(period, category),
    staleTime: STALE_TIMES.lists,
  });
}

// ── Partners ────────────────────────────────────────────────────────────────

export function usePartners() {
  return useQuery({
    queryKey: communityKeys.partners(),
    queryFn: () => communityApi.getPartners(),
    staleTime: STALE_TIMES.lists,
  });
}

export function useSendPartnerRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PartnerRequestPayload) => communityApi.sendPartnerRequest(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.partners() }); },
  });
}

// ── Groups ──────────────────────────────────────────────────────────────────

export function useCommunityGroups(params?: { lifeWheelAreaId?: string; joined?: boolean; page?: number; size?: number }) {
  return useQuery({
    queryKey: communityKeys.groups(params as Record<string, unknown>),
    queryFn: () => communityApi.getGroups(params) as Promise<PaginatedResponse<unknown>>,
    staleTime: STALE_TIMES.lists,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupRequest) => communityApi.createGroup(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.groups() }); },
  });
}

export function useJoinGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.joinGroup(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.groups() }); },
  });
}

// ── Activity ────────────────────────────────────────────────────────────────

export function useActivityFeed(page = 0, size = 20) {
  return useQuery({
    queryKey: communityKeys.activity(page),
    queryFn: () => communityApi.getActivityFeed(page, size) as Promise<PaginatedResponse<unknown>>,
    staleTime: STALE_TIMES.realtime,
  });
}

// ── Social mutations (likes, bookmarks, upvotes) ────────────────────────────

export function useToggleArticleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.toggleArticleLike(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.articles() }); },
  });
}

export function useToggleArticleBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communityApi.toggleArticleBookmark(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.articles() }); },
  });
}

export function useSubmitFeatureRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FeatureRequestPayload) => communityApi.submitFeatureRequest(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: communityKeys.all }); },
  });
}

export function useSendCompliment() {
  return useMutation({
    mutationFn: (data: SendComplimentRequest) => communityApi.sendCompliment(data),
  });
}
