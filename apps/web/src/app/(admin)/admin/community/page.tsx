'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { communityApi, PaginatedResponse, Article, Story, Question } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    Users,
    FileText,
    MessageSquare,
    BookOpen,
    Trophy,
    TrendingUp,
    Eye,
    ThumbsUp,
    Clock,
    Filter,
    Search,
    MoreHorizontal,
    X,
    Check,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';

type Tab = 'overview' | 'articles' | 'stories' | 'questions' | 'leaderboard';

export default function AdminCommunityPage() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch community data
    const { data: articles, isLoading: loadingArticles } = useQuery({
        queryKey: ['admin-community-articles'],
        queryFn: () => communityApi.getArticles({ page: 0, size: 10 }),
        staleTime: 30000,
    });

    const { data: stories, isLoading: loadingStories } = useQuery({
        queryKey: ['admin-community-stories'],
        queryFn: () => communityApi.getStories({ page: 0, size: 10 }),
        staleTime: 30000,
    });

    const { data: questions, isLoading: loadingQuestions } = useQuery({
        queryKey: ['admin-community-questions'],
        queryFn: () => communityApi.getQuestions({ page: 0, size: 10 }),
        staleTime: 30000,
    });

    const { data: leaderboard, isLoading: loadingLeaderboard } = useQuery({
        queryKey: ['admin-community-leaderboard'],
        queryFn: () => communityApi.getLeaderboard('weekly', 'overall'),
        staleTime: 30000,
    });

    const stats = {
        articles: articles?.totalElements ?? 0,
        stories: stories?.totalElements ?? 0,
        questions: questions?.totalElements ?? 0,
        leaderboardUsers: leaderboard?.length ?? 0,
    };

    const isLoading = loadingArticles || loadingStories || loadingQuestions;

    const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
        { id: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'articles', label: 'Articles', icon: <FileText className="w-4 h-4" />, count: stats.articles },
        { id: 'stories', label: 'Stories', icon: <BookOpen className="w-4 h-4" />, count: stats.stories },
        { id: 'questions', label: 'Q&A', icon: <MessageSquare className="w-4 h-4" />, count: stats.questions },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Community Management</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage articles, stories, Q&A, and community content
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                            activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
                        )}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className={cn(
                                'px-2 py-0.5 rounded-full text-xs',
                                activeTab === tab.id
                                    ? 'bg-primary/20 text-primary'
                                    : 'bg-white/10 text-slate-400'
                            )}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && (
                <OverviewTab stats={stats} articles={articles} stories={stories} questions={questions} isLoading={isLoading} />
            )}
            {activeTab === 'articles' && (
                <ArticlesTab articles={articles} isLoading={loadingArticles} />
            )}
            {activeTab === 'stories' && (
                <StoriesTab stories={stories} isLoading={loadingStories} />
            )}
            {activeTab === 'questions' && (
                <QuestionsTab questions={questions} isLoading={loadingQuestions} />
            )}
            {activeTab === 'leaderboard' && (
                <LeaderboardTab leaderboard={leaderboard} isLoading={loadingLeaderboard} />
            )}
        </div>
    );
}

// Overview Tab
function OverviewTab({
    stats,
    articles,
    stories,
    questions,
    isLoading
}: {
    stats: { articles: number; stories: number; questions: number; leaderboardUsers: number };
    articles?: PaginatedResponse<Article>;
    stories?: PaginatedResponse<Story>;
    questions?: PaginatedResponse<Question>;
    isLoading: boolean;
}) {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<FileText className="w-5 h-5" />}
                    label="Total Articles"
                    value={stats.articles}
                    color="text-blue-400"
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    icon={<BookOpen className="w-5 h-5" />}
                    label="Success Stories"
                    value={stats.stories}
                    color="text-green-400"
                    bgColor="bg-green-500/10"
                />
                <StatCard
                    icon={<MessageSquare className="w-5 h-5" />}
                    label="Q&A Posts"
                    value={stats.questions}
                    color="text-purple-400"
                    bgColor="bg-purple-500/10"
                />
                <StatCard
                    icon={<Trophy className="w-5 h-5" />}
                    label="Active Participants"
                    value={stats.leaderboardUsers}
                    color="text-yellow-400"
                    bgColor="bg-yellow-500/10"
                />
            </div>

            {/* Recent Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Articles */}
                <ContentSection title="Recent Articles" icon={<FileText className="w-4 h-4" />}>
                    {isLoading ? (
                        <ContentSkeleton />
                    ) : articles?.content.length === 0 ? (
                        <EmptyState message="No articles yet" />
                    ) : (
                        <div className="space-y-3">
                            {articles?.content.slice(0, 5).map((article) => (
                                <ContentItem
                                    key={article.id}
                                    title={article.title}
                                    subtitle={`${article.readTime} min read • ${article.likeCount} likes`}
                                    status={article.isFeatured ? 'Featured' : 'Published'}
                                />
                            ))}
                        </div>
                    )}
                </ContentSection>

                {/* Recent Stories */}
                <ContentSection title="Recent Stories" icon={<BookOpen className="w-4 h-4" />}>
                    {isLoading ? (
                        <ContentSkeleton />
                    ) : stories?.content.length === 0 ? (
                        <EmptyState message="No stories yet" />
                    ) : (
                        <div className="space-y-3">
                            {stories?.content.slice(0, 5).map((story) => (
                                <ContentItem
                                    key={story.id}
                                    title={story.title}
                                    subtitle={`${story.likeCount} likes • ${story.commentCount} comments`}
                                    status="Published"
                                />
                            ))}
                        </div>
                    )}
                </ContentSection>

                {/* Recent Questions */}
                <ContentSection title="Recent Questions" icon={<MessageSquare className="w-4 h-4" />}>
                    {isLoading ? (
                        <ContentSkeleton />
                    ) : questions?.content.length === 0 ? (
                        <EmptyState message="No questions yet" />
                    ) : (
                        <div className="space-y-3">
                            {questions?.content.slice(0, 5).map((question) => (
                                <ContentItem
                                    key={question.id}
                                    title={question.title}
                                    subtitle={`${question.upvoteCount} upvotes • ${question.answerCount} answers`}
                                    status={question.status === 'ANSWERED' ? 'Answered' : 'Open'}
                                />
                            ))}
                        </div>
                    )}
                </ContentSection>
            </div>
        </div>
    );
}

// Articles Tab
function ArticlesTab({ articles, isLoading }: { articles?: PaginatedResponse<Article>; isLoading: boolean }) {
    if (isLoading) return <TableSkeleton />;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left">
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Title</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Author</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Category</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Read Time</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Likes</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {articles?.content.map((article) => (
                            <tr key={article.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-white truncate max-w-xs">{article.title}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{article.author?.name || 'Unknown'}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded-full text-xs bg-primary/20 text-primary">
                                        {article.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{article.readTime}m</td>
                                <td className="px-4 py-3 text-slate-400">{article.likeCount}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'px-2 py-1 rounded-full text-xs',
                                        article.isFeatured ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                                    )}>
                                        {article.isFeatured ? 'Featured' : 'Published'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {articles?.content.length === 0 && (
                <div className="p-8 text-center text-slate-400">No articles found</div>
            )}
        </div>
    );
}

// Stories Tab
function StoriesTab({ stories, isLoading }: { stories?: PaginatedResponse<Story>; isLoading: boolean }) {
    if (isLoading) return <TableSkeleton />;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left">
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Title</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Author</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Category</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Likes</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Comments</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Created</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {stories?.content.map((story) => (
                            <tr key={story.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-white truncate max-w-xs">{story.title}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{story.author?.displayName || 'Anonymous'}</td>
                                <td className="px-4 py-3">
                                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                        {story.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{story.likeCount}</td>
                                <td className="px-4 py-3 text-slate-400">{story.commentCount}</td>
                                <td className="px-4 py-3 text-slate-400 text-sm">
                                    {new Date(story.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {stories?.content.length === 0 && (
                <div className="p-8 text-center text-slate-400">No stories found</div>
            )}
        </div>
    );
}

// Questions Tab
function QuestionsTab({ questions, isLoading }: { questions?: PaginatedResponse<Question>; isLoading: boolean }) {
    if (isLoading) return <TableSkeleton />;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left">
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Question</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Author</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Tags</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Upvotes</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Answers</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
                            <th className="px-4 py-3 text-sm font-medium text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {questions?.content.map((question) => (
                            <tr key={question.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-white truncate max-w-xs">{question.title}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{question.author?.displayName || 'Anonymous'}</td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        {question.tags?.slice(0, 2).map((tag) => (
                                            <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-400">{question.upvoteCount}</td>
                                <td className="px-4 py-3 text-slate-400">{question.answerCount}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        'px-2 py-1 rounded-full text-xs',
                                        question.status === 'ANSWERED'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                    )}>
                                        {question.status === 'ANSWERED' ? 'Answered' : 'Open'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {questions?.content.length === 0 && (
                <div className="p-8 text-center text-slate-400">No questions found</div>
            )}
        </div>
    );
}

// Leaderboard Tab
function LeaderboardTab({ leaderboard, isLoading }: { leaderboard?: any[]; isLoading: boolean }) {
    if (isLoading) return <TableSkeleton />;

    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-medium">Weekly Leaderboard</h3>
            </div>
            <div className="divide-y divide-white/5">
                {leaderboard?.map((user, index) => (
                    <div key={user.id || index} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                        <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                            index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                index === 1 ? 'bg-slate-400/20 text-slate-300' :
                                    index === 2 ? 'bg-amber-600/20 text-amber-500' :
                                        'bg-white/5 text-slate-400'
                        )}>
                            {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center font-semibold text-white">
                            {user.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <div className="font-medium">{user.displayName || 'Unknown User'}</div>
                            <div className="text-sm text-slate-400">{user.reputationPoints || 0} points</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium text-primary">{user.rank || `#${index + 1}`}</div>
                        </div>
                    </div>
                ))}
                {(!leaderboard || leaderboard.length === 0) && (
                    <div className="p-8 text-center text-slate-400">No leaderboard data available</div>
                )}
            </div>
        </div>
    );
}

// Helper Components
function StatCard({
    icon,
    label,
    value,
    color,
    bgColor
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
    bgColor: string;
}) {
    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', bgColor, color)}>
                {icon}
            </div>
            <div className={cn('text-2xl font-bold', color)}>{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    );
}

function ContentSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-white/10">
                {icon}
                <h3 className="font-medium">{title}</h3>
            </div>
            <div className="p-4">
                {children}
            </div>
        </div>
    );
}

function ContentItem({ title, subtitle, status }: { title: string; subtitle: string; status: string }) {
    return (
        <div className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{title}</div>
                <div className="text-xs text-slate-400">{subtitle}</div>
            </div>
            <span className={cn(
                'px-2 py-0.5 rounded-full text-xs whitespace-nowrap',
                status === 'Published' ? 'bg-green-500/20 text-green-400' :
                    status === 'Answered' ? 'bg-green-500/20 text-green-400' :
                        status === 'Draft' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
            )}>
                {status}
            </span>
        </div>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="py-8 text-center text-slate-400 text-sm">{message}</div>
    );
}

function ContentSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                    <div className="flex-1">
                        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-700 rounded w-1/2 mt-2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex gap-4">
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/6"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/6"></div>
                </div>
            ))}
        </div>
    );
}
