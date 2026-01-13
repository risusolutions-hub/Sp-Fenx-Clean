import React from 'react';
import { STATUS_CONFIG } from '../../constants';

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || { 
    label: status, 
    color: 'bg-neutral-100/50 text-neutral-600 border-neutral-200' 
  };
  
  // Extract background and text color from config.color if possible, or use a default
  // The STATUS_CONFIG usually has "bg-X text-X border-X"
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-all duration-300 transform-gpu hover:scale-105 active:scale-95 ${config.color} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse-slow shadow-[0_0_8px_currentColor]"></span>
      {config.label}
    </span>
  );
}

