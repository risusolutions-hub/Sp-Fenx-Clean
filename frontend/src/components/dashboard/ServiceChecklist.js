import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Camera, FileCheck, AlertCircle } from 'lucide-react';
import Loader from '../Loader';

export default function ServiceChecklist({ complaintId, isEngineer = false, isManager = false }) {
  const [checklist, setChecklist] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadChecklist();
    loadTemplates();
  }, [complaintId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/checklists/complaints/${complaintId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setChecklist(data.checklist);
      } else {
        setChecklist(null);
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/checklists/templates', { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setTemplates(data.items || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleCreateChecklist = async () => {
    if (!selectedTemplate) return;

    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          complaintId,
          checklistType: selectedTemplate,
          items: templates.filter(t => t.name) // Get template items
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChecklist(data.checklist);
        setShowForm(false);
        setSelectedTemplate('');
      }
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  };

  const handleToggleItem = async (itemId) => {
    if (!checklist) return;

    const updatedItems = checklist.items.map(item => {
      if (item.id === itemId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    try {
      const response = await fetch(`/api/checklists/${checklist.id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          completed: updatedItems.find(i => i.id === itemId).completed
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChecklist(data.checklist);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCompleteChecklist = async () => {
    if (!checklist || !checklist.items.every(i => i.completed)) {
      alert('All items must be completed first');
      return;
    }

    try {
      const response = await fetch(`/api/checklists/${checklist.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          photoEvidenceUrls: photos
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChecklist(data.checklist);
        alert('Checklist completed successfully!');
      }
    } catch (error) {
      console.error('Error completing checklist:', error);
    }
  };

  const handleReviewChecklist = async (approved) => {
    try {
      const response = await fetch(`/api/checklists/${checklist.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          approved,
          reviewNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChecklist(data.checklist);
        setReviewNotes('');
      }
    } catch (error) {
      console.error('Error reviewing checklist:', error);
    }
  };

  if (loading) return <Loader />;

  const completedCount = checklist ? checklist.items.filter(i => i.completed).length : 0;
  const totalCount = checklist ? checklist.items.length : 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck size={24} className="text-blue-600" />
            Service Checklist
          </h2>
          <p className="text-sm text-slate-500">Ensure all service requirements are met</p>
        </div>
      </div>

      {!checklist ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          {!showForm ? (
            <>
              <p className="text-slate-700 mb-4">No checklist created yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Checklist
              </button>
            </>
          ) : (
            <div className="text-left space-y-4">
              <label className="block text-slate-700 font-bold">Select Checklist Type</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a template...</option>
                <option value="Electrical Inspection">Electrical Inspection</option>
                <option value="Refrigeration Service">Refrigeration Service</option>
                <option value="HVAC Maintenance">HVAC Maintenance</option>
                <option value="Plumbing Service">Plumbing Service</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateChecklist}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-slate-900">{completedCount} of {totalCount} completed</p>
              <span className="text-sm font-bold text-blue-600">{completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          {/* Checklist Type */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-600">Type</p>
            <p className="font-bold text-slate-900">{checklist.checklistType}</p>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2">
            {checklist.items.map(item => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition ${
                  item.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => isEngineer && handleToggleItem(item.id)}
                  disabled={!isEngineer || checklist.isCompleted}
                  className="mt-1 flex-shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {item.completed ? (
                    <CheckCircle2 className="text-green-600" size={24} />
                  ) : (
                    <Circle className="text-slate-400" size={24} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${item.completed ? 'text-green-700 line-through' : 'text-slate-900'}`}>
                    {item.name}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-slate-600 mt-1">{item.notes}</p>
                  )}
                  {item.completedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      Completed: {new Date(item.completedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Photo Evidence */}
          {isEngineer && !checklist.isCompleted && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <label className="flex items-center gap-2 font-bold text-slate-900 mb-3">
                <Camera size={20} />
                Photo Evidence
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files)])}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {photos.length > 0 && (
                <p className="text-sm text-slate-600 mt-2">{photos.length} photo(s) selected</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {isEngineer && !checklist.isCompleted && (
            <button
              onClick={handleCompleteChecklist}
              disabled={completionPercent < 100}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold"
            >
              Mark Checklist Complete
            </button>
          )}

          {/* Manager Review */}
          {isManager && checklist.isCompleted && !checklist.reviewedAt && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="font-bold text-amber-900">Pending Review</p>
                  <p className="text-sm text-amber-700">Completed by {checklist.completedBy?.name}</p>
                </div>
              </div>

              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add review notes..."
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                rows="3"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => handleReviewChecklist(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReviewChecklist(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Request Changes
                </button>
              </div>
            </div>
          )}

          {/* Review Status */}
          {checklist.reviewedAt && (
            <div className={`border rounded-lg p-4 ${
              checklist.status === 'approved'
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <p className={`font-bold ${
                checklist.status === 'approved'
                  ? 'text-green-900'
                  : 'text-yellow-900'
              }`}>
                {checklist.status === 'approved' ? 'Approved' : 'Needs Revision'}
              </p>
              {checklist.reviewNotes && (
                <p className="text-sm mt-2">{checklist.reviewNotes}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
