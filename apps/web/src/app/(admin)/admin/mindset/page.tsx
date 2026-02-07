'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAdminAccessToken } from '@/lib/api';
import * as mindsetApi from '@/lib/api/mindset';
import type {
  MindsetContent,
  MindsetTheme,
  MindsetStats,
  CreateMindsetContentRequest,
  UpdateMindsetContentRequest,
  CreateMindsetThemeRequest,
  UpdateMindsetThemeRequest,
} from '@/types/mindset';
import {
  Quote,
  Palette,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Search,
  Heart,
  X,
} from 'lucide-react';

type Tab = 'quotes' | 'themes' | 'stats';

export default function MindsetAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('quotes');

  // ── Quotes state ────────────────────────────────────────────────────
  const [quotes, setQuotes] = useState<MindsetContent[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<MindsetContent | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // ── Themes state ────────────────────────────────────────────────────
  const [themes, setThemes] = useState<MindsetTheme[]>([]);
  const [themesLoading, setThemesLoading] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editingTheme, setEditingTheme] = useState<MindsetTheme | null>(null);

  // ── Stats state ─────────────────────────────────────────────────────
  const [stats, setStats] = useState<MindsetStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Data loading ────────────────────────────────────────────────────
  const loadQuotes = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) return;
    setQuotesLoading(true);
    try {
      const data = await mindsetApi.getContentList(token);
      setQuotes(data);
    } catch (e) {
      console.error('Failed to load quotes', e);
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  const loadThemes = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) return;
    setThemesLoading(true);
    try {
      const data = await mindsetApi.getThemeList(token);
      setThemes(data);
    } catch (e) {
      console.error('Failed to load themes', e);
    } finally {
      setThemesLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    const token = getAdminAccessToken();
    if (!token) return;
    setStatsLoading(true);
    try {
      const data = await mindsetApi.getMindsetStats(token);
      setStats(data);
    } catch (e) {
      console.error('Failed to load stats', e);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quotes') loadQuotes();
    if (activeTab === 'themes') loadThemes();
    if (activeTab === 'stats') loadStats();
  }, [activeTab, loadQuotes, loadThemes, loadStats]);

  // ── CRUD handlers ───────────────────────────────────────────────────
  const handleDeleteQuote = async (id: string) => {
    const token = getAdminAccessToken();
    if (!token || !confirm('Delete this quote?')) return;
    try {
      await mindsetApi.deleteContent(token, id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    const token = getAdminAccessToken();
    if (!token || !confirm('Delete this theme?')) return;
    try {
      await mindsetApi.deleteTheme(token, id);
      setThemes((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  // ── Filtered quotes ─────────────────────────────────────────────────
  const filteredQuotes = quotes.filter(
    (q) =>
      q.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ── Tab bar ─────────────────────────────────────────────────────────
  const tabs: { key: Tab; label: string; icon: typeof Quote }[] = [
    { key: 'quotes', label: 'Quotes', icon: Quote },
    { key: 'themes', label: 'Themes', icon: Palette },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mindset Management</h1>
        <p className="text-slate-400 mt-1">Manage motivational quotes, themes, and view analytics</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Quotes Tab ───────────────────────────────────────────────── */}
      {activeTab === 'quotes' && (
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search quotes or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBulkModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
              <button
                onClick={() => { setEditingQuote(null); setShowQuoteModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Quote
              </button>
            </div>
          </div>

          {/* Quotes table */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Quote</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Author</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Dimension</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Tone</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">
                    <Heart className="w-3 h-3 inline" />
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotesLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Loading...</td>
                  </tr>
                ) : filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">No quotes found</td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-sm text-slate-200 max-w-sm truncate">{q.body}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{q.author}</td>
                      <td className="px-4 py-3">
                        {q.lifeWheelAreaName && (
                          <span
                            className="inline-block px-2 py-0.5 text-xs rounded-full"
                            style={{
                              backgroundColor: q.lifeWheelAreaColor ? `${q.lifeWheelAreaColor}20` : '#334155',
                              color: q.lifeWheelAreaColor || '#94a3b8',
                            }}
                          >
                            {q.lifeWheelAreaName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">{q.emotionalTone}</td>
                      <td className="px-4 py-3 text-center text-sm text-slate-400">{q.favoriteCount}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingQuote(q); setShowQuoteModal(true); }}
                            className="p-1.5 hover:bg-slate-600 rounded-md text-slate-400 hover:text-white transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="p-1.5 hover:bg-red-600/20 rounded-md text-slate-400 hover:text-red-400 transition-colors"
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
          <p className="text-sm text-slate-500 mt-2">{filteredQuotes.length} quotes</p>
        </div>
      )}

      {/* ── Themes Tab ───────────────────────────────────────────────── */}
      {activeTab === 'themes' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400">{themes.length} themes</p>
            <button
              onClick={() => { setEditingTheme(null); setShowThemeModal(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Theme
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themesLoading ? (
              <p className="text-slate-500 col-span-3 text-center py-8">Loading...</p>
            ) : (
              themes.map((theme) => (
                <div
                  key={theme.id}
                  className="rounded-xl overflow-hidden border border-slate-700/50"
                >
                  {/* Preview */}
                  <div
                    className="h-28 flex items-center justify-center px-4"
                    style={{
                      background:
                        theme.gradientColors.length >= 2
                          ? `linear-gradient(135deg, ${theme.gradientColors.join(', ')})`
                          : theme.backgroundColor,
                    }}
                  >
                    <p className="text-lg font-bold text-center" style={{ color: theme.textColor }}>
                      \u201c{theme.name}\u201d
                    </p>
                  </div>

                  {/* Info */}
                  <div className="bg-slate-800 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: theme.backgroundColor }} />
                      <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: theme.textColor }} />
                      <div className="w-4 h-4 rounded-full border border-slate-600" style={{ backgroundColor: theme.accentColor }} />
                      <span className="text-sm text-slate-300 ml-2">{theme.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingTheme(theme); setShowThemeModal(true); }}
                        className="p-1.5 hover:bg-slate-600 rounded-md text-slate-400 hover:text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTheme(theme.id)}
                        className="p-1.5 hover:bg-red-600/20 rounded-md text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Stats Tab ────────────────────────────────────────────────── */}
      {activeTab === 'stats' && (
        <div>
          {statsLoading || !stats ? (
            <p className="text-slate-500 text-center py-12">Loading stats...</p>
          ) : (
            <>
              {/* Overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                  <p className="text-3xl font-bold text-white">{stats.totalQuotes}</p>
                  <p className="text-slate-400 text-sm mt-1">Total Quotes</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                  <p className="text-3xl font-bold text-white">{stats.totalFavorites}</p>
                  <p className="text-slate-400 text-sm mt-1">Total Favorites</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                  <p className="text-3xl font-bold text-white">{Object.keys(stats.quotesByDimension).length}</p>
                  <p className="text-slate-400 text-sm mt-1">Dimensions Covered</p>
                </div>
              </div>

              {/* Dimension breakdown */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quotes by Dimension</h3>
                <div className="space-y-3">
                  {Object.entries(stats.quotesByDimension).map(([dim, count]) => (
                    <div key={dim} className="flex items-center gap-3">
                      <span className="text-sm text-slate-300 w-40 truncate">{dim}</span>
                      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${(count / stats.totalQuotes) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-400 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tone breakdown */}
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quotes by Tone</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.quotesByTone).map(([tone, count]) => (
                    <span key={tone} className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm text-slate-300">
                      {tone}: {count}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top favorited */}
              {stats.topFavorited.length > 0 && (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                  <h3 className="text-lg font-semibold text-white mb-4">Top Favorited Quotes</h3>
                  <div className="space-y-3">
                    {stats.topFavorited.map((q, i) => (
                      <div key={q.id} className="flex items-start gap-3">
                        <span className="text-lg font-bold text-indigo-400 w-6">#{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-200 line-clamp-2">{q.body}</p>
                          <p className="text-xs text-slate-500 mt-1">\u2014 {q.author} \u00b7 {q.favoriteCount} saves</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Quote Create/Edit Modal ──────────────────────────────────── */}
      {showQuoteModal && (
        <QuoteModal
          quote={editingQuote}
          onClose={() => { setShowQuoteModal(false); setEditingQuote(null); }}
          onSaved={() => { setShowQuoteModal(false); setEditingQuote(null); loadQuotes(); }}
        />
      )}

      {/* ── Bulk Upload Modal ────────────────────────────────────────── */}
      {showBulkModal && (
        <BulkUploadModal
          onClose={() => setShowBulkModal(false)}
          onDone={() => { setShowBulkModal(false); loadQuotes(); }}
        />
      )}

      {/* ── Theme Create/Edit Modal ──────────────────────────────────── */}
      {showThemeModal && (
        <ThemeModal
          theme={editingTheme}
          onClose={() => { setShowThemeModal(false); setEditingTheme(null); }}
          onSaved={() => { setShowThemeModal(false); setEditingTheme(null); loadThemes(); }}
        />
      )}
    </div>
  );
}

// ============================================================================
// Quote Modal
// ============================================================================
function QuoteModal({
  quote,
  onClose,
  onSaved,
}: {
  quote: MindsetContent | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CreateMindsetContentRequest>({
    body: quote?.body ?? '',
    author: quote?.author ?? '',
    dimensionTag: quote?.dimensionTag ?? 'generic',
    emotionalTone: quote?.emotionalTone ?? 'MOTIVATIONAL',
    interventionWeight: quote?.interventionWeight ?? 30,
    lifeWheelAreaId: quote?.lifeWheelAreaId ?? '',
    backgroundImageUrl: quote?.backgroundImageUrl ?? '',
    themePreset: quote?.themePreset ?? 'minimalist',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const token = getAdminAccessToken();
    if (!token) return;
    setSaving(true);
    try {
      if (quote) {
        await mindsetApi.updateContent(token, quote.id, form);
      } else {
        await mindsetApi.createContent(token, form);
      }
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{quote ? 'Edit Quote' : 'New Quote'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Quote *</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="The best time to plant a tree..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Author *</label>
            <input
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Chinese Proverb"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Life Wheel Area ID</label>
              <input
                value={form.lifeWheelAreaId || ''}
                onChange={(e) => setForm({ ...form, lifeWheelAreaId: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="lw-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Emotional Tone</label>
              <select
                value={form.emotionalTone || 'MOTIVATIONAL'}
                onChange={(e) => setForm({ ...form, emotionalTone: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {['MOTIVATIONAL', 'ACTIONABLE', 'REFLECTIVE', 'CALMING', 'INSPIRATIONAL', 'EMPOWERING', 'CHALLENGING', 'HUMOROUS'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Intervention Weight (0-100)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.interventionWeight || 30}
              onChange={(e) => setForm({ ...form, interventionWeight: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Background Image URL</label>
            <input
              value={form.backgroundImageUrl || ''}
              onChange={(e) => setForm({ ...form, backgroundImageUrl: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.body || !form.author}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : quote ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Bulk Upload Modal
// ============================================================================
function BulkUploadModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const [jsonText, setJsonText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ successCount: number; failedCount: number; errors: string[] } | null>(null);

  const sampleJson = JSON.stringify(
    {
      quotes: [
        { body: 'Your quote text here', author: 'Author Name', lifeWheelAreaId: 'lw-1', emotionalTone: 'MOTIVATIONAL', interventionWeight: 50 },
      ],
    },
    null,
    2,
  );

  const handleUpload = async () => {
    const token = getAdminAccessToken();
    if (!token) return;
    setUploading(true);
    try {
      const parsed = JSON.parse(jsonText);
      const res = await mindsetApi.bulkCreateContent(token, parsed);
      setResult(res);
      if (res.failedCount === 0) {
        setTimeout(onDone, 1500);
      }
    } catch (e: unknown) {
      setResult({ successCount: 0, failedCount: 0, errors: [(e as Error).message] });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Bulk Upload Quotes</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Paste a JSON array matching this format:</p>
            <pre className="bg-slate-900 p-3 rounded-lg text-xs text-slate-300 overflow-x-auto">{sampleJson}</pre>
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={10}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Paste JSON here..."
          />
          {result && (
            <div className={`p-3 rounded-lg text-sm ${result.errors.length ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
              <p>{result.successCount} created, {result.failedCount} failed</p>
              {result.errors.map((err, i) => (
                <p key={i} className="mt-1 text-xs">{err}</p>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={uploading || !jsonText.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Theme Modal
// ============================================================================
function ThemeModal({
  theme,
  onClose,
  onSaved,
}: {
  theme: MindsetTheme | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CreateMindsetThemeRequest>({
    name: theme?.name ?? '',
    backgroundColor: theme?.backgroundColor ?? '#1F2937',
    textColor: theme?.textColor ?? '#FFFFFF',
    accentColor: theme?.accentColor ?? '#3B82F6',
    gradientColors: theme?.gradientColors ?? [],
    defaultAsset: theme?.defaultAsset ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const token = getAdminAccessToken();
    if (!token) return;
    setSaving(true);
    try {
      if (theme) {
        await mindsetApi.updateTheme(token, theme.id, form);
      } else {
        await mindsetApi.createTheme(token, form);
      }
      onSaved();
    } catch (e) {
      console.error('Save failed', e);
      alert('Failed to save theme');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">{theme ? 'Edit Theme' : 'New Theme'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Sunset Warmth"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Background</label>
              <input
                type="color"
                value={form.backgroundColor}
                onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Text</label>
              <input
                type="color"
                value={form.textColor}
                onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Accent</label>
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="w-full h-10 bg-slate-700 border border-slate-600 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Gradient Colors (comma-separated hex)</label>
            <input
              value={(form.gradientColors ?? []).join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  gradientColors: e.target.value.split(',').map((c) => c.trim()).filter(Boolean),
                })
              }
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="#FF6B6B, #4ECDC4"
            />
          </div>

          {/* Live preview */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Preview</label>
            <div
              className="h-24 rounded-lg flex items-center justify-center"
              style={{
                background:
                  form.gradientColors && form.gradientColors.length >= 2
                    ? `linear-gradient(135deg, ${form.gradientColors.join(', ')})`
                    : form.backgroundColor,
              }}
            >
              <p className="font-bold" style={{ color: form.textColor }}>Sample Quote</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : theme ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
