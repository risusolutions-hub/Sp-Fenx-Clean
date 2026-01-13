import React from 'react';
import { getStatusConfig, getWorkStatusConfig } from '../../constants/statusConfig';
import { getPriorityConfig } from '../../constants/priorityOptions';

/**
 * Status Badge component
 */
export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = ''
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-indigo-100 text-indigo-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  const dotColors = {
    default: 'bg-slate-500',
    primary: 'bg-indigo-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}></span>}
      {children}
    </span>
  );
}

/**
 * Status Badge - for ticket status
 */
export function StatusBadge({ status, size = 'md', showDot = true }) {
  const config = getStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full ${config.bgClass} ${config.textClass} ${
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
    }`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>}
      {config.label}
    </span>
  );
}

/**
 * Work Status Badge - for engineer work status
 */
export function WorkStatusBadge({ status, size = 'md' }) {
  const config = getWorkStatusConfig(status);
  
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${config.bgClass} ${config.textClass} ${
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
    }`}>
      {config.label}
    </span>
  );
}

/**
 * Priority Badge
 */
export function PriorityBadge({ priority, size = 'md', showIcon = false }) {
  const config = getPriorityConfig(priority);
  
  return (
    <span className={`inline-flex items-center gap-1 font-bold rounded-full ${config.badgeClass} ${
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
    }`}>
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}
