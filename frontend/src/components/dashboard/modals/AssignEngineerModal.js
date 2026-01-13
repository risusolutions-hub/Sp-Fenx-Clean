import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Star, Award, Loader2 } from 'lucide-react';
import api from '../../../api';

export default function AssignEngineerModal({ complaint, engineers, onAssign, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [complaint.id]);

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await api.get(`/complaints/${complaint.id}/suggested-engineers`);
      if (res.data.success) {
        setSuggestions(res.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAutoAssign = async () => {
    try {
      setAutoAssigning(true);
      const res = await api.post(`/complaints/${complaint.id}/auto-assign`);
      if (res.data.success && res.data.assignedTo?.id) {
        // Use the onAssign callback for proper optimistic update instead of reload
        onAssign(complaint.id, res.data.assignedTo.id);
        onClose();
      }
    } catch (error) {
      console.error('Error auto-assigning:', error);
      alert(error.response?.data?.error || 'Failed to auto-assign');
    } finally {
      setAutoAssigning(false);
    }
  };

  const getSuggestedEngineer = (engineerId) => {
    return suggestions.find(s => s.id === parseInt(engineerId));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex z-50 items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Assign Engineer</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ticket #{complaint.displayId || complaint.id}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auto-Assign Button */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <button
            onClick={handleAutoAssign}
            disabled={autoAssigning}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
          >
            {autoAssigning ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Finding Best Match...
              </>
            ) : (
              <>
                <Zap size={18} />
                Auto-Assign Best Engineer
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Automatically assigns based on skills, availability, and experience
          </p>
        </div>

        {/* Suggested Engineers */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="p-4 border-b border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Star size={12} className="text-yellow-500" />
              AI Suggestions
            </h4>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map(s => (
                <button
                  key={s.id}
                  onClick={() => onAssign(complaint.id, s.id)}
                  className="w-full text-left p-3 rounded-md border border-yellow-200 bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-100 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-slate-900 flex items-center gap-2">
                        {s.name}
                        {s.matchingSkills?.length > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            {s.matchingSkills.length} skill match
                          </span>
                        )}
                      </p>
                      {s.matchingSkills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.matchingSkills.map((skill, i) => (
                            <span key={i} className="text-xs bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                              {skill.name} ({skill.level})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      s.isAvailable ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {s.isAvailable ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="p-4 max-h-[40vh] overflow-y-auto">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">All Engineers</h4>
          <div className="space-y-2">
            {engineers.map(e => {
              const suggestion = getSuggestedEngineer(e.id);
              return (
                <button
                  key={e.id}
                  onClick={() => onAssign(complaint.id, e.id)}
                  className="w-full text-left p-3 rounded-md border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex justify-between items-center group"
                >
                  <div>
                    <p className="font-medium text-sm text-slate-900 group-hover:text-blue-700 flex items-center gap-2">
                      {e.name}
                      {suggestion?.matchingSkills?.length > 0 && (
                        <Award size={14} className="text-yellow-500" />
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{e.location || 'Unknown Location'} • Rating: {e.rating || 'N/A'}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${(e.status || 'Available') === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                     {e.status || 'Available'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-lg text-right">
             <span className="text-xs text-slate-400">Select an engineer to immediately assign</span>
        </div>
      </div>
    </div>
  );
}
