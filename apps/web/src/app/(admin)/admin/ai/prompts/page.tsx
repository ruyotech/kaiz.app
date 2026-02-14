'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getAdminAccessToken } from '@/lib/api';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  X,
  RefreshCw,
  Search,
} from 'lucide-react';
import * as commandCenterApi from '@/lib/api/command-center';
import type { SystemPrompt } from '@/types/command-center';

const categories = [
  'ALL',
  'COMMAND_CENTER',
  'COACH_CHAT',
  'SMART_INPUT',
  'TASK_CREATION',
  'SPRINT_PLANNING',
  'CHALLENGE_CREATION',
  'ANALYSIS',
  'ONBOARDING',
  'GENERAL',
] as const;

type CategoryFilter = typeof categories[number];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    promptKey: '',
    promptName: '',
    category: 'COMMAND_CENTER' as string,
    description: '',
    promptContent: '',
  });

  useEffect(() => { loadPrompts(); }, []);

  const loadPrompts = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllPrompts(token);
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = selectedCategory === 'ALL'
    ? prompts
    : prompts.filter((p) => p.category === selectedCategory);

  const handleOpenCreate = () => {
    setEditingPrompt(null);
    setFormData({ promptKey: '', promptName: '', category: 'COMMAND_CENTER', description: '', promptContent: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setFormData({
      promptKey: prompt.promptKey,
      promptName: prompt.promptName,
      category: prompt.category,
      description: prompt.description || '',
      promptContent: prompt.promptContent,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAdminAccessToken();
      if (!token) return;
      if (editingPrompt) {
        await commandCenterApi.updatePrompt(token, editingPrompt.id, formData);
      } else {
        await commandCenterApi.createPrompt(token, formData);
      }
      setShowModal(false);
      loadPrompts();
    } catch (error) {
      console.error('Failed to save prompt:', error);
      alert('Failed to save prompt. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.deletePrompt(token, id);
      loadPrompts();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-teal-500/20">
          <MessageSquare className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">System Prompts</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage AI system prompts and instructions
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-6 space-y-6">
        {/* Category filter */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  selectedCategory === cat
                    ? 'bg-primary/20 text-primary'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                )}
              >
                {cat.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Prompt
          </button>
        </div>

        {/* Prompt list */}
        <div className="space-y-3">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No prompts found{selectedCategory !== 'ALL' ? ` in ${selectedCategory.replace(/_/g, ' ')}` : ''}</p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="p-4 rounded-lg bg-slate-800/30 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{prompt.promptName}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 shrink-0">
                        {prompt.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 font-mono">{prompt.promptKey}</p>
                    {prompt.description && (
                      <p className="text-sm text-slate-400 mb-2">{prompt.description}</p>
                    )}
                    <p className="text-xs text-slate-500 line-clamp-2 font-mono bg-slate-800/50 rounded p-2">
                      {prompt.promptContent}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button onClick={() => handleOpenEdit(prompt)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(prompt.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editingPrompt ? 'Edit Prompt' : 'Create Prompt'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Prompt Key</label>
                  <input
                    type="text"
                    placeholder="e.g., coach_chat_system"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg font-mono text-sm"
                    value={formData.promptKey}
                    onChange={(e) => setFormData({ ...formData, promptKey: e.target.value })}
                    disabled={!!editingPrompt}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Prompt Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Coach Chat System Prompt"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                    value={formData.promptName}
                    onChange={(e) => setFormData({ ...formData, promptName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.filter((c) => c !== 'ALL').map((cat) => (
                      <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Prompt Content</label>
                <textarea
                  rows={12}
                  placeholder="Enter the system prompt content..."
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm font-mono resize-y"
                  value={formData.promptContent}
                  onChange={(e) => setFormData({ ...formData, promptContent: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/5">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.promptKey || !formData.promptName || !formData.promptContent}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                {editingPrompt ? 'Save Changes' : 'Create Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
