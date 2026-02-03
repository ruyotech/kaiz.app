'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
    bulkImportKnowledgeItems,
} from '@/lib/api/content';

import '@/app/(admin)/admin/content/knowledge-hub/styles.css';

// Bulk Upload Types
interface ParsedKnowledgeItem {
    categorySlug: string;
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
    errors: string[];
}

type BulkUploadMode = 'none' | 'csv' | 'preview';

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

// CSV headers for knowledge items template
const CSV_HEADERS = [
    'category_slug',
    'slug',
    'title',
    'summary',
    'content',
    'difficulty',
    'read_time_minutes',
    'tags',
    'icon',
    'status',
    'featured',
    'display_order',
    'search_keywords',
];

// Sample CSV rows for template
const CSV_SAMPLE_ROWS = [
    ['sensai', 'getting-started-with-sensai', 'Getting Started with SensAI', 'Learn the basics of your AI life coach', 'SensAI is your personal AI assistant that helps you stay on track with your goals...', 'BEGINNER', '3', 'sensai,ai,coaching', '🤖', 'PUBLISHED', 'true', '1', 'sensai beginner introduction'],
    ['task', 'creating-effective-tasks', 'Creating Effective Tasks', 'Master the art of task creation', 'Good task management starts with clear, actionable tasks. Here\'s how to create them...', 'BEGINNER', '2', 'task,productivity', '✅', 'PUBLISHED', 'false', '2', 'task create new'],
    ['pomodoro', 'mastering-focus-time', 'Mastering Focus Time', 'Use Pomodoro technique for deep work', 'The Pomodoro Technique is a time management method that uses a timer...', 'INTERMEDIATE', '4', 'pomodoro,focus,productivity', '🍅', 'DRAFT', 'false', '1', 'pomodoro timer focus'],
];

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

    // Bulk upload state
    const [bulkUploadMode, setBulkUploadMode] = useState<BulkUploadMode>('none');
    const [parsedItems, setParsedItems] = useState<ParsedKnowledgeItem[]>([]);
    const [isBulkImporting, setIsBulkImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const token = (session as any)?.accessToken || '';

    // CSV parsing functions
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const parseCSV = (content: string): ParsedKnowledgeItem[] => {
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/['"]/g, ''));
        const items: ParsedKnowledgeItem[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const errors: string[] = [];

            const getValue = (header: string): string => {
                const index = headers.indexOf(header);
                return index >= 0 && values[index] ? values[index].replace(/^["']|["']$/g, '') : '';
            };

            const categorySlug = getValue('category_slug');
            const slug = getValue('slug');
            const title = getValue('title');
            const summary = getValue('summary');
            const content = getValue('content');
            const difficulty = getValue('difficulty').toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
            const readTimeMinutes = parseInt(getValue('read_time_minutes')) || 2;
            const tagsStr = getValue('tags');
            const icon = getValue('icon') || '📚';
            const status = getValue('status').toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
            const featured = getValue('featured').toLowerCase() === 'true';
            const displayOrder = parseInt(getValue('display_order')) || 0;
            const searchKeywords = getValue('search_keywords');

            // Validation
            if (!categorySlug) errors.push('Missing category_slug');
            if (!slug) errors.push('Missing slug');
            if (!title) errors.push('Missing title');
            if (!summary) errors.push('Missing summary');
            if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty)) {
                errors.push(`Invalid difficulty: ${difficulty}`);
            }
            if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
                errors.push(`Invalid status: ${status}`);
            }

            // Find category ID from slug
            const category = categories.find(c => c.slug === categorySlug);
            if (!category && categorySlug) {
                errors.push(`Unknown category: ${categorySlug}`);
            }

            items.push({
                categorySlug,
                slug,
                title,
                summary,
                content,
                difficulty: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty) ? difficulty : 'BEGINNER',
                readTimeMinutes,
                tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
                icon,
                status: ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status) ? status : 'DRAFT',
                featured,
                displayOrder,
                searchKeywords,
                errors,
            });
        }

        return items;
    };

    const downloadCsvTemplate = () => {
        const rows = [CSV_HEADERS, ...CSV_SAMPLE_ROWS];
        const csvContent = rows
            .map(row =>
                row.map(cell => {
                    const value = String(cell);
                    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'knowledge_hub_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const items = parseCSV(content);
            setParsedItems(items);
            setBulkUploadMode('preview');
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleBulkImport = async () => {
        if (!token) return;

        const validItems = parsedItems.filter(item => item.errors.length === 0);
        if (validItems.length === 0) {
            alert('No valid items to import');
            return;
        }

        setIsBulkImporting(true);
        try {
            // Map category slugs to IDs
            const itemsWithCategoryIds = validItems.map(item => {
                const category = categories.find(c => c.slug === item.categorySlug);
                return {
                    categoryId: category?.id || '',
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
                    searchKeywords: item.searchKeywords,
                };
            });

            await bulkImportKnowledgeItems(token, itemsWithCategoryIds);
            await loadData();
            resetBulkUpload();
            alert(`Successfully imported ${validItems.length} knowledge items!`);
        } catch (error) {
            console.error('Failed to bulk import:', error);
            alert('Failed to import items. Check console for details.');
        } finally {
            setIsBulkImporting(false);
        }
    };

    const resetBulkUpload = () => {
        setBulkUploadMode('none');
        setParsedItems([]);
    };

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
                    <div className="header-actions">
                        <button
                            className="secondary-button"
                            onClick={downloadCsvTemplate}
                            title="Download CSV template"
                        >
                            📥 Download Template
                        </button>
                        <button
                            className="secondary-button"
                            onClick={() => setBulkUploadMode('csv')}
                        >
                            📤 Bulk Upload
                        </button>
                        <button className="primary-button" onClick={() => handleOpenModal()}>
                            <span>+</span> Add Item
                        </button>
                    </div>
                </div>

                {/* Hidden file input for CSV upload */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    style={{ display: 'none' }}
                />
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

            {/* Bulk Upload Mode Selection Modal */}
            {bulkUploadMode === 'csv' && (
                <div className="modal-overlay" onClick={resetBulkUpload}>
                    <div className="modal-content bulk-upload-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📤 Bulk Upload Knowledge Items</h2>
                            <button className="modal-close" onClick={resetBulkUpload}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="bulk-upload-info">
                                <h3>CSV Format Instructions</h3>
                                <p>Upload a CSV file with the following columns:</p>
                                <ul className="csv-columns-list">
                                    <li><code>category_slug</code> - Category identifier (e.g., sensai, task, epic, pomodoro)</li>
                                    <li><code>slug</code> - URL-friendly identifier</li>
                                    <li><code>title</code> - Knowledge item title</li>
                                    <li><code>summary</code> - Brief description</li>
                                    <li><code>content</code> - Full content (markdown supported)</li>
                                    <li><code>difficulty</code> - BEGINNER, INTERMEDIATE, or ADVANCED</li>
                                    <li><code>read_time_minutes</code> - Estimated read time</li>
                                    <li><code>tags</code> - Comma-separated tags</li>
                                    <li><code>icon</code> - Emoji icon</li>
                                    <li><code>status</code> - DRAFT, PUBLISHED, or ARCHIVED</li>
                                    <li><code>featured</code> - true or false</li>
                                    <li><code>display_order</code> - Sort order number</li>
                                    <li><code>search_keywords</code> - Additional search terms</li>
                                </ul>
                                <p className="template-note">
                                    💡 <strong>Tip:</strong> Download the template to see the exact format with sample data.
                                </p>
                            </div>
                            <div className="bulk-upload-actions">
                                <button className="secondary-button" onClick={downloadCsvTemplate}>
                                    📥 Download CSV Template
                                </button>
                                <button
                                    className="primary-button"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    📂 Select CSV File
                                </button>
                            </div>
                            <div className="available-categories">
                                <h4>Available Category Slugs:</h4>
                                <div className="category-slugs">
                                    {categories.map(cat => (
                                        <span key={cat.id} className="category-slug-tag">
                                            {cat.icon} {cat.slug}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-button" onClick={resetBulkUpload}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Upload Preview Modal */}
            {bulkUploadMode === 'preview' && (
                <div className="modal-overlay" onClick={resetBulkUpload}>
                    <div className="modal-content bulk-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>📋 Preview Import ({parsedItems.length} items)</h2>
                            <button className="modal-close" onClick={resetBulkUpload}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="import-summary">
                                <div className="summary-stat valid">
                                    ✅ Valid: {parsedItems.filter(i => i.errors.length === 0).length}
                                </div>
                                <div className="summary-stat invalid">
                                    ❌ Invalid: {parsedItems.filter(i => i.errors.length > 0).length}
                                </div>
                            </div>
                            <div className="parsed-items-list">
                                {parsedItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`parsed-item ${item.errors.length > 0 ? 'has-errors' : 'valid'}`}
                                    >
                                        <div className="parsed-item-header">
                                            <span className="parsed-item-icon">{item.icon}</span>
                                            <span className="parsed-item-title">{item.title || `Row ${index + 1}`}</span>
                                            <span className="parsed-item-category">{item.categorySlug}</span>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: difficultyConfig[item.difficulty]?.bg || '#f3f4f6',
                                                    color: difficultyConfig[item.difficulty]?.color || '#6b7280',
                                                }}
                                            >
                                                {item.difficulty}
                                            </span>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor: statusConfig[item.status]?.bg || '#f3f4f6',
                                                    color: statusConfig[item.status]?.color || '#6b7280',
                                                }}
                                            >
                                                {item.status}
                                            </span>
                                        </div>
                                        {item.errors.length > 0 && (
                                            <div className="parsed-item-errors">
                                                {item.errors.map((error, ei) => (
                                                    <span key={ei} className="error-tag">⚠️ {error}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="parsed-item-summary">{item.summary}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-button" onClick={resetBulkUpload}>
                                Cancel
                            </button>
                            <button
                                className="secondary-button"
                                onClick={() => setBulkUploadMode('csv')}
                            >
                                ← Back
                            </button>
                            <button
                                className="primary-button"
                                onClick={handleBulkImport}
                                disabled={isBulkImporting || parsedItems.filter(i => i.errors.length === 0).length === 0}
                            >
                                {isBulkImporting
                                    ? 'Importing...'
                                    : `Import ${parsedItems.filter(i => i.errors.length === 0).length} Items`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
