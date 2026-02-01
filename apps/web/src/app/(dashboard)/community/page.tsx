'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { communityApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  FileText,
  MessageCircle,
  Trophy,
  Layout,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Users,
  Star,
} from 'lucide-react';

type CommunityTab = 'articles' | 'stories' | 'qa' | 'templates' | 'leaderboard';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<CommunityTab>('articles');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch articles
  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ['community', 'articles'],
    queryFn: () => communityApi.getArticles(),
    staleTime: 60000,
  });

  // Fetch stories
  const { data: storiesData, isLoading: storiesLoading } = useQuery({
    queryKey: ['community', 'stories'],
    queryFn: () => communityApi.getStories(),
    staleTime: 60000,
  });

  // Fetch Q&A
  const { data: qaData, isLoading: qaLoading } = useQuery({
    queryKey: ['community', 'qa'],
    queryFn: () => communityApi.getQuestions(),
    staleTime: 60000,
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['community', 'leaderboard'],
    queryFn: () => communityApi.getLeaderboard('weekly', 'reputation'),
    staleTime: 60000,
  });

  const articles = articlesData?.content || [];
  const stories = storiesData?.content || [];
  const questions = qaData?.content || [];
  const leaderboard = leaderboardData || [];

  const tabs = [
    { id: 'articles', label: 'Articles', icon: FileText, count: articles.length },
    { id: 'stories', label: 'Stories', icon: BookOpen, count: stories.length },
    { id: 'qa', label: 'Q&A', icon: MessageCircle, count: questions.length },
    { id: 'templates', label: 'Templates', icon: Layout, count: 0 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, count: leaderboard.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Community</h1>
          <p className="text-slate-400 text-sm mt-1">
            Learn from others, share your journey, and grow together
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CommunityTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'articles' && (
        <ArticlesSection articles={articles} isLoading={articlesLoading} searchQuery={searchQuery} />
      )}
      {activeTab === 'stories' && (
        <StoriesSection stories={stories} isLoading={storiesLoading} searchQuery={searchQuery} />
      )}
      {activeTab === 'qa' && (
        <QASection questions={questions} isLoading={qaLoading} searchQuery={searchQuery} />
      )}
      {activeTab === 'templates' && <TemplatesSection />}
      {activeTab === 'leaderboard' && (
        <LeaderboardSection leaderboard={leaderboard} isLoading={leaderboardLoading} />
      )}
    </div>
  );
}

function ArticlesSection({
  articles,
  isLoading,
  searchQuery,
}: {
  articles: any[];
  isLoading: boolean;
  searchQuery: string;
}) {
  const filtered = articles.filter(
    (a) =>
      !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <ContentSkeleton />;

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No articles yet"
        description="Be the first to share your knowledge with the community"
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all group">
      {article.coverImage && (
        <div className="aspect-video bg-slate-800 overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          {article.category && (
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              {article.category}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readTime || '5 min read'}
          </span>
        </div>
        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{article.excerpt || article.content?.substring(0, 100)}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-cyan-500" />
            <span className="text-xs text-slate-400">{article.authorName || 'Anonymous'}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {article.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {article.views || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoriesSection({
  stories,
  isLoading,
  searchQuery,
}: {
  stories: any[];
  isLoading: boolean;
  searchQuery: string;
}) {
  const filtered = stories.filter(
    (s) =>
      !searchQuery ||
      s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <ContentSkeleton />;

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-12 h-12" />}
        title="No stories yet"
        description="Share your personal growth journey with the community"
      />
    );
  }

  return (
    <div className="space-y-4">
      {filtered.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}

function StoryCard({ story }: { story: any }) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{story.authorName || 'Anonymous'}</span>
            <span className="text-xs text-slate-500">
              {story.createdAt ? new Date(story.createdAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>
          <h3 className="font-semibold text-lg">{story.title}</h3>
          <p className="text-slate-400 mt-2 line-clamp-3">{story.content}</p>
          <div className="flex items-center gap-4 mt-4">
            <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors">
              <Heart className="w-4 h-4" /> {story.likes || 0}
            </button>
            <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" /> {story.comments || 0}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QASection({
  questions,
  isLoading,
  searchQuery,
}: {
  questions: any[];
  isLoading: boolean;
  searchQuery: string;
}) {
  const filtered = questions.filter(
    (q) =>
      !searchQuery ||
      q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <ContentSkeleton />;

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle className="w-12 h-12" />}
        title="No questions yet"
        description="Ask the community for help or advice"
      />
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}

function QuestionCard({ question }: { question: any }) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 hover:border-white/20 transition-all">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 text-center min-w-[50px]">
          <span className="text-2xl font-bold text-primary">{question.answers || 0}</span>
          <span className="text-xs text-slate-500">answers</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium hover:text-primary transition-colors cursor-pointer">
            {question.title}
          </h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{question.content}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {question.tags?.map((tag: string) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                {tag}
              </span>
            ))}
            <span className="text-xs text-slate-500">
              Asked by {question.authorName || 'Anonymous'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplatesSection() {
  const categories = [
    { name: 'Daily Routines', count: 12, icon: '🌅' },
    { name: 'Weekly Planning', count: 8, icon: '📅' },
    { name: 'Goal Setting', count: 15, icon: '🎯' },
    { name: 'Habit Tracking', count: 10, icon: '✅' },
    { name: 'Mindfulness', count: 6, icon: '🧘' },
    { name: 'Productivity', count: 14, icon: '⚡' },
  ];

  return (
    <div className="space-y-6">
      {/* Featured templates */}
      <div className="bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-lg font-semibold">Featured Templates</h2>
        </div>
        <p className="text-slate-400 mb-4">
          Discover curated templates from top performers in our community
        </p>
        <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all">
          Browse Featured
        </button>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-slate-900/50 rounded-xl border border-white/10 p-4 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500">{category.count} templates</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeaderboardSection({
  leaderboard,
  isLoading,
}: {
  leaderboard: any[];
  isLoading: boolean;
}) {
  if (isLoading) return <ContentSkeleton />;

  // Mock data if empty
  const data = leaderboard.length > 0 ? leaderboard : [
    { rank: 1, name: 'Alex Johnson', points: 12450, streak: 67, badge: '🏆' },
    { rank: 2, name: 'Sarah Chen', points: 11230, streak: 54, badge: '🥈' },
    { rank: 3, name: 'Mike Wilson', points: 10890, streak: 45, badge: '🥉' },
    { rank: 4, name: 'Emma Davis', points: 9876, streak: 32, badge: '⭐' },
    { rank: 5, name: 'James Brown', points: 8765, streak: 28, badge: '⭐' },
  ];

  return (
    <div className="space-y-6">
      {/* Top 3 */}
      <div className="grid md:grid-cols-3 gap-4">
        {data.slice(0, 3).map((user: any, index) => (
          <div
            key={user.rank || index}
            className={cn(
              'bg-slate-900/50 rounded-xl border p-6 text-center',
              index === 0
                ? 'border-yellow-500/30 bg-gradient-to-b from-yellow-500/10'
                : index === 1
                ? 'border-slate-400/30 bg-gradient-to-b from-slate-400/10'
                : 'border-orange-500/30 bg-gradient-to-b from-orange-500/10'
            )}
          >
            <div className="text-4xl mb-3">{user.badge || ['🥇', '🥈', '🥉'][index]}</div>
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-500 mb-3" />
            <h3 className="font-semibold">{user.name || user.fullName}</h3>
            <div className="text-2xl font-bold text-primary mt-2">
              {(user.points || user.totalPoints || 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-500">points</div>
            <div className="flex items-center justify-center gap-1 mt-2 text-sm text-orange-400">
              🔥 {user.streak || user.currentStreak || 0} day streak
            </div>
          </div>
        ))}
      </div>

      {/* Rest of leaderboard */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" /> Full Leaderboard
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {data.slice(3).map((user: any, index) => (
            <div key={user.rank || index} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
              <span className="w-8 text-center font-medium text-slate-400">#{(user.rank || index + 4)}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500" />
              <div className="flex-1">
                <div className="font-medium">{user.name || user.fullName}</div>
                <div className="text-sm text-slate-500">🔥 {user.streak || user.currentStreak || 0} day streak</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">
                  {(user.points || user.totalPoints || 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">points</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-slate-600">{icon}</div>
      <h3 className="text-lg font-medium mt-4">{title}</h3>
      <p className="text-slate-500 mt-1">{description}</p>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-900/50 rounded-xl border border-white/10 p-4 animate-pulse">
          <div className="h-32 bg-slate-700 rounded mb-4" />
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-700 rounded w-1/2 mt-2" />
        </div>
      ))}
    </div>
  );
}
