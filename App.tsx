import React, { useState, useEffect, useMemo } from 'react';
import { BatteryGauge } from './components/BatteryGauge';
import { Timeline } from './components/Timeline';
import { SimulationResult, TripLog, DayType } from './types';
import { CONSUMPTION_PER_TRIP, LOW_BATTERY_THRESHOLD } from './constants';
import { BatteryCharging, Calendar, AlertOctagon, Sparkles, MapPin } from 'lucide-react';
import { getChargingAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [battery, setBattery] = useState<number>(65);
  const [advice, setAdvice] = useState<string>("");
  const [loadingAdvice, setLoadingAdvice] = useState<boolean>(false);

  // Simulation Logic
  const simulation: SimulationResult = useMemo(() => {
    let currentBattery = battery;
    let currentDate = new Date();
    const logs: TripLog[] = [];
    
    // Safety break to prevent infinite loops
    let iterations = 0;
    const MAX_ITERATIONS = 60; // Max 30 days projection

    while (currentBattery >= CONSUMPTION_PER_TRIP && iterations < MAX_ITERATIONS) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Skip Weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Simulate Trips for the day (Morning and Evening)
      // Since we are simulating, we assume if it's "today", we might have already done trips,
      // but for simplicity of this planner, we assume planning starts from NEXT trip.
      
      // Trip 1: To School
      if (currentBattery >= CONSUMPTION_PER_TRIP) {
         const startBat = currentBattery;
         currentBattery -= CONSUMPTION_PER_TRIP;
         logs.push({
           date: new Date(currentDate),
           startBattery: startBat,
           endBattery: currentBattery,
           tripName: "去学校",
           isLowBattery: currentBattery < LOW_BATTERY_THRESHOLD,
           dayType: DayType.WEEKDAY
         });
      } else {
        break;
      }

      // Trip 2: To Home
      if (currentBattery >= CONSUMPTION_PER_TRIP) {
        const startBat = currentBattery;
        currentBattery -= CONSUMPTION_PER_TRIP;
        logs.push({
          date: new Date(currentDate),
          startBattery: startBat,
          endBattery: currentBattery,
          tripName: "回家",
          isLowBattery: currentBattery < LOW_BATTERY_THRESHOLD,
          dayType: DayType.WEEKDAY
        });
      } else {
        break;
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      iterations++;
    }

    return {
      remainingTrips: logs.length,
      lastSafeDate: logs.length > 0 ? logs[logs.length - 1].date : null,
      logs: logs,
      isCritical: battery < LOW_BATTERY_THRESHOLD
    };
  }, [battery]);

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const text = await getChargingAdvice(battery, simulation);
    setAdvice(text);
    setLoadingAdvice(false);
  };

  // Reset advice when battery changes significantly
  useEffect(() => {
    setAdvice("");
  }, [battery]);

  const getStatusColor = () => {
    if (simulation.isCritical) return "bg-red-500";
    if (battery < 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getStatusColor()} text-white`}>
              <BatteryCharging size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">电动车智能助手</h1>
          </div>
          <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">
            9公里 / 13% 耗电
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Main Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <BatteryGauge percentage={battery} onChange={setBattery} />
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="block text-2xl font-bold text-slate-800">{simulation.remainingTrips}</span>
              <span className="text-xs text-slate-500 uppercase font-medium">剩余单程次数</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
              <span className="block text-2xl font-bold text-slate-800">
                {Math.ceil(simulation.remainingTrips / 2)}
              </span>
              <span className="text-xs text-slate-500 uppercase font-medium">剩余天数</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {simulation.isCritical && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertOctagon className="text-red-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-red-700 text-sm">电量告急</h3>
              <p className="text-xs text-red-600 mt-1">
                当前电量低于 {LOW_BATTERY_THRESHOLD}%，可能无法完成下次行程，请立即充电。
              </p>
            </div>
          </div>
        )}

        {/* AI Advice */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
           <div className="flex justify-between items-center mb-3">
             <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
               <Sparkles size={16} className="text-indigo-500" />
               <span>智能助手</span>
             </div>
             {!advice && (
               <button 
                onClick={handleGetAdvice}
                disabled={loadingAdvice}
                className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-full font-medium shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors disabled:opacity-50"
               >
                 {loadingAdvice ? "思考中..." : "获取建议"}
               </button>
             )}
           </div>
           
           {advice ? (
             <div className="text-sm text-indigo-800 leading-relaxed animate-in fade-in duration-500">
               "{advice}"
             </div>
           ) : (
             <p className="text-xs text-indigo-400">
               点击上方按钮，根据您的行程获取个性化充电建议。
             </p>
           )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
             <Calendar className="text-slate-400" size={18} />
             <h2 className="font-bold text-slate-700">行程预测</h2>
          </div>
          <Timeline logs={simulation.logs} />
        </div>

        {/* Map Route Info (Static for visuals) */}
        <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-between text-slate-500">
            <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="text-xs font-medium">家</span>
            </div>
            <div className="h-px bg-slate-300 flex-1 mx-4 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-slate-100 px-1">9km</div>
            </div>
            <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="text-xs font-medium">学校</span>
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;