import React from 'react';

export default function StatCard({ label, value, Icon, color, bg, trend, trendValue }) {
  return (
    <div className="glass-card p-6 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl ${bg} ${color} bg-opacity-10 border border-current border-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            trend === 'up' ? 'bg-success-50 text-success-600' : 'bg-error-50 text-error-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </div>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <h4 className="text-3xl font-extrabold text-neutral-800 tracking-tight">{value}</h4>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest pb-1.5 whitespace-nowrap">Current Unit</span>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
        <Icon size={80} />
      </div>
    </div>
  );
}
