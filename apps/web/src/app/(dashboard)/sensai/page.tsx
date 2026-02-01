'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sensaiApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  Brain,
  Sparkles,
  MessageCircle,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function SensaiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm SensAI, your personal AI coach. I'm here to help you with productivity, goal setting, time management, and personal development. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['sensai-settings'],
    queryFn: sensaiApi.getSettings,
  });

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (in real app, this would call the API)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const quickPrompts = [
    { icon: Target, text: "Help me set goals for this week" },
    { icon: Clock, text: "How can I improve my time management?" },
    { icon: Calendar, text: "Review my daily routine" },
    { icon: CheckCircle2, text: "Suggest tasks for today" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">SensAI</h1>
            <p className="text-slate-400 text-sm">Your AI-powered personal coach</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Messages */}
        <div className="flex-1 flex flex-col bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    message.role === 'assistant'
                      ? 'bg-gradient-to-br from-primary to-cyan-500'
                      : 'bg-slate-700'
                  )}
                >
                  {message.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-white" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-3',
                    message.role === 'assistant'
                      ? 'bg-slate-800/80 rounded-tl-sm'
                      : 'bg-primary/20 rounded-tr-sm'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-slate-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-4">
              <p className="text-xs text-slate-500 mb-2">Quick prompts:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => sendMessage(prompt.text)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-left text-sm transition-colors"
                    >
                      <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-slate-300 truncate">{prompt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SensAI anything..."
                className="flex-1 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="w-80 hidden lg:flex flex-col gap-4">
          {/* AI Insights */}
          <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">AI Insights</h3>
            </div>
            <div className="space-y-3">
              <InsightCard
                icon={<Target className="w-4 h-4 text-blue-400" />}
                title="Goal Progress"
                description="You're 78% towards your weekly goal"
                color="bg-blue-500/10"
              />
              <InsightCard
                icon={<Clock className="w-4 h-4 text-green-400" />}
                title="Productivity Peak"
                description="Your most productive hours: 9-11 AM"
                color="bg-green-500/10"
              />
              <InsightCard
                icon={<Lightbulb className="w-4 h-4 text-yellow-400" />}
                title="Suggestion"
                description="Consider a 15-min break after your next task"
                color="bg-yellow-500/10"
              />
            </div>
          </div>

          {/* Daily Standup */}
          <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Daily Standup</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400 text-xs mb-1">Yesterday</p>
                <p className="text-slate-300">Completed 5 tasks, 2 challenges</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Today's Focus</p>
                <p className="text-slate-300">3 tasks planned, 1 meeting</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs mb-1">Blockers</p>
                <p className="text-slate-300">None reported</p>
              </div>
            </div>
            <button className="w-full mt-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">
              Update Standup
            </button>
          </div>

          {/* Coaching Mode */}
          <div className="bg-slate-900/50 rounded-xl border border-white/10 p-4">
            <h3 className="font-semibold mb-3">Coaching Mode</h3>
            <div className="space-y-2">
              {['Productivity', 'Wellness', 'Goals', 'Learning'].map((mode) => (
                <button
                  key={mode}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg text-sm text-left transition-all',
                    mode === 'Productivity'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className={cn('p-3 rounded-lg', color)}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
  );
}

function getAIResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('goal') || lowerMessage.includes('week')) {
    return "Great question! Here's how I suggest setting effective weekly goals:\n\n1. **Review last week** - What worked? What didn't?\n2. **Identify 3-5 key priorities** - Focus on impact, not quantity\n3. **Break them down** - Make each goal actionable with clear steps\n4. **Schedule them** - Block time in your calendar\n5. **Set check-in points** - Review progress mid-week\n\nWould you like me to help you create specific goals based on your current tasks and challenges?";
  }

  if (lowerMessage.includes('time') || lowerMessage.includes('management')) {
    return "Time management is crucial for productivity! Here are some proven strategies:\n\n⏰ **Time Blocking** - Dedicate specific hours to specific tasks\n🎯 **80/20 Rule** - Focus on the 20% that creates 80% of results\n🍅 **Pomodoro Technique** - 25 min work, 5 min break\n📵 **Digital Boundaries** - Set specific times for email/notifications\n\nBased on your activity patterns, I notice you're most productive in the morning. Consider scheduling your most important tasks between 9-11 AM.\n\nWould you like me to suggest a daily schedule template?";
  }

  if (lowerMessage.includes('routine') || lowerMessage.includes('daily')) {
    return "Looking at your recent activity, here's an analysis of your routine:\n\n📊 **Productivity Score:** 7.5/10\n⏰ **Active Hours:** 8 AM - 6 PM\n🎯 **Task Completion Rate:** 78%\n\n**Strengths:**\n✅ Consistent morning start times\n✅ Good task completion rate\n\n**Areas for Improvement:**\n⚠️ Mid-afternoon productivity dip (2-4 PM)\n⚠️ Some tasks carry over to next day\n\n**Recommendations:**\n1. Schedule breaks or lighter tasks around 2-3 PM\n2. Use time-boxing for tasks that tend to overrun\n\nWould you like specific suggestions to optimize your routine?";
  }

  if (lowerMessage.includes('task') || lowerMessage.includes('today')) {
    return "Based on your priorities and deadlines, here are my suggested tasks for today:\n\n**High Priority:**\n1. 🔴 Complete project proposal (2 hours)\n2. 🔴 Review team feedback (30 min)\n\n**Medium Priority:**\n3. 🟡 Update task board (20 min)\n4. 🟡 Prepare for tomorrow's meeting (45 min)\n\n**Low Priority:**\n5. 🟢 Organize notes (15 min)\n6. 🟢 Reply to non-urgent emails (20 min)\n\nEstimated total: ~4 hours of focused work\n\nWould you like me to add these to your task list or adjust the priorities?";
  }

  return "That's a great question! I'm here to help you with:\n\n• **Goal Setting** - Create and track meaningful goals\n• **Productivity** - Optimize your workflow and habits\n• **Time Management** - Make the most of your day\n• **Personal Growth** - Build skills and mindset\n• **Task Planning** - Prioritize and organize your work\n\nFeel free to ask me anything specific, or I can suggest some insights based on your recent activity. What would you like to explore?";
}
