'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  FileText,
  BookOpen,
  MessageCircle,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Image,
  Video,
} from 'lucide-react';

type ContentType = 'articles' | 'knowledge' | 'faq';

interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: 'PUBLISHED' | 'DRAFT';
  category: string;
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<ContentType>('articles');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const tabs = [
    { id: 'articles' as ContentType, label: 'Articles', icon: FileText, count: 24 },
    { id: 'knowledge' as ContentType, label: 'Knowledge Hub', icon: BookOpen, count: 56 },
    { id: 'faq' as ContentType, label: 'FAQs', icon: MessageCircle, count: 18 },
  ];

  const mockItems: ContentItem[] = [
    {
      id: '1',
      title: 'Getting Started with Daily Planning',
      type: 'articles',
      status: 'PUBLISHED',
      category: 'Productivity',
      author: 'Admin',
      views: 1245,
      createdAt: '2024-01-15',
      updatedAt: '2024-02-01',
    },
    {
      id: '2',
      title: 'How to Set Effective Goals',
      type: 'articles',
      status: 'DRAFT',
      category: 'Goals',
      author: 'Admin',
      views: 0,
      createdAt: '2024-02-05',
      updatedAt: '2024-02-05',
    },
    {
      id: '3',
      title: 'Time Management Fundamentals',
      type: 'knowledge',
      status: 'PUBLISHED',
      category: 'Basics',
      author: 'Admin',
      views: 3421,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-20',
    },
    {
      id: '4',
      title: 'How do I start a challenge?',
      type: 'faq',
      status: 'PUBLISHED',
      category: 'Challenges',
      author: 'Support',
      views: 892,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
    },
  ];

  const filteredItems = mockItems.filter(
    (item) =>
      item.type === activeTab &&
      item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage articles, knowledge hub, and FAQs
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          New Content
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Content Table */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-sm font-medium text-slate-400">Title</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">Category</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">Views</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">Updated</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                  No content found
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <span className="font-medium">{item.title}</span>
                    <div className="text-xs text-slate-500 mt-1">by {item.author}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-400">{item.category}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        item.status === 'PUBLISHED'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      )}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-slate-300">{item.views.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        title={item.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      >
                        {item.status === 'PUBLISHED' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
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

      {/* Content Editor Modal */}
      {showModal && (
        <ContentEditorModal
          item={selectedItem}
          type={activeTab}
          onClose={() => {
            setShowModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}

function ContentEditorModal({
  item,
  type,
  onClose,
}: {
  item: ContentItem | null;
  type: ContentType;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState(item?.category || '');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>(item?.status || 'DRAFT');

  const isEditing = !!item;
  const typeLabels = {
    articles: 'Article',
    knowledge: 'Knowledge Hub Entry',
    faq: 'FAQ',
    mindset: 'Mindset Content',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">
            {isEditing ? `Edit ${typeLabels[type]}` : `Create ${typeLabels[type]}`}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title..."
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Category and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Productivity, Goals..."
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'PUBLISHED' | 'DRAFT')}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Content</label>
            <div className="border border-white/10 rounded-lg overflow-hidden">
              {/* Simple Toolbar */}
              <div className="flex items-center gap-1 p-2 bg-slate-800/50 border-b border-white/10">
                <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <span className="font-bold text-sm">B</span>
                </button>
                <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <span className="italic text-sm">I</span>
                </button>
                <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <span className="underline text-sm">U</span>
                </button>
                <div className="w-px h-5 bg-white/10 mx-1" />
                <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <Image className="w-4 h-4" />
                </button>
                <button className="p-2 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <Video className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Write your content here..."
                className="w-full px-4 py-3 bg-slate-800/30 text-white placeholder:text-slate-500 focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Featured Image</label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">
                Drag & drop or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-all"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
          >
            Save as Draft
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-medium transition-all">
            {status === 'PUBLISHED' ? 'Publish' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
