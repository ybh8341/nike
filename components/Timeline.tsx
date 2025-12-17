import React from 'react';
import { TripLog, DayType } from '../types';
import { Zap, Home, GraduationCap, AlertTriangle } from 'lucide-react';

interface TimelineProps {
  logs: TripLog[];
}

export const Timeline: React.FC<TimelineProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p>电量过低，无法出行，请立即充电！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">行程耗电预测</h3>
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-6 pb-2">
        {logs.map((log, index) => {
          const isLast = index === logs.length - 1;
          const isMorning = log.tripName === "去学校";
          
          return (
            <div key={index} className="relative pl-6 pr-2">
              {/* Timeline Dot */}
              <div 
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                  log.isLowBattery ? 'bg-red-500' : 'bg-slate-400'
                }`}
              />
              
              <div className={`p-4 rounded-xl border transition-all ${
                log.isLowBattery 
                  ? 'bg-red-50 border-red-100' 
                  : isLast 
                    ? 'bg-slate-800 text-white border-transparent shadow-md' 
                    : 'bg-white border-slate-100 shadow-sm'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     {isMorning ? (
                       <GraduationCap size={18} className={isLast && !log.isLowBattery ? "text-indigo-300" : "text-indigo-500"} />
                     ) : (
                       <Home size={18} className={isLast && !log.isLowBattery ? "text-emerald-300" : "text-emerald-500"} />
                     )}
                     <span className={`font-semibold text-sm ${isLast && !log.isLowBattery ? "text-white" : "text-slate-800"}`}>
                       {log.tripName}
                     </span>
                  </div>
                  <span className={`text-xs font-mono ${isLast && !log.isLowBattery ? "text-slate-300" : "text-slate-400"}`}>
                    {log.date.toLocaleDateString('zh-CN', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-xs space-y-1">
                    <div className={isLast && !log.isLowBattery ? "text-slate-300" : "text-slate-500"}>
                      剩余电量: <span className="font-bold">{log.endBattery}%</span>
                    </div>
                    {log.isLowBattery && (
                      <div className="flex items-center gap-1 text-red-600 font-bold">
                        <AlertTriangle size={12} />
                        <span>低电量预警</span>
                      </div>
                    )}
                  </div>
                  {isLast && (
                    <div className="text-xs bg-white/20 px-2 py-1 rounded text-white backdrop-blur-sm">
                      电量耗尽点
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};