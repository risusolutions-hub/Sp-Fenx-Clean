import React, { useState, useEffect } from 'react';
import {
  Search, Download, Filter, ChevronDown, ChevronUp, Calendar,
  User, Briefcase, Clock, AlertCircle, CheckCircle2, MapPin, Wrench, History
} from 'lucide-react';
import api from '../../api';

export default function ServiceHistoryView({ user, customers = [], machines = [] }) {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    customer: 'all',
    machine: 'all',
    engineer: 'all',
    dateFrom: '',
    dateTo: '',
    category: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  const isManagerOrLower = user?.role === 'manager';

  const normalizeId = (value) => (value !== undefined && value !== null ? String(value) : '');
  const resolveCustomer = (id) => customers.find(c => normalizeId(c.id) === normalizeId(id));
  const resolveMachine = (id) => machines.find(m => normalizeId(m.id) === normalizeId(id));
  const resolveEngineerName = (id) => {
    const normalizedId = normalizeId(id);
    const entry = history.find(item => normalizeId(item.assignedTo) === normalizedId);
    return entry?.engineer?.name;
  };

  useEffect(() => {
    loadServiceHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, searchText, filters]);

  const loadServiceHistory = async () => {
    try {
      setLoading(true);
      console.log('[ServiceHistory] Loading complaints...');
      
      // Fetch all complaints
      const allRes = await api.get('/complaints');
      console.log('[ServiceHistory] API Response:', allRes.data);
      
      const allComplaints = allRes.data.complaints || [];
      console.log('[ServiceHistory] Total complaints:', allComplaints.length);
      
      // Filter for closed, resolved, or completed
      let data = allComplaints.filter(c => {
        const isCompleted = c.status === 'closed' || c.status === 'resolved' || c.workStatus === 'completed';
        if (isCompleted) {
          console.log(`[ServiceHistory] Including ${c.complaintId}: status=${c.status}, workStatus=${c.workStatus}`);
        }
        return isCompleted;
      });
      
      console.log('[ServiceHistory] Filtered to', data.length, 'closed/resolved/completed tickets');

      if (isManagerOrLower) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        data = data.filter(complaint => {
          const complaintDate = new Date(complaint.closedAt || complaint.resolvedAt || complaint.updatedAt);
          complaintDate.setHours(0, 0, 0, 0);
          return complaintDate.getTime() === today.getTime();
        });
        console.log('[ServiceHistory] After manager date filter:', data.length, 'today only');
      }

      // Sort by date descending (newest first)
      data.sort((a, b) => {
        const dateA = new Date(a.closedAt || a.resolvedAt || a.updatedAt);
        const dateB = new Date(b.closedAt || b.resolvedAt || b.updatedAt);
        return dateB - dateA;
      });

      setHistory(data);
      console.log('[ServiceHistory] Final:', data.length, 'tickets ready to display');
    } catch (err) {
      console.error('[ServiceHistory] Error:', err.message, err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(item => {
        const customer = resolveCustomer(item.customerId);
        const machine = resolveMachine(item.machineId);
        const searchTargets = [
          item.complaintId,
          item.problem,
          item.solutionNotes,
          customer?.name,
          customer?.company,
          machine?.model
        ];
        return searchTargets.some(target => (target && String(target).toLowerCase().includes(search)));
      });
    }

    if (filters.priority !== 'all') filtered = filtered.filter(item => item.priority === filters.priority);
    if (filters.status !== 'all') filtered = filtered.filter(item => item.status === filters.status);
    if (filters.customer !== 'all') filtered = filtered.filter(item => normalizeId(item.customerId) === filters.customer);
    if (filters.machine !== 'all') filtered = filtered.filter(item => normalizeId(item.machineId) === filters.machine);
    if (filters.engineer !== 'all') filtered = filtered.filter(item => normalizeId(item.assignedTo) === filters.engineer);
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => {
        const cats = Array.isArray(item.issueCategories) ? item.issueCategories : [];
        return cats.some(cat => cat.replace('custom:', '') === filters.category);
      });
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.closedAt || item.resolvedAt || item.updatedAt);
        return itemDate >= fromDate;
      });
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.closedAt || item.resolvedAt || item.updatedAt);
        return itemDate <= toDate;
      });
    }

    setFilteredHistory(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleRowExpand = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const paginatedData = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const exportToCSV = () => {
    const headers = [
      'Ticket ID', 'Date', 'Customer', 'Machine', 'Priority', 'Problem', 'Solution', 'Engineer', 'Status', 'Work Status'
    ];
    const rows = filteredHistory.map(item => {
      const customer = resolveCustomer(item.customerId);
      const machine = resolveMachine(item.machineId);
      return [
        item.complaintId,
        new Date(item.closedAt || item.resolvedAt || item.updatedAt).toLocaleDateString(),
        customer?.name || customer?.company || 'Unknown',
        machine?.model || 'Unknown',
        item.priority,
        item.problem,
        item.solutionNotes || 'N/A',
        item.engineer?.name || 'Unassigned',
        item.status,
        item.workStatus
      ];
    });
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const data = filteredHistory.map(item => ({
      ticketId: item.complaintId,
      date: new Date(item.closedAt || item.resolvedAt || item.updatedAt),
      customer: resolveCustomer(item.customerId),
      machine: resolveMachine(item.machineId),
      priority: item.priority,
      problem: item.problem,
      solution: item.solutionNotes,
      engineer: item.engineer,
      status: item.status,
      workStatus: item.workStatus,
      spares: item.sparesUsed,
      description: item.description,
      issueCategories: item.issueCategories
    }));
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueCustomers = [...new Set(history.map(h => normalizeId(h.customerId)).filter(Boolean))];
  const uniqueMachines = [...new Set(history.map(h => normalizeId(h.machineId)).filter(Boolean))];
  const uniqueEngineers = [...new Set(history.map(h => normalizeId(h.assignedTo)).filter(Boolean))];
  const allCategories = new Set();
  history.forEach(item => {
    if (Array.isArray(item.issueCategories)) {
      item.issueCategories.forEach(cat => allCategories.add(cat.replace('custom:', '')));
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading service history...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-50 border-green-200',
      medium: 'bg-yellow-50 border-yellow-200',
      high: 'bg-orange-50 border-orange-200',
      critical: 'bg-red-50 border-red-200'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityTextColor = (priority) => {
    const colors = {
      low: 'text-green-700 bg-green-100',
      medium: 'text-yellow-700 bg-yellow-100',
      high: 'text-orange-700 bg-orange-100',
      critical: 'text-red-700 bg-red-100'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-8 h-8 text-blue-600" />
            Service History
          </h1>
          <p className="text-slate-600 mt-1">
            {isManagerOrLower ? "Today's closed/completed services" : 'All historical service records'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 font-medium text-slate-700">
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <div className="flex gap-2">
            <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={exportToJSON} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium">
              <Download className="w-4 h-4" /> JSON
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input type="text" placeholder="Search by ticket ID, customer, machine, problem, or solution..." value={searchText} onChange={e => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Priority</label>
            <select value={filters.priority} onChange={e => handleFilterChange('priority', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Status</label>
            <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Statuses</option>
              <option value="closed">Closed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Customer</label>
            <select value={filters.customer} onChange={e => handleFilterChange('customer', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Customers</option>
              {uniqueCustomers.map(custId => {
                const cust = resolveCustomer(custId);
                return <option key={custId} value={custId}>{cust?.name || cust?.company || 'Unknown'}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Machine</label>
            <select value={filters.machine} onChange={e => handleFilterChange('machine', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Machines</option>
              {uniqueMachines.map(machId => {
                const mach = resolveMachine(machId);
                return <option key={machId} value={machId}>{mach?.model || `Machine ${machId}`}</option>;
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Engineer</label>
            <select value={filters.engineer} onChange={e => handleFilterChange('engineer', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Engineers</option>
              {uniqueEngineers.map(engId => {
                const engName = resolveEngineerName(engId);
                return <option key={engId} value={engId}>{engName || `Engineer ${engId}`}</option>;
              })}
            </select>
          </div>
          {allCategories.size > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Category</label>
              <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Categories</option>
                {Array.from(allCategories).map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">From Date</label>
            <input type="date" value={filters.dateFrom} onChange={e => handleFilterChange('dateFrom', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">To Date</label>
            <input type="date" value={filters.dateTo} onChange={e => handleFilterChange('dateTo', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-end">
            <button onClick={() => {
              setFilters({
                priority: 'all', status: 'all', customer: 'all', machine: 'all', engineer: 'all', dateFrom: '', dateTo: '', category: 'all'
              });
              setSearchText('');
            }} className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{paginatedData.length}</span> of <span className="font-semibold text-slate-900">{filteredHistory.length}</span> records
        {filteredHistory.length < history.length && <span> (filtered from {history.length} total)</span>}
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No service records found</p>
          {history.length === 0 && (
            <p className="text-xs text-slate-500 mt-2">(No closed, resolved, or completed tickets in database)</p>
          )}
          {history.length > 0 && filteredHistory.length === 0 && (
            <p className="text-xs text-slate-500 mt-2">(All records filtered out by current filter settings)</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedData.map(item => {
            const customer = resolveCustomer(item.customerId);
            const machine = resolveMachine(item.machineId);
            const isExpanded = expandedRows[item.id];
            const closedDate = new Date(item.closedAt || item.resolvedAt || item.updatedAt);

            return (
              <div key={item.id} className={`border rounded-lg transition ${getPriorityColor(item.priority)}`}>
                <div onClick={() => toggleRowExpand(item.id)} className="p-4 cursor-pointer hover:bg-white/50 transition">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 break-all">{item.complaintId}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getPriorityTextColor(item.priority)}`}>{item.priority?.toUpperCase()}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${item.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>{item.status?.toUpperCase()}</span>
                      </div>
                      <p className="text-sm text-slate-700 line-clamp-2 mb-2">{item.problem}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 flex-shrink-0" /><span>{closedDate.toLocaleDateString()}</span></div>
                        <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 flex-shrink-0" /><span className="truncate">{customer?.name || customer?.company || 'Unknown'}</span></div>
                        <div className="flex items-center gap-2 text-slate-600"><Wrench className="w-4 h-4 flex-shrink-0" /><span className="truncate">{machine?.model || 'Unknown'}</span></div>
                        <div className="flex items-center gap-2 text-slate-600"><User className="w-4 h-4 flex-shrink-0" /><span className="truncate">{item.engineer?.name || 'Unassigned'}</span></div>
                      </div>
                    </div>
                    <button className="flex-shrink-0 p-2 hover:bg-white/50 rounded-full transition">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5 text-slate-600" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t p-4 bg-white/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" />Problem Description</h4>
                          <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">{item.problem}</p>
                        </div>
                        {item.description && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Details</h4>
                            <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">{item.description}</p>
                          </div>
                        )}
                        {Array.isArray(item.issueCategories) && item.issueCategories.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Categories</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.issueCategories.map((cat, idx) => (
                                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium">{cat.replace('custom:', '')}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {item.solutionNotes && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" />Solution</h4>
                            <p className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-200">{item.solutionNotes}</p>
                          </div>
                        )}
                        {Array.isArray(item.sparesUsed) && item.sparesUsed.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" />Spares Used</h4>
                            <div className="bg-white border border-slate-200 rounded p-3 space-y-2">
                              {item.sparesUsed.map((spare, idx) => (
                                <div key={idx} className="flex justify-between items-start text-sm">
                                  <span className="text-slate-900 font-medium">{spare.name || spare.partName}</span>
                                  <span className="text-slate-600">Qty: {spare.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Work Details</h4>
                          <div className="bg-white border border-slate-200 rounded p-3 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-600">Work Status</span><span className="font-semibold text-slate-900 capitalize">{item.workStatus}</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">Check-in</span><span className="font-semibold text-slate-900">{item.checkInTime ? new Date(item.checkInTime).toLocaleString() : 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-600">Closed Date</span><span className="font-semibold text-slate-900">{closedDate.toLocaleString()}</span></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-slate-200 rounded p-3">
                            <p className="text-xs text-slate-600 uppercase font-bold mb-1">Customer</p>
                            <p className="text-sm font-semibold text-slate-900">{customer?.name || 'Unknown'}</p>
                            {customer?.company && <p className="text-xs text-slate-600">{customer.company}</p>}
                          </div>
                          <div className="bg-white border border-slate-200 rounded p-3">
                            <p className="text-xs text-slate-600 uppercase font-bold mb-1">Machine</p>
                            <p className="text-sm font-semibold text-slate-900">{machine?.model || 'Unknown'}</p>
                            {machine?.serialNumber && <p className="text-xs text-slate-600">SN: {machine.serialNumber}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filteredHistory.length > 0 && (
        <div className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Items per page:</span>
            <select value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setCurrentPage(1); }} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition">←</button>
            <span className="text-sm text-slate-600 min-w-[100px] text-center">Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{totalPages}</span></span>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition">→</button>
          </div>
          <div className="text-sm text-slate-600">Total: <span className="font-semibold">{filteredHistory.length}</span> records</div>
        </div>
      )}
    </div>
  );
}
