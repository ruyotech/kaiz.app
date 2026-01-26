'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">Change Photo</Button>
                <p className="text-xs text-slate-500 mt-1">JPG, PNG. Max 5MB</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <Input defaultValue="John Doe" className="bg-slate-700/50 border-white/10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input defaultValue="john@example.com" className="bg-slate-700/50 border-white/10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <Input defaultValue="@johndoe" className="bg-slate-700/50 border-white/10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <Input defaultValue="America/New_York" className="bg-slate-700/50 border-white/10" />
              </div>
            </div>

            <Button variant="gradient">Save Changes</Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subscription */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-gradient-to-r from-primary-500/20 to-purple-500/20 border-primary-500/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subscription</CardTitle>
              <Badge variant="level">Pro Plan</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">$9.99/month</div>
                <p className="text-slate-400">Next billing: March 15, 2025</p>
              </div>
              <Button variant="outline">Manage Plan</Button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center p-4 rounded-lg bg-white/5">
              <div>
                <div className="text-lg font-bold text-green-400">✓</div>
                <div className="text-xs text-slate-400">Unlimited Tasks</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">✓</div>
                <div className="text-xs text-slate-400">All Challenges</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-400">✓</div>
                <div className="text-xs text-slate-400">Priority Support</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Daily Reminders', description: 'Get reminded about your daily tasks', enabled: true },
              { label: 'Sprint Updates', description: 'Notifications about sprint progress', enabled: true },
              { label: 'Challenge Invites', description: 'Get notified when friends invite you', enabled: true },
              { label: 'Community Activity', description: 'Updates from people you follow', enabled: false },
              { label: 'Marketing Emails', description: 'Tips, updates, and promotions', enabled: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.enabled} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy & Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-slate-800/50 border-white/10">
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-slate-500">Add an extra layer of security</div>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">Profile Visibility</div>
                <div className="text-sm text-slate-500">Who can see your profile</div>
              </div>
              <Badge variant="secondary">Public</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">Change Password</div>
                <div className="text-sm text-slate-500">Last changed 30 days ago</div>
              </div>
              <Button variant="outline" size="sm">Update</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardHeader>
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-slate-500">Download all your data</div>
              </div>
              <Button variant="outline" size="sm">Export</Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div>
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-slate-500">Permanently delete your account and data</div>
              </div>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
