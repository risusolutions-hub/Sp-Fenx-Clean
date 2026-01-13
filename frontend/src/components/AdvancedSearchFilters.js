import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

export default function AdvancedSearchFilters({ 
  data = [], 
  onFilter = () => {}, 
  searchFields = [], 
  filters = [],
  onSavePreset = () => {},
  onLoadPreset = () => {},
  savedPresets = []
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, activeFilters, data]);

  const performSearch = () => {
    let filtered = [...data];

    // Text search across specified fields
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return String(value).toLowerCase().includes(term);
        })
      );
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue && filterValue !== 'all') {
        filtered = filtered.filter(item => {
          const field = filters.find(f => f.key === filterKey);
          if (!field) return true;
          const value = field.key.split('.').reduce((obj, key) => obj?.[key], item);
          return String(value) === String(filterValue);
        });
      }
    });

    onFilter(filtered);
  };

  const toggleFilter = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? 'all' : value
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setActiveFilters({});
  };

  const savePreset = () => {
    if (presetName.trim()) {
      onSavePreset({
        name: presetName,
        searchTerm,
        filters: activeFilters,
        timestamp: new Date().toISOString()
      });
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v && v !== 'all').length;

  return (
    <div className="space-y-3 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, status, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
            showFilters || activeFilterCount > 0
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Save Preset */}
        <button
          onClick={() => setShowSavePreset(true)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
        >
          Save
        </button>

        {/* Clear All */}
        {(searchTerm || activeFilterCount > 0) && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filters.map(filter => (
              <div key={filter.key}>
                <p className="text-xs font-bold text-slate-600 uppercase mb-2">{filter.label}</p>
                <div className="space-y-1">
                  {filter.options.map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={activeFilters[filter.key] === option.value}
                        onChange={() => toggleFilter(filter.key, option.value)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Presets */}
      {savedPresets && savedPresets.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase self-center">Presets:</span>
          {savedPresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onLoadPreset(preset)}
              className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-700 hover:bg-blue-100 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}

      {/* Save Preset Modal */}
      {showSavePreset && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-sm w-full m-4">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Save Filter Preset</h3>
            <input
              type="text"
              placeholder="Enter preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSavePreset(false)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={savePreset}
                className="flex-1 px-3 py-2 bg-blue-600 rounded text-sm font-medium text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
