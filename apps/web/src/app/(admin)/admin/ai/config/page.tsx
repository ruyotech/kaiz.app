'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getAdminAccessToken } from '@/lib/api';
import {
  Settings,
  Flag,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import * as commandCenterApi from '@/lib/api/command-center';
import type { CommandCenterSetting, FeatureFlag } from '@/types/command-center';

type Tab = 'settings' | 'flags';

export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<Tab>('settings');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Settings className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Configuration</h1>
          <p className="text-slate-400 text-sm mt-1">
            Settings and feature flags for the Scrum Master
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-0">
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'settings'
              ? 'border-primary text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('flags')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'flags'
              ? 'border-primary text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          )}
        >
          <Flag className="w-4 h-4" />
          Feature Flags
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' ? <SettingsSection /> : <FeatureFlagsSection />}
    </div>
  );
}

/* ─── Settings Section ─── */
function SettingsSection() {
  const [settings, setSettings] = useState<CommandCenterSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllSettings(token);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async (setting: CommandCenterSetting) => {
    try {
      setSaving(setting.id);
      const token = getAdminAccessToken();
      if (!token) return;
      const newValue = editedValues[setting.id] ?? setting.settingValue;
      await commandCenterApi.updateSetting(token, setting.id, { settingValue: newValue });
      setEditedValues((prev) => { const next = { ...prev }; delete next[setting.id]; return next; });
      loadSettings();
    } catch (error) {
      console.error('Failed to save setting:', error);
    } finally {
      setSaving(null);
    }
  };

  const toggleSecret = (id: string) => {
    setRevealedSecrets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-6 space-y-4">
      <p className="text-sm text-slate-400">{settings.length} setting{settings.length !== 1 ? 's' : ''} configured</p>

      <div className="space-y-3">
        {settings.map((setting) => {
          const currentValue = editedValues[setting.id] ?? setting.settingValue;
          const isModified = setting.id in editedValues;

          return (
            <div key={setting.id} className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{setting.settingKey}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {setting.settingType}
                    </span>
                  </div>
                  {setting.description && (
                    <p className="text-xs text-slate-500 mb-3">{setting.description}</p>
                  )}

                  {/* Type-specific input */}
                  {setting.settingType === 'BOOLEAN' ? (
                    <button
                      onClick={() => setEditedValues({ ...editedValues, [setting.id]: currentValue === 'true' ? 'false' : 'true' })}
                      className={cn(
                        'relative inline-flex h-6 w-11 rounded-full transition-colors',
                        currentValue === 'true' ? 'bg-primary' : 'bg-slate-700'
                      )}
                    >
                      <span className={cn(
                        'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5',
                        currentValue === 'true' ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                      )} />
                    </button>
                  ) : setting.settingType === 'NUMBER' ? (
                    <input
                      type="number"
                      className="w-48 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                      value={currentValue}
                      onChange={(e) => setEditedValues({ ...editedValues, [setting.id]: e.target.value })}
                    />
                  ) : setting.settingType === 'SECRET' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type={revealedSecrets.has(setting.id) ? 'text' : 'password'}
                        className="w-64 px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm font-mono"
                        value={currentValue}
                        onChange={(e) => setEditedValues({ ...editedValues, [setting.id]: e.target.value })}
                      />
                      <button onClick={() => toggleSecret(setting.id)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                        {revealedSecrets.has(setting.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm"
                      value={currentValue}
                      onChange={(e) => setEditedValues({ ...editedValues, [setting.id]: e.target.value })}
                    />
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={() => handleSaveSetting(setting)}
                  disabled={!isModified || saving === setting.id}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all shrink-0',
                    isModified
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  )}
                >
                  {saving === setting.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Feature Flags Section ─── */
function FeatureFlagsSection() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { loadFlags(); }, []);

  const loadFlags = async () => {
    try {
      const token = getAdminAccessToken();
      if (!token) return;
      const data = await commandCenterApi.getAllFeatureFlags(token);
      setFlags(data);
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      setToggling(flag.id);
      const token = getAdminAccessToken();
      if (!token) return;
      await commandCenterApi.updateFeatureFlag(token, flag.id, { enabled: !flag.enabled });
      loadFlags();
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[200px]">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-xl border border-white/10 p-6 space-y-4">
      <p className="text-sm text-slate-400">{flags.length} feature flag{flags.length !== 1 ? 's' : ''}</p>

      <div className="space-y-3">
        {flags.map((flag) => (
          <div key={flag.id} className="p-4 rounded-lg bg-slate-800/30 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-sm">{flag.flagName}</h3>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    flag.enabled ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  )}>
                    {flag.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mb-2">{flag.flagKey}</p>
                {flag.description && (
                  <p className="text-sm text-slate-400 mb-2">{flag.description}</p>
                )}

                {/* Rollout percentage bar */}
                {flag.rolloutPercentage !== undefined && flag.rolloutPercentage !== null && (
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500 w-16">Rollout</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          flag.enabled ? 'bg-green-500' : 'bg-slate-600'
                        )}
                        style={{ width: `${flag.rolloutPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{flag.rolloutPercentage}%</span>
                  </div>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(flag)}
                disabled={toggling === flag.id}
                className={cn(
                  'relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 ml-4',
                  flag.enabled ? 'bg-green-500' : 'bg-slate-700',
                  toggling === flag.id && 'opacity-50'
                )}
              >
                <span className={cn(
                  'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5',
                  flag.enabled ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'
                )} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
