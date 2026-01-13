import React from 'react';

/**
 * Reusable Card component
 */
export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  selected = false
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = 'bg-white rounded-2xl border-2 transition-all duration-200';
  const hoverClasses = hover ? 'cursor-pointer hover:shadow-lg hover:border-slate-300' : '';
  const selectedClasses = selected 
    ? 'border-indigo-400 shadow-lg shadow-indigo-100 bg-indigo-50/50' 
    : 'border-slate-200';

  return (
    <div
      className={`${baseClasses} ${paddings[padding]} ${hoverClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * Card Header
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-slate-100 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Title
 */
export function CardTitle({ children, subtitle, icon: Icon, className = '' }) {
  return (
    <div className={className}>
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
        {children}
      </h3>
      {subtitle && (
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Card Body
 */
export function CardBody({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/**
 * Card Footer
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-slate-100 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Stat Card for dashboard
 */
export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  trendValue,
  color = 'indigo',
  className = '' 
}) {
  const colors = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', iconBg: 'bg-indigo-50' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', iconBg: 'bg-emerald-50' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', iconBg: 'bg-amber-50' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600', iconBg: 'bg-rose-50' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', iconBg: 'bg-blue-50' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', iconBg: 'bg-purple-50' }
  };

  const colorConfig = colors[color] || colors.indigo;

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-bold ${
              trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ${colorConfig.bg}`}>
            <Icon className={`w-6 h-6 ${colorConfig.text}`} />
          </div>
        )}
      </div>
    </Card>
  );
}
