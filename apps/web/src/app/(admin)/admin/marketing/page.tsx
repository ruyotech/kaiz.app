'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Users, 
  Trophy, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Target,
  Sparkles,
  Send,
  Edit,
  Eye,
  Clock,
  Plus,
  BarChart3,
  Mail,
  Bell,
  Gift,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Marketing campaign stats
const campaignStats = [
  { label: 'Active Campaigns', value: '8', icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  { label: 'Email Subscribers', value: '45,892', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { label: 'Push Notifications', value: '12,847', icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { label: 'Referral Signups', value: '2,341', icon: Users, color: 'text-green-400', bg: 'bg-green-500/20' },
];

// Community engagement metrics
const communityMetrics = [
  { label: 'Daily Active Users', value: 2847, max: 5000, trend: '+12%' },
  { label: 'Weekly Challenges Joined', value: 4521, max: 6000, trend: '+24%' },
  { label: 'Community Posts', value: 847, max: 1000, trend: '+18%' },
  { label: 'Templates Downloaded', value: 3241, max: 4000, trend: '+32%' },
];

// Active campaigns
const campaigns = [
  {
    id: 1,
    name: 'New Year Resolution Sprint',
    type: 'challenge',
    status: 'active',
    participants: 4521,
    target: 5000,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    engagement: 87,
  },
  {
    id: 2,
    name: 'Referral Bonus February',
    type: 'referral',
    status: 'scheduled',
    participants: 0,
    target: 1000,
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    engagement: 0,
  },
  {
    id: 3,
    name: 'Pro Trial Extended',
    type: 'promotion',
    status: 'active',
    participants: 847,
    target: 2000,
    startDate: '2026-01-15',
    endDate: '2026-01-31',
    engagement: 62,
  },
  {
    id: 4,
    name: 'Community Challenge: 30-Day Streak',
    type: 'challenge',
    status: 'active',
    participants: 2341,
    target: 3000,
    startDate: '2026-01-10',
    endDate: '2026-02-10',
    engagement: 78,
  },
];

// Viral hooks - key engagement features
const viralHooks = [
  {
    name: 'Leaderboard Competition',
    description: 'Public rankings driving engagement',
    active: true,
    impact: 'High',
    users: 8432,
  },
  {
    name: 'Streak Showcase',
    description: 'Display user streaks on profile',
    active: true,
    impact: 'High',
    users: 12847,
  },
  {
    name: 'Achievement Badges',
    description: 'Shareable badges for milestones',
    active: true,
    impact: 'Medium',
    users: 6234,
  },
  {
    name: 'Success Stories',
    description: 'User transformation highlights',
    active: true,
    impact: 'High',
    users: 1247,
  },
  {
    name: 'Referral Rewards',
    description: 'Free month for referring friends',
    active: true,
    impact: 'High',
    users: 2341,
  },
  {
    name: 'Weekly Challenges',
    description: 'Time-limited community events',
    active: true,
    impact: 'Critical',
    users: 4521,
  },
];

// Scheduled content
const scheduledContent = [
  { type: 'email', title: 'Weekly Sprint Recap', scheduled: '2026-01-26 09:00', recipients: 45892 },
  { type: 'push', title: 'Challenge Reminder', scheduled: '2026-01-26 18:00', recipients: 4521 },
  { type: 'email', title: 'February Feature Preview', scheduled: '2026-01-28 10:00', recipients: 45892 },
  { type: 'push', title: 'Weekend Motivation', scheduled: '2026-01-25 08:00', recipients: 12847 },
];

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'viral' | 'scheduled'>('campaigns');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketing & Growth</h1>
          <p className="text-slate-400 mt-1">Manage campaigns, community engagement, and viral hooks</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-slate-600 hover:border-primary-500">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button className="bg-primary-500 hover:bg-primary-600">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {campaignStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Community Engagement Metrics */}
      <Card className="bg-slate-800/50 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Community Engagement (This Week)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityMetrics.map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">{metric.label}</span>
                  <Badge variant="success" className="text-xs">{metric.trend}</Badge>
                </div>
                <Progress 
                  value={(metric.value / metric.max) * 100} 
                  className="h-2 bg-slate-700"
                />
                <div className="flex justify-between text-xs">
                  <span className="text-white font-medium">{metric.value.toLocaleString()}</span>
                  <span className="text-slate-500">Target: {metric.max.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {[
          { id: 'campaigns', label: 'Active Campaigns', icon: Megaphone },
          { id: 'viral', label: 'Viral Hooks', icon: Sparkles },
          { id: 'scheduled', label: 'Scheduled Content', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    campaign.type === 'challenge' ? 'bg-purple-500/20' :
                    campaign.type === 'referral' ? 'bg-green-500/20' : 'bg-orange-500/20'
                  }`}>
                    {campaign.type === 'challenge' ? <Trophy className="w-5 h-5 text-purple-400" /> :
                     campaign.type === 'referral' ? <Users className="w-5 h-5 text-green-400" /> :
                     <Gift className="w-5 h-5 text-orange-400" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'active' ? 'success' : 'default'}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                      <span>{campaign.startDate} - {campaign.endDate}</span>
                      <span>•</span>
                      <span>{campaign.participants.toLocaleString()} / {campaign.target.toLocaleString()} participants</span>
                    </div>
                  </div>

                  {campaign.status === 'active' && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">{campaign.engagement}%</div>
                      <div className="text-xs text-slate-400">Engagement</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {campaign.status === 'active' && (
                  <div className="mt-4">
                    <Progress 
                      value={(campaign.participants / campaign.target) * 100}
                      className="h-2 bg-slate-700"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Viral Hooks Tab */}
      {activeTab === 'viral' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {viralHooks.map((hook) => (
            <Card key={hook.name} className="bg-slate-800/50 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{hook.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{hook.description}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${hook.active ? 'bg-green-500' : 'bg-slate-500'}`} />
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={
                      hook.impact === 'Critical' ? 'destructive' :
                      hook.impact === 'High' ? 'success' : 'default'
                    }
                  >
                    {hook.impact} Impact
                  </Badge>
                  <span className="text-sm text-slate-400">
                    {hook.users.toLocaleString()} users
                  </span>
                </div>

                <Button variant="outline" size="sm" className="w-full mt-4 border-slate-600">
                  Configure
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scheduled Content Tab */}
      {activeTab === 'scheduled' && (
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Scheduled Communications</CardTitle>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-1" />
              Schedule New
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledContent.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    item.type === 'email' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {item.type === 'email' ? 
                      <Mail className="w-4 h-4 text-blue-400" /> : 
                      <Bell className="w-4 h-4 text-purple-400" />
                    }
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{item.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-3 h-3" />
                      {item.scheduled}
                      <span>•</span>
                      <span>{item.recipients.toLocaleString()} recipients</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Send Push Notification', icon: Bell, color: 'purple' },
          { label: 'Create Challenge', icon: Trophy, color: 'yellow' },
          { label: 'Launch Referral Campaign', icon: Users, color: 'green' },
          { label: 'Email Newsletter', icon: Mail, color: 'blue' },
        ].map((action) => (
          <Button
            key={action.label}
            variant="outline"
            className={`h-auto py-4 border-slate-700 hover:border-${action.color}-500/50 hover:bg-${action.color}-500/10 flex flex-col gap-2`}
          >
            <action.icon className={`w-5 h-5 text-${action.color}-400`} />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
