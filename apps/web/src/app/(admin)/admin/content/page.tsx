'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  MessageSquare, 
  Star,
  HelpCircle,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KAIZ_FEATURES, type AboutFeature } from '@/types/content';

// Content management sections
const contentSections = [
  { 
    id: 'features', 
    name: 'About Page Features', 
    description: 'Manage the feature sections on the About page',
    icon: FileText,
    count: KAIZ_FEATURES.length
  },
  { 
    id: 'testimonials', 
    name: 'Testimonials', 
    description: 'Customer reviews and success stories',
    icon: Star,
    count: 12
  },
  { 
    id: 'faqs', 
    name: 'FAQs', 
    description: 'Frequently asked questions',
    icon: HelpCircle,
    count: 24
  },
  { 
    id: 'pricing', 
    name: 'Pricing Tiers', 
    description: 'Subscription plans and pricing',
    icon: DollarSign,
    count: 4
  },
  { 
    id: 'site-settings', 
    name: 'Site Settings', 
    description: 'Global site configuration',
    icon: Settings,
    count: null
  },
];

export default function AdminContentPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('features');
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [features, setFeatures] = useState(KAIZ_FEATURES);

  const toggleFeatureActive = (id: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === id ? { ...f, isActive: !f.isActive } : f
    ));
  };

  const moveFeature = (id: string, direction: 'up' | 'down') => {
    const index = features.findIndex(f => f.id === id);
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === features.length - 1)
    ) return;

    const newFeatures = [...features];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newFeatures[index], newFeatures[swapIndex]] = [newFeatures[swapIndex], newFeatures[index]];
    
    // Update order numbers
    newFeatures.forEach((f, i) => f.order = i + 1);
    setFeatures(newFeatures);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Management</h1>
          <p className="text-slate-400 mt-1">Manage website content, features, testimonials, and settings</p>
        </div>
        <div className="flex gap-3">
          <Link href="/about" target="_blank">
            <Button variant="outline" className="border-slate-600 hover:border-primary-500">
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview About Page
            </Button>
          </Link>
          <Button className="bg-primary-500 hover:bg-primary-600">
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Content Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contentSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className={`p-6 rounded-xl border text-left transition-all ${
              expandedSection === section.id 
                ? 'bg-slate-800 border-primary-500' 
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  expandedSection === section.id ? 'bg-primary-500/20' : 'bg-slate-700'
                }`}>
                  <section.icon className={`w-5 h-5 ${
                    expandedSection === section.id ? 'text-primary-400' : 'text-slate-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{section.name}</h3>
                  <p className="text-sm text-slate-400">{section.description}</p>
                </div>
              </div>
              {section.count !== null && (
                <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full">
                  {section.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Expanded Section: Features */}
      {expandedSection === 'features' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">About Page Features</h2>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-1" />
              Add Feature
            </Button>
          </div>

          <div className="divide-y divide-slate-700">
            {features.sort((a, b) => a.order - b.order).map((feature) => (
              <FeatureRow
                key={feature.id}
                feature={feature}
                isEditing={editingFeature === feature.id}
                onEdit={() => setEditingFeature(feature.id)}
                onCancel={() => setEditingFeature(null)}
                onToggleActive={() => toggleFeatureActive(feature.id)}
                onMoveUp={() => moveFeature(feature.id, 'up')}
                onMoveDown={() => moveFeature(feature.id, 'down')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expanded Section: Testimonials */}
      {expandedSection === 'testimonials' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Testimonials</h2>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-1" />
              Add Testimonial
            </Button>
          </div>
          <div className="p-8 text-center text-slate-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Testimonials management coming soon</p>
            <p className="text-sm">Add and manage customer reviews and success stories</p>
          </div>
        </div>
      )}

      {/* Expanded Section: FAQs */}
      {expandedSection === 'faqs' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-1" />
              Add FAQ
            </Button>
          </div>
          <div className="p-8 text-center text-slate-400">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>FAQs management coming soon</p>
            <p className="text-sm">Add and organize frequently asked questions by category</p>
          </div>
        </div>
      )}

      {/* Expanded Section: Pricing */}
      {expandedSection === 'pricing' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pricing Tiers</h2>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              <Plus className="w-4 h-4 mr-1" />
              Add Tier
            </Button>
          </div>
          <div className="p-8 text-center text-slate-400">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Pricing management coming soon</p>
            <p className="text-sm">Configure subscription plans, pricing, and features</p>
          </div>
        </div>
      )}

      {/* Expanded Section: Site Settings */}
      {expandedSection === 'site-settings' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Site Settings</h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Site Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
                <input
                  type="text"
                  defaultValue="Kaiz LifeOS"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Site URL</label>
                <input
                  type="text"
                  defaultValue="https://kaizlifeos.app"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Site Description</label>
              <textarea
                rows={3}
                defaultValue="Run your life like a product team — with reality, metrics, and compounding improvements."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-primary-500 focus:outline-none resize-none"
              />
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Social Links</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {['Twitter', 'GitHub', 'LinkedIn', 'Discord', 'YouTube'].map((social) => (
                  <div key={social}>
                    <label className="block text-xs text-slate-400 mb-1">{social}</label>
                    <input
                      type="text"
                      placeholder={`https://${social.toLowerCase()}.com/...`}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Announcement Banner */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">Announcement Banner</h3>
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-slate-300">Enable Banner</label>
                  <button className="w-12 h-6 rounded-full bg-slate-700 relative">
                    <span className="absolute left-1 top-1 w-4 h-4 rounded-full bg-slate-400 transition-transform" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Banner text..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Link URL (optional)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Feature Row Component
function FeatureRow({ 
  feature, 
  isEditing, 
  onEdit, 
  onCancel,
  onToggleActive,
  onMoveUp,
  onMoveDown
}: { 
  feature: AboutFeature;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [formData, setFormData] = useState(feature);

  if (isEditing) {
    return (
      <div className="p-4 bg-slate-900/50">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{formData.icon}</span>
            <div className="flex-1">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-2 focus:border-primary-500 focus:outline-none"
                placeholder="Feature title"
              />
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none"
                placeholder="Subtitle"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Bullet Points (one per line)</label>
            <textarea
              rows={4}
              value={formData.bulletPoints.join('\n')}
              onChange={(e) => setFormData({ ...formData, bulletPoints: e.target.value.split('\n') })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none resize-none"
            />
          </div>

          {formData.example && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Example Scenario</label>
                <textarea
                  rows={2}
                  value={formData.example.scenario}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    example: { ...formData.example!, scenario: e.target.value } 
                  })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Example Outcome</label>
                <textarea
                  rows={2}
                  value={formData.example.outcome}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    example: { ...formData.example!, outcome: e.target.value } 
                  })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-primary-500 focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel} className="border-slate-600">
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" className="bg-primary-500 hover:bg-primary-600">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 flex items-center gap-4 ${!feature.isActive ? 'opacity-50' : ''}`}>
      <div className="flex flex-col gap-1">
        <button onClick={onMoveUp} className="p-1 hover:bg-slate-700 rounded">
          <ChevronDown className="w-4 h-4 text-slate-500 rotate-180" />
        </button>
        <button onClick={onMoveDown} className="p-1 hover:bg-slate-700 rounded">
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <span className="text-2xl">{feature.icon}</span>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate">{feature.title}</h3>
        <p className="text-sm text-slate-400 truncate">{feature.subtitle}</p>
      </div>

      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        feature.isActive 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-slate-700 text-slate-400'
      }`}>
        {feature.isActive ? 'Active' : 'Hidden'}
      </span>

      <div className="flex items-center gap-1">
        <button 
          onClick={onToggleActive}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title={feature.isActive ? 'Hide' : 'Show'}
        >
          {feature.isActive ? (
            <Eye className="w-4 h-4 text-slate-400" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <button 
          onClick={onEdit}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="w-4 h-4 text-slate-400" />
        </button>
        <button 
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}
