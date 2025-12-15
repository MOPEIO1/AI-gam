import React from 'react';

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: React.ReactNode;
}

export const StatBar: React.FC<StatBarProps> = ({ 
  label, 
  value, 
  max = 100, 
  color = "bg-cyan-500",
  icon
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          {icon} {label}
        </span>
        <span className="text-xs text-slate-400 font-mono">{value} / {max}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out shadow-[0_0_10px_currentColor]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};