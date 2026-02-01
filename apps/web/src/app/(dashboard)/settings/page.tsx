'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  LogOut,
  Save,
  Camera,
  RefreshCw,
} from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance' | 'language';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
    { id: 'language' as SettingsTab, label: 'Language', icon: Globe },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-xl font-bold">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <div>
                  <div className="font-medium">{user?.fullName}</div>
                  <div className="text-sm text-slate-400">{user?.email}</div>
                </div>
              </div>
            </div>
            <nav className="p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              <hr className="my-2 border-white/10" />
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-900/50 rounded-xl border border-white/10">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'language' && <LanguageSettings />}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 text-white font-medium transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSettings({ user }: { user: any }) {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Profile Settings</h2>

      {/* Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-3xl font-bold">
            {user?.firstName?.[0] || 'U'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center hover:bg-slate-700 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>
        <div>
          <button className="text-sm text-primary hover:underline">
            Upload new photo
          </button>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG. Max size 2MB</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            First Name
          </label>
          <input
            type="text"
            defaultValue={user?.firstName || ''}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Last Name
          </label>
          <input
            type="text"
            defaultValue={user?.lastName || ''}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Email Address
        </label>
        <input
          type="email"
          defaultValue={user?.email || ''}
          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Username
        </label>
        <input
          type="text"
          defaultValue={user?.username || ''}
          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Bio
        </label>
        <textarea
          rows={3}
          placeholder="Tell us about yourself..."
          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          Timezone
        </label>
        <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
        </select>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Notification Preferences</h2>

      <div className="space-y-4">
        <NotificationToggle
          title="Push Notifications"
          description="Receive push notifications on your device"
          defaultChecked={true}
        />
        <NotificationToggle
          title="Email Notifications"
          description="Receive important updates via email"
          defaultChecked={true}
        />
        <NotificationToggle
          title="Task Reminders"
          description="Get reminded about upcoming tasks"
          defaultChecked={true}
        />
        <NotificationToggle
          title="Challenge Updates"
          description="Notifications about your challenge progress"
          defaultChecked={true}
        />
        <NotificationToggle
          title="Community Activity"
          description="Updates about community interactions"
          defaultChecked={false}
        />
        <NotificationToggle
          title="Weekly Summary"
          description="Receive a weekly summary of your progress"
          defaultChecked={true}
        />
        <NotificationToggle
          title="Mindset Quotes"
          description="Daily motivational quotes and mindset content"
          defaultChecked={true}
        />
      </div>
    </div>
  );
}

function NotificationToggle({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-slate-400">{description}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Security Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Current Password
          </label>
          <input
            type="password"
            placeholder="Enter current password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <hr className="border-white/10" />

        <NotificationToggle
          title="Two-Factor Authentication"
          description="Add an extra layer of security to your account"
          defaultChecked={false}
        />

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <h3 className="font-medium mb-3">Active Sessions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">MacBook Pro - Chrome</div>
                <div className="text-xs text-slate-500">Current session</div>
              </div>
              <span className="text-xs text-green-400">Active now</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">iPhone 15 - KAIZ App</div>
                <div className="text-xs text-slate-500">Last active 2 hours ago</div>
              </div>
              <button className="text-xs text-red-400 hover:underline">Revoke</button>
            </div>
          </div>
        </div>

        <button className="text-sm text-red-400 hover:underline">
          Sign out of all devices
        </button>
      </div>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Appearance</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Dark', 'Light', 'System'].map((theme) => (
              <button
                key={theme}
                className={cn(
                  'p-4 rounded-lg border text-center transition-all',
                  theme === 'Dark'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-white/10 hover:border-white/20 text-slate-400'
                )}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-3">
            Accent Color
          </label>
          <div className="flex gap-3">
            {['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map(
              (color) => (
                <button
                  key={color}
                  className={cn(
                    'w-10 h-10 rounded-full transition-transform hover:scale-110',
                    color === '#0ea5e9' && 'ring-2 ring-offset-2 ring-offset-slate-900'
                  )}
                  style={{ backgroundColor: color }}
                />
              )
            )}
          </div>
        </div>

        <NotificationToggle
          title="Compact Mode"
          description="Use smaller spacing and fonts"
          defaultChecked={false}
        />

        <NotificationToggle
          title="Animations"
          description="Enable interface animations"
          defaultChecked={true}
        />
      </div>
    </div>
  );
}

function LanguageSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Language & Region</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Language
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Region
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="CA">Canada</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Date Format
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Time Format
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="12h">12-hour (2:30 PM)</option>
            <option value="24h">24-hour (14:30)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            First Day of Week
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
            <option value="saturday">Saturday</option>
          </select>
        </div>
      </div>
    </div>
  );
}
