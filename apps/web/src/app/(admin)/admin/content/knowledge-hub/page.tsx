'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { KnowledgeCategory, KnowledgeItem } from '@/types/content';
import {
    getAdminKnowledgeCategories,
    getAdminKnowledgeItems,
    createKnowledgeItem,
    updateKnowledgeItem,
    deleteKnowledgeItem,
    updateKnowledgeItemStatus,
} from '@/lib/api/content';

import '@/app/(admin)/admin/content/knowledge-hub/styles.css';

interface ItemFormData {
    categoryId: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    readTimeMinutes: number;
    tags: string[];
    icon: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    featured: boolean;
    displayOrder: number;
    searchKeywords: string;
}

const defaultFormData: ItemFormData = {
    categoryId: '',
    slug: '',
    title: '',
    summary: '',
    content: '',
    difficulty: 'BEGINNER',
    readTimeMinutes: 2,
    tags: [],
    icon: '📚',
    status: 'DRAFT',
    featured: false,
    displayOrder: 0,
    searchKeywords: '',
};

const difficultyConfig = {
    BEGINNER: { label: 'Beginner', color: '#22c55e', bg: '#dcfce7', icon: '🌱' },
    INTERMEDIATE: { label: 'Intermediate', color: '#f59e0b', bg: '#fef3c7', icon: '⚡' },
    ADVANCED: { label: 'Advanced', color: '#ef4444', bg: '#fee2e2', icon: '🔥' },
};

const statusConfig = {
    DRAFT: { label: 'Draft', color: '#6b7280', bg: '#f3f4f6' },
    PUBLISHED: { label: 'Published', color: '#22c55e', bg: '#dcfce7' },
    ARCHIVED: { label: 'Archived', color: '#ef4444', bg: '#fee2e2' },
};

export default function KnowledgeHubPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [categories, setCategories] = useState<KnowledgeCategory[]>([]);
    const [items, setItems] = useState<KnowledgeItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);
    const [formData, setFormData] = useState<ItemFormData>(defaultFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [tagsInput, setTagsInput] = useState('');

    const token = (session as any)?.accessToken || '';

    const loadData = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const [categoriesData, itemsData] = await Promise.all([
                getAdminKnowledgeCategories(token),
                getAdminKnowledgeItems(token, {
                    search: searchQuery || undefined,
                    categoryId: selectedCategory || undefined,
                }),
            ]);
            setCategories(categoriesData);
            setItems(itemsData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [token, searchQuery, selectedCategory]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleOpenModal = (item?: KnowledgeItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                categoryId: item.categoryId,
                slug: item.slug,
                title: item.title,
                summary: item.summary,
                content: item.content,
                difficulty: item.difficulty,
                readTimeMinutes: item.readTimeMinutes,
                tags: item.tags,
                icon: item.icon,
                status: item.status,
                featured: item.featured,
                displayOrder: item.displayOrder,
                searchKeywords: item.searchKeywords || '',
            });
            setTagsInput(item.tags.join(', '));
        } else {
            setEditingItem(null);
            setFormData({
                ...defaultFormData,
                categoryId: selectedCategory || categories[0]?.id || '',
            });
            setTagsInput('');
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingItem(null);
        setFormData(defaultFormData);
        setTagsInput('');
    };

    const handleSave = async () => {
        if (!token) return;
        setIsSaving(true);
        try {
            const itemData = {
                ...formData,
                tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
            };

            if (editingItem) {
                await updateKnowledgeItem(token, editingItem.id, itemData);
            } else {
                await createKnowledgeItem(token, itemData);
            }
            await loadData();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save item:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!token || !confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteKnowledgeItem(token, id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        if (!token) return;
        try {
            await updateKnowledgeItemStatus(token, id, status);
            await loadData();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const totalItems = items.length;
    const publishedItems = items.filter((i) => i.status === 'PUBLISHED').length;
    const totalViews = items.reduce((sum, i) => sum + i.viewCount, 0);
    const featuredItems = items.filter((i) => i.featured).length;

    return (
        <div className="knowledge-hub-container">
            {/* Header */}
            <div className="knowledge-hub-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="header-icon">📚</span>
                        <div>
                            <h1>Knowledge Hub</h1>
                            <p>Manage your KAIZ feature documentation</p>
                        </div>
                    </div>
                    <button className="primary-button" onClick={() => handleOpenModal()}>
                        <span>+</span> Add Knowledge Item
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon purple">📖</div>
                    <div className="stat-content">
                        <span className="stat-value">{totalItems}</span>
                        <span className="stat-label">Total Items</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div className="stat-content">
                        <span className="stat-value">{publishedItems}</span>
                        <span className="stat-label">Published</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">👀</div>
                    <div className="stat-content">
                        <span className="stat-value">{totalViews}</span>
                        <span className="stat-label">Total Views</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">⭐</div>
                    <div className="stat-content">
                        <span className="stat-value">{featuredItems}</span>
                        <span className="stat-label">Featured</span>
                    </div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
                <h3>Categories</h3>
                <div className="category-chips">
                    <button
                        className={`category-chip ${!selectedCategory ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All ({items.length})
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                            style={{ '--chip-color': cat.color } as any}
                        >
                            <span>{cat.icon}</span> {cat.name} ({cat.itemCount})
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search knowledge items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            {/* Items Grid */}
            {isLoading ? (
                <div className="loading-state">Loading...</div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📭</span>
                    <h3>No knowledge items found</h3>
                    <p>Create your first knowledge item to get started!</p>
                    <button className="primary-button" onClick={() => handleOpenModal()}>
                        Add Knowledge Item
                    </button>
                </div>
            ) : (
                <div className="items-grid">
                    {items.map((item) => (
                        <div key={item.id} className="item-card">
                            <div className="item-header">
                                <span className="item-icon">{item.icon}</span>
                                <div className="item-badges">
                                    {item.featured && <span className="badge featured">⭐ Featured</span>}
                                    <span
                                        className="badge difficulty"
                                        style={{
                                            backgroundColor: difficultyConfig[item.difficulty].bg,
                                            color: difficultyConfig[item.difficulty].color,
                                        }}
                                    >
                                        {difficultyConfig[item.difficulty].icon} {difficultyConfig[item.difficulty].label}
                                    </span>
                                    <span
                                        className="badge status"
                                        style={{
                                            backgroundColor: statusConfig[item.status].bg,
                                            color: statusConfig[item.status].color,
                                        }}
                                    >
                                        {statusConfig[item.status].label}
                                    </span>
                                </div>
                            </div>
                            <h3 className="item-title">{item.title}</h3>
                            <p className="item-summary">{item.summary}</p>
                            <div className="item-meta">
                                <span className="meta-item">🕐 {item.readTimeMinutes} min</span>
                                <span className="meta-item">👀 {item.viewCount}</span>
                                <span className="meta-item">👍 {item.helpfulCount}</span>
                            </div>
                            <div className="item-category">{item.categoryName}</div>
                            <div className="item-actions">
                                <button className="action-btn edit" onClick={() => handleOpenModal(item)}>
                                    Edit
                                </button>
                                <select
                                    className="action-select"
                                    value={item.status}
                                    onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="ARCHIVED">Archived</option>
                                </select>
                                <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Knowledge Item' : 'Create Knowledge Item'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                    >
                                        <option value="BEGINNER">🌱 Beginner</option>
                                        <option value="INTERMEDIATE">⚡ Intermediate</option>
                                        <option value="ADVANCED">🔥 Advanced</option>
                                    </select>
                                </div>
                                <div className="form-group full-width">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., How to Create Your First Sprint"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Slug</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g., how-to-create-first-sprint"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Icon</label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        placeholder="📚"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Read Time (min)</label>
                                    <input
                                        type="number"
                                        value={formData.readTimeMinutes}
                                        onChange={(e) => setFormData({ ...formData, readTimeMinutes: parseInt(e.target.value) || 2 })}
                                        min="1"
                                        max="60"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Summary</label>
                                    <textarea
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        placeholder="Brief description of what users will learn..."
                                        rows={2}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Content</label>
                                    <textarea
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Full knowledge article content (Markdown supported)..."
                                        rows={6}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        placeholder="e.g., sprint, planning, beginner"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Search Keywords</label>
                                    <input
                                        type="text"
                                        value={formData.searchKeywords}
                                        onChange={(e) => setFormData({ ...formData, searchKeywords: e.target.value })}
                                        placeholder="Additional keywords for search..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="PUBLISHED">Published</option>
                                        <option value="ARCHIVED">Archived</option>
                                    </select>
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        ⭐ Featured Item
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-button" onClick={handleCloseModal}>
                                Cancel
                            </button>
                            <button className="primary-button" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
