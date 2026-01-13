import React, { useState, useMemo } from "react";
import { Users, MapPin, Phone, Mail, Clock, AlertCircle, ChevronRight, Zap } from "lucide-react";

export default function EngineersWidget({ engineers = [], currentUser, onSelectEngineer, setCurrentView, compact = false }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const getEngineerStatus = (engineer) => {
    if (!engineer.isCheckedIn) return { label: "OFFLINE", color: "bg-neutral-100/50 text-neutral-400 border-neutral-200", dot: "bg-neutral-300" };
    if (engineer.status === "busy") return { label: "BUSY", color: "bg-error-50 text-error-600 border-error-100", dot: "bg-error-500" };
    return { label: "ON-SHIFT", color: "bg-success-50 text-success-600 border-success-100", dot: "bg-success-500" };
  };

  const formatWorkTime = (minutes) => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const sortedEngineers = useMemo(() => {
    return [...engineers].sort((a, b) => {
      const aActive = a.isCheckedIn ? 0 : 1;
      const bActive = b.isCheckedIn ? 0 : 1;
      if (aActive !== bActive) return aActive - bActive;
      return a.name?.localeCompare(b.name) || 0;
    });
  }, [engineers]);

  const handleScroll = (direction) => {
    const container = document.getElementById("engineers-scroll-container");
    if (!container) return;
    const scrollAmount = 300;
    if (direction === "left") {
      container.scrollLeft -= scrollAmount;
      setScrollPosition(container.scrollLeft);
    } else {
      container.scrollLeft += scrollAmount;
      setScrollPosition(container.scrollLeft);
    }
  };

  if (compact) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-primary-100/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-secondary-50 text-secondary-600">
              <Users size={18} />
            </div>
            <h3 className="font-bold text-neutral-800 text-sm tracking-tight">Active Engineers</h3>
          </div>
          <span className="text-[10px] font-bold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full border border-secondary-100 uppercase tracking-widest">
            {engineers.filter(e => e.isCheckedIn).length} LIVE
          </span>
        </div>
        <div className="divide-y divide-primary-50/50">
          {sortedEngineers.slice(0, 4).map(engineer => {
            const status = getEngineerStatus(engineer);
            return (
              <div key={engineer.id} className="p-4 flex items-center gap-3 hover:bg-neutral-50/50 transition-colors">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-400 text-sm border-2 border-white shadow-sm ring-1 ring-neutral-100 uppercase">
                    {engineer.name?.charAt(0) || "U"}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${status.dot}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-800 truncate leading-none mb-1">{engineer.name}</p>
                  <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider truncate">
                    {engineer.isCheckedIn ? `Active for ${formatWorkTime(engineer.dailyTotalWorkTime)}` : "Last seen 4h ago"}
                  </p>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-[0.15em] border ${status.color}`}>
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
        <button 
          onClick={() => setCurrentView("engineers")}
          className="w-full py-3 text-[10px] font-bold text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-all uppercase tracking-[0.2em] border-t border-primary-50/50"
        >
          View Team Roster
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card shadow-xl overflow-hidden group">
      <div className="px-8 py-6 border-b border-primary-100/30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 rounded-2xl shadow-inner">
            <Users size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-neutral-800 text-lg tracking-tight">Team Performance</h3>
            <p className="text-xs text-neutral-500 font-medium">{sortedEngineers.length} members in roster  {engineers.filter(e => e.isCheckedIn).length} on shift</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentView("engineers")}
          className="bg-white hover:bg-neutral-50 text-neutral-700 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 border border-neutral-200/60 shadow-sm transition-all"
        >
          View Roster <ChevronRight size={14} />
        </button>
      </div>
      <div className="relative">
        <div
          id="engineers-scroll-container"
          className="overflow-x-auto scrollbar-hide py-8 px-8 flex gap-6"
          style={{ scrollBehavior: "smooth" }}
          onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
        >
          {sortedEngineers.map(engineer => {
            const status = getEngineerStatus(engineer);
            return (
              <div 
                key={engineer.id} 
                className={`min-w-[280px] max-w-[280px] relative rounded-2xl p-6 transition-all duration-500 transform-gpu hover:-translate-y-2 border shadow-sm ${
                  engineer.isCheckedIn 
                    ? "bg-white border-primary-100 hover:shadow-xl hover:shadow-primary-100/50" 
                    : "bg-neutral-50/50 border-neutral-100 opacity-80"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center font-bold text-neutral-600 text-lg border-2 border-white shadow-md uppercase">
                      {engineer.name?.charAt(0) || "U"}
                    </div>
                    {engineer.isCheckedIn && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-success-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest border shadow-sm ${status.color}`}>
                    {status.label}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-extrabold text-neutral-800 truncate text-base leading-snug">{engineer.name}</h4>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">{engineer.experience || "Entry Level"} Specialist</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 py-4 border-y border-neutral-50">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Efficiency</p>
                      <p className="text-sm font-black text-neutral-800">{engineer.efficiency || "84"}%</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Work Time</p>
                      <p className="text-sm font-black text-neutral-800">{formatWorkTime(engineer.dailyTotalWorkTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-neutral-200">
                      Profile
                    </button>
                    <button className="p-2.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 hover:bg-primary-100 transition-all">
                      <Zap size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
