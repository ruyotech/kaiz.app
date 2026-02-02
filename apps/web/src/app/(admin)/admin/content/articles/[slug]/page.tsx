'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi, ArticleResponse, UpdateArticleRequest } from '@/lib/api';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Upload,
    X,
    Link as LinkIcon,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Quote,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { use } from 'react';

export default function EditArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const { slug } = use(params);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [articleId, setArticleId] = useState<string | null>(null);

    const [formData, setFormData] = useState<UpdateArticleRequest & { slug?: string }>({
        title: '',
        slug: '',
        summary: '',
        content: '',
        category: '',
        status: 'DRAFT',
        author: 'Admin',
        tags: [],
        featured: false,
        coverImageUrl: '',
    });

    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (slug) {
            fetchArticle(slug);
        }
    }, [slug]);

    const fetchArticle = async (slug: string) => {
        try {
            setFetching(true);
            const res = await adminApi.getArticleBySlug(slug);
            if (res) {
                setArticleId(res.id);
                setFormData({
                    title: res.title,
                    slug: res.slug,
                    summary: res.summary,
                    content: res.content,
                    category: res.category,
                    status: res.status as any,
                    author: res.author,
                    tags: res.tags,
                    featured: res.featured,
                    coverImageUrl: res.coverImageUrl,
                });
            }
        } catch (error) {
            console.error('Failed to fetch article', error);
            alert('Failed to load article');
            router.push('/admin/content/articles');
        } finally {
            setFetching(false);
        }
    };

    const handleTagAdd = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags?.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!articleId) return;

        try {
            setLoading(true);
            // Slug updates might require separate handling if backend doesn't support it in updateArticle DTO directly or if ID is used.
            // Our UpdateArticleRequest doesn't have slug? Let's check DTO.
            // AdminDtos.java: UpdateArticleRequest has title, summary, content... NO slug.
            // So slug cannot be updated via this endpoint currently.
            // I will disable slug editing for now or I would need to update backend.
            // Assuming for now slug is immutable after creation or needs specific endpoint.

            const updateData: UpdateArticleRequest = {
                title: formData.title,
                summary: formData.summary,
                content: formData.content,
                category: formData.category,
                status: formData.status,
                author: formData.author,
                tags: formData.tags,
                featured: formData.featured,
                coverImageUrl: formData.coverImageUrl,
            };

            await adminApi.updateArticle(articleId, updateData);
            router.push('/admin/content/articles');
        } catch (error) {
            console.error('Failed to update article', error);
            alert('Failed to update article');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold">Edit Article</h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-white/10">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Article title"
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Slug (Read Only)</label>
                            <div className="flex items-center bg-slate-800/30 border border-white/10 rounded-lg px-4 opacity-70 cursor-not-allowed">
                                <span className="text-slate-500 text-sm whitespace-nowrap border-r border-white/10 pr-3 mr-3">
                                    /articles/
                                </span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    readOnly
                                    className="w-full py-3 bg-transparent text-slate-400 focus:outline-none text-sm font-mono cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Summary</label>
                            <textarea
                                value={formData.summary || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                placeholder="Brief summary for SEO and previews..."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-400">Content</label>
                        <div className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 p-2 bg-slate-800/80 border-b border-white/10 sticky top-0 z-10 backdrop-blur">
                                <ToolbarButton icon={Bold} />
                                <ToolbarButton icon={Italic} />
                                <ToolbarButton icon={Underline} />
                                <div className="w-px h-5 bg-white/10 mx-1" />
                                <ToolbarButton icon={List} />
                                <ToolbarButton icon={ListOrdered} />
                                <ToolbarButton icon={Quote} />
                                <div className="w-px h-5 bg-white/10 mx-1" />
                                <ToolbarButton icon={ImageIcon} />
                                <ToolbarButton icon={LinkIcon} />
                            </div>
                            <textarea
                                value={formData.content || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                className="flex-1 w-full p-6 bg-transparent text-white placeholder:text-slate-600 focus:outline-none resize-none font-mono text-sm leading-relaxed"
                                placeholder="Write your article content in Markdown or HTML..."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-white/10 space-y-6 sticky top-24">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Publishing</label>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                    <span className="text-sm text-slate-300">Status</span>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                        className="bg-transparent text-sm font-medium text-primary focus:outline-none cursor-pointer"
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                                <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-white/5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.featured}
                                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-primary focus:ring-primary/50"
                                    />
                                    <span className="text-sm text-slate-300">Featured Article</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
                            <input
                                type="text"
                                value={formData.category || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                placeholder="Add category"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {formData.tags?.map(tag => (
                                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagAdd}
                                placeholder="Press Enter to add tag"
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Cover Image</label>
                            <div className="border-2 border-dashed border-white/10 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-slate-800/20 group">
                                {formData.coverImageUrl ? (
                                    <div className="relative w-full aspect-video">
                                        <img src={formData.coverImageUrl} alt="Cover" className="w-full h-full object-cover rounded" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData(prev => ({ ...prev, coverImageUrl: '' }));
                                            }}
                                            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70 text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-slate-500 mb-2 group-hover:text-primary transition-colors" />
                                        <p className="text-xs text-slate-500 text-center">Click to upload or drag image</p>
                                    </>
                                )}
                            </div>
                            <input
                                type="text"
                                value={formData.coverImageUrl || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))}
                                placeholder="Or enter image URL..."
                                className="mt-2 w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded text-xs text-slate-400 focus:outline-none focus:border-primary/50"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ icon: Icon, onClick }: { icon: any, onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}
