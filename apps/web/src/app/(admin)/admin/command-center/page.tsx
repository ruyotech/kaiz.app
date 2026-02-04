'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { getAdminAccessToken } from '@/lib/api';
import {
  Bot,
  Brain,
  FileText,
  Settings,
  ToggleLeft,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Download,
  Eye,
  AlertTriangle,
  Sparkles,
  Image,
  FileAudio,
  File,
} from 'lucide-react';
import * as commandCenterApi from '@/lib/api/command-center';
import type {
  LlmProvider,
  SystemPrompt,
  TestAttachment,
  CommandCenterSetting,
  FeatureFlag,
} from '@/types/command-center';

type Tab = 'providers' | 'prompts' | 'attachments' | 'settings' | 'flags';

export default function CommandCenterAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('providers');

  const tabs = [
    { id: 'providers' as Tab, label: 'LLM Providers', icon: Brain },
    { id: 'prompts' as Tab, label: 'System Prompts', icon: FileText },
    { id: 'attachments' as Tab, label: 'Test Attachments', icon: Upload },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'flags' as Tab, label: 'Feature Flags', icon: ToggleLeft },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Command Center Settings</h1>
            <p className="text-slate-400 text-sm mt-1">
              Configure AI providers, prompts, and test data for Command Center
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10">
        {activeTab === 'providers' && <ProvidersTab />}
        {activeTab === 'prompts' && <PromptsTab />}
        {activeTab === 'attachments' && <AttachmentsTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'flags' && <FeatureFlagsTab />}
      </div>
    </div>
  );
}

// =============== LLM Providers Tab ===============
function ProvidersTab() {
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<LlmProvider>>({});
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    providerName: '',
    displayName: '',
    providerType: 'ANTHROPIC' as LlmProvider['providerType'],
    apiBaseUrl: '',
    apiKeyReference: '',
    defaultModel: 'claude-3-5-sonnet-20241022',
    maxTokens: 4096,
    temperature: 0.7,
    rateLimitRpm: 60,
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllProviders(token);
      setProviders(data);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.setDefaultProvider(token, id);
      loadProviders();
    } catch (error) {
      console.error('Failed to set default provider:', error);
    }
  };

  const handleToggleActive = async (provider: LlmProvider) => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.updateProvider(token, provider.id, {
        isActive: !provider.isActive,
      });
      loadProviders();
    } catch (error) {
      console.error('Failed to toggle provider:', error);
    }
  };

  const handleStartEdit = (provider: LlmProvider) => {
    setEditingId(provider.id);
    setEditForm({
      defaultModel: provider.defaultModel,
      temperature: provider.temperature,
      maxTokens: provider.maxTokens,
      rateLimitRpm: provider.rateLimitRpm,
    });
  };

  const handleSaveEdit = async (providerId: string) => {
    try {
      setSaving(true);
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.updateProvider(token, providerId, editForm);
      setEditingId(null);
      setEditForm({});
      loadProviders();
    } catch (error) {
      console.error('Failed to save provider:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleCreateProvider = async () => {
    try {
      setSaving(true);
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.createProvider(token, createForm);
      setShowCreateModal(false);
      setCreateForm({
        providerName: '',
        displayName: '',
        providerType: 'ANTHROPIC',
        apiBaseUrl: '',
        apiKeyReference: '',
        defaultModel: 'claude-3-5-sonnet-20241022',
        maxTokens: 4096,
        temperature: 0.7,
        rateLimitRpm: 60,
      });
      loadProviders();
    } catch (error) {
      console.error('Failed to create provider:', error);
      alert('Failed to create provider. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.deleteProvider(token, id);
      loadProviders();
    } catch (error) {
      console.error('Failed to delete provider:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">LLM Providers</h2>
          <p className="text-sm text-slate-400">
            Configure AI model providers for Command Center
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Provider
        </button>
      </div>

      <div className="space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={cn(
              'p-4 rounded-lg border transition-all',
              provider.isDefault
                ? 'bg-primary/5 border-primary/30'
                : 'bg-slate-800/30 border-white/10'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'p-2 rounded-lg',
                    provider.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  )}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{provider.displayName}</h3>
                    {provider.isDefault && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                        Default
                      </span>
                    )}
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        provider.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      )}
                    >
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {provider.providerType} • Model: {provider.defaultModel}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                    <span>Max Tokens: {provider.maxTokens}</span>
                    <span>Temp: {provider.temperature}</span>
                    {provider.rateLimitRpm && (
                      <span>Rate: {provider.rateLimitRpm} RPM</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!provider.isDefault && provider.isActive && (
                  <button
                    onClick={() => handleSetDefault(provider.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleToggleActive(provider)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    provider.isActive
                      ? 'hover:bg-red-500/10 text-red-400'
                      : 'hover:bg-green-500/10 text-green-400'
                  )}
                  title={provider.isActive ? 'Deactivate' : 'Activate'}
                >
                  <ToggleLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleStartEdit(provider)}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteProvider(provider.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* API Key Input (shown when editing) */}
            {editingId === provider.id && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Default Model
                    </label>
                    <select
                      className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                      value={editForm.defaultModel || ''}
                      onChange={(e) => setEditForm({ ...editForm, defaultModel: e.target.value })}
                    >
                      {provider.providerType === 'ANTHROPIC' && (
                        <>
                          <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                          <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                        </>
                      )}
                      {provider.providerType === 'OPENAI' && (
                        <>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4o-mini">GPT-4o Mini</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                      value={editForm.temperature ?? 0.7}
                      onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                      value={editForm.maxTokens ?? 4096}
                      onChange={(e) => setEditForm({ ...editForm, maxTokens: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">
                      Rate Limit (RPM)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                      value={editForm.rateLimitRpm ?? ''}
                      onChange={(e) => setEditForm({ ...editForm, rateLimitRpm: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm rounded-lg hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(provider.id)}
                    disabled={saving}
                    className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="font-medium text-blue-400">Provider Configuration</div>
            <div className="text-sm text-slate-400 mt-1">
              API keys are stored securely in GCP Secret Manager. The default provider is used
              for all Command Center AI operations. You can switch providers without changing code.
            </div>
          </div>
        </div>
      </div>

      {/* Create Provider Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold">Add New LLM Provider</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Provider Name (unique key)</label>
                  <input
                    type="text"
                    placeholder="e.g., anthropic_primary"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.providerName}
                    onChange={(e) => setCreateForm({ ...createForm, providerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Anthropic Claude"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.displayName}
                    onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Provider Type</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.providerType}
                    onChange={(e) => setCreateForm({ ...createForm, providerType: e.target.value as LlmProvider['providerType'] })}
                  >
                    <option value="ANTHROPIC">Anthropic (Claude)</option>
                    <option value="OPENAI">OpenAI (GPT)</option>
                    <option value="GOOGLE">Google (Gemini)</option>
                    <option value="AZURE_OPENAI">Azure OpenAI</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Default Model</label>
                  <input
                    type="text"
                    placeholder="e.g., claude-3-5-sonnet-20241022"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.defaultModel}
                    onChange={(e) => setCreateForm({ ...createForm, defaultModel: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">API Base URL (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., https://api.anthropic.com"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                  value={createForm.apiBaseUrl}
                  onChange={(e) => setCreateForm({ ...createForm, apiBaseUrl: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">API Key Reference (GCP Secret name)</label>
                <input
                  type="text"
                  placeholder="e.g., anthropic-api-key"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                  value={createForm.apiKeyReference}
                  onChange={(e) => setCreateForm({ ...createForm, apiKeyReference: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.maxTokens}
                    onChange={(e) => setCreateForm({ ...createForm, maxTokens: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.temperature}
                    onChange={(e) => setCreateForm({ ...createForm, temperature: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rate Limit (RPM)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={createForm.rateLimitRpm}
                    onChange={(e) => setCreateForm({ ...createForm, rateLimitRpm: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProvider}
                disabled={saving || !createForm.providerName || !createForm.displayName}
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                Create Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== System Prompts Tab ===============
function PromptsTab() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<{
    promptKey: string;
    promptName: string;
    promptCategory: SystemPrompt['promptCategory'];
    promptContent: string;
    description: string;
  }>({
    promptKey: '',
    promptName: '',
    promptCategory: 'COMMAND_CENTER',
    promptContent: '',
    description: '',
  });

  const categories: Array<'ALL' | SystemPrompt['promptCategory']> = [
    'ALL',
    'COMMAND_CENTER',
    'SENSAI_CHAT',
    'IMAGE_ANALYSIS',
    'VOICE_TRANSCRIPTION',
    'DRAFT_GENERATION',
    'CLARIFICATION',
    'TASK_SUGGESTION',
    'CHALLENGE_SUGGESTION',
  ];

  useEffect(() => {
    loadPrompts();
  }, []);

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

  const handleCreate = async () => {
    try {
      setSaving(true);
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.createPrompt(token, formData);
      setShowCreateModal(false);
      resetForm();
      loadPrompts();
    } catch (error) {
      console.error('Failed to create prompt:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingPrompt) return;
    try {
      setSaving(true);
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.updatePrompt(token, editingPrompt.id, formData);
      setEditingPrompt(null);
      resetForm();
      loadPrompts();
    } catch (error) {
      console.error('Failed to update prompt:', error);
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

  const handleEdit = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setFormData({
      promptKey: prompt.promptKey,
      promptName: prompt.promptName,
      promptCategory: prompt.promptCategory,
      promptContent: prompt.promptContent,
      description: prompt.description || '',
    });
  };

  const resetForm = () => {
    setFormData({
      promptKey: '',
      promptName: '',
      promptCategory: 'COMMAND_CENTER' as SystemPrompt['promptCategory'],
      promptContent: '',
      description: '',
    });
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingPrompt(null);
    resetForm();
  };

  const filteredPrompts =
    selectedCategory === 'ALL'
      ? prompts
      : prompts.filter((p) => p.promptCategory === selectedCategory);

  const showModal = showCreateModal || editingPrompt;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">System Prompts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prompt
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-colors',
              selectedCategory === cat
                ? 'bg-primary/20 text-primary'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            )}
          >
            {cat.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Prompts List */}
      <div className="space-y-4">
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No prompts in this category</p>
            <p className="text-sm mt-1">
              Add a new prompt to customize AI behavior
            </p>
          </div>
        ) : (
          filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="p-4 bg-slate-800/30 rounded-lg border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{prompt.promptName}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                      {prompt.promptCategory}
                    </span>
                    <span className="text-xs text-slate-500">v{prompt.version}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{prompt.description}</p>
                  <div className="mt-3">
                    <pre className="text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg overflow-x-auto max-h-32">
                      {prompt.promptContent.substring(0, 300)}
                      {prompt.promptContent.length > 300 && '...'}
                    </pre>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(prompt)}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(prompt.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold">
                {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Prompt Key</label>
                  <input
                    type="text"
                    placeholder="e.g., smart_input_system"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={formData.promptKey}
                    onChange={(e) => setFormData({ ...formData, promptKey: e.target.value })}
                    disabled={!!editingPrompt}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Prompt Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Smart Input System Prompt"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                    value={formData.promptName}
                    onChange={(e) => setFormData({ ...formData, promptName: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                  value={formData.promptCategory}
                  onChange={(e) => setFormData({ ...formData, promptCategory: e.target.value as SystemPrompt['promptCategory'] })}
                >
                  {categories.filter(c => c !== 'ALL').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Brief description of this prompt"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Prompt Content</label>
                <textarea
                  rows={12}
                  placeholder="Enter the system prompt content..."
                  className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg font-mono text-sm"
                  value={formData.promptContent}
                  onChange={(e) => setFormData({ ...formData, promptContent: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={editingPrompt ? handleUpdate : handleCreate}
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

// =============== Test Attachments Tab ===============
function AttachmentsTab() {
  const [attachments, setAttachments] = useState<TestAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAttachments();
  }, []);

  const loadAttachments = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllTestAttachments(token);
      setAttachments(data);
    } catch (error) {
      console.error('Failed to load attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const token = getAdminAccessToken();
      if (!token) {
        alert('Not authenticated. Please log in again.');
        return;
      }

      // Determine attachment type from file
      let attachmentType: 'IMAGE' | 'AUDIO' | 'PDF' | 'DOCUMENT' = 'DOCUMENT';
      if (file.type.startsWith('image/')) attachmentType = 'IMAGE';
      else if (file.type.startsWith('audio/')) attachmentType = 'AUDIO';
      else if (file.type === 'application/pdf') attachmentType = 'PDF';

      await commandCenterApi.createTestAttachment(
        token,
        {
          attachmentName: file.name,
          attachmentType: attachmentType,
          mimeType: file.type,
          description: '',
          useCase: 'general',
        },
        file
      );
      loadAttachments();
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      alert(`Failed to upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.deleteTestAttachment(token, id);
      loadAttachments();
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'IMAGE':
        return <Image className="w-5 h-5" />;
      case 'AUDIO':
        return <FileAudio className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Test Attachments</h2>
          <p className="text-sm text-slate-400 mt-1">
            Pre-uploaded files for testing in simulator (no camera/mic access)
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Uploading...' : 'Upload Attachment'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*,application/pdf"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer"
      >
        <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <p className="text-slate-400">
          Drag & drop files here, or click to browse
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Supports: Images (JPG, PNG), PDFs, Audio files (MP3, WAV)
        </p>
      </div>

      {/* Attachments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="p-4 bg-slate-800/30 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-700 text-slate-400">
                {getIcon(attachment.attachmentType)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{attachment.attachmentName}</h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{attachment.attachmentType}</span>
                  <span>•</span>
                  <span>{formatFileSize(attachment.fileSizeBytes)}</span>
                </div>
                {attachment.useCase && (
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {attachment.useCase}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/5 text-slate-400 text-sm">
                <Eye className="w-3 h-3" />
                Preview
              </button>
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/5 text-slate-400 text-sm">
                <Download className="w-3 h-3" />
                Download
              </button>
              <button
                onClick={() => handleDelete(attachment.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {attachments.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No test attachments uploaded</p>
          <p className="text-sm mt-1">
            Upload images, PDFs, or audio files for testing
          </p>
        </div>
      )}

      {/* Use Cases Info */}
      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <div className="font-medium text-yellow-500">Test Attachment Use Cases</div>
            <div className="text-sm text-slate-400 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>calendar_screenshot</strong> - Calendar/meeting screenshots for event extraction</li>
                <li><strong>receipt</strong> - Receipt images for bill creation</li>
                <li><strong>business_card</strong> - Contact cards for data extraction</li>
                <li><strong>voice_memo</strong> - Audio recordings for transcription testing</li>
                <li><strong>handwritten_note</strong> - Handwritten text for OCR testing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============== Settings Tab ===============
function SettingsTab() {
  const [settings, setSettings] = useState<CommandCenterSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllSettings(token);
      setSettings(data);
      // Initialize edited values with current values
      const initial: Record<string, string> = {};
      data.forEach((s: CommandCenterSetting) => {
        initial[s.id] = s.settingValue;
      });
      setEditedValues(initial);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (id: string, value: string) => {
    setEditedValues({ ...editedValues, [id]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAdminAccessToken();
      if (!token) return;

      // Update each setting that has changed
      const promises = settings.map(async (setting) => {
        const newValue = editedValues[setting.id];
        if (newValue !== setting.settingValue) {
          return commandCenterApi.updateSetting(token, setting.id, {
            settingValue: newValue,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      loadSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Command Center Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.id}
            className="p-4 bg-slate-800/30 rounded-lg border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">
                  {setting.settingKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </label>
                <p className="text-sm text-slate-400 mt-0.5">{setting.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {setting.settingType === 'BOOLEAN' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={editedValues[setting.id] === 'true'}
                      onChange={(e) => handleValueChange(setting.id, e.target.checked ? 'true' : 'false')}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                ) : setting.settingType === 'NUMBER' ? (
                  <input
                    type="number"
                    value={editedValues[setting.id] || ''}
                    onChange={(e) => handleValueChange(setting.id, e.target.value)}
                    className="w-24 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-right"
                  />
                ) : (
                  <input
                    type={setting.isSecret ? 'password' : 'text'}
                    value={editedValues[setting.id] || ''}
                    onChange={(e) => handleValueChange(setting.id, e.target.value)}
                    className="w-64 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== Feature Flags Tab ===============
function FeatureFlagsTab() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllFeatureFlags(token);
      setFlags(data);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.updateFeatureFlag(token, flag.flagKey, {
        isEnabled: !flag.isEnabled,
      });
      loadFlags();
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Feature Flags</h2>
          <p className="text-sm text-slate-400 mt-1">
            Enable or disable Command Center features
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className={cn(
              'p-4 rounded-lg border transition-colors',
              flag.isEnabled
                ? 'bg-green-500/5 border-green-500/20'
                : 'bg-slate-800/30 border-white/10'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ToggleLeft
                  className={cn(
                    'w-5 h-5',
                    flag.isEnabled ? 'text-green-400' : 'text-slate-400'
                  )}
                />
                <div>
                  <h4 className="font-medium">{flag.flagName}</h4>
                  <p className="text-sm text-slate-400">{flag.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100 && (
                  <div className="text-right">
                    <span className="text-sm text-slate-400">Rollout</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${flag.rolloutPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">
                        {flag.rolloutPercentage}%
                      </span>
                    </div>
                  </div>
                )}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={flag.isEnabled}
                    onChange={() => handleToggle(flag)}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
