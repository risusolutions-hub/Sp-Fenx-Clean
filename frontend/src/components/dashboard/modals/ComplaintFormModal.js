import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Upload, Trash2, Image, Video, FileText, Phone, AlertCircle, CheckCircle, Loader2, Building2, Cpu, FileWarning } from 'lucide-react';
import Loader from '../../Loader';
import api from '../../../api';

const ISSUE_CATEGORIES = [
  { id: 'electrical', label: 'Electrical Issue' },
  { id: 'mechanical', label: 'Mechanical Issue' },
  { id: 'software', label: 'Software/Firmware' },
  { id: 'cooling', label: 'Cooling/Temperature' },
  { id: 'network', label: 'Network/Connectivity' },
  { id: 'display', label: 'Display/Screen' },
  { id: 'power', label: 'Power Supply' },
  { id: 'noise', label: 'Noise/Vibration' },
  { id: 'performance', label: 'Performance Issue' },
  { id: 'other', label: 'Other' }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-300', description: 'Can wait' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', description: 'Regular' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300', description: 'Urgent' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300', description: 'Emergency' }
];

export default function ComplaintFormModal({
  appState,
  user,
  isNewClient,
  isNewMachine,
  setIsNewClient,
  setIsNewMachine,
  onSubmit,
  onClose,
  showToast
}) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [serviceNoSearch, setServiceNoSearch] = useState('');
  const [serviceNoFound, setServiceNoFound] = useState(null);
  const [searchingServiceNo, setSearchingServiceNo] = useState(false);
  const [customerSearched, setCustomerSearched] = useState(false); // Track if search was performed
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    customerId: '',
    machineId: '',
    problem: '',
    priority: 'medium',
    issueCategories: [],
    customIssue: '',
    serviceNo: '',
    attachments: [],
    isNewCustomer: false,
    isNewMachine: false,
    customerData: {
      companyName: '',
      contactPerson: '',
      city: '',
      phone: '',
      phones: [''],
      address: '',
      email: '',
      serviceNo: ''
    },
    machineData: {
      model: '',
      serialNumber: '',
      mobileNumbers: ['']
    }
  });

  const [filteredMachines, setFilteredMachines] = useState([]);

  // Search for service number via API
  const searchServiceNo = async () => {
    if (!serviceNoSearch.trim()) {
      showToast('Please enter a service number', 'warning');
      return;
    }

    setSearchingServiceNo(true);
    setCustomerSearched(true);
    try {
      const response = await api.get(`/customers/search-by-service?serviceNo=${encodeURIComponent(serviceNoSearch.trim())}`);
      const { found, customer, machines } = response.data;

      if (found && customer) {
        setServiceNoFound(customer);
        setFilteredMachines(machines || []);
        setFormData(prev => ({
          ...prev,
          customerId: customer.id,
          serviceNo: customer.serviceNo,
          isNewCustomer: false,
          customerData: {
            companyName: customer.companyName || customer.name || customer.company || '',
            contactPerson: customer.contactPerson || '',
            city: customer.city || '',
            phone: customer.phone || '',
            phones: customer.phones?.length > 0 ? customer.phones : [customer.phone || ''],
            address: customer.address || '',
            email: customer.email || '',
            serviceNo: customer.serviceNo || ''
          }
        }));
        setIsNewClient(false);
        setIsNewMachine(false);
        showToast('Customer found!', 'success');
      } else {
        handleCustomerNotFound();
      }
    } catch (error) {
      console.error('Error searching service no:', error);
      // Fallback to local search
      const customer = appState.customers?.find(c => 
        c.serviceNo?.toLowerCase() === serviceNoSearch.trim().toLowerCase()
      );

      if (customer) {
        setServiceNoFound(customer);
        const machines = appState.machines?.filter(m => m.customerId === customer.id) || [];
        setFilteredMachines(machines);
        setFormData(prev => ({
          ...prev,
          customerId: customer.id,
          serviceNo: customer.serviceNo,
          isNewCustomer: false,
          customerData: {
            companyName: customer.companyName || customer.name || '',
            contactPerson: customer.contactPerson || '',
            city: customer.city || '',
            phone: customer.phone || '',
            phones: customer.phones?.length > 0 ? customer.phones : [customer.phone || ''],
            address: customer.address || '',
            email: customer.email || '',
            serviceNo: customer.serviceNo || ''
          }
        }));
        setIsNewClient(false);
        setIsNewMachine(false);
        showToast('Customer found!', 'success');
      } else {
        handleCustomerNotFound();
      }
    } finally {
      setSearchingServiceNo(false);
    }
  };

  const handleCustomerNotFound = () => {
    setServiceNoFound(null);
    setFilteredMachines([]);
    setFormData(prev => ({
      ...prev,
      customerId: '',
      serviceNo: serviceNoSearch.trim(),
      isNewCustomer: true,
      customerData: {
        serviceNo: serviceNoSearch.trim(),
        companyName: '',
        contactPerson: '',
        city: '',
        phone: '',
        phones: [''],
        address: '',
        email: ''
      }
    }));
    setIsNewClient(true);
    setIsNewMachine(true); // New customer means new machine
    showToast('New customer - Please fill in details', 'info');
  };

  // Filter machines based on selected customer
  useEffect(() => {
    if (formData.customerId && !isNewClient) {
      const customerId = parseInt(formData.customerId);
      const machines = appState.machines?.filter(m => m.customerId === customerId) || [];
      setFilteredMachines(machines);
    }
  }, [formData.customerId, appState.machines, isNewClient]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomerDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      customerData: {
        ...prev.customerData,
        [name]: value
      }
    }));
  };

  const handleMachineDataChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      machineData: {
        ...prev.machineData,
        [name]: value
      }
    }));
  };

  // Handle multiple phone numbers for customer
  const addCustomerPhone = () => {
    setFormData(prev => ({
      ...prev,
      customerData: {
        ...prev.customerData,
        phones: [...(Array.isArray(prev.customerData.phones) ? prev.customerData.phones : ['']), '']
      }
    }));
  };

  const removeCustomerPhone = (index) => {
    if ((formData.customerData.phones?.length || 0) > 1) {
      setFormData(prev => ({
        ...prev,
        customerData: {
          ...prev.customerData,
          phones: Array.isArray(prev.customerData.phones) ? prev.customerData.phones.filter((_, i) => i !== index) : ['']
        }
      }));
    }
  };

  const updateCustomerPhone = (index, value) => {
    setFormData(prev => ({
      ...prev,
      customerData: {
        ...prev.customerData,
        phones: Array.isArray(prev.customerData.phones) ? prev.customerData.phones.map((p, i) => i === index ? value : p) : [value]
      }
    }));
  };

  // Handle multiple mobile numbers for machine
  const addMachineMobile = () => {
    setFormData(prev => ({
      ...prev,
      machineData: {
        ...prev.machineData,
        mobileNumbers: [...prev.machineData.mobileNumbers, '']
      }
    }));
  };

  const removeMachineMobile = (index) => {
    if (formData.machineData.mobileNumbers.length > 1) {
      setFormData(prev => ({
        ...prev,
        machineData: {
          ...prev.machineData,
          mobileNumbers: prev.machineData.mobileNumbers.filter((_, i) => i !== index)
        }
      }));
    }
  };

  const updateMachineMobile = (index, value) => {
    setFormData(prev => ({
      ...prev,
      machineData: {
        ...prev.machineData,
        mobileNumbers: prev.machineData.mobileNumbers.map((m, i) => i === index ? value : m)
      }
    }));
  };

  const handlePriorityChange = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  const handleIssueCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      issueCategories: prev.issueCategories.includes(categoryId)
        ? prev.issueCategories.filter(c => c !== categoryId)
        : [...prev.issueCategories, categoryId]
    }));
  };

  // File upload handling
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const maxSize = 100 * 1024 * 1024; // 100MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showToast(`${file.name} is too large (max 100MB)`, 'warning');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const formDataUpload = new FormData();
      validFiles.forEach(file => {
        formDataUpload.append('files', file);
      });
      formDataUpload.append('complaintId', 'new-ticket');

      const response = await fetch('/api/uploads/ticket-attachments', {
        method: 'POST',
        credentials: 'include',
        body: formDataUpload
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...data.attachments]
        }));
        showToast(`${data.attachments.length} file(s) uploaded`, 'success');
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Failed to upload files', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = async (index) => {
    const attachment = formData.attachments[index];
    
    try {
      // Try to delete from server
      const params = new URLSearchParams({
        yearMonth: attachment.yearMonth || '',
        storageType: attachment.storageType || 'local',
        remotePath: attachment.remotePath || ''
      });

      await fetch(`/api/uploads/ticket-attachments/${attachment.filename}?${params}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return <Image size={20} className="text-blue-500" />;
    if (type?.startsWith('video/')) return <Video size={20} className="text-purple-500" />;
    return <FileText size={20} className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.problem.trim()) {
      showToast('Please describe the problem', 'warning');
      return;
    }

    if (formData.issueCategories.length === 0 && !formData.customIssue.trim()) {
      showToast('Please select at least one issue category or describe the issue', 'warning');
      return;
    }

    if (isNewMachine) {
      if (!formData.machineData.model.trim()) {
        showToast('Machine model is required', 'warning');
        return;
      }
      if (!formData.machineData.serialNumber.trim()) {
        showToast('Machine serial number is required', 'warning');
        return;
      }
    } else if (!formData.machineId) {
      showToast('Please select a machine', 'warning');
      return;
    }

    if (!formData.customerId && !isNewClient) {
      showToast('Please select or create a customer', 'warning');
      return;
    }

    if (isNewClient && !formData.customerData.companyName.trim()) {
      showToast('Company name is required', 'warning');
      return;
    }

    try {
      setLoading(true);
      
      // Combine issue categories with custom issue
      const allIssues = [...formData.issueCategories];
      if (formData.customIssue.trim()) {
        allIssues.push(`custom:${formData.customIssue.trim()}`);
      }

      await onSubmit({
        ...formData,
        issueCategories: allIssues,
        isNewCustomer: isNewClient,
        isNewMachine: isNewMachine,
        customerData: {
          ...formData.customerData,
          phones: Array.isArray(formData.customerData.phones) ? formData.customerData.phones.filter(p => p.trim()) : [],
          phone: (Array.isArray(formData.customerData.phones) ? formData.customerData.phones[0] : '') || formData.customerData.phone
        },
        machineData: {
          ...formData.machineData,
          mobileNumbers: formData.machineData.mobileNumbers.filter(m => m.trim())
        }
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showToast('Failed to create ticket. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = () => {
    // Must have searched for service number
    if (!customerSearched) return false;
    
    // Customer validation
    if (isNewClient) {
      if (!formData.customerData.companyName.trim()) return false;
    } else {
      if (!formData.customerId) return false;
    }
    
    // Machine validation
    if (isNewMachine) {
      if (!formData.machineData.model.trim() || !formData.machineData.serialNumber.trim()) return false;
    } else {
      if (!formData.machineId) return false;
    }
    
    // Issue validation
    if (!formData.problem.trim()) return false;
    if (formData.issueCategories.length === 0 && !formData.customIssue.trim()) return false;
    
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Create Service Ticket</h2>
            <p className="text-primary-100 text-sm mt-0.5">Fill in all required details below</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
            disabled={loading}
            title="Close"
          >
            <X size={22} />
          </button>
        </div>

        {loading && <Loader />}

        {!loading && (
          <div className="flex-1 overflow-y-auto">
            {/* Section 1: Service Number Search */}
            <div className="p-6 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Search size={20} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Step 1: Service Number</h3>
                  <p className="text-xs text-neutral-500">Search customer by service number</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={serviceNoSearch}
                    onChange={(e) => setServiceNoSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchServiceNo()}
                    placeholder="Enter service number (e.g., SVC-001)"
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    autoFocus
                  />
                  {searchingServiceNo && (
                    <Loader2 size={18} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary-600" />
                  )}
                </div>
                <button
                  onClick={searchServiceNo}
                  disabled={!serviceNoSearch.trim() || searchingServiceNo}
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm"
                >
                  <Search size={16} />
                  Search
                </button>
              </div>
              
              {/* Search Result */}
              {customerSearched && serviceNoFound && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-emerald-900 truncate">{serviceNoFound.companyName || serviceNoFound.name}</p>
                    <p className="text-emerald-700 text-xs">{serviceNoFound.city} • {serviceNoFound.phone}</p>
                  </div>
                </div>
              )}
              {customerSearched && !serviceNoFound && isNewClient && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                  <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900 text-sm">New Customer</p>
                    <p className="text-amber-700 text-xs">Service number not found. Please fill in customer details below.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Customer Details (shown after search) */}
            {customerSearched && (
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Building2 size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Step 2: Customer Details</h3>
                      <p className="text-xs text-neutral-500">{isNewClient ? 'Enter new customer information' : 'Customer information'}</p>
                    </div>
                  </div>
                </div>

                {isNewClient ? (
                  /* New Customer Form */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Service No</label>
                        <input
                          type="text"
                          name="serviceNo"
                          value={formData.customerData.serviceNo}
                          onChange={handleCustomerDataChange}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-neutral-50 text-sm"
                          readOnly
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.customerData.companyName}
                          onChange={handleCustomerDataChange}
                          placeholder="Enter company name"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          name="contactPerson"
                          value={formData.customerData.contactPerson}
                          onChange={handleCustomerDataChange}
                          placeholder="Contact person name"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.customerData.city}
                          onChange={handleCustomerDataChange}
                          placeholder="City"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.customerData.address}
                          onChange={handleCustomerDataChange}
                          placeholder="Full address"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.customerData.email}
                          onChange={handleCustomerDataChange}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Phone <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="tel"
                            value={(Array.isArray(formData.customerData.phones) ? formData.customerData.phones : [''])[0] || ''}
                            onChange={(e) => updateCustomerPhone(0, e.target.value)}
                            placeholder="Primary phone"
                            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Existing Customer Display */
                  serviceNoFound && (
                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-primary-600 text-xs">Company</span>
                          <p className="font-medium text-primary-900">{serviceNoFound.companyName || serviceNoFound.name}</p>
                        </div>
                        <div>
                          <span className="text-primary-600 text-xs">Contact</span>
                          <p className="font-medium text-primary-900">{serviceNoFound.contactPerson || '-'}</p>
                        </div>
                        <div>
                          <span className="text-primary-600 text-xs">City</span>
                          <p className="font-medium text-primary-900">{serviceNoFound.city || '-'}</p>
                        </div>
                        <div>
                          <span className="text-primary-600 text-xs">Phone</span>
                          <p className="font-medium text-primary-900">{serviceNoFound.phone || '-'}</p>
                        </div>
                        {serviceNoFound.address && (
                          <div className="col-span-2">
                            <span className="text-primary-600 text-xs">Address</span>
                            <p className="font-medium text-primary-900">{serviceNoFound.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Section 3: Machine Details (shown after search) */}
            {customerSearched && (
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Cpu size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">Step 3: Machine Details</h3>
                      <p className="text-xs text-neutral-500">{isNewMachine ? 'Add new machine' : 'Select or add machine'}</p>
                    </div>
                  </div>
                  {!isNewClient && filteredMachines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsNewMachine(!isNewMachine)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-800 text-white rounded-md hover:bg-neutral-900 transition-colors"
                    >
                      <Plus size={14} />
                      {isNewMachine ? 'Select Existing' : 'New Machine'}
                    </button>
                  )}
                </div>

                {/* Existing Machines for Old Customer */}
                {!isNewClient && !isNewMachine && filteredMachines.length > 0 && (
                  <div className="space-y-3">
                    <select
                      name="machineId"
                      value={formData.machineId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">Select a machine</option>
                      {filteredMachines.map(machine => (
                        <option key={machine.id} value={machine.id}>
                          {machine.model} - {machine.serialNumber}
                        </option>
                      ))}
                    </select>
                    
                    {formData.machineId && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                        {(() => {
                          const machine = filteredMachines.find(m => m.id === parseInt(formData.machineId));
                          return machine ? (
                            <div className="flex items-center gap-3">
                              <CheckCircle size={18} className="text-green-600" />
                              <div>
                                <p className="font-medium text-green-900">{machine.model}</p>
                                <p className="text-green-700 text-xs">Serial: {machine.serialNumber}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* No Machines Warning */}
                {!isNewClient && !isNewMachine && filteredMachines.length === 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <AlertCircle size={24} className="mx-auto text-amber-600 mb-2" />
                    <p className="text-amber-800 font-medium text-sm">No machines found for this customer</p>
                    <button
                      type="button"
                      onClick={() => setIsNewMachine(true)}
                      className="mt-2 px-4 py-1.5 bg-neutral-800 text-white rounded-md hover:bg-neutral-900 font-medium text-sm transition-colors"
                    >
                      Add New Machine
                    </button>
                  </div>
                )}

                {/* New Machine Form */}
                {(isNewMachine || isNewClient) && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Model <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="model"
                          value={formData.machineData.model}
                          onChange={handleMachineDataChange}
                          placeholder="Machine model"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          required
                        />
                        {/* Model suggestions */}
                        {appState.models?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {appState.models.slice(0, 4).map(model => (
                              <button
                                key={model}
                                type="button"
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  machineData: { ...prev.machineData, model }
                                }))}
                                className="text-xs px-2 py-1 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors"
                              >
                                {model}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Serial Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="serialNumber"
                          value={formData.machineData.serialNumber}
                          onChange={handleMachineDataChange}
                          placeholder="Serial number"
                          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Machine Contact Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                          <input
                            type="tel"
                            value={formData.machineData.mobileNumbers[0] || ''}
                            onChange={(e) => updateMachineMobile(0, e.target.value)}
                            placeholder="Contact number for this machine"
                            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 4: Issue Details (shown after search) */}
            {customerSearched && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileWarning size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Step 4: Issue Details</h3>
                    <p className="text-xs text-neutral-500">Describe the problem and attach files</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Priority Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRIORITY_LEVELS.map(level => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => handlePriorityChange(level.value)}
                          className={`p-2 rounded-lg border-2 transition-colors text-center ${
                            formData.priority === level.value
                              ? level.color + ' border-current'
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <p className="font-semibold text-xs">{level.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Issue Categories */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Issue Type <span className="text-neutral-400 font-normal">(select all that apply)</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ISSUE_CATEGORIES.map(category => (
                        <label
                          key={category.id}
                          className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors text-sm ${
                            formData.issueCategories.includes(category.id)
                              ? 'bg-primary-50 border-primary-300'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.issueCategories.includes(category.id)}
                            onChange={() => handleIssueCategory(category.id)}
                            className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-neutral-800 text-xs font-medium">{category.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Problem Description <span className="text-red-500">*</span></label>
                    <textarea
                      name="problem"
                      value={formData.problem}
                      onChange={handleInputChange}
                      placeholder="Describe the issue in detail..."
                      rows="3"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      required
                    />
                  </div>

                  {/* Custom Issue */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Other Issue <span className="text-neutral-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      name="customIssue"
                      value={formData.customIssue}
                      onChange={handleInputChange}
                      placeholder="Any other issue not listed above"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Attachments</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2 text-primary-600">
                          <Loader2 size={20} className="animate-spin" />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="mx-auto text-neutral-400 mb-1" />
                          <p className="text-neutral-600 text-sm">Click to upload files</p>
                          <p className="text-neutral-400 text-xs">Images, Videos, PDF, Documents</p>
                        </>
                      )}
                    </div>

                    {/* Uploaded Files */}
                    {formData.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-900 text-sm truncate">{file.originalName || file.name}</p>
                              <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Buttons */}
        {!loading && (
          <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center gap-3">
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-100 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit() || loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Create Ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
