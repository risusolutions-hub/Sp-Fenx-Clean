import React, { useState } from 'react';

/**
 * Modern Glassmorphism Design System Showcase
 * Demonstrates the premium, contemporary UI components
 */
export default function DesignSystemPreview() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🎨' },
    { id: 'components', label: 'Components', icon: '🧩' },
    { id: 'colors', label: 'Colors', icon: '🎨' },
    { id: 'typography', label: 'Typography', icon: '📝' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="glass-card p-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-neutral-800 mb-2">
                Modern Glassmorphism Design System
              </h1>
              <p className="text-lg text-neutral-600 leading-relaxed">
                Premium, contemporary interface with soft pastel colors and elegant glassmorphism effects
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="glass px-4 py-2 rounded-glass text-sm font-medium">
                ✨ Glassmorphism
              </div>
              <div className="glass px-4 py-2 rounded-glass text-sm font-medium">
                🎨 Pastel Palette
              </div>
              <div className="glass px-4 py-2 rounded-glass text-sm font-medium">
                ⚡ Micro-interactions
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 p-1 glass rounded-glass">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-250 ${
                  activeTab === tab.id
                    ? 'bg-white shadow-sm text-primary-600'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'components' && <ComponentsSection />}
        {activeTab === 'colors' && <ColorsSection />}
        {activeTab === 'typography' && <TypographySection />}

      </div>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-8">

      {/* Hero Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-xl">✨</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Glassmorphism</h3>
          <p className="text-neutral-600 leading-relaxed">
            Frosted glass effects with backdrop blur, creating depth and sophistication
          </p>
        </div>

        <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 bg-secondary-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-xl">🎨</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Pastel Palette</h3>
          <p className="text-neutral-600 leading-relaxed">
            Soft blues, mint, lavender, and sand colors for a contemporary, calming aesthetic
          </p>
        </div>

        <div className="glass-card p-6 hover:scale-105 transition-transform duration-300">
          <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white text-xl">⚡</span>
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-2">Micro-interactions</h3>
          <p className="text-neutral-600 leading-relaxed">
            Smooth animations and subtle interactions that enhance user experience
          </p>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="glass-card p-8">
        <h2 className="text-3xl font-bold text-neutral-800 mb-8 text-center">
          Design System Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-1">Clean White Foundation</h4>
                <p className="text-neutral-600 text-sm">Ultra-light backgrounds with subtle gradients</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-secondary-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-1">Layered Depth</h4>
                <p className="text-neutral-600 text-sm">Multiple shadow layers for sophisticated elevation</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-1">Responsive Design</h4>
                <p className="text-neutral-600 text-sm">Consistent experience across all screen sizes</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-warm-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-1">Accessibility First</h4>
                <p className="text-neutral-600 text-sm">WCAG compliant with proper contrast ratios</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-1">Modern Typography</h4>
                <p className="text-neutral-600 text-sm">Inter font family with refined spacing</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-info-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-800 mb-1">Enterprise Grade</h4>
                <p className="text-neutral-600 text-sm">Professional quality for business applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function ComponentsSection() {
  return (
    <div className="space-y-8">

      {/* Buttons */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Button Components</h3>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-ghost">Ghost Button</button>
          <button className="btn-primary" disabled>Disabled</button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h4 className="text-lg font-semibold text-neutral-800 mb-3">Glass Card</h4>
          <p className="text-neutral-600 mb-4">
            Standard glassmorphism card with backdrop blur and subtle transparency.
          </p>
          <div className="flex space-x-2">
            <span className="badge-modern badge-primary">New</span>
            <span className="badge-modern badge-secondary">Featured</span>
          </div>
        </div>

        <div className="floating-card p-6">
          <h4 className="text-lg font-semibold text-neutral-800 mb-3">Floating Card</h4>
          <p className="text-neutral-600 mb-4">
            Elevated card with enhanced shadows and hover animations.
          </p>
          <div className="flex space-x-2">
            <span className="badge-modern badge-accent">Premium</span>
            <span className="badge-modern badge-success">Active</span>
          </div>
        </div>
      </div>

      {/* Form Elements */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Form Elements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Modern Input
              </label>
              <input
                type="text"
                placeholder="Enter your text..."
                className="input-modern w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Select Field
              </label>
              <select className="input-modern w-full">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Checkbox
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-neutral-300" />
                <span className="text-neutral-600">Accept terms</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Radio Buttons
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input type="radio" name="option" className="text-primary-500" />
                  <span className="text-neutral-600">Option A</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="radio" name="option" className="text-primary-500" />
                  <span className="text-neutral-600">Option B</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function ColorsSection() {
  const colorGroups = [
    {
      name: 'Primary (Blue)',
      colors: [
        { name: '50', hex: '#F0F7FF', text: 'white' },
        { name: '100', hex: '#E0F0FE', text: 'neutral-800' },
        { name: '500', hex: '#0C8CE9', text: 'white' },
        { name: '900', hex: '#0B406E', text: 'white' },
      ]
    },
    {
      name: 'Secondary (Mint)',
      colors: [
        { name: '50', hex: '#F0FDF9', text: 'neutral-800' },
        { name: '100', hex: '#CCFBF1', text: 'neutral-800' },
        { name: '500', hex: '#14B8A6', text: 'white' },
        { name: '900', hex: '#134E4A', text: 'white' },
      ]
    },
    {
      name: 'Accent (Lavender)',
      colors: [
        { name: '50', hex: '#FAF5FF', text: 'neutral-800' },
        { name: '100', hex: '#F3E8FF', text: 'neutral-800' },
        { name: '500', hex: '#A855F7', text: 'white' },
        { name: '900', hex: '#581C87', text: 'white' },
      ]
    },
    {
      name: 'Neutrals',
      colors: [
        { name: '50', hex: '#FAFAFA', text: 'neutral-800' },
        { name: '200', hex: '#E8E8E8', text: 'neutral-800' },
        { name: '600', hex: '#525252', text: 'white' },
        { name: '900', hex: '#171717', text: 'white' },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {colorGroups.map((group) => (
        <div key={group.name} className="glass-card p-8">
          <h3 className="text-2xl font-bold text-neutral-800 mb-6">{group.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {group.colors.map((color) => (
              <div key={color.name} className="text-center">
                <div
                  className="w-full h-20 rounded-lg mb-3 shadow-sm"
                  style={{ backgroundColor: color.hex }}
                ></div>
                <div className="text-sm font-medium text-neutral-700">{color.name}</div>
                <div className="text-xs text-neutral-500 font-mono">{color.hex}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TypographySection() {
  return (
    <div className="space-y-8">

      {/* Font Scale */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Typography Scale</h3>
        <div className="space-y-6">
          <div>
            <div className="text-5xl font-black text-neutral-800 mb-2">Hero Title (5xl)</div>
            <div className="text-sm text-neutral-500">40px • Black (900) • -0.025em</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-neutral-800 mb-2">Page Header (4xl)</div>
            <div className="text-sm text-neutral-500">32px • Bold (700) • 0em</div>
          </div>
          <div>
            <div className="text-3xl font-semibold text-neutral-800 mb-2">Section Title (3xl)</div>
            <div className="text-sm text-neutral-500">28px • Semibold (600) • 0em</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-neutral-800 mb-2">Card Header (2xl)</div>
            <div className="text-sm text-neutral-500">24px • Semibold (600) • 0em</div>
          </div>
          <div>
            <div className="text-xl font-semibold text-neutral-800 mb-2">Large Body (xl)</div>
            <div className="text-sm text-neutral-500">20px • Semibold (600) • 0em</div>
          </div>
          <div>
            <div className="text-lg text-neutral-800 mb-2">Body Large (lg)</div>
            <div className="text-sm text-neutral-500">17px • Normal (400) • 1.4</div>
          </div>
          <div>
            <div className="text-base text-neutral-800 mb-2">Body Regular (base)</div>
            <div className="text-sm text-neutral-500">15px • Normal (400) • 1.4</div>
          </div>
          <div>
            <div className="text-sm font-medium text-neutral-800 mb-2">Labels (sm)</div>
            <div className="text-xs text-neutral-500">13px • Medium (500) • 1.4</div>
          </div>
          <div>
            <div className="text-xs text-neutral-800 mb-2">Captions (xs)</div>
            <div className="text-xs text-neutral-500">11px • Normal (400) • 1.2</div>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="glass-card p-8">
        <h3 className="text-2xl font-bold text-neutral-800 mb-6">Font Weights</h3>
        <div className="space-y-4">
          <div className="text-thin">Thin (100) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-light">Light (300) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-normal">Normal (400) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-medium">Medium (500) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-semibold">Semibold (600) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-bold">Bold (700) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-extrabold">Extrabold (800) - The quick brown fox jumps over the lazy dog</div>
          <div className="text-black">Black (900) - The quick brown fox jumps over the lazy dog</div>
        </div>
      </div>

    </div>
  );
}