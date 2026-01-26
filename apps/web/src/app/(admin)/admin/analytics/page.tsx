'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const analyticsData = {
  userGrowth: [
    { month: 'Jan', users: 8420 },
    { month: 'Feb', users: 9150 },
    { month: 'Mar', users: 9890 },
    { month: 'Apr', users: 10450 },
    { month: 'May', users: 11200 },
    { month: 'Jun', users: 12847 },
  ],
  engagement: {
    dailyActiveUsers: 2847,
    weeklyActiveUsers: 8420,
    monthlyActiveUsers: 11500,
    avgSessionDuration: '24m 32s',
    tasksPerUser: 4.2,
    challengeParticipation: '67%',
  },
  retention: {
    day1: 78,
    day7: 54,
    day30: 42,
    day90: 31,
  },
  topFeatures: [
    { name: 'Task Management', usage: 94 },
    { name: 'Weekly Sprints', usage: 87 },
    { name: 'Challenges', usage: 76 },
    { name: 'Community', usage: 68 },
    { name: 'Pomodoro', usage: 45 },
  ],
  revenue: {
    mrr: 48290,
    arr: 579480,
    avgRevenuePerUser: 12.50,
    churnRate: 2.3,
    ltv: 156,
  },
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          <p className="text-slate-400">Track performance and user behavior</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', 'All'].map((period) => (
            <button
              key={period}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                period === '30d' ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* User Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-4">
              {analyticsData.userGrowth.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.users / 15000) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-primary-500 to-purple-500 rounded-t-lg relative group"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-700 px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {data.users.toLocaleString()} users
                    </div>
                  </motion.div>
                  <span className="text-xs text-slate-400 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-blue-400">
                    {analyticsData.engagement.dailyActiveUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Daily Active Users</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-green-400">
                    {analyticsData.engagement.avgSessionDuration}
                  </div>
                  <div className="text-sm text-slate-400">Avg Session Duration</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-purple-400">
                    {analyticsData.engagement.tasksPerUser}
                  </div>
                  <div className="text-sm text-slate-400">Tasks/User (Daily)</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-orange-400">
                    {analyticsData.engagement.challengeParticipation}
                  </div>
                  <div className="text-sm text-slate-400">Challenge Participation</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Retention */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle>Retention Cohorts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.retention).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-400">
                        Day {key.replace('day', '')} Retention
                      </span>
                      <span className="text-sm font-medium">{value}%</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${
                          value >= 50 ? 'bg-green-500' : value >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle>Feature Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.topFeatures.map((feature, index) => (
                  <div key={feature.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{feature.name}</span>
                      <span className="text-sm text-slate-400">{feature.usage}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.usage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary-500 to-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle>Revenue Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-green-400">
                    ${analyticsData.revenue.mrr.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Monthly Recurring Revenue</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-blue-400">
                    ${analyticsData.revenue.arr.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-400">Annual Run Rate</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="text-2xl font-bold text-purple-400">
                    ${analyticsData.revenue.avgRevenuePerUser}
                  </div>
                  <div className="text-sm text-slate-400">ARPU</div>
                </div>
                <div className="p-4 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-orange-400">
                      {analyticsData.revenue.churnRate}%
                    </div>
                    <Badge variant="success" className="text-xs">↓ 0.5%</Badge>
                  </div>
                  <div className="text-sm text-slate-400">Monthly Churn</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
