import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal component
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  footer,
  size = 'md',
  showClose = true,
  className = ''
}) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 flex z-50 items-center justify-center backdrop-blur-md p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${sizes[size]} max-h-[92vh] overflow-hidden flex flex-col ${className}`}>
        
        {/* Header */}
        {(title || showClose) && (
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-8 py-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            <div className="relative flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                  {Icon && (
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                  )}
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-indigo-200 text-sm mt-1 font-medium">{subtitle}</p>
                )}
              </div>
              {showClose && (
                <button 
                  onClick={onClose}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-200 bg-slate-50 px-8 py-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Modal Header component for custom headers
 */
export function ModalHeader({ children, className = '' }) {
  return (
    <div className={`px-8 pt-8 pb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Modal Body component
 */
export function ModalBody({ children, className = '' }) {
  return (
    <div className={`px-8 py-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Modal Footer component
 */
export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}
