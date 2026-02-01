'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengeApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Flame,
  Trophy,
  Target,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Star,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';

type ChallengeTab = 'my' | 'browse' | 'completed';

export default function ChallengesPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ChallengeTab>('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);

  // Fetch my challenges
  const { data: myChallengesData, isLoading: myLoading } = useQuery({
    queryKey: ['myChallenges'],
    queryFn: () => challengeApi.getActive(),
    staleTime: 30000,
  });

  // Fetch all challenges
  const { data: allChallengesData, isLoading: allLoading } = useQuery({
    queryKey: ['allChallenges'],
    queryFn: () => challengeApi.getAll(),
    staleTime: 60000,
  });

  // Create challenge mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => challengeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myChallenges'] });
      setShowCreateModal(false);
    },
  });

  // Join challenge mutation (creates a new challenge based on template)
  const joinMutation = useMutation({
    mutationFn: (data: any) => challengeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['allChallenges'] });
    },
  });

  // Log entry mutation
  const logEntryMutation = useMutation({
    mutationFn: ({ challengeId, data }: { challengeId: string; data: any }) => 
      challengeApi.logEntry(challengeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myChallenges'] });
    },
  });

  const myChallenges = myChallengesData || [];
  const allChallenges = allChallengesData || [];

  const activeChallenges = myChallenges.filter((c: any) => c.status === 'ACTIVE');
  const completedChallenges = myChallenges.filter((c: any) => c.status === 'COMPLETED');

  // Filter out challenges user already joined
  const myIds = new Set(myChallenges.map((c: any) => c.id));
  const browseChallenges = allChallenges.filter((c: any) => !myIds.has(c.id));

  const tabs = [
    { id: 'my', label: 'My Challenges', count: activeChallenges.length },
    { id: 'browse', label: 'Browse', count: browseChallenges.length },
    { id: 'completed', label: 'Completed', count: completedChallenges.length },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-slate-400 text-sm mt-1">
            Build habits and track your progress with challenges
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Challenge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-5 h-5" />}
          label="Active"
          value={activeChallenges.length}
          color="text-orange-400"
          bgColor="bg-orange-500/10"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Completed"
          value={completedChallenges.length}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Best Streak"
          value={Math.max(...myChallenges.map((c: any) => c.longestStreak || 0), 0)}
          subvalue="days"
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Total Entries"
          value={myChallenges.reduce((sum: number, c: any) => sum + (c.entriesCount || 0), 0)}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ChallengeTab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-0.5',
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-slate-400 border-transparent hover:text-white'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-white/10">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'my' && (
        <MyChallengesSection
          challenges={activeChallenges}
          isLoading={myLoading}
          onLogEntry={(id) => logEntryMutation.mutate({ 
            challengeId: id, 
            data: { value: true, date: new Date().toISOString() } 
          })}
          onSelect={setSelectedChallenge}
        />
      )}
      {activeTab === 'browse' && (
        <BrowseChallengesSection
          challenges={browseChallenges}
          isLoading={allLoading}
          onJoin={(challenge) => joinMutation.mutate(challenge)}
          isJoining={joinMutation.isPending}
        />
      )}
      {activeTab === 'completed' && (
        <CompletedChallengesSection challenges={completedChallenges} isLoading={myLoading} />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subvalue,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subvalue?: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', bgColor, color)}>
        {icon}
      </div>
      <div className={cn('text-2xl font-bold', color)}>
        {value}
        {subvalue && <span className="text-sm font-normal text-slate-400 ml-1">{subvalue}</span>}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function MyChallengesSection({
  challenges,
  isLoading,
  onLogEntry,
  onSelect,
}: {
  challenges: any[];
  isLoading: boolean;
  onLogEntry: (id: string) => void;
  onSelect: (challenge: any) => void;
}) {
  if (isLoading) return <ChallengesSkeleton />;

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium">No active challenges</h3>
        <p className="text-slate-500 mt-1">Browse challenges or create your own to get started</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onLogEntry={() => onLogEntry(challenge.id)}
          onClick={() => onSelect(challenge)}
        />
      ))}
    </div>
  );
}

function ChallengeCard({
  challenge,
  onLogEntry,
  onClick,
}: {
  challenge: any;
  onLogEntry: () => void;
  onClick: () => void;
}) {
  const progress = challenge.currentStreak || 0;
  const total = challenge.targetDays || 30;
  const percent = Math.min((progress / total) * 100, 100);
  const todayLogged = challenge.loggedToday || false;

  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{challenge.emoji || '🎯'}</span>
            <div>
              <h3 className="font-semibold">{challenge.title}</h3>
              <p className="text-sm text-slate-500">{challenge.category || 'Personal'}</p>
            </div>
          </div>
          {challenge.isPublic && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
              Public
            </span>
          )}
        </div>

        {challenge.description && (
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">{challenge.description}</p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Progress</span>
            <span className="font-medium">
              {progress}/{total} days
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
          <span className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            {challenge.currentStreak || 0} streak
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Best: {challenge.longestStreak || 0}
          </span>
          {challenge.participantsCount && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {challenge.participantsCount}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLogEntry();
            }}
            disabled={todayLogged}
            className={cn(
              'flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
              todayLogged
                ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90 text-white'
            )}
          >
            {todayLogged ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Logged Today
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Log Entry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function BrowseChallengesSection({
  challenges,
  isLoading,
  onJoin,
  isJoining,
}: {
  challenges: any[];
  isLoading: boolean;
  onJoin: (id: string) => void;
  isJoining: boolean;
}) {
  if (isLoading) return <ChallengesSkeleton />;

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Target className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium">No challenges to browse</h3>
        <p className="text-slate-500 mt-1">Create a public challenge to share with the community</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className="bg-slate-900/50 rounded-xl border border-white/10 p-5 hover:border-white/20 transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{challenge.emoji || '🎯'}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{challenge.title}</h3>
              <p className="text-xs text-slate-500">{challenge.targetDays || 30} days</p>
            </div>
          </div>
          {challenge.description && (
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{challenge.description}</p>
          )}
          <div className="flex items-center gap-3 text-sm text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {challenge.participantsCount || 0} joined
            </span>
          </div>
          <button
            onClick={() => onJoin(challenge.id)}
            disabled={isJoining}
            className="w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
          >
            Join Challenge
          </button>
        </div>
      ))}
    </div>
  );
}

function CompletedChallengesSection({
  challenges,
  isLoading,
}: {
  challenges: any[];
  isLoading: boolean;
}) {
  if (isLoading) return <ChallengesSkeleton />;

  if (challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-medium">No completed challenges yet</h3>
        <p className="text-slate-500 mt-1">Complete your first challenge to see it here</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {challenges.map((challenge) => (
        <div
          key={challenge.id}
          className="bg-slate-900/50 rounded-xl border border-green-500/30 p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{challenge.emoji || '🎯'}</span>
            <div className="flex-1">
              <h3 className="font-semibold">{challenge.title}</h3>
              <span className="text-xs text-green-400">✓ Completed</span>
            </div>
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Final streak: {challenge.longestStreak || challenge.targetDays} days</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CreateChallengeModal({
  onClose,
  onCreate,
  isLoading,
}: {
  onClose: () => void;
  onCreate: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '🎯',
    targetDays: 30,
    category: 'PERSONAL',
    isPublic: false,
  });

  const emojis = ['🎯', '🔥', '💪', '🧘', '📚', '🏃', '🎨', '💼', '🌱', '⭐'];
  const categories = ['PERSONAL', 'FITNESS', 'LEARNING', 'MINDFULNESS', 'PRODUCTIVITY', 'SOCIAL'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      targetDays: Number(formData.targetDays),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Create Challenge</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Emoji */}
          <div>
            <label className="block text-sm font-medium mb-2">Emoji</label>
            <div className="flex gap-2 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, emoji })}
                  className={cn(
                    'w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all',
                    formData.emoji === emoji
                      ? 'bg-primary text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., 30-Day Meditation Challenge"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
              placeholder="What's this challenge about?"
            />
          </div>

          {/* Duration & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (days)</label>
              <input
                type="number"
                value={formData.targetDays}
                onChange={(e) => setFormData({ ...formData, targetDays: e.target.value as any })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
                max="365"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Public toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-5 h-5 rounded border-white/10 bg-slate-800 text-primary focus:ring-primary"
            />
            <span className="text-sm">Make this challenge public for others to join</span>
          </label>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title}
              className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChallengesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-slate-900/50 rounded-xl border border-white/10 p-5 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/4 mt-2" />
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
