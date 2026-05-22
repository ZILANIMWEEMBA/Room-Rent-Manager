import React from 'react';
import { CalendarRange, Info, RefreshCw } from 'lucide-react';
import { formatDate } from '../utils';

interface DateConfigBannerProps {
  todayDate: string;
  onDateChange: (date: string) => void;
  onResetDate: () => void;
}

export const DateConfigBanner: React.FC<DateConfigBannerProps> = ({
  todayDate,
  onDateChange,
  onResetDate
}) => {
  return (
    <div 
      className="bg-indigo-950 text-indigo-100 rounded-2xl p-4 md:p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900/60 shadow-lg"
      id="simulation-config-banner"
    >
      <div className="flex items-start gap-3">
        <div className="bg-indigo-900 text-indigo-300 p-2 rounded-xl shrink-0 mt-0.5">
          <CalendarRange className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            Time & Lease Simulation
            <span className="px-1.5 py-0.5 text-[9px] bg-indigo-700 text-indigo-100 font-bold tracking-wider uppercase rounded-sm">Demo Mode</span>
          </h4>
          <p className="text-xs text-indigo-300/90 mt-0.5 max-w-xl">
            Currently simulating operations as of <span className="font-semibold text-white">{formatDate(todayDate)}</span>. Adjust the simulated calendar date below to see &ldquo;Days Left to Free&rdquo;, late payment alerts, and expirations update dynamically!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <input 
            type="date"
            value={todayDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-indigo-900/70 text-white text-xs font-mono font-bold px-3 py-2 rounded-xl border border-indigo-700 focus:outline-hidden focus:border-indigo-400 transition-all cursor-pointer"
            id="simulation-date-picker"
          />
        </div>
        <button 
          onClick={onResetDate}
          title="Reset to default simulated time (May 22, 2026)"
          className="p-2 bg-indigo-900 text-indigo-200 hover:text-white hover:bg-indigo-800 rounded-xl border border-transparent hover:border-indigo-700/50 transition-all font-semibold flex items-center gap-1.5 text-xs"
          id="simulation-reset-btn"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
