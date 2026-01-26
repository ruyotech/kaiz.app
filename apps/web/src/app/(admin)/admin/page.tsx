'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const overviewStats = [
  { label: 'Total Users', value: '12,847', change: '+12%', icon: '👥', color: 'text-blue-400' },
  { label: 'Active Today', value: '2,847', change: '+8%', icon: '🟢', color: 'text-green-400' },
  { label: 'New Signups (7d)', value: '847', change: '+24%', icon: '📈', color: 'text-purple-400' },
  { label: 'Revenue (MTD)', value: '$48,290', change: '+18%', icon: '💰', color: 'text-yellow-400' },
  { label: 'Active Challenges', value: '1,247', change: '+5%', icon: '🎯', color: 'text-pink-400' },
  { label: 'Sprints Completed', value: '8,432', change: '+15%', icon: '🏁', color: 'text-cyan-400' },
];

const recentActivity = [
  { type: 'signup', user: 'jessica@example.com', time: '2 minutes ago' },
  { type: 'subscription', user: 'marcus@example.com', plan: 'Pro', time: '5 minutes ago' },
  { type: 'challenge_created', user: 'Admin', name: 'February Fitness', time: '15 minutes ago' },
  { type: 'report', reason: 'Spam content', time: '32 minutes ago' },
  { type: 'signup', user: 'priya@example.com', time: '45 minutes ago' },
];

const systemHealth = [
  { name: 'API Response Time', value: 45, unit: 'ms', status: 'healthy' },
  { name: 'Database Load', value: 23, unit: '%', status: 'healthy' },
  { name: 'Memory Usage', value: 67, unit: '%', status: 'warning' },
  { name: 'Active Connections', value: 847, unit: '', status: 'healthy' },
];

const topCountries = [
  { country: 'United States', users: 4521, percentage: 35 },
  { country: 'United Kingdom', users: 1847, percentage: 14 },
  { country: 'Germany', users: 1234, percentage: 10 },
  { country: 'Canada', users: 987, percentage: 8 },
  { country: 'Australia', users: 756, percentage: 6 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-slate-800/50 border-white/10 hover:border-white/20 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{stat.icon}</span>
                  <Badge
                    variant={stat.change.startsWith('+') ? 'success' : 'destructive'}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        activity.type === 'signup'
                          ? 'bg-green-500/20'
                          : activity.type === 'subscription'
                          ? 'bg-purple-500/20'
                          : activity.type === 'challenge_created'
                          ? 'bg-blue-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {activity.type === 'signup' && '👤'}
                      {activity.type === 'subscription' && '💎'}
                      {activity.type === 'challenge_created' && '🎯'}
                      {activity.type === 'report' && '⚠️'}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        {activity.type === 'signup' && (
                          <>
                            New user: <span className="text-green-400">{activity.user}</span>
                          </>
                        )}
                        {activity.type === 'subscription' && (
                          <>
                            <span className="text-purple-400">{activity.user}</span> upgraded to{' '}
                            <Badge variant="level">{activity.plan}</Badge>
                          </>
                        )}
                        {activity.type === 'challenge_created' && (
                          <>
                            New challenge: <span className="text-blue-400">{activity.name}</span>
                          </>
                        )}
                        {activity.type === 'report' && (
                          <>
                            Content report: <span className="text-red-400">{activity.reason}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealth.map((metric) => (
                  <div key={metric.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{metric.name}</span>
                      <span
                        className={`text-sm font-medium ${
                          metric.status === 'healthy'
                            ? 'text-green-400'
                            : metric.status === 'warning'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}
                      >
                        {metric.value}
                        {metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={typeof metric.value === 'number' ? Math.min(metric.value, 100) : 0}
                      className="h-2"
                      indicatorClassName={
                        metric.status === 'healthy'
                          ? 'bg-green-500'
                          : metric.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Geographic Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User Distribution by Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {topCountries.map((country, index) => (
                <div key={country.country} className="text-center p-4 rounded-lg bg-white/5">
                  <div className="text-3xl mb-2">
                    {['🇺🇸', '🇬🇧', '🇩🇪', '🇨🇦', '🇦🇺'][index]}
                  </div>
                  <div className="font-semibold">{country.country}</div>
                  <div className="text-2xl font-bold text-primary-400">
                    {country.users.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">{country.percentage}% of total</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
