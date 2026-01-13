import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading Spinner component
 */
export default function Spinner({ 
  size = 'md', 
  className = '',
  color = 'indigo' 
}) {
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colors = {
    indigo: 'text-indigo-600',
    white: 'text-white',
    slate: 'text-slate-600',
    emerald: 'text-emerald-600'
  };

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`} />
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Inline loading state
 */
export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      <p className="mt-4 text-slate-500 font-medium">{message}</p>
    </div>
  );
}

/**
 * Skeleton loader for cards
 */
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`}></div>
  );
}

/**
 * Card skeleton loader
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-2xl" />
      </div>
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
