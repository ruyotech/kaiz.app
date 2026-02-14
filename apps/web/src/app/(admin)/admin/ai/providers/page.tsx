'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getAdminAccessToken } from '@/lib/api';
import {
  Brain,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import * as commandCenterApi from '@/lib/api/command-center';
import type { LlmProvider } from '@/types/command-center';

export default function ProvidersPage() {
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
    defaultModel: 'claude-sonnet-4-20250514',
    maxTokens: 4096,
    temperature: 0.7,
    rateLimitRpm: 60,
  });

  useEffect(() => { loadProviders(); }, []);

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
      await commandCenterApi.updateProvider(token, provider.id, { isActive: !provider.isActive });
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
        defaultModel: 'claude-sonnet-4-20250514',
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
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
          <Brain className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">LLM Providers</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure AI model providers for the Scrum Master
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{providers.length} provider{providers.length !== 1 ? 's' : ''} configured</p>
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
                provider.isDefault ? 'bg-primary/5 border-primary/30' : 'bg-slate-800/30 border-white/10'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-lg', provider.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400')}>
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{provider.displayName}</h3>
                      {provider.isDefault && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Default</span>
                      )}
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', provider.isActive ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400')}>
                        {provider.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      {provider.providerType} • Model: {provider.defaultModel}
                    </p>
                    {editingId !== provider.id && (
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>Temp: {provider.temperature}</span>
                        <span>Max tokens: {provider.maxTokens?.toLocaleString()}</span>
                        <span>Rate limit: {provider.rateLimitRpm} RPM</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!provider.isDefault && (
                    <button onClick={() => handleSetDefault(provider.id)} className="text-xs px-2 py-1 rounded hover:bg-white/5 text-slate-400">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => handleToggleActive(provider)} className="text-xs px-2 py-1 rounded hover:bg-white/5 text-slate-400">
                    {provider.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleStartEdit(provider)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteProvider(provider.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline edit */}
              {editingId === provider.id && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Model</label>
                      <input type="text" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm" value={editForm.defaultModel || ''} onChange={(e) => setEditForm({ ...editForm, defaultModel: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Temperature</label>
                      <input type="number" step="0.1" min="0" max="2" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm" value={editForm.temperature ?? ''} onChange={(e) => setEditForm({ ...editForm, temperature: parseFloat(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Max Tokens</label>
                      <input type="number" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm" value={editForm.maxTokens ?? ''} onChange={(e) => setEditForm({ ...editForm, maxTokens: parseInt(e.target.value) })} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rate Limit (RPM)</label>
                      <input type="number" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm" value={editForm.rateLimitRpm ?? ''} onChange={(e) => setEditForm({ ...editForm, rateLimitRpm: parseInt(e.target.value) })} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditingId(null); setEditForm({}); }} className="px-3 py-1.5 rounded-lg hover:bg-white/5 text-sm text-slate-400">Cancel</button>
                    <button onClick={() => handleSaveEdit(provider.id)} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm disabled:opacity-50">
                      {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add LLM Provider</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded hover:bg-white/5"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Provider Name</label>
                  <input type="text" placeholder="e.g., anthropic_main" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.providerName} onChange={(e) => setCreateForm({ ...createForm, providerName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Display Name</label>
                  <input type="text" placeholder="e.g., Anthropic (Claude)" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.displayName} onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Provider Type</label>
                  <select className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.providerType} onChange={(e) => setCreateForm({ ...createForm, providerType: e.target.value as LlmProvider['providerType'] })}>
                    <option value="ANTHROPIC">Anthropic</option>
                    <option value="OPENAI">OpenAI</option>
                    <option value="GOOGLE">Google</option>
                    <option value="AZURE_OPENAI">Azure OpenAI</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Default Model</label>
                  <input type="text" placeholder="e.g., claude-sonnet-4-20250514" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.defaultModel} onChange={(e) => setCreateForm({ ...createForm, defaultModel: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">API Base URL (optional)</label>
                <input type="text" placeholder="e.g., https://api.anthropic.com" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.apiBaseUrl} onChange={(e) => setCreateForm({ ...createForm, apiBaseUrl: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">API Key Reference (GCP Secret name)</label>
                <input type="text" placeholder="e.g., anthropic-api-key" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.apiKeyReference} onChange={(e) => setCreateForm({ ...createForm, apiKeyReference: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Max Tokens</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.maxTokens} onChange={(e) => setCreateForm({ ...createForm, maxTokens: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Temperature</label>
                  <input type="number" step="0.1" min="0" max="2" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.temperature} onChange={(e) => setCreateForm({ ...createForm, temperature: parseFloat(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rate Limit (RPM)</label>
                  <input type="number" className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg" value={createForm.rateLimitRpm} onChange={(e) => setCreateForm({ ...createForm, rateLimitRpm: parseInt(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg hover:bg-white/5">Cancel</button>
              <button onClick={handleCreateProvider} disabled={saving || !createForm.providerName || !createForm.displayName} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
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
