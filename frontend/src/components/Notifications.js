import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export default function Notifications({ toasts = [], dismissToast, clearAll }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!anchorRef.current) return;
      if (!anchorRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, [open]);

  if (!toasts || toasts.length === 0) {
    return (
      <div className="fixed top-5 right-5 z-50">
        <button
          className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm"
          title="Notifications"
          aria-label="Notifications"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="fixed top-5 right-5 z-50">
      <div className="flex flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICON_MAP[t.type] || Info;
          return (
            <div
              key={t.id}
              onClick={() => setOpen(true)}
              className="cursor-pointer px-4 py-3 rounded-2xl shadow-md flex items-start gap-3 bg-white border border-white/5"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{t.title}</div>
                    <div className="text-sm text-slate-700 mt-1">{t.message}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">{new Date(t.timestamp || Date.now()).toLocaleString()}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
          );
        })}

        {open && (
          <div className="mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Notifications</h3>
              <button onClick={(e) => { e.stopPropagation(); clearAll(); }} className="text-xs font-medium text-blue-600 hover:text-blue-700">Clear All</button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 p-2">
              {toasts.map((t) => {
                const Icon = ICON_MAP[t.type] || Info;
                return (
                  <div key={t.id} className="p-3 hover:bg-slate-50 rounded-md flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center"><Icon className="w-4 h-4 text-slate-600" /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{t.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{t.message}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }} className="text-slate-400 hover:text-slate-600">×</button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">{new Date(t.timestamp || Date.now()).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
