'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as essentiaApi from '@/lib/api/essentia';
import type {
  EssentiaBook,
  EssentiaCard,
  CreateBookRequest,
  UpdateBookRequest,
  CreateCardRequest,
  UpdateCardRequest,
  BookStats,
  Difficulty,
  CardType,
} from '@/types/essentia';
import {
  LIFE_WHEEL_AREAS,
  getAreaName,
  getAreaColor,
  getAreaEmoji,
} from '@/types/essentia';
import {
  BookOpen,
  Layers,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Search,
  Star,
  Eye,
  EyeOff,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckSquare,
  Square,
  Download,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const CARD_TYPES: CardType[] = ['INTRO', 'CONCEPT', 'QUOTE', 'SUMMARY', 'ACTION'];

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  BEGINNER: 'bg-green-500/20 text-green-400',
  INTERMEDIATE: 'bg-yellow-500/20 text-yellow-400',
  ADVANCED: 'bg-red-500/20 text-red-400',
};

type Tab = 'books' | 'cards' | 'stats';

// ── Helpers ──────────────────────────────────────────────────────────────────

function truncate(str: string | null | undefined, len: number): string {
  if (!str) return '—';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function EssentiaAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('books');

  // ── Books state
  const [books, setBooks] = useState<EssentiaBook[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<string>('all');

  // ── Book modal
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<EssentiaBook | null>(null);
  const [bookForm, setBookForm] = useState<CreateBookRequest>(emptyBookForm());

  // ── Bulk
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState<{
    isFeatured?: boolean;
    isPublished?: boolean;
    category?: string;
    difficulty?: Difficulty;
  }>({});

  // ── Card modal
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState<EssentiaCard | null>(null);
  const [cardBookId, setCardBookId] = useState<string>('');
  const [cardForm, setCardForm] = useState<CreateCardRequest>(emptyCardForm());

  // ── Stats
  const [stats, setStats] = useState<BookStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Sort
  const [sortField, setSortField] = useState<'title' | 'author' | 'rating' | 'completionCount' | 'createdAt'>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadBooks = useCallback(async () => {
    setBooksLoading(true);
    try {
      const data = await essentiaApi.getAllBooks();
      setBooks(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load books';
      alert(message);
    } finally {
      setBooksLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await essentiaApi.getBookStats();
      setStats(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load stats';
      alert(message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'books' || activeTab === 'cards') loadBooks();
    if (activeTab === 'stats') loadStats();
  }, [activeTab, loadBooks, loadStats]);

  // ── Filtered + sorted books ────────────────────────────────────────────────

  const filteredBooks = useMemo(() => {
    let result = books;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q),
      );
    }

    if (areaFilter !== 'all') {
      result = result.filter((b) => b.lifeWheelAreaId === areaFilter);
    }

    if (difficultyFilter !== 'all') {
      result = result.filter((b) => b.difficulty === difficultyFilter);
    }

    if (publishedFilter !== 'all') {
      result = result.filter((b) =>
        publishedFilter === 'published' ? b.isPublished : !b.isPublished,
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'title': cmp = a.title.localeCompare(b.title); break;
        case 'author': cmp = a.author.localeCompare(b.author); break;
        case 'rating': cmp = (a.rating ?? 0) - (b.rating ?? 0); break;
        case 'completionCount': cmp = a.completionCount - b.completionCount; break;
        case 'createdAt': cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [books, searchQuery, areaFilter, difficultyFilter, publishedFilter, sortField, sortDir]);

  // ── Book CRUD handlers ─────────────────────────────────────────────────────

  function openCreateBook() {
    setEditingBook(null);
    setBookForm(emptyBookForm());
    setShowBookModal(true);
  }

  function openEditBook(book: EssentiaBook) {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      lifeWheelAreaId: book.lifeWheelAreaId,
      category: book.category,
      duration: book.duration,
      difficulty: book.difficulty,
      tags: book.tags ?? [],
      description: book.description ?? '',
      summaryText: book.summaryText ?? '',
      coreMethodology: book.coreMethodology ?? '',
      appApplication: book.appApplication ?? '',
      coverImageUrl: book.coverImageUrl ?? '',
      isbn: book.isbn ?? '',
      isFeatured: book.isFeatured,
      isPublished: book.isPublished,
      keyTakeaways: book.keyTakeaways ?? [],
      publicationYear: book.publicationYear ?? undefined,
      rating: book.rating ?? undefined,
    });
    setShowBookModal(true);
  }

  async function handleSaveBook() {
    try {
      if (editingBook) {
        await essentiaApi.updateBook(editingBook.id, bookForm as UpdateBookRequest);
      } else {
        await essentiaApi.createBook(bookForm);
      }
      setShowBookModal(false);
      loadBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save book';
      alert(message);
    }
  }

  async function handleDeleteBook(id: string) {
    if (!confirm('Delete this book and all its cards? This cannot be undone.')) return;
    try {
      await essentiaApi.deleteBook(id);
      loadBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete book';
      alert(message);
    }
  }

  // ── Card CRUD handlers ─────────────────────────────────────────────────────

  function openCreateCard(bookId: string) {
    setEditingCard(null);
    setCardBookId(bookId);
    setCardForm(emptyCardForm());
    setShowCardModal(true);
  }

  function openEditCard(bookId: string, card: EssentiaCard) {
    setEditingCard(card);
    setCardBookId(bookId);
    setCardForm({
      type: card.type,
      sortOrder: card.sortOrder,
      title: card.title,
      text: card.text,
      imageUrl: card.imageUrl ?? undefined,
    });
    setShowCardModal(true);
  }

  async function handleSaveCard() {
    try {
      if (editingCard) {
        await essentiaApi.updateCard(editingCard.id, cardForm as UpdateCardRequest);
      } else {
        await essentiaApi.createCard(cardBookId, cardForm);
      }
      setShowCardModal(false);
      loadBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save card';
      alert(message);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!confirm('Delete this card?')) return;
    try {
      await essentiaApi.deleteCard(cardId);
      loadBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete card';
      alert(message);
    }
  }

  // ── Bulk ops ───────────────────────────────────────────────────────────────

  function toggleBookSelection(id: string) {
    setSelectedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedBookIds.size === filteredBooks.length) {
      setSelectedBookIds(new Set());
    } else {
      setSelectedBookIds(new Set(filteredBooks.map((b) => b.id)));
    }
  }

  async function handleBulkImport() {
    try {
      const parsed = JSON.parse(bulkJson);
      const booksArr = Array.isArray(parsed) ? parsed : parsed.books;
      if (!Array.isArray(booksArr) || booksArr.length === 0) {
        alert('Invalid JSON. Provide an array of book objects or { books: [...] }');
        return;
      }
      await essentiaApi.bulkImportBooks({ books: booksArr });
      setShowBulkImportModal(false);
      setBulkJson('');
      loadBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk import';
      alert(message);
    }
  }

  async function handleBulkUpdate() {
    if (selectedBookIds.size === 0) return;
    try {
      const updates = Array.from(selectedBookIds).map((bookId) => ({
        bookId,
        ...bulkEditForm,
      }));
      await essentiaApi.bulkUpdateBooks({ updates });
      setShowBulkEditModal(false);
      setBulkEditForm({});
      setSelectedBookIds(new Set());
      loadBooks();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to bulk update';
      alert(message);
    }
  }

  function handleExportJson() {
    const booksToExport = selectedBookIds.size > 0
      ? books.filter((b) => selectedBookIds.has(b.id))
      : filteredBooks;
    const blob = new Blob([JSON.stringify(booksToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `essentia-books-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Sort handler ───────────────────────────────────────────────────────────

  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  }

  // ── Tab definitions ────────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: typeof BookOpen; count?: number }[] = [
    { key: 'books', label: 'Books', icon: BookOpen, count: books.length },
    { key: 'cards', label: 'Cards', icon: Layers },
    { key: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Essentia — Book Library</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage book summaries across all Life Wheel areas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Bulk Import
          </button>
          <button
            onClick={openCreateBook}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1 w-fit border border-slate-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-slate-700/50">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'books' && renderBooksTab()}
      {activeTab === 'cards' && renderCardsTab()}
      {activeTab === 'stats' && renderStatsTab()}

      {/* Modals */}
      {showBookModal && renderBookModal()}
      {showCardModal && renderCardModal()}
      {showBulkImportModal && renderBulkImportModal()}
      {showBulkEditModal && renderBulkEditModal()}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOKS TAB
  // ═══════════════════════════════════════════════════════════════════════════

  function renderBooksTab() {
    return (
      <div className="space-y-4">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, category, ISBN…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          {/* Area filter */}
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="all">All Areas</option>
            {Object.entries(LIFE_WHEEL_AREAS).map(([id, area]) => (
              <option key={id} value={id}>
                {area.emoji} {area.name}
              </option>
            ))}
          </select>

          {/* Difficulty filter */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="all">All Levels</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Published filter */}
          <select
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Bulk edit button (visible when selected) */}
          {selectedBookIds.size > 0 && (
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-sm transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Bulk Edit ({selectedBookIds.size})
            </button>
          )}
        </div>

        {/* Results summary */}
        <div className="text-sm text-slate-400">
          Showing {filteredBooks.length} of {books.length} books
          {selectedBookIds.size > 0 && (
            <span className="ml-2 text-violet-400">
              ({selectedBookIds.size} selected)
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-3 py-3 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                      {selectedBookIds.size === filteredBooks.length && filteredBooks.length > 0 ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="text-left px-3 py-3 text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                    onClick={() => handleSort('title')}
                  >
                    Title <SortIcon field="title" />
                  </th>
                  <th
                    className="text-left px-3 py-3 text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                    onClick={() => handleSort('author')}
                  >
                    Author <SortIcon field="author" />
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-400 uppercase">
                    Area
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-400 uppercase">
                    Level
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 uppercase">
                    Cards
                  </th>
                  <th
                    className="text-center px-3 py-3 text-xs font-medium text-slate-400 uppercase cursor-pointer hover:text-white"
                    onClick={() => handleSort('rating')}
                  >
                    Rating <SortIcon field="rating" />
                  </th>
                  <th className="text-center px-3 py-3 text-xs font-medium text-slate-400 uppercase">
                    Status
                  </th>
                  <th className="text-right px-3 py-3 text-xs font-medium text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {booksLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                        Loading books…
                      </div>
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                      {books.length === 0 ? 'No books yet. Add your first book!' : 'No books match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                    >
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleBookSelection(book.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {selectedBookIds.has(book.id) ? (
                            <CheckSquare className="w-4 h-4 text-violet-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {book.isFeatured && (
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{truncate(book.title, 40)}</p>
                            <p className="text-slate-500 text-xs">{book.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-300 text-sm">{book.author}</td>
                      <td className="px-3 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getAreaColor(book.lifeWheelAreaId) + '20',
                            color: getAreaColor(book.lifeWheelAreaId),
                          }}
                        >
                          {getAreaEmoji(book.lifeWheelAreaId)} {getAreaName(book.lifeWheelAreaId)}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[book.difficulty]}`}>
                          {book.difficulty}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-300 text-sm">{book.cardCount}</td>
                      <td className="px-3 py-3 text-center text-slate-300 text-sm">
                        {book.rating ? `⭐ ${book.rating}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {book.isPublished ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs">
                              <Eye className="w-3 h-3" /> Live
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500 text-xs">
                              <EyeOff className="w-3 h-3" /> Draft
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditBook(book)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(book.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                            title="Copy ID"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARDS TAB — Expandable book → cards list
  // ═══════════════════════════════════════════════════════════════════════════

  function renderCardsTab() {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          Click a book to expand and manage its cards. Each book should have 3–7 cards covering INTRO, CONCEPT, QUOTE, SUMMARY, ACTION types.
        </p>
        {booksLoading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">
            <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading…
          </div>
        ) : (
          books.map((book) => (
            <div
              key={book.id}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden"
            >
              {/* Book header row */}
              <button
                onClick={() =>
                  setExpandedBookId(expandedBookId === book.id ? null : book.id)
                }
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/20 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getAreaColor(book.lifeWheelAreaId) }}
                  />
                  <div>
                    <p className="text-white text-sm font-medium">{book.title}</p>
                    <p className="text-slate-500 text-xs">{book.author} · {book.cardCount} cards</p>
                  </div>
                </div>
                {expandedBookId === book.id ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Expanded cards */}
              {expandedBookId === book.id && (
                <div className="border-t border-slate-700/50 p-4 space-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-slate-300">
                      Cards ({book.cards?.length ?? 0})
                    </h4>
                    <button
                      onClick={() => openCreateCard(book.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 text-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Card
                    </button>
                  </div>

                  {book.cards && book.cards.length > 0 ? (
                    <div className="space-y-2">
                      {[...book.cards]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((card) => (
                          <div
                            key={card.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30"
                          >
                            <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-700/50 text-slate-400 flex-shrink-0">
                              #{card.sortOrder}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${cardTypeBadge(card.type)}`}
                            >
                              {card.type}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium">{card.title}</p>
                              <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                                {truncate(card.text, 120)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openEditCard(book.id, card)}
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700/50"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCard(card.id)}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 py-4 text-center">
                      No cards yet. Add cards to build the book&apos;s reading experience.
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS TAB
  // ═══════════════════════════════════════════════════════════════════════════

  function renderStatsTab() {
    if (statsLoading) {
      return (
        <div className="flex items-center justify-center py-12 text-slate-500">
          <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-2" />
          Loading stats…
        </div>
      );
    }

    if (!stats) return <p className="text-slate-500">Failed to load stats.</p>;

    const maxArea = Math.max(...(stats.booksByLifeWheelArea?.map((a) => a.count) ?? [1]));

    return (
      <div className="space-y-6">
        {/* Overview cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Books" value={stats.totalBooks} color="violet" />
          <StatCard label="Published" value={stats.publishedBooks} color="green" />
          <StatCard label="Featured" value={stats.featuredBooks} color="amber" />
          <StatCard label="Total Cards" value={stats.totalCards} color="blue" />
        </div>

        {/* By life wheel area */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-white font-semibold mb-4">Books by Life Wheel Area</h3>
          <div className="space-y-3">
            {stats.booksByLifeWheelArea?.map((area) => (
              <div key={area.lifeWheelAreaId} className="flex items-center gap-3">
                <span className="text-lg w-6">{getAreaEmoji(area.lifeWheelAreaId)}</span>
                <span className="text-slate-300 text-sm w-40 truncate">
                  {getAreaName(area.lifeWheelAreaId)}
                </span>
                <div className="flex-1 bg-slate-700/30 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(area.count / maxArea) * 100}%`,
                      backgroundColor: getAreaColor(area.lifeWheelAreaId),
                    }}
                  />
                </div>
                <span className="text-slate-400 text-sm w-8 text-right">{area.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By category */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-white font-semibold mb-4">Books by Category</h3>
          <div className="flex flex-wrap gap-2">
            {stats.booksByCategory?.map((cat) => (
              <span
                key={cat.category}
                className="px-3 py-1.5 rounded-full bg-slate-700/50 text-slate-300 text-sm"
              >
                {cat.category}{' '}
                <span className="text-violet-400 font-medium">{cat.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOK MODAL (Create / Edit)
  // ═══════════════════════════════════════════════════════════════════════════

  function renderBookModal() {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
            <h2 className="text-lg font-semibold text-white">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h2>
            <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4">
            {/* Row: Title + Author */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Title *"
                value={bookForm.title}
                onChange={(v) => setBookForm({ ...bookForm, title: v })}
              />
              <FormField
                label="Author *"
                value={bookForm.author}
                onChange={(v) => setBookForm({ ...bookForm, author: v })}
              />
            </div>

            {/* Row: Area + Category + Difficulty */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Life Wheel Area *</label>
                <select
                  value={bookForm.lifeWheelAreaId}
                  onChange={(e) => setBookForm({ ...bookForm, lifeWheelAreaId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                >
                  <option value="">Select area…</option>
                  {Object.entries(LIFE_WHEEL_AREAS).map(([id, area]) => (
                    <option key={id} value={id}>{area.emoji} {area.name}</option>
                  ))}
                </select>
              </div>
              <FormField
                label="Category *"
                value={bookForm.category}
                onChange={(v) => setBookForm({ ...bookForm, category: v })}
                placeholder="e.g. Psychology"
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
                <select
                  value={bookForm.difficulty ?? 'INTERMEDIATE'}
                  onChange={(e) => setBookForm({ ...bookForm, difficulty: e.target.value as Difficulty })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row: Duration + Year + Rating + ISBN */}
            <div className="grid grid-cols-4 gap-4">
              <FormField
                label="Duration (min)"
                type="number"
                value={String(bookForm.duration ?? '')}
                onChange={(v) => setBookForm({ ...bookForm, duration: v ? Number(v) : undefined })}
              />
              <FormField
                label="Publication Year"
                type="number"
                value={String(bookForm.publicationYear ?? '')}
                onChange={(v) => setBookForm({ ...bookForm, publicationYear: v ? Number(v) : undefined })}
              />
              <FormField
                label="Rating"
                type="number"
                value={String(bookForm.rating ?? '')}
                onChange={(v) => setBookForm({ ...bookForm, rating: v ? Number(v) : undefined })}
                placeholder="0.0–5.0"
              />
              <FormField
                label="ISBN"
                value={bookForm.isbn ?? ''}
                onChange={(v) => setBookForm({ ...bookForm, isbn: v })}
              />
            </div>

            {/* Description */}
            <FormTextarea
              label="Description"
              value={bookForm.description ?? ''}
              onChange={(v) => setBookForm({ ...bookForm, description: v })}
              rows={2}
            />

            {/* Summary text */}
            <FormTextarea
              label="Summary Text"
              value={bookForm.summaryText ?? ''}
              onChange={(v) => setBookForm({ ...bookForm, summaryText: v })}
              rows={3}
              placeholder="A 3–5 paragraph summary of the book's key ideas…"
            />

            {/* Core methodology */}
            <FormTextarea
              label="Core Methodology"
              value={bookForm.coreMethodology ?? ''}
              onChange={(v) => setBookForm({ ...bookForm, coreMethodology: v })}
              rows={2}
              placeholder="Brief description of the book's main framework or method"
            />

            {/* App application */}
            <FormTextarea
              label="App Application"
              value={bookForm.appApplication ?? ''}
              onChange={(v) => setBookForm({ ...bookForm, appApplication: v })}
              rows={2}
              placeholder="How KAIZ applies the book's lessons in the app"
            />

            {/* Cover image URL */}
            <FormField
              label="Cover Image URL"
              value={bookForm.coverImageUrl ?? ''}
              onChange={(v) => setBookForm({ ...bookForm, coverImageUrl: v })}
              placeholder="https://…"
            />

            {/* Tags */}
            <FormField
              label="Tags (comma-separated)"
              value={(bookForm.tags ?? []).join(', ')}
              onChange={(v) =>
                setBookForm({
                  ...bookForm,
                  tags: v.split(',').map((t) => t.trim()).filter(Boolean),
                })
              }
              placeholder="psychology, habits, productivity"
            />

            {/* Key Takeaways */}
            <FormTextarea
              label="Key Takeaways (one per line)"
              value={(bookForm.keyTakeaways ?? []).join('\n')}
              onChange={(v) =>
                setBookForm({
                  ...bookForm,
                  keyTakeaways: v.split('\n').map((t) => t.trim()).filter(Boolean),
                })
              }
              rows={3}
              placeholder="Each line becomes a takeaway bullet"
            />

            {/* Toggles */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookForm.isPublished ?? true}
                  onChange={(e) => setBookForm({ ...bookForm, isPublished: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-900 text-violet-500 focus:ring-violet-500/50"
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookForm.isFeatured ?? false}
                  onChange={(e) => setBookForm({ ...bookForm, isFeatured: e.target.checked })}
                  className="rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500/50"
                />
                Featured ⭐
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-slate-700 sticky bottom-0 bg-slate-800">
            <button
              onClick={() => setShowBookModal(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBook}
              disabled={!bookForm.title || !bookForm.author || !bookForm.lifeWheelAreaId || !bookForm.category}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingBook ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARD MODAL (Create / Edit)
  // ═══════════════════════════════════════════════════════════════════════════

  function renderCardModal() {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              {editingCard ? 'Edit Card' : 'Add Card'}
            </h2>
            <button onClick={() => setShowCardModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Card Type *</label>
                <select
                  value={cardForm.type}
                  onChange={(e) => setCardForm({ ...cardForm, type: e.target.value as CardType })}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
                >
                  {CARD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <FormField
                label="Sort Order *"
                type="number"
                value={String(cardForm.sortOrder)}
                onChange={(v) => setCardForm({ ...cardForm, sortOrder: Number(v) })}
              />
            </div>
            <FormField
              label="Title *"
              value={cardForm.title}
              onChange={(v) => setCardForm({ ...cardForm, title: v })}
            />
            <FormTextarea
              label="Text *"
              value={cardForm.text}
              onChange={(v) => setCardForm({ ...cardForm, text: v })}
              rows={5}
            />
            <FormField
              label="Image URL"
              value={cardForm.imageUrl ?? ''}
              onChange={(v) => setCardForm({ ...cardForm, imageUrl: v || undefined })}
              placeholder="https://…"
            />
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
            <button
              onClick={() => setShowCardModal(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCard}
              disabled={!cardForm.title || !cardForm.text}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingCard ? 'Save Card' : 'Add Card'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK IMPORT MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  function renderBulkImportModal() {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Bulk Import Books</h2>
            <button onClick={() => setShowBulkImportModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-400">
              Paste a JSON array of book objects (max 50). Each book needs at minimum:{' '}
              <code className="text-violet-400">title</code>,{' '}
              <code className="text-violet-400">author</code>,{' '}
              <code className="text-violet-400">lifeWheelAreaId</code>,{' '}
              <code className="text-violet-400">category</code>.
            </p>
            <textarea
              value={bulkJson}
              onChange={(e) => setBulkJson(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-violet-500/50"
              placeholder={`[\n  {\n    "title": "Atomic Habits",\n    "author": "James Clear",\n    "lifeWheelAreaId": "lw-4",\n    "category": "Personal Development"\n  }\n]`}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload JSON File
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setBulkJson(ev.target?.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
            <button
              onClick={() => setShowBulkImportModal(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkImport}
              disabled={!bulkJson.trim()}
              className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BULK EDIT MODAL
  // ═══════════════════════════════════════════════════════════════════════════

  function renderBulkEditModal() {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">
              Bulk Edit — {selectedBookIds.size} book{selectedBookIds.size > 1 ? 's' : ''}
            </h2>
            <button onClick={() => setShowBulkEditModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            <p className="text-sm text-slate-400">
              Set fields to apply to all selected books. Leave blank to keep existing values.
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Published Status</label>
              <select
                value={bulkEditForm.isPublished === undefined ? '' : String(bulkEditForm.isPublished)}
                onChange={(e) =>
                  setBulkEditForm({
                    ...bulkEditForm,
                    isPublished: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
              >
                <option value="">— Keep existing —</option>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Featured Status</label>
              <select
                value={bulkEditForm.isFeatured === undefined ? '' : String(bulkEditForm.isFeatured)}
                onChange={(e) =>
                  setBulkEditForm({
                    ...bulkEditForm,
                    isFeatured: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
              >
                <option value="">— Keep existing —</option>
                <option value="true">Featured ⭐</option>
                <option value="false">Not Featured</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Difficulty</label>
              <select
                value={bulkEditForm.difficulty ?? ''}
                onChange={(e) =>
                  setBulkEditForm({
                    ...bulkEditForm,
                    difficulty: e.target.value ? (e.target.value as Difficulty) : undefined,
                  })
                }
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
              >
                <option value="">— Keep existing —</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <FormField
              label="Category"
              value={bulkEditForm.category ?? ''}
              onChange={(v) => setBulkEditForm({ ...bulkEditForm, category: v || undefined })}
              placeholder="Leave blank to keep existing"
            />
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-slate-700">
            <button
              onClick={() => setShowBulkEditModal(false)}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleBulkUpdate}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium"
            >
              Apply to {selectedBookIds.size} book{selectedBookIds.size > 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm resize-y focus:outline-none focus:border-violet-500/50 placeholder-slate-600"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: 'violet' | 'green' | 'amber' | 'blue';
}) {
  const colors = {
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
  };
  const textColors = {
    violet: 'text-violet-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl border p-4`}>
      <p className="text-slate-400 text-xs">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${textColors[color]}`}>{value}</p>
    </div>
  );
}

function cardTypeBadge(type: CardType): string {
  const map: Record<CardType, string> = {
    INTRO: 'bg-blue-500/20 text-blue-400',
    CONCEPT: 'bg-violet-500/20 text-violet-400',
    QUOTE: 'bg-amber-500/20 text-amber-400',
    SUMMARY: 'bg-green-500/20 text-green-400',
    ACTION: 'bg-red-500/20 text-red-400',
  };
  return map[type] ?? 'bg-slate-700/50 text-slate-400';
}

function emptyBookForm(): CreateBookRequest {
  return {
    title: '',
    author: '',
    lifeWheelAreaId: '',
    category: '',
    duration: 15,
    difficulty: 'INTERMEDIATE',
    tags: [],
    description: '',
    summaryText: '',
    coreMethodology: '',
    appApplication: '',
    coverImageUrl: '',
    isbn: '',
    isFeatured: false,
    isPublished: true,
    keyTakeaways: [],
    publicationYear: undefined,
    rating: undefined,
  };
}

function emptyCardForm(): CreateCardRequest {
  return {
    type: 'INTRO',
    sortOrder: 0,
    title: '',
    text: '',
  };
}
