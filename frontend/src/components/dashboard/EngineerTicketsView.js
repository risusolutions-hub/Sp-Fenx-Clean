import React, { useState, useMemo, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { 
  Ticket, User, MapPin, Phone, Wrench, Calendar, Clock, 
  AlertCircle, Play, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Building, Package, Hash, MessageSquare, ArrowRight, Ban, Pause, Loader, RefreshCw
} from 'lucide-react';
import StatusBadge from './StatusBadge';

// Lazy load TicketDetailsView
const TicketDetailsView = lazy(() => import('./TicketDetailsView'));

function EngineerTicketsView({
  complaints,
  customers,
  machines,
  currentUser,
  onTakeTicket,
  onStartWork,
  onComplete,
  onClose,
  onCancelAssignment,
  onViewDetails,
  onRefreshTickets,
  isLoadingData
}) {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [filter, setFilter] = useState('my'); // 'my', 'available', 'history'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const filterMounted = useRef(false);
  const [displayedTickets, setDisplayedTickets] = useState([]);

  useEffect(() => {
    if (!isLoadingData) {
      setHasLoadedOnce(true);
    }
  }, [isLoadingData]);

  const refreshTickets = useCallback(async () => {
    if (!onRefreshTickets) return;
    setIsRefreshing(true);
    try {
      await onRefreshTickets();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefreshTickets]);

  useEffect(() => {
    if (!onRefreshTickets) return;
    if (!filterMounted.current) {
      filterMounted.current = true;
      return;
    }
    refreshTickets();
  }, [filter, onRefreshTickets, refreshTickets]);

  const filtered = useMemo(() => {
    const userId = String(currentUser?.id || '');
    const myTickets = complaints.filter(c => 
      String(c.assignedTo) === userId && ['assigned', 'in_progress'].includes(c.status)
    );
    const availableTickets = complaints.filter(c => c.status === 'pending' && !c.assignedTo);
    const historyTickets = complaints.filter(c => ['resolved', 'closed'].includes(c.status));
    return { my: myTickets, available: availableTickets, history: historyTickets };
  }, [complaints, currentUser?.id]);

  const showSkeleton = isLoadingData && !hasLoadedOnce;

  const getCustomer = (ticket) => ticket.customer || customers.find(c => c.id === ticket.customerId);
  const getMachine = (ticket) => ticket.machine || machines.find(m => m.id === ticket.machineId);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 text-red-700 border-red-200';
      case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'pending': return 'border-l-blue-500';
      case 'assigned': return 'border-l-purple-500';
      case 'in_progress': return 'border-l-amber-500';
      case 'resolved': return 'border-l-emerald-500';
      case 'closed': return 'border-l-slate-500';
      default: return 'border-l-slate-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpand = (ticketId) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const handleTakeTicket = async (ticketId) => {
    const engineerId = currentUser?.id || '';
    
    // Optimistic UI update
    setDisplayedTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, isUpdating: true, assignedTo: engineerId } : ticket
      )
    );

    try {
      await onTakeTicket(ticketId);
    } catch (error) {
      console.error('Failed to take ticket:', error);
      // Revert optimistic update on failure
      setDisplayedTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, isUpdating: false, assignedTo: null } : ticket
        )
      );
    }
  };

  useEffect(() => {
    setDisplayedTickets(
      filter === 'my'
        ? filtered.my
        : filter === 'available'
          ? filtered.available
          : filtered.history
    );
  }, [filter, filtered]);

  return (
    <div className="fade-in flex gap-4">
      {/* Main Content */}
      <div className={`space-y-6 ${selectedTicketId ? 'w-2/3' : 'w-full'}`}>
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-sm text-slate-500">Manage your assigned service tickets</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-md">
            <span className="text-xs font-medium text-blue-700">My Tickets</span>
            <span className="text-sm font-bold text-blue-900">{filtered.my.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-md">
            <span className="text-xs font-medium text-emerald-700">Available</span>
            <span className="text-sm font-bold text-emerald-900">{filtered.available.length}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[ 
            { id: 'my', label: 'My Tickets', count: filtered.my.length },
            { id: 'available', label: 'Available', count: filtered.available.length },
            { id: 'history', label: 'Closed', count: filtered.history.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md border transition-all ${
                filter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {tab.label} <span className="ml-1 opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>
        {onRefreshTickets && (
          <button
            onClick={refreshTickets}
            disabled={isRefreshing}
            className={`px-4 py-2 text-xs font-semibold uppercase rounded-md border transition-colors flex items-center gap-2 ${
              isRefreshing ? 'bg-slate-200 border-slate-200 text-slate-500 cursor-wait' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {isRefreshing ? <Loader className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            <span>{isRefreshing ? 'Refreshing' : 'Refresh tickets'}</span>
          </button>
        )}
      </div>

      {/* Ticket Cards */}
      {showSkeleton ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-slate-200 animate-pulse"
            >
              <div className="p-6 space-y-4">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="flex gap-3">
                  <div className="flex-1 h-4 bg-slate-200 rounded" />
                  <div className="flex-1 h-4 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-10 bg-slate-200 rounded-full flex-1" />
                  <div className="h-10 bg-slate-200 rounded-full flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayedTickets.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-lg border-dashed">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">
            {filter === 'my' 
              ? 'No active tickets assigned to you' 
              : filter === 'available' 
                ? 'No open tickets available'
                : 'No completed or closed tickets'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedTickets.map(ticket => {
            const customer = getCustomer(ticket);
            const machine = getMachine(ticket);
            const isExpanded = expandedTicket === ticket.id;
            const isMyTicket = parseInt(ticket.assignedTo) === parseInt(currentUser?.id);

            return (
              <div 
                key={ticket.id}
                className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md border-l-4 ${getStatusBorderColor(ticket.status)} transition-all`}
              >
                {/* Main Card Content */}
                <div className="p-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left Section - Main Info */}
                    <div className="flex-1 space-y-3">
                      {/* Ticket Header */}
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <span className="text-xs font-mono font-bold text-slate-500 block">#{ticket.id}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <StatusBadge status={ticket.status} />
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded border ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-900 font-medium text-base truncate">{ticket.problem}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-slate-500">
                             {customer && (
                               <div className="flex items-center gap-1.5">
                                 <Building className="w-3.5 h-3.5" />
                                 <span>{customer.companyName}</span>
                               </div>
                             )}
                             {machine && (
                               <div className="flex items-center gap-1.5">
                                 <Package className="w-3.5 h-3.5" />
                                 <span>{machine.model}</span>
                               </div>
                             )}
                             <div className="flex items-center gap-1.5">
                               <Calendar className="w-3.5 h-3.5" />
                               <span>{formatDate(ticket.createdAt)}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                      {/* Take Ticket Button */}
                      {ticket.status === 'pending' && !ticket.assignedTo && (
                        <button
                          disabled={ticket.isUpdating}
                          onClick={() => handleTakeTicket(ticket.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-bold uppercase tracking-wide ${ticket.isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {ticket.isUpdating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          Take Ticket
                        </button>
                      )}

                      {/* Start Work Button */}
                      {ticket.status === 'assigned' && isMyTicket && (
                        <button
                          disabled={ticket.isUpdating}
                          onClick={() => onStartWork && onStartWork(ticket.id, 'in_progress')}
                          className={`flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-xs font-bold uppercase tracking-wide ${ticket.isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {ticket.isUpdating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                          Start Work
                        </button>
                      )}

                      {/* Cancel Assignment Button */}
                      {ticket.status === 'assigned' && isMyTicket && (
                        <button
                          disabled={ticket.isUpdating}
                          onClick={() => onCancelAssignment && onCancelAssignment(ticket.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-md transition-colors text-xs font-bold uppercase tracking-wide ${ticket.isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {ticket.isUpdating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                          Cancel
                        </button>
                      )}

                      {/* Complete Button */}
                      {ticket.status === 'in_progress' && isMyTicket && (
                        <button
                          disabled={ticket.isUpdating}
                          onClick={() => onComplete && onComplete(ticket)}
                          className={`flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-xs font-bold uppercase tracking-wide ${ticket.isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {ticket.isUpdating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          Complete
                        </button>
                      )}

                      {/* Pause Button */}
                      {ticket.status === 'in_progress' && isMyTicket && (
                        <button
                          disabled={ticket.isUpdating}
                          onClick={() => onCancelAssignment && onCancelAssignment(ticket.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-md transition-colors text-xs font-bold uppercase tracking-wide ${ticket.isUpdating ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          {ticket.isUpdating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                          Pause
                        </button>
                      )}

                      {/* Close Button */}
                      {ticket.status === 'in_progress' && isMyTicket && (
                        <button
                          onClick={() => onClose && onClose(ticket)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-xs font-bold uppercase tracking-wide"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Close
                        </button>
                      )}

                      {/* Expand Button */}
                      <button
                        onClick={() => toggleExpand(ticket.id)}
                        className="flex items-center gap-1 px-3 py-2 border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 transition-colors text-xs font-bold uppercase tracking-wide"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Customer Details */}
                      {customer && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />
                            Customer Information
                          </h4>
                          <div className="bg-white p-4 rounded-md border border-slate-200 space-y-3 text-sm">
                            <div className="grid grid-cols-[80px_1fr] gap-2">
                              <span className="text-slate-500">Company:</span>
                              <span className="font-medium text-slate-900">{customer.companyName}</span>
                            </div>
                            <div className="grid grid-cols-[80px_1fr] gap-2">
                              <span className="text-slate-500">Contact:</span>
                              <span className="font-medium text-slate-900">{customer.contactPerson}</span>
                            </div>
                            <div className="grid grid-cols-[80px_1fr] gap-2 items-center">
                              <span className="text-slate-500">Phone:</span>
                              <a href={`tel:${customer.phone}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </a>
                            </div>
                            <div className="grid grid-cols-[80px_1fr] gap-2">
                              <span className="text-slate-500">Location:</span>
                              <span className="font-medium text-slate-900 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {customer.city}
                              </span>
                            </div>
                            {customer.address && (
                              <div className="pt-2 mt-2 border-t border-slate-100">
                                <span className="text-slate-500 block mb-1 text-xs">Address:</span>
                                <span className="text-slate-700">{customer.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Machine Details */}
                      {machine && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5" />
                            Machine Information
                          </h4>
                          <div className="bg-white p-4 rounded-md border border-slate-200 space-y-3 text-sm">
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                              <span className="text-slate-500">Model:</span>
                              <span className="font-medium text-slate-900">{machine.model}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                              <span className="text-slate-500">Serial No:</span>
                              <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">{machine.serialNumber}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                              <span className="text-slate-500">Install Date:</span>
                              <span className="font-medium text-slate-900">{formatDate(machine.installDate)}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-2">
                              <span className="text-slate-500">Warranty:</span>
                              <span className={`font-medium ${
                                new Date(machine.warrantyEnd) > new Date() ? 'text-emerald-700' : 'text-red-700'
                              }`}>
                                {new Date(machine.warrantyEnd) > new Date() ? 'Active' : 'Expired'} 
                                <span className="text-slate-400 ml-1 text-xs">({formatDate(machine.warrantyEnd)})</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Problem Description */}
                      <div className="space-y-3 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Detailed Problem Description
                        </h4>
                        <div className="bg-white p-4 rounded-md border border-slate-200">
                          <p className="text-slate-700 text-sm leading-relaxed">{ticket.problem}</p>
                        </div>
                      </div>

                      {/* Timeline column */}
                      <div className="space-y-3 md:col-span-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          Ticket Timeline
                        </h4>
                        <div className="bg-white p-4 rounded-md border border-slate-200">
                          <div className="flex flex-wrap gap-8 text-sm">
                            <div>
                              <span className="text-slate-500 block text-xs mb-1">Created</span>
                              <span className="font-medium text-slate-900">{formatDate(ticket.createdAt)}</span>
                            </div>
                            {ticket.assignedAt && (
                              <div>
                                <span className="text-slate-500 block text-xs mb-1">Assigned</span>
                                <span className="font-medium text-slate-900">{formatDate(ticket.assignedAt)}</span>
                              </div>
                            )}
                            {ticket.inProgressAt && (
                              <div>
                                <span className="text-slate-500 block text-xs mb-1">In Progress</span>
                                <span className="font-medium text-slate-900">{formatDate(ticket.inProgressAt)}</span>
                              </div>
                            )}
                            {ticket.resolvedAt && (
                              <div>
                                <span className="text-slate-500 block text-xs mb-1">Resolved</span>
                                <span className="font-medium text-slate-900">{formatDate(ticket.resolvedAt)}</span>
                              </div>
                            )}
                            {ticket.closedAt && (
                              <div>
                                <span className="text-slate-500 block text-xs mb-1">Closed</span>
                                <span className="font-medium text-slate-900">{formatDate(ticket.closedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resolution Notes (if resolved) */}
                      {ticket.resolutionNotes && (
                        <div className="space-y-3 md:col-span-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Resolution Notes
                          </h4>
                          <div className="bg-emerald-50/50 p-4 rounded-md border border-emerald-100">
                            <p className="text-slate-700 text-sm">{ticket.resolutionNotes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Ticket Details Side Panel */}
      {selectedTicketId && (
        <div className="w-1/3 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col max-h-[calc(100vh-200px)] overflow-y-auto">
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <TicketDetailsView
              ticketId={selectedTicketId}
              onClose={() => setSelectedTicketId(null)}
              user={currentUser}
              isPanel={true}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default React.memo(EngineerTicketsView);
