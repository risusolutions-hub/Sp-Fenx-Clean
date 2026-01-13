import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Lock, Zap, Eye, EyeOff, Copy, Check, Trash2, Plus, Download, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import api from '../../api';

export default function SecurityManagementView() {
  const [activeTab, setActiveTab] = useState('overview');
  const [rateLimits, setRateLimits] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [logsSummary, setLogsSummary] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [securityConfig, setSecurityConfig] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newGeneratedKey, setNewGeneratedKey] = useState(null);
  const [filterEventType, setFilterEventType] = useState('');

  // Load all data
  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  async function loadSecurityData() {
    setLoading(true);
    try {
      const [rateLimitRes, logsRes, summaryRes, keysRes, configRes, alertsRes, sessionsRes, suspiciousRes] = await Promise.all([
        api.get('/security/rate-limits').catch(e => ({ data: { rules: [] } })),
        api.get('/security/logs?limit=50').catch(e => ({ data: { logs: [] } })),
        api.get('/security/logs/summary').catch(e => ({ data: { summary: {} } })),
        api.get('/security/api-keys').catch(e => ({ data: { keys: [] } })),
        api.get('/security/config').catch(e => ({ data: { config: {} } })),
        api.get('/security/alerts').catch(e => ({ data: { alerts: [] } })),
        api.get('/security/sessions').catch(e => ({ data: { sessions: [] } })),
        api.get('/security/suspicious-activities').catch(e => ({ data: { activities: [] } }))
      ]);

      setRateLimits(rateLimitRes.data.rules || []);
      setSecurityLogs(logsRes.data.logs || []);
      setLogsSummary(summaryRes.data.summary || {});
      setApiKeys(keysRes.data.keys || []);
      setSecurityConfig(configRes.data.config);
      setAlerts(alertsRes.data.alerts || []);
      setSessions(sessionsRes.data.sessions || []);
      setSuspiciousActivities(suspiciousRes.data.activities || []);
    } catch (err) {
      console.error('Error loading security data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateRateLimit(ruleId, requests, windowMs, description) {
    try {
      const res = await api.put(`/security/rate-limits/${ruleId}`, { requests, windowMs, description });
      if (res.data.success) {
        setRateLimits(prev => prev.map(r => r.id === ruleId ? res.data.rule : r));
        setEditingRule(null);
      }
    } catch (err) {
      console.error('Error updating rate limit:', err);
    }
  }

  async function generateNewAPIKey() {
    try {
      const res = await api.post('/security/api-keys/generate');
      if (res.data.success) {
        setNewGeneratedKey(res.data.apiKey);
        setShowNewKeyModal(true);
        loadSecurityData();
      }
    } catch (err) {
      console.error('Error generating API key:', err);
    }
  }

  async function revokeAPIKey(key) {
    if (!window.confirm('Are you sure you want to revoke this API key?')) return;

    try {
      const res = await api.post(`/security/api-keys/${key.slice(0, 6)}/revoke`);
      if (res.data.success) {
        loadSecurityData();
      }
    } catch (err) {
      console.error('Error revoking API key:', err);
    }
  }

  async function updateSecurityConfig(newConfig) {
    try {
      const res = await api.put('/security/config', { config: newConfig });
      if (res.data.success) {
        setSecurityConfig(res.data.config);
      }
    } catch (err) {
      console.error('Error updating security config:', err);
    }
  }

  async function exportLogs(format) {
    try {
      window.open(`/api/security/logs/export?format=${format}`, '_blank');
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  }

  async function resolveAlert(alertId) {
    try {
      const res = await api.put(`/security/alerts/${alertId}/resolve`);
      if (res.data.success) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  }

  async function terminateSession(sessionId) {
    if (!window.confirm('Terminate this session? User will be logged out.')) return;
    try {
      const res = await api.post(`/security/sessions/${sessionId}/terminate`);
      if (res.data.success) {
        loadSecurityData();
      }
    } catch (err) {
      console.error('Error terminating session:', err);
    }
  }

  // ============ TAB CONTENTS ============

  const SessionsTab = () => (
    <div className="space-y-6">
      {/* Active Sessions */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Active Sessions ({sessions.length})</h3>
          <button
            onClick={loadSecurityData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Session ID</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">User ID</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">IP Address</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">User Agent</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Created</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Requests</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Suspicious</th>
                <th className="px-6 py-3 text-left font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No active sessions</td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.sessionId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-3 font-mono text-xs text-gray-600">{session.sessionId}</td>
                    <td className="px-6 py-3 text-gray-900">{session.userId}</td>
                    <td className="px-6 py-3 text-gray-600">{session.ipAddress}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs truncate max-w-xs">{session.userAgent}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{new Date(session.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-gray-600">{session.requestCount}</td>
                    <td className="px-6 py-3">
                      {session.suspicious ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">
                          <AlertTriangle className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">No</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => terminateSession(session.sessionId)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Terminate session"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspicious Activities */}
      {suspiciousActivities.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 className="font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Suspicious Activities ({suspiciousActivities.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {suspiciousActivities.map((activity, idx) => (
              <div key={idx} className="px-6 py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Session: {activity.sessionId}</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{activity.activities.length} activities</span>
                </div>
                <p className="text-sm text-gray-600">User ID: {activity.userId} | IP: {activity.ipAddress}</p>
                <div className="space-y-1">
                  {activity.activities.map((act, i) => (
                    <p key={i} className="text-xs text-gray-600 ml-4">
                      • {act.type}: {new Date(act.timestamp).toLocaleString()}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Security Status</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">GOOD</p>
            </div>
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Rate Limiting</p>
              <p className="text-2xl font-bold text-green-900 mt-1">Active</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-medium">Total Logs</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{securityLogs.length}</p>
            </div>
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Unresolved Alerts</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{alerts.filter(a => !a.resolved).length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Log Summary */}
      {logsSummary && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Activity Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-3xl font-bold text-gray-900">{logsSummary.totalEvents || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Event Types</p>
              <p className="text-3xl font-bold text-gray-900">{Object.keys(logsSummary.eventTypes || {}).length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Suspicious IPs</p>
              <p className="text-3xl font-bold text-red-600">{(logsSummary.suspiciousActivity || []).length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Alerts</h3>
          <span className="text-xs font-medium text-red-600">{alerts.filter(a => !a.resolved).length} Unresolved</span>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {alerts.slice(-10).reverse().map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg border ${alert.resolved ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(alert.timestamp).toLocaleString()} • {alert.severity}
                  </p>
                </div>
                {!alert.resolved && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RateLimitsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Rate Limit Rules</h3>
        <p className="text-xs text-gray-600">Superadmin users are exempt</p>
      </div>

      {rateLimits.map(rule => (
        <div key={rule.id} className="bg-white rounded-lg border border-gray-200 p-4">
          {editingRule?.id === rule.id ? (
            <RateLimitEditor
              rule={rule}
              onSave={(updated) => updateRateLimit(rule.id, updated.requests, updated.windowMs, updated.description)}
              onCancel={() => setEditingRule(null)}
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{rule.id}</p>
                <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-700">
                    <strong>{rule.requests}</strong> requests
                  </span>
                  <span className="text-gray-700">
                    per <strong>{(rule.windowMs / 60000).toFixed(0)}</strong> minutes
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingRule(rule)}
                className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const APIKeysTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">API Keys</h3>
        <button
          onClick={generateNewAPIKey}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate Key
        </button>
      </div>

      {apiKeys.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-600">No API keys generated yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {apiKeys.map((key, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-gray-900">{key.key}</p>
                <p className="text-xs text-gray-600 mt-1">
                  Created: {new Date(key.created).toLocaleDateString()}
                  {key.lastUsed && ` • Last used: ${new Date(key.lastUsed).toLocaleDateString()}`}
                </p>
                <p className="text-xs text-gray-600">Used {key.requestCount} times</p>
              </div>
              <button
                onClick={() => revokeAPIKey(key.key)}
                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showNewKeyModal && newGeneratedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="font-semibold text-gray-900 mb-4">✅ API Key Generated</h4>
            <p className="text-sm text-gray-600 mb-4">
              Save this key somewhere safe. You won't be able to see it again!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-900 overflow-auto max-h-20">
              {newGeneratedKey}
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newGeneratedKey);
                setCopiedKey(true);
                setTimeout(() => setCopiedKey(false), 2000);
              }}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedKey ? 'Copied!' : 'Copy Key'}
            </button>
            <button
              onClick={() => {
                setShowNewKeyModal(false);
                setNewGeneratedKey(null);
              }}
              className="w-full mt-2 px-4 py-2 bg-gray-200 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const SecurityLogsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <select
          value={filterEventType}
          onChange={(e) => setFilterEventType(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Events</option>
          {Object.keys(logsSummary?.eventTypes || {}).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <button
          onClick={() => exportLogs('csv')}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>

        <button
          onClick={loadSecurityData}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Time</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Event</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">IP</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">User</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Method</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {securityLogs.filter(log => !filterEventType || log.eventType === filterEventType).map(log => (
              <tr key={`${log.timestamp}-${log.ip}`} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-900 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2 text-gray-700">{log.eventType}</td>
                <td className="px-4 py-2 text-gray-700 font-mono text-xs">{log.ip}</td>
                <td className="px-4 py-2 text-gray-700">{log.userId || '-'}</td>
                <td className="px-4 py-2 text-gray-700">{log.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const SecurityConfigTab = () => (
    <div className="space-y-4">
      {securityConfig && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Password Policy</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securityConfig.passwordRequireNumbers}
                  onChange={(e) => updateSecurityConfig({ ...securityConfig, passwordRequireNumbers: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Require numbers in passwords</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securityConfig.passwordRequireSpecialChars}
                  onChange={(e) => updateSecurityConfig({ ...securityConfig, passwordRequireSpecialChars: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Require special characters</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securityConfig.enableAPIKeyAuth}
                  onChange={(e) => updateSecurityConfig({ ...securityConfig, enableAPIKeyAuth: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Enable API Key Authentication</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={securityConfig.maintenanceMode}
                  onChange={(e) => updateSecurityConfig({ ...securityConfig, maintenanceMode: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Maintenance Mode</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Security Management</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'rate-limits', label: 'Rate Limits', icon: Zap },
            { id: 'api-keys', label: 'API Keys', icon: Lock },
            { id: 'logs', label: 'Security Logs', icon: AlertCircle },
            { id: 'sessions', label: 'Sessions & Devices', icon: LogOut },
            { id: 'config', label: 'Configuration', icon: RefreshCw }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'rate-limits' && <RateLimitsTab />}
          {activeTab === 'api-keys' && <APIKeysTab />}
          {activeTab === 'logs' && <SecurityLogsTab />}
          {activeTab === 'sessions' && <SessionsTab />}
          {activeTab === 'config' && <SecurityConfigTab />}
        </>
      )}
    </div>
  );
}

// ============ RATE LIMIT EDITOR COMPONENT ============

function RateLimitEditor({ rule, onSave, onCancel }) {
  const [requests, setRequests] = useState(rule.requests);
  const [windowMinutes, setWindowMinutes] = useState(rule.windowMs / 60000);
  const [description, setDescription] = useState(rule.description);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Requests</label>
        <input
          type="number"
          value={requests}
          onChange={(e) => setRequests(parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Window (minutes)</label>
        <input
          type="number"
          value={windowMinutes}
          onChange={(e) => setWindowMinutes(parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave({ requests, windowMs: windowMinutes * 60000, description })}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
