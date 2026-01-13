import React, { useState, useCallback } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function NotificationCenter({ 
  notifications = [], 
  onClear = () => {}, 
  onDismiss = () => {},
  compact = false,
  open = false,
  onToggle = () => {}
}) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      default:
        return null;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-rose-50 border-rose-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = notifications.length;

  if (compact) {
    return (
      <div className="w-full">
        {open && (
          <div className="w-full bg-white rounded-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => onClear()}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notif, idx) => (
                  <div
                    key={idx}
                    className={`p-3 hover:bg-slate-50 transition-colors`}
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(notif.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => onDismiss(idx)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-8 h-8 mx-auto opacity-20 mb-2" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Recent Notifications
        </h3>
        {notifications.length > 0 && (
          <button
            onClick={() => onClear()}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.length > 0 ? (
          notifications.slice(0, 20).map((notif, idx) => (
            <div
              key={idx}
              className={`p-4 border border-slate-200 rounded-lg flex gap-3 ${getNotificationColor(
                notif.type
              )}`}
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{notif.title}</p>
                <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(notif.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => onDismiss(idx)}
                className="text-slate-400 hover:text-slate-600 self-start"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
            <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
