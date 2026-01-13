import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast notification component
 */
export default function Toast({ message, type = 'info', onClose }) {
  const configs = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: AlertCircle,
      iconColor: 'text-amber-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = config.icon;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 shadow-xl ${config.bg} ${config.border} animate-in slide-in-from-right-5`}>
      <Icon className={`w-5 h-5 ${config.iconColor}`} />
      <p className={`font-bold text-sm ${config.text}`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`p-1 hover:bg-white/50 rounded-lg transition-all ${config.text}`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Alert component for inline messages
 */
export function Alert({ 
  children, 
  type = 'info', 
  title,
  icon: CustomIcon,
  className = '' 
}) {
  const configs = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      titleColor: 'text-emerald-900',
      icon: CheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-200',
      text: 'text-red-700',
      titleColor: 'text-red-800',
      icon: XCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      titleColor: 'text-amber-800',
      icon: AlertCircle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600'
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      titleColor: 'text-blue-800',
      icon: Info,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  };

  const config = configs[type] || configs.info;
  const Icon = CustomIcon || config.icon;

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-2xl p-4 flex items-start gap-4 ${className}`}>
      <div className={`p-2 ${config.iconBg} rounded-xl flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1">
        {title && (
          <p className={`font-bold ${config.titleColor}`}>{title}</p>
        )}
        <p className={`text-sm ${config.text} ${title ? 'mt-1' : ''}`}>{children}</p>
      </div>
    </div>
  );
}
