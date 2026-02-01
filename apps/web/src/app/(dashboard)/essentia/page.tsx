'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { essentiaApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Book,
  BookOpen,
  Search,
  Plus,
  Star,
  Clock,
  ChevronRight,
  Play,
  CheckCircle2,
  Layers,
} from 'lucide-react';

type Tab = 'all' | 'reading' | 'completed' | 'wishlist';

export default function EssentiaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['essentia-books'],
    queryFn: () => essentiaApi.getAllBooks(),
  });

  const tabs = [
    { id: 'all' as Tab, label: 'All Books', count: books.length },
    { id: 'reading' as Tab, label: 'Reading', count: books.filter((b: any) => b.status === 'READING').length },
    { id: 'completed' as Tab, label: 'Completed', count: books.filter((b: any) => b.status === 'COMPLETED').length },
    { id: 'wishlist' as Tab, label: 'Wishlist', count: books.filter((b: any) => b.status === 'WISHLIST').length },
  ];

  const filteredBooks = books.filter((book: any) => {
    const matchesSearch = book.title?.toLowerCase().includes(search.toLowerCase()) ||
                          book.author?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && book.status === activeTab.toUpperCase();
  });

  // Mock data for demo
  const mockBooks = [
    {
      id: '1',
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
      status: 'READING',
      progress: 65,
      rating: 5,
      category: 'Self-Help',
      totalCards: 24,
      completedCards: 15,
    },
    {
      id: '2',
      title: 'Deep Work',
      author: 'Cal Newport',
      cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1447957962i/25744928.jpg',
      status: 'COMPLETED',
      progress: 100,
      rating: 4,
      category: 'Productivity',
      totalCards: 18,
      completedCards: 18,
    },
    {
      id: '3',
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1581527774i/41881472.jpg',
      status: 'WISHLIST',
      progress: 0,
      rating: 0,
      category: 'Finance',
      totalCards: 20,
      completedCards: 0,
    },
    {
      id: '4',
      title: 'The 7 Habits of Highly Effective People',
      author: 'Stephen Covey',
      cover: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1421842784i/36072.jpg',
      status: 'READING',
      progress: 30,
      rating: 5,
      category: 'Self-Help',
      totalCards: 32,
      completedCards: 10,
    },
  ];

  const displayBooks = books.length > 0 ? filteredBooks : mockBooks.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                          book.author.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && book.status === activeTab.toUpperCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Essentia</h1>
          <p className="text-slate-400 text-sm mt-1">
            Your personal book library with key insights and flashcards
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add Book
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{displayBooks.length}</div>
              <div className="text-xs text-slate-400">Total Books</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {mockBooks.filter((b) => b.status === 'READING').length}
              </div>
              <div className="text-xs text-slate-400">Currently Reading</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {mockBooks.filter((b) => b.status === 'COMPLETED').length}
              </div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {mockBooks.reduce((sum, b) => sum + b.totalCards, 0)}
              </div>
              <div className="text-xs text-slate-400">Total Cards</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 text-xs px-2 py-0.5 rounded-full',
                  activeTab === tab.id ? 'bg-white/20' : 'bg-slate-700'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : displayBooks.length === 0 ? (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No books found</h3>
          <p className="text-slate-400 mb-4">
            {search ? 'Try a different search term' : 'Start building your library'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-all">
            <Plus className="w-4 h-4" />
            Add Your First Book
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(books.length > 0 ? displayBooks : mockBooks).map((book: any) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => setSelectedBook(book)}
            />
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}

function BookCard({ book, onClick }: { book: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-slate-800">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Book className="w-12 h-12 text-slate-600" />
          </div>
        )}
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full',
              book.status === 'READING' && 'bg-yellow-500/20 text-yellow-400',
              book.status === 'COMPLETED' && 'bg-green-500/20 text-green-400',
              book.status === 'WISHLIST' && 'bg-blue-500/20 text-blue-400'
            )}
          >
            {book.status === 'READING' ? 'Reading' : book.status === 'COMPLETED' ? 'Completed' : 'Wishlist'}
          </span>
        </div>
        {/* Progress Overlay */}
        {book.status === 'READING' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-primary"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-slate-400 truncate">{book.author}</p>

        {/* Rating */}
        {book.rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'w-3 h-3',
                  i < book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                )}
              />
            ))}
          </div>
        )}

        {/* Cards Progress */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Layers className="w-3 h-3" />
            {book.completedCards}/{book.totalCards} cards
          </div>
          {book.status === 'READING' && (
            <button className="flex items-center gap-1 text-xs text-primary hover:underline">
              <Play className="w-3 h-3" />
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BookDetailModal({ book, onClose }: { book: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex gap-6 p-6">
          {/* Cover */}
          <div className="w-40 flex-shrink-0">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-slate-800 rounded-lg flex items-center justify-center">
                <Book className="w-12 h-12 text-slate-600" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <p className="text-slate-400 mt-1">{book.author}</p>

            <div className="flex items-center gap-4 mt-4">
              <span
                className={cn(
                  'text-xs px-3 py-1 rounded-full',
                  book.status === 'READING' && 'bg-yellow-500/20 text-yellow-400',
                  book.status === 'COMPLETED' && 'bg-green-500/20 text-green-400',
                  book.status === 'WISHLIST' && 'bg-blue-500/20 text-blue-400'
                )}
              >
                {book.status}
              </span>
              {book.category && (
                <span className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300">
                  {book.category}
                </span>
              )}
            </div>

            {/* Rating */}
            {book.rating > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-4 h-4',
                        i < book.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-slate-400">{book.rating}/5</span>
              </div>
            )}

            {/* Progress */}
            {book.status === 'READING' && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span className="font-medium">{book.progress}%</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-500"
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cards Section */}
        <div className="px-6 py-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Flashcards</h3>
            <span className="text-sm text-slate-400">
              {book.completedCards}/{book.totalCards} reviewed
            </span>
          </div>
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-cyan-500 text-white font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <Play className="w-5 h-5" />
            Start Review Session
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-all"
          >
            Close
          </button>
          <button className="px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium transition-all">
            Edit Book
          </button>
        </div>
      </div>
    </div>
  );
}
