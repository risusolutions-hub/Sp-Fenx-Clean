import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { 
  Settings, Shield, MessageSquare, Award, CheckSquare, Palette, Calendar, 
  BarChart3, Bell, Save, RefreshCw, ToggleLeft, ToggleRight, AlertTriangle,
  Users, Database, Activity, Server, FileText, Download,
  Paintbrush, Building2, Bug, Zap, HardDrive, Cpu, Wifi, Loader, X, Trash2, Edit2, MoreVertical
} from 'lucide-react';
import api from '../../api';
import { useSettings } from '../../context/SettingsContext';
import SessionManagement from './SessionManagement';

export default function SettingsView({ user, showToast }) {
  const { refreshSettings: refreshGlobalSettings } = useSettings();
  
  const [activeTab, setActiveTab] = useState('features');
  const [settings, setSettings] = useState({});
  const [systemConfig, setSystemConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  const [auditLogs, setAuditLogs] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [apiMetrics, setApiMetrics] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [logsLoading, setLogsLoading] = useState(false);

  const tabs = [
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'system', label: 'System', icon: Server },
    { id: 'branding', label: 'Branding', icon: Paintbrush },
    { id: 'sessions', label: 'Sessions', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'api', label: 'API Logs', icon: Activity },
    { id: 'health', label: 'Health', icon: Cpu }
  ];

  const featureIcons = {
    feature_skills: Award,
    feature_certifications: Shield,
    feature_checklists: CheckSquare,
    feature_customization: Palette,
    feature_chat: MessageSquare,
    feature_leave_management: Calendar,
    feature_analytics: BarChart3,
    feature_notifications: Bell
  };

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success) {
        setSettings(res.data.settings);
        setOriginalSettings(JSON.parse(JSON.stringify(res.data.settings)));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemConfig = useCallback(async () => {
    try {
      const res = await api.get('/system/config');
      if (res.data.success) {
        setSystemConfig(res.data.config);
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/system/audit-logs?limit=100');
      if (res.data.success) {
        setAuditLogs(res.data.logs);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchApiLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const res = await api.get('/system/api-logs?limit=100');
      if (res.data.success) {
        setApiLogs(res.data.logs);
      }
    } catch (error) {
      console.error('Error fetching API logs:', error);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const fetchApiMetrics = useCallback(async () => {
    try {
      const res = await api.get('/system/api-metrics');
      if (res.data.success) {
        setApiMetrics(res.data.metrics);
      }
    } catch (error) {
      console.error('Error fetching API metrics:', error);
    }
  }, []);

  const fetchHealthStatus = useCallback(async () => {
    try {
      const res = await api.get('/system/health');
      if (res.data.success) {
        setHealthStatus(res.data.health);
      }
    } catch (error) {
      console.error('Error fetching health status:', error);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchSystemConfig();
  }, [fetchSettings, fetchSystemConfig]);

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs();
    if (activeTab === 'api') { fetchApiLogs(); fetchApiMetrics(); }
    if (activeTab === 'health') fetchHealthStatus();
  }, [activeTab, fetchAuditLogs, fetchApiLogs, fetchApiMetrics, fetchHealthStatus]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value: !prev[key].value }
    }));
    setHasChanges(true);
  };

  const handleSaveFeatures = async () => {
    try {
      setSaving(true);
      const settingsArray = Object.entries(settings).map(([key, data]) => ({
        key, value: data.value
      }));
      const res = await api.put('/settings', { settings: settingsArray });
      if (res.data.success) {
        showToast?.('Settings saved successfully', 'success');
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setHasChanges(false);
        refreshGlobalSettings();
      }
    } catch (error) {
      showToast?.('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const res = await api.put('/system/config', systemConfig);
      if (res.data.success) {
        showToast?.('Configuration saved successfully', 'success');
        setSystemConfig(res.data.config);
      }
    } catch (error) {
      showToast?.('Failed to save configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setHasChanges(false);
  };

  const handleExportAuditLogs = async () => {
    try {
      const res = await api.get('/system/audit-logs/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      showToast?.('Audit logs exported', 'success');
    } catch (error) {
      showToast?.('Failed to export logs', 'error');
    }
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-12 glass-card border-error-100 bg-error-50/10">
        <Shield size={64} className="text-error-300 mb-6" />
        <h3 className="text-2xl font-black text-neutral-800 tracking-tight">Access Restricted</h3>
        <p className="text-neutral-500 font-medium text-center mt-2 max-w-sm">
          Privileged Control Panel requires Level 5 clearance (Super Admin).
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-neutral-100 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-8 bg-neutral-100 rounded w-48" />
            <div className="h-4 bg-neutral-100 rounded w-64" />
          </div>
        </div>
        <div className="h-12 bg-neutral-100 rounded-xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-neutral-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const featureSettings = Object.entries(settings).filter(([key]) => key.startsWith('feature_'));

  return (
    <div className="fade-in space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-200/50 text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-800 tracking-tight">System Control</h1>
            <p className="text-neutral-500 font-medium">Global configuration and system governance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${
            healthStatus?.status === 'healthy' ? 'bg-success-50 border-success-100 text-success-600' : 'bg-amber-50 border-amber-100 text-amber-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${healthStatus?.status === 'healthy' ? 'bg-success-500' : 'bg-amber-500'} animate-pulse`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{healthStatus?.status || 'Monitoring'}</span>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="glass-card p-1.5 inline-flex flex-wrap gap-1 bg-neutral-50/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-primary-600 shadow-sm border border-primary-50'
                  : 'text-neutral-400 hover:text-neutral-600 hover:bg-white/50'
              }`}
            >
              <Icon size={16} />
              <span className="uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[500px] animate-slide-up">
        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
              <div>
                <h3 className="font-black text-neutral-800 tracking-tight text-xl">Module Governance</h3>
                <p className="text-sm text-neutral-500 font-medium">Enable or restrict system capabilities globally</p>
              </div>
              <div className="flex gap-2">
                {hasChanges && (
                  <button onClick={handleReset} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-500 glass-card hover:bg-white transition-all flex items-center gap-2">
                    <RefreshCw size={14} /> Reset
                  </button>
                )}
                <button
                  onClick={handleSaveFeatures}
                  disabled={!hasChanges || saving}
                  className={`px-8 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${
                    hasChanges 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-200/50 hover:bg-primary-700' 
                      : 'bg-neutral-100 text-neutral-400 opacity-50'
                  }`}
                >
                  <Save size={14} />
                  {saving ? 'Synchronizing...' : 'Apply Changes'}
                </button>
              </div>
            </div>
            
            <div className="glass-card p-6 bg-amber-50/30 border-amber-100 flex items-start gap-4">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-600 shadow-sm">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-900 text-sm uppercase tracking-wide">Privileged Override</h4>
                <p className="text-amber-700/80 text-xs mt-1 font-medium leading-relaxed">
                   These toggles control the global availability of core modules. Modifications will immediately impact the navigation and workspace features for all personnel.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {featureSettings.map(([key, data]) => {
                const Icon = featureIcons[key] || Settings;
                const enabled = data.value;
                return (
                  <div key={key} className={`glass-card p-5 group transition-all duration-300 ${enabled ? 'border-primary-100 ring-4 ring-primary-50/30' : 'opacity-70 bg-neutral-50/50'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl shadow-sm transition-all ${enabled ? 'bg-primary-500 text-white shadow-primary-200' : 'bg-neutral-200 text-neutral-500'}`}>
                        <Icon size={20} />
                      </div>
                      <button onClick={() => handleToggle(key)} className="active:scale-90 transition-transform">
                        {enabled ? (
                          <ToggleRight size={40} className="text-primary-500" strokeWidth={1.5} />
                        ) : (
                          <ToggleLeft size={40} className="text-neutral-300" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-black tracking-tight text-sm ${enabled ? 'text-neutral-800' : 'text-neutral-500'}`}>
                          {data.label}
                        </h3>
                        {enabled && <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                      </div>
                      <p className="text-xs mt-2 text-neutral-400 font-medium leading-relaxed">
                        {data.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card p-8 border-amber-100 bg-gradient-to-br from-white to-amber-50/30">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-800 text-lg tracking-tight">Operational Mode</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Restricted Accessibility Control</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-neutral-100">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-neutral-800">Maintenance Protocol</span>
                      <span className="text-[10px] text-neutral-400 font-medium italic">Broadcast service interruption notice</span>
                    </div>
                    <button onClick={() => setSystemConfig({...systemConfig, maintenanceMode: !systemConfig.maintenanceMode})}>
                      {systemConfig.maintenanceMode ? <ToggleRight size={40} className="text-amber-500" /> : <ToggleLeft size={40} className="text-neutral-200" />}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Broadcast Announcement</label>
                    <textarea
                      value={systemConfig.maintenanceMessage || ''}
                      onChange={(e) => setSystemConfig({...systemConfig, maintenanceMessage: e.target.value})}
                      className="w-full px-5 py-4 bg-white border border-neutral-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-50 focus:border-primary-300 transition-all outline-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 border-primary-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-primary-100 rounded-2xl text-primary-600">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-neutral-800 text-lg tracking-tight">Data Integrity</h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Persistence & Lifecycle Policies</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { key: 'dataRetentionDays', label: 'Case Retention', sub: 'Archive lifecycle (days)' },
                    { key: 'auditLogRetentionDays', label: 'Audit Logs', sub: 'Security log expiry' }
                  ].map(f => (
                    <div key={f.key} className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">{f.label}</label>
                      <input 
                        type="number"
                        value={systemConfig[f.key] || 30}
                        onChange={(e) => setSystemConfig({...systemConfig, [f.key]: parseInt(e.target.value)})}
                        className="w-full px-5 py-3 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700"
                      />
                      <span className="text-[10px] text-neutral-400 italic">{f.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleSaveConfig} className="px-8 py-3 bg-neutral-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                Update Configuration
              </button>
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="space-y-8 animate-slide-up">
            <div className="glass-card p-8 border-primary-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />
              <div className="flex items-center gap-4 mb-8 relative">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <Paintbrush size={24} />
                </div>
                <div>
                  <h3 className="font-black text-neutral-800 text-lg tracking-tight">Visual Identity</h3>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">System Personalization</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Platform Label</label>
                    <input 
                      type="text" 
                      value={systemConfig.companyName || ''}
                      onChange={(e) => setSystemConfig({...systemConfig, companyName: e.target.value})}
                      className="w-full px-5 py-3 bg-white border border-neutral-100 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Corporate Logo Source</label>
                    <input 
                      type="text" 
                      value={systemConfig.companyLogo || ''}
                      onChange={(e) => setSystemConfig({...systemConfig, companyLogo: e.target.value})}
                      className="w-full px-5 py-3 bg-white border border-neutral-100 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-8 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                  <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-4">Rendering Mockup</p>
                  {systemConfig.companyLogo ? (
                    <img src={systemConfig.companyLogo} className="h-16 object-contain grayscale-0 group-hover:grayscale transition-all" alt="Preview" />
                  ) : (
                    <Building2 size={48} className="text-neutral-200" />
                  )}
                  <p className="text-xs font-bold text-neutral-800 mt-4">{systemConfig.companyName || 'LaserService'}</p>
                </div>
              </div>
              <div className="flex justify-end mt-8 relative">
                <button onClick={handleSaveConfig} className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary-200">
                  Save Identity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && <SessionManagement showToast={showToast} />}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-slide-up">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-neutral-800 text-xl tracking-tight">Security Timeline</h3>
              <div className="flex gap-2">
                <button onClick={handleExportAuditLogs} className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-primary-600 hover:border-primary-100 transition-all">
                  <Download size={18} />
                </button>
                <button onClick={fetchAuditLogs} className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:text-primary-600 hover:border-primary-100 transition-all">
                  <RefreshCw size={18} className={logsLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            <div className="glass-card overflow-hidden border-neutral-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50/50 border-b border-neutral-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Chronology</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Operational User</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Action Vector</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Impacted Resource</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 text-[10px] font-mono font-bold text-neutral-500 uppercase">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 text-xs font-black text-neutral-800">{log.userName || 'SYSTEM'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            log.action === 'CREATE' ? 'bg-success-50 text-success-600' :
                            log.action === 'DELETE' ? 'bg-error-50 text-error-600' : 'bg-primary-50 text-primary-600'
                          }`}>{log.action}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-neutral-500">{log.resource}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API Logs Tab */}
        {activeTab === 'api' && (
          <div className="space-y-8 animate-slide-up">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Ingress', value: apiMetrics?.totalRequests, color: 'primary' },
                { label: 'Avg Latency', value: `${apiMetrics?.avgResponseTime}ms`, color: 'success' },
                { label: 'Error Rate', value: `${apiMetrics?.errorRate}%`, color: 'error' },
                { label: 'Active Sessions', value: apiMetrics?.activeSessions || 12, color: 'amber' }
              ].map(stat => (
                <div key={stat.label} className="glass-card p-6">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className={`text-2xl font-black text-neutral-800`}>{stat.value || 0}</p>
                </div>
              ))}
            </div>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50/50">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Vector</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Endpoint</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50">
                    {apiLogs.map(log => (
                      <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-3 font-black text-xs text-primary-600">{log.method}</td>
                        <td className="px-6 py-3 text-[10px] font-mono text-neutral-600 lowercase">{log.endpoint}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${log.statusCode < 400 ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'}`}>
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[10px] font-bold text-neutral-400">{log.responseTime}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black text-neutral-800 text-xl tracking-tight">Telemetry Dashboard</h3>
              <button onClick={fetchHealthStatus} className="p-3 bg-white border border-primary-100 text-primary-600 rounded-xl hover:bg-primary-50 transition-all flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
                <RefreshCw size={14} className={logsLoading ? 'animate-spin' : ''} />
                Refresh Telemetry
              </button>
            </div>
            
            {healthStatus ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Database Sync', value: `${healthStatus.database?.responseTime}ms`, icon: Database, color: 'primary' },
                  { label: 'Memory Utilization', value: `${healthStatus.memory?.system?.usedPercent}%`, icon: Server, color: 'success' },
                  { label: 'System Uptime', value: healthStatus.uptimeFormatted, icon: Activity, color: 'amber' },
                  { label: 'Critical Exceptions', value: healthStatus.errors?.lastHour || 0, icon: AlertTriangle, color: 'error' }
                ].map(item => (
                  <div key={item.label} className="glass-card p-6 flex flex-col items-center text-center">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-white shadow-sm border border-neutral-100 text-${item.color}-500 mb-4`}>
                      <item.icon size={32} strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-xl font-black text-neutral-800">{item.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
                <Loader size={32} className="animate-spin text-neutral-300 mb-4" />
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Retrieving System Heartbeat...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
