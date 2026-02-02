'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, ArticleResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
    FileText,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Calendar,
    MoreVertical,
} from 'lucide-react';

export default function ArticlesPage() {
    const router = useRouter();
    const [articles, setArticles] = useState<ArticleResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getAllArticles();
            if (res) {
                setArticles(res);
            }
        } catch (error) {
            console.error('Failed to fetch articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;
        try {
            await adminApi.deleteArticle(id);
            setArticles(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Failed to delete article:', error);
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Articles</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your blog posts and articles
                    </p>
                </div>
                <button
                    onClick={() => router.push('/admin/content/articles/create')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Article
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Content Table */}
            <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 text-left bg-slate-800/30">
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Title</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Category</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Views</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400">Published</th>
                            <th className="px-6 py-4 text-sm font-medium text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-3/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-1/2"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 bg-white/5 rounded-full w-20"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-24"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : filteredArticles.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <FileText className="w-12 h-12 text-slate-700" />
                                        <p>No articles found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredArticles.map((article) => (
                                <tr key={article.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                {article.coverImageUrl ? (
                                                    <img src={article.coverImageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <FileText className="w-5 h-5 text-slate-600" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white group-hover:text-primary transition-colors">
                                                    {article.title}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">by {article.author || 'Admin'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                                            {article.category || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={cn(
                                                'text-xs px-2 py-1 rounded-full font-medium',
                                                article.status === 'PUBLISHED'
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                            )}
                                        >
                                            {article.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                                            <Eye className="w-3.5 h-3.5" />
                                            {article.viewCount?.toLocaleString() || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {article.publishedAt ? (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(article.publishedAt).toLocaleDateString()}
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => router.push(`/admin/content/articles/${article.slug}`)} // Using slug for edit URL
                                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
