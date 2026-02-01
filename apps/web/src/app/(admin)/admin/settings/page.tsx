'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Settings,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Mail,
  Save,
  RefreshCw,
  Key,
  Database,
  Server,
  AlertTriangle,
} from 'lucide-react';

type SettingsTab = 'general' | 'notifications' | 'security' | 'billing' | 'integrations';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'general' as SettingsTab, label: 'General', icon: Settings },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'billing' as SettingsTab, label: 'Billing', icon: CreditCard },
    { id: 'integrations' as SettingsTab, label: 'Integrations', icon: Globe },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Configure platform settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary border-b-2 border-primary'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-slate-900/50 rounded-xl border border-white/10">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'billing' && <BillingSettings />}
        {activeTab === 'integrations' && <IntegrationSettings />}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
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
  );
}

function GeneralSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">General Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Platform Name
          </label>
          <input
            type="text"
            defaultValue="KAIZ"
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Support Email
          </label>
          <input
            type="email"
            defaultValue="support@kaiz.app"
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Default Timezone
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Default Language
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <div className="font-medium">Maintenance Mode</div>
            <div className="text-sm text-slate-400">
              Disable access to the platform for non-admin users
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Notification Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-slate-400" />
            <div>
              <div className="font-medium">New User Registration</div>
              <div className="text-sm text-slate-400">Get notified when new users sign up</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-slate-400" />
            <div>
              <div className="font-medium">Subscription Changes</div>
              <div className="text-sm text-slate-400">Notify on upgrades, downgrades, and cancellations</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-slate-400" />
            <div>
              <div className="font-medium">Error Alerts</div>
              <div className="text-sm text-slate-400">Receive alerts for system errors and issues</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Admin Notification Email
          </label>
          <input
            type="email"
            defaultValue="admin@kaiz.app"
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Security Settings</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-slate-400" />
            <div>
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-sm text-slate-400">Require 2FA for admin accounts</div>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            defaultValue={30}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Maximum Login Attempts
          </label>
          <input
            type="number"
            defaultValue={5}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Password Policy
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="standard">Standard (8+ characters)</option>
            <option value="strong">Strong (12+ chars, mixed case, numbers, symbols)</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-500">API Keys</div>
              <div className="text-sm text-slate-400 mt-1">
                Manage API keys for external integrations in the developer console.
              </div>
              <button className="text-sm text-primary hover:underline mt-2">
                Open Developer Console →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Billing Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Currency
          </label>
          <select className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            defaultValue={0}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
          <div>
            <div className="font-medium">Trial Period</div>
            <div className="text-sm text-slate-400">Enable free trial for new users</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Trial Duration (days)
          </label>
          <input
            type="number"
            defaultValue={14}
            className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-slate-400" />
            <div className="font-medium">Stripe Integration</div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Publishable Key</label>
              <input
                type="text"
                placeholder="pk_live_..."
                className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Secret Key</label>
              <input
                type="password"
                placeholder="sk_live_..."
                className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IntegrationSettings() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-lg font-semibold">Integrations</h2>

      <div className="space-y-4">
        <div className="p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-sm text-slate-400">Sync user calendars</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              Connected
            </span>
          </div>
          <input
            type="text"
            placeholder="Google Calendar API Key"
            defaultValue="AIzaSy..."
            className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium">Apple Health</div>
                <div className="text-sm text-slate-400">Health data integration</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              Connected
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Apple Health integration is configured via mobile app settings.
          </p>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium">Email Service (SendGrid)</div>
                <div className="text-sm text-slate-400">Transactional emails</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              Connected
            </span>
          </div>
          <input
            type="password"
            placeholder="SendGrid API Key"
            defaultValue="SG..."
            className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium">Push Notifications (Firebase)</div>
                <div className="text-sm text-slate-400">Mobile push notifications</div>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
              Setup Required
            </span>
          </div>
          <button className="text-sm text-primary hover:underline">
            Configure Firebase →
          </button>
        </div>
      </div>
    </div>
  );
}
