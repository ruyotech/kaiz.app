'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LIFE_WHEEL_AREAS } from '@/types';

const generateCalendarDays = () => {
  const days = [];
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();

  // Add empty cells for days before start of month
  for (let i = 0; i < startDay; i++) {
    days.push({ date: null, tasks: [] });
  }

  // Add days of month
  for (let d = 1; d <= endOfMonth.getDate(); d++) {
    const date = new Date(today.getFullYear(), today.getMonth(), d);
    const isToday = d === today.getDate();
    const isPast = date < new Date(today.toDateString());

    // Generate random tasks for demo
    const areaKeys = Object.keys(LIFE_WHEEL_AREAS);
    const tasks =
      Math.random() > 0.6
        ? [
            {
              id: d * 100 + 1,
              title: ['Meeting', 'Review', 'Call', 'Workout'][Math.floor(Math.random() * 4)],
              area: areaKeys[Math.floor(Math.random() * areaKeys.length)],
              completed: isPast ? Math.random() > 0.3 : false,
            },
          ]
        : [];

    if (Math.random() > 0.8 && tasks.length > 0) {
      tasks.push({
        id: d * 100 + 2,
        title: ['Project', 'Study', 'Meditate', 'Read'][Math.floor(Math.random() * 4)],
        area: areaKeys[Math.floor(Math.random() * areaKeys.length)],
        completed: isPast ? Math.random() > 0.3 : false,
      });
    }

    days.push({ date: d, isToday, isPast, tasks });
  }

  return days;
};

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate());
  const calendarDays = generateCalendarDays();
  const today = new Date();

  const selectedDayData = calendarDays.find((d) => d.date === selectedDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{months[today.getMonth()]} {today.getFullYear()}</h2>
          <p className="text-slate-400">Plan and track your days</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10">←</button>
          <button className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600">Today</button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10">→</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardContent className="p-4">
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-sm text-slate-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => day.date && setSelectedDate(day.date)}
                    className={cn(
                      'aspect-square p-1 rounded-lg transition-all cursor-pointer',
                      day.date && 'hover:bg-white/10',
                      day.isToday && 'ring-2 ring-primary-500',
                      day.date === selectedDate && 'bg-primary-500/20',
                      !day.date && 'cursor-default'
                    )}
                  >
                    {day.date && (
                      <div className="h-full flex flex-col">
                        <div
                          className={cn(
                            'text-sm',
                            day.isToday && 'text-primary-400 font-bold',
                            day.isPast && 'text-slate-500'
                          )}
                        >
                          {day.date}
                        </div>
                        <div className="flex-1 flex flex-wrap gap-0.5 mt-1">
                          {day.tasks.slice(0, 3).map((task: any) => {
                            const area = LIFE_WHEEL_AREAS[task.area as keyof typeof LIFE_WHEEL_AREAS];
                            return (
                              <div
                                key={task.id}
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  task.completed && 'opacity-40'
                                )}
                                style={{ backgroundColor: area?.color }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Day Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle>
                {selectedDate ? (
                  <>
                    {months[today.getMonth()]} {selectedDate}
                    {selectedDate === today.getDate() && (
                      <Badge variant="level" className="ml-2">Today</Badge>
                    )}
                  </>
                ) : (
                  'Select a day'
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDayData?.tasks && selectedDayData.tasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayData.tasks.map((task: any) => {
                    const area = LIFE_WHEEL_AREAS[task.area as keyof typeof LIFE_WHEEL_AREAS];
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg bg-white/5',
                          task.completed && 'opacity-50'
                        )}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area?.color }}
                        />
                        <span className={cn(task.completed && 'line-through')}>
                          {task.title}
                        </span>
                        {task.completed && (
                          <Badge variant="success" className="ml-auto text-xs">
                            ✓ Done
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">📅</div>
                  <div>No tasks for this day</div>
                  <button className="mt-4 text-primary-400 hover:underline">
                    + Add a task
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-slate-800/50 border-white/10 mt-4">
            <CardHeader>
              <CardTitle className="text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">18</div>
                  <div className="text-xs text-slate-500">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">7</div>
                  <div className="text-xs text-slate-500">Days Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">85%</div>
                  <div className="text-xs text-slate-500">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">45</div>
                  <div className="text-xs text-slate-500">Story Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
