import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react';
import { Plus, MessageCircle, AlertTriangle, ClipboardCheck, History, X, Paperclip, Image, Video, FileText, Download, ExternalLink, Loader, RefreshCw, ChevronRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import api from '../../api';
import AdvancedSearchFilters from '../AdvancedSearchFilters';
import ExportButton from '../ExportButton';
import { SLABadge } from '../SLATimer';

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const configs = {
    low: { style: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
    medium: { style: 'bg-blue-50 text-blue-600 border-blue-100', dot: 'bg-blue-500' },
    high: { style: 'bg-orange-50 text-orange-600 border-orange-100', dot: 'bg-orange-500' },
    critical: { style: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' }
  };
  const config = configs[priority] || configs.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${config.style}`}>
      <span className={`w-1 h-1 rounded-full ${config.dot} animate-pulse`} />
      {priority || 'medium'}
    </span>
  );
};

// Issue Categories Display
const IssueCategoriesDisplay = ({ categories }) => {
  const cats = Array.isArray(categories) ? categories : [];
  if (cats.length === 0) return null;
  const categoryIcons = { electrical: '⚡', mechanical: '⚙️', software: '💻', cooling: '❄️', network: '🌐', display: '🖥️', power: '🔌', noise: '🔊', performance: '📉', other: '📋' };
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {cats.slice(0, 3).map((cat, idx) => {
        const isCustom = cat.startsWith('custom:');
        const label = isCustom ? cat.replace('custom:', '') : cat;
        return (
          <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-md border border-neutral-200/50">
            {!isCustom && <span className="mr-1">{categoryIcons[cat]}</span>} 
            {label}
          </span>
        );
      })}
      {cats.length > 3 && (
        <span className="text-[10px] font-black px-2 py-0.5 bg-primary-50 text-primary-500 rounded-md border border-primary-100/50">
          +{cats.length - 3}
        </span>
      )}
    </div>
  );
};

// Attachments indicator
const AttachmentsIndicator = ({ attachments }) => {
  const files = Array.isArray(attachments) ? attachments : [];
  if (files.length === 0) return null;
  const hasImages = files.some(a => a.type?.startsWith('image/'));
  const hasVideos = files.some(a => a.type?.startsWith('video/'));
  const hasDocs = files.some(a => !a.type?.startsWith('image/') && !a.type?.startsWith('video/'));
  
  return (
    <div className="flex items-center gap-1 mt-1">
      {hasImages && <Image size={12} className="text-blue-500" />}
      {hasVideos && <Video size={12} className="text-purple-500" />}
      {hasDocs && <FileText size={12} className="text-slate-500" />}
      <span className="text-[9px] text-slate-500">{files.length} file{files.length > 1 ? 's' : ''}</span>
    </div>
  );
};

// Full Attachments List Component
const AttachmentsList = ({ attachments }) => {
  const safeAttachments = Array.isArray(attachments) ? attachments : [];
  if (safeAttachments.length === 0) {
    return <p className="text-sm text-slate-400 italic">No attachments</p>;
  }

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image size={16} className="text-blue-500" />;
    if (type?.startsWith('video/')) return <Video size={16} className="text-purple-500" />;
    return <FileText size={16} className="text-slate-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = async (attachment) => {
    try {
      const url = attachment.ftpPath 
        ? `${api.defaults.baseURL}/uploads/ftp-file?path=${encodeURIComponent(attachment.ftpPath)}`
        : `${api.defaults.baseURL}/uploads/${attachment.filename || attachment.name}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="space-y-2">
      {safeAttachments.map((att, idx) => (
        <div key={idx} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
          {getFileIcon(att.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700 truncate">{att.originalName || att.name || att.filename}</p>
            <p className="text-xs text-slate-400">{formatFileSize(att.size)}</p>
          </div>
          <button
            onClick={() => handleDownload(att)}
            className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition"
            title="Download"
          >
            <Download size={14} />
          </button>
          {att.type?.startsWith('image/') && (
            <button
              onClick={() => handleDownload(att)}
              className="p-1.5 hover:bg-green-100 rounded text-green-600 transition"
              title="View"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

// Complaint Detail Panel
const ComplaintDetailPanel = ({ complaint, customer, machine }) => {
  if (!complaint) return null;
  
  const categoryLabels = {
    electrical: '⚡ Electrical Issues',
    mechanical: '⚙️ Mechanical Problems',
    software: '💻 Software/Firmware',
    cooling: '❄️ Cooling System',
    network: '🌐 Network/Connectivity',
    display: '🖥️ Display Issues',
    power: '🔌 Power Supply',
    noise: '🔊 Unusual Noise',
    performance: '📉 Performance Issues',
    other: '📋 Other'
  };

  return (
    <div className="p-4 space-y-5">
      {/* Priority & Status */}
      <div className="flex items-center gap-3">
        <PriorityBadge priority={complaint.priority} />
        <StatusBadge status={complaint.status} />
      </div>

      {/* Customer Info */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
        <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Customer Details</h4>
        <p className="text-sm font-medium text-slate-900">{customer?.company || customer?.name}</p>
        <p className="text-xs text-slate-600">Service No: {customer?.serviceNo || '-'}</p>
        {customer?.contactPerson && <p className="text-xs text-slate-600">Contact: {customer.contactPerson}</p>}
        {customer?.phone && <p className="text-xs text-slate-600">📞 {customer.phone}</p>}
        {customer?.phones?.length > 1 && (
          <p className="text-xs text-slate-500">+ {customer.phones.length - 1} more number(s)</p>
        )}
        {customer?.address && <p className="text-xs text-slate-500 mt-1">📍 {customer.address}</p>}
      </div>

      {/* Machine Info */}
      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
        <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Machine Details</h4>
        <p className="text-sm font-medium text-slate-900">{machine?.model}</p>
        <p className="text-xs text-slate-600 font-mono">S/N: {machine?.serialNumber}</p>
        {Array.isArray(machine?.mobileNumbers) && machine.mobileNumbers.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-slate-500 font-medium">Mobile Numbers:</p>
            {machine.mobileNumbers.map((num, idx) => (
              <p key={idx} className="text-xs text-slate-600">📱 {num}</p>
            ))}
          </div>
        )}
      </div>

      {/* Issue Categories */}
      {Array.isArray(complaint.issueCategories) && complaint.issueCategories.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Issue Categories</h4>
          <div className="flex flex-wrap gap-2">
            {complaint.issueCategories.map((cat, idx) => {
              const isCustom = cat.startsWith('custom:');
              const label = isCustom ? `✏️ ${cat.replace('custom:', '')}` : (categoryLabels[cat] || cat);
              return (
                <span key={idx} className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200">
                  {label}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Problem Description */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Problem Description</h4>
        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
          {complaint.problem}
        </p>
      </div>

      {/* Attachments */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">
          Attachments ({complaint.attachments?.length || 0})
        </h4>
        <AttachmentsList attachments={complaint.attachments} />
      </div>

      {/* Timeline */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Timeline</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Created:</span>
            <span className="text-slate-700">{new Date(complaint.createdAt).toLocaleString()}</span>
          </div>
          {complaint.assignedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned:</span>
              <span className="text-slate-700">{new Date(complaint.assignedAt).toLocaleString()}</span>
            </div>
          )}
          {complaint.resolvedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Resolved:</span>
              <span className="text-slate-700">{new Date(complaint.resolvedAt).toLocaleString()}</span>
            </div>
          )}
          {complaint.closedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Closed:</span>
              <span className="text-slate-700">{new Date(complaint.closedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Lazy load feature panels
const ChatWindow = lazy(() => import('../ChatWindow'));
const DuplicateDetection = lazy(() => import('./DuplicateDetection'));
const ServiceChecklist = lazy(() => import('./ServiceChecklist'));
const MachineServiceHistory = lazy(() => import('./MachineServiceHistory'));
const TicketDetailsView = lazy(() => import('./TicketDetailsView'));

function ComplaintsView({ complaints, customers, machines, user, onAssign, onTakeTicket, onCancelAssignment, onStartWork, onComplete, onClose, setModal, onRefresh = async () => {} }) {
  const [filteredComplaints, setFilteredComplaints] = useState(complaints);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'chat', 'duplicates', 'checklist', 'history'
  const [savedPresets, setSavedPresets] = useState(() => {
    const stored = localStorage.getItem('complaintFilterPresets');
    return stored ? JSON.parse(stored) : [];
  });
  useEffect(() => {
    setFilteredComplaints(complaints);
  }, [complaints]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredComplaints]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedComplaints = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredComplaints.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredComplaints, currentPage]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleStart = filteredComplaints.length === 0 ? 0 : startIndex + 1;
  const visibleEnd = filteredComplaints.length === 0 ? 0 : Math.min(startIndex + paginatedComplaints.length, filteredComplaints.length);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Complaints refresh failed', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const searchFields = ['displayId', 'complaintId', 'id', 'problem', 'engineer.name', 'engineer.email'];
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'assigned', label: 'Assigned' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'closed', label: 'Closed' }
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' }
      ]
    }
  ];

  const handleSavePreset = (preset) => {
    const updated = [...savedPresets, preset];
    setSavedPresets(updated);
    localStorage.setItem('complaintFilterPresets', JSON.stringify(updated));
  };

  const handleLoadPreset = (preset) => {
    // This would reload filters - simplified for now
    window.location.reload();
  };
  const renderComplaintActions = (c) => {
    const isEngineer = user?.role === 'engineer';
    const isAssignedToMe = c.assignedTo === String(user?.id);
    const isManager = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'superadmin';
    const isUpdating = c.isUpdating === true;
    const disabledClass = isUpdating ? 'opacity-60 cursor-not-allowed' : '';



    if (isEngineer) {
      if (c.status === 'pending') {
        return (
          <div className="flex gap-2 items-center">
            <button disabled={isUpdating} onClick={() => onTakeTicket(c.id, user.id)} className={`text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ${disabledClass}`}>{isUpdating && <Loader size={12} className="animate-spin" />} Take</button>
          </div>
        );
      }
      if (c.status === 'assigned' && isAssignedToMe) {
        return (
          <div className={`flex gap-2 items-center ${disabledClass}`}>
            <button disabled={isUpdating} onClick={() => onCancelAssignment(c.id)} className="text-[10px] font-bold uppercase text-slate-600 hover:text-slate-700 flex items-center gap-1">{isUpdating && <Loader size={12} className="animate-spin" />} Cancel</button>
            <button disabled={isUpdating} onClick={() => onStartWork(c.id, 'in_progress')} className="text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1">{isUpdating && <Loader size={12} className="animate-spin" />} Start Work</button>
          </div>
        );
      }
      if (c.status === 'in_progress' && isAssignedToMe) {
        return (
          <div className={`flex gap-2 items-center ${disabledClass}`}>
            <button disabled={isUpdating} onClick={() => setModal({ type: 'complete', complaint: c })} className="text-[10px] font-bold uppercase text-emerald-600 hover:text-emerald-700 flex items-center gap-1">{isUpdating && <Loader size={12} className="animate-spin" />} Complete</button>
            <button disabled={isUpdating} onClick={() => setModal({ type: 'close', complaint: c })} className="text-[10px] font-bold uppercase text-rose-600 hover:text-rose-700 flex items-center gap-1">{isUpdating && <Loader size={12} className="animate-spin" />} Close</button>
          </div>
        );
      }
    } else if (isManager) {
      if (c.status === 'pending') {
        return (
          <div className="flex gap-2 items-center">
            <button disabled={isUpdating} onClick={() => setModal({ type: 'assign', complaint: c })} className={`text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-700 flex items-center gap-1 ${disabledClass}`}>{isUpdating && <Loader size={12} className="animate-spin" />} Assign</button>
          </div>
        );
      }
      if (c.status === 'assigned') {
        return (
          <div className={`flex gap-2 items-center ${disabledClass}`}>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${isUpdating ? 'text-yellow-500' : 'text-blue-500'}`}>{isUpdating && <Loader size={12} className="animate-spin" />} Assigned to {c.engineer?.name || '...'}</span>
            <button disabled={isUpdating} onClick={() => onCancelAssignment(c.id)} className="text-[10px] font-bold uppercase text-rose-600 hover:text-rose-700 flex items-center gap-1">{isUpdating && <Loader size={12} className="animate-spin" />} Cancel</button>
          </div>
        );
      }
      if (c.status === 'in_progress') {
        return (
          <div className={`flex gap-2 items-center ${disabledClass}`}>
            <span className={`text-[10px] font-bold flex items-center gap-1 ${isUpdating ? 'text-yellow-500' : 'text-blue-500'}`}>{isUpdating && <Loader size={12} className="animate-spin" />} In Progress by {c.engineer?.name || '...'}</span>
            <button disabled={isUpdating} onClick={() => onCancelAssignment(c.id)} className="text-[10px] font-bold uppercase text-rose-600 hover:text-rose-700 flex items-center gap-1">{isUpdating && <Loader size={12} className="animate-spin" />} Cancel</button>
          </div>
        );
      }
    }
    if (c.status === 'closed' || c.status === 'resolved') {
      return (
        <div className="flex gap-2 items-center">
          <span className="text-[10px] font-bold text-slate-400">{c.status === 'resolved' ? 'Completed' : 'Closed'}</span>
        </div>
      );
    }
    return null;
  };

  const openPanel = (complaint, panel) => {
    setSelectedComplaint(complaint);
    setActivePanel(panel);
  };

  const closePanel = () => {
    setSelectedComplaint(null);
    setActivePanel(null);
  };

  const renderFeatureButtons = (c) => {
    const isManager = user?.role === 'manager' || user?.role === 'admin' || user?.role === 'superadmin';
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => openPanel(c, 'chat')}
          className="p-1.5 hover:bg-blue-50 rounded transition text-blue-600"
          title="Ticket Comments"
        >
          <MessageCircle size={14} />
        </button>
        <button
          onClick={() => openPanel(c, 'duplicates')}
          className="p-1.5 hover:bg-orange-50 rounded transition text-orange-600"
          title="Check Duplicates"
        >
          <AlertTriangle size={14} />
        </button>
        {(c.status === 'in_progress' || c.status === 'resolved') && (
          <button
            onClick={() => openPanel(c, 'checklist')}
            className="p-1.5 hover:bg-green-50 rounded transition text-green-600"
            title="Service Checklist"
          >
            <ClipboardCheck size={14} />
          </button>
        )}
        <button
          onClick={() => openPanel(c, 'history')}
          className="p-1.5 hover:bg-purple-50 rounded transition text-purple-600"
          title="Machine History"
        >
          <History size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="fade-in space-y-8 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Area */}
        <div className={`flex-1 space-y-8 transition-all duration-500 ${selectedComplaint ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Header Stats / Overview for this view */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 bg-gradient-to-br from-primary-50 to-white border-primary-100">
              <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mb-1">Active Queue</p>
              <h4 className="text-3xl font-black text-neutral-800">{filteredComplaints.filter(c => c.status === 'pending' || c.status === 'assigned').length}</h4>
              <div className="mt-2 h-1 w-12 bg-primary-500 rounded-full" />
            </div>
            <div className="glass-card p-6 border-success-100">
              <p className="text-[10px] font-bold text-success-500 uppercase tracking-widest mb-1">Resolved Today</p>
              <h4 className="text-3xl font-black text-neutral-800">{complaints.filter(c => c.status === 'resolved' && new Date(c.updatedAt).toDateString() === new Date().toDateString()).length}</h4>
              <div className="mt-2 h-1 w-12 bg-success-500 rounded-full" />
            </div>
            <div className="glass-card p-6 border-amber-100">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">SLA Critical</p>
              <h4 className="text-3xl font-black text-neutral-800">4</h4>
              <div className="mt-2 h-1 w-12 bg-amber-500 rounded-full" />
            </div>
          </div>

          {/* Search & Action Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto">
              <AdvancedSearchFilters
                data={complaints}
                onFilter={setFilteredComplaints}
                searchFields={searchFields}
                filters={filterOptions}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
                savedPresets={savedPresets}
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 rounded-xl glass-card text-neutral-500 hover:text-primary-600 hover:border-primary-200 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
              {(user?.role !== 'engineer') && (
                <button
                  onClick={() => setModal('complaint')}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-200/50 transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  <span>Log Ticket</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-card overflow-hidden shadow-xl border-primary-50/50">
            <div className="p-6 border-b border-primary-50/50 bg-neutral-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-primary-500 rounded-full" />
                <h3 className="font-extrabold text-neutral-800 tracking-tight">Incident Inventory</h3>
              </div>
              <ExportButton
                data={filteredComplaints.map(c => ({
                  'Case ID': c.displayId || c.complaintId || c.id,
                  'Customer': customers.find(cu => cu.id === c.customerId)?.name || 'N/A',
                  'Machine': machines.find(m => m.id === c.machineId)?.model || 'N/A',
                  'Priority': c.priority || 'N/A',
                  'Status': c.status || 'pending',
                  'Assigned To': c.engineer?.name || 'Unassigned',
                  'Created': new Date(c.createdAt).toLocaleDateString()
                }))}
                filename="incident-registry"
                title="Service Incident Data"
                compact={true}
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-neutral-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">ID & Media</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Customer Profile</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Hardware Info</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Severity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Issue Scope</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Compliance</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Workspace</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Command</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-50/30">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                            <ClipboardCheck size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-neutral-800 uppercase tracking-widest">No Incidents Found</p>
                            <p className="text-xs text-neutral-400">All machines are performing within nominal parameters.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedComplaints.map(c => {
                      const cust = customers.find(cu => cu.id === c.customerId);
                      const mach = machines.find(m => m.id === c.machineId);
                      const isSelected = selectedComplaint?.id === c.id;
                      return (
                        <tr 
                          key={c.id} 
                          className={`hover:bg-primary-50/30 transition-all duration-300 group ${isSelected ? 'bg-primary-50/50' : ''}`}
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2">
                              <span className="font-mono text-[11px] font-black text-primary-600 bg-primary-50/50 px-2.5 py-1 rounded-lg border border-primary-100 w-fit">
                                {c.displayId || c.complaintId || c.id}
                              </span>
                              <AttachmentsIndicator attachments={c.attachments} />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-extrabold text-neutral-800 leading-none mb-1">{cust?.company || cust?.name || 'Unknown Client'}</span>
                              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{cust?.city || 'Unspecified Location'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-neutral-700 leading-none mb-1">{mach?.model || 'Generic Model'}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{mach?.serialNumber || 'SN: PENDING'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5"><PriorityBadge priority={c.priority} /></td>
                          <td className="px-6 py-5 max-w-[220px]">
                            <div className="text-xs font-bold text-neutral-800 truncate leading-none mb-1" title={c.problem}>
                              {c.problem || 'Diagnostic Required'}
                            </div>
                            <IssueCategoriesDisplay categories={c.issueCategories} />
                          </td>
                          <td className="px-6 py-5"><StatusBadge status={c.status} /></td>
                          <td className="px-6 py-5"><SLABadge complaint={c} slaDurationHours={24} /></td>
                          <td className="px-6 py-5">{renderFeatureButtons(c)}</td>
                          <td className="px-6 py-5 text-right">{renderComplaintActions(c)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-5 border-t border-primary-50/50 bg-neutral-50/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                  Showing <span className="text-primary-600 font-black">{visibleStart}-{visibleEnd}</span> of <span className="text-neutral-800 font-black">{filteredComplaints.length}</span> entries
                </p>
                <div className="h-4 w-px bg-neutral-200" />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">Per Page</span>
                  <select 
                    className="bg-transparent text-[10px] font-black text-neutral-800 border-none focus:ring-0 cursor-pointer"
                  >
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-neutral-200 hover:bg-white text-neutral-400 hover:text-primary-600 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <div className="flex items-center gap-1.5 px-3">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i+1}
                      onClick={() => setCurrentPage(i+1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i+1 
                          ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                          : 'text-neutral-500 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      {i+1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-neutral-200 hover:bg-white text-neutral-400 hover:text-primary-600 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel for Selected Ticket */}
        {selectedComplaint && activePanel && (
          <div className="lg:w-1/3 animate-slide-in">
            <div className="glass-card sticky top-28 overflow-hidden border-primary-200">
              <div className="p-6 border-b border-primary-100 flex items-center justify-between bg-primary-50/50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Active Focus</span>
                  <h3 className="font-extrabold text-neutral-800 truncate">Ticket #{selectedComplaint.displayId || selectedComplaint.id}</h3>
                </div>
                <button 
                  onClick={closePanel}
                  className="p-2 rounded-full hover:bg-white/50 text-neutral-400 hover:text-neutral-600 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <Suspense fallback={<div className="h-64 flex items-center justify-center"><Loader className="animate-spin text-primary-500" /></div>}>
                  {activePanel === 'chat' && (
                    <ChatWindow
                      complaintId={selectedComplaint.id}
                      currentUser={user}
                      onClose={closePanel}
                    />
                  )}
                  {activePanel === 'duplicates' && (
                    <DuplicateDetection
                      complaintId={selectedComplaint.id}
                      customerId={selectedComplaint.customerId}
                      description={selectedComplaint.problem}
                      title={selectedComplaint.displayId}
                    />
                  )}
                  {activePanel === 'checklist' && (
                    <ServiceChecklist
                      complaintId={selectedComplaint.id}
                      isEngineer={user?.role === 'engineer'}
                      isManager={['manager', 'admin', 'superadmin'].includes(user?.role)}
                    />
                  )}
                  {activePanel === 'history' && (
                    <MachineServiceHistory machineId={selectedComplaint.machineId} />
                  )}
                  {activePanel === 'details' && (
                    <ComplaintDetailPanel 
                      complaint={selectedComplaint}
                      customer={customers.find(c => c.id === selectedComplaint.customerId)}
                      machine={machines.find(m => m.id === selectedComplaint.machineId)}
                    />
                  )}
                </Suspense>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(ComplaintsView);
