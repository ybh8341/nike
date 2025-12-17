import React from 'react';

interface BatteryGaugeProps {
  percentage: number;
  onChange: (value: number) => void;
}

export const BatteryGauge: React.FC<BatteryGaugeProps> = ({ percentage, onChange }) => {
  // SVG properties
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (p: number) => {
    if (p <= 20) return 'text-red-500';
    if (p <= 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStrokeColor = (p: number) => {
    if (p <= 20) return '#ef4444'; // red-500
    if (p <= 50) return '#f59e0b'; // amber-500
    return '#10b981'; // emerald-500
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative group cursor-pointer select-none">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90 transition-all duration-500 ease-out"
        >
          {/* Background Ring */}
          <circle
            stroke="#e2e8f0"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Ring */}
          <circle
            stroke={getStrokeColor(percentage)}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-slate-700">
          <span className={`text-4xl font-bold ${getColor(percentage)}`}>
            {percentage}%
          </span>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">当前电量</span>
        </div>
      </div>

      <div className="w-full px-4">
        <label htmlFor="battery-slider" className="sr-only">Adjust Battery</label>
        <input
          id="battery-slider"
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>0%</span>
          <span>滑动调整</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};