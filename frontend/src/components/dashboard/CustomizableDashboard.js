import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Settings, Layout } from 'lucide-react';
import Loader from '../Loader';

export default function CustomizableDashboard({ userRole }) {
  const [layouts, setLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState(null);
  const [showLayoutForm, setShowLayoutForm] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [loading, setLoading] = useState(true);
  const [widgetTemplates, setWidgetTemplates] = useState({});

  useEffect(() => {
    loadLayouts();
    loadTemplates();
  }, []);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/layouts', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setLayouts(data.layouts || []);
        const defaultLayout = data.layouts?.find(l => l.isDefault);
        setActiveLayout(defaultLayout || data.layouts?.[0]);
      }
    } catch (error) {
      console.error('Error loading layouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/dashboard/templates', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setWidgetTemplates(data.templates || {});
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleCreateLayout = async () => {
    if (!newLayoutName.trim()) return;

    try {
      const templateWidgets = widgetTemplates[userRole] || [];
      const response = await fetch('/api/dashboard/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          layoutName: newLayoutName,
          widgets: templateWidgets,
          isDefault: layouts.length === 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        setLayouts([...layouts, data.layout]);
        setActiveLayout(data.layout);
        setNewLayoutName('');
        setShowLayoutForm(false);
      }
    } catch (error) {
      console.error('Error creating layout:', error);
    }
  };

  const handleSetDefault = async (layoutId) => {
    try {
      const response = await fetch(`/api/dashboard/layouts/${layoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isDefault: true })
      });

      if (response.ok) {
        const data = await response.json();
        setLayouts(layouts.map(l => ({
          ...l,
          isDefault: l.id === layoutId
        })));
        setActiveLayout(data.layout);
      }
    } catch (error) {
      console.error('Error setting default:', error);
    }
  };

  const handleDeleteLayout = async (layoutId) => {
    if (!window.confirm('Delete this layout?')) return;

    try {
      const response = await fetch(`/api/dashboard/layouts/${layoutId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const updated = layouts.filter(l => l.id !== layoutId);
        setLayouts(updated);
        setActiveLayout(updated[0] || null);
      }
    } catch (error) {
      console.error('Error deleting layout:', error);
    }
  };

  const handleRemoveWidget = async (layoutId, widgetId) => {
    try {
      const response = await fetch(`/api/dashboard/layouts/${layoutId}/widgets/${widgetId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setActiveLayout(data.layout);
        setLayouts(layouts.map(l => l.id === layoutId ? data.layout : l));
      }
    } catch (error) {
      console.error('Error removing widget:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layout size={24} className="text-blue-600" />
            Dashboard Customization
          </h2>
          <p className="text-sm text-slate-500">Create and manage personalized dashboard layouts</p>
        </div>
      </div>

      {/* Layout Tabs */}
      <div className="flex gap-2 flex-wrap">
        {layouts.map(layout => (
          <button
            key={layout.id}
            onClick={() => setActiveLayout(layout)}
            className={`px-4 py-2 rounded-lg font-medium transition relative ${
              activeLayout?.id === layout.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {layout.layoutName}
            {layout.isDefault && (
              <span className="ml-2 text-xs bg-amber-500 px-2 py-1 rounded-full">Default</span>
            )}
          </button>
        ))}

        <button
          onClick={() => setShowLayoutForm(!showLayoutForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Plus size={16} /> New Layout
        </button>
      </div>

      {/* Create Layout Form */}
      {showLayoutForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Layout name (e.g., Daily Engineer View)"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateLayout}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Create Layout
              </button>
              <button
                onClick={() => setShowLayoutForm(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Layout Details */}
      {activeLayout && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div>
              <h3 className="font-bold text-slate-900">{activeLayout.layoutName}</h3>
              <p className="text-sm text-slate-600">{activeLayout.widgets?.length || 0} widgets</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSetDefault(activeLayout.id)}
                disabled={activeLayout.isDefault}
                className="px-3 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition text-sm"
              >
                {activeLayout.isDefault ? 'Default' : 'Set as Default'}
              </button>
              <button
                onClick={() => handleDeleteLayout(activeLayout.id)}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Widgets Grid */}
          {activeLayout.widgets && activeLayout.widgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeLayout.widgets.map(widget => (
                <div key={widget.id} className="bg-white border border-slate-200 rounded-lg p-4 relative group hover:shadow-lg transition">
                  <button
                    onClick={() => handleRemoveWidget(activeLayout.id, widget.id)}
                    className="absolute top-2 right-2 p-2 bg-red-100 text-red-600 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div className="flex items-start gap-3">
                    <Settings size={20} className="text-blue-600 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{widget.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 capitalize">{widget.type}</p>
                      <div className="mt-2 text-xs text-slate-500">
                        <p>Size: {widget.size.width}x{widget.size.height}</p>
                      </div>
                    </div>
                  </div>

                  {/* Widget Customization */}
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-600">Filters</label>
                    {Object.keys(widget.filters).length > 0 ? (
                      <div className="text-xs text-slate-600">
                        {Object.entries(widget.filters).map(([key, value]) => (
                          <p key={key}>{key}: {String(value)}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No filters configured</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
              <p className="text-slate-500">No widgets in this layout yet</p>
              <p className="text-sm text-slate-400 mt-1">Create a new layout to start with templates</p>
            </div>
          )}
        </div>
      )}

      {/* Available Templates */}
      {Object.keys(widgetTemplates).length > 0 && (
        <div className="pt-6 border-t border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Available Widget Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {widgetTemplates[userRole]?.map(template => (
              <div key={template.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="font-bold text-slate-900 text-sm">{template.title}</p>
                <p className="text-xs text-slate-600 mt-1 capitalize">{template.type}</p>
              </div>
            )) || []}
          </div>
        </div>
      )}
    </div>
  );
}
