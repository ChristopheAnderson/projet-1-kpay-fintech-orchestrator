import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  glowColor?: 'blue' | 'emerald' | 'purple' | 'amber';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glowColor = 'blue',
  className = '',
}) => {
  const glowStyles = {
    blue: 'border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-slate-900/60',
    emerald: 'border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-slate-900/60',
    purple: 'border-purple-500/30 bg-gradient-to-b from-purple-950/20 to-slate-900/60',
    amber: 'border-amber-500/30 bg-gradient-to-b from-amber-950/20 to-slate-900/60',
  }[glowColor];

  const iconGlowStyles = {
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  }[glowColor];

  return (
    <div className={`p-4 rounded-xl border backdrop-blur ${glowStyles} ${className} shadow-sm transition hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconGlowStyles}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-white tracking-tight">{value}</span>
      </div>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.value}
            </span>
          )}
          <span>{trend?.label || subtitle}</span>
        </div>
      )}
    </div>
  );
};
