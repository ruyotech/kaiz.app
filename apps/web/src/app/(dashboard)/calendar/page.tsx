'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { taskApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getAll(),
  });

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Generate calendar grid
  const generateCalendarDays = () => {
    const days = [];

    // Previous month days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(
      new Date(year, direction === 'prev' ? month - 1 : month + 1, 1)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-slate-400 text-sm mt-1">
            Plan and organize your schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <button
              onClick={() => setView('month')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                view === 'month'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                view === 'week'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Week
            </button>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-medium transition-all">
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            {/* Month Navigation */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="p-2 text-center text-sm font-medium text-slate-400"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day.date);
                const hasCompletedTasks = dayTasks.some(
                  (t: any) => t.status === 'DONE'
                );
                const hasPendingTasks = dayTasks.some(
                  (t: any) => t.status !== 'DONE'
                );

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      'min-h-[80px] p-2 border-b border-r border-white/5 text-left transition-all hover:bg-white/5',
                      !day.isCurrentMonth && 'opacity-40',
                      isSelected(day.date) && 'bg-primary/10 border-primary/50',
                      isToday(day.date) && 'bg-primary/5'
                    )}
                  >
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-sm mb-1',
                        isToday(day.date) && 'bg-primary text-white',
                        isSelected(day.date) && !isToday(day.date) && 'bg-white/10'
                      )}
                    >
                      {day.date.getDate()}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className="flex gap-1">
                        {hasPendingTasks && (
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        )}
                        {hasCompletedTasks && (
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-semibold">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Select a date'}
                  </h3>
                  {selectedDate && (
                    <p className="text-sm text-slate-400">
                      {selectedDateTasks.length} task
                      {selectedDateTasks.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4">
              {!selectedDate ? (
                <p className="text-center text-slate-400 py-8">
                  Click on a date to see tasks
                </p>
              ) : selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">No tasks for this day</p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" />
                    Add Task
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className={cn(
                        'p-3 rounded-lg border transition-all cursor-pointer hover:border-white/20',
                        task.status === 'DONE'
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-slate-800/50 border-white/10'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5',
                            task.status === 'DONE'
                              ? 'border-green-500 bg-green-500'
                              : 'border-slate-500'
                          )}
                        >
                          {task.status === 'DONE' && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div
                            className={cn(
                              'font-medium',
                              task.status === 'DONE' && 'line-through text-slate-400'
                            )}
                          >
                            {task.title}
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden mt-4">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold">Upcoming This Week</h3>
            </div>
            <div className="p-4">
              {tasks
                .filter((task: any) => {
                  if (!task.dueDate || task.status === 'DONE') return false;
                  const taskDate = new Date(task.dueDate);
                  const weekFromNow = new Date();
                  weekFromNow.setDate(weekFromNow.getDate() + 7);
                  return taskDate >= today && taskDate <= weekFromNow;
                })
                .slice(0, 5)
                .map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{task.title}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              {tasks.filter((task: any) => {
                if (!task.dueDate || task.status === 'DONE') return false;
                const taskDate = new Date(task.dueDate);
                const weekFromNow = new Date();
                weekFromNow.setDate(weekFromNow.getDate() + 7);
                return taskDate >= today && taskDate <= weekFromNow;
              }).length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">
                  No upcoming tasks
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
